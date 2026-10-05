# 📘 CHƯƠNG 3: PHƯƠNG PHÁP BIẾN ĐỔI LAPLACE (LAPLACE TRANSFORM)

---

## 1. KHÁI NIỆM VỀ BIẾN ĐỔI LAPLACE VÀ PHÉP BIẾN ĐỔI NGƯỢC

### 1.1. Phép biến đổi Laplace tổng quát
* **Định nghĩa:** Cho hàm $f(t)$ xác định trên nửa trục số không âm $[0, \infty)$ và liên tục từng khúc trên mọi đoạn hữu hạn. Phép biến đổi Laplace của $f(t)$, ký hiệu là $F(s) = \mathcal{L}\{f(t)\}(s)$, được định nghĩa bởi tích phân suy rộng:
  $$F(s) = \int_0^\infty e^{-st} f(t) dt$$
  Trong đó, $s$ là một biến số thực hoặc phức ($s = \sigma + i\omega$) nằm trong miền hội tụ của tích phân suy rộng.
* **Hàm Gamma ($\Gamma(\alpha)$):** Là một mở rộng của hàm giai thừa cho các số thực dương, định nghĩa bởi tích phân:
  $$\Gamma(\alpha) = \int_0^\infty e^{-z} z^{\alpha-1} dz \quad (\alpha > 0)$$
  * **Các tính chất đặc biệt để tính nhanh:**
    * $\Gamma(\alpha+1) = \alpha \Gamma(\alpha)$
    * $\Gamma(n+1) = n!$ với mọi $n \in \mathbb{N}$
    * $\Gamma\left(\frac{1}{2}\right) = \sqrt{\pi}$
  * **Ứng dụng:** Giúp tính biến đổi Laplace của hàm lũy thừa tổng quát $t^a$ với số mũ thực $a > -1$:
    $$\mathcal{L}\{t^a\} = \frac{\Gamma(a+1)}{s^{a+1}} \quad (s > 0)$$
* **Điều kiện tồn tại (Bị chặn mũ):** Hàm số $f(t)$ liên tục từng khúc trên $[0, \infty)$ và có tốc độ tăng không nhanh hơn hàm mũ, tức là tồn tại các hằng số $M \ge 0$ và $\alpha \ge 0$ sao cho:
  $$|f(t)| \le M e^{\alpha t} \quad \forall t \ge 0$$
  Khi đó, biến đổi Laplace $F(s)$ chắc chắn tồn tại (hội tụ tuyệt đối) với mọi $s > \alpha$.
* **Tính chất giới hạn ở vô cực (Điều kiện cần của ảnh):** Nếu $f(t)$ thỏa mãn điều kiện tồn tại trên, thì:
  $$\lim_{s \to \infty} F(s) = 0$$
  * **Hệ quả thực chiến:** Mọi hàm $F(s)$ mà $\lim_{s\to\infty} F(s) \neq 0$ (như $F(s) = s$, $F(s) = \frac{s}{s+1}$, hoặc đa thức) đều **không thể** là ảnh Laplace của bất kỳ hàm số thông thường nào trong miền thời gian.

---

### 1.2. Phép biến đổi Laplace ngược
* **Định nghĩa:** Nếu $F(s)$ là biến đổi Laplace của $f(t)$ (tức $F(s) = \mathcal{L}\{f(t)\}$), thì $f(t)$ được gọi là biến đổi Laplace ngược của $F(s)$, ký hiệu:
  $$f(t) = \mathcal{L}^{-1}\{F(s)\}(t)$$
* **Tính duy nhất (Định lý Lerch):** Nếu hai hàm $f(t)$ và $g(t)$ liên tục trên $[0, \infty)$ và có cùng biến đổi Laplace $F(s) = G(s)$ với $s > \alpha$, thì:
  $$f(t) = g(t) \quad \forall t \ge 0$$
  *(Nếu hàm số có các điểm gián đoạn cô lập, nghiệm ngược vẫn duy nhất tại tất cả các điểm liên tục)*.
* **Tính chất tuyến tính:**
  $$\mathcal{L}\{\alpha f(t) + \beta g(t)\} = \alpha \mathcal{L}\{f(t)\} + \beta \mathcal{L}\{g(t)\}$$
  $$\mathcal{L}^{-1}\{\alpha F(s) + \beta G(s)\} = \alpha \mathcal{L}^{-1}\{F(s)\} + \beta \mathcal{L}^{-1}\{G(s)\}$$

---

## 2. CÁC TÍNH CHẤT VÀ ĐỊNH LÝ TOÁN TỬ CỐT LÕI

### 2.1. Biến đổi Laplace của Đạo hàm và Tích phân
* **Biến đổi của Đạo hàm (Chìa khóa giải phương trình vi phân):**
  Giả sử $f(t)$ liên tục, trơn từng khúc và bị chặn mũ trên $[0, \infty)$:
  * **Đạo hàm cấp 1:**
    $$\mathcal{L}\{f'(t)\} = s \mathcal{L}\{f(t)\} - f(0)$$
  * **Đạo hàm cấp $n$ tổng quát:**
    $$\mathcal{L}\{f^{(n)}(t)\} = s^n \mathcal{L}\{f(t)\} - s^{n-1}f(0) - s^{n-2}f'(0) - \dots - f^{(n-1)}(0)$$
  * 💡 **Ý nghĩa:** Chuyển phép toán vi phân phức tạp trong miền thời gian $t$ thành các phép tính đại số nhân với $s$ và trừ đi các giá trị ban đầu trong miền Laplace.
* **Biến đổi của Tích phân:**
  Nếu $f(t)$ liên tục từng khúc và bị chặn mũ trên $[0, \infty)$, thì tích phân của nó có biến đổi Laplace là:
  $$\mathcal{L}\left\{ \int_0^t f(r) dr \right\} = \frac{\mathcal{L}\{f(t)\}}{s} = \frac{F(s)}{s}$$
  Tương đương với công thức biến đổi ngược:
  $$\mathcal{L}^{-1}\left\{ \frac{F(s)}{s} \right\} = \int_0^t \mathcal{L}^{-1}\{F(s)\}(r) dr$$
  * 💡 **Ý nghĩa:** Phép tích phân trong miền thời gian tương đương với phép chia cho $s$ trong miền Laplace.

---

### 2.2. Các định lý tịnh tiến (Shifting Theorems)
* **Định lý tịnh tiến thứ nhất (Dịch chuyển theo biến $s$):**
  Nếu $\mathcal{L}\{f(t)\} = F(s)$, thì với mọi hằng số $a \in \mathbb{R}$:
  $$\mathcal{L}\{e^{at} f(t)\} = F(s - a)$$
  $$\mathcal{L}^{-1}\{F(s - a)\} = e^{at} f(t)$$
  * 💡 **Mẹo nhận dạng:** Cứ thấy hàm mũ $e^{at}$ nhân với một hàm số trong miền thời gian thì tính Laplace của hàm số đó trước rồi thay thế toàn bộ $s$ bằng $(s - a)$.
* **Định lý tịnh tiến thứ hai (Dịch chuyển theo biến $t$ - Hàm trễ):**
  Sử dụng hàm bước nhảy đơn vị Heaviside $u(t - a)$ (bằng $0$ khi $t < a$ và bằng $1$ khi $t \ge a$):
  $$\mathcal{L}\{u(t - a) f(t - a)\} = e^{-as} F(s)$$
  $$\mathcal{L}^{-1}\{e^{-as} F(s)\} = u(t - a) f(t - a)$$
  * ⚠️ **Biến thể tính nhanh:** Nếu hàm không có dạng trễ sẵn $f(t-a)$ mà có dạng tổng quát $g(t)$, ta biến đổi:
    $$\mathcal{L}\{u(t-a) g(t)\} = e^{-as} \mathcal{L}\{g(t+a)\}$$

---

### 2.3. Tích chập (Convolution)
* **Định nghĩa:** Tích chập của hai hàm số $f(t)$ và $g(t)$ trên $[0, \infty)$ ký hiệu là $(f*g)(t)$ và được xác định bởi:
  $$(f*g)(t) = \int_0^t f(r) g(t - r) dr$$
  * **Các tính chất đại số:** Giao hoán ($f * g = g * f$), kết hợp, phân phối.
* **Định lý tích chập:**
  $$\mathcal{L}\{(f * g)(t)\} = \mathcal{L}\{f(t)\} \cdot \mathcal{L}\{g(t)\} = F(s) \cdot G(s)$$
  $$\mathcal{L}^{-1}\{F(s) \cdot G(s)\} = (f * g)(t) = \int_0^t f(r) g(t-r) dr$$
  * 💡 **Ý nghĩa:** Phép nhân đại số hai ảnh trong miền Laplace tương đương với phép tích chập của hai hàm gốc trong miền thời gian. Đây là vũ khí cực mạnh để tìm Laplace ngược của tích hai phân thức mà không cần tách phân số đơn giản.

---

### 2.4. Đạo hàm và Tích phân của phép biến đổi
* **Đạo hàm của ảnh (Nhân thêm $t^n$):**
  $$\mathcal{L}\{t^n f(t)\} = (-1)^n \frac{d^n}{ds^n} F(s) = (-1)^n F^{(n)}(s)$$
  $$\mathcal{L}^{-1}\{F^{(n)}(s)\} = (-1)^n t^n f(t) \Rightarrow \mathcal{L}^{-1}\{F(s)\} = -\frac{1}{t} \mathcal{L}^{-1}\{F'(s)\}$$
  * 💡 **Ý nghĩa:** Nhân với $t^n$ trong miền thời gian tương đương với lấy đạo hàm cấp $n$ trong miền Laplace rồi nhân thêm $(-1)^n$.
* **Tích phân của ảnh (Chia cho $t$):**
  Nếu tồn tại giới hạn hữu hạn $\lim_{t \to 0^+} \frac{f(t)}{t}$, thì:
  $$\mathcal{L}\left\{ \frac{f(t)}{t} \right\} = \int_s^\infty F(\lambda) d\lambda$$
  $$\mathcal{L}^{-1}\left\{ \int_s^\infty F(\lambda) d\lambda \right\} = \frac{f(t)}{t}$$

---

## 3. BẢNG TỔNG HỢP CÁC CÔNG THỨC BIẾN ĐỔI LAPLACE

### 3.1. Bảng tra cứu các cặp biến đổi Laplace cơ bản

| Hàm gốc $f(t)$ | Ảnh Laplace $F(s) = \mathcal{L}\{f(t)\}$ | Miền hội tụ $s$ |
| :--- | :--- | :--- |
| $1$ | $\frac{1}{s}$ | $s > 0$ |
| $t^n \quad (n \in \mathbb{N})$ | $\frac{n!}{s^{n+1}}$ | $s > 0$ |
| $t^a \quad (a > -1)$ | $\frac{\Gamma(a+1)}{s^{a+1}}$ | $s > 0$ |
| $e^{at}$ | $\frac{1}{s - a}$ | $s > a$ |
| $\sin(kt)$ | $\frac{k}{s^2 + k^2}$ | $s > 0$ |
| $\cos(kt)$ | $\frac{s}{s^2 + k^2}$ | $s > 0$ |
| $\sinh(kt)$ | $\frac{k}{s^2 - k^2}$ | $s > \lvert k \rvert$ |
| $\cosh(kt)$ | $\frac{s}{s^2 - k^2}$ | $s > \lvert k \rvert$ |
| $t e^{at}$ | $\frac{1}{(s - a)^2}$ | $s > a$ |
| $t^n e^{at}$ | $\frac{n!}{(s - a)^{n+1}}$ | $s > a$ |
| $e^{at} \sin(kt)$ | $\frac{k}{(s - a)^2 + k^2}$ | $s > a$ |
| $e^{at} \cos(kt)$ | $\frac{s - a}{(s - a)^2 + k^2}$ | $s > a$ |
| $t \sin(kt)$ | $\frac{2ks}{(s^2 + k^2)^2}$ | $s > 0$ |
| $t \cos(kt)$ | $\frac{s^2 - k^2}{(s^2 + k^2)^2}$ | $s > 0$ |

---

### 3.2. Bảng các tính chất toán tử của phép biến đổi Laplace

| Tính chất | Miền thời gian $f(t)$ | Miền Laplace $F(s)$ |
| :--- | :--- | :--- |
| **Tuyến tính** | $\alpha f(t) + \beta g(t)$ | $\alpha F(s) + \beta G(s)$ |
| **Tịnh tiến s** | $e^{at} f(t)$ | $F(s - a)$ |
| **Tịnh tiến t (Hàm trễ)** | $u(t - a) f(t - a)$ | $e^{-as} F(s)$ |
| **Đạo hàm cấp 1** | $f'(t)$ | $s F(s) - f(0)$ |
| **Đạo hàm cấp 2** | $f''(t)$ | $s^2 F(s) - s f(0) - f'(0)$ |
| **Đạo hàm cấp $n$** | $f^{(n)}(t)$ | $s^n F(s) - s^{n-1}f(0) - \dots - f^{(n-1)}(0)$ |
| **Tích phân** | $\int_0^t f(r) dr$ | $\frac{F(s)}{s}$ |
| **Nhân thêm $t$** | $t f(t)$ | $-F'(s)$ |
| **Nhân thêm $t^n$** | $t^n f(t)$ | $(-1)^n F^{(n)}(s)$ |
| **Chia cho $t$** | $\frac{f(t)}{t}$ | $\int_s^\infty F(\lambda) d\lambda$ |
| **Tích chập** | $(f * g)(t) = \int_0^t f(r)g(t-r)dr$ | $F(s) \cdot G(s)$ |

---

## 4. QUY TRÌNH VÀ MẸO NHẬN DẠNG NHANH

### 4.1. Bản đồ quy trình giải bài toán Cauchy bằng phép biến đổi Laplace
```text
         [ BÀI TOÁN CAUCHY TRONG MIỀN THỜI GIAN (t) ]
         (Phương trình vi phân + Các điều kiện ban đầu)
                              │
                              │  Áp dụng phép biến đổi Laplace (L)
                              ▼  lên cả hai vế phương trình
       [ PHƯƠNG TRÌNH ĐẠI SỐ TRONG MIỀN TẦN SỐ (s) ]
         (Chứa hàm ảnh X(s), các biến s và hằng số)
                              │
                              │  Giải phương trình đại số để cô lập
                              ▼  tìm biểu thức của ảnh X(s)
              [ BIỂU THỨC ẢNH CẦN TÌM X(s) ]
         (Thường là phân thức hữu tỷ hoặc chứa e^(-as))
                              │
                              │  Sử dụng các phương pháp tìm ngược:
                              │  - Tách phân thức đơn giản (Quy tắc bậc 1, bậc 2)
                              │  - Áp dụng các định lý tịnh tiến s, t
                              ▼  - Sử dụng định lý tích chập hoặc đạo hàm ảnh
          [ NGHIỆM X(t) CỦA PHƯƠNG TRÌNH BAN ĐẦU ]
```

---

### 4.2. Mẹo thực chiến và các "bẫy" kinh điển trong phòng thi

| Dạng toán / Biểu thức gặp phải | 🎯 Chiến thuật ưu tiên | 🛡 Công cụ dự phòng | ⚠️ Bẫy thường gặp / Cách xử lý |
| :--- | :--- | :--- | :--- |
| Tìm Laplace ngược của phân thức hữu tỷ $\frac{P(s)}{Q(s)}$ có mẫu số vô nghiệm | **Đưa về bình phương thiếu** để dùng tịnh tiến $s$: $(s-a)^2 + b^2$ | Phân tích hệ số phức (Không nên dùng vì phức tạp) | ⚠️ **Bẫy:** Quên biến đổi tử số tương ứng với lượng dịch chuyển ở mẫu. <br>💡 **Mẹo:** Nếu mẫu có $(s-a)^2$, tử số có $As+B$ thì bắt buộc phải viết thành $A(s-a) + (B + Aa)$ rồi mới lấy Laplace ngược. |
| Hàm vế phải phương trình cho bởi nhiều công thức trên các khoảng khác nhau | **Biểu diễn qua hàm Heaviside $u(t-a)$** trước khi lấy Laplace | Tích phân trực tiếp theo từng đoạn (Rất lâu) | ⚠️ **Bẫy:** Viết sai công thức hàm Heaviside ghép. <br>💡 **Mẹo ghép nhanh:** Nếu $g(t) = \begin{cases} g_1(t) & 0 \le t < a \\ g_2(t) & t \ge a \end{cases}$, công thức tổng quát là: $g(t) = g_1(t) + u(t-a)[g_2(t) - g_1(t)]$. |
| Cần tìm Laplace ngược của ảnh chứa hàm mũ $e^{-as}$ dạng $e^{-as} H(s)$ | **Định lý tịnh tiến thứ hai (Dịch chuyển $t$)** | Định nghĩa tích phân suy rộng | ⚠️ **Bẫy:** Tìm ra hàm $h(t) = \mathcal{L}^{-1}\{H(s)\}$ rồi kết luận nghiệm là $h(t-a)$ mà quên nhân thêm $u(t-a)$. <br>💡 **Mẹo:** Luôn luôn ghi $u(t-a) h(t-a)$ để không bao giờ bị trừ điểm. |
| Giải phương trình vi phân có điều kiện ban đầu tại điểm khác $0$ (ví dụ $t_0 \neq 0$) | **Đổi biến số độc lập** trước khi giải: đặt $\tau = t - t_0$ | Dùng công thức đạo hàm Laplace tổng quát (Dễ sai) | ⚠️ **Bẫy:** Công thức đạo hàm Laplace mặc định các giá trị ban đầu phải tại $t = 0$. Nếu áp dụng trực tiếp giá trị tại $t_0 \neq 0$ vào công thức đạo hàm thông thường sẽ dẫn đến kết quả sai hoàn toàn. |
| Tìm Laplace ngược của hàm số chứa các phép toán $\ln$ hoặc $\arctan$ | **Định lý đạo hàm của ảnh:** $f(t) = -\frac{1}{t} \mathcal{L}^{-1}\{F'(s)\}$ | Định lý tích phân của ảnh | 💡 **Mẹo:** Đạo hàm của các hàm này sẽ khử hoàn toàn $\ln$ và $\arctan$ để đưa về dạng phân thức hữu tỷ rất dễ tìm biến đổi ngược. Sau khi tìm ngược xong chỉ cần chia cho $-t$ là ra kết quả cuối cùng. |
| Mẫu số của ảnh chứa các thừa số trùng lặp dạng bậc hai bậc cao $(s^2+k^2)^2$ | **Định lý tích chập** hoặc **Công thức biến đổi ngược đặc biệt** | Phân tích phân thức bậc hai bậc cao (Rất dài) | 💡 **Mẹo tính nhanh:** Nhớ hai công thức đặc biệt thu được từ đạo hàm ảnh: <br>$\mathcal{L}^{-1}\left\{ \frac{s}{(s^2+k^2)^2} \right\} = \frac{t}{2k} \sin(kt)$ và $\mathcal{L}^{-1}\left\{ \frac{1}{(s^2+k^2)^2} \right\} = \frac{1}{2k^3} (\sin kt - kt\cos kt)$. |

---

## 5. KỸ THUẬT NÂNG CAO & CÁC CÔNG THỨC TÍNH NHANH

### 5.1. Kỹ thuật che (Heaviside Cover-up Method) - Phân tích phân thức siêu tốc
Khi phân tích một phân thức thực sự $\frac{P(s)}{Q(s)}$ có mẫu số $Q(s)$ có các nghiệm thực đơn phân biệt:
$$F(s) = \frac{P(s)}{(s-a_1)(s-a_2)\dots(s-a_n)} = \frac{A_1}{s-a_1} + \frac{A_2}{s-a_2} + \dots + \frac{A_n}{s-a_n}$$
Ta có thể tính trực tiếp và nhanh chóng các hệ số $A_i$ bằng cách **"che"** thừa số $(s-a_i)$ ở vế trái và thay thế $s = a_i$ vào phần còn lại:
$$A_i = \left. \frac{P(s)}{(s-a_1)\dots \text{[Che } (s-a_i)] \dots (s-a_n)} \right|_{s = a_i}$$
* **Ví dụ áp dụng:** Phân tích $F(s) = \frac{s+2}{s(s+3)(s-2)}$:
  * Tính $A$ (ứng với $s=0$): Che $s$ ở mẫu $\Rightarrow A = \left. \frac{s+2}{(s+3)(s-2)} \right|_{s=0} = \frac{2}{3 \cdot (-2)} = -\frac{1}{3}$.
  * Tính $B$ (ứng với $s=-3$): Che $(s+3)$ ở mẫu $\Rightarrow B = \left. \frac{s+2}{s(s-2)} \right|_{s=-3} = \frac{-1}{-3 \cdot (-5)} = -\frac{1}{15}$.
  * Tính $C$ (ứng với $s=2$): Che $(s-2)$ ở mẫu $\Rightarrow C = \left. \frac{s+2}{s(s+3)} \right|_{s=2} = \frac{4}{2 \cdot 5} = \frac{2}{5}$.
  * **Kết quả ngay lập tức:** $F(s) = -\frac{1}{3s} - \frac{1}{15(s+3)} + \frac{2}{5(s-2)}$. Tiết kiệm ít nhất 3 phút làm bài so với phương pháp đồng nhất hệ số thông thường!

---

### 5.2. Công thức tổng quát cho tích chập với hàm mũ (Tính nhanh tích chập)
Trong các bài thi, ta thường gặp phép tích chập của một hàm số bất kỳ $f(t)$ với hàm mũ $e^{at}$, hoặc tích chập hai hàm mũ $e^{at} * e^{bt}$. Ta có các công thức tính nhanh tích phân cực kỳ hữu ích:
* **Tích chập hai hàm mũ khác cơ số:**
  $$e^{at} * e^{bt} = \frac{e^{at} - e^{bt}}{a - b} \quad (a \neq b)$$
* **Tích chập hai hàm mũ cùng cơ số (trường hợp giới hạn khi $b \to a$):**
  $$e^{at} * e^{at} = t e^{at}$$
* **Công thức tổng quát:**
  $$\mathcal{L}^{-1}\left\{ \frac{F(s)}{s - a} \right\} = f(t) * e^{at} = e^{at} \int_0^t f(r) e^{-ar} dr$$

---

### 5.3. Kỹ thuật giải PTVP hệ số biến đổi cấp cao (Hệ số đa thức bậc nhất)
Nếu phương trình vi phân có dạng chứa biến $t$ ở hệ số:
$$t x''(t) + p(t)x'(t) + q(t)x(t) = 0$$
Do tính chất đạo hàm của ảnh $\mathcal{L}\{t f(t)\} = -X'(s)$, khi lấy biến đổi Laplace hai vế, các số hạng chứa $t x''$ và $t x'$ sẽ chuyển thành đạo hàm của ảnh $X'(s)$.
* **Quy trình giải:**
  1. Lấy Laplace hai vế, sử dụng:
     $$\mathcal{L}\{t x'\} = - \frac{d}{ds} [s X(s) - x(0)] = -X(s) - s X'(s)$$
     $$\mathcal{L}\{t x''\} = - \frac{d}{ds} [s^2 X(s) - s x(0) - x'(0)] = -2s X(s) - s^2 X'(s)$$
  2. Gom các số hạng để đưa về phương trình vi phân cấp 1 đối với ảnh $X(s)$ (thường có dạng phân ly biến số hoặc tuyến tính cấp 1).
  3. Giải phương trình cấp 1 này tìm ra ảnh $X(s) = \frac{C}{H(s)}$.
  4. Lấy Laplace ngược của $X(s)$ để thu được nghiệm $x(t)$.
* 💡 **Ưu điểm:** Biến đổi một phương trình vi phân cấp 2 hệ số biến đổi cực kỳ khó giải trong miền thời gian thành một phương trình vi phân cấp 1 cực kỳ dễ giải trong miền Laplace.
