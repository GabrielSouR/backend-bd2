import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Modelo } from "./modelo.entity";

@Entity()
export class Marca {
  @PrimaryColumn()
  codigoMa!: number;

  @Column({ length: 100 })
  nome!: string;

  @OneToMany(() => Modelo, modelo => modelo.marca)
  modelos!: Modelo[];
}
