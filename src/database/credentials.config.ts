import { testDatabaseConfig } from "./db_testing.config";
import { developmentDatabaseConfig } from "./db_development.config";
import { productionDatabaseConfig } from "./db_production.config";


let credentials;
if(process.env.NODE_ENV === 'development'){

  credentials = developmentDatabaseConfig;

}else if(process.env.NODE_ENV === 'production'){

  credentials = productionDatabaseConfig;
}else{

  credentials = testDatabaseConfig;
}

console.log("Using NODE_ENV:", process.env.NODE_ENV);
 
console.log("Database Config:", credentials);
export let result = credentials;



