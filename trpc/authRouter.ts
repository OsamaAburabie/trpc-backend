import { createUserSchema, loginUserSchema } from "../Schemas/user.schema";
import { createUser, signTokens } from "../services/user.service";
import { publicProcedure, router } from "../utils/trpc";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { ErrorMessages } from "../enums/errors";
import prisma from "../config/prisma";

export const authRouter = router({
  register: publicProcedure.input(createUserSchema).mutation(async ({ input }) => {
    try {
      const hashedPassword = await bcrypt.hash(input.password, 12);
      const user = await createUser({
        email: input.email.toLowerCase(),
        name: input.name,
        password: hashedPassword,
        provider: "local",
      });

      const accessToken = await signTokens(user);

      return {
        data: {
          user,
          accessToken,
        },
      };
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          throw new TRPCError({
            code: "CONFLICT",
            message: ErrorMessages.email_already_exists,
          });
        }
      }
      throw err;
    }
  }),
  login: publicProcedure.input(loginUserSchema).mutation(async ({ input }) => {
    const user = await prisma.user.findFirst({
      where: {
        email: input.email.toLowerCase(),
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: ErrorMessages.wrong_email_or_password,
      });
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: ErrorMessages.wrong_email_or_password,
      });
    }

    const accessToken = await signTokens(user);

    return {
      data: {
        user,
        accessToken,
      },
    };
  }),
});
