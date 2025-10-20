import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginUserDto, RegisterUserDto } from './dto/user.dto';
import { DepositAmountDto } from './dto/deposit.dto';
import type { RequestWithUser } from './types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.register(registerUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto);
  }

  @Post('deposit')
  deposit(@Body() depositAmountDto: DepositAmountDto, @Req() req: RequestWithUser) {
    return this.usersService.depositAmount(depositAmountDto, req.user._id.toString());
  }
}
