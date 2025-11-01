import React, { useState } from 'react';
import Button from './common/Button';
import ImageUpload from './common/ImageUpload';
import Slider from './common/Slider';
import BeforeAfterSlider from './common/BeforeAfterSlider';
import { editImage } from '../services/geminiService';

const MODES = ['Precision', 'Creative', 'Hybrid', 'Automatic'] as const;
type Mode = typeof MODES[number];

const PRESETS = [
    { name: 'Clean & Sharp', id: 'clean' },
    { name: 'Realistic', id: 'realistic' },
    { name: 'Cinematic HDR', id: 'cinematic' },
    { name: 'Artistic Detail', id: 'artistic' },
    { name: 'Smooth Natural', id: 'smooth' }
] as const;
type PresetId = typeof PRESETS[number]['id'];


const ImageUpscaler: React.FC = () => {
    // Image state
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Control state
    const [scale, setScale] = useState<number>(4);
    const [mode, setMode] = useState<Mode>('Hybrid');
    
    const [creativity, setCreativity] = useState(20);
    const [hdr, setHdr] = useState(10);
    const [resemblance, setResemblance] = useState(75);
    const [fractality, setFractality] = useState(25);
    const [sharpness, setSharpness] = useState(60);
    const [smoothness, setSmoothness] = useState(15);
    const [colorIntensity, setColorIntensity] = useState(10);
    const [highlightRecovery, setHighlightRecovery] = useState(50);
    const [shadowDepth, setShadowDepth] = useState(20);

    const handleImageSelect = (file: File) => {
        setOriginalImage(file);
        setOriginalImagePreview(URL.createObjectURL(file));
        setResultImage(null);
    };

    const handleSetPreset = (preset: PresetId) => {
        if (preset === 'clean') {
            setCreativity(10); setHdr(5); setResemblance(90); setFractality(10);
            setSharpness(80); setSmoothness(5); setColorIntensity(5);
            setHighlightRecovery(40); setShadowDepth(10); setMode('Precision');
        } else if (preset === 'realistic') {
            setCreativity(20); setHdr(10); setResemblance(75); setFractality(25);
            setSharpness(60); setSmoothness(15); setColorIntensity(10);
            setHighlightRecovery(50); setShadowDepth(20); setMode('Hybrid');
        } else if (preset === 'cinematic') {
            setCreativity(40); setHdr(70); setResemblance(60); setFractality(30);
            setSharpness(50); setSmoothness(20); setColorIntensity(40);
            setHighlightRecovery(60); setShadowDepth(50); setMode('Creative');
        } else if (preset === 'artistic') {
            setCreativity(80); setHdr(25); setResemblance(40); setFractality(80);
            setSharpness(40); setSmoothness(10); setColorIntensity(60);
            setHighlightRecovery(30); setShadowDepth(25); setMode('Creative');
        } else if (preset === 'smooth') {
            setCreativity(5); setHdr(0); setResemblance(85); setFractality(5);
            setSharpness(30); setSmoothness(80); setColorIntensity(5);
            setHighlightRecovery(20); setShadowDepth(5); setMode('Precision');
        }
    };

    const handleUpscale = async () => {
        if (!originalImage) {
            setError('Please upload an image to upscale.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResultImage(null);

        const upscalePrompt = `
        **Task**: Perform a professional-grade AI Super Resolution upscale on the provided image.
        **Objective**: Transform the image into a crystal-clear, high-fidelity, 8K-equivalent output. Combine advanced super-resolution, texture restoration, and AI fine detail synthesis.

        **Instructions & Parameters**:

        1.  **Upscale Factor**: Scale the image resolution by **${scale}x**. The final result should be sharp and detailed as if it were 8K.
        
        2.  **Processing Mode**: Use **${mode} Mode**.
            - In 'Precision' mode, prioritize preserving the original image's details and structure with maximum fidelity.
            - In 'Creative' mode, use AI to reimagine and generate new, plausible fine details and textures.
            - In 'Hybrid' mode, find a balance between preservation and creative enhancement.
            - In 'Automatic' mode, analyze the image content to choose the best approach.

        3.  **Creative Control (Sliders 0-100)**:
            - **Creativity**: ${creativity}. Controls how much the AI adds new details.
            - **HDR**: ${hdr}. Enhances dynamic range, making lights brighter and shadows darker.
            - **Resemblance**: ${resemblance}. How strictly the output must adhere to the original image's composition and color.
            - **Fractality**: ${fractality}. Adds intricate micro-details and textures.
            - **Sharpness**: ${sharpness}. Controls the crispness of edges.
            - **Smoothness**: ${smoothness}. Reduces noise and smooths out textures.
            - **Color Intensity**: ${colorIntensity}. Boosts color saturation and vibrance.
            - **Highlight Recovery**: ${highlightRecovery}. Restores detail in overexposed areas.
            - **Shadow Depth**: ${shadowDepth}. Enhances detail and contrast in dark areas.

        4. **Execution**:
           - Analyze the image for different regions (faces, fabrics, backgrounds) and apply enhancements adaptively.
           - Fix compression artifacts and color banding.
           - The final output must be a single, flawlessly upscaled image. Do not add any text or borders.
        `;

        try {
            const imageData = await editImage(upscalePrompt, originalImage);
            setResultImage(`data:image/png;base64,${imageData}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!resultImage) return;
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = 'upscaled-image-8k.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const ControlHeader: React.FC<{ title: string; }> = ({ title }) => (
        <h3 className="text-sm font-semibold text-gray-300 mb-2">{title}</h3>
    );

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                 <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700">
                    {isLoading && <div className="text-gray-400">Performing Super Resolution...</div>}
                    {!isLoading && resultImage && originalImagePreview && (
                        <BeforeAfterSlider beforeImage={originalImagePreview} afterImage={resultImage} />
                    )}
                    {!isLoading && !resultImage && (
                        <div className="w-full h-full">
                           <ImageUpload onImageSelect={handleImageSelect} imagePreviewUrl={originalImagePreview} />
                        </div>
                    )}
                </div>
                 {resultImage && !isLoading && (
                    <div className="flex justify-center space-x-4">
                        <Button onClick={handleUpscale} isLoading={isLoading}>Re-Generate</Button>
                        <Button onClick={handleDownload} className="bg-gray-600 hover:bg-gray-700">Download Image</Button>
                    </div>
                )}
            </div>

            <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 h-min">
                <div>
                    <ControlHeader title="Presets" />
                    <div className="flex flex-wrap gap-2">
                        {PRESETS.map(p => (
                            <button key={p.id} onClick={() => handleSetPreset(p.id)} className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>
                <hr className="border-gray-600"/>
                <div>
                    <ControlHeader title="Mode & Scale" />
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                             {MODES.map(m => (<button key={m} onClick={() => setMode(m)} className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === m ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{m}</button>))}
                        </div>
                         <div>
                            <label className="text-sm text-gray-400 mb-2 block">Scale Factor</label>
                            <select value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 text-white">
                                <option value={1.5}>1.5x</option>
                                <option value={2}>2x</option>
                                <option value={4}>4x</option>
                                <option value={6}>6x</option>
                                <option value={8}>8x</option>
                            </select>
                        </div>
                    </div>
                </div>
                <hr className="border-gray-600"/>
                <div className="space-y-3">
                    <ControlHeader title="Enhancement Controls" />
                    <Slider label="Creativity" value={creativity} onChange={setCreativity} />
                    <Slider label="HDR" value={hdr} onChange={setHdr} />
                    <Slider label="Resemblance" value={resemblance} onChange={setResemblance} />
                    <Slider label="Fractality" value={fractality} onChange={setFractality} />
                    <Slider label="Sharpness" value={sharpness} onChange={setSharpness} />
                    <Slider label="Smoothness" value={smoothness} onChange={setSmoothness} />
                    <Slider label="Color Intensity" value={colorIntensity} onChange={setColorIntensity} />
                    <Slider label="Highlight Recovery" value={highlightRecovery} onChange={setHighlightRecovery} />
                    <Slider label="Shadow Depth" value={shadowDepth} onChange={setShadowDepth} />
                </div>
                <div className="pt-4">
                    <Button onClick={handleUpscale} isLoading={isLoading} disabled={!originalImage} className="w-full">
                        Upscale (8K)
                    </Button>
                </div>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
        </div>
    );
};

export default ImageUpscaler;
