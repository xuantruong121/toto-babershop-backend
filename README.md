# Toto Barbershop - Backend API

Đây là mã nguồn Backend API cho hệ thống đặt lịch và thương mại điện tử **Toto Barbershop**. Dự án cung cấp các RESTful APIs phục vụ cho Frontend (React/Vite) giao tiếp với cơ sở dữ liệu.

## 🚀 Công nghệ sử dụng (Tech Stack)

- **Ngôn ngữ**: TypeScript / Node.js
- **Web Framework**: Express.js
- **ORM**: Prisma (Version 5)
- **Cơ sở dữ liệu**: PostgreSQL
- **DevOps**: Docker, Docker Compose, GitHub Actions (CI)

## 📦 Kiến trúc hệ thống

Dự án này nằm trong một kiến trúc microservices nhỏ gọn, bao gồm:
1. **Frontend (Nginx + React)**
2. **Backend (Node.js + Express)** - Repository này
3. **Database (PostgreSQL)**

## 🛠️ Hướng dẫn cài đặt

### Cách 1: Chạy bằng Docker (Khuyên dùng)
Đây là cách nhanh nhất và chuẩn mực nhất, không cần cài đặt Node.js hay DB ở máy cục bộ. Yêu cầu máy bạn phải cài sẵn [Docker Desktop](https://www.docker.com/products/docker-desktop/).

Bạn cần chạy lệnh này ở thư mục gốc chứa cả frontend và backend (nơi chứa file `docker-compose.yml`):
```bash
docker-compose up -d --build
```
Lệnh trên sẽ tự động bật PostgreSQL, tạo bảng, bơm dữ liệu (seed) và khởi động API server tại port `5000`.

### Cách 2: Chạy trực tiếp (Local Development)
Yêu cầu: Node.js (>= 20) và một máy chủ PostgreSQL đang chạy.

1. **Cài đặt thư viện**
```bash
npm install
```

2. **Cấu hình môi trường**
- Tạo file `.env` từ nội dung sau (điều chỉnh cho khớp cấu hình PostgreSQL cục bộ của bạn):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/totodb?schema=public"
PORT=5000
```

3. **Tạo Database và bơm dữ liệu**
```bash
npx prisma db push
npx prisma db seed
```

4. **Khởi động Server (Hot-reload)**
```bash
npm run dev
```
Máy chủ sẽ chạy tại địa chỉ: `http://localhost:5000`

## 🔗 Danh sách API (Endpoints)

Dưới đây là một số API chính đang được hỗ trợ:

- `GET /` : Kiểm tra trạng thái máy chủ (Healthcheck)
- `GET /api/products` : Lấy danh sách toàn bộ sản phẩm (Grooming, Fashion...)
- `POST /api/products` : Tạo một sản phẩm mới (Dành cho Admin)
- `GET /api/orders` : Lấy danh sách toàn bộ đơn hàng
- `GET /api/stats` : Lấy thống kê tổng quan (Doanh thu, lượng đơn, lượng khách)
- `POST /api/auth/login` : Endpoint đăng nhập (Dummy)

## 🤖 CI/CD (Continuous Integration)

Dự án có tích hợp sẵn GitHub Actions. Khi tạo Pull Request hoặc Push code lên các nhánh `main` và `develop`, luồng CI sẽ tự động kích hoạt để kiểm tra:
1. Tải source code.
2. Cài đặt các Package (NPM install).
3. Sinh thư viện Prisma Client.
4. Đảm bảo code không có lỗi biên dịch nghiêm trọng.