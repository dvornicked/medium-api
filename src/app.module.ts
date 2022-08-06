import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppDataSourceOptions } from './data-source'
import { TagModule } from './tag/tag.module'
import { AuthMiddleware } from './user/middleware/auth.middleware'
import { UserModule } from './user/user.module'
import { ArticleModule } from './article/article.module'

@Module({
	imports: [
		TypeOrmModule.forRoot(AppDataSourceOptions),
		TagModule,
		UserModule,
		ArticleModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(AuthMiddleware)
			.forRoutes({ path: '*', method: RequestMethod.ALL })
	}
}
