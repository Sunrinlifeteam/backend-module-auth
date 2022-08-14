import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";
import { config as envConfig } from "dotenv";
import { IRefreshPayload } from "../auth.interface";

envConfig();

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, "refresh") {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                request => request?.cookies?.Refresh,
            ]),
            secretOrKey: configService.get<string>("REFRESH_TOKEN_SECRET"),
            passReqToCallback: true,
        });
    }

    async validate(req: any, { id }: IRefreshPayload) {
        const refreshToken: string = req.cookies?.Refresh;
        return await this.authService.getRefreshTokenIsValid({
            userId: id,
            refreshToken,
        });
    }
}
