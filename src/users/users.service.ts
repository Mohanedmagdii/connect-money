import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from './dto/create-user.dto';
import { User, UserDocument } from 'src/schemas/users.schema';
import { Model, Connection } from 'mongoose';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Transaction, TransactionDocument } from 'src/schemas/transactions.schema';
import { DepositAmountDto } from './dto/deposit.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectConnection()
    private connection: Connection,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async register(registerUserDto: RegisterUserDto) {
    const { name, username, password } = registerUserDto;
    const existingUser = await this.userModel.findOne({ username }).lean();
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await new this.userModel({
      name,
      username,
      password: hashedPassword,
    }).save()

    const accessToken = this._generateToken(user._id.toString(), '1h');
    const refreshToken = this._generateToken(user._id.toString(), '7d');

    const registeredUser = await this.userModel.findById(user._id).lean<UserDocument>();

    return {
      user: registeredUser,
      accessToken,
      refreshToken,
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { username, password } = loginUserDto;
    const user = await this.userModel.findOne({ username }).select('+password').lean();
    if (!user) {
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = this._generateToken(user._id.toString(), '1h');
    const refreshToken = this._generateToken(user._id.toString(), '7d');

    const loggedInUser = await this.userModel.findById(user._id).lean<UserDocument>();

    return {
      user: loggedInUser,
      accessToken,
      refreshToken,
    };
  }

  async depositAmount(depositAmountDto: DepositAmountDto, userId: string) {
    const { amount, description, transaction } = depositAmountDto;

    const user = await this.userModel.findById(userId)
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    
    const session = await this.connection.startSession();

    try {
      session.startTransaction();
      const transactionFound = await this.transactionModel.findOne({ transaction }).session(session);
      if (transactionFound) {
        throw new HttpException('Transaction already exists', HttpStatus.CONFLICT);
      }

      const newTransaction = await this.transactionModel.create([{
        amount,
        description,
        transaction,
        user: user._id,
        type: 'deposit',
      }], { session });

      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { $inc: { balance: amount } },
        { new: true, session }
      );

      await this.cacheManager.set(`user:${userId}`, JSON.stringify(updatedUser));

      await session.commitTransaction();

      return {
        transaction: newTransaction[0],
        balance: updatedUser?.balance
      };

    } catch (error) {
      console.log(error);
      await session.abortTransaction();

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException('Failed to deposit amount', HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await session.endSession();
    }
  }

  async getUserById(userId: string) {
    return this.userModel.findById(userId).lean<UserDocument>();
  }

  private _generateToken(userId: string, expiry: string) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: expiry });
  }
}
