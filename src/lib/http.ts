import { ApiError } from "./api-error";

const MAX_JSON_BODY_BYTES = 64 * 1024;

export async function readJsonBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type");
  const mediaType = contentType?.split(";", 1)[0].trim().toLowerCase();

  if (mediaType !== "application/json") {
    throw new ApiError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Content-Type must be application/json.",
    );
  }

  const body = await request.text();
  const bodySize = new TextEncoder().encode(body).byteLength;

  if (bodySize > MAX_JSON_BODY_BYTES) {
    throw new ApiError(
      413,
      "PAYLOAD_TOO_LARGE",
      "Request body must not exceed 64 KiB.",
    );
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new ApiError(
      400,
      "INVALID_JSON",
      "Request body must contain valid JSON.",
    );
  }
}
