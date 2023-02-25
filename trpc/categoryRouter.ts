import { Category } from "@prisma/client";
import {
  createCategorySchema,
  createProductLikeSchema,
  createProductSchema,
  deleteCategorySchema,
  deleteProductSchema,
  findProductsSchema,
} from "../Schemas/category.schema";
import {
  createCategory,
  createProduct,
  createProductLike,
  deleteCategory,
  deleteProduct,
  deleteProductLike,
  findCategories,
  findProducts,
} from "../services/category.service";
import { privateProcedure, router } from "../utils/trpc";

interface WithSubCategory extends Category {
  subCategories?: WithSubCategory[];
}
export const CategoryRouter = router({
  createCategory: privateProcedure.input(createCategorySchema).mutation(async ({ input }) => {
    return await createCategory({
      input: {
        name: input.name,
        parentId: input.parentId,
      },
    });
  }),
  findCategories: privateProcedure.query(async () => {
    return await findCategories({
      input: {},
    });
  }),

  deleteCategory: privateProcedure.input(deleteCategorySchema).mutation(async ({ input }) => {
    return await deleteCategory({
      input: {
        id: input.id,
      },
    });
  }),
  getAllCategoriesWithSubCategories: privateProcedure.query(async () => {
    const categories = (await findCategories({
      input: {
        where: {
          parentId: null,
        },
      },
    })) as WithSubCategory[];

    // recursive function to get all subcategories
    const getSubCategories = async (category: WithSubCategory) => {
      const subCategories = (await findCategories({
        input: {
          where: {
            parentId: category.id,
          },
        },
      })) as WithSubCategory[];

      if (subCategories.length > 0) {
        category.subCategories = subCategories;
        for (const subCategory of subCategories) {
          await getSubCategories(subCategory);
        }
      }
    };

    for (const category of categories) {
      await getSubCategories(category);
    }

    return categories;
  }),
  createProduct: privateProcedure.input(createProductSchema).mutation(async ({ input }) => {
    return await createProduct({
      input: {
        name: input.name,
        price: input.price,
        description: input.description,
        categoryId: input.categoryId,
      },
    });
  }),
  removeProduct: privateProcedure.input(deleteProductSchema).mutation(async ({ input }) => {
    return await deleteProduct({
      input: {
        id: input.id,
      },
    });
  }),
  getProductsByCategory: privateProcedure
    .input(findProductsSchema)
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 10;
      const { cursor } = input;

      const res = await findProducts({
        input: {
          where: {
            categoryId: input.categoryId,
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

      const products = res.map(product => ({
        ...product,
        liked: product.likes.some(like => like.userId === ctx.user?.id),
      }));

      return {
        products,
        nextCursor,
      };
    }),
  likeProduct: privateProcedure.input(createProductLikeSchema).mutation(async ({ input, ctx }) => {
    try {
      return await createProductLike({
        input: {
          productId: input.productId,
          userId: ctx.user.id,
        },
      });
    } catch (err: any) {
      if (err?.code !== "P2002") {
        throw err;
      }
    }
  }),
  unlikeProduct: privateProcedure
    .input(createProductLikeSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await deleteProductLike({
          input: {
            productId_userId: {
              productId: input.productId,
              userId: ctx.user.id,
            },
          },
        });
      } catch (err: any) {
        if (err?.code !== "P2025") {
          throw err;
        }
      }
    }),
});
