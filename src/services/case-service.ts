import type { CaseState } from "../domain/types";
import type { CaseRepository } from "../repositories/case-repository";
import type { TenantRepository } from "../repositories/tenant-repository";
import { ServiceError } from "./service-error";

type CreateCaseInput = Pick<CaseState, "id" | "tenantId" | "name">;

export class CaseService {
  constructor(
    private readonly cases: CaseRepository,
    private readonly tenants: TenantRepository,
  ) {}

  create(input: CreateCaseInput): CaseState {
    this.requireTenant(input.tenantId);

    if (this.cases.getById(input.id) !== undefined) {
      throw new ServiceError(
        "CASE_ALREADY_EXISTS",
        `Case ${input.id} already exists.`,
      );
    }

    const caseState: CaseState = {
      ...input,
      ready: false,
      artifactCounts: {
        call: 0,
        document: 0,
        email: 0,
      },
    };
    this.cases.save(caseState);

    return this.get(input.tenantId, input.id);
  }

  list(tenantId: string): CaseState[] {
    this.requireTenant(tenantId);

    return this.cases.listByTenant(tenantId);
  }

  get(tenantId: string, caseId: string): CaseState {
    const caseState = this.cases.getById(caseId);

    if (caseState === undefined) {
      throw new ServiceError(
        "CASE_NOT_FOUND",
        `Case ${caseId} was not found.`,
      );
    }

    if (caseState.tenantId !== tenantId) {
      throw new ServiceError(
        "TENANT_SCOPE_MISMATCH",
        `Case ${caseId} does not belong to tenant ${tenantId}.`,
      );
    }

    return caseState;
  }

  private requireTenant(tenantId: string) {
    if (this.tenants.getById(tenantId) === undefined) {
      throw new ServiceError(
        "TENANT_NOT_FOUND",
        `Tenant ${tenantId} was not found.`,
      );
    }
  }
}
