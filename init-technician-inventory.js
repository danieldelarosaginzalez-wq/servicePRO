const axios = require('axios');

async function initTechnicianInventory() {
    try {
        console.log('🔧 Inicializando inventario del técnico...');

        // Primero necesitamos hacer login para obtener el token
        console.log('🔐 Haciendo login...');
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'daniel@example.com', // Ajusta según tu usuario técnico
            password: 'password123'
        });

        const token = loginResponse.data.access_token;
        const userId = loginResponse.data.user._id;
        console.log('✅ Login exitoso, userId:', userId);

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Inicializar inventario del técnico
        console.log('📦 Inicializando inventario...');
        await axios.post(`http://localhost:3001/api/inventario/tecnico/${userId}/init`, {}, { headers });
        console.log('✅ Inventario inicializado');

        // Obtener lista de materiales disponibles
        console.log('📋 Obteniendo materiales disponibles...');
        const materialsResponse = await axios.get('http://localhost:3001/api/materials', { headers });
        const materials = materialsResponse.data.data || materialsResponse.data;

        if (materials.length > 0) {
            // Asignar algunos materiales al técnico
            const materialsToAssign = materials.slice(0, 3).map(material => ({
                material_id: material._id,
                cantidad: 10 // Asignar 10 unidades de cada material
            }));

            console.log('🎯 Asignando materiales al técnico...');
            const assignResponse = await axios.post(
                `http://localhost:3001/api/inventario/tecnico/${userId}/assign`,
                {
                    materials: materialsToAssign,
                    motivo: 'Asignación inicial para pruebas'
                },
                { headers }
            );

            console.log('✅ Materiales asignados exitosamente');
            console.log('📊 Respuesta:', assignResponse.data);

            // Verificar inventario del técnico
            console.log('🔍 Verificando inventario del técnico...');
            const inventoryResponse = await axios.get(
                `http://localhost:3001/api/inventario/mi-inventario`,
                { headers }
            );

            console.log('📦 Inventario actual:');
            console.log(JSON.stringify(inventoryResponse.data, null, 2));

        } else {
            console.log('⚠️ No hay materiales disponibles para asignar');
        }

    } catch (error) {
        if (error.response) {
            console.log('❌ Error:', error.response.status, error.response.data);
        } else {
            console.log('❌ Error de conexión:', error.message);
        }
    }
}

initTechnicianInventory();