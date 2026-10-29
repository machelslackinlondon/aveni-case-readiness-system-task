/** @jest-environment node */

import { GET } from "./route";

const context = {
  params: Promise.resolve({
    id: "case-1",
  }),
};

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
      case: null,
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
