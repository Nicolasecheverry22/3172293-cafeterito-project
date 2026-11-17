import { productService } from "./product.service.js";
import { withConstraintErrors } from "../../utils/constraintErrors.js";

const withProductErrors = withConstraintErrors({
  uq_products_category_name: [409, "Ya existe un platillo con ese nombre en la misma categoría"],
});

// Los errores (httpError o de BD) se propagan al middleware global de errores.
export const productController = {
  create: withProductErrors(async (req, res) => {
    const product = await productService.create(req.body);
    res.status(201).json({
      message: "Producto creado correctamente",
      productId: product.id,
    });
  }),

  getAll: withProductErrors(async (req, res) => {
    res.json(await productService.list(req.query));
  }),

  getById: withProductErrors(async (req, res) => {
    const product = await productService.getById(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(product);
  }),

  getReportData: withProductErrors(async (req, res) => {
    const { category } = req.query;
    res.json(await productService.getReportData(category));
  }),

  update: withProductErrors(async (req, res) => {
    const updated = await productService.update(Number(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ message: "Producto actualizado correctamente", productId: updated.id });
  }),

  // PATCH /api/products/:id/status  { isAvailable }
  updateStatus: withProductErrors(async (req, res) => {
    const updated = await productService.setAvailability(Number(req.params.id), req.body.isAvailable);
    if (!updated) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({
      message: updated.isAvailable ? "Platillo habilitado correctamente" : "Platillo inhabilitado correctamente",
      productId: updated.id,
      isAvailable: updated.isAvailable,
    });
  }),

  // Público (montado en app.js sin autenticación): lo consume el Home
  getTopSelling: withProductErrors(async (req, res) => {
    const topProducts = await productService.getTopSelling();
    // Formato que espera el componente Card del frontend
    res.json(
      topProducts.map((p) => ({
        id: p.id,
        title: p.productName,
        category: p.category,
        price: p.price,
        description: p.description,
        totalSold: p.totalSold,
      }))
    );
  }),
};
