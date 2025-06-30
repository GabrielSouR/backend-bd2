import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Modelo } from "./modelo.entity";

@Entity()
export class Veiculo {
  @PrimaryColumn({ name: "codigove" })
  codigoVe!: number;

  @ManyToOne(() => Modelo, m => m.veiculos)
  @JoinColumn({ name: "codigomo" })      // FK no banco
  modelo!: Modelo;

  @Column({ name: "codigomo" })
  codigoMo!: number;

  @Column({ name: "combustivel", length: 50 })
  combustivel!: string;

  @Column({ name: "tipoveiculo" })
  tipoVeiculo!: number;

  @Column({ name: "preco", type: "decimal", precision: 10, scale: 2 })
  preco!: number;
}
