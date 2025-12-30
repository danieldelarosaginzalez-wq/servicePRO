import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface VisitReportData {
    numero_comprobante: string;
    identificacion_servicio: {
        poliza: string;
        abonado: string;
        direccion: string;
        telefono?: string;
    };
    bloque_operativo: {
        operario: string;
        tipo_proceso: string;
        fecha_visita: string;
        hora_inicio?: string;
        hora_fin?: string;
        orden?: string;
    };
    trabajo_realizado: {
        descripcion: string;
        observaciones?: string;
        materiales_utilizados?: { nombre: string; cantidad: number; unidad: string }[];
    };
    firmas?: {
        operario?: { nombre: string; fecha: string; firma_base64?: string };
        usuario_suscriptor?: { nombre: string; documento?: string; fecha: string; firma_base64?: string };
        funcionario?: { nombre: string; cargo?: string; fecha: string; firma_base64?: string };
    };
    estado: string;
    fecha_creacion: string;
}

const C = {
    navy: [15, 32, 65] as [number, number, number],
    gold: [212, 175, 55] as [number, number, number],
    goldLight: [255, 248, 220] as [number, number, number],
    teal: [0, 128, 128] as [number, number, number],
    emerald: [34, 139, 34] as [number, number, number],
    slate: [71, 85, 105] as [number, number, number],
    charcoal: [45, 55, 72] as [number, number, number],
    silver: [180, 180, 180] as [number, number, number],
    pearl: [248, 250, 252] as [number, number, number],
    cream: [255, 253, 245] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    warning: [218, 165, 32] as [number, number, number],
};


const drawCorner = (doc: jsPDF, x: number, y: number, pos: string) => {
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(1.5);
    const s = 8;
    if (pos === 'tl') { doc.line(x, y + s, x, y); doc.line(x, y, x + s, y); }
    if (pos === 'tr') { doc.line(x - s, y, x, y); doc.line(x, y, x, y + s); }
    if (pos === 'bl') { doc.line(x, y - s, x, y); doc.line(x, y, x + s, y); }
    if (pos === 'br') { doc.line(x - s, y, x, y); doc.line(x, y, x, y - s); }
};

const drawSection = (doc: jsPDF, title: string, y: number, m: number, pw: number): number => {
    doc.setFillColor(...C.navy);
    doc.roundedRect(m, y, pw - m * 2, 10, 2, 2, 'F');
    doc.setFillColor(...C.gold);
    doc.rect(m, y, 5, 10, 'F');
    doc.setTextColor(...C.gold);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title, m + 10, y + 7);
    return y + 14;
};

const drawBox = (doc: jsPDF, label: string, value: string, x: number, y: number, w: number, h: number = 20) => {
    doc.setFillColor(...C.white);
    doc.setDrawColor(...C.navy);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, y, w, h, 2, 2, 'FD');
    doc.setFillColor(...C.navy);
    doc.roundedRect(x, y, w, 6, 2, 0, 'F');
    doc.rect(x, y + 4, w, 2, 'F');
    doc.setTextColor(...C.gold);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(label, x + 3, y + 4.5);
    doc.setTextColor(...C.charcoal);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const val = (value || '-').substring(0, 45);
    doc.text(val, x + 3, y + 13);
};

const drawFirma = (doc: jsPDF, title: string, firma: any, x: number, y: number, w: number, h: number) => {
    doc.setFillColor(...C.cream);
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.8);
    doc.roundedRect(x, y, w, h, 3, 3, 'FD');
    doc.setFillColor(...C.navy);
    doc.roundedRect(x, y, w, 9, 3, 0, 'F');
    doc.rect(x, y + 7, w, 2, 'F');
    doc.setTextColor(...C.gold);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(title, x + w / 2, y + 6, { align: 'center' });
    doc.setDrawColor(...C.silver);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(x + 8, y + h - 15, x + w - 8, y + h - 15);
    doc.setLineDashPattern([], 0);
    if (firma) {
        doc.setTextColor(...C.charcoal);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(firma.nombre || '', x + w / 2, y + h - 20, { align: 'center' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C.slate);
        const info = firma.documento ? `Doc: ${firma.documento}` : firma.cargo || '';
        doc.text(info, x + w / 2, y + h - 8, { align: 'center' });
        doc.setFillColor(...C.emerald);
        doc.circle(x + w - 8, y + 14, 4, 'F');
        doc.setTextColor(...C.white);
        doc.setFontSize(7);
        doc.text('✓', x + w - 10, y + 16);
    } else {
        doc.setTextColor(...C.silver);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text('Pendiente', x + w / 2, y + h - 22, { align: 'center' });
    }
};


export const generateVisitReportPDF = (report: VisitReportData) => {
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const m = 14;
    let y = 0;

    // Marco exterior triple
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(2.5);
    doc.rect(4, 4, pw - 8, ph - 8);
    doc.setDrawColor(...C.navy);
    doc.setLineWidth(1);
    doc.rect(7, 7, pw - 14, ph - 14);
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.3);
    doc.rect(9, 9, pw - 18, ph - 18);

    // Esquinas decorativas
    drawCorner(doc, 12, 12, 'tl');
    drawCorner(doc, pw - 12, 12, 'tr');
    drawCorner(doc, 12, ph - 12, 'bl');
    drawCorner(doc, pw - 12, ph - 12, 'br');

    // Header navy con patron
    doc.setFillColor(...C.navy);
    doc.rect(9, 9, pw - 18, 40, 'F');
    doc.setDrawColor(25, 42, 85);
    doc.setLineWidth(0.2);
    for (let i = 0; i < 20; i++) { doc.line(9 + i * 12, 9, 9 + i * 12 + 40, 49); }

    // Linea dorada superior
    doc.setFillColor(...C.gold);
    doc.rect(9, 9, pw - 18, 2.5, 'F');

    // Logo circular
    doc.setFillColor(...C.gold);
    doc.circle(32, 30, 13, 'F');
    doc.setFillColor(...C.navy);
    doc.circle(32, 30, 11, 'F');
    doc.setFillColor(...C.gold);
    doc.circle(32, 30, 9, 'F');
    doc.setTextColor(...C.navy);
    doc.setFontSize(14);
    doc.text('⚡', 28, 34);

    // Nombre empresa
    doc.setTextColor(...C.gold);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ServiceOps', 50, 26);
    doc.setTextColor(...C.white);
    doc.text('Pro', 113, 26);
    doc.setTextColor(...C.goldLight);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('━━  GESTION INTEGRAL DE SERVICIOS TECNICOS  ━━', 50, 34);
    doc.setTextColor(...C.silver);
    doc.setFontSize(7);
    doc.text('NIT: 900.XXX.XXX-X  |  Tel: (601) XXX-XXXX  |  www.serviceops-pro.com', 50, 42);


    // Badge comprobante
    doc.setFillColor(...C.cream);
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(1.2);
    doc.roundedRect(pw - 70, 14, 56, 32, 3, 3, 'FD');
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.3);
    doc.roundedRect(pw - 68, 16, 52, 28, 2, 2, 'S');
    doc.setTextColor(...C.navy);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPROBANTE OFICIAL', pw - 42, 22, { align: 'center' });
    doc.setTextColor(...C.gold);
    doc.setFontSize(10);
    doc.text(`N° ${report.numero_comprobante || 'CV-000000'}`, pw - 42, 31, { align: 'center' });

    // Estado badge
    const estados: { [k: string]: { c: [number, number, number]; t: string } } = {
        'borrador': { c: C.slate, t: '📝 BORRADOR' },
        'pendiente_firma': { c: C.warning, t: '⏳ PENDIENTE' },
        'firmado': { c: C.teal, t: '✓ FIRMADO' },
        'finalizado': { c: C.emerald, t: '✅ COMPLETADO' },
    };
    const est = estados[report.estado] || estados['borrador'];
    doc.setFillColor(...est.c);
    doc.roundedRect(pw - 63, 36, 42, 7, 2, 2, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(6);
    doc.text(est.t, pw - 42, 41, { align: 'center' });

    // Linea dorada separadora
    doc.setFillColor(...C.gold);
    doc.rect(9, 49, pw - 18, 2, 'F');

    y = 58;

    // Titulo documento
    doc.setFillColor(...C.pearl);
    doc.roundedRect(m, y, pw - m * 2, 12, 3, 3, 'F');
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.5);
    doc.roundedRect(m, y, pw - m * 2, 12, 3, 3, 'S');
    doc.setFillColor(...C.gold);
    doc.rect(m, y, 4, 12, 'F');
    doc.rect(pw - m - 4, y, 4, 12, 'F');
    doc.setTextColor(...C.navy);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('📋  COMPROBANTE DE VISITA TECNICA', pw / 2, y + 8.5, { align: 'center' });

    y += 18;

    // SECCION: Identificacion
    y = drawSection(doc, '🏠  IDENTIFICACION DEL SERVICIO', y, m, pw);
    const c3 = (pw - m * 2 - 10) / 3;
    const c2 = (pw - m * 2 - 5) / 2;
    drawBox(doc, 'N° POLIZA', report.identificacion_servicio?.poliza || '', m, y, c3);
    drawBox(doc, 'CLIENTE / ABONADO', report.identificacion_servicio?.abonado || '', m + c3 + 5, y, c3);
    drawBox(doc, 'TELEFONO', report.identificacion_servicio?.telefono || 'No registrado', m + (c3 + 5) * 2, y, c3);
    y += 24;
    drawBox(doc, 'DIRECCION COMPLETA DEL SERVICIO', report.identificacion_servicio?.direccion || '', m, y, pw - m * 2, 18);
    y += 24;


    // SECCION: Info operativa
    y = drawSection(doc, '👷  INFORMACION OPERATIVA', y, m, pw);
    drawBox(doc, 'TECNICO RESPONSABLE', report.bloque_operativo?.operario || '', m, y, c2);
    drawBox(doc, 'TIPO DE PROCESO', report.bloque_operativo?.tipo_proceso || '', m + c2 + 5, y, c2);
    y += 24;

    const fecha = report.bloque_operativo?.fecha_visita
        ? new Date(report.bloque_operativo.fecha_visita).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : 'No especificada';
    const c4 = (pw - m * 2 - 15) / 4;
    drawBox(doc, 'FECHA DE VISITA', fecha, m, y, c4 * 2 + 5);
    drawBox(doc, 'HORA INICIO', report.bloque_operativo?.hora_inicio || '--:--', m + c4 * 2 + 10, y, c4);
    drawBox(doc, 'HORA FIN', report.bloque_operativo?.hora_fin || '--:--', m + c4 * 3 + 15, y, c4);
    y += 26;

    // SECCION: Trabajo realizado
    y = drawSection(doc, '🔧  DESCRIPCION DEL TRABAJO REALIZADO', y, m, pw);

    // Caja descripcion
    doc.setFillColor(...C.white);
    doc.setDrawColor(...C.navy);
    doc.setLineWidth(0.4);
    doc.roundedRect(m, y, pw - m * 2, 28, 3, 3, 'FD');
    doc.setFillColor(...C.navy);
    doc.circle(m + 7, y + 7, 4, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(6);
    doc.text('📝', m + 4.5, y + 8.5);
    doc.setTextColor(...C.slate);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE:', m + 14, y + 8);
    doc.setTextColor(...C.charcoal);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const desc = report.trabajo_realizado?.descripcion || 'Sin descripcion.';
    const splitD = doc.splitTextToSize(desc, pw - m * 2 - 12);
    doc.text(splitD.slice(0, 3), m + 5, y + 16);
    y += 32;

    // Observaciones
    doc.setFillColor(...C.goldLight);
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.6);
    doc.roundedRect(m, y, pw - m * 2, 18, 3, 3, 'FD');
    doc.setFillColor(...C.gold);
    doc.rect(m, y, 4, 18, 'F');
    doc.setTextColor(...C.charcoal);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠️  OBSERVACIONES:', m + 8, y + 6);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const obs = report.trabajo_realizado?.observaciones || 'Sin observaciones.';
    const splitO = doc.splitTextToSize(obs, pw - m * 2 - 14);
    doc.text(splitO.slice(0, 2), m + 8, y + 13);
    y += 24;


    // SECCION: Materiales
    if (report.trabajo_realizado?.materiales_utilizados?.length) {
        y = drawSection(doc, '📦  MATERIALES UTILIZADOS', y, m, pw);
        const tData = report.trabajo_realizado.materiales_utilizados.map((mat, i) => [
            String(i + 1).padStart(2, '0'), mat.nombre, String(mat.cantidad), mat.unidad, '✓ Aplicado'
        ]);
        (doc as any).autoTable({
            startY: y,
            head: [['N°', 'DESCRIPCION DEL MATERIAL', 'CANT.', 'UNIDAD', 'ESTADO']],
            body: tData,
            margin: { left: m, right: m },
            styles: { fontSize: 8, cellPadding: 2.5, lineColor: C.navy, lineWidth: 0.15 },
            headStyles: { fillColor: C.navy, textColor: C.gold, fontStyle: 'bold', halign: 'center', fontSize: 7 },
            bodyStyles: { fillColor: C.white, textColor: C.charcoal },
            alternateRowStyles: { fillColor: C.pearl },
            columnStyles: {
                0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
                3: { cellWidth: 22, halign: 'center' },
                4: { cellWidth: 26, halign: 'center', textColor: C.emerald, fontStyle: 'bold' },
            },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
    }

    // Nueva pagina si es necesario
    if (y > 200) {
        doc.addPage();
        doc.setDrawColor(...C.gold); doc.setLineWidth(2.5); doc.rect(4, 4, pw - 8, ph - 8);
        doc.setDrawColor(...C.navy); doc.setLineWidth(1); doc.rect(7, 7, pw - 14, ph - 14);
        doc.setDrawColor(...C.gold); doc.setLineWidth(0.3); doc.rect(9, 9, pw - 18, ph - 18);
        drawCorner(doc, 12, 12, 'tl'); drawCorner(doc, pw - 12, 12, 'tr');
        drawCorner(doc, 12, ph - 12, 'bl'); drawCorner(doc, pw - 12, ph - 12, 'br');
        y = 20;
    }

    // SECCION: Firmas
    y = drawSection(doc, '✍️  FIRMAS Y CONFORMIDAD', y, m, pw);
    const fw = (pw - m * 2 - 14) / 3;
    const fh = 48;
    drawFirma(doc, 'TECNICO / OPERARIO', report.firmas?.operario, m, y, fw, fh);
    drawFirma(doc, 'CLIENTE / SUSCRIPTOR', report.firmas?.usuario_suscriptor, m + fw + 7, y, fw, fh);
    drawFirma(doc, 'FUNCIONARIO EMPRESA', report.firmas?.funcionario, m + (fw + 7) * 2, y, fw, fh);
    y += fh + 8;


    // Codigo verificacion
    doc.setFillColor(...C.pearl);
    doc.roundedRect(m, y, pw - m * 2, 16, 3, 3, 'F');
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.3);
    doc.roundedRect(m, y, pw - m * 2, 16, 3, 3, 'S');

    // QR simulado
    doc.setFillColor(...C.navy);
    doc.rect(m + 4, y + 3, 10, 10, 'F');
    doc.setFillColor(...C.white);
    doc.rect(m + 5.5, y + 4.5, 2.5, 2.5, 'F');
    doc.rect(m + 9.5, y + 4.5, 2.5, 2.5, 'F');
    doc.rect(m + 5.5, y + 8.5, 2.5, 2.5, 'F');
    doc.rect(m + 8, y + 7, 1.5, 1.5, 'F');

    doc.setTextColor(...C.slate);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Codigo de verificacion:', m + 18, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.navy);
    doc.text(`${report.numero_comprobante}-${Date.now().toString(36).toUpperCase()}`, m + 18, y + 11);
    doc.setTextColor(...C.slate);
    doc.setFont('helvetica', 'normal');
    doc.text('Verifique autenticidad en: www.serviceops-pro.com/verificar', m + 18, y + 15);

    // Footer
    const fy = ph - 16;
    doc.setFillColor(...C.navy);
    doc.rect(9, fy - 2, pw - 18, 12, 'F');
    doc.setFillColor(...C.gold);
    doc.rect(9, fy - 2, pw - 18, 1.5, 'F');
    doc.setTextColor(...C.goldLight);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('ServiceOps Pro © 2024 - Todos los derechos reservados', m, fy + 3);
    doc.text('Documento oficial - Comprobante de visita tecnica', m, fy + 7);
    doc.setFont('helvetica', 'bold');
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, pw - m, fy + 3, { align: 'right' });
    doc.text('Pagina 1 de 1', pw - m, fy + 7, { align: 'right' });

    // Guardar
    const fileName = `Comprobante_${report.numero_comprobante || 'Visita'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};
