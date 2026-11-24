import { useRef, useState, useEffect, useMemo } from "react";
import { Upload, X, RefreshCw } from "lucide-react";
import { Infinity as InfinityLoader } from "ldrs/react";
import "ldrs/react/Infinity.css";

/**
 * Selector de archivos con vista previa.
 * - value / onChange: arreglo de File ([] si no hay).
 * - existingUrl: imagen ya guardada (modo edición); se muestra si no hay archivo nuevo.
 * - onRemoveExisting: si se pasa, permite quitar la imagen guardada.
 * - validateFile(file) → mensaje de error | null: rechaza el archivo antes de aceptarlo.
 * - error: error externo (Zod) a mostrar debajo.
 * - hint: texto de ayuda bajo el área de carga.
 */
export default function FileInput({
  value = [],
  onChange,
  multiple = false,
  accept = "image/*,application/pdf",
  existingUrl = null,
  onRemoveExisting,
  validateFile,
  error,
  hint,
  label = "Subir imagen",
}) {
  const inputRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [localError, setLocalError] = useState(null);

  const isImage = (file) => file.type.startsWith("image/");

  const previews = useMemo(
    () => value.map((file) => (isImage(file) ? URL.createObjectURL(file) : null)),
    [value]
  );
  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  const openPicker = () => {
    if (!isLoading) inputRef.current?.click();
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);

    if (validateFile) {
      const message = list.map(validateFile).find(Boolean);
      if (message) {
        setLocalError(message);
        return;
      }
    }
    setLocalError(null);
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 200));
    const data = multiple ? [...value, ...list] : [list[0]];
    onChange(data.slice(0, 12));
    setIsLoading(false);
  };

  const remove = (i) => {
    const copy = [...value];
    copy.splice(i, 1);
    setLocalError(null);
    onChange(copy);
  };

  const reorder = (from, to) => {
    if (from === null || to === null) return;
    const copy = [...value];
    const [m] = copy.splice(from, 1);
    copy.splice(to, 0, m);
    onChange(copy);
  };

  const shownError = localError || error;

  // Vista previa grande de una sola imagen (archivo nuevo o la guardada)
  const singlePreview = !multiple && (value[0] || existingUrl);
  const singleSrc = value[0] ? previews[0] : existingUrl;
  const singleIsImage = value[0] ? isImage(value[0]) : true;

  const iconBtn =
    "size-touch rounded-full flex items-center justify-center shadow-elevation-2 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring cursor-pointer";

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {singlePreview ? (
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-48 h-48 overflow-hidden rounded-shape-lg border border-border bg-surface shadow-elevation-1">
            {singleIsImage ? (
              <img
                src={singleSrc}
                alt={value[0]?.name ?? "Imagen actual"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface-muted p-2 text-text-primary">
                <span className="text-caption font-medium truncate w-full text-center">{value[0].name}</span>
              </div>
            )}

            {/* Botones siempre visibles (no dependen del hover): usables con el dedo */}
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={openPicker}
                disabled={isLoading}
                aria-label="Cambiar imagen"
                title="Cambiar imagen"
                className={`${iconBtn} bg-surface text-text-primary`}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              {(value[0] || onRemoveExisting) && (
                <button
                  type="button"
                  onClick={() => (value[0] ? remove(0) : onRemoveExisting())}
                  aria-label="Quitar imagen"
                  title="Quitar imagen"
                  className={`${iconBtn} bg-error text-on-error`}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <span className="text-caption text-text-secondary">
            {value[0] ? "Vista previa (aún no guardada)" : "Imagen actual"}
          </span>
        </div>
      ) : value.length === 0 ? (
        // <button> (antes <div onClick>): se alcanza con Tab y se activa con Enter/Espacio
        <button
          type="button"
          onClick={openPicker}
          disabled={isLoading}
          className={`w-48 h-48 max-w-full rounded-shape-lg bg-surface/40 border-2 border-dashed border-border-strong flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-surface/60 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
            shownError ? "border-error" : ""
          } ${isLoading ? "opacity-70 pointer-events-none" : ""}`}
        >
          {isLoading ? (
            <InfinityLoader size="45" color="var(--semantic-brand)" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-text-primary text-center">
              <span className="font-heading text-body">{label}</span>
              <Upload className="w-7 h-7" />
              {hint && <span className="text-caption text-text-secondary">{hint}</span>}
            </div>
          )}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3 w-full">
          <span className="text-caption font-heading text-text-muted">
            Max: 12 imágenes ({value.length}/12)
          </span>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {value.map((file, i) => (
              <div
                key={i}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => reorder(dragIndex, i)}
                className="group relative h-24 w-24 overflow-hidden rounded-shape-lg border border-border bg-surface shadow-elevation-1 hover:shadow-elevation-2 transition cursor-grab active:cursor-grabbing"
              >
                {isImage(file) ? (
                  <img
                    src={previews[i]}
                    alt={file.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-surface-muted p-2 text-text-primary">
                    <span className="text-caption font-medium truncate w-full text-center">
                      {file.name}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Quitar ${file.name}`}
                  className="absolute top-1 right-1 h-9 w-9 bg-error text-on-error rounded-full flex items-center justify-center shadow-elevation-2 hover:scale-110 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-text-inverse"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {multiple && value.length < 12 && (
              <button
                type="button"
                onClick={openPicker}
                disabled={isLoading}
                aria-label="Añadir imagen"
                className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-shape-lg border-2 border-dashed border-border bg-surface-muted hover:border-border-strong cursor-pointer transition focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                {isLoading ? (
                  <InfinityLoader size="30" color="var(--semantic-brand)" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-text-muted" />
                    <span className="text-caption font-heading text-text-primary">Añadir</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {shownError && (
        <span role="alert" className="text-error text-small block mt-2 text-center">
          {shownError}
        </span>
      )}

      <input
        ref={inputRef}
        type="file"
        hidden
        multiple={multiple}
        accept={accept}
        onChange={(e) => {
          handleFiles(Array.from(e.target.files ?? []));
          // Permite volver a elegir el mismo archivo tras quitarlo
          e.target.value = "";
        }}
      />
    </div>
  );
}
