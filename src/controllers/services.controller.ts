import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { getDB } from "../config/database";
import { successResponse, errorResponse } from "../utils/response";
import { ObjectId } from "mongodb";

export async function getAllServices(req: AuthRequest, res: Response) {
  try {
    const db = await getDB();
    const servicesCollection = db.collection("services");

    const services = await servicesCollection.find({}).toArray();

    return successResponse(res, services, "Services fetched");
  } catch (error) {
    return errorResponse(res, "Failed to fetch services", 500, error);
  }
}

export async function getServiceById(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
  
      if (!ObjectId.isValid(id)) {
        return errorResponse(res, "Invalid service ID", 400);
      }
  
      const db = await getDB();
      const servicesCollection = db.collection("services");
  
      const service = await servicesCollection.findOne({
        _id: new ObjectId(id),
      });
  
      if (!service) {
        return errorResponse(res, "Service not found", 404);
      }
  
      return successResponse(res, service);
    } catch (error) {
      return errorResponse(res, "Failed to fetch service", 500, error);
    }
  }