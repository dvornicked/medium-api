import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { JWT_SECRET } from 'src/config'
import { Repository } from 'typeorm'
import { CreateUserDto } from './dto/createUser.dto'
import { UserEntity } from './user.entity'
import { sign } from 'jsonwebtoken'
import { IUserResponse } from './types/userResponse.interface'
import { LoginUserDto } from './dto/loginUser.dto'
import { compare } from 'bcrypt'
import { UpdateUserDto } from './dto/updateUser.dto'

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
	) {}
	async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
		const userByEmail = await this.userRepository.findOneBy({
			email: createUserDto.email,
		})
		const userByUsername = await this.userRepository.findOneBy({
			username: createUserDto.username,
		})
		if (userByEmail)
			throw new HttpException(
				'User with this email already exists',
				HttpStatus.UNPROCESSABLE_ENTITY,
			)
		if (userByUsername)
			throw new HttpException(
				'User with this username already exists',
				HttpStatus.UNPROCESSABLE_ENTITY,
			)
		const newUser = new UserEntity()
		Object.assign(newUser, createUserDto)
		return await this.userRepository.save(newUser)
	}

	async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
		const user = await this.userRepository.findOneBy({
			email: loginUserDto.email,
		})
		if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
		const isValid = await compare(loginUserDto.password, user.password)
		if (!isValid)
			throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED)
		delete user.password
		return user
	}
	buildUserResponse(user: UserEntity): IUserResponse {
		return {
			user: {
				...user,
				token: this.generateJWT(user),
			},
		}
	}

	findById(id: number): Promise<UserEntity> {
		return this.userRepository.findOneBy({ id })
	}

	private generateJWT(user: UserEntity): string {
		const payload = {
			id: user.id,
			username: user.username,
			email: user.email,
		}
		return sign(payload, JWT_SECRET)
	}

	async updateUser(
		userUpdateDto: UpdateUserDto,
		id: number,
	): Promise<UserEntity> {
		const userToUpdate = await this.userRepository.findOneBy({
			id,
		})
		if (!userToUpdate)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND)
		Object.assign(userToUpdate, userUpdateDto)
		console.log(userUpdateDto, userToUpdate)
		return await this.userRepository.save(userToUpdate)
	}
}
