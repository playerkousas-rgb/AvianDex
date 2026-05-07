import React, { useState } from 'react';
import { BirdCard } from './components/BirdCard.tsx';
import { PokedexDevice } from './components/PokedexDevice.tsx';
import { WelcomeScreen } from './components/WelcomeScreen.tsx';
import { useBirds } from './hooks/useBirds';

function App() {
  const { birds, loading, error } = useBirds();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isOpened, setIsOpened] = useState(false);

  if (error) {
    return (
      <div className="min-h-screen bg-[#313131] flex items-center justify-center">
        <div className="bg-red-500 text-white p-6 rounded-xl font-bold">
          Error loading Dex
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Intro Animation Screen */}
      {!isOpened && <WelcomeScreen onOpen={() => setIsOpened(true)} />}

      {/* Main App Container */}
      <div className={`min-h-screen bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-[#31A5E8] font-sans pb-12 transition-opacity duration-1000 ${isOpened ? 'opacity-100' : 'opacity-0 h-screen overflow-hidden'}`}>
        
        {/* Header - Pokedex Red Style */}
        <header className="bg-[#E3350D] text-white py-4 sm:py-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative z-20 border-b-8 border-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-4 border-gray-800 shadow-inner">
                <div className="w-12 h-12 rounded-full bg-[#31A5E8] border-2 border-white shadow-[0_0_15px_rgba(49,165,232,0.8)] relative overflow-hidden">
                  <div className="absolute top-1 left-2 w-4 h-4 bg-white/40 rounded-full blur-[2px]"></div>
                </div>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight drop-shadow-md">
                AvianDex
                <span className="text-sm sm:text-base font-mono text-yellow-300 ml-2 not-italic font-black block sm:inline">v1.2.0</span>
              </h1>
            </div>

            <div className="hidden sm:flex gap-3">
              <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-gray-800 shadow-sm"></div>
              <div className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-gray-800 shadow-sm"></div>
              <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-gray-800 shadow-sm"></div>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white/10 backdrop-blur-sm rounded-3xl border-4 border-white/20">
               <div className="w-20 h-20 border-8 border-white/30 border-t-yellow-400 rounded-full animate-spin mb-6 shadow-lg"></div>
               <p className="text-white font-black tracking-widest text-2xl drop-shadow-md">INITIALIZING DEX...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 relative z-10">
              {birds.map((bird, index) => (
                <BirdCard 
                  key={bird.id} 
                  bird={bird} 
                  isActive={selectedIndex === index}
                  onClick={() => setSelectedIndex(index)} 
                />
              ))}
            </div>
          )}
        </main>

        {/* The Pokedex Device Modal */}
        <PokedexDevice 
          birds={birds}
          initialIndex={selectedIndex ?? 0}
          isOpen={selectedIndex !== null}
          onClose={() => setSelectedIndex(null)}
        />
      </div>
    </>
  );
}

export default App;
