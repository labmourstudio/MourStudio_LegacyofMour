# Kiến trúc Admin và màn hình công khai

Tài liệu này ghi lại định hướng đã được chốt ở cấp sản phẩm. Đây không phải xác nhận rằng màn hình công khai đã được triển khai.

## 1. Nguyên tắc

Website hiện tại tiếp tục là bề mặt quản trị. Không xây lại hoặc thay thế website đang hoạt động chỉ để tạo màn hình công khai.

Màn hình công khai là một bề mặt riêng, đọc dữ liệu đã được Admin duyệt. Hai bề mặt có thể dùng chung backend và kho ảnh, nhưng phải có quyền hạn khác nhau.

## 2. Luồng nội dung dự kiến

```text
Admin tạo hoặc chỉnh sửa nội dung
            ↓
Lưu bản nháp và lịch sử nội bộ
            ↓
Admin đánh dấu nội dung được phép công khai
            ↓
Backend chỉ trả dữ liệu đã công khai
            ↓
Màn hình Public hiển thị cho người xem
```

## 3. Phân quyền

### Admin

- Đăng nhập bắt buộc.
- Có quyền tạo, sửa, duyệt và xuất bản nội dung.
- Có quyền xem bản nháp và lịch sử thao tác.
- Có quyền tải ảnh, thay ảnh và điều chỉnh trình bày.
- Không để thông tin đăng nhập trong mã nguồn phía trình duyệt.

### Public

- Không có quyền sửa dữ liệu.
- Không nhìn thấy bản nháp, tài khoản hoặc lịch sử nội bộ.
- Chỉ gọi endpoint đọc dữ liệu đã xuất bản.
- Không nhận khóa D1/R2 hoặc thông tin bí mật.
- Các thao tác tương tác trong tương lai phải qua endpoint được giới hạn riêng.

## 4. Phân loại dữ liệu đề xuất

Mỗi nhân vật hoặc nội dung nên có trạng thái rõ ràng:

- `draft`: bản nháp nội bộ.
- `review`: chờ Admin kiểm tra.
- `published`: được phép xuất hiện ở màn hình công khai.
- `archived`: lưu trữ, không hiển thị công khai.

Việc thêm trường trạng thái chỉ được triển khai sau khi đối chiếu schema D1 hiện hành và tạo migration an toàn. Không sửa trực tiếp cơ sở dữ liệu đang chạy khi chưa có bản sao lưu.

## 5. Hình ảnh

- Ảnh gốc và bản chất lượng cao tiếp tục được lưu trong R2.
- Metadata ảnh được lưu trong D1.
- Public chỉ nhận URL hoặc bản ảnh đã được backend cho phép.
- Không sao chép toàn bộ R2 vào repository công khai.
- Không đưa ảnh chưa công bố lên Public chỉ vì tệp đã tồn tại.

## 6. GitHub

Repository giữ:

- Mã nguồn.
- Migration không chứa dữ liệu thật.
- Tài liệu kiến trúc.
- Lịch sử commit.
- Hướng dẫn triển khai không chứa secret.

Repository không giữ:

- Mật khẩu hoặc mã cổng.
- Danh sách tài khoản.
- Dữ liệu D1 đang vận hành.
- R2 riêng tư.
- Token triển khai.
- Cookie và phiên đăng nhập.

## 7. Các giai đoạn phát triển

### Giai đoạn hiện tại

- Giữ nguyên website Admin đang hoạt động.
- Xác minh và nhập đúng mã nguồn vào GitHub.
- Không thêm dữ liệu mẫu.
- Không triển khai màn hình công khai.

### Giai đoạn tiếp theo

- Đối chiếu schema và API hiện hành.
- Bổ sung trạng thái công khai cho nội dung nếu chưa có.
- Xây endpoint chỉ-đọc dành cho Public.
- Xây màn hình danh sách tướng và hồ sơ tướng công khai.
- Kiểm tra quyền, hiệu năng ảnh và hành vi trên thiết bị di động.

### Giai đoạn SEO và nội dung

- Chọn nền tảng Public phù hợp trước khi triển khai WordPress.
- Nếu dùng WordPress, tách theme khỏi plugin dữ liệu.
- Không chuyển dữ liệu Admin sang WordPress một cách tự động.
- Xác định URL chuẩn, metadata, sitemap và nội dung Mouravia sau khi cấu trúc công khai được duyệt.

## 8. Điều kiện trước khi triển khai mã nguồn

- Có ZIP nguồn đúng phiên bản đã xác minh.
- Không có secret trong lịch sử Git.
- Có cấu hình mẫu thay cho cấu hình thật.
- Có bản xem trước hoạt động.
- Có phương án migration không phá dữ liệu.
- Xác nhận đúng dự án hosting trước khi xuất bản.
