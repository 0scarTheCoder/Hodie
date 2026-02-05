/**
 * Claude AI Service (Anthropic API)
 * Alternative to Kimi K2 for health data analysis and interpretation
 * Uses Claude 3.5 Sonnet for superior reasoning and analysis
 */

import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeHealthContext {
  userId: string;
  recentHealthData?: any;
  previousConversations?: any[];
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

class ClaudeService {
  private client: Anthropic | null = null;
  private apiKey: string;
  private model: string = 'claude-3-5-sonnet-20241022'; // Latest Claude 3.5 Sonnet
  private maxTokens: number = 4096;

  constructor() {
    this.apiKey = process.env.REACT_APP_CLAUDE_API_KEY || '';

    if (this.apiKey) {
      this.client = new Anthropic({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage
      });
      console.log('✅ Claude AI Service initialized');
    } else {
      console.warn('⚠️ Claude API key not found. Set REACT_APP_CLAUDE_API_KEY in .env');
    }
  }

  /**
   * Check if Claude API is configured and available
   */
  isAvailable(): boolean {
    return !!this.apiKey && !!this.client;
  }

  /**
   * Get current model information
   */
  getModelInfo(): { name: string; contextWindow: number; provider: string } {
    return {
      name: 'Claude 3.5 Sonnet',
      contextWindow: 200000, // 200K tokens
      provider: 'Anthropic'
    };
  }

  /**
   * Generate health response using Claude AI
   */
  async generateHealthResponse(
    userQuery: string,
    conversationHistory: ClaudeMessage[],
    healthContext?: ClaudeHealthContext
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Claude API not initialized. Please add REACT_APP_CLAUDE_API_KEY to your .env file.');
    }

    try {
      console.log('🤖 Claude AI: Generating health response...');

      // Build system prompt with health context
      const systemPrompt = this.buildSystemPrompt(healthContext);

      // Combine conversation history with current query
      const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
        ...conversationHistory,
        { role: 'user', content: userQuery }
      ];

      // Call Claude API
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: messages
      });

      const responseText = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      console.log('✅ Claude AI response received:', responseText.substring(0, 100) + '...');
      return responseText;

    } catch (error: any) {
      console.error('❌ Claude API error:', error);

      if (error.status === 401) {
        throw new Error('Invalid Claude API key. Please check your REACT_APP_CLAUDE_API_KEY');
      } else if (error.status === 429) {
        throw new Error('Claude API rate limit exceeded. Please wait a moment and try again.');
      } else if (error.status === 400) {
        throw new Error('Invalid request to Claude API: ' + (error.message || 'Unknown error'));
      }

      throw new Error('Claude AI error: ' + (error.message || 'Unknown error occurred'));
    }
  }

  /**
   * Interpret health file using Claude AI
   */
  async interpretHealthFile(
    parsedData: any,
    fileName: string,
    fileCategory: string,
    userId?: string
  ): Promise<{
    interpretation: string;
    databaseMappings: Array<{
      collection: string;
      fields: { [key: string]: any };
      confidence: number;
    }>;
    clarifyingQuestions: string[];
    recommendations: string[];
  }> {
    if (!this.client) {
      throw new Error('Claude API not initialized. Please add REACT_APP_CLAUDE_API_KEY to your .env file.');
    }

    try {
      console.log('🔍 Claude AI: Interpreting health file:', fileName);

      const analysisPrompt = this.buildFileAnalysisPrompt(parsedData, fileName, fileCategory);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: `You are an expert health data analyst and database architect specializing in interpreting medical files and determining optimal data storage strategies.

Your task is to:
1. Analyze the provided health data file
2. Determine the most appropriate MongoDB collection(s) to store this data
3. Map the data fields to appropriate database schema
4. Provide health insights and recommendations
5. Ask clarifying questions if needed

Available MongoDB collections:
- healthMetrics: General health tracking (steps, sleep, weight, mood, heart rate)
- labResults: Laboratory test results (blood tests, biomarkers, pathology reports)
- geneticData: DNA and genetic information (23andMe, AncestryDNA, variants)
- wearableData: Fitness tracker data (Apple Health, Fitbit, Garmin)
- medicalReports: Doctor's reports, medical imaging, prescriptions

You MUST respond with valid JSON in this exact format:
{
  "interpretation": "Clear explanation of what this data represents and key findings",
  "databaseMappings": [
    {
      "collection": "labResults",
      "fields": {
        "testType": "Blood Test",
        "testDate": "2026-01-28",
        "biomarkers": [{"name": "...", "value": ..., "unit": "..."}]
      },
      "confidence": 0.95
    }
  ],
  "recommendations": ["Health recommendation 1", "Health recommendation 2"],
  "clarifyingQuestions": ["Question 1?", "Question 2?"]
}`,
        messages: [
          { role: 'user', content: analysisPrompt }
        ]
      });

      const responseText = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      console.log('✅ Claude AI file interpretation complete');

      // Parse the JSON response
      return this.parseAIFileInterpretation(responseText, parsedData, fileCategory);

    } catch (error: any) {
      console.error('❌ Error in Claude AI file interpretation:', error);
      throw error;
    }
  }

  /**
   * Build system prompt for health conversations
   */
  private buildSystemPrompt(healthContext?: ClaudeHealthContext): string {
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

    if (healthContext?.recentHealthData) {
      systemPrompt += `\n\nUSER CONTEXT:\nRecent health metrics: ${JSON.stringify(healthContext.recentHealthData)}`;
    }

    return systemPrompt;
  }

  /**
   * Build prompt for file analysis
   */
  private buildFileAnalysisPrompt(parsedData: any, fileName: string, fileCategory: string): string {
    return `Analyze this health data file and provide structured interpretation.

**File Information:**
- Name: ${fileName}
- Category: ${fileCategory}
- Data Preview: ${JSON.stringify(parsedData.data).substring(0, 3000)}

**Your Tasks:**
1. Identify what type of health data this is
2. Determine the best MongoDB collection(s) to store it in
3. Map the data fields to appropriate database schema
4. Provide health insights and recommendations
5. Ask any clarifying questions

**Data Structure:**
Rows: ${parsedData.data.length}
Columns: ${JSON.stringify(parsedData.metadata?.headers || Object.keys(parsedData.data[0] || {}))}

Respond with valid JSON only (no markdown, no extra text).`;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIFileInterpretation(
    aiResponse: string,
    parsedData: any,
    fileCategory: string
  ): {
    interpretation: string;
    databaseMappings: Array<{ collection: string; fields: any; confidence: number }>;
    clarifyingQuestions: string[];
    recommendations: string[];
  } {
    try {
      // Try to extract JSON from markdown code blocks if present
      let jsonString = aiResponse;
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/```\n([\s\S]*?)\n```/);
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
      console.error('Failed to parse Claude AI response as JSON:', error);

      // Fallback: Create basic interpretation
      return {
        interpretation: aiResponse.substring(0, 500),
        databaseMappings: [{
          collection: this.inferCollection(fileCategory),
          fields: {
            rawData: parsedData.data,
            fileName: parsedData.metadata?.fileName,
            uploadDate: new Date().toISOString()
          },
          confidence: 0.5
        }],
        clarifyingQuestions: [],
        recommendations: []
      };
    }
  }

  /**
   * Infer MongoDB collection from file category
   */
  private inferCollection(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'lab_results': 'labResults',
      'genetic_data': 'geneticData',
      'medical_images': 'medicalReports',
      'health_reports': 'medicalReports',
      'wearable_data': 'wearableData',
      'other': 'healthMetrics'
    };
    return categoryMap[category] || 'healthMetrics';
  }
}

// Export singleton instance
export const claudeService = new ClaudeService();
