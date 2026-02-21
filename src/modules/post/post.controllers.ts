import { Request, Response } from "express";
import { postServices } from "./post.services";
import { PostStatus } from "../../../generated/prisma/enums";
import calculatePagination from "../../helpers/paginationHelper";
import { UserRole } from "../../middleware/auth";

const getAllPost = async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.searchTerm as string | undefined;

    const tags = (req.query.tags as string | undefined)?.split(",");

    const isFeaturedParam = req.query.isFeatured as string | undefined;
    let isFeatured: boolean | undefined;
    if (isFeaturedParam === "true") isFeatured = true;
    else if (isFeaturedParam === "false") isFeatured = false;
    else isFeatured = undefined;

    const status = req.query.status as PostStatus | undefined;

    const authorId = req.query.authorId as string | undefined;

    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(
      req.query,
    );

    const result = await postServices.getAllPost(
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
      searchTerm,
      tags,
      isFeatured,
      status,
      authorId,
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Posts retrieved successfully",
      meta: {
        page: page,
        limit: limit,
        totalData: result.pagination,
        totalPages: Math.ceil(result.pagination / limit),
      },
      data: result.allPost,
    });
  } catch (error: any) {
    console.error("Error in getAllPost: ", error);

    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Something went wrong while fetching posts",
      errorDetails: error.message || "Internal Server Error",
    });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new Error("No Id");
    }

    const result = await postServices.getPostById(id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Posts retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in getPostById: ", error);

    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Something went wrong while fetching posts",
      errorDetails: error.message || "Internal Server Error",
    });
  }
};

const createPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized",
      });
    }
    console.log(user);

    const result = await postServices.createPost(req.body, user.id);
    res.status(201).json({
      message: "Post Created Successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).send({
      error: "Post Creation Failed",
      details: error,
    });
  }
};

const getMyPosts = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user || !user.id) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Unauthorized. Please Log in.",
    });
  }

  try {
    const result = await postServices.getMyPosts(user.id);

    res.status(200).json({
      success: true,
      stautsCode: 200,
      message: "Your posts retrived successuflly",
      data: result,
      meta: {
        totalData: result.length,
      },
    });
  } catch (error: any) {
    console.log("Error in getMyPost");

    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to retrived my posts",
      errorDetails: error.message || "Internal Server Error",
    });
  }
};

const updatePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const user = req.user;
  const data = req.body;

  if (!user) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Unauthorized. Please log in.",
    });
  }

  const isAdmin = user.role === UserRole.ADMIN;

  try {
    const result = await postServices.updatePost(
      postId as string,
      user.id,
      data,
      isAdmin,
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Post updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.log("Error in updatePost");

    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to update post",
      errorDetails: error.message || "Internal Server Error",
    });
  }
};

const deletePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Unauthorized. Please log in.",
    });
  }

  const isAdmin = user.role === UserRole.ADMIN;

  try {
    const result = await postServices.deletePost(
      postId as string,
      user.id,
      isAdmin,
    );

    res.status(200).json({
      success: true,
      statusCode: 204,
      message: "Post deleted successfully",
    });
  } catch (error: any) {
    console.log("Error in deletePost");

    if (error.message === "Post not found") {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Post not found",
      });
    }

    if (error.message === "You are not authorized for delete this post") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "You are not authorized to delete this post",
      });
    }

    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to delete post",
      errorDetails: error.message || "Internal Server Error",
    });
  }
};
export const postControllers = {
  createPost,
  getAllPost,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
};
