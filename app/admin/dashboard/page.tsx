"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrders, getProducts, getCategories, createProduct, Order } from "@/lib/api";

type Product = any; // Assuming it matches the old type for now
type Category = any;

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    categoryId: "",
    price: 0,
    stock: 0,
    shortDescription: ""
  });

  useEffect(() => {
    const t = localStorage.getItem("adminToken");
    if (!t) {
      router.push("/admin/login");
      return;
    }
    setToken(t);
    fetchData(t);
  }, [router]);

  const fetchData = async (t: string) => {
    try {
      const [oData, pData, cData] = await Promise.all([
        getOrders(t),
        getProducts(),
        getCategories(),
      ]);
      setOrders(oData);
      setProducts(pData);
      setCategories(cData);
    } catch (err) {
      toast.error("Failed to load dashboard data");
      localStorage.removeItem("adminToken");
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      // Find category object to pass as FK id
      const cat = categories.find(c => c.id === newProduct.categoryId);
      if (!cat) {
        toast.error("Please select a category");
        return;
      }

      await createProduct(
        {
          name: newProduct.name,
          slug: newProduct.slug,
          category: cat.id, 
          price: Number(newProduct.price),
          stock: Number(newProduct.stock),
          short_description: newProduct.shortDescription,
        },
        token
      );
      toast.success("Product created!");
      fetchData(token);
    } catch (err) {
      toast.error("Error creating product");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <Button onClick={() => {
          localStorage.removeItem("adminToken");
          router.push("/admin/login");
        }} variant="outline">
          Logout
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Inventory</TabsTrigger>
          <TabsTrigger value="add_product">Add Product</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map(o => (
                  <div key={o.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium text-sm">Order #{o.id.substring(0,8)}</p>
                      <p className="text-xs text-muted-foreground">{o.createdAt}</p>
                    </div>
                    <div className="font-bold">${o.total}</div>
                    <div className="text-sm uppercase tracking-wider">{o.status}</div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Inventory List</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map(p => (
                  <div key={p.id} className="border rounded p-2 text-sm">
                    <p className="font-semibold truncate">{p.name}</p>
                    <p className="text-muted-foreground">${p.price}</p>
                    <p className="mt-2 text-xs">Stock: {p.stock}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add_product" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add New Product</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, "-")})} />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input required value={newProduct.slug} onChange={e => setNewProduct({...newProduct, slug: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newProduct.categoryId} 
                    onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Stock Quantity</Label>
                  <Input required type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Short Description</Label>
                  <Input required value={newProduct.shortDescription} onChange={e => setNewProduct({...newProduct, shortDescription: e.target.value})} />
                </div>
                <div className="md:col-span-2 mt-4">
                  <Button type="submit">Create Product</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
