import { Request, Response } from "express";
import { commentServices } from "./comment.services";

const getCommentById = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    const result = await commentServices.getCommnetById(commentId as string);

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

const getCommentByAuthor = async (req: Request, res: Response) => {
  try {
    const { authorId } = req.params;

    const result = await commentServices.getCommentByAuthor(authorId as string);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Successfully retrive comment by author id",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in getCommentByAuthor: ", error);

    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to get comment by author id",
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

const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const user = req?.user;

    const result = await commentServices.deleteComment(
      commentId as string,
      user?.id as string,
    );

    res.status(204).json({
      success: true,
      statusCode: 204,
      message: "Successfully comment deleted",
    });
  } catch (error: any) {
    console.error("Error in deleteComment: ", error);

    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to delete comment",
      errorDetails: error.message || "Internal Server Error",
    });
  }
};

const updateComment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { commentId } = req.params;
    const data = req.body;

    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const result = await commentServices.updateComment(
      commentId as string,
      data,
      user?.id as string,
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Comment updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in updateComment: ", error);

    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to update comment",
      errorDetails: error.message || "Internal Server Error",
    });
  }
};

const updateCommentStatus = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const { status: newStatus } = req.body;

  try {
    if (!newStatus) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Status is required",
      });
    }

    const result = await commentServices.updateCommentStatus(
      commentId as string,
      newStatus,
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Comment status updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.log("Error in updateCommentStatus");

    if (error.message === "Status is already the same") {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: `Comment is already marked as ${newStatus}`,
      });
    }

    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to update comment status",
      errorDetails: error.message || "Internal Server Error",
    });
  }
};

export const commentControllers = {
  createComment,
  getCommentById,
  getCommentByAuthor,
  deleteComment,
  updateComment,
  updateCommentStatus,
};
