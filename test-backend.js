// Script para verificar que el backend esté funcionando correctamente
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testBackend() {
    console.log('🔍 Verificando estado del backend...');

    try {
        // Test 1: Verificar que el servidor esté corriendo
        console.log('\n1. Verificando conexión al servidor...');
        const healthResponse = await axios.get(`${BASE_URL}/users`, {
            timeout: 5000,
            validateStatus: function (status) {
                return status < 500; // Aceptar cualquier status menos 5xx
            }
        });
        console.log(`✅ Servidor respondiendo: ${healthResponse.status}`);

        // Test 2: Verificar autenticación
        console.log('\n2. Probando login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'tecnico@test.com',
            password: '123456'
        });

        if (loginResponse.data.access_token) {
            console.log('✅ Login exitoso');
            const token = loginResponse.data.access_token;

            // Test 3: Verificar endpoint de órdenes
            console.log('\n3. Verificando endpoint de órdenes...');
            const ordersResponse = await axios.get(`${BASE_URL}/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(`✅ Órdenes endpoint funcionando: ${ordersResponse.status}`);

            // Test 4: Verificar endpoint de inventario
            console.log('\n4. Verificando endpoint de inventario...');
            try {
                // Get user info to use as technician ID
                const userResponse = await axios.get(`${BASE_URL}/auth/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const technicianId = userResponse.data._id;
                console.log(`Usando técnico ID: ${technicianId}`);

                // Test consume materials endpoint
                const consumeData = {
                    materials: [
                        {
                            material_id: '507f1f77bcf86cd799439011',
                            cantidad: 1
                        }
                    ],
                    order_id: 'OT-000001'
                };

                const consumeResponse = await axios.post(`${BASE_URL}/inventario/tecnico/${technicianId}/consume`, consumeData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    validateStatus: function (status) {
                        return status < 600; // Aceptar cualquier status
                    }
                });

                console.log(`Consume materials response: ${consumeResponse.status}`);
                if (consumeResponse.status >= 400) {
                    console.log('Response data:', consumeResponse.data);
                }

            } catch (error) {
                console.log(`❌ Error en endpoint de inventario: ${error.message}`);
                if (error.response) {
                    console.log('Status:', error.response.status);
                    console.log('Data:', error.response.data);
                }
            }

            // Test 5: Verificar si hay órdenes disponibles
            if (ordersResponse.data.data && ordersResponse.data.data.length > 0) {
                const orderId = ordersResponse.data.data[0]._id;
                console.log(`\n5. Probando endpoint de progreso con orden: ${orderId}`);

                try {
                    const progressResponse = await axios.post(`${BASE_URL}/orders/${orderId}/progress`, {
                        fase: 'test',
                        test: true
                    }, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        validateStatus: function (status) {
                            return status < 500; // Aceptar cualquier status menos 5xx
                        }
                    });

                    if (progressResponse.status === 404) {
                        console.log('❌ Endpoint de progreso no encontrado (404)');
                        console.log('💡 Solución: Reinicia el backend con: npm run start:dev');
                    } else {
                        console.log(`✅ Endpoint de progreso funcionando: ${progressResponse.status}`);
                    }
                } catch (error) {
                    console.log(`❌ Error en endpoint de progreso: ${error.message}`);
                }
            } else {
                console.log('⚠️ No hay órdenes disponibles para probar');
            }

        } else {
            console.log('❌ Login falló');
        }

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ No se puede conectar al backend');
            console.log('💡 Solución: Inicia el backend con: cd backend && npm run start:dev');
        } else {
            console.log(`❌ Error: ${error.message}`);
        }
    }
}

testBackend();