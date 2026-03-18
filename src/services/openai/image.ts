import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GenerateImageOptions = {
  model: string;
  size: string;
  quality: string;
  format: string;
  background: string;
};

type OpenAIImageResponse = {
  data: Array<{ b64_json?: string; url?: string }>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ─── Service ──────────────────────────────────────────────────────────────────

export async function generateImage(
  apiKey: string,
  prompt: string,
  options: GenerateImageOptions,
): Promise<{ b64: string; format: string }> {
  const body: Record<string, unknown> = {
    model: options.model,
    prompt,
    n: 1,
    size: options.size,
  };

  if (options.model === "dall-e-3") {
    body.quality = options.quality;
  }

  if (options.model === "gpt-image-1") {
    body.output_format = options.format;
    if (options.background === "transparent") {
      body.background = "transparent";
    }
  }

  const { data } = await axios.post<OpenAIImageResponse>(
    "https://api.openai.com/v1/images/generations",
    body,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  const imageData = data.data[0];

  if (imageData.b64_json) {
    return { b64: imageData.b64_json, format: options.format };
  }

  if (imageData.url) {
    const imgRes = await axios.get<Blob>(imageData.url, {
      responseType: "blob",
    });
    const b64 = await blobToBase64(imgRes.data);
    return { b64, format: options.format };
  }

  throw new Error("No image data received from API");
}
