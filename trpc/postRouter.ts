import { createPostSchema, getUserPostsSchema, createLikeSchema } from "../Schemas/post.schema";
import { createPost, findUserPosts, createLike, deleteLike } from "../services/post.service";
import { privateProcedure, router } from "../utils/trpc";

export const postRouter = router({
  createPost: privateProcedure.input(createPostSchema).mutation(async ({ input, ctx }) => {
    return await createPost({
      input: {
        authorId: ctx.user.id,
        title: input.title,
        content: input.content,
      },
    });
  }),
  findMyPosts: privateProcedure.input(getUserPostsSchema).query(async ({ input, ctx }) => {
    const limit = input.limit ?? 10;
    const { cursor } = input;

    const res = await findUserPosts({
      input: {
        where: {
          authorId: ctx.user!.id,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          id: "asc",
        },
      },
    });

    let nextCursor: typeof cursor | undefined = undefined;

    if (res.length > limit) {
      const nextItem = res.pop();
      nextCursor = nextItem?.id;
    }

    const posts = res.map(post => ({
      ...post,
      liked: post.likes.some(like => like.userId === ctx.user?.id),
    }));

    return {
      posts,
      nextCursor,
    };
  }),
  likePost: privateProcedure.input(createLikeSchema).mutation(async ({ input, ctx }) => {
    try {
      const like = await createLike({
        input: {
          postId: input.postId,
          userId: ctx.user.id,
        },
      });

      return {
        like,
      };
    } catch (err: any) {
      if (err?.code !== "P2002") {
        throw err;
      }
    }
  }),
  unlikePost: privateProcedure.input(createLikeSchema).mutation(async ({ input, ctx }) => {
    try {
      await deleteLike({
        input: {
          postId_userId: {
            postId: input.postId,
            userId: ctx.user.id,
          },
        },
      });

      return {
        success: true,
      };
    } catch (err: any) {
      if (err?.code !== "P2025") {
        throw err;
      }
    }
  }),
});
