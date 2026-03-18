import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '@user/entities/role.entity';

@Entity()
export class User {
    /**
     * This decorator will help to auto generated id for the table
     */
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 30 })
    name: string;

    @Column({ type: 'varchar', length: 15 })
    username: string;

    @Column({ type: 'varchar', length: 40 })
    email: string;

    @Column({ type: 'int' })
    age: number;

    @Column({ type: 'varchar' })
    password: string;

    @Column({ type: 'enum', enum: ['m', 'f', 'o'] })
    /**
     * m - male
     * f - female
     * o - other
     */
    gender: string;

    @ManyToMany(() => Role, { eager: true })
    @JoinTable()
    roles: Role[];
}