import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: any): Promise<import("./schemas/user.schema").UserDocument>;
    findAll(query: any): Promise<{
        data: import("./schemas/user.schema").User[];
        total: number;
    }>;
    findOne(id: string): Promise<import("./schemas/user.schema").User>;
    update(id: string, updateUserDto: any): Promise<import("./schemas/user.schema").User>;
    remove(id: string): Promise<void>;
}
