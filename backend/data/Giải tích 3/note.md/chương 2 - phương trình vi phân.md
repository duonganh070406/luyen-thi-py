# 📘 CHƯƠNG 2: PHƯƠNG TRÌNH VI PHÂN (DIFFERENTIAL EQUATIONS)

---

## 1. KHÁI NIỆM VỀ CÁC LOẠI PHƯƠNG TRÌNH VI PHÂN VÀ NGHIỆM

### 1.1. Đại cương về Phương trình vi phân (PTVP)
* **Dạng tổng quát:** $F\left(x, y, y', y'', \dots, y^{(n)}\right) = 0$ hoặc dạng tường minh cấp $n$: $y^{(n)} = f\left(x, y, y', \dots, y^{(n-1)}\right)$.
    * $x$: Biến số độc lập.
    * $y = y(x)$: Hàm số phải tìm.
    * $y', y'', \dots, y^{(n)}$: Các đạo hàm từ cấp 1 đến cấp $n$ của hàm số $y$ theo $x$.
* **Cấp của phương trình:** Là cấp cao nhất của đạo hàm của hàm số $y$ xuất hiện trong phương trình.
* **Nghiệm của PTVP:** 
    * **Nghiệm tổng quát (TQ):** Là họ hàm số $y = g(x, C_1, C_2, \dots, C_n)$ phụ thuộc vào $n$ hằng số tùy ý độc lập $C_1, \dots, C_n$ (với $n$ là cấp của phương trình) thỏa mãn phương trình vi phân.
    * **Tích phân tổng quát:** Nghiệm tổng quát được biểu diễn dưới dạng ẩn $\Phi(x, y, C_1, C_2, \dots, C_n) = 0$.
    * **Nghiệm riêng:** Là một nghiệm cụ thể $y = g(x, C_1^0, C_2^0, \dots, C_n^0)$ thu được từ nghiệm tổng quát khi ta gán cho các hằng số $C_i$ các giá trị xác định $C_i^0$ nhằm thỏa mãn một điều kiện ban đầu cho trước.
    * **Nghiệm kì dị:** Là nghiệm thỏa mãn phương trình vi phân nhưng **không nằm trong họ nghiệm tổng quát** (không thể thu được bằng cách chọn giá trị cụ thể cho các hằng số $C_i$). Tại mỗi điểm của nghiệm kì dị, tính duy nhất nghiệm của bài toán Cauchy bị vi phạm.
* **Lưu ý:** Sự xuất hiện của nghiệm kì dị thường liên quan đến các điểm mà tại đó đạo hàm riêng của vế phải theo $y$ tiến ra vô cùng hoặc không liên tục. Luôn cẩn thận kiểm tra các giá trị bị triệt tiêu khi thực hiện chia hai vế trong quá trình giải.

---

### 1.2. Phương trình vi phân cấp 1
PTVP cấp 1 có dạng tổng quát $F(x, y, y') = 0$ hoặc dạng tường minh $y' = f(x, y)$.

#### a. Các phương trình khuyết cấp 1
* **Khuyết $y$ ($F(x, y') = 0$):**
    * *Dạng giải được theo $y'$:* $y' = f(x) \Rightarrow y = \int f(x) dx + C$.
    * *Dạng giải được theo $x$:* $x = f(y')$. Phương pháp giải là đặt tham số $y' = t \Rightarrow x = f(t)$. Khi đó:
      $$dy = y' dx = t \cdot d(f(t)) = t f'(t) dt \Rightarrow y = \int t f'(t) dt + C$$
      Nghiệm tổng quát viết dưới dạng tham số: $\begin{cases} x = f(t) \\ y = \int t f'(t) dt + C \end{cases}$
    * 📝 **Ví dụ tiêu biểu:** Giải phương trình vi phân $y'^2 - y' - x + 2 = 0$.
      * *Lời giải:*
        Đặt tham số $y' = t$, phương trình trở thành $x = t^2 - t + 2$. Ta có:
        $$dy = y' dx = t \cdot d(t^2 - t + 2) = t(2t - 1) dt = (2t^2 - t) dt$$
        Tích phân hai vế ta thu được:
        $$y = \int (2t^2 - t) dt = \frac{2}{3} t^3 - \frac{1}{2} t^2 + C$$
        Vậy nghiệm tổng quát dạng tham số của phương trình là:
        $$\begin{cases} x = t^2 - t + 2 \\ y = \frac{2}{3} t^3 - \frac{1}{2} t^2 + C \end{cases}$$
* **Khuyết $x$ ($F(y, y') = 0$):**
    * *Dạng giải được theo $y'$:* $y' = f(y) \Rightarrow \frac{dy}{dx} = f(y) \Rightarrow dx = \frac{dy}{f(y)} \Rightarrow x = \int \frac{dy}{f(y)} + C$.
    * *Dạng giải được theo $y$:* $y = f(y')$. Phương pháp giải là đặt tham số $y' = t \Rightarrow y = f(t)$. Khi đó:
      $$dy = y' dx \Rightarrow dx = \frac{dy}{y'} = \frac{d(f(t))}{t} = \frac{f'(t)}{t} dt \Rightarrow x = \int \frac{f'(t)}{t} dt + C$$
      Nghiệm tổng quát viết dưới dạng tham số: $\begin{cases} x = \int \frac{f'(t)}{t} dt + C \\ y = f(t) \end{cases}$
    * 📝 **Ví dụ tiêu biểu:** Giải phương trình vi phân $y'^2 + y^2 = 4$.
      * *Lời giải:*
        * **Cách 1 (Tích phân trực tiếp):** Phương trình tương đương với $y' = \pm\sqrt{4-y^2}$.
          - Xét $4 - y^2 = 0 \Rightarrow y = \pm 2$. Thay trực tiếp vào phương trình thấy thỏa mãn, đây là các nghiệm riêng đặc biệt (nghiệm kì dị).
          - Xét $y \neq \pm 2$, ta tách biến:
            $$\frac{dy}{\pm\sqrt{4-y^2}} = dx \Rightarrow \pm \int \frac{dy}{\sqrt{4-y^2}} = \int dx \Rightarrow \pm \arcsin\left(\frac{y}{2}\right) = x - C$$
            Vậy nghiệm tổng quát là: $x = \pm \arcsin\left(\frac{y}{2}\right) + C$ và hai nghiệm kì dị $y = \pm 2$.
        * **Cách 2 (Tham số hóa):** Đặt $y = 2\sin t$ và $y' = 2\cos t$. Ta có:
          $$dx = \frac{dy}{y'} = \frac{d(2\sin t)}{2\cos t} = \frac{2\cos t dt}{2\cos t} = dt \Rightarrow x = t + C$$
          Vậy nghiệm tổng quát dạng tham số là: $\begin{cases} x = t + C \\ y = 2\sin t \end{cases}$

---

#### b. Các dạng phương trình vi phân cấp 1 điển hình
* **Phương trình phân ly biến số:** Dạng $h(y) dy = g(x) dx$ hoặc $y' = g(x)h(y)$.
    * *Phương pháp:* Tách hoàn toàn biến $x$ về một vế, biến $y$ về vế còn lại rồi lấy tích phân hai vế:
      $$\int h(y) dy = \int g(x) dx + C$$
    * ⚠️ **Bẫy nghiệm kì dị:** Khi chia hai vế cho $h(y)$, ta phải xét riêng trường hợp $h(y) = 0$. Nếu tồn tại $y_0$ sao cho $h(y_0) = 0$, thì $y = y_0$ là một nghiệm của phương trình.
    * 📝 **Ví dụ tiêu biểu:** Giải phương trình vi phân $y' = 1 + x + y + xy$.
      * *Lời giải:*
        Ta biến đổi vế phải của phương trình thành dạng tích:
        $$\frac{dy}{dx} = (1+x)(1+y)$$
        - Xét $1 + y = 0 \Rightarrow y = -1$. Thế vào phương trình ta thấy thỏa mãn vì cả hai vế đều bằng $0$. Do đó $y = -1$ là một nghiệm của phương trình.
        - Xét $y \neq -1$, ta thực hiện phân ly biến số bằng cách chia cả hai vế cho $1+y$:
          $$\frac{dy}{1+y} = (1+x)dx \Rightarrow \int \frac{dy}{1+y} = \int (1+x)dx \Rightarrow \ln|y+1| = x + \frac{x^2}{2} + C_0$$
          Mũ hóa hai vế ta được: $|y+1| = e^{C_0} \cdot e^{x + \frac{x^2}{2}} \Rightarrow y + 1 = C e^{x + \frac{x^2}{2}} \quad (\text{với } C = \pm e^{C_0})$.
        Vậy nghiệm tổng quát của phương trình là: $y = C e^{x + \frac{x^2}{2}} - 1 \quad (C \in \mathbb{R})$.
        *(Lưu ý: Nghiệm riêng $y = -1$ tương ứng với trường hợp hằng số $C = 0$)*.
* **Phương trình đẳng cấp cấp 1 (Thuần nhất bậc nhất):** Dạng $y' = f\left(\frac{y}{x}\right)$.
    * *Dấu hiệu nhận biết:* Hàm vế phải $f(x,y)$ là hàm số thuần nhất bậc không: $f(kx, ky) = k^n f(x, y)$ với $n = 0$ (tức là $f(kx, ky) = f(x, y)$).
    * *Phương pháp:* Đặt ẩn phụ $u = \frac{y}{x} \Rightarrow y = u \cdot x \Rightarrow y' = u' x + u$. Thay vào phương trình ta được:
      $$u' x + u = f(u) \Rightarrow x \frac{du}{dx} = f(u) - u \Rightarrow \frac{du}{f(u) - u} = \frac{dx}{x} \quad (\text{Phân ly biến số})$$
    * 📝 **Ví dụ tiêu biểu:** Giải phương trình vi phân $y' = \frac{4x^2 + 3y^2}{2xy}$.
      * *Lời giải:*
        Chia cả tử và mẫu của vế phải cho $x^2$, ta được:
        $$y' = \frac{4 + 3\left(\frac{y}{x}\right)^2}{2\left(\frac{y}{x}\right)}$$
        Đặt $u = \frac{y}{x} \Rightarrow y = ux \Rightarrow y' = u'x + u$. Thế vào phương trình ta được:
        $$u'x + u = \frac{4+3u^2}{2u} \Rightarrow x \frac{du}{dx} = \frac{4+3u^2}{2u} - u = \frac{4+u^2}{2u}$$
        Tách biến và lấy tích phân hai vế:
        $$\frac{2u}{u^2+4} du = \frac{dx}{x} \Rightarrow \int \frac{2u}{u^2+4} du = \int \frac{dx}{x} \Rightarrow \ln(u^2+4) = \ln|x| + \ln|C|$$
        $$\Rightarrow u^2 + 4 = Cx \Rightarrow \frac{y^2}{x^2} + 4 = Cx \Rightarrow y^2 = (Cx - 4)x^2$$
        Vậy nghiệm tổng quát dưới dạng ẩn là: $y^2 - (Cx - 4)x^2 = 0$.
* **Phương trình tuyến tính cấp 1:** Dạng $y' + p(x)y = q(x)$.
    * *Tính chất:* Tuyến tính bậc nhất đối với hàm phải tìm $y$ và đạo hàm $y'$.
    * *Phương pháp giải:* 
        1. **Cách 1 (Biến thiên hằng số Lagrange):** Tìm nghiệm của phương trình thuần nhất $y' + p(x)y = 0 \Rightarrow y = C e^{-\int p(x) dx}$. Coi $C = C(x)$ là hàm số, thế ngược vào tìm $C(x)$.
        2. **Cách 2 (Thừa số tích phân):** Nhân cả hai vế với thừa số tích phân $\mu(x) = e^{\int p(x) dx}$.
    * *Công thức nghiệm tổng quát cần thuộc lòng:*
      $$y = e^{-\int p(x) dx} \left( \int q(x) e^{\int p(x) dx} dx + C \right)$$
    * 📝 **Ví dụ tiêu biểu:** Giải bài toán Cauchy: $y' - y = \frac{e^x}{x}$ với $y(1) = e$.
      * *Lời giải:*
        Đây là phương trình vi phân tuyến tính cấp 1 có $p(x) = -1$ và $q(x) = \frac{e^x}{x}$.
        Áp dụng công thức nghiệm tổng quát:
        $$y = e^{-\int (-1) dx} \left( \int \frac{e^x}{x} e^{\int (-1) dx} dx + K \right) = e^x \left( \int \frac{e^x}{x} e^{-x} dx + K \right)$$
        $$y = e^x \left( \int \frac{1}{x} dx + K \right) = e^x (\ln|x| + K)$$
        Thay điều kiện ban đầu $y(1) = e$ vào họ nghiệm trên:
        $$e = e^1 (\ln|1| + K) \Rightarrow e = e \cdot K \Rightarrow K = 1$$
        Vậy nghiệm riêng duy nhất thỏa mãn bài toán Cauchy là: $y = e^x (1 + \ln|x|)$.
* **Phương trình Bernoulli:** Dạng $y' + p(x)y = q(x)y^\alpha$ (với $\alpha \neq 0$ và $\alpha \neq 1$).
    * *Phương pháp:* 
        1. Chia cả hai vế cho $y^\alpha \Rightarrow y^{-\alpha}y' + p(x)y^{1-\alpha} = q(x)$.
        2. Đặt ẩn phụ $u = y^{1-\alpha} \Rightarrow u' = (1-\alpha)y^{-\alpha}y'$.
        3. Thế vào thu được phương trình tuyến tính cấp 1 đối với $u$:
           $$u' + (1-\alpha)p(x)u = (1-\alpha)q(x)$$
    * ⚠️ **Bẫy:** Nếu $\alpha > 0$, hàm số $y = 0$ luôn là một nghiệm của phương trình. Khi kết luận nghiệm tổng quát, phải nêu rõ nghiệm này nếu ta đã chia cho $y^\alpha$.
    * 📝 **Ví dụ tiêu biểu:** Giải phương trình vi phân $y' + \frac{x}{1-x^2}y = x y^{1/2}$.
      * *Lời giải:*
        Đây là phương trình Bernoulli với $\alpha = \frac{1}{2} > 0 \Rightarrow y = 0$ là một nghiệm riêng của phương trình.
        Xét $y > 0$, chia cả hai vế cho $y^{1/2}$:
        $$y^{-1/2} y' + \frac{x}{1-x^2} y^{1/2} = x \quad (1)$$
        Đặt ẩn phụ $u = y^{1/2} \Rightarrow u' = \frac{1}{2} y^{-1/2} y' \Rightarrow y^{-1/2} y' = 2u'$. Thay vào (1) ta được:
        $$2u' + \frac{x}{1-x^2} u = x \Rightarrow u' + \frac{x}{2(1-x^2)} u = \frac{x}{2} \quad (2)$$
        Đây là phương trình tuyến tính đối với $u$ với $p(x) = \frac{x}{2(1-x^2)}$ và $q(x) = \frac{x}{2}$.
        Tìm thừa số tích phân hoặc áp dụng công thức nghiệm tổng quát cho (2):
        $$u = K e^{-\int \frac{x}{2(1-x^2)} dx} + e^{-\int \frac{x}{2(1-x^2)} dx} \int \frac{x}{2} e^{\int \frac{x}{2(1-x^2)} dx} dx$$
        Ta có $\int \frac{x}{2(1-x^2)} dx = -\frac{1}{4} \ln|1-x^2| \Rightarrow e^{\int \frac{x}{2(1-x^2)} dx} = |1-x^2|^{-1/4}$.
        Tính toán nguyên hàm, ta thu được:
        $$u = K \sqrt[4]{|x^2-1|} + \frac{1}{3}(x^2-1)$$
        Thay ngược $u = \sqrt{y}$, ta có nghiệm tổng quát và nghiệm riêng là:
        $$\sqrt{y} = K \sqrt[4]{|x^2-1|} + \frac{1}{3}(x^2-1) \quad \text{và} \quad y = 0$$
* **Phương trình vi phân toàn phần:** Dạng $P(x, y)dx + Q(x, y)dy = 0$ với điều kiện:
  $$\frac{\partial P}{\partial y} = \frac{\partial Q}{\partial x}$$
    * *Ý nghĩa:* Vế trái của phương trình chính là vi phân toàn phần của một hàm số $u(x,y)$, tức là $du = Pdx + Qdy = 0$. Nghiệm tổng quát của phương trình dưới dạng ẩn là:
      $$u(x, y) = C$$
    * *Phương pháp tìm hàm $u(x,y)$:*
        - **Cách 1 (Tích phân đường cong):** Chọn điểm gốc $(x_0, y_0)$ thích hợp (thường là $(0,0)$ hoặc $(1,1)$ nằm trong miền liên tục của $P, Q$), ta có tích phân xác định hàm $u(x,y)$:
          $$u(x, y) = \int_{x_0}^{x} P(t, y) dt + \int_{y_0}^{y} Q(x_0, t) dt = C$$
          hoặc đổi vai trò:
          $$u(x, y) = \int_{x_0}^{x} P(t, y_0) dt + \int_{y_0}^{y} Q(x, t) dt = C$$
        - **Cách 2 (Tìm nguyên hàm từng phần):** Giải hệ phương trình đạo hàm riêng:
          $$\begin{cases} \frac{\partial u}{\partial x} = P(x, y) \Rightarrow u(x,y) = \int P(x,y) dx + \varphi(y) \\ \frac{\partial u}{\partial y} = Q(x, y) \Rightarrow \frac{\partial}{\partial y} \left[ \int P(x,y) dx \right] + \varphi'(y) = Q(x,y) \Rightarrow \text{Tìm } \varphi(y) \end{cases}$$
    * 📝 **Ví dụ tiêu biểu:** Giải phương trình vi phân $e^{-y} dx + (1 - x e^{-y}) dy = 0$.
      * *Lời giải:*
        Ta có $P(x,y) = e^{-y}$ và $Q(x,y) = 1 - x e^{-y}$.
        Kiểm tra điều kiện vi phân toàn phần:
        $$\frac{\partial P}{\partial y} = -e^{-y}, \quad \frac{\partial Q}{\partial x} = -e^{-y} \Rightarrow \frac{\partial P}{\partial y} = \frac{\partial Q}{\partial x}$$
        Do đó, phương trình đã cho là phương trình vi phân toàn phần. 
        Chọn điểm gốc $(x_0, y_0) = (0, 0)$ nằm trong miền liên tục. Áp dụng công thức tích phân đường:
        $$u(x,y) = \int_0^x P(t, 0) dt + \int_0^y Q(x, t) dt = C$$
        $$u(x,y) = \int_0^x e^{0} dt + \int_0^y (1 - x e^{-t}) dt = C$$
        $$u(x,y) = \left. t \right|_0^x + \left. (t + x e^{-t}) \right|_0^y = C$$
        $$u(x,y) = x + y + x e^{-y} - x = C \Rightarrow y + x e^{-y} = C$$
        Vậy nghiệm tổng quát của phương trình dưới dạng ẩn là: $y + x e^{-y} - C = 0$.
* **Phương trình dùng thừa số tích phân:** Dạng $P(x,y)dx + Q(x,y)dy = 0$ nhưng $\frac{\partial P}{\partial y} \neq \frac{\partial Q}{\partial x}$.
    * *Ý nghĩa:* Ta cần tìm một thừa số tích phân $h(x,y)$ sao cho sau khi nhân vào phương trình, ta thu được phương trình vi phân toàn phần:
      $$\frac{\partial (h P)}{\partial y} = \frac{\partial (h Q)}{\partial x}$$
    * *Hai trường hợp đặc biệt thường gặp trong phòng thi:*
        1. Nếu biểu thức $\frac{\frac{\partial P}{\partial y} - \frac{\partial Q}{\partial x}}{Q} = f(x)$ (chỉ phụ thuộc vào $x$), khi đó thừa số tích phân $h(x)$ chỉ phụ thuộc vào $x$:
           $$h(x) = e^{\int f(x) dx}$$
        2. Nếu biểu thức $\frac{\frac{\partial P}{\partial y} - \frac{\partial Q}{\partial x}}{P} = g(y)$ (chỉ phụ thuộc vào $y$), khi đó thừa số tích phân $h(y)$ chỉ phụ thuộc vào $y$:
           $$h(y) = e^{-\int g(y) dy}$$
    * 📝 **Ví dụ tiêu biểu:** Giải phương trình vi phân $(e^{2x} - y^2) dx + y dy = 0$.
      * *Lời giải:*
        Ta có $P(x,y) = e^{2x} - y^2$ và $Q(x,y) = y$.
        Kiểm tra tính toàn phần:
        $$\frac{\partial P}{\partial y} = -2y, \quad \frac{\partial Q}{\partial x} = 0 \Rightarrow \frac{\partial P}{\partial y} \neq \frac{\partial Q}{\partial x}$$
        Phương trình không phải là vi phân toàn phần. Ta tìm thừa số tích phân bằng cách tính tỉ số:
        $$\frac{\frac{\partial P}{\partial y} - \frac{\partial Q}{\partial x}}{Q} = \frac{-2y - 0}{y} = -2 = f(x) \quad (\text{chỉ phụ thuộc vào } x)$$
        Do đó, thừa số tích phân cần tìm chỉ phụ thuộc vào $x$:
        $$h(x) = e^{\int f(x)dx} = e^{\int -2 dx} = e^{-2x}$$
        Nhân cả hai vế của phương trình ban đầu với $h(x) = e^{-2x}$, ta thu được:
        $$(1 - e^{-2x}y^2) dx + e^{-2x}y dy = 0$$
        Đây là phương trình vi phân toàn phần mới có $P^* = 1 - e^{-2x}y^2$ và $Q^* = e^{-2x}y$.
        Chọn điểm gốc $(x_0, y_0) = (0, 0)$. Nghiệm tổng quát của phương trình là:
        $$u(x,y) = \int_0^x P^*(t, 0) dt + \int_0^y Q^*(x, t) dt = C$$
        $$u(x,y) = \int_0^x 1 dt + \int_0^y e^{-2x}t dt = C \Rightarrow x + \frac{e^{-2x}y^2}{2} = C$$
        Vậy nghiệm tổng quát dạng ẩn của phương trình là: $x + \frac{e^{-2x}y^2}{2} - C = 0$.

---

### 1.3. Phương trình vi phân cấp 2
PTVP cấp 2 có dạng tổng quát $F(x, y, y', y'') = 0$ hoặc dạng tường minh $y'' = f(x, y, y')$.

#### a. Các phương trình khuyết cấp 2 (Phương pháp hạ cấp)
* **Khuyết cả $y$ và $y'$ ($F(x, y'') = 0$):**
    * Đưa trực tiếp về dạng $y'' = f(x)$. Lấy tích phân liên tiếp hai lần:
      $$y' = \int f(x) dx + C_1 \Rightarrow y = \int \left( \int f(x) dx \right) dx + C_1 x + C_2$$
* **Khuyết $y$ ($F(x, y', y'') = 0$):**
    * *Phương pháp:* Đặt ẩn phụ làm giảm cấp phương trình:
      $$u = y' \Rightarrow y'' = u' = \frac{du}{dx}$$
    * Phương trình trở thành PTVP cấp 1 đối với $u$: $F(x, u, u') = 0$. Sau khi giải tìm được $u = \varphi(x, C_1)$, ta giải tiếp phương trình cấp 1:
      $$y' = \varphi(x, C_1) \Rightarrow y = \int \varphi(x, C_1) dx + C_2$$
    * 📝 **Ví dụ tiêu biểu:** Giải bài toán Cauchy: $2x y'' - 6y' + x^2 = 0$ với $y(1) = 0, y'(1) = 1$.
      * *Lời giải:*
        Chia hai vế phương trình cho $2x$ ta có:
        $$y'' - \frac{3}{x}y' = -\frac{x}{2} \quad (1)$$
        Đặt ẩn phụ hạ cấp $u = y' \Rightarrow u' = y''$. Phương trình (1) trở thành:
        $$u' - \frac{3}{x}u = -\frac{x}{2} \quad (2)$$
        Đây là phương trình vi phân tuyến tính cấp 1 đối với $u$. Áp dụng công thức nghiệm tổng quát cho (2):
        $$u = K e^{\int \frac{3}{x} dx} + e^{\int \frac{3}{x} dx} \int \left(-\frac{x}{2}\right) e^{-\int \frac{3}{x} dx} dx = K x^3 - x^3 \int \frac{x}{2} \cdot x^{-3} dx$$
        $$u = K x^3 - x^3 \left( -\frac{1}{2x} \right) = K x^3 + \frac{x^2}{2}$$
        Từ điều kiện ban đầu $y'(1) = 1 \Rightarrow u(1) = 1$:
        $$1 = K(1)^3 + \frac{1}{2} \Rightarrow K = \frac{1}{2} \Rightarrow y' = u = \frac{1}{2}x^3 + \frac{1}{2}x^2$$
        Tích phân hai vế để tìm $y$:
        $$y = \int \left(\frac{1}{2}x^3 + \frac{1}{2}x^2\right) dx = \frac{1}{8}x^4 + \frac{1}{6}x^3 + D$$
        Từ điều kiện ban đầu $y(1) = 0$:
        $$0 = \frac{1}{8} + \frac{1}{6} + D \Rightarrow D = -\frac{7}{24}$$
        Vậy nghiệm của phương trình là: $y = \frac{1}{8}x^4 + \frac{1}{6}x^3 - \frac{7}{24}$.
* **Khuyết $x$ ($F(y, y', y'') = 0$):**
    * *Phương pháp:* Đặt ẩn phụ xem $y$ là biến số độc lập mới, và đạo hàm $y'$ là hàm số theo $y$:
      $$u = y' \Rightarrow y'' = \frac{du}{dx} = \frac{du}{dy} \cdot \frac{dy}{dx} = u \cdot \frac{du}{dy}$$
    * Phương trình trở thành PTVP cấp 1 đối với $u$ theo biến $y$: $F\left(y, u, u \frac{du}{dy}\right) = 0$. Sau khi tìm được $u = \varphi(y, C_1)$, ta tiến hành tách biến để tìm $y$:
      $$\frac{dy}{dx} = \varphi(y, C_1) \Rightarrow \frac{dy}{\varphi(y, C_1)} = dx \Rightarrow x = \int \frac{dy}{\varphi(y, C_1)} + C_2$$
    * ⚠️ **Lưu ý:** Khi đặt $u = y', y'' = u \frac{du}{dy}$, ta phải xét riêng trường hợp $u = 0 \Rightarrow y' = 0 \Rightarrow y = C$ (hằng số) có là nghiệm của phương trình hay không.
    * 📝 **Ví dụ tiêu biểu:** Giải phương trình vi phân $y y'' = y'^2 - y'^3$.
      * *Lời giải:*
        Đặt ẩn phụ $u = y' \Rightarrow y'' = u \frac{du}{dy}$. Phương trình trở thành:
        $$y \cdot u \frac{du}{dy} = u^2 - u^3 \quad (*)$$
        - Xét $u = 0 \Rightarrow y' = 0 \Rightarrow y = C_1$ (hằng số). Thế vào phương trình gốc thấy thỏa mãn, đây là một nghiệm của phương trình.
        - Xét $u = 1 \Rightarrow y' = 1 \Rightarrow y = x + C$. Thế vào phương trình gốc thấy thỏa mãn, đây cũng là một nghiệm của phương trình.
        - Xét $u \neq 0$ và $u \neq 1$, chia cả hai vế của $(*)$ cho $u$:
          $$y \frac{du}{dy} = u - u^2 \Rightarrow \frac{du}{u(1-u)} = \frac{dy}{y} \Rightarrow \left( \frac{1}{u} + \frac{1}{1-u} \right) du = \frac{dy}{y}$$
          Tích phân hai vế:
          $$\ln|u| - \ln|1-u| = \ln|y| + \ln|C_2| \Rightarrow \left| \frac{u}{1-u} \right| = C_2 |y| \Rightarrow \frac{u - 1}{u} = \frac{C_3}{y} \Rightarrow u = \frac{y}{y - C_3}$$
          Thay ngược $u = y' = \frac{dy}{dx}$:
          $$\frac{dy}{dx} = \frac{y}{y - C_3} \Rightarrow \frac{y - C_3}{y} dy = dx \Rightarrow \left( 1 - \frac{C_3}{y} \right) dy = dx$$
          Tích phân hai vế:
          $$x = y - C_3 \ln|y| + C_4$$
        Vậy họ nghiệm của phương trình là: $y = C_1$, $y = x + C$, và $x = y - C_3 \ln|y| + C_4$.

#### b. Phương trình vi phân tuyến tính cấp 2 tổng quát
Dạng tổng quát: $y'' + p(x)y' + q(x)y = f(x)$, với $p(x), q(x), f(x)$ liên tục trên khoảng xét.
* **Phương trình thuần nhất liên kết ($f(x) = 0$):** $y'' + p(x)y' + q(x)y = 0$.
    * Họ nghiệm tổng quát có cấu trúc: $\bar{y} = C_1 y_1 + C_2 y_2$, trong đó $y_1(x), y_2(x)$ là hệ hai nghiệm độc lập tuyến tính của phương trình.
    * **Công thức Liouville (Tìm nghiệm thứ hai khi biết trước một nghiệm $y_1$):** Nếu đề bài cho trước một nghiệm riêng $y_1(x) \neq 0$, nghiệm độc lập tuyến tính thứ hai $y_2(x)$ được tìm qua công thức:
      $$y_2 = y_1 \cdot \int \frac{e^{-\int p(x) dx}}{y_1^2} dx$$
    * 📝 **Ví dụ tiêu biểu:** Tìm nghiệm tổng quát của phương trình $x^2 y'' + x y' - y = 0$, biết phương trình có một nghiệm riêng $y_1 = x$.
      * *Lời giải:*
        Chia hai vế phương trình cho $x^2$ để đưa về dạng chuẩn tắc:
        $$y'' + \frac{1}{x} y' - \frac{1}{x^2} y = 0$$
        Ở đây ta có hệ số $p(x) = \frac{1}{x}$. Biết trước một nghiệm riêng $y_1 = x$.
        Áp dụng công thức Liouville để tìm nghiệm riêng độc lập tuyến tính thứ hai $y_2$:
        $$y_2 = y_1 \int \frac{e^{-\int p(x) dx}}{y_1^2} dx = x \int \frac{e^{-\int \frac{1}{x} dx}}{x^2} dx = x \int \frac{e^{-\ln|x|}}{x^2} dx$$
        $$y_2 = x \int \frac{1}{x^3} dx = x \left( -\frac{1}{2x^2} \right) = -\frac{1}{2x}$$
        Vì $y_2 = -\frac{1}{2x}$ độc lập tuyến tính với $y_1 = x$, ta có họ nghiệm tổng quát của phương trình:
        $$y = C_1 x - \frac{C_2}{2x} \quad (\text{hoặc viết gọn dưới dạng hấp thụ hằng số là } y = C_1 x + \frac{C_3}{x})$$
* **Phương trình không thuần nhất ($f(x) \neq 0$):**
    * Nghiệm tổng quát có cấu trúc: $y = \bar{y} + Y$, trong đó $\bar{y}$ là nghiệm tổng quát của phương trình thuần nhất tương ứng và $Y$ là một nghiệm riêng bất kỳ của phương trình không thuần nhất.
    * **Phương pháp biến thiên hằng số Lagrange:** Coi các hằng số $C_1, C_2$ trong nghiệm thuần nhất là các hàm số $C_1(x), C_2(x)$. Khi đó nghiệm riêng $Y = C_1(x)y_1 + C_2(x)y_2$ được xác định bằng cách giải hệ phương trình vi phân đạo hàm:
      $$\begin{cases} C_1'(x) y_1 + C_2'(x) y_2 = 0 \\ C_1'(x) y'_1 + C_2'(x) y'_2 = f(x) \end{cases}$$
    * 📝 **Ví dụ tiêu biểu:** Tìm nghiệm tổng quát của phương trình $x^2 y'' + x y' - y = x^2$.
      * *Lời giải:*
        Đưa phương trình về dạng chuẩn tắc bằng cách chia cho $x^2$:
        $$y'' + \frac{1}{x} y' - \frac{1}{x^2} y = 1 \quad (1)$$
        Phương trình thuần nhất liên kết tương ứng là $y'' + \frac{1}{x}y' - \frac{1}{x^2}y = 0$, theo ví dụ trước có họ nghiệm tổng quát:
        $$\bar{y} = C_1 x + \frac{C_2}{x} \Rightarrow y_1 = x, \quad y_2 = \frac{1}{x}$$
        Áp dụng phương pháp biến thiên hằng số Lagrange để tìm nghiệm riêng $Y = C_1(x)x + C_2(x)\frac{1}{x}$ của phương trình không thuần nhất bằng cách giải hệ:
        $$\begin{cases} C_1'(x) x + C_2'(x) \frac{1}{x} = 0 \\ C_1'(x) \cdot 1 + C_2'(x) \left(-\frac{1}{x^2}\right) = 1 \end{cases}$$
        Giải hệ phương trình đại số này đối với $C_1'(x)$ và $C_2'(x)$:
        $$\begin{cases} C_1'(x) = \frac{1}{2} \\ C_2'(x) = -\frac{x^2}{2} \end{cases} \Rightarrow \begin{cases} C_1(x) = \frac{x}{2} \\ C_2(x) = -\frac{x^3}{6} \end{cases}$$
        Thế ngược vào biểu thức của $Y$:
        $$Y = C_1(x) x + C_2(x) \frac{1}{x} = \frac{x}{2} \cdot x - \frac{x^3}{6} \cdot \frac{1}{x} = \frac{x^2}{2} - \frac{x^2}{6} = \frac{x^2}{3}$$
        Vậy nghiệm tổng quát của phương trình không thuần nhất là:
        $$y = \bar{y} + Y = C_1 x + \frac{C_2}{x} + \frac{x^2}{3}$$

#### c. Phương trình vi phân tuyến tính cấp 2 hệ số không đổi
Dạng phương trình: $y'' + p y' + q y = f(x)$, với $p, q$ là các hằng số thực.
* **Bước 1: Giải phương trình thuần nhất $y'' + p y' + q y = 0$.**
  Thiết lập **Phương trình đặc trưng**:
  $$\lambda^2 + p \lambda + q = 0 \quad (*)$$
  Dựa vào biệt thức $\Delta = p^2 - 4q$, ta chia thành 3 trường hợp nghiệm đặc trưng:
    1. **$\Delta > 0$ (Hai nghiệm thực phân biệt $\lambda_1 \neq \lambda_2$):**
       $$\bar{y} = C_1 e^{\lambda_1 x} + C_2 e^{\lambda_2 x}$$
    2. **$\Delta = 0$ (Nghiệm thực kép $\lambda_1 = \lambda_2 = \lambda_0 = -\frac{p}{2}$):**
       $$\bar{y} = (C_1 + C_2 x) e^{\lambda_0 x}$$
    3. **$\Delta < 0$ (Hai nghiệm phức liên hợp $\lambda_{1,2} = a \pm bi$):**
       $$\bar{y} = e^{a x} \left( C_1 \cos(bx) + C_2 \sin(bx) \right)$$
       *(Trong đó $a = -\frac{p}{2}$ và $b = \frac{\sqrt{4q - p^2}}{2}$)*.
* **Bước 2: Tìm một nghiệm riêng $Y$ của phương trình không thuần nhất bằng phương pháp hệ số bất định (đối với vế phải $f(x)$ có dạng đặc biệt).**
    * **Dạng 1:** $f(x) = e^{\alpha x} P_n(x)$ (với $P_n(x)$ là đa thức bậc $n$).
      Đoán dạng nghiệm riêng:
      $$Y = x^r e^{\alpha x} Q_n(x)$$
      Trong đó $Q_n(x)$ là đa thức cùng bậc $n$ với hệ số cần tìm. Số mũ $r$ được xác định theo quy tắc cộng hưởng:
        * $r = 0$ nếu $\alpha$ không là nghiệm của phương trình đặc trưng $(*)$.
        * $r = 1$ nếu $\alpha$ là nghiệm đơn của phương trình đặc trưng $(*)$.
        * $r = 2$ nếu $\alpha$ là nghiệm kép của phương trình đặc trưng $(*)$.
    * 📝 **Ví dụ tiêu biểu:** Giải phương trình vi phân $y'' + 4y' + 3y = (x+2)e^{-x}$.
      * *Lời giải:*
        - **Bước 1:** Xét phương trình đặc trưng của phương trình thuần nhất tương ứng:
          $$\lambda^2 + 4\lambda + 3 = 0 \Rightarrow \lambda_1 = -1, \quad \lambda_2 = -3$$
          Họ nghiệm tổng quát của phương trình thuần nhất là:
          $$\bar{y} = C_1 e^{-x} + C_2 e^{-3x}$$
        - **Bước 2:** Tìm nghiệm riêng $Y$ của phương trình không thuần nhất.
          Vế phải $f(x) = (x+2)e^{-x}$ có $\alpha = -1$ (là nghiệm đơn của phương trình đặc trưng) và đa thức bậc $n = 1$.
          Do đó, dạng của nghiệm riêng $Y$ là:
          $$Y = x^1 \cdot e^{-x} (Ax + B) = e^{-x} (Ax^2 + Bx)$$
          Tính các đạo hàm của $Y$:
          $$Y' = e^{-x}(-Ax^2 + (2A-B)x + B)$$
          $$Y'' = e^{-x}(Ax^2 - (4A-B)x + 2A - 2B)$$
          Thế $Y, Y', Y''$ vào phương trình ban đầu và giản ước $e^{-x}$:
          $$(Ax^2 - (4A-B)x + 2A - 2B) + 4(-Ax^2 + (2A-B)x + B) + 3(Ax^2 + Bx) = x + 2$$
          Gom các số hạng theo lũy thừa của $x$:
          $$4Ax + (2A + 2B) = x + 2$$
          Đồng nhất hệ số hai vế:
          $$\begin{cases} 4A = 1 \\ 2A + 2 B = 2 \end{cases} \Rightarrow \begin{cases} A = \frac{1}{4} \\ B = \frac{3}{4} \end{cases} \Rightarrow Y = e^{-x}\left(\frac{1}{4}x^2 + \frac{3}{4}x\right)$$
          Vậy nghiệm tổng quát của phương trình ban đầu là:
          $$y = \bar{y} + Y = C_1 e^{-x} + C_2 e^{-3x} + \left(\frac{1}{4}x^2 + \frac{3}{4}x\right)e^{-x}$$
    * **Dạng 2:** $f(x) = P_m(x) \cos(\beta x) + P_n(x) \sin(\beta x)$ (đa thức nhân lượng giác).
      Đoán dạng nghiệm riêng:
      $$Y = x^r \left[ Q_L(x) \cos(\beta x) + R_L(x) \sin(\beta x) \right]$$
      Trong đó $Q_L(x), R_L(x)$ là hai đa thức có cùng bậc $L = \max(m, n)$ với các hệ số cần tìm. Số mũ $r$ xác định theo quy tắc cộng hưởng:
        * $r = 0$ nếu số phức $\pm i\beta$ không là nghiệm của phương trình đặc trưng $(*)$.
        * $r = 1$ nếu số phức $\pm i\beta$ là nghiệm của phương trình đặc trưng $(*)$.
    * 📝 **Ví dụ tiêu biểu:** Tìm nghiệm riêng của phương trình $y'' - 3y' + 2y = (x+1)\cos x$.
      * *Lời giải:*
        Phương trình đặc trưng $\lambda^2 - 3\lambda + 2 = 0$ có 2 nghiệm $\lambda_1 = 1, \lambda_2 = 2$.
        Vế phải có dạng lượng giác với số phức đặc trưng $\pm i\beta = \pm i$ (không phải là nghiệm của phương trình đặc trưng $\Rightarrow r = 0$) và bậc của đa thức cao nhất $L = \max(1, 0) = 1$.
        Dạng nghiệm riêng đoán nhận là:
        $$Y = (Ax + B)\cos x + (Cx + D)\sin x$$
        Tính đạo hàm cấp 1 và cấp 2 của $Y$:
        $$Y' = (Cx + A + D)\cos x + (-Ax - B + C)\sin x$$
        $$Y'' = (-Ax - B + 2C)\cos x + (-Cx - 2A - D)\sin x$$
        Thế vào phương trình gốc và đồng nhất hệ số với $(x+1)\cos x$, ta được hệ phương trình bậc nhất:
        $$\begin{cases} A - 3C = 1 \\ 3A + C = 0 \\ -3A + B + 2C - 3D = 1 \\ -2A + 3B - 3C + D = 0 \end{cases} \Rightarrow \begin{cases} A = \frac{1}{10}, \quad B = -\frac{1}{50} \\ C = -\frac{3}{10}, \quad D = -\frac{16}{25} \end{cases}$$
        Vậy nghiệm riêng cụ thể là:
        $$Y = \left(\frac{1}{10}x - \frac{1}{50}\right)\cos x - \left(\frac{3}{10}x + \frac{16}{25}\right)\sin x$$

#### d. Phương trình Euler
Dạng phương trình: $x^2 y'' + a x y' + b y = f(x)$ (với $a, b$ là các hằng số).
* **Phương pháp giải:** Đổi biến số độc lập bằng phép thế logarit:
  $$t = \ln|x| \Rightarrow |x| = e^t$$
* Công thức chuyển đổi đạo hàm theo biến mới $t$:
  $$x y' = \frac{dy}{dt} = y'_t$$
  $$x^2 y'' = \frac{d^2y}{dt^2} - \frac{dy}{dt} = y''_t - y'_t$$
* Thế vào phương trình Euler, ta thu được phương trình vi phân tuyến tính hệ số không đổi theo biến $t$:
  $$y''_t + (a - 1) y'_t + b y = f(e^t)$$
* 📝 **Ví dụ tiêu biểu:** Giải phương trình vi phân Euler thuần nhất: $x^2 y'' - 9x y' + 21y = 0$.
  * *Lời giải:*
    Thực hiện phép đổi biến độc lập $t = \ln|x|$. Thay các biểu thức đạo hàm vào phương trình ta được:
    $$(y''_t - y'_t) - 9y'_t + 21y = 0 \Rightarrow y''_t - 10y'_t + 21y = 0$$
    Đây là phương trình vi phân tuyến tính hệ số hằng số theo biến độc lập $t$.
    Xét phương trình đặc trưng tương ứng:
    $$\lambda^2 - 10\lambda + 21 = 0 \Rightarrow \lambda_1 = 3, \quad \lambda_2 = 7$$
    Nghiệm tổng quát của phương trình theo biến $t$ là:
    $$y(t) = C_1 e^{3t} + C_2 e^{7t}$$
    Thế ngược lại $t = \ln|x|$ (tương đương $e^t = |x|$), ta thu được nghiệm tổng quát theo biến $x$ là:
    $$y(x) = C_1 e^{3\ln|x|} + C_2 e^{7\ln|x|} = C_1 |x|^3 + C_2 |x|^7 \quad (\text{hoặc gọn là } y = C_1 x^3 + C_2 x^7 \text{ trên } (0, \infty))$$

---

### 1.4. Hệ phương trình vi phân cấp 1 chuẩn tắc
Dạng tổng quát của hệ $n$ phương trình chuẩn tắc cấp 1:
$$\begin{cases} 
y_1' = f_1(x, y_1, y_2, \dots, y_n) \\ 
y_2' = f_2(x, y_1, y_2, \dots, y_n) \\ 
\vdots \\ 
y_n' = f_n(x, y_1, y_2, \dots, y_n) 
\end{cases}$$
*(Trong đó, $y_i' = \frac{dy_i}{dx}$ là các đạo hàm của hàm số $y_i$ theo biến số độc lập $x$)*.
* **Phương pháp khử (Đưa hệ về phương trình cấp cao):**
  *Ý tưởng cốt lõi:* Khử dần các hàm số chưa biết để chuyển đổi một hệ gồm nhiều phương trình vi phân cấp thấp (cấp 1) thành một phương trình vi phân duy nhất có cấp cao hơn đối với một hàm số duy nhất.
    1. Lấy đạo hàm hai vế của phương trình đầu tiên theo biến $x$.
    2. Thế các đạo hàm $y_i'$ từ các phương trình còn lại của hệ vào phương trình vừa đạo hàm.
    3. Tiếp tục quá trình khử để biểu diễn các hàm số $y_2, y_3, \dots, y_n$ hoàn toàn theo biến $x$, hàm $y_1$ và các đạo hàm của nó $y_1', y_1'', \dots$.
    4. Thu được một phương trình vi phân cấp $n$ duy nhất đối với riêng hàm $y_1(x)$. Giải phương trình này tìm $y_1(x)$, từ đó suy ra các hàm còn lại mà không cần tích phân thêm.
* 📝 **Ví dụ tiêu biểu:** Giải hệ phương trình vi phân sau:
  $$\begin{cases} \frac{dx}{dt} = 2x + y \quad (1) \\ \frac{dy}{dt} = 3x + 4y \quad (2) \end{cases}$$
  * *Lời giải:*
    Từ phương trình (1), ta cô lập hàm $y$:
    $$y = \frac{dx}{dt} - 2x = x' - 2x \quad (3)$$
    Lấy đạo hàm hai vế của (3) theo biến $t$, ta được:
    $$\frac{dy}{dt} = x'' - 2x' \quad (4)$$
    Thế biểu thức của $y$ từ (3) và $\frac{dy}{dt}$ từ (4) vào phương trình (2):
    $$x'' - 2x' = 3x + 4(x' - 2x) \Rightarrow x'' - 2x' = 4x' - 5x \Rightarrow x'' - 6x' + 5x = 0 \quad (5)$$
    Phương trình (5) là phương trình vi phân tuyến tính cấp 2 hệ số hằng số đối với riêng hàm $x(t)$.
    Xét phương trình đặc trưng của (5):
    $$\lambda^2 - 6\lambda + 5 = 0 \Rightarrow \lambda_1 = 1, \quad \lambda_2 = 5$$
    Vậy nghiệm tổng quát của hàm $x(t)$ là:
    $$x(t) = C_1 e^t + C_2 e^{5t}$$
    Thế $x(t)$ và $x'(t) = C_1 e^t + 5C_2 e^{5t}$ vào phương trình (3) để tìm hàm $y(t)$:
    $$y(t) = (C_1 e^t + 5C_2 e^{5t}) - 2(C_1 e^t + C_2 e^{5t}) = -C_1 e^t + 3C_2 e^{5t}$$
    Vậy nghiệm tổng quát của hệ phương trình vi phân là:
    $$\begin{cases} x(t) = C_1 e^t + C_2 e^{5t} \\ y(t) = -C_1 e^t + 3C_2 e^{5t} \end{cases}$$

---

## 2. CÁC ĐỊNH LÝ VÀ KHÁI NIỆM LÝ THUYẾT CỐT LÕI

### 2.1. Sự tồn tại và duy nhất nghiệm (Bài toán Cauchy)

| Tiêu chí | Bài toán Cauchy cấp 1 | Bài toán Cauchy cấp 2 |
| :--- | :--- | :--- |
| **Dạng bài toán** | $\begin{cases} y' = f(x, y) \\ y(x_0) = y_0 \end{cases}$ | $\begin{cases} y'' = f(x, y, y') \\ y(x_0) = y_0 \\ y'(x_0) = y'_0 \end{cases}$ |
| **Điều kiện tồn tại nghiệm** | Hàm số $f(x, y)$ liên tục trên miền $\mathcal{D} \subset \mathbb{R}^2$ chứa điểm $(x_0, y_0)$. | Hàm số $f(x, y, y')$ liên tục trên miền $\mathcal{D} \subset \mathbb{R}^3$ chứa điểm $(x_0, y_0, y'_0)$. |
| **Điều kiện duy nhất nghiệm** | Đạo hàm riêng $\frac{\partial f}{\partial y}(x, y)$ tồn tại và liên tục trên miền $\mathcal{D}$. | Các đạo hàm riêng $\frac{\partial f}{\partial y}$ và $\frac{\partial f}{\partial y'}$ tồn tại và liên tục trên miền $\mathcal{D}$. |
| **Ý nghĩa hình học** | Qua điểm $(x_0, y_0)$ có duy nhất một đường cong tích phân. | Qua điểm $(x_0, y_0)$ có duy nhất một đường cong tích phân tiếp xúc với đường thẳng có hệ số góc $y'_0$. |
| **Hệ quả khi vi phạm** | * **Vô nghiệm:** Nếu $f$ gián đoạn tại điểm xét.<br>* **Vô số nghiệm:** Nếu $f$ liên tục nhưng $\frac{\partial f}{\partial y}$ gián đoạn hoặc không tồn tại (Ví dụ: $y' = 2\sqrt{y}$ tại $(0,0)$ có nghiệm $y = 0$ và họ nghiệm $y = (x-C)^2$). | Tương tự cấp 1, nếu các đạo hàm riêng bị gián đoạn, họ đường cong tích phân xuất phát từ một điểm có thể phân nhánh (không duy nhất nghiệm). |

---

### 2.2. Tính độc lập tuyến tính & Định thức Wronsky (Wronskian)
* **Định nghĩa độc lập tuyến tính (DLTT):** Hai hàm số $y_1(x)$ và $y_2(x)$ được gọi là độc lập tuyến tính trên khoảng $(a, b)$ nếu tỉ số của chúng không phải là một hằng số:
  $$\frac{y_2(x)}{y_1(x)} \neq \text{const} \quad \forall x \in (a, b)$$
  Ngược lại, nếu tồn tại hằng số $C$ sao cho $y_2(x) = C y_1(x)$ thì hai hàm số gọi là phụ thuộc tuyến tính (PTTT).
* **Định thức Wronsky:** Đối với hai hàm số khả vi $y_1, y_2$, định thức Wronsky là:
  $$W(x) = W(y_1, y_2)(x) = \begin{vmatrix} y_1(x) & y_2(x) \\ y_1'(x) & y_2'(x) \end{vmatrix} = y_1(x)y_2'(x) - y_1'(x)y_2(x)$$
* **Định lý liên hệ cốt lõi:**
    - Nếu hai nghiệm $y_1, y_2$ của phương trình thuần nhất $y'' + p(x)y' + q(x)y = 0$ phụ thuộc tuyến tính trên $[a, b]$ thì $W(x) = 0, \forall x \in [a, b]$.
    - Nếu tồn tại dù chỉ một điểm $x_0 \in [a, b]$ sao cho $W(x_0) \neq 0$ thì hai nghiệm $y_1, y_2$ độc lập tuyến tính trên $[a, b]$, và khi đó $W(x) \neq 0, \forall x \in [a, b]$.
* **Công thức Abel - Liouville cho định thức Wronsky:**
  $$W(x) = W(x_0) e^{-\int_{x_0}^x p(t) dt}$$
  Công thức này chứng minh rằng định thức Wronsky hoặc luôn bằng $0$ với mọi $x$, hoặc luôn khác $0$ với mọi $x$ trên miền liên tục của hệ số $p(x)$.

---

### 2.3. Cấu trúc nghiệm của phương trình vi phân tuyến tính
* **Nguyên lý chồng nghiệm (Superposition Principle):**
    * *Cho phương trình thuần nhất:* Nếu $y_1, y_2$ là hai nghiệm của phương trình thuần nhất $y'' + py' + qy = 0$, thì tổ hợp tuyến tính $y = C_1 y_1 + C_2 y_2$ cũng là nghiệm của phương trình đó với mọi hằng số $C_1, C_2$.
    * *Cho phương trình không thuần nhất:* Nếu $Y_1$ là nghiệm riêng của $y'' + py' + qy = f_1(x)$ và $Y_2$ là nghiệm riêng của $y'' + py' + qy = f_2(x)$, thì tổng $Y = Y_1 + Y_2$ là một nghiệm riêng của phương trình $y'' + py' + qy = f_1(x) + f_2(x)$.
* **Cấu trúc tổng quát của nghiệm phương trình không thuần nhất:**
  $$\text{Nghiệm tổng quát không thuần nhất } (y) = \text{Nghiệm tổng quát thuần nhất } (\bar{y}) + \text{Một nghiệm riêng bất kỳ } (Y)$$
  *Ý nghĩa:* Mọi nghiệm của phương trình không thuần nhất đều có thể biểu diễn dưới dạng tổng của nghiệm tổng quát thuần nhất liên kết và một nghiệm riêng cụ thể.

---

### 2.4. Hiện tượng cộng hưởng (Resonance) trong PTVP hệ số không đổi
Hiện tượng cộng hưởng xảy ra khi tần số hoặc hệ số mũ của lực cưỡng bức vế phải $f(x)$ trùng khớp với tần số dao động tự do (nghiệm của phương trình đặc trưng) của hệ thống.
* **Bản chất toán học:** Khi tìm nghiệm riêng $Y$ theo phương pháp hệ số bất định, nếu phần mũ $\alpha$ hoặc số phức $\alpha \pm i\beta$ của vế phải trùng với nghiệm của phương trình đặc trưng, ta phải nhân thêm nhân tử $x^r$ vào dạng đoán của nghiệm riêng (với $r$ là số lần trùng lặp nghiệm).
* **Ý nghĩa vật lý:** Trong các bài toán cơ học hoặc mạch điện, sự trùng khớp này làm biên độ nghiệm riêng tăng lên vô hạn theo thời gian (do nhân tử $x^r$ tiến ra vô cùng khi $x \to \infty$), có thể gây phá hủy hệ thống.

---

## 3. BẢNG TỔNG HỢP PHƯƠNG PHÁP GIẢI CÁC DẠNG PTVP

| Dạng Phương Trình | Dấu Hiệu Nhận Diện | Phép Biến Đổi / Cách Giải | Hệ Phương Trình / Công thức nghiệm |
| :--- | :--- | :--- | :--- |
| **1. Phân ly biến số** | $y' = g(x)h(y)$ | Tách biến về hai vế | $\int \frac{dy}{h(y)} = \int g(x) dx + C$ <br>*(Xét thêm nghiệm kì dị nếu $h(y)=0$)* |
| **2. Đẳng cấp cấp 1** | $y' = f\left(\frac{y}{x}\right)$ | Đặt $u = \frac{y}{x} \Rightarrow y' = u'x + u$ | $\int \frac{du}{f(u) - u} = \int \frac{dx}{x} + C$ |
| **3. Tuyến tính cấp 1** | $y' + p(x)y = q(x)$ | Nhân thừa số tích phân hoặc biến thiên hằng số | $y = e^{-\int p(x)dx} \left( \int q(x)e^{\int p(x)dx}dx + C \right)$ |
| **4. Bernoulli** | $y' + p(x)y = q(x)y^\alpha$ | Chia $y^\alpha$, đặt $u = y^{1-\alpha}$ | $u' + (1-\alpha)p(x)u = (1-\alpha)q(x)$ <br>*(Xét thêm nghiệm $y=0$ nếu $\alpha > 0$)* |
| **5. Vi phân toàn phần** | $Pdx + Qdy = 0$ thỏa $\frac{\partial P}{\partial y} = \frac{\partial Q}{\partial x}$ | Tính tích phân đường từ điểm $(x_0, y_0)$ | $\int_{x_0}^x P(t, y) dt + \int_{y_0}^y Q(x_0, t) dt = C$ |
| **6. Thừa số tích phân** | $Pdx + Qdy = 0$ có $\frac{\partial P}{\partial y} \neq \frac{\partial Q}{\partial x}$ | Nhân thừa số $h(x)$ hoặc $h(y)$ | * Nếu $\frac{P'_y - Q'_x}{Q} = f(x) \Rightarrow h(x) = e^{\int f(x)dx}$ <br>* Nếu $\frac{Q'_x - P'_y}{P} = g(y) \Rightarrow h(y) = e^{\int g(y)dy}$ |
| **7. Cấp 2 khuyết $y$** | $F(x, y', y'') = 0$ | Đặt $u = y' \Rightarrow y'' = u'$ | Giải $F(x, u, u') = 0 \Rightarrow u = \varphi(x, C_1)$ <br> Sau đó tính $y = \int \varphi(x, C_1)dx + C_2$ |
| **8. Cấp 2 khuyết $x$** | $F(y, y', y'') = 0$ | Đặt $u = y' \Rightarrow y'' = u 	mp \frac{du}{dy}$ | Giải $F\left(y, u, u \frac{du}{dy}\right) = 0 \Rightarrow u = \varphi(y, C_1)$ <br> Sau đó giải $\int \frac{dy}{\varphi(y, C_1)} = x + C_2$ |
| **9. Tuyến tính cấp 2 thuần nhất** | $y'' + p(x)y' + q(x)y = 0$ | Tìm hai nghiệm DLTT $y_1, y_2$ | $y = C_1 y_1 + C_2 y_2$ <br>*(Dùng công thức Liouville tìm $y_2$ nếu biết $y_1$)* |
| **10. Hệ số không đổi thuần nhất** | $y'' + py' + qy = 0$ | Giải phương trình đặc trưng $\lambda^2 + p\lambda + q = 0$ | * $\Delta > 0: y = C_1 e^{\lambda_1 x} + C_2 e^{\lambda_2 x}$ <br>* $\Delta = 0: y = (C_1 + C_2 x) e^{\lambda_0 x}$ <br>* $\Delta < 0: y = e^{ax}(C_1 \cos bx + C_2 \sin bx)$ |
| **11. Tuyến tính cấp 2 không thuần nhất** | $y'' + p(x)y' + q(x)y = f(x)$ | Giải thuần nhất tìm $\bar{y}$, dùng Lagrange tìm nghiệm riêng $Y$ | $y = \bar{y} + Y$ <br> Lagrange: $\begin{cases} C'_1 y_1 + C'_2 y_2 = 0 \\ C'_1 y'_1 + C'_2 y'_2 = f(x) \end{cases}$ |
| **12. Euler** | $x^2 y'' + axy' + by = f(x)$ | Đổi biến số $t = \ln\|x\|$ | $y''_t + (a - 1)y'_t + by = f(e^t)$ |
| **13. Hệ chuẩn tắc cấp 1** | Hệ liên kết các hàm $y_i'$ | Phương pháp khử để đưa về PTVP cấp cao | Rút các hàm phụ theo hàm chính và đạo hàm của nó. Thế vào phương trình cuối để giải. |

---

## 4. QUY TRÌNH VÀ MẸO NHẬN DẠNG NHANH

### 4.1. Bản đồ quy trình giải quyết PTVP tổng quát
```text
                  [ BẮT ĐẦU: XÁC ĐỊNH CẤP CỦA PHƯƠNG TRÌNH ]
                                      │
             ┌────────────────────────┴────────────────────────┐
             ▼                                                 ▼
      [ PHƯƠNG TRÌNH CẤP 1 ]                            [ PHƯƠNG TRÌNH CẤP 2 ]
             │                                                 │
   ┌─────────┴─────────┐                             ┌─────────┴─────────┐
   ▼                   ▼                             ▼                   ▼
[DẠNG KHUYẾT]    [DẠNG ĐIỂN HÌNH]                 [DẠNG KHUYẾT]    [DẠNG TUYẾN TÍNH]
   │                   │                             │                   │
   ├─ Khuyết y         ├─ Phân ly biến số            ├─ Khuyết y, y'     ├─ Hệ số biến đổi
   │  (Đặt y' = t)     ├─ Đẳng cấp (u = y/x)         │  (Tích phân 2 lần)│  (Liouville/Lagrange)
   └─ Khuyết x         ├─ Tuyến tính cấp 1           ├─ Khuyết y         ├─ Hệ số không đổi
      (Đặt y' = t)     │  (Thừa số tích phân)        │  (Đặt u = y')     │  (Phương trình đặc trưng)
                       ├─ Bernoulli                  └─ Khuyết x         └─ Phương trình Euler
                       │  (u = y^(1-α))                 (Đặt u = y',        (Đổi biến t = ln|x|)
                       ├─ VP Toàn phần                  y'' = u.du/dy)
                       │  (P'_y = Q'_x)
                       └─ Thừa số tích phân
                          (Nhân h(x) hoặc h(y))
```

---

### 4.2. Mẹo thực chiến và các "bẫy" kinh điển trong phòng thi

| Dấu hiệu vế phải / Dạng thức | 🎯 Chiến thuật ưu tiên | 🛡 Công cụ dự phòng | ⚠️ Bẫy thường gặp / Mẹo xử lý |
| :--- | :--- | :--- | :--- |
| Phương trình cấp 1 có chứa tổng các bậc đồng nhất: $x^2 + y^2$, $xy$ | **Đẳng đẳng (Thuần nhất cấp 1)** | Phân ly biến số sau đổi biến | ⚠️ **Bẫy:** Chia cho $x$ để xuất hiện dạng $\frac{y}{x}$ có thể bỏ sót nghiệm $x = 0$. <br>💡 **Mẹo:** Viết lại dưới dạng $y' = f(y/x)$ rồi hãy thực hiện đặt $u$. |
| Phương trình cấp 1 dạng phân thức phức tạp chứa cả $x$ và $y$ | **Vi phân toàn phần** hoặc **Thừa số tích phân** | Tuyến tính cấp 1 (nếu đưa được về dạng ẩn) | ⚠️ **Bẫy:** Tính sai đạo hàm riêng. Luôn nhớ $\frac{\partial P}{\partial y}$ là đạo hàm theo $y$ (coi $x$ là hằng số) và ngược lại. |
| Phương trình cấp 1 có $y'$ đứng tự do và có số mũ cao như $(y')^2, (y')^3$ | **Tham số hóa (Phương trình khuyết)** | Giải tìm trực tiếp $y'$ rồi tích phân | ⚠️ **Bẫy:** Quên viết nghiệm dưới dạng hệ tham số, chỉ giải ra $y$ theo $t$ mà quên biểu thức của $x$ theo $t$. |
| Đề bài yêu cầu tìm nghiệm của phương trình tuyến tính cấp 2 hệ số biến đổi | **Nhẩm nghiệm riêng $y_1$** để dùng công thức Liouville | Biến thiên hằng số Lagrange | 💡 **Mẹo nhẩm nhanh $y_1$:** <br>* Nếu $p(x) + x q(x) = 0 \Rightarrow y_1 = x$.<br>* Nếu $1 + p(x) + q(x) = 0 \Rightarrow y_1 = e^x$.<br>* Nếu $1 - p(x) + q(x) = 0 \Rightarrow y_1 = e^{-x}$.<br>* Nếu $2 + 2x p(x) + x^2 q(x) = 0 \Rightarrow y_1 = x^2$. |
| Phương trình hệ số không đổi có vế phải chứa tích hàm mũ và lượng giác | **Đổi biến số** $y = e^{\alpha x} z$ | Hệ số bất định dạng phức hợp | ⚠️ **Bẫy:** Xác định sai tần số góc $\beta$ hoặc tính sai số lần trùng nghiệm đặc trưng $r$ gây ra sai lệch hoàn toàn hệ số bất định. |
| Phương trình Euler có điều kiện ban đầu tại điểm âm (ví dụ $x_0 = -1$) | **Đổi biến $t = \ln(-x)$** | Đổi biến tổng quát $t = \ln\|x\|$ | ⚠️ **Bẫy cực nặng:** Nếu viết $t = \ln x$ khi miền xét có $x < 0$ thì phép thế sẽ bị vô nghĩa toán học. Bắt buộc phải viết $t = \ln\|x\|$. |
| Hệ phương trình chuẩn tắc có hệ số hằng số | **Phương pháp khử** | Trị riêng - Vectơ riêng (nếu đã học đại số tuyến tính nâng cao) | ⚠️ **Bẫy:** Khi đạo hàm và thế ngược, rất dễ nhầm lẫn dấu hoặc quên nhân phân phối hệ số hằng số ở các bước trung gian. |

---

## 5. KỸ THUẬT NÂNG CAO & CÁC CÔNG THỨC TÍNH NHANH

### 5.1. Công thức Cramer giải nhanh hệ Lagrange cấp 2
Trong phương pháp biến thiên hằng số Lagrange cho phương trình tuyến tính cấp 2: $y'' + p(x)y' + q(x)y = f(x)$, ta phải giải hệ:
$$\begin{cases} C_1'(x) y_1 + C_2'(x) y_2 = 0 \\ C_1'(x) y'_1 + C_2'(x) y'_2 = f(x) \end{cases}$$
Thay vì viết cả hệ và giải thủ công bằng phương pháp thế, ta có thể áp dụng ngay **công thức Cramer** để tính nhanh đạo hàm của các hệ số:
$$C_1'(x) = \frac{\begin{vmatrix} 0 & y_2 \\ f(x) & y'_2 \end{vmatrix}}{W(y_1, y_2)} = -\frac{y_2(x) f(x)}{W(y_1, y_2)}$$
$$C_2'(x) = \frac{\begin{vmatrix} y_1 & 0 \\ y'_1 & f(x) \end{vmatrix}}{W(y_1, y_2)} = \frac{y_1(x) f(x)}{W(y_1, y_2)}$$
Với $W(y_1, y_2) = y_1 y'_2 - y'_1 y_2$ là định thức Wronsky của hai nghiệm thuần nhất. 
* **Quy trình tính siêu tốc:**
    1. Tính định thức Wronsky $W(x)$.
    2. Áp dụng công thức Cramer tính ngay $C_1'(x)$ và $C_2'(x)$.
    3. Tích phân trực tiếp để tìm $C_1(x)$ và $C_2(x) \Rightarrow Y = C_1(x)y_1 + C_2(x)y_2$.

---

### 5.2. Bảng tra cứu nhanh hệ số bất định cho phương trình hệ số không đổi
Bảng dưới đây giúp xác định chính xác dạng nghiệm riêng $Y$ cho phương trình $y'' + p y' + q y = f(x)$ dựa trên vế phải $f(x)$ và nghiệm của phương trình đặc trưng $\lambda^2 + p\lambda + q = 0$.

| Dạng vế phải $f(x)$ | Trạng thái của số đặc trưng | Số mũ cộng hưởng $r$ | Dạng nghiệm riêng đoán nhận $Y$ |
| :--- | :--- | :--- | :--- |
| **Đa thức bậc $n$:** $P_n(x)$ | * $\lambda = 0$ không là nghiệm đặc trưng <br> * $\lambda = 0$ là nghiệm đơn đặc trưng ($q=0, p\neq0$) <br> * $\lambda = 0$ là nghiệm kép đặc trưng ($p=q=0$) | * $r = 0$ <br> * $r = 1$ <br> * $r = 2$ | * $Y = Q_n(x)$ <br> * $Y = x Q_n(x)$ <br> * $Y = x^2 Q_n(x)$ |
| **Mũ nhân đa thức:** $e^{\alpha x} P_n(x)$ | * $\alpha$ không là nghiệm đặc trưng <br> * $\alpha$ là nghiệm đơn đặc trưng <br> * $\alpha$ là nghiệm kép đặc trưng | * $r = 0$ <br> * $r = 1$ <br> * $r = 2$ | * $Y = e^{\alpha x} Q_n(x)$ <br> * $Y = x e^{\alpha x} Q_n(x)$ <br> * $Y = x^2 e^{\alpha x} Q_n(x)$ |
| **Lượng giác nhân đa thức:** <br> $P_m(x)\cos(\beta x) + P_n(x)\sin(\beta x)$ | * $\pm i\beta$ không là nghiệm đặc trưng <br> * $\pm i\beta$ là nghiệm đặc trưng | * $r = 0$ <br> * $r = 1$ | * $Y = Q_L(x)\cos(\beta x) + R_L(x)\sin(\beta x)$ <br> * $Y = x \left[ Q_L(x)\cos(\beta x) + R_L(x)\sin(\beta x) \right]$ <br> *(Với $L = \max(m,n)$)* |
| **Phức hợp:** <br> $e^{\alpha x} [ P_m(x)\cos(\beta x) + P_n(x)\sin(\beta x) ]$ | * $\alpha \pm i\beta$ không là nghiệm đặc trưng <br> * $\alpha \pm i\beta$ là nghiệm đặc trưng | * $r = 0$ <br> * $r = 1$ | * $Y = e^{\alpha x} [ Q_L(x)\cos(\beta x) + R_L(x)\sin(\beta x) ]$ <br> * $Y = x e^{\alpha x} [ Q_L(x)\cos(\beta x) + R_L(x)\sin(\beta x) ]$ <br> *(Với $L = \max(m,n)$)* |

---

### 5.3. Kỹ thuật nhân tử hóa toán tử vi phân (Toán tử D) - Giải nhanh trắc nghiệm
Toán tử vi phân $D = \frac{d}{dx}$ cho phép viết phương trình vi phân dưới dạng đại số tuyến tính:
$$y'' + p y' + q y = \left( D^2 + pD + q \right)y = f(x)$$
Nếu phương trình đặc trưng có hai nghiệm $\lambda_1, \lambda_2$, ta có thể nhân tử hóa toán tử:
$$\left( D - \lambda_1 \right)\left( D - \lambda_2 \right)y = f(x)$$
Đặt $z = (D - \lambda_2)y = y' - \lambda_2 y$. Phương trình trở thành hệ hai phương trình tuyến tính cấp 1 liên tiếp:
1. Giải $z' - \lambda_1 z = f(x)$ để tìm $z(x)$.
2. Giải $y' - \lambda_2 y = z(x)$ để tìm $y(x)$.
* **Ưu điểm:** Phương pháp này giúp phân rã hoàn toàn một phương trình vi phân cấp 2 bất kỳ (kể cả hệ số không biến thiên hoặc vế phải không đặc biệt) thành hai bài toán cấp 1 cực kỳ cơ bản, tránh việc phải dùng hệ phương trình Lagrange phức tạp.

---

### 5.4. Các công thức vi phân nhanh thường gặp (Nhận dạng vi phân toàn phần trực tiếp)
Một số biểu thức vi phân ghép đôi có thể quy gọn ngay lập tức giúp giải nhanh phương trình vi phân toàn phần hoặc tìm thừa số tích phân bằng mắt thường:
* $x dy + y dx = d(xy)$
* $\frac{x dy - y dx}{x^2} = d\left(\frac{y}{x}\right)$
* $\frac{y dx - x dy}{y^2} = d\left(\frac{x}{y}\right)$
* $\frac{x dy - y dx}{xy} = d\left> \ln\left|\frac{y}{x}\right| \right)$
* $\frac{x dy - y dx}{x^2 + y^2} = d\left( \arctan\left(\frac{y}{x}\right) \right)$
* $\frac{x dx + y dy}{x^2 + y^2} = d\left( \frac{1}{2} \ln(x^2 + y^2) \right)$
* $e^x(ydx + dy) = d(e^x y)$
* $e^y(dx + xdy) = d(e^y x)$

💡 **Ví dụ áp dụng nhanh:** Giải phương trình $x dx + y dy = \frac{x dy - y dx}{x^2 + y^2}$.
Nhận dạng vi phân trực tiếp:
$$d\left( \frac{1}{2}(x^2 + y^2) \right) = d\left( \arctan\left(\frac{y}{x}\right) \right)$$
Lấy tích phân hai vế ta có ngay tích phân tổng quát cực kỳ đẹp mắt mà không cần qua các bước tích phân đường phức tạp:
$$\frac{1}{2}(x^2 + y^2) = \arctan\left(\frac{y}{x}\right) + C$$
