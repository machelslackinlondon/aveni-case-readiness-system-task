import { ServiceError } from "../services/service-error";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getServiceErrorStatus(error: ServiceError) {
  if (
    error.code === "TENANT_ALREADY_EXISTS" ||
    error.code === "CASE_ALREADY_EXISTS" ||
    error.code === "ARTIFACT_ALREADY_EXISTS"
  ) {
    return 409;
  }

  if (
    error.code === "TENANT_NOT_FOUND" ||
    error.code === "CASE_NOT_FOUND"
  ) {
    return 404;
  }

  return 403;
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
        },
      },
      {
        status: error.status,
      },
    );
  }

  if (error instanceof ServiceError) {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
        },
      },
      {
        status: getServiceErrorStatus(error),
      },
    );
  }

  return Response.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
      },
    },
    {
      status: 500,
    },
  );
}

export async function withApiErrorHandling(
  operation: () => Response | Promise<Response>,
) {
  try {
    return await operation();
  } catch (error) {
    return errorResponse(error);
  }
}
