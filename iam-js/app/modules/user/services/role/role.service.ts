import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '@user/entities/role.entity';
import { Repository, In } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({ relations: ['permissions'] });
  }

  async findOne(name: string): Promise<Role | null> {
    const role = await this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });

    return role ? role : null;
  }

  async findMany(names: string[]): Promise<Role[]> {
    const roles = await this.roleRepository.find({
      where: { name: In(names) },
      relations: ['permissions'],
    });

    return roles;
  }
}
