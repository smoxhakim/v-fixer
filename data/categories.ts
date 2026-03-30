export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export const categories: Category[] = [
  { id: "1", name: "Tablet", slug: "tablet", icon: "Tablet" },
  { id: "2", name: "Smartphone", slug: "smartphone", icon: "Smartphone" },
  { id: "3", name: "Game Console", slug: "game-console", icon: "Gamepad2" },
  { id: "4", name: "Camera", slug: "camera", icon: "Camera" },
  { id: "5", name: "Smartwatch", slug: "smartwatch", icon: "Watch" },
  { id: "6", name: "Drone & Flycam", slug: "drone", icon: "Plane" },
  { id: "7", name: "Audio", slug: "audio", icon: "Headphones" },
  { id: "8", name: "Computer", slug: "computer", icon: "Monitor" },
  { id: "9", name: "Accessories", slug: "accessories", icon: "Cable" },
  { id: "10", name: "Wearables", slug: "wearables", icon: "Activity" },
];
