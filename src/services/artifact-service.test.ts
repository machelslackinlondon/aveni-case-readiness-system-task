import { InMemoryReadinessNotifier } from "../notifiers/readiness-notifier";
import { ArtifactRepository } from "../repositories/artifact-repository";
import { CaseRepository } from "../repositories/case-repository";
import { TenantRepository } from "../repositories/tenant-repository";
import { ArtifactService } from "./artifact-service";
import { ReadinessService } from "./readiness-service";

function createService() {
  const tenants = new TenantRepository();
  tenants.save({
    id: "tenant-1",
    name: "North Office",
  });
  tenants.saveRule("tenant-1", {
    type: "countAtLeast",
    artifactType: "document",
    count: 1,
  });

  const cases = new CaseRepository();
  cases.save({
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

  const artifacts = new ArtifactRepository();
  const readiness = new ReadinessService(
    cases,
    artifacts,
    tenants,
    new InMemoryReadinessNotifier(),
  );

  return new ArtifactService(artifacts, cases, readiness);
}

describe("ArtifactService", () => {
  it("stores an artifact and refreshes case readiness", () => {
    const service = createService();

    expect(
      service.add({
        id: "artifact-1",
        caseId: "case-1",
        tenantId: "tenant-1",
        type: "document",
      }),
    ).toEqual({
      artifact: {
        id: "artifact-1",
        caseId: "case-1",
        tenantId: "tenant-1",
        type: "document",
      },
      case: {
        id: "case-1",
        tenantId: "tenant-1",
        name: "Mortgage advice review",
        ready: true,
        artifactCounts: {
          call: 0,
          document: 1,
          email: 0,
        },
      },
    });
  });

  it("rejects duplicate artifact identifiers", () => {
    const service = createService();
    const artifact = {
      id: "artifact-1",
      caseId: "case-1",
      tenantId: "tenant-1",
      type: "document" as const,
    };
    service.add(artifact);

    expect(() => service.add(artifact)).toThrow(
      "Artifact artifact-1 already exists.",
    );
  });

  it("rejects an artifact outside the case tenant scope", () => {
    const service = createService();

    expect(() =>
      service.add({
        id: "artifact-1",
        caseId: "case-1",
        tenantId: "tenant-2",
        type: "call",
      }),
    ).toThrow("Case case-1 does not belong to tenant tenant-2.");
  });
});
