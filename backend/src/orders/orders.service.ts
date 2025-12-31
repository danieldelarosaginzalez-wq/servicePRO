import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Poliza, PolizaDocument } from '../polizas/schemas/poliza.schema';
import { CreateOrderDto, UpdateOrderDto, AssignTechnicianDto } from './dto/order.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Poliza.name) private polizaModel: Model<PolizaDocument>,
        @Inject(forwardRef(() => NotificationsService))
        private notificationsService: NotificationsService,
        private wsGateway: WebSocketGatewayService,
    ) { }

    async create(createOrderDto: CreateOrderDto): Promise<Order> {
        // Validar que la póliza existe y está activa
        const poliza = await this.polizaModel.findOne({
            poliza_number: createOrderDto.poliza_number,
            estado: 'activo'
        });

        if (!poliza) {
            throw new BadRequestException(`La póliza ${createOrderDto.poliza_number} no existe o no está activa`);
        }

        // Generar código único para la orden
        const codigo = await this.generateOrderCode();

        // Transformar los datos para que coincidan con el esquema
        const orderData = {
            ...createOrderDto,
            codigo,
            estado: 'creada',
            fecha_creacion: new Date(),
            ubicacion: {
                lat: createOrderDto['ubicacion.lat'],
                lng: createOrderDto['ubicacion.lng'],
            },
        };

        // Remover las propiedades planas de ubicación
        delete orderData['ubicacion.lat'];
        delete orderData['ubicacion.lng'];

        const createdOrder = new this.orderModel(orderData);
        const saved = await createdOrder.save();

        // Notificar a analistas
        this.wsGateway.notifyOrderCreated(saved);
        await this.notificationsService.notifyOrderCreated(saved, saved.analista_id.toString());

        return saved;
    }

    async findAll(query: any = {}): Promise<{ data: Order[]; total: number }> {
        const { page = 1, limit = 50, ...filters } = query;
        const skip = (page - 1) * limit;

        // Construir filtros
        const mongoFilters: any = {};

        if (filters.estado) {
            mongoFilters.estado = filters.estado;
        }

        if (filters.tecnico_id) {
            mongoFilters.tecnico_id = filters.tecnico_id;
        }

        if (filters.analista_id) {
            mongoFilters.analista_id = filters.analista_id;
        }

        if (filters.tipo_trabajo) {
            mongoFilters.tipo_trabajo = filters.tipo_trabajo;
        }

        if (filters.cliente) {
            mongoFilters.cliente = { $regex: filters.cliente, $options: 'i' };
        }

        const [data, total] = await Promise.all([
            this.orderModel
                .find(mongoFilters)
                .populate('analista_id', 'nombre email')
                .populate('tecnico_id', 'nombre email')
                .sort({ fecha_creacion: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .exec(),
            this.orderModel.countDocuments(mongoFilters),
        ]);

        return { data, total };
    }

    async findOne(id: string): Promise<Order> {
        const order = await this.orderModel
            .findById(id)
            .populate('analista_id', 'nombre email')
            .populate('tecnico_id', 'nombre email')
            .populate('materiales_sugeridos.material_id')
            .populate('materiales_apartados.material_id')
            .populate('materiales_utilizados.material_id')
            .exec();

        if (!order) {
            throw new NotFoundException(`Orden con ID ${id} no encontrada`);
        }

        return order;
    }

    async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
        const updatedOrder = await this.orderModel
            .findByIdAndUpdate(id, updateOrderDto, { new: true })
            .populate('analista_id', 'nombre email')
            .populate('tecnico_id', 'nombre email')
            .exec();

        if (!updatedOrder) {
            throw new NotFoundException(`Orden con ID ${id} no encontrada`);
        }

        return updatedOrder;
    }

    async assignTechnician(id: string, assignDto: AssignTechnicianDto): Promise<Order> {
        const order = await this.orderModel.findById(id);

        if (!order) {
            throw new NotFoundException(`Orden con ID ${id} no encontrada`);
        }

        if (order.estado !== 'creada') {
            throw new BadRequestException('Solo se pueden asignar técnicos a órdenes en estado "creada"');
        }

        const updatedOrder = await this.orderModel
            .findByIdAndUpdate(
                id,
                {
                    tecnico_id: assignDto.technicianId,
                    estado: 'asignada',
                    fecha_asignacion: new Date(),
                },
                { new: true }
            )
            .populate('analista_id', 'nombre email')
            .populate('tecnico_id', 'nombre email')
            .exec();

        // Notificar al técnico y analistas
        this.wsGateway.notifyOrderAssigned(updatedOrder, assignDto.technicianId);
        await this.notificationsService.notifyOrderAssigned(
            updatedOrder,
            assignDto.technicianId,
            updatedOrder.analista_id?.toString() || ''
        );

        return updatedOrder;
    }

    async startOrder(id: string, userId: string): Promise<Order> {
        const order = await this.orderModel.findById(id);

        if (!order) {
            throw new NotFoundException(`Orden con ID ${id} no encontrada`);
        }

        if (order.tecnico_id?.toString() !== userId) {
            throw new BadRequestException('Solo el técnico asignado puede iniciar la orden');
        }

        if (order.estado !== 'asignada') {
            throw new BadRequestException('Solo se pueden iniciar órdenes en estado "asignada"');
        }

        const updatedOrder = await this.orderModel
            .findByIdAndUpdate(
                id,
                {
                    estado: 'en_proceso',
                    fecha_inicio: new Date(),
                },
                { new: true }
            )
            .populate('analista_id', 'nombre email')
            .populate('tecnico_id', 'nombre email')
            .exec();

        // Notificar que la orden fue iniciada
        this.wsGateway.notifyOrderStatusChanged(updatedOrder);
        await this.notificationsService.notifyOrderStarted(updatedOrder, userId);

        return updatedOrder;
    }

    async finishOrder(id: string, userId: string, finishData: any): Promise<Order> {
        const order = await this.orderModel.findById(id);

        if (!order) {
            throw new NotFoundException(`Orden con ID ${id} no encontrada`);
        }

        if (order.tecnico_id?.toString() !== userId) {
            throw new BadRequestException('Solo el técnico asignado puede finalizar la orden');
        }

        if (order.estado !== 'en_proceso') {
            throw new BadRequestException('Solo se pueden finalizar órdenes en estado "en_proceso"');
        }

        const updatedOrder = await this.orderModel
            .findByIdAndUpdate(
                id,
                {
                    estado: 'finalizada',
                    fecha_finalizacion: new Date(),
                    materiales_utilizados: finishData.materiales_utilizados || [],
                    evidencias: {
                        ...order.evidencias,
                        ...finishData.evidencias,
                    },
                },
                { new: true }
            )
            .populate('analista_id', 'nombre email')
            .populate('tecnico_id', 'nombre email')
            .exec();

        // Notificar que la orden fue completada
        this.wsGateway.notifyOrderCompleted(updatedOrder);
        await this.notificationsService.notifyOrderCompleted(updatedOrder, userId);

        return updatedOrder;
    }

    async reportImpossibility(id: string, userId: string, impossibilityData: any): Promise<Order> {
        const order = await this.orderModel.findById(id);

        if (!order) {
            throw new NotFoundException(`Orden con ID ${id} no encontrada`);
        }

        if (order.tecnico_id?.toString() !== userId) {
            throw new BadRequestException('Solo el técnico asignado puede reportar imposibilidad');
        }

        if (!['asignada', 'en_proceso'].includes(order.estado)) {
            throw new BadRequestException('Solo se puede reportar imposibilidad en órdenes asignadas o en proceso');
        }

        const updatedOrder = await this.orderModel
            .findByIdAndUpdate(
                id,
                {
                    estado: 'imposibilidad',
                    imposibilidad: {
                        motivo: impossibilityData.motivo,
                        foto_tirilla: impossibilityData.foto_tirilla,
                        fecha: new Date(),
                    },
                },
                { new: true }
            )
            .populate('analista_id', 'nombre email')
            .populate('tecnico_id', 'nombre email')
            .exec();

        // Notificar imposibilidad
        this.wsGateway.notifyOrderImpossibility(updatedOrder);
        await this.notificationsService.notifyOrderImpossibility(
            updatedOrder,
            userId,
            impossibilityData.motivo
        );

        return updatedOrder;
    }

    async updateWorkProgress(id: string, userId: string, progressData: any): Promise<Order> {
        console.log('📝 updateWorkProgress llamado:', { id, userId, fase: progressData?.fase });

        const order = await this.orderModel.findById(id);

        if (!order) {
            throw new NotFoundException(`Orden con ID ${id} no encontrada`);
        }

        const tecnicoId = order.tecnico_id?.toString();
        const userIdStr = userId?.toString();

        console.log('🔍 Comparando IDs:', { tecnicoId, userIdStr, match: tecnicoId === userIdStr });

        if (tecnicoId !== userIdStr) {
            throw new BadRequestException('Solo el técnico asignado puede actualizar el progreso');
        }

        if (order.estado !== 'en_proceso') {
            throw new BadRequestException('Solo se puede actualizar el progreso de órdenes en proceso');
        }

        // Inicializar evidencias si no existen
        const evidenciasActuales = order.evidencias || {};
        const evidenciasActualizadas: any = {
            foto_inicial: evidenciasActuales.foto_inicial,
            foto_durante: evidenciasActuales.foto_durante || [],
            foto_materiales: evidenciasActuales.foto_materiales || [],
            foto_final: evidenciasActuales.foto_final,
            fases_completadas: [...(evidenciasActuales.fases_completadas || [])]
        };

        // Registrar la fase como completada
        const fase = progressData.fase;
        if (fase && !evidenciasActualizadas.fases_completadas.includes(fase)) {
            evidenciasActualizadas.fases_completadas.push(fase);
            console.log(`✅ Fase '${fase}' marcada como completada`);
        }

        // Procesar foto según la fase
        if (fase === 'inicial' && progressData.foto_inicial) {
            evidenciasActualizadas.foto_inicial = progressData.foto_inicial;
            console.log('📸 Foto inicial guardada');
        }

        if (fase === 'durante' && progressData.foto_durante) {
            evidenciasActualizadas.foto_durante.push(progressData.foto_durante);
            console.log('📸 Foto durante guardada');
        }

        if (fase === 'materiales' && progressData.foto_materiales) {
            evidenciasActualizadas.foto_materiales.push(progressData.foto_materiales);
            console.log('📸 Foto materiales guardada');
        }

        if (fase === 'final' && progressData.foto_final) {
            evidenciasActualizadas.foto_final = progressData.foto_final;
            console.log('📸 Foto final guardada');
        }

        console.log('📊 Fases completadas:', evidenciasActualizadas.fases_completadas);

        // Si hay materiales consumidos, agregarlos
        let materialesUtilizados = [...(order.materiales_utilizados || [])];
        if (progressData.materiales_consumidos && progressData.materiales_consumidos.length > 0) {
            materialesUtilizados = [
                ...materialesUtilizados,
                ...progressData.materiales_consumidos.map((material: any) => ({
                    material_id: material.material_id,
                    cantidad: material.cantidad,
                    fecha_uso: new Date(),
                }))
            ];
            console.log(`📦 ${progressData.materiales_consumidos.length} materiales registrados`);
        }

        const updatedOrder = await this.orderModel
            .findByIdAndUpdate(
                id,
                {
                    evidencias: evidenciasActualizadas,
                    materiales_utilizados: materialesUtilizados,
                },
                { new: true }
            )
            .populate('analista_id', 'nombre email')
            .populate('tecnico_id', 'nombre email')
            .exec();

        console.log('✅ Orden actualizada exitosamente');

        // Notificar progreso
        this.wsGateway.notifyOrderProgress(updatedOrder, fase);
        await this.notificationsService.notifyOrderProgress(updatedOrder, fase, userId);

        return updatedOrder;
    }

    private async generateOrderCode(): Promise<string> {
        const count = await this.orderModel.countDocuments();
        return `OT-${String(count + 1).padStart(6, '0')}`;
    }
}