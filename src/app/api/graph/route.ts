import { NextResponse } from "next/server";
import { buildDemoGraphResponse } from "@/lib/demo";
import { getGraphResponse } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const personId = searchParams.get("personId") ?? "person-dimas";
  const roleId = searchParams.get("roleId") ?? "role-ai-product-engineer";

  try {
    return NextResponse.json(await getGraphResponse(personId, roleId));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    const response = buildDemoGraphResponse(personId, roleId);

    return NextResponse.json({
      ...response,
      warning: `${message} Showing demo data so the app remains explorable.`,
    });
  }
}
