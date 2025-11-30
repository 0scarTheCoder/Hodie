// Enterprise-Grade Encryption Service for HodieLabs
// Provides client-side encryption for sensitive health data

interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
  timestamp: number;
}

interface HealthDataToEncrypt {
  medicalConditions?: string[];
  medications?: string[];
  allergies?: string[];
  notes?: string;
  personalInfo?: any;
}

class EncryptionService {
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();

  /**
   * Generate cryptographically secure key from user password/PIN
   */
  async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      this.encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000, // OWASP recommended minimum
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt sensitive health data before storing in Firebase
   */
  async encryptHealthData(
    data: HealthDataToEncrypt,
    userPassword?: string
  ): Promise<EncryptedData> {
    try {
      // Generate random salt and IV
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      // Use user password or generate session key
      const password = userPassword || this.generateSessionKey();
      const key = await this.deriveKey(password, salt);

      // Encrypt data
      const dataString = JSON.stringify(data);
      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        this.encoder.encode(dataString)
      );

      return {
        data: this.arrayBufferToBase64(encryptedData),
        iv: this.arrayBufferToBase64(iv),
        salt: this.arrayBufferToBase64(salt),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt health data');
    }
  }

  /**
   * Decrypt health data retrieved from Firebase
   */
  async decryptHealthData(
    encryptedData: EncryptedData,
    userPassword?: string
  ): Promise<HealthDataToEncrypt> {
    try {
      const password = userPassword || this.generateSessionKey();
      const salt = this.base64ToArrayBuffer(encryptedData.salt);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);
      const data = this.base64ToArrayBuffer(encryptedData.data);

      const key = await this.deriveKey(password, new Uint8Array(salt));

      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(iv)
        },
        key,
        data
      );

      const dataString = this.decoder.decode(decryptedData);
      return JSON.parse(dataString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt health data');
    }
  }

  /**
   * Encrypt API requests to protect data in transit
   */
  async encryptAPIPayload(payload: any): Promise<{ encrypted: string; key: string }> {
    try {
      // Generate random key for this request
      const key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const dataString = JSON.stringify(payload);

      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        this.encoder.encode(dataString)
      );

      // Export key for server decryption (would be sent via secure channel)
      const exportedKey = await window.crypto.subtle.exportKey('raw', key);

      return {
        encrypted: JSON.stringify({
          data: this.arrayBufferToBase64(encryptedData),
          iv: this.arrayBufferToBase64(iv)
        }),
        key: this.arrayBufferToBase64(exportedKey)
      };
    } catch (error) {
      console.error('API encryption failed:', error);
      throw new Error('Failed to encrypt API payload');
    }
  }

  /**
   * Hash sensitive identifiers for privacy
   */
  async hashIdentifier(identifier: string): Promise<string> {
    const data = this.encoder.encode(identifier);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return this.arrayBufferToBase64(hashBuffer);
  }

  /**
   * Generate secure session key
   */
  private generateSessionKey(): string {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return this.arrayBufferToBase64(array);
  }

  /**
   * Convert ArrayBuffer to Base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return window.btoa(binary);
  }

  /**
   * Convert Base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Validate encryption capabilities
   */
  async validateEncryption(): Promise<boolean> {
    try {
      const testData: HealthDataToEncrypt = { notes: 'encryption validation' };
      const encrypted = await this.encryptHealthData(testData);
      const decrypted = await this.decryptHealthData(encrypted);
      return decrypted.notes === 'encryption validation';
    } catch {
      return false;
    }
  }

  /**
   * Secure data wiping from memory
   */
  secureWipe(data: any): void {
    if (typeof data === 'string') {
      // Overwrite string memory (limited effectiveness in JS)
      for (let i = 0; i < data.length; i++) {
        data = data.substring(0, i) + '0' + data.substring(i + 1);
      }
    } else if (data instanceof ArrayBuffer) {
      const view = new Uint8Array(data);
      window.crypto.getRandomValues(view);
    }
  }
}

// Enhanced Firebase service with encryption
export class SecureFirebaseService {
  private encryptionService = new EncryptionService();

  /**
   * Store encrypted health data
   */
  async storeSecureHealthData(
    userId: string,
    healthData: HealthDataToEncrypt,
    userPassword?: string
  ): Promise<boolean> {
    try {
      const encryptedData = await this.encryptionService.encryptHealthData(
        healthData,
        userPassword
      );

      // Store only encrypted data in Firebase
      const docRef = collection(db, 'secure_health_data');
      await addDoc(docRef, {
        userId,
        encryptedData,
        createdAt: new Date()
      });

      return true;
    } catch (error) {
      console.error('Secure storage failed:', error);
      return false;
    }
  }

  /**
   * Retrieve and decrypt health data
   */
  async retrieveSecureHealthData(
    userId: string,
    userPassword?: string
  ): Promise<HealthDataToEncrypt | null> {
    try {
      const q = query(
        collection(db, 'secure_health_data'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;

      const doc = querySnapshot.docs[0];
      const { encryptedData } = doc.data();

      return await this.encryptionService.decryptHealthData(
        encryptedData,
        userPassword
      );
    } catch (error) {
      console.error('Secure retrieval failed:', error);
      return null;
    }
  }
}

export const encryptionService = new EncryptionService();
export const secureFirebaseService = new SecureFirebaseService();

// Firebase imports (would need to be added)
import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';