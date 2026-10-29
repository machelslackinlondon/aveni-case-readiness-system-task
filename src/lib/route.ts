import { readIdentifier } from "./validation";

export type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function readRouteId(context: RouteContext) {
  const { id } = await context.params;

  return readIdentifier(id, "id");
}
