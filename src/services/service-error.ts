export type ServiceErrorCode =
  | "TENANT_ALREADY_EXISTS"
  | "TENANT_NOT_FOUND"
  | "CASE_ALREADY_EXISTS"
  | "CASE_NOT_FOUND"
  | "TENANT_SCOPE_MISMATCH"
  | "ARTIFACT_ALREADY_EXISTS";

export class ServiceError extends Error {
  constructor(
    readonly code: ServiceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
