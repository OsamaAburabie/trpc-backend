import { Prisma, User } from "@prisma/client";
import { signJwt } from "../utils/jwt";
import prisma from "../config/prisma";

export const createUser = async (input: Prisma.UserCreateInput) => {
  return await prisma.user.create({
    data: input,
  });
};

export const findUniqueUser = async (
  where: Prisma.UserWhereUniqueInput,
  select?: Prisma.UserSelect
) => {
  return await prisma.user.findUnique({
    where,
    select,
  });
};

export const updateUser = async (
  where: Partial<Prisma.UserWhereUniqueInput>,
  data: Prisma.UserUpdateInput,
  select?: Prisma.UserSelect
) => {
  return await prisma.user.update({ where, data, select });
};

export const signTokens = async (user: User) => {
  const access_token = signJwt({ id: user.id });

  return { access_token };
};
