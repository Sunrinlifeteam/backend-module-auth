import {
    Controller,
    Get,
    OnModuleInit,
    Req,
    Res,
    UseGuards,
} from "@nestjs/common";
import { Client, ClientGrpc, GrpcMethod } from "@nestjs/microservices";
import { AuthService } from "./auth.service";
import {
    REFRESH_TOKEN_COOKIE_KEY,
    REFRESH_TOKEN_COOKIE_OPTION,
} from "shared/lib/constants";
import { Response } from "express";
import { UserEntity } from "shared/lib/access/user.dao";
import { UserService } from "shared/lib/services/user.service";
import { grpcClientOptions as userGrpc } from "shared/lib/options/user.grpc";
import { Observable } from "rxjs";
import { User } from "shared/lib/transfer/user.dto";
import { BoolValue } from "google/protobuf/wrappers";
import {
    IAccessPayload,
    IGetAccessToken,
    IGetAccessTokenResponse,
    IGetRefreshTokenAndIsNewUserByLogin,
    IGetRefreshTokenAndIsNewUserByLoginResponse,
    IGetRefreshTokenIsValid,
} from "shared/lib/transfer/auth.dto";

@Controller()
export class AuthController implements OnModuleInit {
    private readonly FRONTEND_URL: string;
    @Client(userGrpc)
    private client: ClientGrpc;
    private userService: UserService;

    constructor(private readonly authService: AuthService) {}

    onModuleInit() {
        this.userService = this.client.getService<UserService>("UserService");
    }

    @GrpcMethod("AuthService", "getHello")
    public getHello(): string {
        return "Hello, Auth Module!";
    }

    @GrpcMethod("AuthService", "accessValidate")
    public accessValidate({ id }: IAccessPayload): Observable<User> {
        return this.userService.getUserById({ value: id });
    }

    @GrpcMethod("AuthService", "getRefreshTokenIsValid")
    public async getRefreshTokenIsValid({
        userId,
        refreshToken,
    }: IGetRefreshTokenIsValid): Promise<BoolValue> {
        return {
            value: await this.authService.getRefreshTokenIsValid({
                userId,
                refreshToken,
            }),
        };
    }

    @GrpcMethod("AuthService", "getRefreshTokenAndIsNewUserByLogin")
    public async getRefreshTokenAndIsNewUserByLogin(
        user: IGetRefreshTokenAndIsNewUserByLogin,
    ): Promise<IGetRefreshTokenAndIsNewUserByLoginResponse> {
        return await this.authService.getRefreshTokenAndIsNewUserByLogin(user);
    }

    @GrpcMethod("AuthService", "getAccessToken")
    public async getAccessToken(
        payload: IGetAccessToken,
    ): Promise<IGetAccessTokenResponse> {
        const accessToken = await this.authService.createAccessTokenByUserId(
            payload.userId,
        );
        return { accessToken };
    }

    @GrpcMethod("auth", "googleLogin")
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public async googleLogin() {}

    @GrpcMethod("auth", "googleRedirect")
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
