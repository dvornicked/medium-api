import { ArticleEntity } from '../article.entity'
import { ArticleType } from './article.type'

export interface IArticleResponse {
	article: ArticleEntity
}

export interface IArticlesResponse {
	articles: ArticleType[]
	count: number
}
