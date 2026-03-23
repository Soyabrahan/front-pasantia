import jsPDF from 'jspdf';


interface Conceptos {
    donacion: boolean;
    devolucion: boolean;
    prestamo: boolean;
    reparacion: boolean;
    revision: boolean;
    vendido: boolean;
    foraneo: boolean;
}

interface FormData {
    numeroPase: string;
    concepto: Conceptos;
    embarqueseA: string;
    ordenCompra: string;
    direccion: string;
    telefono: string;
    contado: boolean;
    credito: boolean;
    conductor: string;
    fichaConductor: string;
    vehiculoFmo: string;
    vehiculoParticular: string;
    departamento: string;
    cargo: string;

    fichaDespachador: string;
    despachadoPor: string;
    dirigidoA: string;
    solicitud: string;
    conceptoNombre?: string;
    tiempoEstimado?: string;

    // Authorization Info
    autorizadoPor?: string;
    cargoAutorizador?: string;
    fichaAutorizador?: string;

    // Applicant Info
    solicitante?: string;
    fichaSolicitante?: string;
    cargoSolicitante?: string;
    departamentoSolicitante?: string;
}

interface Item {
    cantidad: string | number;
    unidad: string;
    descripcion: string;
    fmos?: string;
}

export const generatePDF = (formData: FormData, items: Item[]) => {
    // 1. Setup
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'letter',
    });

    const margin = 10;
    const pageW = 279.4; // Landscape width
    const pageH = 215.9; // Landscape height
    const contentW = pageW - 2 * margin;
    const contentH = pageH - 2 * margin;

    // Helper to draw text
    const drawT = (
        text: string,
        x: number,
        y: number,
        fontSize: number = 8,
        fontStyle: 'normal' | 'bold' = 'normal',
        align: 'left' | 'center' | 'right' = 'left'
    ) => {
        doc.setFont('helvetica', fontStyle);
        doc.setFontSize(fontSize);
        doc.setTextColor(0);
        doc.text(String(text || ''), x, y, { align });
    };

    // Helper for rectangles
    const rect = (x: number, y: number, w: number, h: number, style?: string) => {
        doc.setLineWidth(0.3);
        doc.rect(x, y, w, h, style);
    };

    // --- MAIN BORDER ---
    doc.setLineWidth(1);
    doc.rect(margin, margin, contentW, contentH);
    doc.setLineWidth(0.3);

    // ============================================
    // HEADER SECTION (Top)
    // ============================================
    const headerH = 25;
    const logoBoxW = 40;

    // Vertical Line for Logo Box
    doc.line(margin + logoBoxW, margin, margin + logoBoxW, margin + headerH);
    // Bottom Line of Header
    doc.line(margin, margin + headerH, margin + contentW, margin + headerH);

    // Box 1: Logo / Reference
    rect(margin, margin, logoBoxW, 5); // Small top box "FERRO-1067..."
    drawT('FERRO-1067 17/09/20', margin + 20, margin + 3.5, 6, 'normal', 'center');

    // Draw Logo (Image from public folder)
    const lx = margin + 10;
    const ly = margin + 8;
    const lw = 15;
    const lh = 15;

    try {
        // Using PNG version of ferro.ico for compatibility
        doc.addImage('/ferro.png', 'PNG', lx, ly, lw, lh);
    } catch (e) {
        // Fallback to a red square if image fails
        doc.setFillColor(190, 30, 45);
        doc.rect(lx, ly, lw, lh, 'F');
    }

    doc.setLineWidth(0.3);
    doc.setDrawColor(0);

    // Box 2: Title & Number
    drawT('PASE PARA MATERIALES Y MISCELÁNEOS', margin + logoBoxW + (contentW - logoBoxW) / 2, margin + 12, 14, 'bold', 'center');

    // Number (N. 86471)
    drawT(`N.º ${formData.numeroPase || '86473'}`, margin + contentW - 5, margin + 20, 18, 'bold', 'right');

    // ============================================
    // MIDDLE SECTION (Concept / Data)
    // ============================================
    const midY = margin + headerH;
    const leftColW = contentW * 0.31; // Exact proportion from image
    const rightColW = contentW - leftColW;
    const rightX = margin + leftColW;

    // Define authY early to avoid ReferenceError
    const authY = midY + 40; 
    const midH = authY - midY + 40; // Total height of mid section (including auth)

    // Main Vertical Divider (Between Left/Right)
    doc.line(rightX, midY, rightX, midY + 74); 

    // --- LEFT COLUMN (Concept + Auth) ---
    // Header "CONCEPTO:"
    drawT('CONCEPTO:', margin + 1, midY + 4, 7, 'bold');

    const checkboxes = [
        { k: 'donacion', l: 'DONACIÓN' },
        { k: 'devolucion', l: 'DEVOLUCIÓN' },
        { k: 'prestamo', l: 'PRÉSTAMO' },
        { k: 'reparacion', l: 'REPARACIÓN' },
        { k: 'revision', l: 'REVISIÓN' },
        { k: 'vendido', l: 'VENDIDO' },
        { k: 'foraneo', l: 'FORÁNEO' },
    ];

    let cy = midY + 7;
    checkboxes.forEach((c) => {
        rect(margin + 5, cy, 3, 3);
        drawT(c.l, margin + 9, cy + 2.3, 6);
        // @ts-ignore
        if (formData.concepto && formData.concepto[c.k]) {
            drawT('X', margin + 5.5, cy + 2.2, 7, 'bold');
        }
        cy += 4.5;
    });

    // "Tiempo estimado" Box
    const timeBoxX = margin + 38;
    const timeBoxY = midY + 5;
    const timeBoxW = 40;
    drawT('Tiempo estimado de', timeBoxX + timeBoxW / 2, timeBoxY + 1, 6, 'normal', 'center');
    drawT('Regreso a la Empresa', timeBoxX + timeBoxW / 2, timeBoxY + 4, 6, 'normal', 'center');
    
    // Lines for Return Time
    doc.line(timeBoxX + 10, timeBoxY + 11, timeBoxX + timeBoxW - 5, timeBoxY + 11);
    doc.line(timeBoxX + 10, timeBoxY + 14.5, timeBoxX + timeBoxW - 5, timeBoxY + 14.5);
    doc.line(timeBoxX + 10, timeBoxY + 18, timeBoxX + timeBoxW - 5, timeBoxY + 18);

    if (formData.tiempoEstimado) {
        drawT(formData.tiempoEstimado, timeBoxX + 10, timeBoxY + 10, 7);
    }

    // --- DATA FIELDS (Right Column Rows) ---
    const rowH = 10;
    
    // Row 1: EMBÁRQUESE A | N.º ORDEN DE COMPRA
    const row1Y = midY;
    const ordenX = margin + contentW - 40;
    doc.line(rightX, row1Y + rowH, margin + contentW, row1Y + rowH);
    doc.line(ordenX, row1Y, ordenX, row1Y + rowH);
    
    drawT('EMBÁRQUESE A:', rightX + 1.5, row1Y + 3.5, 6.5, 'bold');
    drawT(formData.embarqueseA, rightX + 1.5, row1Y + 8.5, 8);
    
    drawT('N.º ORDEN DE COMPRA:', ordenX + 1.5, row1Y + 3.5, 6, 'bold');
    drawT(formData.ordenCompra || '----', ordenX + 1.5, row1Y + 8.5, 8);

    // Row 2: DIRECCIÓN | TELÉFONO | CONTADO | CRÉDITO
    const row2Y = row1Y + rowH;
    const telX = rightX + (rightColW * 0.55);
    const contX = margin + contentW - 35;
    const credX = margin + contentW - 18;

    doc.line(rightX, row2Y + rowH, margin + contentW, row2Y + rowH);
    doc.line(telX, row2Y, telX, row2Y + rowH);
    doc.line(contX, row2Y, contX, row2Y + rowH);
    doc.line(credX, row2Y, credX, row2Y + rowH);

    drawT('DIRECCIÓN:', rightX + 1.5, row2Y + 3.5, 6.5, 'bold');
    drawT(formData.direccion, rightX + 1.5, row2Y + 8.5, 7.5);

    drawT('TELÉFONO:', telX + 1.5, row2Y + 3.5, 6.5, 'bold');
    drawT(formData.telefono, telX + 1.5, row2Y + 8.5, 8);

    drawT('CONTADO:', contX + 1.5, row2Y + 3.5, 5.5, 'bold');
    doc.line(contX + 1, row2Y + 7.5, contX + 16, row2Y + 7.5, 'FD'); // Dashed look
    
    drawT('CRÉDITO:', credX + 1.5, row2Y + 3.5, 5.5, 'bold');
    doc.line(credX + 1, row2Y + 7.5, credX + 16, row2Y + 7.5, 'FD');

    // Row 3: CONDUCTOR | FICHA | VEH FMO | VEH PART
    const row3Y = row2Y + rowH;
    const ficX = rightX + (rightColW * 0.45);
    const fmoX = rightX + (rightColW * 0.72);
    const partX = rightX + (rightColW * 0.88);
    
    doc.line(rightX, row3Y + rowH, margin + contentW, row3Y + rowH);
    doc.line(ficX, row3Y, ficX, row3Y + rowH);
    doc.line(fmoX, row3Y, fmoX, row3Y + rowH);
    doc.line(partX, row3Y, partX, row3Y + rowH);

    drawT('CONDUCTOR:', rightX + 1.5, row3Y + 3.5, 6.5, 'bold');
    drawT(formData.conductor, rightX + 1.5, row3Y + 8.5, 8);

    drawT('FICHA O CÉDULA DE IDENTIDAD:', ficX + 1.5, row3Y + 3.5, 6, 'bold');
    drawT(formData.fichaConductor, ficX + 1.5, row3Y + 8.5, 8);

    drawT('VEHICULO F.M.O.', fmoX + 1.5, row3Y + 3.5, 6, 'bold');
    drawT(formData.vehiculoFmo, fmoX + 1.5, row3Y + 8.5, 8);

    drawT('VEHÍCULO PARTIC.:', partX + 1.5, row3Y + 3.5, 6, 'bold');
    drawT(formData.vehiculoParticular, partX + 1.5, row3Y + 8.5, 8);

    // Row 4: MATERIAL DESPACHADO POR | FICHA | CARGO | DEP
    const row4Y = row3Y + rowH;
    const fic2X = rightX + (rightColW * 0.45);
    const carX = rightX + (rightColW * 0.72);
    const depX = rightX + (rightColW * 0.88);

    doc.line(rightX, row4Y + rowH, margin + contentW, row4Y + rowH);
    doc.line(fic2X, row4Y, fic2X, row4Y + rowH);
    doc.line(carX, row4Y, carX, row4Y + rowH);
    doc.line(depX, row4Y, depX, row4Y + rowH);

    drawT('MATERIAL DESPACHADO POR:', rightX + 1.5, row4Y + 3.5, 6.5, 'bold');
    drawT(formData.despachadoPor, rightX + 1.5, row4Y + 8.5, 8);

    drawT('FICHA:', fic2X + 1.5, row4Y + 3.5, 7, 'bold');
    drawT(formData.fichaDespachador, fic2X + 1.5, row4Y + 8.5, 8);

    drawT('CARGO:', carX + 1.5, row4Y + 3.5, 7, 'bold');
    drawT(formData.cargo, carX + 1.5, row4Y + 8.5, 8);

    drawT('DEPARTAMENTO:', depX + 1.5, row4Y + 3.5, 5, 'bold');
    drawT(formData.departamento, depX + 1.5, row4Y + 8.5, 8);

    // Row 5: OBSERVACIONES | DIRIGIDO A | SOLICITUD
    const row5Y = row4Y + rowH;
    const row5H = 24; // Deeper area for observations
    const solX = margin + contentW - 45;
    const dirX = rightX + (rightColW * 0.45);

    doc.line(rightX, row5Y + row5H, margin + contentW, row5Y + row5H);

    drawT('Observaciones:', rightX + 1.5, row5Y + 4, 8, 'bold');
    drawT('DIRIGIDO A:', dirX + 1.5, row5Y + 4, 8, 'bold');
    drawT('SOLICITUD:', solX + 1.5, row5Y + 4, 8, 'bold');

    // SOLICITANTE / USUARIO INFO
    // Format: USUARIO: NOMBRE F-FICHA CARGO DE DEPARTAMENTO
    if (formData.solicitante) {
        const usuarioText = `USUARIO: ${formData.solicitante.toUpperCase()} F-${formData.fichaSolicitante || ''} ${formData.cargoSolicitante?.toUpperCase() || ''} DE ${formData.departamentoSolicitante?.toUpperCase() || ''}`;
        drawT(usuarioText, rightX + 18, row5Y + 12, 7, 'bold');
    }

    // SOLICITUD value (Concept + Solicitud Text)
    const solicitudFull = `${formData.conceptoNombre || ''} ${formData.solicitud || ''}`.trim().toUpperCase();
    if (solicitudFull) {
        drawT(solicitudFull, solX + 1.5, row5Y + 12, 8, 'bold');
    }

    // --- Bottom-Left: Auth Area (Inside Border) ---
    doc.line(margin, authY, rightX, authY);
    
    drawT('AUTORIZADO POR:', margin + 1.5, authY + 4, 6, 'bold');
    drawT(formData.autorizadoPor || 'CARMEN MÁRQUEZ', margin + 25, authY + 4, 8, 'bold');

    drawT('CARGO:', margin + 1.5, authY + 11, 6, 'bold');
    drawT(formData.cargoAutorizador || 'GERENTE DE TELEMÁTICA (e)', margin + 15, authY + 11, 7.5, 'bold');

    drawT('FIRMA Y SELLO:', margin + 1.5, authY + 19, 6, 'bold');

    drawT('FICHA:', margin + 1.5, authY + 28, 6, 'bold');
    drawT(formData.fichaAutorizador || '15508', margin + 12, authY + 28, 8, 'bold');

    drawT('LUGAR Y FECHA DE EMISIÓN:', margin + 1.5, authY + 34, 5.5, 'bold');
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    drawT(`PUERTO ORDAZ, ${formattedDate}`, margin + 35, authY + 34, 6.5, 'bold');

    // ============================================
    // BOTTOM SECTION (Table + Proteccion)
    // ============================================
    const tableY = midY + 74;
    const tableTotalH = 68;
    const tableHeaderH = 10;
    const matW = contentW * 0.55;
    const sigW = contentW - matW;
    const sigMidX = margin + matW + (sigW / 2);

    rect(margin, tableY, contentW, tableTotalH);
    doc.line(margin, tableY + tableHeaderH, margin + contentW, tableY + tableHeaderH);

    // Table Column Dividers
    doc.line(margin + 15, tableY, margin + 15, tableY + tableTotalH);
    doc.line(margin + 35, tableY, margin + 35, tableY + tableTotalH);
    doc.line(margin + matW, tableY, margin + matW, tableY + tableTotalH);
    doc.line(sigMidX, tableY, sigMidX, tableY + tableTotalH);

    drawT('CANTIDAD', margin + 7.5, tableY + 6, 7, 'bold', 'center');
    drawT('UNIDAD', margin + 25, tableY + 6, 7, 'bold', 'center');
    drawT('DESCRIPCIÓN (INCLUYA MARCA Y SERIAL)', margin + 37, tableY + 6, 7, 'bold');
    
    drawT('DEPARTAMENTO DE PROTECCIÓN INDUSTRIAL', margin + matW + (sigW/4), tableY + 4.5, 5, 'bold', 'center');
    drawT('DEPARTAMENTO DE PROTECCIÓN DE BUQUES E', sigMidX + (sigW/4), tableY + 4, 5, 'bold', 'center');
    drawT('INSTALACIONES PORTUARIAS', sigMidX + (sigW/4), tableY + 7, 5, 'bold', 'center');

    // Table Rows (6 rows)
    let ry = tableY + tableHeaderH;
    for (let i = 0; i < 6; i++) {
        ry += 9.6; // Proportional row height
        if (i < 5) doc.line(margin, ry, margin + matW, ry);
        
        if (items[i]) {
            drawT(String(items[i].cantidad), margin + 7.5, ry - 4, 8, 'normal', 'center');
            drawT(items[i].unidad, margin + 25, ry - 4, 8, 'normal', 'center');
            
            const fullDesc = items[i].fmos 
                ? `${items[i].descripcion} S/N: ${items[i].fmos}`
                : items[i].descripcion;
                
            drawT(fullDesc, margin + 37, ry - 4, 8);
        }
    }

    // Protection Sub-sections
    const drawProtBlock = (startX: number, blockW: number) => {
        let by = tableY + tableHeaderH;
        
        // Salida
        drawT('SALIDA REVISADA POR:', startX + 1.5, by + 4, 5, 'bold');
        doc.line(startX, by + 6, startX + blockW, by + 6);
        by += 6;
        
        drawT('N.º FICHA:', startX + 1.5, by + 4, 4.5);
        drawT('FECHA:', startX + blockW*(1/4) + 1.5, by + 4, 4.5);
        drawT('HORA:', startX + blockW*(2/3) + 1.5, by + 4, 4.5);
        
        doc.line(startX + blockW*(1/4), by, startX + blockW*(1/4), by + 6);
        doc.line(startX + blockW*(2/3), by, startX + blockW*(2/3), by + 6);
        doc.line(startX, by + 6, startX + blockW, by + 6);
        by += 6;
        
        drawT('PORTÓN No.', startX + 1.5, by + 5, 5, 'bold');
        doc.line(startX + 18, by + 5, startX + blockW - 5, by + 5);
        doc.line(startX, by + 9, startX + blockW, by + 9);
        by += 9;

        // Entrada
        drawT('ENTRADA REVISADA POR:', startX + 1.5, by + 4, 5, 'bold');
        doc.line(startX, by + 6, startX + blockW, by + 6);
        by += 6;
        
        drawT('N.º FICHA:', startX + 1.5, by + 4, 4.5);
        drawT('FECHA:', startX + blockW*(1/4) + 1.5, by + 4, 4.5);
        drawT('HORA:', startX + blockW*(2/3) + 1.5, by + 4, 4.5);
        
        doc.line(startX + blockW*(1/4), by, startX + blockW*(1/4), by + 6);
        doc.line(startX + blockW*(2/3), by, startX + blockW*(2/3), by + 6);
        doc.line(startX, by + 6, startX + blockW, by + 6);
        by += 6;

        drawT('PORTÓN No.', startX + 1.5, by + 5, 5, 'bold');
        doc.line(startX + 18, by + 5, startX + blockW - 5, by + 5);
    };

    drawProtBlock(margin + matW, sigW/2);
    drawProtBlock(sigMidX, sigW/2);

    // ============================================
    // FOOTER (Warning & Checks)
    // ============================================
    const footerY = tableY + tableTotalH + 3.5;
    drawT('EL USUARIO DEBE NOTIFICAR LA ENTRADA DE MATERIAL O EQUIPOS A LA SECCIÓN', margin + 1.5, footerY, 6, 'bold');
    drawT('DE PROTECCIÓN INDUSTRIAL.', margin + 1.5, footerY + 3, 6, 'bold');

    const checkX = margin + matW + 5;
    drawT('✓  TODO VEHÍCULO DEBE SER INSPECCIONADO EN LOS PORTONES.', checkX, footerY, 5.5, 'normal');
    drawT('✓  LOS ESPACIOS EN BLANCO NO APLICAN', checkX, footerY + 3.5, 5.5, 'normal');
    drawT('✓  NO SE ACEPTAN ENMIENDAS', checkX, footerY + 7, 5.5, 'normal');

    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
};
