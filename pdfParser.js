const pdfParse = require('pdf-parse');

const parsePdfBuffer = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF buffer:', error.message);
    throw new Error('Failed to parse PDF document. Ensure it is a valid, unencrypted PDF.');
  }
};

module.exports = { parsePdfBuffer };
