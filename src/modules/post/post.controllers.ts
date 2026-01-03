import { Request, Response } from "express";

const createPost = async (req: Request, res: Response) => {
  console.log(req.body);

  res.send(req.body);
};

export const postControllers = {
  createPost,
};
