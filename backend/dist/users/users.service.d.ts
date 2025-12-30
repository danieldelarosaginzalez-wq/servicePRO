import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    create(createUserDto: any): Promise<UserDocument>;
    findAll(query?: any): Promise<{
        data: User[];
        total: number;
    }>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<UserDocument | null>;
    update(id: string, updateUserDto: any): Promise<User>;
    remove(id: string): Promise<void>;
}
