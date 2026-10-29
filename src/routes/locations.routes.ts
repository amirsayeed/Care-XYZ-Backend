import { Router } from "express";
import { getLocations, getDistrictsByDivision } from "../controllers/locations.controller";

const router = Router();

router.get("/", getLocations);
router.get("/:division/districts", getDistrictsByDivision);

export default router;