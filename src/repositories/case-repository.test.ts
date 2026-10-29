import { CaseRepository } from "./case-repository";

describe("CaseRepository", () => {
  it("stores and retrieves a case", () => {
    const repository = new CaseRepository();
    repository.save({
      id: "case-1",
      tenantId: "tenant-1",
      name: "Mortgage advice review",
      ready: false,
      artifactCounts: {
        call: 0,
        document: 1,
        email: 0,
      },
    });

    expect(repository.getById("case-1")).toEqual({
      id: "case-1",
      tenantId: "tenant-1",
      name: "Mortgage advice review",
      ready: false,
      artifactCounts: {
        call: 0,
        document: 1,
        email: 0,
      },
    });
  });

  it("lists only cases owned by the requested tenant", () => {
    const repository = new CaseRepository();
    repository.save({
      id: "case-1",
      tenantId: "tenant-1",
      name: "Mortgage advice review",
      ready: false,
      artifactCounts: {
        call: 0,
        document: 0,
        email: 0,
      },
    });
    repository.save({
      id: "case-2",
      tenantId: "tenant-2",
      name: "Pension transfer review",
      ready: true,
      artifactCounts: {
        call: 1,
        document: 2,
        email: 1,
      },
    });

    expect(repository.listByTenant("tenant-1")).toEqual([
      {
        id: "case-1",
        tenantId: "tenant-1",
        name: "Mortgage advice review",
        ready: false,
        artifactCounts: {
          call: 0,
          document: 0,
          email: 0,
        },
      },
    ]);
  });

  it("protects nested case state from caller mutation", () => {
    const repository = new CaseRepository();
    const caseState = {
      id: "case-1",
      tenantId: "tenant-1",
      name: "Mortgage advice review",
      ready: false,
      artifactCounts: {
        call: 0,
        document: 1,
        email: 0,
      },
    };
    repository.save(caseState);

    caseState.artifactCounts.document = 99;
    const storedCase = repository.getById("case-1");
    if (storedCase === undefined) {
      throw new Error("Expected the case to exist.");
    }
    storedCase.artifactCounts.document = 42;

    expect(repository.getById("case-1")?.artifactCounts.document).toBe(1);
  });
});
