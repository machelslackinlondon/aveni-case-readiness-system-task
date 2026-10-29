import type { Tenant } from "../domain/types";

export class TenantRepository {
  private readonly tenants = new Map<string, Tenant>();

  save(tenant: Tenant) {
    this.tenants.set(tenant.id, { ...tenant });
  }

  getById(id: string): Tenant | undefined {
    const tenant = this.tenants.get(id);

    return tenant === undefined ? undefined : { ...tenant };
  }

  list(): Tenant[] {
    return Array.from(this.tenants.values(), (tenant) => ({ ...tenant }));
  }
}
