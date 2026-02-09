import { Request, Response } from "express";
import { postServices } from "./post.services";

const getAllPost = async (req: Request, res: Response) => {
  try {
    const result = await postServices.getAllPost();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Posts retrieved successfully",
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
