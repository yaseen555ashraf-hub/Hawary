import React, { useState } from 'react';
import Button from './common/Button';
import ImageUpload from './common/ImageUpload';
import { getArtDirectorFeedback } from '../services/geminiService';

const ArtDirector: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const handleImageSelect = (file: File) => {
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setFeedback(''); // Clear previous feedback
  };

  const handleAnalyze = async () => {
    if (!image) {
      setError('Please upload an image to get feedback.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setFeedback('');

    try {
      const result = await getArtDirectorFeedback(image);
      setFeedback(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!feedback) return;
    const blob = new Blob([feedback], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'art-director-feedback.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Basic markdown to HTML renderer
  const renderMarkdown = (text: string) => {
    let html = text
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-white mt-4 mb-2">$1</h3>')
      .replace(/^-   (.*$)/gim, '<ul><li class="ml-4 list-disc text-gray-300">$1</li></ul>') // handles nested list items
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-gray-300">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      .replace(/\n/g, '<br />');
    
    // Consolidate multiple lists into one
    html = html.replace(/<\/ul><br \/><ul>/g, '');

    return { __html: html };
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <div className="space-y-4">
        <ImageUpload onImageSelect={handleImageSelect} imagePreviewUrl={imagePreview} />
        <div className="flex justify-end">
            <Button onClick={handleAnalyze} isLoading={isLoading} disabled={!image}>
                Get Feedback
            </Button>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
      
      <div className="flex flex-col">
        <div className="prose prose-invert max-w-none bg-gray-900 p-6 rounded-lg border border-gray-700 min-h-[300px] flex-grow">
            {isLoading && <p>Your Art Director is reviewing the image...</p>}
            {feedback ? <div dangerouslySetInnerHTML={renderMarkdown(feedback)} /> : !isLoading && <p className="text-gray-500">Professional feedback on your image will appear here.</p>}
        </div>
        {feedback && !isLoading && (
            <div className="flex justify-start space-x-4 mt-4">
                <Button onClick={handleAnalyze}>Re-Analyze</Button>
                <Button onClick={handleDownload} className="bg-gray-600 hover:bg-gray-700">Download Feedback</Button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ArtDirector;