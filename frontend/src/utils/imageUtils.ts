/**
 * Utilidades para manejo y compresión de imágenes - Versión Ultra Comprimida
 */

export interface ImageCompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'webp' | 'png';
}

/**
 * Comprime una imagen manteniendo la calidad visual pero reduciendo el tamaño drásticamente
 */
export const compressImage = (
    file: File,
    options: ImageCompressionOptions = {}
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const {
            maxWidth = 480,
            maxHeight = 360,
            quality = 0.5,
            format = 'jpeg'
        } = options;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calcular nuevas dimensiones manteniendo aspect ratio
            let { width, height } = img;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            // Configurar canvas
            canvas.width = width;
            canvas.height = height;

            if (!ctx) {
                reject(new Error('No se pudo obtener el contexto del canvas'));
                return;
            }

            // Dibujar imagen redimensionada
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir a base64 comprimido
            const mimeType = `image/${format}`;
            const compressedDataUrl = canvas.toDataURL(mimeType, quality);

            resolve(compressedDataUrl);
        };

        img.onerror = () => {
            reject(new Error('Error al cargar la imagen'));
        };

        // Crear URL de la imagen
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };
        reader.onerror = () => {
            reject(new Error('Error al leer el archivo'));
        };
        reader.readAsDataURL(file);
    });
};

/**
 * Convierte un data URL a un tamaño estimado en KB
 */
export const getImageSizeKB = (dataUrl: string): number => {
    // Remover el prefijo data:image/...;base64,
    const base64 = dataUrl.split(',')[1] || dataUrl;

    // Calcular tamaño aproximado (base64 es ~33% más grande que el binario)
    const sizeInBytes = (base64.length * 3) / 4;
    return Math.round(sizeInBytes / 1024);
};

/**
 * Valida si una imagen es demasiado grande
 */
export const validateImageSize = (dataUrl: string, maxSizeKB: number = 80): boolean => {
    return getImageSizeKB(dataUrl) <= maxSizeKB;
};

/**
 * Comprime una imagen hasta que esté bajo el límite de tamaño especificado
 */
export const compressToSize = async (
    file: File,
    maxSizeKB: number = 80, // Muy pequeño para evitar errores 413
    maxAttempts: number = 10
): Promise<string> => {
    let quality = 0.6;
    let maxWidth = 400;
    let maxHeight = 300;
    let attempt = 0;

    console.log(`🔄 Iniciando compresión ultra agresiva con objetivo: ${maxSizeKB}KB`);

    while (attempt < maxAttempts) {
        const compressed = await compressImage(file, {
            maxWidth,
            maxHeight,
            quality,
            format: 'jpeg'
        });

        const currentSize = getImageSizeKB(compressed);
        console.log(`📸 Intento ${attempt + 1}: ${currentSize}KB (objetivo: ${maxSizeKB}KB)`);

        if (validateImageSize(compressed, maxSizeKB)) {
            console.log(`✅ Compresión exitosa: ${currentSize}KB`);
            return compressed;
        }

        // Estrategia ultra agresiva de reducción
        if (attempt < 3) {
            // Primeros intentos: reducir calidad drásticamente
            quality = Math.max(0.1, quality - 0.2);
        } else if (attempt < 6) {
            // Intentos medios: reducir dimensiones drásticamente
            maxWidth = Math.max(200, maxWidth - 50);
            maxHeight = Math.max(150, maxHeight - 37);
            quality = Math.max(0.05, quality - 0.1);
        } else {
            // Últimos intentos: ultra agresivo
            maxWidth = Math.max(120, maxWidth - 30);
            maxHeight = Math.max(90, maxHeight - 22);
            quality = Math.max(0.02, quality - 0.02);
        }

        attempt++;
    }

    // Si no se pudo comprimir lo suficiente, usar configuración ultra mínima
    console.log('⚠️ Usando compresión ultra mínima como último recurso');
    return compressImage(file, {
        maxWidth: 120,
        maxHeight: 90,
        quality: 0.02,
        format: 'jpeg'
    });
};