import type { Artifact } from "../../../../../domain/types";
import { withApiErrorHandling } from "../../../../../lib/api-error";
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
    const artifact: Artifact = {
      ...input,
      caseId,
      tenantId,
    };

    return Response.json(
      {
        artifact,
      },
      {
        status: 201,
      },
    );
  });
}
