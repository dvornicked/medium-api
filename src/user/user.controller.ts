import {
	Body,
	Controller,
	Get,
	Post,
	Put,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { User } from './decorators/user.decorator'
import { CreateUserDto } from './dto/createUser.dto'
import { LoginUserDto } from './dto/loginUser.dto'
import { UpdateUserDto } from './dto/updateUser.dto'
import { AuthGuard } from './guards/auth.guard'
import { IUserResponse } from './types/userResponse.interface'
import { UserEntity } from './user.entity'
import { UserService } from './user.service'

@Controller('')
export class UserController {
	constructor(private readonly userService: UserService) {}
	@Post('users')
	@UsePipes(new ValidationPipe())
	async createUser(
		@Body('user') createUserDto: CreateUserDto,
	): Promise<IUserResponse> {
		const user = await this.userService.createUser(createUserDto)
		return this.userService.buildUserResponse(user)
	}

	@Post('users/login')
	@UsePipes(new ValidationPipe())
	async login(
		@Body('user') loginUserDto: LoginUserDto,
	): Promise<IUserResponse> {
		const user = await this.userService.login(loginUserDto)
		return this.userService.buildUserResponse(user)
	}

	@Get('user')
	@UseGuards(AuthGuard)
	async currentUser(@User() user: UserEntity): Promise<IUserResponse> {
		return this.userService.buildUserResponse(user)
	}

	@Put('user')
	@UseGuards(AuthGuard)
	async updateUser(
		@Body('user') updateUserDto: UpdateUserDto,
		@User('id') userId: number,
	): Promise<IUserResponse> {
		const user = await this.userService.updateUser(updateUserDto, userId)
		return this.userService.buildUserResponse(user)
	}
}
