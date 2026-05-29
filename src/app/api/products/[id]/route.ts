import { NextRequest } from "next/server";
import {
  OntoServerApiHandlerError,
  OntoServerApiHandlerSuccess,
} from "@/lib/api/server-handler";

type Params = { params: Promise<{ id: string }> };

const BASE = process.env.BACKEND_URL!;

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return await OntoServerApiHandlerSuccess({
      route: `${BASE}/product/${id}`,
      method: "GET",
    });
  } catch (e) {
    return OntoServerApiHandlerError(e);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return await OntoServerApiHandlerSuccess({
      route: `${BASE}/product/${id}`,
      method: "PUT",
      body: await req.text(),
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return OntoServerApiHandlerError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return await OntoServerApiHandlerSuccess({
      route: `${BASE}/product/${id}`,
      method: "PATCH",
      body: await req.text(),
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return OntoServerApiHandlerError(e);
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return await OntoServerApiHandlerSuccess({
      route: `${BASE}/product/${id}`,
      method: "DELETE",
    });
  } catch (e) {
    return OntoServerApiHandlerError(e);
  }
}
