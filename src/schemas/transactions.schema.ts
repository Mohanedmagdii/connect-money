import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './users.schema';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema()
export class Transaction {
    @Prop({ required: true })
    description: string;

    @Prop({ required: true, unique: true })
    transaction: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    type: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);