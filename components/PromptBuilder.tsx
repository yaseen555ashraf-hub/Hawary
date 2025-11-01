import React, { useState } from 'react';
import Button from './common/Button';
import { buildPrompt } from '../services/geminiService';

const CATEGORIES = ['Cinematic Photography', 'Arabic Cultural Visuals', 'Car Concept Art'];

const PromptBuilder: React.FC = () => {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const handleBuild = async () => {
    if (!details) {
      setError('Please provide some details for the prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    // Keep old prompt in view while regenerating
    // setGeneratedPrompt(''); 

    try {
      const result = await buildPrompt(category, details);
      setGeneratedPrompt(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
          Select a Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 text-white"
        >
          {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="details" className="block text-sm font-medium text-gray-300 mb-2">
          Provide key details, elements, or mood
        </label>
        <textarea
          id="details"
          rows={4}
          className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500"
          placeholder="e.g., For Cinematic: a lone detective in a rainy noir city. For Arabic Culture: a bustling souk at sunset. For Car Concept: a sleek electric sports car in a desert."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleBuild} isLoading={isLoading}>
          {generatedPrompt ? 'Generate New Version' : 'Build Prompt'}
        </Button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {(isLoading || generatedPrompt) && (
        <div>
          <label htmlFor="generated-prompt" className="block text-sm font-medium text-gray-300 mb-2">
            Generated Prompt
          </label>
          <div className="relative">
            <textarea
              id="generated-prompt"
              rows={6}
              readOnly
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 pr-24 text-white placeholder-gray-500"
              placeholder={isLoading ? "Building your professional prompt..." : ""}
              value={generatedPrompt}
            />
            {generatedPrompt && (
              <div className="absolute top-2 right-2 flex items-center space-x-2">
                <button onClick={handleBuild} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600" title="Re-Generate Prompt">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.181-3.183m-11.664 0-3.181 3.183m0 0-3.181-3.183m3.181 3.183L2.985 19.644M21.015 4.356v4.992m0 0h-4.992m4.992 0-3.181-3.183a8.25 8.25 0 0 0-11.664 0L2.985 9.348m11.664 0 3.181-3.183m0 0 3.181 3.183m-3.181-3.183L21.015 4.356" />
                    </svg>
                </button>
                <button onClick={copyToClipboard} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600" title="Copy to Clipboard">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptBuilder;