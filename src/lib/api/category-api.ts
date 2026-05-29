import { ontoAPIHandler } from "@/lib/api/client-handler";
import { ResponseType } from "@/types/api";

export type Category = {
  id: number;
  name: string;
};

export async function getCategories(): Promise<Category[]> {
  const data = await ontoAPIHandler({
    method: "GET",
    apiUrl: "/api/categories",
  });
  if (!data || data.status !== "OK") return [];
  return (data as ResponseType).content as Category[];
}
