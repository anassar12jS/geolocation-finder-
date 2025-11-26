import React, { useState } from 'react';
import { LocationAnalysis } from '../types';
import { MapPin, CheckCircle, AlertTriangle, Mountain, Trees, Hexagon, Home, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';
import { Map, Marker } from 'pigeon-maps';

interface AnalysisResultProps {
  analysis: LocationAnalysis;
  imageUrls: string[];
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis, imageUrls }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'Vegetation': return <Trees className="w-4 h-4 text-morocco-green" />;
      case 'Geography': return <Mountain className="w-4 h-4 text-morocco-ochre" />;
      case 'Infrastructure': return <Navigation className="w-4 h-4 text-gray-500" />;
      case 'Architecture': return <Home className="w-4 h-4 text-morocco-red" />;
      default: return <Hexagon className="w-4 h-4 text-morocco-blue" />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Left Column: Image and Map */}
      <div className="flex-1 space-y-6">
        
        {/* Main Image */}
        <div className="relative group overflow-hidden rounded-2xl shadow-xl border-4 border-white bg-gray-100">
          <img 
            src={imageUrls[activeImageIndex]} 
            alt="Analyzed Location" 
            className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium tracking-widest uppercase">
            Image {activeImageIndex + 1} of {imageUrls.length}
          </div>
          
          {/* Navigation Arrows if multiple images */}
          {imageUrls.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => (prev === 0 ? imageUrls.length - 1 : prev - 1)); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-md"
              >
                <ChevronLeft className="w-5 h-5 text-gray-800" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => (prev === imageUrls.length - 1 ? 0 : prev + 1)); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-md"
              >
                <ChevronRight className="w-5 h-5 text-gray-800" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails Gallery */}
        {imageUrls.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {imageUrls.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative min-w-[80px] h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === activeImageIndex ? 'border-morocco-blue ring-2 ring-morocco-blue/20' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx}`} />
              </button>
            ))}
          </div>
        )}

        {/* Map */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-white h-80 relative">
          <Map 
            height={320} 
            defaultCenter={[analysis.coordinates.lat, analysis.coordinates.lng]} 
            defaultZoom={6}
          >
             <Marker width={50} anchor={[analysis.coordinates.lat, analysis.coordinates.lng]} color="#C23B22" />
          </Map>
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm text-xs text-gray-600">
            {analysis.coordinates.lat.toFixed(5)}, {analysis.coordinates.lng.toFixed(5)}
          </div>
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${analysis.coordinates.lat},${analysis.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-4 bg-morocco-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Open in Google Maps
          </a>
        </div>
      </div>

      {/* Right Column: Analysis Details */}
      <div className="flex-1 space-y-6">
        
        {/* Header Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border-l-8 border-morocco-red">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-1">{analysis.specificArea}</h2>
              <h3 className="text-lg text-morocco-ochre font-medium uppercase tracking-wide">{analysis.region}, Morocco</h3>
            </div>
            <div className="flex flex-col items-center justify-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-3xl font-bold text-morocco-blue">{Math.round(analysis.confidence)}%</span>
              <span className="text-[10px] uppercase text-gray-400 font-semibold">Confidence</span>
            </div>
          </div>
          
          <div className="prose prose-stone max-w-none text-gray-600 leading-relaxed text-sm border-t pt-4 mt-4">
            <p className="italic">"{analysis.reasoning}"</p>
          </div>
        </div>

        {/* Clues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.clues.map((clue, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-md border border-gray-100 hover:border-morocco-sand transition-colors">
              <div className="flex items-center gap-2 mb-2">
                {getIconForCategory(clue.category)}
                <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">{clue.category}</span>
              </div>
              <p className="text-gray-800 text-sm font-medium">{clue.description}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
           <div className="flex-1 bg-morocco-sand/30 p-4 rounded-xl text-center">
             <p className="text-xs text-morocco-ochre font-bold uppercase mb-1">Terrain</p>
             <p className="text-gray-800 font-medium capitalize">
                {analysis.clues.find(c => c.category === 'Geography')?.description.split(' ').slice(0, 3).join(' ') || 'Mixed Terrain'}...
             </p>
           </div>
           <div className="flex-1 bg-morocco-sand/30 p-4 rounded-xl text-center">
             <p className="text-xs text-morocco-ochre font-bold uppercase mb-1">Biota</p>
             <p className="text-gray-800 font-medium capitalize">
               {analysis.clues.find(c => c.category === 'Vegetation')?.description.split(' ').slice(0, 3).join(' ') || 'Sparse Vegetation'}...
             </p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AnalysisResult;