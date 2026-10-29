import { ArtifactRepository } from "./artifact-repository";

describe("ArtifactRepository", () => {
  it("stores and lists artifacts by case", () => {
    const repository = new ArtifactRepository();
    repository.save({
      id: "artifact-1",
      caseId: "case-1",
      tenantId: "tenant-1",
      type: "document",
    });
    repository.save({
      id: "artifact-2",
      caseId: "case-2",
      tenantId: "tenant-1",
      type: "call",
    });

    expect(repository.listByCase("case-1")).toEqual([
      {
        id: "artifact-1",
        caseId: "case-1",
        tenantId: "tenant-1",
        type: "document",
      },
    ]);
  });

  it("detects existing artifact identifiers", () => {
    const repository = new ArtifactRepository();
    repository.save({
      id: "artifact-1",
      caseId: "case-1",
      tenantId: "tenant-1",
      type: "email",
    });

    expect(repository.hasId("artifact-1")).toBe(true);
    expect(repository.hasId("artifact-2")).toBe(false);
  });

  it("protects stored artifacts from caller mutation", () => {
    const repository = new ArtifactRepository();
    const artifact = {
      id: "artifact-1",
      caseId: "case-1",
      tenantId: "tenant-1",
      type: "document" as const,
    };
    repository.save(artifact);

    artifact.caseId = "changed-input";
    const storedArtifacts = repository.listByCase("case-1");
    storedArtifacts[0].caseId = "changed-result";

    expect(repository.listByCase("case-1")).toEqual([
      {
        id: "artifact-1",
        caseId: "case-1",
        tenantId: "tenant-1",
        type: "document",
      },
    ]);
  });
});
