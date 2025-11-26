import React, { useState, useRef } from 'react';
import { analyzeImageLocation } from './services/geminiService';
import { LocationAnalysis } from './types';
import AnalysisResult from './components/AnalysisResult';
import { Upload, MapPin, Loader2, Compass, RefreshCw, Images, Globe, User, Zap, Brain } from 'lucide-react';

const EXAMPLE_IMAGES = [
  "https://picsum.photos/id/1015/800/600", // Valley/River
  "https://picsum.photos/id/1036/800/600", // Snowy/Mountain
  "https://picsum.photos/id/1040/800/600", // Castle/Building
];

type ViewState = 'home' | 'about';

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [images, setImages] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<LocationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Ensure we are on home view to see loading state
    setView('home'); 
    await processFiles(files);
  };

  const processFiles = async (fileList: FileList) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setImages([]);

    try {
      const processedImages: { base64: string; mimeType: string }[] = [];
      const imageUrls: string[] = [];

      // Process all files
      const promises = Array.from(fileList).map(file => {
        return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            imageUrls.push(base64String);
            processedImages.push({
              base64: base64String.split(',')[1],
              mimeType: file.type
            });
            resolve();
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      await Promise.all(promises);
      
      // Update state with display URLs
      setImages(imageUrls);

      // Call API with all images
      try {
        const result = await analyzeImageLocation(processedImages);
        setAnalysis(result);
      } catch (err) {
        console.error(err);
        setError("Failed to analyze the location. The AI might be having trouble reading the image data.");
      } finally {
        setLoading(false);
      }

    } catch (err) {
      setError("Error reading files.");
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImages([]);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const navigateHome = () => {
    setView('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-morocco-sand to-white pb-20">
      
      {/* Navigation */}
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={navigateHome}
          >
            <Compass className="w-6 h-6 text-morocco-red group-hover:rotate-45 transition-transform duration-500" />
            <h1 className="text-xl font-serif font-bold text-gray-800 tracking-tight select-none">
              Anas<span className="text-morocco-red">Guessr</span>
            </h1>
          </div>
          <div className="flex gap-4">
             <button 
               onClick={navigateHome}
               className={`text-sm font-medium transition-colors ${view === 'home' ? 'text-morocco-blue' : 'text-gray-600 hover:text-morocco-blue'}`}
             >
               Home
             </button>
             <button 
               onClick={() => setView('about')}
               className={`text-sm font-medium transition-colors ${view === 'about' ? 'text-morocco-blue' : 'text-gray-600 hover:text-morocco-blue'}`}
             >
               About
             </button>
          </div>
        </div>
      </nav>

      {/* About View */}
      {view === 'about' && (
        <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-morocco-blue text-white p-12 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/moroccan-flower.png')]"></div>
               <h2 className="text-4xl font-serif font-bold mb-4 relative z-10">About AnasGuessr</h2>
               <p className="text-blue-100 max-w-2xl mx-auto relative z-10">
                 The premier AI-powered geolocation tool designed specifically for the diverse landscapes of Morocco.
               </p>
            </div>
            
            <div className="p-8 md:p-12 space-y-12">
              {/* Creator Section */}
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="bg-morocco-sand/30 p-6 rounded-full">
                  <User className="w-12 h-12 text-morocco-ochre" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Created by Anas</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Developed with a passion for geography and technology, AnasGuessr combines state-of-the-art AI with local expertise to help explorers, geoguessr players, and researchers identify locations across Morocco's vast terrain.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Technology */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-6 h-6 text-morocco-red" />
                    <h4 className="font-bold text-gray-800">Advanced AI Engine</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Powered by the Gemini 2.5 Flash model, utilizing "Thinking" capabilities to reason through soil types, vegetation patterns, and architectural nuances like a human expert.
                  </p>
                </div>

                {/* Grounding */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-6 h-6 text-morocco-blue" />
                    <h4 className="font-bold text-gray-800">Real-time Grounding</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Unlike standard models, AnasGuessr connects to Google Search to verify business names, road numbers, and specific landmarks in real-time for maximum accuracy.
                  </p>
                </div>
              </div>
              
              <div className="text-center pt-8 border-t border-gray-100">
                <button 
                  onClick={navigateHome}
                  className="bg-morocco-dark text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
                >
                  Start Guessing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Home View Logic */}
      {view === 'home' && (
        <>
          {/* Hero Section (Only show if no images uploaded) */}
          {!loading && images.length === 0 && (
            <div className="relative pt-20 pb-32 px-4">
              <div className="max-w-3xl mx-auto text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-flex items-center gap-2 bg-morocco-ochre/10 text-morocco-ochre px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                  <MapPin className="w-4 h-4" /> Morocco Specialist
                </div>
                <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 leading-tight">
                  Where in <span className="text-transparent bg-clip-text bg-gradient-to-r from-morocco-red to-morocco-ochre">Morocco</span> is this?
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Upload photos or street view screenshots. <b>AnasGuessr</b> utilizes deep search and analysis to pinpoint your location.
                </p>

                {/* Upload Box */}
                <div className="mt-12">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative bg-white rounded-3xl p-12 shadow-2xl border-2 border-dashed border-gray-300 hover:border-morocco-blue transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-morocco-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-morocco-blue/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Images className="w-8 h-8 text-morocco-blue" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Click to upload images</h3>
                      <p className="text-sm text-gray-400">Upload multiple angles for "Pro" level triangulation.</p>
                      <p className="text-xs text-gray-400 mt-2">Supported: JPG, PNG, WEBP</p>
                    </div>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                    />
                  </div>
                </div>

                {/* Examples */}
                <div className="mt-12 opacity-60">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Or try an example</p>
                  <div className="flex justify-center gap-4">
                    {EXAMPLE_IMAGES.map((src, idx) => (
                      <img key={idx} src={src} className="w-20 h-16 object-cover rounded-lg grayscale hover:grayscale-0 transition-all cursor-pointer border border-gray-200" alt="example" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-morocco-ochre blur-xl opacity-20 animate-pulse rounded-full" />
                <Loader2 className="w-16 h-16 text-morocco-ochre animate-spin relative z-10" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">AnasGuessr is Thinking...</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Scanning soil composition, cross-referencing vegetation with satellite data, and verifying landmarks via Google Search.
                </p>
                {images.length > 0 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {images.map((img, idx) => (
                      <img key={idx} src={img} className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-sm opacity-70" alt="preview" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results View */}
          {!loading && analysis && images.length > 0 && (
            <div className="pt-10 px-4">
              <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 animate-in fade-in slide-in-from-top-4">
                <button 
                  onClick={handleReset}
                  className="flex items-center gap-2 text-gray-500 hover:text-morocco-dark transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  <RefreshCw className="w-4 h-4" />
                  Analyze Another
                </button>
                <div className="text-right">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Analysis Complete</span>
                  <span className="block text-sm font-serif text-gray-800">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
              
              <AnalysisResult analysis={analysis} imageUrls={images} />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-red-900 mb-2">Analysis Failed</h3>
              <p className="text-red-700 text-sm mb-6">{error}</p>
              <button 
                onClick={handleReset}
                className="w-full bg-white border border-red-200 text-red-700 font-semibold py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}