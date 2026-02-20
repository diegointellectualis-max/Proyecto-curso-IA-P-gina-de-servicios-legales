
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Icons } from '../constants';
import { ChatMessage } from '../types';

// Helper for Base64 and Audio decoding/encoding
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

const AmeliaAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<string>('Esperando...');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Refs to manage transcription state and avoid stale closures in callbacks
  const isMutedRef = useRef(isMuted);
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = useCallback((role: 'user' | 'amelia', text: string) => {
    setMessages(prev => [...prev, { role, text }]);
  }, []);

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

      // Create a new GoogleGenAI instance right before making an API call
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
            addMessage('amelia', 'Hola, soy Amelia, asistente virtual de Ingenio Servicios Legales. ¿En qué puedo ayudarte hoy?');
            
            const source = inCtx.createMediaStreamSource(stream);
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              // Check mute state using ref to avoid stale closure
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
              // Always use sessionPromise to ensure valid reference
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Process model audio output bytes
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outCtx.destination);
              
              // Schedule playback to ensure gapless audio
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
            }

            // Accumulate transcriptions to avoid showing multiple partial messages
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscription.current += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              currentInputTranscription.current += message.serverContent.inputTranscription.text;
            }

            // Finalize chat message on turn completion
            if (message.serverContent?.turnComplete) {
              if (currentInputTranscription.current) {
                addMessage('user', currentInputTranscription.current);
                currentInputTranscription.current = '';
              }
              if (currentOutputTranscription.current) {
                addMessage('amelia', currentOutputTranscription.current);
                currentOutputTranscription.current = '';
              }
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error(e);
            setStatus('Error de conexión');
            stopCall();
          },
          onclose: () => {
            setStatus('Sesión cerrada');
            stopCall();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `Eres Amelia, asistente virtual de Ingenio Servicios Legales. 
          Hablas en español neutro, tono profesional y cercano. 
          Tu función es orientar sobre insolvencia, urbanismo y trámites notariales en Colombia. 
          Pide permiso antes de solicitar datos sensibles. 
          Ofrece pasos claros y propone agendar una cita cuando sea necesario.
          Identidad: Mujer de 28 años, clara, profesional y empática.`,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error(err);
      setStatus('No fue posible iniciar la llamada');
      setIsCalling(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    addMessage('user', text);
    setInputValue('');
    
    // Send via session promise if active to avoid stale references
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        session.sendRealtimeInput({
          // Note: Standard Live API primarily uses audio input; sending text via parts if supported.
          parts: [{ text: text }]
        });
      });
    } else {
      // Fallback response if not in a live session
      setTimeout(() => {
        addMessage('amelia', "Entiendo. Para brindarte una respuesta más detallada te sugiero iniciar una llamada o agendar una cita con nuestros expertos.");
      }, 1000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-accentGold rounded-full shadow-2xl flex items-center justify-center text-white transform hover:scale-105 transition-all animate-bounce"
        >
          <Icons.Phone />
        </button>
      )}

      {/* Assistant Widget */}
      {isOpen && (
        <div className="w-[350px] sm:w-[400px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden transform animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-corpBlue p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isCalling ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <div>
                <h4 className="font-title font-bold text-sm">Habla con Amelia</h4>
                <p className="text-[10px] text-gray-300 uppercase tracking-tighter">{status}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded transition-colors">
              <Icons.Close />
            </button>
          </div>

          {/* Consent View */}
          {!hasConsent ? (
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-accentGold/10 rounded-full flex items-center justify-center mx-auto text-accentGold">
                <Icons.Mic />
              </div>
              <p className="text-textSec text-sm leading-relaxed">
                Antes de iniciar, ten en cuenta que esta llamada puede implicar el tratamiento de datos personales conforme a nuestra política de privacidad.
              </p>
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => setHasConsent(true)}
                  className="bg-accentGold hover:bg-amber-600 text-white font-bold py-3 rounded-lg shadow-md transition-all"
                >
                  Aceptar y continuar
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-textSec text-sm font-medium hover:underline"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Chat View */}
              <div className="flex-1 h-[350px] overflow-y-auto p-4 bg-bgGray space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-xs text-gray-400 mt-10">
                    Inicia la llamada o escribe tu pregunta.
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${m.role === 'user' ? 'bg-corpBlueSec text-white' : 'bg-white text-corpBlue'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Controls */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex items-center space-x-2 mb-4">
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe tu pregunta aquí..."
                    className="flex-1 text-sm bg-bgGray px-4 py-2 rounded-full outline-none border border-transparent focus:border-accentGold transition-all"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="bg-accentGold text-white p-2 rounded-full hover:bg-amber-600 transition-colors"
                  >
                    <Icons.Send />
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  {!isCalling ? (
                    <button 
                      onClick={startCall}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg flex items-center justify-center space-x-2 transition-all"
                    >
                      <Icons.Phone />
                      <span>Iniciar llamada</span>
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-2 rounded-lg border ${isMuted ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}
                      >
                        {isMuted ? <Icons.MicOff /> : <Icons.Mic />}
                      </button>
                      <button 
                        onClick={stopCall}
                        className="flex-1 mx-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg flex items-center justify-center space-x-2 transition-all"
                      >
                        <Icons.Close />
                        <span>Finalizar</span>
                      </button>
                    </>
                  )}
                </div>
                <p className="text-[9px] text-gray-400 text-center mt-3 uppercase tracking-tighter">
                  Este servicio está impulsado por modelos de Gemini Live.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AmeliaAssistant;
