import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { buildTypeOrmOptions } from './src/config/database.config';

export default new DataSource(buildTypeOrmOptions() as DataSourceOptions);
