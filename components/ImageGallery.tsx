
import React, { useState, useEffect, useRef } from 'react';

const IMAGES = [
  "https://ugfjgtmbcaltsaqgxpbb.supabase.co/storage/v1/object/public/imagenes%20pagina%20de%20servicios%20legales/35f7fff7-e503-417a-affb-993c14b23821.jpg",
  "https://ugfjgtmbcaltsaqgxpbb.supabase.co/storage/v1/object/public/imagenes%20pagina%20de%20servicios%20legales/46b4fa72-a071-4612-afca-aa55dcf2ea3b.jpg",
  "https://ugfjgtmbcaltsaqgxpbb.supabase.co/storage/v1/object/public/imagenes%20pagina%20de%20servicios%20legales/8571857d-0b4b-49a8-995c-3535cf954f28.jpg",
  "https://ugfjgtmbcaltsaqgxpbb.supabase.co/storage/v1/object/public/imagenes%20pagina%20de%20servicios%20legales/8e612205-97c2-4f14-a081-6646a811262d.jpg",
  "https://ugfjgtmbcaltsaqgxpbb.supabase.co/storage/v1/object/public/imagenes%20pagina%20de%20servicios%20legales/a982f8f9-4def-4036-ab7c-840dabd9471d.jpg",
  "https://ugfjgtmbcaltsaqgxpbb.supabase.co/storage/v1/object/public/imagenes%20pagina%20de%20servicios%20legales/b181911e-2b95-475a-92bc-1ce54c4790c9.jpg",
  "https://ugfjgtmbcaltsaqgxpbb.supabase.co/storage/v1/object/public/imagenes%20pagina%20de%20servicios%20legales/fdb3b1c8-e57d-461e-b959-858525f9bbed.jpg"
];

const ImageGallery: React.FC = () => {
  const [speed, setSpeed] = useState(0.8);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);

  const animate = () => {
    if (scrollRef.current) {
      // Movimiento de derecha a izquierda (offset negativo)
      offsetRef.current -= speed;
      
      // Lógica de bucle infinito: 
      // Calculamos el ancho de un solo set de imágenes.
      // Como usamos 3 sets ([...IMAGES, ...IMAGES, ...IMAGES]), 
      // reseteamos cuando hayamos desplazado exactamente un tercio del total.
      const totalWidth = scrollRef.current.scrollWidth;
      const oneThirdWidth = totalWidth / 3;

      if (Math.abs(offsetRef.current) >= oneThirdWidth) {
        offsetRef.current = 0;
      }
      
      scrollRef.current.style.transform = `translateX(${offsetRef.current}px)`;
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [speed]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const { left, width } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const percentage = x / width;

    if (percentage < 0.25) {
      // Margen izquierdo: Aumenta velocidad (flujo rápido hacia la izquierda)
      setSpeed(5);
    } else if (percentage > 0.75) {
      // Margen derecho: Aumenta velocidad
      setSpeed(5);
    } else {
      // Centro: Detiene el movimiento
      setSpeed(0);
    }
  };

  const handleMouseLeave = () => {
    // Velocidad normal fluida al salir
    setSpeed(0.8);
  };

  return (
    <section className="py-20 bg-bgGray overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <h2 className="text-3xl font-title font-bold text-corpBlue border-l-8 border-accentGold pl-6 uppercase tracking-tight">
          Nuestra Trayectoria y Respaldo
        </h2>
        <p className="mt-2 text-textSec font-medium">Desliza el cursor a los lados para acelerar o al centro para observar detenidamente.</p>
      </div>
      
      <div 
        ref={containerRef}
        className="relative w-full overflow-hidden cursor-move py-4"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          ref={scrollRef}
          className="flex whitespace-nowrap will-change-transform"
          style={{ gap: '1.5rem' }}
        >
          {/* Triplicamos el set para asegurar que nunca haya espacios vacíos en ninguna resolución */}
          {[...IMAGES, ...IMAGES, ...IMAGES].map((src, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 inline-block transition-transform duration-500 hover:scale-[1.02]"
            >
              <img 
                src={src} 
                alt={`Documentación Ingenio ${index}`}
                className="h-[450px] w-auto object-contain bg-white rounded-2xl shadow-xl border border-gray-200"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Indicadores visuales de área de interacción */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-bgGray via-bgGray/40 to-transparent pointer-events-none z-10"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-bgGray via-bgGray/40 to-transparent pointer-events-none z-10"></div>
      </div>
    </section>
  );
};

export default ImageGallery;
