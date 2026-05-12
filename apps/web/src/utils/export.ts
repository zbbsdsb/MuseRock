export interface ExportOptions {
  title: string;
  content: string;
}

export async function exportToMarkdown(options: ExportOptions): Promise<void> {
  const filename = `${sanitizeFilename(options.title || 'document')}.md`;
  const content = `# ${options.title || 'Untitled Document'}\n\n${options.content}`;
  
  downloadFile(content, filename, 'text/markdown');
}

export async function exportToWord(options: ExportOptions): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, SectionType } = await import('docx');
  
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: options.title || 'Untitled Document',
                bold: true,
                size: 32,
              }),
            ],
            spacing: { after: 200 },
          }),
          ...parseContentToParagraphs(options.content, { Paragraph, TextRun }),
        ],
      },
    ],
  });
  
  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  downloadBlob(blob, `${sanitizeFilename(options.title || 'document')}.docx`);
}

export async function exportToPDF(options: ExportOptions): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;
  
  const element = document.createElement('div');
  element.innerHTML = `
    <style>
      .pdf-content {
        font-family: 'Georgia', serif;
        padding: 40px;
        max-width: 600px;
        margin: 0 auto;
      }
      .pdf-title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
        text-align: center;
      }
      .pdf-body {
        font-size: 12px;
        line-height: 1.8;
        white-space: pre-wrap;
      }
    </style>
    <div class="pdf-content">
      <div class="pdf-title">${escapeHtml(options.title || 'Untitled Document')}</div>
      <div class="pdf-body">${escapeHtml(options.content)}</div>
    </div>
  `;
  
  document.body.appendChild(element);
  
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    
    pdf.save(`${sanitizeFilename(options.title || 'document')}.pdf`);
  } finally {
    document.body.removeChild(element);
  }
}

function parseContentToParagraphs(
  content: string,
  { Paragraph, TextRun }: { Paragraph: any; TextRun: any }
) {
  const lines = content.split('\n');
  const paragraphs = [];
  
  for (const line of lines) {
    if (line.trim()) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(line)],
          spacing: { after: 100 },
        })
      );
    } else {
      paragraphs.push(new Paragraph({}));
    }
  }
  
  return paragraphs;
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}