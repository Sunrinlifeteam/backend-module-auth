import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database.module";

@Module({
    imports: [
        DatabaseModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [`.env`],
        }),
        AuthModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}
