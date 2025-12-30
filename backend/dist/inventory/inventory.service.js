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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../users/schemas/user.schema");
const material_schema_1 = require("../materials/schemas/material.schema");
let InventoryService = class InventoryService {
    constructor(userModel, materialModel) {
        this.userModel = userModel;
        this.materialModel = materialModel;
        this.technicianInventories = new Map();
        this.inventoryMovements = [];
    }
    async getTechnicianInventory(technicianId) {
        const technician = await this.userModel.findById(technicianId);
        if (!technician) {
            throw new common_1.NotFoundException('Técnico no encontrado');
        }
        const inventory = this.technicianInventories.get(technicianId) || [];
        return {
            success: true,
            data: {
                tecnico: {
                    _id: technician._id,
                    nombre: technician.nombre,
                    email: technician.email,
                },
                materials: inventory,
                total_items: inventory.length,
                total_value: inventory.reduce((sum, item) => sum + (item.cantidad_actual * 100), 0),
            },
        };
    }
    async initTechnicianInventory(technicianId) {
        const technician = await this.userModel.findById(technicianId);
        if (!technician) {
            throw new common_1.NotFoundException('Técnico no encontrado');
        }
        if (!this.technicianInventories.has(technicianId)) {
            this.technicianInventories.set(technicianId, []);
        }
        return {
            success: true,
            message: `Inventario inicializado para ${technician.nombre}`,
            data: {
                tecnico: {
                    _id: technician._id,
                    nombre: technician.nombre,
                    email: technician.email,
                },
                materials: [],
            },
        };
    }
    async getTechnicianMovements(technicianId) {
        const technician = await this.userModel.findById(technicianId);
        if (!technician) {
            throw new common_1.NotFoundException('Técnico no encontrado');
        }
        const movements = this.inventoryMovements
            .filter(movement => movement.tecnico_id === technicianId)
            .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
        return {
            success: true,
            data: movements,
            total: movements.length,
        };
    }
    async assignMaterialsToTechnician(technicianId, assignData, assignedBy) {
        const technician = await this.userModel.findById(technicianId);
        if (!technician) {
            throw new common_1.NotFoundException('Técnico no encontrado');
        }
        const materials = await this.materialModel.find({
            _id: { $in: assignData.materials.map((m) => m.material_id) }
        });
        if (materials.length !== assignData.materials.length) {
            throw new common_1.NotFoundException('Algunos materiales no fueron encontrados');
        }
        let inventory = this.technicianInventories.get(technicianId) || [];
        for (const assignItem of assignData.materials) {
            const material = materials.find(m => m._id.toString() === assignItem.material_id);
            if (!material)
                continue;
            const existingIndex = inventory.findIndex(item => item.material_id === assignItem.material_id);
            if (existingIndex >= 0) {
                const oldQuantity = inventory[existingIndex].cantidad_actual;
                inventory[existingIndex].cantidad_actual += assignItem.cantidad;
                inventory[existingIndex].cantidad_disponible += assignItem.cantidad;
                inventory[existingIndex].ultimo_movimiento = new Date();
                this.inventoryMovements.push({
                    tecnico_id: technicianId,
                    material_id: assignItem.material_id,
                    tipo: 'asignacion',
                    cantidad: assignItem.cantidad,
                    cantidad_anterior: oldQuantity,
                    cantidad_nueva: inventory[existingIndex].cantidad_actual,
                    motivo: assignData.motivo || 'Asignación de materiales',
                    fecha: new Date(),
                    asignado_por: assignedBy,
                    material: {
                        nombre: material.nombre,
                        codigo: material.codigo,
                        unidad_medida: material.unidad_medida,
                    },
                });
            }
            else {
                const newItem = {
                    material_id: assignItem.material_id,
                    material: {
                        nombre: material.nombre,
                        codigo: material.codigo,
                        unidad_medida: material.unidad_medida,
                    },
                    cantidad_actual: assignItem.cantidad,
                    cantidad_apartada: 0,
                    cantidad_disponible: assignItem.cantidad,
                    ultimo_movimiento: new Date(),
                };
                inventory.push(newItem);
                this.inventoryMovements.push({
                    tecnico_id: technicianId,
                    material_id: assignItem.material_id,
                    tipo: 'asignacion',
                    cantidad: assignItem.cantidad,
                    cantidad_anterior: 0,
                    cantidad_nueva: assignItem.cantidad,
                    motivo: assignData.motivo || 'Asignación inicial de material',
                    fecha: new Date(),
                    asignado_por: assignedBy,
                    material: {
                        nombre: material.nombre,
                        codigo: material.codigo,
                        unidad_medida: material.unidad_medida,
                    },
                });
            }
        }
        this.technicianInventories.set(technicianId, inventory);
        return {
            success: true,
            message: `Materiales asignados exitosamente a ${technician.nombre}`,
            data: {
                tecnico: {
                    _id: technician._id,
                    nombre: technician.nombre,
                    email: technician.email,
                },
                materials_assigned: assignData.materials.length,
                total_quantity: assignData.materials.reduce((sum, item) => sum + item.cantidad, 0),
            },
        };
    }
    async consumeMaterials(technicianId, materialsConsumed, orderId, assignedBy) {
        console.log('🔧 consumeMaterials llamado con:', { technicianId, materialsConsumed, orderId, assignedBy });
        if (!technicianId) {
            throw new Error('technicianId es requerido');
        }
        if (!materialsConsumed || !Array.isArray(materialsConsumed)) {
            console.log('⚠️ No hay materiales para consumir o formato inválido');
            return {
                success: true,
                message: 'No hay materiales para consumir',
                data: {
                    materials_consumed: 0,
                    total_quantity: 0,
                },
            };
        }
        const technician = await this.userModel.findById(technicianId);
        if (!technician) {
            throw new common_1.NotFoundException('Técnico no encontrado');
        }
        let inventory = this.technicianInventories.get(technicianId) || [];
        if (inventory.length === 0) {
            console.log('Inicializando inventario simulado para técnico:', technicianId);
            inventory = [
                {
                    material_id: '1',
                    material: { nombre: 'Tubería PVC 4"', codigo: 'TUB001', unidad_medida: 'metro' },
                    cantidad_actual: 50,
                    cantidad_apartada: 10,
                    cantidad_disponible: 40,
                    ultimo_movimiento: new Date(),
                },
                {
                    material_id: '2',
                    material: { nombre: 'Codo PVC 4"', codigo: 'COD001', unidad_medida: 'unidad' },
                    cantidad_actual: 25,
                    cantidad_apartada: 5,
                    cantidad_disponible: 20,
                    ultimo_movimiento: new Date(),
                },
            ];
            this.technicianInventories.set(technicianId, inventory);
        }
        for (const consumedItem of materialsConsumed) {
            if (!consumedItem || !consumedItem.material_id) {
                console.warn('⚠️ Item de material inválido:', consumedItem);
                continue;
            }
            const existingIndex = inventory.findIndex(item => item.material_id === consumedItem.material_id);
            if (existingIndex >= 0) {
                const currentItem = inventory[existingIndex];
                if (currentItem.cantidad_disponible < consumedItem.cantidad) {
                    throw new Error(`Stock insuficiente para ${currentItem.material.nombre}. Disponible: ${currentItem.cantidad_disponible}, Solicitado: ${consumedItem.cantidad}`);
                }
                const oldQuantity = currentItem.cantidad_actual;
                currentItem.cantidad_actual -= consumedItem.cantidad;
                currentItem.cantidad_disponible -= consumedItem.cantidad;
                currentItem.ultimo_movimiento = new Date();
                this.inventoryMovements.push({
                    tecnico_id: technicianId,
                    material_id: consumedItem.material_id,
                    tipo: 'consumo',
                    cantidad: -consumedItem.cantidad,
                    cantidad_anterior: oldQuantity,
                    cantidad_nueva: currentItem.cantidad_actual,
                    motivo: `Consumo en orden de trabajo ${orderId}`,
                    fecha: new Date(),
                    asignado_por: assignedBy,
                    material: {
                        nombre: currentItem.material.nombre,
                        codigo: currentItem.material.codigo,
                        unidad_medida: currentItem.material.unidad_medida,
                    },
                });
            }
            else {
                console.warn(`⚠️ Material ${consumedItem.material_id} no encontrado en inventario del técnico ${technicianId}. Creando registro virtual.`);
                this.inventoryMovements.push({
                    tecnico_id: technicianId,
                    material_id: consumedItem.material_id,
                    tipo: 'consumo',
                    cantidad: -consumedItem.cantidad,
                    cantidad_anterior: 0,
                    cantidad_nueva: 0,
                    motivo: `Consumo virtual en orden de trabajo ${orderId} (material no asignado previamente)`,
                    fecha: new Date(),
                    asignado_por: assignedBy,
                    material: {
                        nombre: `Material ${consumedItem.material_id}`,
                        codigo: 'N/A',
                        unidad_medida: 'unidad',
                    },
                });
            }
        }
        this.technicianInventories.set(technicianId, inventory);
        return {
            success: true,
            message: `Materiales consumidos exitosamente`,
            data: {
                tecnico: {
                    _id: technician._id,
                    nombre: technician.nombre,
                    email: technician.email,
                },
                materials_consumed: materialsConsumed.length,
                total_quantity: materialsConsumed.reduce((sum, item) => sum + item.cantidad, 0),
            },
        };
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(material_schema_1.Material.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map