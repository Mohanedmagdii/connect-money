import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI as string;

@Module({
  imports: [UsersModule, MongooseModule.forRoot(mongoUri)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
