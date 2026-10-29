import type {
  Artifact,
  ArtifactType,
  CaseState,
  Rule,
  Tenant,
} from "../domain/types";

type JsonObject = Record<string, unknown>;

type AddArtifactResult = {
  artifact: Artifact;
  case: CaseState;
};

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(payload: unknown, status: number) {
  if (isJsonObject(payload) && isJsonObject(payload.error)) {
    const message = payload.error.message;

    if (typeof message === "string") {
      return message;
    }
  }

  return `Request failed with status ${status}.`;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = await response.json() as unknown;

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response.status));
  }

  if (!isJsonObject(payload)) {
    throw new Error("The server returned an invalid response.");
  }

  return payload as T;
}

function jsonRequest(
  method: "POST" | "PUT",
  body: unknown,
  headers?: Record<string, string>,
): RequestInit {
  return {
    method,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

export async function getTenants() {
  const response = await requestJson<{ tenants: Tenant[] }>("/api/tenants");

  return response.tenants;
}

export async function createTenant(tenant: Tenant) {
  const response = await requestJson<{ tenant: Tenant }>(
    "/api/tenants",
    jsonRequest("POST", tenant),
  );

  return response.tenant;
}

export async function getTenantRule(tenantId: string) {
  const response = await requestJson<{ rule: Rule | null }>(
    `/api/tenants/${encodeURIComponent(tenantId)}/rules`,
  );

  return response.rule;
}

export async function saveTenantRule(tenantId: string, rule: Rule) {
  const response = await requestJson<{ rule: Rule }>(
    `/api/tenants/${encodeURIComponent(tenantId)}/rules`,
    jsonRequest("PUT", { rule }),
  );

  return response.rule;
}

export async function getCases(tenantId: string) {
  const query = new URLSearchParams({ tenantId });
  const response = await requestJson<{ cases: CaseState[] }>(
    `/api/cases?${query.toString()}`,
    {
      headers: {
        "x-tenant-id": tenantId,
      },
    },
  );

  return response.cases;
}

export async function createCase(
  tenantId: string,
  input: Pick<CaseState, "id" | "name">,
) {
  const response = await requestJson<{ case: CaseState }>(
    "/api/cases",
    jsonRequest("POST", input, {
      "x-tenant-id": tenantId,
    }),
  );

  return response.case;
}

export async function getCase(tenantId: string, caseId: string) {
  const query = new URLSearchParams({ tenantId });
  const response = await requestJson<{ case: CaseState }>(
    `/api/cases/${encodeURIComponent(caseId)}?${query.toString()}`,
    {
      headers: {
        "x-tenant-id": tenantId,
      },
    },
  );

  return response.case;
}

export async function addArtifact(
  tenantId: string,
  caseId: string,
  input: {
    id: string;
    type: ArtifactType;
  },
) {
  return requestJson<AddArtifactResult>(
    `/api/cases/${encodeURIComponent(caseId)}/artifacts`,
    jsonRequest("POST", input, {
      "x-tenant-id": tenantId,
    }),
  );
}
