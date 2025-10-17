import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import type { RequestWithUser } from '../users/types';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly usersService: UsersService) { }
    async use(req: RequestWithUser, res: Response, next: NextFunction) {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED, { cause: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED, { cause: 'Invalid token' });
        }

        const user = await this.usersService.getUserById(decoded.userId.toString());
        if (!user) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED, { cause: 'User not found' });
        }
        req.user = user;
        next();
    }
}