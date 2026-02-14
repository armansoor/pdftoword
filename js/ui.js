// js/ui.js

const themeSwitch = document.getElementById('theme-switch');
const mascot = document.getElementById('mascot');
const mascotText = document.getElementById('mascot-text');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileSelectBtn = document.getElementById('file-select-btn');
const fileInfo = document.getElementById('file-info');
const fileNameDisplay = document.getElementById('file-name');
const removeFileBtn = document.getElementById('remove-file-btn');
const conversionOptions = document.getElementById('conversion-options');

// Theme Toggle
themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        updateMascot('Magic Night mode activated! 🌙');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        updateMascot('Magic Day mode shining! ☀️');
    }
});

// Check local storage for theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    themeSwitch.checked = true;
    document.documentElement.setAttribute('data-theme', 'dark');
}

// Mascot Helper
function updateMascot(text, duration = 3000) {
    mascotText.textContent = text;
    mascotText.style.opacity = 1;
    mascotText.style.animation = 'none';
    mascotText.offsetHeight; /* trigger reflow */
    mascotText.style.animation = 'popIn 0.5s forwards';

    // Optional: Reset after duration
    if (duration > 0) {
        setTimeout(() => {
            mascotText.textContent = "I'm ready! ✨";
        }, duration);
    }
}

// Drag & Drop UI
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
    updateMascot('Ooh! Is that a file? 😲', 0);
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
    updateMascot('Don\'t leave me hanging! 🥺', 2000);
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');

    if (e.dataTransfer.files.length) {
        handleFileSelect(e.dataTransfer.files[0]);
    }
});

fileSelectBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFileSelect(e.target.files[0]);
    }
});

removeFileBtn.addEventListener('click', () => {
    resetUI();
    updateMascot('File removed! 🗑️');
});

function handleFileSelect(file) {
    window.currentFile = file; // Store globally for converter
    fileNameDisplay.textContent = file.name;

    dropZone.classList.add('hidden');
    fileInfo.classList.remove('hidden');
    conversionOptions.classList.remove('hidden');

    updateMascot(`Yay! ${file.name} selected! 🎉`, 0);
}

function resetUI() {
    window.currentFile = null;
    dropZone.classList.remove('hidden');
    fileInfo.classList.add('hidden');
    conversionOptions.classList.add('hidden');
    fileInput.value = '';
}

// Global UI export
window.UI = {
    updateMascot,
    resetUI
};
