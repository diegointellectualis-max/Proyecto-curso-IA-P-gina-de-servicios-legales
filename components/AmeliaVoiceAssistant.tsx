
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Icons } from '../constants';

// Audio Helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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

const AmeliaVoiceAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<string>('Esperando...');
  
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const stopCall = useCallback(() => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
      sessionPromiseRef.current = null;
    }
    if (audioContextInRef.current) audioContextInRef.current.close();
    if (audioContextOutRef.current) audioContextOutRef.current.close();
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsCalling(false);
    setStatus('Llamada finalizada');
  }, []);

  const startCall = async () => {
    if (!process.env.API_KEY) {
      setStatus('Error: Sin API Key');
      return;
    }

    try {
      setStatus('Conectando...');
      setIsCalling(true);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextOutRef.current = outCtx;
      audioContextInRef.current = inCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('En llamada con Amelia');
            // Audio streaming setup
            const source = inCtx.createMediaStreamSource(stream);
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (isMutedRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000'
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error(e);
            stopCall();
          },
          onclose: () => {
            stopCall();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `Eres Amelia, asistente virtual de Ingenio Servicios Legales. 
          Hablas en español neutro, tono profesional y cercano. 
          Identidad: mujer de 28 años.
          Presentación inicial obligatoria: "Hola, soy Amelia, asistente virtual de Ingenio Servicios Legales. ¿En qué puedo ayudarte hoy?"
          ALCANCE TEMÁTICO:
          1) Insolvencia de persona natural no comerciante y pequeños comerciantes.
          2) Licencias urbanísticas y procesos sancionatorios.
          3) Trámites notariales con escritura pública.
          4) Información de contacto y agendamiento de citas.
          Si preguntan temas ajenos, declina cortésmente y ofrece agendar consulta para orientar dentro de esas líneas.
          Pide permiso antes de solicitar datos sensibles. Explica términos jurídicos en lenguaje claro.`,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          }
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
      setIsCalling(false);
      setStatus('Error al conectar');
    }
  };

  const handleToggleOpen = () => {
    if (isOpen) {
      stopCall();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[10000]">
      {/* Floating Button A: Voice */}
      {!isOpen && (
        <button 
          onClick={handleToggleOpen}
          className="w-16 h-16 bg-accentGold rounded-full shadow-2xl flex items-center justify-center text-white transform hover:scale-105 transition-all animate-bounce"
        >
          <Icons.Phone />
        </button>
      )}

      {/* Voice Widget */}
      {isOpen && (
        <div className="w-[300px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden transform animate-in slide-in-from-bottom-4">
          <div className="bg-accentGold p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <Icons.Phone />
              <h4 className="font-title font-bold text-sm">Llamada con Amelia</h4>
            </div>
            <button onClick={handleToggleOpen}><Icons.Close /></button>
          </div>

          {!hasConsent ? (
            <div className="p-6 text-center space-y-4">
              <p className="text-xs text-textSec leading-relaxed">
                Antes de iniciar, ten en cuenta que esta llamada puede implicar el tratamiento de datos personales conforme a nuestra política de privacidad.
              </p>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => setHasConsent(true)}
                  className="bg-accentGold hover:bg-amber-600 text-white font-bold py-2 rounded-lg text-sm transition-all"
                >
                  Aceptar y continuar
                </button>
                <button onClick={() => setIsOpen(false)} className="text-xs text-textSec hover:underline">Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="p-6 flex flex-col items-center space-y-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isCalling ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <Icons.Mic />
              </div>
              <p className="text-xs font-bold text-corpBlue uppercase tracking-widest">{status}</p>
              
              <div className="flex w-full space-x-2">
                {!isCalling ? (
                  <button 
                    onClick={startCall}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all"
                  >
                    <Icons.Phone />
                    <span>Llamar a Amelia</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3 rounded-xl border ${isMuted ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}
                    >
                      {isMuted ? <Icons.MicOff /> : <Icons.Mic />}
                    </button>
                    <button 
                      onClick={stopCall}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all"
                    >
                      <Icons.Phone />
                      <span>Finalizar</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          <p className="text-[8px] text-gray-400 text-center pb-4 uppercase tracking-tighter">
            Este servicio de atención por voz está impulsado por modelos de Gemini Live.
          </p>
        </div>
      )}
    </div>
  );
};

export default AmeliaVoiceAssistant;
