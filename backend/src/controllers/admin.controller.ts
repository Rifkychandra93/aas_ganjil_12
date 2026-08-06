import { Response } from "express";
import { dashboardService } from "@/services/admin.service";

export const dashboard = async (
  req: any,
  res: Response
) => {

  const result = await dashboardService();

  res.status(result.statusCode).json(result);

};