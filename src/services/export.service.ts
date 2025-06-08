import { ReportService } from "./report.service";
// @ts-ignore
import { Parser } from "json2csv";

export class ExportService {
    private reportService = new ReportService();

    async exportReportAsCSV(input: any): Promise<string> {
        const data = await this.reportService.buildReport(input);

        const parser = new Parser();
        const csv = parser.parse(data);

        return csv;
    }
}
