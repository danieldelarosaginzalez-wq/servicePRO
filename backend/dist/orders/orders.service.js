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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("./schemas/order.schema");
const poliza_schema_1 = require("../polizas/schemas/poliza.schema");
const notifications_service_1 = require("../notifications/notifications.service");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
let OrdersService = class OrdersService {
    constructor(orderModel, polizaModel, notificationsService, wsGateway) {
        this.orderModel = orderModel;
        this.polizaModel = polizaModel;
        this.notificationsService = notificationsService;
        this.wsGateway = wsGateway;
    }
    async create(createOrderDto) {
        const poliza = await this.polizaModel.findOne({
            poliza_number: createOrderDto.poliza_number,
            estado: 'activo'
        });
        if (!poliza) {
            throw new common_1.BadRequestException(`La póliza ${createOrderDto.poliza_number} no existe o no está activa`);
        }
        const codigo = await this.generateOrderCode();
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
        delete orderData['ubicacion.lat'];
        delete orderData['ubicacion.lng'];
        const createdOrder = new this.orderModel(orderData);
        const saved = await createdOrder.save();
        this.wsGateway.notifyOrderCreated(saved);
        await this.notificationsService.notifyOrderCreated(saved, saved.analista_id.toString());
        return saved;
    }
    async findAll(query = {}) {
        const { page = 1, limit = 50, ...filters } = query;
        const skip = (page - 1) * limit;
        const mongoFilters = {};
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
    async findOne(id) {
        const order = await this.orderModel
            .findById(id)
            .populate('analista_id', 'nombre email')
            .populate('tecnico_id', 'nombre email')
            .populate('materiales_sugeridos.material_id')
            .populate('materiales_apartados.material_id')
            .populate('materiales_utilizados.material_id')
            .exec();
        if (!order) {
            throw new common_1.NotFoundException(`Orden con ID ${id} no encontrada`);
        }
        return order;
    }
    async update(id, updateOrderDto) {
        const updatedOrder = await this.orderModel
            .findByIdAndUpdate(id, updateOrderDto, { new: true })
            .populate('analista_id', 'nombre email')
            .populate('tecnico_id', 'nombre email')
            .exec();
        if (!updatedOrder) {
            throw new common_1.NotFoundException(`Orden con ID ${id} no encontrada`);
        }
        return updatedOrder;
    }
    async assignTechnician(id, assignDto) {
        const order = await this.orderModel.findById(id);
        if (!order) {
            throw new common_1.NotFoundException(`Orden con ID ${id} no encontrada`);
        }
        if (order.estado !== 'creada') {
            throw new common_1.BadRequestException('Solo se pueden asignar técnicos a órdenes en estado "creada"');
        }
        const updatedOrder = await this.orderModel
            .findByIdAndUpdate(id, {
            tecnico_id: assignDto.technicianId,
            estado: 'asignada',
            fecha_asignacion: new Date(),
        }, { new: true })
            .populate('analista_id', 'nombre email')
            .populate('tecnico_id', 'nombre email')
            .exec();
        this.wsGateway.notifyOrderAssigned(updatedOrder, assignDto.technicianId);
        await this.notificationsService.notifyOrderAssigned(updatedOrder, assignDto.technicianId, updatedOrder.analista_id?.toString() || '');
        return updatedOrder;
    }
    async startOrder(id, userId) {
        const order = await this.orderModel.findById(id);
        if (!order) {
            throw new common_1.NotFoundException(`Orden con ID ${id} no encontrada`);
        }
        if (order.tecnico_id?.toString() !== userId) {
            throw new common_1.BadRequestException('Solo el técnico asignado puede iniciar la orden');
        }
        if (order.estado !== 'asignada') {
            throw new common_1.BadRequestException('Solo se pueden iniciar órdenes en estado "asignada"');
        }
        const updatedOrder = await this.orderModel
            .findByIdAndUpdate(id, {
            estado: 'en_proceso',
            fecha_inicio: new Date(),
        }, { new: true })
            .populate('analista_id', 'nombre email')
            .populate('tecnico_id', 'nombre email')
            .exec();
        this.wsGateway.notifyOrderStatusChanged(updatedOrder);
        await this.notificationsService.notifyOrderStarted(updatedOrder, userId);
        return updatedOrder;
    }
    async finishOrder(id, userId, finishData) {
        const order = await this.orderModel.findById(id);
        if (!order) {
            throw new common_1.NotFoundException(`Orden con ID ${id} no encontrada`);
        }
        if (order.tecnico_id?.toString() !== userId) {
            throw new common_1.BadRequestException('Solo el técnico asignado puede finalizar la orden');
        }
        if (order.estado !== 'en_proceso') {
            throw new common_1.BadRequestException('Solo se pueden finalizar órdenes en estado "en_proceso"');
        }
        const updatedOrder = await this.orderModel
            .findByIdAndUpdate(id, {
            estado: 'finalizada',
            fecha_finalizacion: new Date(),
            materiales_utilizados: finishData.materiales_utilizados || [],
            evidencias: {
                ...order.evidencias,
                ...finishData.evidencias,
            },
        }, { new: true })
            .populate('analista_id', 'nombre email')
            .populate('tecnico_id', 'nombre email')
            .exec();
        this.wsGateway.notifyOrderCompleted(updatedOrder);
        await this.notificationsService.notifyOrderCompleted(updatedOrder, userId);
        return updatedOrder;
    }
    async reportImpossibility(id, userId, impossibilityData) {
        const order = await this.orderModel.findById(id);
        if (!order) {
            throw new common_1.NotFoundException(`Orden con ID ${id} no encontrada`);
        }
        if (order.tecnico_id?.toString() !== userId) {
            throw new common_1.BadRequestException('Solo el técnico asignado puede reportar imposibilidad');
        }
        if (!['asignada', 'en_proceso'].includes(order.estado)) {
            throw new common_1.BadRequestException('Solo se puede reportar imposibilidad en órdenes asignadas o en proceso');
        }
        const updatedOrder = await this.orderModel
            .findByIdAndUpdate(id, {
            estado: 'imposibilidad',
            imposibilidad: {
                motivo: impossibilityData.motivo,
                foto_tirilla: impossibilityData.foto_tirilla,
                fecha: new Date(),
            },
        }, { new: true })
            .populate('analista_id', 'nombre email')
            .populate('tecnico_id', 'nombre email')
            .exec();
        this.wsGateway.notifyOrderImpossibility(updatedOrder);
        await this.notificationsService.notifyOrderImpossibility(updatedOrder, userId, impossibilityData.motivo);
        return updatedOrder;
    }
    async updateWorkProgress(id, userId, progressData) {
        console.log('📝 updateWorkProgress llamado:', { id, userId, fase: progressData?.fase });
        const order = await this.orderModel.findById(id);
        if (!order) {
            throw new common_1.NotFoundException(`Orden con ID ${id} no encontrada`);
        }
        const tecnicoId = order.tecnico_id?.toString();
        const userIdStr = userId?.toString();
        console.log('🔍 Comparando IDs:', { tecnicoId, userIdStr, match: tecnicoId === userIdStr });
        if (tecnicoId !== userIdStr) {
            throw new common_1.BadRequestException('Solo el técnico asignado puede actualizar el progreso');
        }
        if (order.estado !== 'en_proceso') {
            throw new common_1.BadRequestException('Solo se puede actualizar el progreso de órdenes en proceso');
        }
        const evidenciasActuales = order.evidencias || {};
        const evidenciasActualizadas = {
            foto_inicial: evidenciasActuales.foto_inicial,
            foto_durante: evidenciasActuales.foto_durante || [],
            foto_materiales: evidenciasActuales.foto_materiales || [],
            foto_final: evidenciasActuales.foto_final,
            fases_completadas: [...(evidenciasActuales.fases_completadas || [])]
        };
        const fase = progressData.fase;
        if (fase && !evidenciasActualizadas.fases_completadas.includes(fase)) {
            evidenciasActualizadas.fases_completadas.push(fase);
            console.log(`✅ Fase '${fase}' marcada como completada`);
        }
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
        let materialesUtilizados = [...(order.materiales_utilizados || [])];
        if (progressData.materiales_consumidos && progressData.materiales_consumidos.length > 0) {
            materialesUtilizados = [
                ...materialesUtilizados,
                ...progressData.materiales_consumidos.map((material) => ({
                    material_id: material.material_id,
                    cantidad: material.cantidad,
                    fecha_uso: new Date(),
                }))
            ];
            console.log(`📦 ${progressData.materiales_consumidos.length} materiales registrados`);
        }
        const updatedOrder = await this.orderModel
            .findByIdAndUpdate(id, {
            evidencias: evidenciasActualizadas,
            materiales_utilizados: materialesUtilizados,
        }, { new: true })
            .populate('analista_id', 'nombre email')
            .populate('tecnico_id', 'nombre email')
            .exec();
        console.log('✅ Orden actualizada exitosamente');
        this.wsGateway.notifyOrderProgress(updatedOrder, fase);
        await this.notificationsService.notifyOrderProgress(updatedOrder, fase, userId);
        return updatedOrder;
    }
    async generateOrderCode() {
        const count = await this.orderModel.countDocuments();
        return `OT-${String(count + 1).padStart(6, '0')}`;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(poliza_schema_1.Poliza.name)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => notifications_service_1.NotificationsService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationsService,
        websocket_gateway_1.WebSocketGatewayService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map