<template>
  <main class="app-shell">
    <section class="studio">
      <header class="studio__header">
        <div>
          <p class="eyebrow">Virtual Guitar Studio</p>
          <h1>Играй гитару, бас и грув в одном мини-студийном пульте</h1>
        </div>
        <div class="status" :class="{ 'status--ready': audioReady }">
          {{ audioReady ? statusText : 'Нажмите струну для старта звука' }}
        </div>
      </header>

      <div class="toolbar" aria-label="Настройки инструмента">
        <div class="segmented" role="tablist" aria-label="Тип инструмента">
          <button
            v-for="instrument in instruments"
            :key="instrument.id"
            class="segmented__button"
            :class="{ 'segmented__button--active': selectedInstrument.id === instrument.id }"
            type="button"
            role="tab"
            :aria-selected="selectedInstrument.id === instrument.id"
            @click="selectInstrument(instrument.id)"
          >
            {{ instrument.name }}
          </button>
        </div>

        <label class="control">
          <span>Громкость</span>
          <input v-model.number="volume" type="range" min="0" max="1" step="0.01" />
        </label>
      </div>

      <section class="control-grid" aria-label="Панель эффектов и записи">
        <div class="panel">
          <div class="panel__top">
            <h2>Комбик</h2>
            <span>{{ selectedInstrument.id === 'electric' ? 'Эффекты электрогитары' : selectedInstrument.name }}</span>
          </div>
          <div class="preset-grid">
            <button
              v-for="preset in ampPresets"
              :key="preset.id"
              class="preset"
              :class="{ 'preset--active': ampPresetId === preset.id }"
              type="button"
              :disabled="selectedInstrument.id !== 'electric'"
              @click="ampPresetId = preset.id"
            >
              <strong>{{ preset.name }}</strong>
              <span>{{ preset.description }}</span>
            </button>
          </div>
        </div>

        <div class="panel">
          <div class="panel__top">
            <h2>Метроном</h2>
            <span>{{ metronomeEnabled ? `${bpm} BPM` : 'Выключен' }}</span>
          </div>
          <div class="inline-controls">
            <button class="action-button" type="button" @click="toggleMetronome">
              {{ metronomeEnabled ? 'Стоп' : 'Старт' }}
            </button>
            <label class="control control--stacked">
              <span>Темп</span>
              <input v-model.number="bpm" type="range" min="60" max="180" step="1" />
            </label>
          </div>
          <div class="beat-row" aria-label="Доли метронома">
            <span
              v-for="beat in 4"
              :key="beat"
              class="beat"
              :class="{ 'beat--active': currentBeat === beat && (metronomeEnabled || drumsEnabled || bassBackingEnabled) }"
            ></span>
          </div>
        </div>

        <div class="panel">
          <div class="panel__top">
            <h2>Запись</h2>
            <span>{{ loopInfo }}</span>
          </div>
          <div class="inline-controls inline-controls--wrap">
            <button
              class="action-button"
              :class="{ 'action-button--recording': isRecording }"
              type="button"
              @click="toggleRecording"
            >
              {{ isRecording ? 'Остановить' : 'Записать' }}
            </button>
            <button class="action-button" type="button" :disabled="!recordedEvents.length" @click="toggleLoop">
              {{ loopPlaying ? 'Пауза лупа' : 'Играть луп' }}
            </button>
            <button
              class="action-button"
              :class="{ 'action-button--active': overdubEnabled }"
              type="button"
              :disabled="!loopPlaying"
              @click="toggleOverdub"
            >
              Overdub
            </button>
            <button class="icon-button" type="button" :disabled="!recordedEvents.length" @click="clearLoop" aria-label="Очистить запись">
              x
            </button>
          </div>
        </div>
      </section>

      <section class="groove-grid" aria-label="Ритм-секция">
        <div class="panel">
          <div class="panel__top">
            <h2>Фоновый бас</h2>
            <span>{{ bassBackingEnabled ? bassPattern.name : 'Выключен' }}</span>
          </div>
          <div class="inline-controls inline-controls--wrap">
            <button
              class="action-button"
              :class="{ 'action-button--active': bassBackingEnabled }"
              type="button"
              @click="toggleBassBacking"
            >
              {{ bassBackingEnabled ? 'Стоп бас' : 'Бас фон' }}
            </button>
            <select v-model="bassPatternId" class="select-control" aria-label="Паттерн баса">
              <option v-for="pattern in bassPatterns" :key="pattern.id" :value="pattern.id">
                {{ pattern.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="panel">
          <div class="panel__top">
            <h2>Барабаны</h2>
            <span>{{ drumsEnabled ? drumPattern.name : 'Выключены' }}</span>
          </div>
          <div class="inline-controls inline-controls--wrap">
            <button
              class="action-button"
              :class="{ 'action-button--active': drumsEnabled }"
              type="button"
              @click="toggleDrums"
            >
              {{ drumsEnabled ? 'Стоп бит' : 'Барабаны' }}
            </button>
            <select v-model="drumPatternId" class="select-control" aria-label="Паттерн барабанов">
              <option v-for="pattern in drumPatterns" :key="pattern.id" :value="pattern.id">
                {{ pattern.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="panel">
          <div class="panel__top">
            <h2>Запись микса</h2>
            <span>{{ mixInfo }}</span>
          </div>
          <div class="inline-controls inline-controls--wrap">
            <button
              class="action-button"
              :class="{ 'action-button--recording': mixRecording }"
              type="button"
              :disabled="!mixRecorderSupported"
              @click="toggleMixRecording"
            >
              {{ mixRecording ? 'Стоп микс' : 'Писать микс' }}
            </button>
            <a
              v-if="mixAudioUrl"
              class="action-link"
              :href="mixAudioUrl"
              download="virtual-guitar-mix.webm"
            >
              Скачать
            </a>
            <button class="icon-button" type="button" :disabled="!mixAudioUrl || mixRecording" @click="clearMixRecording" aria-label="Очистить микс">
              x
            </button>
          </div>
          <audio v-if="mixAudioUrl" class="mix-player" :src="mixAudioUrl" controls></audio>
        </div>
      </section>

      <section
        class="guitar-stage"
        :class="`guitar-stage--${selectedInstrument.id}`"
        @pointermove.prevent="handleStagePointerMove"
        @pointerup="stopStringGesture"
        @pointercancel="stopStringGesture"
        @pointerleave="stopStringGesture"
      >
        <div class="guitar-body" aria-hidden="true">
          <div class="guitar-body__hole"></div>
          <div class="guitar-body__bridge"></div>
        </div>

        <div class="neck" :aria-label="`Виртуальный инструмент: ${selectedInstrument.name}`">
          <div class="headstock">
            <span v-for="string in playableStrings" :key="string.key" class="tuner"></span>
          </div>

          <div class="fretboard">
            <div class="frets" aria-hidden="true">
              <span v-for="fret in frets" :key="fret"></span>
            </div>

            <button
              v-for="string in playableStrings"
              :key="string.key"
              class="string"
              :class="{ 'string--active': activeStrings.has(string.key) }"
              type="button"
              :data-string-key="string.key"
              :style="{ '--string-top': `${string.position}%`, '--string-size': `${string.size}px` }"
              :aria-label="`Сыграть струну ${string.label}, клавиша ${string.key}`"
              @pointerdown.prevent="startStringGesture(string, $event)"
              @pointerenter="handleStringHover(string, $event)"
            >
              <span class="string__line"></span>
              <span class="string__note">{{ string.label }}</span>
              <span class="string__key">{{ string.key }}</span>
            </button>
          </div>
        </div>
      </section>

      <section class="chord-pad" aria-label="Быстрые аккорды">
        <button
          v-for="chord in chords"
          :key="chord.name"
          class="chord-button"
          type="button"
          @pointerdown.prevent="playChord(chord)"
        >
          <strong>{{ chord.name }}</strong>
          <span>{{ chord.keys.join(' ') }}</span>
        </button>
      </section>

      <footer class="hint-bar">
        <span>Клавиши: A S D F G H</span>
        <span>Бас и барабаны синхронизированы с BPM.</span>
      </footer>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const instruments = [
  { id: 'electric', name: 'Электрогитара', attack: 0.004, decay: 1.85, waveform: 'triangle', filter: 1650, pick: 0.2, level: 0.82 },
  { id: 'classic', name: 'Классическая гитара', attack: 0.014, decay: 2.45, waveform: 'sine', filter: 1180, pick: 0.14, level: 0.78 },
  { id: 'bass', name: 'Бас-гитара', attack: 0.01, decay: 1.65, waveform: 'sine', filter: 360, pick: 0.08, level: 0.9 },
];

const ampPresets = [
  { id: 'clean', name: 'Clean', description: 'тепло', drive: 8, tone: 1750, delay: 0, feedback: 0, tremolo: 0 },
  { id: 'crunch', name: 'Crunch', description: 'мягкий драйв', drive: 36, tone: 1450, delay: 0.07, feedback: 0.1, tremolo: 0 },
  { id: 'lead', name: 'Lead', description: 'плотно', drive: 62, tone: 1850, delay: 0.14, feedback: 0.2, tremolo: 0 },
  { id: 'space', name: 'Space', description: 'эхо', drive: 24, tone: 1550, delay: 0.26, feedback: 0.32, tremolo: 0.18 },
];

const guitarStrings = [
  { key: 'A', label: 'E2', frequency: 82.41, position: 14, size: 3.2 },
  { key: 'S', label: 'A2', frequency: 110.0, position: 28, size: 2.9 },
  { key: 'D', label: 'D3', frequency: 146.83, position: 42, size: 2.5 },
  { key: 'F', label: 'G3', frequency: 196.0, position: 56, size: 2.1 },
  { key: 'G', label: 'B3', frequency: 246.94, position: 70, size: 1.8 },
  { key: 'H', label: 'E4', frequency: 329.63, position: 84, size: 1.5 },
];

const bassStrings = [
  { key: 'A', label: 'E1', frequency: 41.2, position: 20, size: 4.2 },
  { key: 'S', label: 'A1', frequency: 55.0, position: 40, size: 3.8 },
  { key: 'D', label: 'D2', frequency: 73.42, position: 60, size: 3.4 },
  { key: 'F', label: 'G2', frequency: 98.0, position: 80, size: 3.0 },
];

const chords = [
  { name: 'Em', keys: ['A', 'D', 'F', 'G', 'H'] },
  { name: 'E', keys: ['A', 'S', 'D', 'F', 'G', 'H'] },
  { name: 'G', keys: ['A', 'S', 'D', 'G', 'H'] },
  { name: 'C', keys: ['S', 'D', 'F', 'G'] },
  { name: 'D', keys: ['D', 'F', 'G', 'H'] },
  { name: 'Am', keys: ['S', 'D', 'F', 'G', 'H'] },
  { name: 'A', keys: ['S', 'D', 'F', 'G'] },
  { name: 'F', keys: ['A', 'D', 'F', 'G'] },
  { name: 'Bm', keys: ['S', 'D', 'F', 'H'] },
  { name: 'Dm', keys: ['D', 'F', 'H'] },
  { name: 'Cmaj7', keys: ['S', 'D', 'G', 'H'] },
  { name: 'G7', keys: ['A', 'S', 'F', 'G', 'H'] },
];

const bassPatterns = [
  { id: 'roots', name: 'Roots', steps: ['E1', 'E1', 'A1', 'E1', 'G2', 'E1', 'A1', 'E1'] },
  { id: 'walking', name: 'Walking', steps: ['E1', 'G1', 'A1', 'B1', 'D2', 'B1', 'A1', 'G1'] },
  { id: 'funk', name: 'Funk', steps: ['E1', null, 'E1', 'G1', 'A1', null, 'D2', 'A1'] },
];

const drumPatterns = [
  {
    id: 'rock',
    name: 'Rock',
    steps: [
      ['kick', 'hat'],
      ['hat'],
      ['snare', 'hat'],
      ['hat'],
      ['kick', 'hat'],
      ['hat'],
      ['snare', 'hat'],
      ['hat'],
    ],
  },
  {
    id: 'pop',
    name: 'Pop',
    steps: [
      ['kick', 'hat'],
      ['hat'],
      ['snare', 'hat'],
      ['kick', 'hat'],
      ['hat'],
      ['kick', 'hat'],
      ['snare', 'hat'],
      ['hat'],
    ],
  },
  {
    id: 'funk',
    name: 'Funk',
    steps: [
      ['kick', 'hat'],
      ['hat'],
      ['snare'],
      ['hat'],
      ['kick', 'hat'],
      ['kick'],
      ['snare', 'hat'],
      ['hat'],
    ],
  },
];

const frets = Array.from({ length: 10 }, (_, index) => index + 1);
const selectedInstrumentId = ref('electric');
const ampPresetId = ref('clean');
const volume = ref(0.72);
const bpm = ref(100);
const currentBeat = ref(1);
const rhythmStep = ref(0);
const metronomeEnabled = ref(false);
const bassBackingEnabled = ref(false);
const drumsEnabled = ref(false);
const bassPatternId = ref('roots');
const drumPatternId = ref('rock');
const audioReady = ref(false);
const activeStrings = ref(new Set());
const recordedEvents = ref([]);
const isRecording = ref(false);
const loopPlaying = ref(false);
const overdubEnabled = ref(false);
const mixRecording = ref(false);
const mixAudioUrl = ref('');
const mixRecorderSupported = ref(true);

let audioContext;
let masterGain;
let effectInput;
let drumGain;
let recorderDestination;
let mediaRecorder;
let mixChunks = [];
let rhythmTimer;
let effectNodes = [];
let recordingStartTime = 0;
let loopStartTime = 0;
let loopTimer;
let isStrumming = false;
let lastStrummedKey = '';

const selectedInstrument = computed(() => {
  return instruments.find((instrument) => instrument.id === selectedInstrumentId.value) || instruments[0];
});

const selectedPreset = computed(() => {
  return ampPresets.find((preset) => preset.id === ampPresetId.value) || ampPresets[0];
});

const playableStrings = computed(() => (selectedInstrumentId.value === 'bass' ? bassStrings : guitarStrings));

const bassPattern = computed(() => bassPatterns.find((pattern) => pattern.id === bassPatternId.value) || bassPatterns[0]);

const drumPattern = computed(() => drumPatterns.find((pattern) => pattern.id === drumPatternId.value) || drumPatterns[0]);

const statusText = computed(() => {
  if (mixRecording.value) return 'Пишется общий микс';
  if (isRecording.value) return overdubEnabled.value ? 'Пишем поверх лупа' : 'Идет запись';
  if (loopPlaying.value) return 'Луп играет';
  if (bassBackingEnabled.value && drumsEnabled.value) return 'Бас и барабаны играют';
  if (bassBackingEnabled.value) return 'Фоновый бас играет';
  if (drumsEnabled.value) return 'Барабаны играют';
  if (metronomeEnabled.value) return 'Метроном включен';
  return 'Звук включен';
});

const loopInfo = computed(() => {
  if (!recordedEvents.value.length) return 'Пусто';
  return `${recordedEvents.value.length} нот · ${loopDuration.value.toFixed(1)} сек`;
});

const mixInfo = computed(() => {
  if (!mixRecorderSupported.value) return 'Не поддерживается';
  if (mixRecording.value) return 'Идет запись';
  if (mixAudioUrl.value) return 'Готово';
  return 'Пусто';
});

const loopDuration = computed(() => {
  if (!recordedEvents.value.length) return 4 * (60 / bpm.value);
  const lastEvent = Math.max(...recordedEvents.value.map((event) => event.time));
  return Math.max(lastEvent + 0.45, 2 * (60 / bpm.value));
});

function selectInstrument(id) {
  selectedInstrumentId.value = id;
  if (id !== 'electric') {
    ampPresetId.value = 'clean';
  }
  rebuildEffects();
}

function ensureAudio() {
  if (!audioContext) {
    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    drumGain = audioContext.createGain();
    recorderDestination = audioContext.createMediaStreamDestination();
    masterGain.gain.value = volume.value;
    drumGain.gain.value = 0.72;
    drumGain.connect(masterGain);
    masterGain.connect(audioContext.destination);
    masterGain.connect(recorderDestination);
    rebuildEffects();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  audioReady.value = true;
}

function rebuildEffects() {
  if (!audioContext || !masterGain) return;

  effectNodes.forEach((node) => {
    try {
      node.disconnect();
    } catch {
      // AudioNode may already be disconnected after a preset switch.
    }
  });

  effectNodes = [];
  effectInput = audioContext.createGain();
  effectNodes.push(effectInput);

  if (selectedInstrumentId.value !== 'electric') {
    const filter = audioContext.createBiquadFilter();
    filter.type = selectedInstrumentId.value === 'bass' ? 'lowpass' : 'lowpass';
    filter.frequency.value = selectedInstrument.value.filter;
    filter.Q.value = selectedInstrumentId.value === 'bass' ? 5 : 2.4;
    effectInput.connect(filter);
    filter.connect(masterGain);
    effectNodes.push(filter);
    return;
  }

  const preset = selectedPreset.value;
  const drive = audioContext.createWaveShaper();
  const tone = audioContext.createBiquadFilter();
  const wet = audioContext.createGain();
  const dry = audioContext.createGain();
  const delay = audioContext.createDelay(0.8);
  const feedback = audioContext.createGain();
  const tremoloGain = audioContext.createGain();
  const tremoloOsc = audioContext.createOscillator();
  const tremoloDepth = audioContext.createGain();

  drive.curve = createDriveCurve(preset.drive);
  drive.oversample = '4x';
  tone.type = 'lowpass';
  tone.frequency.value = preset.tone;
  tone.Q.value = 6;
  wet.gain.value = preset.delay > 0 ? 0.42 : 0;
  dry.gain.value = 0.82;
  delay.delayTime.value = preset.delay;
  feedback.gain.value = preset.feedback;
  tremoloGain.gain.value = 1 - preset.tremolo / 2;
  tremoloOsc.type = 'sine';
  tremoloOsc.frequency.value = 5.8;
  tremoloDepth.gain.value = preset.tremolo;

  effectInput.connect(drive);
  drive.connect(tone);
  tone.connect(dry);
  tone.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wet);
  dry.connect(tremoloGain);
  wet.connect(tremoloGain);
  tremoloOsc.connect(tremoloDepth);
  tremoloDepth.connect(tremoloGain.gain);
  tremoloGain.connect(masterGain);
  tremoloOsc.start();

  effectNodes.push(drive, tone, wet, dry, delay, feedback, tremoloGain, tremoloOsc, tremoloDepth);
}

function createDriveCurve(amount) {
  const sampleCount = 44100;
  const curve = new Float32Array(sampleCount);
  const deg = Math.PI / 180;

  for (let i = 0; i < sampleCount; i += 1) {
    const x = (i * 2) / sampleCount - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }

  return curve;
}

function playString(string, options = {}) {
  ensureAudio();

  if (!audioContext || !effectInput) return;

  playInstrumentTone(string.frequency, selectedInstrument.value, effectInput);
  markActive(string.key);

  if (options.record !== false) {
    recordNote(string.key);
  }
}

function playInstrumentTone(frequency, instrument, destination) {
  const now = audioContext.currentTime;
  const body = audioContext.createOscillator();
  const overtone = audioContext.createOscillator();
  const shimmer = audioContext.createOscillator();
  const bodyGain = audioContext.createGain();
  const overtoneGain = audioContext.createGain();
  const shimmerGain = audioContext.createGain();
  const pluckGain = audioContext.createGain();
  const pluckFilter = audioContext.createBiquadFilter();
  const filter = audioContext.createBiquadFilter();
  const output = audioContext.createGain();
  const isElectric = instrument.id === 'electric';
  const isBass = instrument.id === 'bass';
  const peak = Math.max(volume.value * (instrument.level || 0.8), 0.001);
  const toneFrequency = isElectric ? selectedPreset.value.tone : instrument.filter;

  body.type = instrument.waveform;
  body.frequency.setValueAtTime(frequency, now);
  body.detune.setValueAtTime(isBass ? -2 : -4, now);
  overtone.type = isBass ? 'triangle' : 'sine';
  overtone.frequency.setValueAtTime(frequency * (isBass ? 1.01 : 1.005), now);
  overtone.detune.setValueAtTime(isBass ? 3 : 5, now);
  shimmer.type = 'sine';
  shimmer.frequency.setValueAtTime(frequency * (isBass ? 2 : 2.01), now);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(toneFrequency, now);
  filter.frequency.exponentialRampToValueAtTime(Math.max(toneFrequency * 0.58, 180), now + instrument.decay);
  filter.Q.setValueAtTime(isElectric ? 1.8 : isBass ? 1.2 : 1.6, now);

  bodyGain.gain.setValueAtTime(0.0001, now);
  bodyGain.gain.exponentialRampToValueAtTime(peak, now + instrument.attack);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + instrument.decay);
  overtoneGain.gain.setValueAtTime(0.0001, now);
  overtoneGain.gain.exponentialRampToValueAtTime(peak * (isBass ? 0.32 : 0.42), now + instrument.attack + 0.004);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + instrument.decay * 0.82);
  shimmerGain.gain.setValueAtTime(0.0001, now);
  shimmerGain.gain.exponentialRampToValueAtTime(peak * (isElectric ? 0.18 : 0.12), now + 0.012);
  shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + instrument.decay * 0.38);
  output.gain.value = isBass ? 0.92 : 0.76;

  body.connect(bodyGain);
  overtone.connect(overtoneGain);
  shimmer.connect(shimmerGain);
  bodyGain.connect(filter);
  overtoneGain.connect(filter);
  shimmerGain.connect(filter);
  filter.connect(output);
  output.connect(destination);

  const pluckSource = createPluckSource();
  if (pluckSource) {
    pluckFilter.type = isBass ? 'bandpass' : 'highpass';
    pluckFilter.frequency.value = isBass ? 720 : isElectric ? 2600 : 1800;
    pluckFilter.Q.value = isBass ? 0.7 : 1.1;
    pluckGain.gain.setValueAtTime(0.0001, now);
    pluckGain.gain.exponentialRampToValueAtTime(peak * instrument.pick, now + 0.003);
    pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
    pluckSource.connect(pluckFilter);
    pluckFilter.connect(pluckGain);
    pluckGain.connect(destination);
    pluckSource.start(now);
    pluckSource.stop(now + 0.04);
  }

  body.start(now);
  overtone.start(now);
  shimmer.start(now);
  body.stop(now + instrument.decay + 0.05);
  overtone.stop(now + instrument.decay + 0.05);
  shimmer.stop(now + instrument.decay * 0.5);
}

function createPluckSource() {
  if (!audioContext) return null;

  const length = Math.floor(audioContext.sampleRate * 0.045);
  const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  const source = audioContext.createBufferSource();

  for (let i = 0; i < length; i += 1) {
    const fade = 1 - i / length;
    data[i] = (Math.random() * 2 - 1) * fade;
  }

  source.buffer = buffer;
  return source;
}

function playBassTone(noteLabel) {
  ensureAudio();
  const frequency = noteToFrequency(noteLabel);
  const bassInstrument = instruments.find((instrument) => instrument.id === 'bass');
  if (frequency && bassInstrument && effectInput) {
    playInstrumentTone(frequency, bassInstrument, effectInput);
  }
}

function noteToFrequency(noteLabel) {
  const notes = {
    E1: 41.2,
    G1: 49.0,
    A1: 55.0,
    B1: 61.74,
    D2: 73.42,
    G2: 98.0,
  };
  return notes[noteLabel];
}

function playChord(chord) {
  const availableStrings = selectedInstrumentId.value === 'bass' ? guitarStrings : playableStrings.value;
  chord.keys.forEach((key, index) => {
    const string = availableStrings.find((item) => item.key === key);
    if (string) {
      window.setTimeout(() => playString(string), index * 28);
    }
  });
}

function recordNote(key) {
  if (!isRecording.value || !audioContext) return;

  const time = Math.max(0, audioContext.currentTime - recordingStartTime);
  recordedEvents.value = [
    ...recordedEvents.value,
    {
      key,
      time: loopPlaying.value ? (audioContext.currentTime - loopStartTime) % loopDuration.value : time,
      instrumentId: selectedInstrumentId.value,
      ampPresetId: ampPresetId.value,
    },
  ].sort((a, b) => a.time - b.time);
}

function markActive(key) {
  activeStrings.value = new Set([...activeStrings.value, key]);
  window.setTimeout(() => {
    const next = new Set(activeStrings.value);
    next.delete(key);
    activeStrings.value = next;
  }, 180);
}

function handleStringHover(string, event) {
  if (isStrumming) return;

  if (event.buttons === 1 || event.pointerType === 'touch') {
    playString(string);
  }
}

function startStringGesture(string, event) {
  isStrumming = true;
  lastStrummedKey = string.key;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  playString(string);
}

function handleStagePointerMove(event) {
  if (!isStrumming) return;

  const stringElement = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('.string');
  const key = stringElement?.dataset?.stringKey;
  if (!key || key === lastStrummedKey) return;

  const string = playableStrings.value.find((item) => item.key === key);
  if (string) {
    lastStrummedKey = key;
    playString(string);
  }
}

function stopStringGesture() {
  isStrumming = false;
  lastStrummedKey = '';
}

function handleKeydown(event) {
  if (event.repeat) return;

  const string = playableStrings.value.find((item) => item.key.toLowerCase() === event.key.toLowerCase());
  if (string) {
    event.preventDefault();
    playString(string);
  }

  if (event.code === 'Space') {
    event.preventDefault();
    toggleLoop();
  }
}

function toggleMetronome() {
  ensureAudio();
  metronomeEnabled.value = !metronomeEnabled.value;
  syncRhythmTimer();
}

function toggleBassBacking() {
  ensureAudio();
  bassBackingEnabled.value = !bassBackingEnabled.value;
  syncRhythmTimer();
}

function toggleDrums() {
  ensureAudio();
  drumsEnabled.value = !drumsEnabled.value;
  syncRhythmTimer();
}

function syncRhythmTimer() {
  window.clearInterval(rhythmTimer);

  if (!metronomeEnabled.value && !bassBackingEnabled.value && !drumsEnabled.value) {
    rhythmStep.value = 0;
    currentBeat.value = 1;
    return;
  }

  tickRhythm();
  rhythmTimer = window.setInterval(tickRhythm, (60 / bpm.value / 2) * 1000);
}

function tickRhythm() {
  const step = rhythmStep.value % 8;
  currentBeat.value = Math.floor(step / 2) + 1;

  if (metronomeEnabled.value && step % 2 === 0) {
    playMetronomeClick(currentBeat.value);
  }

  if (bassBackingEnabled.value) {
    const note = bassPattern.value.steps[step];
    if (note) {
      playBassTone(note);
    }
  }

  if (drumsEnabled.value) {
    drumPattern.value.steps[step].forEach(playDrum);
  }

  rhythmStep.value = (step + 1) % 8;
}

function playMetronomeClick(beat) {
  if (!audioContext || !masterGain) return;

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = 'square';
  oscillator.frequency.value = beat === 1 ? 1200 : 760;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
  oscillator.connect(gain);
  gain.connect(masterGain);
  oscillator.start(now);
  oscillator.stop(now + 0.08);
}

function playDrum(type) {
  if (!audioContext || !drumGain) return;

  if (type === 'kick') {
    playKick();
    return;
  }

  if (type === 'snare') {
    playSnare();
    return;
  }

  playHat();
}

function playKick() {
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(140, now);
  oscillator.frequency.exponentialRampToValueAtTime(45, now + 0.14);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.9, now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  oscillator.connect(gain);
  gain.connect(drumGain);
  oscillator.start(now);
  oscillator.stop(now + 0.22);
}

function playSnare() {
  const now = audioContext.currentTime;
  const bufferSize = audioContext.sampleRate * 0.18;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  source.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.34, now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(drumGain);
  source.start(now);
  source.stop(now + 0.18);
}

function playHat() {
  const now = audioContext.currentTime;
  const bufferSize = audioContext.sampleRate * 0.055;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  source.buffer = buffer;
  filter.type = 'highpass';
  filter.frequency.value = 6000;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.048);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(drumGain);
  source.start(now);
  source.stop(now + 0.06);
}

function toggleRecording() {
  ensureAudio();

  if (isRecording.value) {
    isRecording.value = false;
    overdubEnabled.value = false;
    return;
  }

  if (!loopPlaying.value) {
    recordedEvents.value = [];
  }

  recordingStartTime = audioContext.currentTime;
  isRecording.value = true;
}

function toggleLoop() {
  if (!recordedEvents.value.length) return;
  ensureAudio();

  if (loopPlaying.value) {
    stopLoop();
    return;
  }

  loopPlaying.value = true;
  loopStartTime = audioContext.currentTime;
  playLoopPass();
  loopTimer = window.setInterval(playLoopPass, loopDuration.value * 1000);
}

function playLoopPass() {
  recordedEvents.value.forEach((event) => {
    window.setTimeout(() => {
      const previousInstrument = selectedInstrumentId.value;
      const previousPreset = ampPresetId.value;
      selectedInstrumentId.value = event.instrumentId;
      ampPresetId.value = event.ampPresetId;
      const stringSet = event.instrumentId === 'bass' ? bassStrings : guitarStrings;
      const string = stringSet.find((item) => item.key === event.key);

      if (string) {
        playString(string, { record: false });
      }

      selectedInstrumentId.value = previousInstrument;
      ampPresetId.value = previousPreset;
    }, event.time * 1000);
  });
}

function stopLoop() {
  loopPlaying.value = false;
  overdubEnabled.value = false;
  isRecording.value = false;
  window.clearInterval(loopTimer);
}

function toggleOverdub() {
  if (!loopPlaying.value) return;
  overdubEnabled.value = !overdubEnabled.value;
  isRecording.value = overdubEnabled.value;
  recordingStartTime = loopStartTime;
}

function clearLoop() {
  stopLoop();
  recordedEvents.value = [];
}

function toggleMixRecording() {
  if (mixRecording.value) {
    stopMixRecording();
    return;
  }

  startMixRecording();
}

function startMixRecording() {
  ensureAudio();

  if (!recorderDestination || typeof MediaRecorder === 'undefined') {
    mixRecorderSupported.value = false;
    return;
  }

  const mimeType = getRecorderMimeType();
  const options = mimeType ? { mimeType } : undefined;

  clearMixRecording();
  mixChunks = [];

  try {
    mediaRecorder = new MediaRecorder(recorderDestination.stream, options);
  } catch {
    mixRecorderSupported.value = false;
    return;
  }

  mediaRecorder.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0) {
      mixChunks.push(event.data);
    }
  });

  mediaRecorder.addEventListener('stop', () => {
    const blob = new Blob(mixChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
    mixAudioUrl.value = URL.createObjectURL(blob);
    mixRecording.value = false;
  });

  mediaRecorder.start();
  mixRecording.value = true;
}

function stopMixRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  mixRecording.value = false;
}

function clearMixRecording() {
  if (mixAudioUrl.value) {
    URL.revokeObjectURL(mixAudioUrl.value);
    mixAudioUrl.value = '';
  }
}

function getRecorderMimeType() {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

watch(volume, (nextVolume) => {
  if (masterGain) {
    masterGain.gain.value = nextVolume;
  }
});

watch(ampPresetId, rebuildEffects);

watch(bpm, () => {
  syncRhythmTimer();
});

watch([bassPatternId, drumPatternId], () => {
  rhythmStep.value = 0;
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.clearInterval(rhythmTimer);
  window.clearInterval(loopTimer);
  stopMixRecording();
  clearMixRecording();
  audioContext?.close();
});
</script>
