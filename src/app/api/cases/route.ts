import { withApiErrorHandling } from "../../../lib/api-error";
import { getApplication } from "../../../lib/application";
import { readJsonBody } from "../../../lib/http";
import { readTenantScope } from "../../../lib/tenant-scope";
import { readCaseInput } from "../../../lib/validation";

export function GET(request: Request) {
  return withApiErrorHandling(() => {
    const tenantId = readTenantScope(request, {
      requireQuery: true,
    });

    return Response.json({
      cases: getApplication().cases.list(tenantId),
    });
  });
}

export function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const tenantId = readTenantScope(request, {
      requireQuery: false,
    });
    const input = readCaseInput(await readJsonBody(request));

    return Response.json(
      {
        case: getApplication().cases.create({
          ...input,
          tenantId,
        }),
      },
      {
        status: 201,
      },
    );
  });
}
