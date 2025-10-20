import { HttpException, HttpStatus, Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import type { RequestWithUser } from '../users/types';
import { UsersService } from '../users/users.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        private readonly usersService: UsersService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }
    async use(req: RequestWithUser, res: Response, next: NextFunction) {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED, { cause: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED, { cause: 'Invalid token' });
        }

        const cachedUser = await this.cacheManager.get(`user:${decoded.userId.toString()}`);
        if (cachedUser) {
            req.user = JSON.parse(cachedUser as string);
            return next();
        }

        const user = await this.usersService.getUserById(decoded.userId.toString());
        if (!user) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED, { cause: 'User not found' });
        }
        req.user = user;

        await this.cacheManager.set(`user:${user._id.toString()}`, JSON.stringify(user));
        next();
    }
}