/**
 * PDF Parsing Service
 * Extracts structured health data from PDF lab reports using AI
 */

const pdf = require('pdf-parse');
const ClaudeService = require('./claudeService');
const {
  validateLabResults,
  validateGeneticData,
  validateMedicalReport
} = require('../schemas/validationSchemas');

class PDFParsingService {
  constructor() {
    // Use Haiku for cost-effective parsing
    this.claudeService = new ClaudeService('haiku');
  }

  /**
   * Remove repeated page headers/footers from multi-page pathology reports.
   * Melbourne Pathology (and similar) repeat the full patient header on every page.
   */
  deduplicateText(pdfText) {
    const lines = pdfText.split('\n');
    const seen = new Set();
    const filtered = [];
    let skipCount = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty lines
      if (!trimmed) {
        filtered.push(line);
        continue;
      }
      // Skip repeated header lines (patient info, lab name, dates that appear on every page)
      if (seen.has(trimmed) && (
        trimmed.startsWith('MELBOURNE PATHOLOGY') ||
        trimmed.startsWith('Patient:') ||
        trimmed.startsWith('DOB:') ||
        trimmed.startsWith('Address:') ||
        trimmed.startsWith('Ordered by:') ||
        trimmed.startsWith('Copy to:') ||
        trimmed.startsWith('Collected:') ||
        trimmed.startsWith('Reported:') ||
        trimmed.startsWith('Tests Completed:') ||
        trimmed.startsWith('Tests Pending') ||
        trimmed.startsWith('Sample Pending') ||
        trimmed.startsWith('Melbourne Pathology NATA') ||
        trimmed.startsWith('Dept Supervising') ||
        trimmed.includes('midstream cardiovascular') ||
        trimmed.startsWith('EVEDA') ||
        trimmed.startsWith('Patient Name:') ||
        trimmed.startsWith('MRN:') ||
        trimmed.startsWith('Email:') ||
        trimmed.startsWith('Lab Reference ID') ||
        // Dante Labs headers
        trimmed.startsWith('www.dantelabs.com') ||
        trimmed.startsWith('DANTE LABS') ||
        trimmed.startsWith('KIT ID:') ||
        trimmed.includes('Wellness and Lifestyle Report') ||
        trimmed.includes('Kit ID:')
      )) {
        skipCount++;
        continue;
      }
      seen.add(trimmed);
      filtered.push(line);
    }

    if (skipCount > 0) {
      console.log(`📄 Removed ${skipCount} duplicate header/footer lines`);
    }

    return filtered.join('\n');
  }

  /**
   * Parse a PDF buffer and extract structured health data
   * @param {Buffer} pdfBuffer - The PDF file buffer
   * @param {string} category - Data category (lab_results, genetic_data, etc.)
   * @returns {Object} Structured health data
   */
  async parsePDF(pdfBuffer, category) {
    try {
      console.log(`📄 Parsing PDF for category: ${category}`);

      // Extract text from PDF
      const pdfData = await pdf(pdfBuffer);
      let pdfText = pdfData.text;

      if (!pdfText || pdfText.trim().length === 0) {
        throw new Error('No text content found in PDF. This may be a scanned/image-based PDF that requires OCR.');
      }

      // Check if extracted text has enough meaningful content
      const meaningfulText = pdfText.replace(/\s+/g, ' ').trim();
      const hasNumbers = /\d+\.?\d*/.test(meaningfulText);

      console.log(`📄 Extracted ${pdfText.length} characters from PDF (meaningful: ${meaningfulText.length} chars, has numbers: ${hasNumbers})`);

      if (meaningfulText.length < 50) {
        throw new Error('PDF appears to be scanned/image-based with insufficient text content. OCR is required to extract data from this file.');
      }

      // Deduplicate repeated headers from multi-page reports
      pdfText = this.deduplicateText(pdfText);
      console.log(`📄 After deduplication: ${pdfText.length} characters`);

      // Route to appropriate parser based on category
      switch (category) {
        case 'lab_results':
          return await this.parseLabResults(pdfText);
        case 'genetic_data':
          return await this.parseGeneticData(pdfText);
        case 'medical_reports':
          return await this.parseMedicalReport(pdfText);
        default:
          // Generic extraction for unknown types
          return await this.parseGeneric(pdfText, category);
      }

    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  /**
   * Try to repair truncated JSON from AI response
   */
  repairTruncatedJson(jsonText) {
    // If JSON ends mid-array, try to close it
    let repaired = jsonText.trim();

    // Remove trailing comma if present
    repaired = repaired.replace(/,\s*$/, '');

    // Count open/close braces and brackets
    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/]/g) || []).length;

    // Try to close unclosed structures
    // First close any open strings (look for odd number of unescaped quotes)
    // Then close brackets and braces
    const bracketDiff = openBrackets - closeBrackets;
    const braceDiff = openBraces - closeBraces;

    if (bracketDiff > 0 || braceDiff > 0) {
      console.log(`📄 Attempting JSON repair: ${bracketDiff} unclosed brackets, ${braceDiff} unclosed braces`);

      // If we're in the middle of a biomarker object, try to find a good cut point
      const lastCompleteObject = repaired.lastIndexOf('},');
      const lastCompleteObjectEnd = repaired.lastIndexOf('}');

      if (lastCompleteObject > 0 && bracketDiff > 0) {
        // Cut at the last complete object in the array
        repaired = repaired.substring(0, lastCompleteObject + 1);
      }

      // Close remaining structures
      for (let i = 0; i < openBrackets - (repaired.match(/]/g) || []).length; i++) {
        repaired += ']';
      }
      for (let i = 0; i < openBraces - (repaired.match(/}/g) || []).length; i++) {
        repaired += '}';
      }
    }

    return repaired;
  }

  /**
   * Parse lab results PDF into structured biomarker data
   */
  async parseLabResults(pdfText) {
    // Truncate very long texts to avoid exceeding input limits
    const maxInputChars = 15000;
    if (pdfText.length > maxInputChars) {
      console.log(`📄 Truncating PDF text from ${pdfText.length} to ${maxInputChars} chars`);
      pdfText = pdfText.substring(0, maxInputChars);
    }

    const prompt = `You are a medical data extraction specialist. Extract structured biomarker data from this lab report.

Lab Report Text:
${pdfText}

Extract ALL biomarkers found in the report. For each biomarker, extract:
- name: The biomarker name (e.g., "Total Cholesterol", "HDL", "Vitamin D")
- value: The numeric value
- unit: The unit of measurement (e.g., "mmol/L", "mg/dL", "ng/mL")
- referenceRange: The normal reference range as a string (e.g., "< 5.0", "40-60", "> 75")
- flagged: true if out of range or flagged (marked with H or L), false if normal
- testDate: The date of the test (ISO format if possible, or the original format)
- category: The category (e.g., "Cardiovascular", "Metabolic", "Vitamins", "Hormones", "Haematology", "Organ", "General")

When there are multiple dates/results for the same biomarker, use the MOST RECENT value only (the "Latest Results" column).

Return ONLY a valid JSON object with this structure:
{
  "testDate": "YYYY-MM-DD",
  "labProvider": "Lab name if found",
  "biomarkers": [
    {
      "name": "Biomarker Name",
      "value": 4.2,
      "unit": "mmol/L",
      "referenceRange": "< 5.0",
      "flagged": false,
      "category": "Cardiovascular"
    }
  ]
}

Important:
- Extract ONLY biomarkers that are explicitly present in the text with actual numeric values
- Do NOT fabricate, estimate, or invent any values - only extract what is clearly stated in the text
- If the text is garbled, incomplete, or does not contain clear biomarker values, return: {"testDate": null, "labProvider": null, "biomarkers": []}
- Use consistent naming (e.g., "Vitamin D" not "Vit D" or "25-OH Vitamin D")
- Convert values to numbers where possible
- Use the most recent date and most recent values when multiple dates exist
- Do not include any markdown formatting, just raw JSON
- If you cannot confidently extract data from the text, return an empty biomarkers array rather than guessing`;

    // Use higher max_tokens for large reports (50+ biomarkers need ~8k tokens of JSON)
    const response = await this.claudeService.generateResponse(prompt, [], {}, { maxTokens: 8192 });
    const responseText = response.text || response;

    // Clean up response (remove markdown code blocks if present)
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    // First try parsing as-is
    try {
      const parsedData = JSON.parse(jsonText);
      console.log(`✅ Extracted ${parsedData.biomarkers?.length || 0} biomarkers`);

      const validatedData = validateLabResults(parsedData);
      console.log(`✅ Validated ${validatedData.biomarkers.length} biomarkers`);

      return validatedData;
    } catch (parseError) {
      console.warn('⚠️ Initial JSON parse failed, attempting repair...');
      console.warn('First 300 chars:', jsonText.substring(0, 300));
      console.warn('Last 200 chars:', jsonText.substring(jsonText.length - 200));

      // Try to repair truncated JSON
      try {
        const repairedJson = this.repairTruncatedJson(jsonText);
        const parsedData = JSON.parse(repairedJson);
        console.log(`✅ Repaired JSON: extracted ${parsedData.biomarkers?.length || 0} biomarkers`);

        const validatedData = validateLabResults(parsedData);
        console.log(`✅ Validated ${validatedData.biomarkers.length} biomarkers (from repaired JSON)`);

        return validatedData;
      } catch (repairError) {
        console.error('Failed to repair JSON:', repairError.message);
        console.error('Original response (first 500 chars):', jsonText.substring(0, 500));
        throw new Error('AI returned invalid JSON format. The report may be too large or complex for automated parsing.');
      }
    }
  }

  /**
   * Parse genetic data PDF (23andMe, AncestryDNA, etc.)
   */
  async parseGeneticData(pdfText) {
    if (pdfText.length > 15000) {
      pdfText = pdfText.substring(0, 15000);
    }

    const prompt = `Extract genetic health information from this genetic test report.

Report Text:
${pdfText}

Extract:
- traits: Personal traits with genetic influence
- healthRisks: Health conditions with genetic risk assessment
- ancestry: Ancestry breakdown if present

Return ONLY valid JSON:
{
  "reportDate": "YYYY-MM-DD",
  "provider": "Provider name",
  "traits": [
    {
      "name": "Trait name",
      "result": "Description of genetic predisposition",
      "gene": "Gene symbol (e.g., APOE, COMT)"
    }
  ],
  "healthRisks": [
    {
      "condition": "Condition name",
      "riskLevel": "Lower than average|Average|Slightly elevated|Elevated",
      "geneticContribution": 25,
      "lifestyleContribution": 75
    }
  ]
}`;

    const response = await this.claudeService.generateResponse(prompt, [], {}, { maxTokens: 8192 });
    const responseText = response.text || response;

    let jsonText = responseText.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');

    try {
      const parsedData = JSON.parse(jsonText);

      // Validate parsed genetic data
      const validatedData = validateGeneticData(parsedData);
      console.log(`✅ Validated genetic data: ${validatedData.traits?.length || 0} traits, ${validatedData.healthRisks?.length || 0} health risks`);

      return validatedData;
    } catch (parseError) {
      throw new Error('AI returned invalid JSON format for genetic data');
    }
  }

  /**
   * Parse general medical report
   */
  async parseMedicalReport(pdfText) {
    if (pdfText.length > 15000) {
      pdfText = pdfText.substring(0, 15000);
    }

    const prompt = `Extract key information from this medical report.

Report Text:
${pdfText}

Extract summary information. Return ONLY valid JSON:
{
  "reportDate": "YYYY-MM-DD",
  "reportType": "Type of report",
  "provider": "Healthcare provider",
  "summary": "Brief summary of key findings",
  "diagnoses": ["List of diagnoses if any"],
  "recommendations": ["List of recommendations if any"]
}`;

    const response = await this.claudeService.generateResponse(prompt, [], {}, { maxTokens: 8192 });
    const responseText = response.text || response;

    let jsonText = responseText.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');

    try {
      const parsedData = JSON.parse(jsonText);

      // Validate parsed medical report
      const validatedData = validateMedicalReport(parsedData);
      console.log(`✅ Validated medical report from ${validatedData.reportDate}`);

      return validatedData;
    } catch (parseError) {
      throw new Error('AI returned invalid JSON format for medical report');
    }
  }

  /**
   * Generic parser for unknown document types
   */
  async parseGeneric(pdfText, category) {
    return {
      extractedText: pdfText.substring(0, 5000), // Limit to first 5000 chars
      category: category,
      parsedDate: new Date().toISOString(),
      note: 'Generic extraction - structured parsing not available for this category'
    };
  }
}

module.exports = PDFParsingService;
