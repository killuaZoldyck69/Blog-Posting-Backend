import express, { Application } from "express";
import { postRouter } from "./modules/post/post.routes";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app: Application = express();
app.use(express.json());

app.all("/api/auth/*splat", toNodeHandler(auth));

app.get("/", (req, res) => {
  res.send("Hello World!!!");
});

app.use("/posts", postRouter);

export default app;
