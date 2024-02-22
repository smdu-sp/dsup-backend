import { Global, Injectable } from '@nestjs/common';
import OracleDB, { Connection } from 'oracledb';

@Global()
@Injectable()
export class OracleService {
    private oracledb = OracleDB;
    constructor() {
    }

    async connection() {
        const connect: Connection = await this.oracledb.getConnection({
            user          : process.env.ORACLEDB_USER,
            password      : process.env.ORACLEDB_PASSWORD,
            connectString : "cprodamibs6525.PRODAM:1521/ORA012"
        });
        console.log(connect);
        return connect;
    }

    async disconnect() {
        await (await this.connection()).close();
    }
}
