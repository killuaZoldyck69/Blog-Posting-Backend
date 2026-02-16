import { Router } from "express";
import { commentControllers } from "./comment.controllers";
import { auth, UserRole } from "../../middleware/auth";

const router = Router();

router.get("/:commentId", commentControllers.getCommentById);

router.get("/author/:authorId", commentControllers.getCommentByAuthor);

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.USER),
  commentControllers.createComment,
);

router.delete(
  "/:commentId",
  auth(UserRole.USER, UserRole.ADMIN),
  commentControllers.deleteComment,
);

export const commentRouter: Router = router;
