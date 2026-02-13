// ChatInterface with Visualization Integration - Updated Feb 9, 2026
import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, Paperclip } from 'lucide-react';
import { queryLogger } from '../../utils/queryLogger';
import { kimiK2Service, HealthContext, ConversationMessage } from '../../services/kimiK2Service';
import { claudeService } from '../../services/claudeService';
import { chatStorageService, ChatConversation, ChatMessage } from '../../services/chatStorageService';
import FileUploadZone, { UploadedFile } from './FileUploadZone';
import { healthDataParsingService } from '../../services/healthDataParsingService';
import BloodDataVisualizations from './BloodDataVisualizations';
import GenericDataVisualizations from './GenericDataVisualizations';

interface BloodRecord {
  recency: number;
  frequency: number;
  monetary: number;
  time: number;
  class: number;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  bloodData?: BloodRecord[];
  genericData?: Record<string, any>[];
  genericDataTitle?: string;
}

interface ChatInterfaceProps {
  user: User;
  initialQuery?: string;
  onQueryProcessed?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, initialQuery, onQueryProcessed }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true); // Always start with AI enabled
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastProcessedMessageRef = useRef<string | null>(null);
  const initialQueryProcessedRef = useRef<boolean>(false);

  // Get Auth0 token function for authenticated API calls
  const { getAccessToken } = useAuth();

  // Helper: Get user ID that works with both Firebase (uid) and Auth0 (sub)
  const getUserId = (): string => {
    // Auth0 user object has 'sub' property
    if ((user as any).sub) {
      return (user as any).sub;
    }
    // Firebase user object has 'uid' property
    if ((user as any).uid) {
      return (user as any).uid;
    }
    console.error('❌ No user ID found in user object:', user);
    throw new Error('User ID not found in user object');
  };

  // Log user ID once when available (prevents spam)
  useEffect(() => {
    const userId = (user as any).sub || (user as any).uid;
    if (userId) {
      console.log('🔑 Using Auth0 user ID:', userId);
    }
  }, [(user as any).sub || (user as any).uid]);

  // Initialize AI status and load chat history
  useEffect(() => {
    const initialiseChat = async () => {
      // Force AI to always be enabled
      setAiEnabled(true);
      console.log('✅ Kimi K2 AI: ENABLED');
      
      try {
        // Load recent conversations for context
        const recentConversations = await chatStorageService.getUserConversations(getUserId(), 5);
        
        // Check if there's an active conversation
        const activeConversation = recentConversations.find(conv => conv.isActive);
        
        if (activeConversation) {
          // Resume active conversation
          setCurrentConversation(activeConversation);
          const chatMessages = activeConversation.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(chatMessages);
          
          // Set conversation history for AI context
          setConversationHistory(chatMessages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })));
        } else {
          // Start new conversation
          const welcomeMessage: Message = {
            id: '1',
            text: `G'day! I'm your Hodie Labs AI health assistant, powered by Kimi K2 advanced AI with 256K context! 🚀

🏥 **I have access to your health profile** and previous conversations for personalised advice.

I can help you with:
🍎 **Nutrition & Cooking**: Specific recipes, meal planning, protein calculations
🏃 **Exercise & Fitness**: Personalised workout routines and fitness goals
😴 **Sleep & Recovery**: Sleep improvement strategies and recovery tips
🧘 **Mental Wellbeing**: Stress management and mental health support
💧 **Wellness**: Daily health habits and lifestyle advice
🧬 **DNA Insights**: Genetic-based health recommendations
📊 **Biomarker Analysis**: Health metrics interpretation
📁 **File Analysis**: Upload lab results, DNA data, or health reports for AI interpretation
📈 **Data Visualizations**: Generate charts and graphs of your health data

💡 **Tip**: Click the pulsing 📎 button to upload health files, or ask to "visualize my data" for interactive charts!

I use advanced AI with memory of our past discussions to provide contextual health guidance. What would you like to know?`,
            sender: 'assistant',
            timestamp: new Date()
          };
          
          // Create new conversation
          const newConversation: ChatConversation = {
            userId: getUserId(),
            title: 'New Health Consultation',
            messages: [welcomeMessage],
            medicalContext: {
              conditions: [],
              medications: [],
              symptoms: [],
              recommendations: []
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            tags: ['general'],
            isActive: true
          };
          
          const conversationId = await chatStorageService.saveConversation(newConversation);
          setCurrentConversation({ ...newConversation, id: conversationId });
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        // Fallback to basic welcome message
        const welcomeMessage: Message = {
          id: '1',
          text: `G'day! I'm your Hodie Labs AI health assistant, powered by Kimi K2 advanced AI! 🚀

💡 **Tip**: Click the pulsing 📎 button to upload health files for instant AI analysis!
📈 **Visualizations**: Ask me to "visualize my data" to see interactive charts and graphs!

What would you like to know about your health today?`,
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
      
      setLoadingHistory(false);
    };

    initialiseChat();
  }, [getUserId()]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Process initial query if provided
  useEffect(() => {
    if (initialQuery && !initialQueryProcessedRef.current && !isLoading && messages.length > 0) {
      console.log('📨 Processing initial query:', initialQuery);
      initialQueryProcessedRef.current = true;
      processQuery(initialQuery);
      if (onQueryProcessed) {
        onQueryProcessed();
      }
    }
  }, [initialQuery, isLoading, messages.length]);

  // Core function to process a query (used by both manual input and initial query)
  const processQuery = async (query: string) => {
    if (!query.trim() || isLoading) return;

    const messageId = Date.now().toString();

    // Prevent duplicate processing of the same message
    if (lastProcessedMessageRef.current === messageId) {
      console.warn('⚠️ Skipping duplicate message processing');
      return;
    }
    lastProcessedMessageRef.current = messageId;

    const userMessage: Message = {
      id: messageId,
      text: query,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const logId = queryLogger.logQuery(
      query,
      'health_query',
      getUserId(),
      { component: 'chat_interface' }
    );

    try {
      // Check if user is requesting visualization
      const visualizationKeywords = [
        'histogram', 'graph', 'chart', 'plot', 'scatter',
        'visuali', 'show me', 'display', 'graphical',
        'distribution', 'bar chart', 'line chart'
      ];
      const isVizRequest = visualizationKeywords.some(keyword =>
        query.toLowerCase().includes(keyword)
      );

      let bloodData: BloodRecord[] | undefined;
      let genericVizData: Record<string, any>[] | undefined;
      let genericVizTitle: string | undefined;

      if (isVizRequest) {
        console.log('📊 Visualization request detected');

        try {
          const token = await getAccessToken().catch((error) => {
            console.warn('⚠️ Could not get token for visualization:', error);
            return null;
          });

          const headers: HeadersInit = { 'Content-Type': 'application/json' };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const labResultsResponse = await fetch(
            `${process.env.REACT_APP_API_BASE_URL}/lab-results/${getUserId()}`,
            { headers }
          );

          if (labResultsResponse.ok) {
            const labResults = await labResultsResponse.json();

            // Try blood donation data first (specific fields)
            const bloodDataset = labResults.find((result: any) => {
              if (!result.results || result.results.length === 0) return false;
              const firstRecord = result.results[0];
              return firstRecord &&
                ('recency' in firstRecord || 'Recency' in firstRecord) &&
                ('frequency' in firstRecord || 'Frequency' in firstRecord) &&
                ('monetary' in firstRecord || 'Monetary' in firstRecord);
            });

            if (bloodDataset && bloodDataset.results && bloodDataset.results.length > 0) {
              console.log(`📊 Found blood dataset with ${bloodDataset.results.length} records`);
              bloodData = bloodDataset.results.map((record: any) => ({
                recency: parseFloat(record.recency || record.Recency) || 0,
                frequency: parseFloat(record.frequency || record.Frequency) || 0,
                monetary: parseFloat(record.monetary || record.Monetary) || 0,
                time: parseFloat(record.time || record.Time) || 0,
                class: parseInt(record.class || record.Class) || 0
              }));
              console.log(`✅ Ready to display blood data visualizations`);
            } else {
              // No blood data — use any available lab results for generic visualization
              const anyDataset = labResults.find((result: any) =>
                result.results && result.results.length > 0
              );
              if (anyDataset && anyDataset.results) {
                genericVizData = anyDataset.results.slice(0, 2000);
                genericVizTitle = anyDataset.testType || 'Lab Results';
                console.log(`📊 Using generic visualization for ${genericVizTitle}: ${genericVizData!.length} records`);
              } else {
                console.warn('⚠️ No visualizable data found in lab results');
              }
            }
          }
        } catch (vizError) {
          console.error('❌ Error fetching data for visualization:', vizError);
        }
      }

      // Get user's comprehensive health data for context
      const healthContext = await getUserHealthContext(getUserId());

      // Check which AI provider to use
      const aiProvider = localStorage.getItem('aiProvider') || 'kimi';
      let responseText: string = '';

      if (aiProvider === 'claude' && claudeService.isAvailable()) {
        console.log('🤖 Using Claude AI for response');

        // Add context summary to the query if user has uploaded data
        let enhancedQuery = query;
        if (healthContext.availableDataSummary) {
          enhancedQuery = `${query}\n\n[Context: ${healthContext.availableDataSummary}]`;
        }

        // If we have blood data for visualization, let AI know
        if (bloodData && bloodData.length > 0) {
          enhancedQuery += `\n\n[Note: Interactive data visualizations (histograms, scatter plots) have been generated from ${bloodData.length} records and will be displayed to the user. Please provide textual analysis and interpretation of the blood donation data.]`;
        }

        // Filter conversation history to only include user/assistant messages (exclude system)
        const claudeHistory = conversationHistory
          .filter(msg => msg.role === 'user' || msg.role === 'assistant')
          .map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content }));

        responseText = await claudeService.generateHealthResponse(
          enhancedQuery,
          claudeHistory,
          healthContext
        );
      } else {
        // Try backend Claude API for real AI responses with health context
        let usedBackendChat = false;
        const hasHealthData = healthContext.labResults || healthContext.geneticData || healthContext.recentHealthData;

        if (hasHealthData) {
          console.log('🤖 Trying backend Claude API for data-aware response...');
          try {
            const token = await getAccessToken().catch(() => null);
            const chatHeaders: HeadersInit = {
              'Content-Type': 'application/json'
            };
            if (token) {
              chatHeaders['Authorization'] = `Bearer ${token}`;
            }

            // Build enhanced message with actual health data for analysis
            let enhancedMessage = query;
            if (healthContext.labResults && healthContext.labResults.length > 0) {
              const labSummary = healthContext.labResults.map((r: any) => {
                const rows = r.results || [];
                const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
                // Include up to 50 rows of actual data for meaningful analysis
                const sampleRows = rows.slice(0, 50);
                // Also include biomarkers if available
                const biomarkers = r.biomarkers || [];
                let dataStr = `Dataset: ${r.testType || 'Lab Results'}, ${r.recordCount || rows.length} total records`;
                dataStr += `\nColumns: [${columns.join(', ')}]`;
                if (biomarkers.length > 0) {
                  dataStr += `\nBiomarkers: ${JSON.stringify(biomarkers.slice(0, 30))}`;
                }
                dataStr += `\nData (first ${sampleRows.length} rows): ${JSON.stringify(sampleRows)}`;
                return dataStr;
              }).join('\n\n');
              enhancedMessage += `\n\n[USER'S ACTUAL LAB RESULTS DATA - Please analyze this data and provide specific health insights:\n${labSummary}]`;
            }
            if (healthContext.geneticData && healthContext.geneticData.length > 0) {
              const geneticSummary = healthContext.geneticData.map((g: any) => {
                return `Genetic Data: ${g.testType || 'DNA'}, traits: ${JSON.stringify((g.traits || []).slice(0, 20))}`;
              }).join('\n');
              enhancedMessage += `\n\n[USER'S GENETIC DATA:\n${geneticSummary}]`;
            }
            if (healthContext.availableDataSummary) {
              enhancedMessage += `\n\n[Summary: ${healthContext.availableDataSummary}]`;
            }

            // Strip bulk data from context before sending to backend
            const lightContext: any = {
              userId: healthContext.userId,
              availableDataSummary: healthContext.availableDataSummary,
              recentHealthData: healthContext.recentHealthData
            };
            if (healthContext.labResults) {
              lightContext.labResults = healthContext.labResults.map((r: any) => ({
                testType: r.testType,
                recordCount: r.recordCount,
                biomarkersCount: r.biomarkersCount,
                uploadDate: r.uploadDate,
                summary: r.summary
              }));
            }

            const chatRes = await fetchWithRetry(
              `${process.env.REACT_APP_API_BASE_URL}/chat`,
              {
                method: 'POST',
                headers: chatHeaders,
                body: JSON.stringify({
                  userId: getUserId(),
                  message: enhancedMessage,
                  conversationHistory: conversationHistory.slice(-6).map((m: any) => ({
                    role: m.role,
                    content: (m.content || '').substring(0, 500)
                  })),
                  healthContext: lightContext
                })
              }
            );

            if (chatRes.ok) {
              const chatData = await chatRes.json();
              responseText = chatData.response;
              usedBackendChat = true;
              console.log('✅ Backend Claude response received');
            }
          } catch (backendChatError) {
            console.warn('Backend Claude chat failed:', backendChatError);
          }
        }

        if (!usedBackendChat) {
          console.log('🤖 Using Kimi K2 AI for response');

          // If we have blood data for visualization, modify the query for Kimi K2
          let queryForAI = query;
          if (bloodData && bloodData.length > 0) {
            queryForAI = `${query}\n\n[Note: Interactive data visualizations (histograms, scatter plots) have been generated from ${bloodData.length} records and displayed. Please provide textual analysis and interpretation of the blood donation data.]`;
          }

          responseText = await kimiK2Service.generateHealthResponse(
            queryForAI,
            healthContext,
            conversationHistory
          );
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'assistant',
        timestamp: new Date(),
        bloodData: bloodData,
        genericData: genericVizData,
        genericDataTitle: genericVizTitle
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: query },
        { role: 'assistant', content: responseText }
      ]);
      
      queryLogger.logResponse(logId, responseText);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologise, but I encountered an error processing your request. This might be due to API configuration issues. Please try again or contact support.',
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      queryLogger.logResponse(logId, `Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Wrapper function for handling manual message sends
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const query = inputValue;
    setInputValue(''); // Clear input immediately
    await processQuery(query);
  };

  const getUserHealthContext = async (userId: string) => {
    try {
      console.log('📊 Fetching comprehensive health context for user:', userId);

      // Get JWT token for authenticated API calls
      const token = await getAccessToken().catch((error) => {
        console.warn('⚠️ Could not get Auth0 token:', error);
        return null;
      });

      // Prepare headers with authorization
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch data from all collections in parallel with authentication
      const [healthMetricsRes, labResultsRes, geneticDataRes, wearableDataRes, medicalReportsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_BASE_URL}/health-metrics/${userId}?limit=5`, { headers }).catch(() => null),
        fetch(`${process.env.REACT_APP_API_BASE_URL}/lab-results/${userId}`, { headers }).catch(() => null),
        fetch(`${process.env.REACT_APP_API_BASE_URL}/genetic-data/${userId}`, { headers }).catch(() => null),
        fetch(`${process.env.REACT_APP_API_BASE_URL}/wearable-data/${userId}?limit=7`, { headers }).catch(() => null),
        fetch(`${process.env.REACT_APP_API_BASE_URL}/medical-reports/${userId}`, { headers }).catch(() => null)
      ]);

      const context: any = { userId };

      // Health metrics (daily tracking data)
      if (healthMetricsRes && healthMetricsRes.ok) {
        const healthData = await healthMetricsRes.json();
        // Find daily metrics (ones with steps/sleep, not raw file uploads)
        const dailyMetrics = healthData.find((d: any) => d.steps || d.sleepHours || d.mood);
        if (dailyMetrics) {
          const healthScore = calculateHealthScore(dailyMetrics);
          context.recentHealthData = {
            steps: dailyMetrics.steps,
            sleep: dailyMetrics.sleepHours,
            mood: dailyMetrics.mood,
            healthScore
          };
        }
      }

      // Lab results (uploaded files)
      if (labResultsRes && labResultsRes.ok) {
        const labResults = await labResultsRes.json();
        if (labResults.length > 0) {
          context.labResults = labResults.map((result: any) => ({
            id: result._id,
            testType: result.testType,
            testDate: result.testDate,
            recordCount: result.results?.length || 0,
            biomarkersCount: result.biomarkers?.length || 0,
            uploadDate: result.createdAt,
            summary: result.notes || 'No summary available',
            // Include actual data rows (not just metadata)
            results: result.results || [],
            biomarkers: result.biomarkers || []
          }));
          console.log(`✅ Found ${labResults.length} lab result datasets with ${context.labResults.reduce((sum: number, r: any) => sum + r.recordCount, 0)} total records`);
        }
      }

      // Genetic data
      if (geneticDataRes && geneticDataRes.ok) {
        const geneticData = await geneticDataRes.json();
        if (geneticData.length > 0) {
          context.geneticData = geneticData.map((data: any) => ({
            id: data._id,
            provider: data.provider,
            uploadDate: data.createdAt,
            variantsCount: data.variants?.length || 0
          }));
          console.log(`✅ Found ${geneticData.length} genetic datasets`);
        }
      }

      // Wearable data
      if (wearableDataRes && wearableDataRes.ok) {
        const wearableData = await wearableDataRes.json();
        if (wearableData.length > 0) {
          context.wearableData = {
            recentDays: wearableData.length,
            lastSync: wearableData[0]?.date
          };
          console.log(`✅ Found ${wearableData.length} days of wearable data`);
        }
      }

      // Medical reports
      if (medicalReportsRes && medicalReportsRes.ok) {
        const medicalReports = await medicalReportsRes.json();
        if (medicalReports.length > 0) {
          context.medicalReports = medicalReports.map((report: any) => ({
            id: report._id,
            reportType: report.reportType,
            uploadDate: report.createdAt
          }));
          console.log(`✅ Found ${medicalReports.length} medical reports`);
        }
      }

      // Add summary of available data
      const availableDataTypes = [];
      if (context.labResults && context.labResults.length > 0) {
        const totalRecords = context.labResults.reduce((sum: number, r: any) => sum + r.recordCount, 0);
        availableDataTypes.push(`${context.labResults.length} lab result dataset(s) with ${totalRecords} total records`);
      }
      if (context.geneticData) availableDataTypes.push(`${context.geneticData.length} genetic dataset(s)`);
      if (context.wearableData) availableDataTypes.push('wearable data');
      if (context.medicalReports) availableDataTypes.push(`${context.medicalReports.length} medical report(s)`);

      if (availableDataTypes.length > 0) {
        context.availableDataSummary = `You have access to: ${availableDataTypes.join(', ')}`;
        console.log('📊 Context summary:', context.availableDataSummary);
      }

      return context;
    } catch (error) {
      console.error('Error fetching health context:', error);
      return { userId };
    }
  };

  const calculateHealthScore = (metrics: any): number => {
    let score = 0;
    
    // Steps (max 30 points)
    if (metrics.steps >= 10000) score += 30;
    else if (metrics.steps >= 7500) score += 25;
    else if (metrics.steps >= 5000) score += 20;
    else score += Math.max(0, (metrics.steps / 5000) * 20);

    // Sleep (max 25 points)
    if (metrics.sleepHours >= 7 && metrics.sleepHours <= 9) score += 25;
    else if (metrics.sleepHours >= 6) score += 20;
    else score += Math.max(0, (metrics.sleepHours / 6) * 20);

    // Mood (max 20 points)
    const moodScores: { [key: string]: number } = {
      '😊': 20, '🙂': 15, '😐': 10, '🙁': 5, '😢': 0
    };
    score += moodScores[metrics.mood] || 10;

    // Sleep quality (max 15 points)
    const qualityScores: { [key: string]: number } = {
      'Excellent': 15, 'Good': 12, 'Fair': 8, 'Poor': 3
    };
    score += qualityScores[metrics.sleepQuality] || 8;

    // Activity/calories (max 10 points)
    if (metrics.calories >= 300) score += 10;
    else score += Math.max(0, (metrics.calories / 300) * 10);

    return Math.round(score);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        handleSendMessage();
      }
    }
  };

  const handleFilesUploaded = async (files: UploadedFile[]) => {
    console.log('📁 Files uploaded:', files.length);
    setUploadedFiles(prev => [...prev, ...files]);

    // Show processing message
    const processingMessage: Message = {
      id: Date.now().toString(),
      text: `🔄 **Processing ${files.length} file(s)**...\n\n🤖 Analyzing with Kimi K2 AI to determine optimal data storage and health insights.\n\nThis may take a moment...`,
      sender: 'assistant',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, processingMessage]);

    // Process each uploaded file
    for (const file of files) {
      console.log('📄 Processing file:', file.name, 'Category:', file.category);
      try {
        // Step 1: Parse the file
        console.log('🔍 Step 1: Parsing file...');
        const parsedData = await healthDataParsingService.parseHealthFile(file.file, file.category);
        console.log('✅ File parsed successfully:', parsedData);

        // Step 2: Use AI to interpret the file and determine database mappings
        // Try: 1) Kimi K2 or Claude client-side, 2) Backend Claude API, 3) Basic fallback
        const aiProvider = localStorage.getItem('aiProvider') || 'kimi';
        console.log(`🤖 Step 2: AI interpreting file using ${aiProvider.toUpperCase()}...`);

        let aiInterpretation;
        let usedBackendFallback = false;

        try {
          if (aiProvider === 'claude' && claudeService.isAvailable()) {
            console.log('Using Claude AI for file interpretation');
            aiInterpretation = await claudeService.interpretHealthFile(
              parsedData.data,
              file.name,
              file.category,
              getUserId()
            );
          } else {
            if (aiProvider === 'claude') {
              console.warn('Claude API not configured, falling back to Kimi K2');
            }
            console.log('Using Kimi K2 for file interpretation');
            aiInterpretation = await kimiK2Service.interpretHealthFile(
              parsedData.data,
              file.name,
              file.category,
              getUserId()
            );
          }
        } catch (frontendAiError) {
          console.warn('Frontend AI interpretation failed:', frontendAiError);
          aiInterpretation = null;
        }

        // Check if interpretation is a generic fallback (no real AI analysis)
        const isGenericFallback = aiInterpretation?.interpretation?.includes('has been successfully parsed and categorized');

        // If frontend AI failed or returned generic fallback, try backend Claude
        if (!aiInterpretation || isGenericFallback) {
          console.log('🔄 Trying backend Claude API for file interpretation...');
          try {
            const token = await getAccessToken().catch(() => null);
            const backendHeaders: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) {
              backendHeaders['Authorization'] = `Bearer ${token}`;
            }

            // Send only first 50 rows to keep payload manageable
            const dataPreview = Array.isArray(parsedData.data)
              ? parsedData.data.slice(0, 50)
              : parsedData.data;

            const backendRes = await fetchWithRetry(
              `${process.env.REACT_APP_API_BASE_URL}/interpret-file`,
              {
                method: 'POST',
                headers: backendHeaders,
                body: JSON.stringify({
                  fileData: { data: dataPreview, metadata: parsedData.metadata },
                  fileName: file.name,
                  fileCategory: file.category,
                  userId: getUserId()
                })
              }
            );

            if (backendRes.ok) {
              aiInterpretation = await backendRes.json();
              usedBackendFallback = true;
              console.log('✅ Backend Claude interpretation succeeded');
            } else {
              console.warn('Backend interpretation failed:', backendRes.status);
            }
          } catch (backendError) {
            console.warn('Backend Claude fallback also failed:', backendError);
          }
        }

        // If all AI attempts failed, we still have the generic fallback from Kimi
        if (!aiInterpretation) {
          console.warn('All AI interpretation attempts failed, using basic fallback');
          aiInterpretation = await kimiK2Service.interpretHealthFile(
            parsedData.data,
            file.name,
            file.category,
            getUserId()
          );
        }

        console.log('✅ AI interpretation complete:', aiInterpretation, usedBackendFallback ? '(via backend Claude)' : '');

        // Step 3: Save to database based on AI recommendations
        console.log('💾 Step 3: Saving to database...');
        await saveToDatabaseWithAI(aiInterpretation.databaseMappings, getUserId());
        console.log('✅ Saved to database successfully');

        // Step 4: Create comprehensive message with AI insights
        const interpretationText = formatFileInterpretation(
          file.name,
          parsedData,
          aiInterpretation
        );

        const fileMessage: Message = {
          id: Date.now().toString(),
          text: interpretationText,
          sender: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, fileMessage]);

        // Log the file upload with AI interpretation
        queryLogger.logQuery(
          `AI File interpretation: ${file.name}`,
          'file_upload',
          getUserId(),
          {
            component: 'chat_interface',
            fileType: file.category,
            fileName: file.name,
            confidence: parsedData.metadata.confidence,
            dbMappings: aiInterpretation.databaseMappings.length,
            hasRecommendations: aiInterpretation.recommendations.length > 0,
            aiProcessed: true
          }
        );

      } catch (error) {
        console.error('❌ Error processing uploaded file:', error);
        console.error('Error details:', {
          fileName: file.name,
          category: file.category,
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined
        });

        const errorMessage: Message = {
          id: Date.now().toString(),
          text: `❌ **Error processing ${file.name}**

**Issue**: ${error instanceof Error ? error.message : 'Unknown error occurred'}

**Common Causes**:
• Network connection issue - check if backend is awake
• Content Security Policy blocking API calls - try hard refresh (Cmd+Shift+R)
• AI returned empty database mappings - file format not recognized

**What you can try**:
• Check the file format (PDF, CSV, JSON, TXT supported)
• Ensure file is not corrupted
• Try a smaller file (max 10MB)
• Contact support if issue persists

**Technical details**: Check browser console for more info`,
          sender: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);
      }
    }

    setShowFileUpload(false);
  };

  // Format AI file interpretation for user display
  const formatFileInterpretation = (
    fileName: string,
    parsedData: any,
    aiInterpretation: any
  ): string => {
    let message = `📁 **File Analyzed**: ${fileName}\n\n`;

    // AI Interpretation
    message += `🤖 **AI Analysis**:\n${aiInterpretation.interpretation}\n\n`;

    // Database Mappings
    if (aiInterpretation.databaseMappings.length > 0) {
      message += `💾 **Data Storage**:\n`;
      aiInterpretation.databaseMappings.forEach((mapping: any) => {
        message += `• Saved to **${mapping.collection}** collection (${mapping.confidence}% confidence)\n`;
      });
      message += `\n`;
    }

    // Recommendations
    if (aiInterpretation.recommendations.length > 0) {
      message += `💡 **Health Insights**:\n`;
      aiInterpretation.recommendations.slice(0, 3).forEach((rec: string) => {
        message += `• ${rec}\n`;
      });
      message += `\n`;
    }

    // Clarifying Questions
    if (aiInterpretation.clarifyingQuestions.length > 0) {
      message += `❓ **Questions for you**:\n`;
      aiInterpretation.clarifyingQuestions.slice(0, 2).forEach((question: string) => {
        message += `• ${question}\n`;
      });
      message += `\n`;
    }

    message += `✅ **Status**: Data successfully stored and ready for analysis!\n\n`;
    message += `You can now ask me questions about this data, such as:\n`;
    message += `• "What do my lab results show?"\n`;
    message += `• "Explain any concerning values"\n`;
    message += `• "Give me personalized recommendations based on this data"`;

    return message;
  };

  // Fetch with retry logic (handles Render free tier cold starts)
  const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3): Promise<Response> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        return response;
      } catch (error: any) {
        const isLastAttempt = attempt === maxRetries;
        const isNetworkError = error.name === 'TypeError' && error.message === 'Failed to fetch';
        if (isLastAttempt || !isNetworkError) throw error;
        const delay = attempt * 3000; // 3s, 6s wait between retries
        console.log(`⏳ Server may be waking up, retrying in ${delay / 1000}s... (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  };

  // Estimate JSON size of data in bytes
  const estimateJsonSize = (data: any): number => {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  };

  // Truncate large arrays to keep payload within ~8MB limit
  const truncateToFitLimit = (data: any[], maxBytes: number = 7_000_000): any[] => {
    if (!Array.isArray(data) || data.length === 0) return data;
    // Start with estimate per row
    const sampleSize = Math.min(10, data.length);
    const sampleBytes = estimateJsonSize(data.slice(0, sampleSize));
    const bytesPerRow = sampleBytes / sampleSize;
    const maxRows = Math.max(100, Math.floor(maxBytes / bytesPerRow));
    if (data.length <= maxRows) return data;
    console.log(`📦 Truncating from ${data.length} to ${maxRows} rows (est. ${(bytesPerRow * data.length / 1_000_000).toFixed(1)}MB → ${(bytesPerRow * maxRows / 1_000_000).toFixed(1)}MB)`);
    return data.slice(0, maxRows);
  };

  // Save data to database based on AI-recommended mappings
  const saveToDatabaseWithAI = async (mappings: any[], userId: string) => {
    if (!mappings || mappings.length === 0) {
      console.error('❌ No database mappings provided - AI returned empty mappings array!');
      throw new Error('AI did not provide any database mappings. The file may not have been interpreted correctly.');
    }

    console.log(`💾 Attempting to save ${mappings.length} mapping(s) to database...`);

    let successCount = 0;
    let failCount = 0;

    try {
      for (const mapping of mappings) {
        console.log(`📤 Saving to collection: ${mapping.collection}`);
        console.log(`📊 Fields to save:`, Object.keys(mapping.fields));

        // Truncate large data arrays to avoid 413 payload errors
        const fields = { ...mapping.fields };
        // If we have results, strip rawData entirely (it's redundant)
        if (fields.results && Array.isArray(fields.results) && fields.results.length > 0) {
          delete fields.rawData;
          fields.results = truncateToFitLimit(fields.results);
        } else if (fields.rawData) {
          fields.rawData = truncateToFitLimit(fields.rawData);
        }

        // Prepare the data for storage
        const dataToSave = {
          userId,
          ...fields,
          aiProcessed: true,
          confidence: mapping.confidence,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Final size check - if still too large, aggressively truncate
        const payloadSize = estimateJsonSize(dataToSave);
        if (payloadSize > 8_000_000) {
          console.log(`⚠️ Payload still ${(payloadSize / 1_000_000).toFixed(1)}MB, aggressively truncating...`);
          if (fields.results && Array.isArray(fields.results)) {
            fields.results = fields.results.slice(0, 500);
          }
          if (fields.rawData && Array.isArray(fields.rawData)) {
            fields.rawData = fields.rawData.slice(0, 500);
          }
        }

        // Save to appropriate collection based on AI recommendation
        const endpoint = getApiEndpoint(mapping.collection);
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/${endpoint}`;

        console.log(`🔗 POST to: ${apiUrl}`);

        const token = await getAccessToken().catch(() => null);
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetchWithRetry(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(dataToSave)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Failed to save to ${mapping.collection} (${response.status}):`, errorText);
          failCount++;
        } else {
          const savedData = await response.json();
          console.log(`✅ Successfully saved to ${mapping.collection}:`, savedData._id);
          successCount++;
        }
      }

      console.log(`📊 Save summary: ${successCount} succeeded, ${failCount} failed`);

      if (successCount === 0) {
        throw new Error(`Failed to save any data to database. Check console for details.`);
      }

    } catch (error: any) {
      console.error('❌ Error saving to database:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw error; // Re-throw so the calling code knows it failed
    }
  };

  // Map collection name to API endpoint
  const getApiEndpoint = (collection: string): string => {
    const endpointMap: { [key: string]: string } = {
      'healthMetrics': 'health-metrics',
      'labResults': 'lab-results',
      'geneticData': 'genetic-data',
      'wearableData': 'wearable-data',
      'medicalReports': 'medical-reports'
    };
    return endpointMap[collection] || 'health-metrics';
  };

  const handleFileRemove = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
        <h2 className="text-lg md:text-xl font-semibold flex items-centre">
          🇦🇺 Hodie Health Assistant
          {aiEnabled ? (
            <span className="ml-3 text-xs bg-green-500 px-2 py-1 rounded-full">Kimi K2 Enabled</span>
          ) : (
            <span className="ml-3 text-xs bg-orange-500 px-2 py-1 rounded-full">Limited Mode</span>
          )}
        </h2>
        <p className="text-xs md:text-sm opacity-90">
          {aiEnabled ? 'Advanced AI health guidance' : 'Basic health guidance'} • Evidence-based advice • Always consult your GP
        </p>
      </div>

      {/* Messages Container - Scrollable */}
      <div
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50"
        style={{
          minHeight: 0,
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y'
        }}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} ${
              (message.bloodData && message.bloodData.length > 0) || (message.genericData && message.genericData.length > 0) ? 'w-full' : ''
            }`}
          >
            <div
              className={`${
                (message.bloodData && message.bloodData.length > 0) || (message.genericData && message.genericData.length > 0)
                  ? 'w-full'
                  : 'max-w-xs lg:max-w-2xl'
              } px-4 py-3 rounded-xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white shadow-lg border border-gray-200 text-gray-900'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">
                {message.text.split('\n').map((line, index) => {
                  // Handle bold formatting
                  if (line.includes('**')) {
                    const parts = line.split(/(\*\*.*?\*\*)/);
                    return (
                      <div key={index} className="mb-1">
                        {parts.map((part, partIndex) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </div>
                    );
                  }
                  return <div key={index} className={line.trim() === '' ? 'mb-2' : 'mb-1'}>{line}</div>;
                })}
              </div>

              {/* Display blood data visualizations if present */}
              {message.bloodData && message.bloodData.length > 0 && (
                <div className="mt-4">
                  <BloodDataVisualizations data={message.bloodData} />
                </div>
              )}

              {/* Display generic data visualizations for non-blood datasets */}
              {message.genericData && message.genericData.length > 0 && (
                <div className="mt-4">
                  <GenericDataVisualizations data={message.genericData} title={message.genericDataTitle} />
                </div>
              )}

              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Sticky at bottom */}
      <div
        className="flex-shrink-0 bg-white border-t border-gray-200 p-3 md:p-4"
        style={{ maxHeight: '40vh', overflowY: 'auto', overscrollBehavior: 'contain' }}
      >
        {/* Enhanced Quick topic buttons - Collapsible on mobile */}
        {!inputValue && (
          <div className="mb-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { topic: 'DNA Insights', question: 'Explain my genetic fitness and nutrition profile', emoji: '🧬' },
              { topic: 'Health Analysis', question: 'Analyze my current health metrics and provide recommendations', emoji: '📊' },
              { topic: 'Data Visualizations', question: 'Show me a graphical representation of all my health data', emoji: '📈' },
              { topic: 'Nutrition', question: 'What foods should I eat for optimal health based on my data?', emoji: '🍎' },
              { topic: 'Exercise', question: 'What exercise routine should I start with based on my genetics?', emoji: '🏃' },
              { topic: 'Sleep', question: 'How can I improve my sleep quality and duration?', emoji: '😴' },
              { topic: 'Biomarkers', question: 'Help me understand my biomarker results', emoji: '🔬' },
              { topic: 'Weight Loss', question: 'Create a personalised weight loss strategy for me', emoji: '⚖️' },
              { topic: 'Stress', question: 'How can I manage stress better based on my profile?', emoji: '🧘' }
            ].map(({ topic, question, emoji }) => (
              <button
                key={topic}
                onClick={async () => {
                  // Use processQuery to handle all quick button clicks
                  // This ensures visualization detection works for all queries
                  await processQuery(question);
                }}
                className="px-2 py-3 md:px-3 md:py-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-gray-700 rounded-lg text-xs md:text-sm transition-all duration-200 flex flex-col md:flex-row items-centre space-y-1 md:space-y-0 md:space-x-1 border border-gray-200 hover:border-blue-300 touch-manipulation min-h-[60px] md:min-h-[auto]"
                disabled={isLoading}
              >
                <span className="text-base">{emoji}</span>
                <span className="font-medium">{topic}</span>
              </button>
            ))}
          </div>
        </div>
        )}

        {/* File Upload Zone - More prominent */}
        {showFileUpload && (
          <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-300 shadow-sm">
            <div className="text-center mb-3">
              <p className="text-sm font-medium text-gray-700">📎 Upload Health Files</p>
              <p className="text-xs text-gray-500 mt-1">Lab results, DNA data, medical reports</p>
            </div>
            <FileUploadZone
              onFilesUploaded={handleFilesUploaded}
              onFileRemove={handleFileRemove}
              isVisible={showFileUpload}
            />
          </div>
        )}

        {/* Currently Uploaded Files Summary */}
        {uploadedFiles.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-centre space-x-2 bg-blue-50 px-3 py-1 rounded-full text-sm border border-blue-200">
                  <span>{file.category === 'lab_results' ? '🧪' : file.category === 'genetic_data' ? '🧬' : '📄'}</span>
                  <span className="text-blue-700 font-medium truncate max-w-24">{file.name}</span>
                  <button
                    onClick={() => handleFileRemove(file.id)}
                    className="text-blue-600 hover:text-blue-800 ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Message input - Mobile optimized */}
        <div className="flex items-end space-x-2">
          <div className="relative">
            <button
              onClick={() => setShowFileUpload(!showFileUpload)}
              className={`flex-shrink-0 p-2 md:px-3 md:py-2 rounded-lg transition-all duration-200 touch-manipulation ${
                showFileUpload
                  ? 'bg-blue-600 text-white border border-blue-600 shadow-lg'
                  : 'bg-gradient-to-br from-blue-50 to-purple-50 text-blue-600 hover:from-blue-100 hover:to-purple-100 border border-blue-200'
              }`}
              title="Upload health data files"
              aria-label={showFileUpload ? 'Close file upload' : 'Upload files'}
            >
              <Paperclip className="w-5 h-5 md:w-4 md:h-4" />
            </button>
            {!showFileUpload && uploadedFiles.length === 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            )}
          </div>

          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={(e) => {
              // Prevent body scroll on focus
              setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
            }}
            placeholder={uploadedFiles.length > 0 ? "Ask about your data..." : "Type your health question..."}
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            rows={1}
            disabled={isLoading}
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="flex-shrink-0 px-4 md:px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm md:text-base"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;