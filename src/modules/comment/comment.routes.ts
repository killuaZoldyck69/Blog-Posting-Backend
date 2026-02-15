import { Router } from "express";
import { commentControllers } from "./comment.controllers";
import { auth, UserRole } from "../../middleware/auth";

const router = Router();

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.USER),
  commentControllers.createComment,
);

export const commentRouter: Router = router;
