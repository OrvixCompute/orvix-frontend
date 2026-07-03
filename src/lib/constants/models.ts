/** Inference models offered by the network. No list endpoint exists yet, so
 *  this mirrors the pricing table on the landing page. */
export interface ModelOption {
  id: string;
  label: string;
  /** False for models that are announced but not yet servable. */
  available: boolean;
  context: string;
}

export const MODELS: ModelOption[] = [
  { id: "qwen-2.5-7b", label: "Qwen 2.5 7B", available: true, context: "32k" },
  { id: "llama-3-8b", label: "Llama 3 8B", available: false, context: "8k" },
];

export const DEFAULT_MODEL = "qwen-2.5-7b";

/** Generation defaults — match the backend ChatCompletionRequest schema. */
export const GENERATION_LIMITS = {
  temperature: { min: 0, max: 2, step: 0.1, default: 0.7 },
  maxTokens: { min: 1, max: 4096, step: 1, default: 512 },
} as const;

/** Image models offered by the network (POST /v1/images/generations). */
export const IMAGE_MODELS: ModelOption[] = [
  { id: "flux-schnell", label: "FLUX.1 Schnell", available: true, context: "1024px" },
];

export const DEFAULT_IMAGE_MODEL = "flux-schnell";

/** Supported output sizes, `WIDTHxHEIGHT`. Display with × via {@link formatImageSize}. */
export const IMAGE_SIZES = [
  "1024x1024",
  "1024x1792",
  "1792x1024",
  "512x512",
  "1536x1536",
] as const;

export const DEFAULT_IMAGE_SIZE = "1024x1024";

/** Prompt length bounds and image-count bounds for the image playground. */
export const IMAGE_PROMPT_LIMITS = { min: 3, max: 1000 } as const;
export const IMAGE_COUNT = { min: 1, max: 4, default: 1 } as const;

/** "1024x1024" → "1024 × 1024" for display. */
export function formatImageSize(size: string): string {
  return size.replace("x", " × ");
}
