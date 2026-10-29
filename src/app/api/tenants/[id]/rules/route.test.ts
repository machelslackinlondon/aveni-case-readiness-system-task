/** @jest-environment node */

import { GET, PUT } from "./route";

const context = {
  params: Promise.resolve({
    id: "tenant-1",
  }),
};

describe("GET /api/tenants/[id]/rules", () => {
  it("returns the tenant rule shape", async () => {
    const response = await GET(
      new Request("http://localhost/api/tenants/tenant-1/rules"),
      context,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      rule: null,
    });
  });
});

describe("PUT /api/tenants/[id]/rules", () => {
  it("accepts a nested readiness rule", async () => {
    const rule = {
      type: "all",
      rules: [
        {
          type: "countAtLeast",
          artifactType: "document",
          count: 2,
        },
        {
          type: "any",
          rules: [
            {
              type: "countAtLeast",
              artifactType: "call",
              count: 1,
            },
            {
              type: "countAtLeast",
              artifactType: "email",
              count: 1,
            },
          ],
        },
      ],
    };
    const request = new Request(
      "http://localhost/api/tenants/tenant-1/rules",
      {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ rule }),
      },
    );

    const response = await PUT(request, context);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ rule });
  });

  it("rejects unsupported fields inside a rule", async () => {
    const request = new Request(
      "http://localhost/api/tenants/tenant-1/rules",
      {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          rule: {
            type: "countAtLeast",
            artifactType: "call",
            count: 1,
            enabled: true,
          },
        }),
      },
    );

    const response = await PUT(request, context);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "rule contains unsupported fields: enabled.",
      },
    });
  });
});
