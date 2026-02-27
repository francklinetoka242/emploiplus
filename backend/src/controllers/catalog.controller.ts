// backend/src/controllers/catalog.controller.ts
import { pool } from "../config/database.js";

export const catalogController = {
  // Get all catalogs or filter by category
  async getAll(req: any, res: any) {
    try {
      const { category } = req.query;
      
      let query = "SELECT * FROM service_catalogs ORDER BY created_at DESC";
      const params = [];
      
      if (category) {
        query = "SELECT * FROM service_catalogs WHERE category = $1 ORDER BY created_at DESC";
        params.push(category);
      }
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching catalogs:", error);
      res.status(500).json({ error: "Failed to fetch catalogs" });
    }
  },

  // Create a new catalog item
  async create(req: any, res: any) {
    try {
      const { name, description, category, price, image_url } = req.body;

      const result = await pool.query(
        `INSERT INTO service_catalogs (name, description, category, price, image_url, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING *`,
        [name, description, category, price || null, image_url || null]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating catalog:", error);
      res.status(500).json({ error: "Failed to create catalog" });
    }
  },

  // Update a catalog item
  async update(req: any, res: any) {
    try {
      const { id } = req.params;
      const { name, description, category, price, image_url } = req.body;

      const result = await pool.query(
        `UPDATE service_catalogs 
         SET name = $1, description = $2, category = $3, price = $4, image_url = $5
         WHERE id = $6
         RETURNING *`,
        [name, description, category, price || null, image_url || null, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Catalog not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating catalog:", error);
      res.status(500).json({ error: "Failed to update catalog" });
    }
  },

  // Delete a catalog item
  async delete(req: any, res: any) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        "DELETE FROM service_catalogs WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Catalog not found" });
      }

      res.json({ message: "Catalog deleted successfully" });
    } catch (error) {
      console.error("Error deleting catalog:", error);
      res.status(500).json({ error: "Failed to delete catalog" });
    }
  },
};
