"use client";

import { jsPDF } from "jspdf";

type ExportOpts = {
  title: string;
  body: string;
  meta?: { label: string; value: string }[];
  signature?: string;
};

export function exportToPDF({ title, body, meta = [], signature }: ExportOpts) {
  const doc = new jsPDF({
    unit: "pt",
    format: "letter",
  });
  const margin = 56;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header bar
  doc.setFillColor(20, 22, 40);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 6, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(20, 24, 40);
  doc.text(title, margin, margin);

  // Meta row
  let y = margin + 22;
  if (meta.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 124, 140);
    const metaLine = meta.map((m) => `${m.label}: ${m.value}`).join("   ·   ");
    doc.text(metaLine, margin, y);
    y += 16;
  }

  // Divider
  doc.setDrawColor(225, 228, 235);
  doc.line(margin, y, margin + width, y);
  y += 18;

  // Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(35, 38, 55);
  const lines = doc.splitTextToSize(body, width) as string[];
  for (const line of lines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 16;
  }

  if (signature) {
    if (y > pageHeight - margin - 60) {
      doc.addPage();
      y = margin;
    }
    y += 14;
    doc.setFont("helvetica", "italic");
    doc.setTextColor(70, 75, 100);
    doc.text(signature, margin, y);
  }

  // Footer
  const footerY = pageHeight - 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 153, 165);
  doc.text("Generated with Lumen · AI Freelance Copilot", margin, footerY);

  const filename = `${title.toLowerCase().replace(/\s+/g, "-").slice(0, 60)}.pdf`;
  doc.save(filename);
}
