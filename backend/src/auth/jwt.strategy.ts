import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'serviceops-secret-key-change-in-production',
        });
    }

    async validate(payload: any) {
        return {
            _id: payload.sub,
            email: payload.email,
            rol: payload.rol,
            nombre: payload.nombre,
            sub: payload.sub // Keep both for compatibility
        };
    }
}