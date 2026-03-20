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
    dto.email = dto.email.trim();
    dto.email = dto.email.toLowerCase();

    if (await this.findByEmail(dto.email)) {
      throw new ConflictException('The email is already taken by another user');
    }

    const hashed = await argon.hash(dto.password);

    const defaults = await this.roleService.findMany([
      ERole.Auditor,
      ERole.Viewer,
      ERole.Editor,
    ]);

    if (!defaults.length) {
      throw new InternalServerErrorException('Default role not found');
    }

    const user = this.userRepository.create({
      firstName: this.trimAndcapitalizeFirstLetter(dto.firstName),
      lastName: this.trimAndcapitalizeFirstLetter(dto.lastName),
      email: dto.email,
      age: dto.age,
      gender: dto.gender,
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

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (dto.password) dto.password = await argon.hash(dto.password);
    if (dto.email) {
      dto.email = dto.email.toLocaleLowerCase();

      if (await this.findByEmail(dto.email)) {
        throw new ConflictException(
          'The email is already taken by another user',
        );
      }
    }
    if (dto.firstName)
      dto.firstName = this.trimAndcapitalizeFirstLetter(dto.firstName);
    if (dto.lastName)
      dto.lastName = this.trimAndcapitalizeFirstLetter(dto.lastName);
    Object.assign(user, dto);
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

  private trimAndcapitalizeFirstLetter(str: string): string {
    str = str.trim();

    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
