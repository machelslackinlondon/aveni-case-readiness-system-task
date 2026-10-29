import type { Artifact, CaseState } from "../domain/types";
import type { ArtifactRepository } from "../repositories/artifact-repository";
import type { CaseRepository } from "../repositories/case-repository";
import type { ReadinessService } from "./readiness-service";
import { ServiceError } from "./service-error";

type AddArtifactResult = {
  artifact: Artifact;
  case: CaseState;
};

export class ArtifactService {
  constructor(
    private readonly artifacts: ArtifactRepository,
    private readonly cases: CaseRepository,
    private readonly readiness: ReadinessService,
  ) {}

  add(artifact: Artifact): AddArtifactResult {
    const caseState = this.cases.getById(artifact.caseId);

    if (caseState === undefined) {
      throw new ServiceError(
        "CASE_NOT_FOUND",
        `Case ${artifact.caseId} was not found.`,
      );
    }

    if (caseState.tenantId !== artifact.tenantId) {
      throw new ServiceError(
        "TENANT_SCOPE_MISMATCH",
        `Case ${artifact.caseId} does not belong to tenant ${artifact.tenantId}.`,
      );
    }

    if (this.artifacts.hasId(artifact.id)) {
      throw new ServiceError(
        "ARTIFACT_ALREADY_EXISTS",
        `Artifact ${artifact.id} already exists.`,
      );
    }

    this.artifacts.save(artifact);

    return {
      artifact: { ...artifact },
      case: this.readiness.refresh(artifact.caseId),
    };
  }
}
