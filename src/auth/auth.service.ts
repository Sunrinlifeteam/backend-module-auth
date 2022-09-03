import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { UserEntity } from "shared/lib/access/user.dao";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import {
    IGetRefreshTokenAndIsNewUserByLogin,
    IGetRefreshTokenAndIsNewUserByLoginResponse,
    IGetRefreshTokenIsValid,
    IUpdateUserRefreshToken,
} from "shared/lib/transfer/auth.dto";

@Injectable()
export class AuthService {
    private readonly ACCESS_TOKEN_SECRET: string;
    private readonly ACCESS_TOKEN_EXPIRES_IN: string;
    private readonly REFRESH_TOKEN_SECRET: string;
    private readonly REFRESH_TOKEN_EXPIRES_IN: string;

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @InjectRepository(UserEntity)
        private readonly usersRepository: Repository<UserEntity>,
    ) {
        this.ACCESS_TOKEN_SECRET = this.configService.get<string>(
            "ACCESS_TOKEN_SECRET",
        );
        this.ACCESS_TOKEN_EXPIRES_IN = this.configService.get<string>(
            "ACCESS_TOKEN_EXPIRES_IN",
        );
        this.REFRESH_TOKEN_SECRET = this.configService.get<string>(
            "REFRESH_TOKEN_SECRET",
        );
        this.REFRESH_TOKEN_EXPIRES_IN = this.configService.get<string>(
            "REFRESH_TOKEN_EXPIRES_IN",
        );
    }

    public async getRefreshTokenIsValid({
        userId,
        refreshToken,
    }: IGetRefreshTokenIsValid): Promise<boolean> {
        const user = await this.usersRepository.findOne({
            where: { id: userId, refreshToken },
        });
        return !!user;
    }

    public async createAccessTokenByUserId(userId: string): Promise<string> {
        return await this.jwtService.signAsync(
            { id: userId },
            {
                secret: this.ACCESS_TOKEN_SECRET,
                expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
            },
        );
    }

    private async createRefreshTokenByUserId(userId: string): Promise<string> {
        return await this.jwtService.signAsync(
            {
                id: userId,
            },
            {
                secret: this.REFRESH_TOKEN_SECRET,
                expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
            },
        );
    }

    public async getRefreshTokenAndIsNewUserByLogin(
        data: IGetRefreshTokenAndIsNewUserByLogin,
    ): Promise<IGetRefreshTokenAndIsNewUserByLoginResponse> {
        const { email } = data;
        let user = await this._findUserByEmail(email);
        const isNewUser = !user;
        if (isNewUser) {
            user = await this._createAndGetUser(data);
        }
        const refreshToken = await this.createRefreshTokenByUserId(user.id);
        await this.updateUserRefreshToken({ userId: user.id, refreshToken });
        return {
            refreshToken,
            isNewUser,
        };
    }

    private async updateUserRefreshToken({
        userId,
        refreshToken,
    }: IUpdateUserRefreshToken): Promise<void> {
        await this.usersRepository.update({ id: userId }, { refreshToken });
    }

    private async _createAndGetUser(
        user: IGetRefreshTokenAndIsNewUserByLogin,
    ): Promise<UserEntity> {
        const newUser = this.usersRepository.create(user);
        return await this.usersRepository.save(newUser);
    }

    public async _findUserById(id: string): Promise<UserEntity> {
        return await this.usersRepository.findOne({ where: { id } });
    }

    private async _findUserByEmail(email: string): Promise<UserEntity> {
        return await this.usersRepository.findOne({ where: { email } });
    }
}
