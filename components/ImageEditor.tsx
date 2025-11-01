import React, { useState } from 'react';
import Button from './common/Button';
import ImageUpload from './common/ImageUpload';
import { editImage } from '../services/geminiService';

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [editHistory, setEditHistory] = useState<string[]>([]);
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const originalImagePreview = editHistory.length > 0 ? editHistory[0] : null;
  const currentImagePreview = editHistory.length > 0 ? editHistory[activeHistoryIndex] : null;

  // Helper to convert a data URL to a File object for the API
  const dataUrlToFile = async (dataUrl: string, fileName: string, fileType: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: fileType });
  }

  const handleImageSelect = (file: File) => {
    setOriginalImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setEditHistory([previewUrl]);
    setActiveHistoryIndex(0);
    setError(null);
  };

  const handleEdit = async () => {
    if (!prompt || !originalImageFile || editHistory.length === 0) {
      setError('Please upload an image and provide an edit instruction.');
      return;
    }
    setIsLoading(true);
    setError(null);
    
    // If editing from a previous state, truncate the future history
    const historyToBuildOn = editHistory.slice(0, activeHistoryIndex + 1);
    const imageToEditDataUrl = historyToBuildOn[historyToBuildOn.length - 1];

    try {
      const imageToEditFile = await dataUrlToFile(imageToEditDataUrl, originalImageFile.name, originalImageFile.type);
      const imageData = await editImage(prompt, imageToEditFile);
      const newImageDataUrl = `data:image/png;base64,${imageData}`;

      const newHistory = [...historyToBuildOn, newImageDataUrl];
      setEditHistory(newHistory);
      setActiveHistoryIndex(newHistory.length - 1);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!currentImagePreview) return;
    const link = document.createElement('a');
    link.href = currentImagePreview;
    link.download = `edited-image-step-${activeHistoryIndex}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleHistoryClick = (index: number) => {
    setActiveHistoryIndex(index);
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-9 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-center text-gray-400 font-medium mb-2">Original</h3>
            <ImageUpload onImageSelect={handleImageSelect} imagePreviewUrl={originalImagePreview} />
          </div>
          <div>
            <h3 className="text-center text-gray-400 font-medium mb-2">Result</h3>
            <div className="w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700 relative overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center z-10">
                        <svg className="animate-spin h-8 w-8 text-white mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <div className="text-gray-400">Applying your edits...</div>
                    </div>
                )}
                {currentImagePreview ? (
                    <img src={currentImagePreview} alt="Current view" className="max-w-full max-h-full object-contain rounded-lg" />
                ) : (
                    <div className="text-gray-500 text-center p-4">Upload an image to start editing</div>
                )}
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-300 mb-2">
            Describe your edit
          </label>
          <textarea
            id="edit-prompt"
            rows={3}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500"
            placeholder="e.g., Add a retro filter, remove the person in the background, make the lighting more dramatic"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <div className="flex justify-end items-center space-x-4">
          {currentImagePreview && !isLoading && (
              <Button onClick={handleDownload} className="bg-gray-600 hover:bg-gray-700">Download Image</Button>
          )}
          <Button onClick={handleEdit} isLoading={isLoading} disabled={!originalImageFile}>
            Apply Edit
          </Button>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
      
      <div className="lg:col-span-3 bg-gray-900 p-4 rounded-lg border border-gray-700">
        <h3 className="text-lg font-medium text-white mb-4">Edit History</h3>
        {editHistory.length > 0 ? (
            <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {editHistory.map((imageUrl, index) => (
                    <li key={index}>
                        <button
                            onClick={() => handleHistoryClick(index)}
                            className={`w-full text-left p-2 rounded-lg transition-colors border-2 ${
                                activeHistoryIndex === index
                                ? 'bg-gray-700/50 border-indigo-500'
                                : 'bg-gray-800 border-transparent hover:border-gray-600'
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <img 
                                    src={imageUrl} 
                                    alt={`Edit step ${index}`} 
                                    className="w-14 h-14 object-cover rounded-md flex-shrink-0 bg-gray-900"
                                />
                                <span className="font-medium text-sm text-gray-200">
                                    {index === 0 ? 'Original' : `Edit ${index}`}
                                </span>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-sm text-gray-500">Your edits will appear here.</p>
        )}
      </div>
    </div>
  );
};

export default ImageEditor;