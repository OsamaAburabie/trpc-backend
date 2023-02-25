import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";

export const createCategory = ({ input }: { input: Prisma.CategoryUncheckedCreateInput }) => {
  return prisma?.category.create({
    data: input,
  });
};

export const findCategories = ({ input }: { input: Prisma.CategoryFindManyArgs }) => {
  return prisma?.category.findMany({
    ...input,
  });
};

export const deleteCategory = ({ input }: { input: Prisma.CategoryWhereUniqueInput }) => {
  return prisma?.category.delete({
    where: input,
  });
};

export const createProduct = ({ input }: { input: Prisma.ProductUncheckedCreateInput }) => {
  return prisma?.product.create({
    data: input,
  });
};

export const findProducts = ({ input }: { input: Prisma.ProductFindManyArgs }) => {
  return prisma?.product.findMany({
    ...input,
    include: {
      likes: true,
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });
};

export const deleteProduct = ({ input }: { input: Prisma.ProductWhereUniqueInput }) => {
  return prisma?.product.delete({
    where: input,
  });
};

export const createProductLike = ({ input }: { input: Prisma.ProductLikeUncheckedCreateInput }) => {
  return prisma?.productLike.create({
    data: input,
  });
};

export const deleteProductLike = ({ input }: { input: Prisma.ProductLikeWhereUniqueInput }) => {
  return prisma?.productLike.delete({
    where: input,
  });
};
