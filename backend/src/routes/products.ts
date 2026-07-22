import { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { query } from '../db/connection';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();
router.use(authMiddleware);

const productSchema = Joi.object({
  product_name: Joi.string().required(),
  sku: Joi.string().required(),
  category: Joi.string(),
  unit_price: Joi.number().positive().required(),
  current_stock: Joi.number().integer().min(0),
  minimum_stock_alert: Joi.number().integer().min(0),
  location_warehouse: Joi.string(),
});

// Get all products
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const offset = (page - 1) * limit;
    const search = (req.query.search as string) || '';

    let whereClause = '';
    const params: any[] = [limit, offset];

    if (search) {
      whereClause = 'WHERE product_name ILIKE $3 OR sku ILIKE $3';
      params.push(`%${search}%`);
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM products ${whereClause}`,
      params.slice(2)
    );

    const result = await query(
      `SELECT * FROM products ${whereClause} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      params
    );

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(parseInt(countResult.rows[0].total) / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get product by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Product not found');
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Create product
router.post('/', roleMiddleware(['Admin', 'Warehouse']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      throw new ApiError(400, 'Validation error', error.details);
    }

    const result = await query(
      `INSERT INTO products 
       (product_name, sku, category, unit_price, current_stock, minimum_stock_alert, location_warehouse, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        value.product_name,
        value.sku,
        value.category,
        value.unit_price,
        value.current_stock || 0,
        value.minimum_stock_alert || 10,
        value.location_warehouse,
        req.user?.id,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update product
router.put('/:id', roleMiddleware(['Admin', 'Warehouse']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = productSchema.validate(req.body, { allowUnknown: true });
    if (error) {
      throw new ApiError(400, 'Validation error', error.details);
    }

    const { id } = req.params;

    const existsResult = await query('SELECT id FROM products WHERE id = $1', [id]);
    if (existsResult.rows.length === 0) {
      throw new ApiError(404, 'Product not found');
    }

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    Object.keys(value).forEach((key) => {
      if (value[key] !== undefined && value[key] !== null) {
        updates.push(`${key} = $${paramIndex}`);
        params.push(value[key]);
        paramIndex++;
      }
    });

    if (updates.length === 0) {
      throw new ApiError(400, 'No fields to update');
    }

    params.push(id);
    const result = await query(
      `UPDATE products SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Get stock movements for a product
router.get('/:id/stock-movements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT * FROM stock_movements WHERE product_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    res.json({
      data: result.rows,
      pagination: { page, limit },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
