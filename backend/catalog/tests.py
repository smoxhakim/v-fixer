import csv
import io
import tempfile
import zipfile
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from openpyxl import Workbook
from openpyxl.drawing.image import Image as XLImage
from PIL import Image
from rest_framework.test import APIClient

from .models import Category, HotDealItem, Product, StaffProfile


class ImportApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        user_model = get_user_model()
        self.admin = user_model.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="pass1234",
        )
        self.client.force_authenticate(user=self.admin)

    def _csv_file(self, rows):
        buf = io.StringIO()
        writer = csv.DictWriter(buf, fieldnames=["name", "slug", "icon", "parent_slug"])
        writer.writeheader()
        for row in rows:
            writer.writerow(row)
        raw = buf.getvalue().encode("utf-8")
        return SimpleUploadedFile("categories.csv", raw, content_type="text/csv")

    def _xlsx_file(self, rows, image_rows=None):
        wb = Workbook()
        ws = wb.active
        ws.append(["IMAGE", "REF", "PRICE", "PRICE ACHA", "QT", "CATEGORY"])
        for row in rows:
            ws.append(row)

        if image_rows:
            for target_row in image_rows:
                img = Image.new("RGB", (20, 20), color=(10, 120, 220))
                temp = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
                img.save(temp.name)
                xl_img = XLImage(temp.name)
                xl_img.anchor = f"A{target_row}"
                ws.add_image(xl_img)

        out = io.BytesIO()
        wb.save(out)
        return SimpleUploadedFile(
            "products.xlsx",
            out.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )

    def _zip_file(self):
        csv_buf = io.StringIO()
        writer = csv.DictWriter(
            csv_buf,
            fieldnames=["REF", "PRICE", "PRICE ACHA", "QT", "CATEGORY", "image_paths"],
        )
        writer.writeheader()
        writer.writerow(
            {
                "REF": "Zip Item",
                "PRICE": "99.99",
                "PRICE ACHA": "50",
                "QT": "3",
                "CATEGORY": "tools",
                "image_paths": "images/pic.png",
            }
        )
        img = Image.new("RGB", (30, 30), color=(200, 80, 80))
        temp = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
        img.save(temp.name)
        zip_buf = io.BytesIO()
        with zipfile.ZipFile(zip_buf, "w") as zf:
            zf.writestr("products.csv", csv_buf.getvalue().encode("utf-8"))
            zf.write(temp.name, "images/pic.png")
        return SimpleUploadedFile("products.zip", zip_buf.getvalue(), content_type="application/zip")

    def test_categories_import_upsert_and_duplicate_slug_in_file(self):
        payload = self._csv_file(
            [
                {"name": "Phones", "slug": "phones", "icon": "phone", "parent_slug": ""},
                {"name": "Phones Dupe", "slug": "phones", "icon": "", "parent_slug": ""},
            ]
        )
        res = self.client.post("/api/categories/import/", {"file": payload}, format="multipart")
        self.assertIn(res.status_code, {200, 207})
        self.assertEqual(Category.objects.filter(slug="phones").count(), 1)
        self.assertGreaterEqual(len(res.data.get("errors", [])), 1)

    def test_products_import_partial_failure_and_price_rules(self):
        Category.objects.create(name="Men Shoes", slug="men-shoes")
        payload = self._xlsx_file(
            [
                ["", "YCS A", "1 200,50", "900,10", "OUT STOCK", "Men Shoes"],
                ["", "YCS B", "3300 OR 3200", "", "5", "men-shoes"],
                ["", "YCS C", "invalid", "", "5", "men-shoes"],
            ]
        )
        res = self.client.post("/api/products/import/", {"file": payload}, format="multipart")
        self.assertIn(res.status_code, {200, 207})
        self.assertEqual(Product.objects.count(), 2)
        first = Product.objects.get(name="YCS A")
        second = Product.objects.get(name="YCS B")
        self.assertEqual(first.price, Decimal("1200.50"))
        self.assertEqual(first.cost_price, Decimal("900.10"))
        self.assertEqual(first.stock, 0)
        self.assertEqual(second.price, Decimal("3300"))
        self.assertGreaterEqual(len(res.data.get("errors", [])), 1)

    def test_products_import_empty_category_allowed(self):
        rows = [
            ["", "No Cat Product", "25.00", "", "1", ""],
        ]
        prev = self.client.post(
            "/api/products/import-preview/", {"file": self._xlsx_file(rows)}, format="multipart"
        )
        self.assertIn(prev.status_code, {200, 207})
        self.assertEqual(len(prev.data.get("errors", [])), 0)

        res = self.client.post("/api/products/import/", {"file": self._xlsx_file(rows)}, format="multipart")
        self.assertIn(res.status_code, {200, 207})
        product = Product.objects.get(name="No Cat Product")
        self.assertIsNone(product.category_id)

    def test_products_import_blank_price_defaults_to_zero(self):
        Category.objects.create(name="Tools", slug="tools")
        rows = [
            ["", "Zero Price Item", "", "", "1", "tools"],
        ]
        prev = self.client.post(
            "/api/products/import-preview/", {"file": self._xlsx_file(rows)}, format="multipart"
        )
        self.assertIn(prev.status_code, {200, 207})
        self.assertEqual(len(prev.data.get("errors", [])), 0)
        self.assertEqual(prev.data["rows"][0]["price"], "0")

        res = self.client.post("/api/products/import/", {"file": self._xlsx_file(rows)}, format="multipart")
        self.assertIn(res.status_code, {200, 207})
        product = Product.objects.get(name="Zero Price Item")
        self.assertEqual(product.price, Decimal("0"))

    def test_products_duplicate_ref_creates_two_rows_with_unique_slugs(self):
        Category.objects.create(name="Tools", slug="tools")
        payload = self._xlsx_file(
            [
                ["", "Same Ref", "100", "", "1", "tools"],
                ["", "Same Ref", "110", "", "2", "tools"],
            ]
        )
        res = self.client.post("/api/products/import/", {"file": payload}, format="multipart")
        self.assertIn(res.status_code, {200, 207})
        self.assertEqual(Product.objects.filter(name="Same Ref").count(), 2)
        slugs = list(Product.objects.filter(name="Same Ref").values_list("slug", flat=True))
        self.assertEqual(len(set(slugs)), 2)

    @override_settings(MEDIA_ROOT=tempfile.gettempdir())
    def test_products_zip_import(self):
        Category.objects.create(name="Tools", slug="tools")
        payload = self._zip_file()
        res = self.client.post("/api/products/import/", {"archive": payload}, format="multipart")
        self.assertIn(res.status_code, {200, 207})
        product = Product.objects.get(name="Zip Item")
        self.assertEqual(product.price, Decimal("99.99"))
        self.assertEqual(product.stock, 3)
        self.assertEqual(len(product.images), 1)
        self.assertTrue(
            str(product.images[0]).startswith("/media/"),
            "Stored paths should be relative to MEDIA_URL for portability.",
        )
        detail = self.client.get(f"/api/products/{product.slug}/")
        self.assertEqual(detail.status_code, 200)
        self.assertTrue(
            str(detail.data["images"][0]).startswith("http://"),
            "API must return absolute image URLs so browsers load media from the API host, not the storefront origin.",
        )

    @override_settings(MEDIA_ROOT=tempfile.gettempdir())
    def test_products_image_anchor_exact_row_only(self):
        Category.objects.create(name="Microscope", slug="microscope")
        payload = self._xlsx_file(
            [
                ["", "Row2 Product", "100", "", "1", "microscope"],
                ["", "Row3 Product", "100", "", "1", "microscope"],
            ],
            image_rows=[2, 4],
        )
        res = self.client.post("/api/products/import/", {"file": payload}, format="multipart")
        self.assertIn(res.status_code, {200, 207})
        row2 = Product.objects.get(name="Row2 Product")
        row3 = Product.objects.get(name="Row3 Product")
        self.assertGreaterEqual(len(row2.images), 1)
        self.assertEqual(row3.images, [])


class HomeHeroApiTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.admin = user_model.objects.create_superuser(
            username="hero_admin",
            email="hero_admin@example.com",
            password="pass1234",
        )

    def test_home_hero_get_ok(self):
        client = APIClient()
        res = client.get("/api/home-hero/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("main_slides", res.data)
        self.assertIn("side_promos", res.data)
        self.assertGreaterEqual(len(res.data["main_slides"]), 1)
        self.assertGreaterEqual(len(res.data["side_promos"]), 1)

    def test_home_hero_put_requires_admin(self):
        client = APIClient()
        res = client.put(
            "/api/home-hero/",
            {"mainSlides": [], "sidePromos": []},
            format="json",
        )
        self.assertEqual(res.status_code, 401)

    def test_home_hero_put_admin_camel_case(self):
        client = APIClient()
        client.force_authenticate(user=self.admin)
        body = {
            "mainSlides": [
                {
                    "tag": "T",
                    "title": "MainTitle",
                    "description": "Sub",
                    "imageUrl": "https://example.com/a.jpg",
                    "linkHref": "/products",
                    "gradientClass": "from-slate-900 to-slate-700",
                }
            ],
            "sidePromos": [
                {
                    "tag": "S",
                    "title": "SideTitle",
                    "description": "",
                    "imageUrl": "",
                    "linkHref": "/category/audio",
                    "gradientClass": "from-pink-500 to-purple-600",
                }
            ],
        }
        res = client.put("/api/home-hero/", body, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data["main_slides"]), 1)
        self.assertEqual(res.data["main_slides"][0]["title"], "MainTitle")
        self.assertEqual(len(res.data["side_promos"]), 1)
        self.assertEqual(res.data["side_promos"][0]["title"], "SideTitle")


class HomeBestSellingApiTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.admin = user_model.objects.create_superuser(
            username="best_admin",
            email="best_admin@example.com",
            password="pass1234",
        )
        self.cat = Category.objects.create(name="Audio", slug="audio")
        self.product = Product.objects.create(
            name="Demo Buds",
            slug="demo-buds",
            category=self.cat,
            price="99.00",
            stock=10,
            images=[],
        )

    def test_home_best_selling_get_ok(self):
        client = APIClient()
        res = client.get("/api/home-best-selling/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("items", res.data)
        self.assertEqual(res.data["items"], [])

    def test_home_best_selling_put_requires_admin(self):
        client = APIClient()
        res = client.put(
            "/api/home-best-selling/",
            {"items": []},
            format="json",
        )
        self.assertEqual(res.status_code, 401)

    def test_home_best_selling_put_admin_mixed_items(self):
        client = APIClient()
        client.force_authenticate(user=self.admin)
        body = {
            "items": [
                {"kind": "product", "product_slug": "demo-buds", "category_slug": ""},
                {"kind": "category", "product_slug": "", "category_slug": "audio"},
            ],
        }
        res = client.put("/api/home-best-selling/", body, format="json")
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(len(res.data["items"]), 2)
        self.assertEqual(res.data["items"][0]["kind"], "product")
        self.assertEqual(res.data["items"][0]["product"]["slug"], "demo-buds")
        self.assertEqual(res.data["items"][1]["kind"], "category")
        self.assertEqual(res.data["items"][1]["category"]["slug"], "audio")
        self.assertIn("products", res.data["items"][1])
        self.assertEqual(len(res.data["items"][1]["products"]), 1)
        self.assertEqual(res.data["items"][1]["products"][0]["slug"], "demo-buds")
        self.assertEqual(res.data["items"][1]["product_count"], 1)


class HotDealsApiTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.admin = user_model.objects.create_superuser(
            username="hot_admin",
            email="hot_admin@example.com",
            password="pass1234",
        )
        self.cat = Category.objects.create(name="Phones", slug="phones")
        self.p1 = Product.objects.create(
            name="Phone A",
            slug="phone-a",
            category=self.cat,
            price="10.00",
            stock=2,
            images=[],
        )
        self.p2 = Product.objects.create(
            name="Phone B",
            slug="phone-b",
            category=self.cat,
            price="20.00",
            stock=3,
            images=[],
        )

    def test_hot_deals_get_ok(self):
        client = APIClient()
        res = client.get("/api/hot-deals/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("items", res.data)
        self.assertEqual(res.data["items"], [])

    def test_hot_deals_put_requires_auth(self):
        client = APIClient()
        res = client.put("/api/hot-deals/", {"product_slugs": []}, format="json")
        self.assertEqual(res.status_code, 401)

    def test_hot_deals_put_ordered(self):
        client = APIClient()
        client.force_authenticate(user=self.admin)
        body = {"product_slugs": ["phone-b", "phone-a"]}
        res = client.put("/api/hot-deals/", body, format="json")
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(len(res.data["items"]), 2)
        self.assertEqual(res.data["items"][0]["slug"], "phone-b")
        self.assertEqual(res.data["items"][1]["slug"], "phone-a")
        self.assertEqual(HotDealItem.objects.count(), 2)

    def test_hot_deals_put_clear(self):
        client = APIClient()
        client.force_authenticate(user=self.admin)
        client.put(
            "/api/hot-deals/",
            {"product_slugs": ["phone-a"]},
            format="json",
        )
        res = client.put("/api/hot-deals/", {"product_slugs": []}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["items"], [])


class CategoryDeleteApiTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.admin = user_model.objects.create_superuser(
            username="cat_del_admin",
            email="cat_del@example.com",
            password="pass1234",
        )
        self.cat = Category.objects.create(name="Leaf", slug="leaf-cat")
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin)

    def test_delete_category_ok(self):
        res = self.client.delete("/api/categories/leaf-cat/")
        self.assertEqual(res.status_code, 204)
        self.assertFalse(Category.objects.filter(slug="leaf-cat").exists())

    def test_delete_category_blocked_when_products(self):
        Product.objects.create(
            name="P",
            slug="p-in-leaf",
            category=self.cat,
            price="1.00",
            stock=1,
            images=[],
        )
        res = self.client.delete("/api/categories/leaf-cat/")
        self.assertEqual(res.status_code, 400)
        self.assertIn("product", str(res.data.get("detail", "")).lower())

    def test_delete_category_blocked_when_children(self):
        Category.objects.create(name="Child", slug="child-cat", parent=self.cat)
        res = self.client.delete("/api/categories/leaf-cat/")
        self.assertEqual(res.status_code, 400)
        self.assertIn("subcategor", str(res.data.get("detail", "")).lower())


class ProductSearchApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cat = Category.objects.create(name="Electronics", slug="electronics")
        Product.objects.create(
            name="Unique Widget Pro",
            slug="unique-widget-pro",
            category=self.cat,
            price="10.00",
            stock=1,
            short_description="A handy widget",
            images=[],
        )
        Product.objects.create(
            name="Other Item",
            slug="other-item",
            category=self.cat,
            price="20.00",
            stock=2,
            short_description="",
            images=[],
        )

    def test_products_search_by_name(self):
        res = self.client.get("/api/products/", {"search": "Widget"})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["slug"], "unique-widget-pro")

    def test_products_search_by_short_description(self):
        res = self.client.get("/api/products/", {"search": "handy"})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)

    def test_products_search_empty_returns_all(self):
        res = self.client.get("/api/products/", {"search": "  "})
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data), 2)


class AdminAuthApiTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.staff = user_model.objects.create_user(
            username="staff_auth",
            email="staff@example.com",
            password="oldpass12",
            is_staff=True,
        )
        self.non_staff = user_model.objects.create_user(
            username="regular_auth",
            email="reg@example.com",
            password="userpass12",
            is_staff=False,
        )

    def test_token_rejected_for_non_staff(self):
        client = APIClient()
        res = client.post(
            "/api/auth/token/",
            {"username": "regular_auth", "password": "userpass12"},
            format="json",
        )
        self.assertIn(res.status_code, (400, 401))

    def test_token_ok_for_staff(self):
        client = APIClient()
        res = client.post(
            "/api/auth/token/",
            {"username": "staff_auth", "password": "oldpass12"},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn("access", res.data)
        self.assertIn("user", res.data)
        self.assertEqual(res.data["user"]["username"], "staff_auth")
        self.assertIn("role", res.data["user"])
        self.assertIn("capabilities", res.data["user"])
        self.assertIn("catalog.write", res.data["user"]["capabilities"])
        self.assertNotIn("users.read", res.data["user"]["capabilities"])

    def test_change_password_requires_auth(self):
        client = APIClient()
        res = client.post(
            "/api/auth/change-password/",
            {"currentPassword": "oldpass12", "newPassword": "newpass12x"},
            format="json",
        )
        self.assertEqual(res.status_code, 401)

    def test_change_password_staff_success(self):
        client = APIClient()
        client.force_authenticate(user=self.staff)
        res = client.post(
            "/api/auth/change-password/",
            {"currentPassword": "oldpass12", "newPassword": "newpass12x"},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.staff.refresh_from_db()
        self.assertTrue(self.staff.check_password("newpass12x"))

    def test_change_password_wrong_current(self):
        client = APIClient()
        client.force_authenticate(user=self.staff)
        res = client.post(
            "/api/auth/change-password/",
            {"currentPassword": "wrong", "newPassword": "newpass12x"},
            format="json",
        )
        self.assertEqual(res.status_code, 400)

    def test_me_requires_auth(self):
        client = APIClient()
        res = client.get("/api/auth/me/", format="json")
        self.assertEqual(res.status_code, 401)

    def test_me_non_staff_forbidden(self):
        client = APIClient()
        client.force_authenticate(user=self.non_staff)
        res = client.get("/api/auth/me/", format="json")
        self.assertEqual(res.status_code, 403)

    def test_me_staff_get(self):
        client = APIClient()
        client.force_authenticate(user=self.staff)
        res = client.get("/api/auth/me/", format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["username"], "staff_auth")
        self.assertEqual(res.data["email"], "staff@example.com")

    def test_me_staff_patch_name(self):
        client = APIClient()
        client.force_authenticate(user=self.staff)
        res = client.patch(
            "/api/auth/me/",
            {"firstName": "Pat", "lastName": "Admin"},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        fn = res.data.get("firstName") or res.data.get("first_name")
        ln = res.data.get("lastName") or res.data.get("last_name")
        self.assertEqual(fn, "Pat")
        self.assertEqual(ln, "Admin")
        self.staff.refresh_from_db()
        self.assertEqual(self.staff.first_name, "Pat")
        self.assertEqual(self.staff.last_name, "Admin")


class StaffUserApiTests(TestCase):
    """RBAC: only super_admin may list/create/patch staff users via API."""

    def setUp(self):
        UM = get_user_model()
        self.super = UM.objects.create_user(
            username="super_u",
            email="super@example.com",
            password="superpass12",
            is_staff=True,
        )
        StaffProfile.objects.create(user=self.super, role=StaffProfile.ROLE_SUPER_ADMIN)
        self.admin = UM.objects.create_user(
            username="admin_u",
            email="admin@example.com",
            password="adminpass12",
            is_staff=True,
        )
        StaffProfile.objects.create(user=self.admin, role=StaffProfile.ROLE_ADMIN)

    def test_list_staff_users_super_ok(self):
        client = APIClient()
        client.force_authenticate(user=self.super)
        res = client.get("/api/auth/staff-users/")
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data.get("results", res.data)), 1)

    def test_list_staff_users_admin_forbidden(self):
        client = APIClient()
        client.force_authenticate(user=self.admin)
        res = client.get("/api/auth/staff-users/")
        self.assertEqual(res.status_code, 403)

    def test_create_staff_user_super_ok(self):
        client = APIClient()
        client.force_authenticate(user=self.super)
        res = client.post(
            "/api/auth/staff-users/",
            {
                "username": "new_mgr",
                "email": "nm@example.com",
                "password": "longpass12",
                "role": StaffProfile.ROLE_MANAGER,
                "isStaff": True,
            },
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        u = get_user_model().objects.get(username="new_mgr")
        self.assertTrue(u.is_staff)
        self.assertEqual(u.staff_profile.role, StaffProfile.ROLE_MANAGER)

    def test_cannot_assign_super_admin_via_create(self):
        client = APIClient()
        client.force_authenticate(user=self.super)
        res = client.post(
            "/api/auth/staff-users/",
            {
                "username": "bogus_super",
                "password": "longpass12",
                "role": StaffProfile.ROLE_SUPER_ADMIN,
                "isStaff": True,
            },
            format="json",
        )
        self.assertEqual(res.status_code, 400)

    def test_patch_role_denies_super_admin_assignment(self):
        client = APIClient()
        client.force_authenticate(user=self.super)
        res = client.patch(
            f"/api/auth/staff-users/{self.admin.pk}/",
            {"role": StaffProfile.ROLE_SUPER_ADMIN},
            format="json",
        )
        self.assertEqual(res.status_code, 400)

    def test_cannot_demote_last_super_admin(self):
        client = APIClient()
        client.force_authenticate(user=self.super)
        res = client.patch(
            f"/api/auth/staff-users/{self.super.pk}/",
            {"role": StaffProfile.ROLE_ADMIN},
            format="json",
        )
        self.assertEqual(res.status_code, 400)
