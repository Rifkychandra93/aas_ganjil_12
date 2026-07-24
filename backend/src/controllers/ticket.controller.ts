import { Request,Response } from "express";
import { createTicketService } from "@/services/ticket.service";

export const createTicket = async(
    req:Request,
    res:Response
):Promise<void>=>{

    const result = await createTicketService(req.body);

    res.status(result.statusCode).json(result);

}