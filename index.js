(async function() {
  const AUDIO_FILE = 'audio/trumpet.mp3';

  const context = new AudioContext();

  function splitNotes(buffer, noteLength, noteCount, offset = 0) {
    const result = [];
    const channels = buffer.numberOfChannels;
    const samplesPerNote = Math.round(noteLength * buffer.sampleRate);
    const offsetSamples = Math.round(offset * buffer.sampleRate);
    const tempBuf = new Float32Array(samplesPerNote);

    for (let i = 0; i < noteCount; i++) {
      result[i] = context.createBuffer(
        channels,
        buffer.numberOfChannels * samplesPerNote,
        buffer.sampleRate
      );
      for (let channel = 0; channel < channels; channel++) {
        buffer.copyFromChannel(
          tempBuf,
          channel,
          i * samplesPerNote + offsetSamples
        );
        result[i].copyToChannel(tempBuf, channel, 0);
      }
    }

    return result;
  }

  const response = await window.fetch(AUDIO_FILE);
  const arrayBuffer = await response.arrayBuffer();
  const trumpetBuffer = await context.decodeAudioData(arrayBuffer);
  const notes = splitNotes(trumpetBuffer, 4, 43, 0);

  function play(audioBuffer) {
    const sourceNode = context.createBufferSource();
    const gainNode = context.createGain();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(gainNode);
    gainNode.connect(context.destination);
    sourceNode.start();
    return gainNode;
  }

  async function delay(seconds) {
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  async function playNote(note, seconds) {
    const octave = parseInt(note[note.length - 1]) + 1;
    const noteIdx = 'C,C#,D,D#,E,F,F#,G,G#,A,A#,B'
      .split(',')
      .indexOf(note.substr(0, note.length - 1));
    const idx = octave * 12 + noteIdx;
    const gainNode = play(notes[idx - 54]);
    await delay(seconds);
    gainNode.gain.exponentialRampToValueAtTime(
      0.00001,
      context.currentTime + 0.1
    );
  }

  async function melody() {
    const whole = 1;
    await playNote('A#4', whole);
    await playNote('F5', whole);
    await playNote('D#5', whole / 8);
    await delay(whole / 16);
    await playNote('D5', whole / 8);
    await playNote('C5', whole / 8);
    await delay(whole / 16);
    await playNote('A#5', whole);
    await playNote('F5', whole / 2);
    await playNote('D#5', whole / 8);
    await delay(whole / 16);
    await playNote('D5', whole / 8);
    await playNote('C5', whole / 8);
    await delay(whole / 16);
    await playNote('A#5', whole);
    await playNote('F5', whole / 2);
    await playNote('D#5', whole / 8);
    await delay(whole / 16);
    await playNote('D5', whole / 8);
    await playNote('D#5', whole / 8);
    await playNote('C5', whole);
  }

  window.notes = notes;
  window.play = play;

  const playButton = document.querySelector('#playButton');
  playButton.disabled = false;
  playButton.onclick = melody;
})();
