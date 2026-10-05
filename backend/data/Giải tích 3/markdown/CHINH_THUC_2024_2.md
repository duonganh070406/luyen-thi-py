# Câu 1 ABC TEST thôi
- **id:** 1
- **type:** single
- **question:** Đạo hàm của $f(x) = \ln(x)$ là gì?
- **options:**
  - $\frac{1}{x}$
  - $-\frac{1}{x}$
  - $e^x$
  - $\ln(x)$
- **answer:** 0
- **explanation:** Công thức cơ bản: $(\ln x)' = 1/x$ với $x > 0$.<br>Lưu ý: Điều kiện xác định là $x > 0$.<br>Công thức này áp dụng cho logarit tự nhiên.

---
# Câu 2
- **id:** 2
- **type:** multiple
- **question:** Mệnh đề nào đúng về tích phân?
- **options:**
  - Tích phân một tổng = tổng các tích phân
  - Tích phân từ a đến a = 0
  - Tích phân không phụ thuộc biến số lấy tích phân, chỉ phụ thuộc cận
  - Tích phân luôn dương
- **answer:** [0, 1, 2]
- **explanation:** Ba mệnh đề đầu là tính chất cơ bản của tích phân xác định.<br>Mệnh đề cuối sai vì tích phân có thể âm, dương hoặc bằng 0 tùy thuộc vào hàm số và cận lấy tích phân.

---
# Câu 3
- **id:** 3
- **type:** essay
- **question:** Phát biểu định lý Newton-Leibniz.
- **options:**
- **answer:** Nếu $F(x)$ là một nguyên hàm của hàm số liên tục $f(x)$ trên đoạn $[a, b]$ thì:<br>$$ \int_a^b f(x)dx = F(b) - F(a) $$
- **explanation:** Định lý Newton-Leibniz thiết lập mối liên hệ quan trọng giữa đạo hàm và tích phân xác định, cho phép tính tích phân thông qua nguyên hàm.

---
# Câu 4
- **id:** 4
- **type:** short_answer
- **question:** Tìm bán kính hội tụ $R$ của chuỗi lũy thừa $\sum_{n=1}^{\infty} \frac{x^n}{n \cdot 3^n}$.
- **answer:** 3
- **explanation:** Sử dụng tiêu chuẩn D'Alembert hoặc Cauchy cho chuỗi lũy thừa:<br>$\lim_{n \to \infty} \left| \frac{a_{n+1}}{a_n} \right| = \lim_{n \to \infty} \frac{n \cdot 3^n}{(n+1) \cdot 3^{n+1}} = \frac{1}{3}$.<br>Suy ra bán kính hội tụ $R = 3$.

---
# Câu 5
- **id:** 5
- **type:** single
- **question:** Hãy nối các phương trình vi phân sau với cấp tương ứng của chúng:<br>1) $y'' + 3y' + 2y = 0$<br>2) $y' - y^2 = x$<br>3) $y''' + y = e^x$<br>Thứ tự cấp của các phương trình 1), 2), 3) lần lượt là:
- **options:**
  - 2, 1, 3
  - 1, 2, 3
  - 2, 3, 1
  - 3, 2, 1
- **answer:** 0
- **explanation:** Cấp của phương trình vi phân là cấp cao nhất của đạo hàm có mặt trong phương trình:<br>- Phương trình 1) chứa đạo hàm cấp hai $y''$ $\rightarrow$ cấp 2.<br>- Phương trình 2) chứa đạo hàm cấp một $y'$ $\rightarrow$ cấp 1.<br>- Phương trình 3) chứa đạo hàm cấp ba $y'''$ $\rightarrow$ cấp 3.<br>Do đó thứ tự đúng là 2, 1, 3.

---
# Câu 6
- **id:** 6
- **type:** matching
- **question:** Ghép các chuỗi sau với tính chất hội tụ tương ứng của chúng:
- **options:**
  - L: $\sum_{n=1}^{\infty} \frac{1}{n^2}$
  - L: $\sum_{n=1}^{\infty} \frac{1}{n}$
  - L: $\sum_{n=1}^{\infty} (-1)^n \frac{1}{n}$
  - R: Phân kỳ
  - R: Hội tụ tuyệt đối
  - R: Bán hội tụ
- **answer:** [1, 0, 2]
- **explanation:** - Chuỗi thứ nhất là chuỗi Riemann với $p=2 > 1$, do đó hội tụ tuyệt đối (chỉ số 1).<br>- Chuỗi thứ hai là chuỗi điều hòa, phân kỳ (chỉ số 0).<br>- Chuỗi thứ ba là chuỗi đan dấu hội tụ theo Leibniz nhưng chuỗi trị tuyệt đối phân kỳ, do đó bán hội tụ (chỉ số 2).
