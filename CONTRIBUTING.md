# Contributing to AI Speech Evaluator

First off, thank you for considering contributing to AI Speech Evaluator! 🎉

This document provides guidelines for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

---

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code.

**Be respectful, inclusive, and professional.**

---

## How Can I Contribute?

### 🐛 Reporting Bugs

**Before submitting a bug report:**
1. Check the [existing issues](https://github.com/your-repo/issues)
2. Check the [DOCS_INDEX.md](./DOCS_INDEX.md) for troubleshooting

**When submitting a bug report, include:**
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, Node version, browser)
- Relevant logs

**Example:**
```markdown
**Bug:** M4A files fail to upload

**Steps to Reproduce:**
1. Go to upload page
2. Select M4A file
3. Click upload

**Expected:** File uploads successfully
**Actual:** Error "File type not allowed"

**Environment:**
- OS: macOS 14.0
- Browser: Chrome 120
- Node: 18.17.0
```

### 💡 Suggesting Features

**Before suggesting a feature:**
1. Check if it's already planned in [CHANGELOG.md](./CHANGELOG.md) Roadmap section
2. Search existing feature requests

**When suggesting a feature, include:**
- Clear use case
- Why it's valuable
- Possible implementation approach
- Examples from other tools (if applicable)

### 🔧 Contributing Code

**Great first contributions:**
- Fix typos in documentation
- Improve error messages
- Add unit tests
- Improve code comments

**Larger contributions:**
- New audio analysis metrics
- UI improvements
- Performance optimizations
- New language support

---

## Development Setup

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Ollama** installed and running
- **Whisper** installed
- **Git**

### Installation

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/AI-RAG-Tutor.git
cd AI-RAG-Tutor

# 2. Install dependencies
npm install

# 3. Install testing dependencies
cd apps/backend
npm install --save-dev vitest @vitest/ui c8

cd ../..
npm install --save-dev @playwright/test
npx playwright install

# 4. Setup environment
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.local.example apps/frontend/.env.local

# 5. Start development servers
npm run dev
```

### Running Tests

```bash
# Unit tests
cd apps/backend
npm test

# E2E tests
cd ../..
npm run test:e2e

# All tests with coverage
npm run test:coverage
```

---

## Coding Standards

### TypeScript

- ✅ **Use TypeScript** for all new code
- ✅ **Type everything** - no `any` unless absolutely necessary
- ✅ **Use interfaces** for data structures
- ✅ **Export types** for reusability

```typescript
// ✅ Good
interface AudioMetrics {
  speechRate: SpeechRateMetrics;
  pauseAnalysis: PauseAnalysis;
}

export async function analyzeAudio(
  transcription: string,
  duration: number
): Promise<AudioMetrics> {
  // ...
}

// ❌ Bad
export async function analyzeAudio(transcription: any, duration: any): Promise<any> {
  // ...
}
```

### Code Style

- ✅ **Use Prettier** for formatting (run `npm run format`)
- ✅ **Use ESLint** (run `npm run lint`)
- ✅ **2 spaces** for indentation
- ✅ **Single quotes** for strings
- ✅ **Semicolons** required
- ✅ **Meaningful variable names**

```typescript
// ✅ Good
const wordsPerMinute = calculateWordsPerMinute(transcription, duration);
const fillerWords = detectFillerWords(transcription);

// ❌ Bad
const wpm = calc(t, d);
const fw = detect(t);
```

### Component Structure (React)

```tsx
// 1. Imports
import React from 'react';
import { AudioMetrics } from '@ai-speech-evaluator/shared';

// 2. Interfaces
interface AudioMetricsDisplayProps {
  metrics: AudioMetrics;
  className?: string;
}

// 3. Component
export const AudioMetricsDisplay: React.FC<AudioMetricsDisplayProps> = ({
  metrics,
  className,
}) => {
  // Hooks first
  const [loading, setLoading] = useState(false);

  // Helper functions
  const getScoreColor = (score: number) => {
    // ...
  };

  // Render
  return (
    <div className={className}>
      {/* JSX */}
    </div>
  );
};

// 4. Export
export default AudioMetricsDisplay;
```

### Comments

- ✅ **Use JSDoc** for functions
- ✅ **Explain WHY, not WHAT**
- ✅ **Update comments** when code changes

```typescript
/**
 * Analyzes speech rate and categorizes it as slow, optimal, fast, or very-fast
 * Based on linguistic research showing optimal rate is 130-170 WPM
 *
 * @param transcription - The full transcription text
 * @param duration - Duration in seconds
 * @returns Speech rate metrics with quality assessment
 */
private analyzeSpeechRate(
  transcription: string,
  duration: number
): SpeechRateMetrics {
  // ...
}
```

---

## Testing Requirements

### All new features MUST include tests

#### Unit Tests (Required)

```typescript
describe('AudioAnalysisService', () => {
  it('should calculate correct WPM for normal speech', async () => {
    const transcription = 'Sample text with fifty words...';
    const duration = 20; // seconds

    const metrics = await service.analyzeAudio(transcription, duration);

    expect(metrics.speechRate.wordsPerMinute).toBeCloseTo(150, 0);
  });
});
```

#### Integration Tests (For API changes)

```typescript
describe('Audio Analysis API', () => {
  it('should analyze audio and return metrics', async () => {
    const response = await request(app)
      .post('/api/audio/test-id/analyze')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.audioMetrics).toBeDefined();
  });
});
```

#### E2E Tests (For UI changes)

```typescript
test('should display audio metrics after analysis', async ({ page }) => {
  await page.goto('/evaluation?id=test-id');
  await page.click('text=Analizza Audio');

  await expect(page.locator('text=Performance Complessiva')).toBeVisible();
  await expect(page.locator('text=Velocità di Eloquio')).toBeVisible();
});
```

### Test Coverage

- **Minimum:** 70% for new code
- **Target:** 80% for critical features
- **Run coverage:** `npm run test:coverage`

---

## Pull Request Process

### Before Submitting

1. ✅ **Create a branch** from `main`
   ```bash
   git checkout -b feature/audio-emotion-detection
   ```

2. ✅ **Make your changes**
   - Follow coding standards
   - Write tests
   - Update documentation

3. ✅ **Test your changes**
   ```bash
   npm test
   npm run test:e2e
   npm run lint
   npm run type-check
   ```

4. ✅ **Commit with clear messages**
   ```bash
   git commit -m "feat: add emotion detection to audio analysis"
   ```

   **Commit message format:**
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation only
   - `style:` - Code style changes
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance

5. ✅ **Update CHANGELOG.md** if applicable

### Submitting the PR

**PR Title:** Clear and descriptive
```
feat: Add emotion detection to audio analysis
fix: Resolve M4A upload error on Safari
docs: Update installation guide for Windows
```

**PR Description Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if UI changes)
[Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added
- [ ] All tests pass
```

### Review Process

1. **Automated checks** run (tests, linting, type-checking)
2. **Code review** by maintainers
3. **Feedback** addressed
4. **Approval** and merge

**Please be patient** - reviews may take a few days.

---

## Project Structure

```
AI-RAG-Tutor/
├── apps/
│   ├── backend/              # Express.js backend
│   │   ├── src/
│   │   │   ├── controllers/  # API controllers
│   │   │   ├── services/     # Business logic
│   │   │   ├── routes/       # API routes
│   │   │   └── middleware/   # Express middleware
│   │   └── tests/            # Backend tests
│   │
│   └── frontend/             # Next.js frontend
│       ├── src/
│       │   ├── app/          # Next.js app directory
│       │   ├── components/   # React components
│       │   └── services/     # API clients
│       └── tests/            # Frontend tests
│
├── packages/
│   ├── shared/               # Shared TypeScript types
│   ├── ai-services/          # AI/LLM services
│   └── audio-services/       # Audio processing
│
├── tests/
│   └── e2e/                  # E2E tests (Playwright)
│
├── docs/                     # Additional documentation
│
└── [Configuration files]
```

### Adding New Audio Metrics

1. **Update types** in `packages/shared/src/types/index.ts`
2. **Implement logic** in `apps/backend/src/services/audioAnalysisService.ts`
3. **Add UI** in `apps/frontend/src/components/audio/AudioMetricsDisplay.tsx`
4. **Write tests** in `apps/backend/tests/services/audioAnalysisService.test.ts`
5. **Update docs** in `AUDIO_FEATURES_DOCUMENTATION.md`

---

## Questions?

- **Documentation:** Check [DOCS_INDEX.md](./DOCS_INDEX.md)
- **Issues:** Open a [GitHub issue](https://github.com/your-repo/issues)
- **Discussion:** Use [GitHub Discussions](https://github.com/your-repo/discussions)

---

## Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributors page

**Thank you for contributing! 🙏**

---

**Happy Coding! 🚀**
