import { productService } from "./product.service.js";

// Los errores (httpError o de BD) se propagan al middleware global de errores.
export const productController = {
  async create(req, res) {
    const product = await productService.create(req.body);
    res.status(201).json({
      message: "Producto creado correctamente",
      productId: product.id,
    });
  },

  async getAll(req, res) {
    res.json(await productService.getAll());
  },

  async getById(req, res) {
    const product = await productService.getById(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(product);
  },

  async getReportData(req, res) {
    const { category } = req.query;
    res.json(await productService.getReportData(category));
  },

  async update(req, res) {
    const updated = await productService.update(Number(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ message: "Producto actualizado correctamente", productId: updated.id });
  },

  async remove(req, res) {
    const deleted = await productService.remove(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ message: "Producto eliminado correctamente", productId: deleted.id });
  },

  // Público (montado en app.js sin autenticación): lo consume el Home
  async getTopSelling(req, res) {
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
  },
};
