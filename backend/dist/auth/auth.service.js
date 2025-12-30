"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = require("bcryptjs");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(password, user.password_hash)) {
            const { password_hash, ...result } = user.toObject();
            return result;
        }
        return null;
    }
    async login(user) {
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
    async validateToken(token) {
        try {
            const decoded = this.jwtService.verify(token);
            return { valid: true, user: decoded };
        }
        catch (error) {
            return { valid: false, error: 'Token inválido' };
        }
    }
    async register(registerDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        const newUser = await this.usersService.create({
            nombre: registerDto.nombre,
            email: registerDto.email,
            password: registerDto.password,
            rol: registerDto.rol,
            estado: 'activo'
        });
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map