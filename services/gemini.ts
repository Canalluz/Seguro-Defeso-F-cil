import { GoogleGenAI, Modality } from "@google/genai";

// Safe way to get API Key in Vite/Vercel
const apiKey = (typeof process !== 'undefined' ? process.env?.API_KEY : null) ||
  (import.meta as any).env?.VITE_GEMINI_API_KEY ||
  "";

const ai = new GoogleGenAI({ apiKey });

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

let globalAudioContext: AudioContext | null = null;

// Cache for TTS responses
const audioCache = new Map<string, AudioBuffer>();

export const speakExplanation = async (text: string) => {
  try {
    if (!globalAudioContext) {
      globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    if (globalAudioContext.state === 'suspended') {
      await globalAudioContext.resume();
    }

    let audioBuffer = audioCache.get(text);

    if (!audioBuffer) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Fale de forma RÁPIDA, clara e simples para o pescador: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio && globalAudioContext) {
        audioBuffer = await decodeAudioData(
          decode(base64Audio),
          globalAudioContext,
          24000,
          1,
        );
        audioCache.set(text, audioBuffer);
      }
    }

    if (audioBuffer && globalAudioContext) {
      const source = globalAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(globalAudioContext.destination);
      source.start();

      return new Promise((resolve) => {
        source.onended = resolve;
      });
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
};
