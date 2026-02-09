import { Post, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getAllPost = async (searchTerm?: string, tags?: string[]) => {
  const andConditions: Prisma.PostWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: searchTerm as string,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: searchTerm as string,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: searchTerm as string,
          },
        },
      ],
    });
  }

  if (tags && tags.length > 0) {
    andConditions.push({
      tags: {
        hasEvery: tags,
      },
    });
  }

  const allPost = await prisma.post.findMany({
    where: {
      AND: andConditions,
    },
    orderBy: {
      createdAt: "desc",
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
