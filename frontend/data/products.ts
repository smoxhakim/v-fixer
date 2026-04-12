export interface Product {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  price: number;
  discountPrice?: number;
  rating: number;
  images: string[];
  shortDescription: string;
  description: string;
  specs: { label: string; value: string }[];
  stock: number;
}

export const products: Product[] = [
  // Smartphones
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    slug: "iphone-15-pro-max",
    categorySlug: "smartphone",
    price: 1199,
    discountPrice: 1099,
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop",
    ],
    shortDescription: "Titanium. So strong. So light. So Pro.",
    description:
      "iPhone 15 Pro Max features a strong and light titanium design with A17 Pro chip, a customizable Action button, and a more versatile Pro camera system.",
    specs: [
      { label: "Display", value: '6.7" Super Retina XDR' },
      { label: "Chip", value: "A17 Pro" },
      { label: "Camera", value: "48MP Main" },
      { label: "Battery", value: "Up to 29 hours" },
      { label: "Storage", value: "256GB" },
    ],
    stock: 25,
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    categorySlug: "smartphone",
    price: 1299,
    discountPrice: 1199,
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop",
    ],
    shortDescription: "Galaxy AI is here. Welcome to the era of mobile AI.",
    description:
      "The Samsung Galaxy S24 Ultra brings Galaxy AI with a titanium frame, 200MP camera and the brightest display ever on a Galaxy phone.",
    specs: [
      { label: "Display", value: '6.8" Dynamic AMOLED 2X' },
      { label: "Processor", value: "Snapdragon 8 Gen 3" },
      { label: "Camera", value: "200MP Main" },
      { label: "Battery", value: "5000mAh" },
      { label: "Storage", value: "256GB" },
    ],
    stock: 30,
  },
  {
    id: "3",
    name: "Google Pixel 8 Pro",
    slug: "google-pixel-8-pro",
    categorySlug: "smartphone",
    price: 999,
    discountPrice: 899,
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop",
    ],
    shortDescription: "The best of Google. Made by Google.",
    description:
      "Google Pixel 8 Pro with Google Tensor G3 chip, advanced AI photo editing, and the best Pixel camera ever.",
    specs: [
      { label: "Display", value: '6.7" LTPO OLED' },
      { label: "Processor", value: "Tensor G3" },
      { label: "Camera", value: "50MP Main" },
      { label: "Battery", value: "5050mAh" },
      { label: "Storage", value: "128GB" },
    ],
    stock: 20,
  },
  {
    id: "4",
    name: "OnePlus 12",
    slug: "oneplus-12",
    categorySlug: "smartphone",
    price: 799,
    discountPrice: 749,
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop",
    ],
    shortDescription: "The next era of performance.",
    description:
      "OnePlus 12 delivers flagship performance with Snapdragon 8 Gen 3, 100W fast charging, and a Hasselblad camera system.",
    specs: [
      { label: "Display", value: '6.82" 2K LTPO AMOLED' },
      { label: "Processor", value: "Snapdragon 8 Gen 3" },
      { label: "Camera", value: "50MP Main" },
      { label: "Battery", value: "5400mAh" },
      { label: "Storage", value: "256GB" },
    ],
    stock: 18,
  },
  {
    id: "5",
    name: "Samsung Galaxy Z Fold 5",
    slug: "samsung-galaxy-z-fold-5",
    categorySlug: "smartphone",
    price: 1799,
    discountPrice: 1599,
    rating: 4.4,
    images: [
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop",
    ],
    shortDescription: "Unfold your world. The foldable revolution.",
    description:
      "Samsung Galaxy Z Fold 5 with a more compact hinge, Flex Mode, and multitasking capabilities like never before.",
    specs: [
      { label: "Display", value: '7.6" Foldable Dynamic AMOLED' },
      { label: "Processor", value: "Snapdragon 8 Gen 2" },
      { label: "Camera", value: "50MP Main" },
      { label: "Battery", value: "4400mAh" },
      { label: "Storage", value: "256GB" },
    ],
    stock: 12,
  },
  // Tablets
  {
    id: "6",
    name: "iPad Pro M4",
    slug: "ipad-pro-m4",
    categorySlug: "tablet",
    price: 1099,
    discountPrice: 999,
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop",
    ],
    shortDescription: "Incredibly thin. Incredibly powerful.",
    description:
      "iPad Pro M4 features the M4 chip, a stunning Tandem OLED display, and Apple Pencil Pro support.",
    specs: [
      { label: "Display", value: '11" or 13" Tandem OLED' },
      { label: "Chip", value: "Apple M4" },
      { label: "Storage", value: "256GB" },
      { label: "Battery", value: "Up to 10 hours" },
      { label: "Weight", value: "444g" },
    ],
    stock: 22,
  },
  {
    id: "7",
    name: "Samsung Galaxy Tab S9",
    slug: "samsung-galaxy-tab-s9",
    categorySlug: "tablet",
    price: 849,
    discountPrice: 749,
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=600&fit=crop",
    ],
    shortDescription: "Your next computer is a tablet.",
    description:
      "Samsung Galaxy Tab S9 with Dynamic AMOLED 2X display, IP68 water resistance, and S Pen included.",
    specs: [
      { label: "Display", value: '11" Dynamic AMOLED 2X' },
      { label: "Processor", value: "Snapdragon 8 Gen 2" },
      { label: "Storage", value: "128GB" },
      { label: "Battery", value: "8400mAh" },
      { label: "Weight", value: "498g" },
    ],
    stock: 15,
  },
  {
    id: "8",
    name: "iPad Air M2",
    slug: "ipad-air-m2",
    categorySlug: "tablet",
    price: 599,
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&h=600&fit=crop",
    ],
    shortDescription: "Supercharged by M2.",
    description:
      "iPad Air with M2 chip delivers performance and versatility in a thin and light design.",
    specs: [
      { label: "Display", value: '10.9" Liquid Retina' },
      { label: "Chip", value: "Apple M2" },
      { label: "Storage", value: "128GB" },
      { label: "Battery", value: "Up to 10 hours" },
      { label: "Weight", value: "461g" },
    ],
    stock: 35,
  },
  // Game Consoles
  {
    id: "9",
    name: "PlayStation 5",
    slug: "playstation-5",
    categorySlug: "game-console",
    price: 499,
    discountPrice: 449,
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=600&fit=crop",
    ],
    shortDescription: "Play has no limits.",
    description:
      "PlayStation 5 with ultra-high speed SSD, haptic feedback, adaptive triggers, and 3D Audio technology.",
    specs: [
      { label: "CPU", value: "AMD Zen 2, 8 cores" },
      { label: "GPU", value: "10.28 TFLOPS RDNA 2" },
      { label: "Storage", value: "825GB SSD" },
      { label: "Resolution", value: "Up to 4K 120fps" },
      { label: "Disc Drive", value: "4K UHD Blu-ray" },
    ],
    stock: 40,
  },
  {
    id: "10",
    name: "Xbox Series X",
    slug: "xbox-series-x",
    categorySlug: "game-console",
    price: 499,
    discountPrice: 459,
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&h=600&fit=crop",
    ],
    shortDescription: "Power your dreams.",
    description:
      "Xbox Series X delivers 12 teraflops of processing power, true 4K gaming, and backward compatibility.",
    specs: [
      { label: "CPU", value: "AMD Zen 2, 8 cores" },
      { label: "GPU", value: "12 TFLOPS RDNA 2" },
      { label: "Storage", value: "1TB SSD" },
      { label: "Resolution", value: "Up to 4K 120fps" },
      { label: "Disc Drive", value: "4K UHD Blu-ray" },
    ],
    stock: 35,
  },
  {
    id: "11",
    name: "Nintendo Switch OLED",
    slug: "nintendo-switch-oled",
    categorySlug: "game-console",
    price: 349,
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&h=600&fit=crop",
    ],
    shortDescription: "Play anywhere with a vibrant OLED screen.",
    description:
      "Nintendo Switch OLED with a 7-inch OLED screen, wide adjustable stand, wired LAN port, and 64GB internal storage.",
    specs: [
      { label: "Display", value: '7" OLED' },
      { label: "Storage", value: "64GB" },
      { label: "Battery", value: "4.5-9 hours" },
      { label: "Weight", value: "420g" },
      { label: "Modes", value: "TV, Tabletop, Handheld" },
    ],
    stock: 28,
  },
  // Cameras
  {
    id: "12",
    name: "Sony Alpha A7 IV",
    slug: "sony-alpha-a7-iv",
    categorySlug: "camera",
    price: 2498,
    discountPrice: 2298,
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop",
    ],
    shortDescription: "Beyond the basics. Full-frame hybrid camera.",
    description:
      "Sony A7 IV features a 33MP full-frame sensor, real-time Eye AF, and 4K 60p video recording.",
    specs: [
      { label: "Sensor", value: "33MP Full-Frame" },
      { label: "ISO Range", value: "100-51200" },
      { label: "Video", value: "4K 60p" },
      { label: "AF Points", value: "759" },
      { label: "Weight", value: "658g" },
    ],
    stock: 10,
  },
  {
    id: "13",
    name: "Canon EOS R6 Mark II",
    slug: "canon-eos-r6-mark-ii",
    categorySlug: "camera",
    price: 2499,
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=600&fit=crop",
    ],
    shortDescription: "Unstoppable speed meets incredible image quality.",
    description:
      "Canon EOS R6 Mark II with 24.2MP full-frame sensor, 40fps continuous shooting, and Dual Pixel CMOS AF II.",
    specs: [
      { label: "Sensor", value: "24.2MP Full-Frame" },
      { label: "Burst", value: "40fps Electronic" },
      { label: "Video", value: "4K 60p" },
      { label: "AF System", value: "Dual Pixel CMOS AF II" },
      { label: "Weight", value: "670g" },
    ],
    stock: 8,
  },
  {
    id: "14",
    name: "GoPro HERO 12 Black",
    slug: "gopro-hero-12-black",
    categorySlug: "camera",
    price: 399,
    discountPrice: 349,
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600&h=600&fit=crop",
    ],
    shortDescription: "The ultimate action camera.",
    description:
      "GoPro HERO 12 Black with 5.3K video, HyperSmooth 6.0 stabilization, and improved battery life.",
    specs: [
      { label: "Video", value: "5.3K 60fps" },
      { label: "Photo", value: "27MP" },
      { label: "Stabilization", value: "HyperSmooth 6.0" },
      { label: "Waterproof", value: "33ft / 10m" },
      { label: "Weight", value: "154g" },
    ],
    stock: 45,
  },
  // Smartwatches
  {
    id: "15",
    name: "Apple Watch Ultra 2",
    slug: "apple-watch-ultra-2",
    categorySlug: "smartwatch",
    price: 799,
    discountPrice: 749,
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=600&h=600&fit=crop",
    ],
    shortDescription: "The most capable Apple Watch ever.",
    description:
      "Apple Watch Ultra 2 with the S9 SiP, a brighter display, precision dual-frequency GPS, and up to 36 hours of battery life.",
    specs: [
      { label: "Display", value: "49mm Always-On Retina" },
      { label: "Chip", value: "S9 SiP" },
      { label: "Battery", value: "Up to 36 hours" },
      { label: "Water Resistance", value: "100m" },
      { label: "Case", value: "Titanium" },
    ],
    stock: 20,
  },
  {
    id: "16",
    name: "Samsung Galaxy Watch 6",
    slug: "samsung-galaxy-watch-6",
    categorySlug: "smartwatch",
    price: 329,
    discountPrice: 279,
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop",
    ],
    shortDescription: "Your health, your way.",
    description:
      "Samsung Galaxy Watch 6 with an enhanced BioActive Sensor, personalized heart rate zones, and a slimmer design.",
    specs: [
      { label: "Display", value: '1.5" Super AMOLED' },
      { label: "Processor", value: "Exynos W930" },
      { label: "Battery", value: "425mAh" },
      { label: "Water Resistance", value: "5ATM + IP68" },
      { label: "OS", value: "Wear OS 4" },
    ],
    stock: 30,
  },
  // Audio
  {
    id: "17",
    name: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    categorySlug: "audio",
    price: 399,
    discountPrice: 348,
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop",
    ],
    shortDescription: "Industry-leading noise cancellation.",
    description:
      "Sony WH-1000XM5 with Auto NC Optimizer, Speak-to-Chat, and 30-hour battery life.",
    specs: [
      { label: "Driver", value: "30mm" },
      { label: "ANC", value: "Auto NC Optimizer" },
      { label: "Battery", value: "30 hours" },
      { label: "Codec", value: "LDAC, AAC" },
      { label: "Weight", value: "250g" },
    ],
    stock: 50,
  },
  {
    id: "18",
    name: "AirPods Pro 2",
    slug: "airpods-pro-2",
    categorySlug: "audio",
    price: 249,
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&h=600&fit=crop",
    ],
    shortDescription: "Adaptive Audio. Personalized Spatial Audio.",
    description:
      "AirPods Pro 2 with the H2 chip, Adaptive Audio, Conversation Awareness, and USB-C charging case.",
    specs: [
      { label: "Chip", value: "Apple H2" },
      { label: "ANC", value: "Active Noise Cancellation" },
      { label: "Battery", value: "6 hours (30 with case)" },
      { label: "Water Resistance", value: "IPX4" },
      { label: "Charging", value: "USB-C, MagSafe" },
    ],
    stock: 60,
  },
  {
    id: "19",
    name: "JBL Charge 5",
    slug: "jbl-charge-5",
    categorySlug: "audio",
    price: 179,
    discountPrice: 149,
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
    ],
    shortDescription: "Portable speaker with powerful sound.",
    description:
      "JBL Charge 5 with bold JBL Original Pro Sound, IP67 waterproof and dustproof, and built-in powerbank.",
    specs: [
      { label: "Output", value: "30W" },
      { label: "Battery", value: "20 hours" },
      { label: "Protection", value: "IP67" },
      { label: "Bluetooth", value: "5.1" },
      { label: "Weight", value: "960g" },
    ],
    stock: 40,
  },
  // Computers
  {
    id: "20",
    name: "MacBook Pro 16 M3 Pro",
    slug: "macbook-pro-16-m3-pro",
    categorySlug: "computer",
    price: 2499,
    discountPrice: 2299,
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop",
    ],
    shortDescription: "2K Fullview Touch Display.",
    description:
      "MacBook Pro 16-inch with M3 Pro chip, Liquid Retina XDR display, and up to 22 hours of battery life.",
    specs: [
      { label: "Chip", value: "Apple M3 Pro" },
      { label: "Display", value: '16.2" Liquid Retina XDR' },
      { label: "RAM", value: "18GB" },
      { label: "Storage", value: "512GB SSD" },
      { label: "Battery", value: "Up to 22 hours" },
    ],
    stock: 15,
  },
  {
    id: "21",
    name: "Dell XPS 15",
    slug: "dell-xps-15",
    categorySlug: "computer",
    price: 1499,
    discountPrice: 1349,
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop",
    ],
    shortDescription: "Power meets beauty.",
    description:
      "Dell XPS 15 with 13th Gen Intel Core i7, NVIDIA GeForce RTX 4050, and a stunning InfinityEdge display.",
    specs: [
      { label: "Processor", value: "Intel Core i7-13700H" },
      { label: "Display", value: '15.6" 3.5K OLED' },
      { label: "RAM", value: "16GB" },
      { label: "GPU", value: "RTX 4050" },
      { label: "Storage", value: "512GB SSD" },
    ],
    stock: 20,
  },
  // Drones
  {
    id: "22",
    name: "DJI Mavic Air 3",
    slug: "dji-mavic-air-3",
    categorySlug: "drone",
    price: 1099,
    discountPrice: 999,
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&h=600&fit=crop",
    ],
    shortDescription: "Capture the world from above.",
    description:
      "DJI Mavic Air 3 with dual-camera system, 46 minutes of flight time, and omnidirectional obstacle sensing.",
    specs: [
      { label: "Camera", value: "48MP Dual Camera" },
      { label: "Video", value: "4K 60fps HDR" },
      { label: "Flight Time", value: "46 minutes" },
      { label: "Range", value: "20km" },
      { label: "Weight", value: "720g" },
    ],
    stock: 12,
  },
  {
    id: "23",
    name: "DJI Mini 4 Pro",
    slug: "dji-mini-4-pro",
    categorySlug: "drone",
    price: 759,
    discountPrice: 699,
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=600&h=600&fit=crop",
    ],
    shortDescription: "Mini drone, mega performance.",
    description:
      "DJI Mini 4 Pro weighs under 249g, shoots 4K HDR video, and features omnidirectional obstacle sensing.",
    specs: [
      { label: "Camera", value: "48MP 1/1.3-inch CMOS" },
      { label: "Video", value: "4K 100fps" },
      { label: "Flight Time", value: "34 minutes" },
      { label: "Weight", value: "249g" },
      { label: "Range", value: "20km" },
    ],
    stock: 18,
  },
  // Accessories
  {
    id: "24",
    name: "Apple Magic Keyboard",
    slug: "apple-magic-keyboard",
    categorySlug: "accessories",
    price: 299,
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop",
    ],
    shortDescription: "A magical typing experience.",
    description:
      "Apple Magic Keyboard with Touch ID and Numeric Keypad for a comfortable and precise typing experience.",
    specs: [
      { label: "Connectivity", value: "Bluetooth, Lightning" },
      { label: "Battery", value: "1 month" },
      { label: "Touch ID", value: "Yes" },
      { label: "Numeric Keypad", value: "Yes" },
      { label: "Weight", value: "390g" },
    ],
    stock: 50,
  },
  {
    id: "25",
    name: "Logitech MX Master 3S",
    slug: "logitech-mx-master-3s",
    categorySlug: "accessories",
    price: 99,
    discountPrice: 89,
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop",
    ],
    shortDescription: "Master your workflow.",
    description:
      "Logitech MX Master 3S with 8K DPI tracking, quiet clicks, and MagSpeed electromagnetic scroll wheel.",
    specs: [
      { label: "DPI", value: "8000" },
      { label: "Battery", value: "70 days" },
      { label: "Connection", value: "Bluetooth, USB-C" },
      { label: "Buttons", value: "7" },
      { label: "Weight", value: "141g" },
    ],
    stock: 45,
  },
  // Wearables
  {
    id: "26",
    name: "Meta Quest 3",
    slug: "meta-quest-3",
    categorySlug: "wearables",
    price: 499,
    discountPrice: 449,
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&h=600&fit=crop",
    ],
    shortDescription: "Mixed reality headset for everyone.",
    description:
      "Meta Quest 3 with Snapdragon XR2 Gen 2, full-color mixed reality passthrough, and an expansive VR game library.",
    specs: [
      { label: "Processor", value: "Snapdragon XR2 Gen 2" },
      { label: "Display", value: "2064x2208 per eye" },
      { label: "Storage", value: "128GB" },
      { label: "Battery", value: "Up to 2.2 hours" },
      { label: "Weight", value: "515g" },
    ],
    stock: 20,
  },
  {
    id: "27",
    name: "Fitbit Sense 2",
    slug: "fitbit-sense-2",
    categorySlug: "wearables",
    price: 299,
    discountPrice: 249,
    rating: 4.3,
    images: [
      "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&fit=crop",
    ],
    shortDescription: "Advanced health smartwatch.",
    description:
      "Fitbit Sense 2 with stress management tools, ECG app, and 6+ days of battery life.",
    specs: [
      { label: "Display", value: '1.58" AMOLED' },
      { label: "Battery", value: "6+ days" },
      { label: "Sensors", value: "EDA, ECG, SpO2" },
      { label: "Water Resistance", value: "50m" },
      { label: "GPS", value: "Built-in" },
    ],
    stock: 25,
  },
  // More smartphones to fill grid
  {
    id: "28",
    name: "Xiaomi 14 Ultra",
    slug: "xiaomi-14-ultra",
    categorySlug: "smartphone",
    price: 899,
    discountPrice: 799,
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop",
    ],
    shortDescription: "Leica optics. Flagship performance.",
    description:
      "Xiaomi 14 Ultra with Leica Summilux lens system, Snapdragon 8 Gen 3, and 90W fast charging.",
    specs: [
      { label: "Display", value: '6.73" LTPO AMOLED' },
      { label: "Processor", value: "Snapdragon 8 Gen 3" },
      { label: "Camera", value: "50MP Leica Quad" },
      { label: "Battery", value: "5000mAh" },
      { label: "Charging", value: "90W Wired" },
    ],
    stock: 15,
  },
  {
    id: "29",
    name: "Nothing Phone 2",
    slug: "nothing-phone-2",
    categorySlug: "smartphone",
    price: 599,
    discountPrice: 549,
    rating: 4.4,
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop",
    ],
    shortDescription: "The phone that glows differently.",
    description:
      "Nothing Phone 2 with unique Glyph Interface, Snapdragon 8+ Gen 1, and a clean Android experience.",
    specs: [
      { label: "Display", value: '6.7" LTPO OLED' },
      { label: "Processor", value: "Snapdragon 8+ Gen 1" },
      { label: "Camera", value: "50MP Dual" },
      { label: "Battery", value: "4700mAh" },
      { label: "Storage", value: "128GB" },
    ],
    stock: 22,
  },
  // More computers
  {
    id: "30",
    name: "ASUS ROG Strix G16",
    slug: "asus-rog-strix-g16",
    categorySlug: "computer",
    price: 1599,
    discountPrice: 1449,
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop",
    ],
    shortDescription: "Built for gaming dominance.",
    description:
      "ASUS ROG Strix G16 with Intel Core i9, NVIDIA RTX 4070, and 240Hz display for competitive gaming.",
    specs: [
      { label: "Processor", value: "Intel Core i9-14900HX" },
      { label: "Display", value: '16" QHD+ 240Hz' },
      { label: "RAM", value: "16GB DDR5" },
      { label: "GPU", value: "RTX 4070" },
      { label: "Storage", value: "1TB SSD" },
    ],
    stock: 10,
  },
  // More Audio
  {
    id: "31",
    name: "Bose QuietComfort Ultra",
    slug: "bose-quietcomfort-ultra",
    categorySlug: "audio",
    price: 429,
    discountPrice: 379,
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop",
    ],
    shortDescription: "World-class noise cancellation refined.",
    description:
      "Bose QuietComfort Ultra headphones with Immersive Audio, CustomTune technology, and up to 24 hours of battery.",
    specs: [
      { label: "ANC", value: "World-Class" },
      { label: "Battery", value: "24 hours" },
      { label: "Audio", value: "Immersive Audio" },
      { label: "Codec", value: "aptX Adaptive" },
      { label: "Weight", value: "250g" },
    ],
    stock: 35,
  },
  // More tablets
  {
    id: "32",
    name: "Microsoft Surface Pro 10",
    slug: "microsoft-surface-pro-10",
    categorySlug: "tablet",
    price: 1199,
    discountPrice: 1099,
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&h=600&fit=crop",
    ],
    shortDescription: "The tablet that replaces your laptop.",
    description:
      "Microsoft Surface Pro 10 with Intel Core Ultra, AI-powered features, and the versatility of a 2-in-1.",
    specs: [
      { label: "Processor", value: "Intel Core Ultra" },
      { label: "Display", value: '13" PixelSense Flow' },
      { label: "RAM", value: "16GB" },
      { label: "Storage", value: "256GB SSD" },
      { label: "Battery", value: "Up to 14 hours" },
    ],
    stock: 18,
  },
  // More smartwatches
  {
    id: "33",
    name: "Garmin Fenix 8",
    slug: "garmin-fenix-8",
    categorySlug: "smartwatch",
    price: 899,
    discountPrice: 849,
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=600&h=600&fit=crop",
    ],
    shortDescription: "Ultimate multisport GPS watch.",
    description:
      "Garmin Fenix 8 with AMOLED display, advanced training metrics, and up to 48 days of battery life in expedition mode.",
    specs: [
      { label: "Display", value: '1.4" AMOLED' },
      { label: "Battery", value: "Up to 48 days" },
      { label: "GPS", value: "Multi-band GNSS" },
      { label: "Water Rating", value: "10ATM" },
      { label: "Material", value: "Titanium" },
    ],
    stock: 14,
  },
  // More cameras
  {
    id: "34",
    name: "Fujifilm X-T5",
    slug: "fujifilm-x-t5",
    categorySlug: "camera",
    price: 1699,
    discountPrice: 1549,
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop",
    ],
    shortDescription: "Pure photography. Beautiful design.",
    description:
      "Fujifilm X-T5 with 40.2MP X-Trans CMOS 5 HR sensor, IBIS, and Film Simulation modes.",
    specs: [
      { label: "Sensor", value: "40.2MP APS-C" },
      { label: "IBIS", value: "Up to 7 stops" },
      { label: "Video", value: "6.2K 30p" },
      { label: "EVF", value: "3.69M dots OLED" },
      { label: "Weight", value: "557g" },
    ],
    stock: 11,
  },
  // More accessories
  {
    id: "35",
    name: "Samsung 49\" Odyssey G9",
    slug: "samsung-odyssey-g9",
    categorySlug: "accessories",
    price: 1299,
    discountPrice: 1099,
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop",
    ],
    shortDescription: "Immersive ultra-wide gaming.",
    description:
      "Samsung 49-inch Odyssey G9 with Dual QHD, 240Hz refresh rate, and 1000R curvature.",
    specs: [
      { label: "Display", value: '49" Dual QHD' },
      { label: "Refresh Rate", value: "240Hz" },
      { label: "Response Time", value: "1ms" },
      { label: "Curvature", value: "1000R" },
      { label: "Panel", value: "VA" },
    ],
    stock: 8,
  },
  // Extra products
  {
    id: "36",
    name: "Sonos Era 300",
    slug: "sonos-era-300",
    categorySlug: "audio",
    price: 449,
    discountPrice: 399,
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
    ],
    shortDescription: "Spatial audio, reimagined.",
    description:
      "Sonos Era 300 with Dolby Atmos support, 6 drivers, and room-filling spatial sound.",
    specs: [
      { label: "Drivers", value: "6" },
      { label: "Audio", value: "Dolby Atmos" },
      { label: "Connectivity", value: "Wi-Fi 6, Bluetooth" },
      { label: "Voice", value: "Sonos Voice, Alexa" },
      { label: "Dimensions", value: "261 x 185 x 160mm" },
    ],
    stock: 20,
  },
  {
    id: "37",
    name: "PS5 DualSense Edge",
    slug: "ps5-dualsense-edge",
    categorySlug: "game-console",
    price: 199,
    discountPrice: 179,
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=600&fit=crop",
    ],
    shortDescription: "Ultra-customizable pro controller.",
    description:
      "PS5 DualSense Edge with remappable buttons, adjustable triggers, and swappable stick modules.",
    specs: [
      { label: "Type", value: "Wireless Controller" },
      { label: "Connection", value: "USB-C, Bluetooth" },
      { label: "Haptics", value: "Advanced Haptic Feedback" },
      { label: "Triggers", value: "Adjustable Adaptive" },
      { label: "Battery", value: "Built-in Rechargeable" },
    ],
    stock: 30,
  },
  {
    id: "38",
    name: "Razer Blade 16",
    slug: "razer-blade-16",
    categorySlug: "computer",
    price: 2799,
    discountPrice: 2499,
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop",
    ],
    shortDescription: "The ultimate gaming laptop.",
    description:
      "Razer Blade 16 with Intel Core i9, NVIDIA RTX 4090, and a 16-inch Dual-Mode Mini-LED display.",
    specs: [
      { label: "Processor", value: "Intel Core i9-14900HX" },
      { label: "Display", value: '16" Dual-Mode Mini-LED' },
      { label: "RAM", value: "32GB DDR5" },
      { label: "GPU", value: "RTX 4090" },
      { label: "Storage", value: "1TB SSD" },
    ],
    stock: 6,
  },
  {
    id: "39",
    name: "Anker 737 Power Bank",
    slug: "anker-737-power-bank",
    categorySlug: "accessories",
    price: 149,
    discountPrice: 119,
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop",
    ],
    shortDescription: "Power on the go.",
    description:
      "Anker 737 Power Bank with 24,000mAh capacity, 140W output, and smart digital display.",
    specs: [
      { label: "Capacity", value: "24,000mAh" },
      { label: "Output", value: "140W Max" },
      { label: "Ports", value: "2x USB-C, 1x USB-A" },
      { label: "Weight", value: "630g" },
      { label: "Display", value: "Smart Digital" },
    ],
    stock: 55,
  },
  {
    id: "40",
    name: "Apple Vision Pro",
    slug: "apple-vision-pro",
    categorySlug: "wearables",
    price: 3499,
    discountPrice: 3299,
    rating: 4.4,
    images: [
      "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&h=600&fit=crop",
    ],
    shortDescription: "Welcome to the era of spatial computing.",
    description:
      "Apple Vision Pro with visionOS, micro-OLED displays, spatial audio, and eye/hand/voice control.",
    specs: [
      { label: "Chip", value: "M2 + R1" },
      { label: "Display", value: "23M pixels micro-OLED" },
      { label: "Audio", value: "Spatial Audio" },
      { label: "Storage", value: "256GB" },
      { label: "Control", value: "Eye, Hand, Voice" },
    ],
    stock: 5,
  },
];

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.discountPrice).slice(0, 10);
}

export function getTrendingProducts(): Product[] {
  return products
    .filter((p) => p.categorySlug === "smartphone")
    .slice(0, 5);
}
