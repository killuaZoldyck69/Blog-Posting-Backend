import { Post, PostStatus, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getAllPost = async (
  page: number,
  limit: number,
  skip: number,
  sortBy: string,
  sortOrder: string,
  searchTerm?: string,
  tags?: string[],
  isFeatured?: boolean,
  status?: PostStatus,
  authorId?: string,
) => {
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

  if (isFeatured !== undefined) {
    andConditions.push({ isFeatured: isFeatured });
  }

  if (status) {
    andConditions.push({ status: status });
  }

  if (authorId) {
    andConditions.push({ authorId: authorId });
  }

  const allPost = await prisma.post.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const pagination = await prisma.post.count({
    where: {
      AND: andConditions,
    },
  });

  return { allPost, pagination };
};

const getPostById = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: id,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    const postData = await tx.post.findUnique({
      where: {
        id: id,
      },
    });
    return postData;
  });
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

export const postServices = { createPost, getAllPost, getPostById };
