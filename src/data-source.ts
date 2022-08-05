import { DataSource, DataSourceOptions } from 'typeorm'

export const AppDataSourceOptions: DataSourceOptions = {
	type: 'postgres',
	host: 'localhost',
	port: 5432,
	username: 'medium',
	password: 'medium',
	database: 'mediumdb',
	entities: [__dirname + '/**/*.entity.{ts,js}'],
	synchronize: false,
	migrations: [__dirname + '/migrations/**/*.{ts,js}'],
}

export const AppDataSource = new DataSource(AppDataSourceOptions)
