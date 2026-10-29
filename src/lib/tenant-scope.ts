import { ApiError } from "./api-error";
import { readIdentifier } from "./validation";

export function readTenantScope(
  request: Request,
  options: {
    requireQuery: boolean;
  },
) {
  const headerTenantId = request.headers.get("x-tenant-id");

  if (headerTenantId === null) {
    throw new ApiError(
      400,
      "TENANT_SCOPE_REQUIRED",
      "X-Tenant-Id header is required.",
    );
  }

  const tenantId = readIdentifier(headerTenantId, "X-Tenant-Id");

  if (!options.requireQuery) {
    return tenantId;
  }

  const queryTenantId = new URL(request.url).searchParams.get("tenantId");

  if (queryTenantId === null) {
    throw new ApiError(
      400,
      "TENANT_SCOPE_REQUIRED",
      "tenantId query parameter is required.",
    );
  }

  const validatedQueryTenantId = readIdentifier(queryTenantId, "tenantId");

  if (tenantId !== validatedQueryTenantId) {
    throw new ApiError(
      400,
      "TENANT_SCOPE_MISMATCH",
      "X-Tenant-Id must match the tenantId query parameter.",
    );
  }

  return tenantId;
}
