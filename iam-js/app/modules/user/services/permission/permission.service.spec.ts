import { TestingModule, Test } from "@nestjs/testing";
import { SinonStub, stub } from "sinon";
import { PermissionService } from "./permission.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Permission } from "@user/entities/permission.entity";

const PERMISSION_1 = 'perm-1';

const PERMISSIONS = [
    {
        id: 1,
        name: PERMISSION_1,
        description: '...'
    },
    {
        id: 2,
        name: 'perm-2',
        description: '...'
    },
    {
        id: 3,
        name: 'perm-3',
        description: '...'
    },
] as unknown as Permission[];

describe('PermissionService', () => {
    let service: PermissionService;
    let permissionRepository: {
        find: SinonStub,
        findOneBy: SinonStub,
    };

    beforeEach(async () => {
        permissionRepository = { find: stub(), findOneBy: stub() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PermissionService,
                {
                    provide: getRepositoryToken(Permission),
                    useValue: permissionRepository,
                }
            ]
        }).compile();

        service = module.get<PermissionService>(PermissionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should returned every permissions found in db', async () => {
        permissionRepository.find.returns(PERMISSIONS);
        const result = await service.findAll();
        expect(permissionRepository.find.calledOnce).toBeTruthy();
        expect(result.length).toEqual(PERMISSIONS.length);
    });

    it('should returned the permission that has the same name', async () => {
        permissionRepository.findOneBy.returns(PERMISSIONS[0]);
        const result = await service.findOne(PERMISSION_1);
        expect(permissionRepository.findOneBy.calledOnceWith({ name: PERMISSION_1 })).toBeTruthy();
        expect(result).toEqual(PERMISSIONS[0]);
    });

    it('should returned null if not found', async () => {
        permissionRepository.findOneBy.returns(null);
        const result = await service.findOne(PERMISSION_1);
        expect(permissionRepository.findOneBy.calledOnceWith({ name: PERMISSION_1 })).toBeTruthy();
        expect(result).toBeNull();
    });
});