import "reflect-metadata";
import { DataSource } from "typeorm";
import { Marca } from "./entities/marca.entity";
import { Modelo } from "./entities/modelo.entity";
import { Veiculo } from "./entities/veiculo.entity";
import { Ano } from "./entities/ano.entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "",
  password: "",
  database: "",
  synchronize: true,
  logging: false,
  entities: [Marca, Modelo, Veiculo, Ano],
});
