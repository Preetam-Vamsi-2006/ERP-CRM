import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: any[]
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message,
      errors: err.errors,
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
  });
}
