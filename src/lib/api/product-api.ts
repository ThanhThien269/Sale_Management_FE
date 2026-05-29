import { ontoAPIHandler } from "@/lib/api/client-handler";
import { ResponseType } from "@/types/api";
import { Dispatch, SetStateAction } from "react";

// ── Enums ────────────────────────────────────────────────────────────────────

export type ProductStatusEnum = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";

export const PRODUCT_STATUS_ID: Record<ProductStatusEnum, number> = {
  ACTIVE: 1,
  INACTIVE: 2,
  OUT_OF_STOCK: 3,
};

// ── Request / Response types ─────────────────────────────────────────────────

export type ProductSort = {
  type: "ASC" | "DESC";
  key: string;
};

export type ProductFilterOption = {
  name?: string;
  categoryId?: number;
  productId?: string;
  statusId?: number;
  statusEnum?: ProductStatusEnum;
  allFieldsNull?: boolean;
};

export type ProductFilterParams = {
  filterOption?: ProductFilterOption;
  pagination?: {
    page: number;
    size: number;
  };
  sorts?: ProductSort[];
};

// ── API call ─────────────────────────────────────────────────────────────────

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 10;

export async function filterProducts({
  filterOption = {},
  pagination = { page: DEFAULT_PAGE, size: DEFAULT_SIZE },
  sorts = [],
  setLoading,
  successHandler,
}: ProductFilterParams & {
  setLoading?: Dispatch<SetStateAction<boolean>>;
  successHandler?: (
    data: ResponseType,
    headers?: Headers,
  ) => void | Promise<void>;
}) {
  return ontoAPIHandler({
    method: "POST",
    apiUrl: "/api/products/filter",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filterOption, pagination, sorts }),
    setLoading,
    successHandler,
  });
}
