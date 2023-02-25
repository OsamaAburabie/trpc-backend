import { object, string, number, z } from "zod";

export const createPostSchema = object({
  title: string({ required_error: "Title is required" }),
  content: string({ required_error: "Content is required" }),
});

export const createLikeSchema = object({
  postId: number({ required_error: "Post ID is required" }),
});

export const getUserPostsSchema = object({
  limit: number().min(1).max(100).nullish(),
  cursor: number().nullish(),
});
