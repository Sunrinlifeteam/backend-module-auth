import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserEntity } from "../shared/access/user.dao";
import { Repository } from "typeorm";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("HelloController", () => {
    let authController: AuthController;

    const mockUserRepository: Partial<Repository<UserEntity>> = {
        update: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                AuthService,
                JwtService,
                ConfigService,
                {
                    provide: getRepositoryToken(UserEntity),
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        authController = app.get<AuthController>(AuthController);
    });

    describe("root", () => {
        it('should return "Hello, Auth Module!"', () => {
            expect(authController.hello()).toBe("Hello, Auth Module!");
        });
    });
});
