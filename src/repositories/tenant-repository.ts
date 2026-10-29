import type { Rule, Tenant } from "../domain/types";

function cloneRule(rule: Rule): Rule {
  if (rule.type === "countAtLeast") {
    return { ...rule };
  }

  return {
    type: rule.type,
    rules: rule.rules.map(cloneRule),
  };
}

export class TenantRepository {
  private readonly tenants = new Map<string, Tenant>();
  private readonly rules = new Map<string, Rule>();

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

  saveRule(tenantId: string, rule: Rule) {
    const storedRule = cloneRule(rule);
    this.rules.set(tenantId, storedRule);

    return cloneRule(storedRule);
  }

  getRule(tenantId: string): Rule | undefined {
    const rule = this.rules.get(tenantId);

    return rule === undefined ? undefined : cloneRule(rule);
  }
}
