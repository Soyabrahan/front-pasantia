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
    lugarFecha?: string;

    // Applicant Info
    solicitante?: string;
    fichaSolicitante?: string;
    cargoSolicitante?: string;
    departamentoSolicitante?: string;

    // Observation Format Mode
    formatoObservacion?: string;
    observacionLibre?: string;
}

interface Item {
    cantidad: string | number;
    unidad: string;
    descripcion: string;
    fmos?: string;
}

export const generatePDF = (formData: FormData, items: Item[]) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'letter',
    });

    const margin = 10;
    const pageW = 279.4;
    const pageH = 215.9;
    const contentW = pageW - 2 * margin;
    const contentH = pageH - 2 * margin;
    const PAD = 1.5;
    const RIGHT_PAD = 4;

    const drawT = (
        text: string,
        x: number,
        y: number,
        fontSize: number = 8,
        fontStyle: 'normal' | 'bold' = 'normal',
        align: 'left' | 'center' | 'right' = 'left',
        maxW: number = 0
    ) => {
        doc.setFont('helvetica', fontStyle);
        doc.setFontSize(fontSize);
        doc.setTextColor(0);

        if (maxW > 0 && text) {
            const currentW = doc.getTextWidth(String(text));
            if (currentW > maxW) {
                const shrink = Math.max(4, fontSize * (maxW / currentW));
                doc.setFontSize(shrink);
            }
        }

        doc.text(String(text || ''), x, y, { align });
    };

    /** Draw label then value right after it, calculating X dynamically */
    const drawLabelValue = (
        label: string,
        value: string,
        x: number,
        y: number,
        labelSize: number = 7,
        valueSize: number = 7,
        gap: number = 2,
        maxTotalW: number = 0
    ) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(labelSize);
        doc.text(label, x, y);
        if (!value) return;
        const labelW = doc.getTextWidth(label);
        const valueX = x + labelW + gap;
        let remaining = maxTotalW > 0 ? maxTotalW - labelW - gap : 0;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(valueSize);
        if (remaining > 0) {
            const valueW = doc.getTextWidth(value);
            if (valueW > remaining) {
                const shrink = Math.max(5, valueSize * (remaining / valueW));
                doc.setFontSize(shrink);
            }
        }
        doc.text(value, valueX, y);
    };

    /** Draw a block of text constrained to a box, using splitTextToSize when needed */
    const drawBoxText = (
        text: string,
        x: number,
        y: number,
        boxW: number,
        fontSize: number = 7,
        fontStyle: 'normal' | 'bold' = 'normal',
        align: 'left' | 'center' = 'left'
    ) => {
        if (!text) return;
        doc.setFont('helvetica', fontStyle);
        doc.setFontSize(fontSize);
        const usableW = Math.max(10, boxW - RIGHT_PAD);
        const textW = doc.getTextWidth(text);
        if (textW <= usableW) {
            doc.text(text, x, y, { align: align as 'left' | 'center' | 'right' });
            return;
        }
        const shrink = Math.max(5, fontSize * (usableW / textW));
        if (shrink >= 5.5) {
            doc.setFontSize(shrink);
            doc.text(text, x, y, { align: align as 'left' | 'center' | 'right' });
        } else {
            const lines = doc.splitTextToSize(text, usableW);
            if (align === 'center') {
                const lineH = 3.5;
                const totalH = lines.length * lineH;
                let cy = y - totalH / 2 + lineH / 2;
                for (const l of lines) {
                    doc.text(l, x + usableW / 2, cy, { align: 'center' });
                    cy += lineH;
                }
            } else {
                doc.text(lines, x, y);
            }
        }
    };

    const rect = (x: number, y: number, w: number, h: number, style?: string) => {
        doc.setLineWidth(0.2);
        doc.rect(x, y, w, h, style);
    };

    // --- MAIN BORDER ---
    doc.setLineWidth(0.5);
    doc.rect(margin, margin, contentW, contentH);
    doc.setLineWidth(0.2);

    // ============================================
    // HEADER SECTION
    // ============================================
    const headerH = 25;
    const logoBoxW = 40;

    doc.line(margin + logoBoxW, margin, margin + logoBoxW, margin + headerH);
    doc.line(margin, margin + headerH, margin + contentW, margin + headerH);

    rect(margin, margin, logoBoxW, 5);
    drawT('FERRO-1067 17/09/20', margin + 20, margin + 3.5, 6, 'normal', 'center');

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

    drawT('PASE PARA MATERIALES Y MISCELÁNEOS', margin + logoBoxW + (contentW - logoBoxW) / 2, margin + 12, 13, 'bold', 'center');

    doc.setFont('helvetica', 'bold');
    drawT(`N.º ${formData.numeroPase || '-----'}`, margin + contentW - 5, margin + 20, 23, 'bold', 'right');

    // ============================================
    // MIDDLE SECTION
    // ============================================
    const midY = margin + headerH;
    const leftColW = contentW * 0.31;
    const rightColW = contentW - leftColW;
    const rightX = margin + leftColW;

    const authY = midY + 40;

    doc.line(rightX, midY, rightX, midY + 74);

    const conceptSplitX = margin + 35;

    doc.line(margin, midY + 10, rightX, midY + 10);
    doc.line(conceptSplitX, midY + 10, conceptSplitX, authY);

    // --- LEFT COLUMN ---
    drawT('CONCEPTO:', margin + 1, midY + 4, 7, 'bold');

    const conceptLabels: Record<string, string> = {
        donacion: 'DONACIÓN',
        devolucion: 'DEVOLUCIÓN',
        prestamo: 'PRÉSTAMO',
        reparacion: 'REPARACIÓN',
        revision: 'REVISIÓN',
        vendido: 'VENDIDO',
        foraneo: 'FORÁNEO',
    };

    const checkboxes = [
        { k: 'donacion', l: conceptLabels.donacion },
        { k: 'devolucion', l: conceptLabels.devolucion },
        { k: 'prestamo', l: conceptLabels.prestamo },
        { k: 'reparacion', l: conceptLabels.reparacion },
        { k: 'revision', l: conceptLabels.revision },
        { k: 'vendido', l: conceptLabels.vendido },
        { k: 'foraneo', l: conceptLabels.foraneo },
    ];

    // Auto-detect selected concept name
    let selectedConceptName = '';
    if (formData.concepto) {
        for (const c of checkboxes) {
            if (formData.concepto[c.k as keyof Conceptos]) {
                selectedConceptName = c.l;
                break;
            }
        }
    }

    let cy = midY + 12;
    checkboxes.forEach((c) => {
        rect(margin + 5, cy, 3, 3);
        const isSelected = formData.concepto && formData.concepto[c.k as keyof Conceptos];
        drawT(c.l, margin + 9, cy + 2.3, 7, isSelected ? 'bold' : 'normal');
        if (isSelected) {
            drawT('X', margin + 6.5, cy + 2.5, 7, 'bold', 'center');
        }
        cy += 4;
    });

    if (selectedConceptName) {
        drawT(selectedConceptName, margin + 1, midY + 8, 7, 'bold');
    }

    const timeBoxX = conceptSplitX;
    const timeBoxY = midY + 12;
    const timeBoxW = rightX - conceptSplitX;

    drawT('Tiempo estimado de', timeBoxX + timeBoxW / 2, timeBoxY + 1, 7, 'normal', 'center');
    drawT('Regreso a la Empresa', timeBoxX + timeBoxW / 2, timeBoxY + 4, 7, 'normal', 'center');

    const lineW = 30;
    const cx = timeBoxX + timeBoxW / 2;
    doc.line(cx - lineW/2, timeBoxY + 11, cx + lineW/2, timeBoxY + 11);
    doc.line(cx - lineW/2, timeBoxY + 14.5, cx + lineW/2, timeBoxY + 14.5);
    doc.line(cx - lineW/2, timeBoxY + 18, cx + lineW/2, timeBoxY + 18);

    if (formData.tiempoEstimado) {
        drawT(formData.tiempoEstimado.toUpperCase(), cx, timeBoxY + 10, 7, 'bold', 'center');
    }

    // --- DATA FIELDS (Right Column) ---
    const rowH = 10;

    const row1Y = midY;
    const ordenX = rightX + 143.4;
    doc.line(rightX, row1Y + rowH, margin + contentW, row1Y + rowH);
    doc.line(ordenX, row1Y, ordenX, row1Y + rowH);

    drawT('EMBÁRQUESE A:', rightX + PAD, row1Y + 3.5, 7, 'normal');
    drawT(formData.embarqueseA.toUpperCase(), rightX + PAD, row1Y + 8.5, 7, 'bold', 'left', (ordenX - rightX) - RIGHT_PAD);

    drawT('N.º ORDEN DE COMPRA:', ordenX + PAD, row1Y + 3.5, 7, 'normal');
    drawT(formData.ordenCompra || '----', ordenX + PAD, row1Y + 8.5, 7, 'bold', 'left', (margin + contentW - ordenX) - RIGHT_PAD);

    const row2Y = row1Y + rowH;
    const telX = rightX + 87.6;
    const contX = telX + 43.1;
    const credX = contX + 20.1;

    doc.line(rightX, row2Y + rowH, margin + contentW, row2Y + rowH);
    doc.line(telX, row2Y, telX, row2Y + rowH);
    doc.line(contX, row2Y, contX, row2Y + rowH);
    doc.line(credX, row2Y, credX, row2Y + rowH);

    drawT('DIRECCIÓN:', rightX + PAD, row2Y + 3.5, 7, 'normal');
    drawT(formData.direccion.toUpperCase(), rightX + PAD, row2Y + 8.5, 7, 'bold', 'left', (telX - rightX) - RIGHT_PAD);

    drawT('TELÉFONO:', telX + PAD, row2Y + 3.5, 7, 'normal');
    drawT(formData.telefono, telX + PAD, row2Y + 8.5, 7, 'bold', 'left', (contX - telX) - RIGHT_PAD);

    drawT('CONTADO:', contX + PAD, row2Y + 3, 7, 'normal');
    drawT(formData.contado ? 'confirmado' : '------', contX + PAD, row2Y + 8, 7, 'bold');

    drawT('CRÉDITO:', credX + PAD, row2Y + 3, 7, 'normal');
    drawT(formData.credito ? 'confirmado' : '------', credX + PAD, row2Y + 8, 7, 'bold');

    const row3Y = row2Y + rowH;
    const ficX = rightX + 52.4;
    const fmoX = ficX + 60.8;
    const partX = fmoX + 32.5;

    doc.line(rightX, row3Y + rowH, margin + contentW, row3Y + rowH);
    doc.line(ficX, row3Y, ficX, row3Y + rowH);
    doc.line(fmoX, row3Y, fmoX, row3Y + rowH);
    doc.line(partX, row3Y, partX, row3Y + rowH);

    drawT('CONDUCTOR:', rightX + PAD, row3Y + 3.5, 7, 'normal');
    drawT(formData.conductor.toUpperCase(), rightX + PAD, row3Y + 8.5, 7, 'bold', 'left', (ficX - rightX) - RIGHT_PAD);

    drawT('FICHA O CÉDULA DE IDENTIDAD:', ficX + PAD, row3Y + 3.5, 7, 'normal');
    drawT(formData.fichaConductor, ficX + PAD, row3Y + 8.5, 7, 'bold', 'left', (fmoX - ficX) - RIGHT_PAD);

    drawT('VEHICULO F.M.O.:', fmoX + PAD, row3Y + 3.5, 7, 'normal');
    drawT(formData.vehiculoFmo.toUpperCase(), fmoX + PAD, row3Y + 8.5, 7, 'bold', 'left', (partX - fmoX) - RIGHT_PAD);

    drawT('VEHÍCULO PARTIC.', partX + PAD + 2, row3Y + 3.5, 7, 'normal', 'left', (margin + contentW - partX) - RIGHT_PAD);
    const partCellW = margin + contentW - partX;
    drawBoxText(formData.vehiculoParticular.toUpperCase(), partX + PAD, row3Y + 8.5, partCellW, 7, 'bold');

    const row4Y = row3Y + rowH;
    const fic2X = rightX + 52.4;
    const carX = fic2X + 38.9;
    const depX = carX + 52.1;

    doc.line(rightX, row4Y + rowH, margin + contentW, row4Y + rowH);
    doc.line(fic2X, row4Y, fic2X, row4Y + rowH);
    doc.line(carX, row4Y, carX, row4Y + rowH);
    doc.line(depX, row4Y, depX, row4Y + rowH);

    drawT('MATERIAL DESPACHADO POR:', rightX + PAD, row4Y + 3.5, 7, 'normal');
    drawT(formData.despachadoPor.toUpperCase(), rightX + PAD, row4Y + 7.5, 7, 'bold', 'left', (fic2X - rightX) - RIGHT_PAD);

    drawT('FICHA:', fic2X + PAD, row4Y + 3.5, 7, 'normal');
    drawT(formData.fichaDespachador, fic2X + PAD, row4Y + 7.5, 7, 'bold', 'left', (carX - fic2X) - RIGHT_PAD);

    drawT('CARGO:', carX + PAD, row4Y + 3.5, 7, 'normal');
    drawT(formData.cargo.toUpperCase(), carX + PAD, row4Y + 7.5, 7, 'bold', 'left', (depX - carX) - RIGHT_PAD);

    drawT('DEPARTAMENTO:', depX + PAD + 2, row4Y + 3.5, 7, 'normal', 'left', (margin + contentW - depX) - RIGHT_PAD);
    const depCellW = margin + contentW - depX;
    drawBoxText(formData.departamento.toUpperCase(), depX + PAD, row4Y + 7, depCellW, 6.5, 'bold');

    // Row 5: OBSERVACIONES | DIRIGIDO A | SOLICITUD
    const row5Y = row4Y + rowH;
    const mode = formData.formatoObservacion || 'detallada';

    if (mode === 'detallada') {
        // Three-column layout
        const solX = margin + contentW - 45;
        const dirX = rightX + (rightColW * 0.45);

        drawT('OBSERVACIONES:', rightX + PAD, row5Y + 4, 10, 'normal');
        drawT('DIRIGIDO A:', dirX + PAD, row5Y + 4, 10, 'normal');
        drawT('SOLICITUD:', solX + PAD, row5Y + 4, 10, 'normal');

        let observacionFits = true;

        if (formData.solicitante) {
            const nombre = formData.solicitante.toUpperCase();
            const ficha = formData.fichaSolicitante || '';
            const cargo = formData.cargoSolicitante?.toUpperCase() || '';
            const depto = formData.departamentoSolicitante?.toUpperCase() || '';

            const line1 = `USUARIO: ${nombre} F-${ficha}`;
            const cargoPart = cargo + (cargo && depto ? ' DE ' : '') + (depto || '');
            const fullText = line1 + ' ' + cargoPart;
            const availWidth = (dirX - rightX) - RIGHT_PAD;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            observacionFits = doc.getTextWidth(fullText) <= availWidth;

            if (observacionFits) {
                drawT(fullText, rightX + PAD, row5Y + 11, 7, 'bold', 'left', availWidth);
            } else {
                drawT(line1, rightX + PAD, row5Y + 11, 7, 'bold', 'left', availWidth);
                drawT(cargoPart, rightX + PAD, row5Y + 15, 7, 'bold', 'left', availWidth);
            }
        }

        if (formData.dirigidoA) {
            const dirigidoAY = observacionFits ? row5Y + 15 : row5Y + 19;
            drawT(formData.dirigidoA.toUpperCase(), rightX + PAD, dirigidoAY, 7, 'bold', 'left', dirX - rightX - RIGHT_PAD);
        }
        if (formData.embarqueseA) {
            drawT(formData.embarqueseA.toUpperCase(), dirX + PAD, row5Y + 11, 7, 'bold', 'left', solX - dirX - RIGHT_PAD);
        }

        const concept = selectedConceptName || formData.conceptoNombre || '';
        const detail = formData.solicitud || '';
        const stripAccents = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const solicitudFull = (stripAccents(concept).toUpperCase() === stripAccents(detail).toUpperCase())
            ? concept
            : `${concept} ${detail}`.trim();

        if (solicitudFull) {
            drawT(solicitudFull, solX + PAD, row5Y + 11, 7, 'bold', 'left', (margin + contentW) - solX - RIGHT_PAD);
        }
    } else if (mode === 'solo-solicitante') {
        // Full-width OBSERVACIONES with solicitante info only
        drawT('OBSERVACIONES:', rightX + PAD, row5Y + 4, 10, 'normal');

        if (formData.solicitante) {
            const nombre = formData.solicitante.toUpperCase();
            const ficha = formData.fichaSolicitante || '';
            const cargo = formData.cargoSolicitante?.toUpperCase() || '';
            const depto = formData.departamentoSolicitante?.toUpperCase() || '';

            const line1 = `USUARIO: ${nombre} F-${ficha}`;
            const cargoPart = cargo + (cargo && depto ? ' DE ' : '') + (depto || '');
            const fullText = line1 + ' ' + cargoPart;
            const availWidth = (margin + contentW - rightX) - RIGHT_PAD;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            const fits = doc.getTextWidth(fullText) <= availWidth;

            if (fits) {
                drawT(fullText, rightX + PAD, row5Y + 11, 7, 'bold', 'left', availWidth);
            } else {
                drawT(line1, rightX + PAD, row5Y + 11, 7, 'bold', 'left', availWidth);
                drawT(cargoPart, rightX + PAD, row5Y + 15, 7, 'bold', 'left', availWidth);
            }
        }
    } else if (mode === 'libre') {
        // Full-width OBSERVACIONES with free text
        drawT('OBSERVACIONES:', rightX + PAD, row5Y + 4, 10, 'normal');

        if (formData.observacionLibre) {
            const availWidth = (margin + contentW - rightX) - RIGHT_PAD;
            drawBoxText(formData.observacionLibre.toUpperCase(), rightX + PAD, row5Y + 11, availWidth, 7, 'bold');
        }
    }

    // --- Auth Area ---
    doc.line(conceptSplitX, authY, rightX, authY);

    drawLabelValue('AUTORIZADO POR: ', formData.autorizadoPor?.toUpperCase() || 'CARMEN MÁRQUEZ', margin + PAD, authY + 5, 7, 11, 1.5, (rightX - margin) - RIGHT_PAD);

    drawLabelValue('CARGO: ', formData.cargoAutorizador?.toUpperCase() || 'GERENTE DE TELEMÁTICA', margin + PAD, authY + 11, 7, 11, 1.5, (rightX - margin) - RIGHT_PAD);

    drawT('FIRMA Y SELLO:', margin + PAD, authY + 17, 7, 'normal');

    drawLabelValue('FICHA: ', formData.fichaAutorizador || '15508', margin + PAD, authY + 23, 7, 11, 1.5, (rightX - margin) - RIGHT_PAD);

    // Horizontal line separating manager info from place/date
    doc.line(margin, authY + 26, rightX, authY + 26);

    const lugarFechaTexto = 'LUGAR Y FECHA DE EMISIÓN: Puerto Ordaz' + (formData.lugarFecha ? ', ' + formData.lugarFecha.toUpperCase() : '');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(0);
    doc.text(lugarFechaTexto, margin + PAD, authY + 29);

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

    const protBlockW = sigW / 2;

    drawBoxText('DEPARTAMENTO DE PROTECCIÓN INDUSTRIAL', margin + matW + (sigW / 4), tableY + 5.5, protBlockW, 7, 'bold', 'center');
    drawBoxText('DEPARTAMENTO DE PROTECCIÓN DE BUQUES E', sigMidX + (sigW / 4), tableY + 3.5, protBlockW, 7, 'bold', 'center');
    drawBoxText('INSTALACIONES PORTUARIAS', sigMidX + (sigW / 4), tableY + 7.5, protBlockW, 7, 'bold', 'center');

    let ry = tableY + tableHeaderH;
    const itemsToShow = items.slice(0, 6);

    for (let i = 0; i < 6; i++) {
        const item = itemsToShow[i];
        let rowH = 9.6;
        const startX = margin + 30;
        const endX = margin + matW;
        const colW = (endX - startX) - RIGHT_PAD;
        let lines: string[] = [];

        if (item) {
            const fullDesc = item.fmos
                ? `${item.descripcion}  ${item.fmos}`
                : item.descripcion;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            lines = doc.splitTextToSize(fullDesc.toUpperCase(), colW);

            const lineHeight = 3.5;
            const calculatedH = (lines.length * lineHeight) + 6;
            if (calculatedH > rowH) rowH = calculatedH;
        }

        if (i < 5) doc.line(margin, ry + rowH, margin + matW, ry + rowH);

        if (item && lines.length > 0) {
            drawT(String(item.cantidad), margin + 7.5, ry + (rowH / 2) + 1.5, 7, 'bold', 'center');
            drawT(item.unidad.toUpperCase(), margin + 22.5, ry + (rowH / 2) + 1.5, 7, 'bold', 'center');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
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
        drawT('SALIDA REVISADA POR:', startX + PAD, by + 4, 7, 'normal');
        doc.line(startX, by + 6, startX + blockW, by + 6);
        by += 6;
        drawT('N.º FICHA:', startX + PAD, by + 4, 7);
        drawT('FECHA:', startX + blockW * (1 / 4) + PAD, by + 4, 7);
        drawT('HORA:', startX + blockW * (2 / 3) + PAD, by + 4, 7);
        doc.line(startX + blockW * (1 / 4), by, startX + blockW * (1 / 4), by + 6);
        doc.line(startX + blockW * (2 / 3), by, startX + blockW * (2 / 3), by + 6);
        doc.line(startX, by + 6, startX + blockW, by + 6);
        by += 6;
        drawT('PORTÓN No.', startX + PAD, by + 5, 7, 'normal');
        doc.line(startX + 18, by + 5, startX + blockW - RIGHT_PAD, by + 5);
        doc.line(startX, by + 9, startX + blockW, by + 9);
        by += 9;
        drawT('ENTRADA REVISADA POR:', startX + PAD, by + 4, 7, 'normal');
        doc.line(startX, by + 6, startX + blockW, by + 6);
        by += 6;
        drawT('N.º FICHA:', startX + PAD, by + 4, 7);
        drawT('FECHA:', startX + blockW * (1 / 4) + PAD, by + 4, 7);
        drawT('HORA:', startX + blockW * (2 / 3) + PAD, by + 4, 7);
        doc.line(startX + blockW * (1 / 4), by, startX + blockW * (1 / 4), by + 6);
        doc.line(startX + blockW * (2 / 3), by, startX + blockW * (2 / 3), by + 6);
        doc.line(startX, by + 6, startX + blockW, by + 6);
        by += 6;
        drawT('PORTÓN No.', startX + PAD, by + 5, 7, 'normal');
        doc.line(startX + 18, by + 5, startX + blockW - RIGHT_PAD, by + 5);
    };

    drawProtBlock(margin + matW, sigW / 2);
    drawProtBlock(sigMidX, sigW / 2);
    doc.line(margin + matW, tableEnd, margin + contentW, tableEnd);

    // ============================================
    // FOOTER
    // ============================================
    const footerStartY = tableEnd;
    const footerEndY = margin + contentH;
    const footerH = footerEndY - footerStartY;

    const footerTextLeft1 = 'EL USUARIO DEBE NOTIFICAR LA ENTRADA DE MATERIAL O EQUIPOS A LA SECCIÓN';
    const footerTextLeft2 = 'DE PROTECCIÓN INDUSTRIAL.';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    const leftTextW = doc.getTextWidth(footerTextLeft1);
    const lineX = margin + PAD + leftTextW + 2.5;

    doc.setLineWidth(0.3);
    doc.line(lineX, footerStartY, lineX, footerEndY);

    drawT(footerTextLeft1, margin + PAD, footerStartY + 3.5, 7, 'bold');
    drawT(footerTextLeft2, margin + PAD, footerStartY + 7, 7, 'bold');

    const bulletX = lineX + 2.5;
    const bulletFontSize = 7;

    rect(bulletX, footerStartY + 1.5, 2.5, 2.5);
    drawT('TODO VEHÍCULO DEBE SER INSPECCIONADO EN LOS PORTONES.', bulletX + 4, footerStartY + 3.5, bulletFontSize, 'normal');
    rect(bulletX, footerStartY + (footerH / 2) - 1, 2.5, 2.5);
    drawT('LOS ESPACIOS EN BLANCO NO APLICAN', bulletX + 4, footerStartY + (footerH / 2) + 1, bulletFontSize, 'normal');
    rect(bulletX, footerEndY - 5, 2.5, 2.5);
    drawT('NO SE ACEPTAN ENMIENDAS', bulletX + 4, footerEndY - 3, bulletFontSize, 'normal');

    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
};
