import { DataSource } from 'typeorm'

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: 'localhost',
	port: 5432,
	username: 'medium',
	password: 'medium',
	database: 'mediumdb',
	entities: [__dirname + '/**/*.entity.{ts,js}'],
	synchronize: false,
	migrations: [__dirname + '/migrations/**/*.{ts,js}'],
})
