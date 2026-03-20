import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Role } from '@user/entities/role.entity';
import type { Session } from '@app/modules/auth/entities/session.entity';

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

  @ManyToMany(() => Role, { eager: true })
  @JoinTable()
  roles!: Role[];

  @OneToMany('Session', 'user')
  sessions!: Session[];
}
