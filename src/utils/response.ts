import { Response } from "express";

export function successResponse(
  res: Response,
  data: any,
  message: string = "Success",
  statusCode: number = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(
  res: Response,
  message: string = "Error",
  statusCode: number = 400,
  error?: any
) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error?.message || error,
  });
}