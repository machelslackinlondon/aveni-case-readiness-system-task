import type { CaseState } from "../domain/types";

function cloneCase(caseState: CaseState): CaseState {
  return {
    ...caseState,
    artifactCounts: {
      ...caseState.artifactCounts,
    },
  };
}

export class CaseRepository {
  private readonly cases = new Map<string, CaseState>();

  save(caseState: CaseState) {
    this.cases.set(caseState.id, cloneCase(caseState));
  }

  getById(id: string): CaseState | undefined {
    const caseState = this.cases.get(id);

    return caseState === undefined ? undefined : cloneCase(caseState);
  }

  listByTenant(tenantId: string): CaseState[] {
    return Array.from(this.cases.values())
      .filter((caseState) => caseState.tenantId === tenantId)
      .map(cloneCase);
  }
}
