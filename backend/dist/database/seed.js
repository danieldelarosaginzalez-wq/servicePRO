"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const users_service_1 = require("../users/users.service");
const materials_service_1 = require("../materials/materials.service");
const polizas_service_1 = require("../polizas/polizas.service");
const orders_service_1 = require("../orders/orders.service");
const inventory_service_1 = require("../inventory/inventory.service");
async function seed() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const usersService = app.get(users_service_1.UsersService);
    const materialsService = app.get(materials_service_1.MaterialsService);
    const polizasService = app.get(polizas_service_1.PolizasService);
    const ordersService = app.get(orders_service_1.OrdersService);
    const inventoryService = app.get(inventory_service_1.InventoryService);
    console.log('🌱 Iniciando seed de datos...');
    try {
        const users = [
            {
                nombre: 'Juan Analista',
                email: 'analista@test.com',
                password: '123456',
                rol: 'analista',
                estado: 'activo',
            },
            {
                nombre: 'Carlos Técnico',
                email: 'tecnico@test.com',
                password: '123456',
                rol: 'tecnico',
                estado: 'activo',
            },
            {
                nombre: 'María Inventario',
                email: 'inventario@test.com',
                password: '123456',
                rol: 'analista_inventario_oculto',
                estado: 'activo',
            },
        ];
        console.log('👥 Creando usuarios...');
        const createdUsers = [];
        for (const user of users) {
            try {
                const createdUser = await usersService.create(user);
                createdUsers.push(createdUser);
                console.log(`✅ Usuario creado: ${user.email}`);
            }
            catch (error) {
                console.log(`⚠️  Usuario ya existe: ${user.email}`);
            }
        }
        const materials = [
            {
                nombre: 'Tubería PVC 4 pulgadas',
                codigo: 'TUB-PVC-4',
                descripcion: 'Tubería de PVC de 4 pulgadas para instalaciones',
                unidad_medida: 'metro',
                costo_unitario: 15000,
                categoria: 'Fontanería',
                stock_minimo: 10,
                estado: 'activo',
            },
            {
                nombre: 'Codo PVC 4 pulgadas',
                codigo: 'COD-PVC-4',
                descripcion: 'Codo de PVC de 4 pulgadas 90 grados',
                unidad_medida: 'unidad',
                costo_unitario: 8000,
                categoria: 'Fontanería',
                stock_minimo: 20,
                estado: 'activo',
            },
            {
                nombre: 'Cable eléctrico 12 AWG',
                codigo: 'CAB-12AWG',
                descripcion: 'Cable eléctrico calibre 12 AWG',
                unidad_medida: 'metro',
                costo_unitario: 3500,
                categoria: 'Eléctrico',
                stock_minimo: 50,
                estado: 'activo',
            },
            {
                nombre: 'Interruptor termomagnético 20A',
                codigo: 'INT-20A',
                descripcion: 'Interruptor termomagnético de 20 amperios',
                unidad_medida: 'unidad',
                costo_unitario: 25000,
                categoria: 'Eléctrico',
                stock_minimo: 5,
                estado: 'activo',
            },
        ];
        console.log('🔧 Creando materiales...');
        const createdMaterials = [];
        for (const material of materials) {
            try {
                const createdMaterial = await materialsService.create(material);
                createdMaterials.push(createdMaterial);
                console.log(`✅ Material creado: ${material.nombre}`);
            }
            catch (error) {
                console.log(`⚠️  Material ya existe: ${material.codigo}`);
                try {
                    const existingMaterials = await materialsService.findAll({ codigo: material.codigo });
                    if (existingMaterials.data.length > 0) {
                        createdMaterials.push(existingMaterials.data[0]);
                    }
                }
                catch (e) {
                    console.log(`Error obteniendo material existente: ${material.codigo}`);
                }
            }
        }
        const polizas = [
            {
                poliza_number: '123456',
                descripcion: 'Instalación de acometida de agua',
                cliente: 'Juan Pérez',
                direccion: 'Calle 45 #23-45, Barranquilla',
                ubicacion: {
                    lat: 10.9639,
                    lng: -74.7964,
                    geocoded: true,
                },
                estado: 'activo',
                metadata: {
                    costo_maximo: 500000,
                },
            },
            {
                poliza_number: '123457',
                descripcion: 'Mantenimiento de red eléctrica',
                cliente: 'María García',
                direccion: 'Carrera 50 #30-20, Barranquilla',
                ubicacion: {
                    lat: 10.9685,
                    lng: -74.7813,
                    geocoded: true,
                },
                estado: 'activo',
                metadata: {
                    costo_maximo: 300000,
                },
            },
        ];
        console.log('📋 Creando pólizas...');
        const createdPolizas = [];
        for (const poliza of polizas) {
            try {
                const createdPoliza = await polizasService.create(poliza);
                createdPolizas.push(createdPoliza);
                console.log(`✅ Póliza creada: ${poliza.poliza_number}`);
            }
            catch (error) {
                console.log(`⚠️  Póliza ya existe: ${poliza.poliza_number}`);
            }
        }
        if (createdUsers.length > 0 && createdPolizas.length > 0) {
            const analista = createdUsers.find(u => u.rol === 'analista');
            const tecnico = createdUsers.find(u => u.rol === 'tecnico');
            if (analista && tecnico) {
                const orders = [
                    {
                        poliza_number: '123456',
                        cliente: 'Juan Pérez',
                        direccion: 'Calle 45 #23-45, Barranquilla',
                        tipo_trabajo: 'instalacion',
                        analista_id: analista._id,
                        tecnico_id: tecnico._id,
                        estado: 'asignada',
                        'ubicacion.lat': 10.9639,
                        'ubicacion.lng': -74.7964,
                    },
                    {
                        poliza_number: '123457',
                        cliente: 'María García',
                        direccion: 'Carrera 50 #30-20, Barranquilla',
                        tipo_trabajo: 'mantenimiento',
                        analista_id: analista._id,
                        'ubicacion.lat': 10.9685,
                        'ubicacion.lng': -74.7813,
                    },
                ];
                console.log('📝 Creando órdenes...');
                for (const order of orders) {
                    try {
                        await ordersService.create(order);
                        console.log(`✅ Orden creada para: ${order.cliente}`);
                    }
                    catch (error) {
                        console.log(`⚠️  Error creando orden: ${error.message}`);
                    }
                }
            }
        }
        const tecnico = createdUsers.find(u => u.rol === 'tecnico');
        const inventarioAnalista = createdUsers.find(u => u.rol === 'analista_inventario_oculto');
        if (tecnico && inventarioAnalista && createdMaterials.length > 0) {
            console.log('📦 Inicializando inventario de técnicos...');
            try {
                await inventoryService.initTechnicianInventory(tecnico._id.toString());
                const materialsToAssign = createdMaterials.slice(0, 3).map(material => ({
                    material_id: material._id.toString(),
                    cantidad: Math.floor(Math.random() * 20) + 10,
                }));
                await inventoryService.assignMaterialsToTechnician(tecnico._id.toString(), {
                    materials: materialsToAssign,
                    motivo: 'Asignación inicial de inventario - Seed'
                }, inventarioAnalista._id.toString());
                console.log(`✅ Inventario inicializado para técnico: ${tecnico.nombre}`);
                console.log(`   - ${materialsToAssign.length} tipos de materiales asignados`);
            }
            catch (error) {
                console.log(`⚠️  Error inicializando inventario: ${error.message}`);
            }
        }
        console.log('🎉 Seed completado exitosamente!');
        console.log('\n📧 Usuarios de prueba:');
        console.log('   Analista: analista@test.com / 123456');
        console.log('   Técnico: tecnico@test.com / 123456');
        console.log('   Inventario: inventario@test.com / 123456');
    }
    catch (error) {
        console.error('❌ Error durante el seed:', error);
    }
    finally {
        await app.close();
    }
}
seed();
//# sourceMappingURL=seed.js.map