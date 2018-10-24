(async function() {
  const AUDIO_FILE = 'audio/trumpet.mp3';

  const context = new AudioContext();

  function splitNotes(buffer, sampleLength, sampleCount, offset = 0) {
    const result = [];
    const channels = buffer.numberOfChannels;
    const sampleFrames = Math.round(sampleLength * buffer.sampleRate);
    const offsetFrames = Math.round(offset * buffer.sampleRate);
    const tempBuf = new Float32Array(sampleFrames);

    for (let i = 0; i < sampleCount; i++) {
      result[i] = context.createBuffer(
        channels,
        buffer.numberOfChannels * sampleFrames,
        buffer.sampleRate
      );
      for (let channel = 0; channel < channels; channel++) {
        buffer.copyFromChannel(
          tempBuf,
          channel,
          i * sampleFrames + offsetFrames
        );
        result[i].copyToChannel(tempBuf, channel, 0);
      }
    }

    return result;
  }

  const response = await window.fetch(AUDIO_FILE);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await context.decodeAudioData(arrayBuffer);
  const trumpetBuffer = audioBuffer;
  const notes = splitNotes(trumpetBuffer, 4, 43, 0);

  function play(audioBuffer) {
    const source = context.createBufferSource();
    const gainNode = context.createGain();
    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.connect(context.destination);
    source.start();
    return gainNode;
  }

  async function playNote(note, length) {
    const octave = parseInt(note[note.length - 1]) + 1;
    const noteIdx = 'C,C#,D,D#,E,F,F#,G,G#,A,A#,B'
      .split(',')
      .indexOf(note.substr(0, note.length - 1));
    const idx = octave * 12 + noteIdx;
    const gainNode = play(notes[idx - 54]);
    await new Promise(resolve => setTimeout(resolve, length * 1000));
    gainNode.gain.exponentialRampToValueAtTime(
      0.00001,
      context.currentTime + 0.1
    );
  }

  async function delay(length) {
    await new Promise(resolve => setTimeout(resolve, length * 1000));
  }

  async function melody() {
    const whole = 0.5;
    await playNote('E4', whole / 2);
    await delay(whole / 16);
    await playNote('F4', whole / 2);
    await delay(whole / 16);
    await playNote('G4', whole / 2);
    await delay(whole / 16);
    await playNote('F4', whole / 2);
    await delay(whole / 16);
    await playNote('E4', whole / 2);
    await delay(whole / 16);
    await playNote('D4', whole / 2);
    await delay(whole / 16);
    await playNote('E4', whole / 4);
    await playNote('F4', whole / 4);
    await playNote('E4', whole / 4);
    await playNote('D4', whole / 4);
    await playNote('E4', whole);
  }

  window.notes = notes;
  window.play = play;

  const playButton = document.querySelector('#playButton');
  playButton.disabled = false;
  playButton.onclick = melody;
})();
