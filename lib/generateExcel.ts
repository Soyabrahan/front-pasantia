import * as XLSX from "xlsx";

interface PaseRecord {
    id: string;
    numeroPase: string;
    fecha_emision: string;
    concepto?: string;
    tipo_pago?: string;
    numero_compra?: string;
    solicitador?: { nombre: string; ficha: string; departamento?: string; cargo?: string };
    conductor?: { nombre: string; ficha: string };
    vehiculo?: { placa: string; modelo: string; fmo?: string };
    destino?: { nombre: string; direccion: string; telefono?: string };
    observaciones?: string;
    tiempo_estimado?: string;
    solicitud?: string;
    despachador?: { nombre: string; ficha: string; departamento?: string; cargo?: string };
    autorizador?: { nombre: string; ficha: string; cargo?: string };
    equiposPases?: any[];
}

export function generateExcel(data: PaseRecord[]) {
    // Map the passes to flat rows
    const rows = data.map((pase) => {
        // Grouping logic for equipment/materials to match PDF and table formatting
        const groups: Record<string, any> = {};
        (pase.equiposPases || []).forEach((ep: any) => {
            const equipo = ep.equipo;
            if (!equipo) return;
            const key = `${equipo.nombre}-${equipo.marca}`;
            if (!groups[key]) {
                groups[key] = {
                    nombre: equipo.nombre,
                    marca: equipo.marca,
                    cantidad: 0,
                    ids: []
                };
            }
            groups[key].cantidad += ep.cantidad || 1;
            if (equipo.fmo) groups[key].ids.push(equipo.fmo);
            if (equipo.serial) groups[key].ids.push(equipo.serial);
        });

        const equipStr = Object.values(groups).map((g: any) => {
            const idStr = (g.ids.length > 0) ? ` (${g.ids.join(", ")})` : "";
            return `${g.cantidad}x ${g.nombre || ""}${g.marca ? ` ${g.marca}` : ""}${idStr}`;
        }).join("; ");

        const fecha = pase.fecha_emision ? new Date(pase.fecha_emision).toLocaleDateString("es-ES") : "N/A";

        // Build flat object for Excel columns
        return {
            "Número de Pase": pase.numeroPase || "N/A",
            "Fecha Emisión": fecha,
            "Concepto": pase.concepto || "N/A",
            "Solicitante (Nombre)": pase.solicitador?.nombre || "N/A",
            "Solicitante (Ficha)": pase.solicitador?.ficha || "N/A",
            "Solicitante (Departamento)": pase.solicitador?.departamento || "N/A",
            "Solicitante (Cargo)": pase.solicitador?.cargo || "N/A",
            "Conductor (Nombre)": pase.conductor?.nombre || "N/A",
            "Conductor (Ficha)": pase.conductor?.ficha || "N/A",
            "Vehículo (Placa)": pase.vehiculo?.placa || "N/A",
            "Vehículo (Modelo)": pase.vehiculo?.modelo || "N/A",
            "Vehículo (FMO)": pase.vehiculo?.fmo || "N/A",
            "Destino (Nombre)": pase.destino?.nombre || "N/A",
            "Destino (Dirección)": pase.destino?.direccion || "N/A",
            "Destino (Teléfono)": pase.destino?.telefono || "N/A",
            "Tipo de Pago": pase.tipo_pago || "N/A",
            "Orden de Compra": pase.numero_compra || "N/A",
            "Despachado Por": pase.despachador?.nombre || "N/A",
            "Ficha Despachador": pase.despachador?.ficha || "N/A",
            "Autorizado Por": pase.autorizador?.nombre || "N/A",
            "Ficha Autorizador": pase.autorizador?.ficha || "N/A",
            "Tiempo Estimado": pase.tiempo_estimado || "N/A",
            "N° Solicitud": pase.solicitud || "N/A",
            "Equipos / Materiales": equipStr || "Ninguno",
            "Observaciones (Dirigido A)": pase.observaciones || ""
        };
    });

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial de Pases");

    // Auto-adjust column widths
    const maxColumnWidths = rows.reduce((acc: Record<string, number>, row: any) => {
        Object.keys(row).forEach((key) => {
            const val = String(row[key] || "");
            const len = Math.max(key.length, val.length);
            acc[key] = Math.max(acc[key] || 0, len);
        });
        return acc;
    }, {});
    
    worksheet["!cols"] = Object.keys(maxColumnWidths).map((key) => ({
        wch: Math.min(Math.max(maxColumnWidths[key] + 3, 10), 50) // clamp width between 10 and 50 characters to prevent overly wide columns
    }));

    // Trigger download
    XLSX.writeFile(workbook, `Reporte_Pases_${new Date().toISOString().split("T")[0]}.xlsx`);
}
