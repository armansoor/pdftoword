// js/advanced_editing.js

const EditingTools = {
    async addPageNumbers(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const pages = pdf.getPages();
        const font = await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
        const total = pages.length;

        pages.forEach((page, idx) => {
            const { width } = page.getSize();
            const text = `Page ${idx + 1} of ${total}`;
            const textSize = 10;
            const textWidth = font.widthOfTextAtSize(text, textSize);

            page.drawText(text, {
                x: width - textWidth - 20,
                y: 20,
                size: textSize,
                font: font,
                color: PDFLib.rgb(0, 0, 0),
            });
        });

        const pdfBytes = await pdf.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    },

    async signPDF(file, signatureDataUrl) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const pages = pdf.getPages();
        const signatureImage = await pdf.embedPng(signatureDataUrl);
        const { width, height } = signatureImage.scale(0.5);

        // Add signature to the last page by default, bottom right
        const lastPage = pages[pages.length - 1];
        const { width: pageWidth, height: pageHeight } = lastPage.getSize();

        lastPage.drawImage(signatureImage, {
            x: pageWidth - width - 50,
            y: 50,
            width: width,
            height: height,
        });

        const pdfBytes = await pdf.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    },

    async flattenPDF(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const form = pdf.getForm();
        form.flatten();
        const pdfBytes = await pdf.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    },

    // HTML to PDF (Visual)
    async htmlToPDF(html) {
        // Create a temporary container
        const container = document.createElement('div');
        container.innerHTML = html;
        container.style.width = '800px';
        container.style.padding = '20px';
        container.style.position = 'absolute';
        container.style.top = '-9999px';
        container.style.background = 'white';
        document.body.appendChild(container);

        try {
            const canvas = await html2canvas(container);
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            return pdf.output('blob');
        } finally {
            document.body.removeChild(container);
        }
    }
};

window.EditingTools = EditingTools;
