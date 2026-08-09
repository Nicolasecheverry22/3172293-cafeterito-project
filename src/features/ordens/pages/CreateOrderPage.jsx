import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Utensils } from "lucide-react";
import { Input, Select, Button, FormNavbar } from "@/shared"; 
import { waitersData, menuDishesData, orderStatusOptions } from "../data/orderMockData";

export default function CreateOrderPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tableNumber: "",
    waiterId: "",
    status: "Activo",
  });

  // Lista de productos sencilla
  const [orderItems, setOrderItems] = useState([
    { id: crypto.randomUUID(), dishId: "", quantity: 1 }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id, field, value) => {
    setOrderItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addDishRow = () => {
    setOrderItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), dishId: "", quantity: 1 }
    ]);
  };

  const removeDishRow = (id) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Orden enviada:", { ...formData, items: orderItems });
    navigate(-1);
  };

  return (
           <div className="w-full min-h-screen bg-background pb-10">
            <FormNavbar />
      <div className="max-w-5xl mx-auto space-y-8">
        
        <h1 className="text-2xl md:text-3xl font-heading font-normal text-text-primary">
          Registrar orden nueva
        </h1>

        <div className="flex flex-col items-center justify-center bg-background p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl font-bold text-text-primary">#</span>
            <Utensils className="w-8 h-8 text-text-primary" />
          </div>
          <div className="w-48">
            <Input 
              name="tableNumber"
              type="number"
              value={formData.tableNumber}
              onChange={handleChange}
              placeholder="No. Mesa"
              htmlFor="tableNumber"
              className="text-center font-bold"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          <div className="lg:col-span-1 bg-surface-muted/50 p-6 rounded-2xl border border-border flex flex-col items-center justify-center gap-4 shadow-sm">
            <span className="font-heading font-bold text-text-primary text-lg">Estado</span>
            <div className="w-full">
              <Select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={orderStatusOptions}
                htmlFor="status"
              />
            </div>
            <div className="w-full bg-emerald-500 text-white font-bold py-2 px-4 rounded-md text-center text-sm">
              {formData.status}
            </div>
          </div>

          <div className="lg:col-span-3 bg-background p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-6">
            
            <div>
              <Select 
                label="Empleado encargado"
                name="waiterId"
                value={formData.waiterId}
                onChange={handleChange}
                options={waitersData}
                htmlFor="waiterId"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-caption text-text-secondary font-medium">
                Platillos / Productos del Menú
              </label>

              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <Select 
                      name={`dish-${item.id}`}
                      value={item.dishId}
                      onChange={(e) => handleItemChange(item.id, "dishId", e.target.value)}
                      options={menuDishesData}
                      htmlFor={`dish-${item.id}`}
                    />
                  </div>
                  <div className="w-24">
                    <Input 
                      name={`qty-${item.id}`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                      placeholder="Cant"
                      htmlFor={`qty-${item.id}`}
                      min="1"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDishRow(item.id)}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-lg flex items-center justify-center h-12 border border-border"
                  >
                    <Trash2 className="w-5 h-5 " />
                  </button>
                </div>
              ))}

              <div className="pt-2">
                <Button 
                  variant="secondary" 
                  type="button" 
                  onClick={addDishRow}
                  className="flex items-center justify-center gap-2 w-full md:w-auto bg-brand/30 hover:bg-brand/50 text-text-primary font-medium"
                >
                  Agregar producto <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

          </div>

        </form>

        <div className="flex justify-end pt-4">
          <Button 
            variant="primary" 
            type="button"
            onClick={handleSubmit}
            className="w-full md:w-64 py-3 text-base font-bold shadow-md"
          >
            Crear orden
          </Button>
        </div>

      </div>
    </div>
  );
}