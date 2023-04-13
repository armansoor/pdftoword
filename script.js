// Define variables for elements that will be manipulated
const fileInput = document.getElementById('fileInput');
const convertBtn = document.getElementById('convertBtn');
const downloadLink = document.getElementById('downloadLink');

// Add event listener for the Convert button
convertBtn.addEventListener('click', async () => {
  // Get the selected file
  const file = fileInput.files[0];
  
  // Check if a file was selected
  if (!file) {
    alert('Please select a file');
    return;
  }
  
  // Determine the file type
  const fileType = file.type;
  
  // Convert PDF to Word
  if (fileType === 'application/pdf') {
    const pdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    const text = await pdfDoc.extractText();
    const doc = new docx.Document();
    const paragraph = doc.addParagraph();
    paragraph.addRun(text);
    const packer = new docx.Packer();
    const buffer = await packer.toBuffer(doc);
    const convertedFile = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    
    // Update the Download link with the converted file
    downloadLink.href = URL.createObjectURL(convertedFile);
    downloadLink.style.display = 'block';
    
  // Convert Word to PDF
  } else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = () => {
      const convertedFile = new Blob([reader.result], { type: 'application/pdf' });
      
      // Update the Download link with the converted file
      downloadLink.href = URL.createObjectURL(convertedFile);
      downloadLink.style.display = 'block';
    };
    
  // Invalid file type
  } else {
    alert('Invalid file type');
    return;
  }
});

// Make the Convert button responsive
convertBtn.addEventListener('mouseenter', () => {
  convertBtn.style.background = '#333';
  convertBtn.style.color = '#fff';
});

convertBtn.addEventListener('mouseleave', () => {
  convertBtn.style.background = '#fff';
  convertBtn.style.color = '#333';
});

// Make the Download link responsive
downloadLink.addEventListener('mouseenter', () => {
  downloadLink.style.background = '#333';
  downloadLink.style.color = '#fff';
});

downloadLink.addEventListener('mouseleave', () => {
  downloadLink.style.background = '#fff';
  downloadLink.style.color = '#333';
});
