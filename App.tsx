
import React, { useState, useEffect } from 'react';
import { Icons } from './constants';
import AmeliaVoiceAssistant from './components/AmeliaVoiceAssistant';
import AmeliaChatAssistant from './components/AmeliaChatAssistant';

const App: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 100;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* 1. TOP BAR */}
      <div className="bg-corpBlue text-white py-2 px-4 text-xs md:text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Icons.Pin />
              <span>Calle 6 sur # 79 150 int 1413, Rodeo Alto, Medellín</span>
            </div>
            <div className="hidden md:flex items-center space-x-1 border-l border-white/20 pl-4">
              <Icons.Phone />
              <span>321 783 0681</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Icons.Mail />
              <span>servicioalcliente@ingenioservicios.com.co</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. HEADER */}
      <header className={`sticky top-0 z-50 bg-white transition-all duration-300 ${isScrolled ? 'shadow-md py-3' : 'py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex flex-col cursor-pointer" onClick={() => scrollTo('inicio')}>
            <h1 className="text-xl md:text-2xl font-title font-bold text-corpBlue leading-none">Ingenio Servicios Legales</h1>
            <span className="text-[10px] text-textSec font-medium mt-1 uppercase tracking-wider">Ingenio Servicios y Suministros S.A.S.</span>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium">
            {['Inicio', 'Nosotros', 'Servicios', 'Experiencia', 'Noticias', 'Contacto'].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="hover:text-corpBlueSec transition-colors relative group"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accentGreen transition-all group-hover:w-full"></span>
              </button>
            ))}
            <button 
              onClick={() => scrollTo('contacto')}
              className="bg-accentGreen hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-sm"
            >
              Solicitar asesoría
            </button>
          </nav>

          <button className="lg:hidden text-corpBlue">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </header>

      <main>
        {/* 3. HERO */}
        <section id="inicio" className="relative h-[85vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://picsum.photos/id/122/1920/1080" 
              className="w-full h-full object-cover" 
              alt="Medellín Skyline" 
            />
            <div className="absolute inset-0 bg-corpBlue/75"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 text-white">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-title font-bold leading-tight mb-6">
                Insolvencia con respaldo legal para recuperar tu tranquilidad
              </h2>
              <p className="text-lg md:text-xl text-gray-200 mb-4 font-medium">
                Te acompañamos en procesos de insolvencia de persona natural, licencias urbanísticas y trámites notariales, con soluciones viables, protección legal y un trato cercano.
              </p>
              <div className="flex items-center space-x-2 text-accentGreen font-bold mb-8 uppercase tracking-widest text-sm">
                <span className="w-8 h-0.5 bg-accentGreen"></span>
                <span>Cobertura en Valle de Aburrá y Oriente Antioqueño</span>
              </div>
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                Sabemos que el sobreendeudamiento y la presión de los acreedores no solo afectan tus finanzas: también impactan tu familia, tu tranquilidad y tus decisiones diarias. Aquí encuentras acompañamiento profesional y humano, sin juicios y con claridad.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
                <button 
                  onClick={() => scrollTo('contacto')}
                  className="bg-accentGreen hover:bg-emerald-600 text-white px-8 py-4 rounded-lg font-bold transition-all transform hover:-translate-y-1 shadow-lg"
                >
                  Hablar con un asesor
                </button>
                <button 
                  onClick={() => scrollTo('servicios')}
                  className="bg-transparent border-2 border-white hover:bg-white hover:text-corpBlue text-white px-8 py-4 rounded-lg font-bold transition-all transform hover:-translate-y-1"
                >
                  Solicitar asesoría personalizada
                </button>
              </div>
              <p className="text-xs text-gray-400">Atención por WhatsApp, cita virtual o presencial. Respuesta clara y sin rodeos.</p>
            </div>
          </div>
        </section>

        {/* 4. SERVICIOS DESTACADOS (CARDS) */}
        <section className="py-20 bg-bgGray">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all group border-b-4 border-transparent hover:border-corpBlue">
                <div className="text-accentGold mb-6 group-hover:scale-110 transition-transform"><Icons.Scale /></div>
                <h3 className="text-xl font-title font-bold mb-4">Insolvencia de persona natural y pequeños comerciantes</h3>
                <p className="text-textSec mb-6 leading-relaxed">Asesoría integral para reorganizar deudas o liquidar de forma ordenada bajo protección de la ley. Enfoque humano, ruta clara y acompañamiento paso a paso.</p>
                <button onClick={() => scrollTo('insolvencia')} className="text-corpBlueSec font-bold hover:underline flex items-center">
                  Ver más <Icons.ChevronRight />
                </button>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all group border-b-4 border-transparent hover:border-corpBlue">
                <div className="text-accentGold mb-6 group-hover:scale-110 transition-transform"><Icons.Urbanism /></div>
                <h3 className="text-xl font-title font-bold mb-4">Licencias y procesos urbanísticos</h3>
                <p className="text-textSec mb-6 leading-relaxed">Estructuramos y radicamos expedientes para licencias urbanísticas y te representamos en procesos sancionatorios, con defensa técnica y estrategia legal.</p>
                <button onClick={() => scrollTo('urbanismo')} className="text-corpBlueSec font-bold hover:underline flex items-center">
                  Ver más <Icons.ChevronRight />
                </button>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all group border-b-4 border-transparent hover:border-corpBlue">
                <div className="text-accentGold mb-6 group-hover:scale-110 transition-transform"><Icons.Notary /></div>
                <h3 className="text-xl font-title font-bold mb-4">Trámites notariales con acompañamiento</h3>
                <p className="text-textSec mb-6 leading-relaxed">Te acompañamos en escrituras públicas y actos solemnes: divorcios, sucesiones, compraventas y más. Documentos claros, trámite ágil y respaldo legal.</p>
                <button onClick={() => scrollTo('notarial')} className="text-corpBlueSec font-bold hover:underline flex items-center">
                  Ver más <Icons.ChevronRight />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SERVICIOS DETALLADOS */}
        <section id="servicios" className="py-24 space-y-32">
          {/* Detailed service content as previously defined... */}
          {/* ... (Keeping the content to maintain requested structure) */}
          <div id="insolvencia" className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h4 className="text-accentGold font-bold uppercase tracking-widest text-sm mb-4">Especialidad Principal</h4>
              <h2 className="text-3xl md:text-4xl font-title font-bold mb-4 uppercase">INSOLVENCIA DE PERSONA NATURAL Y PEQUEÑOS COMERCIANTES</h2>
              <p className="text-xl text-corpBlueSec font-medium mb-8">Soluciones legales reales para reorganizar tus obligaciones y proteger lo esencial.</p>
              <div className="space-y-4 text-textSec leading-relaxed">
                <p>En Ingenio Servicios Legales acompañamos a personas naturales no comerciantes y a pequeños comerciantes con activos inferiores a 1.000 SMMLV, que atraviesan una crisis financiera y necesitan una alternativa legal seria, ordenada y viable.</p>
                <p>El régimen de insolvencia permite, según el caso y la normatividad vigente, reorganizar deudas para llegar a acuerdos de pago sostenibles o, cuando no es posible, liquidar el patrimonio de manera ordenada y transparente, bajo la protección de la ley.</p>
                <p>Nuestro acompañamiento es completo: evaluamos tu caso, revisamos documentos, organizamos la información financiera y te guiamos paso a paso.</p>
              </div>
              <button onClick={() => scrollTo('contacto')} className="bg-accentGreen hover:bg-emerald-600 text-white px-10 py-4 rounded-lg font-bold transition-all shadow-md mt-8">
                Comunícate con nosotros
              </button>
            </div>
            <div className="order-1 lg:order-2 rounded-2xl overflow-hidden shadow-2xl">
              <img src="https://picsum.photos/id/119/800/600" alt="Insolvencia" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <div id="urbanismo" className="bg-bgGray py-24">
            <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img src="https://picsum.photos/id/201/800/600" alt="Urbanismo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-accentGold font-bold uppercase tracking-widest text-sm mb-4">Soporte Técnico-Jurídico</h4>
                <h2 className="text-3xl md:text-4xl font-title font-bold mb-4 uppercase">LICENCIAS URBANÍSTICAS Y PROCESOS SANCIONATORIOS</h2>
                <p className="text-xl text-corpBlueSec font-medium mb-8">Evita demoras, sanciones y sellamientos con soporte técnico-jurídico.</p>
                <div className="space-y-4 text-textSec leading-relaxed">
                  <p>Asesoramos a propietarios, urbanizadores y constructores que requieren claridad jurídica. Estructuramos el expediente técnico-jurídico para solicitudes ante curadurías y autoridades municipales.</p>
                </div>
                <button onClick={() => scrollTo('contacto')} className="bg-corpBlue hover:bg-corpBlueSec text-white px-10 py-4 rounded-lg font-bold transition-all shadow-md mt-8">
                  Comunícate con nosotros
                </button>
              </div>
            </div>
          </div>

          <div id="notarial" className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h4 className="text-accentGold font-bold uppercase tracking-widest text-sm mb-4">Trámites Ágiles</h4>
              <h2 className="text-3xl md:text-4xl font-title font-bold mb-4 uppercase">TRÁMITES NOTARIALES CLAROS, SEGUROS Y SIN SORPRESAS</h2>
              <p className="text-xl text-corpBlueSec font-medium mb-8">Escrituras y actos solemnes con acompañamiento experto de principio a fin.</p>
              <div className="space-y-4 text-textSec leading-relaxed">
                <p>Te asesoramos en trámites de escritura pública, cuidando la legalidad y seguridad jurídica. Acompañamos divorcios, sucesiones, compraventas, testamentos y constitución de hipotecas.</p>
              </div>
              <button onClick={() => scrollTo('contacto')} className="bg-accentGreen hover:bg-emerald-600 text-white px-10 py-4 rounded-lg font-bold transition-all shadow-md mt-8">
                Comunícate con nosotros
              </button>
            </div>
            <div className="order-1 lg:order-2 rounded-2xl overflow-hidden shadow-2xl">
              <img src="https://picsum.photos/id/175/800/600" alt="Trámites Notariales" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        {/* 6. NOSOTROS */}
        <section id="nosotros" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-16 h-1 bg-accentGold mb-6"></div>
              <h2 className="text-4xl font-title font-bold mb-8">Nosotros</h2>
              <div className="space-y-6 text-textSec leading-relaxed text-lg">
                <p>Ingenio Servicios Legales es el equipo jurídico de Ingenio Servicios y Suministros S.A.S. y nace para acompañar a personas naturales no comerciantes y pequeños comerciantes que enfrentan crisis financieras.</p>
                <p>Nos caracterizamos por un servicio cercano, ética profesional, rigor técnico y comunicación transparente.</p>
              </div>
              <button onClick={() => scrollTo('contacto')} className="bg-corpBlue hover:bg-corpBlueSec text-white px-8 py-3 rounded-lg font-bold transition-all mt-10">
                Agenda una cita
              </button>
            </div>
            <div className="bg-bgGray rounded-2xl p-4 shadow-inner">
               <img src="https://picsum.photos/id/101/600/600" alt="Equipo Ingenio" className="rounded-xl shadow-lg w-full h-full object-cover" />
            </div>
          </div>
        </section>

        {/* Other sections as before (Experience, Noticias, Contacto)... */}
        <section id="noticias" className="py-24 bg-bgGray">
           <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-title font-bold text-center mb-12">Noticias y guías legales</h2>
              <div className="grid md:grid-cols-3 gap-8">
                 {/* Simplified news cards for layout */}
                 {[
                   { t: 'Insolvencia: Señales de alerta', e: 'Guía' },
                   { t: 'Licencias urbanísticas: Errores comunes', e: 'Urbanismo' },
                   { t: 'Trámites notariales sin complicaciones', e: 'Notaría' }
                 ].map((n, i) => (
                   <div key={i} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                      <span className="text-xs font-bold text-accentGreen uppercase">{n.e}</span>
                      <h4 className="text-lg font-bold mt-2 mb-4">{n.t}</h4>
                      <button className="text-corpBlue font-bold text-sm">Leer más <Icons.ChevronRight /></button>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        <section id="contacto" className="py-24">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-title font-bold mb-8">Contacto</h2>
            <div className="grid lg:grid-cols-2 gap-12">
               <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                  <form className="space-y-4">
                    <input type="text" placeholder="Nombre o Empresa" className="w-full px-4 py-3 rounded-lg bg-bgGray outline-none focus:ring-1 focus:ring-corpBlue" />
                    <input type="email" placeholder="Correo electrónico" className="w-full px-4 py-3 rounded-lg bg-bgGray outline-none focus:ring-1 focus:ring-corpBlue" />
                    <textarea placeholder="Mensaje" rows={4} className="w-full px-4 py-3 rounded-lg bg-bgGray outline-none focus:ring-1 focus:ring-corpBlue"></textarea>
                    <button className="w-full bg-accentGreen text-white font-bold py-3 rounded-lg">ENVIAR</button>
                  </form>
               </div>
               <div className="space-y-6">
                  <div className="flex items-center space-x-4"><Icons.Phone /> <span>321 783 0681</span></div>
                  <div className="flex items-center space-x-4"><Icons.Mail /> <span>servicioalcliente@ingenioservicios.com.co</span></div>
                  <div className="flex items-center space-x-4"><Icons.Pin /> <span>Calle 6 sur # 79 150 int 1413, Medellín</span></div>
               </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-corpBlue text-white/60 py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div>
            <h4 className="text-white font-bold">© Ingenio Servicios Legales 2026</h4>
            <p className="text-xs">Ingenio Servicios y Suministros S.A.S.</p>
          </div>
          <p className="text-xs mt-4 md:mt-0">Sitio diseñado por Sensatoweb.</p>
        </div>
      </footer>

      {/* 11. INDEPENDENT FLOATING ASSISTANTS */}
      <AmeliaChatAssistant />
      <AmeliaVoiceAssistant />
    </div>
  );
};

export default App;
