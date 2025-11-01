interface UserData {
  uid: string;
  email: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences?: Record<string, any>;
}

interface ChatSession {
  id: string;
  userId: string;
  messages: Array<{
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

class MongoService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
  }

  async createUser(userData: Omit<UserData, 'createdAt' | 'lastLoginAt'>): Promise<UserData> {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserData(uid: string): Promise<UserData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${uid}`);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to get user data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async updateUserLoginTime(uid: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/users/${uid}/login`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastLoginAt: new Date(),
        }),
      });
    } catch (error) {
      console.error('Error updating user login time:', error);
    }
  }

  async saveChatSession(sessionData: Omit<ChatSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChatSession> {
    try {
      const response = await fetch(`${this.baseUrl}/chat-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...sessionData,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save chat session: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving chat session:', error);
      throw error;
    }
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    try {
      const response = await fetch(`${this.baseUrl}/chat-sessions/user/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get chat sessions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      return [];
    }
  }

  async updateChatSession(sessionId: string, messages: ChatSession['messages']): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/chat-sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          updatedAt: new Date(),
        }),
      });
    } catch (error) {
      console.error('Error updating chat session:', error);
    }
  }
}

export const mongoService = new MongoService();
export type { UserData, ChatSession };