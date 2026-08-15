/** Inference models offered by the network.
 *
 *  This mirrors the orchestrator's MODEL_CATALOG. `GET /v1/models` is the live
 *  source of truth — it returns the same ids plus an `available` flag that
 *  flips as nodes connect and disconnect. The flags below are the steady state
 *  and only gate the playground's dropdowns; a request for a model no node is
 *  serving still comes back as 503 no_chat_provider / no_image_provider.
 */
export interface ModelOption {
  id: string;
  label: string;
  /** False for models in the catalog that no node currently serves. */
  available: boolean;
  context: string;
}

export const MODELS: ModelOption[] = [
  { id: "qwen-2.5-7b", label: "Qwen 2.5 7B", available: true, context: "32k" },
  { id: "mistral-7b", label: "Mistral 7B", available: false, context: "32k" },
  {
    id: "llama-3.1-8b-quantized",
    label: "Llama 3.1 8B (quantized)",
    available: false,
    context: "8k",
  },
];

export const DEFAULT_MODEL = "qwen-2.5-7b";

/** Generation defaults — match the backend ChatCompletionRequest schema. */
export const GENERATION_LIMITS = {
  temperature: { min: 0, max: 2, step: 0.1, default: 0.7 },
  maxTokens: { min: 1, max: 4096, step: 1, default: 512 },
} as const;

export interface ImageModelOption {
  id: string;
  label: string;
  available: boolean;
  /** Largest size the model will generate, `WIDTHxHEIGHT`. Mirrors the
   *  catalog's `max_size`, which the backend validates every request against. */
  maxSize: string;
}

/** Image models offered by the network (POST /v1/images/generations). */
export const IMAGE_MODELS: ImageModelOption[] = [
  { id: "orvix-image-1", label: "Orvix Image 1", available: true, maxSize: "1024x1024" },
  { id: "flux-schnell", label: "FLUX.1 Schnell", available: true, maxSize: "1536x1536" },
];

export const DEFAULT_IMAGE_MODEL = "orvix-image-1";

/** Every size the endpoint understands, `WIDTHxHEIGHT`, ascending by area.
 *  Whether a *given model* accepts one is narrower — see {@link sizesForModel}.
 *  Display with × via {@link formatImageSize}. */
export const IMAGE_SIZES = [
  "256x256",
  "512x512",
  "1024x1024",
  "1024x1792",
  "1792x1024",
  "1536x1536",
] as const;

export const DEFAULT_IMAGE_SIZE = "1024x1024";

/** The sizes a model can actually produce: those fitting inside its `maxSize`.
 *  Offering the rest would only trade a disabled option for a 400 invalid_size
 *  after the request has already left. Unknown ids fall back to the full list. */
export function sizesForModel(modelId: string): string[] {
  const model = IMAGE_MODELS.find((m) => m.id === modelId);
  if (!model) return [...IMAGE_SIZES];
  const [maxWidth, maxHeight] = model.maxSize.split("x").map(Number);
  return IMAGE_SIZES.filter((size) => {
    const [width, height] = size.split("x").map(Number);
    return width <= maxWidth && height <= maxHeight;
  });
}

/** Keep `size` if the model can produce it, else fall back to the largest it can. */
export function coerceImageSize(modelId: string, size: string): string {
  const options = sizesForModel(modelId);
  return options.includes(size) ? size : options[options.length - 1];
}

/**
 * Video generation, served by the network.
 *
 * `orvix-video-1` (LTX-Video through Diffusers) is in the orchestrator catalog
 * and a video-capable node is live, so the playground submits real clips via
 * POST /v1/videos/generations and the response is a finished clip URL.
 */
export const VIDEO_PREVIEW = {
  id: "orvix-video-1",
  label: "Video",
  status: "Live",
  summary: "Text prompt in, a short clip out.",
  /** The honest one-liner. No date, no price, no queue — none of those exist. */
  state:
    "The network serves it: orvix-video-1 is in the catalog and a video-capable node is live, so POST /v1/videos/generations returns a finished clip URL.",
  hardware:
    "It also needs dedicated hardware — a clip takes minutes, and the machine serves nothing else while it renders.",
} as const;

/** Video model catalog entry shape, mirroring what GET /v1/models returns. */
export interface VideoModelOption {
  id: string;
  label: string;
  available: boolean;
  /** Smallest/largest clip the model will render, in seconds. */
  durationSeconds: [number, number];
}

/**
 * Video models. `orvix-video-1` is live in the catalog and served by a node;
 * VideoPanel reads the live `GET /v1/models` `available` flag to decide between
 * the working form and the waiting-for-GPU state.
 */
export const VIDEO_MODELS: VideoModelOption[] = [
  {
    id: "orvix-video-1",
    label: "Orvix Video 1",
    available: true,
    durationSeconds: [5, 10],
  },
];

export const DEFAULT_VIDEO_MODEL = "orvix-video-1";

/** Prompt length bounds and clip-length bounds for the video playground. */
export const VIDEO_PROMPT_LIMITS = { min: 3, max: 1000 } as const;
export const VIDEO_DURATION = { min: 5, max: 10, default: 5 } as const;

/** How often the video panel polls a running job's status, in milliseconds. */
export const VIDEO_POLL_INTERVAL_MS = 5_000;

/** Prompt length bounds and image-count bounds for the image playground. */
export const IMAGE_PROMPT_LIMITS = { min: 3, max: 1000 } as const;
export const IMAGE_COUNT = { min: 1, max: 4, default: 1 } as const;

/** "1024x1024" → "1024 × 1024" for display. */
export function formatImageSize(size: string): string {
  return size.replace("x", " × ");
}
