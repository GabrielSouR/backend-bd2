import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Modelo } from "./modelo.entity";

@Entity()
export class Veiculo {
  @PrimaryColumn()
  codigoVe!: number;

  @ManyToOne(() => Modelo, modelo => modelo.veiculos)
  @JoinColumn({ name: "codigoMo" })
  modelo!: Modelo;

  @Column()
  codigoMo!: number;

  @Column({ length: 50 })
  combustível!: string;

  @Column()
  tipoVeiculo!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  preco!: number;
}
