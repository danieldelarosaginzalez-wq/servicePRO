const axios = require('axios');

async function testConsumeMaterials() {
    try {
        // First, let's test if the backend is running
        console.log('🔍 Testing backend connection...');
        const healthCheck = await axios.get('http://localhost:3001/api');
        console.log('✅ Backend is running');

        // Test the consume materials endpoint with a dummy technician ID
        console.log('🧪 Testing consume materials endpoint...');
        const testData = {
            materials: [
                {
                    material_id: '507f1f77bcf86cd799439011',
                    cantidad: 1
                }
            ],
            order_id: 'OT-000001'
        };

        const response = await axios.post(
            'http://localhost:3001/api/inventario/tecnico/507f1f77bcf86cd799439012/consume',
            testData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer dummy-token' // This will fail auth but should reach the endpoint
                }
            }
        );

        console.log('✅ Endpoint is accessible');
        console.log('Response:', response.data);

    } catch (error) {
        if (error.response) {
            console.log('📡 Response status:', error.response.status);
            console.log('📡 Response data:', error.response.data);

            if (error.response.status === 401) {
                console.log('✅ Endpoint exists but requires authentication (expected)');
            } else if (error.response.status === 404) {
                console.log('❌ Endpoint not found - route issue');
            } else {
                console.log('⚠️ Other error:', error.response.status);
            }
        } else {
            console.log('❌ Connection error:', error.message);
        }
    }
}

testConsumeMaterials();