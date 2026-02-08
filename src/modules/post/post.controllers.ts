import { Request, Response } from "express";
import { postServices } from "./post.services";
import { error } from "node:console";

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
};
