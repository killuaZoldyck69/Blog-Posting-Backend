import { Router } from "express";
import { postControllers } from "./post.controllers";
import { auth, UserRole } from "../../middleware/auth";

const router = Router();

router.get("/", postControllers.getAllPost);

router.post("/", auth(UserRole.USER), postControllers.createPost);

export const postRouter: Router = router;
