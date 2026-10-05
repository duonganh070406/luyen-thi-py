# 📘 CHƯƠNG 1: CHUỖI (SERIES)

---

## 1. KHÁI NIỆM VỀ CÁC LOẠI CHUỖI

### 1.1. Chuỗi tổng quát (Chuỗi số hạng dấu bất kỳ)
* **Dạng tổng quát:** $\sum_{n=1}^{\infty} u_n = u_1 + u_2 + u_3 + \dots$
    * $u_n$: Số hạng tổng quát thứ $n$, nhận giá trị thực hoặc phức, dấu có thể thay đổi tùy ý không theo quy luật cố định.
    * Đây là dạng bao quát nhất, mọi chuỗi số đều có thể quy về dạng này.
* **Tính chất đặc biệt:** Không đảm bảo tính đơn điệu của dãy tổng riêng $S_n$. Không thể áp dụng trực tiếp các tiêu chuẩn dựa trên so sánh độ lớn hoặc tích phân.
* **Hội tụ:** Điều kiện cần để hội tụ là $\lim_{n \to \infty} u_n = 0$. Tuy nhiên, điều kiện này chưa đủ. Chiến thuật tiêu chuẩn: xét chuỗi trị tuyệt đối $\sum_{n=1}^{\infty} |u_n|$ trước. Nếu $\sum |u_n|$ hội tụ thì chuỗi ban đầu **hội tụ tuyệt đối**. Nếu $\sum |u_n|$ phân kỳ, cần kiểm tra xem có đưa về dạng đan dấu hoặc dùng định nghĩa tổng riêng được không.
* **Lưu ý:** Khi gặp bài toán có dấu biến đổi phức tạp, đừng vội áp dụng công thức. Hãy thử nhóm số hạng liên tiếp, hoặc kiểm tra điều kiện cần $\lim u_n \neq 0$ để loại trừ nhanh các trường hợp phân kỳ rõ ràng.

### 1.2. Chuỗi số dương
* **Dạng tổng quát:** $\sum_{n=1}^{\infty} u_n$, với $u_n \ge 0, \forall n \in \mathbb{N}^*$.
    * $u_n$: Các số hạng không âm.
    * Thường xuất hiện sau khi lấy trị tuyệt đối của các chuỗi phức tạp.
* **Tính chất đặc biệt:** Dãy tổng riêng $S_N = \sum_{n=1}^{N} u_n$ là dãy tăng đơn điệu. Do đó, chuỗi số dương hội tụ khi và chỉ khi dãy $S_N$ bị chặn trên. Không tồn tại khái niệm bán hội tụ cho loại chuỗi này.
* **Hội tụ:** Hội tụ $\iff$ Dãy $S_N$ bị chặn trên. Trong thực hành, ta dùng 4 tiêu chuẩn cốt lõi: So sánh, Tích phân, D’Alembert, Cauchy. Nếu phân kỳ, tổng tiến tới $+\infty$.
* **Lưu ý:** Đây là "nền tảng" của chương. Hầu hết các tiêu chuẩn hội tụ mạnh nhất đều được xây dựng cho chuỗi dương. Khi xét một chuỗi bất kỳ, bước đầu tiên thường là đưa về chuỗi dương $|u_n|$ để kiểm tra tính hội tụ tuyệt đối.

### 1.3. Chuỗi đan dấu
* **Dạng tổng quát:** $\sum_{n=1}^{\infty} (-1)^{n} v_n$ hoặc $\sum_{n=1}^{\infty} (-1)^{n-1} v_n$, với $v_n > 0, \forall n$.
    * $v_n$: Phần giá trị dương của số hạng thứ $n$.
    * Dấu $+$ và $-$ xen kẽ đều đặn theo từng bước nhảy của $n$.
* **Tính chất đặc biệt:** Sự dao động dấu giúp các phần tổng riêng "triệt tiêu" lẫn nhau cục bộ, làm tăng đáng kể khả năng hội tụ so với chuỗi dương tương đương $\sum v_n$.
* **Hội tụ:** Xét theo **Tiêu chuẩn Leibniz**: Nếu $\lim_{n \to \infty} v_n = 0$ và dãy $v_n$ giảm đơn điệu ($v_{n+1} \le v_n, \forall n$), thì chuỗi hội tụ. Lưu ý: Chuỗi đan dấu có thể hội tụ nhưng không hội tụ tuyệt đối (gọi là bán hội tụ).
* **Lưu ý:** Sai lầm phổ biến nhất là chỉ kiểm tra $\lim v_n = 0$ mà bỏ qua tính đơn điệu giảm. Ví dụ: $v_n = \frac{2 + (-1)^n}{n}$ có $\lim v_n = 0$ và $v_n > 0$, nhưng dãy dao động (không giảm ngặt), **không áp dụng được Leibniz**. Luôn kiểm tra $v_{n+1} - v_n$ hoặc đạo hàm $f'(x)$ để xác nhận tính giảm.

### 1.4. Chuỗi hàm số
* **Dạng tổng quát:** $\sum_{n=1}^{\infty} u_n(x) = u_1(x) + u_2(x) + u_3(x) + \dots, \quad x \in D$.
    * $u_n(x)$: Các hàm số xác định trên miền $D \subseteq \mathbb{R}$.
    * $S_N(x) = \sum_{n=1}^N u_n(x)$: Tổng riêng thứ $N$, bản thân nó là một hàm số.
* **Tính chất đặc biệt:** Sự hội tụ không còn là một giá trị số cố định, mà phụ thuộc vào từng điểm $x$. Do đó, tồn tại hai khái niệm hội tụ: Hội tụ điểm (tại từng $x$ riêng lẻ) và Hội tụ đều (tốc độ hội tụ đồng nhất trên toàn miền $D$).
* **Hội tụ:** 
    * *Hội tụ điểm:* Với mỗi $x_0 \in D$ cố định, $\sum u_n(x_0)$ là chuỗi số hội tụ.
      > ⚠️ **Lưu ý:** Hội tụ điểm **không đảm bảo** bất kỳ tính chất giải tích nào (liên tục, đạo hàm, tích phân) cho hàm tổng $S(x)$, ngay cả khi các số hạng $u_n(x)$ đều có các tính chất đó.
    * *Hội tụ đều:* $\sup_{x \in D} |S(x) - S_N(x)| \to 0$ khi $N \to \infty$. Chỉ khi hội tụ đều, tính chất giải tích của từng số hạng mới được bảo toàn cho hàm tổng.
* **Hội tụ đều là "giấy phép" cho các phép toán giải tích:** Khi chuỗi hàm $\sum_{n=1}^{\infty} u_n(x)$ hội tụ đều về hàm tổng $S(x)$ trên miền $D$, ta có các tính chất quan trọng (tương tự như chuỗi lũy thừa):
    - **Tính liên tục:** Nếu các số hạng $u_n(x)$ liên tục trên $D$ thì hàm tổng $S(x)$ cũng liên tục trên $D$.
    - **Tính khả tích (Tích phân từng số hạng):** Ta có thể hoán đổi dấu tổng và dấu tích phân:
      $$ \int_a^b S(x) \, dx = \int_a^b \left( \sum_{n=1}^{\infty} u_n(x) \right) dx = \sum_{n=1}^{\infty} \left( \int_a^b u_n(x) \, dx \right) $$
    - **Tính khả vi (Đạo hàm từng số hạng):** Nếu chuỗi đạo hàm $\sum u_n'(x)$ cũng hội tụ đều thì:
      $$ S'(x) = \left( \sum_{n=1}^{\infty} u_n(x) \right)' = \sum_{n=1}^{\infty} u_n'(x) $$
* **Cách chứng minh (Weierstrass M-test):** Đây là công cụ mạnh nhất để "lấy giấy phép" hội tụ đều: Nếu tìm được chuỗi số dương $\sum M_n$ hội tụ sao cho $|u_n(x)| \le M_n, \forall x \in D$, thì $\sum u_n(x)$ hội tụ đều trên $D$.

### 1.5. Chuỗi lũy thừa (Power Series)
* **Dạng tổng quát:** $S(x) = \sum_{n=0}^{\infty} a_n (x - x_0)^n = a_0 + a_1(x-x_0) + a_2(x-x_0)^2 + \dots$
    * $x$: Biến số thực (hoặc phức).
    * $x_0$: Tâm của chuỗi lũy thừa (điểm cố định).
    * $a_n$: Các hệ số hằng số tương ứng với bậc $n$.
* **Tính chất đặc biệt:** Được coi là một "đa thức bậc vô hạn". Trong khoảng hội tụ, chuỗi này biểu diễn một hàm số giải tích (liên tục, khả vi vô hạn). Có thể đạo hàm và tích phân từng số hạng mà không làm thay đổi bán kính hội tụ $R$.
* **Bán kính hội tụ và Định lý Abel:**
    - **Bán kính hội tụ $R$** được tính bằng tiêu chuẩn D’Alembert hoặc Cauchy:
        * Nếu $|x - x_0| < R$: Chuỗi hội tụ tuyệt đối.
        * Nếu $|x - x_0| > R$: Chuỗi phân kỳ.
        * Nếu $|x - x_0| = R$: Trạng thái nghi ngờ, phải thay trực tiếp $x = x_0 \pm R$ vào để xét như một chuỗi số thông thường.
    - **Định lý Abel:** Nếu chuỗi lũy thừa hội tụ tại một đầu mút (ví dụ $x = x_0 + R$) thì nó hội tụ đều trên đoạn $[x_0, x_0 + R]$ và hàm tổng $S(x)$ liên tục trên đoạn đó.
* **Khai triển Maclaurin:** Khi tâm $x_0 = 0$, chuỗi lũy thừa trở thành chuỗi Maclaurin. Đây là công cụ cực mạnh để xấp xỉ các hàm phức tạp. Một số khai triển kinh điển cần thuộc lòng:
    * **Hàm mũ:** $e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!}$ (Hội tụ với mọi $x \in \mathbb{R}$).
    * **Hàm Sin:** $\sin x = \sum_{n=0}^{\infty} \frac{(-1)^n x^{2n+1}}{(2n+1)!}$ (Hội tụ với mọi $x \in \mathbb{R}$).
    * **Hàm Cos:** $\cos x = \sum_{n=0}^{\infty} \frac{(-1)^n x^{2n}}{(2n)!}$ (Hội tụ với mọi $x \in \mathbb{R}$).
    * **Hàm phân thức:** $\frac{1}{1-x} = \sum_{n=0}^{\infty} x^n$ (Hội tụ khi $|x| < 1$).
    * **Hàm Logarit:** $\ln(1-x) = -\sum_{n=1}^{\infty} \frac{x^n}{n}$ (Hội tụ khi $-1 \le x < 1$).
* **Các tính chất của chuỗi lũy thừa:**
    Giả sử $R > 0$ là bán kính hội tụ của chuỗi lũy thừa $S(x) = \displaystyle\sum_{n=0}^{\infty} a_n x^n$ (coi như tâm $x_0 = 0$) với $|x| < R$. Khi đó:
    - **Tính HT đều**: $S(x)$ hội tụ đều trên mọi đoạn $[a, b] \subset (-R, R)$.
    - **Tính liên tục**: $S(x)$ liên tục trên mọi đoạn $[a, b] \subset (-R, R)$.
    - **Tính khả tích**: $S(x)$ khả tích trên mọi đoạn $[a, b] \subset (-R, R)$ và  
    $$ \int_a^b S(x)\,dx = \int_a^b \left( \sum_{n=0}^{\infty} a_n x^n \right) dx = \sum_{n=0}^{\infty} \left( \int_a^b a_n x^n \, dx \right). $$
    - **Tính khả vi**: $S(x)$ khả vi trên mọi đoạn $[a, b] \subset (-R, R)$ và  
      $$S'(x) = \left( \sum_{n=0}^{\infty} a_n x^n \right)' = \sum_{n=1}^{\infty} (a_n x^n)'.$$
* **Lưu ý:**
    - 4 tính chất trên (liên tục, khả tích, khả vi, hội tụ đều) **chỉ đảm bảo đúng trong khoảng mở** $(-R, R)$ (tức là trên mọi đoạn $[a, b] \subset (-R, R)$).
    - **Tại hai đầu mút $x = \pm R$:**
        - **Tính liên tục:** Phụ thuộc vào việc chuỗi có hội tụ tại mút đó hay không. Dựa vào **Định lý Abel** (đã nêu ở trên), nếu chuỗi số thay trực tiếp tại mút (ví dụ $x = R$) mà hội tụ, thì hàm tổng $S(x)$ sẽ liên tục (từ bên trái) tại $x = R$. Ngược lại, nếu chuỗi phân kỳ tại mút, miền xác định không chứa mút đó nên không có tính liên tục.
        - **Khả vi:** Chuỗi gốc có thể hội tụ, nhưng chuỗi đạo hàm có thể phân kỳ do khi đạo hàm, hệ số biến thành $n a_n$ nên độ lớn thường tăng lên. Ví dụ:
            Chuỗi $\displaystyle\sum_{n=1}^{\infty} \frac{x^n}{n^2}$ hội tụ tại $x=1$, nhưng chuỗi đạo hàm $\displaystyle\sum_{n=1}^{\infty} \frac{x^{n-1}}{n}$ phân kỳ tại $x=1$ $\Rightarrow$ **Không mặc định** $S(x)$ khả vi tại biên; phải thay trực tiếp $x=\pm R$ vào chuỗi đạo hàm để xét.
        - **Khả tích:** Tích phân từng số hạng thường "cải thiện" hội tụ do hệ số bị chia thêm cho $n+1$, nên tính hội tụ thường được giữ hoặc cải thiện tại biên. Nhưng nếu cẩn thận vẫn thay thử $x=\pm R$ vào để kiểm tra mới có độ chính xác 100% được.
        - **Nói chung:** Đạo hàm làm hệ số lớn hơn $\Rightarrow$ dễ mất hội tụ. Tích phân làm hệ số nhỏ đi $\Rightarrow$ dễ giữ hoặc cải thiện hội tụ. Đây chỉ là xu hướng thường gặp, không phải kết luận tổng quát; tại biên vẫn phải xét riêng từng trường hợp.
    - **Hệ quả trắc nghiệm:** Mệnh đề *"Hàm tổng khả vi tại mọi điểm thuộc miền hội tụ"* thường là **SAI** nếu miền đó bao gồm cả đầu mút mà tại đó chuỗi đạo hàm phân kỳ.

### 1.6. Chuỗi Fourier (Fourier Series)

* **Dạng tổng quát:** $f(x) = a_0 + \sum_{n=1}^{\infty} \left( a_n \cos \frac{n\pi x}{L} + b_n \sin \frac{n\pi x}{L} \right)$
    * $f(x)$: Hàm số tuần hoàn cần khai triển.
    * $L$: **Nửa chu kỳ** của hàm số ($T = 2L$).
      > 💡 **Xác định L:** Nếu khai triển trên đoạn $[a, b]$, thì $L = \frac{b - a}{2}$.
    * **Các hệ số Fourier (tính trên một chu kỳ $[a, b]$ bất kỳ):**
        * $a_0 = \frac{1}{2L} \int_{a}^{b} f(x) \, dx$: Hệ số tự do, đặc trưng cho **giá trị trung bình** của hàm trên chu kỳ.
        * $a_n = \frac{1}{L} \int_{a}^{b} f(x) \cos \left( \frac{n\pi x}{L} \right) \, dx$: Hệ số thành phần **Cosine**.
        * $b_n = \frac{1}{L} \int_{a}^{b} f(x) \sin \left( \frac{n\pi x}{L} \right) \, dx$: Hệ số thành phần **Sine**.

* **Tính chất đặc biệt:** Biến đổi một hàm số (có thể không liên tục, có điểm gãy) từ miền thời gian/không gian sang miền tần số. Là nền tảng của Phân tích phổ (Spectral Analysis) và xử lý tín hiệu số.

* **Lưu ý quan trọng (Tối ưu hóa & Ứng dụng):**
    * **Tối ưu hóa tích phân (Hàm chẵn/lẻ trên đoạn đối xứng $[-L, L]$):**
      + Nếu $f(x)$ **chẵn** ($f(-x)=f(x)$): $b_n = 0$. Chỉ tính $a_0, a_n$ với công thức nhân đôi tích phân từ $0 \to L$. Chuỗi chỉ chứa $\cos$.
      + Nếu $f(x)$ **lẻ** ($f(-x)=-f(x)$): $a_0 = a_n = 0$. Chỉ tính $b_n$ với công thức nhân đôi tích phân từ $0 \to L$. Chuỗi chỉ chứa $\sin$.
    * **Đẳng thức Parseval (Bảo toàn năng lượng):**
      $\frac{1}{2L} \int_{-L}^{L} [f(x)]^2 \, dx = a_0^2 + \frac{1}{2} \sum_{n=1}^{\infty} (a_n^2 + b_n^2)$.
      > ⚠️ *Lưu ý quy ước:* Công thức trên áp dụng cho dạng $a_0 + \sum...$. Nếu tài liệu dùng dạng $\frac{a_0}{2} + \sum...$, vế phải sẽ là $\frac{a_0^2}{2} + \frac{1}{2}\sum(a_n^2+b_n^2)$. Bản chất vật lý vẫn là: Năng lượng toàn phần = Tổng năng lượng các thành phần tần số.
    * **Hiện tượng Gibbs:** Tại các điểm gián đoạn, tổng riêng chuỗi Fourier luôn bị "vọt lố" (overshoot) khoảng 9% giá trị bước nhảy, dù số hạng $N \to \infty$. Cần lưu ý khi dùng chuỗi Fourier để xấp xỉ hàm số có bước nhảy đột ngột (như sóng vuông).

* **Phân biệt Hội tụ điểm (Dirichlet) và Hội tụ đều của chuỗi Fourier hàm $f(x)$:**

| Tiêu chí | Hội tụ điểm (Định lý Dirichlet) | Hội tụ đều |
| --- | --- | --- |
| **Điều kiện hàm $f(x)$** | 1. Tuần hoàn chu kỳ $T=2L$ <br><br> 2. Đơn điệu từng khúc trên $[-L, L]$ <br><br> 3. Bị chặn trên $[-L, L]$ | 1. Liên tục trên $\mathbb{R}$ <br><br> 2. Trơn từng khúc <br><br> 3. Thỏa điều kiện nối biên: $f(-L) = f(L)$ |
| **Công thức hàm tổng $S(x)$** | $$S(x) = \begin{cases} f(x) & \text{tại điểm liên tục} \\ \frac{f(x^+) + f(x^-)}{2} & \text{tại điểm gián đoạn} \end{cases}$$ | $S(x) = f(x)$ trên toàn $\mathbb{R}$ (do hàm buộc phải liên tục tại mọi điểm) |
| **Tại điểm gián đoạn loại 1** | Hội tụ về trung bình cộng giới hạn trái/phải: $\frac{f(x^+) + f(x^-)}{2}$ | **KHÔNG** xảy ra hội tụ đều (nếu hàm đứt đoạn, sai số cực đại sẽ không thể tiến về 0). |
| **Hiện tượng đặc biệt** | Hội tụ tại từng điểm đơn lẻ, kể cả điểm nhảy. | Xuất hiện **hiện tượng Gibbs** tại lân cận các điểm gãy hoặc gián đoạn (tai sóng vọt lố ~9%). |
| **Tốc độ hội tụ** | Phụ thuộc vào vị trí $x$, thường rất chậm tại các vùng gần điểm gián đoạn. | Đồng nhất trên toàn miền: **Sai số lớn nhất** giữa $S(x)$ và $S_n(x)$ trên toàn miền tiến về 0. |
| **Mối quan hệ logic** | Là hệ quả yếu hơn: **Hội tụ đều $\Longrightarrow$ Hội tụ điểm.** | Là cấp độ mạnh hơn: **Hội tụ điểm $\not\Longrightarrow$ Hội tụ đều.** |
| **Bản chất cốt lõi** | Chỉ quan tâm đến kết quả tại từng vị trí $x$ riêng lẻ (nhìn vào từng điểm). | Quan tâm đến sai số trên toàn bộ đồ thị (nhìn vào tổng thể). |
| **Lưu ý chiều nghịch** | Có thể hội tụ tại mọi điểm (theo Dirichlet) nhưng **không** hội tụ đều (ví dụ: hàm có bước nhảy). | Chỉ cần đồ thị có một "vết đứt" (gián đoạn), tính hội tụ đều sẽ bị phá vỡ ngay lập tức. |

* **Tính liên tục, khả vi và khả tích của chuỗi Fourier:**
    * **Tính liên tục:** Hàm tổng $S(x)$ liên tục trên toàn $\mathbb{R}$ khi và chỉ khi chuỗi Fourier hội tụ đều. Điều này yêu cầu hàm $f(x)$ gốc phải liên tục, trơn từng khúc và thỏa mãn điều kiện nối biên $f(-L) = f(L)$. Nếu $f(x)$ có bước nhảy (gián đoạn), chuỗi sẽ không hội tụ đều và xuất hiện hiện tượng Gibbs.
    * **Tính khả tích (Tích phân từng số hạng):** Chuỗi Fourier của một hàm $f(x)$ khả tích trên $[-L, L]$ **luôn có thể được tích phân từng số hạng**. Chuỗi mới thu được sẽ hội tụ đều về tích phân của hàm $f(x)$, **kể cả khi chuỗi Fourier ban đầu hội tụ kém hoặc phân kỳ tại một số điểm**. Nguyên nhân: Tích phân sinh ra hệ số $\frac{1}{n}$, giúp "làm mượt" và tăng tốc độ hội tụ.
    * **Tính khả vi (Đạo hàm từng số hạng):** Cần cực kỳ cẩn trọng. Việc lấy đạo hàm sinh ra hệ số $n$ ở tử số, dễ phá vỡ tính hội tụ. Ta **chỉ được phép** đạo hàm từng số hạng của chuỗi Fourier khi:
        1. Hàm $f(x)$ liên tục trên toàn $\mathbb{R}$ (đặc biệt phải có $f(-L) = f(L)$).
        2. Đạo hàm $f'(x)$ tồn tại và trơn từng khúc.
        *(Nếu $f(x)$ có điểm gián đoạn, đạo hàm tại đó sẽ vọt lên vô cực, chuỗi đạo hàm không còn hội tụ theo nghĩa thông thường).*

---

## 2. KHÁI NIỆM VỀ CÁC TÍNH CHẤT

### 2.1. Điều kiện cần của hội tụ
- Nếu $\sum u_n$ hội tụ $\Rightarrow \lim_{n\to\infty} u_n = 0$.
- ⚠️ **Ngược lại KHÔNG đúng.** Ví dụ: $\sum \frac{1}{n}$ có $\lim \frac{1}{n}=0$ nhưng phân kỳ.
- ✅ **Ứng dụng nhanh:** Nếu $\lim u_n \neq 0$ → Chuỗi **phân kỳ** (dừng ngay, không cần dùng tiêu chuẩn khác).

### 2.2. Phân loại mức độ hội tụ

| Loại | Định nghĩa | Quan hệ & Tính chất |
|:---|:---|:---|
| **Hội tụ tuyệt đối** | $\sum \|u_n\|$ hội tụ | Mạnh nhất $\Rightarrow$ kéo theo hội tụ đơn. Cho phép đổi chỗ số hạng, nhân chuỗi an toàn. |
| **Hội tụ có điều kiện (bán hội tụ)** | $\sum u_n$ hội tụ nhưng $\sum \|u_n\|$ phân kỳ | Yếu nhất. Tổng có thể thay đổi tùy ý nếu đổi thứ tự số hạng (Định lý sắp xếp lại Riemann). |
| **Phân kỳ** | $\lim S_N$ không tồn tại hoặc bằng $\pm\infty$ | Không áp dụng được phép toán đại số vô hạn thông thường. |

### 2.3. Tính chất đại số của chuỗi
- Nếu $\sum u_n = A,\ \sum v_n = B$ cả hai đều hội tụ:
  - $\sum (c_1 u_n + c_2 v_n) = c_1 A + c_2 B$
  - ⚠️ **Phép nhân Cauchy:** $(\sum u_n)(\sum v_n) = \sum c_n$ với $c_n = \sum_{k=0}^n u_k v_{n-k}$. 
  - **Điều kiện:** Tích chuỗi này hội tụ về $AB$ **nếu ít nhất một trong hai chuỗi hội tụ tuyệt đối** (Định lý Mertens).

### 2.4. Chuỗi hàm: Hội tụ điểm vs Hội tụ đều

| Tiêu chí | Hội tụ điểm | Hội tụ đều |
|:---|:---|:---|
| **Định nghĩa** | Với mỗi $x_0 \in D$ cố định, chuỗi số $\sum u_n(x_0)$ hội tụ. | Sai số lớn nhất giữa tổng riêng $S_N(x)$ và hàm tổng $S(x)$ trên toàn miền $D$ tiến về 0 khi $N \to \infty$. <br>*(Nghĩa là tốc độ hội tụ đồng đều tại mọi điểm $x$)*. |
| **Bảo toàn tính chất** | Không đảm bảo tính liên tục, khả tích hay khả vi của hàm tổng. | ✅ Bảo toàn tính liên tục, khả tích và khả vi của hàm tổng. |
| **Công cụ kiểm tra** | Dùng các tiêu chuẩn chuỗi số thông thường tại từng điểm $x$. | **Weierstrass M-test** (xem Mục 3.6). |

### 2.5. Định lý sắp xếp lại Riemann & Tính bất biến
- **Định lý Riemann:** Cho chuỗi số thực $\sum u_n$ hội tụ.
    - *Trường hợp 1 (Hội tụ tuyệt đối):* Mọi phép hoán vị (thay đổi thứ tự) các số hạng đều bảo toàn tính hội tụ và **không làm thay đổi giá trị tổng**.
    - *Trường hợp 2 (Hội tụ có điều kiện - Bán hội tụ):* Với mọi $S \in \mathbb{R}$ (hoặc $S = \pm \infty$), luôn tồn tại một phép sắp xếp lại các số hạng sao cho chuỗi mới hội tụ về $S$ hoặc phân kỳ.
- **Tính bất biến đối với thay đổi hữu hạn số hạng:** Việc **thêm, bớt hoặc thay đổi vị trí một số hữu hạn** số hạng đầu tiên **không ảnh hưởng** đến tính hội tụ/phân kỳ của chuỗi và giá trị tổng (nếu chuỗi hội tụ).
    > 💡 **Lý do:** Giới hạn của dãy tổng riêng $\lim_{N\to\infty} S_N$ chỉ phụ thuộc vào "đuôi" của chuỗi ($n \to \infty$).

---

## 3. CÁC TIÊU CHUẨN XÉT SỰ HỘI TỤ

### 3.1. Các tiêu chuẩn xét sự hội tụ

| Tiêu chuẩn | Điều kiện áp dụng | Công thức / Limit | Kết luận |
| :--- | :--- | :--- | :--- |
| **So sánh giới hạn** | $u_n, v_n > 0$ | $L = \lim \frac{u_n}{v_n}$ | ➤ $L = k \in (0, +\infty)$: Cùng hội tụ hoặc cùng phân kỳ <br> ➤ $L = 0$: Nếu $\sum v_n$ hội tụ $\Rightarrow \sum u_n$ hội tụ <br> ➤ $L = +\infty$: Nếu $\sum v_n$ phân kỳ $\Rightarrow \sum u_n$ phân kỳ |
| **Tiêu chuẩn tích phân** | $u_n = f(n)$, $f(x)$ liên tục, dương, giảm trên $[k, \infty)$ | Xét $\int_k^{\infty} f(x) dx$ | Tích phân hội tụ $\iff$ chuỗi hội tụ. |
| **D’Alembert (Tỷ số)** | $u_n \neq 0$ | $L = \lim \left\lvert \frac{u_{n+1}}{u_n} \right\lvert$ | ➤ $L < 1$: **Hội tụ tuyệt đối** <br> ➤ $L > 1$: **Phân kỳ** <br> ➤ $L = 1$: **Không kết luận** |
| **Cauchy (Căn thức)** | $u_n$ bất kỳ | $L = \lim \sqrt[n]{\lvert u_n \rvert}$ | ➤ $L < 1$: **Hội tụ tuyệt đối** <br> ➤ $L > 1$: **Phân kỳ** <br> ➤ $L = 1$: **Không kết luận** <br> *(Mạnh hơn D'Alembert)* |
| **Leibniz (Đan dấu)** | $u_n = (-1)^n v_n, v_n > 0$ | 1. $\lim v_n = 0$ <br> 2. $v_{n+1} \le v_n$ (dãy giảm) | Thỏa mãn $\Rightarrow$ hội tụ. <br> - Nếu $\sum v_n$ hội tụ: **Hội tụ tuyệt đối**. <br> - Nếu $\sum v_n$ phân kỳ: **Bán hội tụ**. |
| **Weierstrass M-test** | Chuỗi hàm $\sum u_n(x)$ trên $D$ | Tìm $M_n > 0$ sao cho $\lvert u_n(x) \rvert \le M_n, \forall x \in D$ và $\sum M_n$ hội tụ  | Nếu $\sum M_n$ hội tụ $\Rightarrow \sum u_n(x)$ **hội tụ đều và tuyệt đối** trên $D$. |
| **Bán kính hội tụ $R$** | Chuỗi lũy thừa $\sum a_n(x-x_0)^n$ | $R = \lim \left\lvert \frac{a_n}{a_{n+1}} \right\rvert$ hoặc $R = \frac{1}{\lim \sqrt[n]{\lvert a_n \rvert}}$ | Hội tụ tuyệt đối khi $\lvert x-x_0 \rvert < R$. **Phải xét riêng 2 đầu mút** $x = x_0 \pm R$. |
| **Hệ số Fourier** | $f(x)$ tuần hoàn chu kỳ $2L$ ($L=\frac{b-a}{2}$) | $a_0 = \frac{1}{2L} \int_{a}^{b} f(x) dx$ <br> $a_n = \frac{1}{L} \int_{a}^{b} f(x) \cos \frac{n\pi x}{L} dx$ <br> $b_n = \frac{1}{L} \int_{a}^{b} f(x) \sin \frac{n\pi x}{L} dx$ | Chuỗi hội tụ về $f(x)$ tại điểm liên tục; về $\frac{f(x^+) + f(x^-)}{2}$ tại điểm gián đoạn. |

### 3.2. Các tiêu chuẩn ứng với từng loại chuỗi


| Loại chuỗi | Các tiêu chuẩn/Công cụ có thể sử dụng |
| :--- | :--- |
| **1. Chuỗi tổng quát** <br> (Dấu bất kỳ) | 1. **Điều kiện cần:** Kiểm tra $\lim u_n \neq 0$ để kết luận phân kỳ ngay. <br> 2. **Hội tụ tuyệt đối:** Xét chuỗi dương $\sum \lvert u_n \rvert$ bằng các tiêu chuẩn ở loại 2. <br> 3. **Định nghĩa:** Xét giới hạn dãy tổng riêng $S_N$. |
| **2. Chuỗi số dương** <br> ($u_n \ge 0$) | 1. **So sánh:** So sánh trực tiếp hoặc So sánh giới hạn (với chuỗi p-series $\sum \frac{1}{n^\alpha}$). <br> 2. **D'Alembert:** Khi có giai thừa $n!$ hoặc lũy thừa $a^n$. <br> 3. **Cauchy:** Khi có mũ toàn phần $(\dots)^n$. <br> 4. **Tích phân:** Khi $u_n$ có dạng hàm số dễ tính nguyên hàm. |
| **3. Chuỗi đan dấu** <br> ($\sum (-1)^n v_n$) | 1. **Tiêu chuẩn Leibniz:** Kiểm tra $\lim v_n = 0$ và tính đơn điệu giảm. <br> 2. **Hội tụ tuyệt đối:** Đưa về xét chuỗi dương $\sum v_n$. <br> 3. **Đánh giá sai số:** Dùng $\lvert S - S_N \rvert \le v_{N+1}$ để ước lượng tổng. |
| **4. Chuỗi hàm số** <br> ($\sum u_n(x)$) | 1. **Weierstrass M-test:** Tìm chuỗi số dương chặn trên $M_n$ để chứng minh hội tụ đều. <br> 2. **Hội tụ điểm:** Cố định $x$, áp dụng các tiêu chuẩn chuỗi số thông thường. <br> 3. **Định nghĩa:** Kiểm tra sai số $\lvert R_N(x) \rvert$ tiến về $0$ với tốc độ không phụ thuộc vào $x$. |
| **5. Chuỗi lũy thừa** <br> ($\sum a_n (x-x_0)^n$) | 1. **Bán kính hội tụ $R$:** Dùng D'Alembert hoặc Cauchy cho hệ số $a_n$. <br> 2. **Định lý Abel:** Xác định tính hội tụ đều trên các tập con đóng của khoảng hội tụ. <br> 3. **Đạo hàm/Tích phân từng số hạng:** Để tính tổng hoặc tìm khai triển mới. |
| **6. Chuỗi Fourier** <br> ($\sum a_n \cos + b_n \sin$) | 1. **Công thức hệ số Euler:** Tính $a_0, a_n, b_n$ qua tích phân trên một chu kỳ. <br> 2. **Định lý Dirichlet:** Xét tính hội tụ tại điểm liên tục và các điểm gián đoạn loại 1. <br> 3. **Parseval:** Sử dụng mối liên hệ năng lượng để tính tổng các chuỗi số đặc biệt. |

---

## 4. MẸO LỰA CHỌN CÁC TIÊU CHUẨN

### 4.1. Quy trình giải quyết bài toán
```text
BƯỚC 1: KIỂM TRA ĐIỀU KIỆN CẦN (Quick Check)
   └─ Tính L = lim u_n
       ├─ L ≠ 0 (hoặc không tồn tại) ──▶ Kết luận: PHÂN KỲ (Dừng bài)
       └─ L = 0 ──────────────────────▶ CHUYỂN BƯỚC 2

BƯỚC 2: NHẬN DẠNG & PHÂN NHÁNH CHIẾN THUẬT
   │
   ├─ Dạng Chuỗi Hàm / Chuỗi Lũy Thừa 
   │  ├─ Chuỗi lũy thừa ∑a_n(x-x0)^n ──▶ Tìm R ──▶ Xét khoảng ──▶ Xét mút 
   │  └─ Chuỗi hàm tổng quát ──────────▶ Dùng Weierstrass M-test (Hội tụ đều)
   │
   ├─ Dạng Chuỗi Số (Dương/Đan dấu/Bất kỳ) ------------------------------┘
   │  │
   │  ▼ [ƯU TIÊN]: Xét chuỗi trị tuyệt đối ∑|u_n| (Đưa về chuỗi dương)
   │    │
   │    ├─ Dùng các tiêu chuẩn: So sánh, D'Alembert, Cauchy, Tích phân
   │    │   └─ Nếu ∑|u_n| Hội tụ ──────▶ Kết luận: HỘI TỤ TUYỆT ĐỐI (Dừng bài)
   │    │
   │    └─ Nếu ∑|u_n| Phân kỳ ─────────▶ KIỂM TRA DẠNG ĐAN DẤU ∑(-1)^n.v_n
   │        │
   │        ├─ Thỏa mãn Leibniz (v_n giảm & lim v_n = 0) ──▶ BÁN HỘI TỤ
   │        └─ Không thỏa Leibniz (thường do lim v_n ≠ 0) ─▶ PHÂN KỲ
   │
   └─ Dạng Chuỗi lượng giác Fourier -------------------------------------┐
      └─ Xác định L ──▶ Xét Chẵn/Lẻ ──▶ Tính a0, an, bn ──▶ Xét hội tụ Dirichlet

BƯỚC 3: TRÌNH BÀY & KẾT LUẬN
   └─ Lưu ý ghi rõ tên tiêu chuẩn đã áp dụng (ví dụ: "Theo tiêu chuẩn D'Alembert...").
```

### 4.2. Mẹo lựa chọn tiêu chuẩn cho phù hợp với một số dạng bài toán

| Dấu hiệu nhận diện $u_n$  | 🎯 Tiêu chuẩn ưu tiên | 🛡 Tiêu chuẩn dự phòng | ⚠️ Lưu ý / Bẫy thường gặp |
|:---|:---|:---|:---|
| **Phân thức đa thức** $\frac{P(n)}{Q(n)}$ hoặc chứa căn $\sqrt{n}$ | **So sánh giới hạn** (với $\sum \frac{1}{n^\alpha}$) | So sánh trực tiếp | "Vũ khí" dùng nhiều nhất. Chỉ cần lấy bậc cao nhất của tử và mẫu chia cho nhau để tìm $\alpha$. Nếu $\alpha > 1$: hội tụ, $\alpha \le 1$: phân kỳ. |
| Chứa **$n!$**, **$a^n$**, tích nhiều thừa số | **D’Alembert** (Tỷ số) | Cauchy | Cứ thấy giai thừa là ưu tiên dùng. <br>⚠️ **Bẫy:** Nếu $\lim = 1$ thì tiêu chuẩn này vô dụng, phải chuyển sang So sánh hoặc Raabe. |
| Chứa **$(...)^n$**, **$n^n$**, toàn bộ biểu thức nằm dưới mũ | **Cauchy** (Căn thức) | D’Alembert | Căn bậc $n$ khử mũ rất nhanh. <br>⚠️ Cùng chung nhược điểm với D'Alembert: $\lim = 1$ là "tịt ngòi". |
| **Dạng tổng quát chứa Logarit:**<br>$u_n = \frac{1}{n^p (\ln n)^q}$<br>(Thường gặp khi D'Alembert/Cauchy ra 1) | **Tiêu chuẩn Tích phân** | So sánh trực tiếp (khó) | Chỉ dùng khi hàm $f(x)$ tương ứng thật sự dễ tính nguyên hàm.<br>⚠️ **Bắt buộc:** Phải chứng minh $f(x)$ liên tục, dương và **giảm ngặt** trên miền xét. |
| $u_n = (-1)^n b_n$ (**Chuỗi đan dấu**) | **Leibniz** | Xét chuỗi trị tuyệt đối trước | Đừng vội áp dụng Leibniz ngay. <br>1. Xét $\sum \lvert b_n \rvert$ trước.<br>2. Nếu $\sum \lvert b_n \rvert$ phân kỳ $\rightarrow$ Mới dùng Leibniz để kết luận **Hội tụ có điều kiện**. |
| Chuỗi hàm cần chứng minh **hội tụ đều** | **Weierstrass (M-test)** | Dùng định nghĩa | Phải tìm được dãy số $M_n$ sao cho:<br>$\lvert u_n(x) \rvert \le M_n$ với mọi $x$ thuộc miền xác định.<br>Và $\sum M_n$ phải là chuỗi số hội tụ.<br>*(Hiểu đơn giản: Tìm một "cái nắp" số học lớn hơn hàm số mà vẫn hội tụ)*. |
| **Chuỗi Fourier** | **Công thức hệ số + Chẵn/Lẻ** | (Không dùng tiêu chuẩn chuỗi số) | Luôn soi tính chẵn/lẻ trước khi làm.<br>- Hàm chẵn $\rightarrow b_n=0$.<br>- Hàm lẻ $\rightarrow a_0, a_n=0$. |
### 4.3. Các lỗi sai phổ biến 
1. ❌ Dùng D’Alembert/Cauchy cho chuỗi điều hòa $\sum \frac{1}{n^p}$ → Luôn ra $L=1$ → Không kết luận được.
2. ❌ Quên xét 2 đầu mút khi tìm miền hội tụ của chuỗi lũy thừa.
3. ❌ Áp dụng Leibniz khi $v_n$ không đơn điệu giảm.
4. ❌ Nhân hai chuỗi bán hội tụ rồi kết luận tích hội tụ (sai định lý Cauchy product).
5. ❌ Nhầm lẫn hội tụ điểm và hội tụ đều khi lấy đạo hàm/tích phân chuỗi hàm.

---

## 5. KỸ THUẬT TÍNH TỔNG CHUỖI & CÁC CÔNG THỨC CẦN NHỚ

### 5.1. Chuỗi hình học (Geometric Series)
* **Dạng tổng quát:** $\sum_{n=0}^{\infty} a q^n = a + aq + aq^2 + \dots$
    * $a$: Số hạng đầu tiên.
    * $q$: Công bội (ratio).
* **Điều kiện hội tụ:** Chuỗi hội tụ khi và chỉ khi $|q| < 1$.
* **Công thức tính tổng:** $S = \frac{a}{1 - q}$.
* **Lưu ý (Biến thể):**
    * Nếu tổng bắt đầu từ $n=1$: $\sum_{n=1}^{\infty} a q^{n-1} = \frac{a}{1-q}$.
    * Nếu tổng bắt đầu từ $n=k$: $\sum_{n=k}^{\infty} a q^n = \frac{a q^k}{1 - q}$.
    * ⚠️ **Bẫy:** Luôn kiểm tra xem số mũ của $q$ có khớp với chỉ số chạy $n$ không. Ví dụ: $\sum_{n=0}^{\infty} 2 \cdot 3^{n+1}$ thì số hạng đầu là $2 \cdot 3^1 = 6$, công bội $q=3$ (phân kỳ).

### 5.2. Chuỗi điều hòa suy rộng (p-series)
* **Dạng tổng quát:** $\sum_{n=1}^{\infty} \frac{1}{n^\alpha}$
    * $\alpha$: Số mũ thực.
* **Tính chất hội tụ/phân kỳ:**
    * Nếu $\alpha > 1$: Chuỗi **hội tụ**.
    * Nếu $\alpha \le 1$: Chuỗi **phân kỳ**.
* **Giá trị đặc biệt (Cần nhớ để ước lượng hoặc kiểm tra nhanh):**
    * $\alpha = 2$ (Chuỗi Basel): $\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}$.
    * $\alpha = 4$: $\sum_{n=1}^{\infty} \frac{1}{n^4} = \frac{\pi^4}{90}$.
    * $\alpha = 1$ (Chuỗi điều hòa): Phân kỳ về $+\infty$ (tăng rất chậm, xấp xỉ $\ln n$).
* **Lưu ý:** Đây là "thước đo chuẩn" để so sánh. Khi gặp bài toán phức tạp, hãy cố gắng quy về dạng $\frac{1}{n^\alpha}$ để kết luận nhanh tính hội tụ.

### 5.3. Phương pháp Telescoping (Chuỗi kính viễn vọng/triệt tiêu)
* **Ý tưởng cốt lõi:** Biến đổi số hạng tổng quát $u_n$ thành hiệu của hai số hạng liên tiếp: $u_n = f(n) - f(n-1)$ (hoặc $f(n) - f(n+1)$).
* **Cách tính tổng:**
    * Nếu tách $u_n = f(n) - f(n-1) \Rightarrow S_N = f(N) - f(0) \Rightarrow S = \lim_{N \to \infty} f(N) - f(0)$.
    * Nếu tách $u_n = f(n) - f(n+1) \Rightarrow S_N = f(1) - f(N+1) \Rightarrow S = f(1) - \lim_{N \to \infty} f(N+1)$.
* **Kỹ thuật hệ số bất định (Partial Fractions):**
    * Thường gặp dạng $\frac{1}{n(n+k)}$.
    * Phân tích: $\frac{1}{n(n+k)} = \frac{A}{n} + \frac{B}{n+k}$.
    * Ví dụ kinh điển: $\frac{1}{n(n+1)} = \frac{1}{n} - \frac{1}{n+1}$.
    * Khi cộng dồn: $(1 - \frac{1}{2}) + (\frac{1}{2} - \frac{1}{3}) + \dots + (\frac{1}{N} - \frac{1}{N+1}) = 1 - \frac{1}{N+1} \to 1$.
* **Lưu ý:** Kỹ thuật này cực mạnh nhưng đòi hỏi khả năng biến đổi đại số tốt. Hãy luôn thử phân tích mẫu số thành nhân tử trước.

### 5.4. Vận dụng khai triển Maclaurin/Taylor để tính tổng
* **Ý tưởng:** Nhận dạng chuỗi số cần tính tổng trùng với khai triển của một hàm số $f(x)$ tại một điểm $x_0$ cụ thể.
* **Quy trình:**
    1. Nhớ các khai triển chuẩn ($e^x, \sin x, \cos x, \ln(1+x), \frac{1}{1-x}$).
    2. So sánh cấu trúc số hạng $u_n$ với số hạng tổng quát trong khai triển.
    3. Xác định giá trị $x$ thay vào.
* **Ví dụ minh họa:**
    * Tính $S = \sum_{n=0}^{\infty} \frac{(-1)^n}{n!}$.
    * Nhìn thấy $n!$ ở mẫu và $(-1)^n$, ta liên tưởng đến khai triển $e^x = \sum \frac{x^n}{n!}$.
    * Thay $x = -1 \Rightarrow S = e^{-1} = \frac{1}{e}$.
    * Tính $S = \sum_{n=1}^{\infty} \frac{(-1)^{n-1}}{n}$.
    * Liên tưởng đến $\ln(1+x) = \sum \frac{(-1)^{n-1}x^n}{n}$.
    * Thay $x = 1 \Rightarrow S = \ln(2)$.
* **Lưu ý:** Phải đảm bảo giá trị $x$ thay vào nằm trong miền hội tụ của chuỗi lũy thừa đó.

### 5.5. Các công thức lượng giác & lượng giác ngược hữu ích
* **Công thức cơ bản (Thường dùng trong chuỗi Fourier hoặc rút gọn số hạng):**
    * $\sin(n\pi) = 0, \quad \forall n \in \mathbb{Z}$.
    * $\cos(n\pi) = (-1)^n, \quad \forall n \in \mathbb{Z}$.
    * $\sin(\frac{n\pi}{2}) = \begin{cases} 0 & n \text{ chẵn} \\ (-1)^{\frac{n-1}{2}} & n \text{ lẻ} \end{cases}$.
* **Công thức biến đổi tổng thành tích (Telescoping lượng giác):**
    * Đôi khi $u_n$ chứa hiệu các góc. Sử dụng công thức:
      $\arctan A - \arctan B = \arctan \left( \frac{A-B}{1+AB} \right)$.
    * **Ví dụ kinh điển:**
      $\arctan\left(\frac{(n+1) - n}{1 + n(n+1)}\right) = \arctan(n+1) - \arctan(n)$.
    * Áp dụng vào tính tổng: $\sum_{n=1}^{N} \arctan\left(\frac{1}{1+n(n+1)}\right) = \arctan(N+1) - \arctan(1)$.
    * Khi $N \to \infty$: $S = \frac{\pi}{2} - \frac{\pi}{4} = \frac{\pi}{4}$.
* **Lưu ý:** Khi gặp bài toán chứa $\arctan$ hoặc $\arcsin$ trong tổng, hãy nghĩ ngay đến việc tách thành hiệu để triệt tiêu (Telescoping).

### 5.6. Chuỗi Bertrand mở rộng (Logarithm Chain)
* **Dạng tổng quát:**
  $$ \sum_{n=N}^{\infty} \frac{1}{n \cdot \ln(n) \cdot \ln(\ln n) \dots [\ln_k(n)]^p} $$
  Trong đó $\ln_k(n)$ là logarit lồng nhau $k$ lần (ví dụ: $\ln_2(n) = \ln(\ln n)$), và $N$ đủ lớn để các mẫu số xác định dương.

* **Quy tắc hội tụ "Mắt xích quyết định":**
  Trạng thái hội tụ của toàn bộ chuỗi được quyết định bởi số mũ $p$ của thành phần logarit cuối cùng (hoặc thành phần đầu tiên có số mũ khác 1 khi xét từ trái sang phải):
  - **Hội tụ** khi và chỉ khi $p > 1$.
  - **Phân kỳ** khi và chỉ khi $p \le 1$.

* **Đặc điểm cần nhớ:**
  - Nếu tất cả các thành phần $n, \ln n, \ln(\ln n), \dots$ đều có số mũ bằng 1, chuỗi **LUÔN PHÂN KỲ**. Dù số hạng tiến về 0 rất chậm, tổng vẫn tiến tới vô cùng.
  - **Chỉ cần một mắt xích** bất kỳ trong chuỗi có số mũ $p > 1$, nó sẽ kéo toàn bộ chuỗi về **HỘI TỤ** ngay lập tức.

  ### 5.7. Công thức đạo hàm cấp cao (Dạng giới hạn sai phân)
* **Công thức:**
  $$f^{(n)}(x_0) = \lim_{h \to 0} \frac{\sum_{k=0}^{n} \left[ (-1)^{n-k} \binom{n}{k} f(x_0 + kh) \right]}{h^n}$$
* **Ý nghĩa:** 
    - Đây là cách biểu diễn đạo hàm cấp $n$ thông qua giới hạn của các **sai phân hữu hạn**.
    - Nó liên quan mật thiết đến hệ số $a_n = \frac{f^{(n)}(x_0)}{n!}$ trong chuỗi Taylor.
    - Công thức này thường được dùng trong giải tích số (Numerical Analysis) để xấp xỉ đạo hàm khi chỉ biết giá trị hàm số tại các điểm rời rạc.
* **Mẹo nhớ:** Tử số chính là khai triển của toán tử sai phân bậc $n$: $\Delta_h^n f(x_0) = (E-I)^n f(x_0)$, trong đó $E$ là toán tử dịch chuyển $f(x) \to f(x+h)$.
* **Hệ số Maclaurin ($a_k$):** Từ công thức trên, ta suy ra hệ số của $x^k$ trong khai triển Maclaurin ($x_0 = 0$) là:
  $$a_k = \frac{f^{(k)}(0)}{k!} = \lim_{h \to 0} \frac{\sum_{i=0}^{k} \left[ (-1)^{k-i} \binom{k}{i} f(ih) \right]}{k! \cdot h^k}$$

### 5.8. **Dạng bài: “Suy luận về hội tụ của chuỗi số khi thay đổi lũy thừa”**

Dạng bài yêu cầu xác định tính đúng/sai của các mệnh đề có dạng:

*“Nếu $\sum a_n^P$ hội tụ (tuyệt đối/bán hội tụ), thì $\sum a_n^Q$ có hội tụ không?”*

Với $P, Q > 0$, và dãy $\{a_n\}$ là dãy số thực bất kỳ (không nhất thiết dương).

| Giả thiết ban đầu | Hành động | Kết luận | Lý do |
| :--- | :--- | :--- | :--- |
| $\sum \|a_n\|^P$ hội tụ (Tuyệt đối) | Tăng mũ ($Q \ge P$) | ✅ **ĐÚNG** | Chuỗi bé hơn phải hội tụ. |
| $\sum \|a_n\|^P$ hội tụ (Tuyệt đối) | Giảm mũ ($Q < P$) | ❌ **SAI/KHÔNG CHẮC** | Chuỗi lớn hơn có thể phân kỳ. |
| $\sum a_n^P$ hội tụ (Điều kiện) | Tăng mũ ($Q > P$) |  ❌ **SAI/KHÔNG CHẮC** | Thiếu cơ sở tuyệt đối/dương. |
| $\sum a_n^P$ hội tụ (Điều kiện) | Giảm mũ ($Q < P$) | ❌ **KHÔNG CHẮC** | Rủi ro phân kỳ cao. |

### 5.9. **Kỹ thuật nhẩm nhanh hội tụ bằng khai triển Maclaurin**

Khi xét sự hội tụ của chuỗi $\sum f(u_n)$ với $u_n \to 0$ (thường $u_n$ có dạng $\frac{c}{n^\alpha}$), ta dùng khai triển Maclaurin. Một câu hỏi cốt lõi là: **Phải khai triển đến bậc mấy?**

**Nguyên tắc chung:**
* **Đối với chuỗi số DƯƠNG:** Chỉ cần khai triển đến **bậc khác 0 đầu tiên** (dùng tiêu chuẩn So sánh giới hạn).
* **Đối với chuỗi có DẤU BẤT KỲ (đan dấu,...):** Việc xấp xỉ bậc 1 là **KHÔNG ĐỦ** vì phần sai số (phần dư) có thể làm thay đổi hoàn toàn tính hội tụ. Ta **bắt buộc** phải khai triển cho đến khi phần dư $O(u_n^k)$ tạo thành một chuỗi **hội tụ tuyệt đối**.
   * *Nghĩa là:* Nếu $u_n \sim \frac{1}{n^\alpha}$, ta cần chọn bậc $k$ sao cho số mũ của phần dư thỏa mãn: $\alpha \cdot k > 1$.

**Các khai triển thường gặp và bậc tối thiểu hay dùng:**
(Giả sử ta cần phần dư đạt bậc $> 1$, thường với $u_n = \frac{(-1)^n}{\sqrt{n}}$ hoặc $\frac{1}{n^\alpha}$ với $\alpha \le 1$, ta phải xét đến bậc 2 hoặc 3):

| Hàm số $f(u_n)$ | Khai triển Maclaurin (Kèm phần dư) | Bậc tối thiểu | Lý do cần xét đến bậc này |
| :--- | :--- | :--- | :--- |
| $\sin(u_n)$ | $u_n - \frac{u_n^3}{6} + O(u_n^5)$ | **Bậc 3** | Hàm lẻ, khuyết bậc 2. Khai triển đến bậc 3 để đánh giá rõ phần dư. |
| $\cos(u_n) $ | $1 - \frac{u_n^2}{2} + \frac{u_n^4}{24} + O(u_n^6)$ | **Bậc 2** | Số hạng đầu tiên khác 0 đã là bậc 2, nên tự nhiên phải xét từ bậc 2. |
| $\tan(u_n)$ | $u_n + \frac{u_n^3}{3} + O(u_n^5)$ | **Bậc 3** | Hàm lẻ, khuyết bậc 2 (tương tự $\sin$). |
| $\arcsin(u_n)$ | $u_n + \frac{u_n^3}{6} + O(u_n^5)$ | **Bậc 3** | Hàm lẻ, khuyết bậc 2 (tương tự $\sin$). |
| $\arccos(u_n)$ | $\frac{\pi}{2} - u_n - \frac{u_n^3}{6} + O(u_n^5)$ | **Bậc 1** | Có hằng số tự do. Nếu triệt tiêu được $\frac{\pi}{2}$ thì xét tiếp bậc 3. |
| $\arctan(u_n)$ | $u_n - \frac{u_n^3}{3} + O(u_n^5)$ | **Bậc 3** | Hàm lẻ, khuyết bậc 2 (tương tự $\sin$). |
| $e^{u_n}$ | $1+ u_n + \frac{u_n^2}{2} + O(u_n^3)$ | **Bậc 2** | Bắt buộc để không bỏ sót $u_n^2$ (thành phần luôn dương dễ gây phân kỳ). |
| $\ln(1+u_n)$ | $u_n - \frac{u_n^2}{2} + O(u_n^3)$ | **Bậc 2** | Bắt buộc để không bỏ sót $u_n^2$ (thành phần luôn dương dễ gây phân kỳ). |
| $\frac{1}{1-u_n}$ | $1 + u_n + u_n^2 + O(u_n^3)$ | **Bậc 2** | Bắt buộc để không bỏ sót $u_n^2$ (thành phần luôn dương dễ gây phân kỳ). |

**Quy trình áp dụng:**
* **Thực hiện khai triển:** $f(u_n) = A \cdot u_n + B \cdot u_n^2 + O(u_n^3)$.
* **Tách chuỗi thành các tổng con:** $\sum f(u_n) = A \sum u_n + B \sum u_n^2 + \sum O(u_n^3)$.
* **Đánh giá từng thành phần:**
   - Phần $\sum u_n$: Thường xét bằng tiêu chuẩn Leibniz (nếu là chuỗi đan dấu).
   - Phần $\sum u_n^2$: Thường là chuỗi số dương, xét bằng tiêu chuẩn tích phân hoặc p-series.
   - Phần $\sum O(u_n^3)$: Phải hội tụ tuyệt đối.
* **Kết luận:** Nếu tất cả các phần hội tụ, chuỗi gốc hội tụ. Nếu có đúng 1 phần phân kỳ, chuỗi gốc phân kỳ.