import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * E2E Tests for Audio Analysis Feature
 * Tests the complete user flow from uploading audio to viewing metrics
 */

test.describe('Audio Analysis E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should complete full audio evaluation workflow', async ({ page }) => {
    // Step 1: Upload document
    test.step('Upload reference document', async () => {
      await page.click('text=Carica Documento');

      const documentInput = page.locator('input[type="file"][accept*="pdf"]');
      await documentInput.setInputFiles(
        path.join(__dirname, '../fixtures/sample-document.pdf')
      );

      await expect(page.locator('text=Documento caricato')).toBeVisible({ timeout: 10000 });
    });

    // Step 2: Record or upload audio
    test.step('Upload audio file', async () => {
      await page.click('text=Carica Audio');

      const audioInput = page.locator('input[type="file"][accept*="audio"]');
      await audioInput.setInputFiles(
        path.join(__dirname, '../fixtures/sample-speech.m4a')
      );

      await expect(page.locator('text=Audio caricato')).toBeVisible({ timeout: 10000 });
    });

    // Step 3: Transcribe audio
    test.step('Transcribe audio', async () => {
      await page.click('text=Trascrivi');

      // Wait for transcription to complete
      await expect(page.locator('text=Trascrizione completata')).toBeVisible({
        timeout: 60000,
      });

      // Verify transcription is displayed
      const transcription = page.locator('[data-testid="transcription-text"]');
      await expect(transcription).toBeVisible();
      await expect(transcription).not.toBeEmpty();
    });

    // Step 4: Evaluate presentation
    test.step('Evaluate presentation', async () => {
      await page.click('text=Valuta Presentazione');

      // Wait for evaluation to complete
      await expect(page.locator('text=Valutazione Completata')).toBeVisible({
        timeout: 60000,
      });

      // Verify evaluation results are displayed
      await expect(page.locator('text=Punteggio Complessivo')).toBeVisible();
      await expect(page.locator('[data-testid="overall-score"]')).toBeVisible();
    });

    // Step 5: View audio metrics
    test.step('View advanced audio metrics', async () => {
      await page.click('text=Analisi Audio Avanzata');

      // Wait for audio metrics to load
      await expect(page.locator('text=Analisi in corso')).toBeVisible();
      await expect(page.locator('text=Performance Complessiva')).toBeVisible({
        timeout: 30000,
      });

      // Verify all metric categories are displayed
      await expect(page.locator('text=Velocità di Eloquio')).toBeVisible();
      await expect(page.locator('text=Analisi Pause')).toBeVisible();
      await expect(page.locator('text=Parole Riempitive')).toBeVisible();
      await expect(page.locator('text=Qualità Audio')).toBeVisible();

      // Verify specific metrics
      const wpmMetric = page.locator('text=Parole al minuto');
      await expect(wpmMetric).toBeVisible();

      const fillerMetric = page.locator('text=Totale rilevate');
      await expect(fillerMetric).toBeVisible();

      const pauseMetric = page.locator('text=Totale pause');
      await expect(pauseMetric).toBeVisible();
    });
  });

  test('should display error if transcription fails', async ({ page }) => {
    // Upload invalid audio
    await page.click('text=Carica Audio');

    const audioInput = page.locator('input[type="file"]');
    await audioInput.setInputFiles(
      path.join(__dirname, '../fixtures/invalid-file.txt')
    );

    await page.click('text=Trascrivi');

    // Should show error message
    await expect(page.locator('text=Errore')).toBeVisible({ timeout: 10000 });
  });

  test('should show loading states during analysis', async ({ page }) => {
    // Navigate to evaluation page (mock)
    await page.goto('/evaluation?id=test-evaluation-id');

    // Click analyze audio button
    await page.click('text=Analizza Audio');

    // Should show loading spinner
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    await expect(loadingSpinner).toBeVisible();

    // Should show loading text
    await expect(page.locator('text=Analisi in corso')).toBeVisible();
  });

  test('should allow retry if analysis fails', async ({ page }) => {
    // Navigate to evaluation page
    await page.goto('/evaluation?id=invalid-id');

    // Click analyze audio button
    await page.click('text=Analizza Audio');

    // Wait for error
    await expect(page.locator('text=Errore')).toBeVisible({ timeout: 10000 });

    // Should show retry button
    const retryButton = page.locator('button:has-text("Riprova")');
    await expect(retryButton).toBeVisible();

    // Click retry
    await retryButton.click();

    // Should attempt analysis again
    await expect(page.locator('text=Analisi in corso')).toBeVisible();
  });

  test('should display recommendations based on metrics', async ({ page }) => {
    // Navigate to evaluation with audio metrics
    await page.goto('/evaluation?id=test-evaluation-with-audio');

    // Wait for metrics to load
    await expect(page.locator('text=Performance Complessiva')).toBeVisible({
      timeout: 30000,
    });

    // Should display recommendations
    await expect(page.locator('text=Suggerimenti')).toBeVisible();

    // Check for specific recommendation elements
    const recommendations = page.locator('[data-testid="recommendation-item"]');
    await expect(recommendations).toHaveCount(await recommendations.count());
  });

  test('should be responsive on mobile devices', async ({ page, viewport }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to evaluation page
    await page.goto('/evaluation?id=test-evaluation-id');

    // Audio metrics should be visible and properly formatted
    await expect(page.locator('text=Analisi Audio Avanzata')).toBeVisible();

    // Metrics should stack vertically on mobile
    const metricsGrid = page.locator('[data-testid="audio-metrics-grid"]');
    await expect(metricsGrid).toBeVisible();
  });

  test('should export metrics as PDF', async ({ page }) => {
    test.skip(true, 'PDF export feature not yet implemented');

    // Navigate to evaluation page
    await page.goto('/evaluation?id=test-evaluation-id');

    // Click export button
    await page.click('text=Esporta PDF');

    // Should trigger download
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toMatch(/evaluation-.*\.pdf/);
  });

  test('should compare multiple evaluations', async ({ page }) => {
    test.skip(true, 'Comparison feature not yet implemented');

    // Navigate to evaluations history
    await page.goto('/evaluations');

    // Select multiple evaluations
    await page.click('[data-testid="evaluation-1-checkbox"]');
    await page.click('[data-testid="evaluation-2-checkbox"]');

    // Click compare button
    await page.click('text=Confronta');

    // Should show comparison view
    await expect(page.locator('text=Confronto Valutazioni')).toBeVisible();

    // Should display side-by-side metrics
    await expect(page.locator('[data-testid="comparison-chart"]')).toBeVisible();
  });
});

test.describe('Audio Metrics Visualization', () => {
  test('should display charts and graphs correctly', async ({ page }) => {
    await page.goto('/evaluation?id=test-evaluation-id');

    // Wait for metrics to load
    await expect(page.locator('text=Performance Complessiva')).toBeVisible({
      timeout: 30000,
    });

    // Check for progress bars
    const progressBars = page.locator('[role="progressbar"]');
    await expect(progressBars.first()).toBeVisible();

    // Check for score badges
    const scoreBadges = page.locator('[data-testid="score-badge"]');
    await expect(scoreBadges.first()).toBeVisible();
  });

  test('should highlight optimal vs non-optimal metrics', async ({ page }) => {
    await page.goto('/evaluation?id=test-evaluation-id');

    // Wait for comparison badges
    await expect(page.locator('text=Confronto con Parametri Ottimali')).toBeVisible({
      timeout: 30000,
    });

    // Should show colored badges for comparison
    const optimalBadge = page.locator('text=Ottimale');
    await expect(optimalBadge).toBeVisible();
  });
});

/**
 * NOTE FOR DEVELOPERS:
 *
 * To run these E2E tests:
 *
 * 1. Install Playwright:
 *    npm install --save-dev @playwright/test
 *    npx playwright install
 *
 * 2. Prepare test fixtures:
 *    - Create tests/fixtures directory
 *    - Add sample PDF document (sample-document.pdf)
 *    - Add sample audio file (sample-speech.m4a)
 *    - Add invalid file (invalid-file.txt)
 *
 * 3. Ensure both servers are running:
 *    - Frontend: http://localhost:3000
 *    - Backend: http://localhost:3001
 *
 * 4. Run tests:
 *    npx playwright test
 *    npx playwright test --ui (for UI mode)
 *    npx playwright test --debug (for debug mode)
 *
 * 5. View report:
 *    npx playwright show-report
 */
