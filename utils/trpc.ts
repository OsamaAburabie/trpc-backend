import { initTRPC, inferAsyncReturnType, TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { ZodError } from "zod";
import { ErrorMessages } from "../enums/errors";
import { verifyJwt } from "./jwt";
import prisma from "../config/prisma";

export const createContext = async ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
  return {
    req,
    res,
    prisma,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

const isAuthenticated = t.middleware(async ({ next, ctx }) => {
  const { prisma, req } = ctx;
  try {
    let access_token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      access_token = req.headers.authorization.split(" ")[1];
    }

    if (!access_token) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: ErrorMessages.you_must_be_logged_in,
      });
    }

    const decoded = verifyJwt(access_token) as { id: number };

    if (!decoded) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: ErrorMessages.you_must_be_logged_in,
      });
    }

    const user = await prisma?.user?.findFirst({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: ErrorMessages.you_must_be_logged_in,
      });
    }

    return next({
      ctx: {
        ...ctx,
        user,
      },
    });
  } catch (err: any) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: err.message,
    });
  }
});
export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuthenticated);
