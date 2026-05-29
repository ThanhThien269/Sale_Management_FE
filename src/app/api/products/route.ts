import { NextRequest } from "next/server";
import {
  OntoServerApiHandlerError,
  OntoServerApiHandlerSuccess,
} from "@/lib/api/server-handler";

const BASE = process.env.BACKEND_URL!;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qs = searchParams.toString();
    return await OntoServerApiHandlerSuccess({
      route: `${BASE}/product${qs ? `?${qs}` : ""}`,
      method: "GET",
      setHeadersTotal: true,
    });
  } catch (e) {
    return OntoServerApiHandlerError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    return await OntoServerApiHandlerSuccess({
      route: `${BASE}/product`,
      method: "POST",
      body: await req.text(),
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return OntoServerApiHandlerError(e);
  }
}
