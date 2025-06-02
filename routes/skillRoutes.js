import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { addSkill, deleteSkill, getAllSkill, updateSkill } from "../controller/skillController.js";

const router = express.Router();

router.post("/add",isAuthenticated,addSkill);
router.delete("/delete/:id",isAuthenticated,deleteSkill);
router.put("/update/:id",isAuthenticated,updateSkill);
router.get("/getAll",getAllSkill);

export default router;