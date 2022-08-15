import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { Transfer } from "./Transfer.entity";

@Entity()
export class User {
  @PrimaryColumn("text")
  uid: string;

  @Column({ name: "first_name", type: String, nullable: true })
  firstName?: string;

  @Column({ name: "last_name", type: String, nullable: true })
  lastName?: string;

  @Column({ type: String })
  email: string;

  @Column("timestamp with time zone", { name: "deleted_date" })
  deletedDate: Date;

  @OneToMany(() => Transfer, (transfer) => transfer.user)
  transfers: Transfer[];
}
