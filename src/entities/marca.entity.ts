import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Modelo } from "./modelo.entity";

@Entity()
export class Marca {
  @PrimaryColumn({ name: "codigoma" })
  codigoMa!: number;

  @Column({ name: "nome", length: 100 })
  nome!: string;

  @OneToMany(() => Modelo, m => m.marca)
  modelos!: Modelo[];
}
