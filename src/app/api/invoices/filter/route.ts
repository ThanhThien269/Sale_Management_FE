import { NextRequest } from "next/server";
import {
  OntoServerApiHandlerError,
  OntoServerApiHandlerSuccess,
} from "@/lib/api/server-handler";

const BASE = process.env.BACKEND_URL!;

export async function POST(req: NextRequest) {
  try {
    return await OntoServerApiHandlerSuccess({
      route: `${BASE}/invoice/filter`,
      method: "POST",
      body: await req.text(),
      headers: { "Content-Type": "application/json" },
      setHeadersTotal: true,
    });
  } catch (e) {
    return OntoServerApiHandlerError(e);
  }
}
