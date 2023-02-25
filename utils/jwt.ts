import jwt from "jsonwebtoken";

export const signJwt = (payload: Object) => {
  return jwt.sign(payload, "secret");
};

export const verifyJwt = <T>(token: string): T | null => {
  try {
    return jwt.verify(token, "secret") as T;
  } catch (error) {
    console.log(error);
    return null;
  }
};
