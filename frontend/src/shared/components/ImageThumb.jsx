// Miniatura/avatar uniforme (BEM: image-thumb). Muestra la imagen con object-cover
// o, si no hay imagen (RFADMIN21), un placeholder con las iniciales o un icono.
import { useState } from "react";
import { ImageOff } from "lucide-react";
import { getInitials } from "../utils/image";

const ICON_SIZES = { sm: 18, md: 24, lg: 40, xl: 64 };

export default function ImageThumb({
  src,
  alt = "",
  name,                 // si se pasa, el placeholder muestra sus iniciales
  icon: Icon = ImageOff, // icono del placeholder cuando no hay nombre
  size = "md",          // sm 40px · md 56px · lg 128px · xl 240px
  round = false,
  className = "",
}) {
  // Si la imagen falla al cargar se muestra el placeholder
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage = Boolean(src) && failedSrc !== src;

  const classes = [
    "image-thumb",
    `image-thumb--${size}`,
    round && "image-thumb--round",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="image-thumb__img"
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span className="image-thumb__placeholder" role="img" aria-label={alt || "Sin imagen"}>
          {name ? getInitials(name) : <Icon size={ICON_SIZES[size] ?? 24} aria-hidden="true" />}
        </span>
      )}
    </span>
  );
}
