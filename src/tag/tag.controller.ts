import { Controller, Get } from '@nestjs/common'
import { TagService } from './tag.service'

@Controller('tag')
export class TagController {
	constructor(private readonly tagService: TagService) {}
	@Get()
	async getTags(): Promise<{ tags: string[] }> {
		const tags = await this.tagService.getTags()
		return {
			tags: tags.map((tag) => tag.name),
		}
	}
}
