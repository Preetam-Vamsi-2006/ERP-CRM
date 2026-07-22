import { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { query, getClient } from '../db/connection';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();
router.use(authMiddleware);

const challanItemSchema = Joi.object({
  product_id: Joi.number().required(),
  quantity: Joi.number().integer().positive().required(),
});

const challanSchema = Joi.object({
  customer_id: Joi.number().required(),
  items: Joi.array().items(challanItemSchema).required(),
  status: Joi.string().valid('Draft', 'Confirmed'),
});

// Generate unique challan number
async function generateChallanNumber(): Promise<string> {
  const result = await query(
    "SELECT COUNT(*) as count FROM challans WHERE created_at::date = CURRENT_DATE"
  );
  const count = parseInt(result.rows[0].count) + 1;
  return `CH${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(count).padStart(4, '0')}`;
}

// Get all challans
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    let whereClause = '';
    const params: any[] = [];

    if (status) {
      whereClause = 'WHERE status = $1';
      params.push(status);
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM challans ${whereClause}`,
      params
    );

    const challanIndex = params.length + 1;
    const result = await query(
      `SELECT c.*, cust.customer_name, cust.business_name, u.username
       FROM challans c
       JOIN customers cust ON c.customer_id = cust.id
       JOIN users u ON c.created_by = u.id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${challanIndex} OFFSET $${challanIndex + 1}`,
      [...params, limit, offset]
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

// Get challan by ID with items
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const challanResult = await query(
      `SELECT c.*, cust.customer_name, cust.business_name, cust.email, cust.mobile_number, u.username
       FROM challans c
       JOIN customers cust ON c.customer_id = cust.id
       JOIN users u ON c.created_by = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (challanResult.rows.length === 0) {
      throw new ApiError(404, 'Challan not found');
    }

    const itemsResult = await query(
      'SELECT * FROM challan_items WHERE challan_id = $1',
      [id]
    );

    res.json({
      challan: challanResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

// Create challan
router.post('/', roleMiddleware(['Sales', 'Admin']), async (req: Request, res: Response, next: NextFunction) => {
  const client = await getClient();

  try {
    const { error, value } = challanSchema.validate(req.body);
    if (error) {
      throw new ApiError(400, 'Validation error', error.details);
    }

    await client.query('BEGIN');

    // Verify customer exists
    const customerResult = await client.query('SELECT id FROM customers WHERE id = $1', [value.customer_id]);
    if (customerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      throw new ApiError(404, 'Customer not found');
    }

    const challanNumber = await generateChallanNumber();
    let totalQuantity = 0;

    // Validate all products exist and have sufficient stock if confirming
    const productIds = value.items.map((item: any) => item.product_id);
    const productsResult = await client.query(
      `SELECT * FROM products WHERE id = ANY($1)`,
      [productIds]
    );

    if (productsResult.rows.length !== value.items.length) {
      await client.query('ROLLBACK');
      throw new ApiError(400, 'One or more products not found');
    }

    // Check stock availability if confirming
    if (value.status === 'Confirmed') {
      for (const item of value.items) {
        const product = productsResult.rows.find((p: any) => p.id === item.product_id);
        if (product.current_stock < item.quantity) {
          await client.query('ROLLBACK');
          throw new ApiError(400, `Insufficient stock for product ${product.product_name}. Available: ${product.current_stock}, Requested: ${item.quantity}`);
        }
      }
    }

    // Create challan
    const challanResult = await client.query(
      `INSERT INTO challans (challan_number, customer_id, total_quantity, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [challanNumber, value.customer_id, 0, value.status, req.user?.id]
    );

    const challan = challanResult.rows[0];

    // Create challan items
    for (const item of value.items) {
      const product = productsResult.rows.find((p: any) => p.id === item.product_id);
      totalQuantity += item.quantity;

      await client.query(
        `INSERT INTO challan_items (challan_id, product_id, product_name, sku, unit_price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [challan.id, product.id, product.product_name, product.sku, product.unit_price, item.quantity]
      );

      // If confirmed, reduce stock and create stock movement log
      if (value.status === 'Confirmed') {
        await client.query(
          'UPDATE products SET current_stock = current_stock - $1 WHERE id = $2',
          [item.quantity, product.id]
        );

        await client.query(
          `INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by)
           VALUES ($1, $2, $3, $4, $5)`,
          [product.id, item.quantity, 'OUT', `Challan ${challanNumber}`, req.user?.id]
        );
      }
    }

    // Update total quantity
    await client.query(
      'UPDATE challans SET total_quantity = $1 WHERE id = $2',
      [totalQuantity, challan.id]
    );

    await client.query('COMMIT');

    const finalResult = await query(
      'SELECT * FROM challans WHERE id = $1',
      [challan.id]
    );

    res.status(201).json({
      challan: finalResult.rows[0],
      challan_number: challanNumber,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Confirm challan (Draft to Confirmed)
router.post('/:id/confirm', roleMiddleware(['Sales', 'Accounts']), async (req: Request, res: Response, next: NextFunction) => {
  const client = await getClient();

  try {
    const { id } = req.params;

    await client.query('BEGIN');

    const challanResult = await client.query(
      'SELECT * FROM challans WHERE id = $1',
      [id]
    );

    if (challanResult.rows.length === 0) {
      await client.query('ROLLBACK');
      throw new ApiError(404, 'Challan not found');
    }

    const challan = challanResult.rows[0];
    if (challan.status !== 'Draft') {
      await client.query('ROLLBACK');
      throw new ApiError(400, 'Only draft challans can be confirmed');
    }

    // Get challan items
    const itemsResult = await client.query(
      'SELECT * FROM challan_items WHERE challan_id = $1',
      [id]
    );

    // Check stock availability
    for (const item of itemsResult.rows) {
      const productResult = await client.query(
        'SELECT current_stock FROM products WHERE id = $1',
        [item.product_id]
      );

      if (productResult.rows[0].current_stock < item.quantity) {
        await client.query('ROLLBACK');
        throw new ApiError(400, `Insufficient stock for product ID ${item.product_id}`);
      }
    }

    // Reduce stock
    for (const item of itemsResult.rows) {
      await client.query(
        'UPDATE products SET current_stock = current_stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );

      await client.query(
        `INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [item.product_id, item.quantity, 'OUT', `Challan ${challan.challan_number}`, req.user?.id]
      );
    }

    // Update challan status
    await client.query(
      'UPDATE challans SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['Confirmed', id]
    );

    await client.query('COMMIT');

    const updatedChallan = await query(
      'SELECT * FROM challans WHERE id = $1',
      [id]
    );

    res.json(updatedChallan.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Cancel challan
router.post('/:id/cancel', roleMiddleware(['Sales', 'Admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM challans WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Challan not found');
    }

    const challan = result.rows[0];

    if (challan.status === 'Confirmed') {
      // Restore stock if cancelling a confirmed challan
      const itemsResult = await query(
        'SELECT * FROM challan_items WHERE challan_id = $1',
        [id]
      );

      for (const item of itemsResult.rows) {
        await query(
          'UPDATE products SET current_stock = current_stock + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );

        await query(
          `INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by)
           VALUES ($1, $2, $3, $4, $5)`,
          [item.product_id, item.quantity, 'IN', `Challan ${challan.challan_number} Cancelled`, req.user?.id]
        );
      }
    }

    const updateResult = await query(
      'UPDATE challans SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['Cancelled', id]
    );

    res.json(updateResult.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
