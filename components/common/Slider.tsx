import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const Slider: React.FC<SliderProps> = ({ label, value, min = 0, max = 100, step = 1, unit = '%', onChange, disabled = false }) => {
  return (
    <div className={disabled ? 'opacity-50' : ''}>
      <label className="text-sm text-gray-400 mb-2 block">{`${label}: ${value}${unit}`}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-indigo-500 disabled:cursor-not-allowed disabled:accent-gray-600"
        disabled={disabled}
      />
    </div>
  );
};

export default Slider;
