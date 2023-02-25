import express from "express";
import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import * as trpcExpress from "@trpc/server/adapters/express";
import { expressHandler } from "trpc-playground/handlers/express";
import { appRouter } from "./trpc/router";
import { createContext } from "./utils/trpc";
import prisma from "./config/prisma";
import axios from "axios";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

// init express server
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json()); // for parsing application/json
app.use(morgan("dev")); // for pretty logging

// ROUTES
app.get("/", (req, res) => {
  res.send("hello, world!");
});

// initialize trpc on express server with playground
const TRPC_ENDPOINT = "/trpc";
const TRPC_PLAYGROUND_ENDPOINT = "/trpc-playground";
app.use(
  TRPC_ENDPOINT,
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error }) => {
      // // check if error is a prisma error
      // if (error.cause instanceof Prisma.PrismaClientKnownRequestError) {
      //   // if so, return a TRPC error
      //   if (error.cause.code === "P2002") {
      //     throw new TRPCError({
      //       message: "User already exists",
      //       code: "CONFLICT",
      //     });
      //   }
      // }
    },
  })
);
expressHandler({
  trpcApiEndpoint: TRPC_ENDPOINT,
  playgroundEndpoint: TRPC_PLAYGROUND_ENDPOINT,
  router: appRouter,
  // uncomment this if you're using superjson
  // request: {
  //   superjson: true,
  // },
}).then((handeler: any) => {
  app.use(handeler);
});

// start the express server
app.listen(port, () => {
  console.log(`[server]: Server is running at PORT ${port} at ${`http://localhost:${port}`}`);
});
