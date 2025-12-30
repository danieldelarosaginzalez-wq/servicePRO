import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MaterialControl, MaterialControlDocument } from './schemas/material-control.schema';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class MaterialControlService {
    constructor(
        @InjectModel(MaterialControl.name) private materialControlModel: Model<MaterialControlDocument>,
        private inventoryService: InventoryService,
    ) { }

    async create(createDto: any, userId: string): Promise<MaterialControl> {
        const control = new this.materialControlModel({
            ...createDto,
            bodeguero_asigno: userId,
            fecha_creacion: new Date(),
            estado_general: 'asignado',
            historial: [{
                accion: 'creacion',
                usuario_id: new Types.ObjectId(userId),
                fecha: new Date(),
                detalles: { materiales: createDto.materiales_asignados }
            }]
        });

        return control.save();
    }

    async findAll(query: any = {}): Promise<{ data: MaterialControl[]; total: number }> {
        const { page = 1, limit = 50, ...filters } = query;
        const skip = (page - 1) * limit;

        const mongoFilters: any = {};

        if (filters.tecnico_id) mongoFilters.tecnico_id = filters.tecnico_id;
        if (filters.estado_general) mongoFilters.estado_general = filters.estado_general;
        if (filters.tiene_descuadre !== undefined) mongoFilters.tiene_descuadre = filters.tiene_descuadre === 'true';
        if (filters.orden_trabajo_id) mongoFilters.orden_trabajo_id = filters.orden_trabajo_id;

        const [data, total] = await Promise.all([
            this.materialControlModel
                .find(mongoFilters)
                .populate('tecnico_id', 'nombre email')
                .populate('bodeguero_asigno', 'nombre email')
                .populate('orden_trabajo_id', 'codigo estado')
                .sort({ fecha_creacion: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .exec(),
            this.materialControlModel.countDocuments(mongoFilters),
        ]);

        return { data, total };
    }

    async findOne(id: string): Promise<MaterialControl> {
        const control = await this.materialControlModel
            .findById(id)
            .populate('tecnico_id', 'nombre email')
            .populate('bodeguero_asigno', 'nombre email')
            .populate('orden_trabajo_id')
            .exec();

        if (!control) {
            throw new NotFoundException(`Control de material con ID ${id} no encontrado`);
        }

        return control;
    }

    async getDiscrepancies(query: any = {}): Promise<{ data: MaterialControl[]; total: number }> {
        return this.findAll({ ...query, tiene_descuadre: 'true' });
    }

    async registerUsage(id: string, usageData: {
        material_id: string;
        cantidad_utilizada: number;
    }, userId: string): Promise<MaterialControl> {
        const control = await this.materialControlModel.findById(id);

        if (!control) {
            throw new NotFoundException(`Control de material con ID ${id} no encontrado`);
        }

        const materialIndex = control.materiales_asignados.findIndex(
            m => m.material_id.toString() === usageData.material_id
        );

        if (materialIndex === -1) {
            throw new BadRequestException('Material no encontrado en este control');
        }

        const material = control.materiales_asignados[materialIndex];
        const disponible = material.cantidad_asignada - material.cantidad_utilizada - material.cantidad_devuelta;

        if (usageData.cantidad_utilizada > disponible) {
            throw new BadRequestException(`Solo hay ${disponible} unidades disponibles`);
        }

        material.cantidad_utilizada += usageData.cantidad_utilizada;
        material.estado = 'en_uso';

        control.historial.push({
            accion: 'uso_material',
            usuario_id: new Types.ObjectId(userId),
            fecha: new Date(),
            detalles: usageData
        });

        control.estado_general = 'en_trabajo';

        return control.save();
    }

    async registerReturn(id: string, returnData: {
        material_id: string;
        cantidad_devuelta: number;
        cantidad_perdida?: number;
        motivo_perdida?: string;
    }, userId: string): Promise<MaterialControl> {
        const control = await this.materialControlModel.findById(id);

        if (!control) {
            throw new NotFoundException(`Control de material con ID ${id} no encontrado`);
        }

        const materialIndex = control.materiales_asignados.findIndex(
            m => m.material_id.toString() === returnData.material_id
        );

        if (materialIndex === -1) {
            throw new BadRequestException('Material no encontrado en este control');
        }

        const material = control.materiales_asignados[materialIndex];

        material.cantidad_devuelta += returnData.cantidad_devuelta;
        material.cantidad_perdida += returnData.cantidad_perdida || 0;

        // Verificar si hay descuadre
        const totalContabilizado = material.cantidad_utilizada + material.cantidad_devuelta + material.cantidad_perdida;
        if (totalContabilizado !== material.cantidad_asignada) {
            control.tiene_descuadre = true;
            control.valor_descuadre = material.cantidad_asignada - totalContabilizado;
            control.motivo_descuadre = returnData.motivo_perdida || 'Descuadre sin justificar';
        }

        // Actualizar estado del material
        if (material.cantidad_devuelta === material.cantidad_asignada - material.cantidad_utilizada) {
            material.estado = 'devuelto_total';
        } else if (material.cantidad_devuelta > 0) {
            material.estado = 'devuelto_parcial';
        }

        control.historial.push({
            accion: 'devolucion_material',
            usuario_id: new Types.ObjectId(userId),
            fecha: new Date(),
            detalles: returnData
        });

        // Verificar si todos los materiales están devueltos
        const todosDevueltos = control.materiales_asignados.every(
            m => m.estado === 'devuelto_total' || m.estado === 'completado'
        );

        if (todosDevueltos) {
            control.estado_general = control.tiene_descuadre ? 'devolucion_pendiente' : 'devolucion_completada';
        }

        return control.save();
    }

    async resolveDiscrepancy(id: string, resolutionData: {
        resolucion: string;
        ajuste_inventario?: boolean;
    }, userId: string): Promise<MaterialControl> {
        const control = await this.materialControlModel.findById(id);

        if (!control) {
            throw new NotFoundException(`Control de material con ID ${id} no encontrado`);
        }

        if (!control.tiene_descuadre) {
            throw new BadRequestException('Este control no tiene descuadre');
        }

        control.descuadre_resuelto = true;
        control.resolucion_descuadre = resolutionData.resolucion;
        control.resuelto_por = new Types.ObjectId(userId);
        control.fecha_resolucion = new Date();
        control.estado_general = 'cerrado';
        control.fecha_cierre = new Date();

        control.historial.push({
            accion: 'resolucion_descuadre',
            usuario_id: new Types.ObjectId(userId),
            fecha: new Date(),
            detalles: resolutionData
        });

        return control.save();
    }

    async closeControl(id: string, userId: string): Promise<MaterialControl> {
        const control = await this.materialControlModel.findById(id);

        if (!control) {
            throw new NotFoundException(`Control de material con ID ${id} no encontrado`);
        }

        if (control.tiene_descuadre && !control.descuadre_resuelto) {
            throw new BadRequestException('No se puede cerrar un control con descuadre sin resolver');
        }

        control.estado_general = 'cerrado';
        control.fecha_cierre = new Date();

        control.historial.push({
            accion: 'cierre',
            usuario_id: new Types.ObjectId(userId),
            fecha: new Date()
        });

        return control.save();
    }
}
