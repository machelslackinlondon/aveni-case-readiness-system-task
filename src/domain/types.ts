export type ArtifactType = "call" | "document" | "email";

export type ArtifactCounts = {
  call: number;
  document: number;
  email: number;
};

export type Tenant = {
  id: string;
  name: string;
};

export type Artifact = {
  id: string;
  caseId: string;
  tenantId: string;
  type: ArtifactType;
};

export type CaseState = {
  id: string;
  tenantId: string;
  name: string;
  ready: boolean;
  artifactCounts: ArtifactCounts;
};

export type ReadinessEvent = {
  caseId: string;
  tenantId: string;
};

export type Rule =
  | {
      type: "countAtLeast";
      artifactType: ArtifactType;
      count: number;
    }
  | {
      type: "all";
      rules: Rule[];
    }
  | {
      type: "any";
      rules: Rule[];
    };
