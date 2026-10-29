import { TenantRepository } from "./tenant-repository";

describe("TenantRepository", () => {
  it("stores and retrieves a tenant", () => {
    const repository = new TenantRepository();

    repository.save({
      id: "tenant-1",
      name: "North Office",
    });

    expect(repository.getById("tenant-1")).toEqual({
      id: "tenant-1",
      name: "North Office",
    });
  });

  it("lists every stored tenant", () => {
    const repository = new TenantRepository();
    repository.save({
      id: "tenant-1",
      name: "North Office",
    });
    repository.save({
      id: "tenant-2",
      name: "South Office",
    });

    expect(repository.list()).toEqual([
      {
        id: "tenant-1",
        name: "North Office",
      },
      {
        id: "tenant-2",
        name: "South Office",
      },
    ]);
  });

  it("protects stored tenants from caller mutation", () => {
    const repository = new TenantRepository();
    const tenant = {
      id: "tenant-1",
      name: "North Office",
    };
    repository.save(tenant);

    tenant.name = "Changed input";
    const storedTenant = repository.getById("tenant-1");
    if (storedTenant === undefined) {
      throw new Error("Expected the tenant to exist.");
    }
    storedTenant.name = "Changed result";

    expect(repository.getById("tenant-1")).toEqual({
      id: "tenant-1",
      name: "North Office",
    });
  });
});
