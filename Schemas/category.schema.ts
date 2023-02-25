import { number, object, string } from "zod";

export const createCategorySchema = object({
  name: string({ required_error: "Name is required" }),
  parentId: number().optional(),
});

export const deleteCategorySchema = object({
  id: number({ required_error: "Id is required" }),
});

export const createProductSchema = object({
  name: string({ required_error: "Name is required" }),
  categoryId: number({ required_error: "Category Id is required" }),
  price: number({ required_error: "Price is required" }),
  description: string().optional(),
});

export const findProductsSchema = object({
  categoryId: number({ required_error: "Category Id is required" }),
  limit: number().min(1).max(100).nullish(),
  cursor: number().nullish(),
});

export const deleteProductSchema = object({
  id: number({ required_error: "Id is required" }),
});

export const createProductLikeSchema = object({
  productId: number({ required_error: "Post ID is required" }),
});
