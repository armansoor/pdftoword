// js/advanced_security.js

const SecurityTools = {
    async getMetadata(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        return {
            title: pdf.getTitle() || '',
            author: pdf.getAuthor() || '',
            subject: pdf.getSubject() || '',
            keywords: pdf.getKeywords() || '',
            creator: pdf.getCreator() || '',
            producer: pdf.getProducer() || ''
        };
    },

    async setMetadata(file, metadata) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);

        if (metadata.title !== undefined) pdf.setTitle(metadata.title);
        if (metadata.author !== undefined) pdf.setAuthor(metadata.author);
        if (metadata.subject !== undefined) pdf.setSubject(metadata.subject);
        if (metadata.keywords !== undefined) pdf.setKeywords(metadata.keywords.split(',').map(s => s.trim()));

        const pdfBytes = await pdf.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    },

    async addWatermark(file, text) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const pages = pdf.getPages();
        const font = await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold);

        pages.forEach(page => {
            const { width, height } = page.getSize();
            page.drawText(text, {
                x: width / 2 - (text.length * 20) / 2, // Approx centering
                y: height / 2,
                size: 50,
                font: font,
                color: PDFLib.rgb(0.7, 0.7, 0.7), // Light gray
                opacity: 0.5,
                rotate: PDFLib.degrees(45),
            });
        });

        const pdfBytes = await pdf.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    }
};

window.SecurityTools = SecurityTools;
