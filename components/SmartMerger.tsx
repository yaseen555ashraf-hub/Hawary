import React, { useState } from 'react';
import Button from './common/Button';
import ImageUpload from './common/ImageUpload';
import BeforeAfterSlider from './common/BeforeAfterSlider';
import { mergeImages, MergeParams, generateImage } from '../services/geminiService';

const CAMERA_ANGLES = ['Low Angle', 'High Angle', 'Side View', 'Front View', 'Back View', 'Aerial View', 'Top View'];
const LIGHTING_PRESETS = ['Daylight', 'Golden Hour', 'Sunset', 'Night', 'Neon', 'Studio', 'Cinematic', 'Soft', 'Dramatic'];

const SmartMergeEdit: React.FC = () => {
  const [objectImage, setObjectImage] = useState<File | null>(null);
  const [objectImagePreview, setObjectImagePreview] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  
  const [mergedImage, setMergedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for all controls
  const [backgroundPrompt, setBackgroundPrompt] = useState('');
  const [prompt, setPrompt] = useState('');
  const [cameraAngle, setCameraAngle] = useState(CAMERA_ANGLES[0]);
  const [lightingStyle, setLightingStyle] = useState(LIGHTING_PRESETS[0]);
  const [colorTemperature, setColorTemperature] = useState(5500); // 2500K to 7500K
  const [harmonizationStrength, setHarmonizationStrength] = useState(100);
  const [castShadow, setCastShadow] = useState(true);
  const [shadowSoftness, setShadowSoftness] = useState(50);
  const [mapReflections, setMapReflections] = useState(true);
  const [reflectionIntensity, setReflectionIntensity] = useState(60);
  const [autoRemoveDistractions, setAutoRemoveDistractions] = useState(false);
  const [realism, setRealism] = useState(90);

  const handleObjectImageSelect = (file: File) => {
    setObjectImage(file);
    setObjectImagePreview(URL.createObjectURL(file));
    setMergedImage(null);
  };
  
  const handleBackgroundImageSelect = (file: File) => {
    setBackgroundImage(file);
    setBackgroundImagePreview(URL.createObjectURL(file));
    setMergedImage(null);
  };

  const handleGenerateBackground = async () => {
    if (!backgroundPrompt) {
        setError("Please enter a prompt to generate a background.");
        return;
    }
    setIsGeneratingBg(true);
    setError(null);
    setMergedImage(null);
    try {
        const imageData = await generateImage(backgroundPrompt);
        const imageUrl = `data:image/png;base64,${imageData}`;
        const blob = await (await fetch(imageUrl)).blob();
        const file = new File([blob], "generated-background.png", { type: blob.type });
        handleBackgroundImageSelect(file);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred while generating the background.');
    } finally {
        setIsGeneratingBg(false);
    }
  };

  const handleMerge = async () => {
    if (!objectImage || !backgroundImage) {
      setError('Please provide both a subject and a background image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setMergedImage(null);

    const params: MergeParams = {
        objectImage, backgroundImage, prompt, cameraAngle, lightingStyle,
        colorTemperature, harmonizationStrength, castShadow, shadowSoftness,
        mapReflections, reflectionIntensity, autoRemoveDistractions, realism
    };

    try {
      const imageData = await mergeImages(params);
      setMergedImage(`data:image/png;base64,${imageData}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!mergedImage) return;
    const link = document.createElement('a');
    link.href = mergedImage;
    link.download = 'merged-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreset = (preset: 'realistic' | 'preserve' | 'cinematic') => {
    if (preset === 'realistic') {
        setHarmonizationStrength(100); setCastShadow(true); setMapReflections(true);
        setLightingStyle('Daylight'); setColorTemperature(5500); setRealism(95); setPrompt('');
    } else if (preset === 'preserve') {
        setHarmonizationStrength(10); setCastShadow(true); setMapReflections(false); setRealism(80);
    } else if (preset === 'cinematic') {
        setHarmonizationStrength(85); setCastShadow(true); setShadowSoftness(70);
        setMapReflections(true); setReflectionIntensity(50); setLightingStyle('Cinematic');
        setColorTemperature(4800); setRealism(75);
        setPrompt('dramatic, cinematic grading, anamorphic lens flare, film grain');
    }
  };
  
  const ControlHeader: React.FC<{ title: string; className?: string }> = ({ title, className }) => (
    <h3 className={`text-sm font-medium text-gray-300 mb-2 ${className}`}>{title}</h3>
  );
  
  const Toggle: React.FC<{label: string, checked: boolean, onChange: (checked: boolean) => void}> = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm text-gray-400">{label}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className="w-10 h-4 bg-gray-600 rounded-full shadow-inner"></div>
            <div className={`dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition-transform ${checked ? 'transform translate-x-full bg-indigo-400' : ''}`}></div>
        </div>
    </label>
  );

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h3 className="text-center text-gray-400 font-medium">1. Upload Subject</h3>
                    <ImageUpload onImageSelect={handleObjectImageSelect} imagePreviewUrl={objectImagePreview} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-center text-gray-400 font-medium">2. Provide Background</h3>
                    <div className="relative p-3 border border-dashed border-gray-700 rounded-lg space-y-2">
                         <textarea
                            rows={2}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500"
                            placeholder="Or generate a background: a serene lake at sunrise..."
                            value={backgroundPrompt}
                            onChange={(e) => setBackgroundPrompt(e.target.value)}
                         />
                         <Button onClick={handleGenerateBackground} isLoading={isGeneratingBg} className="w-full !py-2 !text-sm">Generate Background</Button>
                    </div>
                    <p className="text-center text-xs text-gray-500">OR</p>
                    <ImageUpload onImageSelect={handleBackgroundImageSelect} imagePreviewUrl={backgroundImagePreview} />
                </div>
            </div>
            <div>
                 <h3 className="text-center text-lg text-gray-300 font-medium mb-2">3. Result</h3>
                 <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700">
                    {isLoading && <div className="text-gray-400">Performing deep scene fusion...</div>}
                    {mergedImage && backgroundImagePreview && <BeforeAfterSlider beforeImage={backgroundImagePreview} afterImage={mergedImage} />}
                    {!isLoading && !mergedImage && <div className="text-gray-500">Your merged image will appear here</div>}
                </div>
                {mergedImage && !isLoading && (
                    <div className="mt-4 flex justify-center space-x-4">
                        <Button onClick={handleMerge} isLoading={isLoading}>Re-Generate Merge</Button>
                        <Button onClick={handleDownload} className="bg-gray-600 hover:bg-gray-700">Download Image</Button>
                    </div>
                )}
            </div>
        </div>

        <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
             <ControlHeader title="Quick Presets" />
             <div className="flex flex-wrap gap-2">
                <button onClick={() => handlePreset('realistic')} className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-700 hover:bg-gray-600">Auto Realistic</button>
                <button onClick={() => handlePreset('preserve')} className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-700 hover:bg-gray-600">Preserve Original</button>
                <button onClick={() => handlePreset('cinematic')} className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-700 hover:bg-gray-600">Cinematic Match</button>
             </div>
             <hr className="border-gray-600"/>
             
            <div>
                 <ControlHeader title="Creative Direction (Optional)" />
                 <textarea rows={2} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500"
                    placeholder="e.g., warm golden-hour cinematic tone..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            </div>
            
             <div>
                <ControlHeader title="Scene Controls" />
                <div className="space-y-3">
                    <Toggle label="Auto-remove distractions" checked={autoRemoveDistractions} onChange={setAutoRemoveDistractions} />
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">{`Realism Level: ${realism}%`}</label>
                        <input type="range" min="0" max="100" value={realism} onChange={(e) => setRealism(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-indigo-500" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">{`Harmonization Strength: ${harmonizationStrength}%`}</label>
                        <input type="range" min="0" max="100" value={harmonizationStrength} onChange={(e) => setHarmonizationStrength(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-indigo-500" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">{`Color Temperature: ${colorTemperature}K`}</label>
                        <input type="range" min="2500" max="7500" step="100" value={colorTemperature} onChange={(e) => setColorTemperature(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-indigo-500" />
                    </div>
                </div>
            </div>
             
            <div className="space-y-3">
                <ControlHeader title="Shadows & Reflections" />
                <Toggle label="Cast Shadows" checked={castShadow} onChange={setCastShadow} />
                {castShadow && (
                    <div className="pl-4">
                         <label className="text-sm text-gray-400 mb-2 block">{`Shadow Softness: ${shadowSoftness}%`}</label>
                         <input type="range" min="0" max="100" value={shadowSoftness} onChange={(e) => setShadowSoftness(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-indigo-500" />
                    </div>
                )}
                 <Toggle label="Environment Reflections" checked={mapReflections} onChange={setMapReflections} />
                 {mapReflections && (
                    <div className="pl-4">
                        <label className="text-sm text-gray-400 mb-2 block">{`Reflection Intensity: ${reflectionIntensity}%`}</label>
                        <input type="range" min="0" max="100" value={reflectionIntensity} onChange={(e) => setReflectionIntensity(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-indigo-500" />
                    </div>
                )}
            </div>

            <div>
                <ControlHeader title="Camera & Lighting" />
                <div className="flex flex-wrap gap-2">
                    {CAMERA_ANGLES.map(angle => ( <button key={angle} onClick={() => setCameraAngle(angle)} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${cameraAngle === angle ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{angle}</button>))}
                </div>
                 <div className="flex flex-wrap gap-2 mt-3">
                    {LIGHTING_PRESETS.map(style => (<button key={style} onClick={() => setLightingStyle(style)} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${lightingStyle === style ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{style}</button>))}
                </div>
            </div>

            <div className="pt-4">
                <Button onClick={handleMerge} isLoading={isLoading} disabled={!objectImage || !backgroundImage} className="w-full">
                Merge Images
                </Button>
            </div>
             {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default SmartMergeEdit;