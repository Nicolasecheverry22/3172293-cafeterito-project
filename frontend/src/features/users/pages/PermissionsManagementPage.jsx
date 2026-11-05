import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ChevronDown, UserRoundKey } from "lucide-react";
import { Button, Checkbox } from "@/shared";
import { getPermissions } from "@/services/permissionApi";
import {
  getGroups,
  getGroupPermissions,
  updateGroupPermissions,
} from "@/services/groupApi";
import {
  getUsers,
  getUserPermissions,
  updateUserPermissions,
} from "@/services/userApi";
import {
  showSuccessAlert,
  showCreateErrorAlert,
  showDeleteCancelAlert,
  showSystemErrorAlert,
  showConfirmDeleteAlert
} from "@/shared/services/alertService";

const SELECT_CLASSES =
  "w-full appearance-none bg-brand text-text-primary h-12 px-6 rounded-full font-bold outline-none cursor-pointer shadow-md hover:brightness-95 transition-all";

// Agrupa el catálogo plano de permisos por módulo (content_type).
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

export default function PermissionsManagementPage() {
  const navigate = useNavigate();

  // Catálogos desde la BD
  const [catalog, setCatalog] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);

  // Destino de la asignación: un grupo O un usuario (excluyentes)
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  // Permisos marcados (editables) y heredados de grupos (solo lectura, modo usuario)
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [inheritedIds, setInheritedIds] = useState(new Set());

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const modules = useMemo(() => groupByModule(catalog), [catalog]);
  const hasTarget = Boolean(selectedGroup || selectedUser);

  // Carga inicial de catálogos
  useEffect(() => {
    Promise.all([getPermissions(), getGroups(), getUsers()])
      .then(([permissionsData, groupsData, usersData]) => {
        setCatalog(permissionsData);
        setGroups(groupsData.filter((g) => g.is_active));
        setUsers(usersData);
      })
      .catch((error) => {
        console.error("Error cargando catálogos de permisos:", error);
        showSystemErrorAlert({
          text: "No se pudieron cargar los permisos. Verifica que el backend esté corriendo.",
        });
      });
  }, []);

  // Carga los permisos actuales del grupo/usuario seleccionado
  // (El reset del estado se hace en los handlers de cambio, no aquí)
  useEffect(() => {
    if (!hasTarget) return;

    // Evita que una respuesta lenta de una selección anterior pise la actual
    let isCurrent = true;

    const request = selectedGroup
      ? getGroupPermissions(selectedGroup)
      : getUserPermissions(selectedUser);

    request
      .then((rows) => {
        if (!isCurrent) return;

        if (selectedGroup) {
          setSelectedIds(new Set(rows.map((r) => r.permission_id)));
          setInheritedIds(new Set());
        } else {
          setSelectedIds(new Set(rows.filter((r) => r.is_direct).map((r) => r.permission_id)));
          setInheritedIds(new Set(rows.filter((r) => r.is_inherited).map((r) => r.permission_id)));
        }
      })
      .catch((error) => {
        console.error("Error cargando permisos asignados:", error);
        if (isCurrent) {
          showSystemErrorAlert({ text: "No se pudieron cargar los permisos asignados." });
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedGroup, selectedUser, hasTarget]);

  // Cambiar de destino limpia los checks; el efecto carga los del nuevo destino
  const resetAssignment = (nextTarget) => {
    setSelectedIds(new Set());
    setInheritedIds(new Set());
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

  const togglePermission = (permissionId, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      checked ? next.add(permissionId) : next.delete(permissionId);
      return next;
    });
  };

  // Solo se pueden editar los permisos que no vienen heredados de un grupo
  const getEditableIds = (module) =>
    module.permissions
      .map((p) => p.permission_id)
      .filter((id) => !inheritedIds.has(id));

  const toggleModule = (module, checked) => {
    const editableIds = getEditableIds(module);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      editableIds.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
  };

  const isModuleChecked = (module) => {
    const editableIds = getEditableIds(module);
    return editableIds.length > 0 && editableIds.every((id) => selectedIds.has(id));
  };

  const handleCancel = async () => {
    const result = await showConfirmDeleteAlert({
      title: "¿Estás seguro de cancelar?",
      text: "Los cambios realizados no se guardarán.",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Continuar editando",
    });

    if (result.isConfirmed) {
      showDeleteCancelAlert({
        title: "Operación cancelada",
        text: "No se guardó ningún cambio.",
      });
      navigate(-1);
    }
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

    setIsSaving(true);
    try {
      const permissionIds = [...selectedIds];

      if (selectedGroup) {
        await updateGroupPermissions(selectedGroup, permissionIds);
      } else {
        await updateUserPermissions(selectedUser, permissionIds);
      }

      await showSuccessAlert({
        title: "¡Guardado exitoso!",
        text: "Cambios guardados exitosamente.",
      });
    } catch (error) {
      console.error("Error guardando permisos:", error);
      showSystemErrorAlert({
        text: error.message || "Ocurrió un error al intentar asignar los permisos.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-surface/40 backdrop-blur-md rounded-3xl p-6 md:p-4 border border-border/40 shadow-2xl">
      <div className="w-full px-6 md:px-12 pt-8">
        <div className="mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div>
              <h1 className="text-main font-heading font-bold text-text-primary/ flex items-center gap-3">
                <UserRoundKey className="w-8 h-8 text-text-primary/" />
                Gestión de Permisos
              </h1>
              <p className="text-body text-text-inverse/40 mt-1">
                Asignación de roles y accesos al sistema.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
            <div className="lg:col-span-1 flex flex-col gap-10 mt-4">
              <div className="flex flex-col gap-2 relative">
                <label
                  htmlFor="permissions-group"
                  className="text-body text-text-primary/ font-bold border-b border-border-strong pb-1 w-full text-center mx-auto max-w-[80%]"
                >
                  Grupos usuarios
                </label>
                <div className="relative mt-2">
                  <select
                    id="permissions-group"
                    value={selectedGroup}
                    onChange={handleGroupChange}
                    className={SELECT_CLASSES}
                  >
                    <option value="">Grupo usuarios</option>
                    {groups.map((group) => (
                      <option key={group.group_id} value={group.group_id}>
                        {group.group_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-primary pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2 relative">
                <label
                  htmlFor="permissions-user"
                  className="text-body text-text-primary/ font-bold border-b border-border-strong pb-1 w-full text-center mx-auto max-w-[80%]"
                >
                  Usuario individual
                </label>
                <div className="relative mt-2">
                  <select
                    id="permissions-user"
                    value={selectedUser}
                    onChange={handleUserChange}
                    className={SELECT_CLASSES}
                  >
                    <option value="">Seleccione Usuario</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.userName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-primary pointer-events-none" />
                </div>
              </div>

              {selectedUser && (
                <p className="text-small text-text-primary/80 text-center">
                  Los permisos marcados como <strong>(grupo)</strong> se heredan de los grupos del
                  usuario y se editan desde el grupo.
                </p>
              )}
            </div>

            <div
              className={`lg:col-span-3 bg-surface-muted/50 rounded-2xl p-8 md:p-10 shadow-inner border border-border transition-opacity ${
                isLoading ? "opacity-60" : ""
              }`}
            >
              {!hasTarget && (
                <p className="text-body text-text-primary/70 mb-6">
                  Selecciona un grupo o un usuario para ver y editar sus permisos.
                </p>
              )}

              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className={
                    index < modules.length - 1
                      ? "mb-8 border-b border-border-strong pb-6"
                      : "mb-4"
                  }
                >
                  <div className="mb-4">
                    <Checkbox
                      id={`module-${module.id}`}
                      name={`module-${module.id}`}
                      checked={isModuleChecked(module)}
                      disabled={!hasTarget || isLoading || getEditableIds(module).length === 0}
                      onChange={(e) => toggleModule(module, e.target.checked)}
                      label={
                        <span className="font-heading font-bold text-lg text-text-primary">
                          Gestión {module.name}
                        </span>
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-2 pl-2">
                    {module.permissions.map((permission) => {
                      const id = permission.permission_id;
                      const isInherited = inheritedIds.has(id);

                      return (
                        <Checkbox
                          key={id}
                          id={`perm-${id}`}
                          name={permission.permission_codename}
                          checked={isInherited || selectedIds.has(id)}
                          disabled={!hasTarget || isLoading || isInherited}
                          onChange={(e) => togglePermission(id, e.target.checked)}
                          label={
                            isInherited
                              ? `${permission.permission_name} (grupo)`
                              : permission.permission_name
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-4 mt-6 flex justify-end gap-4 border-t border-border pt-6">
              <Button variant="secondary" type="button" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={!hasTarget || isSaving || isLoading}
                className="flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
