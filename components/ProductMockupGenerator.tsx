import React, { useState } from 'react';
import Button from './common/Button';
import ImageUpload from './common/ImageUpload';
import { generateMockup } from '../services/geminiService';

const PRODUCT_TYPES = [
    'Coffee Cup', 
    'Soda Can', 
    'Cardboard Box', 
    'Tote Bag', 
    'Shampoo Bottle', 
    'Wine Bottle', 
    'Book Cover',
    'T-Shirt',
    'Shopping Bag'
];

const ProductMockupGenerator: React.FC = () => {
    const [designFile, setDesignFile] = useState<File | null>(null);
    const [designPreview, setDesignPreview] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<string>(PRODUCT_TYPES[0]);
    const [generatedMockup, setGeneratedMockup] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDesignSelect = (file: File) => {
        setDesignFile(file);
        setDesignPreview(URL.createObjectURL(file));
        setGeneratedMockup(null);
    };

    const handleGenerate = async () => {
        if (!designFile) {
            setError('Please upload a design image.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedMockup(null);

        try {
            const imageData = await generateMockup(designFile, selectedProduct);
            setGeneratedMockup(`data:image/png;base64,${imageData}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!generatedMockup) return;
        const link = document.createElement('a');
        link.href = generatedMockup;
        link.download = `mockup-${selectedProduct.toLowerCase().replace(' ', '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">1. Upload Your Design</h3>
                    <ImageUpload onImageSelect={handleDesignSelect} imagePreviewUrl={designPreview} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-3">2. Select Product Type</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {PRODUCT_TYPES.map(type => (
                            <button
                                key={type}
                                onClick={() => setSelectedProduct(type)}
                                className={`w-full p-3 rounded-lg text-center text-sm font-medium transition-colors duration-200 ${
                                    selectedProduct === type
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="pt-2">
                    <Button onClick={handleGenerate} isLoading={isLoading} disabled={!designFile} className="w-full">
                        Generate 3D Mockup
                    </Button>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>

            <div className="space-y-4">
                <div className="w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700 relative overflow-hidden">
                    {isLoading && (
                        <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center z-10">
                            <svg className="animate-spin h-8 w-8 text-white mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <div className="text-gray-400">Generating your 3D mockup...</div>
                        </div>
                    )}
                    {generatedMockup ? (
                        <img src={generatedMockup} alt="Generated mockup" className="max-w-full max-h-full object-contain rounded-lg" />
                    ) : (
                        <div className="text-gray-500 text-center p-4">Your 8K mockup will appear here</div>
                    )}
                </div>
                {generatedMockup && !isLoading && (
                    <div className="flex justify-center space-x-4">
                        <Button onClick={handleGenerate} isLoading={isLoading}>Re-Generate</Button>
                        <Button onClick={handleDownload} className="bg-gray-600 hover:bg-gray-700">Download 8K Mockup</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductMockupGenerator;