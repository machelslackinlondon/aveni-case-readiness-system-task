import { withApiErrorHandling } from "../../../../../lib/api-error";
import { getApplication } from "../../../../../lib/application";
import { readJsonBody } from "../../../../../lib/http";
import {
  readRouteId,
  type RouteContext,
} from "../../../../../lib/route";
import { readTenantScope } from "../../../../../lib/tenant-scope";
import { readArtifactInput } from "../../../../../lib/validation";

export function POST(request: Request, context: RouteContext) {
  return withApiErrorHandling(async () => {
    const tenantId = readTenantScope(request, {
      requireQuery: false,
    });
    const caseId = await readRouteId(context);
    const input = readArtifactInput(await readJsonBody(request));

    return Response.json(
      getApplication().artifacts.add({
        ...input,
        caseId,
        tenantId,
      }),
      {
        status: 201,
      },
    );
  });
}
