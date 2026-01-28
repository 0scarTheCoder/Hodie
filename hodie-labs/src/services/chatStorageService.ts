import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';

// Firebase config (reusing existing)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  tokens?: number; // Track token usage
  metadata?: {
    healthTopics?: string[];
    intent?: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
  };
}

export interface ConversationSummary {
  mainTopics: string[];
  healthConcerns: string[];
  recommendations: string[];
  followUpNeeded: boolean;
  lastDiscussed: Date;
}

export interface ChatConversation {
  id?: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  summary?: ConversationSummary;
  medicalContext: {
    conditions: string[];
    medications: string[];
    symptoms: string[];
    recommendations: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isActive: boolean;
}

export interface PatientHealthProfile {
  userId: string;
  comprehensiveSignupData?: any; // Data from comprehensive signup
  healthMetrics: {
    bloodPressure?: { systolic: number; diastolic: number; date: Date };
    weight?: { value: number; date: Date };
    bloodWork?: { [key: string]: { value: number; date: Date } };
  };
  conditions: string[];
  medications: string[];
  allergies: string[];
  preferences: {
    dietType?: string;
    activityLevel?: string;
    notifications: boolean;
  };
  chatInsights: {
    commonTopics: string[];
    concernPatterns: string[];
    preferredCommunicationStyle: string;
  };
  lastUpdated: Date;
}

class ChatStorageService {
  private conversationsCollection = 'chat_conversations';
  private profilesCollection = 'patient_profiles';
  
  // Save or update a conversation
  async saveConversation(conversation: ChatConversation): Promise<string> {
    try {
      if (conversation.id) {
        // Update existing conversation
        const conversationRef = doc(db, this.conversationsCollection, conversation.id);
        await updateDoc(conversationRef, {
          ...conversation,
          updatedAt: Timestamp.now(),
        });
        return conversation.id;
      } else {
        // Create new conversation
        const docRef = await addDoc(collection(db, this.conversationsCollection), {
          ...conversation,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  // Get user's conversations
  async getUserConversations(userId: string, limitCount: number = 10): Promise<ChatConversation[]> {
    try {
      const q = query(
        collection(db, this.conversationsCollection),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as ChatConversation));
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  // Get conversation context for AI (summarized previous conversations)
  async getConversationContext(userId: string, currentTopics: string[] = []): Promise<string> {
    try {
      const conversations = await this.getUserConversations(userId, 5);
      
      if (conversations.length === 0) return '';

      const context = conversations
        .filter(conv => conv.summary && conv.tags.some(tag => currentTopics.includes(tag)))
        .slice(0, 3)
        .map(conv => {
          const summary = conv.summary!;
          return `Previous conversation (${conv.title}): 
          Main topics: ${summary.mainTopics.join(', ')}
          Health concerns: ${summary.healthConcerns.join(', ')}
          Recommendations given: ${summary.recommendations.join(', ')}
          `;
        })
        .join('\\n\\n');

      return context;
    } catch (error) {
      console.error('Error getting conversation context:', error);
      return '';
    }
  }

  // Save/update patient health profile
  async savePatientProfile(profile: PatientHealthProfile): Promise<void> {
    try {
      const profileRef = doc(db, this.profilesCollection, profile.userId);
      await updateDoc(profileRef, {
        ...profile,
        lastUpdated: Timestamp.now(),
      });
    } catch (error) {
      // Document doesn't exist, create it
      const profileRef = doc(db, this.profilesCollection, profile.userId);
      await updateDoc(profileRef, {
        ...profile,
        lastUpdated: Timestamp.now(),
      });
    }
  }

  // Get patient health profile
  async getPatientProfile(userId: string): Promise<PatientHealthProfile | null> {
    try {
      const profileRef = doc(db, this.profilesCollection, userId);
      const profileDoc = await getDocs(query(collection(db, this.profilesCollection), where('userId', '==', userId)));
      
      if (profileDoc.empty) return null;
      
      const data = profileDoc.docs[0].data();
      return {
        ...data,
        lastUpdated: data.lastUpdated?.toDate(),
      } as PatientHealthProfile;
    } catch (error) {
      console.error('Error getting patient profile:', error);
      return null;
    }
  }

  // Generate conversation summary using AI
  async generateConversationSummary(messages: ChatMessage[]): Promise<ConversationSummary> {
    // This would integrate with your AI service to analyse the conversation
    const topics = this.extractTopicsFromMessages(messages);
    const concerns = this.extractHealthConcerns(messages);
    const recommendations = this.extractRecommendations(messages);
    
    return {
      mainTopics: topics,
      healthConcerns: concerns,
      recommendations: recommendations,
      followUpNeeded: concerns.length > 0,
      lastDiscussed: new Date(),
    };
  }

  private extractTopicsFromMessages(messages: ChatMessage[]): string[] {
    const healthTopics = [
      'nutrition', 'exercise', 'sleep', 'stress', 'mental health',
      'blood pressure', 'diabetes', 'weight loss', 'supplements',
      'medication', 'symptoms', 'pain', 'fatigue'
    ];
    
    const messageText = messages.map(m => m.text.toLowerCase()).join(' ');
    
    return healthTopics.filter(topic => 
      messageText.includes(topic) || messageText.includes(topic.replace(' ', ''))
    );
  }

  private extractHealthConcerns(messages: ChatMessage[]): string[] {
    const concernKeywords = ['pain', 'worried', 'concerned', 'symptom', 'problem', 'issue'];
    const userMessages = messages.filter(m => m.sender === 'user');
    
    return userMessages
      .filter(message => 
        concernKeywords.some(keyword => message.text.toLowerCase().includes(keyword))
      )
      .map(message => {
        // Extract the concerning part of the message
        const words = message.text.split(' ');
        const concernIndex = words.findIndex(word => 
          concernKeywords.some(keyword => word.toLowerCase().includes(keyword))
        );
        
        if (concernIndex !== -1) {
          // Return context around the concern
          const start = Math.max(0, concernIndex - 2);
          const end = Math.min(words.length, concernIndex + 3);
          return words.slice(start, end).join(' ');
        }
        
        return message.text.substring(0, 100) + '...';
      })
      .slice(0, 3); // Limit to 3 main concerns
  }

  private extractRecommendations(messages: ChatMessage[]): string[] {
    const recommendationKeywords = ['recommend', 'suggest', 'should', 'try', 'consider'];
    const assistantMessages = messages.filter(m => m.sender === 'assistant');
    
    return assistantMessages
      .filter(message =>
        recommendationKeywords.some(keyword => message.text.toLowerCase().includes(keyword))
      )
      .map(message => {
        // Extract recommendations from assistant messages
        const sentences = message.text.split(/[.!?]+/);
        return sentences
          .filter(sentence => 
            recommendationKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
          )
          .map(sentence => sentence.trim())
          .filter(sentence => sentence.length > 10);
      })
      .flat()
      .slice(0, 5); // Limit to 5 recommendations
  }

  // Query patient data (SQL-like interface)
  async queryPatientData(userId: string, queryType: 'symptoms' | 'medications' | 'concerns' | 'recommendations', timeframe?: number): Promise<any[]> {
    try {
      const conversations = await this.getUserConversations(userId, 20);
      
      switch (queryType) {
        case 'symptoms':
          return this.extractSymptomsFromConversations(conversations, timeframe);
        case 'medications':
          return this.extractMedicationsFromConversations(conversations, timeframe);
        case 'concerns':
          return this.extractConcernsFromConversations(conversations, timeframe);
        case 'recommendations':
          return this.extractRecommendationsFromConversations(conversations, timeframe);
        default:
          return [];
      }
    } catch (error) {
      console.error('Error querying patient data:', error);
      return [];
    }
  }

  private extractSymptomsFromConversations(conversations: ChatConversation[], timeframeDays?: number): any[] {
    const cutoffDate = timeframeDays ? new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000) : null;
    
    return conversations
      .filter(conv => !cutoffDate || conv.updatedAt >= cutoffDate)
      .flatMap(conv => 
        conv.summary?.healthConcerns.map(concern => ({
          symptom: concern,
          date: conv.updatedAt,
          conversationId: conv.id,
          context: conv.title
        })) || []
      );
  }

  private extractMedicationsFromConversations(conversations: ChatConversation[], timeframeDays?: number): any[] {
    const cutoffDate = timeframeDays ? new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000) : null;
    
    return conversations
      .filter(conv => !cutoffDate || conv.updatedAt >= cutoffDate)
      .flatMap(conv => 
        conv.medicalContext.medications.map(medication => ({
          medication,
          date: conv.updatedAt,
          conversationId: conv.id,
          context: conv.title
        }))
      );
  }

  private extractConcernsFromConversations(conversations: ChatConversation[], timeframeDays?: number): any[] {
    const cutoffDate = timeframeDays ? new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000) : null;
    
    return conversations
      .filter(conv => !cutoffDate || conv.updatedAt >= cutoffDate)
      .flatMap(conv => 
        conv.summary?.healthConcerns.map(concern => ({
          concern,
          date: conv.updatedAt,
          conversationId: conv.id,
          severity: 'medium', // Could be enhanced with AI analysis
          resolved: false
        })) || []
      );
  }

  private extractRecommendationsFromConversations(conversations: ChatConversation[], timeframeDays?: number): any[] {
    const cutoffDate = timeframeDays ? new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000) : null;
    
    return conversations
      .filter(conv => !cutoffDate || conv.updatedAt >= cutoffDate)
      .flatMap(conv => 
        conv.summary?.recommendations.map(recommendation => ({
          recommendation,
          date: conv.updatedAt,
          conversationId: conv.id,
          category: this.categoriseRecommendation(recommendation),
          followed: null // Could be tracked with follow-up questions
        })) || []
      );
  }

  private categoriseRecommendation(recommendation: string): string {
    const categories = {
      'nutrition': ['eat', 'food', 'diet', 'nutrition', 'vitamin', 'supplement'],
      'exercise': ['exercise', 'workout', 'activity', 'movement', 'physical'],
      'medical': ['doctor', 'physician', 'medical', 'test', 'checkup', 'medication'],
      'lifestyle': ['sleep', 'stress', 'lifestyle', 'habit', 'routine'],
      'mental_health': ['mental', 'mood', 'anxiety', 'depression', 'therapy']
    };

    const lowerRec = recommendation.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerRec.includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }
}

export const chatStorageService = new ChatStorageService();