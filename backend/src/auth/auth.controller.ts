import { Controller, Request, Post, UseGuards, Get, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @Post('validate-token')
    async validateToken(@Body('token') token: string) {
        return await this.authService.validateToken(token);
    }

    @Post('register')
    async register(@Body() body: any) {
        console.log('Register endpoint called with:', body);

        if (!body.nombre || !body.email || !body.password || !body.rol) {
            return {
                success: false,
                message: 'Todos los campos son requeridos'
            };
        }

        try {
            const result = await this.authService.register(body);
            return {
                success: true,
                ...result
            };
        } catch (error) {
            console.error('Error in register:', error);
            return {
                success: false,
                message: error.message || 'Error al registrar usuario'
            };
        }
    }
}