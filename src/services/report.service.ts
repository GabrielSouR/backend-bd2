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

    private generateJoinCondition(currentTable: string, relatedTable: string, relation: any): string {
        const currentAlias = currentTable;
        const relatedAlias = relatedTable;

        // Descubro qual é a coluna que conecta a tabela atual à relacionada
        const currentColumn = relation.joinColumns?.[0]?.databaseName;

        // Pega a coluna da tabela relacionada usada na relação
        // Primeiro tenta pela referência reversa, se não achar, usa a PK da relacionada
        const relatedColumn =
            relation.inverseRelation?.joinColumns?.[0]?.referencedColumn?.databaseName
            ?? relation.inverseEntityMetadata.primaryColumns[0].databaseName;

        // Monta a condição de join (ex: modelo.codigoMo = veiculo.codigoMo)
        return `${currentAlias}.${currentColumn} = ${relatedAlias}.${relatedColumn}`;
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
        // Itera sobre cada condição recebida no formato: campo: [operador, valor1, valor2?]
        for (const [field, [operator, value1, value2]] of Object.entries(conditions)) {
            const op = operator?.toLowerCase(); // Normaliza o operador

            // Caso o operador seja 'between' e ambos os valores estejam presentes
            if (op === 'between' && value1 && value2) {
                this.qb.andWhere(`${field} BETWEEN :v1 AND :v2`, { v1: value1, v2: value2 });
            }

            // Caso seja qualquer outro operador (ex: '=', '>', '<', 'LIKE', etc)
            else if (op && value1) {
                this.qb.andWhere(`${field} ${op} :v`, { v: value1 });
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
