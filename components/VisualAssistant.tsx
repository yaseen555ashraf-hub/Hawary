import React, { useState } from 'react';
import Button from './common/Button';
import ImageUpload from './common/ImageUpload';
import { getCreativeSuggestions } from '../services/geminiService';

const VisualAssistant: React.FC = () => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState('');

  const handleImageSelect = (file: File) => {
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleGetSuggestions = async () => {
    if (!description) {
      setError('Please provide a description.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestions('');

    try {
      const result = await getCreativeSuggestions(description, image || undefined);
      setSuggestions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!suggestions) return;
    const blob = new Blob([suggestions], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'creative-suggestions.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Describe your scene or idea
                </label>
                <textarea
                    id="description"
                    rows={4}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500"
                    placeholder="e.g., A portrait of an elderly craftsman in his workshop"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload an optional reference image
                </label>
                <ImageUpload onImageSelect={handleImageSelect} imagePreviewUrl={imagePreview} />
            </div>
        </div>
        <div className="space-y-4">
             <div className="flex justify-end md:justify-start">
                <Button onClick={handleGetSuggestions} isLoading={isLoading}>
                Get Suggestions
                </Button>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
             <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white bg-gray-900 p-4 rounded-lg border border-gray-700 min-h-[200px]">
                {isLoading && <p>Generating creative ideas...</p>}
                {suggestions ? <div dangerouslySetInnerHTML={{ __html: suggestions.replace(/\n/g, '<br/>') }} /> : !isLoading && <p className="text-gray-500">Your creative suggestions will appear here.</p>}
            </div>
            {suggestions && !isLoading && (
                <div className="flex justify-start space-x-4">
                    <Button onClick={handleGetSuggestions}>Re-Generate</Button>
                    <Button onClick={handleDownload} className="bg-gray-600 hover:bg-gray-700">Download Suggestions</Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default VisualAssistant;