import { Request, Response } from "express";
import { ReportService } from "../services/report.service";
import { ExportService } from "../services/export.service";

export class ReportController {
    private reportService = new ReportService();
    private exportService = new ExportService();

    async generateReport(req: Request, res: Response) {
        try {
            const result = await this.reportService.buildReport(req.body);
            res.json(result);
        } catch (error) {
            console.error("Erro ao gerar relatório:", error);
            res.status(500).json({ message: "Erro ao gerar relatório." });
        }
    }

    async exportReport(req: Request, res: Response) {
        try {
            const csv = await this.exportService.exportReportAsCSV(req.body);
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="relatorio.csv"');
            res.send('\uFEFF' + csv);
        } catch (error) {
            console.error("Erro ao exportar relatório:", error);
            res.status(500).json({ message: "Erro ao exportar relatório." });
        }
    }
}
