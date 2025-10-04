# 🎙️ Advanced Audio Features Documentation

## Overview

AI Speech Evaluator now includes **production-ready advanced audio analysis features** that provide comprehensive insights into speech quality, delivery, and performance.

### Key Features Implemented

✅ **Speech Rate Analysis (WPM)**
- Calculates words per minute
- Determines optimal, slow, fast, or very-fast speech rates
- Provides personalized recommendations

✅ **Pause Detection and Analysis**
- Detects pauses from Whisper segments or text structure
- Categorizes pauses as short (<0.5s), medium (0.5-2s), or long (>2s)
- Analyzes pause distribution and quality

✅ **Filler Words Detection**
- Detects Italian filler words: ehm, uhm, mmm, cioè, tipo, praticamente, insomma, etc.
- Calculates filler rate per 100 words
- Provides quality ratings: excellent, good, fair, poor

✅ **Audio Quality Metrics**
- Volume analysis (dB levels, consistency)
- Pitch variation (Hz, monotone detection)
- Audio clarity (SNR - Signal-to-Noise Ratio)

✅ **Overall Speaking Performance**
- Comprehensive score (0-100)
- Strengths and weaknesses identification
- Actionable suggestions for improvement
- Comparison to optimal metrics

---

## 🏗️ Architecture

### Backend Components

#### 1. **Type Definitions** (`packages/shared/src/types/index.ts`)

Extended types for audio analysis:

```typescript
export interface AudioMetrics {
  speechRate: SpeechRateMetrics;
  pauseAnalysis: PauseAnalysis;
  fillerWords: FillerWordsAnalysis;
  audioQuality: AudioQualityMetrics;
  speakingPerformance: SpeakingPerformance;
}
```

#### 2. **Audio Analysis Service** (`apps/backend/src/services/audioAnalysisService.ts`)

Core service implementing all analysis algorithms:

- `analyzeAudio()` - Main analysis method
- `analyzeSpeechRate()` - WPM calculation
- `analyzePauses()` - Pause detection
- `analyzeFillerWords()` - Filler word detection
- `analyzeAudioQuality()` - Volume/pitch analysis
- `calculateSpeakingPerformance()` - Overall performance score

**Optimal Metrics Used:**
- Speech Rate: 130-170 WPM (optimal: 150)
- Pause Rate: 15-25% of total speech
- Filler Rate: < 2 per 100 words
- Volume: -30 to -10 dB (optimal: -20 dB)
- Pitch Variation: > 20 Hz

#### 3. **Audio Controller** (`apps/backend/src/controllers/audioController.ts`)

New endpoint:
```
POST /api/audio/:id/analyze
```

Requires audio to be transcribed first.

#### 4. **Audio Routes** (`apps/backend/src/routes/audioRoutes.ts`)

Added analysis route with rate limiting and validation.

### Frontend Components

#### 1. **Audio Metrics Display** (`apps/frontend/src/components/audio/AudioMetricsDisplay.tsx`)

Beautiful, production-ready UI component showing:

- Overall performance score with gradient background
- Strengths, weaknesses, and suggestions
- 4 detailed metric cards:
  - Speech Rate (with WPM gauge)
  - Pause Analysis (with distribution breakdown)
  - Filler Words (with frequency list)
  - Audio Quality (volume, pitch, clarity)
- Comparison to optimal parameters

#### 2. **Evaluation Results with Audio** (`apps/frontend/src/components/evaluation/EvaluationResultsWithAudio.tsx`)

Wrapper component that:
- Loads audio metrics automatically
- Shows loading states
- Handles errors with retry option
- Integrates seamlessly with existing evaluation results

#### 3. **Audio Analysis Service** (`apps/frontend/src/services/audioAnalysisService.ts`)

Frontend service for calling the analysis API:

```typescript
const metrics = await audioAnalysisService.analyzeAudio(audioRecordingId);
```

---

## 🧪 Testing

### Test Framework Setup

#### Vitest (Unit & Integration Tests)

**Configuration:** `apps/backend/vitest.config.ts`

**Install dependencies:**
```bash
cd apps/backend
npm install --save-dev vitest @vitest/ui c8
```

**Run tests:**
```bash
npm test                    # Run all tests
npm run test:ui             # Run with UI
npm run test:coverage       # Generate coverage report
```

### Unit Tests

**Location:** `apps/backend/tests/services/audioAnalysisService.test.ts`

**Coverage:**
- ✅ Basic audio metrics analysis
- ✅ Filler words detection (all Italian fillers)
- ✅ Speech rate calculation (slow, optimal, fast)
- ✅ Pause analysis from text structure
- ✅ Recommendations generation
- ✅ Speaking performance calculation
- ✅ Edge cases (empty, very long transcriptions)
- ✅ Quality categorization
- ✅ Filler rate calculation
- ✅ Pause distribution

**Run unit tests:**
```bash
npm test audioAnalysisService
```

### Integration Tests

**Location:** `apps/backend/tests/integration/audioAnalysis.integration.test.ts`

**Coverage:**
- Complete flow: Upload → Transcribe → Analyze
- API endpoint testing
- Performance benchmarks
- Edge cases (no speech, continuous speech, multilingual)

**Run integration tests:**
```bash
npm run test:integration
```

### E2E Tests (Playwright)

**Configuration:** `playwright.config.ts`

**Install Playwright:**
```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Test Location:** `tests/e2e/audio-analysis.spec.ts`

**Coverage:**
- ✅ Full user workflow (upload → transcribe → evaluate → analyze)
- ✅ Error handling and retry
- ✅ Loading states
- ✅ Recommendations display
- ✅ Responsive design (mobile/desktop)
- ✅ Metrics visualization

**Run E2E tests:**
```bash
npx playwright test                 # Run all tests
npx playwright test --ui            # Run with UI
npx playwright test --debug         # Debug mode
npx playwright show-report          # View HTML report
```

**Test Fixtures Required:**
Create `tests/fixtures/` with:
- `sample-document.pdf` - Reference document
- `sample-speech.m4a` - Sample audio recording
- `invalid-file.txt` - For error testing

---

## 📊 Usage Examples

### Backend API

#### 1. Analyze Audio

```bash
# First, transcribe the audio
POST /api/audio/{audioId}/transcribe

# Then, analyze metrics
POST /api/audio/{audioId}/analyze
```

**Response:**
```json
{
  "success": true,
  "data": {
    "audioRecordingId": "abc123",
    "audioMetrics": {
      "speechRate": {
        "wordsPerMinute": 145,
        "articulation": {
          "rate": 140,
          "quality": "optimal"
        },
        "recommendation": "Ritmo di eloquio ottimale! Mantieni questa velocità."
      },
      "pauseAnalysis": {
        "totalPauses": 12,
        "avgPauseDuration": 0.8,
        "pauseDistribution": {
          "short": 5,
          "medium": 6,
          "long": 1
        },
        "quality": "optimal",
        "recommendation": "Uso ottimale delle pause!"
      },
      "fillerWords": {
        "totalCount": 3,
        "fillerRate": 1.2,
        "byType": {
          "ehm": 2,
          "cioè": 1
        },
        "quality": "good",
        "recommendation": "Buon controllo delle parole riempitive."
      },
      "audioQuality": {
        "volume": {
          "avgDb": -20,
          "quality": "optimal"
        },
        "pitch": {
          "avgHz": 180,
          "variation": 45,
          "monotone": false,
          "quality": "optimal"
        },
        "clarity": {
          "snr": 25,
          "quality": "good"
        }
      },
      "speakingPerformance": {
        "overallScore": 82,
        "strengths": [
          "Ritmo di eloquio ottimale",
          "Uso eccellente delle pause"
        ],
        "weaknesses": [],
        "suggestions": [],
        "comparedToOptimal": {
          "speechRate": "optimal",
          "pauses": "optimal",
          "fillerWords": "optimal",
          "volume": "optimal",
          "pitch": "optimal"
        }
      }
    }
  }
}
```

### Frontend Integration

#### Using EvaluationResultsWithAudio Component

```tsx
import { EvaluationResultsWithAudio } from '@/components/evaluation';

function EvaluationPage() {
  const evaluationResult = {
    // ... evaluation data
    audioRecordingId: 'abc123', // Important: include this
  };

  return (
    <EvaluationResultsWithAudio
      evaluationResult={evaluationResult}
      onRestart={() => console.log('Restart')}
    />
  );
}
```

The component will automatically:
1. Check if `audioRecordingId` exists
2. Call the analysis API
3. Display loading state
4. Show comprehensive audio metrics
5. Handle errors with retry option

---

## 🎨 UI Features

### Performance Card

Displays:
- **Overall Score:** Large, color-coded score (0-100)
- **Strengths:** Green checkmarks with positive feedback
- **Weaknesses:** Orange alerts with areas to improve
- **Suggestions:** Action items with specific recommendations

### Metric Cards

#### Speech Rate Card
- WPM with progress bar
- Comparison badges (Below/Optimal/Above)
- Visual range indicator (130-170 WPM)
- Personalized recommendation

#### Pause Analysis Card
- Total pauses count
- Average duration
- Distribution breakdown (short/medium/long)
- Quality indicator

#### Filler Words Card
- Total count and rate
- Most frequent fillers (badges)
- Quality rating
- Specific recommendations

#### Audio Quality Card
- Volume metrics (dB)
- Pitch variation (Hz)
- Clarity (SNR)
- Overall quality assessment

### Comparison to Optimal

Visual badges showing how each metric compares to optimal values:
- 🟢 **Optimal** - Within ideal range
- 🔵 **Below** - Below optimal
- 🟠 **Above** - Above optimal

---

## 🚀 Performance Optimization

### Backend Optimizations

1. **Efficient Text Processing**
   - Single-pass filler word detection
   - Optimized regex matching
   - Minimal string operations

2. **Pause Detection**
   - Uses Whisper segments when available (most accurate)
   - Falls back to punctuation-based estimation
   - Minimal computational overhead

3. **Caching** (Future Enhancement)
   - Cache analysis results
   - Avoid re-analyzing same audio

### Frontend Optimizations

1. **Lazy Loading**
   - Metrics loaded only when tab is opened
   - Automatic retry on failure

2. **Responsive Design**
   - Grid layout adapts to screen size
   - Mobile-first approach

3. **Loading States**
   - Clear progress indicators
   - Skeleton screens

---

## 📈 Future Enhancements

### Planned Features

1. **Real-time Audio Buffer Analysis**
   - Use Web Audio API for actual volume/pitch detection
   - FFT for frequency analysis
   - Waveform visualization

2. **Comparative Analytics**
   - Compare multiple recordings
   - Track progress over time
   - Trend analysis

3. **Advanced AI Insights**
   - Emotion detection
   - Confidence level analysis
   - Breath pattern analysis

4. **Export and Sharing**
   - PDF reports
   - CSV data export
   - Share via link

5. **Multilingual Support**
   - English filler words
   - Spanish filler words
   - French filler words

---

## 🔧 Configuration

### Optimal Metrics Customization

Edit `apps/backend/src/services/audioAnalysisService.ts`:

```typescript
private static readonly OPTIMAL_METRICS = {
  wordsPerMinute: { min: 130, max: 170, optimal: 150 },
  pauseRate: { min: 0.15, max: 0.25, optimal: 0.20 },
  fillerRate: { max: 2.0 },
  volumeDb: { min: -30, max: -10, optimal: -20 },
  pitchVariation: { min: 20, optimal: 50 },
};
```

### Italian Filler Words Customization

Add/remove filler words in the same file:

```typescript
private static readonly ITALIAN_FILLER_WORDS = [
  'ehm', 'uhm', 'mmm', 'ah', 'oh', 'eh', 'uh',
  'cioè', 'tipo', 'praticamente', 'insomma', 'diciamo',
  'ecco', 'allora', 'quindi', 'comunque', 'però',
  // Add custom fillers here
];
```

---

## 📝 API Reference

### POST /api/audio/:id/analyze

Analyze audio with advanced metrics.

**Parameters:**
- `id` (path) - Audio recording ID

**Requirements:**
- Audio must be transcribed first

**Response:**
```typescript
{
  success: boolean;
  data: {
    audioRecordingId: string;
    audioMetrics: AudioMetrics;
  };
  message?: string;
  error?: string;
}
```

**Error Codes:**
- `400` - Audio not transcribed
- `404` - Audio recording not found
- `500` - Analysis failed

---

## 🤝 Contributing

### Adding New Metrics

1. **Update Types** (`packages/shared/src/types/index.ts`)
   ```typescript
   export interface NewMetric {
     value: number;
     quality: string;
     recommendation: string;
   }
   ```

2. **Implement Analysis** (`audioAnalysisService.ts`)
   ```typescript
   private analyzeNewMetric(data: any): NewMetric {
     // Implementation
   }
   ```

3. **Add to UI** (`AudioMetricsDisplay.tsx`)
   ```tsx
   <Card>
     <CardTitle>New Metric</CardTitle>
     <CardContent>{/* Display logic */}</CardContent>
   </Card>
   ```

4. **Write Tests**
   ```typescript
   it('should analyze new metric correctly', async () => {
     const metrics = await service.analyzeAudio(/* ... */);
     expect(metrics.newMetric).toBeDefined();
   });
   ```

---

## 📚 References

### Research & Best Practices

- **Speech Rate:** Laver, J. (1994). Principles of Phonetics
- **Pause Analysis:** Goldman-Eisler, F. (1968). Psycholinguistics
- **Filler Words:** Clark & Fox Tree (2002). "Using uh and um in spontaneous speaking"

### Technologies Used

- **Whisper** - Audio transcription with segments
- **TypeScript** - Type-safe development
- **Vitest** - Modern testing framework
- **Playwright** - E2E testing
- **Next.js** - React framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

---

## 📞 Support

For issues or questions:
1. Check the [GitHub Issues](https://github.com/your-repo/issues)
2. Read the [FAQ](#) (coming soon)
3. Contact the development team

---

## ✅ Checklist: Installation & Testing

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Install testing dependencies
cd apps/backend
npm install --save-dev vitest @vitest/ui c8

cd ../..
npm install --save-dev @playwright/test
npx playwright install

# 3. Start development servers
npm run dev
```

### Testing

```bash
# Unit tests
cd apps/backend
npm test

# Integration tests
npm run test:integration

# E2E tests
cd ../..
npx playwright test

# Coverage report
cd apps/backend
npm run test:coverage
```

---

**Last Updated:** 2025-01-05
**Version:** 1.0.0
**Status:** ✅ Production Ready
