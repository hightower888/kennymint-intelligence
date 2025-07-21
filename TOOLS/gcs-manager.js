/**
 * Google Cloud Storage Manager for RepoClone Intelligence System
 * Handles file storage, backups, and asset management
 */

require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

class GCSManager {
  constructor() {
    this.initializeGCS();
    this.bucketName = process.env.GCS_BUCKET_NAME || 'repoclone-intelligence-storage';
    this.projectId = process.env.GCS_PROJECT_ID || 'repoclone-intelligence';
  }

  /**
   * Initialize Google Cloud Storage
   */
  initializeGCS() {
    try {
      // Initialize Firebase Admin SDK if not already initialized
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: process.env.FIREBASE_PROJECT_ID || 'dan-gpt-460014'
        });
      }

      this.storage = new Storage({
        projectId: this.projectId
      });

      this.bucket = this.storage.bucket(this.bucketName);
      console.log('✅ GCS initialized successfully');
    } catch (error) {
      console.warn('⚠️  GCS not configured, using local storage:', error.message);
      this.storage = null;
      this.bucket = null;
    }
  }

  /**
   * Upload file to GCS
   */
  async uploadFile(filePath, destination, metadata = {}) {
    if (!this.bucket) {
      console.warn('⚠️  GCS not available, skipping upload');
      return null;
    }

    try {
      const file = this.bucket.file(destination);
      const [result] = await file.save(fs.readFileSync(filePath), {
        metadata: {
          ...metadata,
          contentType: this.getContentType(filePath)
        }
      });

      console.log(`✅ File uploaded to GCS: ${destination}`);
      return {
        url: `https://storage.googleapis.com/${this.bucketName}/${destination}`,
        name: destination,
        size: result.size,
        updated: result.updated
      };
    } catch (error) {
      console.error('❌ Failed to upload file to GCS:', error.message);
      return null;
    }
  }

  /**
   * Download file from GCS
   */
  async downloadFile(remotePath, localPath) {
    if (!this.bucket) {
      console.warn('⚠️  GCS not available, skipping download');
      return null;
    }

    try {
      const file = this.bucket.file(remotePath);
      const [exists] = await file.exists();
      
      if (!exists) {
        console.warn(`⚠️  File not found in GCS: ${remotePath}`);
        return null;
      }

      await file.download({ destination: localPath });
      console.log(`✅ File downloaded from GCS: ${remotePath}`);
      return localPath;
    } catch (error) {
      console.error('❌ Failed to download file from GCS:', error.message);
      return null;
    }
  }

  /**
   * List files in GCS bucket
   */
  async listFiles(prefix = '') {
    if (!this.bucket) {
      console.warn('⚠️  GCS not available, returning empty list');
      return [];
    }

    try {
      const [files] = await this.bucket.getFiles({ prefix });
      return files.map(file => ({
        name: file.name,
        size: file.metadata.size,
        updated: file.metadata.updated,
        url: `https://storage.googleapis.com/${this.bucketName}/${file.name}`
      }));
    } catch (error) {
      console.error('❌ Failed to list files from GCS:', error.message);
      return [];
    }
  }

  /**
   * Delete file from GCS
   */
  async deleteFile(remotePath) {
    if (!this.bucket) {
      console.warn('⚠️  GCS not available, skipping delete');
      return false;
    }

    try {
      const file = this.bucket.file(remotePath);
      await file.delete();
      console.log(`✅ File deleted from GCS: ${remotePath}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete file from GCS:', error.message);
      return false;
    }
  }

  /**
   * Create backup of project data
   */
  async createBackup(backupName = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalBackupName = backupName || `backup-${timestamp}`;
    
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      project: 'RepoClone',
      data: {
        activityLog: [], // Will be populated from database
        systemMetrics: {},
        goals: [],
        rules: []
      }
    };

    try {
      // Save backup to local file first
      const localBackupPath = `backups/${finalBackupName}.json`;
      fs.mkdirSync('backups', { recursive: true });
      fs.writeFileSync(localBackupPath, JSON.stringify(backupData, null, 2));

      // Upload to GCS
      const gcsPath = `backups/${finalBackupName}.json`;
      const result = await this.uploadFile(localBackupPath, gcsPath, {
        metadata: {
          backupName: finalBackupName,
          timestamp: backupData.timestamp,
          type: 'project-backup'
        }
      });

      console.log(`✅ Backup created: ${finalBackupName}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to create backup:', error.message);
      return null;
    }
  }

  /**
   * Restore backup from GCS
   */
  async restoreBackup(backupName) {
    try {
      const gcsPath = `backups/${backupName}.json`;
      const localPath = `backups/restore-${backupName}.json`;
      
      const downloaded = await this.downloadFile(gcsPath, localPath);
      if (!downloaded) {
        return null;
      }

      const backupData = JSON.parse(fs.readFileSync(localPath, 'utf8'));
      console.log(`✅ Backup restored: ${backupName}`);
      return backupData;
    } catch (error) {
      console.error('❌ Failed to restore backup:', error.message);
      return null;
    }
  }

  /**
   * Get content type based on file extension
   */
  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.json': 'application/json',
      '.js': 'application/javascript',
      '.ts': 'application/typescript',
      '.html': 'text/html',
      '.css': 'text/css',
      '.md': 'text/markdown',
      '.txt': 'text/plain',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };
    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Get bucket information
   */
  async getBucketInfo() {
    if (!this.bucket) {
      return {
        name: this.bucketName,
        status: 'not_configured',
        files: 0,
        size: 0
      };
    }

    try {
      const [metadata] = await this.bucket.getMetadata();
      const [files] = await this.bucket.getFiles();
      
      return {
        name: this.bucketName,
        status: 'active',
        files: files.length,
        size: metadata.size || 0,
        location: metadata.location,
        created: metadata.timeCreated
      };
    } catch (error) {
      console.error('❌ Failed to get bucket info:', error.message);
      return {
        name: this.bucketName,
        status: 'error',
        files: 0,
        size: 0
      };
    }
  }
}

module.exports = GCSManager; 