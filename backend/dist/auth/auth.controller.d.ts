import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        access_token: string;
        user: {
            _id: any;
            nombre: any;
            email: any;
            rol: any;
            estado: any;
        };
    }>;
    getProfile(req: any): any;
    validateToken(token: string): Promise<{
        valid: boolean;
        user: any;
        error?: undefined;
    } | {
        valid: boolean;
        error: string;
        user?: undefined;
    }>;
    register(body: any): Promise<{
        message: string;
        user: any;
        access_token: string;
        success: boolean;
    } | {
        success: boolean;
        message: any;
    }>;
}
