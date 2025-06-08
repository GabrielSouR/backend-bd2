import { AppDataSource } from "../data-source";
import { SelectQueryBuilder } from "typeorm";

type TableName = 'marca' | 'modelo' | 'veiculo' | 'ano';

interface QueryInput {
    data: {
        from_principal: TableName;
        marca?: string[];
        modelo?: string[];
        veiculo?: string[];
        ano?: string[];
        conditions?: Record<string, [string, string?, string?]>;
        order?: {
            field: string;
            direction: string;
        }
    };
}

export class ReportService {
    private qb!: SelectQueryBuilder<any>;

    async buildReport(input: QueryInput) {
        const { data } = input;
        const fromTable = data.from_principal;

        this.qb = AppDataSource.createQueryBuilder(fromTable, fromTable);

        this.addJoins(fromTable, data);
        this.addSelects(data);
        this.addConditions(data.conditions || {});
        this.addOrder(data.order);

        return await this.qb.getRawMany();
    }

    private addJoins(fromTable: TableName, data: any) {
        if (fromTable === 'marca') {
            if (data.modelo) {
                this.qb.leftJoin("modelo", "modelo", "marca.codigoMa = modelo.modeloMa");
                if (data.veiculo) {
                    this.qb.leftJoin("veiculo", "veiculo", "modelo.codigoMo = veiculo.codigoMo");
                }
                if (data.ano) {
                    this.qb.leftJoin("ano", "ano", "modelo.codigoMo = ano.codigoMo");
                }
            }
        }

        if (fromTable === 'modelo') {
            if (data.marca) {
                this.qb.leftJoin("marca", "marca", "modelo.modeloMa = marca.codigoMa");
            }
            if (data.veiculo) {
                this.qb.leftJoin("veiculo", "veiculo", "modelo.codigoMo = veiculo.codigoMo");
            }
            if (data.ano) {
                this.qb.leftJoin("ano", "ano", "modelo.codigoMo = ano.codigoMo");
            }
        }

        if (fromTable === 'veiculo') {
            if (data.modelo) {
                this.qb.leftJoin("modelo", "modelo", "veiculo.codigoMo = modelo.codigoMo");
                if (data.marca) {
                    this.qb.leftJoin("marca", "marca", "modelo.modeloMa = marca.codigoMa");
                }
                if (data.ano) {
                    this.qb.leftJoin("ano", "ano", "modelo.codigoMo = ano.codigoMo");
                }
            }
        }

        if (fromTable === 'ano') {
            if (data.modelo) {
                this.qb.leftJoin("modelo", "modelo", "ano.codigoMo = modelo.codigoMo");
                if (data.marca) {
                    this.qb.leftJoin("marca", "marca", "modelo.modeloMa = marca.codigoMa");
                }
                if (data.veiculo) {
                    this.qb.leftJoin("veiculo", "veiculo", "modelo.codigoMo = veiculo.codigoMo");
                }
            }
        }
    }

    private addSelects(data: any) {
        for (const table of ['marca', 'modelo', 'veiculo', 'ano']) {
            if (data[table]) {
                data[table].forEach((field: string) => {
                    this.qb.addSelect(`${table}.${field}`, `${table}_${field}`);
                });
            }
        }
    }

    private addConditions(conditions: Record<string, [string, string?, string?]>) {
        for (const [field, [operator, value1, value2]] of Object.entries(conditions)) {
            if (operator.toLowerCase() === 'between' && value1 && value2) {
                this.qb.andWhere(`${field} BETWEEN :v1 AND :v2`, { v1: value1, v2: value2 });
            } else if (operator && value1) {
                this.qb.andWhere(`${field} ${operator} :v`, { v: value1 });
            }
        }
    }

    private addOrder(order: { field: string; direction: string } | undefined) {
        if (order) {
            const { field, direction } = order;
            this.qb.orderBy(field, (direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'));
        }
    }
}
