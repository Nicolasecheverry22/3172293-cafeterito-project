import { UtensilsCrossed } from "lucide-react";

export default function Card({ product }) {
  const { title, image, price, description, totalSold } = product;

  return (
    <div className="relative flex flex-col h-full bg-surface text-text-primary shadow-sm rounded-2xl overflow-hidden border border-border-strong transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl">
      
      {/* Badge de vendidos integrado dentro del hover */}
      {totalSold !== undefined && (
        <div className="absolute top-3 right-3 z-10">
          <span className="rounded-full bg-amber-500/90 px-2.5 py-0.5 text-xs font-bold text-white shadow-md">
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

      <div className="p-5 flex flex-col flex-grow justify-between space-y-2">
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