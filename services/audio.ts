// Simple synthesized sounds using Web Audio API to avoid loading external files
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

const playTone = (freq: number, type: OscillatorType, duration: number, startTime = 0) => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);

    gain.gain.setValueAtTime(0.1, audioCtx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(audioCtx.currentTime + startTime);
    osc.stop(audioCtx.currentTime + startTime + duration);
};

export const playClick = () => {
    playTone(600, 'sine', 0.1);
};

export const playSuccess = () => {
    playTone(440, 'sine', 0.1);
    playTone(554, 'sine', 0.1, 0.1); // C#
    playTone(659, 'sine', 0.2, 0.2); // E
};

export const playError = () => {
    playTone(150, 'sawtooth', 0.2);
    playTone(100, 'sawtooth', 0.2, 0.1);
};
