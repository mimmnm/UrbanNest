export interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  inStock: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
}

export const categories: Category[] = [
  {
    id: "skincare",
    name: "Skincare",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80",
    productCount: 48,
  },
  {
    id: "makeup",
    name: "Makeup",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80",
    productCount: 56,
  },
  {
    id: "haircare",
    name: "Haircare",
    image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&q=80",
    productCount: 32,
  },
  {
    id: "fragrances",
    name: "Fragrances",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80",
    productCount: 24,
  },
  {
    id: "fashion",
    name: "Fashion",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80",
    productCount: 72,
  },
  {
    id: "accessories",
    name: "Accessories",
    image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80",
    productCount: 40,
  },
];

export const products: Product[] = [
  {
    id: "vitamin-c-serum",
    name: "Vitamin C Radiance Serum",
    price: 2490,
    originalPrice: 3200,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80",
    category: "skincare",
    rating: 4.9,
    reviews: 342,
    description: "High-potency vitamin C formula for luminous, even-toned skin. Brightens and protects against environmental damage.",
    inStock: true,
    isBestSeller: true,
  },
  {
    id: "hyaluronic-moisturizer",
    name: "Hyaluronic Hydra Cream",
    price: 1890,
    originalPrice: 1890,
    image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&q=80",
    category: "skincare",
    rating: 4.8,
    reviews: 218,
    description: "Deep hydration with triple-weight hyaluronic acid. Plumps and nourishes for 24-hour moisture.",
    inStock: true,
    isNew: true,
  },
  {
    id: "retinol-night-cream",
    name: "Retinol Renewal Night Cream",
    price: 2950,
    originalPrice: 3800,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80",
    category: "skincare",
    rating: 4.7,
    reviews: 156,
    description: "Advanced retinol formula for overnight skin renewal and anti-aging benefits.",
    inStock: true,
  },
  {
    id: "velvet-matte-lipstick",
    name: "Velvet Matte Lipstick",
    price: 1250,
    originalPrice: 1600,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80",
    category: "makeup",
    rating: 4.8,
    reviews: 428,
    description: "Luxurious matte finish with intense color payoff that lasts all day.",
    inStock: true,
    isBestSeller: true,
  },
  {
    id: "luminous-foundation",
    name: "Luminous Silk Foundation",
    price: 2350,
    originalPrice: 2350,
    image: "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600&q=80",
    category: "makeup",
    rating: 4.9,
    reviews: 512,
    description: "Weightless, buildable coverage with a natural, radiant finish.",
    inStock: true,
    isNew: true,
  },
  {
    id: "argan-hair-oil",
    name: "Moroccan Argan Hair Oil",
    price: 1690,
    originalPrice: 2200,
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&q=80",
    category: "haircare",
    rating: 4.9,
    reviews: 287,
    description: "Pure argan oil treatment for silky, frizz-free, and nourished hair.",
    inStock: true,
    isBestSeller: true,
  },
  {
    id: "repair-shampoo",
    name: "Keratin Repair Shampoo",
    price: 1190,
    originalPrice: 1190,
    image: "https://images.unsplash.com/photo-1594025168754-e8e0bca8a4e8?w=600&q=80",
    category: "haircare",
    rating: 4.6,
    reviews: 198,
    description: "Bond-building formula repairs damaged hair and restores natural shine.",
    inStock: true,
  },
  {
    id: "signature-perfume",
    name: "Signature Eau de Parfum",
    price: 4850,
    originalPrice: 5990,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80",
    category: "fragrances",
    rating: 4.9,
    reviews: 89,
    description: "Captivating blend of jasmine, sandalwood, and vanilla. Long-lasting elegance.",
    inStock: true,
    isBestSeller: true,
  },
  {
    id: "rose-body-mist",
    name: "Rose Petal Body Mist",
    price: 990,
    originalPrice: 990,
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80",
    category: "fragrances",
    rating: 4.7,
    reviews: 145,
    description: "Light, refreshing rose water mist for an all-day delicate fragrance.",
    inStock: true,
    isNew: true,
  },
  {
    id: "silk-wrap-dress",
    name: "Silk Wrap Midi Dress",
    price: 7490,
    originalPrice: 9500,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
    category: "fashion",
    rating: 4.8,
    reviews: 76,
    description: "Elegant 100% silk wrap dress with a flattering silhouette for any occasion.",
    inStock: true,
  },
  {
    id: "cashmere-sweater",
    name: "Premium Cashmere Sweater",
    price: 6250,
    originalPrice: 7400,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    category: "fashion",
    rating: 4.9,
    reviews: 112,
    description: "Ultra-soft Mongolian cashmere in a timeless, versatile design.",
    inStock: true,
    isBestSeller: true,
  },
  {
    id: "gold-chain-necklace",
    name: "14K Gold Layered Necklace",
    price: 5490,
    originalPrice: 6600,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",
    category: "accessories",
    rating: 4.8,
    reviews: 94,
    description: "Delicate 14K gold-plated layered chain. Elegant and lightweight.",
    inStock: true,
    isNew: true,
  },
];

export const orders: Order[] = [
  { id: "ORD-001", customer: "Sophia Chen", email: "sophia@example.com", date: "2024-01-15", amount: 9250, status: "delivered", items: 3 },
  { id: "ORD-002", customer: "Isabella Martinez", email: "isabella@example.com", date: "2024-01-14", amount: 7100, status: "shipped", items: 2 },
  { id: "ORD-003", customer: "Olivia Johnson", email: "olivia@example.com", date: "2024-01-14", amount: 12900, status: "processing", items: 4 },
  { id: "ORD-004", customer: "Emma Williams", email: "emma@example.com", date: "2024-01-13", amount: 4850, status: "pending", items: 1 },
  { id: "ORD-005", customer: "Ava Brown", email: "ava@example.com", date: "2024-01-13", amount: 21400, status: "delivered", items: 5 },
];

export const customers: Customer[] = [
  { id: "1", name: "Sophia Chen", email: "sophia@example.com", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80", joinDate: "2023-06-15", totalOrders: 12, totalSpent: 92800 },
  { id: "2", name: "Isabella Martinez", email: "isabella@example.com", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80", joinDate: "2023-08-22", totalOrders: 8, totalSpent: 46800 },
  { id: "3", name: "Olivia Johnson", email: "olivia@example.com", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80", joinDate: "2023-09-10", totalOrders: 15, totalSpent: 135000 },
  { id: "4", name: "Emma Williams", email: "emma@example.com", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80", joinDate: "2023-11-05", totalOrders: 5, totalSpent: 33100 },
];

export const dashboardStats = {
  totalRevenue: 1825000,
  totalOrders: 1248,
  totalCustomers: 892,
  totalProducts: 272,
  revenueGrowth: 12.5,
  ordersGrowth: 8.2,
  customersGrowth: 15.3,
  productsGrowth: 4.1,
};