import React, { useState } from 'react';
import Button from './common/Button';
import ImageUpload from './common/ImageUpload';
import { analyzeImage } from '../services/geminiService';

const ImageAnalyzer: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState('');

  const handleImageSelect = (file: File) => {
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setAnalysis(''); // Clear previous analysis
  };

  const handleAnalyze = async () => {
    if (!image) {
      setError('Please upload an image to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis('');

    try {
      const result = await analyzeImage(image);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!analysis) return;
    const blob = new Blob([analysis], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'image-analysis.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <div className="space-y-4">
        <ImageUpload onImageSelect={handleImageSelect} imagePreviewUrl={imagePreview} />
        <div className="flex justify-end">
            <Button onClick={handleAnalyze} isLoading={isLoading} disabled={!image}>
            Analyze Image
            </Button>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
      
      <div className="flex flex-col">
        <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white bg-gray-900 p-4 rounded-lg border border-gray-700 min-h-[300px] flex-grow">
            {isLoading && <p>Analyzing your image...</p>}
            {analysis ? <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br/>') }} /> : !isLoading && <p className="text-gray-500">Your image analysis and creative suggestions will appear here.</p>}
        </div>
        {analysis && !isLoading && (
            <div className="flex justify-start space-x-4 mt-4">
                <Button onClick={handleAnalyze}>Re-Analyze</Button>
                <Button onClick={handleDownload} className="bg-gray-600 hover:bg-gray-700">Download Analysis</Button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageAnalyzer;