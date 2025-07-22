#!/bin/bash

# 🚀 KENNYMINT INTELLIGENCE SYSTEM - DEPLOYMENT SCRIPT
# Deploys the complete Kennymint Intelligence System to Google Cloud Run

set -e

echo "🚀 Starting Kennymint Intelligence System Deployment..."

# =============================================================================
# CONFIGURATION
# =============================================================================

PROJECT_ID="dangpt-4777e"
SERVICE_NAME="kennymint-intelligence"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"
SERVICE_ACCOUNT="kennymint-intelligence@$PROJECT_ID.iam.gserviceaccount.com"

# =============================================================================
# PRE-DEPLOYMENT CHECKS
# =============================================================================

echo "🔍 Performing pre-deployment checks..."

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Error: Not authenticated with gcloud. Please run 'gcloud auth login'"
    exit 1
fi

# Check if project is set
if [ "$(gcloud config get-value project)" != "$PROJECT_ID" ]; then
    echo "❌ Error: Project not set to $PROJECT_ID. Please run 'gcloud config set project $PROJECT_ID'"
    exit 1
fi

# Check if service account exists
if ! gcloud iam service-accounts list --filter="email:$SERVICE_ACCOUNT" --format="value(email)" | grep -q .; then
    echo "❌ Error: Service account $SERVICE_ACCOUNT does not exist"
    exit 1
fi

# Check if service account key exists
if [ ! -f "kennymint-service-account.json" ]; then
    echo "❌ Error: Service account key file not found. Please create it first."
    exit 1
fi

echo "✅ Pre-deployment checks passed"

# =============================================================================
# BUILD AND PUSH DOCKER IMAGE
# =============================================================================

echo "🐳 Building and pushing Docker image..."

# Create Dockerfile if it doesn't exist
if [ ! -f "Dockerfile" ]; then
    echo "📝 Creating Dockerfile..."
    cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S kennymint -u 1001

# Change ownership of the app directory
RUN chown -R kennymint:nodejs /app
USER kennymint

# Expose port
EXPOSE 6000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:6000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
EOF
fi

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t $IMAGE_NAME .

# Configure Docker to use gcloud as a credential helper
gcloud auth configure-docker

# Push the image to Google Container Registry
echo "📤 Pushing Docker image to Google Container Registry..."
docker push $IMAGE_NAME

echo "✅ Docker image built and pushed successfully"

# =============================================================================
# DEPLOY TO CLOUD RUN
# =============================================================================

echo "🚀 Deploying to Google Cloud Run..."

# Deploy the service
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --service-account $SERVICE_ACCOUNT \
    --allow-unauthenticated \
    --port 6000 \
    --memory 2Gi \
    --cpu 2 \
    --max-instances 10 \
    --min-instances 1 \
    --timeout 300 \
    --concurrency 80 \
    --set-env-vars "NODE_ENV=production,PORT=6000" \
    --set-env-vars "GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID" \
    --set-env-vars "FIREBASE_PROJECT_ID=$PROJECT_ID" \
    --set-env-vars "FIREBASE_STORAGE_BUCKET=kennymint-storage.appspot.com" \
    --set-env-vars "KENNYMINT_SERVICE_ACCOUNT_EMAIL=$SERVICE_ACCOUNT" \
    --set-env-vars "INTELLIGENCE_MONITORING_INTERVAL=30000" \
    --set-env-vars "AI_COORDINATION_INTERVAL=45000" \
    --set-env-vars "SELF_IMPROVING_COORDINATION_INTERVAL=60000" \
    --set-env-vars "BACKEND_COORDINATION_INTERVAL=75000" \
    --set-env-vars "COMPLETE_BACKEND_COORDINATION_INTERVAL=75000" \
    --set-env-vars "PERFORMANCE_MONITORING_ENABLED=true" \
    --set-env-vars "ERROR_TRACKING_ENABLED=true" \
    --set-env-vars "HEALTH_MONITORING_ENABLED=true" \
    --set-env-vars "CODE_QUALITY_MIN_SCORE=80" \
    --set-env-vars "SECURITY_COMPLIANCE_MIN_SCORE=95" \
    --set-env-vars "PERFORMANCE_RESPONSE_TIME_MAX=500" \
    --set-env-vars "DEPLOYMENT_ENVIRONMENT=production" \
    --set-env-vars "AUTO_SCALING_ENABLED=true" \
    --set-env-vars "BACKUP_ENABLED=true" \
    --set-env-vars "RECOVERY_ENABLED=true" \
    --set-env-vars "LOG_STORAGE_ENABLED=true" \
    --set-env-vars "TESTING_ENABLED=true" \
    --set-env-vars "CI_CD_ENABLED=true" \
    --set-env-vars "GITHUB_REPO_OWNER=hightower888" \
    --set-env-vars "GITHUB_REPO_NAME=kennymint-intelligence" \
    --set-env-vars "GITHUB_API_URL=https://api.github.com" \
    --set-env-vars "JWT_SECRET=kennymint-jwt-secret-2025-elite-intelligence" \
    --set-env-vars "ENCRYPTION_KEY=kennymint-encryption-key-2025-elite" \
    --set-env-vars "AI_SYSTEM_SECRET=kennymint-ai-system-secret-2025" \
    --set-env-vars "AI_COORDINATION_SECRET=kennymint-ai-coordination-secret-2025" \
    --set-env-vars "SELF_IMPROVING_SECRET=kennymint-self-improving-secret-2025" \
    --set-env-vars "LEARNING_SYSTEM_SECRET=kennymint-learning-system-secret-2025" \
    --set-env-vars "PATTERN_RECOGNITION_SECRET=kennymint-pattern-recognition-secret-2025" \
    --set-env-vars "EVOLUTION_SECRET=kennymint-evolution-secret-2025"

echo "✅ Deployment completed successfully"

# =============================================================================
# GET SERVICE URL
# =============================================================================

echo "🔗 Getting service URL..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo "🎉 Kennymint Intelligence System deployed successfully!"
echo "📊 Dashboard URL: $SERVICE_URL"
echo "🔍 Monitoring URL: $SERVICE_URL/monitoring"
echo "📈 Metrics URL: $SERVICE_URL/metrics"
echo "🏆 Standards URL: $SERVICE_URL/standards"

# =============================================================================
# SET UP MONITORING
# =============================================================================

echo "📊 Setting up monitoring..."

# Create monitoring dashboard
gcloud monitoring dashboards create \
    --project=$PROJECT_ID \
    --config-from-file=- << EOF
{
  "displayName": "Kennymint Intelligence System Dashboard",
  "gridLayout": {
    "columns": "2",
    "widgets": [
      {
        "title": "Service Health",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"run.googleapis.com/request_count\"",
                  "filter": "resource.type=\"cloud_run_revision\"",
                  "filter": "resource.label.\"service_name\"=\"$SERVICE_NAME\""
                }
              }
            }
          ]
        }
      },
      {
        "title": "Response Time",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"run.googleapis.com/request_latencies\"",
                  "filter": "resource.type=\"cloud_run_revision\"",
                  "filter": "resource.label.\"service_name\"=\"$SERVICE_NAME\""
                }
              }
            }
          ]
        }
      }
    ]
  }
}
EOF

echo "✅ Monitoring dashboard created"

# =============================================================================
# SET UP LOGGING
# =============================================================================

echo "📝 Setting up logging..."

# Create log sink
gcloud logging sinks create kennymint-intelligence-logs \
    storage.googleapis.com/kennymint-intelligence-logs \
    --project=$PROJECT_ID \
    --log-filter="resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"$SERVICE_NAME\""

echo "✅ Logging sink created"

# =============================================================================
# SET UP ALERTS
# =============================================================================

echo "🚨 Setting up alerts..."

# Create alerting policy
gcloud alpha monitoring policies create \
    --project=$PROJECT_ID \
    --policy-from-file=- << EOF
{
  "displayName": "Kennymint Intelligence System Alerts",
  "conditions": [
    {
      "displayName": "High Error Rate",
      "conditionThreshold": {
        "filter": "metric.type=\"run.googleapis.com/request_count\" AND resource.type=\"cloud_run_revision\" AND resource.label.service_name=\"$SERVICE_NAME\" AND metric.label.response_code_class=\"5xx\"",
        "comparison": "COMPARISON_GREATER_THAN",
        "thresholdValue": 0.05,
        "duration": "300s"
      }
    },
    {
      "displayName": "High Latency",
      "conditionThreshold": {
        "filter": "metric.type=\"run.googleapis.com/request_latencies\" AND resource.type=\"cloud_run_revision\" AND resource.label.service_name=\"$SERVICE_NAME\"",
        "comparison": "COMPARISON_GREATER_THAN",
        "thresholdValue": 1000,
        "duration": "300s"
      }
    }
  ],
  "notificationChannels": []
}
EOF

echo "✅ Alerting policy created"

# =============================================================================
# FINAL STATUS
# =============================================================================

echo ""
echo "🎉 KENNYMINT INTELLIGENCE SYSTEM DEPLOYMENT COMPLETE!"
echo ""
echo "📊 Service Information:"
echo "   - Service Name: $SERVICE_NAME"
echo "   - Project ID: $PROJECT_ID"
echo "   - Region: $REGION"
echo "   - Service Account: $SERVICE_ACCOUNT"
echo ""
echo "🔗 URLs:"
echo "   - Main Dashboard: $SERVICE_URL"
echo "   - Monitoring: $SERVICE_URL/monitoring"
echo "   - Metrics: $SERVICE_URL/metrics"
echo "   - Standards: $SERVICE_URL/standards"
echo ""
echo "📈 Monitoring:"
echo "   - Google Cloud Console: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME"
echo "   - Logs: https://console.cloud.google.com/logs/query?project=$PROJECT_ID"
echo "   - Monitoring: https://console.cloud.google.com/monitoring/dashboards"
echo ""
echo "🔧 Management Commands:"
echo "   - View logs: gcloud logs tail --project=$PROJECT_ID --filter=\"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\""
echo "   - Update service: ./deploy-kennymint.sh"
echo "   - Delete service: gcloud run services delete $SERVICE_NAME --region=$REGION"
echo ""
echo "✅ Deployment completed successfully!" 