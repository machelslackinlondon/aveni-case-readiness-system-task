import { withApiErrorHandling } from "../../../../lib/api-error";
import {
  readRouteId,
  type RouteContext,
} from "../../../../lib/route";
import { readTenantScope } from "../../../../lib/tenant-scope";

export function GET(request: Request, context: RouteContext) {
  return withApiErrorHandling(async () => {
    readTenantScope(request, {
      requireQuery: true,
    });
    await readRouteId(context);

    return Response.json({
      case: null,
    });
  });
}
