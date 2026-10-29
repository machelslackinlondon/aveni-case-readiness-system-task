/** @jest-environment node */

import { installFreshApplication } from "../../../../test/application";
import { GET } from "./route";

const context = {
  params: Promise.resolve({
    id: "case-1",
  }),
};

beforeEach(() => {
  const application = installFreshApplication();
  application.tenants.create({
    id: "tenant-1",
    name: "North Office",
  });
  application.cases.create({
    id: "case-1",
    tenantId: "tenant-1",
    name: "Mortgage advice review",
  });
});

describe("GET /api/cases/[id]", () => {
  it("returns the case detail shape for a matching tenant scope", async () => {
    const request = new Request(
      "http://localhost/api/cases/case-1?tenantId=tenant-1",
      {
        headers: {
          "x-tenant-id": "tenant-1",
        },
      },
    );

    const response = await GET(request, context);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      case: {
        id: "case-1",
        tenantId: "tenant-1",
        name: "Mortgage advice review",
        ready: false,
        artifactCounts: {
          call: 0,
          document: 0,
          email: 0,
        },
      },
    });
  });

  it("rejects a tenant-scope mismatch", async () => {
    const request = new Request(
      "http://localhost/api/cases/case-1?tenantId=tenant-2",
      {
        headers: {
          "x-tenant-id": "tenant-1",
        },
      },
    );

    const response = await GET(request, context);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "TENANT_SCOPE_MISMATCH",
        message: "X-Tenant-Id must match the tenantId query parameter.",
      },
    });
  });
});
