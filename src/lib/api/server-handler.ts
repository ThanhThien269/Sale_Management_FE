/* eslint-disable @typescript-eslint/no-explicit-any */
import { Method } from "axios";
import { NextResponse } from "next/server";

type ServerApiHandlerProps = {
  route: string;
  method: Method;
  body?: RequestInit["body"];
  headers?: Record<string, string>;
  setHeadersTotal?: boolean;
};

export async function OntoServerApiHandlerSuccess({
  route,
  method,
  body,
  headers,
  setHeadersTotal = false,
}: ServerApiHandlerProps) {
  const res = await fetch(route, {
    method,
    body,
    headers,
  });

  function tryConvertDateString(s: string) {
    const re =
      /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}(?:\.\d+)?) ([+-]\d{2})(\d{2})$/;
    const m = s.match(re);
    if (m) {
      return `${m[1]}T${m[2]}${m[3]}:${m[4]}`;
    }
    return null;
  }

  function convertDates(value: any): any {
    if (value === null || value === undefined) return value;
    if (Array.isArray(value)) return value.map(convertDates);
    if (typeof value === "object") {
      const out: any = {};
      for (const k in value) {
        out[k] = convertDates(value[k]);
      }
      return out;
    }
    if (typeof value === "string") {
      const conv = tryConvertDateString(value);
      return conv ?? value;
    }
    return value;
  }

  if (res.ok) {
    const responseData = await res.json();
    const normalized = convertDates(responseData);
    const response = NextResponse.json(normalized, { status: 200 });
    if (setHeadersTotal) {
      response.headers.set("X-total", res.headers.get("X-total") ?? "1");
    }
    return response;
  }

  try {
    const errorData = await res.json();
    return NextResponse.json(convertDates(errorData), { status: res.status });
  } catch {
    return NextResponse.json(
      { message: `Request failed with status ${res.status}` },
      { status: res.status },
    );
  }
}

export async function OntoServerApiHandlerError(error: any) {
  return NextResponse.json(
    { message: "Internal Server Error", error: error },
    { status: 500 },
  );
}
