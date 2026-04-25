"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { AdminAuthBanner } from "@/components/admin/admin-auth-banner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminToken } from "@/hooks/use-admin-token";
import {
  importCategoriesCsv,
  importProductsXlsx,
  previewProductsXlsx,
  type ImportResult,
  type ProductImportPreviewResult,
} from "@/lib/api";

function ResultSummary({ title, result }: { title: string; result: ImportResult | null }) {
  if (!result) return null;
  return (
    <div className="rounded-md border p-3 text-sm">
      <div className="flex items-center gap-3">
        <strong>{title}</strong>
        <Badge variant="secondary">Created: {result.created}</Badge>
        {typeof result.updated === "number" ? (
          <Badge variant="secondary">Updated: {result.updated}</Badge>
        ) : null}
        <Badge variant={result.errors.length ? "destructive" : "outline"}>
          Errors: {result.errors.length}
        </Badge>
      </div>
      {result.errors.length ? (
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {result.errors.slice(0, 20).map((err, idx) => (
            <li key={`${err.row}-${idx}`}>
              Row {err.row}: {err.message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function AdminImportPage() {
  const { token, hydrated } = useAdminToken();
  const [categoriesFile, setCategoriesFile] = useState<File | null>(null);
  const [productsFile, setProductsFile] = useState<File | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [categoriesResult, setCategoriesResult] = useState<ImportResult | null>(null);
  const [productsResult, setProductsResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<ProductImportPreviewResult | null>(null);

  const onImportCategories = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      toast.error("Add admin token first.");
      return;
    }
    if (!categoriesFile) {
      toast.error("Choose a CSV file first.");
      return;
    }
    setCategoriesLoading(true);
    try {
      const result = await importCategoriesCsv(categoriesFile, token);
      setCategoriesResult(result);
      toast.success("Categories import finished.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Categories import failed.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const onPreviewProducts = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      toast.error("Add admin token first.");
      return;
    }
    if (!productsFile) {
      toast.error("Choose an .xlsx file first.");
      return;
    }
    setPreviewLoading(true);
    try {
      const result = await previewProductsXlsx(productsFile, token);
      setPreview(result);
      toast.success("Preview generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Preview failed.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const onImportProducts = async () => {
    if (!token) {
      toast.error("Add admin token first.");
      return;
    }
    if (!productsFile) {
      toast.error("Choose an .xlsx file first.");
      return;
    }
    setProductsLoading(true);
    try {
      const result = await importProductsXlsx(productsFile, token);
      setProductsResult(result);
      toast.success("Products import finished.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Products import failed.");
    } finally {
      setProductsLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        <span className="text-sm">Loading import UI…</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Catalog import"
        description="Step 1: import categories CSV. Step 2: upload products .xlsx with columns IMAGE, REF, PRICE, PRICE ACHA, QT, CATEGORY (CATEGORY optional — assign later in product edit)."
      />
      {!token ? <AdminAuthBanner variant="write" /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Categories CSV</CardTitle>
          <CardDescription>
            Required headers: <code>name</code>, <code>slug</code>. Optional:{" "}
            <code>icon</code>, <code>parent_slug</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onImportCategories} className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="categories-file">CSV file</Label>
              <Input
                id="categories-file"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setCategoriesFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <Button type="submit" disabled={categoriesLoading || !token}>
              {categoriesLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Importing…
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Import categories
                </>
              )}
            </Button>
          </form>
          <ResultSummary title="Categories result" result={categoriesResult} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products .xlsx</CardTitle>
          <CardDescription>
            Use Google Sheets export: <strong>File → Download → Microsoft Excel (.xlsx)</strong>.
            Preview is stateless; confirm import re-uses the selected file. Put pictures in column{" "}
            <strong>A</strong> (IMAGE) and anchor the top-left to the <strong>same row</strong> as that
            product&apos;s REF/PRICE/QT (row 2 = first product row, not the header).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onPreviewProducts} className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="products-file">XLSX file</Label>
              <Input
                id="products-file"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => setProductsFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <Button type="submit" variant="outline" disabled={previewLoading || !token}>
              {previewLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Previewing…
                </>
              ) : (
                "Preview rows"
              )}
            </Button>
            <Button type="button" onClick={onImportProducts} disabled={productsLoading || !token}>
              {productsLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Importing…
                </>
              ) : (
                "Confirm import (re-upload)"
              )}
            </Button>
          </form>

          <ResultSummary title="Products result" result={productsResult} />
          {preview ? (
            <div className="space-y-3">
              <ResultSummary title="Preview errors" result={preview} />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>REF</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Images</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.slice(0, 100).map((row) => (
                    <TableRow key={row.row}>
                      <TableCell>{row.row}</TableCell>
                      <TableCell>{row.ref}</TableCell>
                      <TableCell className="text-right">{row.price}</TableCell>
                      <TableCell className="text-right">{row.costPrice ?? "—"}</TableCell>
                      <TableCell className="text-right">{row.stock}</TableCell>
                      <TableCell>
                        {row.categorySlug ?? "—"}{" "}
                        {row.categorySlug == null ? (
                          <Badge variant="secondary">set later</Badge>
                        ) : row.categoryResolved ? (
                          <Badge variant="outline">ok</Badge>
                        ) : (
                          <Badge variant="destructive">unknown slug</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{row.imagesDetected}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
