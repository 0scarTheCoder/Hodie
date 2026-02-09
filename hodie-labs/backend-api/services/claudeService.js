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
   * Analyze health file using Claude
   */
  async analyzeFile(fileData, fileName, fileCategory) {
    try {
      const analysisPrompt = this.buildFileAnalysisPrompt(fileData, fileName, fileCategory);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: `You are an expert health data analyst. Analyze the provided health data file and return structured JSON with interpretation, recommendations, and database mappings.

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
- Provide specific examples and numbers`;

    // Add health context if available (summarized to save tokens)
    if (healthContext) {
      let contextSection = '\n\nUSER HEALTH DATA:';

      if (healthContext.recentHealthData) {
        contextSection += `\n\nRecent Metrics: ${JSON.stringify(healthContext.recentHealthData)}`;
      }

      // Add summarized lab results (not full 748 rows)
      if (healthContext.labResults && healthContext.labResults.length > 0) {
        contextSection += `\n\nLab Results: ${healthContext.labResults.length} dataset(s) available`;
        healthContext.labResults.forEach((dataset, index) => {
          contextSection += `\n- Dataset ${index + 1}: ${dataset.testType}, ${dataset.recordCount} records`;
        });
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

    return `Analyze this health data file and provide structured interpretation.

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
        interpretation: parsed.interpretation || 'File analyzed successfully',
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
