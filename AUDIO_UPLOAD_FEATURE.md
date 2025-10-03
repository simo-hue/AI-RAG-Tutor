# 🎙️ Audio File Upload Feature

## Panoramica

Nuova funzionalità che permette di **caricare file audio esistenti** invece di registrare in tempo reale. Il file viene automaticamente trascritto usando Whisper locale.

## ✨ Caratteristiche

- ✅ **Upload file audio** - Supporto per **10+ formati audio** (WAV, MP3, M4A, AAC, OGG, Opus, WebM, FLAC, AMR, 3GP)
- ✅ **Trascrizione automatica** con Whisper locale
- ✅ **Validazione intelligente** - Controlla sia MIME type che estensione file
- ✅ **Progress indicator** durante upload e trascrizione
- ✅ **Toggle rapido** tra modalità Registra/Carica
- ✅ **Nessun dato inviato esternamente** - tutto locale

## 🎯 Come Usare

### 1. Accedi alla pagina Upload

Vai su `http://localhost:3002/upload`

### 2. Nella sezione "Registrazione Vocale"

Troverai due pulsanti in alto:
- **Registra** - modalità registrazione tradizionale
- **Carica** - nuova modalità upload file

### 3. Seleziona "Carica"

Clicca sul pulsante "Carica" per passare alla modalità upload.

### 4. Carica il file

- Clicca nell'area "Carica File Audio"
- Oppure trascina un file audio nell'area
- **Formati supportati**: `.wav`, `.mp3`, `.m4a`, `.aac`, `.ogg`, `.opus`, `.webm`, `.flac`, `.amr`, `.3gp`
- Dimensione massima: 100MB

### 5. Attendi la trascrizione

Il sistema:
1. ⬆️ Carica il file al server (progress bar)
2. 🎤 Trascrive con Whisper locale
3. ✅ Mostra la trascrizione completata

### 6. Procedi alla valutazione

Una volta completata la trascrizione, clicca "Inizia Valutazione" per ottenere il feedback AI.

## 🔧 Implementazione Tecnica

### Frontend

**Componenti:**
- `AudioFileUploader.tsx` - Nuovo componente per upload
- `SimpleAudioRecorder.tsx` - Modificato per supportare toggle Record/Upload

**API Calls:**
```typescript
// 1. Upload file
POST /api/audio/upload
FormData: { audio: File }

// 2. Trascrivi
POST /api/audio/{id}/transcribe
Body: { language: 'it' }
```

### Backend

**Modifiche:**
- `audioController.ts` - `documentId` e `duration` ora opzionali
- `validation.ts` - `validateAudioUpload` aggiornato
- `audioService.ts` - Supporta `documentId` nullo

**Endpoint esistenti utilizzati:**
```
POST /api/audio/upload
POST /api/audio/:id/transcribe
```

## 📝 Esempi di File Supportati

### ✅ Formati Validi (10+ formati supportati!)
- `presentazione.mp3` - Audio compresso standard
- `registrazione.wav` - Audio non compresso alta qualità
- `speech.m4a` - Audio iPhone/Mac (MIME type supportato!)
- `voce.aac` - Advanced Audio Codec
- `podcast.ogg` - Audio open-source Vorbis
- `musica.opus` - Alta qualità, bassa dimensione
- `meeting.webm` - Audio web moderno
- `archivio.flac` - Lossless compression
- `nota-vocale.amr` - Audio telefonia mobile
- `video-call.3gp` - Audio da video 3GP

### ❌ Formati NON Supportati
- Video files (`.mp4`, `.mov`, `.avi`) - solo traccia audio
- File compressi (`.zip`, `.rar`)
- Documenti (`.pdf`, `.doc`)
- Immagini (`.jpg`, `.png`)

## 🚀 Vantaggi

1. **Flessibilità** - Usa registrazioni esistenti da app esterne
2. **Qualità** - File registrati con microfoni professionali
3. **Convenienza** - Carica presentazioni pre-registrate
4. **Privacy** - Tutto rimane locale (Whisper locale)
5. **Velocità** - Non serve re-registrare se hai già l'audio

## 🔒 Privacy e Sicurezza

- ✅ File caricati salvati **solo localmente** in `/uploads/audio/`
- ✅ Trascrizione eseguita con **Whisper locale** (nessun API esterno)
- ✅ Validazione formato e dimensione file
- ✅ Rate limiting su endpoint upload
- ✅ Storage temporaneo in memoria (no database per ora)

## 🐛 Troubleshooting

### Il file non viene caricato

1. Verifica formato (deve essere audio, non video)
2. Controlla dimensione (max 100MB)
3. Rinomina il file senza caratteri speciali

### La trascrizione fallisce

1. Verifica che Whisper sia installato: `whisper --version`
2. Controlla i log del backend per errori
3. Prova con un file più piccolo (<10MB) per test

### Upload molto lento

1. File grandi (>50MB) richiedono più tempo
2. Considera di comprimere l'audio (es. MP3 a 128kbps)
3. Usa file WAV solo se necessaria alta qualità

## 📊 Limiti

- **Dimensione massima**: 100MB per file
- **Durata massima**: 3600 secondi (1 ora)
- **Formati**: Solo audio (no video)
- **Lingua**: Ottimizzato per italiano

## 🎨 UI/UX

### Toggle Registra/Carica
```
┌─────────────────────────────────┐
│ 🎤 Registrazione Vocale         │
│                                  │
│ [Registra] [Carica] ←Toggle     │
└─────────────────────────────────┘
```

### Area Upload
```
┌─────────────────────────────────┐
│         📤 Upload                │
│   Carica File Audio              │
│                                  │
│   Clicca o trascina qui          │
│                                  │
│   WAV, MP3, OGG, WebM, M4A, AAC  │
│   Max 100MB                      │
└─────────────────────────────────┘
```

### Durante Upload
```
┌─────────────────────────────────┐
│ 📁 presentazione.mp3             │
│ 2.5 MB                           │
│                                  │
│ ⏳ Upload in corso... 75%        │
│ ████████████░░░░                 │
└─────────────────────────────────┘
```

### Durante Trascrizione
```
┌─────────────────────────────────┐
│ 📁 presentazione.mp3             │
│ 2.5 MB                           │
│                                  │
│ 🔄 Trascrizione in corso...      │
│ Whisper locale sta elaborando    │
└─────────────────────────────────┘
```

### Completato
```
┌─────────────────────────────────┐
│ ✅ Trascrizione completata!      │
│                                  │
│ "Buongiorno, oggi parlerò       │
│  dell'intelligenza artificiale  │
│  e del suo impatto..."           │
│                                  │
│ 245 parole                       │
│ ✓ Pronto per valutazione         │
└─────────────────────────────────┘
```

## 🔄 Prossimi Sviluppi

- [ ] Drag & drop diretto
- [ ] Preview audio player
- [ ] Supporto multi-file batch
- [ ] Rilevamento automatico lingua
- [ ] Salvataggio file in database
- [ ] Gestione storico upload
- [ ] Compressione automatica file grandi

## 📌 Note Implementazione

### File Modificati
```
frontend/
  ├── components/audio/
  │   ├── AudioFileUploader.tsx (NUOVO)
  │   └── SimpleAudioRecorder.tsx (MODIFICATO)

backend/
  ├── controllers/audioController.ts (MODIFICATO)
  ├── middleware/validation.ts (MODIFICATO)
  └── services/audioService.ts (MODIFICATO)
```

### Dipendenze
- Nessuna dipendenza aggiuntiva richiesta
- Usa librerie esistenti: `multer`, `whisper`, `express-validator`

## ✅ Testing

### Test Manuale
1. Prepara file audio di test (es. `test.mp3`)
2. Vai su `/upload`
3. Clicca "Carica"
4. Seleziona file
5. Verifica upload progress
6. Verifica trascrizione
7. Procedi a valutazione

### Test Automatico (TODO)
```bash
# Unit tests
npm test -- audio-uploader

# E2E tests
npm run test:e2e -- upload-feature
```

## 📞 Supporto

Per problemi o domande:
1. Controlla questo documento
2. Verifica i log del backend
3. Apri issue su GitHub

---

**Versione**: 1.0.0
**Data**: 2025-10-03
**Autore**: AI Speech Evaluator Team
