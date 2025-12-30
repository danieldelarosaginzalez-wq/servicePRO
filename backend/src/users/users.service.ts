import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async create(createUserDto: any): Promise<UserDocument> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const createdUser = new this.userModel({
            ...createUserDto,
            password_hash: hashedPassword,
        });

        return createdUser.save();
    }

    async findAll(query: any = {}): Promise<{ data: User[]; total: number }> {
        const { page = 1, limit = 50, ...filters } = query;
        const skip = (page - 1) * limit;

        const mongoFilters: any = {};

        if (filters.rol) {
            mongoFilters.rol = filters.rol;
        }

        if (filters.estado) {
            mongoFilters.estado = filters.estado;
        }

        const [data, total] = await Promise.all([
            this.userModel
                .find(mongoFilters)
                .select('-password_hash')
                .sort({ nombre: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .exec(),
            this.userModel.countDocuments(mongoFilters),
        ]);

        return { data, total };
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userModel
            .findById(id)
            .select('-password_hash')
            .exec();

        if (!user) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        return user;
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async update(id: string, updateUserDto: any): Promise<User> {
        if (updateUserDto.password) {
            updateUserDto.password_hash = await bcrypt.hash(updateUserDto.password, 10);
            delete updateUserDto.password;
        }

        const updatedUser = await this.userModel
            .findByIdAndUpdate(id, updateUserDto, { new: true })
            .select('-password_hash')
            .exec();

        if (!updatedUser) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        return updatedUser;
    }

    async remove(id: string): Promise<void> {
        const result = await this.userModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
    }
}