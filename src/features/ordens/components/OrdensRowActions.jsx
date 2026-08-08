import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderDetailModal from "./OrderDetailModal";

export default function OrdensRowActions({ order }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleEdit = () => {
    navigate(`/orders/${order.id}/edit`);
  };

  const handleDelete = () => {
    console.log("Eliminar orden:", order.id);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setOpen(true)}
        className="p-1 rounded hover:bg-gray-100"
      >
        <Eye size={16} />
      </button>

      <button
        onClick={handleEdit}
        className="p-1 rounded hover:bg-gray-100"
      >
        <Pencil size={16} />
      </button>

      <button
        onClick={handleDelete}
        className="p-1 rounded hover:bg-gray-100"
      >
        <Trash2 size={16} />
      </button>

      <OrderDetailModal
        isOpen={open}
        onClose={() => setOpen(false)}
        order={order}
      />
    </div>
  );
}