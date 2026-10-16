/**
 * Mock product data — no external API or paid service required.
 * These products are statically defined and serve as the catalogue dataset.
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  badge?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Wireless Noise-Cancelling Headphones",
    description:
      "Premium over-ear headphones with 30-hour battery life, adaptive noise cancellation, and studio-quality sound.",
    price: 299.99,
    category: "Electronics",
    image: "/images/headphones.svg",
    rating: 4.8,
    reviewCount: 2341,
    inStock: true,
    badge: "Best Seller",
  },
  {
    id: "p2",
    name: "Mechanical Keyboard — TKL Edition",
    description:
      "Compact tenkeyless layout with Cherry MX switches, per-key RGB, and aluminium top frame.",
    price: 149.99,
    category: "Electronics",
    image: "/images/keyboard.svg",
    rating: 4.7,
    reviewCount: 1089,
    inStock: true,
    badge: "New",
  },
  {
    id: "p3",
    name: "Ultrawide Curved Monitor 34″",
    description:
      "IPS panel, 3440×1440 resolution, 144 Hz refresh, 1 ms response time, and USB-C 90 W power delivery.",
    price: 599.99,
    category: "Electronics",
    image: "/images/monitor.svg",
    rating: 4.6,
    reviewCount: 784,
    inStock: true,
  },
  {
    id: "p4",
    name: "Ergonomic Standing Desk Mat",
    description:
      "Anti-fatigue mat with bevelled edges, 0.75-inch cushioning, and non-slip rubber base for long standing sessions.",
    price: 89.99,
    category: "Office",
    image: "/images/mat.svg",
    rating: 4.5,
    reviewCount: 432,
    inStock: true,
  },
  {
    id: "p5",
    name: "Smart LED Desk Lamp",
    description:
      "Touch-control lamp with five colour temperatures, stepless dimming, USB-A charging port, and auto-timer.",
    price: 49.99,
    category: "Office",
    image: "/images/lamp.svg",
    rating: 4.4,
    reviewCount: 956,
    inStock: true,
    badge: "Sale",
  },
  {
    id: "p6",
    name: "Portable SSD 1TB",
    description:
      "NVMe speeds up to 1050 MB/s in a rugged, palm-sized form factor with USB 3.2 Gen 2 interface.",
    price: 119.99,
    category: "Electronics",
    image: "/images/ssd.svg",
    rating: 4.9,
    reviewCount: 3102,
    inStock: true,
    badge: "Top Rated",
  },
  {
    id: "p7",
    name: "USB-C Hub 8-in-1",
    description:
      "4K HDMI, 100 W PD pass-through, 3× USB-A, SD/MicroSD card reader — plug-and-play, no drivers needed.",
    price: 59.99,
    category: "Electronics",
    image: "/images/hub.svg",
    rating: 4.3,
    reviewCount: 621,
    inStock: false,
  },
  {
    id: "p8",
    name: "Wooden Monitor Riser",
    description:
      "Solid bamboo riser with a two-drawer storage compartment. Raises your monitor to eye level instantly.",
    price: 39.99,
    category: "Office",
    image: "/images/riser.svg",
    rating: 4.6,
    reviewCount: 289,
    inStock: true,
  },
];

export const CATEGORIES = ["All", ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];
