import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Marca } from "./marca.entity";
import { Veiculo } from "./veiculo.entity";
import { Ano } from "./ano.entity";

@Entity()
export class Modelo {
  @PrimaryColumn()
  codigoMo!: number;

  @ManyToOne(() => Marca, marca => marca.modelos)
  @JoinColumn({ name: "modeloMa" })
  marca!: Marca;

  @Column()
  modeloMa!: number;

  @Column({ length: 150 })
  nome!: string;

  @Column({ length: 20 })
  codigo_fipe!: string;

  @OneToMany(() => Veiculo, veiculo => veiculo.modelo)
  veiculos!: Veiculo[];

  @OneToMany(() => Ano, ano => ano.modelo)
  anos!: Ano[];
}
