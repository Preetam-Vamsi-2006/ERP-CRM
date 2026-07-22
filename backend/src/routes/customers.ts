import { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { query } from '../db/connection';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();
router.use(authMiddleware);

const customerSchema = Joi.object({
  customer_name: Joi.string().required(),
  mobile_number: Joi.string(),
  email: Joi.string().email(),
  business_name: Joi.string(),
  gst_number: Joi.string(),
  customer_type: Joi.string().valid('Retail', 'Wholesale', 'Distributor'),
  address: Joi.string(),
  status: Joi.string().valid('Lead', 'Active', 'Inactive'),
  follow_up_date: Joi.date(),
  notes: Joi.string(),
});

// Get all customers with pagination and search
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const offset = (page - 1) * limit;
    const search = (req.query.search as string) || '';

    let whereClause = '';
    const params: any[] = [limit, offset];

    if (search) {
      whereClause = 'WHERE customer_name ILIKE $3 OR email ILIKE $3 OR mobile_number ILIKE $3';
      params.push(`%${search}%`);
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM customers ${whereClause}`,
      params.slice(2)
    );

    const result = await query(
      `SELECT id, customer_name, mobile_number, email, business_name, customer_type, 
              status, follow_up_date, notes, created_at 
       FROM customers ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
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

// Get customer by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM customers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Customer not found');
    }

    const customer = result.rows[0];

    const notesResult = await query(
      'SELECT id, note, created_by, created_at FROM follow_up_notes WHERE customer_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({
      customer,
      follow_up_notes: notesResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

// Create customer
router.post('/', roleMiddleware(['Admin', 'Sales']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = customerSchema.validate(req.body);
    if (error) {
      throw new ApiError(400, 'Validation error', error.details);
    }

    const result = await query(
      `INSERT INTO customers 
       (customer_name, mobile_number, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [
        value.customer_name,
        value.mobile_number,
        value.email,
        value.business_name,
        value.gst_number,
        value.customer_type,
        value.address,
        value.status,
        value.follow_up_date,
        value.notes,
        req.user?.id,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update customer
router.put('/:id', roleMiddleware(['Admin', 'Sales']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = customerSchema.validate(req.body, { allowUnknown: true });
    if (error) {
      throw new ApiError(400, 'Validation error', error.details);
    }

    const { id } = req.params;

    // Check if customer exists
    const existsResult = await query('SELECT id FROM customers WHERE id = $1', [id]);
    if (existsResult.rows.length === 0) {
      throw new ApiError(404, 'Customer not found');
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
      `UPDATE customers SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Add follow-up note
router.post('/:id/follow-up', roleMiddleware(['Admin', 'Sales']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || typeof note !== 'string') {
      throw new ApiError(400, 'Note is required');
    }

    const customerResult = await query('SELECT id FROM customers WHERE id = $1', [id]);
    if (customerResult.rows.length === 0) {
      throw new ApiError(404, 'Customer not found');
    }

    const result = await query(
      'INSERT INTO follow_up_notes (customer_id, note, created_by) VALUES ($1, $2, $3) RETURNING *',
      [id, note, req.user?.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
