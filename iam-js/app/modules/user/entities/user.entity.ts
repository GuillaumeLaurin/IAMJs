import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '@user/entities/role.entity';

@Entity()
export class User {
  /**
   * This decorator will help to auto generated id for the table
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 30 })
  firstName!: string;

  @Column({ type: 'varchar', length: 30 })
  lastName!: string;

  // Unique
  @Column({ type: 'varchar', length: 40 })
  email!: string;

  @Column({ type: 'int' })
  age!: number;

  @Column({ type: 'varchar' })
  password!: string;

  @Column({ type: 'enum', enum: ['m', 'f', 'o'] })
  /**
   * m - male
   * f - female
   * o - other
   */
  gender!: string;

  @Column({ type: 'int', default: 0 })
  tokenVersion!: number;

  @ManyToMany(() => Role, { eager: true })
  @JoinTable()
  roles!: Role[];

  @Column({ nullable: true })
  provider?: string;

  @Column({ nullable: true, unique: true })
  providerId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
