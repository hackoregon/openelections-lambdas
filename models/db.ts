import 'reflect-metadata';
import {
  createConnection, Connection, getConnection
} from 'typeorm';
import ORMConfig from './ormConfig';
import { reportError } from '@services/bugSnag';

export default async (): Promise<Connection> => {
  try {
    const connection: Connection = await createConnection(ORMConfig);
    return connection;
  } catch (error) {
    reportError(error);
    return getConnection('default');
  }
};
