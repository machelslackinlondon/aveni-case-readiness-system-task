import { evaluateRule } from "../domain/readiness-rule";
import type { ArtifactCounts, CaseState } from "../domain/types";
import type { ReadinessNotifier } from "../notifiers/readiness-notifier";
import type { ArtifactRepository } from "../repositories/artifact-repository";
import type { CaseRepository } from "../repositories/case-repository";
import type { TenantRepository } from "../repositories/tenant-repository";
import { ServiceError } from "./service-error";

export class ReadinessService {
  constructor(
    private readonly cases: CaseRepository,
    private readonly artifacts: ArtifactRepository,
    private readonly tenants: TenantRepository,
    private readonly notifier: ReadinessNotifier,
  ) {}

  refresh(caseId: string): CaseState {
    const caseState = this.cases.getById(caseId);

    if (caseState === undefined) {
      throw new ServiceError(
        "CASE_NOT_FOUND",
        `Case ${caseId} was not found.`,
      );
    }

    const artifactCounts: ArtifactCounts = {
      call: 0,
      document: 0,
      email: 0,
    };

    for (const artifact of this.artifacts.listByCase(caseId)) {
      artifactCounts[artifact.type] += 1;
    }

    const rule = this.tenants.getRule(caseState.tenantId);
    const ready = rule !== undefined && evaluateRule(rule, artifactCounts);
    const updatedCase: CaseState = {
      ...caseState,
      ready,
      artifactCounts,
    };
    this.cases.save(updatedCase);

    if (!caseState.ready && ready) {
      this.notifier.notify({
        caseId,
        tenantId: caseState.tenantId,
      });
    }

    return updatedCase;
  }
}
