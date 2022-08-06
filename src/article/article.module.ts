import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from 'src/user/user.entity'
import { ArticleController } from './article.controller'
import { ArticleEntity } from './article.entity'
import { ArticleService } from './article.service'

@Module({
	imports: [TypeOrmModule.forFeature([ArticleEntity, UserEntity])],
	controllers: [ArticleController],
	providers: [ArticleService],
})
export class ArticleModule {}
