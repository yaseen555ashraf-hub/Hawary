import React, { useState } from 'react';
import Button from './common/Button';
import ImageUpload from './common/ImageUpload';
import Slider from './common/Slider';
import BeforeAfterSlider from './common/BeforeAfterSlider';
import { relightImage, RelightParams } from '../services/geminiService';

const LIGHT_TYPES = ['Softbox', 'Rim Light', 'Spotlight', 'Golden Hour', 'Neon Glow', 'Dramatic'];
const LIGHT_DIRECTIONS = ['Top-Left', 'Top', 'Top-Right', 'Left', 'Front', 'Right', 'Bottom-Left', 'Bottom', 'Bottom-Right'];

const LightingLab: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Lighting Controls State
    const [lightType, setLightType] = useState(LIGHT_TYPES[0]);
    const [lightDirection, setLightDirection] = useState(LIGHT_DIRECTIONS[0]);
    const [intensity, setIntensity] = useState(75);
    const [colorTemperature, setColorTemperature] = useState(5500);

    const handleImageSelect = (file: File) => {
        setOriginalImage(file);
        setOriginalImagePreview(URL.createObjectURL(file));
        setResultImage(null);
    };

    const handleRelight = async () => {
        if (!originalImage) {
            setError('Please upload an image to apply lighting effects.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResultImage(null);

        const params: RelightParams = {
            image: originalImage,
            lightType,
            lightDirection,
            intensity,
            colorTemperature,
        };

        try {
            const imageData = await relightImage(params);
            setResultImage(`data:image/png;base64,${imageData}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred while relighting the image.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!resultImage) return;
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = 'relit-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const ControlHeader: React.FC<{ title: string; }> = ({ title }) => (
        <h3 className="text-lg font-semibold text-gray-200 mb-3">{title}</h3>
    );

    return (
        <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                <ControlHeader title="1. Upload Image" />
                <ImageUpload onImageSelect={handleImageSelect} imagePreviewUrl={originalImagePreview} />

                <ControlHeader title="2. Light Type" />
                <div className="flex flex-wrap gap-2">
                    {LIGHT_TYPES.map(type => (
                        <button key={type} onClick={() => setLightType(type)} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${lightType === type ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            {type}
                        </button>
                    ))}
                </div>
                
                <ControlHeader title="3. Light Direction" />
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                    {LIGHT_DIRECTIONS.map(dir => (
                        <button key={dir} onClick={() => setLightDirection(dir)} className={`aspect-square rounded-md flex items-center justify-center transition-colors ${lightDirection === dir ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`} title={dir}>
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6" style={{ transform: `rotate(${['Top-Left', 'Top', 'Top-Right', 'Left', 'Front', 'Right', 'Bottom-Left', 'Bottom', 'Bottom-Right'].indexOf(dir) * 45 - 135}deg)` }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
                            </svg>
                        </button>
                    ))}
                </div>

                <ControlHeader title="4. Light Properties" />
                <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <Slider label="Intensity" value={intensity} onChange={setIntensity} />
                    <Slider label="Color Temperature" value={colorTemperature} min={2000} max={8000} step={100} unit="K" onChange={setColorTemperature} />
                </div>
                
                <div className="pt-2">
                    <Button onClick={handleRelight} isLoading={isLoading} disabled={!originalImage} className="w-full">
                        Apply Lighting
                    </Button>
                </div>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-gray-200 text-center">Result</h3>
                <div className="w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700 relative overflow-hidden">
                    {isLoading && <div className="text-gray-400">Applying virtual lighting...</div>}
                    {!isLoading && resultImage && originalImagePreview && (
                        <BeforeAfterSlider beforeImage={originalImagePreview} afterImage={resultImage} />
                    )}
                    {!isLoading && !resultImage && (
                        <div className="text-gray-500 text-center p-4">Your re-lit image will appear here</div>
                    )}
                </div>
                {resultImage && !isLoading && (
                    <div className="flex justify-center space-x-4">
                        <Button onClick={handleRelight} isLoading={isLoading}>Re-Generate</Button>
                        <Button onClick={handleDownload} className="bg-gray-600 hover:bg-gray-700">Download Image</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LightingLab;