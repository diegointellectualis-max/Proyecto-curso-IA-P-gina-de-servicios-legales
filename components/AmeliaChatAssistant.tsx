
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Icons } from '../constants';
import { ChatMessage } from '../types';

const AmeliaChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInstanceRef = useRef<any>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const initChat = () => {
    if (!process.env.API_KEY) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatInstanceRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `Eres Amelia, asistente virtual de texto de Ingenio Servicios Legales.
        Tu tono es profesional, empático, claro y cercano.
        ALCANCE TEMÁTICO:
        1) Insolvencia de persona natural no comerciante y pequeños comerciantes.
        2) Licencias urbanísticas y procesos sancionatorios.
        3) Trámites notariales.
        4) Datos de contacto y agendamiento de citas.
        Si el usuario consulta algo ajeno, limítate con cortesía a los servicios de la firma.
        Pide permiso antes de solicitar datos personales sensibles.
        Siempre respondes en español por defecto.`,
      },
    });
    // Initial greeting message only once
    if (messages.length === 0) {
      setMessages([{ role: 'amelia', text: 'Hola, soy Amelia, asistente virtual de Ingenio Servicios Legales. ¿En qué puedo ayudarte hoy?' }]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    const userText = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    
    if (!chatInstanceRef.current) initChat();
    
    setIsTyping(true);
    try {
      const result = await chatInstanceRef.current.sendMessage({ message: userText });
      const ameliaResponse = result.text;
      setMessages(prev => [...prev, { role: 'amelia', text: ameliaResponse }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'amelia', text: "Lo siento, hubo un problema al procesar tu solicitud. Por favor intenta de nuevo o contáctanos por WhatsApp." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-[96px] right-6 z-[10000]">
      {/* Floating Button B: Chat */}
      {!isOpen && (
        <button 
          onClick={() => { setIsOpen(true); if (!chatInstanceRef.current) initChat(); }}
          className="w-16 h-16 bg-corpBlue rounded-full shadow-2xl flex items-center justify-center text-white transform hover:scale-105 transition-all"
        >
          <Icons.ChatBubble />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="w-[350px] sm:w-[380px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden transform animate-in slide-in-from-bottom-4">
          <div className="bg-corpBlue p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h4 className="font-title font-bold text-sm">Chat con Amelia</h4>
                <p className="text-[10px] text-gray-300 uppercase tracking-widest">En línea</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}><Icons.Close /></button>
          </div>

          <div className="h-[350px] overflow-y-auto p-4 bg-bgGray space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${m.role === 'user' ? 'bg-corpBlueSec text-white rounded-tr-none' : 'bg-white text-corpBlue rounded-tl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe tu pregunta aquí..."
                className="flex-1 bg-bgGray px-4 py-2 rounded-full text-sm outline-none border border-transparent focus:border-corpBlue transition-all"
              />
              <button 
                onClick={handleSendMessage}
                disabled={isTyping}
                className="bg-corpBlue text-white p-2 rounded-full hover:bg-corpBlueSec transition-all disabled:opacity-50"
              >
                <Icons.Send />
              </button>
            </div>
            <p className="text-[8px] text-gray-400 text-center mt-3 uppercase tracking-tighter leading-tight">
              Asistente de texto alineado con los servicios de Ingenio Servicios Legales.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmeliaChatAssistant;
