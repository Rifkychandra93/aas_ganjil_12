import { Request, Response } from "express";
import { getSystemLogsService } from "@/services/log.service";

export const getSystemLogs = async (_req: Request, res: Response): Promise<void> => {
  const result = await getSystemLogsService();
  res.status(result.statusCode).json(result);
};
