import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

/**
 * Controller to handle PDF file uploads and extract text from them.
 */
export const extractPdfText = async (req, res) => {
  try {
    // 1. Verify file exists in request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded. Please upload a PDF file."
      });
    }

    // 2. Verify file type is indeed PDF
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        error: "Invalid file type. Only PDF files are supported."
      });
    }

    // 3. Extract text using PDFParse
    const uint8Array = new Uint8Array(req.file.buffer);
    
    let text = '';
    try {
      const parser = new PDFParse(uint8Array);
      await parser.load();
      const parsedData = await parser.getText();
      text = parsedData.text;
    } catch (pdfError) {
      console.error("Error during PDF text extraction parsing:", pdfError);
      return res.status(422).json({
        success: false,
        error: "Failed to parse the PDF document. It might be empty, password-protected, or corrupted."
      });
    }
    
    if (!text || !text.trim()) {
      return res.status(422).json({
        success: false,
        error: "No readable text content found in the PDF. Scanned or image-only PDFs are not supported without OCR."
      });
    }

    // 4. Return extracted text
    return res.status(200).json({
      success: true,
      text: text.trim()
    });

  } catch (error) {
    console.error("General error in extractPdfText controller:", error);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred during PDF text extraction."
    });
  }
};
