import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty({ message: 'El nombre es requerido' })
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    nombre: string;

    @IsNotEmpty({ message: 'El email es requerido' })
    @IsEmail({}, { message: 'El email debe tener un formato válido' })
    email: string;

    @IsNotEmpty({ message: 'La contraseña es requerida' })
    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;

    @IsNotEmpty({ message: 'El rol es requerido' })
    @IsEnum(['analista', 'tecnico', 'analista_inventario_oculto'], {
        message: 'El rol debe ser: analista, tecnico o analista_inventario_oculto'
    })
    rol: 'analista' | 'tecnico' | 'analista_inventario_oculto';
}