import React, { useState } from 'react';
import Button from './common/Button';
import { generateImage } from '../services/geminiService';

const PRESETS = [
    { name: 'Cinematic', prompt: 'cinematic, hyperrealistic, dramatic lighting, 8k' },
    { name: 'Photorealistic', prompt: 'photorealistic, ultra detailed, sharp focus, professional photography' },
    { name: 'Anime', prompt: 'anime style, vibrant colors, detailed background, masterpiece' },
    { name: 'Concept Art', prompt: 'digital concept art, detailed, epic composition, matte painting' }
];

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    const fullPrompt = selectedPreset ? `${prompt}, ${selectedPreset}` : prompt;

    try {
      const imageData = await generateImage(fullPrompt);
      setGeneratedImage(`data:image/png;base64,${imageData}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePresetClick = (presetPrompt: string) => {
    setSelectedPreset(current => current === presetPrompt ? null : presetPrompt);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'generated-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
          Describe the image you want to create
        </label>
        <textarea
          id="prompt"
          rows={4}
          className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500"
          placeholder="e.g., A futuristic cityscape at dusk with flying cars, neon lights, cinematic view"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-300 mb-2">Style Presets (Optional)</p>
        <div className="flex flex-wrap gap-2">
            {PRESETS.map(preset => (
                <button 
                    key={preset.name}
                    onClick={() => handlePresetClick(preset.prompt)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${selectedPreset === preset.prompt ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    {preset.name}
                </button>
            ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleGenerate} isLoading={isLoading}>
          Generate Image
        </Button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700">
        {isLoading && <div className="text-gray-400">Generating your vision...</div>}
        {generatedImage && <img src={generatedImage} alt="Generated" className="max-w-full max-h-full object-contain rounded-lg" />}
        {!isLoading && !generatedImage && <div className="text-gray-500">Your generated image will appear here</div>}
      </div>

      {generatedImage && !isLoading && (
        <div className="flex justify-center items-center space-x-4">
          <Button onClick={handleGenerate} isLoading={isLoading}>Re-Generate</Button>
          <Button onClick={handleDownload} className="bg-gray-600 hover:bg-gray-700">Download Image</Button>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;