// Fix: Import React to resolve namespace errors for React and JSX types.
import React from 'react';

export enum Tool {
  Generator = 'AI Image Generator',
  Editor = 'AI Image Editor',
  PromptBuilder = 'Prompt Builder',
  Assistant = 'Creative Visual Assistant',
  Analyzer = 'AI Image Analyzer',
  Upscaler = '8K Upscale Engine',
  SceneComposer = 'Scene Composition & Luminosity Balancer',
  SmartMergeEdit = 'Smart Merge & Edit Tool',
  IntelligentSceneReconstructor = 'Intelligent Scene Reconstructor',
  ProductMockupGenerator = 'Product Mockup Generator',
  CameraPerspectiveStudio = 'Advanced Camera & Perspective Studio',
  ArtDirector = 'Art Director (Feedback Assistant)',
  LightingLab = 'AI Lighting & Shadow Lab',
}

export interface ToolDefinition {
  id: Tool;
  name: string;
  description: string;
  // Fix: Use React.ReactElement instead of JSX.Element in a .ts file to avoid 'Cannot find namespace JSX' error.
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
}
