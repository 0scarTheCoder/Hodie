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
      const pdfText = pdfData.text;

      if (!pdfText || pdfText.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }

      console.log(`📄 Extracted ${pdfText.length} characters from PDF`);

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
   * Parse lab results PDF into structured biomarker data
   */
  async parseLabResults(pdfText) {
    const prompt = `You are a medical data extraction specialist. Extract structured biomarker data from this lab report.

Lab Report Text:
${pdfText}

Extract ALL biomarkers found in the report. For each biomarker, extract:
- name: The biomarker name (e.g., "Total Cholesterol", "HDL", "Vitamin D")
- value: The numeric value
- unit: The unit of measurement (e.g., "mmol/L", "mg/dL", "ng/mL")
- referenceRange: The normal reference range as a string (e.g., "< 5.0", "40-60", "> 75")
- flagged: true if out of range or flagged, false if normal
- testDate: The date of the test (ISO format if possible, or the original format)
- category: The category (e.g., "Cardiovascular", "Metabolic", "Vitamins", "Hormones", "General")

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
- Extract ALL biomarkers found in the report
- Use consistent naming (e.g., "Vitamin D" not "Vit D" or "25-OH Vitamin D")
- Convert values to numbers where possible
- If multiple tests are present, use the most recent date
- Do not include any markdown formatting, just raw JSON`;

    const response = await this.claudeService.generateResponse(prompt, [], {});
    const responseText = response.text || response;

    // Clean up response (remove markdown code blocks if present)
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    try {
      const parsedData = JSON.parse(jsonText);
      console.log(`✅ Extracted ${parsedData.biomarkers?.length || 0} biomarkers`);

      // Validate parsed data
      const validatedData = validateLabResults(parsedData);
      console.log(`✅ Validated ${validatedData.biomarkers.length} biomarkers`);

      return validatedData;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', jsonText.substring(0, 200));
      throw new Error('AI returned invalid JSON format');
    }
  }

  /**
   * Parse genetic data PDF (23andMe, AncestryDNA, etc.)
   */
  async parseGeneticData(pdfText) {
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

    const response = await this.claudeService.generateResponse(prompt, [], {});
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

    const response = await this.claudeService.generateResponse(prompt, [], {});
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

  /**
   * Validate parsed lab results data
   */
  validateLabResults(data) {
    if (!data || !data.biomarkers || !Array.isArray(data.biomarkers)) {
      throw new Error('Invalid lab results structure');
    }

    // Validate each biomarker has required fields
    for (const biomarker of data.biomarkers) {
      if (!biomarker.name || biomarker.value === undefined) {
        throw new Error(`Invalid biomarker: missing name or value`);
      }
    }

    return true;
  }
}

module.exports = PDFParsingService;
