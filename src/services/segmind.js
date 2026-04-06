const SEGMIND_API_URL = "https://api.segmind.com/v1/idm-vton";
const UPLOAD_API_URL = "https://api.segmind.com/v1/upload-asset";

export const uploadToSegmind = async (base64Data, apiKey) => {
  if (!apiKey) throw new Error("API Key is required");

  // Segmind upload asset API expects data URL
  const response = await fetch(UPLOAD_API_URL, {
    method: 'POST',
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "image": base64Data
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${error}`);
  }

  const data = await response.json();
  return data.url; // Assuming Segmind returns { url: "..." }
};

export const runVirtualTryOn = async (params, apiKey) => {
  if (!apiKey) throw new Error("API Key is required");

  const response = await fetch(SEGMIND_API_URL, {
    method: 'POST',
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...params,
      crop: params.crop || false,
      seed: params.seed || 42,
      steps: params.steps || 30,
      category: params.category || "upper_body",
      force_dc: params.force_dc || false,
      mask_only: params.mask_only || false,
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Try-on failed: ${error}`);
  }

  // Segmind IDM-VTON returns a binary image or a JSON with URL?
  // User's snippet says response.json() and print(json.dumps(result, indent=2))
  // Usually it returns an image directly as a base64 in JSON or similar.
  const data = await response.json();
  return data;
};
