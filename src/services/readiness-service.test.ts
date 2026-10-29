import { InMemoryReadinessNotifier } from "../notifiers/readiness-notifier";
import { ArtifactRepository } from "../repositories/artifact-repository";
import { CaseRepository } from "../repositories/case-repository";
import { TenantRepository } from "../repositories/tenant-repository";
import { ReadinessService } from "./readiness-service";

describe("ReadinessService", () => {
  it("records readiness and notifies only on the transition to ready", () => {
    const tenants = new TenantRepository();
    tenants.save({
      id: "tenant-1",
      name: "North Office",
    });
    tenants.saveRule("tenant-1", {
      type: "countAtLeast",
      artifactType: "document",
      count: 2,
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
    const notifier = new InMemoryReadinessNotifier();
    const service = new ReadinessService(
      cases,
      artifacts,
      tenants,
      notifier,
    );

    artifacts.save({
      id: "artifact-1",
      caseId: "case-1",
      tenantId: "tenant-1",
      type: "document",
    });
    expect(service.refresh("case-1")).toMatchObject({
      ready: false,
      artifactCounts: {
        call: 0,
        document: 1,
        email: 0,
      },
    });
    expect(notifier.list()).toEqual([]);

    artifacts.save({
      id: "artifact-2",
      caseId: "case-1",
      tenantId: "tenant-1",
      type: "document",
    });
    expect(service.refresh("case-1")).toMatchObject({
      ready: true,
      artifactCounts: {
        call: 0,
        document: 2,
        email: 0,
      },
    });
    expect(notifier.list()).toEqual([
      {
        caseId: "case-1",
        tenantId: "tenant-1",
      },
    ]);

    service.refresh("case-1");
    expect(notifier.list()).toHaveLength(1);
  });
});
