import { Test, TestingModule } from "@nestjs/testing";
import { UserMiddleware } from "./user.middleware";
import { SinonStubbedInstance, createStubInstance } from "sinon";
import { UserService } from "@user/services/user/user.service";
import { ROLES } from "@user/services/role/role.service.spec";

const USER_ID = '1';

const USER = {
    id: USER_ID,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    roles: [ROLES[0]],
};

const mockNext = () => {
    let called = false;
    const fn = () => { called = true; };
    fn.wasCalled = () => called;
    return fn;
};

const mockRequest = (payload?: { sub: string }): Request => ({
    tokenPayload: payload ?? null,
} as unknown as Request);

describe('UserMiddleware', () => {
    let middleware: UserMiddleware;
    let userService: SinonStubbedInstance<UserService>;

    beforeEach(async () => {
        userService = createStubInstance<UserService>(UserService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserMiddleware,
                {
                    provide: UserService,
                    useValue: userService,
                },
            ],
        }).compile();

        middleware = module.get<UserMiddleware>(UserMiddleware);
    });

    it('should be defined', () => {
        expect(middleware).toBeDefined();
    });

    it('should call next and skip user lookup if no payload is present', async () => {
        const req = mockRequest();
        const next = mockNext();

        await middleware.use(req, {} as Response, next);

        expect(userService.findOne.called).toBeFalsy();
        expect(next.wasCalled()).toBe(true);
    });

    it('should attach the user to the request if payload is present', async () => {
        const req = mockRequest({ sub: USER_ID });
        const next = mockNext();
        userService.findOne.resolves(USER as any);

        await middleware.use(req, {} as Response, next);

        expect(userService.findOne.calledOnceWith(USER_ID)).toBeTruthy();
        expect(req['user']).toEqual(USER);
    });

    it('should call next after attaching the user', async () => {
        const req = mockRequest({ sub: USER_ID });
        const next = mockNext();
        userService.findOne.resolves(USER as any);

        await middleware.use(req, {} as Response, next);

        expect(next.wasCalled()).toBe(true);
    });

    it('should propagate the exception if userService.findOne throws', async () => {
        const req = mockRequest({ sub: USER_ID });
        const next = mockNext();
        userService.findOne.rejects(new Error('User not found'));

        await expect(middleware.use(req, {} as Response, next)).rejects.toThrow('User not found');
        expect(next.wasCalled()).toBe(false);
    });
});