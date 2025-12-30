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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const bcrypt = require("bcryptjs");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async create(createUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const createdUser = new this.userModel({
            ...createUserDto,
            password_hash: hashedPassword,
        });
        return createdUser.save();
    }
    async findAll(query = {}) {
        const { page = 1, limit = 50, ...filters } = query;
        const skip = (page - 1) * limit;
        const mongoFilters = {};
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
    async findOne(id) {
        const user = await this.userModel
            .findById(id)
            .select('-password_hash')
            .exec();
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async update(id, updateUserDto) {
        if (updateUserDto.password) {
            updateUserDto.password_hash = await bcrypt.hash(updateUserDto.password, 10);
            delete updateUserDto.password;
        }
        const updatedUser = await this.userModel
            .findByIdAndUpdate(id, updateUserDto, { new: true })
            .select('-password_hash')
            .exec();
        if (!updatedUser) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        return updatedUser;
    }
    async remove(id) {
        const result = await this.userModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map