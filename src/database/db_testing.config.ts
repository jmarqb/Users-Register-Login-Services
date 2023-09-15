import { User } from "../users/entities/user.entity";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export const testDatabaseConfig:PostgresConnectionOptions  = {
    type: 'postgres',
    host: process.env.DATABASE_HOST_TEST_E2E,
    port: +process.env.DATABASE_PORT_TEST_E2E,
    database: process.env.DATABASE_NAME_TEST_E2E,
    username: process.env.DATABASE_USERNAME_TEST_E2E,
    password: process.env.DATABASE_PASSWORD_TEST_E2E,
    synchronize: true,  
    entities: [User],
  };