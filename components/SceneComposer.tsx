import React, { useState } from 'react';
import Button from './common/Button';
import ImageUpload from './common/ImageUpload';
import Slider from './common/Slider';
import { composeScene, ComposeParams, ZoneControls } from '../services/geminiService';

const initialControls: ZoneControls = { luminosity: 50, contrast: 50, saturation: 50 };

const SceneComposer: React.FC = () => {
    const [foreground, setForeground] = useState<File | null>(null);
    const [foregroundPreview, setForegroundPreview] = useState<string | null>(null);
    const [midground, setMidground] = useState<File | null>(null);
    const [midgroundPreview, setMidgroundPreview] = useState<string | null>(null);
    const [background, setBackground] = useState<File | null>(null);
    const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
    const [paletteImage, setPaletteImage] = useState<File | null>(null);
    const [paletteImagePreview, setPaletteImagePreview] = useState<string | null>(null);
    
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [foregroundControls, setForegroundControls] = useState<ZoneControls>({ luminosity: 60, contrast: 60, saturation: 55 });
    const [midgroundControls, setMidgroundControls] = useState<ZoneControls>({ ...initialControls });
    const [backgroundControls, setBackgroundControls] = useState<ZoneControls>({ luminosity: 40, contrast: 45, saturation: 45 });
    const [atmosphericEffect, setAtmosphericEffect] = useState(true);

    const handleImageSelect = (file: File, layer: 'fg' | 'mg' | 'bg' | 'palette') => {
        const preview = URL.createObjectURL(file);
        switch (layer) {
            case 'fg':
                setForeground(file);
                setForegroundPreview(preview);
                break;
            case 'mg':
                setMidground(file);
                setMidgroundPreview(preview);
                break;
            case 'bg':
                setBackground(file);
                setBackgroundPreview(preview);
                break;
            case 'palette':
                setPaletteImage(file);
                setPaletteImagePreview(preview);
                break;
        }
        setResultImage(null);
    };

    const handleCompose = async () => {
        if (!background) {
            setError('A background image is required.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResultImage(null);

        const params: ComposeParams = {
            background, foreground: foreground || undefined, midground: midground || undefined,
            paletteImage: paletteImage || undefined, atmosphericEffect,
            foregroundControls, midgroundControls, backgroundControls
        };

        try {
            const imageData = await composeScene(params);
            setResultImage(`data:image/png;base64,${imageData}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during composition.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const ControlHeader: React.FC<{ title: string; }> = ({ title }) => (
        <h3 className={`text-base font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2`}>{title}</h3>
    );

    const ZoneControl: React.FC<{ title: string; controls: ZoneControls; setControls: (c: ZoneControls) => void; disabled?: boolean; }> = ({ title, controls, setControls, disabled }) => (
        <div className={`p-3 rounded-lg bg-gray-900/50 border border-gray-700 space-y-3 ${disabled ? 'opacity-60' : ''}`}>
            <h4 className="font-medium text-sm text-gray-300">{title}</h4>
            <Slider label="Luminosity" value={controls.luminosity} onChange={(v) => setControls({...controls, luminosity: v})} disabled={disabled} />
            <Slider label="Contrast" value={controls.contrast} onChange={(v) => setControls({...controls, contrast: v})} disabled={disabled} />
            <Slider label="Saturation" value={controls.saturation} onChange={(v) => setControls({...controls, saturation: v})} disabled={disabled} />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                     <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2"><h3 className="text-center text-gray-400 font-medium text-sm">Foreground Layer</h3><ImageUpload onImageSelect={(f) => handleImageSelect(f, 'fg')} imagePreviewUrl={foregroundPreview} /></div>
                        <div className="space-y-2"><h3 className="text-center text-gray-400 font-medium text-sm">Midground Layer</h3><ImageUpload onImageSelect={(f) => handleImageSelect(f, 'mg')} imagePreviewUrl={midgroundPreview} /></div>
                        <div className="space-y-2"><h3 className="text-center text-gray-400 font-medium text-sm">Background Layer *</h3><ImageUpload onImageSelect={(f) => handleImageSelect(f, 'bg')} imagePreviewUrl={backgroundPreview} /></div>
                     </div>
                     <div>
                        <h3 className="text-center text-lg text-gray-300 font-medium mb-2">Result</h3>
                        <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700">
                            {isLoading && <div className="text-gray-400">Composing your scene...</div>}
                            {resultImage && <img src={resultImage} alt="Composed scene" className="max-w-full max-h-full object-contain rounded-lg" />}
                            {!isLoading && !resultImage && <div className="text-gray-500">Your composed image will appear here</div>}
                        </div>
                     </div>
                </div>

                <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 h-min">
                    <ControlHeader title="Global Controls" />
                    <div className="space-y-2">
                         <h4 className="font-medium text-sm text-gray-300">Color Palette (Optional)</h4>
                         <ImageUpload onImageSelect={(f) => handleImageSelect(f, 'palette')} imagePreviewUrl={paletteImagePreview} />
                    </div>
                     <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-gray-400">Atmospheric Depth Effect</span>
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={atmosphericEffect} onChange={(e) => setAtmosphericEffect(e.target.checked)} />
                            <div className="w-10 h-4 bg-gray-600 rounded-full shadow-inner"></div>
                            <div className={`dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition-transform ${atmosphericEffect ? 'transform translate-x-full bg-indigo-400' : ''}`}></div>
                        </div>
                    </label>

                    <ControlHeader title="Depth Zone Controls" />
                    <div className="space-y-3">
                        <ZoneControl title="Foreground" controls={foregroundControls} setControls={setForegroundControls} disabled={!foreground} />
                        <ZoneControl title="Midground" controls={midgroundControls} setControls={setMidgroundControls} disabled={!midground} />
                        <ZoneControl title="Background" controls={backgroundControls} setControls={setBackgroundControls} disabled={!background} />
                    </div>
                    
                    <div className="pt-4">
                        <Button onClick={handleCompose} isLoading={isLoading} disabled={!background} className="w-full">
                            Compose Scene
                        </Button>
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default SceneComposer;
