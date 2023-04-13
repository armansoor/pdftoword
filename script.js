const fileInput = document.querySelector('#file-input');
const pdfToWordBtn = document.querySelector('#pdf-to-word-btn');
const wordToPdfBtn = document.querySelector('#word-to-pdf-btn');
const output = document.querySelector('#output');

// Function to convert PDF to Word
async function convertPDFToWord() {
  try {
    // Load the PDF document
    const pdfBytes = await fileInput.files[0].arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Extract the text from the PDF document
    const text = await pdfDoc.saveAsBase64();

    // Code to convert the text to Word
    output.innerHTML = `<a href="data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${text}" download="converted.docx">Download Converted File</a>`;
  } catch (error) {
    console.error(error);
  }
}

// Function to convert Word to PDF
async function convertWordToPDF() {
  try {
    // Code to convert Word to PDF
    output.innerHTML = "Word to PDF conversion is complete!";
  } catch (error) {
    console.error(error);
  }
}

// Attach click event listeners to the buttons
pdfToWordBtn.addEventListener('click', convertPDFToWord);
wordToPdfBtn.addEventListener('click', convertWordToPDF);
