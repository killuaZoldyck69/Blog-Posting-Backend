import { Router } from "express";
import { commentControllers } from "./comment.controllers";
import { auth, UserRole } from "../../middleware/auth";

const router = Router();

router.get("/:id", commentControllers.getCommentById);

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.USER),
  commentControllers.createComment,
);

export const commentRouter: Router = router;
