import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Modelo } from "./modelo.entity";

@Entity()
export class Ano {
  @PrimaryColumn()
  codigoAn!: number;

  @PrimaryColumn()
  codigoMo!: number;

  @PrimaryColumn()
  periodo!: number;

  @ManyToOne(() => Modelo, modelo => modelo.anos)
  @JoinColumn({ name: "codigoMo" })
  modelo!: Modelo;
}
