# Legacy of Mour Studio

Website: https://labmourstudio.github.io/MourStudio_LegacyofMour/

Đây là bản GitHub Pages độc lập. Nguồn xuất bản: nhánh `main`, thư mục `docs`.
Không triển khai repository này vào dự án ChatGPT Sites cũ.

## Chỉnh sửa và dữ liệu

`docs/index.html` chứa giao diện và luồng chỉnh sửa/nhập/xuất. `docs/assets/studio-refinements.css` định nghĩa khung kính, bố cục danh sách và hồ sơ. `docs/assets/studio-refinements.js` xử lý bộ lọc vai trò/vị trí và giọng nhân vật.

Thay đổi nội dung được lưu trong IndexedDB trên trình duyệt đang dùng. Giữ nguyên tên database `LegacyOfMourDB`, store `StudioData` và key `StudioSnapshot` để bảo toàn dữ liệu cũ. Dữ liệu người dùng không tự được đẩy lên GitHub hoặc đồng bộ giữa thiết bị.

Dùng Xuất File để sao lưu JSON gồm nhân vật, ảnh và giọng. Khi nhập JSON cũ không có giọng, hai ô giọng được khởi tạo rỗng. Không thay dữ liệu hiện hành bằng dữ liệu mẫu khi cập nhật giao diện.

Bản mã nguồn công khai được tiếp nhận tại commit `cc9aa6fcd9b289af0ba4c0878ccc2d7ac7bf36e3` không có backend đăng nhập hoặc D1/R2. Nút Chỉnh sửa chỉ thao tác bản dữ liệu trong trình duyệt. Không xem chế độ Xem/Sửa là bảo mật máy chủ. Các tài khoản, quyền Admin và lịch sử của Site cũ không được chuyển theo.

## Giao diện và âm thanh

- Viền liền, bo góc nhất quán, kính trong với highlight nhẹ; không lặp sao trang trí quanh khung.
- Tên/danh hiệu không có khung. Vai trò và câu nói cùng ẩn sau 3 giây ngừng thao tác ở chế độ xem; hiện lại khi tương tác. Chế độ sửa luôn hiển thị.
- Bộ lọc vai trò/vị trí xếp bên trái; thu gọn trên màn hình nhỏ.
- Concept/Kỹ năng ở góc phải dưới; bấm lại tab đang mở hoặc tên trên đường dẫn để về hồ sơ.
- Mỗi nhân vật có hai ô âm thanh, tối đa 2 MB/30 giây mỗi ô. MP3 ngắn được ưu tiên; M4A/OGG/WAV/WebM phụ thuộc trình duyệt.
- Mỗi lần mở nhân vật phát ngẫu nhiên một giọng đã thêm; chuyển nhân vật, rời trang, bật chế độ sửa hoặc tắt giọng sẽ dừng âm thanh. Không tự phát trong chế độ sửa. Có nghe thử, nghe lại và tắt giọng.
- Trình duyệt có thể yêu cầu bấm Nghe giọng trước khi cho phát âm thanh. Không tải tệp giọng mẫu từ dịch vụ ngoài.

## Tiếp tục phát triển

Lấy bản mới nhất từ repository này trước khi sửa. Kiểm tra thay đổi cục bộ và dữ liệu JSON cũ trước khi đẩy lên nhánh xuất bản. Không đưa mật khẩu, token, `.env`, dữ liệu tài khoản hoặc bản sao riêng tư lên GitHub.

Chạy `node --test tests/refinements.test.cjs` để kiểm tra dữ liệu giọng, phát một giọng mỗi lần, giới hạn tệp và việc đổi nhân vật/nhập dữ liệu trong lúc tệp đang được đọc.

Backend đăng nhập và đồng bộ dữ liệu, màn hình công khai riêng, WordPress và SEO là các phần phát triển tiếp theo, chưa được triển khai trong bản này.
