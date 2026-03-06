"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ExportData {
  title: string;
  generatedAt: string;
  data: Record<string, unknown>[];
}

/**
 * Export data to PDF using jsPDF + autoTable
 */
export function exportToPDF(exportData: ExportData): void {
  const doc = new jsPDF({ orientation: "landscape" });

  // Header
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text("PISAC - Centro de Comando de Resiliência Municipal", 14, 15);

  doc.setFontSize(12);
  doc.setTextColor(249, 115, 22); // accent color
  doc.text(exportData.title, 14, 24);

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Gerado em: ${new Date(exportData.generatedAt).toLocaleString("pt-BR")}`, 14, 30);
  doc.text(`Total de registros: ${exportData.data.length}`, 14, 35);

  // Table
  if (exportData.data.length > 0) {
    const headers = Object.keys(exportData.data[0]);
    const rows = exportData.data.map((row) =>
      headers.map((h) => {
        const val = row[h];
        return val === null || val === undefined ? "" : String(val);
      })
    );

    autoTable(doc, {
      head: [headers.map((h) => h.charAt(0).toUpperCase() + h.slice(1))],
      body: rows,
      startY: 40,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `PISAC-UNB • Página ${i} de ${pageCount} • Documento oficial para uso governamental`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  const filename = `PISAC_${exportData.title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Export data to Excel using xlsx
 */
export function exportToExcel(exportData: ExportData): void {
  const wb = XLSX.utils.book_new();

  // Main data sheet
  const ws = XLSX.utils.json_to_sheet(exportData.data);

  // Style headers
  if (ws["!ref"]) {
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[cell]) {
        ws[cell].s = { font: { bold: true }, fill: { fgColor: { rgb: "F97316" } } };
      }
    }
  }

  // Column widths
  if (exportData.data.length > 0) {
    const keys = Object.keys(exportData.data[0]);
    ws["!cols"] = keys.map((key) => {
      const maxLen = Math.max(
        key.length,
        ...exportData.data.map((row) => String(row[key] ?? "").length)
      );
      return { wch: Math.min(maxLen + 2, 40) };
    });
  }

  XLSX.utils.book_append_sheet(wb, ws, exportData.title.substring(0, 31));

  // Metadata sheet
  const meta = XLSX.utils.aoa_to_sheet([
    ["PISAC - Centro de Comando de Resiliência Municipal"],
    [""],
    ["Relatório", exportData.title],
    ["Gerado em", new Date(exportData.generatedAt).toLocaleString("pt-BR")],
    ["Total de registros", exportData.data.length],
    [""],
    ["Este documento é de uso oficial do governo."],
  ]);
  XLSX.utils.book_append_sheet(wb, meta, "Metadados");

  const filename = `PISAC_${exportData.title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Fetch export data from API and download
 */
export async function downloadReport(
  type: "crises" | "incidents" | "municipalities" | "resources" | "audit" | "users",
  format: "pdf" | "excel"
): Promise<void> {
  const res = await fetch(`/api/export?type=${type}`);
  const exportData: ExportData = await res.json();

  if (format === "pdf") {
    exportToPDF(exportData);
  } else {
    exportToExcel(exportData);
  }
}
