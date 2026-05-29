import { ontoAPIHandler } from "@/lib/api/client-handler";
import { ResponseType } from "@/types/api";
import { Dispatch, SetStateAction } from "react";

export type InvoiceStatusEnum = "WAITING" | "PAID" | "CANCELED";

export type InvoiceSort = {
  type: "ASC" | "DESC";
  key: string;
};

export type InvoiceFilterOption = {
  invoiceId?: string;
  productId?: string;
  statusEnum?: InvoiceStatusEnum;
  [key: string]: unknown;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  invoiceNote?: string;
  productId: string;
  productName: string;
  quantity: number;
  originalAmount: number;
  extraFee: number;
  discountAmount: number;
  discountPercentage: number;
  totalAmount: number;
  statusId: number;
  statusName: InvoiceStatusEnum;
  createdAt: string;
  updatedAt: string;
};

type FilterInvoicesParams = {
  filterOption?: InvoiceFilterOption;
  pagination?: { page: number; size: number };
  sorts?: InvoiceSort[];
  setLoading?: Dispatch<SetStateAction<boolean>>;
  successHandler: (data: ResponseType, headers?: Headers) => void;
};

export function filterInvoices({
  filterOption = {},
  pagination = { page: 1, size: 10 },
  sorts = [],
  setLoading,
  successHandler,
}: FilterInvoicesParams) {
  ontoAPIHandler({
    method: "POST",
    apiUrl: "/api/invoices/filter",
    body: JSON.stringify({ filterOption, pagination, sorts }),
    headers: { "Content-Type": "application/json" },
    setLoading,
    successHandler,
  });
}
