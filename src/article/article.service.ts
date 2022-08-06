import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import slugify from 'slugify'
import { UserEntity } from 'src/user/user.entity'
import { DeleteResult, Repository } from 'typeorm'
import { ArticleEntity } from './article.entity'
import { PersistArticleDto } from './dto/persistArticle.dto'
import {
	IArticleResponse,
	IArticlesResponse,
} from './types/articleResponse.interface'

@Injectable()
export class ArticleService {
	constructor(
		@InjectRepository(ArticleEntity)
		private readonly articleRepository: Repository<ArticleEntity>,
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
	) {}
	async createArticle(
		user: UserEntity,
		PersistArticleDto: PersistArticleDto,
	): Promise<ArticleEntity> {
		const article = new ArticleEntity()
		Object.assign(article, PersistArticleDto)
		if (!article.tagList) article.tagList = []
		article.author = user
		article.slug = this.getSlug(article.title)
		return await this.articleRepository.save(article)
	}

	buildArticleResponse(article: ArticleEntity): IArticleResponse {
		return { article }
	}

	private getSlug(title: string) {
		return (
			slugify(title, { lower: true }) +
			'-' +
			((Math.random() * Math.pow(36, 6)) | 0).toString(36)
		)
	}

	async getArticle(slug: string): Promise<ArticleEntity> {
		return await this.articleRepository.findOneBy({ slug })
	}

	async deleteArticle(slug: string, userId: number): Promise<DeleteResult> {
		const article = await this.articleRepository.findOneBy({ slug })
		if (!article)
			throw new HttpException('Article not found', HttpStatus.NOT_FOUND)
		if (article.author.id !== userId)
			throw new HttpException(
				'You are not allowed to delete this article',
				HttpStatus.FORBIDDEN,
			)
		return await this.articleRepository.delete({ slug })
	}

	async updateArticle(
		slug: string,
		userId: number,
		persistArticle: PersistArticleDto,
	): Promise<ArticleEntity> {
		const article = await this.articleRepository.findOneBy({ slug })
		if (!article)
			throw new HttpException('Article not found', HttpStatus.NOT_FOUND)
		if (article.author.id !== userId)
			throw new HttpException(
				'You are not allowed to update this article',
				HttpStatus.FORBIDDEN,
			)
		Object.assign(article, persistArticle)
		return await this.articleRepository.save(article)
	}

	async findAll(userId: number, query: any): Promise<IArticlesResponse> {
		const queryBuilder = this.articleRepository
			.createQueryBuilder('article')
			.leftJoinAndSelect('article.author', 'author')
		const articlesCount = await queryBuilder.getCount()

		if (query.tag)
			queryBuilder.andWhere('article.tagList LIKE :tag', {
				tag: `%${query.tag}%`,
			})

		if (query.favorited) {
			const user = await this.userRepository.findOne({
				where: { username: query.favorited },
				relations: ['favorites'],
			})
			const ids = user.favorites.map((article) => article.id)
			if (ids.length > 0)
				queryBuilder.andWhere('article.id IN (:...ids)', { ids })
			else queryBuilder.andWhere('1=0')
		}

		if (query.author) {
			const author = await this.userRepository.findOneBy({
				username: query.author,
			})
			queryBuilder.andWhere('article.authorId = :id', {
				id: author.id,
			})
		}
		if (query.limit) queryBuilder.limit(query.limit)
		if (query.offset) queryBuilder.offset(query.offset)

		let favoriteIds: number[] = []
		if (userId) {
			const user = await this.userRepository.findOne({
				where: { id: userId },
				relations: ['favorites'],
			})
			favoriteIds = user.favorites.map((article) => article.id)
		}

		const articles = await queryBuilder.getMany()
		const articlesWithFavorites = articles.map((article) => {
			const favorited = favoriteIds.includes(article.id)
			return { ...article, favorited }
		})

		return { articles: articlesWithFavorites, count: articlesCount }
	}

	async favoriteArticle(slug: string, id: number): Promise<ArticleEntity> {
		const article = await this.articleRepository.findOneBy({ slug })
		if (!article)
			throw new HttpException('Article not found', HttpStatus.NOT_FOUND)
		const user = await this.userRepository.findOne({
			where: { id },
			relations: ['favorites'],
		})
		const isNotFavorite =
			user.favorites.findIndex(
				(articleInFavorite) => articleInFavorite.id === article.id,
			) === -1
		if (isNotFavorite) {
			user.favorites.push(article)
			article.favoritesCount++
			await this.userRepository.save(user)
			await this.articleRepository.save(article)
		}
		return article
	}

	async unfavoriteArticle(slug: string, id: number): Promise<ArticleEntity> {
		const article = await this.articleRepository.findOneBy({ slug })
		if (!article)
			throw new HttpException('Article not found', HttpStatus.NOT_FOUND)
		const user = await this.userRepository.findOne({
			where: { id },
			relations: ['favorites'],
		})
		const favoriteIndex = user.favorites.findIndex(
			(articleInFavorite) => articleInFavorite.id === article.id,
		)
		if (favoriteIndex >= 0) {
			user.favorites.splice(favoriteIndex, 1)
			article.favoritesCount--
			await this.userRepository.save(user)
			await this.articleRepository.save(article)
		}
		return article
	}
}
