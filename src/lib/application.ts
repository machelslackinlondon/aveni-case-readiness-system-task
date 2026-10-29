import { InMemoryReadinessNotifier } from "../notifiers/readiness-notifier";
import { ArtifactRepository } from "../repositories/artifact-repository";
import { CaseRepository } from "../repositories/case-repository";
import { TenantRepository } from "../repositories/tenant-repository";
import { ArtifactService } from "../services/artifact-service";
import { CaseService } from "../services/case-service";
import { ReadinessService } from "../services/readiness-service";
import { TenantService } from "../services/tenant-service";

export type Application = {
  tenants: TenantService;
  cases: CaseService;
  artifacts: ArtifactService;
  notifier: InMemoryReadinessNotifier;
};

type ApplicationGlobal = typeof globalThis & {
  __caseReadinessApplication?: Application;
};

export function createApplication(): Application {
  const tenantRepository = new TenantRepository();
  const caseRepository = new CaseRepository();
  const artifactRepository = new ArtifactRepository();
  const notifier = new InMemoryReadinessNotifier();

  const readiness = new ReadinessService(
    caseRepository,
    artifactRepository,
    tenantRepository,
    notifier,
  );

  return {
    tenants: new TenantService(tenantRepository),
    cases: new CaseService(caseRepository, tenantRepository),
    artifacts: new ArtifactService(
      artifactRepository,
      caseRepository,
      readiness,
    ),
    notifier,
  };
}

export function getApplication() {
  const applicationGlobal = globalThis as ApplicationGlobal;

  if (applicationGlobal.__caseReadinessApplication === undefined) {
    applicationGlobal.__caseReadinessApplication = createApplication();
  }

  return applicationGlobal.__caseReadinessApplication;
}
