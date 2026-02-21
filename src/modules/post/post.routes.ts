import { Router } from "express";
import { postControllers } from "./post.controllers";
import { auth, UserRole } from "../../middleware/auth";

const router = Router();

router.get("/", postControllers.getAllPost);

router.get("/stats", auth(UserRole.ADMIN), postControllers.getStats);

router.get(
  "/my-posts",
  auth(UserRole.ADMIN, UserRole.USER),
  postControllers.getMyPosts,
);

router.get("/:id", postControllers.getPostById);

router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN),
  postControllers.createPost,
);

router.patch(
  "/:postId",
  auth(UserRole.USER, UserRole.ADMIN),
  postControllers.updatePost,
);

router.delete(
  "/:postId",
  auth(UserRole.ADMIN, UserRole.USER),
  postControllers.deletePost,
);

export const postRouter: Router = router;
