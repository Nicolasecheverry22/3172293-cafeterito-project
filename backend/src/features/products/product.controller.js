import { productService } from "./product.service.js";

export const productController = {
  async create(req, res) {
    try {
      const product = await productService.create(req.body);
      res.status(201).json({
        message: "Producto creado correctamente",
        productId: product.id,
      });
    } catch (err) {
      console.log("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const products = await productService.getAll();
      res.json(products);
    } catch (err) {
      console.log("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const product = await productService.getById(Number(req.params.id));
      if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      res.json(product);
    } catch (err) {
      console.log("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getReportData(req, res) {
    try {
      const { category } = req.query;
      const products = await productService.getReportData(category);
      res.json(products);
    } catch (err) {
      console.log("ERROR BACKEND REPORT:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const updated = await productService.update(Number(req.params.id), req.body);
      if (!updated) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      res.json({ message: "Producto actualizado correctamente", productId: updated.id });
    } catch (err) {
      console.log("ERROR BACKEND:", err);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const deleted = await productService.remove(Number(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      res.json({
        message: "Producto eliminado correctamente",
        productId: deleted.id,
      });
    } catch (err) {
      console.log("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getTopSelling(req, res) {
    try {
      const topProducts = await productService.getTopSelling();
      // Mapeamos para que coincida exactamente con lo que el componente Card espera
      const formatted = topProducts.map(p => ({
        id: p.id,
        title: p.productName,
        category: p.category,
        price: p.price,
        description: p.description,
        totalSold: p.totalSold
      }));
      res.json(formatted);
    } catch (err) {
      console.log("ERROR BACKEND TOP SELLING:", err);
      res.status(500).json({ error: err.message });
    }
  },
};