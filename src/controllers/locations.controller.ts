import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { getDB } from "../config/database";
import { successResponse, errorResponse } from "../utils/response";

export async function getLocations(req: AuthRequest, res: Response) {
  try {
    const db = await getDB();
    const locationsCollection = db.collection("locations");

    const locations = await locationsCollection.findOne({});

    if (!locations) {
      return errorResponse(res, "Locations not found", 404);
    }

    return successResponse(res, locations, "Locations fetched");
  } catch (error) {
    return errorResponse(res, "Failed to fetch locations", 500, error);
  }
}

export async function getDistrictsByDivision(req: AuthRequest, res: Response) {
    try {
      const division = req.params.division as string;
  
      const db = await getDB();
      const locationsCollection = db.collection("locations");
  
      const locations = await locationsCollection.findOne({});
  
      if (!locations) {
        return errorResponse(res, "Locations not found", 404);
      }
  
      const divisionData = locations.divisions.find(
        (d: any) => d.name === division
      );
  
      if (!divisionData) {
        return errorResponse(res, "Division not found", 404);
      }
  
      return successResponse(res, divisionData.districts, "Districts fetched");
    } catch (error) {
      return errorResponse(res, "Failed to fetch districts", 500, error);
    }
  }