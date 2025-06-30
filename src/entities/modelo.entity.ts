import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Marca } from "./marca.entity";
import { Veiculo } from "./veiculo.entity";
import { Ano } from "./ano.entity";

@Entity()
export class Modelo {
  @PrimaryColumn({ name: "codigomo" })
  codigoMo!: number;

  @ManyToOne(() => Marca, m => m.modelos)
  @JoinColumn({ name: "modeloma" })
  marca!: Marca;

  @Column({ name: "modeloma" })
  modeloMa!: number;

  @Column({ name: "nome", length: 150 })
  nome!: string;

  @OneToMany(() => Veiculo, v => v.modelo)
  veiculos!: Veiculo[];

  @OneToMany(() => Ano, a => a.modelo)
  anos!: Ano[];
}
