import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../shared/access/user.dao";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AccessStrategy } from "./strategies/access.strategy";
import { GoogleStrategy } from "./strategies/google.stratgy";
import { RefreshStrategy } from "./strategies/refresh.strategy";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>("ACCESS_TOKEN_SECRET"),
                signOptions: {
                    expiresIn: configService.get<string>(
                        "ACCESS_TOKEN_EXPIRES_IN",
                    ),
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtService,
        GoogleStrategy,
        AccessStrategy,
        RefreshStrategy,
    ],
})
export class AuthModule {}
