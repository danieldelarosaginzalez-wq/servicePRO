/**
 * Script para poblar el catálogo de materiales
 * Ejecutar: node seed-materials.js
 */

const http = require('http');

// Configuración
const API_URL = 'localhost';
const API_PORT = 3001;

// Credenciales del analista de inventario
const CREDENTIALS = {
    email: 'inventario@test.com',
    password: '123456'
};

// Catálogo completo de materiales
const MATERIALES = [
    // ═══════════════════════════════════════════════════════════════
    // TUBERÍAS PVC
    // ═══════════════════════════════════════════════════════════════
    { codigo: 'TUB-PVC-1/2', nombre: 'Tubería PVC 1/2"', descripcion: 'Tubería PVC presión 1/2 pulgada', unidad_medida: 'metro', costo_unitario: 3500, categoria: 'Tuberías PVC', stock_minimo: 50 },
    { codigo: 'TUB-PVC-3/4', nombre: 'Tubería PVC 3/4"', descripcion: 'Tubería PVC presión 3/4 pulgada', unidad_medida: 'metro', costo_unitario: 4200, categoria: 'Tuberías PVC', stock_minimo: 50 },
    { codigo: 'TUB-PVC-1', nombre: 'Tubería PVC 1"', descripcion: 'Tubería PVC presión 1 pulgada', unidad_medida: 'metro', costo_unitario: 5800, categoria: 'Tuberías PVC', stock_minimo: 40 },
    { codigo: 'TUB-PVC-1-1/2', nombre: 'Tubería PVC 1-1/2"', descripcion: 'Tubería PVC presión 1-1/2 pulgada', unidad_medida: 'metro', costo_unitario: 8500, categoria: 'Tuberías PVC', stock_minimo: 30 },
    { codigo: 'TUB-PVC-2', nombre: 'Tubería PVC 2"', descripcion: 'Tubería PVC presión 2 pulgadas', unidad_medida: 'metro', costo_unitario: 12000, categoria: 'Tuberías PVC', stock_minimo: 30 },
    { codigo: 'TUB-PVC-3', nombre: 'Tubería PVC 3"', descripcion: 'Tubería PVC presión 3 pulgadas', unidad_medida: 'metro', costo_unitario: 22000, categoria: 'Tuberías PVC', stock_minimo: 20 },
    { codigo: 'TUB-PVC-4', nombre: 'Tubería PVC 4"', descripcion: 'Tubería PVC presión 4 pulgadas', unidad_medida: 'metro', costo_unitario: 35000, categoria: 'Tuberías PVC', stock_minimo: 20 },

    // ═══════════════════════════════════════════════════════════════
    // CODOS PVC
    // ═══════════════════════════════════════════════════════════════
    { codigo: 'COD-PVC-1/2-90', nombre: 'Codo PVC 1/2" x 90°', descripcion: 'Codo PVC presión 1/2" ángulo 90°', unidad_medida: 'unidad', costo_unitario: 800, categoria: 'Accesorios PVC', stock_minimo: 100 },
    { codigo: 'COD-PVC-3/4-90', nombre: 'Codo PVC 3/4" x 90°', descripcion: 'Codo PVC presión 3/4" ángulo 90°', unidad_medida: 'unidad', costo_unitario: 1200, categoria: 'Accesorios PVC', stock_minimo: 100 },
    { codigo: 'COD-PVC-1-90', nombre: 'Codo PVC 1" x 90°', descripcion: 'Codo PVC presión 1" ángulo 90°', unidad_medida: 'unidad', costo_unitario: 1800, categoria: 'Accesorios PVC', stock_minimo: 80 },
    { codigo: 'COD-PVC-2-90', nombre: 'Codo PVC 2" x 90°', descripcion: 'Codo PVC presión 2" ángulo 90°', unidad_medida: 'unidad', costo_unitario: 3500, categoria: 'Accesorios PVC', stock_minimo: 50 },
    { codigo: 'COD-PVC-1/2-45', nombre: 'Codo PVC 1/2" x 45°', descripcion: 'Codo PVC presión 1/2" ángulo 45°', unidad_medida: 'unidad', costo_unitario: 900, categoria: 'Accesorios PVC', stock_minimo: 80 },
    { codigo: 'COD-PVC-3/4-45', nombre: 'Codo PVC 3/4" x 45°', descripcion: 'Codo PVC presión 3/4" ángulo 45°', unidad_medida: 'unidad', costo_unitario: 1300, categoria: 'Accesorios PVC', stock_minimo: 80 },

    // ═══════════════════════════════════════════════════════════════
    // TEES Y UNIONES PVC
    // ═══════════════════════════════════════════════════════════════
    { codigo: 'TEE-PVC-1/2', nombre: 'Tee PVC 1/2"', descripcion: 'Tee PVC presión 1/2"', unidad_medida: 'unidad', costo_unitario: 1200, categoria: 'Accesorios PVC', stock_minimo: 80 },
    { codigo: 'TEE-PVC-3/4', nombre: 'Tee PVC 3/4"', descripcion: 'Tee PVC presión 3/4"', unidad_medida: 'unidad', costo_unitario: 1800, categoria: 'Accesorios PVC', stock_minimo: 80 },
    { codigo: 'TEE-PVC-1', nombre: 'Tee PVC 1"', descripcion: 'Tee PVC presión 1"', unidad_medida: 'unidad', costo_unitario: 2500, categoria: 'Accesorios PVC', stock_minimo: 60 },
    { codigo: 'TEE-PVC-2', nombre: 'Tee PVC 2"', descripcion: 'Tee PVC presión 2"', unidad_medida: 'unidad', costo_unitario: 5000, categoria: 'Accesorios PVC', stock_minimo: 40 },
    { codigo: 'UNI-PVC-1/2', nombre: 'Unión PVC 1/2"', descripcion: 'Unión reparación PVC 1/2"', unidad_medida: 'unidad', costo_unitario: 600, categoria: 'Accesorios PVC', stock_minimo: 100 },
    { codigo: 'UNI-PVC-3/4', nombre: 'Unión PVC 3/4"', descripcion: 'Unión reparación PVC 3/4"', unidad_medida: 'unidad', costo_unitario: 900, categoria: 'Accesorios PVC', stock_minimo: 100 },
    { codigo: 'UNI-PVC-1', nombre: 'Unión PVC 1"', descripcion: 'Unión reparación PVC 1"', unidad_medida: 'unidad', costo_unitario: 1400, categoria: 'Accesorios PVC', stock_minimo: 80 },

    // ═══════════════════════════════════════════════════════════════
    // VÁLVULAS
    // ═══════════════════════════════════════════════════════════════
    { codigo: 'VAL-BOLA-1/2', nombre: 'Válvula Bola 1/2"', descripcion: 'Válvula de bola PVC 1/2"', unidad_medida: 'unidad', costo_unitario: 8500, categoria: 'Válvulas', stock_minimo: 30 },
    { codigo: 'VAL-BOLA-3/4', nombre: 'Válvula Bola 3/4"', descripcion: 'Válvula de bola PVC 3/4"', unidad_medida: 'unidad', costo_unitario: 12000, categoria: 'Válvulas', stock_minimo: 30 },
    { codigo: 'VAL-BOLA-1', nombre: 'Válvula Bola 1"', descripcion: 'Válvula de bola PVC 1"', unidad_medida: 'unidad', costo_unitario: 18000, categoria: 'Válvulas', stock_minimo: 25 },
    { codigo: 'VAL-COMP-1/2', nombre: 'Válvula Compuerta 1/2"', descripcion: 'Válvula compuerta bronce 1/2"', unidad_medida: 'unidad', costo_unitario: 25000, categoria: 'Válvulas', stock_minimo: 20 },
    { codigo: 'VAL-COMP-3/4', nombre: 'Válvula Compuerta 3/4"', descripcion: 'Válvula compuerta bronce 3/4"', unidad_medida: 'unidad', costo_unitario: 35000, categoria: 'Válvulas', stock_minimo: 20 },
    { codigo: 'VAL-CHECK-1/2', nombre: 'Válvula Cheque 1/2"', descripcion: 'Válvula cheque vertical 1/2"', unidad_medida: 'unidad', costo_unitario: 15000, categoria: 'Válvulas', stock_minimo: 25 },
    { codigo: 'VAL-CHECK-3/4', nombre: 'Válvula Cheque 3/4"', descripcion: 'Válvula cheque vertical 3/4"', unidad_medida: 'unidad', costo_unitario: 22000, categoria: 'Válvulas', stock_minimo: 25 },

    // ═══════════════════════════════════════════════════════════════
    // MEDIDORES Y ACCESORIOS
    // ═══════════════════════════════════════════════════════════════
    { codigo: 'MED-AGUA-1/2', nombre: 'Medidor Agua 1/2"', descripcion: 'Medidor de agua domiciliario 1/2"', unidad_medida: 'unidad', costo_unitario: 85000, categoria: 'Medidores', stock_minimo: 15 },
    { codigo: 'MED-AGUA-3/4', nombre: 'Medidor Agua 3/4"', descripcion: 'Medidor de agua domiciliario 3/4"', unidad_medida: 'unidad', costo_unitario: 120000, categoria: 'Medidores', stock_minimo: 10 },
    { codigo: 'CAJA-MED-PL', nombre: 'Caja Medidor Plástica', descripcion: 'Caja protectora para medidor plástica', unidad_medida: 'unidad', costo_unitario: 45000, categoria: 'Medidores', stock_minimo: 20 },
    { codigo: 'CAJA-MED-CO', nombre: 'Caja Medidor Concreto', descripcion: 'Caja protectora para medidor concreto', unidad_medida: 'unidad', costo_unitario: 65000, categoria: 'Medidores', stock_minimo: 15 },
    { codigo: 'TAPA-MED', nombre: 'Tapa para Caja Medidor', descripcion: 'Tapa de hierro para caja de medidor', unidad_medida: 'unidad', costo_unitario: 35000, categoria: 'Medidores', stock_minimo: 20 },

    // ═══════════════════════════════════════════════════════════════
    // PEGANTES Y SELLADORES
    // ═══════════════════════════════════════════════════════════════
    { codigo: 'PEG-PVC-1/4', nombre: 'Pegante PVC 1/4 Galón', descripcion: 'Pegante soldadura PVC 1/4 galón', unidad_medida: 'unidad', costo_unitario: 18000, categoria: 'Pegantes', stock_minimo: 30 },
    { codigo: 'PEG-PVC-1/8', nombre: 'Pegante PVC 1/8 Galón', descripcion: 'Pegante soldadura PVC 1/8 galón', unidad_medida: 'unidad', costo_unitario: 10000, categoria: 'Pegantes', stock_minimo: 50 },
    { codigo: 'LIMP-PVC', nombre: 'Limpiador PVC', descripcion: 'Limpiador preparador para PVC', unidad_medida: 'unidad', costo_unitario: 12000, categoria: 'Pegantes', stock_minimo: 30 },
    { codigo: 'TEFLON-1/2', nombre: 'Teflón 1/2"', descripcion: 'Cinta teflón 1/2" x 10m', unidad_medida: 'rollo', costo_unitario: 1500, categoria: 'Selladores', stock_minimo: 100 },
    { codigo: 'TEFLON-3/4', nombre: 'Teflón 3/4"', descripcion: 'Cinta teflón 3/4" x 10m', unidad_medida: 'rollo', costo_unitario: 2000, categoria: 'Selladores', stock_minimo: 100 },
    { codigo: 'SILI-TRANS', nombre: 'Silicona Transparente', descripcion: 'Silicona selladora transparente 280ml', unidad_medida: 'unidad', costo_unitario: 8500, categoria: 'Selladores', stock_minimo: 40 },
    { codigo: 'SILI-BLANCA', nombre: 'Silicona Blanca', descripcion: 'Silicona selladora blanca 280ml', unidad_medida: 'unidad', costo_unitario: 8500, categoria: 'Selladores', stock_minimo: 40 },

    // ═══════════════════════════════════════════════════════════════
    // HERRAMIENTAS Y CONSUMIBLES
    // ═══════════════════════════════════════════════════════════════
    { codigo: 'LIJA-AGUA-100', nombre: 'Lija de Agua #100', descripcion: 'Lija de agua grano 100', unidad_medida: 'pliego', costo_unitario: 1200, categoria: 'Herramientas', stock_minimo: 50 },
    { codigo: 'LIJA-AGUA-150', nombre: 'Lija de Agua #150', descripcion: 'Lija de agua grano 150', unidad_medida: 'pliego', costo_unitario: 1200, categoria: 'Herramientas', stock_minimo: 50 },
    { codigo: 'BROCHA-2', nombre: 'Brocha 2"', descripcion: 'Brocha para aplicar pegante 2"', unidad_medida: 'unidad', costo_unitario: 3500, categoria: 'Herramientas', stock_minimo: 30 },
    { codigo: 'SEGUETA', nombre: 'Segueta para PVC', descripcion: 'Hoja de segueta para cortar PVC', unidad_medida: 'unidad', costo_unitario: 4500, categoria: 'Herramientas', stock_minimo: 40 },

    // ═══════════════════════════════════════════════════════════════
    // TUBERÍA SANITARIA
    // ═══════════════════════════════════════════════════════════════
    { codigo: 'TUB-SAN-2', nombre: 'Tubería Sanitaria 2"', descripcion: 'Tubería PVC sanitaria 2"', unidad_medida: 'metro', costo_unitario: 8500, categoria: 'Tubería Sanitaria', stock_minimo: 40 },
    { codigo: 'TUB-SAN-3', nombre: 'Tubería Sanitaria 3"', descripcion: 'Tubería PVC sanitaria 3"', unidad_medida: 'metro', costo_unitario: 14000, categoria: 'Tubería Sanitaria', stock_minimo: 30 },
    { codigo: 'TUB-SAN-4', nombre: 'Tubería Sanitaria 4"', descripcion: 'Tubería PVC sanitaria 4"', unidad_medida: 'metro', costo_unitario: 22000, categoria: 'Tubería Sanitaria', stock_minimo: 30 },
    { codigo: 'TUB-SAN-6', nombre: 'Tubería Sanitaria 6"', descripcion: 'Tubería PVC sanitaria 6"', unidad_medida: 'metro', costo_unitario: 45000, categoria: 'Tubería Sanitaria', stock_minimo: 20 },
    { codigo: 'COD-SAN-2-90', nombre: 'Codo Sanitario 2" x 90°', descripcion: 'Codo PVC sanitario 2" x 90°', unidad_medida: 'unidad', costo_unitario: 3200, categoria: 'Tubería Sanitaria', stock_minimo: 50 },
    { codigo: 'COD-SAN-3-90', nombre: 'Codo Sanitario 3" x 90°', descripcion: 'Codo PVC sanitario 3" x 90°', unidad_medida: 'unidad', costo_unitario: 5500, categoria: 'Tubería Sanitaria', stock_minimo: 40 },
    { codigo: 'COD-SAN-4-90', nombre: 'Codo Sanitario 4" x 90°', descripcion: 'Codo PVC sanitario 4" x 90°', unidad_medida: 'unidad', costo_unitario: 9500, categoria: 'Tubería Sanitaria', stock_minimo: 30 },
    { codigo: 'YEE-SAN-4x2', nombre: 'Yee Sanitaria 4"x2"', descripcion: 'Yee reducción PVC sanitaria 4"x2"', unidad_medida: 'unidad', costo_unitario: 12000, categoria: 'Tubería Sanitaria', stock_minimo: 25 },
    { codigo: 'YEE-SAN-4x4', nombre: 'Yee Sanitaria 4"x4"', descripcion: 'Yee PVC sanitaria 4"x4"', unidad_medida: 'unidad', costo_unitario: 15000, categoria: 'Tubería Sanitaria', stock_minimo: 25 },
    { codigo: 'SIFON-2', nombre: 'Sifón 2"', descripcion: 'Sifón PVC sanitario 2"', unidad_medida: 'unidad', costo_unitario: 8500, categoria: 'Tubería Sanitaria', stock_minimo: 30 },
    { codigo: 'SIFON-3', nombre: 'Sifón 3"', descripcion: 'Sifón PVC sanitario 3"', unidad_medida: 'unidad', costo_unitario: 12000, categoria: 'Tubería Sanitaria', stock_minimo: 25 },

    // ═══════════════════════════════════════════════════════════════
    // GRIFERÍA
    // ═══════════════════════════════════════════════════════════════
    { codigo: 'GRIF-LAV-SENC', nombre: 'Grifería Lavamanos Sencilla', descripcion: 'Grifería lavamanos sencilla cromada', unidad_medida: 'unidad', costo_unitario: 35000, categoria: 'Grifería', stock_minimo: 15 },
    { codigo: 'GRIF-LAV-MONO', nombre: 'Grifería Lavamanos Monocontrol', descripcion: 'Grifería lavamanos monocontrol cromada', unidad_medida: 'unidad', costo_unitario: 85000, categoria: 'Grifería', stock_minimo: 10 },
    { codigo: 'GRIF-DUCHA', nombre: 'Grifería Ducha', descripcion: 'Grifería ducha sencilla cromada', unidad_medida: 'unidad', costo_unitario: 45000, categoria: 'Grifería', stock_minimo: 15 },
    { codigo: 'GRIF-LAV-PLAT', nombre: 'Grifería Lavaplatos', descripcion: 'Grifería lavaplatos cuello de ganso', unidad_medida: 'unidad', costo_unitario: 55000, categoria: 'Grifería', stock_minimo: 12 },
    { codigo: 'LLAVE-JARD', nombre: 'Llave Jardín', descripcion: 'Llave de jardín cromada 1/2"', unidad_medida: 'unidad', costo_unitario: 18000, categoria: 'Grifería', stock_minimo: 25 },
    { codigo: 'LLAVE-MANG', nombre: 'Llave Manguera', descripcion: 'Llave para manguera 1/2"', unidad_medida: 'unidad', costo_unitario: 12000, categoria: 'Grifería', stock_minimo: 30 },

    // ═══════════════════════════════════════════════════════════════
    // ACCESORIOS SANITARIOS
    // ═══════════════════════════════════════════════════════════════
    { codigo: 'FLOT-TANQ', nombre: 'Flotador Tanque', descripcion: 'Flotador para tanque sanitario', unidad_medida: 'unidad', costo_unitario: 15000, categoria: 'Accesorios Sanitarios', stock_minimo: 25 },
    { codigo: 'VALV-DESC', nombre: 'Válvula Descarga', descripcion: 'Válvula de descarga para sanitario', unidad_medida: 'unidad', costo_unitario: 22000, categoria: 'Accesorios Sanitarios', stock_minimo: 20 },
    { codigo: 'MANG-ABAST', nombre: 'Manguera Abasto', descripcion: 'Manguera de abasto flexible 40cm', unidad_medida: 'unidad', costo_unitario: 8500, categoria: 'Accesorios Sanitarios', stock_minimo: 40 },
    { codigo: 'EMPAQ-CERA', nombre: 'Empaque Cera', descripcion: 'Empaque de cera para sanitario', unidad_medida: 'unidad', costo_unitario: 6500, categoria: 'Accesorios Sanitarios', stock_minimo: 30 },
    { codigo: 'TORN-SANIT', nombre: 'Tornillos Sanitario', descripcion: 'Juego tornillos fijación sanitario', unidad_medida: 'juego', costo_unitario: 5500, categoria: 'Accesorios Sanitarios', stock_minimo: 30 },

    // ═══════════════════════════════════════════════════════════════
    // CEMENTO Y CONSTRUCCIÓN
    // ═══════════════════════════════════════════════════════════════
    { codigo: 'CEM-GRIS-50', nombre: 'Cemento Gris 50kg', descripcion: 'Bulto cemento gris 50 kilogramos', unidad_medida: 'bulto', costo_unitario: 32000, categoria: 'Construcción', stock_minimo: 20 },
    { codigo: 'ARENA-RIO', nombre: 'Arena de Río', descripcion: 'Arena de río lavada', unidad_medida: 'metro3', costo_unitario: 85000, categoria: 'Construcción', stock_minimo: 5 },
    { codigo: 'GRAVA-1/2', nombre: 'Gravilla 1/2"', descripcion: 'Gravilla triturada 1/2"', unidad_medida: 'metro3', costo_unitario: 95000, categoria: 'Construcción', stock_minimo: 5 },
    { codigo: 'LADRILLO', nombre: 'Ladrillo Común', descripcion: 'Ladrillo tolete común', unidad_medida: 'unidad', costo_unitario: 650, categoria: 'Construcción', stock_minimo: 200 },
];


// ═══════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════════

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function login() {
    console.log('🔐 Iniciando sesión como analista de inventario...');

    const response = await makeRequest({
        hostname: API_URL,
        port: API_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { username: CREDENTIALS.email, password: CREDENTIALS.password });

    if (response.status !== 201 && response.status !== 200) {
        throw new Error(`Error de login: ${JSON.stringify(response.data)}`);
    }

    console.log('✅ Sesión iniciada correctamente');
    return response.data.access_token;
}

async function createMaterial(token, material) {
    const response = await makeRequest({
        hostname: API_URL,
        port: API_PORT,
        path: '/api/materials',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }, { ...material, estado: 'activo' });

    return response;
}

async function getMaterials(token) {
    const response = await makeRequest({
        hostname: API_URL,
        port: API_PORT,
        path: '/api/materials?limit=1000',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    return response.data?.data || [];
}

// ═══════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════

async function seedMaterials() {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     🏭 SEED DE CATÁLOGO DE MATERIALES - ServiceOps Pro     ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    try {
        // 1. Login
        const token = await login();

        // 2. Obtener materiales existentes
        console.log('📋 Verificando materiales existentes...');
        const existingMaterials = await getMaterials(token);
        const existingCodes = new Set(existingMaterials.map(m => m.codigo));
        console.log(`   Encontrados: ${existingMaterials.length} materiales`);

        // 3. Filtrar materiales nuevos
        const newMaterials = MATERIALES.filter(m => !existingCodes.has(m.codigo));
        console.log(`   Nuevos a crear: ${newMaterials.length} materiales`);
        console.log('');

        if (newMaterials.length === 0) {
            console.log('✅ Todos los materiales ya existen en el catálogo.');
            return;
        }

        // 4. Crear materiales
        console.log('📦 Creando materiales...');
        console.log('─'.repeat(60));

        let created = 0;
        let errors = 0;
        const categories = {};

        for (const material of newMaterials) {
            const result = await createMaterial(token, material);

            if (result.status === 201 || result.status === 200) {
                created++;
                categories[material.categoria] = (categories[material.categoria] || 0) + 1;
                process.stdout.write(`\r   ✅ Creados: ${created} | ❌ Errores: ${errors}`);
            } else {
                errors++;
                process.stdout.write(`\r   ✅ Creados: ${created} | ❌ Errores: ${errors}`);
            }

            // Pequeña pausa para no saturar el servidor
            await new Promise(r => setTimeout(r, 50));
        }

        console.log('\n');
        console.log('─'.repeat(60));
        console.log('');

        // 5. Resumen por categoría
        console.log('📊 RESUMEN POR CATEGORÍA:');
        console.log('');
        Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .forEach(([cat, count]) => {
                console.log(`   📁 ${cat}: ${count} materiales`);
            });

        console.log('');
        console.log('═'.repeat(60));
        console.log(`🎉 PROCESO COMPLETADO`);
        console.log(`   ✅ Materiales creados: ${created}`);
        console.log(`   ❌ Errores: ${errors}`);
        console.log(`   📦 Total en catálogo: ${existingMaterials.length + created}`);
        console.log('═'.repeat(60));

    } catch (error) {
        console.error('');
        console.error('❌ ERROR:', error.message);
        console.error('');
        console.error('Asegúrate de que:');
        console.error('  1. El backend esté corriendo en http://localhost:3001');
        console.error('  2. Exista el usuario inventario@test.com con contraseña 123456');
        console.error('  3. El usuario tenga rol "analista_inventario_oculto"');
    }
}

// Ejecutar
seedMaterials();
