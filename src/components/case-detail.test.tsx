import { fireEvent, render, screen, within } from "@testing-library/react";

import { installFetchMock, restoreFetch } from "../test/fetch-mock";
import { CaseDetail } from "./case-detail";

afterEach(() => {
  restoreFetch();
});

describe("CaseDetail", () => {
  it("submits an artifact and displays refreshed readiness", async () => {
    installFetchMock([
      {
        url: "/api/cases/case-1?tenantId=tenant-1",
        requestHeaders: {
          "x-tenant-id": "tenant-1",
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
      },
      {
        url: "/api/cases/case-1/artifacts",
        method: "POST",
        requestHeaders: {
          "x-tenant-id": "tenant-1",
        },
        requestBody: {
          id: "artifact-1",
          type: "document",
        },
        responseBody: {
          artifact: {
            id: "artifact-1",
            caseId: "case-1",
            tenantId: "tenant-1",
            type: "document",
          },
          case: {
            id: "case-1",
            tenantId: "tenant-1",
            name: "Mortgage advice review",
            ready: true,
            artifactCounts: {
              call: 0,
              document: 1,
              email: 0,
            },
          },
        },
        status: 201,
      },
    ]);

    render(<CaseDetail tenantId="tenant-1" caseId="case-1" />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading case");
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Mortgage advice review",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Not ready")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Artifact ID"), {
      target: {
        value: "artifact-1",
      },
    });
    fireEvent.change(screen.getByLabelText("Artifact type"), {
      target: {
        value: "document",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add artifact" }));

    expect(await screen.findByText("Artifact added.")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(
      within(
        screen.getByRole("region", { name: "Artifact counts" }),
      ).getByText("1"),
    ).toBeInTheDocument();
  });
});
