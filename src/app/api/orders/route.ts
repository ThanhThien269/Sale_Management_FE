import { NextRequest, NextResponse } from "next/server";
import { db, Order } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ status: "OK", content: db.orders });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const order: Order = {
    id: db.nextOrderId++,
    createdAt: new Date().toISOString(),
    status: "PENDING",
    ...body,
  };
  db.orders.push(order);
  return NextResponse.json(
    { status: "CREATED", content: order },
    { status: 201 },
  );
}
