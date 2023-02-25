import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";

export const createPost = ({ input }: { input: Prisma.PostUncheckedCreateInput }) => {
  return prisma?.post.create({
    data: input,
  });
};

export const findUserPosts = ({ input }: { input: Prisma.PostFindManyArgs }) => {
  return prisma?.post.findMany({
    ...input,
    include: {
      likes: true,
      _count: {
        select: {
          likes: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const createLike = ({ input }: { input: Prisma.LikeUncheckedCreateInput }) => {
  return prisma?.like.create({
    data: input,
  });
};

export const deleteLike = ({ input }: { input: Prisma.LikeWhereUniqueInput }) => {
  return prisma?.like.delete({
    where: input,
  });
};
