// Carrito de la orden: lista ordenada de { productId, quantity }.
// Un reducer centraliza las reglas (mínimo 1, tope MAX_QTY_PER_DISH, quitar al llegar a 0).
import { useMemo, useReducer } from "react";
import { MAX_QTY_PER_DISH } from "../config/orderConfig";

const clamp = (qty) => Math.min(Math.max(qty, 0), MAX_QTY_PER_DISH);

function cartReducer(state, action) {
  const { type, productId } = action;
  const current = state.find((line) => line.productId === productId);

  switch (type) {
    case "increment":
      if (!current) return [...state, { productId, quantity: 1 }];
      return state.map((line) =>
        line.productId === productId ? { ...line, quantity: clamp(line.quantity + 1) } : line
      );
    case "decrement":
      if (!current) return state;
      if (current.quantity <= 1) return state.filter((line) => line.productId !== productId);
      return state.map((line) =>
        line.productId === productId ? { ...line, quantity: line.quantity - 1 } : line
      );
    case "remove":
      return state.filter((line) => line.productId !== productId);
    case "clear":
      return [];
    case "reset":
      return action.lines;
    default:
      return state;
  }
}

/**
 * @param {Array<{id:number, productName:string, price:number}>} dishes catálogo para precios y nombres
 * @param {Array<{productId:number, quantity:number}>} initialLines carrito inicial (editar orden)
 */
export default function useOrderCart(dishes, initialLines = []) {
  const [lines, dispatch] = useReducer(cartReducer, initialLines);

  const dishById = useMemo(() => new Map(dishes.map((d) => [d.id, d])), [dishes]);

  // Líneas con nombre, precio y subtotal para pintar el resumen
  const detailed = useMemo(
    () =>
      lines
        .filter((line) => dishById.has(line.productId))
        .map((line) => {
          const dish = dishById.get(line.productId);
          return { ...line, dish, subtotal: dish.price * line.quantity };
        }),
    [lines, dishById]
  );

  const quantityOf = (productId) =>
    lines.find((line) => line.productId === productId)?.quantity ?? 0;

  return {
    lines,
    detailed,
    quantityOf,
    totalItems: detailed.reduce((sum, l) => sum + l.quantity, 0),
    total: detailed.reduce((sum, l) => sum + l.subtotal, 0),
    increment: (productId) => dispatch({ type: "increment", productId }),
    decrement: (productId) => dispatch({ type: "decrement", productId }),
    remove: (productId) => dispatch({ type: "remove", productId }),
    clear: () => dispatch({ type: "clear" }),
    // Descartar cambios: vuelve a las líneas indicadas
    reset: (nextLines) => dispatch({ type: "reset", lines: nextLines }),
  };
}
