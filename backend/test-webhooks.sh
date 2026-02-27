#!/bin/bash

# Test des routes webhooks microservices
# Utilisation: ./test-webhooks.sh http://localhost:3001

BASE_URL="${1:-http://localhost:3001}"
SECRET="dev-secret"  # Doit correspondre à SUPABASE_WEBHOOK_SECRET

echo "🧪 Testing Webhook Microservices"
echo "================================"
echo ""

# TEST 1: Health check
echo "1️⃣  Testing Health Check..."
curl -s -X GET "$BASE_URL/api/health/webhooks" | jq . || echo "Failed"
echo ""

# TEST 2: Job Analysis
echo "2️⃣  Testing Job Analysis..."
curl -s -X POST "$BASE_URL/api/jobs/analyze" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $SECRET" \
  -d '{
    "jobId": 123,
    "title": "Senior React Developer",
    "requiredSkills": ["React", "Node.js", "TypeScript"],
    "experienceLevel": "Senior"
  }' | jq .
echo ""

# TEST 3: Post Moderation
echo "3️⃣  Testing Post Moderation..."
curl -s -X POST "$BASE_URL/api/posts/moderate" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $SECRET" \
  -d '{
    "postId": 456,
    "content": "Great opportunity for developers in Paris!"
  }' | jq .
echo ""

# TEST 4: Activity Scoring
echo "4️⃣  Testing Activity Scoring..."
curl -s -X POST "$BASE_URL/api/activity/score" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $SECRET" \
  -d '{
    "userId": 789,
    "action": "like",
    "targetId": 456,
    "targetType": "post"
  }' | jq .
echo ""

# TEST 5: Test without secret (should fail)
echo "5️⃣  Testing without secret (should fail)..."
curl -s -X POST "$BASE_URL/api/jobs/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": 999,
    "title": "Test",
    "requiredSkills": ["Test"]
  }' | jq .
echo ""

echo "✅ All tests completed!"
