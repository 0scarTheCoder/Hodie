#!/bin/bash

# Hodie Labs Backend API Test Script
# Tests all major endpoints to verify functionality

API_URL="http://localhost:3001"
TEST_USER_ID="test-user-$(date +%s)"

echo "🧪 Testing Hodie Labs Backend API"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/health)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Server is healthy"
    echo "Response: $BODY"
else
    echo -e "${RED}❌ FAILED${NC} - Server returned $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Test 2: Chat Endpoint (Free Tier)
echo -e "${YELLOW}Test 2: Chat Endpoint (Free Tier)${NC}"
CHAT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/api/chat \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$TEST_USER_ID\",
    \"message\": \"What are 3 quick tips for better sleep?\"
  }")

HTTP_CODE=$(echo "$CHAT_RESPONSE" | tail -n 1)
BODY=$(echo "$CHAT_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Chat endpoint working"
    echo "Model: $(echo $BODY | grep -o '"model":"[^"]*"' | cut -d'"' -f4)"
    echo "Tier: $(echo $BODY | grep -o '"tier":"[^"]*"' | cut -d'"' -f4)"
    echo "Response preview: $(echo $BODY | grep -o '"response":"[^"]*"' | cut -d'"' -f4 | head -c 100)..."
else
    echo -e "${RED}❌ FAILED${NC} - Chat endpoint returned $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Test 3: Usage Endpoint
echo -e "${YELLOW}Test 3: Usage Statistics${NC}"
USAGE_RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/api/usage/$TEST_USER_ID)
HTTP_CODE=$(echo "$USAGE_RESPONSE" | tail -n 1)
BODY=$(echo "$USAGE_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Usage endpoint working"
    echo "Messages used: $(echo $BODY | grep -o '"messagesUsed":[0-9]*' | cut -d':' -f2)"
    echo "Remaining: $(echo $BODY | grep -o '"remaining":[0-9]*' | cut -d':' -f2)"
    echo "Tier: $(echo $BODY | grep -o '"tier":"[^"]*"' | cut -d'"' -f4)"
else
    echo -e "${RED}❌ FAILED${NC} - Usage endpoint returned $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Test 4: File Analysis (should fail for free tier)
echo -e "${YELLOW}Test 4: File Analysis (Free Tier - Should Fail)${NC}"
FILE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/api/analyze-file \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$TEST_USER_ID\",
    \"fileData\": {\"data\": [{\"test\": \"value\"}]},
    \"fileName\": \"test.csv\",
    \"fileCategory\": \"lab_results\"
  }")

HTTP_CODE=$(echo "$FILE_RESPONSE" | tail -n 1)
BODY=$(echo "$FILE_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "403" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Correctly denied file analysis for free tier"
    echo "Error message: $(echo $BODY | grep -o '"message":"[^"]*"' | cut -d'"' -f4)"
else
    echo -e "${RED}❌ FAILED${NC} - Expected 403, got $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Test 5: Rate Limiting (send 10 requests rapidly)
echo -e "${YELLOW}Test 5: Rate Limiting (10 rapid requests)${NC}"
RATE_LIMIT_TRIGGERED=false

for i in {1..10}; do
    RESPONSE=$(curl -s -w "%{http_code}" -X POST $API_URL/api/chat \
      -H "Content-Type: application/json" \
      -d "{
        \"userId\": \"rate-test-$TEST_USER_ID\",
        \"message\": \"Test message $i\"
      }")

    HTTP_CODE="${RESPONSE: -3}"

    if [ "$HTTP_CODE" = "429" ]; then
        RATE_LIMIT_TRIGGERED=true
        echo "Rate limit triggered at request $i"
        break
    fi

    # Small delay to avoid overwhelming the server
    sleep 0.1
done

if [ "$RATE_LIMIT_TRIGGERED" = true ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Rate limiting is working"
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - Rate limit not triggered (may need adjustment)"
fi
echo ""

# Summary
echo "=================================="
echo -e "${GREEN}🎉 Test Suite Complete${NC}"
echo ""
echo "Test User ID: $TEST_USER_ID"
echo "API URL: $API_URL"
echo ""
echo "Next steps:"
echo "1. Check MongoDB for usage tracking data"
echo "2. Monitor logs for any errors"
echo "3. Test with actual user authentication"
echo "4. Deploy to production and update frontend"
