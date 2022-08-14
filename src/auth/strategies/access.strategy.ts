import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { config as envConfig } from "dotenv";
import { IAccessPayload } from "../auth.interface";
import { AuthService } from "../auth.service";
import { UserEntity } from "../../shared/access/user.dao";
import { ConfigService } from "@nestjs/config";

envConfig();

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, "access") {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>("ACCESS_TOKEN_SECRET"),
        });
    }

    async validate({ id }: IAccessPayload): Promise<UserEntity> {
        return await this.authService._findUserById(id);
    }
}
