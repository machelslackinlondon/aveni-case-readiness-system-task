import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import { installFetchMock, restoreFetch } from "../test/fetch-mock";
import { TenantManager } from "./tenant-manager";

afterEach(() => {
  restoreFetch();
});

describe("TenantManager", () => {
  it("loads an empty list and creates a tenant", async () => {
    installFetchMock([
      {
        url: "/api/tenants",
        responseBody: {
          tenants: [],
        },
      },
      {
        url: "/api/tenants",
        method: "POST",
        requestBody: {
          id: "tenant-1",
          name: "North Office",
        },
        responseBody: {
          tenant: {
            id: "tenant-1",
            name: "North Office",
          },
        },
        status: 201,
      },
      {
        url: "/api/tenants/tenant-1/rules",
        responseBody: {
          rule: null,
        },
      },
    ]);

    render(<TenantManager />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading tenants");
    expect(await screen.findByText("No tenants yet.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Tenant ID"), {
      target: {
        value: "tenant-1",
      },
    });
    fireEvent.change(screen.getByLabelText("Tenant name"), {
      target: {
        value: "North Office",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create tenant" }));

    expect(await screen.findByText("Tenant created.")).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Tenant list" })).getByText(
        "North Office",
      ),
    ).toBeInTheDocument();
  });

  it("loads and saves a count-at-least rule", async () => {
    installFetchMock([
      {
        url: "/api/tenants",
        responseBody: {
          tenants: [
            {
              id: "tenant-1",
              name: "North Office",
            },
          ],
        },
      },
      {
        url: "/api/tenants/tenant-1/rules",
        responseBody: {
          rule: {
            type: "countAtLeast",
            artifactType: "document",
            count: 2,
          },
        },
      },
      {
        url: "/api/tenants/tenant-1/rules",
        method: "PUT",
        requestBody: {
          rule: {
            type: "countAtLeast",
            artifactType: "document",
            count: 3,
          },
        },
        responseBody: {
          rule: {
            type: "countAtLeast",
            artifactType: "document",
            count: 3,
          },
        },
      },
    ]);

    render(<TenantManager />);

    const artifactType = await screen.findByLabelText("Artifact type");
    const countInput = screen.getByLabelText("Required count");
    await waitFor(() => {
      expect(artifactType).toHaveValue("document");
      expect(countInput).toHaveValue(2);
    });

    fireEvent.change(countInput, {
      target: {
        value: "3",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save rule" }));

    expect(await screen.findByText("Rule saved.")).toBeInTheDocument();
  });

  it("renders API errors", async () => {
    installFetchMock([
      {
        url: "/api/tenants",
        responseBody: {
          error: {
            code: "INTERNAL_ERROR",
            message: "Unable to load tenants.",
          },
        },
        status: 500,
      },
    ]);

    render(<TenantManager />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to load tenants.",
    );
  });
});
