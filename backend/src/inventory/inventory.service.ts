import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Material, MaterialDocument } from '../materials/schemas/material.schema';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';

// Esquemas para inventario de técnicos
export interface TechnicianInventoryItem {
    material_id: string;
    material: {
        nombre: string;
        codigo: string;
        unidad_medida: string;
    };
    cantidad_actual: number;
    cantidad_apartada: number;
    cantidad_disponible: number;
    ultimo_movimiento: Date;
}

export interface InventoryMovement {
    _id?: string;
    tecnico_id: string;
    material_id: string;
    tipo: 'asignacion' | 'consumo' | 'devolucion' | 'ajuste';
    cantidad: number;
    cantidad_anterior: number;
    cantidad_nueva: number;
    motivo: string;
    fecha: Date;
    asignado_por?: string;
    material?: {
        nombre: string;
        codigo: string;
        unidad_medida: string;
    };
}

@Injectable()
export class InventoryService {
    // Simulación de base de datos en memoria para inventarios de técnicos
    private technicianInventories: Map<string, TechnicianInventoryItem[]> = new Map();
    private inventoryMovements: InventoryMovement[] = [];

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
        @Optional() private wsGateway: WebSocketGatewayService,
    ) { }

    async getTechnicianInventory(technicianId: string) {
        // Verificar que el técnico existe
        const technician = await this.userModel.findById(technicianId);
        if (!technician) {
            throw new NotFoundException('Técnico no encontrado');
        }

        // Obtener inventario del técnico (simulado)
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
                total_value: inventory.reduce((sum, item) => sum + (item.cantidad_actual * 100), 0), // Valor estimado
            },
        };
    }

    async initTechnicianInventory(technicianId: string) {
        // Verificar que el técnico existe
        const technician = await this.userModel.findById(technicianId);
        if (!technician) {
            throw new NotFoundException('Técnico no encontrado');
        }

        // Inicializar inventario vacío si no existe
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

    async getTechnicianMovements(technicianId: string) {
        // Verificar que el técnico existe
        const technician = await this.userModel.findById(technicianId);
        if (!technician) {
            throw new NotFoundException('Técnico no encontrado');
        }

        // Obtener movimientos del técnico
        const movements = this.inventoryMovements
            .filter(movement => movement.tecnico_id === technicianId)
            .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

        return {
            success: true,
            data: movements,
            total: movements.length,
        };
    }

    async assignMaterialsToTechnician(technicianId: string, assignData: any, assignedBy: string) {
        // Verificar que el técnico existe
        const technician = await this.userModel.findById(technicianId);
        if (!technician) {
            throw new NotFoundException('Técnico no encontrado');
        }

        // Verificar que los materiales existen
        const materials = await this.materialModel.find({
            _id: { $in: assignData.materials.map((m: any) => m.material_id) }
        });

        if (materials.length !== assignData.materials.length) {
            throw new NotFoundException('Algunos materiales no fueron encontrados');
        }

        // Obtener o crear inventario del técnico
        let inventory = this.technicianInventories.get(technicianId) || [];

        // Procesar cada material asignado
        for (const assignItem of assignData.materials) {
            const material = materials.find(m => m._id.toString() === assignItem.material_id);
            if (!material) continue;

            // Buscar si el material ya existe en el inventario
            const existingIndex = inventory.findIndex(item => item.material_id === assignItem.material_id);

            if (existingIndex >= 0) {
                // Actualizar cantidad existente
                const oldQuantity = inventory[existingIndex].cantidad_actual;
                inventory[existingIndex].cantidad_actual += assignItem.cantidad;
                inventory[existingIndex].cantidad_disponible += assignItem.cantidad;
                inventory[existingIndex].ultimo_movimiento = new Date();

                // Registrar movimiento
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
            } else {
                // Agregar nuevo material al inventario
                const newItem: TechnicianInventoryItem = {
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

                // Registrar movimiento
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

        // Guardar inventario actualizado
        this.technicianInventories.set(technicianId, inventory);

        // Notificar al técnico via WebSocket
        if (this.wsGateway) {
            this.wsGateway.notifyMaterialAssigned(technicianId, assignData.materials);
        }

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
                total_quantity: assignData.materials.reduce((sum: number, item: any) => sum + item.cantidad, 0),
            },
        };
    }

    async consumeMaterials(technicianId: string, materialsConsumed: any[], orderId: string, assignedBy: string) {
        console.log('🔧 consumeMaterials llamado con:', { technicianId, materialsConsumed, orderId, assignedBy });

        // Validar parámetros
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

        // Verificar que el técnico existe
        const technician = await this.userModel.findById(technicianId);
        if (!technician) {
            throw new NotFoundException('Técnico no encontrado');
        }

        // Obtener inventario del técnico
        let inventory = this.technicianInventories.get(technicianId) || [];

        // Si el inventario está vacío, inicializarlo con datos simulados
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

        // Procesar cada material consumido
        for (const consumedItem of materialsConsumed) {
            if (!consumedItem || !consumedItem.material_id) {
                console.warn('⚠️ Item de material inválido:', consumedItem);
                continue;
            }

            const existingIndex = inventory.findIndex(item => item.material_id === consumedItem.material_id);

            if (existingIndex >= 0) {
                const currentItem = inventory[existingIndex];

                // Verificar que hay suficiente stock
                if (currentItem.cantidad_disponible < consumedItem.cantidad) {
                    throw new Error(`Stock insuficiente para ${currentItem.material.nombre}. Disponible: ${currentItem.cantidad_disponible}, Solicitado: ${consumedItem.cantidad}`);
                }

                // Actualizar cantidades
                const oldQuantity = currentItem.cantidad_actual;
                currentItem.cantidad_actual -= consumedItem.cantidad;
                currentItem.cantidad_disponible -= consumedItem.cantidad;
                currentItem.ultimo_movimiento = new Date();

                // Registrar movimiento de consumo
                this.inventoryMovements.push({
                    tecnico_id: technicianId,
                    material_id: consumedItem.material_id,
                    tipo: 'consumo',
                    cantidad: -consumedItem.cantidad, // Negativo porque es consumo
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
            } else {
                // Material no encontrado en inventario - crear registro virtual de consumo
                console.warn(`⚠️ Material ${consumedItem.material_id} no encontrado en inventario del técnico ${technicianId}. Creando registro virtual.`);

                // Registrar movimiento de consumo virtual
                this.inventoryMovements.push({
                    tecnico_id: technicianId,
                    material_id: consumedItem.material_id,
                    tipo: 'consumo',
                    cantidad: -consumedItem.cantidad, // Negativo porque es consumo
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

        // Guardar inventario actualizado
        this.technicianInventories.set(technicianId, inventory);

        // Notificar consumo de materiales via WebSocket
        if (this.wsGateway) {
            this.wsGateway.notifyMaterialsConsumed(technicianId, orderId, materialsConsumed);
        }

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
                total_quantity: materialsConsumed.reduce((sum: number, item: any) => sum + item.cantidad, 0),
            },
        };
    }
}