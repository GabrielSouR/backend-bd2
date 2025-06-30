import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Modelo } from "./modelo.entity";

@Entity()
export class Ano {
  @PrimaryColumn({ name: "codigoan" })
  codigoAn!: number;

  @PrimaryColumn({ name: "codigomo" })
  codigoMo!: number;

  @PrimaryColumn({ name: "periodo" })
  periodo!: number;

  @ManyToOne(() => Modelo, m => m.anos)
  @JoinColumn({ name: "codigomo" })
  modelo!: Modelo;
}
