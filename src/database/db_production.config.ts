import { User } from "../users/entities/user.entity";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";


export const productionDatabaseConfig: PostgresConnectionOptions = {
    type: 'postgres',
    host:     process.env.DB_HOST_PRODUCTION,
    port:     +process.env.DB_PORT_PRODUCTION,
    database: process.env.DB_NAME_PRODUCTION,
    username: process.env.DB_USERNAME_PRODUCTION,
    password: process.env.DB_PASSWORD_PRODUCTION,
    synchronize: false, 
    entities: [User],
    logging: false, 
    // ssl: {
    //   rejectUnauthorized: false,
    // },
  };
  
  