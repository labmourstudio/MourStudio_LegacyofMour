# Legacy of Mour Studio

Kho mã chính thức của website **Legacy of Mour Studio** thuộc Mour Studio.

## Trạng thái hiện tại

- Website hiện tại đang hoạt động và được giữ nguyên làm **màn hình quản trị (Admin)**.
- Màn hình công khai dành cho người xem sẽ được phát triển thành một giao diện riêng trong giai đoạn sau.
- Màn hình công khai chỉ được đọc dữ liệu đã được duyệt công khai; không được truy cập trực tiếp tài khoản, lịch sử nội bộ hoặc chức năng Admin.
- Mã nguồn đầy đủ của phiên bản đang chạy **chưa được nhập vào kho này**. Chỉ nhập sau khi tệp nguồn được xác minh đúng phiên bản và đã kiểm tra thông tin nhạy cảm.

Website hiện tại: https://legacy-of-mour-studio.theleon-studio.chatgpt.site

## Định hướng kiến trúc

Hệ thống được chia thành hai bề mặt nhưng dùng chung dữ liệu đã kiểm soát:

1. **Admin**
   - Đăng nhập và duyệt tài khoản.
   - Quản lý tướng, nội dung, kỹ năng, concept và splash art.
   - Quản lý font, định dạng chữ, vị trí hiển thị và lịch sử chỉnh sửa.
   - Tải và quản lý ảnh chất lượng cao.
2. **Public**
   - Hiển thị danh sách tướng và hồ sơ đã được duyệt.
   - Không hiển thị bản nháp, dữ liệu người dùng hoặc lịch sử nội bộ.
   - Không sử dụng thông tin đăng nhập Admin.
   - Có thể bổ sung nội dung Mouravia và SEO trong các phiên bản sau.

## Dữ liệu

- D1 giữ dữ liệu có cấu trúc, trạng thái và lịch sử.
- R2 giữ ảnh và tệp xuất.
- Màn hình công khai không kết nối trực tiếp bằng khóa quản trị; dữ liệu công khai phải đi qua API chỉ-đọc do backend kiểm soát.
- Không dùng GitHub làm nơi lưu dữ liệu đang vận hành.

## Quy tắc an toàn

Không đưa các nội dung sau lên repository:

- Mật khẩu, mã cổng hoặc thông tin đăng nhập.
- API key, token, cookie, OAuth secret hoặc khóa truy cập.
- Tệp `.env` thật.
- Bản sao D1/R2 chứa dữ liệu riêng tư.
- Danh sách tài khoản, email đăng ký hoặc lịch sử Admin.
- ZIP nguồn chưa được xác minh.

Chỉ đưa migration cơ sở dữ liệu lên GitHub; không đưa dữ liệu thật của cơ sở dữ liệu.

## Quy trình cập nhật

1. Xác minh đúng nguồn và phiên bản.
2. Kiểm tra thay đổi trên bản xem trước.
3. Không ghi đè dữ liệu đang chạy bằng dữ liệu mẫu.
4. Giữ lịch sử thay đổi bằng commit rõ ràng.
5. Chỉ triển khai lên website sau khi đã kiểm tra đúng dự án và đúng môi trường.

## Trạng thái chức năng

- Admin hiện tại: **Đang hoạt động**.
- Kho mã GitHub: **Đã khởi tạo**.
- Nhập mã nguồn phiên bản hiện hành: **Chờ tệp nguồn đã xác minh**.
- Màn hình công khai: **Chưa triển khai**.
- WordPress/SEO: **Định hướng tương lai, chưa chốt nền tảng triển khai**.
