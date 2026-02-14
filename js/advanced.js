const AdvancedTools = {
    // ... existing functions from above ...

    async mergePDFs(files) {
        const mergedPdf = await PDFLib.PDFDocument.create();
        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        const pdfBytes = await mergedPdf.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    },

    async splitPDF(file, ranges) {
        // ranges: string "1, 3-5"
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        const newPdf = await PDFLib.PDFDocument.create();

        const totalPages = pdfDoc.getPageCount();
        const pagesToKeep = new Set();

        const parts = ranges.split(',').map(p => p.trim());
        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(Number);
                for (let i = start; i <= end; i++) {
                    if (i > 0 && i <= totalPages) pagesToKeep.add(i - 1);
                }
            } else {
                const num = Number(part);
                if (num > 0 && num <= totalPages) pagesToKeep.add(num - 1);
            }
        }

        const indices = Array.from(pagesToKeep).sort((a,b) => a - b);
        const copiedPages = await newPdf.copyPages(pdfDoc, indices);
        copiedPages.forEach(page => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    },

    async reorderPDF(file, pageIndices) {
        // pageIndices: array of 0-based page indices in new order
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        const newPdf = await PDFLib.PDFDocument.create();

        const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach(page => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    },

    async getPagePreviews(file) {
        // Returns array of dataURLs for each page
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const previews = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.5 }); // Thumbnail size
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
            previews.push(canvas.toDataURL('image/jpeg'));
        }
        return previews;
    },

    async protectPDF(file, password) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        pdfDoc.encrypt({ userPassword: password, ownerPassword: password });
        const pdfBytes = await pdfDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    },

    async unlockPDF(file, password) {
        const arrayBuffer = await file.arrayBuffer();
        try {
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { password });
            const pdfBytes = await pdfDoc.save(); // Saves without encryption unless re-encrypted
            return new Blob([pdfBytes], { type: 'application/pdf' });
        } catch (e) {
            throw new Error("Invalid password or corrupted file.");
        }
    },

    async compressPDF(file) {
        // Naive: Rasterize pages to JPEGs then rebuild PDF
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const newPdf = await PDFLib.PDFDocument.create();

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.0 }); // Lower scale = more compression

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport }).promise;

            const imgData = canvas.toDataURL('image/jpeg', 0.5); // 50% quality
            const img = await newPdf.embedJpg(imgData);

            const newPage = newPdf.addPage([viewport.width, viewport.height]);
            newPage.drawImage(img, {
                x: 0,
                y: 0,
                width: viewport.width,
                height: viewport.height,
            });
        }
        const pdfBytes = await newPdf.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    },

    async pdfToExcel(file) {
        // Simplistic approach: extract text items, try to group by Y coord to form rows
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const wb = XLSX.utils.book_new();

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();

            // Group by Y position (approximate rows)
            const rows = {};
            content.items.forEach(item => {
                const y = Math.round(item.transform[5]); // Round to nearest int to group slight misalignments
                if (!rows[y]) rows[y] = [];
                rows[y].push({ x: item.transform[4], str: item.str });
            });

            // Sort rows by Y (descending)
            const sortedY = Object.keys(rows).sort((a, b) => b - a);
            const sheetData = [];

            sortedY.forEach(y => {
                // Sort cells in row by X
                const rowItems = rows[y].sort((a, b) => a.x - b.x);
                sheetData.push(rowItems.map(item => item.str));
            });

            const ws = XLSX.utils.aoa_to_sheet(sheetData);
            XLSX.utils.book_append_sheet(wb, ws, `Page ${i}`);
        }

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        return new Blob([wbout], { type: "application/octet-stream" });
    },

    async pdfToPPT(file) {
        const pptx = new PptxGenJS();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

            const imgData = canvas.toDataURL('image/png');
            const slide = pptx.addSlide();
            slide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });
        }

        const blob = await pptx.write("blob");
        return blob;
    },

    async ocrPDF(file) {
        const worker = await Tesseract.createWorker('eng');
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

            const { data: { text } } = await worker.recognize(canvas);
            fullText += `--- Page ${i} ---\n${text}\n\n`;
        }
        await worker.terminate();
        return new Blob([fullText], { type: 'text/plain' });
    }
};

window.AdvancedTools = AdvancedTools;
