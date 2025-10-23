interface QueryLog {
  id: string;
  timestamp: Date;
  query: string;
  response?: string;
  userId?: string;
  sessionId: string;
  type: 'health_query' | 'general_query' | 'api_call';
  metadata?: Record<string, any>;
}

class QueryLogger {
  private logs: QueryLog[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadLogsFromStorage();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadLogsFromStorage(): void {
    try {
      const stored = localStorage.getItem('hodie_query_logs');
      if (stored) {
        this.logs = JSON.parse(stored).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load query logs from storage:', error);
    }
  }

  private saveLogsToStorage(): void {
    try {
      localStorage.setItem('hodie_query_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Failed to save query logs to storage:', error);
    }
  }

  logQuery(
    query: string,
    type: QueryLog['type'] = 'general_query',
    userId?: string,
    metadata?: Record<string, any>
  ): string {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queryLog: QueryLog = {
      id: logId,
      timestamp: new Date(),
      query,
      userId,
      sessionId: this.sessionId,
      type,
      metadata
    };

    this.logs.push(queryLog);
    this.saveLogsToStorage();
    
    console.log(`[Query Logger] Logged query: ${logId}`, queryLog);
    return logId;
  }

  logResponse(logId: string, response: string): void {
    const log = this.logs.find(l => l.id === logId);
    if (log) {
      log.response = response;
      this.saveLogsToStorage();
      console.log(`[Query Logger] Logged response for: ${logId}`);
    }
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('hodie_query_logs');
  }

  getLogs(): QueryLog[] {
    return [...this.logs];
  }

  getSessionLogs(): QueryLog[] {
    return this.logs.filter(log => log.sessionId === this.sessionId);
  }
}

export const queryLogger = new QueryLogger();
export type { QueryLog };