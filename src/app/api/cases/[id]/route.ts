import { withApiErrorHandling } from "../../../../lib/api-error";
import { getApplication } from "../../../../lib/application";
import {
  readRouteId,
  type RouteContext,
} from "../../../../lib/route";
import { readTenantScope } from "../../../../lib/tenant-scope";

export function GET(request: Request, context: RouteContext) {
  return withApiErrorHandling(async () => {
    const tenantId = readTenantScope(request, {
      requireQuery: true,
    });
    const caseId = await readRouteId(context);

    return Response.json({
      case: getApplication().cases.get(tenantId, caseId),
    });
  });
}
