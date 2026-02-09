import { Request, Response } from "express";
import { postServices } from "./post.services";
import { PostStatus } from "../../../generated/prisma/enums";

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

    const result = await postServices.getAllPost(
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
        count: result.length,
      },
      data: result,
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

export const postControllers = {
  createPost,
  getAllPost,
};
