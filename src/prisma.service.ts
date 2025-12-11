import { Injectable } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
// import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor(private readonly config: ConfigService) {
        const adapter = new PrismaPg({
            connectionString: String(config.get('DATABASE_URL')),
        });
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
