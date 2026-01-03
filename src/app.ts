import express, { Application } from "express";
import { postRouter } from "./modules/post/post.routes";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
const app: Application = express();

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:4000/",
    credentials: true,

    // // 3. methods: Standard REST methods
    // methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],

    // // 4. allowedHeaders: Headers Better Auth needs
    // allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.use(express.json());

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.get("/", (req, res) => {
  res.send("Hello World!!!");
});

app.use("/posts", postRouter);

export default app;
