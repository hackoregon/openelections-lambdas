import { ConnectionOptions } from 'typeorm';
import { ExternalContribution } from './entity/ExternalContribution';

const ORMConfig: ConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    ExternalContribution,
  ],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: false,
  cli: {
    entitiesDir: 'models/entity',
  },
};
export default ORMConfig;
