import { describe, it, expect, beforeEach } from 'vitest';
import { AudioAnalysisService } from '../../src/services/audioAnalysisService';

describe('AudioAnalysisService', () => {
  let service: AudioAnalysisService;

  beforeEach(() => {
    service = new AudioAnalysisService();
  });

  describe('analyzeAudio', () => {
    it('should analyze basic audio metrics successfully', async () => {
      const transcription = `Buongiorno a tutti. Oggi parlerò della storia dell'informatica.
        L'informatica è una scienza molto ehm interessante che ha rivoluzionato il mondo moderno.
        I computer sono ehm dispositivi elettronici che elaborano dati.
        La programmazione permette di creare software utili per risolvere problemi complessi.`;

      const duration = 30; // 30 seconds

      const metrics = await service.analyzeAudio(transcription, duration);

      // Verify all metrics are present
      expect(metrics).toBeDefined();
      expect(metrics.speechRate).toBeDefined();
      expect(metrics.pauseAnalysis).toBeDefined();
      expect(metrics.fillerWords).toBeDefined();
      expect(metrics.audioQuality).toBeDefined();
      expect(metrics.speakingPerformance).toBeDefined();

      // Speech rate should be reasonable
      expect(metrics.speechRate.wordsPerMinute).toBeGreaterThan(0);
      expect(metrics.speechRate.wordsPerMinute).toBeLessThan(300);

      // Overall performance score should be between 0-100
      expect(metrics.speakingPerformance.overallScore).toBeGreaterThanOrEqual(0);
      expect(metrics.speakingPerformance.overallScore).toBeLessThanOrEqual(100);
    });

    it('should detect filler words correctly', async () => {
      const transcription = `Ehm dunque oggi uhm parleremo di ehm informatica.
        Cioè praticamente tipo l'informatica è importante insomma.`;

      const duration = 10;

      const metrics = await service.analyzeAudio(transcription, duration);

      // Should detect multiple filler words
      expect(metrics.fillerWords.totalCount).toBeGreaterThan(0);
      expect(metrics.fillerWords.byType).toBeDefined();

      // Should have detected 'ehm' and 'uhm'
      expect(metrics.fillerWords.byType).toHaveProperty('ehm');
      expect(metrics.fillerWords.byType).toHaveProperty('uhm');

      // Filler rate should be calculated
      expect(metrics.fillerWords.fillerRate).toBeGreaterThan(0);
    });

    it('should calculate correct speech rate for fast speech', async () => {
      // Simulate fast speech: ~200 WPM
      const words = Array(100).fill('parola').join(' ');
      const duration = 30; // 30 seconds = 0.5 minutes, so 100/0.5 = 200 WPM

      const metrics = await service.analyzeAudio(words, duration);

      expect(metrics.speechRate.wordsPerMinute).toBeGreaterThan(150);
      expect(metrics.speechRate.articulation.quality).toBe('fast');
    });

    it('should calculate correct speech rate for slow speech', async () => {
      // Simulate slow speech: ~100 WPM
      const words = Array(50).fill('parola').join(' ');
      const duration = 30; // 30 seconds = 0.5 minutes, so 50/0.5 = 100 WPM

      const metrics = await service.analyzeAudio(words, duration);

      expect(metrics.speechRate.wordsPerMinute).toBeLessThan(130);
      expect(metrics.speechRate.articulation.quality).toBe('slow');
    });

    it('should analyze pauses from text structure', async () => {
      const transcription = `Prima frase. Seconda frase. Terza frase! Quarta frase?`;
      const duration = 20;

      const metrics = await service.analyzeAudio(transcription, duration);

      // Should detect pauses based on punctuation
      expect(metrics.pauseAnalysis.totalPauses).toBeGreaterThan(0);
      expect(metrics.pauseAnalysis.avgPauseDuration).toBeGreaterThan(0);
    });

    it('should provide recommendations based on metrics', async () => {
      const transcription = `Ehm uhm cioè praticamente tipo insomma diciamo ecco.`;
      const duration = 5;

      const metrics = await service.analyzeAudio(transcription, duration);

      // Should provide recommendations
      expect(metrics.speechRate.recommendation).toBeDefined();
      expect(metrics.speechRate.recommendation).not.toBe('');

      expect(metrics.fillerWords.recommendation).toBeDefined();
      expect(metrics.fillerWords.recommendation).not.toBe('');

      expect(metrics.pauseAnalysis.recommendation).toBeDefined();
      expect(metrics.pauseAnalysis.recommendation).not.toBe('');

      expect(metrics.audioQuality.recommendation).toBeDefined();
      expect(metrics.audioQuality.recommendation).not.toBe('');
    });

    it('should calculate speaking performance with strengths and weaknesses', async () => {
      const transcription = `Buongiorno. Oggi parlerò di un argomento molto importante.
        L'intelligenza artificiale sta trasformando il mondo in cui viviamo.
        È fondamentale comprendere le sue applicazioni e implicazioni.`;

      const duration = 15;

      const metrics = await service.analyzeAudio(transcription, duration);

      expect(metrics.speakingPerformance.strengths).toBeInstanceOf(Array);
      expect(metrics.speakingPerformance.weaknesses).toBeInstanceOf(Array);
      expect(metrics.speakingPerformance.suggestions).toBeInstanceOf(Array);
      expect(metrics.speakingPerformance.comparedToOptimal).toBeDefined();
    });

    it('should handle empty transcription gracefully', async () => {
      const transcription = '';
      const duration = 1;

      const metrics = await service.analyzeAudio(transcription, duration);

      expect(metrics).toBeDefined();
      expect(metrics.speechRate.wordsPerMinute).toBe(0);
      expect(metrics.fillerWords.totalCount).toBe(0);
    });

    it('should handle very long transcription', async () => {
      // Generate a long transcription
      const sentences = Array(100).fill(
        'Questa è una frase di esempio che contiene diverse parole.'
      );
      const transcription = sentences.join(' ');
      const duration = 300; // 5 minutes

      const metrics = await service.analyzeAudio(transcription, duration);

      expect(metrics).toBeDefined();
      expect(metrics.speechRate.wordsPerMinute).toBeGreaterThan(0);
      expect(metrics.speakingPerformance.overallScore).toBeGreaterThan(0);
    });

    it('should detect optimal speech correctly', async () => {
      // Create optimal speech: ~150 WPM, no fillers
      const words = Array(75).fill('parola').join(' ');
      const duration = 30; // 150 WPM

      const metrics = await service.analyzeAudio(words, duration);

      expect(metrics.speechRate.articulation.quality).toBe('optimal');
      expect(metrics.fillerWords.quality).toBe('excellent');
      expect(metrics.speakingPerformance.overallScore).toBeGreaterThan(70);
    });

    it('should calculate filler rate per 100 words correctly', async () => {
      // 100 words with 5 fillers = 5.0 filler rate
      const words = Array(95).fill('parola').concat(Array(5).fill('ehm')).join(' ');
      const duration = 40;

      const metrics = await service.analyzeAudio(words, duration);

      expect(metrics.fillerWords.fillerRate).toBeCloseTo(5.0, 1);
    });

    it('should categorize filler quality correctly', async () => {
      // Test excellent (< 1%)
      let transcription = Array(100).fill('parola').join(' ');
      let metrics = await service.analyzeAudio(transcription, 40);
      expect(metrics.fillerWords.quality).toBe('excellent');

      // Test poor (> 4%)
      transcription = Array(96).fill('parola').concat(Array(4).fill('ehm')).join(' ');
      metrics = await service.analyzeAudio(transcription, 40);
      expect(['fair', 'poor']).toContain(metrics.fillerWords.quality);
    });
  });

  describe('Italian filler words detection', () => {
    const fillerWords = [
      'ehm', 'uhm', 'mmm', 'ah', 'oh', 'eh', 'uh',
      'cioè', 'tipo', 'praticamente', 'insomma', 'diciamo',
      'ecco', 'allora', 'quindi', 'comunque', 'però'
    ];

    fillerWords.forEach((filler) => {
      it(`should detect "${filler}" as a filler word`, async () => {
        const transcription = `Questa è una frase con ${filler} inserito.`;
        const duration = 5;

        const metrics = await service.analyzeAudio(transcription, duration);

        expect(metrics.fillerWords.totalCount).toBeGreaterThan(0);
        expect(metrics.fillerWords.byType[filler]).toBeDefined();
        expect(metrics.fillerWords.byType[filler]).toBeGreaterThan(0);
      });
    });
  });

  describe('Pause distribution', () => {
    it('should categorize pauses correctly', async () => {
      const transcription = `Frase uno. Frase due. Frase tre.`;
      const duration = 15;

      const metrics = await service.analyzeAudio(transcription, duration);

      expect(metrics.pauseAnalysis.pauseDistribution).toBeDefined();
      expect(metrics.pauseAnalysis.pauseDistribution.short).toBeGreaterThanOrEqual(0);
      expect(metrics.pauseAnalysis.pauseDistribution.medium).toBeGreaterThanOrEqual(0);
      expect(metrics.pauseAnalysis.pauseDistribution.long).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Comparison to optimal metrics', () => {
    it('should compare all metrics to optimal values', async () => {
      const transcription = Array(75).fill('parola').join(' ');
      const duration = 30;

      const metrics = await service.analyzeAudio(transcription, duration);

      const comparison = metrics.speakingPerformance.comparedToOptimal;

      expect(['below', 'optimal', 'above']).toContain(comparison.speechRate);
      expect(['below', 'optimal', 'above']).toContain(comparison.pauses);
      expect(['below', 'optimal', 'above']).toContain(comparison.fillerWords);
      expect(['below', 'optimal', 'above']).toContain(comparison.volume);
      expect(['below', 'optimal', 'above']).toContain(comparison.pitch);
    });
  });
});
