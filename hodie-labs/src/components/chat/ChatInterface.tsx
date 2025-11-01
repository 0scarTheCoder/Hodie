import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { queryLogger } from '../../utils/queryLogger';
import { enhancedChatService } from '../../services/enhancedChatService';

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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'G\'day! I\'m your Hodie Labs health assistant. I can help you with:\n\n🍎 **Nutrition & Diet**: Food recommendations, meal planning, dietary guidance\n🏃 **Exercise & Fitness**: Workout routines, activity suggestions, fitness goals\n😴 **Sleep & Recovery**: Sleep hygiene, rest strategies, recovery tips\n🧘 **Mental Wellbeing**: Stress management, mindfulness, mental health support\n💧 **Hydration & Wellness**: Daily health habits and general wellness advice\n\nI use Australian health guidelines and terminology. How can I help you today?',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      
      // Generate response using enhanced local chat service
      const responseText = await enhancedChatService.generateHealthResponse(
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
        <h2 className="text-xl font-semibold">🇦🇺 Hodie Health Assistant</h2>
        <p className="text-sm opacity-90">Australian health guidance • Evidence-based advice • Always consult your GP</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white shadow-md border border-gray-100 text-gray-900'
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
              { topic: 'Nutrition', question: 'What foods should I eat for optimal health?', emoji: '🍎' },
              { topic: 'Exercise', question: 'What exercise routine should I start with?', emoji: '🏃' },
              { topic: 'Sleep', question: 'How can I improve my sleep quality?', emoji: '😴' },
              { topic: 'Weight Loss', question: 'What foods should I eat for healthy weight loss?', emoji: '⚖️' },
              { topic: 'Muscle Building', question: 'What foods should I eat for muscle building?', emoji: '💪' },
              { topic: 'Stress', question: 'How can I manage stress better?', emoji: '🧘' },
              { topic: 'Hydration', question: 'How much water should I drink daily?', emoji: '💧' }
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
            onKeyPress={handleKeyPress}
            placeholder="Type your health question here..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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