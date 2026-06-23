import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PaseRecord {
    id: string;
    numeroPase: string;
    fecha_emision: string;
    solicitador?: { nombre: string; ficha: string };
    conductor?: { nombre: string; ficha: string };
    vehiculo?: { placa: string; modelo: string };
    destino?: { nombre: string; direccion: string; telefono?: string };
    solicitud?: string;
}

const TITLE = 'CONTROL DE SALIDAS DE PASE PARA MATERIALES Y MISCELANEOS';
const PAGE_W = 297;
const PAGE_H = 210;
const MARGIN = 10;
const TABLE_W = PAGE_W - 2 * MARGIN;

export const generateControlPdf = (
    pases: PaseRecord[],
    rangeFrom: number,
    rangeTo: number
) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
    });

    // ========================
    // COLUMN WIDTHS
    // ========================
    const colW = [9.5, 19.4, 19.4, 19.1, 70.2, 24.7, 63.5, 39.2];

    // ========================
    // HEADER
    // ========================
    const drawHeader = () => {
        doc.setLineWidth(0.2);
        doc.rect(0, 0, PAGE_W, PAGE_H);

        // Logos
        try {
            doc.addImage('/cvg.png', 'PNG', 15, 2, 30.9, 29.6);
        } catch (_) {}

        try {
            doc.addImage(
                '/Logo_Ferrominera_Orinoco.jpg',
                'JPEG',
                PAGE_W - 15 - 30.9,
                2,
                30.9,
                29.6
            );
        } catch (_) {}

        // Title in one line - Helvetica bold 14pt, centered
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(TITLE, PAGE_W / 2, 26, { align: 'center' });

    };

    drawHeader();

    // ========================
    // BUILD TABLE DATA
    // ========================
    const paseMap = new Map<string, PaseRecord>();
    for (const p of pases) {
        paseMap.set(p.numeroPase, p);
    }

    const body: string[][] = [];
    let seq = 0;

    for (let n = rangeFrom; n <= rangeTo; n++) {
        seq++;
        const numStr = String(n);
        const pase = paseMap.get(numStr);

        let fechaFormatted = '';
        if (pase?.fecha_emision) {
            const d = new Date(pase.fecha_emision);
            fechaFormatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
        }

        const usuario = pase?.solicitador
            ? `${pase.solicitador.nombre || ''}${pase.solicitador.ficha ? ` F-${pase.solicitador.ficha}` : ''}`
            : '';

        const vehiculoText = pase?.conductor
            ? `${pase.conductor.nombre || ''}${pase.conductor.ficha ? ` F-${pase.conductor.ficha}` : ''}${pase.vehiculo?.placa ? ` V: ${pase.vehiculo.placa}` : ''}`
            : '';

        body.push([
            String(seq),
            fechaFormatted,
            numStr,
            '-----------\n---------',
            pase?.destino?.nombre || '',
            pase?.destino?.telefono || '',
            usuario,
            vehiculoText,
        ]);
    }

    // ========================
    // TABLE with autoTable
    // ========================
    autoTable(doc, {
        head: [[
            'Nº',
            'FECHA',
            'Nº DE PASE',
            'N.º / S',
            'ENTREGADO A:',
            'EXT',
            'USUARIOS / FICHA',
            'VEHICULO FMO/PARTIC./\nLLEVADO POR',
        ]],
        body,
        startY: 35,
        theme: 'grid',
        margin: { left: MARGIN, right: MARGIN },
        tableWidth: TABLE_W,
        styles: {
            font: 'helvetica',
            fontStyle: 'bold',
            fontSize: 11,
            lineWidth: 0.15,
            lineColor: [0, 0, 0],
            textColor: [0, 0, 0],
            cellPadding: 1.5,
            valign: 'middle',
        },
        headStyles: {
            halign: 'center',
            fontSize: 10,
            fillColor: false,
            lineWidth: 0.15,
            lineColor: [0, 0, 0],
            textColor: [0, 0, 0],
        },
        bodyStyles: {
            valign: 'middle',
            minCellHeight: 8,
        },
        columnStyles: {
            0: { cellWidth: colW[0], halign: 'center' },
            1: { cellWidth: colW[1], halign: 'center' },
            2: { cellWidth: colW[2], halign: 'center' },
            3: { cellWidth: colW[3], halign: 'center' },
            4: { cellWidth: colW[4], halign: 'left' },
            5: { cellWidth: colW[5], halign: 'center' },
            6: { cellWidth: colW[6], halign: 'left' },
            7: { cellWidth: colW[7], halign: 'left' },
        },
        didParseCell(data) {
            if (data.column.index === 2 && data.section === 'body') {
                data.cell.styles.fillColor = false;
            }
        },
        willDrawCell(data) {
            if (data.column.index === 2 && data.section === 'body') {
                const c = data.cell;
                const doc = data.doc;
                const text = String(c.raw || '');
                if (!text) return;
                const pad = c.padding('left');
                const fontSize = c.styles.fontSize || 11;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(fontSize);
                const textW = doc.getTextWidth(text);
                const textH = fontSize * 0.3528;
                const cx = c.x + c.width / 2;
                const cy = c.y + c.height / 2;
                doc.setFillColor(255, 255, 0);
                doc.rect(cx - textW / 2 - 1.5, cy - textH / 2 - 0.5, textW + 3, textH + 1.5, 'F');
            }
        },
        willDrawPage(data) {
            if (data.pageNumber > 1) {
                doc.setLineWidth(0.2);
                doc.rect(0, 0, PAGE_W, PAGE_H);

                try {
                    doc.addImage('/cvg.png', 'PNG', 15, 2, 30.9, 29.6);
                } catch (_) {}
                try {
                    doc.addImage(
                        '/Logo_Ferrominera_Orinoco.jpg',
                        'JPEG',
                        PAGE_W - 15 - 30.9,
                        2,
                        30.9,
                        29.6
                    );
                } catch (_) {}

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                doc.text(TITLE, PAGE_W / 2, 26, { align: 'center' });
            }
        },
        showHead: 'everyPage',
        pageBreak: 'auto',
    });

    // ========================
    // OUTPUT
    // ========================
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
};
