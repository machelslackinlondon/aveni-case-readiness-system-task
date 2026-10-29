import type { Rule, Tenant } from "../domain/types";
import type { TenantRepository } from "../repositories/tenant-repository";
import { ServiceError } from "./service-error";

export class TenantService {
  constructor(private readonly tenants: TenantRepository) {}

  create(tenant: Tenant) {
    if (this.tenants.getById(tenant.id) !== undefined) {
      throw new ServiceError(
        "TENANT_ALREADY_EXISTS",
        `Tenant ${tenant.id} already exists.`,
      );
    }

    this.tenants.save(tenant);

    return this.requireTenant(tenant.id);
  }

  list(): Tenant[] {
    return this.tenants.list();
  }

  saveRule(tenantId: string, rule: Rule) {
    this.requireTenant(tenantId);

    return this.tenants.saveRule(tenantId, rule);
  }

  getRule(tenantId: string): Rule | undefined {
    this.requireTenant(tenantId);

    return this.tenants.getRule(tenantId);
  }

  private requireTenant(tenantId: string) {
    const tenant = this.tenants.getById(tenantId);

    if (tenant === undefined) {
      throw new ServiceError(
        "TENANT_NOT_FOUND",
        `Tenant ${tenantId} was not found.`,
      );
    }

    return tenant;
  }
}
