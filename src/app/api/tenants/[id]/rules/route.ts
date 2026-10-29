import { withApiErrorHandling } from "../../../../../lib/api-error";
import { getApplication } from "../../../../../lib/application";
import { readJsonBody } from "../../../../../lib/http";
import {
  readRouteId,
  type RouteContext,
} from "../../../../../lib/route";
import {
  readObject,
  readRule,
  rejectUnsupportedFields,
} from "../../../../../lib/validation";

export async function GET(_request: Request, context: RouteContext) {
  return withApiErrorHandling(async () => {
    const tenantId = await readRouteId(context);

    return Response.json({
      rule: getApplication().tenants.getRule(tenantId) ?? null,
    });
  });
}

export async function PUT(request: Request, context: RouteContext) {
  return withApiErrorHandling(async () => {
    const tenantId = await readRouteId(context);
    const body = readObject(await readJsonBody(request));
    rejectUnsupportedFields(body, ["rule"]);

    return Response.json({
      rule: getApplication().tenants.saveRule(
        tenantId,
        readRule(body.rule),
      ),
    });
  });
}
