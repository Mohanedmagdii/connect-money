import { UserDocument } from '../schemas/users.schema';
import { Request } from "express";

export interface RequestWithUser extends Request {
    user: UserDocument;
}
