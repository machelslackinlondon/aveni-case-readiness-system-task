/** @jest-environment node */

import { installFreshApplication } from "../../../test/application";
import { GET, POST } from "./route";

beforeEach(() => {
  const application = installFreshApplication();
  application.tenants.create({
    id: "tenant-1",
    name: "North Office",
  });
});

describe("GET /api/cases", () => {
  it("returns cases for a matching tenant scope", async () => {
    const request = new Request(
      "http://localhost/api/cases?tenantId=tenant-1",
      {
        headers: {
          "x-tenant-id": "tenant-1",
        },
      },
    );

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      cases: [],
    });
  });

  it("rejects a tenant-scope mismatch", async () => {
    const request = new Request(
      "http://localhost/api/cases?tenantId=tenant-2",
      {
        headers: {
          "x-tenant-id": "tenant-1",
        },
      },
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "TENANT_SCOPE_MISMATCH",
        message: "X-Tenant-Id must match the tenantId query parameter.",
      },
    });

  });
});

describe("POST /api/cases", () => {
  it("accepts a case within the header tenant scope", async () => {
    const request = new Request("http://localhost/api/cases", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant-1",
      },
      body: JSON.stringify({
        id: "case-1",
        name: "Mortgage advice review",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
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

    const listResponse = await GET(
      new Request("http://localhost/api/cases?tenantId=tenant-1", {
        headers: {
          "x-tenant-id": "tenant-1",
        },
      }),
    );
    await expect(listResponse.json()).resolves.toEqual({
      cases: [
        {
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
      ],
    });
  });
});
