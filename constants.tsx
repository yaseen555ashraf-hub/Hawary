import React from 'react';
import { Tool, ToolDefinition } from './types';

// Icons for the different tools in the sidebar
const GeneratorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);

const EditorIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
);

const PromptBuilderIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
    </svg>
);

const AssistantIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
    </svg>
);

const AnalyzerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

const UpscalerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
);

const SceneComposerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75h4.5a3 3 0 0 1 3 3v4.5a3 3 0 0 1-3 3h-4.5a3 3 0 0 1-3-3v-4.5a3 3 0 0 1 3-3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h4.5a3 3 0 0 1 3 3v4.5a3 3 0 0 1-3 3h-4.5a3 3 0 0 1-3-3v-4.5a3 3 0 0 1 3-3Z" opacity="0.6"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M.75 6.75h4.5a3 3 0 0 1 3 3v4.5a3 3 0 0 1-3 3H.75a3 3 0 0 1-3-3v-4.5a3 3 0 0 1 3-3Z" opacity="0.3"/>
    </svg>
);

const MergerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25v2.25A2.25 2.25 0 0 0 6 20.25Z" />
    </svg>
);

const ReconstructorIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0-2.25l2.25 1.313M12 12.75l-2.25 1.313M15 9.75l2.25-1.313M15 9.75l-2.25-1.313M15 9.75V12m0-2.25l2.25 1.313M9 9.75l2.25-1.313M9 9.75l-2.25-1.313M9 9.75V12m0-2.25l2.25 1.313M7.5 15l2.25-1.313M7.5 15l-2.25-1.313M7.5 15V18m0-3l2.25 1.313m-4.5 0l2.25-1.313m-2.25 0l-2.25-1.313m16.5 0l-2.25 1.313m2.25 0l2.25 1.313m0 0V18m0-3l-2.25-1.313m-4.5 0l-2.25 1.313M12 3v2.25m0 16.5V21m0-21.75a9 9 0 00-9 9c0 4.968 4.032 9 9 9a9 9 0 009-9c0-4.968-4.032-9-9-9z" />
    </svg>
);

const MockupIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
);

const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
);

const ArtDirectorIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const LightingIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
);


export const TOOLS: ToolDefinition[] = [
  {
    id: Tool.Generator,
    name: 'AI Image Generator',
    description: 'Create stunning, original images from text descriptions.',
    icon: GeneratorIcon,
  },
  {
    id: Tool.Editor,
    name: 'AI Image Editor',
    description: 'Modify and enhance your images with simple text commands.',
    icon: EditorIcon,
  },
  {
    id: Tool.PromptBuilder,
    name: 'Prompt Builder',
    description: 'Craft detailed, professional prompts for better image results.',
    icon: PromptBuilderIcon,
  },
  {
    id: Tool.Assistant,
    name: 'Creative Visual Assistant',
    description: 'Get inspiration and suggestions for your visual projects.',
    icon: AssistantIcon,
  },
  {
    id: Tool.Analyzer,
    name: 'AI Image Analyzer',
    description: 'Understand composition, style, and get feedback on your images.',
    icon: AnalyzerIcon,
  },
    {
    id: Tool.LightingLab,
    name: 'AI Lighting & Shadow Lab',
    description: 'A virtual studio to test lighting setups. Control direction, intensity, color, and light types with auto shadow simulation.',
    icon: LightingIcon,
  },
  {
    id: Tool.Upscaler,
    name: 'AI Super Resolution Upscaler',
    description: 'Advanced AI upscaling to 8K with creative controls for detail, texture, and lighting, inspired by professional tools.',
    icon: UpscalerIcon,
  },
  {
    id: Tool.SceneComposer,
    name: 'Scene Composition & Luminosity Balancer',
    description: 'Merge multiple layers into a cohesive scene with AI-powered light, color, and depth balancing.',
    icon: SceneComposerIcon,
  },
  {
    id: Tool.SmartMergeEdit,
    name: 'Smart Merge & Edit Tool',
    description: 'A next-gen visual tool for creating and editing images with cinematic realism. Generate or upload a background, then seamlessly integrate any subject with automatic, depth-aware lighting, color, and shadow adaptation for professional, photorealistic results.',
    icon: MergerIcon,
  },
  {
    id: Tool.IntelligentSceneReconstructor,
    name: 'Intelligent Scene Reconstructor',
    description: 'A world-class composition tool that transforms a rough composite into a unified, photorealistic scene, dynamically rebuilding lighting, sky, atmosphere, and reflections from a text prompt.',
    icon: ReconstructorIcon,
  },
  {
    id: Tool.ProductMockupGenerator,
    name: 'Product Mockup Generator',
    description: 'Upload your design and apply it to photorealistic 3D product mockups with realistic lighting and shadows. Instant 3D preview + 8K export.',
    icon: MockupIcon,
  },
  {
    id: Tool.CameraPerspectiveStudio,
    name: 'Advanced Camera & Perspective Studio',
    description: 'Full 360° AI view control. Regenerate any scene from any angle with automatic depth and lighting correction.',
    icon: CameraIcon,
  },
  {
    id: Tool.ArtDirector,
    name: 'Art Director (Feedback Assistant)',
    description: 'Get professional design feedback on visuals. Evaluates composition, color, and lighting, providing actionable improvement suggestions.',
    icon: ArtDirectorIcon,
  },
];
