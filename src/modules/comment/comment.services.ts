import { CommentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createComment = async (payLoad: {
  content: string;
  authorId: string;
  postId: string;
  parentId?: string;
  status?: CommentStatus;
}) => {
  return await prisma.comment.create({
    data: payLoad,
  });
};

export const commentServices = {
  createComment,
};
