# 📦 Installation Guide - Advanced Audio Features

## Quick Start

### 1. Install Testing Dependencies

#### Backend (Vitest)
```bash
cd apps/backend
npm install --save-dev vitest @vitest/ui c8
```

#### Root (Playwright)
```bash
cd ../..
npm install --save-dev @playwright/test
npx playwright install
```

### 2. Run the Application

```bash
# From root directory
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### 3. Test the Features

#### Run Unit Tests
```bash
cd apps/backend
npm test
```

#### Run E2E Tests
```bash
cd ../..
npm run test:e2e
```

---

## Detailed Installation Steps

### Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Whisper**: Installed and available in PATH
- **Ollama**: Running with a model installed

### Step-by-Step Installation

#### 1. Clone & Install Base Dependencies

```bash
git clone <repository-url>
cd AI-RAG-Tutor
npm install
```

#### 2. Install Testing Frameworks

**Vitest (Unit & Integration Tests):**
```bash
cd apps/backend
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom c8
```

**Playwright (E2E Tests):**
```bash
cd ../..
npm install --save-dev @playwright/test
npx playwright install chromium firefox webkit
```

#### 3. Environment Setup

Create `.env` files if not present:

**Backend** (`apps/backend/.env`):
```env
PORT=3001
NODE_ENV=development

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest

# Whisper Configuration
WHISPER_MODEL=base
WHISPER_MODEL_PATH=~/.cache/whisper

# Pinecone (optional)
PINECONE_API_KEY=your-key
PINECONE_ENVIRONMENT=your-env
PINECONE_INDEX_NAME=speech-evaluator
```

**Frontend** (`apps/frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

#### 4. Build Shared Packages

```bash
cd packages/shared
npm run build

cd ../audio-services
npm run build

cd ../ai-services
npm run build
```

#### 5. Start Development Servers

```bash
cd ../..
npm run dev
```

Or individually:
```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
```

---

## Testing Setup

### Unit Tests Setup

#### 1. Verify Vitest Configuration

Check `apps/backend/vitest.config.ts` exists with:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

#### 2. Run Unit Tests

```bash
cd apps/backend

# Run all tests
npm test

# Watch mode
npm run test:watch

# With UI
npm run test:ui

# With coverage
npm run test:coverage
```

### Integration Tests Setup

#### 1. Create Test Fixtures

```bash
mkdir -p apps/backend/tests/fixtures/audio
```

Add sample audio files for testing:
- `test-speech.m4a` - Normal speech
- `test-speech-fast.m4a` - Fast speech
- `test-speech-slow.m4a` - Slow speech
- `test-speech-fillers.m4a` - Speech with many fillers

#### 2. Run Integration Tests

```bash
# Ensure backend is running
npm run dev

# In another terminal
cd apps/backend
npm run test:integration
```

### E2E Tests Setup

#### 1. Verify Playwright Configuration

Check `playwright.config.ts` exists in root with proper settings.

#### 2. Create Test Fixtures

```bash
mkdir -p tests/fixtures
```

Add:
- `sample-document.pdf` - Sample reference document
- `sample-speech.m4a` - Sample audio recording
- `invalid-file.txt` - For error testing

#### 3. Run E2E Tests

```bash
# From root directory

# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# View report
npm run test:e2e:report
```

---

## Verification Checklist

### ✅ Backend Verification

```bash
cd apps/backend

# 1. Check TypeScript compilation
npm run type-check

# 2. Run linter
npm run lint

# 3. Run unit tests
npm test

# 4. Check server starts
npm run dev
# Should see: "Server running on port 3001"
```

### ✅ Frontend Verification

```bash
cd apps/frontend

# 1. Check TypeScript compilation
npm run type-check

# 2. Run linter
npm run lint

# 3. Check build
npm run build

# 4. Check server starts
npm run dev
# Should see: "Ready on http://localhost:3000"
```

### ✅ Audio Features Verification

#### Test Endpoint Manually

```bash
# 1. Upload audio
curl -X POST http://localhost:3001/api/audio/upload \
  -F "audio=@/path/to/audio.m4a" \
  -F "duration=30"

# Response should include audioRecording.id

# 2. Transcribe audio
curl -X POST http://localhost:3001/api/audio/{audioId}/transcribe

# 3. Analyze audio
curl -X POST http://localhost:3001/api/audio/{audioId}/analyze
```

Expected response structure:
```json
{
  "success": true,
  "data": {
    "audioRecordingId": "...",
    "audioMetrics": {
      "speechRate": { ... },
      "pauseAnalysis": { ... },
      "fillerWords": { ... },
      "audioQuality": { ... },
      "speakingPerformance": { ... }
    }
  }
}
```

---

## Common Issues & Solutions

### Issue: Vitest not found

**Solution:**
```bash
cd apps/backend
npm install --save-dev vitest
```

### Issue: Playwright browsers not installed

**Solution:**
```bash
npx playwright install
```

### Issue: Tests failing with "Cannot find module @ai-speech-evaluator/shared"

**Solution:**
```bash
cd packages/shared
npm run build
cd ../..
npm install
```

### Issue: Port already in use

**Solution:**
```bash
# Kill specific port
npm run kill-ports

# Or manually
lsof -ti:3000,3001 | xargs kill -9
```

### Issue: Whisper not found

**Solution:**
```bash
# Install Whisper
pip3 install openai-whisper

# Verify installation
which whisper
```

### Issue: Ollama not running

**Solution:**
```bash
# Start Ollama
ollama serve

# Pull model
ollama pull llama3.2:latest

# Verify
ollama list
```

---

## Performance Optimization

### Production Build

```bash
# Build all packages
npm run build

# Start production servers
cd apps/backend
npm start

cd apps/frontend
npm start
```

### Database Optimization

```bash
# Run migrations
npm run db:migrate

# Seed database (if needed)
npm run db:seed
```

---

## Continuous Integration Setup

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run unit tests
        run: |
          cd apps/backend
          npm test

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Next Steps

After installation:

1. **Read Documentation**: Check [AUDIO_FEATURES_DOCUMENTATION.md](./AUDIO_FEATURES_DOCUMENTATION.md)

2. **Run Tests**: Ensure all tests pass
   ```bash
   npm test
   npm run test:e2e
   ```

3. **Test UI**: Open http://localhost:3000 and test the features manually

4. **Customize**: Adjust optimal metrics in `audioAnalysisService.ts`

5. **Deploy**: Follow deployment guide for production

---

## Support & Resources

- **Documentation**: [AUDIO_FEATURES_DOCUMENTATION.md](./AUDIO_FEATURES_DOCUMENTATION.md)
- **API Reference**: Check the documentation for detailed API specs
- **Issues**: Report bugs on GitHub
- **Contributing**: See CONTRIBUTING.md (coming soon)

---

**Installation Complete! 🎉**

You're now ready to use the advanced audio analysis features.

Happy coding! 🚀
