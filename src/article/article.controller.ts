import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Query,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { User } from 'src/user/decorators/user.decorator'
import { AuthGuard } from 'src/user/guards/auth.guard'
import { UserEntity } from 'src/user/user.entity'
import { ArticleService } from './article.service'
import { PersistArticleDto } from './dto/persistArticle.dto'
import {
	IArticleResponse,
	IArticlesResponse,
} from './types/articleResponse.interface'

@Controller('articles')
export class ArticleController {
	constructor(private readonly articleService: ArticleService) {}
	@Get()
	async findAll(
		@User('id') userId,
		@Query() query: any,
	): Promise<IArticlesResponse> {
		return await this.articleService.findAll(userId, query)
	}

	@Post()
	@UseGuards(AuthGuard)
	@UsePipes(new ValidationPipe())
	async create(
		@User() user: UserEntity,
		@Body('article') persistArticleDto: PersistArticleDto,
	): Promise<IArticleResponse> {
		const article = await this.articleService.createArticle(
			user,
			persistArticleDto,
		)
		return this.articleService.buildArticleResponse(article)
	}

	@Get(':slug')
	async getArticle(@Param('slug') slug: string): Promise<IArticleResponse> {
		const article = await this.articleService.getArticle(slug)
		return this.articleService.buildArticleResponse(article)
	}

	@Delete(':slug')
	async deleteArticle(@User('id') userId: number, @Param('slug') slug: string) {
		return await this.articleService.deleteArticle(slug, userId)
	}

	@Put(':slug')
	@UseGuards(AuthGuard)
	@UsePipes(new ValidationPipe())
	async updateArticle(
		@User('id') userId: number,
		@Param('slug') slug: string,
		@Body('article') persistArticleDto: PersistArticleDto,
	) {
		return await this.articleService.updateArticle(
			slug,
			userId,
			persistArticleDto,
		)
	}

	@Post(':slug/favorite')
	@UseGuards(AuthGuard)
	async favoriteArticle(
		@Param('slug') slug: string,
		@User('id') userId: number,
	) {
		const article = await this.articleService.favoriteArticle(slug, userId)
		return this.articleService.buildArticleResponse(article)
	}

	@Delete(':slug/favorite')
	@UseGuards(AuthGuard)
	async deleteArticleFromFavorites(
		@Param('slug') slug: string,
		@User('id') userId: number,
	) {
		const article = await this.articleService.unfavoriteArticle(slug, userId)
		return this.articleService.buildArticleResponse(article)
	}
}
