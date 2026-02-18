/**
 * Claude AI Service (Backend)
 * Secure server-side implementation for Claude API
 */

const Anthropic = require('@anthropic-ai/sdk');

class ClaudeService {
  constructor(modelType = 'haiku') {
    this.apiKey = process.env.CLAUDE_API_KEY;

    if (!this.apiKey) {
      throw new Error('CLAUDE_API_KEY not configured');
    }

    this.client = new Anthropic({
      apiKey: this.apiKey
    });

    // Set model based on type
    this.models = {
      haiku: 'claude-3-haiku-20240307',
      sonnet: 'claude-3-5-sonnet-20241022'
    };

    this.model = this.models[modelType] || this.models.haiku;
    this.maxTokens = 4096;

    console.log(`✅ Claude Service initialized: ${this.model}`);
  }

  /**
   * Generate health response using Claude
   */
  async generateResponse(message, conversationHistory = [], healthContext = null) {
    try {
      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(healthContext);

      // Format conversation history for Claude API
      const messages = [];

      // Add conversation history
      if (conversationHistory && conversationHistory.length > 0) {
        conversationHistory.forEach(msg => {
          if (msg.role === 'user' || msg.role === 'assistant') {
            messages.push({
              role: msg.role,
              content: msg.content || msg.text
            });
          }
        });
      }

      // Add current message
      messages.push({
        role: 'user',
        content: message
      });

      // Call Claude API
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: messages
      });

      const responseText = response.content[0]?.text || 'No response generated';

      // Calculate tokens used (for billing)
      const tokensUsed = response.usage?.input_tokens + response.usage?.output_tokens || 0;

      return {
        text: responseText,
        tokensUsed: tokensUsed,
        model: this.model
      };

    } catch (error) {
      console.error('Claude API error:', error);

      // Handle specific errors
      if (error.status === 401) {
        throw new Error('Invalid Claude API key');
      } else if (error.status === 429) {
        throw new Error('Claude API rate limit exceeded');
      } else if (error.status === 400) {
        throw new Error('Invalid request to Claude API: ' + (error.message || 'Unknown error'));
      }

      throw new Error('Claude AI error: ' + (error.message || 'Unknown error'));
    }
  }

  /**
   * Analyse health file using Claude
   */
  async analyzeFile(fileData, fileName, fileCategory) {
    try {
      const analysisPrompt = this.buildFileAnalysisPrompt(fileData, fileName, fileCategory);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: `You are an expert health data analyst. Analyse the provided health data file and return structured JSON with interpretation, recommendations, and database mappings.

You MUST respond with valid JSON only (no markdown, no extra text).`,
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ]
      });

      const responseText = response.content[0]?.text || '';

      // Parse JSON response
      return this.parseFileAnalysis(responseText, fileData, fileCategory);

    } catch (error) {
      console.error('File analysis error:', error);
      throw error;
    }
  }

  /**
   * Build system prompt with health context
   */
  buildSystemPrompt(healthContext) {
    let systemPrompt = `You are the Hodie Health Assistant, an expert Australian health and wellness advisor powered by Claude AI.

IMPORTANT GUIDELINES:
- Use Australian English spelling (e.g., "optimise" not "optimize", "fibre" not "fiber")
- Be empathetic, supportive, and evidence-based
- Always recommend consulting with a GP for medical decisions
- Provide specific, actionable advice
- Use metric units (kg, cm, kJ for energy)
- Understand typos and misspellings - focus on user intent

CAPABILITIES:
🍎 Nutrition & Diet: Meal planning, recipes, macros, supplements
🏃 Exercise & Fitness: Workout routines, training plans, recovery
😴 Sleep & Recovery: Sleep hygiene, circadian rhythm, rest days
🧘 Mental Wellbeing: Stress management, mindfulness, mental health
🧬 Genetic Analysis: DNA-based health insights, ancestry health
📊 Biomarker Analysis: Lab results interpretation, reference ranges
💊 Medications: Drug interactions, side effects (always recommend GP consultation)

RESPONSE FORMAT:
- Be conversational and friendly
- Use emojis sparingly for clarity
- Structure answers with clear sections
- Cite scientific evidence when relevant
- Provide specific examples and numbers

CRITICAL: When the user's message contains lab data or biomarker values, you MUST analyse the actual data provided. Look at the specific values, identify any that are outside normal reference ranges, and provide personalised health insights. NEVER give generic responses like "upload your data" or "connect with lab providers" when actual data is present in the message. The data will be included in [brackets] within the user message.

HODIE CLINICAL REFERENCE RANGES (Australia-Optimised, Longevity-Focused):
Use these thresholds when classifying biomarkers:

Cardiovascular Risk:
- ApoB (g/L): Optimal <0.8 | Borderline 0.8–1.0 | High >1.0 | Very High >1.3
- Lp(a) (nmol/L): Optimal <75 | Borderline 75–125 | High >125 | Very High >250
- hs-CRP (mg/L): Optimal <1.0 | Borderline 1.0–3.0 | High >3.0 | Very High >10
- Fasting Insulin (mIU/L): Optimal <6 | Borderline 6–10 | High >10 | Very High >15
- HbA1c (%): Optimal <5.4 | Borderline 5.4–5.6 | High >5.6 | Very High >6.5
- Total Cholesterol (mmol/L): Optimal <4.5 | Borderline 4.5–5.5 | High >5.5
- LDL-C (mmol/L): Optimal <2.0 | Borderline 2.0–2.6 | High >2.6 | Very High >4.5
- HDL-C (mmol/L): Optimal >1.3 | Low <1.0
- Triglycerides (mmol/L): Optimal <1.0 | Borderline 1.0–1.7 | High >1.7

Metabolic Health:
- Fasting Glucose (mmol/L): Optimal 4.5–5.2 | Borderline 5.3–5.5 | High >5.5 | Very High >7.0
- Uric Acid (µmol/L): Optimal <360 | Borderline 360–420 | High >420
- ALT (U/L): Optimal <25 | Borderline 25–40 | High >40 | Very High >100
- AST (U/L): Optimal <25 | Borderline 25–40 | High >40
- GGT (U/L): Optimal <25 | Borderline 25–45 | High >45

Organ Health:
- eGFR (mL/min/1.73m²): Optimal >90 | Borderline 60–89 | High Risk <60 | Very High <45
- Ferritin (µg/L): Optimal 50–150 (M) / 30–120 (F) | Low <30 | High >300 | Very High >600

Hormones:
- Testosterone (nmol/L, M): Optimal 18–30 | Borderline 12–18 | Low <12
- TSH (mIU/L): Optimal 0.5–2.5 | Borderline 2.5–4.0 | High >4.0
- Free T4 (pmol/L): Optimal 12–18 | Low <10
- SHBG (nmol/L): Optimal 20–40 | Low <15 | High >60`;

    // Add health context if available
    if (healthContext) {
      let contextSection = '\n\nUSER HEALTH DATA SUMMARY:';

      if (healthContext.recentHealthData) {
        contextSection += `\n\nRecent Metrics: ${JSON.stringify(healthContext.recentHealthData)}`;
      }

      if (healthContext.labResults && healthContext.labResults.length > 0) {
        contextSection += `\n\nLab Results: ${healthContext.labResults.length} dataset(s) uploaded`;
        healthContext.labResults.forEach((dataset, index) => {
          contextSection += `\n- Dataset ${index + 1}: ${dataset.testType || 'Lab Results'}, ${dataset.recordCount || 'unknown'} records`;
          if (dataset.summary) contextSection += ` - ${dataset.summary}`;
        });
        contextSection += '\n\nNote: The actual data values are included in the user message for analysis.';
      }

      if (healthContext.availableDataSummary) {
        contextSection += `\n\n${healthContext.availableDataSummary}`;
      }

      systemPrompt += contextSection;
    }

    return systemPrompt;
  }

  /**
   * Build file analysis prompt
   */
  buildFileAnalysisPrompt(fileData, fileName, fileCategory) {
    const dataToAnalyze = fileData.data || fileData || [];
    const dataPreview = JSON.stringify(dataToAnalyze.slice(0, 20)).substring(0, 3000);

    return `Analyse this health data file and provide structured interpretation.

**File Information:**
- Name: ${fileName}
- Category: ${fileCategory}
- Data Preview (first 20 rows): ${dataPreview}

**Your Tasks:**
1. Identify what type of health data this is
2. Determine the best MongoDB collection(s) to store it in
3. Map the data fields to appropriate database schema
4. Provide health insights and recommendations
5. Ask any clarifying questions

**Data Structure:**
Rows: ${dataToAnalyze.length}
Columns: ${JSON.stringify(Object.keys(dataToAnalyze[0] || {}))}

Respond with valid JSON only (no markdown, no extra text).`;
  }

  /**
   * Parse file analysis response
   */
  parseFileAnalysis(responseText, fileData, fileCategory) {
    try {
      // Try to extract JSON from markdown code blocks
      let jsonString = responseText;
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
                       responseText.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }

      const parsed = JSON.parse(jsonString);

      return {
        interpretation: parsed.interpretation || 'File analysed successfully',
        databaseMappings: parsed.databaseMappings || [],
        clarifyingQuestions: parsed.clarifyingQuestions || [],
        recommendations: parsed.recommendations || []
      };
    } catch (error) {
      console.error('Failed to parse Claude response:', error);

      // Fallback response
      return {
        interpretation: responseText.substring(0, 500),
        databaseMappings: [{
          collection: 'healthMetrics',
          fields: { rawData: fileData },
          confidence: 0.5
        }],
        clarifyingQuestions: [],
        recommendations: []
      };
    }
  }
}

module.exports = ClaudeService;
