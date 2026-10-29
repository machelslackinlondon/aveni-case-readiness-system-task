import { TenantRepository } from "../repositories/tenant-repository";
import { TenantService } from "./tenant-service";

describe("TenantService", () => {
  it("creates and lists tenants", () => {
    const service = new TenantService(new TenantRepository());

    expect(
      service.create({
        id: "tenant-1",
        name: "North Office",
      }),
    ).toEqual({
      id: "tenant-1",
      name: "North Office",
    });
    expect(service.list()).toEqual([
      {
        id: "tenant-1",
        name: "North Office",
      },
    ]);
  });

  it("rejects duplicate tenant identifiers", () => {
    const service = new TenantService(new TenantRepository());
    service.create({
      id: "tenant-1",
      name: "North Office",
    });

    expect(() =>
      service.create({
        id: "tenant-1",
        name: "Another Office",
      }),
    ).toThrow("Tenant tenant-1 already exists.");
  });

  it("saves and retrieves a tenant rule", () => {
    const service = new TenantService(new TenantRepository());
    service.create({
      id: "tenant-1",
      name: "North Office",
    });
    const rule = {
      type: "countAtLeast" as const,
      artifactType: "document" as const,
      count: 2,
    };

    expect(service.saveRule("tenant-1", rule)).toEqual(rule);
    expect(service.getRule("tenant-1")).toEqual(rule);
  });

  it("rejects rules for an unknown tenant", () => {
    const service = new TenantService(new TenantRepository());

    expect(() =>
      service.saveRule("missing", {
        type: "countAtLeast",
        artifactType: "call",
        count: 1,
      }),
    ).toThrow("Tenant missing was not found.");
  });
});
