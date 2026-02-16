import { CommentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createComment = async (payLoad: {
  content: string;
  authorId: string;
  postId: string;
  parentId?: string;
  status?: CommentStatus;
}) => {
  await prisma.post.findUniqueOrThrow({
    where: {
      id: payLoad.postId,
    },
  });

  if (payLoad.parentId) {
    await prisma.comment.findUniqueOrThrow({
      where: {
        id: payLoad.parentId,
      },
    });
  }

  return await prisma.comment.create({
    data: payLoad,
  });
};

const getCommnetById = async (commentId: string) => {
  return await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      replies: {
        include: {
          replies: {
            orderBy: {
              createdAt: "desc",
            },
          },

          _count: {
            select: {
              replies: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      },

      post: true,

      _count: {
        select: {
          replies: true,
        },
      },
    },
  });
};

const getCommentByAuthor = async (authorId: string) => {
  return await prisma.comment.findMany({
    where: {
      authorId: authorId,
    },
    include: {
      post: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const commentServices = {
  createComment,
  getCommnetById,
  getCommentByAuthor,
};
