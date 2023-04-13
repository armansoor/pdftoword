const pdfToWordBtn = document.getElementById('pdf-to-word-btn');
const wordToPdfBtn = document.getElementById('word-to-pdf-btn');
const fileInput = document.getElementById('file-input');

pdfToWordBtn.addEventListener('click', convertPDFToWord);
wordToPdfBtn.addEventListener('click', convertWordToPDF);

async function convertPDFToWord() {
  // Load the PDF file into pdf-lib
  const pdfBytes = await fileInput.files[0].arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

  // Convert the PDF to a Word document
  const wordDoc = await PDFLib.embedFonts(pdfDoc);
  const wordBytes = await wordDoc.saveAsByteArray();

  // Create a download link for the Word document
  const blob = new Blob([wordBytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'converted.docx';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

async function convertWordToPDF() {
  // Load the Word file into pdf-lib
  const wordBytes = await fileInput.files[0].arrayBuffer();
  const wordDoc = await PDFLib.PDF
Document.load(wordBytes);

// Convert the Word document to a PDF
const pdfDoc = await PDFLib.PDFDocument.create();
const page = pdfDoc.addPage();
const { width, height } = page.getSize();
const font = await pdfDoc.embedFont(PDFLib.StandardFonts.TimesRoman);
const textSize = 30;
const text = await font.layout('Converted from Word', { size: textSize });
const textWidth = text.width;
const textHeight = text.height;
const x = (width - textWidth) / 2;
const y = (height - textHeight) / 2;
page.drawText('Converted from Word', { x, y, size: textSize, font });

// Create a download link for the PDF document
const pdfBytes = await pdfDoc.saveAsByteArray();
const blob = new Blob([pdfBytes], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);
const downloadLink = document.createElement('a');
downloadLink.href = url;
downloadLink.download = 'converted.pdf';
document.body.appendChild(downloadLink);
downloadLink.click();
document.body.removeChild(downloadLink);
}
