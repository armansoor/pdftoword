// js/main.js

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

document.addEventListener('DOMContentLoaded', () => {
    const options = document.querySelectorAll('.option-card');

    options.forEach(card => {
        card.addEventListener('click', async (e) => {
            const action = card.dataset.action;
            const file = window.currentFile;

            if (!file) {
                UI.updateMascot('Please select a file first! 📁');
                return;
            }

            // Validate file type based on action
            if (!validateFileType(file, action)) {
                return;
            }

            UI.updateMascot('Processing... Please wait! ⏳', 0);

            try {
                let resultBlob;
                let filename;

                switch (action) {
                    case 'pdf-to-word':
                        resultBlob = await Converter.pdfToWord(file);
                        filename = file.name.replace('.pdf', '.docx');
                        break;
                    case 'word-to-pdf':
                        resultBlob = await Converter.wordToPdf(file);
                        filename = file.name.replace(/\.(docx|doc)$/, '.pdf');
                        break;
                    case 'pdf-to-jpg':
                        // This might return a ZIP if multiple pages
                        resultBlob = await Converter.pdfToJpg(file);
                        filename = 'converted_images.zip';
                        break;
                    case 'jpg-to-pdf':
                        resultBlob = await Converter.jpgToPdf(file);
                        filename = file.name.replace(/\.(jpg|jpeg|png)$/, '.pdf');
                        break;
                    case 'pdf-to-text':
                        resultBlob = await Converter.pdfToText(file);
                        filename = file.name.replace('.pdf', '.txt');
                        break;
                    case 'text-to-pdf':
                        resultBlob = await Converter.textToPdf(file);
                        filename = file.name.replace('.txt', '.pdf');
                        break;
                    default:
                        throw new Error('Unknown action');
                }

                // Trigger Download
                saveAs(resultBlob, filename);

                UI.updateMascot('All done! Downloading now! 🎉');
                addToHistory(action, file.name);

            } catch (error) {
                console.error(error);
                UI.updateMascot('Oops! Something went wrong. 😭');
                alert('Error: ' + error.message);
            }
        });
    });
});

function validateFileType(file, action) {
    const type = file.type;
    const name = file.name.toLowerCase();

    if (action.startsWith('pdf-') && type !== 'application/pdf') {
        UI.updateMascot('That doesn\'t look like a PDF! 🧐');
        return false;
    }
    if (action === 'word-to-pdf' && !name.match(/\.(docx|doc)$/)) {
         UI.updateMascot('Please upload a Word file! 📝');
         return false;
    }
    if (action === 'jpg-to-pdf' && !type.match(/image\/*/)) {
        UI.updateMascot('Please upload an image! 🖼️');
        return false;
    }
    if (action === 'text-to-pdf' && type !== 'text/plain') {
         UI.updateMascot('Please upload a text file! 📄');
         return false;
    }
    return true;
}

function addToHistory(action, filename) {
    const list = document.getElementById('history-list');
    const item = document.createElement('li');
    item.className = 'history-item';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = `${filename} (${formatAction(action)})`;

    const timeSpan = document.createElement('span');
    timeSpan.style.fontSize = '0.8rem';
    timeSpan.style.color = 'var(--text-secondary)';
    timeSpan.textContent = new Date().toLocaleTimeString();

    item.appendChild(nameSpan);
    item.appendChild(timeSpan);

    list.prepend(item);

    // Show section if hidden
    document.getElementById('history-section').classList.remove('hidden');

    // Save to local storage (simplified)
    const history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
    history.unshift({ filename, action, date: new Date().toISOString() });
    if (history.length > 5) history.pop();
    localStorage.setItem('conversionHistory', JSON.stringify(history));
}

function formatAction(action) {
    return action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Load history on start
const savedHistory = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
if (savedHistory.length) {
    document.getElementById('history-section').classList.remove('hidden');
    savedHistory.forEach(h => {
         const list = document.getElementById('history-list');
         const item = document.createElement('li');
         item.className = 'history-item';

         const nameSpan = document.createElement('span');
         nameSpan.textContent = `${h.filename} (${formatAction(h.action)})`;

         const timeSpan = document.createElement('span');
         timeSpan.style.fontSize = '0.8rem';
         timeSpan.style.color = 'var(--text-secondary)';
         timeSpan.textContent = new Date(h.date).toLocaleTimeString();

         item.appendChild(nameSpan);
         item.appendChild(timeSpan);

        list.appendChild(item);
    });
}

document.getElementById('clear-history').addEventListener('click', () => {
    localStorage.removeItem('conversionHistory');
    document.getElementById('history-list').innerHTML = '';
    document.getElementById('history-section').classList.add('hidden');
});
