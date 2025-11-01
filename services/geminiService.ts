import { GoogleGenAI, Modality, Part } from "@google/genai";

// Fix: Initialize the GoogleGenAI client according to the coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper function to convert a File to a base64 encoded string and return a Part
const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // The result includes the data URL prefix (e.g., "data:image/jpeg;base64,"), remove it.
          resolve(reader.result.split(',')[1]);
        } else {
            reject(new Error("Failed to read file as data URL."));
        }
      };
      reader.onerror = (error) => {
          reject(error);
      };
      reader.readAsDataURL(file);
    });
    const base64EncodedData = await base64EncodedDataPromise;
    return {
      inlineData: {
        data: base64EncodedData,
        mimeType: file.type,
      },
    };
};
  
// 1. AI Image Generator
export const generateImage = async (prompt: string): Promise<string> => {
  // Fix: Use `imagen-4.0-generate-001` for high-quality image generation.
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
    },
  });

  // Fix: Extract the base64 image bytes from the response.
  const base64ImageBytes = response.generatedImages[0].image.imageBytes;
  if (!base64ImageBytes) {
    throw new Error('No image was generated.');
  }
  return base64ImageBytes;
};

// 2. AI Image Editor / Upscaler
export const editImage = async (prompt: string, image: File): Promise<string> => {
  const imagePart = await fileToGenerativePart(image);
  
  // Fix: Use `gemini-2.5-flash-image` for image editing tasks.
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        imagePart,
        {
          text: prompt,
        },
      ],
    },
    config: {
        // Fix: `responseModalities` is required for image generation with this model.
        responseModalities: [Modality.IMAGE],
    },
  });

  // Fix: Extract the generated image data from the response.
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error('No edited image was returned.');
};

// 3. Prompt Builder
export const buildPrompt = async (category: string, details: string): Promise<string> => {
  const prompt = `You are a professional prompt engineer for an advanced AI image generation model.
  Your task is to expand a user's simple idea into a detailed, rich, and effective prompt.
  - Category: ${category}
  - User's Details: ${details}
  
  Create a single, cohesive prompt that includes details about subject, style, lighting, composition, and mood, tailored to the category. Do not include any explanations, just output the final prompt.`;

  // Fix: Use `gemini-2.5-flash` for text generation tasks.
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  // Fix: Get the generated text using the `.text` property.
  return response.text.trim();
};

// 4. Creative Visual Assistant
export const getCreativeSuggestions = async (description: string, image?: File): Promise<string> => {
  const textPart = {
    text: `You are a creative visual assistant. Based on the following description and optional reference image, provide creative suggestions.
    Analyze the concept and suggest improvements for lighting, composition, mood, and storytelling.
    Format your response as markdown.
    
    Description: "${description}"`
  };
  
  const parts: Part[] = [textPart];

  if (image) {
    const imagePart = await fileToGenerativePart(image);
    parts.unshift(imagePart); // Put image first for better context
  }

  // Fix: Use `gemini-2.5-flash` for multimodal text generation.
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts },
  });

  // Fix: Get the generated text using the `.text` property.
  return response.text;
};

// 5. AI Image Analyzer
export const analyzeImage = async (image: File): Promise<string> => {
    const imagePart = await fileToGenerativePart(image);
    const textPart = {
        text: `You are an expert art director and image analyst.
        Analyze this image in detail. Provide a comprehensive breakdown covering:
        - Subject & Focus: What is the main subject and what draws the eye?
        - Composition: Comment on the framing, rule of thirds, leading lines, etc.
        - Lighting & Color: Describe the lighting style (e.g., soft, harsh, dramatic) and the color palette.
        - Mood & Storytelling: What emotions or story does the image convey?
        - Technical Quality: Comment on sharpness, focus, and potential areas for improvement.

        Format your response as markdown.`
    };

    // Fix: Use `gemini-2.5-flash` for image analysis (vision model).
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });

    // Fix: Get the generated text using the `.text` property.
    return response.text;
};

// 6. Scene Composer
export interface ZoneControls {
    luminosity: number;
    contrast: number;
    saturation: number;
}
export interface ComposeParams {
    foreground?: File;
    midground?: File;
    background: File;
    paletteImage?: File;
    atmosphericEffect: boolean;
    foregroundControls: ZoneControls;
    midgroundControls: ZoneControls;
    backgroundControls: ZoneControls;
}

export const composeScene = async (params: ComposeParams): Promise<string> => {
    const {
        foreground, midground, background, paletteImage, atmosphericEffect,
        foregroundControls, midgroundControls, backgroundControls
    } = params;
    
    const parts: Part[] = [];
    const imagePartsMap = new Map<string, Part>();

    // Prepare all image parts concurrently
    const imagePromises: Promise<void>[] = [];
    
    if (background) {
        imagePromises.push(fileToGenerativePart(background).then(part => {
            parts.push(part);
            imagePartsMap.set('Background', part);
        }));
    }
    if (midground) {
        imagePromises.push(fileToGenerativePart(midground).then(part => {
            parts.push(part);
            imagePartsMap.set('Midground', part);
        }));
    }
    if (foreground) {
        imagePromises.push(fileToGenerativePart(foreground).then(part => {
            parts.push(part);
            imagePartsMap.set('Foreground', part);
        }));
    }
    if (paletteImage) {
        imagePromises.push(fileToGenerativePart(paletteImage).then(part => {
            parts.push(part);
            imagePartsMap.set('Palette', part);
        }));
    }

    await Promise.all(imagePromises);

    const fullPrompt = `
    **Task**: Perform an advanced "Scene Composition and Luminosity Balancing". Your goal is to merge multiple image layers into a single, photorealistic, and cohesive scene. You must follow detailed instructions on lighting, color, and depth.

    **Input Layers Provided**:
    - ${imagePartsMap.has('Background') ? 'Background Image: The main environment and furthest elements.' : ''}
    - ${imagePartsMap.has('Midground') ? 'Midground Image: Contains elements in the middle distance.' : ''}
    - ${imagePartsMap.has('Foreground') ? 'Foreground Image: Contains the primary subject(s) closest to the camera.' : ''}
    - ${imagePartsMap.has('Palette') ? "Palette Reference Image: Use this image to define the global color palette, mood, and lighting style for the entire composite." : ''}

    **Core Instructions**:

    1.  **Layer Integration**:
        -   Isolate the main subjects from the foreground and midground images (if provided).
        -   Place them into the background image, respecting their designated depth order (Foreground > Midground > Background).
        -   Ensure correct scale and perspective alignment between layers for a seamless composition.

    2.  **Global Color Harmonization**:
        -   ${paletteImage ? "Analyze the 'Palette Reference Image' and extract its dominant colors, overall temperature (warm/cool), and lighting characteristics. Apply this mood and color grade across the entire final scene." : "Create a natural and balanced color palette based on the background image."}
        -   All layers must look like they belong in the same color space and were captured under the same lighting conditions.

    3.  **Depth-Aware Luminosity & Contrast Balancing**:
        -   This is critical for realism. Adjust each layer based on its position in the scene to create a convincing sense of depth.
        -   **Foreground Zone**: Should have the highest visual presence. Adjust luminosity to a level of ${foregroundControls.luminosity}%, contrast to ${foregroundControls.contrast}%, and saturation to ${foregroundControls.saturation}%.
        -   **Midground Zone**: Create a balanced transition. Adjust luminosity to ${midgroundControls.luminosity}%, contrast to ${midgroundControls.contrast}%, and saturation to ${midgroundControls.saturation}%.
        -   **Background Zone**: Should appear furthest away. Adjust luminosity to ${backgroundControls.luminosity}%, contrast to ${backgroundControls.contrast}%, and saturation to ${backgroundControls.saturation}%.

    4.  **Atmospheric Perspective**:
        -   ${atmosphericEffect ? "Apply a subtle atmospheric effect (like haze, fog, or aerial perspective) that increases with distance. This means the background should be slightly more faded or color-shifted than the foreground, enhancing the sense of depth." : "Maintain clear visibility across all depths."}

    5.  **Relighting and Shadows**:
        -   Analyze the primary light source from the background (or palette image).
        -   Re-light the foreground and midground subjects to match this light source in direction, softness, and color.
        -   Cast realistic shadows from the foreground/midground objects onto the layers behind them, considering the light source and environment.

    **Output Requirement**:
    -   A single, flawlessly merged, high-resolution image that looks like it was captured with a single camera. Do not output any text, artifacts, or borders.
    `;
    
    parts.push({ text: fullPrompt });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: { responseModalities: [Modality.IMAGE] },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
    }
    
    throw new Error('No composed image was returned.');
}

// 7. Smart Merger
export interface MergeParams {
    objectImage: File;
    backgroundImage: File;
    prompt: string;
    cameraAngle: string;
    lightingStyle: string;
    colorTemperature: number;
    harmonizationStrength: number;
    castShadow: boolean;
    shadowSoftness: number;
    mapReflections: boolean;
    reflectionIntensity: number;
    autoRemoveDistractions: boolean;
    realism: number;
}

export const mergeImages = async (params: MergeParams): Promise<string> => {
    const {
        objectImage,
        backgroundImage,
        prompt,
        cameraAngle,
        lightingStyle,
        colorTemperature,
        harmonizationStrength,
        castShadow,
        shadowSoftness,
        mapReflections,
        reflectionIntensity,
        autoRemoveDistractions,
        realism,
    } = params;

    const objectImagePart = await fileToGenerativePart(objectImage);
    const backgroundImagePart = await fileToGenerativePart(backgroundImage);
    
    const getShadowDescription = (): string => {
        if (!castShadow) return "Do not cast any shadows from the subject.";
        let softnessDesc = "with a balanced mix of hard and soft edges.";
        if (shadowSoftness < 30) softnessDesc = "with sharp, defined edges (hard lighting).";
        if (shadowSoftness > 70) softnessDesc = "with very diffuse, soft edges (soft lighting).";
        return `Cast physically correct shadows from the subject onto the background, ${softnessDesc}`;
    };

    const getReflectionDescription = (): string => {
        if (!mapReflections) return "The subject should have no environmental reflections.";
        return `Generate precise, distorted reflections of the background environment onto the subject's surfaces. The overall intensity of these reflections should be approximately ${reflectionIntensity}%.`;
    };

    const getHarmonizationDescription = (): string => {
        if (harmonizationStrength === 0) return "Preserve the subject's original lighting and color grading completely.";
        if (harmonizationStrength === 100) return "Fully relight the subject and harmonize its colors to perfectly match the background scene.";
        return `Apply color and lighting harmonization at ${harmonizationStrength}% strength. Blend the subject's original look with the background's environment, with the final result being closer to the background's characteristics.`;
    };

    const getRealismDescription = (): string => {
        if (realism > 95) return "The final image must be indistinguishable from a real photograph (absolute photorealism).";
        if (realism > 75) return "Aim for a high degree of photorealism, with subtle artistic touches.";
        if (realism < 40) return "Produce a more stylized, artistic render rather than a purely photorealistic one. Emphasize mood over accuracy.";
        return "Create a balanced, realistic image with a clean, commercial look.";
    }

    let fullPrompt = `
    **Task**: Perform a professional, ultra-realistic "deep scene fusion." Your goal is to seamlessly integrate the primary subject from the 'Object Image' into the 'Background Image' as if it were photographed in that exact environment, following the user's creative direction.

    **AI Instructions**:
    1.  **Scene Analysis**: First, deeply analyze the 'Background Image'. Identify its intrinsic properties: the direction, color, and quality of light, ambient color temperature, perspective, and depth map.
    
    ${autoRemoveDistractions ? "2. **Distraction Removal**: Before integration, analyze the 'Background Image' for any visually distracting or out-of-place objects. Use intelligent, texture-aware inpainting to seamlessly remove them, creating a clean canvas." : ""}
    
    3.  **Subject Integration & Photorealistic Compositing**: Isolate the main subject from the 'Object Image' and place it into the background. Re-render the subject to achieve a flawless, physically accurate composite.
        -   **Realism Level**: ${getRealismDescription()}
        -   **Depth Occlusion**: Analyze the background's depth map. Place the subject realistically within the 3D space, ensuring correct occlusion by foreground elements (e.g., placing the subject *behind* a tree if appropriate).
        -   **Perspective Matching**: Align the subject to the specified **Camera Perspective**: '${cameraAngle}'.
        -   **Photometric Tonemapping & Relighting**:
            -   ${getHarmonizationDescription()}
            -   The overall lighting style should be '${lightingStyle}'.
            -   Adjust the final scene to a color temperature of approximately ${colorTemperature}K.
        -   **Shadows**: ${getShadowDescription()}
        -   **Reflections**: ${getReflectionDescription()}
    
    ${prompt ? `**User's Creative Direction**: In addition to the automatic analysis, apply the following style and mood: "${prompt}"` : ''}

    **Output Requirement**:
    - The final output must be a single, cohesive, and high-quality merged image. Do not show original images, text, or any artifacts. Only the final composite matters.`;


    const textPart = { text: fullPrompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            objectImagePart,
            backgroundImagePart,
            textPart,
          ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
      });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
    }
    
    throw new Error('No merged image was returned.');
}

// 8. Intelligent Scene Reconstructor
export interface ReconstructParams {
    compositeImage: File;
    prompt: string;
    style: string;
    lighting: string;
    refineStrength: number;
    keepLayout: boolean;
    skyEnhance: boolean;
    addGlow: boolean;
    glowIntensity: number;
    globalRetouch: boolean;
    colorRegrade: boolean;
    colorTemperature: number;
    atmosphericDepth: boolean;
}

export const reconstructScene = async (params: ReconstructParams): Promise<string> => {
    const { 
        compositeImage, prompt, style, lighting, refineStrength, keepLayout,
        skyEnhance, addGlow, glowIntensity, globalRetouch, colorRegrade,
        colorTemperature, atmosphericDepth
    } = params;

    const imagePart = await fileToGenerativePart(compositeImage);

    const fullPrompt = `
    **Task**: World-Class AI Scene Reconstruction. Your objective is to transform a rough composite image into a single, fully unified, photorealistic, and cinematic scene. You must follow a multi-pass process, rebuilding the environment, lighting, and mood based on the user's creative direction. The quality must be paramount, aiming for studio-shot realism.

    **User's Creative Direction**:
    - **Main Goal & Description**: "${prompt}"
    - **Overall Style**: A "${style}" aesthetic.
    - **Lighting Environment**: A "${lighting}" setup.

    **AI Reconstruction Pipeline**:

    1.  **Scene Analysis & Segmentation**:
        -   Analyze the provided composite image. Identify all distinct elements, their boundaries, and their implied depth (foreground, midground, background).
        -   ${keepLayout ? "Strictly maintain the original positions and arrangement of the elements." : "You have creative freedom to slightly adjust the positions of elements for a more balanced and effective composition."}

    ${skyEnhance ? `
    2.  **Sky & Atmosphere Reconstruction**:
        -   Detect the sky region in the image.
        -   Completely replace or dynamically re-render the sky to create a realistic "${lighting}" atmosphere that matches the prompt: "${prompt}".
        -   The new sky must become the primary light source for the entire scene. Generate soft, volumetric light from the sky that creates a global ambience.
    ` : ''}

    3.  **Global Relighting & Harmonization**:
        -   Based on the new sky (if applicable) and the prompt's lighting direction, re-light every element in the scene.
        -   Cast consistent, physically accurate shadows and generate environmental reflections on all appropriate surfaces (water, metal, glass).
        -   Harmonize the color grading and exposure across all elements to make them appear as if they were shot with the same camera at the same time.

    ${atmosphericDepth ? `
    4.  **Atmospheric Depth Pass**:
        -   Apply a realistic atmospheric perspective. Elements in the background should have slightly lower contrast, softened details, and a subtle haze or color shift to create a convincing sense of cinematic depth.
    ` : ''}

    ${colorRegrade ? `
    5.  **Cinematic Color Grading Pass**:
        -   Perform a final, global color grading pass on the entire scene to unify the tones and achieve the desired mood.
        -   Adjust the final scene's color temperature to approximately ${colorTemperature}K.
    ` : ''}

    ${addGlow ? `
    6.  **Glow & Highlight Pass**:
        -   Add a subtle, cinematic glow or bloom effect to the brightest highlights, light sources, and reflective surfaces.
        -   The intensity of this glow effect should be ${glowIntensity}%. This should enhance realism, not create an overly stylized look unless requested.
    ` : ''}

    ${globalRetouch ? `
    7.  **Final Retouch & Polish Pass**:
        -   Apply a professional retouching pass. Subtly smooth textures on surfaces like skin or fabric, clean up any remaining hard edges between elements, and enhance fine details for a polished, high-end commercial look.
    ` : ''}

    **Core Technical Constraints**:
    -   **Refine Strength**: Apply all the above changes with an overall intensity of ${refineStrength}%. A lower value means more subtle adjustments, while a higher value allows for a complete creative rework of the scene.
    -   **Seamless Blending**: The highest priority is to ensure there are no visible seams, halos, or artifacts. All elements must be perfectly blended.

    **Output Requirement**:
    -   Produce a single, high-resolution, flawlessly reconstructed image. Do not output any text, explanations, or borders. The final image should be indistinguishable from a professional photograph or a still from a high-budget film.
    `;
    
    const textPart = { text: fullPrompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: { responseModalities: [Modality.IMAGE] },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
    }
    
    throw new Error('No reconstructed image was returned.');
};

// 9. Product Mockup Generator
export const generateMockup = async (designImage: File, productType: string): Promise<string> => {
    const designPart = await fileToGenerativePart(designImage);

    const prompt = `
    **Task**: High-Fidelity 3D Product Mockup Generation.
    **Objective**: Apply the user-provided design onto a photorealistic 3D model of a '${productType}'. The final image must be 8K resolution, suitable for professional marketing.

    **Inputs**:
    1.  **Design Image**: The first image provided. This is the user's logo, label, or artwork.
    2.  **Product Type**: '${productType}'

    **Instructions**:
    1.  **Model Creation**: Generate a clean, high-quality, 3D model of the specified '${productType}'.
    2.  **Texture Application**: Realistically apply the 'Design Image' onto the surface of the 3D model. The design should wrap correctly around the product's contours, respecting its material properties (e.g., matte, gloss, texture).
    3.  **Scene & Lighting**: Place the final product model in a neutral, professional studio environment (e.g., a clean white or light gray infinity cove). The lighting should be soft and realistic, casting subtle, physically accurate shadows on the ground plane.
    4.  **Rendering**: Render the scene with extreme photorealism. Ensure the final output is sharp, detailed, and at a very high resolution (8K equivalent).

    **Output Requirement**: A single, final, rendered image of the product mockup. Do not output any text, borders, or explanations.
    `;

    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [designPart, textPart] },
        config: { responseModalities: [Modality.IMAGE] },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
    }
    
    throw new Error('No mockup image was returned.');
};

// 10. Advanced Camera & Perspective Studio
export interface PerspectiveParams {
    image: File;
    prompt: string;
    anglePreset: string;
    orbit: number; // -180 to 180
    elevation: number; // 0 to 100
    tilt: number; // -90 to 90
    focalLength: number; // 18 to 200
    dofIntensity: number; // 0 to 100
    perspectiveCorrection: boolean;
    lightingLock: boolean;
}

export const transformPerspective = async (params: PerspectiveParams): Promise<string> => {
    const { 
        image, prompt, anglePreset, orbit, elevation, tilt, 
        focalLength, dofIntensity, perspectiveCorrection, lightingLock 
    } = params;
    
    const imagePart = await fileToGenerativePart(image);

    const fullPrompt = `
    **Task**: Advanced AI Camera & Perspective Transformation.
    **Objective**: Re-render the provided image from a completely new, precisely defined camera viewpoint. You must perform a full 3D scene reconstruction to generate a photorealistic result with accurate perspective, lighting, and depth of field.

    **Input Image**: The user has provided an image to be transformed.

    **Camera & Viewpoint Instructions**:

    1.  **Primary Angle**: The camera is positioned for a '${anglePreset}' view.
    2.  **360° Orbit Rotation**: The camera is rotated horizontally around the subject by ${orbit}° from the front. (0° is front, 90° is right, -90° is left, 180° is rear).
    3.  **Elevation**: The camera's vertical height is at ${elevation}%. (0% is ground level, 50% is eye-level, 100% is directly above).
    4.  **Tilt (Pitch)**: The camera is tilted by ${tilt}°. (-90° is looking straight down, 0° is level, 90° is looking straight up).
    5.  **Lens Simulation**:
        -   **Focal Length**: Simulate a ${focalLength}mm lens. This will affect field of view and background compression.
        -   **Depth of Field**: Apply a depth of field effect with an intensity of ${dofIntensity}%. The main subject should be in sharp focus, with the background and foreground progressively blurred according to the lens simulation.
    6.  **Corrections**:
        -   **Perspective Correction**: ${perspectiveCorrection ? 'Apply automatic perspective correction to ensure vertical lines are straight and avoid distortion.' : 'Natural lens distortion is acceptable.'}
        -   **Lighting**: ${lightingLock ? 'Preserve the original lighting direction and quality. Shadows and highlights should be recalculated for the new perspective but originate from the same light source.' : 'Generate new, natural lighting that best fits the new camera angle.'}

    ${prompt ? `**User's Creative Direction**: In addition to the technical settings, apply this creative style: "${prompt}"` : ''}

    **AI Execution Pipeline**:
    1.  **Scene Deconstruction**: Analyze the original image to create an implicit 3D model of the scene, understanding object placement, scale, and textures.
    2.  **Virtual Camera Placement**: Position the new virtual camera according to all the specified rotation, elevation, tilt, and lens parameters.
    3.  **Scene Re-rendering**: Render the scene from this new viewpoint. Intelligently generate and inpaint any occluded or previously non-existent details that would be visible from the new angle.
    4.  **Physics Recalculation**: Based on the new view, accurately recalculate all shadows, highlights, and reflections. Apply the specified depth of field effect.
    5.  **Final Polish**: Ensure the final output is a single, cohesive, high-resolution image, free of artifacts, maintaining the style and identity of the original subject.

    **Output Requirement**: A single, final, re-rendered image. Do not output any text, borders, or explanations.
    `;
    const textPart = { text: fullPrompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: { responseModalities: [Modality.IMAGE] },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
    }
    
    throw new Error('No perspective-changed image was returned.');
};

// 11. Art Director Feedback
export const getArtDirectorFeedback = async (image: File): Promise<string> => {
    const imagePart = await fileToGenerativePart(image);
    const textPart = {
        text: `You are a world-class Art Director with a keen eye for detail, known for giving insightful, constructive, and professional feedback.
        Analyze the provided image and provide a professional critique. Your goal is to help the creator improve their work.

        Structure your feedback in markdown format with the following sections:
        
        ### **Overall Impression**
        - A brief, high-level summary of the image's strengths and mood.

        ### **Strengths (What Works Well)**
        -   **Composition**: Point out specific elements that are well-placed (e.g., "Excellent use of the rule of thirds to position the subject...").
        -   **Lighting**: Comment on positive aspects of the lighting (e.g., "The soft key light creates a flattering look...").
        -   **Color Palette**: Note any harmonious or effective color choices.
        -   **Storytelling**: Describe the narrative or emotional impact that is successfully conveyed.

        ### **Areas for Improvement (Actionable Suggestions)**
        -   **Composition**: Suggest specific changes to improve balance or focus (e.g., "Consider cropping the left side to remove the distracting element...").
        -   **Lighting**: Provide concrete advice on lighting adjustments (e.g., "The shadows on the right are a bit harsh; try adding a soft fill light or a reflector to lift them.").
        -   **Color Grading**: Suggest color adjustments to enhance the mood (e.g., "Lowering the overall saturation and adding a subtle blue tint in the shadows could create a more cinematic, moody feel.").
        -   **Subject/Focus**: Recommend ways to make the main subject pop (e.g., "A slight vignette could help draw the viewer's eye more directly to the center.").

        Be specific and use professional terminology, but keep the tone encouraging and helpful.
        `
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });

    return response.text;
};

// 12. AI Lighting & Shadow Lab
export interface RelightParams {
    image: File;
    lightType: string;
    lightDirection: string;
    intensity: number; // 0-100
    colorTemperature: number; // in Kelvin
}

export const relightImage = async (params: RelightParams): Promise<string> => {
    const { image, lightType, lightDirection, intensity, colorTemperature } = params;

    const imagePart = await fileToGenerativePart(image);

    const fullPrompt = `
    **Task**: Professional AI Virtual Lighting Studio.
    **Objective**: Re-light the provided image with a new, physically accurate light source, simulating realistic shadows and reflections.

    **Input Image**: The user has provided an image to be re-lit.

    **Lighting Setup**:
    - **Light Type**: ${lightType}. This defines the quality of the light (e.g., a 'Softbox' creates diffuse light, a 'Spotlight' creates a hard, focused beam).
    - **Light Direction**: The primary light should come from the **${lightDirection}**.
    - **Light Intensity**: The strength of the light should be at ${intensity}%.
    - **Light Color Temperature**: The color of the light should be approximately ${colorTemperature}K (lower is warmer/orange, higher is cooler/blue).

    **AI Instructions**:
    1.  **Scene Analysis**: Analyze the input image to understand its 3D geometry, subject, and surface materials.
    2.  **Isolate Subject**: If there is a clear subject, isolate it from the background to apply the new lighting accurately.
    3.  **Remove Old Lighting**: Neutralize the existing lighting and shadows in the original image.
    4.  **Apply New Light Source**: Introduce a new virtual light source according to the specified 'Lighting Setup'. The new light must wrap realistically around the subjects and environment.
    5.  **Simulate Shadows & Reflections**: This is critical. Cast physically correct, soft or hard shadows based on the new light source. Generate accurate specular highlights and reflections on surfaces like eyes, metal, or water.
    6.  **Recompose Scene**: Blend the re-lit subject and background back into a single, cohesive, and photorealistic image.

    **Output Requirement**: A single, final, re-rendered image. Do not output any text, borders, or explanations.
    `;
    
    const textPart = { text: fullPrompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: { responseModalities: [Modality.IMAGE] },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
    }
    
    throw new Error('No re-lit image was returned.');
};