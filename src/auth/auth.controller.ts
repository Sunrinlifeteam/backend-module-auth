import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { AuthService } from "./auth.service";
import { GoogleGuard, RefreshGuard } from "./guards";
import { IGetAccessTokenResponse } from "./auth.interface";
import {
    REFRESH_TOKEN_COOKIE_KEY,
    REFRESH_TOKEN_COOKIE_OPTION,
} from "../shared/constants";
import { Response } from "express";

@Controller()
export class AuthController {
    private readonly FRONTEND_URL: string;

    constructor(private readonly authService: AuthService) {}

    @Get()
    public hello(): string {
        return "Hello, Auth Module!";
    }

    @GrpcMethod("auth", "getAccessToken")
    @UseGuards(RefreshGuard)
    public async getAccessToken(
        @Req() req: any,
    ): Promise<IGetAccessTokenResponse> {
        const accessToken = await this.authService.createAccessTokenByUserId(
            req.user.id,
        );
        return { accessToken };
    }

    @GrpcMethod("auth", "googleLogin")
    @UseGuards(GoogleGuard)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public async googleLogin() {}

    @GrpcMethod("auth", "googleRedirect")
    @UseGuards(GoogleGuard)
    public async googleRedirect(@Req() req: any, @Res() res: Response) {
        const { refreshToken, isNewUser } =
            await this.authService.getRefreshTokenAndIsNewUserByLogin(req.user);
        res.cookie(
            REFRESH_TOKEN_COOKIE_KEY,
            refreshToken,
            REFRESH_TOKEN_COOKIE_OPTION,
        );
        return res.redirect(
            this.FRONTEND_URL +
                (isNewUser ? "/register" : "/login/token") +
                `?refresh=${refreshToken}`,
        );
    }
}
