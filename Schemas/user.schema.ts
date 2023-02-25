import { object, string, TypeOf, number, z } from "zod";

export const createUserSchema = object({
  name: string({ required_error: "Name is required" }),
  email: string({ required_error: "Email is required" }).email("Invalid email"),
  password: string({ required_error: "Password is required" })
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});

export const loginUserSchema = object({
  email: string({ required_error: "Email is required" }).email("Invalid email or password"),
  password: string({ required_error: "Password is required" }).min(8, "Invalid email or password"),
});

export const getUserSchema = object({
  id: number(),
});

export const getAllUsersSchema = object({
  limit: number().min(1).max(100).nullish(),
  cursor: number().nullish(),
});

export const updateUserSchema = object({
  id: number(),
  email: string().email("Email must be a valid email address"),
  password: string().min(3, "Password must be at least 3 characters long"),
});
