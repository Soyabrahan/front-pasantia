import * as XLSX from "xlsx";

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

export function generateControlExcel(
    pases: PaseRecord[],
    rangeFrom: number,
    rangeTo: number
) {
    const paseMap = new Map<string, PaseRecord>();
    for (const p of pases) {
        paseMap.set(p.numeroPase, p);
    }

    const rows: Record<string, string | number>[] = [];
    let seq = 0;

    for (let n = rangeFrom; n <= rangeTo; n++) {
        seq++;
        const numStr = String(n);
        const pase = paseMap.get(numStr);

        let fechaFormatted = "";
        if (pase?.fecha_emision) {
            const d = new Date(pase.fecha_emision);
            fechaFormatted = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
        }

        const usuario = pase?.solicitador
            ? `${pase.solicitador.nombre || ""}${pase.solicitador.ficha ? ` F-${pase.solicitador.ficha}` : ""}`
            : "";

        const vehiculoText = pase?.conductor
            ? `${pase.conductor.nombre || ""}${pase.conductor.ficha ? ` F-${pase.conductor.ficha}` : ""}${pase.vehiculo?.placa ? ` V: ${pase.vehiculo.placa}` : ""}`
            : "";

        rows.push({
            "Nº": seq,
            "FECHA": fechaFormatted,
            "Nº DE PASE": numStr,
            "N.º / S": pase?.solicitud || "",
            "ENTREGADO A:": pase?.destino?.nombre || "",
            "EXT": pase?.destino?.telefono || "",
            "USUARIOS / FICHA": usuario,
            "VEHICULO FMO/PARTIC./LLEVADO POR": vehiculoText,
        });
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Control de Salidas");

    const maxWidths = rows.reduce((acc: Record<string, number>, row) => {
        for (const key of Object.keys(row)) {
            const val = String(row[key] || "");
            acc[key] = Math.max(acc[key] || 0, key.length, val.length);
        }
        return acc;
    }, {} as Record<string, number>);

    worksheet["!cols"] = Object.keys(maxWidths).map((key) => ({
        wch: Math.min(Math.max(maxWidths[key] + 3, 8), 60),
    }));

    XLSX.writeFile(workbook, `Control_Salidas_${rangeFrom}_${rangeTo}_${new Date().toISOString().split("T")[0]}.xlsx`);
}
