import { Router } from "express";
import { postControllers } from "./post.controllers";

const router = Router();

router.post("/", postControllers.createPost);

export const postRouter: Router = router;
