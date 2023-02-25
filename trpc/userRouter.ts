import { TRPCError } from "@trpc/server";
import prisma from "../config/prisma";
import { getAllUsersSchema, getUserSchema, updateUserSchema } from "../Schemas/user.schema";
import { privateProcedure, publicProcedure, router } from "../utils/trpc";

export const userRouter = router({
  getAllUsers: privateProcedure.input(getAllUsersSchema).query(async ({ input }) => {
    const limit = input.limit ?? 10;
    const { cursor } = input;
    const users = await prisma.user.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        id: "asc",
      },
    });

    let nextCursor: typeof cursor | undefined = undefined;
    if (users.length > limit) {
      const nextItem = users.pop();
      nextCursor = nextItem!.id;
    }

    return {
      users,
      nextCursor,
    };
  }),
  getUser: publicProcedure.input(getUserSchema).query(async ({ input }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: input.id,
      },
    });

    if (!user) {
      throw new TRPCError({
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    return user;
  }),
  updateUser: publicProcedure.input(updateUserSchema).mutation(async ({ input }) => {
    return await prisma.user.update({
      where: {
        id: input.id,
      },
      data: {
        email: input.email,
        password: input.password,
      },
    });
  }),
});
