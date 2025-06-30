import { AppDataSource } from "../data-source";
import { SelectQueryBuilder } from "typeorm";

// Tabelas permitidas
export type TableName = 'marca' | 'modelo' | 'veiculo' | 'ano';

// Condições com operador + até 2 valores (ex: BETWEEN, =, LIKE)
export type ConditionOperator = [string, string?, string?];

// Campos selecionados por tabela (dinâmico)
export type SelectableFields = Partial<Record<TableName, string[]>>;

// Interface principal da entrada do relatório
export interface QueryInput {
  data: {
    from_principal: TableName;
    marca?: string[];
    modelo?: string[];
    veiculo?: string[];
    ano?: string[];
    conditions?: Record<string, ConditionOperator>;
    order?: {
      field: string;
      direction: 'ASC' | 'DESC' | string;
    };
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
        
        const [sql, parameters] = this.qb.getQueryAndParameters();

        console.log('\n===== SQL Gerada =====');
        console.log(sql);
        console.log('\n===== Parâmetros =====');
        console.log(parameters);
        console.log('======================\n');

        return await this.qb.getRawMany();
    }

    private addJoins(fromTable: TableName, data: any) {
        // Tabelas já com JOIN para evitar repetição
        const includedTables = new Set<string>([fromTable]);

        // Fila de tabelas a processar começando com a principal
        const queue = [fromTable];

        while (queue.length > 0) {
            // Pega a tabela atual da fila
            const current = queue.shift()!;

            // Recupera os dados do TypeORM sobre essa tabela
            const currentMeta = AppDataSource.getMetadata(current);

            // Para cada relacionamento (relations = joins declarados nas entities)
            for (const relation of currentMeta.relations) {
                // Pega o nome da tabela que tem relação com a tabela atual da fila
                const relatedTable = relation.inverseEntityMetadata.tableName;

                // Verifico se o usuário solicitou alguma tabela que tem relacionamento com a anterior e se ela ainda não foi colocada no JOIN
                if (data[relatedTable] && !includedTables.has(relatedTable)) {
                    this.qb.leftJoin(
                        relatedTable,
                        relatedTable,
                        this.generateJoinCondition(current, relatedTable, relation) // Monto a condição do JOIN
                    );

                    // Coloco a tabela como verificada
                    includedTables.add(relatedTable);

                    // Adiciona essa nova tabela na fila para buscar os relacionamentos dela também se o usuário pediu
                    queue.push(relatedTable as TableName);
                }
            }
        }
    }

    private generateJoinCondition(
        currentTable: string,
        relatedTable: string,
        relation: any
        ): string {
        const currentAlias = currentTable;
        const relatedAlias = relatedTable;

        // Se a tabela atual tem a FK (ManyToOne), use ela como base (modelo -> veiculo por exemplo)
        const hasJoinColumns = relation.joinColumns?.length > 0;

        if (hasJoinColumns) {
            const currentColumn = relation.joinColumns[0].databaseName;
            const relatedColumn = relation.inverseEntityMetadata.primaryColumns[0].databaseName;

            return `${currentAlias}.${currentColumn} = ${relatedAlias}.${relatedColumn}`;
        } else {
            // Caso contrário, a FK está no lado inverso (OneToMany), então invertemos a lógica
            const relatedColumn = relation.inverseRelation.joinColumns?.[0]?.databaseName;
            const currentColumn = relation.entityMetadata.primaryColumns[0].databaseName;

            if (!currentColumn || !relatedColumn) {
            throw new Error(`Não foi possível determinar colunas para join entre ${currentTable} e ${relatedTable}`);
            }

            return `${relatedAlias}.${relatedColumn} = ${currentAlias}.${currentColumn}`;
        }
    }


    private addSelects(data: Partial<Record<TableName, string[]>>) {
        // Itera sobre cada tabela presente no JSON
        Object.entries(data).forEach(([table, fields]) => {
            // Garante que os campos existem e são um array
            if (!fields || !Array.isArray(fields)) return;

            // Para cada campo solicitado, adiciona no SELECT com alias
            fields.forEach((field) => {
                this.qb.addSelect(`${table}.${field}`, `${table}_${field}`);
            });
        });
    }

    private addConditions(conditions: Record<string, [string, string?, string?]>) {
        for (const [field, [operator, value1, value2]] of Object.entries(conditions)) {
            const op = operator?.toLowerCase();

            const paramName = field.replace('.', '_');

            if (op === 'between' && value1 && value2) {
            const v1 = isNaN(Number(value1)) ? value1 : Number(value1);
            const v2 = isNaN(Number(value2)) ? value2 : Number(value2);
            this.qb.andWhere(`${field} BETWEEN :${paramName}_from AND :${paramName}_to`, {
                [`${paramName}_from`]: v1,
                [`${paramName}_to`]: v2,
            });
            } else if (op && value1) {
            const v = isNaN(Number(value1)) ? value1 : Number(value1);
            this.qb.andWhere(`${field} ${op} :${paramName}`, {
                [paramName]: v,
            });
            }
        }
    }


    private addOrder(order?: { field: string; direction: string }) {
        // Se nenhum campo foi enviado para ordenação, não faz nada
        if (!order?.field) return;

        // Normaliza o valor para 'ASC' ou 'DESC'
        const dir = order.direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        // Aplica a ordenação
        this.qb.orderBy(order.field, dir);
    }
}
