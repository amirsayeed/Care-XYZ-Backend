import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  contact: z.string().min(10, "Invalid contact"),
  nid: z.string().min(13, "Invalid NID"),
  password: z
    .string()
    .min(6, "Min 6 characters")
    .regex(/[A-Z]/, "Need 1 uppercase")
    .regex(/[a-z]/, "Need 1 lowercase"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export const bookingSchema = z.object({
  serviceId: z.string().min(1, "Service required"),
  duration: z.number().min(1, "Min 1 day"),
  division: z.string().min(1, "Division required"),
  district: z.string().min(1, "District required"),
  city: z.string().min(1, "City required"),
  area: z.string().min(1, "Area required"),
  address: z.string().min(5, "Address required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;