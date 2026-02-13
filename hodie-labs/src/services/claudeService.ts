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
  labResults?: Array<{
    id: string;
    testType: string;
    testDate: string;
    recordCount: number;
    biomarkersCount: number;
    uploadDate: string;
    summary: string;
    results: any[];
    biomarkers: any[];
  }>;
  geneticData?: any[];
  wearableData?: any;
  medicalReports?: any[];
  availableDataSummary?: string;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

class ClaudeService {
  private client: Anthropic | null = null;
  private apiKey: string;
  private model: string = 'claude-3-haiku-20240307'; // Claude 3 Haiku (Available on API key)
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
      name: 'Claude 3 Haiku',
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
        system: `You are an expert health data analyst and database architect specialising in interpreting medical files and determining optimal data storage strategies.

Your task is to:
1. Analyse the provided health data file
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
- miscellaneous: Any file that does not clearly fit the above categories (general documents, notes, mixed data)

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

    // Add user health context if available
    if (healthContext) {
      let contextSection = '\n\nUSER HEALTH DATA:';

      // Recent health metrics
      if (healthContext.recentHealthData) {
        contextSection += `\n\nRecent Metrics: ${JSON.stringify(healthContext.recentHealthData)}`;
      }

      // Lab results with actual data
      if ((healthContext as any).labResults && (healthContext as any).labResults.length > 0) {
        const labResults = (healthContext as any).labResults;
        contextSection += `\n\nLab Results Available: ${labResults.length} dataset(s)`;

        // Include details for each dataset
        labResults.forEach((dataset: any, index: number) => {
          contextSection += `\n\nDataset ${index + 1}:`;
          contextSection += `\n- Type: ${dataset.testType || 'Health Data'}`;
          contextSection += `\n- Date: ${dataset.testDate || 'Unknown'}`;
          contextSection += `\n- Total Records: ${dataset.recordCount}`;

          // Include actual data (first 20 rows as sample, then mention full dataset is available)
          if (dataset.results && dataset.results.length > 0) {
            const sampleSize = Math.min(20, dataset.results.length);
            const sample = dataset.results.slice(0, sampleSize);
            contextSection += `\n- Sample Data (first ${sampleSize} of ${dataset.results.length} records):`;
            contextSection += `\n${JSON.stringify(sample, null, 2)}`;

            if (dataset.results.length > sampleSize) {
              contextSection += `\n- Note: ${dataset.results.length - sampleSize} additional records available in full dataset`;
            }
          }

          // Include biomarkers if available
          if (dataset.biomarkers && dataset.biomarkers.length > 0) {
            contextSection += `\n- Biomarkers: ${dataset.biomarkers.length} available`;
            contextSection += `\n${JSON.stringify(dataset.biomarkers.slice(0, 10), null, 2)}`;
          }
        });

        contextSection += `\n\nYou have access to all this data. When the user asks about their data, provide specific insights, trends, and recommendations based on these actual values.`;
      }

      systemPrompt += contextSection;
    }

    return systemPrompt;
  }

  /**
   * Build prompt for file analysis
   */
  private buildFileAnalysisPrompt(parsedData: any, fileName: string, fileCategory: string): string {
    // Handle different data structures
    const dataToAnalyze = parsedData.data || parsedData || [];
    const dataPreview = JSON.stringify(dataToAnalyze).substring(0, 3000);

    return `Analyse this health data file and provide structured interpretation.

**File Information:**
- Name: ${fileName}
- Category: ${fileCategory}
- Data Preview: ${dataPreview}

**Your Tasks:**
1. Identify what type of health data this is
2. Determine the best MongoDB collection(s) to store it in
3. Map the data fields to appropriate database schema
4. Provide health insights and recommendations
5. Ask any clarifying questions

**Data Structure:**
Rows: ${dataToAnalyze.length}
Columns: ${JSON.stringify(parsedData.metadata?.headers || Object.keys(dataToAnalyze[0] || {}))}

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
        interpretation: parsed.interpretation || 'File analysed successfully',
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
      'miscellaneous': 'miscellaneous',
      'other': 'miscellaneous'
    };
    return categoryMap[category] || 'miscellaneous';
  }
}

// Export singleton instance
export const claudeService = new ClaudeService();
