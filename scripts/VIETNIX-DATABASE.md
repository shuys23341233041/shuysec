# Kết nối MySQL Vietnix (zwearsit_oneclick)

## Thông tin của bạn

|     | Giá trị              |
|-----|----------------------|
| Host | `host120.vietnix.vn` (hoặc xem trong cPanel → Remote MySQL / MySQL host) |
| User | `zwearsit_oneclick`  |
| Database | `zwearsit_oneclick` |
| Password | (có ký tự đặc biệt, cần encode bên dưới) |
| Port | `3306` |

---

## Bước 1: Import SQL trong phpMyAdmin

1. Đăng nhập phpMyAdmin → chọn database **zwearsit_oneclick** (đã chọn đúng như ảnh).
2. Tab **Import** → **Choose File** → chọn file `init-database.sql` (trong project: `Template/OC/scripts/init-database.sql`).
3. Bấm **Go** / **Execute** ở cuối trang.
4. Xong: trong tab **Structure** sẽ thấy 5 bảng: `devices`, `accounts`, `backups`, `pending_restores`, `device_key_map`.

---

## Bước 2: DATABASE_URL cho Vercel

Password có ký tự đặc biệt `( ~ ! ? {` nên **bắt buộc phải encode** khi cho vào URL.

- Password gốc: `(~!O24NoM?do{7fT`
- Password đã encode (URL): `%28%7E%21O24NoM%3Fdo%7B7fT`

**Công thức:**

```
mysql://USER:PASSWORD_ENCODED@HOST:3306/DATABASE
```

**Với thông tin của bạn:**

```
mysql://zwearsit_oneclick:%28%7E%21O24NoM%3Fdo%7B7fT@host120.vietnix.vn:3306/zwearsit_oneclick
```

**Cách làm trên Vercel:**

1. Vào project trên Vercel → **Settings** → **Environment Variables**.
2. **Key:** `DATABASE_URL`  
   **Value:** dán nguyên dòng trên (1 dòng, không xuống dòng).
3. Chọn môi trường: **Production** (và Preview nếu muốn).
4. **Save** → **Redeploy** project.

---

## Kiểm tra đã kết nối chưa (sau khi Redeploy)

Mở trên trình duyệt (đổi `your-app` thành tên domain Vercel của bạn):

**https://your-app.vercel.app/api/db-status**

- Trả về `"database": "connected"` → đã kết nối MySQL thành công.
- Trả về `"database": "not_configured"` → chưa có DATABASE_URL hoặc chưa redeploy.
- Trả về `"database": "error"` → lỗi kết nối (sai host, password, hoặc chưa Add Access Host trong Remote Database Access).

---

## Bước 3: Remote Database Access (đã làm thì bỏ qua)

Để Vercel kết nối được MySQL trên Vietnix, trong cPanel → **Remote Database Access** cần thêm Access Host:

- Host: `%` (cho phép mọi IP, dùng tạm/test) hoặc IP của Vercel nếu có.
- Comment: `Vercel` → **Add Host**.

Nếu chưa thêm, Vercel sẽ không kết nối được DB.

---

## Nếu vẫn lỗi kết nối

1. **Đúng host chưa:** Trong cPanel → **MySQL Databases** hoặc **Remote MySQL** xem ghi “MySQL host” là gì (có khi là `localhost` khi dùng nội bộ, còn kết nối từ ngoài có thể là `host120.vietnix.vn` hoặc tên khác). Thay đúng host vào đoạn URL trên.
2. **Password:** Nếu đổi password, encode lại (ví dụ: `(` → `%28`, `?` → `%3F`, `{` → `%7B`, `!` → `%21`, `~` → `%7E`) rồi thay vào chỗ `PASSWORD_ENCODED`.
3. **Firewall/port:** Đảm bảo port 3306 được phép kết nối từ ngoài (tùy Vietnix).

---

## Encode password khi đổi mật khẩu

Có thể dùng JavaScript (trong Console trình duyệt):

```js
encodeURIComponent('MẬT_KHẨU_MỚI')
```

Kết quả thay vào vị trí `PASSWORD_ENCODED` trong `mysql://zwearsit_oneclick:PASSWORD_ENCODED@host120.vietnix.vn:3306/zwearsit_oneclick`.
