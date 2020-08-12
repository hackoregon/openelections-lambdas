import { createConnection, Connection, getConnection, getConnectionManager } from 'typeorm';
import ORMConfig from './ormConfig';

export default async (): Promise<Connection> => {
  try {
    const connectionManager = getConnectionManager()
    if (connectionManager.has('default')) {
      return await connectionManager.get('default');
    } 
    const connection: Connection = await createConnection(ORMConfig);
    return connection;
  } catch (error) {
    console.log('error', error.message);
    console.log('Using existing default db connection.');
    return getConnection('default');
  }
};
