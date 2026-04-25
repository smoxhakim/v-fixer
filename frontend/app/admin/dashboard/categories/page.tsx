"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminAuthBanner } from "@/components/admin/admin-auth-banner";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAdminToken } from "@/hooks/use-admin-token";
import { adminListCategories } from "@/lib/admin-queries";
import type { AdminCategory } from "@/lib/admin-types";
import {
  createCategory,
  deleteCategoryBySlug,
  updateCategoryBySlug,
} from "@/lib/api";

function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function AdminCategoriesPage() {
  const { token, hydrated } = useAdminToken();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCat, setNewCat] = useState({
    name: "",
    slug: "",
    icon: "",
    imageUrl: "",
    parentId: "" as string | undefined,
  });

  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const r = await adminListCategories();
    if (!r.ok) setError(r.error);
    setCategories(r.ok ? r.data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    try {
      await deleteCategoryBySlug(deleteTarget.slug, token);
      toast.success(`Deleted “${deleteTarget.name}”.`);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not delete category.";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Add an admin token via /admin/login before mutating.");
      return;
    }
    setSaving(true);
    try {
      const normalizedSlug = normalizeSlug(newCat.slug.trim());
      const payload = {
        name: newCat.name.trim(),
        slug: normalizedSlug,
        icon: newCat.icon.trim() || null,
        imageUrl: newCat.imageUrl.trim() || "",
        parent: newCat.parentId ? Number(newCat.parentId) : null,
      };
      const existing = categories.find((c) => c.slug === normalizedSlug);
      if (existing) {
        await updateCategoryBySlug(existing.slug, payload, token);
        toast.success("Category updated (existing slug).");
      } else {
        await createCategory(payload, token);
        toast.success("Category created");
      }
      setNewCat({ name: "", slug: "", icon: "", imageUrl: "", parentId: undefined });
      await load();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save category.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (!hydrated || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden />
        <span className="text-sm">Loading categories…</span>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return <AdminErrorState message={error} onRetry={() => void load()} />;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Categories"
        description="Name, slug, optional hero image URL, Lucide icon, and parent hierarchy. Use Edit for full-page settings like the product editor."
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
            Refresh
          </Button>
        }
      />

      {!token ? <AdminAuthBanner variant="write" /> : null}
      {error ? (
        <AdminErrorState message={error} onRetry={() => void load()} />
      ) : null}

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Add category</CardTitle>
            <CardDescription>Optional parent builds a hierarchy.</CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setCreateOpen((v) => !v)}
          >
            {createOpen ? "Hide form" : "Show form"}
          </Button>
        </CardHeader>
        {createOpen ? (
          <CardContent>
            <form className="grid max-w-xl gap-4" onSubmit={handleCreate}>
              <div className="space-y-2">
                <Label htmlFor="nc-name">Name</Label>
                <Input
                  id="nc-name"
                  required
                  value={newCat.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewCat((c) => ({
                      ...c,
                      name,
                      slug: name
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, ""),
                    }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nc-slug">Slug</Label>
                <Input
                  id="nc-slug"
                  required
                  value={newCat.slug}
                  onChange={(e) =>
                    setNewCat((c) => ({ ...c, slug: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nc-icon">Icon (Lucide name, optional)</Label>
                <Input
                  id="nc-icon"
                  placeholder="e.g. laptop"
                  value={newCat.icon}
                  onChange={(e) =>
                    setNewCat((c) => ({ ...c, icon: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nc-image">Image URL (optional)</Label>
                <Input
                  id="nc-image"
                  placeholder="https://… or /media/…"
                  value={newCat.imageUrl}
                  onChange={(e) =>
                    setNewCat((c) => ({ ...c, imageUrl: e.target.value }))
                  }
                  className="font-mono text-xs sm:text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Shown on homepage category tiles when set.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Parent category</Label>
                <Select
                  value={newCat.parentId || "__none__"}
                  onValueChange={(v) =>
                    setNewCat((c) => ({
                      ...c,
                      parentId: v === "__none__" ? undefined : v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description (preview)</Label>
                <Textarea
                  disabled
                  placeholder="Not supported by API yet"
                  className="resize-none bg-muted/50"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Backend has no description field on Category today.
                </p>
              </div>
              <Button type="submit" disabled={saving || !token}>
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  <>
                    <Plus className="size-4" aria-hidden />
                    Create category
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        ) : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All categories</CardTitle>
          <CardDescription>Flat table with parent id reference.</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <AdminEmptyState
              title="No categories"
              description="Create categories here or via Django admin."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                    <TableCell>{c.icon ?? "—"}</TableCell>
                    <TableCell className="max-w-[140px] truncate text-muted-foreground text-xs">
                      {c.imageUrl?.trim() ? c.imageUrl : "—"}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {c.parent ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" title="No status field on API">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center justify-end gap-0.5">
                        {token ? (
                          <>
                            <Button variant="ghost" size="icon" asChild>
                              <Link
                                href={`/admin/dashboard/categories/${encodeURIComponent(c.slug)}/edit`}
                                aria-label={`Edit ${c.name}`}
                              >
                                <Pencil className="size-4" />
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleteTarget(c)}
                              aria-label={`Delete ${c.name}`}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled
                              aria-label={`Edit ${c.name}`}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled
                              aria-label={`Delete ${c.name}`}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription className="text-pretty">
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>{" "}
              (<code className="text-xs">{deleteTarget?.slug}</code>). You cannot
              delete a category that still has products or subcategories — reassign or
              remove them first if the server refuses the delete.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting || !token}
              onClick={() => void handleConfirmDelete()}
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Deleting…
                </>
              ) : (
                "Delete category"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
