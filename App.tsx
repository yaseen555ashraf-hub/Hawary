import React, { useState, useMemo } from 'react';
import { Tool } from './types';
import { TOOLS } from './constants';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import PromptBuilder from './components/PromptBuilder';
import VisualAssistant from './components/VisualAssistant';
import ImageAnalyzer from './components/ImageAnalyzer';
import ImageUpscaler from './components/ImageUpscaler';
import SceneComposer from './components/SceneComposer';
import SmartMergeEdit from './components/SmartMerger';
import IntelligentSceneReconstructor from './components/IntelligentSceneReconstructor';
import ProductMockupGenerator from './components/ProductMockupGenerator';
import CameraPerspectiveTool from './components/CameraPerspectiveTool';
import ArtDirector from './components/ArtDirector';
import LightingLab from './components/LightingLab';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>(Tool.Generator);

  const renderActiveTool = () => {
    switch (activeTool) {
      case Tool.Generator:
        return <ImageGenerator />;
      case Tool.Editor:
        return <ImageEditor />;
      case Tool.PromptBuilder:
        return <PromptBuilder />;
      case Tool.Assistant:
        return <VisualAssistant />;
      case Tool.Analyzer:
        return <ImageAnalyzer />;
      case Tool.LightingLab:
        return <LightingLab />;
      case Tool.Upscaler:
        return <ImageUpscaler />;
      case Tool.SceneComposer:
        return <SceneComposer />;
      case Tool.SmartMergeEdit:
        return <SmartMergeEdit />;
      case Tool.IntelligentSceneReconstructor:
        return <IntelligentSceneReconstructor />;
      case Tool.ProductMockupGenerator:
        return <ProductMockupGenerator />;
      case Tool.CameraPerspectiveStudio:
        return <CameraPerspectiveTool />;
      case Tool.ArtDirector:
        return <ArtDirector />;
      default:
        return <ImageGenerator />;
    }
  };

  const activeToolInfo = useMemo(() => TOOLS.find(t => t.id === activeTool), [activeTool]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col md:flex-row">
      <nav className="bg-gray-900/80 backdrop-blur-sm border-b md:border-b-0 md:border-r border-gray-700 p-4 md:p-6 md:w-72 lg:w-80 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white mb-8">Visual AI Suite</h1>
        <ul className="space-y-2">
          {TOOLS.map((tool) => (
            <li key={tool.id}>
              <button
                onClick={() => setActiveTool(tool.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors duration-200 ${
                  activeTool === tool.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <tool.icon className="h-6 w-6 flex-shrink-0" />
                <span className="font-medium">{tool.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {activeToolInfo && (
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-white">{activeToolInfo.name}</h2>
                <p className="text-gray-400 mt-1">{activeToolInfo.description}</p>
            </div>
        )}
        <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700">
            {renderActiveTool()}
        </div>
      </main>
    </div>
  );
};

export default App;