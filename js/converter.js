// js/converter.js

const Converter = {

    async pdfToWord(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const numPages = pdf.numPages;

        const children = [];

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // Extract text items and sort/group them into lines
            const items = textContent.items;

            // Sort by Y (descending) then X (ascending)
            items.sort((a, b) => {
                const yA = a.transform[5];
                const yB = b.transform[5];
                if (Math.abs(yA - yB) > 5) {
                    return yB - yA; // Top to bottom
                }
                return a.transform[4] - b.transform[4]; // Left to right
            });

            // Group into lines
            let currentLineText = '';
            let lastY = items.length > 0 ? items[0].transform[5] : 0;

            for (const item of items) {
                const currentY = item.transform[5];
                if (Math.abs(currentY - lastY) > 10) { // New line threshold
                    if (currentLineText.trim()) {
                        children.push(
                            new docx.Paragraph({
                                children: [new docx.TextRun(currentLineText)],
                            })
                        );
                    }
                    currentLineText = '';
                    lastY = currentY;
                }
                // Add space if needed? Simple concatenation for now
                currentLineText += item.str + (item.hasEOL ? ' ' : '');
            }
             // Push last line
            if (currentLineText.trim()) {
                children.push(
                    new docx.Paragraph({
                        children: [new docx.TextRun(currentLineText)],
                    })
                );
            }

             // Add page break if not last page
             if (i < numPages) {
                 children.push(new docx.Paragraph({ children: [new docx.PageBreak()] }));
             }
        }

        const doc = new docx.Document({
            sections: [{
                properties: {},
                children: children,
            }],
        });

        return await docx.Packer.toBlob(doc);
    },

    async wordToPdf(file) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        const text = result.value;

        const pdfDoc = await PDFLib.PDFDocument.create();
        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        let page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const fontSize = 12;

        // Simple text wrapping logic
        const lines = text.split('\n');
        let y = height - 50;

        for (const line of lines) {
             // Handle wrapping if line is too long (very basic)
             // For now, let's just draw line by line and assume reasonable length or truncate
             // Real wrapping requires measuring text width

             if (y < 50) {
                 page = pdfDoc.addPage();
                 y = height - 50;
             }

             // Basic wrapping for long lines
             const maxChars = 80;
             const chunks = wrapText(line, maxChars);

             for (const chunk of chunks) {
                 if (y < 50) {
                     page = pdfDoc.addPage();
                     y = height - 50;
                 }
                 page.drawText(chunk, {
                    x: 50,
                    y: y,
                    size: fontSize,
                    font: font,
                    color: PDFLib.rgb(0, 0, 0),
                 });
                 y -= fontSize + 5;
             }
        }

        const pdfBytes = await pdfDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    },

    async pdfToJpg(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const zip = new JSZip();

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 }); // High quality

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
            zip.file(`page-${i}.jpg`, blob);
        }

        return await zip.generateAsync({ type: 'blob' });
    },

    async jpgToPdf(file) {
        // Can handle multiple files if passed differently, but for now single file
        // To support multiple files, we'd need to change the UI to accept multiple files
        // Assuming 'file' is a single image file here

        const pdfDoc = await PDFLib.PDFDocument.create();
        const page = pdfDoc.addPage();
        const arrayBuffer = await file.arrayBuffer();

        let image;
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (file.type === 'image/png') {
            image = await pdfDoc.embedPng(arrayBuffer);
        } else {
            throw new Error('Unsupported image format');
        }

        const { width, height } = image.scale(1);

        // Scale image to fit page
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();

        const scale = Math.min(pageWidth / width, pageHeight / height);

        page.drawImage(image, {
            x: (pageWidth - width * scale) / 2,
            y: (pageHeight - height * scale) / 2,
            width: width * scale,
            height: height * scale,
        });

        const pdfBytes = await pdfDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    },

    async pdfToText(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n\n';
        }

        return new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    },

    async textToPdf(file) {
        const text = await file.text();
        const pdfDoc = await PDFLib.PDFDocument.create();
        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        let page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const fontSize = 12;

        const lines = text.split('\n');
        let y = height - 50;

        for (const line of lines) {
             const maxChars = 90;
             const chunks = wrapText(line, maxChars);

             for (const chunk of chunks) {
                 if (y < 50) {
                     page = pdfDoc.addPage();
                     y = height - 50;
                 }
                 page.drawText(chunk, {
                    x: 50,
                    y: y,
                    size: fontSize,
                    font: font,
                    color: PDFLib.rgb(0, 0, 0),
                 });
                 y -= fontSize + 5;
             }
        }

        const pdfBytes = await pdfDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    }
};

window.Converter = Converter;

function wrapText(text, maxChars) {
    if (!text) return [''];
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        if (currentLine.length + 1 + words[i].length <= maxChars) {
            currentLine += ' ' + words[i];
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    lines.push(currentLine);
    return lines;
}
