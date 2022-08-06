import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Response } from 'express'
import { IExpressRequest } from 'src/types/expressRequest.interface'
import { JwtPayload, verify } from 'jsonwebtoken'
import { JWT_SECRET } from 'src/config'
import { UserService } from '../user.service'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(private readonly userService: UserService) {}
	async use(req: IExpressRequest, res: Response, next: NextFunction) {
		if (!req.headers.authorization) {
			req.user = null
			return next()
		}
		const token = req.headers.authorization.split(' ')[1]
		try {
			const payload = verify(token, JWT_SECRET) as JwtPayload
			const user = await this.userService.findById(payload.id)
			req.user = user
			next()
		} catch (error) {
			req.user = null
			next()
		}
	}
}
