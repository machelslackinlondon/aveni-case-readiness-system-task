import { withApiErrorHandling } from "../../../lib/api-error";
import { getApplication } from "../../../lib/application";
import { readJsonBody } from "../../../lib/http";
import { readTenant } from "../../../lib/validation";

export function GET() {
  return Response.json({
    tenants: getApplication().tenants.list(),
  });
}

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const tenant = getApplication().tenants.create(
      readTenant(await readJsonBody(request)),
    );

    return Response.json(
      {
        tenant,
      },
      {
        status: 201,
      },
    );
  });
}
