import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import type { User } from '@app/modules/user/entities/user.entity';

@Entity()
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne('User', 'sessions')
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column('date')
  loginAt!: Date;

  @Column('date', { nullable: true })
  logoutAt!: Date | null;
}
