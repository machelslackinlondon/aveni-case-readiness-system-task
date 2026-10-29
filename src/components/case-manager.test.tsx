import { fireEvent, render, screen, within } from "@testing-library/react";

import { installFetchMock, restoreFetch } from "../test/fetch-mock";
import { CaseManager } from "./case-manager";

afterEach(() => {
  restoreFetch();
});

describe("CaseManager", () => {
  it("loads and creates tenant-scoped cases", async () => {
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
        url: "/api/cases?tenantId=tenant-1",
        requestHeaders: {
          "x-tenant-id": "tenant-1",
        },
        responseBody: {
          cases: [],
        },
      },
      {
        url: "/api/cases",
        method: "POST",
        requestHeaders: {
          "x-tenant-id": "tenant-1",
        },
        requestBody: {
          id: "case-1",
          name: "Mortgage advice review",
        },
        responseBody: {
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
        },
        status: 201,
      },
    ]);

    render(<CaseManager />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading tenants");
    expect(await screen.findByText("No cases yet.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Case ID"), {
      target: {
        value: "case-1",
      },
    });
    fireEvent.change(screen.getByLabelText("Case name"), {
      target: {
        value: "Mortgage advice review",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create case" }));

    expect(await screen.findByText("Case created.")).toBeInTheDocument();
    const caseList = screen.getByRole("region", { name: "Case list" });
    expect(
      within(caseList).getByRole("link", {
        name: "Mortgage advice review",
      }),
    ).toHaveAttribute("href", "/cases/case-1?tenantId=tenant-1");
    expect(within(caseList).getByText("Not ready")).toBeInTheDocument();
  });
});
