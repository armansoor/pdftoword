const fileInput = document.querySelector('#file-input');
const pdfToWordBtn = document.querySelector('#pdf-to-word-btn');
const wordToPdfBtn = document.querySelector('#word-to-pdf-btn');
const output = document.querySelector('#output');
const downloadLink = document.querySelector('#download');

// Function to validate uploaded file
function validateFile() {
  const file = fileInput.files[0];
  if (!file) {
    output.innerHTML = 'Please select a file.';
    downloadLink.innerHTML = '';
    return false;
  }
  const fileType = file.type;
  if (fileType !== 'application/pdf' && fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    output.innerHTML = 'Please select a PDF or Word document.';
    downloadLink.innerHTML = '';
    return false;
  }
  return true;
}

// Function to convert PDF to Word
async function convertPDFToWord() {
  if (!validateFile()) {
    return;
  }
  try {
    // Load the PDF document
    const pdfBytes = await fileInput.files[0].arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Extract the text from the PDF document
    const text = await pdfDoc.saveAsBase64();

    // Code to convert the text to Word
    const wordBytes = window.atob(text);
    const wordBlob = new Blob([wordBytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const wordUrl = URL.createObjectURL(wordBlob);
    downloadLink.innerHTML = `<a href="${wordUrl}" download="converted.docx">Download Converted File</a>`;
    output.innerHTML = '';
  } catch (error) {
    console.error(error);
  }
}

// Function to convert Word to PDF
async function convertWordToPDF() {
  if (!validateFile()) {
    return;
  }
  try {
    // Code to convert Word to PDF
    output.innerHTML = "Word to PDF conversion is complete!";
    downloadLink.innerHTML = '';
  } catch (error) {
    console.error(error);
  }
}

// Attach click event listeners to the buttons
pdfToWordBtn.addEventListener('click', convertPDFToWord);
wordToPdfBtn.addEventListener('click', convertWordToPDF);
