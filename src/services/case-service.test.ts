import { CaseRepository } from "../repositories/case-repository";
import { TenantRepository } from "../repositories/tenant-repository";
import { CaseService } from "./case-service";

function createService() {
  const tenants = new TenantRepository();
  tenants.save({
    id: "tenant-1",
    name: "North Office",
  });
  tenants.save({
    id: "tenant-2",
    name: "South Office",
  });

  return new CaseService(new CaseRepository(), tenants);
}

describe("CaseService", () => {
  it("creates a not-ready case for an existing tenant", () => {
    const service = createService();

    expect(
      service.create({
        id: "case-1",
        tenantId: "tenant-1",
        name: "Mortgage advice review",
      }),
    ).toEqual({
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
  });

  it("rejects a case for an unknown tenant", () => {
    const service = createService();

    expect(() =>
      service.create({
        id: "case-1",
        tenantId: "missing",
        name: "Mortgage advice review",
      }),
    ).toThrow("Tenant missing was not found.");
  });

  it("rejects duplicate case identifiers", () => {
    const service = createService();
    service.create({
      id: "case-1",
      tenantId: "tenant-1",
      name: "Mortgage advice review",
    });

    expect(() =>
      service.create({
        id: "case-1",
        tenantId: "tenant-1",
        name: "Another review",
      }),
    ).toThrow("Case case-1 already exists.");
  });

  it("lists and retrieves cases within tenant scope", () => {
    const service = createService();
    service.create({
      id: "case-1",
      tenantId: "tenant-1",
      name: "Mortgage advice review",
    });
    service.create({
      id: "case-2",
      tenantId: "tenant-2",
      name: "Pension transfer review",
    });

    expect(service.list("tenant-1")).toHaveLength(1);
    expect(service.get("tenant-1", "case-1").id).toBe("case-1");
    expect(() => service.get("tenant-2", "case-1")).toThrow(
      "Case case-1 does not belong to tenant tenant-2.",
    );
  });
});
