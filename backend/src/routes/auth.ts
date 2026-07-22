import { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { query } from '../db/connection';
import { generateToken, hashPassword, comparePasswords } from '../utils/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw new ApiError(400, 'Validation error', error.details);
    }

    const result = await query(
      'SELECT id, username, password, role FROM users WHERE username = $1 AND is_active = true',
      [value.username]
    );

    if (result.rows.length === 0) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const user = result.rows[0];
    
    // Simple password check for demo
    const passwordMatch = value.password === user.password || 
                         await comparePasswords(value.password, user.password).catch(() => false);

    if (!passwordMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
