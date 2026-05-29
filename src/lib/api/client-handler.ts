/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Method } from "axios";
import { Dispatch, SetStateAction } from "react";

import { ResponseType } from "@/types/api";

export async function ontoAPIHandler({
  successHandler,
  method,
  apiUrl,
  body,
  headers,
  setLoading,
}: {
  successHandler?: (
    data: ResponseType,
    responseHeaders?: Headers,
  ) => Promise<void> | void;
  method: Method;
  apiUrl: string;
  body?: any;
  headers?: HeadersInit;
  setLoading?: Dispatch<SetStateAction<boolean>>;
}) {
  try {
    setLoading?.(true);

    const res = await fetch(apiUrl, {
      method,
      headers,
      body,
      credentials: "include",
    });

    const data: ResponseType = await res.json();

    if ((data.status === "OK" || data.status === "CREATED") && successHandler) {
      await successHandler(data, res.headers);
    }

    return data;
  } catch {
    console.error("ontoAPIHandler: request failed", apiUrl);
  } finally {
    setLoading?.(false);
  }
}
