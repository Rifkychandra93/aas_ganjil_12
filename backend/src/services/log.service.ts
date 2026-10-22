import prisma from "@/config/prisma";

export interface LogPayload {
  userId?: string;
  userEmail: string;
  role: string;
  action: string;
  details?: string;
}

export const createSystemLog = async (payload: LogPayload) => {
  try {
    let validUserId: string | null = null;
    if (payload.userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true },
      });
      if (userExists) {
        validUserId = userExists.id;
      }
    }

    return await prisma.systemLog.create({
      data: {
        userId: validUserId,
        userEmail: payload.userEmail,
        role: payload.role,
        action: payload.action,
        details: payload.details,
      },
    });
  } catch (error) {
    console.error("Gagal mencatat log sistem:", error);
    return null;
  }
};

export const getSystemLogsService = async () => {
  const logs = await prisma.systemLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  const formattedLogs = logs.map((log) => ({
    id: log.id,
    user: log.userEmail,
    role: log.role,
    action: log.action,
    details: log.details,
    time: log.createdAt.toISOString().replace("T", " ").substring(0, 19),
    createdAt: log.createdAt,
  }));

  return {
    statusCode: 200,
    success: true,
    data: formattedLogs,
  };
};
