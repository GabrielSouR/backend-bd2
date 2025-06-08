import { Router } from "express";
import { ReportController } from "../controllers/report.controller";

const router = Router();
const reportController = new ReportController();

router.post("/report", (req, res) => reportController.generateReport(req, res));
router.post("/report/export", (req, res) => reportController.exportReport(req, res));

export default router;
