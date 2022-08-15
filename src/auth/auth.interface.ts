export interface IGetRefreshTokenIsValid {
    refreshToken: string;
    userId: string;
}

export interface IRefreshPayload {
    id: string;
}

export interface IAccessPayload {
    id: string;
}

export interface IGetAccessTokenResponse {
    accessToken: string;
}

export interface IGetRefreshTokenAndIsNewUserByLogin {
    email: string;
    username: string;
    department: string;
    grade: number;
    class: number;
    accountType: number;
    roleFlag: 0;
}

export interface IGetRefreshTokenAndIsNewUserByLoginResponse {
    refreshToken: string;
    isNewUser: boolean;
}

export interface IUpdateUserRefreshToken {
    userId: string;
    refreshToken: string;
}
