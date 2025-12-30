import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Poliza, PolizaDocument } from './schemas/poliza.schema';

@Injectable()
export class PolizasService {
    constructor(
        @InjectModel(Poliza.name) private polizaModel: Model<PolizaDocument>,
    ) { }

    async create(createPolizaDto: any): Promise<Poliza> {
        const createdPoliza = new this.polizaModel(createPolizaDto);
        return createdPoliza.save();
    }

    async findAll(query: any = {}): Promise<{ data: Poliza[]; total: number }> {
        const { page = 1, limit = 50, ...filters } = query;
        const skip = (page - 1) * limit;

        const mongoFilters: any = {};

        if (filters.estado) {
            mongoFilters.estado = filters.estado;
        }

        if (filters.cliente) {
            mongoFilters.cliente = { $regex: filters.cliente, $options: 'i' };
        }

        const [data, total] = await Promise.all([
            this.polizaModel
                .find(mongoFilters)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .exec(),
            this.polizaModel.countDocuments(mongoFilters),
        ]);

        return { data, total };
    }

    async findOne(id: string): Promise<Poliza> {
        const poliza = await this.polizaModel.findById(id).exec();
        if (!poliza) {
            throw new NotFoundException(`Póliza con ID ${id} no encontrada`);
        }
        return poliza;
    }

    async update(id: string, updatePolizaDto: any): Promise<Poliza> {
        const updatedPoliza = await this.polizaModel
            .findByIdAndUpdate(id, updatePolizaDto, { new: true })
            .exec();

        if (!updatedPoliza) {
            throw new NotFoundException(`Póliza con ID ${id} no encontrada`);
        }

        return updatedPoliza;
    }

    async remove(id: string): Promise<void> {
        const result = await this.polizaModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Póliza con ID ${id} no encontrada`);
        }
    }
}