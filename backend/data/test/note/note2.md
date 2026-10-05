# Ôn tập nhanh

## 1. Bảng Tổng hợp các Design Pattern (19 mẫu Cấu trúc, Hành vi & Độc bản)

| STT | Nhóm | Tên Pattern | Khi nào dùng | Từ khóa thi | Cặp bài trùng / Mẹo nhớ | Ví dụ thực tế |
| :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | Cấu trúc | **Composite** (Phức hợp) | Khi đề bài có mô hình dạng **Cây (Tree)**, phân cấp **Phần - Toàn thể**. | *"Đối xử với một NHÓM đối tượng giống hệt như một đối tượng ĐƠN LẺ"*. | *Nhóm - Đơn*<br>Tác dụng thi nối: **Xóa nhòa ranh giới** | Thư viện đồ họa (Nhóm hình chứa các hình đơn), Quản lý thư mục (Thư mục cha chứa các tệp tin và thư mục con). |
| 2 | Cấu trúc | **Adapter** (Lớp chuyển đổi) | Khi muốn kết nối 2 hệ thống/thư viện có sẵn nhưng giao diện (Interface) của chúng **không khớp nhau**. | *"Bộ chuyển đổi"*, *"Thư viện bên thứ ba"*, *"Khắc phục sự bất đồng/không tương thích"*. | *Cũ - Mới (Không hợp nhau)*<br>Tác dụng thi nối: **Khắc phục bất đồng** | Thư viện cũ trả về dữ liệu dạng XML, nhưng hệ thống mới chỉ nhận JSON $\rightarrow$ Cần một `Adapter` ở giữa để dịch dữ liệu. |
| 3 | Cấu trúc | **Facade** (Mặt tiền) | Khi hệ thống bên trong quá **đồ sộ, phức tạp**, cần tạo ra một cái "bề mặt" đơn giản cho người dùng dễ xài. | *"Hệ thống phức tạp/phức tạp cao"*, *"Cung cấp một giao diện đơn giản duy nhất"*, *"Che giấu sự phức tạp bên trong"*. | *Hỗn độn $\rightarrow$ Đơn giản*<br>Tác dụng thi nối: **Che giấu nội dung** | Thao tác "Mua hàng" trên Tiki/Shopee: chỉ bấm đúng 1 nút, Facade tự gọi phân hệ Kho, Thanh toán, Giao hàng, gửi Email... |
| 4 | Cấu trúc | **Bridge** (Cầu nối) | Tách rời trừu tượng (Abstraction) và thực thi (Implementation) để phát triển độc lập. | *"Tách rời trừu tượng và thực thi"*, *"Hạn chế sự bùng nổ lớp"* | *Giao diện - Thực thi tách rời*<br>Tác dụng thi nối: **Phân tách đa chiều** | Remote điều khiển: Lớp `RemoteControl` liên kết với Interface `Device` (có các lớp con `TV`, `Radio`). |
| 5 | Cấu trúc | **Decorator** (Người trang trí) | Bổ sung tính năng/trách nhiệm cho đối tượng một cách động ở runtime mà không cần thừa kế. | *"Đính kèm trách nhiệm cho đối tượng một cách động"*, *"Runtime không thừa kế"* | *Trang trí thêm tính năng*<br>Tác dụng thi nối: **Gắn thêm tính năng** | Trình soạn thảo văn bản: Thêm thanh cuộn, khung viền, hoặc đổ bóng cho cửa sổ hiển thị một cách linh hoạt tại runtime. |
| 6 | Cấu trúc | **Flyweight** (Hạng ruồi) | Khi cần tạo số lượng cực lớn đối tượng tương tự, ta chia sẻ trạng thái chung để tối ưu bộ nhớ. | *"Chia sẻ trạng thái để tiết kiệm bộ nhớ"*, *"Hệ thống số lượng lớn đối tượng tương tự"* | *Chia sẻ dữ liệu nội tại*<br>Tác dụng thi nối: **Tái sử dụng nội tại** | Game bắn súng: Hàng triệu viên đạn dùng chung một thuộc tính hình ảnh (nội tại), chỉ khác tọa độ bay (ngoại tại). |
| 7 | Cấu trúc | **Proxy** (Lớp đại diện) | Cung cấp đối tượng đại diện/thay thế để kiểm soát quyền truy cập, ghi nhật ký hoặc trì hoãn khởi tạo. | *"Lớp đại diện/ủy quyền"*, *"Kiểm soát truy cập đối tượng gốc"* | *Gác cửa kiểm soát*<br>Tác dụng thi nối: **Gác cửa trung gian** | Proxy Server kiểm soát truy cập web; Virtual Proxy trì hoãn tải hình ảnh nặng cho đến khi cần hiển thị. |
| 8 | Hành vi | **Strategy** (Chiến lược) | Khi có nhiều thuật toán/cách thức giải quyết một vấn đề và bạn muốn **linh hoạt đổi qua đổi lại**. | *"Thay đổi thuật toán linh hoạt"*, *"Lựa chọn cách xử lý theo ngữ cảnh/thời điểm chạy (runtime)"*. | *Thuật toán / Cách thức*<br>Tác dụng thi nối: **Linh hoạt hoán đổi các thuật toán** | Ứng dụng bản đồ chọn đường đi (Đi bộ, Ô tô, Xe máy); hoặc Thiết kế các chiến lược giảm giá (Giảm 10%, Giảm đồng giá, Giảm cho khách VIP). |
| 9 | Hành vi | **State** (Trạng thái) | Khi hành vi của một đối tượng phụ thuộc hoàn toàn vào **trạng thái hiện tại** của nó. | *"Thay đổi hành vi khi trạng thái nội bộ thay đổi"*, *"Tránh dùng quá nhiều câu lệnh if-else hoặc switch-case"*. | *Bản nháp / Đã duyệt / If-else trạng thái*<br>Tác dụng thi nối: **Thay đổi cách phản ứng theo điều kiện nội tại** | Đơn hàng (Chờ duyệt $\rightarrow$ Đã thanh toán $\rightarrow$ Đang giao $\rightarrow$ Hoàn tất). Ở mỗi trạng thái, nút "Hủy đơn" có hành vi khác nhau. |
| 10 | Hành vi | **Observer** (Người quan sát) | Khi một đối tượng thay đổi, tất cả các đối tượng khác liên quan phải **tự động nhận thông báo** và cập nhật theo. | *"Mối quan hệ 1 - nhiều"*, *"Tự động cập nhật"*, *"Phát tán sự kiện"*. | *Đổi một chỗ $\rightarrow$ Cập nhật hàng loạt*<br>Tác dụng thi nối: **Phát tán sự kiện và đồng bộ thay đổi** | Ứng dụng bảng giá chứng khoán (Giá mã cổ phiếu đổi $\rightarrow$ tất cả màn hình của người dùng tự nhảy số); tính năng Subscribe trên YouTube. |
| 11 | Hành vi | **Visitor** (Khách thăm) | Khi muốn định nghĩa các thao tác/thuật toán mới trên một tập hợp đối tượng có cấu trúc phức tạp mà không cần thay đổi các lớp hiện tại của chúng. | *"Tách biệt thuật toán khỏi cấu trúc đối tượng"*, *"Double dispatch"*, *"Phương thức accept và visit"*, *"Thêm hành vi mới mà không sửa code lớp cũ"*. | *Tách biệt thao tác khỏi cấu trúc đối tượng / Thêm tính năng không đổi lớp cũ*<br>Tác dụng thi nối: **Thêm thao tác mới vào cấu trúc sẵn có** | Trình biên dịch duyệt Cây cú pháp trừu tượng (AST): Các Node không đổi, nhưng có các `Visitor` để: Xuất JSON, Kiểm tra kiểu dữ liệu, Biên dịch sang mã máy. |
| 12 | Hành vi | **Chain of Responsibility** (Chuỗi trách nhiệm) | Chuyển tiếp yêu cầu qua một chuỗi các đối tượng xử lý cho đến khi có đối tượng xử lý được. | *"Chuyển tiếp yêu cầu dọc theo danh sách"*, *"Tránh liên kết trực tiếp"* | *Chuỗi xử lý tiếp sức*<br>Tác dụng thi nối: **Chuyển tiếp yêu cầu dọc theo danh sách** | Hệ thống duyệt chi tiêu: Nhân viên gửi $\rightarrow$ Trưởng phòng duyệt (nếu < 5tr) $\rightarrow$ Giám đốc duyệt (nếu < 50tr). |
| 13 | Hành vi | **Command** (Lệnh) | Đóng gói yêu cầu thành một đối tượng độc lập, cho phép tham số hóa, xếp hàng và thực hiện undo/redo. | *"Vật thể hóa các yêu cầu thành đối tượng"*, *"Lưu thao tác undo/redo"* | *Vật thể hóa thao tác*<br>Tác dụng thi nối: **Vật thể hóa các yêu cầu thành đối tượng** | Nút bấm giao diện: Liên kết với đối tượng Command tương ứng để kích hoạt hành động (`CopyCommand`, `PasteCommand`). |
| 14 | Hành vi | **Interpreter** (Thông dịch) | Khi một ngôn ngữ/ngữ pháp cần được thông dịch hoặc thực thi theo biểu thức định nghĩa sẵn. | *"Giải quyết vấn đề về ngôn ngữ/ngữ pháp"*, *"Định nghĩa bộ quy tắc ngôn ngữ"* | *Biên dịch/Thông dịch*<br>Tác dụng thi nối: **Giải quyết các vấn đề về ngôn ngữ/ngữ pháp** | Bộ tính toán biểu thức toán học dạng chuỗi hoặc bộ phân tích cú pháp câu lệnh SQL đơn giản. |
| 15 | Hành vi | **Iterator** (Bộ lặp) | Truy cập tuần tự các phần tử của một tập hợp mà không cần để lộ cấu trúc dữ liệu lưu trữ bên trong. | *"Duyệt phần tử mà không lộ cấu trúc"*, *"Truy cập tuần tự tập hợp"* | *Vòng lặp danh sách*<br>Tác dụng thi nối: **Duyệt phần tử mà không lộ cấu trúc** | Vòng lặp `foreach` duyệt qua các phần tử của một danh sách mà không cần quan tâm nó là cây hay mảng. |
| 16 | Hành vi | **Mediator** (Người trung gian) | Giảm liên kết trực tiếp chéo giữa các lớp bằng cách bắt chúng giao tiếp tập trung thông qua đối tượng trung gian. | *"Điều phối giao tiếp giữa các đối tượng"*, *"Giảm kết nối chéo giữa các lớp"* | *Tháp điều khiển trung tâm*<br>Tác dụng thi nối: **Điều phối giao tiếp giữa các đối tượng** | Tháp điều khiển không lưu sân bay điều phối các máy bay hạ cánh mà không để chúng liên lạc chéo trực tiếp. |
| 17 | Hành vi | **Memento** (Vật lưu niệm) | Lưu trữ trạng thái nội bộ của đối tượng để hoàn tác (Ctrl+Z) sau này mà không vi phạm tính đóng gói. | *"Lưu trữ và hoàn tác trạng thái nội bộ"*, *"Khôi phục trạng thái cũ"* | *Chụp ảnh trạng thái / Ctrl+Z*<br>Tác dụng thi nối: **Lưu trữ và hoàn tác trạng thái nội bộ** | Lưu trạng thái nhân vật tại checkpoint trong game; Tính năng khôi phục văn bản Ctrl+Z trong Word. |
| 18 | Hành vi | **Template Method** (Phương thức khuôn mẫu) | Định nghĩa khung của một thuật toán ở lớp cha, để lớp con ghi đè một số bước cụ thể mà không làm đổi cấu trúc chung. | *"Xây dựng khung xương cho thuật toán"*, *"Định nghĩa thuật toán khung"* | *Khung quy trình chung*<br>Tác dụng thi nối: **Xây dựng khung xương cho thuật toán** | Quy trình chế biến đồ uống: Lớp cha định nghĩa các bước (Đun nước $\rightarrow$ Pha chế $\rightarrow$ Rót cốc). Lớp con cụ thể hóa pha trà hay cà phê. |
| 19 | Khởi tạo | **Singleton** (Độc bản) | Khi hệ thống yêu cầu một lớp **chỉ được phép có duy nhất một thực thể (instance)** trong suốt vòng đời ứng dụng. | *"Duy nhất một thực thể"*, *"Truy cập toàn cục"*, *"Kiểm soát tài nguyên chung"*. | *Duy nhất / 1 instance*<br>Tác dụng thi nối: **Kiểm soát hệ thống** | Quản lý kết nối Cơ sở dữ liệu (Database Connection Pool), bộ đọc file cấu hình hệ thống (`AppConfig`). |

### 💡 Ghi chú ôn thi nhanh (Design Patterns):
*   **Mẫu Composite:** Dùng khi đề bài yêu cầu xử lý một "nhóm các đối tượng" hoàn toàn giống như một "đối tượng đơn lẻ" (Ví dụ: Thư viện đồ họa cho phép coi nhóm hình vẽ như một hình vẽ đơn).
*   **Mẫu State:** Dùng khi muốn thay đổi hành vi động theo trạng thái của đối tượng (Ví dụ: lớp `Document` có hành vi `edit()`, `publish()` khác nhau tùy theo trạng thái Bản nháp, Đang kiểm duyệt hay Đã xuất bản).
*   **Mẫu Visitor:** Thêm tính năng phân tích (ví dụ: tính lương, đánh giá hiệu suất của phòng ban) mà không muốn sửa đổi cấu trúc các lớp phòng ban có sẵn.
*   **Mẫu Strategy:** Linh hoạt hoán đổi các thuật toán tính toán (Ví dụ: chọn cách tính quãng đường đi bộ, xe đạp, ô tô trong ứng dụng bản đồ).
*   **Mẫu Decorator:** Thêm các tính năng như "thanh cuộn", "khung viền" hoặc "đổ bóng" cho cửa sổ một cách động tại runtime mà không muốn bùng nổ số lớp con (không dùng thừa kế).
*   **Bài thi nối các mẫu thiết kế:** Học thuộc chính xác cột *"Tác dụng thi nối"* vì đây là đáp án của các câu hỏi nối mẫu cấu trúc (Câu 37) và hành vi (Câu 47).
*   **Xếp hạng tần suất xuất hiện trong đề thi (Thống kê từ 8 đề HUST):**
    *   *Nhóm 1 (Xuất hiện nhiều nhất - Học kỹ ví dụ & lý thuyết):* **State (Trạng thái - 58 lần)** và **Proxy (Lớp đại diện - 41 lần)**, theo sau là **Prototype (Nguyên mẫu - 24 lần)**, **Strategy (Chiến lược - 20 lần)**, **Observer (Người quan sát - 15 lần)**, **Mediator (Người trung gian - 15 lần)**, **Command (Lệnh - 14 lần)**, **Template Method (Khuôn mẫu - 14 lần)**, **Visitor (Khách thăm - 13 lần)**.
    *   *Nhóm 2 (Xuất hiện vừa phải - Đa số có trong câu hỏi nối):* **Facade (Mặt tiền - 12 lần)**, **Decorator (Trang trí - 12 lần)**, **Composite (Phức hợp - 11 lần)**, **Adapter (Chuyển đổi - 11 lần)**, **Chain of Responsibility (Chuỗi trách nhiệm - 11 lần)**, **Interpreter (Thông dịch - 11 lần)**, **Iterator (Bộ lặp - 11 lần)**.
    *   *Nhóm 3 (Xuất hiện ít - Thường chỉ hỏi lý thuyết cơ bản):* **Singleton (Độc bản - 9 lần)**, **Builder (Thể xây - 8 lần)**, **Bridge (Cầu nối - 8 lần)**, **Flyweight (Hạng ruồi - 8 lần)**, **Memento (Lưu niệm - 7 lần)**, **Factory Method (Phương thức xưởng - 6 lần)**, **Abstract Factory (Nhà máy - 5 lần)**.
*   **Tần suất làm ĐÁP ÁN ĐÚNG trong đề thi (Chỉ tính các câu có đáp án chọn):**
    *   *Mẫu thiết kế hay làm đáp án đúng nhất:* **State (Trạng thái - 15 lần)**. Đây là mẫu cực kỳ quan trọng vì thường làm đáp án cho các câu trắc nghiệm hành vi động và bài tập tự luận vẽ vòng đời đơn hàng.
    *   *Các mẫu tiếp theo:* **Prototype (Nguyên mẫu - 4 lần)** và **Template Method (Khuôn mẫu - 3 lần)**.
    *   *Các mẫu còn lại:* Có tần suất làm đáp án đúng tương ứng khoảng từ **1 đến 2 lần** (chủ yếu nằm trong các bài thi nối tác dụng chính của nhóm Cấu trúc/Hành vi/Khởi tạo).

---

## 2. Bảng Tổng hợp Nguyên lý SOLID (Ngắn gọn)

| Nguyên lý | Tên Đầy Đủ | Định nghĩa ngắn gọn | Từ khóa thi / Mẹo nhớ / Ví dụ cụ thể |
| :---: | :--- | :--- | :--- |
| **S** | Single Responsibility (SRP) | Một lớp chỉ nên làm một việc duy nhất và chỉ có **một lý do duy nhất** để thay đổi. | *Single reason to change*, *Đơn nhiệm*, *Tách file/class quá to*. Thiết kế các lớp nhỏ chỉ có 1 lý do để thay đổi.<br>**Ví dụ vi phạm:** Lớp `GpaManager` vừa chứa hàm `read_excel(file_path)` vừa chứa hàm `calculate_gpa(data)` |
| **O** | Open/Closed (OCP) | Thoải mái **mở rộng** (thêm tính năng mới), nhưng hạn chế **sửa đổi** mã nguồn cũ. | *Open for extension, closed for modification*, *Interface/Abstract*.<br>Mẹo nhớ: *"Thêm mới thoải mái, cấm sửa code cũ"*. |
| **L** | Liskov Substitution (LSP) | Lớp con phải có khả năng **thay thế hoàn toàn** lớp cha mà không làm thay đổi tính đúng đắn của chương trình. | *Thay thế cha bằng con*, *Không ném ngoại lệ vô lý*, *Con không làm hẹp hành vi của cha*. *The Square-Rectangle Problem*<br>**Ví dụ vi phạm:** Lớp `Penguin` kế thừa `Bird` nhưng ném ra `NotImplementedError` ở hàm `fly()`. |
| **I** | Interface Segregation (ISP) | Nên chia nhỏ các Interface lớn thành nhiều Interface nhỏ, chuyên biệt; **tránh ép lớp con implement hàm nó không dùng**. | *Interface quá to/béo*, *Chia nhỏ Interface*, *Tránh implement thừa*. |
| **D** | Dependency Inversion (DIP) | Các module cấp cao không nên phụ thuộc vào module cấp thấp. Cả hai nên phụ thuộc vào sự trừu tượng (**Abstraction**). | *Phụ thuộc Abstraction*, *Dependency Injection (DI)*, *Loosely coupled*.<br>**Ứng dụng:** Mối quan hệ giữa tầng **Lĩnh vực nghiệp vụ** (cấp cao) và tầng **Nền tảng** (cấp thấp) là biểu hiện của DIP.<br>*Giải thích vì sao:* Thay vì tầng nghiệp vụ gọi trực tiếp các lớp kết nối CSDL hay phần cứng ở tầng nền tảng, tầng nghiệp vụ tự định nghĩa các giao diện trừu tượng (**Interface/Abstraction**). Tầng nền tảng sau đó sẽ triển khai (implements) các giao diện này. Chiều phụ thuộc bị đảo ngược: tầng nền tảng phải tuân theo cấu trúc do tầng nghiệp vụ đặt ra, giúp mã nghiệp vụ độc lập công nghệ. |


## 3. Bảng Tổng hợp Creational Patterns (Nhóm Khởi tạo)

| STT | Tên Pattern | Khi nào dùng | Từ khóa thi | Cặp bài trùng / Mẹo nhớ | Ví dụ thực tế (Java code) |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | **Abstract Factory** (Nhà máy trừu tượng) | Khi muốn tạo ra **một họ (family) các đối tượng liên quan** mà không cần chỉ ra lớp cụ thể của chúng.<br>*(Giải nghĩa "Nhà máy trừu tượng" - Abstract Factory: Giống như một "nhà máy lớn" định nghĩa cách sản xuất một combo/họ sản phẩm đi kèm với nhau (ví dụ: theme Sáng tạo ra cả Button Sáng & Checkbox Sáng), đảm bảo tính đồng bộ của cả họ đối tượng).* | *"Tạo một họ đối tượng liên quan/phụ thuộc nhau"*, *"Hệ thống giao diện đa nền tảng (cross-platform UI)"*. | *Họ đối tượng / Bộ sản phẩm*<br>Tác dụng thi nối: **Đồng bộ hóa** | <code>// Interface nhà máy định nghĩa các phương thức tạo đối tượng trong họ<br>interface GUIFactory {<br>&nbsp;&nbsp;Button createButton();<br>}<br>// Nhà máy cụ thể sản xuất các đối tượng thuộc hệ điều hành Windows<br>class WinFactory implements GUIFactory {<br>&nbsp;&nbsp;public Button createButton() {<br>&nbsp;&nbsp;&nbsp;&nbsp;return new WinButton(); // Tạo và trả về Button của Windows (đối tượng trong họ)<br>&nbsp;&nbsp;}<br>}</code> |
| 2 | **Factory Method** (Phương thức xưởng) | Định nghĩa giao diện tạo đối tượng ở lớp cha, nhưng **để các lớp con quyết định** lớp nào được khởi tạo.<br>*(Giải nghĩa "Xưởng" - Factory: Giống như xưởng sản xuất, lớp cha chỉ đặt ra "đơn đặt hàng chung", còn việc lắp ráp dòng sản phẩm cụ thể nào là do các "phân xưởng con" quyết định).* | *"Để các lớp con quyết định khởi tạo"*, *"Trì hoãn việc khởi tạo xuống lớp con (subclasses)"*. | *Khởi tạo ở lớp con / Trì hoãn khởi tạo*<br>Tác dụng thi nối: **Nới lỏng tính phụ thuộc** | <code>// Lớp cha khai báo phương thức factory để các lớp con ghi đè<br>abstract class Logistics {<br>&nbsp;&nbsp;public abstract Transport createTrans();<br>}<br>// Lớp con ghi đè phương thức factory để quyết định kiểu đối tượng cụ thể<br>class RoadLog extends Logistics {<br>&nbsp;&nbsp;public Transport createTrans() {<br>&nbsp;&nbsp;&nbsp;&nbsp;return new Truck(); // Lớp con quyết định khởi tạo Truck (Xe tải)<br>&nbsp;&nbsp;}<br>}</code> |
| 3 | **Builder** (Thể xây) | Xây dựng một **đối tượng phức tạp từng bước một (step-by-step)**, cho quy trình chung tạo ra các đại diện khác nhau. | *"Tạo đối tượng phức tạp từng bước"*, *"Nhiều tham số tùy chọn (optional) in constructor"*, *"Director & Builder"*. | *Từng bước / Đối tượng phức tạp / Quá nhiều tham số*<br>Tác dụng thi nối: **Xử lý các đối tượng phức tạp** | <code>House house = new HouseBuilder() // Khởi tạo đối tượng Builder<br>&nbsp;&nbsp;.buildWalls() // Bước 1: Xây tường<br>&nbsp;&nbsp;.buildRoof() // Bước 2: Xây mái (xây dựng từng bước)<br>&nbsp;&nbsp;.getResult(); // Nhận về đối tượng House hoàn chỉnh</code> |
| 4 | **Prototype** (Nguyên mẫu) | Khi việc tạo đối tượng mới bằng `new` quá tốn kém hoặc phức tạp, muốn tạo đối tượng bằng cách **sao chép (clone) đối tượng mẫu**. | *"Sao chép đối tượng mẫu (Clone)"*, *"Tránh chi phí tạo đối tượng bằng new"*, *"Lớp con implements Cloneable/Prototype"*. | *Sao chép / Nhân bản (Clone)*<br>Tác dụng thi nối: **Tối ưu hóa chi phí** | <code>// Lớp Cell triển khai Cloneable để hỗ trợ nhân bản<br>class Cell implements Cloneable {<br>&nbsp;&nbsp;public Cell clone() {<br>&nbsp;&nbsp;&nbsp;&nbsp;return (Cell) super.clone(); // Sao chép trực tiếp từ đối tượng mẫu, không dùng 'new'<br>&nbsp;&nbsp;}<br>}</code> |
| 5 | **Singleton** (Độc bản) | Khi hệ thống yêu cầu một lớp **chỉ được phép có duy nhất một thực thể (instance)**. | *"Duy nhất một thực thể"*, *"Truy cập toàn cục"*, *"Kiểm soát tài nguyên chung"*. | *Duy nhất / 1 instance*<br>Tác dụng thi nối: **Kiểm soát hệ thống** | <code>class Database {<br>&nbsp;&nbsp;private static Database inst; // Thuộc tính static lưu thực thể duy nhất<br>&nbsp;&nbsp;public static Database getInst() { // Điểm truy cập toàn cục<br>&nbsp;&nbsp;&nbsp;&nbsp;if (inst == null) inst = new Database(); // Chỉ tạo mới nếu chưa tồn tại (lazy load)<br>&nbsp;&nbsp;&nbsp;&nbsp;return inst; // Luôn trả về cùng một thực thể duy nhất<br>&nbsp;&nbsp;}<br>}</code> |


## 4. Bảng Tổng hợp Mức Thống Nhất Lớp (Class Cohesion)

| STT | Mức Thống Nhất | Định nghĩa ngắn gọn | Ảnh hưởng / Mức độ | Ví dụ mã Java (Minh họa ngắn gọn) |
| :---: | :--- | :--- | :--- | :--- |
| 1 | **Lý tưởng** (Ideal Cohesion) | Lớp đại diện cho một khái niệm duy nhất. Tất cả thuộc tính và phương thức đều liên kết chặt chẽ và phục vụ mục đích đó. | **Tốt nhất (Cao nhất)**<br>Dễ bảo trì, khả năng tái sử dụng cao. | <code>public class Point {<br>&nbsp;&nbsp;private int x;<br>&nbsp;&nbsp;private int y;<br>&nbsp;&nbsp;public void move(int dx, int dy) {<br>&nbsp;&nbsp;&nbsp;&nbsp;this.x += dx;<br>&nbsp;&nbsp;&nbsp;&nbsp;this.y += dy;<br>&nbsp;&nbsp;}<br>}</code> |
| 2 | **Hỗn hợp vai trò** (Mixed-Role) | Lớp đảm nhận trách nhiệm chính, nhưng bị ghép thêm thuộc tính/hành vi không thiết yếu thuộc về khái niệm khác trong cùng một lĩnh vực (domain). | **Ít nghiêm trọng**<br>Làm lớp mang thêm hành vi thừa không đáng có. | <code>public class Customer {<br>&nbsp;&nbsp;private String name;<br>&nbsp;&nbsp;// Trộn khái niệm thú cưng trong cùng domain quản lý<br>&nbsp;&nbsp;private String dogBreed;<br>&nbsp;&nbsp;public void feedDog() {}<br>}</code> |
| 3 | **Hỗn hợp lĩnh vực** (Mixed-Domain) | Lớp trộn lẫn các thành phần hoặc logic thuộc các lĩnh vực/tầng khác nhau (ví dụ: trộn logic nghiệp vụ với logic kết nối CSDL, UI, Network...). | **Trung bình**<br>Gây khó khăn khi tái sử dụng ở môi trường/tầng khác. | <code>public class Product {<br>&nbsp;&nbsp;private String name;<br>&nbsp;&nbsp;private double price;<br>&nbsp;&nbsp;public void saveToDatabase() {}<br>}</code><br>**Ví dụ trong đề:** Lớp `NhanVien` vừa chứa thông tin cá nhân (`maNhanVien`, `tenNhanVien`, `luong`) vừa chứa `java.sql.Connection dbConnection`. |
| 4 | **Hỗn hợp đối tượng** (Mixed-Instance) | Lớp chứa các thuộc tính hoặc phương thức chỉ áp dụng cho một số instance nhất định mà không áp dụng cho các instance khác. | **Nghiêm trọng nhất (Thấp nhất)**<br>Vi phạm thiết kế hướng đối tượng nặng, cần tách lớp. | <code>public class Employee {<br>&nbsp;&nbsp;private String name;<br>&nbsp;&nbsp;// Chỉ dùng cho Manager<br>&nbsp;&nbsp;private double bonus;<br>&nbsp;&nbsp;// Chỉ dùng cho Intern<br>&nbsp;&nbsp;private int schoolHours;<br>}</code> |

### 💡 Ghi chú ôn thi nhanh (Class Cohesion):
*   **Mixed-Domain (Hỗn hợp lĩnh vực):** Là vi phạm thường gặp khi lớp nghiệp vụ bị trộn lẫn logic kỹ thuật hoặc CSDL. Ví dụ: Lớp `NhanVien` vừa chứa thông tin nghiệp vụ vừa chứa thuộc tính `java.sql.Connection dbConnection`.

---

## 5. Bảng so sánh các phương pháp phát triển hệ thống (Methodology Selection)

| Tiêu chí lựa chọn | Waterfall (Thác nước) | Parallel (Song song) | Phased (Chia pha) | Prototyping (Nguyên mẫu HT) | Throwaway Prototyping (Nguyên mẫu thiết kế) | Agile (XP/Scrum) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Yêu cầu người dùng chưa rõ ràng** | Kém (Poor) | Kém (Poor) | Tốt (Good) | Rất tốt (Excellent) | Rất tốt (Excellent) | Rất tốt (Excellent) |
| **Công nghệ chưa quen thuộc** | Kém (Poor) | Kém (Poor) | Tốt (Good) | Kém (Poor) | Rất tốt (Excellent) | Kém (Poor) |
| **Độ phức tạp của hệ thống** | Tốt (Good) | Tốt (Good) | Tốt (Good) | Kém (Poor) | Rất tốt (Excellent) | Kém (Poor) |
| **Độ tin cậy của hệ thống** | Tốt (Good) | Tốt (Good) | Tốt (Good) | Kém (Poor) | Rất tốt (Excellent) | Tốt (Good) |
| **Đảm bảo đúng thời hạn (Thời gian ngắn)** | Kém (Poor) | Tốt (Good) | Rất tốt (Excellent) | Rất tốt (Excellent) | Tốt (Good) | Rất tốt (Excellent) |
| **Khả năng kiểm soát tiến độ** | Kém (Poor) | Kém (Poor) | Rất tốt (Excellent) | Rất tốt (Excellent) | Tốt (Good) | Rất tốt (Excellent) |

### 💡 Ghi chú ôn thi nhanh (Từ khóa trả lời câu hỏi):
*   **Khi "Đảm bảo đúng thời hạn có vai trò rất quan trọng" (Short Time Schedule):** Lựa chọn tốt nhất là **Phased (Chia pha)**, **Prototyping (Nguyên mẫu HT)**, hoặc **Agile (XP/Scrum)** (đều đạt mức **Rất tốt**).
*   **Khi "Yêu cầu người dùng chưa rõ ràng" (Unclear User Requirements):** Lựa chọn tốt nhất là **Prototyping**, **Throwaway Prototyping**, hoặc **Agile** (đều đạt mức **Rất tốt**).
*   **Khi "Hệ thống có độ phức tạp cao + Công nghệ chưa quen thuộc" (Unfamiliar Tech + Complex):** Lựa chọn duy nhất đạt điểm **Rất tốt** ở cả hai tiêu chí là **Throwaway Prototyping (Nguyên mẫu thiết kế)**.
*   **Khi "Hệ thống đòi hỏi độ tin cậy cực kỳ cao" (Reliable Systems):** **Throwaway Prototyping** là tốt nhất (**Rất tốt**), tiếp theo là **Waterfall / Parallel / Phased / Agile** (**Tốt**). Tránh xa **Prototyping** (**Kém**).
*   **Khi "Không xác định chính xác yêu cầu ngay từ đầu + có nhiều công nghệ mới":** Tuyệt đối **không nên** áp dụng **Mô hình thác nước** (Waterfall) do tính chất cứng nhắc và rủi ro cao.


## 6. Bảng so sánh 5 giai đoạn trong SDLC (Vòng đời phát triển hệ thống)

| STT | Giai đoạn | Câu hỏi cốt lõi / Mục tiêu | Hoạt động chính | Sản phẩm đầu ra (Deliverable) |
| :---: | :--- | :--- | :--- | :--- |
| 1 | **Lập kế hoạch**<br>(Planning) | Trả lời câu hỏi: **Tại sao (Why)** nên xây dựng hệ thống?<br>Xác định giá trị và tính khả thi. | - Phân tích tính khả thi (kỹ thuật, kinh tế, tổ chức).<br>- Lập kế hoạch dự án, phân bổ nhân sự. | **Kế hoạch dự án** (Project Plan) |
| 2 | **Phân tích**<br>(Analysis) | Trả lời các câu hỏi:<br>- **Ai (Who)** sẽ sử dụng?<br>- Hệ thống sẽ làm **cái gì (What)**?<br>- **Ở đâu (Where)** và **khi nào (When)** sử dụng? | - Thu thập yêu cầu (phỏng vấn, JAD, bảng hỏi).<br>- Mô hình hóa chức năng/quy trình (Use case, DFD).<br>- Mô hình hóa dữ liệu (Domain Class Diagram, ERD sơ bộ). | **Bản đề xuất hệ thống** (System Proposal)<br>*(Chứa tài liệu đặc tả yêu cầu SRS)* |
| 3 | **Thiết kế**<br>(Design) | Trả lời câu hỏi: Hệ thống sẽ hoạt động **như thế nào (How)**?<br>Định hình giải pháp kỹ thuật cụ thể. | - Thiết kế kiến trúc (4+1 View, phân tầng Layering).<br>- Thiết kế giao diện (UI/UX, màn hình, cổng API).<br>- Thiết kế cơ sở dữ liệu chi tiết (Physical ERD).<br>- Thiết kế lớp chi tiết (Design Class Diagram). | **Tài liệu đặc tả hệ thống** (System Specification) |
| 4 | **Triển khai / Phát triển**<br>(Implementation) | Xây dựng phần mềm thực tế, kiểm thử chất lượng và đưa vào sử dụng. | - Viết mã nguồn (Coding).<br>- Kiểm thử hệ thống (Unit, Integration, System, Acceptance Test).<br>- Chuyển đổi và cài đặt hệ thống (Installation).<br>- Đào tạo người dùng cuối. | **Hệ thống mới hoàn chỉnh** (New System)<br>*(Đã cài đặt và sẵn sàng vận hành)* |
| 5 | **Vận hành & Bảo trì**<br>(Maintenance) | Đảm bảo hệ thống hoạt động ổn định và cập nhật theo nhu cầu mới của thực tế. | - Hỗ trợ người dùng, xử lý lỗi phát sinh (Bug fix).<br>- Nâng cấp tính năng mới theo yêu cầu nghiệp vụ đổi mới. | **Bản cập nhật / Vá lỗi** (Updates/Patches)<br>Báo cáo đánh giá hệ thống |

### 💡 Mẹo nhớ nhanh để trả lời câu hỏi thi (SDLC):
*   **Hỏi câu hỏi cốt lõi "Ai sử dụng?", "Ở đâu?", "Trong điều kiện nào?", hoặc "Hệ thống làm CÁI GÌ?":** Chọn ngay pha **Phân tích** (Analysis).
*   **Hỏi câu hỏi cốt lõi "Hệ thống hoạt động NHƯ THẾ NÀO?":** Chọn ngay pha **Thiết kế** (Design).
*   **Hỏi "Tài liệu đề xuất hệ thống (System Proposal)" là đầu ra của pha nào?:** Chọn pha **Phân tích** (Analysis).
*   **Hỏi "Tài liệu đặc tả hệ thống (System Specification)" là đầu ra của pha nào?:** Chọn pha **Thiết kế** (Design).
*   **Hỏi "Mô hình hóa chức năng" (Vẽ Use Case, DFD) thuộc pha nào?:** Chọn pha **Phân tích** (Analysis).

### 💡 Ghi chú ôn thi nhanh (SDLC & Pha & Sản phẩm):
*   **Pha Phân tích (Analysis):** Tập trung làm rõ yêu cầu nghiệp vụ qua mô hình chức năng (Use Case) và mô hình dữ liệu (Domain Class Diagram) độc lập công nghệ.
*   **Pha Thiết kế (Design):** Định hình giải pháp kỹ thuật, cấu trúc lớp (Design Class Diagram) và sơ đồ triển khai phần cứng.

---

## 7. Bảng Mức Thống Nhất Phương Thức (Method Cohesion)

| STT | Mức Thống Nhất | Định nghĩa ngắn gọn | Đánh giá | Ví dụ minh họa (Java code) |
| :---: | :--- | :--- | :--- | :--- |
| 1 | **Chức năng**<br>(Functional Cohesion) | Phương thức chỉ thực hiện duy nhất một chức năng nghiệp vụ độc lập. | **Tốt nhất** | <code>public double calcGpa(List&lt;Double&gt; gr) {<br>&nbsp;&nbsp;double sum = gr.stream().sum();<br>&nbsp;&nbsp;return sum / gr.size();<br>}</code> |
| 2 | **Tuần tự**<br>(Sequential Cohesion) | Đầu ra của hoạt động này là đầu vào của hoạt động tiếp theo trong cùng phương thức. | **Tốt** | <code>public void process(String path) {<br>&nbsp;&nbsp;String raw = readFile(path);<br>&nbsp;&nbsp;String parsed = parse(raw);<br>&nbsp;&nbsp;save(parsed);<br>}</code> |
| 3 | **Giao tiếp**<br>(Communicational Cohesion) | Các hoạt động trong phương thức cùng sử dụng chung một cấu trúc dữ liệu đầu vào hoặc đầu ra. | **Trung bình** | <code>public void analyze(BangDiem bd) {<br>&nbsp;&nbsp;double curr = calcCurrent(bd);<br>&nbsp;&nbsp;double cum = calcCum(bd);<br>&nbsp;&nbsp;print(curr, cum);<br>}</code> |
| 4 | **Tiến trình**<br>(Procedural Cohesion) | Các hoạt động được thực hiện theo một trình tự nhất định, nhưng không trao đổi dữ liệu trực tiếp với nhau. | **Trung bình** | <code>public void doSteps() {<br>&nbsp;&nbsp;checkPermissions();<br>&nbsp;&nbsp;writeLogEntry();<br>}</code> |
| 5 | **Cổ điển / Thời gian**<br>(Temporal Cohesion) | Các hoạt động được gom lại chỉ vì chúng được thực hiện cùng một thời điểm. | **Kém** | <code>public void initSystem() {<br>&nbsp;&nbsp;connectDb();<br>&nbsp;&nbsp;initLoginForm();<br>&nbsp;&nbsp;resetTempMemory();<br>}</code> |
| 6 | **Lô-gic**<br>(Logical Cohesion) | Thực hiện nhiều việc có tính chất tương tự, hành vi cụ thể được lựa chọn qua tham số truyền vào. | **Kém** | <code>public void printReport(int type) {<br>&nbsp;&nbsp;if (type == 1) printPdf();<br>&nbsp;&nbsp;else if (type == 2) printExcel();<br>}</code> |
| 7 | **Ngẫu nhiên**<br>(Coincidental Cohesion) | Các câu lệnh được gom lại không có mối quan hệ rõ ràng nào. | **Tệ nhất** | <code>public void randomStuff() {<br>&nbsp;&nbsp;printTodayDate();<br>&nbsp;&nbsp;calculateTax();<br>&nbsp;&nbsp;soundAlarm();<br>}</code> |

### 💡 Ghi chú ôn thi nhanh (Method Cohesion):
*   **Temporal Cohesion (Cổ điển/Thời gian):** Ví dụ như `khoiTaoHeThong()`, các hoạt động khác nhau (kết nối DB, init UI, reset memory) được gom chung vì cùng thực thi tại thời điểm khởi chạy.
*   **Communicational Cohesion (Giao tiếp):** Ví dụ phương thức `phanTichBangDiem(BangDiem bd)` cùng sử dụng chung một đầu vào là `bd` để tính GPA học kỳ và GPA tích lũy.

---

## 8. Bảng Tổng hợp Mức Ghép Nối (Coupling Levels)

| STT | Mức Ghép Nối | Định nghĩa ngắn gọn | Đánh giá | Ví dụ minh họa (Java code) |
| :---: | :--- | :--- | :--- | :--- |
| 1 | **Dữ liệu**<br>(Data Coupling) | Các phương thức trao đổi các tham số dữ liệu đơn giản, thiết yếu cho việc thực hiện chức năng. | **Tốt nhất (Lỏng nhất)** | <code>public double tinhDienTich(double rong, double dai) {<br>&nbsp;&nbsp;return rong * dai;<br>}</code> |
| 2 | **Dấu ấn**<br>(Stamp Coupling) | Phương thức truyền cho phương thức khác một đối tượng/cấu trúc dữ liệu chứa nhiều thuộc tính, nhưng phương thức nhận chỉ sử dụng một vài thuộc tính trong số đó. | **Tốt / Trung bình** | <code>public void inMaLop(HocSinh hs) {<br>&nbsp;&nbsp;System.out.println(hs.getMaLop()); // Chỉ dùng maLop<br>}</code> |
| 3 | **Điều khiển**<br>(Control Coupling) | Phương thức gọi truyền tham số điều khiển (ví dụ cờ flag) để quyết định luồng xử lý bên trong phương thức nhận. | **Trung bình** | <code>public void xuLyHoaDon(HoaDon hd, boolean isVIP) {<br>&nbsp;&nbsp;if (isVIP) { /* xử lý VIP */ }<br>&nbsp;&nbsp;else { /* xử lý thường */ }<br>}</code> |
| 4 | **Chung**<br>(Common/Global Coupling) | Hai hay nhiều lớp cùng truy cập và chia sẻ một vùng dữ liệu toàn cục hoặc thuộc tính public của đối tượng khác. | **Nghiêm trọng** | <code>class Hacker {<br>&nbsp;&nbsp;public void hack(Account acc) {<br>&nbsp;&nbsp;&nbsp;&nbsp;acc.balance = 0.0; // Sửa trực tiếp public field<br>&nbsp;&nbsp;}<br>}</code> |
| 5 | **Nội dung**<br>(Content Coupling) | Lớp này thay đổi trực tiếp mã nguồn hoặc dữ liệu riêng tư (private) của lớp kia. | **Tệ nhất (Chặt nhất)** | <code>class ClassA {<br>&nbsp;&nbsp;public void modify(ClassB b) {<br>&nbsp;&nbsp;&nbsp;&nbsp;b.privateField = 99; // Can thiệp trực tiếp private của B không qua getter setter<br>&nbsp;&nbsp;}<br>}</code> |

### 💡 Ghi chú ôn thi nhanh (Mức ghép nối):
*   **Common Coupling (Ghép nối chung):** Xảy ra khi một lớp can thiệp trực tiếp thuộc tính `public` của lớp khác (Ví dụ: `Hacker` gán trực tiếp `acc.balance = 0.0`).
*   **Stamp Coupling (Ghép nối dấu ấn):** Xảy ra khi một phương thức truyền cả một đối tượng chứa nhiều thuộc tính, nhưng phương thức nhận chỉ sử dụng một phần nhỏ các thuộc tính đó.

---

## 9. Bảng so sánh các Chiến lược Thiết kế Hệ thống

| Chiến lược | Khi nào dùng | Ưu điểm | Rủi ro / Khó khăn | Từ khóa thi |
| :--- | :--- | :--- | :--- | :--- |
| **Tự phát triển**<br>(Custom/In-house development) | Nghiệp vụ cốt lõi, độc quyền, mang tính cạnh tranh cao của tổ chức. | - Tùy biến tối đa theo quy trình của tổ chức.<br>- Dễ dàng tích hợp với hệ thống hiện có.<br>- Xây dựng năng lực CNTT nội bộ. | - Chi phí cao nhất.<br>- Tốn nhiều thời gian phát triển.<br>- Rủi ro dự án thất bại lớn. | *"Nhiều kỹ sư có năng lực nội bộ"*, *"Quy trình nghiệp vụ độc quyền/cốt lõi"*. |
| **Mua gói phần mềm**<br>(Packaged software) | Nghiệp vụ phổ biến, đại trà, **không phải là năng lực cốt lõi cạnh tranh** của tổ chức. | - Chi phí rẻ hơn.<br>- Thời gian triển khai rất nhanh.<br>- Đã được kiểm định chất lượng trên thị trường. | - Khả năng tùy biến cực kỳ hạn chế.<br>- **Bắt buộc tổ chức phải thay đổi quy trình nghiệp vụ hiện tại** để phù hợp phần mềm. | *"Nhiều doanh nghiệp mua dùng rộng rãi"*, *"Chấp nhận thay đổi quy trình nghiệp vụ phù hợp gói phần mềm"*, **"Nghiệp vụ không phải cốt lõi"**. |
| **Gia công phần mềm**<br>(Outsourcing) | Doanh nghiệp thiếu nhân lực/chuyên môn, nghiệp vụ không quá nhạy cảm về bảo mật. | - Tận dụng năng lực chuyên môn của đối tác bên ngoài.<br>- Rút ngắn thời gian phát triển. | - Rủi ro rò rỉ thông tin bảo mật.<br>- Phụ thuộc lâu dài vào đối tác.<br>- Đòi hỏi PM có năng lực **điều phối nhà cung cấp** tốt. | *"Thiếu nguồn lực CNTT nội bộ"*, *"PM điều phối công việc của nhà cung cấp"*. |
| **Tích hợp hệ thống**<br>(System Integration) | Khi muốn kết hợp và tận dụng các hệ thống cũ sẵn có (legacy systems) kết hợp với các gói phần mềm mới. | - Tiết kiệm chi phí bằng cách tận dụng phần cứng/phần mềm cũ.<br>- Tạo ra một hệ thống thống nhất từ nhiều nguồn. | - Rất khó khăn trong việc viết các bộ chuyển đổi (adapters/wrappers) để liên kết các hệ thống không tương thích. | *"Kết hợp các hệ thống cũ sẵn có"*, *"Tận dụng tài nguyên phần mềm cũ"*. |

### 💡 Ghi chú ôn thi nhanh (Chiến lược thiết kế):
*   **Khi "Nhu cầu nghiệp vụ không phải cốt lõi cạnh tranh":** Chọn ngay chiến lược **Mua gói phần mềm** (Packaged software) để tối ưu hóa chi phí và tiến độ.
*   **Khi "PM có khả năng điều phối nhà cung cấp":** Chọn ngay chiến lược **Gia công phần mềm** (Outsourcing).
    *   *Giải thích lý do:* Khi thuê ngoài (Outsourcing), rủi ro lớn nhất là việc mất kiểm soát tiến độ, chất lượng và bảo mật do bên thứ ba thực hiện. Do đó, tổ chức chỉ nên chọn chiến lược này nếu người quản lý dự án (PM) có năng lực tốt trong việc **thiết lập quy trình giám sát, giao tiếp và điều phối nhà cung cấp** để kiểm soát và giảm thiểu các rủi ro trên.

---

## 10. Bảng Phân loại Yêu cầu Hệ thống (FURPS)

| Nhóm (FURPS) | Ý nghĩa / Tên đầy đủ | Nội dung chi tiết | Từ khóa thi / Ví dụ thực tế |
| :---: | :--- | :--- | :--- |
| **F** | **Functionality** (Chức năng) | Các yêu cầu chức năng, quy trình xử lý dữ liệu, nghiệp vụ, bảo mật chức năng. | *"Quy trình bán hàng"*, *"Tạo hóa đơn"*, *"Hệ thống phải có tính năng X"*. |
| **U** | **Usability** (Khả năng sử dụng) | Giao diện người dùng (UI), trải nghiệm (UX), tài liệu hướng dẫn, các yếu tố **Thẩm mỹ**. | *"Thiết kế màn hình nhập liệu"*, *"Tài liệu hướng dẫn sử dụng"*, *"Độ thẩm mỹ"* (thuộc Usability). |
| **R** | **Reliability** (Độ tin cậy) | Khả năng hoạt động ổn định, tần suất lỗi xảy ra, khả năng phục hồi khi gặp sự cố, độ chính xác. | *"Tần suất gặp lỗi"*, *"Khả năng khôi phục hệ thống khi gặp sự cố"*, *"Tính chính xác của dữ liệu"*. |
| **P** | **Performance** (Hiệu năng) | Tốc độ phản hồi, thông lượng xử lý dữ liệu, dung lượng tài nguyên tiêu thụ, khả năng đáp ứng tải. | *"Đáp ứng đồng thời 1000 yêu cầu ghi dữ liệu / s"*, *"Thời gian phản hồi trang dưới 2 giây"*. |
| **S** | **Supportability** (Khả năng hỗ trợ) | Khả năng bảo trì, nâng cấp, cấu hình, cài đặt, tương thích hệ điều hành/môi trường vận hành. | *"Dễ dàng nâng cấp/bảo trì"*, *"Cài đặt trên môi trường Linux"*, *"Yêu cầu vận hành hệ thống"*. |

### 💡 Ghi chú ôn thi nhanh (FURPS & Requirements):
*   **Yêu cầu hiệu năng (Performance):** "Hệ thống đáp ứng đồng thời 1000 yêu cầu ghi dữ liệu / s".
*   **Yêu cầu Usability:** "Yêu cầu về giao diện nhập liệu hoặc độ thẩm mỹ của trang web" (Lưu ý: Thẩm mỹ thuộc Usability, không phải một nhóm yêu cầu độc lập trong FURPS).

---

## 11. Bảng Phân loại và Đặc tả Ca sử dụng (Use Case Concept)

| Khái niệm | Phân loại / Định nghĩa | Đặc điểm cốt lõi | Từ khóa thi / Ví dụ |
| :--- | :--- | :--- | :--- |
| **Thiết yếu**<br>(Essential Use Case) | Theo mức độ chi tiết công nghệ | Mô tả ở mức khái niệm/nghiệp vụ thuần túy, **độc lập hoàn toàn** với giao diện người dùng và công nghệ. | *"Thường được xác định và đặc tả trong giai đoạn phân tích"*. |
| **Thực tế**<br>(Real Use Case) | Theo mức độ chi tiết công nghệ | Mô tả cụ thể tương tác gắn liền với giao diện thực tế (chỉ rõ vị trí nút bấm, cách hiển thị trang). | *"Người dùng điền thông tin vào trang sau đó nhấn nút Gửi ở góc phải"*, *"Giai đoạn thiết kế"*. |
| **Khái quát**<br>(Brief Use Case) | Theo mức độ hoàn thiện đặc tả | Mô tả rất ngắn gọn (vài dòng) để nhanh chóng nhận diện ca sử dụng ở giai đoạn đầu. | *"Khởi đầu pha phân tích, mô tả tóm tắt giá trị ca sử dụng mang lại"*. |
| **Chi tiết**<br>(Detailed Use Case) | Theo mức độ hoàn thiện đặc tả | Đặc tả đầy đủ luồng sự kiện chính, các luồng phụ, tiền điều kiện và hậu điều kiện. | *"Viết tài liệu đặc tả đầy đủ các bước tương tác ở pha phân tích"*. |
| **Điều kiện là Use Case** | Giá trị nghiệp vụ độc lập | Phải mang lại một kết quả có **giá trị nghiệp vụ trọn vẹn và độc lập** cho tác nhân (Actor). | *"Nhập số lượng sản phẩm"* chỉ là thao tác nhỏ trên giao diện $\rightarrow$ **KHÔNG** được coi là ca sử dụng. |
| **Đặc tả ca sử dụng** | Định dạng mô hình | Thuộc loại **mô hình văn bản** (textual model) mô tả chi tiết tương tác. | *"Đặc tả chi tiết ca sử dụng được xếp vào nhóm mô hình văn bản"*. |

### 💡 Ghi chú ôn thi nhanh (Use Case Details):
*   **Ca sử dụng thực tế (Real Use Case):** Thường gặp ở giai đoạn Thiết kế khi đặc tả cụ thể giao diện (Ví dụ: "Người dùng nhập thông tin... nhấn nút Gửi ở góc phải").
*   **Nhập số lượng sản phẩm:** Chỉ là một thao tác nhỏ giao diện, không phải là một ca sử dụng vì nó không tạo ra giá trị nghiệp vụ trọn vẹn độc lập.

---

## 12. Bảng so sánh các loại biểu đồ UML và các phần tử liên quan

### 1. Bảng So sánh Tổng quan các biểu đồ UML thông dụng:

| Tên Biểu đồ (UML Diagram) | Phân loại chính | Mục tiêu / Vai trò chính | Thành phần / Ký hiệu quan trọng | Từ khóa thi |
| :--- | :--- | :--- | :--- | :--- |
| **Sơ đồ lớp**<br>(Class Diagram) | Tĩnh (Structural)<br>Đầu ra: **Mô hình hóa cấu trúc** | Mô tả cấu trúc tĩnh của hệ thống: các lớp, thuộc tính, phương thức và mối quan hệ giữa chúng.<br>- *Mô hình lĩnh vực (Domain Class):* Khái niệm nghiệp vụ thực tế, độc lập công nghệ.<br>- *Mô hình thiết kế (Design Class):* Chi tiết kỹ thuật, kiểu dữ liệu, phương thức. | Lớp (Class), các quan hệ: Kế thừa (Generalization), Thu gom (Aggregation), Hợp thành (Composition), Phụ thuộc (Dependency). | *"Sản phẩm đầu ra của mô hình hóa cấu trúc"*, *"Cấu trúc tĩnh"*, *"Độ bội (multiplicity)"*, *"Lớp lĩnh vực (Domain Class)"*. |
| **Sơ đồ đối tượng**<br>(Object Diagram) | Tĩnh (Structural) | Biểu diễn ảnh chụp (snapshot) của các đối tượng cụ thể và liên kết giữa chúng tại một thời điểm nhất định khi hệ thống chạy. | Đối tượng cụ thể (Instance: `tên_đối_tượng: Tên_lớp`), Giá trị thuộc tính cụ thể, Liên kết (Link). | *"Snapshot"*, *"Ảnh chụp hệ thống tại một thời điểm chạy"*, *"Thể hiện cụ thể của biểu đồ lớp"*. |
| **Sơ đồ ca sử dụng**<br>(Use Case Diagram) | Động / Hành vi (Behavioral)<br>Đầu ra: **Mô hình hóa chức năng** | Xác định phạm vi hệ thống và các chức năng chính mà hệ thống cung cấp cho người dùng bên ngoài. | Tác nhân (Actor), Ca sử dụng (Use Case), Quan hệ: Include, Exclude/Extend, Generalization. | *"Sản phẩm đầu ra của mô hình hóa chức năng"*, *"Hệ thống làm CÁI GÌ (What)"*, *"Tương tác bên ngoài"*. |
| **Sơ đồ hoạt động**<br>(Activity Diagram) | Động / Hành vi (Behavioral) | Mô tả dòng công việc (workflow), quy trình nghiệp vụ từng bước, hỗ trợ xử lý song song và phân định trách nhiệm. | Hành động (Action), Luồng bơi (Swimlanes), Điểm quyết định (Decision/Merge node), Phân nhánh/Gộp (Fork/Join node). | *"Dòng công việc (Workflow)"*, *"Quy trình nghiệp vụ bán hàng"*, *"Swimlanes phân chia trách nhiệm"*, *"Xử lý song song"*. |
| **Sơ đồ tuần tự**<br>(Sequence Diagram) | Động / Tương tác (Interaction)<br>Đầu ra: **Mô hình hóa hành vi** | Mô tả sự tương tác động giữa các đối tượng theo trình tự thời gian (thông điệp truyền nhận giữa các đối tượng). | Lifeline (Đường đứt nét thẳng đứng), Thông điệp gọi (Nét liền mũi tên đặc), Thông điệp phản hồi (Nét đứt mũi tên rỗng). | *"Sản phẩm đầu ra của mô hình hóa hành vi"*, *"Trục thời gian, thời gian sống (Lifeline)"*, *"Thông điệp (Message)"*, *"Dung lượng bộ nhớ nằm ngoài phạm vi thông điệp"*, không vẽ ca sử dụng bên trong. |
| **Sơ đồ máy trạng thái**<br>(State Machine Diagram) | Động / Hành vi (Behavioral) | Mô tả các trạng thái khác nhau và sự chuyển dịch trạng thái của **duy nhất một đối tượng cụ thể** trong vòng đời của nó do sự kiện kích hoạt. | Trạng thái (State), Sự kiện (Event), Sự chuyển trạng thái (Transition), Điều kiện ràng buộc (Guard condition). | *"Vòng đời của một đối tượng cụ thể (ví dụ: Đơn hàng)"*, *"Sự kiện trạng thái, sự kiện thời gian, sự kiện ngoại"*. |
| **Sơ đồ triển khai**<br>(Deployment Diagram) | Tĩnh (Physical / Structural) | Mô tả cấu trúc vật lý của phần cứng (các nút thiết bị, server) và cách phân bố/cài đặt các thành phần phần mềm trên các nút phần cứng đó. | Nút (Node - hình hộp 3D), Thành phần phần mềm (Component), Liên kết truyền thông (Communication path). | *"Cấu trúc vật lý của phần cứng"*, *"Phân bố thành phần phần mềm trên phần cứng"*, *"Nút Client, App Server, DB Server Node"*. |
| **Sơ đồ gói**<br>(Package Diagram) | Tĩnh (Structural) | Nhóm các phần tử (lớp, biểu đồ) có liên quan lại với nhau để tổ chức và quản lý cấu trúc dự án dưới dạng phân cấp. | Gói (Package - hình thư mục tab nhỏ), Quan hệ: Nhập (<<import>>), Hợp nhất (<<merge>>). | *"Quan hệ hợp nhất (<<merge>>)"*, *"Ký hiệu hình thư mục có tab nhỏ"*, *"Nội dung gói đích hợp nhất vào gói nguồn"*. |

### 💡 Phân biệt 3 loại Mô hình hóa trong Phân tích & Thiết kế:
*   **Mô hình hóa chức năng (Functional Modeling):**
    *   *Đặc điểm:* Tập trung mô tả hệ thống làm **cái gì (What)** từ góc nhìn của tác nhân bên ngoài.
    *   *Sản phẩm đầu ra chính:* **Sơ đồ ca sử dụng (Use Case Diagram)**, tài liệu đặc tả ca sử dụng, biểu đồ luồng dữ liệu (DFD).
*   **Mô hình hóa cấu trúc (Structural Modeling):**
    *   *Đặc điểm:* Mô tả **cấu trúc tĩnh**, các thành phần dữ liệu, các lớp và mối quan hệ bền vững trong hệ thống.
    *   *Sản phẩm đầu ra chính:* **Sơ đồ lớp (Class Diagram)**, sơ đồ đối tượng (Object Diagram).
*   **Mô hình hóa hành vi (Behavioral Modeling):**
    *   *Đặc điểm:* Mô tả sự **tương tác động** giữa các đối tượng theo trình tự thời gian hoặc quy trình nghiệp vụ nội bộ của hệ thống.
    *   *Sản phẩm đầu ra chính:* **Sơ đồ tuần tự (Sequence Diagram)**, sơ đồ hoạt động (Activity Diagram), sơ đồ máy trạng thái (State Machine Diagram).

### 2. Chi tiết các loại quan hệ trong Sơ đồ lớp (Class Diagram) - Mẹo nhận diện ký hiệu:

*   **Kế thừa (Generalization):**
    *   *Ký hiệu:* Đường nét liền, mũi tên hình tam giác rỗng hướng từ lớp con về lớp cha.
    *   *Ý nghĩa:* Mối quan hệ "is-a" (Là một). Lớp con kế thừa toàn bộ thuộc tính và phương thức của cha.
*   **Thu gom (Aggregation):**
    *   *Ký hiệu:* Đường nét liền, có hình thoi rỗng ở phía lớp toàn thể (Whole).
    *   *Ý nghĩa:* Mối quan hệ "has-a" (Có một) ở mức lỏng lẻo. Lớp thành phần có thể tồn tại độc lập khi lớp toàn thể bị hủy (Ví dụ: Thư viện và Sách).
*   **Hợp thành (Composition):**
    *   *Ký hiệu:* Đường nét liền, có hình thoi đặc ở phía lớp toàn thể (Whole).
    *   *Ý nghĩa:* Mối quan hệ "has-a" ở mức chặt chẽ nhất. Lớp thành phần bị ràng buộc vòng đời vào lớp toàn thể, khi lớp toàn thể bị hủy thì các thành phần con cũng bị hủy theo (Ví dụ: Đơn hàng và Chi tiết đơn hàng/Mục hàng). Độ bội phía toàn thể bắt buộc phải là 1.
*   **Phụ thuộc (Dependency):**
    *   *Ký hiệu:* Đường nét đứt, có mũi tên hở hướng từ lớp phụ thuộc đến lớp độc lập.
    *   *Ý nghĩa:* Lớp này sử dụng lớp kia làm tham số đầu vào hoặc biến cục bộ trong một phương thức ngắn hạn. Thay đổi ở lớp độc lập có thể làm ảnh hưởng đến lớp phụ thuộc.

### 3. Các lưu ý thi quan trọng khác về phần tử biểu đồ:
*   **Thông điệp (Message):** Trong sơ đồ tuần tự, thông điệp không phải là một đối tượng (Object). Nó chỉ biểu diễn cuộc gọi phương thức giữa các đối tượng. Các thông tin biểu diễn trên thông điệp gồm: Tên phương thức, tham số truyền đi và chiều tương tác. **Dung lượng bộ nhớ** của đối tượng không được biểu diễn trên thông điệp.
*   **Sơ đồ tuần tự mức hệ thống (SSD):** Xem toàn bộ hệ thống như một **hộp đen (black-box)**. Chỉ vẽ tương tác giữa Tác nhân bên ngoài (Actor) và Hệ thống (System), không vẽ các đối tượng nội bộ bên trong hệ thống.
*   **Khái niệm "Khu vực" (Area) trong IFML:** Biểu diễn một trang Web đơn lẻ hoặc một nhóm các trang Web/giao diện có liên quan chặt chẽ về nội dung và chức năng.
*   **Đặc tả ca sử dụng (Use Case Specification):** Thuộc nhóm **mô hình văn bản** (Textual model), không phải mô hình hình vẽ.

---

## 13. Sơ đồ & Biểu đồ UML (Sequence, Activity, State, Deployment, Class/Object Diagrams)

### Sơ đồ tuần tự (Sequence Diagram) & SSD
*   **Lifeline (Trục thời gian sống):** Đường nét đứt thẳng đứng bên dưới các đối tượng đại diện cho trục thời gian sống của các đối tượng đó.
*   **Sơ đồ tuần tự mức hệ thống (SSD - System Sequence Diagram):** Mô tả sự tương tác giữa các tác nhân bên ngoài (Actor) với hệ thống (hệ thống được coi như một **hộp đen - Black box**). SSD giúp ghi chép các hoạt động sử dụng hệ thống của tác nhân qua các sự kiện hệ thống (system events).

### Phân loại Sự kiện (Event Types)
*   **Sự kiện ngoại (External Event):** Do tác nhân bên ngoài kích hoạt (ví dụ: Khách nhấn nút thanh toán).
*   **Sự kiện thời gian (Temporal Event):** Tự động kích hoạt theo thời gian (ví dụ: Hệ thống tự động gửi báo cáo lúc 23h59).
*   **Sự kiện trạng thái (State Event):** Kích hoạt khi điều kiện dữ liệu/trạng thái nội bộ của hệ thống thỏa mãn (ví dụ: *"Số lượng hàng trong kho đã giảm xuống dưới ngưỡng"*).

### Đặc trưng của OOSAD (Phân tích thiết kế hướng đối tượng)
*   **3 Đặc trưng cốt lõi của OOSAD:**
    1.  **Dẫn dắt bởi ca sử dụng** (Use-case driven).
    2.  **Lấy kiến trúc làm trung tâm / Kiến trúc khung** (Architecture-centric / Khung nhìn kiến trúc).
    3.  **Lặp và tăng dần** (Iterative and incremental).
*   **Lưu ý khi thi:**
    *   Mô hình **MVC không phải là một đặc trưng cơ bản** của OOSAD (nó chỉ là mẫu thiết kế code).
    *   OOSAD **không sử dụng** phương pháp phân rã chức năng liên tục (Functional Decomposition - vốn là đặc trưng của phương pháp phân tích thiết kế cấu trúc truyền thống).

### Khung nhìn kiến trúc 4+1 (4+1 View Model)
*   Bao gồm 5 khung nhìn: **Ca sử dụng** (Use Case - ở trung tâm), **Logic** (Logical), **Tiến trình** (Process), **Triển khai/Phát triển** (Development/Implementation), và **Vật lý** (Physical).
*   **Từ khóa thi:** "Khung nhìn biểu đồ" **không phải** là một khung nhìn kiến trúc.

### Sơ đồ tuần tự (Sequence Diagram)
*   **Đường nét đứt thẳng đứng** dưới đối tượng biểu diễn **trục thời gian / thời gian sống** (Lifeline).
*   **Sơ đồ tuần tự mức hệ thống (System Sequence Diagram - SSD):** Mô tả hệ thống như một hộp đen (black box) để ghi chép các hoạt động sử dụng hệ thống của tác nhân (Actor), thể hiện tương tác bên ngoài.

### Phân loại Sự kiện (Event Types)
*   **Sự kiện ngoại (External Event):** Do tác nhân bên ngoài kích hoạt (ví dụ: Khách nhấn nút thanh toán).
*   **Sự kiện thời gian (Temporal Event):** Tự động kích hoạt theo thời gian (ví dụ: Hệ thống tự động gửi báo cáo lúc 23h59).
*   **Sự kiện trạng thái (State Event):** Kích hoạt khi điều kiện dữ liệu/trạng thái nội bộ của hệ thống thỏa mãn (ví dụ: *"Số lượng hàng trong kho đã giảm xuống dưới ngưỡng"*).

### Thiết kế theo hợp đồng (Design by Contract)
*   Đối tượng nhận có quyền từ chối thực hiện hành vi của thông điệp nếu **Tiền điều kiện (Precondition)** không được đối tượng gửi đáp ứng.

### Thiết kế Giao diện (UI/UX)
*   **Phương pháp đánh giá giao diện Theo kinh nghiệm (Heuristic Evaluation):** Đánh giá khả năng sử dụng bằng cách **đối chiếu thiết kế giao diện với các nguyên lý thiết kế và quy tắc tương tác** đã biết (ví dụ: 10 nguyên lý của Nielsen).
*   Biện pháp hạn chế lỗi nhập liệu hiệu quả nhất: **Kiểm tra dữ liệu nhập trực tiếp trên giao diện**, chỉ tiếp nhận dữ liệu thỏa mãn ràng buộc.

### Tầm quan trọng của thành phần lưu trữ cố định (Persistence Storage)
*   Dữ liệu trong RAM sẽ mất đi sau khi tắt máy/mất điện (volatile), trong khi dữ liệu nghiệp vụ của hệ thống thông tin cần được bảo tồn và duy trì lâu dài theo thời gian.

### Quan hệ hợp nhất trong sơ đồ gói (Package Merge - `<<merge>>`)
*   Thể hiện việc hợp nhất nội dung của gói đích (đầu mũi tên) vào gói nguồn. Các phần tử trùng tên và loại trong hai gói sẽ được hòa trộn và mở rộng.
*   **Lưu ý:** Ví dụ mượn sách thư viện (có kiến thức sách nhưng không được viết thêm trang mới) mô tả quan hệ Package Import (`<<import>>`), không phải Merge. Ký hiệu là `<<merge>>` (không phải `<<combine>>`).

### Ánh xạ cơ sở dữ liệu (Database Mapping)
*   Khi ánh xạ các liên kết từ biểu đồ lớp sang cơ sở dữ liệu quan hệ, liên kết 1-1 có thể gây ra vấn đề: **Dư thừa dữ liệu** (nhiều trường null nếu gộp) hoặc giảm **Hiệu năng** do JOIN (nếu tách).

### Ước lượng điểm ca sử dụng (Use Case Points - UCP)
*   Trong phương pháp UCP, việc **tăng nhân sự bán thời gian** (yếu tố môi trường E7) sẽ làm giảm năng suất tổng thể $\rightarrow$ **làm tăng thời gian phát triển hệ thống**.

### Mục đích chính của phát triển hệ thống thông tin
*   Mục tiêu tối thượng: **Giải quyết vấn đề của người dùng** và doanh nghiệp.

---

### 📝 Ghi chú bài tập tự luận thực tế (Các biểu đồ cụ thể)

#### 1. Máy trạng thái đơn hàng (State Machine Diagram) siêu thị điện máy:
*   Vòng đời trạng thái của đối tượng Đơn hàng:
    *   `Khởi tạo` (Đang lập phiếu mua hàng) $\rightarrow$ `Chờ thanh toán` (nhân viên hướng dẫn khách đến quầy) $\rightarrow$ `Đã thanh toán` (thu ngân lập hóa đơn và thu tiền).
    *   `Đã nhận hàng` (khách xuất trình hóa đơn tại kho và nhận hàng).
    *   `Hoàn tất / Đã giao hàng` (sau 3 ngày nhận hàng mà không có khiếu nại/trả hàng).
    *   `Đã hủy / Dừng mua` (khách dừng mua trong quá trình chọn hàng trước khi lập hóa đơn).
    *   `Đã trả hàng` (khách trả lại hàng trong vòng 3 ngày sau khi nhận hàng do không ưng ý).

#### 2. Biểu đồ hoạt động (Activity Diagram) với Luồng bơi (Swimlanes):
*   **Các luồng bơi:** Khách hàng, Tiếp tân, Nhân viên bán hàng, Thu ngân, Thủ kho, Nhân viên giao hàng.
*   **Trình tự hoạt động & Đối tượng nghiệp vụ:**
    *   `Khách hàng` vào siêu thị $\rightarrow$ `Tiếp tân` chào đón.
    *   `Khách hàng` tham quan $\rightarrow$ `Nhân viên bán hàng` tư vấn.
    *   `Khách hàng` chọn hàng $\rightarrow$ `Nhân viên bán hàng` giúp điền phiếu. *(Đối tượng nghiệp vụ: Phiếu mua hàng [Đang lập])*
    *   `Khách hàng` đến quầy $\rightarrow$ `Thu ngân` lập hóa đơn. *(Đối tượng nghiệp vụ: Hóa đơn [Đang lập])*
    *   `Thu ngân` thu tiền (Tiền mặt/Chuyển khoản/Thẻ) $\rightarrow$ in hóa đơn. *(Đối tượng nghiệp vụ: Hóa đơn [Đã thanh toán])*
    *   `Khách hàng` đến kho $\rightarrow$ `Thủ kho` xuất sản phẩm. *(Đối tượng nghiệp vụ: Sản phẩm [Đang kiểm tra])*
    *   `Khách hàng` tự mang về hoặc nhờ `Nhân viên giao hàng` giao về nhà.

#### 3. Biểu đồ triển khai (Deployment Diagram) siêu thị:
*   **Nút Client / Thiết bị người dùng (Client Devices):**
    *   *PC bán hàng (POS Client)* chứa `Phân hệ bán hàng`.
    *   *PC thanh toán (Payment Client)* chứa `Phân hệ thanh toán` (kết nối đầu đọc thẻ).
    *   *PC kho (Warehouse Client)* chứa `Phân hệ quản lý kho`.
    *   *Thiết bị di động giao hàng (Mobile Deliverer)* chứa `Phân hệ quản lý giao hàng` (kết nối 4G/Internet).
    *   *PC quản lý (Manager Client)* chứa `Phân hệ quản lý siêu thị`.
*   **Nút Máy chủ ứng dụng (Application Server Node):**
    *   Chứa thành phần `Hệ thống dịch vụ nghiệp vụ` xử lý các API/Request từ client.
*   **Nút Máy chủ cơ sở dữ liệu (Database Server Node):**
    *   Chứa `Cơ sở dữ liệu trung tâm` lưu trữ dữ liệu sản phẩm, hóa đơn, khách hàng. Kết nối qua cổng CSDL bảo mật với máy chủ ứng dụng.

#### 4. Mối quan hệ lớp học (Class & Object Diagram) trong gia đình:
*   **Mối liên kết:**
    *   `Học phần` (MaHP, TenHP) **1 - N** `Lớp học` (MaLop, ThoiGian, PhongHoc).
    *   `Giảng viên` (HoTen) **1 - N** hoặc **N - N** `Lớp học`.
    *   `Sinh viên` (HoTen, MSSV) **N - N** `Lớp học`.
    *   `Lớp học` **1 - 1** `Lớp thi` (NgayThi, KipThi).
    *   `Sinh viên` **N - N** `Lớp thi`.
*   **Đối tượng thực tế (Object Diagram):** Thể hiện các instance cụ thể có gạch chân (ví dụ: `sv1: SinhVien { HoTen = "Nguyen Van A", MSSV = "20210001" }`, liên kết cụ thể đến các instance `lh1: LopHoc`, `lt1: LopThi`, `gv1: GiangVien`, `hp1: HocPhan`).
