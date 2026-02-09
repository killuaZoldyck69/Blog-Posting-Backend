import { Post } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getAllPost = async (searchTerm?: string) => {
  const allPost = await prisma.post.findMany({
    where: {
      title: {
        contains: searchTerm as string,
        mode: "insensitive",
      },
    },
  });
  return allPost;
};

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  userId: string,
) => {
  const result = await prisma.post.create({
    data: { ...data, authorId: userId },
  });

  return result;
};

export const postServices = { createPost, getAllPost };
