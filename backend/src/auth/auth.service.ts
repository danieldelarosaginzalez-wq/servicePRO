import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { UserDocument } from '../users/schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(password, user.password_hash)) {
            const { password_hash, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = {
            email: user.email,
            sub: user._id,
            rol: user.rol,
            nombre: user.nombre
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id: user._id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
                estado: user.estado,
            },
        };
    }

    async validateToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            return { valid: true, user: decoded };
        } catch (error) {
            return { valid: false, error: 'Token inválido' };
        }
    }

    async register(registerDto: any) {
        // Verificar si el usuario ya existe
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new ConflictException('El email ya está registrado');
        }

        // Crear el nuevo usuario
        const newUser: UserDocument = await this.usersService.create({
            nombre: registerDto.nombre,
            email: registerDto.email,
            password: registerDto.password,
            rol: registerDto.rol,
            estado: 'activo'
        });

        // Retornar el usuario sin la contraseña y generar token
        const { password_hash, ...userWithoutPassword } = newUser.toObject();

        return {
            message: 'Usuario registrado exitosamente',
            user: userWithoutPassword,
            access_token: this.jwtService.sign({
                email: newUser.email,
                sub: newUser._id,
                rol: newUser.rol,
                nombre: newUser.nombre
            })
        };
    }
}