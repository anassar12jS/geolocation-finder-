import React, { useState, useRef } from 'react';
import { analyzeImageLocation } from './services/geminiService';
import { LocationAnalysis } from './types';
import AnalysisResult from './components/AnalysisResult';
import { Upload, MapPin, Loader2, Compass, RefreshCw, Images } from 'lucide-react';

const EXAMPLE_IMAGES = [
  "https://picsum.photos/id/1015/800/600", // Valley/River
  "https://picsum.photos/id/1036/800/600", // Snowy/Mountain
  "https://picsum.photos/id/1040/800/600", // Castle/Building
];

export default function App() {
  const [images, setImages] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<LocationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-morocco-sand to-white pb-20">
      
      {/* Navigation */}
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-morocco-red" />
            <h1 className="text-xl font-serif font-bold text-gray-800 tracking-tight">Atlas<span className="text-morocco-red">Guessr</span></h1>
          </div>
          <div className="flex gap-4">
             <a href="#" className="text-sm font-medium text-gray-600 hover:text-morocco-blue transition-colors">History</a>
             <a href="#" className="text-sm font-medium text-gray-600 hover:text-morocco-blue transition-colors">About</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {images.length === 0 && (
        <div className="relative pt-20 pb-32 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 bg-morocco-ochre/10 text-morocco-ochre px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <MapPin className="w-4 h-4" /> Morocco Specialist
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 leading-tight">
              Where in <span className="text-transparent bg-clip-text bg-gradient-to-r from-morocco-red to-morocco-ochre">Morocco</span> is this?
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload photos or street view screenshots. Our AI Champion analyzes soil, vegetation, and architecture to pinpoint your location.
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
                  <p className="text-sm text-gray-400">Upload one or multiple photos for better accuracy.</p>
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

            {/* Examples (Optional visual flair) */}
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
            <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">Consulting the Map...</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Analyzing {images.length} image{images.length > 1 ? 's' : ''}. Checking soil composition, cross-referencing vegetation patterns, and calculating coordinates.
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

    </div>
  );
}