// Gestión de permisos (requiere manage_permissions; la ruta y el backend lo verifican).
// Catálogo agrupado por módulo (content_type.display_name) con "seleccionar todo" por módulo.
// En modo usuario se distingue lo DIRECTO (editable) de lo HEREDADO de sus grupos (solo lectura).
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, UserRoundKey, Users, UserRound, Lock } from "lucide-react";
import { Button, Checkbox, Select } from "@/shared";
import { getPermissions } from "@/services/permissionApi";
import { getGroups, getGroupPermissions, updateGroupPermissions } from "@/services/groupApi";
import { getUsers, getUserPermissions, updateUserPermissions } from "@/services/userApi";
import { refreshSession } from "@/features/login/services/authService";
import usePermission from "@/shared/hooks/usePermission";
import {
  showSuccessAlert,
  showCreateErrorAlert,
  showSystemErrorAlert,
  showConfirmAlert,
} from "@/shared/services/alertService";
import { confirmDiscardChanges } from "@/shared/services/confirmAction";

const ADMIN_GROUP = "Administrador";

// Agrupa el catálogo plano de permisos por módulo (content_type), en el orden del backend.
const groupByModule = (permissions) => {
  const modules = new Map();
  for (const permission of permissions) {
    if (!modules.has(permission.content_type_id)) {
      modules.set(permission.content_type_id, {
        id: permission.content_type_id,
        name: permission.display_name || permission.app_label,
        permissions: [],
      });
    }
    modules.get(permission.content_type_id).permissions.push(permission);
  }
  return [...modules.values()];
};

const sameSet = (a, b) => a.size === b.size && [...a].every((id) => b.has(id));

export default function PermissionsManagementPage() {
  const navigate = useNavigate();
  const { user: sessionUser, isSuperuser, guard } = usePermission();

  const [catalog, setCatalog] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);

  // Destino: un grupo O un usuario (excluyentes)
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  // Directos/del grupo (editables), guardados (para detectar cambios) y heredados (solo lectura)
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [savedIds, setSavedIds] = useState(new Set());
  const [inheritedFrom, setInheritedFrom] = useState(new Map()); // permission_id → [grupos]

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const modules = useMemo(() => groupByModule(catalog), [catalog]);
  const groupOptions = useMemo(
    () =>
      groups.map((g) => ({
        value: String(g.group_id),
        label: g.group_name,
      })),
    [groups]
  );
  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        value: String(u.id),
        label: `${u.userName}${u.is_superuser ? " (superusuario)" : ""}${u.is_active ? "" : " (inactivo)"}`,
      })),
    [users]
  );

  const hasTarget = Boolean(selectedGroup || selectedUser);
  const group = groups.find((g) => String(g.group_id) === selectedGroup);
  const targetUser = users.find((u) => String(u.id) === selectedUser);
  const targetLabel = group
    ? `el grupo ${group.group_name}`
    : targetUser
      ? targetUser.userName
      : "este destino";

  // Solo un superusuario edita el grupo Administrador o a otro superusuario (regla del backend)
  const lockedReason =
    !isSuperuser && group?.group_name === ADMIN_GROUP
      ? "Solo un superusuario puede modificar los permisos del grupo Administrador."
      : !isSuperuser && targetUser?.is_superuser
        ? "Solo un superusuario puede modificar los permisos de otro superusuario."
        : null;
  const isDirty = hasTarget && !sameSet(selectedIds, savedIds);
  const canEdit = hasTarget && !isLoading && !lockedReason;

  useEffect(() => {
    Promise.all([getPermissions(), getGroups(), getUsers()])
      .then(([permissionsData, groupsData, usersData]) => {
        setCatalog(permissionsData);
        setGroups(groupsData.filter((g) => g.is_active));
        setUsers(usersData);
      })
      .catch((error) => {
        console.error("Error cargando catálogos de permisos:", error);
        showSystemErrorAlert({ text: "No se pudieron cargar los permisos. Verifica que el backend esté corriendo." });
      });
  }, []);

  // Permisos actuales del destino. El reset se hace en los handlers de cambio.
  useEffect(() => {
    if (!hasTarget) return;
    let isCurrent = true; // una respuesta lenta de la selección anterior no pisa la actual

    const request = selectedGroup ? getGroupPermissions(selectedGroup) : getUserPermissions(selectedUser);
    request
      .then((rows) => {
        if (!isCurrent) return;
        const editable = new Set(
          rows.filter((r) => (selectedGroup ? true : r.is_direct)).map((r) => r.permission_id)
        );
        setSelectedIds(editable);
        setSavedIds(new Set(editable));
        setInheritedFrom(
          selectedGroup
            ? new Map()
            : new Map(rows.filter((r) => r.is_inherited).map((r) => [r.permission_id, r.inherited_from ?? []]))
        );
      })
      .catch((error) => {
        console.error("Error cargando permisos asignados:", error);
        if (isCurrent) showSystemErrorAlert({ text: "No se pudieron cargar los permisos asignados." });
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedGroup, selectedUser, hasTarget]);

  const resetAssignment = (nextTarget) => {
    setSelectedIds(new Set());
    setSavedIds(new Set());
    setInheritedFrom(new Map());
    setIsLoading(Boolean(nextTarget));
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
    setSelectedUser("");
    resetAssignment(e.target.value);
  };

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
    setSelectedGroup("");
    resetAssignment(e.target.value);
  };

  const togglePermission = (permissionId, checked) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      checked ? next.add(permissionId) : next.delete(permissionId);
      return next;
    });

  // Solo se editan los que no vienen heredados de un grupo
  const editableIdsOf = (module) =>
    module.permissions.map((p) => p.permission_id).filter((id) => !inheritedFrom.has(id));

  const toggleModule = (module, checked) => {
    const ids = editableIdsOf(module);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
  };

  const moduleState = (module) => {
    const ids = editableIdsOf(module);
    const marked = ids.filter((id) => selectedIds.has(id)).length;
    return { all: ids.length > 0 && marked === ids.length, some: marked > 0 && marked < ids.length, empty: ids.length === 0 };
  };

  const handleCancel = async () => {
    // Sin cambios sale directo; con cambios pide confirmación "warning"
    const canLeave = await confirmDiscardChanges({
      isDirty,
      text: `Los permisos modificados de ${targetLabel} no se guardarán.`,
      confirmButtonText: "Sí, salir",
    });
    if (canLeave) navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasTarget) {
      showCreateErrorAlert({
        entity: "permiso",
        text: "Debes seleccionar un grupo de usuarios o un usuario individual antes de guardar.",
      });
      return;
    }

    // Quitar permisos ya guardados → danger; solo agregar → info
    const removedCount = [...savedIds].filter((id) => !selectedIds.has(id)).length;
    const addedCount = [...selectedIds].filter((id) => !savedIds.has(id)).length;
    const { isConfirmed } = await showConfirmAlert(
      removedCount > 0
        ? {
            title: `¿Quitar ${removedCount} ${removedCount === 1 ? "permiso" : "permisos"} a ${targetLabel}?`,
            text: `${targetLabel.charAt(0).toUpperCase()}${targetLabel.slice(1)} perderá ${removedCount === 1 ? "ese acceso" : "esos accesos"} al guardar${
              addedCount ? ` y recibirá ${addedCount} ${addedCount === 1 ? "permiso nuevo" : "permisos nuevos"}` : ""
            }.`,
            confirmButtonText: "Sí, guardar y quitar",
            variant: "danger",
          }
        : {
            title: `¿Guardar los permisos de ${targetLabel}?`,
            text: `Se asignarán ${addedCount} ${addedCount === 1 ? "permiso nuevo" : "permisos nuevos"} a ${targetLabel}.`,
            confirmButtonText: "Sí, guardar",
            variant: "info",
          }
    );
    if (!isConfirmed) return;

    setIsSaving(true);
    try {
      const permissionIds = [...selectedIds];
      if (selectedGroup) await updateGroupPermissions(selectedGroup, permissionIds);
      else await updateUserPermissions(selectedUser, permissionIds);
      setSavedIds(new Set(selectedIds));

      // Si el cambio afecta al usuario en sesión (su grupo o él mismo), se refrescan sus
      // permisos: la navegación y los botones se actualizan (SESSION_EVENT).
      const affectsMe = selectedGroup
        ? sessionUser?.groups?.includes(group?.group_name)
        : String(sessionUser?.id) === selectedUser;
      if (affectsMe) await refreshSession().catch(() => {});

      await showSuccessAlert({ title: "¡Guardado exitoso!", text: "Los permisos se guardaron correctamente." });
    } catch (error) {
      console.error("Error guardando permisos:", error);
      showSystemErrorAlert({ text: error.message || "Ocurrió un error al intentar asignar los permisos." });
    } finally {
      setIsSaving(false);
    }
  };

  const totalSelected = selectedIds.size + [...inheritedFrom.keys()].filter((id) => !selectedIds.has(id)).length;

  return (
    <div className="bg-background/95 rounded-shape-xl p-4 sm:p-6 md:p-4 border border-border/40 shadow-elevation-3">
      <div className="w-full px-0 sm:px-6 md:px-12 pt-4 sm:pt-8">
        <div className="mb-8">
          <h1 className="text-main font-heading font-bold text-text-primary flex items-center gap-3">
            <UserRoundKey className="w-8 h-8 text-text-primary shrink-0" aria-hidden="true" />
            Gestión de Permisos
          </h1>
          <p className="text-body text-text-primary/80 mt-1">Asignación de roles y accesos al sistema.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-8 mt-2">
            <div className="flex flex-col gap-2">
              <div className="text-body text-text-primary font-bold border-b border-border-strong pb-1 flex items-center justify-center gap-2">
                <Users className="w-5 h-5" aria-hidden="true" />
                <span>Grupo de usuarios</span>
              </div>
              <Select
                htmlFor="permissions-group"
                name="permissionsGroup"
                value={selectedGroup}
                onChange={handleGroupChange}
                options={groupOptions}
                placeholder="Seleccione un grupo"
                disabled={isSaving}
                className="mt-1"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-body text-text-primary font-bold border-b border-border-strong pb-1 flex items-center justify-center gap-2">
                <UserRound className="w-5 h-5" aria-hidden="true" />
                <span>Usuario individual</span>
              </div>
              <Select
                htmlFor="permissions-user"
                name="permissionsUser"
                value={selectedUser}
                onChange={handleUserChange}
                options={userOptions}
                placeholder="Seleccione un usuario"
                disabled={isSaving}
                className="mt-1"
              />
            </div>

            {selectedUser && (
              <div className="rounded-shape-lg border border-border bg-surface p-4 text-small text-text-primary space-y-2">
                <p className="font-bold">Cómo leer los permisos</p>
                <p className="flex items-center gap-2">
                  <span className="perm-badge perm-badge--direct">Directo</span> asignado solo a este usuario (editable aquí).
                </p>
                <p className="flex items-center gap-2">
                  <span className="perm-badge perm-badge--inherited">Grupo</span> heredado de su rol; se edita desde el grupo.
                </p>
                {targetUser?.groups?.length > 0 && (
                  <p className="text-text-secondary">Roles: {targetUser.groups.join(", ")}</p>
                )}
              </div>
            )}
            {targetUser?.is_superuser && (
              <p className="text-small text-text-primary rounded-shape-lg bg-info-container text-on-info-container p-3">
                Un superusuario tiene todos los permisos del sistema aunque no estén marcados.
              </p>
            )}
          </div>

          <div
            className={`lg:col-span-3 bg-surface rounded-shape-lg p-4 sm:p-6 md:p-8 shadow-inner border border-border transition-opacity ${isLoading ? "opacity-60" : ""}`}
            aria-busy={isLoading}
          >
            {!hasTarget && (
              <p className="text-body text-text-primary/80 mb-6">
                Selecciona un grupo o un usuario para ver y editar sus permisos.
              </p>
            )}
            {lockedReason && (
              <p role="note" className="mb-6 flex items-center gap-2 rounded-shape-lg bg-warning-container text-on-warning-container p-3 text-small">
                <Lock className="w-4 h-4 shrink-0" aria-hidden="true" /> {lockedReason}
              </p>
            )}
            {hasTarget && !isLoading && (
              <p className="mb-6 text-small text-text-secondary" aria-live="polite">
                {totalSelected} de {catalog.length} permisos{isDirty ? " · cambios sin guardar" : ""}
              </p>
            )}

            {modules.map((module, index) => {
              const state = moduleState(module);
              return (
                <fieldset
                  key={module.id}
                  className={index < modules.length - 1 ? "mb-8 border-b border-border-strong pb-6" : "mb-4"}
                >
                  <legend className="sr-only">Módulo {module.name}</legend>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-heading font-bold text-lg text-text-primary">{module.name}</h2>
                    <Checkbox
                      id={`module-${module.id}`}
                      name={`module-${module.id}`}
                      checked={state.all}
                      indeterminate={state.some}
                      disabled={!canEdit || state.empty}
                      onChange={(e) => toggleModule(module, e.target.checked)}
                      label={<span className="text-small font-semibold">Seleccionar todo</span>}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-2 gap-x-4 pl-2">
                    {module.permissions.map((permission) => {
                      const id = permission.permission_id;
                      const fromGroups = inheritedFrom.get(id);
                      const isDirect = selectedUser && savedIds.has(id);
                      return (
                        <Checkbox
                          key={id}
                          id={`perm-${id}`}
                          name={permission.permission_codename}
                          checked={Boolean(fromGroups) || selectedIds.has(id)}
                          disabled={!canEdit || Boolean(fromGroups)}
                          onChange={(e) => togglePermission(id, e.target.checked)}
                          label={
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span>{permission.permission_name}</span>
                              {fromGroups && (
                                <span className="perm-badge perm-badge--inherited" title={`Heredado de: ${fromGroups.join(", ")}`}>
                                  Grupo: {fromGroups.join(", ")}
                                </span>
                              )}
                              {isDirect && <span className="perm-badge perm-badge--direct">Directo</span>}
                            </span>
                          }
                        />
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>

          <div className="lg:col-span-4 mt-2 flex justify-end gap-4 border-t border-border pt-6 max-sm:flex-col-reverse max-sm:items-stretch max-sm:*:w-full">
            <Button variant="secondary" type="button" onClick={handleCancel}>Cancelar</Button>
            <Button
              variant="primary"
              type="submit"
              disabled={!canEdit || !isDirty || isSaving}
              className="flex items-center gap-2"
              {...guard("manage_permissions", "gestionar roles y permisos")}
            >
              <Save className="w-5 h-5" aria-hidden="true" />
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}