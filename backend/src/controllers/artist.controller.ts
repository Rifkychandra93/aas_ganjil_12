import { Request, Response } from "express";
import {createArtistService, getAllArtistService, getArtistByIdService, updateArtistService, deleteArtistService,} from "@/services/artist.service";


export const createArtist = async (
  req: Request,
  res: Response
): Promise<void> => {

  const result = await createArtistService(req.body);

  res.status(result.statusCode).json(result);

};
export const getAllArtist = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const result = await getAllArtistService();
  
    res.status(result.statusCode).json(result);
  };
  
  export const getArtistById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const result = await getArtistByIdService(req.params.id);
  
    res.status(result.statusCode).json(result);
  };
  
  export const updateArtist = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const result = await updateArtistService(
      req.params.id,
      req.body
    );
  
    res.status(result.statusCode).json(result);
  };
  
  export const deleteArtist = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const result = await deleteArtistService(req.params.id);
  
    res.status(result.statusCode).json(result);
  };