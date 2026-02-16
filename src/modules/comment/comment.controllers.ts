import { Request, Response } from "express";
import { commentServices } from "./comment.services";

const getCommentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await commentServices.getCommnetById(id as string);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Successfully retrive comment by id",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in getCommentById: ", error);

    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to get comment by id",
      errorDetails: error.message || "Internal Server Error",
    });
  }
};

const createComment = async (req: Request, res: Response) => {
  try {
    const user = req?.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized. Please log in.",
      });
    }

    const authorId = user?.id;
    const { content, postId, parentId, status } = req.body;

    const result = await commentServices.createComment({
      content,
      authorId,
      postId,
      parentId,
      status,
    });

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Comment created successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in createCommnet: ", error);

    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to create comment",
      errorDetails: error.message || "Internal Server Error",
    });
  }
};

export const commentControllers = {
  createComment,
  getCommentById,
};
