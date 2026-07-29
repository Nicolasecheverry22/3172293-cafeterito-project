import { useRef, useState, useEffect, useMemo } from "react";
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

  // Previews solo para imágenes
  const previews = useMemo(
    () =>
      value.map((file) =>
        isImage(file) ? URL.createObjectURL(file) : null
      ),
    [value]
  );

  // Cleanup de ObjectURLs
  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  const handleFiles = async (files) => {
    setIsLoading(true);
    const list = Array.from(files);
    await new Promise((r) => setTimeout(r, 500));
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
    <div className="flex flex-col items-center gap-3">
      <h2 className="text-xs text-text-muted">Max: 12 imágenes</h2>

      <div className="flex flex-row gap-2">
        {value.map((file, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => reorder(dragIndex, i)}
            className="group relative h-24 w-24 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md cursor-grab active:cursor-grabbing"
          >
            {isImage(file) ? (
              <img
                src={previews[i]}
                alt={file.name}
                className="h-full w-full object-cover group-hover:scale-105 transition"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 p-2 text-gray-500">
                <span className="text-[10px] font-medium truncate w-full text-center">
                  {file.name}
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
              <button
                onClick={() => remove(i)}
                className="h-7 w-7 bg-red-500 text-white rounded-full"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {/* Trigger */}
        <div
          onClick={() => !isLoading && inputRef.current.click()}
          className={`flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed ${
            isLoading
              ? "border-gray-200 bg-gray-50"
              : "border-gray-300 hover:border-blue-500 cursor-pointer"
          }`}
        >
          {isLoading ? (
            <InfinityLoader size="45" color="#3b82f6" />
          ) : (
            <span className="text-blue-500 text-sm">Añadir</span>
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple={multiple}
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}