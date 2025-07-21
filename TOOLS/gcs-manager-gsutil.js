
const { execSync } = require('child_process');
const fs = require('fs');

class GCSManager {
  constructor(bucketName) {
    this.bucketName = bucketName;
  }
  
  async uploadFile(localPath, remotePath) {
    try {
      execSync(`gsutil cp "${localPath}" gs://${this.bucketName}/${remotePath}`);
      return true;
    } catch (error) {
      console.error('Upload failed:', error.message);
      return false;
    }
  }
  
  async listFiles() {
    try {
      const result = execSync(`gsutil ls gs://${this.bucketName}/`, { encoding: 'utf8' });
      return result.split('\n').filter(line => line.trim());
    } catch (error) {
      console.error('List failed:', error.message);
      return [];
    }
  }
  
  async downloadFile(remotePath, localPath) {
    try {
      execSync(`gsutil cp gs://${this.bucketName}/${remotePath} "${localPath}"`);
      return true;
    } catch (error) {
      console.error('Download failed:', error.message);
      return false;
    }
  }
}

module.exports = GCSManager;
