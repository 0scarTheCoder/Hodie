/**
 * Upload Model
 * Tracks all file uploads with daily limits and duplicate detection
 */

const crypto = require('crypto');

class Upload {
  constructor(data) {
    this.clientID = data.clientID;
    this.fileName = data.fileName;
    this.fileHash = data.fileHash; // SHA-256 hash for duplicate detection
    this.fileSize = data.fileSize; // bytes
    this.fileType = data.fileType; // csv, json, pdf, etc.
    this.category = data.category; // lab_results, genetic_data, wearable_data, etc.
    this.uploadDate = data.uploadDate || new Date();
    this.recordsCount = data.recordsCount || 0; // Number of records in the file
    this.status = data.status || 'processing'; // processing, completed, failed
    this.errorMessage = data.errorMessage || null;
  }

  /**
   * Calculate file hash for duplicate detection
   */
  static calculateFileHash(fileContent) {
    return crypto
      .createHash('sha256')
      .update(fileContent)
      .digest('hex');
  }

  /**
   * Check if client can upload (3 per day limit)
   */
  static async canUploadToday(db, clientID) {
    const uploadsCollection = db.collection('uploads_history');

    // Get today's start and end times
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count today's uploads
    const todayCount = await uploadsCollection.countDocuments({
      clientID,
      uploadDate: {
        $gte: today,
        $lt: tomorrow
      }
    });

    return {
      canUpload: todayCount < 3,
      uploadsToday: todayCount,
      remainingToday: Math.max(0, 3 - todayCount)
    };
  }

  /**
   * Check if file is duplicate (same hash exists)
   */
  static async isDuplicate(db, clientID, fileHash) {
    const uploadsCollection = db.collection('uploads_history');

    const existing = await uploadsCollection.findOne({
      clientID,
      fileHash
    });

    if (existing) {
      return {
        isDuplicate: true,
        existingUpload: {
          fileName: existing.fileName,
          uploadDate: existing.uploadDate,
          recordsCount: existing.recordsCount
        }
      };
    }

    return { isDuplicate: false };
  }

  /**
   * Create new upload record
   */
  static async create(db, uploadData) {
    const uploadsCollection = db.collection('uploads_history');

    // Check daily limit
    const uploadCheck = await this.canUploadToday(db, uploadData.clientID);
    if (!uploadCheck.canUpload) {
      throw new Error(`Daily upload limit reached. You can upload ${uploadCheck.remainingToday} more files today.`);
    }

    // Check for duplicates
    const duplicateCheck = await this.isDuplicate(db, uploadData.clientID, uploadData.fileHash);
    if (duplicateCheck.isDuplicate) {
      throw new Error(
        `This file was already uploaded on ${duplicateCheck.existingUpload.uploadDate.toLocaleDateString()}. ` +
        `Original filename: ${duplicateCheck.existingUpload.fileName}`
      );
    }

    // Create upload object
    const upload = new Upload(uploadData);

    // Insert into database
    const result = await uploadsCollection.insertOne(upload);

    return { ...upload, _id: result.insertedId };
  }

  /**
   * Get upload history for a client
   */
  static async getClientHistory(db, clientID, limit = 50) {
    const uploadsCollection = db.collection('uploads_history');

    return await uploadsCollection
      .find({ clientID })
      .sort({ uploadDate: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Get today's uploads for a client
   */
  static async getTodayUploads(db, clientID) {
    const uploadsCollection = db.collection('uploads_history');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await uploadsCollection
      .find({
        clientID,
        uploadDate: {
          $gte: today,
          $lt: tomorrow
        }
      })
      .sort({ uploadDate: -1 })
      .toArray();
  }

  /**
   * Update upload status
   */
  static async updateStatus(db, uploadId, status, errorMessage = null) {
    const uploadsCollection = db.collection('uploads_history');
    const { ObjectId } = require('mongodb');

    await uploadsCollection.updateOne(
      { _id: new ObjectId(uploadId) },
      {
        $set: {
          status,
          errorMessage,
          updatedAt: new Date()
        }
      }
    );
  }

  /**
   * Get upload statistics for a client
   */
  static async getStatistics(db, clientID) {
    const uploadsCollection = db.collection('uploads_history');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalUploads, todayUploads, uploadsByCategory] = await Promise.all([
      // Total uploads
      uploadsCollection.countDocuments({ clientID }),

      // Today's uploads
      uploadsCollection.countDocuments({
        clientID,
        uploadDate: { $gte: today, $lt: tomorrow }
      }),

      // Uploads by category
      uploadsCollection.aggregate([
        { $match: { clientID } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]).toArray()
    ]);

    return {
      totalUploads,
      todayUploads,
      remainingToday: Math.max(0, 3 - todayUploads),
      uploadsByCategory: uploadsByCategory.map(item => ({
        category: item._id,
        count: item.count
      }))
    };
  }

  /**
   * Delete upload record (admin only)
   */
  static async delete(db, uploadId) {
    const uploadsCollection = db.collection('uploads_history');
    const { ObjectId } = require('mongodb');

    const result = await uploadsCollection.deleteOne({
      _id: new ObjectId(uploadId)
    });

    return result.deletedCount > 0;
  }
}

module.exports = Upload;
