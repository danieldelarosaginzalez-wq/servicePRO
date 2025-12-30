import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: {
            _id: any;
            nombre: any;
            email: any;
            rol: any;
            estado: any;
        };
    }>;
    validateToken(token: string): Promise<{
        valid: boolean;
        user: any;
        error?: undefined;
    } | {
        valid: boolean;
        error: string;
        user?: undefined;
    }>;
    register(registerDto: any): Promise<{
        message: string;
        user: any;
        access_token: string;
    }>;
}
