import { ReportService } from "./report.service";
// @ts-ignore
import { Parser } from "json2csv";
import { csvFieldAliases } from "../utils/csv-alias-map";

export class ExportService {
  private reportService = new ReportService();

  async exportReportAsCSV(input: any): Promise<string> {
    const data = await this.reportService.buildReport(input);

    const firstRow = data[0];
    const fields = firstRow
      ? Object.keys(firstRow).map((key) => ({
          label: csvFieldAliases[key] || key,
          value: key
        }))
      : [];

    const parser = new Parser({ fields, delimiter: ";" });
    const csv = parser.parse(data);

    return csv;
  }
}
