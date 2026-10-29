import {
  createApplication,
  type Application,
} from "../lib/application";

type ApplicationGlobal = typeof globalThis & {
  __caseReadinessApplication?: Application;
};

export function installFreshApplication() {
  const application = createApplication();
  const applicationGlobal = globalThis as ApplicationGlobal;
  applicationGlobal.__caseReadinessApplication = application;

  return application;
}
