import { withApiErrorHandling } from "../../../lib/api-error";
import { readJsonBody } from "../../../lib/http";
import { readTenant } from "../../../lib/validation";

export function GET() {
  return Response.json({
    tenants: [],
  });
}

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const tenant = readTenant(await readJsonBody(request));

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
