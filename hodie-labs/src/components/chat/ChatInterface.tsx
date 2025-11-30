import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { queryLogger } from '../../utils/queryLogger';
import { kimiK2Service, HealthContext, ConversationMessage } from '../../services/kimiK2Service';
import { chatStorageService, ChatConversation, ChatMessage } from '../../services/chatStorageService';

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
  const [aiEnabled, setAiEnabled] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize AI status and load chat history
  useEffect(() => {
    const initializeChat = async () => {
      const enabled = await kimiK2Service.checkApiStatus();
      setAiEnabled(enabled);
      
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
            text: `G'day! I'm your Hodie Labs AI health assistant${enabled ? ', powered by Kimi K2 advanced AI' : ' (limited mode)'}. 

🏥 **I have access to your health profile** and previous conversations for personalized advice.

I can help you with:
🍎 **Nutrition & Cooking**: Specific recipes, meal planning, protein calculations
🏃 **Exercise & Fitness**: Personalised workout routines and fitness goals  
😴 **Sleep & Recovery**: Sleep improvement strategies and recovery tips
🧘 **Mental Wellbeing**: Stress management and mental health support
💧 **Wellness**: Daily health habits and lifestyle advice
🧬 **DNA Insights**: Genetic-based health recommendations
📊 **Biomarker Analysis**: Health metrics interpretation

${enabled ? 'I use advanced AI with memory of our past discussions to provide contextual health guidance.' : '🔄 **Connecting to AI Services**: Advanced conversational capabilities loading...'} What would you like to know?`,
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
          text: `G'day! I'm your Hodie Labs AI health assistant. What would you like to know?`,
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
      
      setLoadingHistory(false);
    };

    initializeChat();
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

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
        <h2 className="text-xl font-semibold flex items-center">
          🇦🇺 Hodie Health Assistant
          {aiEnabled ? (
            <span className="ml-3 text-xs bg-green-500 px-2 py-1 rounded-full">Kimi K2 Enabled</span>
          ) : (
            <span className="ml-3 text-xs bg-orange-500 px-2 py-1 rounded-full">Limited Mode</span>
          )}
        </h2>
        <p className="text-sm opacity-90">
          {aiEnabled ? 'Advanced AI health guidance' : 'Basic health guidance'} • Evidence-based advice • Always consult your GP
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 max-h-96 overscroll-behavior-y-contain scroll-smooth">
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

      <div className="bg-white border-t border-gray-200 p-4">
        {/* Enhanced Quick topic buttons */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {[
              { topic: 'DNA Insights', question: 'Explain my genetic fitness and nutrition profile', emoji: '🧬' },
              { topic: 'Health Analysis', question: 'Analyze my current health metrics and provide recommendations', emoji: '📊' },
              { topic: 'Nutrition', question: 'What foods should I eat for optimal health based on my data?', emoji: '🍎' },
              { topic: 'Exercise', question: 'What exercise routine should I start with based on my genetics?', emoji: '🏃' },
              { topic: 'Sleep', question: 'How can I improve my sleep quality and duration?', emoji: '😴' },
              { topic: 'Biomarkers', question: 'Help me understand my biomarker results', emoji: '🔬' },
              { topic: 'Weight Loss', question: 'Create a personalized weight loss strategy for me', emoji: '⚖️' },
              { topic: 'Stress', question: 'How can I manage stress better based on my profile?', emoji: '🧘' }
            ].map(({ topic, question, emoji }) => (
              <button
                key={topic}
                onClick={() => setInputValue(question)}
                className="px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-gray-700 rounded-lg text-sm transition-all duration-200 flex items-center space-x-1 border border-gray-200 hover:border-blue-300"
                disabled={isLoading}
              >
                <span className="text-base">{emoji}</span>
                <span className="font-medium">{topic}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Message input */}
        <div className="flex space-x-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your health question here..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;