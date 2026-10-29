import type { CaseState } from "../../../domain/types";
import { withApiErrorHandling } from "../../../lib/api-error";
import { readJsonBody } from "../../../lib/http";
import { readTenantScope } from "../../../lib/tenant-scope";
import { readCaseInput } from "../../../lib/validation";

export function GET(request: Request) {
  return withApiErrorHandling(() => {
    readTenantScope(request, {
      requireQuery: true,
    });

    return Response.json({
      cases: [],
    });
  });
}

export function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const tenantId = readTenantScope(request, {
      requireQuery: false,
    });
    const input = readCaseInput(await readJsonBody(request));
    const caseState: CaseState = {
      ...input,
      tenantId,
      ready: false,
      artifactCounts: {
        call: 0,
        document: 0,
        email: 0,
      },
    };

    return Response.json(
      {
        case: caseState,
      },
      {
        status: 201,
      },
    );
  });
}
