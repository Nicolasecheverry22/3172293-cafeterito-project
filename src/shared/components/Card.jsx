import { UtensilsCrossed } from "lucide-react";

export default function Card({ product }) {
  const { title, image, price, description } = product;

  return (
    <div className="w-full bg-surface text-text-primary shadow-sm rounded-2xl overflow-hidden border border-border hover:shadow-md transition-shadow duration-300">
      {image ? (
        <img src={image} alt={title} className="w-full h-40 object-contain bg-background" />
      ) : (
        <div className="w-full h-40 flex items-center justify-center bg-background">
          <UtensilsCrossed className="w-10 h-10 text-text-primary/30" />
        </div>
      )}

      <div className="p-5 space-y-2">
        <h2 className="text-body font-heading font-semibold text-text-primary">{title}</h2>
        {description && <p className="text-small text-text-primary/70">{description}</p>}
        <p className="text-body font-bold text-green-800">${price.toLocaleString()}</p>
      </div>
    </div>
  );
}