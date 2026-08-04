import { useRef, useState, useEffect, useMemo } from "react";
import { Upload, X } from "lucide-react";
import { Infinity as InfinityLoader } from "ldrs/react";
import "ldrs/react/Infinity.css";

export default function FileInput({
  value = [],
  onChange,
  multiple = false,
  accept = "image/*,application/pdf",
}) {
  const inputRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const isImage = (file) => file.type.startsWith("image/");

  const previews = useMemo(
    () =>
      value.map((file) =>
        isImage(file) ? URL.createObjectURL(file) : null
      ),
    [value]
  );
  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsLoading(true);
    const list = Array.from(files);
    await new Promise((r) => setTimeout(r, 400));
    const data = multiple ? [...value, ...list] : [list[0]];
    onChange(data.slice(0, 12));
    setIsLoading(false);
  };

  const remove = (i) => {
    const copy = [...value];
    copy.splice(i, 1);
    onChange(copy);
  };

  const reorder = (from, to) => {
    if (from === null || to === null) return;
    const copy = [...value];
    const [m] = copy.splice(from, 1);
    copy.splice(to, 0, m);
    onChange(copy);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {value.length === 0 ? (
        <div
          onClick={() => !isLoading && inputRef.current?.click()}
          className={`w-48 h-48 rounded-2xl bg-[#9E9E9E]/40 border-2 border-dashed border-border-strong flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-[#9E9E9E]/60 transition-all ${
            isLoading ? "opacity-70 pointer-events-none" : ""
          }`}
        >
          {isLoading ? (
            <InfinityLoader size="45" color="var(--semantic-brand)" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-text-primary text-center">
              <span className="font-heading font-medium text-body">
                Subir imagen
              </span>
              <Upload className="w-7 h-7 stroke-[2]" />
            </div>
          )}
        </div>
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
                className="group relative h-24 w-24 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing"
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

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="h-7 w-7 bg-error text-text-inverse rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {multiple && value.length < 12 && (
              <div
                onClick={() => !isLoading && inputRef.current?.click()}
                className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border bg-surface-muted hover:border-brand cursor-pointer transition"
              >
                {isLoading ? (
                  <InfinityLoader size="30" color="var(--semantic-brand)" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-text-muted" />
                    <span className="text-caption font-heading text-text-primary">
                      Añadir
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        hidden
        multiple={multiple}
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}