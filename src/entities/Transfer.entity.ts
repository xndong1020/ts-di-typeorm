import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User.entity";

@Entity({ name: "transfers" })
export class Transfer {
  @PrimaryColumn({ name: "transfer_id", type: String })
  transferId: number;

  @Column({ name: "user_id", type: String })
  userId: string;

  @Column({ name: "dof_type", type: String })
  dofType: string;

  @ManyToOne(() => User, (user) => user.transfers)
  @JoinColumn({ name: "user_id" })
  user: User;
}
