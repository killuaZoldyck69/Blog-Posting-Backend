import { error } from "node:console";
import {
  CommentStatus,
  Post,
  PostStatus,
  Prisma,
} from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middleware/auth";

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
    include: {
      comments: {
        where: {
          parentId: null,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          replies: {
            orderBy: {
              createdAt: "desc",
            },
            include: {
              replies: {
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
          },

          _count: {
            select: {
              replies: true,
            },
          },
        },
      },

      _count: {
        select: {
          comments: true,
        },
      },
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
      include: {
        comments: {
          where: {
            parentId: null,
          },
          include: {
            replies: {
              include: {
                replies: {
                  orderBy: {
                    createdAt: "desc",
                  },
                },
              },

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

        _count: {
          select: {
            comments: true,
          },
        },
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

const getMyPosts = async (userId: string) => {
  const result = await prisma.post.findMany({
    where: {
      authorId: userId,
    },
    include: {
      _count: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return result;
};

const updatePost = async (
  postId: string,
  userId: string,
  data: Partial<Post>,
  isAdmin: boolean,
) => {
  const existingPost = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!existingPost) {
    throw new Error("Post not found ");
  }

  const isAuthor = existingPost.authorId === userId;

  if (!isAdmin && !isAuthor) {
    throw new Error("Unauthorized to update this post");
  }

  delete data.id;
  delete data.authorId;

  if (!isAdmin) {
    delete data.isFeatured;
  }

  const result = await prisma.post.update({
    where: {
      id: postId,
    },
    data,
  });

  return result;
};

const deletePost = async (postId: string, userId: string, isAdmin: boolean) => {
  const existingPost = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!existingPost) {
    throw new Error("Post not found");
  }

  const isAuthor = existingPost.authorId === userId;

  if (!isAdmin && !isAuthor) {
    throw new Error("You are not authorized for delete this post");
  }

  return await prisma.post.delete({
    where: {
      id: postId,
    },
  });
};

const getStats = async () => {
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    archivedPosts,
    totalViews,
    totalComments,
    approvedComments,
    allUsers,
    totalAdmin,
    totalUsers,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: PostStatus.PUBLISHED } }),
    prisma.post.count({ where: { status: PostStatus.DRAFT } }),
    prisma.post.count({ where: { status: PostStatus.ARCHIVED } }),
    prisma.post.aggregate({
      _sum: {
        views: true,
      },
    }),
    prisma.comment.count(),
    prisma.comment.count({ where: { status: CommentStatus.APPROVED } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: UserRole.ADMIN } }),
    prisma.user.count({ where: { role: UserRole.USER } }),
  ]);

  return {
    posts: {
      total: totalPosts,
      published: publishedPosts,
      drafts: draftPosts,
      archived: archivedPosts,
      totalViews: totalViews._sum.views || 0, // Fallback to 0 if database is empty
    },
    comments: {
      total: totalComments,
      approved: approvedComments,
      pendingOrRejected: totalComments - approvedComments,
    },
    users: {
      total: allUsers,
      admin: totalAdmin,
      user: totalUsers,
    },
  };
};
export const postServices = {
  createPost,
  getAllPost,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
  getStats,
};
