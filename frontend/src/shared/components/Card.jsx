import { UtensilsCrossed } from "lucide-react";

export default function Card({ product }) {
  const { title, image, price, description, totalSold } = product;

  return (
    // M3 elevated card: radio 12px, elevación 1 → 2 al pasar el cursor (sin scale, que desenfoca el texto)
    <div className="relative flex flex-col h-full bg-surface text-text-primary shadow-elevation-1 rounded-shape-md overflow-hidden border border-border-strong transition-shadow duration-300 hover:shadow-elevation-2">
      
      {/* Badge de vendidos integrado dentro del hover */}
      {totalSold !== undefined && (
        <div className="absolute top-3 right-3 z-10">
          <span className="rounded-full bg-brand px-2 py-1 text-xs font-bold text-text-on-brand shadow-elevation-1">
            {totalSold} vendidos
          </span>
        </div>
      )}

      {image ? (
        <img src={image} alt={title} className="w-full h-40 object-contain bg-surface-muted border-b border-border" />
      ) : (
        <div className="w-full h-40 flex items-center justify-center bg-surface-muted border-b border-border">
          <UtensilsCrossed className="w-10 h-10 text-text-secondary" />
        </div>
      )}

      <div className="p-4 flex flex-col flex-grow justify-between space-y-2">
        <div>
          <h2 className="text-body font-heading font-semibold text-text-primary">{title}</h2>
          {description && <p className="text-small text-text-secondary font-medium mt-1">{description}</p>}
        </div>
        <p className="text-body font-bold text-success mt-2">
          ${price.toLocaleString()}
        </p>
      </div>
    </div>
  );
}