// src/shared/components/FileInput.jsx
// Input controlado: soporta imágenes + PDF, preview condicional, reorder y limpieza de memoria

import { useRef, useState, useEffect, useMemo } from "react";
import { Infinity as InfinityLoader } from "ldrs/react";
import "ldrs/react/Infinity.css";

export default function FileInput({
  value = [], // estado externo (files)
  onChange, // setter externo
  multiple = false, // modo selección
  accept = "image/*,application/pdf", // tipos permitidos
}) {
  const inputRef = useRef(); // input oculto
  const [isLoading, setIsLoading] = useState(false); // loader
  const [dragIndex, setDragIndex] = useState(null); // índice drag

  const isImage = (file) => file.type.startsWith("image/"); // discriminador MIME

  // Genera previews SOLO para imágenes (evita crear URLs innecesarias)
  const previews = useMemo(
    () =>
      value.map((file) => (isImage(file) ? URL.createObjectURL(file) : null)),
    [value]
  );

  // Limpieza de ObjectURL (prevención memory leak)
  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  // Normaliza FileList, simula async y limita a 12
  const handleFiles = async (files) => {
    setIsLoading(true);

    const list = Array.from(files);
    await new Promise((r) => setTimeout(r, 500));

    const data = multiple ? [...value, ...list] : [list[0]];
    onChange(data.slice(0, 12));

    setIsLoading(false);
  };

  // Eliminación inmutable
  const remove = (i) => {
    const copy = [...value];
    copy.splice(i, 1);
    onChange(copy);
  };

  // Reordenamiento por drag & drop
  const reorder = (from, to) => {
    const copy = [...value];
    const [m] = copy.splice(from, 1);
    copy.splice(to, 0, m);
    onChange(copy);
  };

return (
  <div className="flex flex-col items-center gap-3 ">
    <div>
      <h2 className="text-xs text-text-muted">Max:12 imagenes</h2>
    </div>

    
  <div className="flex flex-row">
    {value.map((file, i) => (
      <div
      key={i}
      draggable
      onDragStart={() => setDragIndex(i)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => reorder(dragIndex, i)}
      className="group relative h-24 w-24 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md cursor-grab active:cursor-grabbing"
      >
        {/* Render condicional: Imagen vs Documento */}
        {isImage(file) ? (
          <img
          src={previews[i]}
          alt={file.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 p-2 text-gray-500">
            <svg className="h-6 w-6 mb-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="truncate w-full text-center text-[10px] font-medium text-gray-600">{file.name}</span>
          </div>
        )}

        {/* Overlay en Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 backdrop-blur-[1px]">
        
        
        
          {/* Indicador de arrastrar */}
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow backdrop-blur-sm transition-transform hover:scale-110" title="Arrastrar para reordenar">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
            </svg>
          </span>
          {/* Botón Eliminar */}
          <button
            type="button"
            onClick={() => remove(i)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/90 text-white shadow backdrop-blur-sm transition-transform hover:scale-110 hover:bg-red-600"
            title="Eliminar"
            >

            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    ))}

    {/* Dropzone / Trigger de Carga */}
    <div
      onClick={() => !isLoading && inputRef.current.click()}
      className={`group flex h-24 w-24 flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 ${
        isLoading
        ? "border-gray-200 bg-gray-50 cursor-not-allowed"
        : "border-gray-300 bg-gray-50/50 hover:border-blue-500 hover:bg-blue-50/30 cursor-pointer active:scale-95"
      }`}
      >
      {isLoading ? (
        <InfinityLoader
        size="45"
        stroke="3.5"
        strokeLength="0.15"
        bgOpacity="0.1"
        speed="1.3"
        color="#3b82f6"
        />
      ) : (
        <>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="mt-1 text-xs font-medium text-gray-600 group-hover:text-blue-600">
            Añadir
          </span>
        </>
      )}
    </div>

    {/* Input desacoplado */}
    <input
      ref={inputRef}
      type="file"
      className="hidden"
      multiple={multiple}
      accept={accept}
      onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  </div>
);
}