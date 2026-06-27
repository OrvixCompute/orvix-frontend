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
