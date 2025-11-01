import React, { useState } from 'react';
import Button from './common/Button';
import ImageUpload from './common/ImageUpload';
import Slider from './common/Slider';
import BeforeAfterSlider from './common/BeforeAfterSlider';
import { reconstructScene, ReconstructParams } from '../services/geminiService';

const STYLE_PRESETS = ['Realistic', 'Cinematic', 'Studio', 'Neon', 'Minimal', 'Product', 'Fantasy'];
const LIGHTING_PRESETS = ['Daylight', 'Sunset', 'Golden Hour', 'Night', 'Neon', 'Overcast', 'HDR'];

const IntelligentSceneReconstructor: React.FC = () => {
    const [compositeImage, setCompositeImage] = useState<File | null>(null);
    const [compositeImagePreview, setCompositeImagePreview] = useState<string | null>(null);
    const [reconstructedImage, setReconstructedImage] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Main Controls
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState(STYLE_PRESETS[0]);
    const [lighting, setLighting] = useState(LIGHTING_PRESETS[0]);
    
    // Enhancement Toggles
    const [skyEnhance, setSkyEnhance] = useState(true);
    const [addGlow, setAddGlow] = useState(true);
    const [globalRetouch, setGlobalRetouch] = useState(false);
    const [colorRegrade, setColorRegrade] = useState(true);
    const [atmosphericDepth, setAtmosphericDepth] = useState(true);
    
    // Refinement Sliders
    const [refineStrength, setRefineStrength] = useState(75);
    const [keepLayout, setKeepLayout] = useState(true);
    const [glowIntensity, setGlowIntensity] = useState(40);
    const [colorTemperature, setColorTemperature] = useState(5500);


    const handleImageSelect = (file: File) => {
        setCompositeImage(file);
        setCompositeImagePreview(URL.createObjectURL(file));
        setReconstructedImage(null);
    };

    const handleReconstruct = async () => {
        if (!compositeImage) {
            setError('Please upload a composite image.');
            return;
        }
        if (!prompt) {
            setError('Please describe how you want the final scene to look.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setReconstructedImage(null);

        const params: ReconstructParams = {
            compositeImage, prompt, style, lighting, refineStrength, keepLayout,
            skyEnhance, addGlow, glowIntensity, globalRetouch, colorRegrade,
            colorTemperature, atmosphericDepth
        };

        try {
            const imageData = await reconstructScene(params);
            setReconstructedImage(`data:image/png;base64,${imageData}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during reconstruction.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!reconstructedImage) return;
        const link = document.createElement('a');
        link.href = reconstructedImage;
        link.download = 'reconstructed-scene.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const ControlHeader: React.FC<{ title: string; }> = ({ title }) => (
        <h3 className="text-sm font-semibold text-gray-300 mb-2">{title}</h3>
    );
    
    const Toggle: React.FC<{label: string, checked: boolean, onChange: (checked: boolean) => void}> = ({ label, checked, onChange }) => (
        <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="text-sm text-gray-400">{label}</span>
            <div className="relative">
                <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
                <div className="w-10 h-4 bg-gray-600 rounded-full shadow-inner"></div>
                <div className={`dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition-transform ${checked ? 'transform translate-x-full bg-indigo-400' : ''}`}></div>
            </div>
        </label>
    );

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                 <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700">
                    {isLoading && <div className="text-gray-400">Reconstructing your scene...</div>}
                    {!isLoading && reconstructedImage && compositeImagePreview && (
                        <BeforeAfterSlider beforeImage={compositeImagePreview} afterImage={reconstructedImage} />
                    )}
                    {!isLoading && !reconstructedImage && (
                        <div className="w-full h-full">
                            <ImageUpload onImageSelect={handleImageSelect} imagePreviewUrl={compositeImagePreview} />
                        </div>
                    )}
                </div>
                {reconstructedImage && !isLoading && (
                    <div className="mt-4 flex justify-center space-x-4">
                        <Button onClick={handleReconstruct} isLoading={isLoading}>Re-Generate</Button>
                        <Button onClick={handleDownload} className="bg-gray-600 hover:bg-gray-700">Download Render</Button>
                    </div>
                )}
            </div>

            <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 h-min">
                <div>
                    <ControlHeader title="Prompt" />
                    <textarea
                        rows={3}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500"
                        placeholder="e.g., Epic cinematic sunset, realistic lighting, glowing reflections, vibrant contrast..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                </div>
                
                <div>
                    <ControlHeader title="Style Presets" />
                    <div className="flex flex-wrap gap-2">
                        {STYLE_PRESETS.map(s => (<button key={s} onClick={() => setStyle(s)} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${style === s ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{s}</button>))}
                    </div>
                </div>

                <div>
                    <ControlHeader title="Lighting Presets" />
                    <div className="flex flex-wrap gap-2">
                        {LIGHTING_PRESETS.map(l => (<button key={l} onClick={() => setLighting(l)} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${lighting === l ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{l}</button>))}
                    </div>
                </div>
                
                <hr className="border-gray-600"/>

                <div>
                    <ControlHeader title="Enhancement Layers" />
                    <div className="space-y-1">
                        <Toggle label="Sky Replace / Enhance" checked={skyEnhance} onChange={setSkyEnhance} />
                        <Toggle label="Add Glow / Lens Bloom" checked={addGlow} onChange={setAddGlow} />
                        <Toggle label="Global Retouch" checked={globalRetouch} onChange={setGlobalRetouch} />
                        <Toggle label="Color Regrade Scene" checked={colorRegrade} onChange={setColorRegrade} />
                        <Toggle label="Atmospheric Depth" checked={atmosphericDepth} onChange={setAtmosphericDepth} />
                    </div>
                </div>

                <hr className="border-gray-600"/>

                <div className="space-y-3">
                    <ControlHeader title="Refinement Controls" />
                    <Slider label="Refine Strength" value={refineStrength} onChange={setRefineStrength} />
                    <Slider label="Glow Intensity" value={glowIntensity} onChange={setGlowIntensity} disabled={!addGlow} />
                    <Slider label="Color Temperature" value={colorTemperature} min={2000} max={8000} step={100} unit="K" onChange={setColorTemperature} disabled={!colorRegrade} />
                    <Toggle label="Keep Original Layout" checked={keepLayout} onChange={setKeepLayout} />
                </div>

                <div className="pt-4">
                    <Button onClick={handleReconstruct} isLoading={isLoading} disabled={!compositeImage} className="w-full">
                        Reconstruct Scene
                    </Button>
                </div>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
        </div>
    );
};

export default IntelligentSceneReconstructor;