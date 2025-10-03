#!/bin/bash

# Test script for detailed accuracy check

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing Detailed Accuracy Check System${NC}"
echo ""

# Step 1: Create test document
echo -e "${BLUE}📄 Step 1: Creating test document...${NC}"
DOCUMENT_CONTENT="I gatti spaziali sono una specie unica scoperta nel 2150 durante una missione su Marte. Hanno 3 zampe e pelo viola. Possono sopravvivere nello spazio senza tuta spaziale grazie alla loro fisiologia speciale."

UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:3001/api/documents/upload \
  -F "file=@-;filename=test-gatti-spaziali.txt" \
  -F "title=Test Gatti Spaziali" \
  <<< "$DOCUMENT_CONTENT")

echo "Upload response: $UPLOAD_RESPONSE"

DOCUMENT_ID=$(echo $UPLOAD_RESPONSE | grep -o '"documentId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DOCUMENT_ID" ]; then
  echo -e "${RED}❌ Failed to upload document${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Document uploaded: $DOCUMENT_ID${NC}"
echo ""

# Wait for document processing
echo -e "${BLUE}⏳ Waiting for document processing (5s)...${NC}"
sleep 5

# Step 2: Test with ACCURATE transcription
echo -e "${BLUE}📝 Step 2: Testing with ACCURATE transcription...${NC}"
ACCURATE_TRANSCRIPTION="I gatti spaziali sono stati scoperti nel 2150 su Marte. Hanno 3 zampe e il pelo viola. Possono vivere nello spazio senza protezione."

EVAL_RESPONSE=$(curl -s -X POST http://localhost:3001/api/evaluations/evaluate \
  -H "Content-Type: application/json" \
  -d "{
    \"transcription\": \"$ACCURATE_TRANSCRIPTION\",
    \"documentId\": \"$DOCUMENT_ID\",
    \"options\": {
      \"maxRelevantChunks\": 3,
      \"detailedAccuracyCheck\": true
    }
  }")

echo "Evaluation response (accurate):"
echo $EVAL_RESPONSE | jq '.' || echo $EVAL_RESPONSE
echo ""

# Step 3: Test with INACCURATE transcription
echo -e "${BLUE}📝 Step 3: Testing with INACCURATE transcription (external facts)...${NC}"
INACCURATE_TRANSCRIPTION="I gatti spaziali sono animali trovati sulla Terra. Hanno 4 zampe come i gatti normali e pelo arancione. Vivono in case come gli altri gatti."

EVAL_RESPONSE_INACCURATE=$(curl -s -X POST http://localhost:3001/api/evaluations/evaluate \
  -H "Content-Type: application/json" \
  -d "{
    \"transcription\": \"$INACCURATE_TRANSCRIPTION\",
    \"documentId\": \"$DOCUMENT_ID\",
    \"options\": {
      \"maxRelevantChunks\": 3,
      \"detailedAccuracyCheck\": true
    }
  }")

echo "Evaluation response (inaccurate):"
echo $EVAL_RESPONSE_INACCURATE | jq '.' || echo $EVAL_RESPONSE_INACCURATE
echo ""

# Extract accuracy scores
echo -e "${BLUE}📊 Step 4: Comparing accuracy scores...${NC}"

ACCURATE_SCORE=$(echo $EVAL_RESPONSE | jq -r '.data.accuracyReport.overallAccuracyScore // "N/A"')
INACCURATE_SCORE=$(echo $EVAL_RESPONSE_INACCURATE | jq -r '.data.accuracyReport.overallAccuracyScore // "N/A"')

echo "Accurate transcription score: $ACCURATE_SCORE"
echo "Inaccurate transcription score: $INACCURATE_SCORE"
echo ""

# Verify results
if [ "$ACCURATE_SCORE" != "N/A" ] && [ "$INACCURATE_SCORE" != "N/A" ]; then
  if (( $(echo "$ACCURATE_SCORE > $INACCURATE_SCORE" | bc -l) )); then
    echo -e "${GREEN}✅ SUCCESS: Accuracy check is working correctly!${NC}"
    echo -e "   Accurate transcription scored higher ($ACCURATE_SCORE) than inaccurate ($INACCURATE_SCORE)"
  else
    echo -e "${RED}❌ FAILED: Accuracy scores are incorrect${NC}"
    echo -e "   Expected accurate > inaccurate, got $ACCURATE_SCORE vs $INACCURATE_SCORE"
    exit 1
  fi
else
  echo -e "${RED}❌ FAILED: Could not extract accuracy scores${NC}"
  exit 1
fi

# Show fact checks
echo ""
echo -e "${BLUE}🔍 Detailed Fact Checks (Inaccurate transcription):${NC}"
echo $EVAL_RESPONSE_INACCURATE | jq '.data.accuracyReport.factChecks[] | {statement, isAccurate, severity, discrepancy}' 2>/dev/null || echo "No fact checks available"

echo ""
echo -e "${GREEN}✨ Test completed successfully!${NC}"
