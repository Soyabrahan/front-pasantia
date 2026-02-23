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

    // Authorization Info
    autorizadoPor?: string;
    cargoAutorizador?: string;
    fichaAutorizador?: string;
}

interface Item {
    cantidad: string | number;
    unidad: string;
    descripcion: string;
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
        doc.text(String(text), x, y, { align });
    };

    // Helper for rectangles
    const rect = (x: number, y: number, w: number, h: number) => {
        doc.setLineWidth(0.3);
        doc.rect(x, y, w, h);
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

    // Draw Vector Logo (Stylized CVG/FMO)
    const lx = margin + 10;
    const ly = margin + 8;
    const lw = 20;
    const lh = 15;

    // Draw the specific geometric logo from the image (Square spiral "F")
    // Outer Path: Up-Right-Down-Left spiral
    doc.setLineWidth(1.5);
    doc.setDrawColor(80, 80, 80); // Dark Gray

    // Outer Arch
    doc.lines([
        [0, -10], // Up
        [15, 0],  // Right
        [0, 10],  // Down
    ], lx, ly + 10);

    // Inner F shape
    doc.lines([
        [0, -6], // Up
        [8, 0],  // Right
        [0, 4],  // Down
        [-4, 0]  // Left
    ], lx + 4, ly + 10);

    // Small square/dot inside?
    doc.rect(lx + 6, ly + 7, 2, 2, 'F');

    doc.setLineWidth(0.3);
    doc.setDrawColor(0);

    // Box 2: Title & Number
    drawT('PASE PARA MATERIALES Y MISCELÁNEOS', margin + logoBoxW + (contentW - logoBoxW) / 2, margin + 15, 14, 'bold', 'center');

    // Number (N. 86471)
    const numX = margin + contentW - 40;
    drawT(`N.º ${formData.numeroPase || '86471'}`, margin + contentW - 5, margin + 20, 14, 'bold', 'right');

    // ============================================
    // MIDDLE SECTION (Concept / Data)
    // ============================================
    // Left Col Width (Concept/Auth)
    const midY = margin + headerH;
    const leftColW = 55;
    const rightColW = contentW - leftColW;
    // Sections Calculation
    const footerH = 12; // Space for bottom warning inside border
    const tableSectionH = 60; // 6 rows * 10mm
    const midH = contentH - headerH - tableSectionH - footerH; // Fill remaining space

    // Vertical Divider
    doc.line(margin + leftColW, midY, margin + leftColW, midY + midH);
    // Bottom Divider of Middle Section
    doc.line(margin, midY + midH, margin + contentW, midY + midH);

    // --- LEFT COLUMN (Concept + Auth) ---
    // Header "CONCEPTO:"
    drawT('CONCEPTO:', margin + 2, midY + 4, 7, 'bold');

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
        // Box
        doc.rect(margin + 2, cy, 3, 3);
        // Label
        drawT(c.l, margin + 7, cy + 2.3, 6);
        // Check
        // @ts-ignore
        if (formData.concepto && formData.concepto[c.k]) {
            drawT('X', margin + 2.5, cy + 2.2, 7, 'bold');
        }
        cy += 4.5;
    });

    // "Tiempo estimado" Box (Next to checkboxes)
    const timeBoxX = margin + 30;
    const timeBoxY = midY + 8;
    const timeBoxW = 22;
    // drawT('Tiempo estimado de', timeBoxX, timeBoxY, 5);
    // drawT('Regreso a la Empresa', timeBoxX, timeBoxY + 3, 5);
    // doc.line(timeBoxX, timeBoxY + 5, timeBoxX + timeBoxW, timeBoxY + 5);
    // doc.line(timeBoxX, timeBoxY + 10, timeBoxX + timeBoxW, timeBoxY + 10);
    // doc.line(timeBoxX, timeBoxY + 15, timeBoxX + timeBoxW, timeBoxY + 15);

    // Adding Text for time estimate
    drawT('Tiempo estimado de', timeBoxX, timeBoxY - 2, 5);
    drawT('Regreso a la Empresa', timeBoxX, timeBoxY + 1, 5);
    rect(timeBoxX, timeBoxY + 2, timeBoxW, 15);
    doc.line(timeBoxX, timeBoxY + 7, timeBoxX + timeBoxW, timeBoxY + 7);
    doc.line(timeBoxX, timeBoxY + 12, timeBoxX + timeBoxW, timeBoxY + 12);

    // Auth Section (Bottom of Left Col)
    // Divider line
    const authY = midY + midH - 35; // Position at bottom of mid section
    doc.line(margin, authY, margin + leftColW, authY);

    drawT('AUTORIZADO POR:', margin + 2, authY + 4, 6, 'bold');
    drawT(formData.autorizadoPor || 'Carmen Márquez', margin + 25, authY + 4, 8); // Name filled

    drawT('CARGO:', margin + 2, authY + 10, 6, 'bold');
    drawT(formData.cargoAutorizador || 'Gerente de Telemática (e)', margin + 15, authY + 10, 7);

    drawT('FIRMA Y SELLO:', margin + 2, authY + 18, 6, 'bold');

    drawT('FICHA:', margin + 2, authY + 26, 6, 'bold');
    drawT(formData.fichaAutorizador || '15508', margin + 15, authY + 26, 8);

    doc.line(margin, authY + 28, margin + leftColW, authY + 28);
    drawT('LUGAR Y FECHA DE EMISIÓN:', margin + 2, authY + 32, 6, 'bold');


    // --- RIGHT COLUMN (Data Fields) ---
    // Row 1: Embarque
    const row1Y = midY;
    const row1H = 10; // Reduced from 12
    doc.line(margin + leftColW, row1Y + row1H, margin + contentW, row1Y + row1H);

    const ordenX = margin + contentW - 40;
    doc.line(ordenX, row1Y, ordenX, row1Y + row1H); // Vert line for Orden

    drawT('EMBARQUESE A:', margin + leftColW + 2, row1Y + 4, 7, 'bold');
    drawT(formData.embarqueseA || '', margin + leftColW + 2, row1Y + 9, 9);

    drawT('N.º ORDEN DE COMPRA:', ordenX + 2, row1Y + 4, 7, 'bold');
    drawT(formData.ordenCompra || '', ordenX + 2, row1Y + 9, 9);


    const row2Y = row1Y + row1H;
    const row2H = 10; // Reduced from 12
    doc.line(margin + leftColW, row2Y + row2H, margin + contentW, row2Y + row2H);

    const telX = margin + contentW - 70;
    const creditX = margin + contentW - 35;

    doc.line(telX, row2Y, telX, row2Y + row2H);
    doc.line(creditX, row2Y, creditX, row2Y + row2H);

    drawT('DIRECCIÓN:', margin + leftColW + 2, row2Y + 4, 7, 'bold');
    drawT(formData.direccion || '', margin + leftColW + 2, row2Y + 9, 8);

    drawT('TELÉFONO:', telX + 2, row2Y + 4, 7, 'bold');
    drawT(formData.telefono || '', telX + 2, row2Y + 9, 8);

    drawT('CONTADO:', creditX + 2, row2Y + 4, 6, 'bold');
    drawT('CRÉDITO:', creditX + 18, row2Y + 4, 6, 'bold');

    // Little boxes for pago
    rect(creditX + 13, row2Y + 2, 3, 3);
    rect(creditX + 29, row2Y + 2, 3, 3);
    if (formData.contado) drawT('X', creditX + 13.5, row2Y + 4.2, 7, 'bold');
    if (formData.credito) drawT('X', creditX + 29.5, row2Y + 4.2, 7, 'bold');


    // Row 3: Conductor | Ficha | Vehiculo FMO | Veh Part
    const row3Y = row2Y + row2H;
    const row3H = 10; // Reduced from 12
    doc.line(margin + leftColW, row3Y + row3H, margin + contentW, row3Y + row3H);

    const xFic = margin + leftColW + 45;
    const xVehF = xFic + 35;
    const xVehP = xVehF + 35;

    doc.line(xFic, row3Y, xFic, row3Y + row3H);
    doc.line(xVehF, row3Y, xVehF, row3Y + row3H);
    doc.line(xVehP, row3Y, xVehP, row3Y + row3H);

    drawT('CONDUCTOR:', margin + leftColW + 2, row3Y + 4, 7, 'bold');
    drawT(formData.conductor || '', margin + leftColW + 2, row3Y + 9, 9);

    drawT('FICHA O CI:', xFic + 2, row3Y + 4, 6, 'bold');
    drawT(formData.fichaConductor || '', xFic + 2, row3Y + 9, 9);

    drawT('VEHÍCULO F.M.O.', xVehF + 2, row3Y + 4, 6, 'bold');
    // drawT('VEHÍCULO F.M.O.', xVehF + 2, row3Y + 4, 6, 'bold'); // Typo fix
    drawT(formData.vehiculoFmo || '', xVehF + 2, row3Y + 9, 9);

    drawT('VEHÍCULO PARTIC.:', xVehP + 2, row3Y + 4, 6, 'bold');
    drawT(formData.vehiculoParticular || '', xVehP + 2, row3Y + 9, 9);


    // Row 4: Material Desp Por | Ficha | Cargo | Dept
    const row4Y = row3Y + row3H;
    const row4H = 10; // Reduced from 12
    doc.line(margin + leftColW, row4Y + row4H, margin + contentW, row4Y + row4H);

    doc.line(xFic, row4Y, xFic, row4Y + row4H);
    doc.line(xVehF, row4Y, xVehF, row4Y + row4H);
    doc.line(xVehP, row4Y, xVehP, row4Y + row4H);

    drawT('MATERIAL DESPACHADO POR:', margin + leftColW + 2, row4Y + 4, 7, 'bold');
    drawT(formData.despachadoPor || '', margin + leftColW + 2, row4Y + 9, 9);

    drawT('FICHA:', xFic + 2, row4Y + 4, 7, 'bold');
    drawT(formData.fichaDespachador || '', xFic + 2, row4Y + 9, 9);

    drawT('CARGO:', xVehF + 2, row4Y + 4, 7, 'bold');
    drawT(formData.cargo || '', xVehF + 2, row4Y + 9, 9);

    drawT('DEPARTAMENTO:', xVehP + 2, row4Y + 4, 7, 'bold');
    drawT(formData.departamento || '', xVehP + 2, row4Y + 9, 9);


    // Row 5: Observaciones (Tall)
    const row5Y = row4Y + row4H;
    const row5H = midY + midH - row5Y; // Remainder

    // Split: Obs | Dirigido | Solicitud
    const xDir = margin + leftColW + 55;
    const xSol = xDir + 50;

    doc.line(xDir, row5Y, xDir, row5Y + row5H);
    doc.line(xSol, row5Y, xSol, row5Y + row5H);

    drawT('Observaciones:', margin + leftColW + 2, row5Y + 4, 8, 'bold');
    // Multiline observations
    if (formData.dirigidoA) {
        doc.setFontSize(8);
        doc.text(formData.dirigidoA, margin + leftColW + 2, row5Y + 10, { maxWidth: xDir - (margin + leftColW) - 4 });
    }

    drawT('DIRIGIDO A:', xDir + 2, row5Y + 4, 8, 'bold');

    drawT('SOLICITUD:', xSol + 2, row5Y + 4, 8, 'bold');
    drawT(formData.solicitud || '', xSol + 2, row5Y + 10, 8);


    // ============================================
    // BOTTOM SECTION (Tables & Signatures)
    // ============================================
    const bottomY = midY + midH;
    const tableLimitY = bottomY + tableSectionH;

    // --- Columns Setup ---
    // Total Width: contentW (~195.9)
    // Left: Material Table. Width ~105mm?
    // Right: Signatures. Width ~90mm?
    // --- Columns Setup ---
    // Total Width: contentW
    // Scale proportionally from previous portrait (Mat ~53%, Sig ~47%)
    const matW = contentW * 0.55;
    const sigW = contentW - matW;

    const xSig = margin + matW;

    // Vertical Divider Table/Sig
    doc.line(xSig, bottomY, xSig, tableLimitY);
    // Bottom line of section
    doc.line(margin, tableLimitY, margin + contentW, tableLimitY);

    // --- LEFT: MATERIALS TABLE ---
    const cx1 = margin;
    const cx2 = margin + 15; // Cant
    const cx3 = margin + 30; // Unit
    // Desc goes to xSig.

    // Header Line
    const tableHeaderH = 7;
    const tableHeaderY = bottomY + tableHeaderH;
    doc.line(margin, tableHeaderY, margin + contentW, tableHeaderY);

    // Vert Lines for Table
    doc.line(cx2, bottomY, cx2, tableLimitY);
    doc.line(cx3, bottomY, cx3, tableLimitY);

    // Headers
    drawT('CANTIDAD', cx1 + 7.5, bottomY + 5, 6, 'bold', 'center');
    drawT('UNIDAD', cx2 + 7.5, bottomY + 5, 6, 'bold', 'center');
    drawT('DESCRIPCIÓN (INCLUYA MARCA Y SERIAL)', cx3 + 2, bottomY + 5, 6, 'bold', 'left');

    // Rows - EXACTLY 6 ROWS of 10mm each
    const rowH = 10;
    let ry = tableHeaderY;

    // Draw 6 rows
    for (let i = 0; i < 6; i++) {
        ry += rowH;
        doc.line(margin, ry, xSig, ry);

        // Fill data if available
        if (items[i]) {
            const item = items[i];
            const textY = ry - (rowH / 2) + 1.5;
            drawT(String(item.cantidad), cx1 + 7.5, textY, 8, 'normal', 'center');
            drawT(item.unidad, cx2 + 7.5, textY, 8, 'normal', 'center');
            drawT(item.descripcion, cx3 + 2, textY, 8, 'normal', 'left');
        }
    }


    // --- RIGHT: SIGNATURES SECTION ---
    // Split into 2 cols
    const xSigMid = xSig + sigW / 2;
    doc.line(xSigMid, bottomY, xSigMid, tableLimitY);

    // Header Titles
    drawT('DEPARTAMENTO DE PROTECCIÓN INDUSTRIAL', xSig + 2, bottomY + 3, 5, 'bold');
    drawT('DEPARTAMENTO DE PROTECCIÓN DE BUQUES E', xSigMid + 2, bottomY + 3, 5, 'bold');
    drawT('INSTALACIONES PORTUARIAS', xSigMid + 2, bottomY + 6, 5, 'bold');

    // Inner Grids (Salida / Entrada)
    // Structure:
    // Salida Revisada Por (Line)
    // N Ficha | Fecha | Hora (Line)
    // Porton No (Line)
    // Entrada Revisada Por (Line)
    // N Ficha | Fecha | Hora (Line)
    // Porton No (Bottom)

    // We need to distribute this height (~150mm) into sections? 
    // Actually the image shows these sections are top-aligned and there's empty space below?
    // Or they are spaced out?
    // Let's create fixed height rows for them, say 4 blocks.

    const blockH = 15;
    let bY = tableHeaderY; // Start below header

    // Helper for Sig Block
    const drawSigBlock = (x: number) => {
        let curY = bY;
        const h = 10; // Uniform 10mm height matching table rows

        // Block 1: Salida
        curY += h;
        doc.line(x, curY, x + sigW / 2, curY);
        drawT('SALIDA REVISADA POR:', x + 2, curY - 7, 5);

        // Block 2: Ficha/Fecha
        curY += h;
        doc.line(x, curY, x + sigW / 2, curY);
        doc.line(x + 15, curY - h, x + 15, curY); // Ficha line
        doc.line(x + 30, curY - h, x + 30, curY); // Fecha line

        drawT('N.º FICHA:', x + 2, curY - 7, 5);
        drawT('FECHA:', x + 17, curY - 7, 5);
        drawT('HORA:', x + 32, curY - 7, 5);

        // Block 3: Porton
        curY += h;
        doc.line(x, curY, x + sigW / 2, curY);
        drawT('PORTÓN No.', x + 2, curY - 7, 5);

        // Block 4: Entrada
        curY += h;
        doc.line(x, curY, x + sigW / 2, curY);
        drawT('ENTRADA REVISADA POR:', x + 2, curY - 7, 5);

        // Block 5: Ficha/Fecha
        curY += h;
        doc.line(x, curY, x + sigW / 2, curY);
        doc.line(x + 15, curY - h, x + 15, curY);
        doc.line(x + 30, curY - h, x + 30, curY);

        drawT('N.º FICHA:', x + 2, curY - 7, 5);
        drawT('FECHA:', x + 17, curY - 7, 5);
        drawT('HORA:', x + 32, curY - 7, 5);

        // Block 6: Porton
        curY += h;
        doc.line(x, curY, x + sigW / 2, curY);
        drawT('PORTÓN No.', x + 2, curY - 7, 5);
    };

    drawSigBlock(xSig);
    drawSigBlock(xSigMid);


    // ============================================
    // FOOTER (Warning)
    // ============================================
    const footY = tableLimitY + 4;
    drawT('EL USUARIO DEBE NOTIFICAR LA ENTRADA DE MATERIAL O EQUIPOS A LA SECCIÓN', margin + 2, footY, 6, 'bold');
    drawT('DE PROTECCIÓN INDUSTRIAL.', margin + 2, footY + 4, 6, 'bold');

    // Checkmarks graphic on right info
    drawT('TODO VEHICULO DEBE SER INSPECCIONADO EN LOS PORTONES.', xSig + 5, footY + 2, 5);
    drawT('LOS ESPACIOS EN BLANCO NO APLICAN', xSig + 5, footY + 5, 5);
    drawT('NO SE ACEPTAN ENMIENDAS', xSig + 5, footY + 8, 5);

    // Preview
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
};
