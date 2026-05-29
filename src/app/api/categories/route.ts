import {
  OntoServerApiHandlerError,
  OntoServerApiHandlerSuccess,
} from "@/lib/api/server-handler";

const BASE = process.env.BACKEND_URL!;

export async function GET() {
  try {
    return await OntoServerApiHandlerSuccess({
      route: `${BASE}/category`,
      method: "GET",
    });
  } catch (e) {
    return OntoServerApiHandlerError(e);
  }
}
