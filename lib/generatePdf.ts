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

    // Observations
    observaciones?: string;
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
        align: 'left' | 'center' | 'right' = 'left',
        maxW: number = 0
    ) => {
        let finalSize = fontSize;
        doc.setFont('helvetica', fontStyle);
        doc.setFontSize(fontSize);
        
        if (maxW > 0 && text) {
            const currentW = doc.getTextWidth(String(text));
            if (currentW > maxW) {
                finalSize = Math.max(4, fontSize * (maxW / currentW));
            }
        }
        
        doc.setFontSize(finalSize);
        doc.setTextColor(0);
        doc.text(String(text || ''), x, y, { align });
    };

    // Helper for rectangles
    const rect = (x: number, y: number, w: number, h: number, style?: string) => {
        doc.setLineWidth(0.2);
        doc.rect(x, y, w, h, style);
    };

    // --- MAIN BORDER ---
    doc.setLineWidth(0.5);
    doc.rect(margin, margin, contentW, contentH);
    doc.setLineWidth(0.2);

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

    // Draw Logo
    const lx = margin + 10;
    const ly = margin + 8;
    const lw = 15;
    const lh = 15;

    try {
        doc.addImage('/logo-pdf.png', 'PNG', lx, ly, lw, lh);
    } catch (e) {
        doc.setFillColor(190, 30, 45);
        doc.rect(lx, ly, lw, lh, 'F');
    }

    doc.setLineWidth(0.3);
    doc.setDrawColor(0);

    // Box 2: Title & Number
    drawT('PASE PARA MATERIALES Y MISCELÁNEOS', margin + logoBoxW + (contentW - logoBoxW) / 2, margin + 12, 14, 'bold', 'center');

    // Number (N. 86471)
    doc.setFont('helvetica', 'bold');
    drawT(`N.º ${formData.numeroPase || '-----'}`, margin + contentW - 5, margin + 20, 16, 'bold', 'right');

    // ============================================
    // MIDDLE SECTION (Concept / Data)
    // ============================================
    const midY = margin + headerH;
    const leftColW = contentW * 0.31;
    const rightColW = contentW - leftColW;
    const rightX = margin + leftColW;

    const authY = midY + 40;

    // Main Vertical Divider (Between Left/Right)
    doc.line(rightX, midY, rightX, midY + 74);

    // Concept Vertical Divider
    const conceptSplitX = margin + 35;
    
    // Horizontal line under CONCEPTO (passes above Tiempo Estimado)
    doc.line(margin, midY + 10, rightX, midY + 10);
    
    // Vertical line starting AT the horizontal line (not intersecting above)
    doc.line(conceptSplitX, midY + 10, conceptSplitX, authY);

    // --- LEFT COLUMN (Concept + Auth) ---
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

    const selectedConcept = checkboxes.find(c => formData.concepto?.[c.k as keyof Conceptos]);
    if (selectedConcept) {
        drawT(selectedConcept.l, margin + 18, midY + 4, 7, 'bold');
    }

    let cy = midY + 11.5;
    checkboxes.forEach((c) => {
        rect(margin + 5, cy, 3, 3);
        drawT(c.l, margin + 9, cy + 2.3, 6);
        if (formData.concepto && formData.concepto[c.k as keyof Conceptos]) {
            drawT('X', margin + 6.5, cy + 2.5, 8, 'bold', 'center');
        }
        cy += 4;
    });

    // "Tiempo estimado" Box
    const timeBoxX = conceptSplitX;
    const timeBoxY = midY + 12; // Shifted down to vertically center
    const timeBoxW = rightX - conceptSplitX;
    
    drawT('Tiempo estimado de', timeBoxX + timeBoxW / 2, timeBoxY + 1, 6, 'normal', 'center');
    drawT('Regreso a la Empresa', timeBoxX + timeBoxW / 2, timeBoxY + 4, 6, 'normal', 'center');

    const lineW = 30;
    const cx = timeBoxX + timeBoxW / 2;
    doc.line(cx - lineW/2, timeBoxY + 11, cx + lineW/2, timeBoxY + 11);
    doc.line(cx - lineW/2, timeBoxY + 14.5, cx + lineW/2, timeBoxY + 14.5);
    doc.line(cx - lineW/2, timeBoxY + 18, cx + lineW/2, timeBoxY + 18);

    if (formData.tiempoEstimado) {
        drawT(formData.tiempoEstimado.toUpperCase(), cx, timeBoxY + 10, 7, 'bold', 'center');
    }

    // --- DATA FIELDS (Right Column Rows) ---
    const rowH = 10;

    // Row 1: EMBÁRQUESE A | N.º ORDEN DE COMPRA
    const row1Y = midY;
    const ordenX = margin + contentW - 40;
    doc.line(rightX, row1Y + rowH, margin + contentW, row1Y + rowH);
    doc.line(ordenX, row1Y, ordenX, row1Y + rowH);

    drawT('EMBÁRQUESE A:', rightX + 1.5, row1Y + 3.5, 6.5, 'normal');
    drawT(formData.embarqueseA.toUpperCase(), rightX + 1.5, row1Y + 8.5, 8, 'bold', 'left', (ordenX - rightX) - 3);

    drawT('N.º ORDEN DE COMPRA:', ordenX + 1.5, row1Y + 3.5, 6, 'normal');
    drawT(formData.ordenCompra || '----', ordenX + 1.5, row1Y + 8.5, 8, 'bold', 'left', (margin + contentW - ordenX) - 3);

    // Row 2: DIRECCIÓN | TELÉFONO | CONTADO | CRÉDITO
    const row2Y = row1Y + rowH;
    const telX = rightX + (rightColW * 0.55);
    const contX = margin + contentW - 35;
    const credX = margin + contentW - 18;

    doc.line(rightX, row2Y + rowH, margin + contentW, row2Y + rowH);
    doc.line(telX, row2Y, telX, row2Y + rowH);
    doc.line(contX, row2Y, contX, row2Y + rowH);
    doc.line(credX, row2Y, credX, row2Y + rowH);

    drawT('DIRECCIÓN:', rightX + 1.5, row2Y + 3.5, 6.5, 'normal');
    drawT(formData.direccion.toUpperCase(), rightX + 1.5, row2Y + 8.5, 7.5, 'bold', 'left', (telX - rightX) - 3);

    drawT('TELÉFONO:', telX + 1.5, row2Y + 3.5, 6.5, 'normal');
    drawT(formData.telefono, telX + 1.5, row2Y + 8.5, 8, 'bold', 'left', (contX - telX) - 3);

    drawT('CONTADO:', contX + 2, row2Y + 4, 5.5, 'normal');
    rect(contX + 14, row2Y + 1.5, 3, 3);
    if (formData.contado) drawT('X', contX + 15.5, row2Y + 4, 8, 'bold', 'center');

    drawT('CRÉDITO:', credX + 2, row2Y + 4, 5.5, 'normal');
    rect(credX + 14, row2Y + 1.5, 3, 3);
    if (formData.credito) drawT('X', credX + 15.5, row2Y + 4, 8, 'bold', 'center');

    // Row 3: CONDUCTOR | FICHA | VEH FMO | VEH PART
    const row3Y = row2Y + rowH;
    const ficX = rightX + (rightColW * 0.45);
    const fmoX = rightX + (rightColW * 0.72);
    const partX = rightX + (rightColW * 0.88);

    doc.line(rightX, row3Y + rowH, margin + contentW, row3Y + rowH);
    doc.line(ficX, row3Y, ficX, row3Y + rowH);
    doc.line(fmoX, row3Y, fmoX, row3Y + rowH);
    doc.line(partX, row3Y, partX, row3Y + rowH);

    drawT('CONDUCTOR:', rightX + 1.5, row3Y + 3.5, 6.5, 'normal');
    drawT(formData.conductor.toUpperCase(), rightX + 1.5, row3Y + 8.5, 8, 'bold', 'left', (ficX - rightX) - 3);

    drawT('FICHA O C.I.:', ficX + 1.5, row3Y + 3.5, 6, 'normal');
    drawT(formData.fichaConductor, ficX + 1.5, row3Y + 8.5, 8, 'bold', 'left', (fmoX - ficX) - 3);

    drawT('VEHICULO F.M.O.:', fmoX + 1.5, row3Y + 3.5, 6, 'normal');
    drawT(formData.vehiculoFmo.toUpperCase(), fmoX + 1.5, row3Y + 8.5, 8, 'bold', 'left', (partX - fmoX) - 3);

    drawT('VEHÍCULO:', partX + 1.5, row3Y + 3.5, 6, 'normal');
    drawT(formData.vehiculoParticular.toUpperCase(), partX + 1.5, row3Y + 8.5, 8, 'bold', 'left', (margin + contentW - partX) - 3);

    // Row 4: MATERIAL DESPACHADO POR | FICHA | CARGO | DEP
    const row4Y = row3Y + rowH;
    const fic2X = rightX + (rightColW * 0.45);
    const carX = rightX + (rightColW * 0.72);
    const depX = rightX + (rightColW * 0.88);

    doc.line(rightX, row4Y + rowH, margin + contentW, row4Y + rowH);
    doc.line(fic2X, row4Y, fic2X, row4Y + rowH);
    doc.line(carX, row4Y, carX, row4Y + rowH);
    doc.line(depX, row4Y, depX, row4Y + rowH);

    drawT('MATERIAL DESPACHADO POR:', rightX + 1.5, row4Y + 3.5, 6.5, 'normal');
    drawT(formData.despachadoPor.toUpperCase(), rightX + 1.5, row4Y + 8.5, 8, 'bold', 'left', (fic2X - rightX) - 3);

    drawT('FICHA:', fic2X + 1.5, row4Y + 3.5, 7, 'normal');
    drawT(formData.fichaDespachador, fic2X + 1.5, row4Y + 8.5, 8, 'bold', 'left', (carX - fic2X) - 3);

    drawT('CARGO:', carX + 1.5, row4Y + 3.5, 7, 'normal');
    drawT(formData.cargo.toUpperCase(), carX + 1.5, row4Y + 8.5, 8, 'bold', 'left', (depX - carX) - 3);

    drawT('DEPARTAMENTO:', depX + 1.5, row4Y + 3.5, 5, 'normal');
    drawT(formData.departamento.toUpperCase(), depX + 1.5, row4Y + 8.5, 8, 'bold', 'left', (margin + contentW - depX) - 3);

    // Row 5: OBSERVACIONES | DIRIGIDO A | SOLICITUD
    const row5Y = row4Y + rowH;
    const solX = margin + contentW - 45;
    const dirX = rightX + (rightColW * 0.45);

    drawT('OBSERVACIONES:', rightX + 1.5, row5Y + 4, 8, 'normal');
    drawT('DIRIGIDO A:', dirX + 1.5, row5Y + 4, 8, 'normal');
    drawT('SOLICITUD:', solX + 1.5, row5Y + 4, 8, 'normal');

    if (formData.observaciones) {
        const lines = doc.splitTextToSize(formData.observaciones.toUpperCase(), (dirX - rightX) - 5);
        lines.forEach((line: string, i: number) => {
            drawT(line, rightX + 1.5, row5Y + 11 + (i * 4), 6, 'bold', 'left', (dirX - rightX) - 5);
        });
    } else if (formData.solicitante) {
        const usuarioText = `USUARIO: ${formData.solicitante.toUpperCase()} F-${formData.fichaSolicitante || ''} ${formData.cargoSolicitante?.toUpperCase() || ''} DE ${formData.departamentoSolicitante?.toUpperCase() || ''}`;
        drawT(usuarioText, rightX + 1.5, row5Y + 11, 5.5, 'bold', 'left', (dirX - rightX) - 5);
    }

    if (formData.dirigidoA) {
        drawT(formData.dirigidoA.toUpperCase(), rightX + 1.5, row5Y + 15, 6, 'bold', 'left', dirX - rightX - 3);
    }
    if (formData.embarqueseA) {
        drawT(formData.embarqueseA.toUpperCase(), dirX + 1.5, row5Y + 11, 6.5, 'bold', 'left', solX - dirX - 3);
    }

    const concept = formData.conceptoNombre || '';
    const detail = formData.solicitud || '';
    const solicitudFull = (concept.trim().toUpperCase() === detail.trim().toUpperCase()) 
        ? concept.toUpperCase() 
        : `${concept} ${detail}`.trim().toUpperCase();

    if (solicitudFull) {
        drawT(solicitudFull, solX + 1.5, row5Y + 11, 6.5, 'bold', 'left', (margin + contentW) - solX - 3);
    }

    // --- Bottom-Left: Auth Area ---
    doc.line(conceptSplitX, authY, rightX, authY);

    drawT('AUTORIZADO POR:', margin + 1.5, authY + 4, 6, 'normal');
    drawT(formData.autorizadoPor?.toUpperCase() || 'CARMEN MÁRQUEZ', margin + 25, authY + 4, 8, 'bold');

    drawT('CARGO:', margin + 1.5, authY + 11, 6, 'normal');
    const cargoAutorizador = formData.cargoAutorizador?.toUpperCase() || 'GERENTE DE TELEMÁTICA (e)';
    drawT(cargoAutorizador, margin + 15, authY + 11, cargoAutorizador.length > 25 ? 5.5 : 7.5, 'bold');

    drawT('FIRMA Y SELLO:', margin + 1.5, authY + 19, 6, 'normal');

    drawT('FICHA:', margin + 1.5, authY + 28, 6, 'normal');
    drawT(formData.fichaAutorizador || '15508', margin + 12, authY + 28, 8, 'bold');

    drawT('LUGAR Y FECHA DE EMISIÓN:', margin + 2, authY + 33.5, 5.5, 'normal');
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    drawT(`CIUDAD GUAYANA, ${formattedDate}`, margin + 35, authY + 33.5, 6.5, 'bold', 'left', (rightX - margin - 35) - 3);

    // ============================================
    // BOTTOM SECTION (Table + Proteccion)
    // ============================================
    const tableY = midY + 74;
    const tableHeaderH = 10;
    const matW = contentW * 0.55;
    const sigW = contentW - matW;
    const sigMidX = margin + matW + (sigW / 2);

    drawT('CANTIDAD', margin + 7.5, tableY + 6, 7, 'bold', 'center');
    drawT('UNIDAD', margin + 22.5, tableY + 6, 7, 'bold', 'center');
    drawT('DESCRIPCIÓN (INCLUYA MARCA Y SERIAL)', margin + 32, tableY + 6, 7, 'bold');

    drawT('DEPARTAMENTO DE PROTECCIÓN INDUSTRIAL', margin + matW + (sigW / 4), tableY + 4.5, 7, 'bold', 'center');
    drawT('DEPARTAMENTO DE PROTECCIÓN DE BUQUES E', sigMidX + (sigW / 4), tableY + 4, 7, 'bold', 'center');
    drawT('INSTALACIONES PORTUARIAS', sigMidX + (sigW / 4), tableY + 7, 7, 'bold', 'center');

    let ry = tableY + tableHeaderH;
    const itemsToShow = items.slice(0, 6);

        for (let i = 0; i < 6; i++) {
        const item = itemsToShow[i];
        let rowH = 9.6;
        const startX = margin + 30;
        const endX = margin + matW;
        const colW = (endX - startX) - 4;
        let lines: string[] = [];

        if (item) {
            const fullDesc = item.fmos
                ? `${item.descripcion}  ${item.fmos}`
                : item.descripcion;
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            lines = doc.splitTextToSize(fullDesc.toUpperCase(), colW);
            
            const lineHeight = 3.5;
            const calculatedH = (lines.length * lineHeight) + 6;
            if (calculatedH > rowH) rowH = calculatedH;
        }

        if (i < 5) doc.line(margin, ry + rowH, margin + matW, ry + rowH);
        
        if (item && lines.length > 0) {
            drawT(String(item.cantidad), margin + 7.5, ry + (rowH / 2) + 1.5, 8, 'bold', 'center');
            drawT(item.unidad.toUpperCase(), margin + 22.5, ry + (rowH / 2) + 1.5, 8, 'bold', 'center');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.text(lines, margin + 32, ry + 5);
        }

        ry += rowH;
    }

    const tableEnd = ry;
    const finalTableH = tableEnd - tableY;

    rect(margin, tableY, contentW, finalTableH);
    doc.line(margin, tableY + tableHeaderH, margin + contentW, tableY + tableHeaderH);
    doc.line(margin + 15, tableY, margin + 15, tableEnd);
    doc.line(margin + 30, tableY, margin + 30, tableEnd);
    doc.line(margin + matW, tableY, margin + matW, tableEnd);
    doc.line(sigMidX, tableY, sigMidX, tableEnd);

    const drawProtBlock = (startX: number, blockW: number) => {
        let by = tableY + tableHeaderH;
        drawT('SALIDA REVISADA POR:', startX + 1.5, by + 4, 5, 'normal');
        doc.line(startX, by + 6, startX + blockW, by + 6);
        by += 6;
        drawT('N.º FICHA:', startX + 1.5, by + 4, 4.5);
        drawT('FECHA:', startX + blockW * (1 / 4) + 1.5, by + 4, 4.5);
        drawT('HORA:', startX + blockW * (2 / 3) + 1.5, by + 4, 4.5);
        doc.line(startX + blockW * (1 / 4), by, startX + blockW * (1 / 4), by + 6);
        doc.line(startX + blockW * (2 / 3), by, startX + blockW * (2 / 3), by + 6);
        doc.line(startX, by + 6, startX + blockW, by + 6);
        by += 6;
        drawT('PORTÓN No.', startX + 1.5, by + 5, 5, 'normal');
        doc.line(startX + 18, by + 5, startX + blockW - 5, by + 5);
        doc.line(startX, by + 9, startX + blockW, by + 9);
        by += 9;
        drawT('ENTRADA REVISADA POR:', startX + 1.5, by + 4, 5, 'normal');
        doc.line(startX, by + 6, startX + blockW, by + 6);
        by += 6;
        drawT('N.º FICHA:', startX + 1.5, by + 4, 4.5);
        drawT('FECHA:', startX + blockW * (1 / 4) + 1.5, by + 4, 4.5);
        drawT('HORA:', startX + blockW * (2 / 3) + 1.5, by + 4, 4.5);
        doc.line(startX + blockW * (1 / 4), by, startX + blockW * (1 / 4), by + 6);
        doc.line(startX + blockW * (2 / 3), by, startX + blockW * (2 / 3), by + 6);
        doc.line(startX, by + 6, startX + blockW, by + 6);
        by += 6;
        drawT('PORTÓN No.', startX + 1.5, by + 5, 5, 'normal');
        doc.line(startX + 18, by + 5, startX + blockW - 5, by + 5);
    };

    drawProtBlock(margin + matW, sigW / 2);
    drawProtBlock(sigMidX, sigW / 2);
    doc.line(margin + matW, tableEnd, margin + contentW, tableEnd);

    // ============================================
    // BOTTOM SECTION (Footer/Notes)
    // ============================================
    const footerStartY = tableEnd;
    const footerEndY = margin + contentH;
    const footerH = footerEndY - footerStartY;

    // Calculate vertical line position after first text line
    const footerTextLeft1 = 'EL USUARIO DEBE NOTIFICAR LA ENTRADA DE MATERIAL O EQUIPOS A LA SECCIÓN';
    const footerTextLeft2 = 'DE PROTECCIÓN INDUSTRIAL.';
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    const leftTextW = doc.getTextWidth(footerTextLeft1);
    const lineX = margin + 1.5 + leftTextW + 2.5; // Padding after "SECCIÓN"

    // Draw Vertical Separator Line
    doc.setLineWidth(0.3);
    doc.line(lineX, footerStartY, lineX, footerEndY);

    // Reposition Left Text
    drawT(footerTextLeft1, margin + 1.5, footerStartY + 3.5, 6, 'bold');
    drawT(footerTextLeft2, margin + 1.5, footerStartY + 7, 6, 'bold');

    const bulletX = lineX + 2.5;
    const bulletFontSize = 5.5;
    
    // Top
    rect(bulletX, footerStartY + 1.5, 2.5, 2.5);
    drawT('TODO VEHÍCULO DEBE SER INSPECCIONADO EN LOS PORTONES.', bulletX + 4, footerStartY + 3.5, bulletFontSize, 'normal');
    // Middle
    rect(bulletX, footerStartY + (footerH / 2) - 1, 2.5, 2.5);
    drawT('LOS ESPACIOS EN BLANCO NO APLICAN', bulletX + 4, footerStartY + (footerH / 2) + 1, bulletFontSize, 'normal');
    // Bottom
    rect(bulletX, footerEndY - 5, 2.5, 2.5);
    drawT('NO SE ACEPTAN ENMIENDAS', bulletX + 4, footerEndY - 3, bulletFontSize, 'normal');

    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
};
