import type { Artifact } from "../domain/types";

export class ArtifactRepository {
  private readonly artifacts = new Map<string, Artifact>();

  save(artifact: Artifact) {
    this.artifacts.set(artifact.id, { ...artifact });
  }

  listByCase(caseId: string): Artifact[] {
    return Array.from(this.artifacts.values())
      .filter((artifact) => artifact.caseId === caseId)
      .map((artifact) => ({ ...artifact }));
  }

  hasId(id: string) {
    return this.artifacts.has(id);
  }
}
