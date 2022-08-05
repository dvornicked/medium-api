import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
} from '@nestjs/common'
import { IExpressRequest } from 'src/types/expressRequest.interface'

export class AuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest<IExpressRequest>()
		if (req.user) return true
		throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
	}
}
