import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { addProject, deleteProject, getAllProject, updateProject,getProject} from "../controller/projectController.js";

const router = express.Router();

router.post("/add",isAuthenticated,addProject);
router.delete("/delete/:id",isAuthenticated,deleteProject);
router.put("/update/:id",isAuthenticated,updateProject);
router.get("/getAll",getAllProject);
router.get("/get/:id",getProject);

export default router;