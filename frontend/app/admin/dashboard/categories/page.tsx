"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { AdminAuthBanner } from "@/components/admin/admin-auth-banner";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminErrorState } from "@/components/admin/admin-error-state";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { createCategory, updateCategoryBySlug } from "@/lib/api";

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
    parentId: "" as string | undefined,
  });

  const [edit, setEdit] = useState<AdminCategory | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    icon: "",
    parentId: "" as string | undefined,
  });
  const [editSaving, setEditSaving] = useState(false);

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

  const openEdit = (c: AdminCategory) => {
    setEdit(c);
    setEditForm({
      name: c.name,
      slug: c.slug,
      icon: c.icon ?? "",
      parentId: c.parent != null ? String(c.parent) : undefined,
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Add an admin token via /admin/login before mutating.");
      return;
    }
    setSaving(true);
    try {
      await createCategory(
        {
          name: newCat.name.trim(),
          slug: newCat.slug.trim(),
          icon: newCat.icon.trim() || null,
          parent: newCat.parentId ? Number(newCat.parentId) : null,
        },
        token,
      );
      toast.success("Category created");
      setNewCat({ name: "", slug: "", icon: "", parentId: undefined });
      await load();
    } catch {
      toast.error("Could not create category.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit || !token) return;
    setEditSaving(true);
    try {
      await updateCategoryBySlug(
        edit.slug,
        {
          name: editForm.name.trim(),
          slug: editForm.slug.trim(),
          icon: editForm.icon.trim() || null,
          parent: editForm.parentId ? Number(editForm.parentId) : null,
        },
        token,
      );
      toast.success("Category updated");
      setEdit(null);
      await load();
    } catch {
      toast.error("Could not update category.");
    } finally {
      setEditSaving(false);
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
        description="The API exposes name, slug, icon, and parent. Description and publish status are UI placeholders until the backend adds fields."
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
                    <TableCell className="tabular-nums">
                      {c.parent ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" title="No status field on API">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={!token}
                        onClick={() => openEdit(c)}
                        aria-label={`Edit ${c.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <SheetContent className="flex flex-col overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit category</SheetTitle>
            <SheetDescription>
              PATCH <code className="text-xs">/api/categories/:slug/</code>
            </SheetDescription>
          </SheetHeader>
          {edit ? (
            <form className="flex flex-1 flex-col gap-4 py-4" onSubmit={handleEditSave}>
              <div className="space-y-2">
                <Label htmlFor="ec-name">Name</Label>
                <Input
                  id="ec-name"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ec-slug">Slug</Label>
                <Input
                  id="ec-slug"
                  required
                  value={editForm.slug}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, slug: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ec-icon">Icon</Label>
                <Input
                  id="ec-icon"
                  value={editForm.icon}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, icon: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Parent</Label>
                <Select
                  value={editForm.parentId || "__none__"}
                  onValueChange={(v) =>
                    setEditForm((f) => ({
                      ...f,
                      parentId: v === "__none__" ? undefined : v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {categories
                      .filter((c) => c.id !== edit.id)
                      .map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <SheetFooter className="mt-auto flex-row gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setEdit(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editSaving || !token}>
                  {editSaving ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    "Save"
                  )}
                </Button>
              </SheetFooter>
            </form>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
