/** @jest-environment node */

import { installFreshApplication } from "../../../test/application";
import { GET, POST } from "./route";

beforeEach(() => {
  installFreshApplication();
});

describe("GET /api/tenants", () => {
  it("returns a tenant collection", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      tenants: [],
    });
  });
});

describe("POST /api/tenants", () => {
  it("accepts a valid tenant", async () => {
    const request = new Request("http://localhost/api/tenants", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        id: "tenant-1",
        name: "North Office",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      tenant: {
        id: "tenant-1",
        name: "North Office",
      },
    });

    const listResponse = await GET();
    await expect(listResponse.json()).resolves.toEqual({
      tenants: [
        {
          id: "tenant-1",
          name: "North Office",
        },
      ],
    });
  });

  it("rejects a request without a JSON content type", async () => {
    const request = new Request("http://localhost/api/tenants", {
      method: "POST",
      body: JSON.stringify({
        id: "tenant-1",
        name: "North Office",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(415);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "UNSUPPORTED_MEDIA_TYPE",
        message: "Content-Type must be application/json.",
      },
    });
  });

  it("rejects malformed JSON", async () => {
    const request = new Request("http://localhost/api/tenants", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: "{",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "INVALID_JSON",
        message: "Request body must contain valid JSON.",
      },
    });
  });

  it("rejects JSON bodies larger than 64 KiB", async () => {
    const request = new Request("http://localhost/api/tenants", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        id: "tenant-1",
        name: "a".repeat(65_537),
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "Request body must not exceed 64 KiB.",
      },
    });
  });

  it("rejects unsupported fields", async () => {
    const request = new Request("http://localhost/api/tenants", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        id: "tenant-1",
        name: "North Office",
        ready: true,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request body contains unsupported fields: ready.",
      },
    });
  });

  it("rejects invalid tenant identifiers", async () => {
    const request = new Request("http://localhost/api/tenants", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        id: "tenant one",
        name: "North Office",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "id must be a valid identifier.",
      },
    });
  });

  it("returns a conflict for a duplicate tenant identifier", async () => {
    const createRequest = () =>
      new Request("http://localhost/api/tenants", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          id: "tenant-1",
          name: "North Office",
        }),
      });
    await POST(createRequest());

    const response = await POST(createRequest());

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "TENANT_ALREADY_EXISTS",
        message: "Tenant tenant-1 already exists.",
      },
    });
  });
});
