import 'reflect-metadata';
import {
  createConnection, Connection, getConnection, getConnectionManager,
} from 'typeorm';
import ORMConfig from './ormConfig';
import { reportError } from '@services/bugSnag';

export default async (): Promise<Connection> => {
  try {
    const connectionManager = getConnectionManager();
    if (connectionManager.has('default')) {
      return await connectionManager.get('default');
    }
    const connection: Connection = await createConnection(ORMConfig);
    return connection;
  } catch (error) {
    reportError(error);
    return getConnection('default');
  }
};
