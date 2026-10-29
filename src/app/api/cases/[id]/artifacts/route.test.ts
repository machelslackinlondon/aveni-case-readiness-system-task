/** @jest-environment node */

import { POST } from "./route";

const context = {
  params: Promise.resolve({
    id: "case-1",
  }),
};

describe("POST /api/cases/[id]/artifacts", () => {
  it("accepts an artifact within the header tenant scope", async () => {
    const request = new Request(
      "http://localhost/api/cases/case-1/artifacts",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-tenant-id": "tenant-1",
        },
        body: JSON.stringify({
          id: "artifact-1",
          type: "document",
        }),
      },
    );

    const response = await POST(request, context);

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      artifact: {
        id: "artifact-1",
        caseId: "case-1",
        tenantId: "tenant-1",
        type: "document",
      },
    });
  });

  it("rejects an unsupported artifact type", async () => {
    const request = new Request(
      "http://localhost/api/cases/case-1/artifacts",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-tenant-id": "tenant-1",
        },
        body: JSON.stringify({
          id: "artifact-1",
          type: "video",
        }),
      },
    );

    const response = await POST(request, context);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "type must be one of: call, document, email.",
      },
    });
  });
});
