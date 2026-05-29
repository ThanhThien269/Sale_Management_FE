export type Product = {
  id: string;
  categoryId: number;
  name: string;
  description: string;
  image: string;
  price: number;
  stockQuantity: number;
  soldQuantity?: number;
  statusName: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  statusId: number;
  createdAt: string;
  updatedAt: string;
};

export const CATEGORIES = [
  { id: 1, name: "Đồ uống" },
  { id: 2, name: "Thức ăn" },
  { id: 3, name: "Tráng miệng" },
  { id: 4, name: "Khác" },
];

export const CATEGORY_MAP: Record<number, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.name]),
);

export type OrderItem = {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: number;
  customer: string;
  phone: string;
  createdAt: string;
  items: OrderItem[];
  total: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
};

// In-memory store — resets on server restart (demo only)
export const db = {
  products: [
    {
      id: "a1b2c3d4-e5f6-7891-abcd-ef1234567891",
      categoryId: 1,
      name: "Cà phê Arabica",
      description: "Cà phê nguyên chất cao cấp",
      image: "",
      soldQuantity: 0,
      price: 150000,
      stockQuantity: 100,
      statusName: "ACTIVE" as const,
      statusId: 1,
      createdAt: "2026-05-20T10:30:00",
      updatedAt: "2026-05-20T10:30:00",
    },
    {
      id: "b2c3d4e5-f6a7-8902-bcde-f12345678902",
      categoryId: 1,
      name: "Trà xanh Nhật",
      description: "Trà xanh nhập khẩu từ Nhật Bản",
      image: "",
      soldQuantity: 0,
      price: 80000,
      stockQuantity: 50,
      statusName: "ACTIVE" as const,
      statusId: 1,
      createdAt: "2026-05-21T08:00:00",
      updatedAt: "2026-05-21T08:00:00",
    },
    {
      id: "c3d4e5f6-a7b8-9013-cdef-123456789013",
      categoryId: 2,
      name: "Bánh mì sandwich",
      description: "Bánh mì tươi mỗi ngày",
      image: "",
      soldQuantity: 0,
      price: 35000,
      stockQuantity: 200,
      statusName: "ACTIVE" as const,
      statusId: 1,
      createdAt: "2026-05-22T09:00:00",
      updatedAt: "2026-05-22T09:00:00",
    },
    {
      id: "d4e5f6a7-b8c9-0124-def0-234567890124",
      categoryId: 1,
      name: "Nước ép cam",
      description: "100% nước ép cam tươi",
      image: "",
      soldQuantity: 0,
      price: 55000,
      stockQuantity: 80,
      statusName: "INACTIVE" as const,
      statusId: 2,
      createdAt: "2026-05-22T10:00:00",
      updatedAt: "2026-05-22T10:00:00",
    },
    {
      id: "e5f6a7b8-c9d0-1235-ef01-345678901235",
      categoryId: 2,
      name: "Bánh croissant",
      description: "Bánh croissant bơ Pháp",
      image: "",
      soldQuantity: 0,
      price: 45000,
      stockQuantity: 150,
      statusName: "ACTIVE" as const,
      statusId: 1,
      createdAt: "2026-05-23T07:00:00",
      updatedAt: "2026-05-23T07:00:00",
    },
    {
      id: "f6a7b8c9-d0e1-2346-f012-456789012346",
      categoryId: 1,
      name: "Cà phê latte",
      description: "Cà phê pha sữa",
      image: "",
      soldQuantity: 0,
      price: 65000,
      stockQuantity: 120,
      statusName: "DRAFT" as const,
      statusId: 3,
      createdAt: "2026-05-24T11:00:00",
      updatedAt: "2026-05-24T11:00:00",
    },
    {
      id: "a7b8c9d0-e1f2-3457-0123-567890123457",
      categoryId: 3,
      name: "Bánh flan caramel",
      description: "Bánh flan thơm ngon",
      image: "",
      soldQuantity: 0,
      price: 30000,
      stockQuantity: 60,
      statusName: "ACTIVE" as const,
      statusId: 1,
      createdAt: "2026-05-25T08:00:00",
      updatedAt: "2026-05-25T08:00:00",
    },
    {
      id: "b8c9d0e1-f2a3-4568-1234-678901234568",
      categoryId: 2,
      name: "Mì Ý sốt kem",
      description: "Mì Ý creamy pasta",
      image: "",
      soldQuantity: 0,
      price: 85000,
      stockQuantity: 40,
      statusName: "ACTIVE" as const,
      statusId: 1,
      createdAt: "2026-05-26T09:00:00",
      updatedAt: "2026-05-26T09:00:00",
    },
    {
      id: "c9d0e1f2-a3b4-5679-2345-789012345679",
      categoryId: 1,
      name: "Sinh tố xoài",
      description: "Sinh tố xoài tươi",
      image: "",
      soldQuantity: 0,
      price: 45000,
      stockQuantity: 70,
      statusName: "INACTIVE" as const,
      statusId: 2,
      createdAt: "2026-05-27T10:00:00",
      updatedAt: "2026-05-27T10:00:00",
    },
    {
      id: "d0e1f2a3-b4c5-6780-3456-890123456780",
      categoryId: 3,
      name: "Tiramisu",
      description: "Bánh tiramisu Ý",
      image: "",
      soldQuantity: 0,
      price: 75000,
      stockQuantity: 30,
      statusName: "ACTIVE" as const,
      statusId: 1,
      createdAt: "2026-05-28T11:00:00",
      updatedAt: "2026-05-28T11:00:00",
    },
    {
      id: "e1f2a3b4-c5d6-7891-4567-901234567891",
      categoryId: 4,
      name: "Nước suối Evian",
      description: "Nước khoáng nhập khẩu",
      image: "",
      soldQuantity: 0,
      price: 25000,
      stockQuantity: 300,
      statusName: "ACTIVE" as const,
      statusId: 1,
      createdAt: "2026-05-29T08:00:00",
      updatedAt: "2026-05-29T08:00:00",
    },
    {
      id: "f2a3b4c5-d6e7-8902-5678-012345678902",
      categoryId: 1,
      name: "Espresso đậm",
      description: "Espresso pha đặc",
      image: "",
      soldQuantity: 0,
      price: 45000,
      stockQuantity: 90,
      statusName: "DRAFT" as const,
      statusId: 3,
      createdAt: "2026-05-29T09:00:00",
      updatedAt: "2026-05-29T09:00:00",
    },
  ] as Product[],
  orders: [
    {
      id: 1001,
      customer: "Nguyễn Văn A",
      phone: "0901234567",
      createdAt: "2026-05-20T10:30:00",
      items: [
        {
          productId: 1,
          productName: "Cà phê Arabica",
          quantity: 2,
          price: 150000,
        },
      ],
      total: 300000,
      status: "COMPLETED",
    },
    {
      id: 1002,
      customer: "Trần Thị B",
      phone: "0912345678",
      createdAt: "2026-05-21T14:00:00",
      items: [
        {
          productId: 3,
          productName: "Bánh mì sandwich",
          quantity: 3,
          price: 35000,
        },
        {
          productId: 2,
          productName: "Trà xanh Nhật",
          quantity: 1,
          price: 80000,
        },
      ],
      total: 185000,
      status: "PENDING",
    },
    {
      id: 1003,
      customer: "Lê Minh C",
      phone: "0923456789",
      createdAt: "2026-05-22T09:15:00",
      items: [
        {
          productId: 6,
          productName: "Cà phê latte",
          quantity: 1,
          price: 65000,
        },
      ],
      total: 65000,
      status: "CANCELLED",
    },
  ] as Order[],
  nextOrderId: 1004,
};
