import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Upload, Paperclip } from 'lucide-react';
import { queryLogger } from '../../utils/queryLogger';
import { kimiK2Service, HealthContext, ConversationMessage } from '../../services/kimiK2Service';
import { claudeService } from '../../services/claudeService';
import { chatStorageService, ChatConversation, ChatMessage } from '../../services/chatStorageService';
import FileUploadZone, { UploadedFile } from './FileUploadZone';
import { healthDataParsingService } from '../../services/healthDataParsingService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  user: User;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user }) => {
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

  // Initialize AI status and load chat history
  useEffect(() => {
    const initialiseChat = async () => {
      // Force AI to always be enabled
      setAiEnabled(true);
      console.log('✅ Kimi K2 AI: ENABLED');
      
      try {
        // Load recent conversations for context
        const recentConversations = await chatStorageService.getUserConversations(user.uid, 5);
        
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

💡 **Tip**: Click the pulsing 📎 button to upload health files for instant AI analysis!

I use advanced AI with memory of our past discussions to provide contextual health guidance. What would you like to know?`,
            sender: 'assistant',
            timestamp: new Date()
          };
          
          // Create new conversation
          const newConversation: ChatConversation = {
            userId: user.uid,
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

What would you like to know about your health today?`,
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
      
      setLoadingHistory(false);
    };

    initialiseChat();
  }, [user.uid]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const logId = queryLogger.logQuery(
      inputValue,
      'health_query',
      user.uid,
      { component: 'chat_interface' }
    );

    try {
      // Get user's recent health data for context
      const healthContext = await getUserHealthContext(user.uid);
      
      // Generate response using Kimi K2 AI service
      const responseText = await kimiK2Service.generateHealthResponse(
        inputValue,
        healthContext,
        conversationHistory
      );
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: inputValue },
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

  const getUserHealthContext = async (userId: string) => {
    try {
      // Fetch user's recent health data from backend
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/health-metrics/${userId}?limit=1`
      );
      
      if (response.ok) {
        const healthData = await response.json();
        const recentData = healthData[0];
        
        if (recentData) {
          // Calculate health score for context
          const healthScore = calculateHealthScore(recentData);
          
          return {
            userId,
            recentHealthData: {
              steps: recentData.steps,
              sleep: recentData.sleepHours,
              mood: recentData.mood,
              healthScore
            }
          };
        }
      }
      
      return { userId };
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
        // Check localStorage for AI provider preference (kimi or claude)
        const aiProvider = localStorage.getItem('aiProvider') || 'kimi';
        console.log(`🤖 Step 2: AI interpreting file using ${aiProvider.toUpperCase()}...`);

        let aiInterpretation;
        if (aiProvider === 'claude' && claudeService.isAvailable()) {
          console.log('Using Claude AI for file interpretation');
          aiInterpretation = await claudeService.interpretHealthFile(
            parsedData.data,
            file.name,
            file.category,
            user.uid
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
            user.uid
          );
        }
        console.log('✅ AI interpretation complete:', aiInterpretation);

        // Step 3: Save to database based on AI recommendations
        console.log('💾 Step 3: Saving to database...');
        await saveToDatabaseWithAI(aiInterpretation.databaseMappings, user.uid);
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
          user.uid,
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

        // Prepare the data for storage
        const dataToSave = {
          userId,
          ...mapping.fields,
          aiProcessed: true,
          confidence: mapping.confidence,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Save to appropriate collection based on AI recommendation
        const endpoint = getApiEndpoint(mapping.collection);
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/${endpoint}`;

        console.log(`🔗 POST to: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
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
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-xl ${
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
                  setInputValue(question);
                  // Automatically send the message for better mobile UX
                  const userMessage = {
                    id: Date.now().toString(),
                    text: question,
                    sender: 'user' as const,
                    timestamp: new Date()
                  };

                  setMessages(prev => [...prev, userMessage]);
                  setInputValue('');
                  setIsLoading(true);

                  const logId = queryLogger.logQuery(
                    question,
                    'health_query',
                    user.uid,
                    { component: 'chat_interface_quick_button' }
                  );

                  try {
                    const healthContext = await getUserHealthContext(user.uid);
                    const responseText = await kimiK2Service.generateHealthResponse(
                      question,
                      healthContext,
                      conversationHistory
                    );
                    
                    const assistantMessage = {
                      id: (Date.now() + 1).toString(),
                      text: responseText,
                      sender: 'assistant' as const,
                      timestamp: new Date()
                    };

                    setMessages(prev => [...prev, assistantMessage]);
                    
                    setConversationHistory(prev => [
                      ...prev,
                      { role: 'user', content: question },
                      { role: 'assistant', content: responseText }
                    ]);
                    
                    queryLogger.logResponse(logId, responseText);
                  } catch (error) {
                    console.error('Quick button chat error:', error);
                    const errorMessage = {
                      id: (Date.now() + 1).toString(),
                      text: 'I apologise, but I encountered an error processing your request. Please try again.',
                      sender: 'assistant' as const,
                      timestamp: new Date()
                    };
                    setMessages(prev => [...prev, errorMessage]);
                    queryLogger.logResponse(logId, `Error: ${error}`);
                  } finally {
                    setIsLoading(false);
                  }
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