import { Injectable } from '@nestjs/common';
import OracleDB, { Connection } from 'oracledb';

@Injectable()
export class OracleService {
    constructor(
        private oracledb: any
    ) {
        this.oracledb = OracleDB;
    }

    async connection(): Promise<Connection> {
        const connect: Connection = await this.oracledb.getConnection({
            user          : process.env.ORACLEDB_USER,
            password      : process.env.ORACLEDB_PASSWORD,
            connectString : "cprodamibs6525.PRODAM:1521/ORA012"
        });
        console.log(connect);
        return connect;
    }

    async disconnect() {
        this.oracledb.close();
    }
}
