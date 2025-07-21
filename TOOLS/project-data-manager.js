/**
 * Project Data Manager for RepoClone
 * Manages Firebase and GCS storage for project data
 */

require('dotenv').config();
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');

class ProjectDataManager {
  constructor() {
    this.initializeFirebase();
    this.initializeGCS();
  }

  initializeFirebase() {
    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
      }
      this.db = admin.firestore();
      console.log('✅ Firebase initialized for project data');
    } catch (error) {
      console.warn('⚠️  Firebase not configured:', error.message);
      this.db = null;
    }
  }

  initializeGCS() {
    try {
      this.storage = new Storage({
        projectId: process.env.GCS_PROJECT_ID
      });
      this.bucket = this.storage.bucket(process.env.GCS_BUCKET_NAME);
      console.log('✅ GCS initialized for project data');
    } catch (error) {
      console.warn('⚠️  GCS not configured:', error.message);
      this.storage = null;
      this.bucket = null;
    }
  }

  // Store project data
  async storeProjectData(projectId, data) {
    if (!this.db) return null;
    
    try {
      await this.db.collection('projects').doc(projectId).set({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('❌ Failed to store project data:', error.message);
      return false;
    }
  }

  // Store intelligence data
  async storeIntelligenceData(data) {
    if (!this.db) return null;
    
    try {
      await this.db.collection('intelligence').add({
        ...data,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('❌ Failed to store intelligence data:', error.message);
      return false;
    }
  }

  // Upload project files to GCS
  async uploadProjectFiles(projectId, filePath, destination) {
    if (!this.bucket) return null;
    
    try {
      const file = this.bucket.file(`projects/${projectId}/${destination}`);
      await file.save(fs.readFileSync(filePath));
      return file.publicUrl();
    } catch (error) {
      console.error('❌ Failed to upload project files:', error.message);
      return null;
    }
  }
}

module.exports = ProjectDataManager;