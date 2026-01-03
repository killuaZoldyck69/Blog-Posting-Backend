import { Request, Response } from "express";
import { postServices } from "./post.services";

const createPost = async (req: Request, res: Response) => {
  try {
    const result = await postServices.createPost(req.body);
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
};
