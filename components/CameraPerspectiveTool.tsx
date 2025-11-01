import React, { useState } from 'react';
import Button from './common/Button';
import ImageUpload from './common/ImageUpload';
import BeforeAfterSlider from './common/BeforeAfterSlider';
import Slider from './common/Slider';
import { transformPerspective, PerspectiveParams } from '../services/geminiService';

const ANGLE_PRESETS = ['Eye-Level', 'Low Angle', 'High Angle', 'Side View', 'Top/Aerial View', '3/4 View', 'Rear View'];

const CameraPerspectiveStudio: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Controls State
    const [prompt, setPrompt] = useState('');
    const [anglePreset, setAnglePreset] = useState(ANGLE_PRESETS[0]);
    const [orbit, setOrbit] = useState(0); // -180 to 180
    const [elevation, setElevation] = useState(50); // 0 to 100
    const [tilt, setTilt] = useState(0); // -90 to 90
    const [focalLength, setFocalLength] = useState(50); // 18 to 200
    const [dofIntensity, setDofIntensity] = useState(20); // 0 to 100
    const [perspectiveCorrection, setPerspectiveCorrection] = useState(true);
    const [lightingLock, setLightingLock] = useState(true);

    const handleImageSelect = (file: File) => {
        setOriginalImage(file);
        setOriginalImagePreview(URL.createObjectURL(file));
        setResultImage(null);
    };

    const handleApply = async () => {
        if (!originalImage) {
            setError('Please upload an image to transform its perspective.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResultImage(null);

        const params: PerspectiveParams = {
            image: originalImage, prompt, anglePreset, orbit, elevation,
            tilt, focalLength, dofIntensity, perspectiveCorrection, lightingLock
        };

        try {
            const imageData = await transformPerspective(params);
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
        link.download = 'perspective-transformed.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const ControlHeader: React.FC<{ title: string; className?: string }> = ({ title, className }) => (
        <h3 className={`text-sm font-semibold text-gray-300 mb-2 ${className}`}>{title}</h3>
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
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                 <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700">
                    {isLoading && <div className="text-gray-400">Re-rendering from a new perspective...</div>}
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
                        <Button onClick={handleApply} isLoading={isLoading}>Re-Generate</Button>
                        <Button onClick={handleDownload} className="bg-gray-600 hover:bg-gray-700">Download Image</Button>
                    </div>
                )}
            </div>

            <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 h-min">
                <div>
                    <ControlHeader title="Angle Presets" />
                    <div className="flex flex-wrap gap-2">
                        {ANGLE_PRESETS.map(p => (
                            <button key={p} onClick={() => setAnglePreset(p)} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${anglePreset === p ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
                <hr className="border-gray-600"/>
                <div className="space-y-3">
                    <ControlHeader title="Camera Position" />
                    <Slider label="360° Orbit" value={orbit} min={-180} max={180} unit="°" onChange={setOrbit} />
                    <Slider label="Elevation" value={elevation} onChange={setElevation} />
                    <Slider label="Tilt (Pitch)" value={tilt} min={-90} max={90} unit="°" onChange={setTilt} />
                </div>
                 <hr className="border-gray-600"/>
                <div className="space-y-3">
                     <ControlHeader title="Lens & Focus" />
                     <Slider label="Focal Length" value={focalLength} min={18} max={200} unit="mm" onChange={setFocalLength} />
                     <Slider label="Depth of Field" value={dofIntensity} onChange={setDofIntensity} />
                </div>
                <hr className="border-gray-600"/>
                <div className="space-y-3">
                    <ControlHeader title="Corrections" />
                    <Toggle label="Auto Perspective Fix" checked={perspectiveCorrection} onChange={setPerspectiveCorrection} />
                    <Toggle label="Lock Original Lighting" checked={lightingLock} onChange={setLightingLock} />
                </div>
                 <hr className="border-gray-600"/>
                 <div>
                    <ControlHeader title="Custom Prompt (Optional)" />
                    <textarea
                        rows={2}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500"
                        placeholder="e.g., add a cinematic film grain"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                </div>
                <div className="pt-2">
                    <Button onClick={handleApply} isLoading={isLoading} disabled={!originalImage} className="w-full">
                        Transform Perspective
                    </Button>
                </div>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
        </div>
    );
};

export default CameraPerspectiveStudio;
