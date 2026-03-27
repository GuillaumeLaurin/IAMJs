import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '@user/dto/create-user.dto';
import * as argon from 'argon2';
import { RoleService } from '@user/services/role/role.service';
import { Role as ERole } from '@user/enums/role.enum';
import { UpdateUserDto } from '@user/dto/update-user.dto';
import { Role } from '@user/entities/role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private roleService: RoleService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const reassignedDto = dto;
    reassignedDto.email = reassignedDto.email.trim();
    reassignedDto.email = reassignedDto.email.toLowerCase();

    if (await this.findByEmail(reassignedDto.email)) {
      throw new ConflictException('The email is already taken by another user');
    }

    const hashed = await argon.hash(reassignedDto.password);

    const defaults = await this.roleService.findMany([ERole.Auditor, ERole.Viewer, ERole.Editor]);

    if (!defaults.length) {
      throw new InternalServerErrorException('Default role not found');
    }

    const user = this.userRepository.create({
      firstName: this.trimAndcapitalizeFirstLetter(reassignedDto.firstName),
      lastName: this.trimAndcapitalizeFirstLetter(reassignedDto.lastName),
      email: reassignedDto.email,
      age: reassignedDto.age,
      gender: reassignedDto.gender,
      password: hashed,
      roles: defaults,
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) throw new NotFoundException(`User #${id} not found`);

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const reassignedDto = dto;
    const user = await this.findOne(id);
    if (reassignedDto.password) reassignedDto.password = await argon.hash(reassignedDto.password);
    if (reassignedDto.email) {
      reassignedDto.email = reassignedDto.email.toLocaleLowerCase();

      if (await this.findByEmail(reassignedDto.email)) {
        throw new ConflictException('The email is already taken by another user');
      }
    }
    if (reassignedDto.firstName)
      reassignedDto.firstName = this.trimAndcapitalizeFirstLetter(reassignedDto.firstName);
    if (reassignedDto.lastName)
      reassignedDto.lastName = this.trimAndcapitalizeFirstLetter(reassignedDto.lastName);
    Object.assign(user, reassignedDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async assignRole(userId: string, role: Role): Promise<User> {
    const user = await this.findOne(userId);
    const alreadyHas = user.roles.some((r) => r.id === role.id);

    if (!alreadyHas) {
      user.roles.push(role);
      await this.userRepository.save(user);
    }

    return user;
  }

  async incremetTokenVersion(id: string): Promise<void> {
    await this.userRepository.increment({ id }, 'tokenVersion', 1);
  }

  private trimAndcapitalizeFirstLetter(str: string): string {
    const reassignedStr = str.trim();

    return reassignedStr.charAt(0).toUpperCase() + reassignedStr.slice(1);
  }
}
