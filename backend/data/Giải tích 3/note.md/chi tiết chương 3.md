## Chuông 3: PHUỘNG PHÁP BIÊN DÔI LAPLACE

BỤ MÔN TOÁN CO' BÁN

VIỆN TOÁN UÑNG DỤNG VÀ TIN HỘC

DAI HỘC BÁCH KHOA HÀ NỘI

SAMI (HUST)-version 2023

## Chuông 3: PHUỘNG PHÁP BIÊN DÔI LAPLACE

1 Bài 1: PHÉP BIÉN DÔI LAPLACE VÀ BIÉN DÔI NGUỘC

2 Bài 2: BIÊN DÔI LAPLACE CÙA DÃO HÀM, TÍCH PHÂN

3 Bài 3: PHÉP TỊNH TIÊN VÀ PHÂN THÚC DỒN GIÁN

4 Bài 4: DÃO HAM, TÍCH PHÂN VÀ TÍCH CÙA CÁC PHÉP BIÉN DÔI

## Chúng 3: PHU'ONG PHÁP TOÁN TU' LAPLACE

## Bài 1: PHÉP BIÊN DÔI LAPLACE

VÀ BIÊN DÔI NGUỘC

## Bài 1: Phép biên dôii Laplace và biên dôii nguoc

## I. Phép biên dôi Laplace

1. Dinh nghia: Cho $f$ là hàm xác định trên $[0, \infty)$ và liên túc tùng khúc trên mõi doạn hũu hạn. Nếu tích phân suy rông

$$
\int_ {0} ^ {\infty} e ^ {- s t} f (t) d t \mathrm {v o i} s \in D \subset \mathbb {R}
$$

hоі tү thі ta дат

$$
F (s) := \int_ {0} ^ {\infty} e ^ {- s t} f (t) d t, \mathrm {t r o n g d o} s \in D
$$

và gội hàm $F$ là biên dôi Laplace của hàm $f$. Ký hiêu: $F(s) = \mathcal{L}\{f(t)\}(s)$.

Ví du: a) $ f(t)=1 $ b) $ f(t)=e^{at}, a\in\mathbb{R} $ c) $ f(t)=t^{a}, a>-1 $

## Bài 1: Phép biên dôii Laplace và biên dôii nguoc

## I. Phép biên dôi Laplace

1. Dinh nghia: Cho $f$ là hàm xác định trên $[0, \infty)$ và liên túc tùng khúc trên mối doạn hũu hạn. Nếu tích phân suy rông

$$
\int_ {0} ^ {\infty} e ^ {- s t} f (t) d t \mathrm {v o i} s \in D \subset \mathbb {R}
$$

hоі tүu thі ta дат

$$
F (s) := \int_ {0} ^ {\infty} e ^ {- s t} f (t) d t, \mathrm {t r o n g d o} s \in D
$$

và gội hàm $F$ là biên dôi Laplace của hàm $f$. Ký hiêu: $F(s) = \mathcal{L}\{f(t)\}(s)$.

Ví du: a) $ f(t)=1 $ b) $ f(t)=e^{at}, a\in\mathbb{R} $ c) $ f(t)=t^{a}, a>-1 $

Giài: a) $ F(s) = \int_{0}^{\infty} e^{-st} dt = -\frac{e^{-st}}{s} \Big|_{0}^{\infty} = \frac{1}{s} \left( 1 - \lim_{A \to \infty} e^{-sA} \right) = \frac{1}{s} \mathrm{nêu} s > 0. $ Không tôn tài $ F(s) $

khi $ s\leq 0. $

b) $ F(s)=\int_{0}^{\infty} e^{-st} e^{at} d t=\int_{0}^{\infty} e^{-(s-a)t} d t=-\frac{e^{-(s-a)t}}{s-a}\bigg|_{0}^{\infty}=\frac{1}{s-a} \mathrm{nêu} s>a. $ Không tôn tài

$$
F (s) \mathrm {k h i} s \leq a.
$$

## Bài 1: Phép biên dôii Laplace và biên dôii nguoc

c) $ F(s)=\int_{0}^{\infty} e^{-st} t^{a} d t. $ Đặt $ z=st \Rightarrow t=\frac{z}{s} \Rightarrow dt=\frac{1}{s} dz. $

Xét $ s>0 $ , ta có: $ F(s)=\frac{1}{s^{a+1}}\int_{0}^{\infty} e^{-z} z^{a} d z=\frac{1}{s^{a+1}}. \Gamma(a+1), $ trong đó $ \Gamma(\alpha):=\int_{0}^{\infty} e^{-z} z^{\alpha-1} d z $ duoc

goi là hàm Gamma.

## Bài 1: Phép biên dôii Laplace và biên dôii nguoc

c) $ F(s) = \int_{0}^{\infty} e^{-st} t^{a} d t. $ Dat $ z=st \Rightarrow t=\frac{z}{s} \Rightarrow d t=\frac{1}{s} d z. $

Xét $ s > 0 $ , ta có: $ F(s)=\frac{1}{s^{a+1}}\int_{0}^{\infty} e^{-z} z^{a} dz=\frac{1}{s^{a+1}}.\Gamma(a+1) $ , trong đó $ \Gamma(\alpha):=\int_{0}^{\infty} e^{-z} z^{\alpha-1} dz $ được goi là hàm Gamma.

d) Thay $ a=n $ trong cau c) ta có: $ F(s)=\frac{1}{s^{n+1}}.\Gamma(n+1) $ , trong do $ \Gamma(n+1):=\int_{0}^{\infty}e^{-z}z^{n}dz. $ Thuc hien tich phan tung phan n lan cho ham Gamma, ta duoc $ \Gamma(n+1)=n! \Rightarrow F(s)=\frac{n!}{s^{n+1}} $ với $ s>0. $

## Bài 1: Phép biên dôii Laplace và biên dôii nguoc

c) $ F(s)=\int_{0}^{\infty} e^{-st} t^{a} d t. $ Đặt $ z=st \Rightarrow t=\frac{z}{s} \Rightarrow dt=\frac{1}{s} dz. $

Xét $ s>0 $ , ta có: $ F(s)=\frac{1}{s^{a+1}}\int_{0}^{\infty} e^{-z} z^{a} d z=\frac{1}{s^{a+1}}. \Gamma(a+1) $ , trong đó $ \Gamma(\alpha):=\int_{0}^{\infty} e^{-z} z^{\alpha-1} d z $ được

goi là hàm Gamma.

d) Thay $ a=n $ trong câu c) ta có: $ F(s)=\frac{1}{s^{n+1}}. \Gamma(n+1) $ , trong đó $ \Gamma(n+1):=\int_{0}^{\infty} e^{-z} z^{n} d z. $ Thuc

hiên tích phân tùng phân $ n $ lân cho hàm Gamma, ta được $ \Gamma(n+1)=n! \Rightarrow F(s)=\frac{n!}{s^{n+1}} $ với $ s>0. $

e) $ F(s)=\int_{0}^{\infty} e^{-st} \cos k t d t. $ Thuc hiên tích phân tùng phân 2 lân ta có:

$ F(s)=\frac{1}{s}-\frac{k^{2}}{s^{2}} F(s)\Rightarrow\left(1+\frac{k^{2}}{s^{2}}\right) F(s)=\frac{1}{s}\Rightarrow F(s)=\frac{s}{s^{2}+k^{2}} $ với $ s>0. $

f) $ F(s)=\int_{0}^{\infty} e^{-st} \sin k t d t. $ Thuc hiên tích phân tùng phân 2 lân ta có:

$ F(s)=\frac{k}{s^{2}}-\frac{k^{2}}{s^{2}} F(s)\Rightarrow\left(1+\frac{k^{2}}{s^{2}}\right) F(s)=\frac{k}{s^{2}}\Rightarrow F(s)=\frac{k}{s^{2}+k^{2}} $ với $ s>0. $

## Bài 1: Phép biên doi Laplace và biên doi nguoc

2. Tính chát tuyến tính: Cho 2 hàm số $f(t)$ và $g(t)$. Nếu tôn tại $\mathcal{L}\{f(t)\}$ và $\mathcal{L}\{g(t)\}$, thì với mọi hàng số $\alpha, \beta \in \mathbb{R}$ ta luôn có:

$$
\mathcal {L} \left\{\alpha f (t) + \beta g (t) \right\} (s) = \alpha \mathcal {L} \left\{f (t) \right\} (s) + \beta \mathcal {L} \left\{g (t) \right\} (s).
$$

## Bài 1: Phép biên dôi Laplace và biên dôi nguoc

2. Tính chát tuyến tính: Cho 2 hàm số $f(t)$ và $g(t)$. Nếu tôn tại $\mathcal{L}\{f(t)\}$ và $\mathcal{L}\{g(t)\}$, thì với mọi hàng số $\alpha, \beta \in \mathbb{R}$ ta luôn có:

$$
\mathcal {L} \left\{\alpha f (t) + \beta g (t) \right\} (s) = \alpha \mathcal {L} \left\{f (t) \right\} (s) + \beta \mathcal {L} \left\{g (t) \right\} (s).
$$

C/M:

$$
\begin{array}{l} \mathcal {L} \left\{\alpha f (t) + \beta g (t) \right\} (s) = \int_ {0} ^ {\infty} e ^ {- s t} \left(\alpha f (t) + \beta g (t)\right) d t = \lim _ {A \rightarrow \infty} \int_ {0} ^ {A} e ^ {- s t} \left(\alpha f (t) + \beta g (t)\right) d t. \\ \mathrm {V i} \mathcal {L} \{f (t) \} (s) = \int_ {0} ^ {\infty} e ^ {- s t} f (t) d t \mathrm {v a} \mathcal {L} \{g (t) \} (s) = \int_ {0} ^ {\infty} e ^ {- s t} g (t) d t \mathrm {t o n t a i}, \mathrm {n e n t o n t a i} \\ \lim _ {A \rightarrow \infty} \int_ {0} ^ {A} e ^ {- s t} f (t) d t \quad \mathrm {v a} \quad \lim _ {A \rightarrow \infty} \int_ {0} ^ {A} e ^ {- s t} g (t) d t. \\ \end{array}
$$

Khi do: VP(*) $ = \alpha \lim_{A\to \infty}\int_{0}^{A} e^{-st} f(t)dt + \beta \lim_{A\to \infty}\int_{0}^{A} e^{-st} g(t)dt $ $ = \alpha \mathcal{L}\{f(t)\}(s) + \beta \mathcal{L}\{g(t)\}(s)\Rightarrow \mathrm{dpcm}. $

## Bài 1: Phép biên doi Laplace và biên doi nguoc

<u>Ví du:</u> a) $ \mathcal{L}\{3 t^{2}+4 t^{3}\} $ c) $ \mathcal{L}\{\cosh k t\} $

b) $ \mathcal{L}\{3 e^{2 t}+2 \sin^{2} 3 t\} $ d) $ \mathcal{L}\{\sinh k t\} $

Chú ́: Hai hàm sô hyperbolic duoc xác định bôi công thúc

$$
\cosh x = \frac {e ^ {x} + e ^ {- x}}{2} \quad \mathrm {v a t} \quad \sinh x = \frac {e ^ {x} - e ^ {- x}}{2}.
$$

## Bài 1: Phép biên dôi Laplace và biên dôi nguoc

<u>Ví du:</u> a) $ \mathcal{L}\{3t^{2}+4t^{3}\} $ b) $ \mathcal{L}\{3e^{2t}+2\sin^{2}3t\} $ c) $ \mathcal{L}\{\cosh kt\} $ d) $ \mathcal{L}\{\sinh kt\} $

Chú ́: Hai hàm só hyperbolic được xác định bôi công thúc

$$
\cosh x = \frac {e ^ {x} + e ^ {- x}}{2} \quad \mathrm {v a t} \quad \sinh x = \frac {e ^ {x} - e ^ {- x}}{2}.
$$

Giài: Ta có

$$
\mathcal {L} \left\{3 t ^ {2} + 4 t ^ {3} \right\} = 3 \mathcal {L} \left\{t ^ {2} \right\} + 4 \mathcal {L} \left\{t ^ {3} \right\} = 3 \frac {2 !}{s ^ {3}} + 4 \frac {3 !}{s ^ {4}} = \frac {6 s + 2 4}{s ^ {4}} \mathrm {v o i} s > 0.
$$

$$
\begin{array}{l} \mathcal {L} \left\{3 e ^ {2 t} + 2 \sin^ {2} 3 t \right\} = 3 \mathcal {L} \left\{e ^ {2 t} \right\} + \mathcal {L} \left\{1 \right\} - \mathcal {L} \left\{\cos 6 t \right\} \\ = \frac {3}{s - 2} + \frac {1}{s} - \frac {s}{s ^ {2} + 3 6} \mathrm {v o i} s > 2. \\ \end{array}
$$

$$
\mathcal {L} \left\{\sinh k t \right\} = \frac {1}{2} \left(\mathcal {L} \left\{e ^ {k t} \right\} - \mathcal {L} \left\{e ^ {- k t} \right\}\right) = \frac {1}{2} \left(\frac {1}{s - k} - \frac {1}{s + k}\right) = \frac {k}{s ^ {2} - k ^ {2}} \mathrm {v o i} s > | k |.
$$

## Bài 1: Phép biên dôi Laplace và phép biên dôi nguoc

## 3. Bàng các phép biên doi Laplace

<table border="1"><tr><td>f(t)</td><td>F(s)</td><td>s</td></tr><tr><td>1</td><td>$\frac{1}{s}$</td><td>s&gt;0</td></tr><tr><td>$t^{n}(n\in\mathbb{N})$</td><td>$\frac{n!}{s^{n+1}}$</td><td>s&gt;0</td></tr><tr><td>$t^{a}(a\in\mathbb{R},a>-1)$</td><td>$\frac{\Gamma(a+1)}{s^{a+1}}$</td><td>s&gt;0</td></tr><tr><td>$e^{at}$</td><td>$\frac{1}{s-a}$</td><td>s&gt;a</td></tr><tr><td>$\cos kt$</td><td>$\frac{s}{s^{2}+k^{2}}$</td><td>s&gt;0</td></tr><tr><td>$\sin kt$</td><td>$\frac{k}{s^{2}+k^{2}}$</td><td>s&gt;0</td></tr><tr><td>$\cosh kt$</td><td>$\frac{s}{s^{2}-k^{2}}$</td><td>s&gt;|k|</td></tr><tr><td>$\sinh kt$</td><td>$\frac{k}{s^{2}-k^{2}}$</td><td>s&gt;|k|</td></tr></table>

Chu y: Hàm Gamma $ \Gamma(\alpha)=\int_{0}^{\infty} x^{\alpha-1} e^{-x} d x $ thoa mân $ \Gamma(\alpha+1)=\alpha\Gamma(\alpha) $ và $ \Gamma(\frac{1}{2})=\sqrt{\pi}. $

## Bài 1: Phép biên dôi Laplace và biên dôi nguoc

## 4. Sư tôn tải của phép biên doi Laplace

- Định nghịa: Hàm $f(t)$ được gội là bì chăn mũ trên $[0, \infty)$ nếu tôn tải các hàng số không am $M$ và $\alpha$ sao cho

$$
| f (t) | \leq M e ^ {\alpha t} \quad \text {v o i m o i} t \geq 0.
$$

* Dính lý 1: Nếu hàm sô $f(t)$ thôa mân:

i) liên tuc tùng khúc trên $ [0, \infty), $

ii) là hàm bì chăn mũ trên $[0, \infty)$,

thì luôn tôn tài $\mathcal{L}\{f(t)\}(s)$ với $s > \alpha$, trong đó $\alpha$ là hàng só trong định nghĩa trên.

## Bài 1: Phép biên dôii Laplace và biên dôii nguoc

## 4. Sư tôn tái của phép biên doi Laplace

- Định nghịa: Hàm $f(t)$ được gội là bì chăn mũ trên $[0, \infty)$ nếu tôn tải các hàng số không am $M$ và $\alpha$ sao cho

$$
| f (t) | \leq M e ^ {\alpha t} \quad \text {v o i m o i} t \geq 0.
$$

* Dính lý 1: Nếu hàm sô $f(t)$ thôa mân:

i) liên tuc tùng khúc trên $ [0, \infty), $

ii) là hàm bì chăn mü trên $[0, \infty)$,

thì luôn tôn tài $\mathcal{L}\{f(t)\}(s)$ với $s > \alpha$, trong đó $\alpha$ là hàng só trong định nghĩa trên.

C/M: Vì $ f(t) $ là hàm bị chăn mũ trên $ [0,\infty) $ nên tôn tai các hàng sô không am $ M $ và $ \alpha $ sao cho $ |f(t)| \leq Me^{\alpha t} $ với mọi $ t \geq 0. $ Ta có:

$$
\begin{array}{l} \left| \int_ {0} ^ {A} e ^ {- s t} f (t) d t \right| \leq \int_ {0} ^ {A} \left| e ^ {- s t} f (t) \right| d t = \int_ {0} ^ {A} e ^ {- s t} | f (t) | d t \\ \leq \int_ {0} ^ {A} e ^ {- s t} M e ^ {\alpha t} d t = M \int_ {0} ^ {A} e ^ {- (s - \alpha) t} d t = \frac {M}{s - \alpha} \left(1 - e ^ {- (s - \alpha) A}\right) \\ \leq \frac {M}{s - \alpha} \mathrm {v o i} s > \alpha . \\ \end{array}
$$

Cho $ A \to \infty $ , ta có: $ |F(s)|=\left|\int_{0}^{\infty} e^{-st} f(t)dt\right|=\left|\lim_{A\to\infty}\int_{0}^{A} e^{-st} f(t)dt\right|\leq \frac{M}{s-\alpha} \mathrm{vói} s > \alpha. $ Khi có:

$F(s)$ luôn là hũu hăn, túc là $F(s)$ tôn tài vói mοi $s > \alpha \Rightarrow$ dpcm.

- **Hê quá:** Nếu hàm số $f(t)$ thoà măn già thiêm của Dính lý 1, thì

$$
\lim _ {s \rightarrow \infty} F (s) = 0.
$$

## Bài 1: Phép biên dôi Laplace và phép biên dôi nguoc

## II. Biên doi Laplace ngưçc

## 1. Sư duy nhât của biên doi Laplace nguoc

- Dịnh lý 2: Già sử 2 hàm số $f(t)$ và $g(t)$ thoà măn các già thiêm của Dịnh lý 1 để tôn tái $F(s) = \mathcal{L}\{f(t)\}(s)$ và $G(s) = \mathcal{L}\{g(t)\}(s)$. Khi đó: Nếu

$$
F (s) = G (s) \mathrm {v o i m o i} s > \alpha ,
$$

trong đó $\alpha$ là hàng só trong Dinh lý 1, thì

$f(t) = g(t)$ tai nhũng giá trì cua $t$ mà cà 2 hàm sô liên túc.

## Bài 1: Phép biên dôi Laplace và phép biên dôi nguoc

## II. Biên doi Laplace ngưçc

## 1. Sư duy nhât của biên doi Laplace nguoc

- Định lý 2: Già sử 2 hàm số $f(t)$ và $g(t)$ thoà măn các già thiêm của Định lý 1 để tôn tài $F(s) = \mathcal{L}\{f(t)\}(s)$ và $G(s) = \mathcal{L}\{g(t)\}(s)$. Khi đó: Nếu

$$
F (s) = G (s) \mathrm {v o i m o i} s > \alpha ,
$$

trong đó $\alpha$ là hàng só trong Dinh lý 1, thì

$f(t) = g(t)$ tai nhũng giá trì cua $t$ mà cá 2 hàm sô liên tuc.

2. Dịnh nghịa: Nếu $ F(s) = \mathcal{L}\{f(t)\}(s)$, thì ta nói $ f(t) $ là biên doi Laplace ngược của hàm số $ F(s) $ và viêt

$$
f (t) = \mathcal {L} ^ {- 1} \{F (s) \}.
$$

$$
\mathcal {L} ^ {- 1} \left\{\frac {6}{s ^ {4}} \right\} = t ^ {3}
$$

$$
\mathcal {L} ^ {- 1} \left\{\frac {1}{s - 5} \right\} = e ^ {5 t}
$$

$$
) \mathcal {L} ^ {- 1} \left\{\frac {2}{s ^ {2} + 4} \right\} = \sin 2 t
$$

d) $ \mathcal{L}^{-1}\left\{\frac{s}{s^{2}-9}\right\}=\cosh 3t $

## Bài 1: Phép biên dôi Laplace và phép biên dôi nguoc

## II. Biên doi Laplace nguốc

## 1. Sử duy nhật của biên doi Laplace nguồn

- Định lý 2: Giá sử 2 hàm số $f(t)$ và $g(t)$ thoà măn các già thiêm của Định lý 1 để tôn tài $F(s) = \mathcal{L}\{f(t)\}(s)$ và $G(s) = \mathcal{L}\{g(t)\}(s)$. Khi đó: Nếu

$$
F (s) = G (s) \mathrm {v o i m o i} s > \alpha ,
$$

trong đó $\alpha$ là hàng só trong Dinh lý 1, thì

$f(t) = g(t)$ tai nhũng giá trì cua $t$ mà cá 2 hàm sô liên tuc.

2. Dịnh nghĩa: Nếu $ F(s) = \mathcal{L}\{f(t)\}(s)$, thì ta nói $ f(t) $ là biên doi Laplace ngước của hàm số $ F(s) $ và viêt

$$
f (t) = \mathcal {L} ^ {- 1} \{F (s) \}.
$$

$$
\mathcal {L} ^ {- 1} \left\{\frac {6}{s ^ {4}} \right\} = t ^ {3}
$$

b) $ \mathcal{L}^{-1}\left\{\frac{1}{s-5}\right\}=e^{5t} $

$$
\mathcal {L} ^ {- 1} \left\{\frac {2}{s ^ {2} + 4} \right\} = \sin 2 t
$$

$$
\mathcal {L} ^ {- 1} \left\{\frac {s}{s ^ {2} - 9} \right\} = \cosh 3 t
$$

3. Tính chât tuyên tính: Voi moci hàng sô $\alpha, \beta \in \mathbb{R}$ ta luôn có:

$$
\mathcal {L} ^ {- 1} \left\{\alpha F (s) + \beta G (s) \right\} = \alpha \mathcal {L} ^ {- 1} \left\{F (s) \right\} + \beta \mathcal {L} ^ {- 1} \left\{G (s) \right\}.
$$

## Bài 1: Phép biên dôi Laplace và phép biên dôi nguoc

Ví du: Tính a) $ \mathcal{L}^{-1}\left\{\frac{s^{2}+1}{s^{3}}\right\} $ b) $ \mathcal{L}^{-1}\left\{\frac{4}{s^{2}-8s+15}\right\} $ c) $ \mathcal{L}^{-1}\left\{\frac{3s-1}{s^{2}+5}\right\} $ d) $ \mathcal{L}^{-1}\left\{\frac{-2s+1}{s^{2}-4}\right\} $

$$
\mathrm {T a} \mathrm {c o} \frac {s ^ {2} + 1}{s ^ {3}} = \frac {1}{s} + \frac {1}{2 !}. \frac {2 !}{s ^ {3}} \Rightarrow \mathcal {L} ^ {- 1} \left\{\frac {s ^ {2} + 1}{s ^ {3}} \right\} = \mathcal {L} ^ {- 1} \left\{\frac {1}{s} \right\} + \frac {1}{2} \mathcal {L} ^ {- 1} \left\{\frac {2 !}{s ^ {3}} \right\} = 1 + \frac {1}{2} t ^ {2}.
$$

$$
\begin{array}{l} \Rightarrow \mathcal {L} ^ {- 1} \left\{\frac {4}{s ^ {2} - 8 s + 1 5} \right\} = 2 \left(\mathcal {L} ^ {- 1} \left\{\frac {1}{s - 5} \right\} - \mathcal {L} ^ {- 1} \left\{\frac {1}{s - 3} \right\}\right) = 2 \left(e ^ {5 t} - e ^ {3 t}\right). \\ \end{array}
$$

$$
\begin{array}{l} \mathrm {c)} \mathrm {T a c o} \frac {3 s - 1}{s ^ {2} + 5} = 3 \frac {s}{s ^ {2} + (\sqrt {5}) ^ {2}} - \frac {1}{\sqrt {5}} \frac {\sqrt {5}}{s ^ {2} + (\sqrt {5}) ^ {2}} \\ \Rightarrow \mathcal {L} ^ {- 1} \left\{\frac {3 s - 1}{s ^ {2} + 5} \right\} = 3 \mathcal {L} ^ {- 1} \left\{\frac {s}{s ^ {2} + (\sqrt {5}) ^ {2}} \right\} - \frac {1}{\sqrt {5}} \mathcal {L} ^ {- 1} \left\{\frac {\sqrt {5}}{s ^ {2} + (\sqrt {5}) ^ {2}} \right\} = 3 \cos \sqrt {5} t - \frac {1}{\sqrt {5}} \sin \sqrt {5} t. \\ \end{array}
$$

d) Tuong tu cau c), ta có $ \mathcal{L}^{-1}\left\{\frac{-2s+1}{s^{2}-4}\right\}=-2\cosh 2t+\frac{1}{2}\sinh 2t. $

## Chuong 3: PHU'ONG PHÁP BIÊN DÔI LAPLACE

<div align="center">

Bài 2: BIÊN DÔI LAPLACE CụA DAO HAM, TÍCH PHÂN

</div>

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

## I. Biên doi Laplace củaDao hàm

1. Dinh nghia: Hàm $f(t)$ được goi là trôn tùng khúc trên $[a,b]$ nếu nó khá vi trên $[a,b]$ (trù ra một số hữu hàn diêm) và $f'(t)$ liên túc tùng khúc trên $[a,b]$.

2. Dính lý (Đao hàm cáp 1): Nếu hàm $f(t)$ thoa măn già thiêt

i) liên tuc và trôn tùng khúc trên $[0, \infty)$,

ii) là hàm bị chăn mũ trên $ [0, \infty) $ , túc là tôn tài các hàng sô không am $ M $ và $ \alpha $ sao cho $ | f ( t ) | \leq M e^{\alpha t} $ với mọi $ t \geq 0 $ ,

thì luôn tôn tài $\mathcal{L}\{f'(t)\}(s)$ vói $s > \alpha$ và

$$
\mathcal {L} \{f ^ {\prime} (t) \} (s) = s \mathcal {L} \{f (t) \} (s) - f (0).
$$

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

## I. Biên doi Laplace của dao hàm

1. Dinh nghia: Hàm $f(t)$ được goi là trôn tùng khúc trên $[a,b]$ nếu nó khá vi trên $[a,b]$ (trù ra một số hữu hàn diêm) và $f'(t)$ liên túc tùng khúc trên $[a,b]$.

2. Dính lý (Đao hàm cáp 1): Nếu hàm $f(t)$ thoa măn già thiêt

i) liên tuc và trôn tùng khúc trên $[0, \infty)$,

ii) là hàm bị chăn mũ trên $ [0, \infty) $ , túc là tôn tài các hàng sô không am $ M $ và $ \alpha $ sao cho $ | f ( t ) | \leq M e^{\alpha t} $ với mọi $ t \geq 0 $ ,

thì luôn tôn tài $\mathcal{L}\{f'(t)\}(s)$ vói $s > \alpha$ và

$$
\mathcal {L} \left\{f ^ {\prime} (t) \right\} (s) = s \mathcal {L} \left\{f (t) \right\} (s) - f (0).
$$

C/M: Ta có:

$$
\mathcal {L} \left\{f ^ {\prime} (t) \right\} (s) = \int_ {0} ^ {\infty} e ^ {- s t} f ^ {\prime} (t) d t = \int_ {0} ^ {\infty} e ^ {- s t} d f (t) = e ^ {- s t} f (t) \Big | _ {0} ^ {\infty} + s \int_ {0} ^ {\infty} e ^ {- s t} f (t) d t
$$

Theo già thiet ii): $|e^{-st}f(t)| \leq Me^{-st}e^{\alpha t} = Me^{-(s-\alpha)t}$ $\forall t \geq 0$. Vi $\lim_{t \to \infty} e^{-(s-\alpha)t} = 0$ vói $s > \alpha$

$$
\Rightarrow \lim _ {t \rightarrow \infty} e ^ {- s t} f (t) = 0 \Rightarrow e ^ {- s t} f (t) \Big | _ {0} ^ {\infty} = - f (0) \mathrm {v o i} s > \alpha .
$$

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

Một khác: Theo Đinh lý 1 (Bài 1), gia thiêm của định lý này suy ra tôn tái $\mathcal{L}\{f(t)\}(s)$ với $s > \alpha$, túc là $F(s) = \int_{0}^{\infty} e^{-st} f(t) dt \Rightarrow \mathrm{VP}(*) = sF(s) - f(0) \Rightarrow \mathrm{dpcm}$.

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

Măt khác: Theo Đinh lý 1 (Bài 1), giă thiêt của dính lý này suy ra tôn tài $\mathcal{L}\{f(t)\}(s)$ vovi $s > \alpha$, túc là $F(s) = \int_{0}^{\infty} e^{-st} f(t) dt \Rightarrow \mathrm{VP}(*) = sF(s) - f(0) \Rightarrow \mathrm{dpcm}$.

3. Hê quá (Đao hàm cáp cao): Nếu các hàm $ f(t), f^{\prime}(t), \dots , f^{(n-1)}(t) $ thoa măn giá thiệt i) liên tUC và trơn tùng khúc trên $ [0, \infty) $

ii) là hàm bì chăn mũ trên $[0, \infty)$,

thì luôn tôn tài $\mathcal{L}\{f^{(n)}(t)\}(s)$ vόi $s > \alpha$ và

$$
\mathcal {L} \left\{f ^ {(n)} (t) \right\} (s) = s ^ {n} \mathcal {L} \left\{f (t) \right\} (s) - s ^ {n - 1} f (0) - s ^ {n - 2} f ^ {\prime} (0) - \dots - f ^ {(n - 1)} (0).
$$

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

Mật khác: Theo Đinh lý 1 (Bài 1), gia thiệt của định lý này suy ra tôn tại $\mathcal{L}\{f(t)\}(s)$ với $s > \alpha$, túc là $F(s) = \int_{0}^{\infty} e^{-st} f(t) dt \Rightarrow \mathrm{VP}(*) = sF(s) - f(0) \Rightarrow \mathrm{dpcm}$.

3. Hê quá (Dao hàm cáp cao): Nếu các hàm $ f(t), f^{\prime}(t), \dots , f^{(n-1)}(t) $ thoa măn giá thiệt i) liên tUC và trơn tùng khúc trên $ [0, \infty) $

ii) là hàm bì chăn mũ trên $[0, \infty)$,

thì luôn tôn tài $\mathcal{L}\{f^{(n)}(t)\}(s)$ vόi $s > \alpha$ và

$$
\mathcal {L} \left\{f ^ {(n)} (t) \right\} (s) = s ^ {n} \mathcal {L} \left\{f (t) \right\} (s) - s ^ {n - 1} f (0) - s ^ {n - 2} f ^ {\prime} (0) - \dots - f ^ {(n - 1)} (0).
$$

C/M: Ta sử dụng láp luân quy náp toán học. Đâu tiên, $n = 1$ công thức trên dúng (chúng minh trên).

- Giá sù nó dúng cho $n = k$, túc là

$$
\mathcal {L} \left\{f ^ {(k)} (t) \right\} (s) = s ^ {k} \mathcal {L} \left\{f (t) \right\} (s) - s ^ {k - 1} f (0) - s ^ {k - 2} f ^ {\prime} (0) - \dots - f ^ {(k - 1)} (0)
$$

- Ta chúng minh nó cüng dúng cho $n = k + 1$, túc là

$$
\mathcal {L} \left\{f ^ {(k + 1)} (t) \right\} (s) = s ^ {k + 1} \mathcal {L} \left\{f (t) \right\} (s) - s ^ {k} f (0) - s ^ {k - 1} f ^ {\prime} (0) - \dots - f ^ {(k)} (0)
$$

That vay, det $ g(t)=f^{(k)}(t) $

$$
\Rightarrow \mathrm {V T} (2) = \mathcal {L} \left\{g ^ {\prime} (t) \right\} (s) = s G (s) - g (0) = s \mathcal {L} \left\{f ^ {(k)} (t) \right\} (s) - f ^ {(k)} (0) = \mathrm {V P} (2) \mathrm {d o} (1).
$$

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

## II. Một số ap dung doi với biên doi Laplace củaDao hàm

## 1. Áp dung vào giái bài toán vói giá trì ban dâu

- Ví dú: Giái các PT, HPT voi giá trì ban dâu sau dây:

$$
\mathrm {a}) x ^ {\prime \prime} + 4 x = \sin 3 t, \quad x (0) = x ^ {\prime} (0) = 0.
$$

b)

$$
b) x ^ {\prime \prime} - 5 x ^ {\prime} + 6 x = 3, \quad x (0) = x ^ {\prime} (0) = 0.
$$

c)

$$
\left\{ \begin{array}{l l} x ^ {\prime} + 2 y ^ {\prime} + x = 0, & x (0) = 0, \\ x ^ {\prime} - y ^ {\prime} + y = 0, & y (0) = 1. \end{array} \right.
$$

d)

$$
\left\{ \begin{array}{l l} x ^ {\prime \prime} + 2 x + 4 y = 0, & x (0) = y (0) = 0, \\ y ^ {\prime \prime} + x + 2 y = 0, & x ^ {\prime} (0) = y ^ {\prime} (0) = - 1. \end{array} \right.
$$

e)

$$
\left\{ \begin{array}{l l} x ^ {\prime \prime} + 3 x - y = 0, \quad x (0) = y (0) = 0, \\ y ^ {\prime \prime} - 2 x + 2 y = 4 0 \sin 3 t, \quad x ^ {\prime} (0) = y ^ {\prime} (0) = 0. \end{array} \right.
$$

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

## II. Một số áp dụngdoi với biên doi Laplace của dao hàm

## 1. Áp dưng vào giái bài toán vói giá trị ban dâu

* Ví du: Giài các PT, HPT voi giá trì ban dâu sau dây:

$$
\mathrm {a}) x ^ {\prime \prime} + 4 x = \sin 3 t, \quad x (0) = x ^ {\prime} (0) = 0.
$$

$$
\left\{ \begin{array}{l l} x ^ {\prime} + 2 y ^ {\prime} + x = 0, & x (0) = 0, \\ x ^ {\prime} - y ^ {\prime} + y = 0, & y (0) = 1. \end{array} \right.
$$

$$
\left\{ \begin{array}{l l} x ^ {\prime \prime} + 2 x + 4 y = 0, & x (0) = y (0) = 0, \\ y ^ {\prime \prime} + x + 2 y = 0, & x ^ {\prime} (0) = y ^ {\prime} (0) = - 1. \end{array} \right.
$$

$$
\left\{ \begin{array}{l l} x ^ {\prime \prime} + 3 x - y = 0, & x (0) = y (0) = 0, \\ y ^ {\prime \prime} - 2 x + 2 y = 4 0 \sin 3 t, & x ^ {\prime} (0) = y ^ {\prime} (0) = 0. \end{array} \right.
$$

## Cách giài:

B1: Đặt $F(s) = \mathcal{L}\{f(t)\}(s)$. Biên đối Laplace 2 về kết hợp sử dụng công thức biên đối Laplace của đạo hàm và điều kiện ban đạo để tính $F(s)$.

B2: Sử dụng biên đối Laplace ngược để tìm ra nghiem $f(t)$.

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

Giài: a) Đật $X(s) = \mathcal{L}\{x(t)\}(s)$, biên dôi Laplace 2 vê ta có:

$$
\begin{array}{l} \mathcal {L} \left\{x ^ {\prime \prime} (t) \right\} (s) + 4 \mathcal {L} \left\{x (t) \right\} (s) = \mathcal {L} \left\{\sin 3 t \right\} (s) \\ \Leftrightarrow s ^ {2} X (s) - s x (0) - x ^ {\prime} (0) + 4 X (s) = \frac {3}{s ^ {2} + 9} \\ \Leftrightarrow X (s) = \frac {3}{(s ^ {2} + 4) (s ^ {2} + 9)} \\ \mathrm {T a} \mathrm {c o}: X (s) = \frac {3}{5} \left(\frac {1}{s ^ {2} + 4} - \frac {1}{s ^ {2} + 9}\right) = \frac {3}{1 0} \cdot \frac {2}{s ^ {2} + 2 ^ {2}} - \frac {1}{5} \cdot \frac {3}{s ^ {2} + 3 ^ {2}} \\ \Rightarrow x (t) = \frac {3}{1 0} \mathcal {L} ^ {- 1} \left\{\frac {2}{s ^ {2} + 2 ^ {2}} \right\} - \frac {1}{5} \mathcal {L} ^ {- 1} \left\{\frac {3}{s ^ {2} + 3 ^ {2}} \right\} = \frac {3}{1 0} \sin 2 t - \frac {1}{5} \sin 3 t. \\ \end{array}
$$

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

Giài: a) Đật $X(s) = \mathcal{L}\{x(t)\}(s)$, biên dôi Laplace 2 vê ta có:

$$
\begin{array}{l} \mathcal {L} \left\{x ^ {\prime \prime} (t) \right\} (s) + 4 \mathcal {L} \left\{x (t) \right\} (s) = \mathcal {L} \left\{\sin 3 t \right\} (s) \\ \Leftrightarrow s ^ {2} X (s) - s x (0) - x ^ {\prime} (0) + 4 X (s) = \frac {3}{s ^ {2} + 9} \\ \Leftrightarrow X (s) = \frac {3}{\left(s ^ {2} + 4\right) \left(s ^ {2} + 9\right)} \\ \end{array}
$$

$$
\begin{array}{l} \mathrm {T a} \mathrm {c o}: X (s) = \frac {3}{5} \left(\frac {1}{s ^ {2} + 4} - \frac {1}{s ^ {2} + 9}\right) = \frac {3}{1 0}. \frac {2}{s ^ {2} + 2 ^ {2}} - \frac {1}{5}. \frac {3}{s ^ {2} + 3 ^ {2}} \\ \Rightarrow x (t) = \frac {3}{1 0} \mathcal {L} ^ {- 1} \left\{\frac {2}{s ^ {2} + 2 ^ {2}} \right\} - \frac {1}{5} \mathcal {L} ^ {- 1} \left\{\frac {3}{s ^ {2} + 3 ^ {2}} \right\} = \frac {3}{1 0} \sin 2 t - \frac {1}{5} \sin 3 t. \\ \end{array}
$$

c) Dăt $ X(s) = \mathcal{L}\{x(t)\} (s) $ và $ Y(s) = \mathcal{L}\{y(t)\} (s) $ , biên dôi Laplace 2 vê ta có:

$$
\left\{ \begin{array}{l} \mathcal {L} \left\{x ^ {\prime} (t) \right\} (s) + 2 \mathcal {L} \left\{y ^ {\prime} (t) \right\} (s) + \mathcal {L} \left\{x (t) \right\} (s) = 0 \\ \mathcal {L} \left\{x ^ {\prime} (t) \right\} (s) - \mathcal {L} \left\{y ^ {\prime} (t) \right\} (s) + \mathcal {L} \left\{y (t) \right\} (s) = 0 \end{array} \right.
$$

$$
\Leftrightarrow \left\{ \begin{array}{l l} s X (s) - x (0) + 2 \left(s Y (s) - y (0)\right) + X (s) = 0 \\ s X (s) - x (0) - \left(s Y (s) - y (0)\right) + Y (s) = 0 \end{array} \right. \Leftrightarrow \left\{ \begin{array}{l l} (s + 1) X (s) + 2 s Y (s) = 2 \\ s X (s) - (s - 1) Y (s) = - 1 \end{array} \right.
$$

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

Càn nhó: Giài HPT bác nhật 2 ăn $ \left\{ \begin{array}{l l} a X+b Y=c \\ a^{\prime} X+b^{\prime} Y=c^{\prime} \end{array} \right. $ . Trong trường hợp HPT có nghiên duy nhật thì

nghiêm là $ \left\{ \begin{array}{l l} X=\frac{D_{x}}{D} \\ Y=\frac{D_{y}}{D} \end{array} \right. $ trong đó $ D=\left| \begin{array}{ll} a & b \\ a^{\prime} & b^{\prime} \end{array} \right|, D_{x}=\left| \begin{array}{ll} c & b \\ c^{\prime} & b^{\prime} \end{array} \right|, D_{y}=\left| \begin{array}{ll} a & c \\ a^{\prime} & c^{\prime} \end{array} \right|. $ Khi đó:

$$
\begin{array}{l} \left\{ \begin{array}{l l} X (s) = - \frac {2}{3 s ^ {2} - 1} = - \frac {2}{3}. \frac {1}{s ^ {2} - 1 / 3} = - \frac {2}{\sqrt {3}}. \frac {1 / \sqrt {3}}{s ^ {2} - (1 / \sqrt {3}) ^ {2}} \\ Y (s) = \frac {3 s + 1}{3 s ^ {2} - 1} = \frac {s + \frac {1}{3}}{s ^ {2} - \frac {1}{3}} = \frac {s}{s ^ {2} - (1 / \sqrt {3}) ^ {2}} + \frac {1}{\sqrt {3}}. \frac {1 / \sqrt {3}}{s ^ {2} - (1 / \sqrt {3}) ^ {2}} \end{array} \right. \\ \Rightarrow \left\{ \begin{array}{l l} x (t) = - \frac {2}{\sqrt {3}} \sinh \frac {1}{\sqrt {3}} t \\ y (t) = \cosh \frac {1}{\sqrt {3}} t + \frac {1}{\sqrt {3}} \sinh \frac {1}{\sqrt {3}} t. \end{array} \right. \\ \end{array}
$$

## Bài 2: Biên doi Laplace của đạo hàm, tích phân

d) Dăt $ X(s) = \mathcal{L}\{x(t)\} (s) $ và $ Y(s) = \mathcal{L}\{y(t)\} (s) $ , biên dôi Laplace 2 vê ta có:

$$
\begin{array}{l} \left\{ \begin{array}{l l} \mathcal {L} \{x ^ {\prime \prime} (t) \} (s) + 2 \mathcal {L} \{x (t) \} (s) + 4 \mathcal {L} \{y (t) \} (s) = 0 \\ \mathcal {L} \{y ^ {\prime \prime} (t) \} (s) + \mathcal {L} \{x (t) \} (s) + 2 \mathcal {L} \{y (t) \} (s) = 0 \end{array} \right. \\ \Leftrightarrow \left\{ \begin{array}{l l} s ^ {2} X (s) - s x (0) - x ^ {\prime} (0) + 2 X (s) + 4 Y (s) = 0 \\ s ^ {2} Y (s) - s y (0) - y ^ {\prime} (0) + X (s) + 2 Y (s) = 0 \end{array} \right. \\ \Leftrightarrow \left\{ \begin{array}{l l} (s ^ {2} + 2) X (s) + 4 Y (s) = - 1 \\ X (s) + (s ^ {2} + 2) Y (s) = - 1 \end{array} \right. \quad \Leftrightarrow \left\{ \begin{array}{l l} X (s) = - \frac {s ^ {2} - 2}{s ^ {2} \left(s ^ {2} + 4\right)} \\ Y (s) = - \frac {s ^ {2} + 1}{s ^ {2} \left(s ^ {2} + 4\right)} \end{array} \right. \\ \end{array}
$$

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

d) Dăt $ X(s) = \mathcal{L}\{x(t)\} (s) $ va $ Y(s) = \mathcal{L}\{y(t)\} (s) $ , biên dôi Laplace 2 vê ta có:

$$
\begin{array}{l} \left\{ \begin{array}{l l} \mathcal {L} \{x ^ {\prime \prime} (t) \} (s) + 2 \mathcal {L} \{x (t) \} (s) + 4 \mathcal {L} \{y (t) \} (s) = 0 \\ \mathcal {L} \{y ^ {\prime \prime} (t) \} (s) + \mathcal {L} \{x (t) \} (s) + 2 \mathcal {L} \{y (t) \} (s) = 0 \end{array} \right. \\ \Leftrightarrow \left\{ \begin{array}{l l} s ^ {2} X (s) - s x (0) - x ^ {\prime} (0) + 2 X (s) + 4 Y (s) = 0 \\ s ^ {2} Y (s) - s y (0) - y ^ {\prime} (0) + X (s) + 2 Y (s) = 0 \end{array} \right. \\ \Leftrightarrow \left\{ \begin{array}{l l} (s ^ {2} + 2) X (s) + 4 Y (s) = - 1 \\ X (s) + (s ^ {2} + 2) Y (s) = - 1 \end{array} \right. \quad \Leftrightarrow \left\{ \begin{array}{l l} X (s) = - \frac {s ^ {2} - 2}{s ^ {2} \left(s ^ {2} + 4\right)} \\ Y (s) = - \frac {s ^ {2} + 1}{s ^ {2} \left(s ^ {2} + 4\right)} \end{array} \right. \\ \end{array}
$$

Khi do:

$$
\left\{ \begin{array}{l l} X (s) = \frac {1}{2}. \frac {1}{s ^ {2}} - \frac {3}{4}. \frac {2}{s ^ {2} + 2 ^ {2}} \\ Y (s) = - \frac {1}{4}. \frac {1}{s ^ {2}} - \frac {3}{8}. \frac {2}{s ^ {2} + 2 ^ {2}} \end{array} \right. \Rightarrow \left\{ \begin{array}{l l} x (t) = \frac {1}{2} t - \frac {3}{4} \sin 2 t \\ y (t) = - \frac {1}{4} t - \frac {3}{8} \sin 2 t. \end{array} \right.
$$

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

## 2. Các kỹ thuật biên doi bô sung

* Ví du: Chúng minh các công thức biêndoi sau dây:

a) $ \mathcal{L}\{te^{at}\} (s)=\frac{1}{(s-a)^{2}} \mathrm{v o i} a \in \mathbb{R}. $ Tong quát: $ \mathcal{L}\{t^{n}e^{at}\} (s)=\frac{n!}{(s-a)^{n+1}} $

b)

$$
\begin{array}{l} \mathrm {b}) \mathcal {L} \{t \sin k t \} (s) = \frac {2 k s}{(s ^ {2} + k ^ {2}) ^ {2}} \\ \mathrm {c}) \mathcal {L} \{t \cos k t \} (s) = \frac {s ^ {2} - k ^ {2}}{(s ^ {2} + k ^ {2}) ^ {2}} \\ \end{array}
$$

d)

$$
\begin{array}{l} \mathrm {)} \mathcal {L} \{t \sinh k t \} (s) = \frac {2 k s}{(s ^ {2} - k ^ {2}) ^ {2}} \\ \mathrm {e)} \mathcal {L} \{t \cosh k t \} (s) = \frac {s ^ {2} + k ^ {2}}{(s ^ {2} - k ^ {2}) ^ {2}} \\ \end{array}
$$

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

## 2. Các kỹ thuật biên doi bô sung

* Ví du: Chúng minh các công thức biêndoi sau dây:

$$
\text {a)} \mathcal {L} \left\{t e ^ {a t} \right\} (s) = \frac {1}{(s - a) ^ {2}} \text {v o i} a \in \mathbb {R}. \text {T o n g q u a t}: \mathcal {L} \left\{t ^ {n} e ^ {a t} \right\} (s) = \frac {n !}{(s - a) ^ {n + 1}}
$$

$$
\begin{array}{l} \mathrm {c)} \mathcal {L} \{t \sin k t \} (s) = \frac {2 k s}{(s ^ {2} + k ^ {2}) ^ {2}} \\ \mathrm {c)} \mathcal {L} \{t \cos k t \} (s) = \frac {s ^ {2} - k ^ {2}}{(s ^ {2} + k ^ {2}) ^ {2}} \\ \end{array}
$$

$$
\begin{array}{l} \mathrm {d}) \mathcal {L} \{t \sinh k t \} (s) = \frac {2 k s}{(s ^ {2} - k ^ {2}) ^ {2}} \\ \mathrm {e}) \mathcal {L} \{t \cosh k t \} (s) = \frac {s ^ {2} + k ^ {2}}{(s ^ {2} - k ^ {2}) ^ {2}} \\ \end{array}
$$

## Cách giài:

B1: Đặt hàm số can biên doi là $f(t)$ và tính dạo hàm cáp cao dên khi xuát hiên lại hàm số ban dâu $f(t)$ đó.

B2: Áp dụng biên doi Laplace 2 về kết hợp công thức biên doi Laplace của đạo hàm để tính $F(s)$.

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

## 2. Các kỹ thuật biên doi bô sung

* Ví du: Chúng minh các công thức biên dối sau dây:

$$
\text {a)} \mathcal {L} \left\{t e ^ {a t} \right\} (s) = \frac {1}{(s - a) ^ {2}} \text {v o i} a \in \mathbb {R}. \text {T o n g q u a t}: \mathcal {L} \left\{t ^ {n} e ^ {a t} \right\} (s) = \frac {n !}{(s - a) ^ {n + 1}}
$$

$$
\begin{array}{l} \mathrm {b}) \mathcal {L} \{t \sin k t \} (s) = \frac {2 k s}{(s ^ {2} + k ^ {2}) ^ {2}} \\ \mathrm {c}) \mathcal {L} \{t \cos k t \} (s) = \frac {s ^ {2} - k ^ {2}}{(s ^ {2} + k ^ {2}) ^ {2}} \\ \end{array}
$$

$$
\begin{array}{l} \mathrm {d}) \mathcal {L} \{t \sinh k t \} (s) = \frac {2 k s}{(s ^ {2} - k ^ {2}) ^ {2}} \\ \mathrm {e}) \mathcal {L} \{t \cosh k t \} (s) = \frac {s ^ {2} + k ^ {2}}{(s ^ {2} - k ^ {2}) ^ {2}} \\ \end{array}
$$

## Cách giài:

B1: Đặt hàm số can biên doi là $f(t)$ và tính dạo hàm cap cao dên khi xuát hiên lại hàm số ban dâu $f(t)$ đó.

B2: Áp dụng biên doi Laplace 2 về kết hợp công thức biên doi Laplace của đạo hàm để tính $F(s)$.

Giài: a) Dăt $ f(t)=te^{at} \Rightarrow f^{\prime}(t)=e^{at}+ate^{at}=e^{at}+af(t). $ Biên dôi Laplace 2 vê ta có:

$$
\mathcal {L} \{f ^ {\prime} (t) \} (s) = \mathcal {L} \{e ^ {a t} \} (s) + a \mathcal {L} \{f (t) \} (s) \Leftrightarrow s F (s) - f (0) = \frac {1}{s - a} + a F (s)
$$

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

$$
\Leftrightarrow (s - a) F (s) = \frac {1}{s - a} + f (0) = \frac {1}{s - a} \Leftrightarrow F (s) = \frac {1}{(s - a) ^ {2}}.
$$

- Giá sú cóng thúc dúng dên $n = k$, túc là $\mathcal{L}\{t^{k}e^{at}\}(s) = \frac{k!}{(s - a)^{k + 1}}$.

- Ta C/M cóng thúc cüng dúng cho $n = k + 1$, túc là cân C/M: $ \mathcal{L}\{t^{k+1}e^{at}\}(s) = \frac{(k+1)!}{(s-a)^{k+2}}. $

Thật vây: Đật $ g(t)=t^{k+1}e^{at}\Rightarrow g^{\prime}(t)=(k+1)t^{k}e^{at}+at^{k+1}e^{at}=(k+1)t^{k}e^{at}+ag(t). $ Biên dôi Laplace 2 vê ta có:

$$
\begin{array}{l} \mathcal {L} \left\{g ^ {\prime} (t) \right\} (s) = (k + 1) \mathcal {L} \left\{t ^ {k} e ^ {a t} \right\} (s) + a \mathcal {L} \left\{g (t) \right\} (s) \\ \Leftrightarrow s G (s) - f (0) = \frac {(k + 1) !}{(s - a) ^ {k + 1}} + a G (s) \\ \Leftrightarrow (s - a) G (s) = \frac {(k + 1) !}{(s - a) ^ {k + 1}} + g (0) \Leftrightarrow G (s) = \frac {(k + 1) !}{(s - a) ^ {k + 2}} \Rightarrow \mathrm {d p c m}. \\ \end{array}
$$

$$
\Leftrightarrow (s - a) F (s) = \frac {1}{s - a} + f (0) = \frac {1}{s - a} \Leftrightarrow F (s) = \frac {1}{(s - a) ^ {2}}.
$$

- Giá sử công thúc dúng đến $n = k$, túc là $\mathcal{L}\{t^{k}e^{at}\}(s) = \frac{k!}{(s - a)^{k + 1}}$.

- Ta C/M cóng thúc cüng dung cho $n = k + 1$, túc là càn C/M: $ \mathcal{L}\{t^{k+1}e^{at}\}(s) = \frac{(k+1)!}{(s-a)^{k+2}}. $

Thật vây: Đật $ g(t)=t^{k+1}e^{at}\Rightarrow g^{\prime}(t)=(k+1)t^{k}e^{at}+at^{k+1}e^{at}=(k+1)t^{k}e^{at}+ag(t). $ Biên dôi Laplace 2 vê ta có:

$$
\begin{array}{l} \mathcal {L} \left\{g ^ {\prime} (t) \right\} (s) = (k + 1) \mathcal {L} \left\{t ^ {k} e ^ {a t} \right\} (s) + a \mathcal {L} \left\{g (t) \right\} (s) \\ \Leftrightarrow s G (s) - f (0) = \frac {(k + 1) !}{(s - a) ^ {k + 1}} + a G (s) \\ \Leftrightarrow (s - a) G (s) = \frac {(k + 1) !}{(s - a) ^ {k + 1}} + g (0) \Leftrightarrow G (s) = \frac {(k + 1) !}{(s - a) ^ {k + 2}} \Rightarrow \mathrm {d p c m}. \\ \end{array}
$$

d) Chu y: $ (\sinh k t)^{\prime}=\left(\frac{e^{k t}-e^{-k t}}{2}\right)^{\prime}=k\cosh k t$ va $ (\cosh k t)^{\prime}=\left(\frac{e^{k t}+e^{-k t}}{2}\right)^{\prime}=k\sinh k t. $

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

$$
\begin{array}{l} \mathrm {D} \check {a t} f (t) = t \sinh k t \Rightarrow f ^ {\prime} (t) = \sinh k t + k t \cosh k t \\ \Rightarrow f ^ {\prime \prime} (t) = k \cosh k t + k \left(\cosh k t + k t \sinh k t\right) \\ = 2 k \cosh k t + k ^ {2} t \sinh k t = 2 k \cosh k t + k ^ {2} f (t). \\ \end{array}
$$

Biên dôi Laplace 2 vê ta có:

$$
\begin{array}{l} \mathcal {L} \left\{f ^ {\prime \prime} (t) \right\} (s) = 2 k \mathcal {L} \left\{\cosh k t \right\} (s) + k ^ {2} \mathcal {L} \left\{f (t) \right\} (s) \\ \Leftrightarrow s ^ {2} F (s) - s f (0) - f ^ {\prime} (0) = \frac {2 k s}{s ^ {2} - k ^ {2}} + k ^ {2} F (s) \\ \Leftrightarrow \left(s ^ {2} - k ^ {2}\right) F (s) = \frac {2 k s}{s ^ {2} - k ^ {2}} \Leftrightarrow F (s) = \frac {2 k s}{\left(s ^ {2} - k ^ {2}\right) ^ {2}}. \\ \end{array}
$$

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

$$
\begin{array}{l} \mathrm {D} \check {a t} f (t) = t \sinh k t \Rightarrow f ^ {\prime} (t) = \sinh k t + k t \cosh k t \\ \Rightarrow f ^ {\prime \prime} (t) = k \cosh k t + k \left(\cosh k t + k t \sinh k t\right) \\ = 2 k \cosh k t + k ^ {2} t \sinh k t = 2 k \cosh k t + k ^ {2} f (t). \\ \end{array}
$$

Biên dôi Laplace 2 vê ta có:

$$
\begin{array}{l} \mathcal {L} \left\{f ^ {\prime \prime} (t) \right\} (s) = 2 k \mathcal {L} \left\{\cosh k t \right\} (s) + k ^ {2} \mathcal {L} \left\{f (t) \right\} (s) \\ \Leftrightarrow s ^ {2} F (s) - s f (0) - f ^ {\prime} (0) = \frac {2 k s}{s ^ {2} - k ^ {2}} + k ^ {2} F (s) \\ \Leftrightarrow \left(s ^ {2} - k ^ {2}\right) F (s) = \frac {2 k s}{s ^ {2} - k ^ {2}} \Leftrightarrow F (s) = \frac {2 k s}{\left(s ^ {2} - k ^ {2}\right) ^ {2}}. \\ \end{array}
$$

## III. Biên đội Laplace của tích phân

1. Dính lý: Nếu hàm $f(t)$ thoa măn giá thiêm

i) liên tuc tùng khuc trên $ [0, \infty), $

ii) là hàm bị chăn mũ trên $ [0, \infty) $ , túc là tôn tài các hàng sô không am $ M $ và $ \alpha $ sao cho $ | f ( t ) | \leq M e^{\alpha t} $ với mọi $ t \geq 0 $ ,

thi

$$
\mathcal {L} \left\{\int_ {0} ^ {t} f (r) d r \right\} (s) = \frac {1}{s} \mathcal {L} \left\{f (t) \right\} (s) = \frac {F (s)}{s} \quad \mathrm {v o i} s > \alpha ,
$$

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

túc là

$$
\mathcal {L} ^ {- 1} \left\{\frac {F (s)}{s} \right\} (t) = \int_ {0} ^ {t} f (r) d r = \int_ {0} ^ {t} \mathcal {L} ^ {- 1} \{F (s) \} (r) d r.
$$

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

túc là

$$
\mathcal {L} ^ {- 1} \left\{\frac {F (s)}{s} \right\} (t) = \int_ {0} ^ {t} f (r) d r = \int_ {0} ^ {t} \mathcal {L} ^ {- 1} \{F (s) \} (r) d r.
$$

C/M: Đặt $ g(t)=\int_{0}^{t} f(r)dr. $ Vì giải thiệt i) nên $ g(t) $ cüng là liên túc tùng khúc trên $ [0,\infty). $ Theo già thiệt ii) ta có:

$$
| g (t) | \leq \int_ {0} ^ {t} | f (r) | d r \leq M \int_ {0} ^ {t} e ^ {\alpha r} d r = \frac {M}{\alpha} \left(e ^ {\alpha t} - 1\right) \mathrm {v o i m o i} t \geq 0
$$

$\Rightarrow g(t)$ cǭng là hàm bì chǎn mǭ trên $[0, \infty)$. Khi dó:

$$
\begin{array}{l} \mathcal {L} \{g ^ {\prime} (t) \} (s) = s \mathcal {L} \{g (t) \} (s) - g (0) \\ \Leftrightarrow \mathcal {L} \{f (t) \} (s) = s \mathcal {L} \left\{\int_ {0} ^ {t} f (r) d r \right\} (s) \Leftrightarrow \mathcal {L} \left\{\int_ {0} ^ {t} f (r) d r \right\} (s) = \frac {1}{s} \mathcal {L} \{f (t) \} (s) \Rightarrow \mathrm {d p c m}. \\ \end{array}
$$

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

túc là

$$
\mathcal {L} ^ {- 1} \left\{\frac {F (s)}{s} \right\} (t) = \int_ {0} ^ {t} f (r) d r = \int_ {0} ^ {t} \mathcal {L} ^ {- 1} \{F (s) \} (r) d r.
$$

C/M: Đặt $ g(t)=\int_{0}^{t} f(r)dr. $ Vì giải thiệt i) nên $ g(t) $ cüng là liên túc tùng khúc trên $ [0,\infty). $ Theo già thiệt ii) ta có:

$$
| g (t) | \leq \int_ {0} ^ {t} | f (r) | d r \leq M \int_ {0} ^ {t} e ^ {\alpha r} d r = \frac {M}{\alpha} \left(e ^ {\alpha t} - 1\right) \mathrm {v o i m o i} t \geq 0
$$

$\Rightarrow g(t)$ cüng là hàm bi chăn mü trên $[0, \infty)$. Khi dó:

$$
\begin{array}{l} \mathcal {L} \{g ^ {\prime} (t) \} (s) = s \mathcal {L} \{g (t) \} (s) - g (0) \\ \Leftrightarrow \mathcal {L} \{f (t) \} (s) = s \mathcal {L} \left\{\int_ {0} ^ {t} f (r) d r \right\} (s) \Leftrightarrow \mathcal {L} \left\{\int_ {0} ^ {t} f (r) d r \right\} (s) = \frac {1}{s} \mathcal {L} \{f (t) \} (s) \Rightarrow \mathrm {d p c m}. \\ \end{array}
$$

2. Ví dµ: Tính $ \mathcal{L}^{-1}\left\{\frac{1}{s^{2}(s-2023)}\right\}. $

## Bài 2: Biên đội Laplace của đạo hàm, tích phân

túc là

$$
\mathcal {L} ^ {- 1} \left\{\frac {F (s)}{s} \right\} (t) = \int_ {0} ^ {t} f (r) d r = \int_ {0} ^ {t} \mathcal {L} ^ {- 1} \{F (s) \} (r) d r.
$$

C/M: Đặt $ g(t)=\int_{0}^{t} f(r)dr. $ Vì giải thiệt i) nên $ g(t) $ cüng là liên tUC tùng khúc trên $ [0,\infty). $ Theo giá thiệt ii) ta có:

$$
| g (t) | \leq \int_ {0} ^ {t} | f (r) | d r \leq M \int_ {0} ^ {t} e ^ {\alpha r} d r = \frac {M}{\alpha} \left(e ^ {\alpha t} - 1\right) \mathrm {v o i m o i} t \geq 0
$$

$\Rightarrow g(t)$ cüng là hàm bi chăn mü trên $[0, \infty)$. Khi dó:

$$
\begin{array}{l} \mathcal {L} \{g ^ {\prime} (t) \} (s) = s \mathcal {L} \{g (t) \} (s) - g (0) \\ \Leftrightarrow \mathcal {L} \{f (t) \} (s) = s \mathcal {L} \left\{\int_ {0} ^ {t} f (r) d r \right\} (s) \Leftrightarrow \mathcal {L} \left\{\int_ {0} ^ {t} f (r) d r \right\} (s) = \frac {1}{s} \mathcal {L} \{f (t) \} (s) \Rightarrow \mathrm {d p c m}. \\ \end{array}
$$

2. Ví dµ: Tính $ \mathcal{L}^{-1}\left\{\frac{1}{s^{2}(s-2023)}\right\}. $

Giài: Dăt $ F(s) = \frac{1}{s(s - 2023)} = \frac{1}{2023}\left(\frac{1}{s - 2023} - \frac{1}{s}\right) \Rightarrow \mathcal{L}^{-1}\{F(s)\} = \frac{1}{2023}\left(e^{2023t} - 1\right). $ Thay

vào CT trên ta có $ \mathcal{L}^{-1}\left\{\frac{1}{s^{2}(s-2023)}\right\}=\frac{1}{2023}\int_{0}^{t}(e^{2023r}-1)dr=\frac{e^{2023t}-1}{2023^{2}}-\frac{t}{2023}. $

## Chuong 3: PHU'ONG PHÁP BIÊN DÔI LAPLACE

<div align="center">

Bài 3: PHÉP TỪNH TIÊN VÀ PHÂN THÚC DỘN GIÂN

</div>

## Bài 3: Phép tính tiên và phân thúc đơn giản

## I. Phép tính tiên của biên doi Laplace

1. Dính lý (Phép tính tiến): Nếu hàm $F(s) = \mathcal{L}\{f(t)\}(s)$ tôn tài với $s > \alpha$, thì tôn tài $\mathcal{L}\{e^{at}f(t)\}(s)$ tôn tài với $s > \alpha + a$ và

$$
\mathcal {L} \left\{e ^ {a t} f (t) \right\} (s) = F (s - a),
$$

túc là

$$
\mathcal {L} ^ {- 1} \{F (s - a) \} = e ^ {a t} f (t).
$$

## Bài 3: Phép tính tiên và phân thúc đơn giản

## I. Phép tính tiên của biên doi Laplace

1. Dính lý (Phép tính tiến): Nếu hàm $F(s) = \mathcal{L}\{f(t)\}(s)$ tôn tài với $s > \alpha$, thì tôn tài $\mathcal{L}\{e^{at}f(t)\}(s)$ tôn tài với $s > \alpha + a$ và

$$
\mathcal {L} \left\{e ^ {a t} f (t) \right\} (s) = F (s - a),
$$

túc là

$$
\mathcal {L} ^ {- 1} \{F (s - a) \} = e ^ {a t} f (t).
$$

C/M: Ta co: $ F(s)=\mathcal{L}\{f(t)\} (s)=\int_{0}^{\infty} e^{-st} f(t) d t $ , voi s > $ \alpha $

$$
\begin{array}{l} \Rightarrow F (s - a) = \int_ {0} ^ {\infty} e ^ {- (s - a) t} f (t) d t, \mathrm {v o i} s - a > \alpha \Leftrightarrow s > \alpha + a \\ = \int_ {0} ^ {\infty} e ^ {- s t} \left(e ^ {a t} f (t)\right) d t = \mathscr {L} \left\{e ^ {a t} f (t) \right\} (s). \\ \end{array}
$$

## Bài 3: Phép tính tiên và phân thúc đơn giản

## I. Phép tính tiên của biên doi Laplace

1. Dinh lý (Phép tính tiên): Nếu hàm $F(s) = \mathcal{L}\{f(t)\}(s)$ tôn tải với $s > \alpha$, thì tôn tải $\mathcal{L}\{e^{at}f(t)\}(s)$ tôn tải với $s > \alpha + a$ và

$$
\mathcal {L} \left\{e ^ {a t} f (t) \right\} (s) = F (s - a),
$$

túc là

$$
\mathcal {L} ^ {- 1} \{F (s - a) \} = e ^ {a t} f (t).
$$

C/M: Ta co: $ F(s)=\mathcal{L}\{f(t)\} (s)=\int_{0}^{\infty} e^{-st} f(t) d t $ , voi s > $ \alpha $

$$
\begin{array}{l} \Rightarrow F (s - a) = \int_ {0} ^ {\infty} e ^ {- (s - a) t} f (t) d t, \mathrm {v o i} s - a > \alpha \Leftrightarrow s > \alpha + a \\ = \int_ {0} ^ {\infty} e ^ {- s t} \left(e ^ {a t} f (t)\right) d t = \mathscr {L} \left\{e ^ {a t} f (t) \right\} (s). \\ \end{array}
$$

Ví du: a) $ \mathcal{L}\{e^{at}t^{n}\} (s)=\frac{n!}{(s-a)^{n+1}} $ vói s > a.

b)

$$
\mathrm {b}) \mathcal {L} \left\{e ^ {a t} \cos k t \right\} (s) = \frac {s - a}{(s - a) ^ {2} + k ^ {2}} \mathrm {v o i} s > a.
$$

## Bài 3: Phép tính tiên và phân thúc đơn giản

$$
\mathrm {c}) \mathcal {L} ^ {- 1} \left\{\frac {k}{(s - a) ^ {2} + k ^ {2}} \right\} = e ^ {a t} \sin k t \mathrm {v o i} s > a.
$$

$$
\mathrm {d}) \mathscr {L} ^ {- 1} \left\{\frac {k}{(s - a) ^ {2} - k ^ {2}} \right\} = e ^ {a t} \sinh k t \mathrm {v o i} s > | k | + a.
$$

2. Áp dung: Tìm các biên dôi Laplace sau dây:

a) $ \mathcal{L}\{(e^{t}+t)^{2}\} (s) $

b) $\mathcal{L}\left\{e^{3t}\sin \left(t + \frac{\pi}{4}\right)\right\}(s)$

c) $ \mathcal{L}\{e^{2 t}(\sin 3 t+2\cos 3 t)\} (s) $

## Bài 3: Phép tịnh tiên và phân thúc đơn giản

$$
\mathrm {c}) \mathcal {L} ^ {- 1} \left\{\frac {k}{(s - a) ^ {2} + k ^ {2}} \right\} = e ^ {a t} \sin k t \mathrm {v o i} s > a.
$$

$$
\mathrm {d}) \mathcal {L} ^ {- 1} \left\{\frac {k}{(s - a) ^ {2} - k ^ {2}} \right\} = e ^ {a t} \sinh k t \mathrm {v o i} s > | k | + a.
$$

2. Áp dung: Tìm các biên dôi Laplace sau dây:

a) $ \mathcal{L}\{(e^{t}+t)^{2}\} (s) $

$$
\mathcal {L} \left\{e ^ {3 t} \sin \left(t + \frac {\pi}{4}\right) \right\} (s)
$$

c) $ \mathcal{L}\{e^{2 t}(\sin 3 t+2\cos 3 t)\} (s) $

$$
\text {G i a i:} \mathrm {a}) F (s) = \mathcal {L} \left\{e ^ {2 t} \right\} (s) + 2 \mathcal {L} \left\{e ^ {t} t \right\} (s) + \mathcal {L} \left\{t ^ {2} \right\} (s) = \frac {1}{s - 2} + \frac {2}{(s - 1) ^ {2}} + \frac {2}{s ^ {3}}.
$$

$$
\begin{array}{l} F (s) = \frac {\sqrt {2}}{2} \left(\mathcal {L} \left\{e ^ {3 t} \sin t \right\} (s) + \mathcal {L} \left\{e ^ {3 t} \cos t \right\} (s)\right) \\ = \frac {\sqrt {2}}{2} \left(\frac {1}{(s - 3) ^ {2} + 1} + \frac {s - 3}{(s - 3) ^ {2} + 1}\right) = \frac {\sqrt {2}}{2} \frac {s - 2}{(s - 3) ^ {2} + 1}. \\ \end{array}
$$

c) Tuong tu: $ F(s)=\frac{3}{(s-2)^{2}+9}+2\frac{s-2}{(s-2)^{2}+9}=\frac{2s-1}{(s-2)^{2}+9}. $

## Bài 3: Phép tính tiên và phân thúc đơn giản

II. Biên doi phân thúc đơn giản $ \frac{P(s)}{Q(s)} $

1. Quy tác 1 (Phân thúc đơn giản bác một): Nếu $ Q(s) $ có chúa $( s-a )^{n} $ , thì ta phân tích $ \frac{P(s)}{Q(s)} $ chúa các số hang sau

$$
\frac {A _ {1}}{s - a} + \frac {A _ {2}}{(s - a) ^ {2}} + \dots + \frac {A _ {n}}{(s - a) ^ {n}}
$$

2. Quy tắc 2 (Phân thúc đơn giản bác hai): Nếu $ Q(s) $ có chúa $ \left((s-a)^{2}+b^{2}\right)^{n} $ , thì ta phân tích $ \frac{P(s)}{Q(s)} $ chúa các số hạng sau

$$
\frac {A _ {1} s + B _ {1}}{(s - a) ^ {2} + b ^ {2}} + \frac {A _ {2} s + B _ {2}}{\left((s - a) ^ {2} + b ^ {2}\right) ^ {2}} + \dots + \frac {A _ {n} s + B _ {n}}{\left((s - a) ^ {2} + b ^ {2}\right) ^ {n}}
$$

## Bài 3: Phép tịnh tiên và phân thúc đơn giản

II. Biên đội phân thúc đơn giản $ \frac{P(s)}{Q(s)} $

1. Quy tác 1 (Phân thúc đơn giản bác một): Nếu $ Q(s) $ có chúa $( s-a )^{n} $ , thì ta phân tích $ \frac{P(s)}{Q(s)} $ chúa các số hang sau

$$
\frac {A _ {1}}{s - a} + \frac {A _ {2}}{(s - a) ^ {2}} + \dots + \frac {A _ {n}}{(s - a) ^ {n}}
$$

2. Quy tắc 2 (Phân thúc đơn giản bác hai): Nếu $ Q(s) $ có chúa $ \left((s-a)^{2}+b^{2}\right)^{n} $ , thì ta phân tích $ \frac{P(s)}{Q(s)} $ chúa các số hạng sau

$$
\frac {A _ {1} s + B _ {1}}{(s - a) ^ {2} + b ^ {2}} + \frac {A _ {2} s + B _ {2}}{\left((s - a) ^ {2} + b ^ {2}\right) ^ {2}} + \dots + \frac {A _ {n} s + B _ {n}}{\left((s - a) ^ {2} + b ^ {2}\right) ^ {n}}
$$

Ví du: Tìm các biên dối Laplace nguoc sau dây:

$$
\text {a)} \mathcal {L} ^ {- 1} \left\{\frac {s ^ {2} + 1}{s ^ {3} - 2 s ^ {2} - 8 s} \right\} \quad \text {b)} \mathcal {L} ^ {- 1} \left\{\frac {s ^ {2} + 2 s}{s ^ {4} + 5 s ^ {2} + 4} \right\}
$$

## Bài 3: Phép tịnh tiên và phân thúc đơn giản

Giài: a) Ta có: $ F(s)=\frac{s^{2}+1}{s(s-4)(s+2)}=\frac{A}{s}+\frac{B}{s-4}+\frac{C}{s+2} $ $ \Leftrightarrow s^{2}+1=A(s-4)(s+2)+Bs(s+2)+Cs(s-4). $

Áp dung Cách 1 (PP dòng nhát hê sô) hoãc Cách 2 (Thay s = 0, s = 4, s = -2)

$$
\Rightarrow A = - \frac {1}{8}, B = \frac {1 7}{2 4}, C = \frac {5}{1 2}.
$$

Khi do: $ f ( t )=-\frac{1}{8}\mathcal{L}^{-1}\left\{\frac{1}{s}\right\}+\frac{17}{24}\mathcal{L}^{-1}\left\{\frac{1}{s-4}\right\}+\frac{5}{12}\mathcal{L}^{-1}\left\{\frac{1}{s+2}\right\}=-\frac{1}{8}+\frac{17}{24} e^{4 t}+\frac{5}{12} e^{-2 t}. $

## Bài 3: Phép tính tiên và phân thúc đơn giản

Giài: a) Ta có: $ F(s)=\frac{s^{2}+1}{s(s-4)(s+2)}=\frac{A}{s}+\frac{B}{s-4}+\frac{C}{s+2} $ $ \Leftrightarrow s^{2}+1=A(s-4)(s+2)+Bs(s+2)+Cs(s-4). $

Áp dung Cách 1 (PP dòng nhát hê sô) hoãc Cách 2 (Thay s = 0, s = 4, s = -2)

$$
\Rightarrow A = - \frac {1}{8}, B = \frac {1 7}{2 4}, C = \frac {5}{1 2}.
$$

Khi do: $ f ( t )=-\frac{1}{8} \mathcal{L}^{-1}\left\{\frac{1}{s}\right\}+\frac{17}{24} \mathcal{L}^{-1}\left\{\frac{1}{s-4}\right\}+\frac{5}{12} \mathcal{L}^{-1}\left\{\frac{1}{s+2}\right\}=-\frac{1}{8}+\frac{17}{24} e^{4 t}+\frac{5}{12} e^{-2 t}. $

$$
\begin{array}{l} \Leftrightarrow s ^ {2} + 2 s = (A + C) s ^ {3} + (B + D) s ^ {2} + (4 A + C) s + 4 B + D \\ \Leftrightarrow A = \frac {2}{3}, B = - \frac {1}{3}, C = - \frac {2}{3}, D = \frac {4}{3} (\mathrm {a p d u n g P P d o n g n h a t h e s o}) \\ \end{array}
$$

Khi do:

$$
\begin{array}{l} f (t) = \frac {2}{3} \mathcal {L} ^ {- 1} \left\{\frac {s}{s ^ {2} + 1} \right\} - \frac {1}{3} \mathcal {L} ^ {- 1} \left\{\frac {1}{s ^ {2} + 1} \right\} - \frac {2}{3} \mathcal {L} ^ {- 1} \left\{\frac {s}{s ^ {2} + 4} \right\} + \frac {2}{3} \mathcal {L} ^ {- 1} \left\{\frac {2}{s ^ {2} + 4} \right\} \\ = \frac {2}{3} \cos t - \frac {1}{3} \sin t - \frac {2}{3} \cos 2 t + \frac {2}{3} \sin 2 t. \\ \end{array}
$$

## Bài 3: Phép tính tiên và phân thúc đơn gián

## 3. Áp dưng giài PTVP tuyên tính cáp cao với hê sô là hăng sô

* Ví dú: Giài các PTVP voi giá trí ban dâu sau dây:

$$
\mathrm {a}) x ^ {\prime \prime} + 6 x ^ {\prime} + 3 4 x = 3 0 \sin 2 t, \quad x (0) = x ^ {\prime} (0) = 0.
$$

$$
\text {c)} x ^ {(3)} - x ^ {\prime \prime} - x ^ {\prime} + x = e ^ {2 t}, \quad x (0) = x ^ {\prime} (0) = x ^ {\prime \prime} (0) = 0.
$$

$$
\mathrm {d}) x ^ {(4)} + 1 3 x ^ {\prime \prime} + 3 6 x = 0,
$$

$$
x (0) = 0, x ^ {\prime} (0) = 2, x ^ {\prime \prime} (0) = 0, x ^ {(3)} (0) = - 1 3.
$$

e) $ x^{ ( 4 ) }+8 x^{\prime\prime}-9 x=0, $

$$
x (0) = x ^ {\prime} (0) = 0, x ^ {\prime \prime} (0) = x ^ {(3)} (0) = 1.
$$

$$
f) x ^ {(6)} + 4 x ^ {(4)} - x ^ {\prime \prime} - 4 x = \sinh 2 t, \quad x ^ {(k)} (0) = 0 \mathrm {v o i} k = \overline {{0 , 5}}.
$$

## Bài 3: Phép tính tiên và phân thúc đơn giản

## 3. Áp dụng giài PTVP tuyên tính cáp cao với hê sô là hăng sô

* Ví du: Giài các PTVP với giá trì ban dâu sau dây:

$$
\mathrm {a}) x ^ {\prime \prime} + 6 x ^ {\prime} + 3 4 x = 3 0 \sin 2 t, \quad x (0) = x ^ {\prime} (0) = 0.
$$

$$
\text {c)} x ^ {(3)} - x ^ {\prime \prime} - x ^ {\prime} + x = e ^ {2 t}, \quad x (0) = x ^ {\prime} (0) = x ^ {\prime \prime} (0) = 0.
$$

$$
\mathrm {d}) x ^ {(4)} + 1 3 x ^ {\prime \prime} + 3 6 x = 0,
$$

$$
x (0) = 0, x ^ {\prime} (0) = 2, x ^ {\prime \prime} (0) = 0, x ^ {(3)} (0) = - 1 3.
$$

e) $ x^{ ( 4 ) }+8 x^{\prime\prime}-9 x=0, $

$$
x (0) = x ^ {\prime} (0) = 0, x ^ {\prime \prime} (0) = x ^ {(3)} (0) = 1.
$$

$$
f) x ^ {(6)} + 4 x ^ {(4)} - x ^ {\prime \prime} - 4 x = \sinh 2 t, \quad x ^ {(k)} (0) = 0 \mathrm {v o i} k = \overline {{0 , 5}}.
$$

## Cách giài:

B1: Đặt $F(s) = \mathcal{L}\{f(t)\}(s)$. Biên đội Laplace 2 về kết hợp với công thức biên đội Laplace của đạo hàm và sử dụng điềuKIEN ban đạo để tính $F(s)$.

B2: Sử dụng quy tắc biên doi phân thúc dơn gian và phép tính tiên (neu can) để tìm Laplace nguồn, túc là tìm ra nghiem $f(t)$.

## Bài 3: Phép tịnh tiên và phân thúc đơn giản

Giài: b) Đät $X(s) = \mathcal{L}\{x(t)\}(s)$, biên dôi Laplace 2 vê ta có:

$$
\begin{array}{l} \mathcal {L} \left\{x ^ {(3)} (t) \right\} (s) + \mathcal {L} \left\{x ^ {\prime \prime} (t) \right\} (s) - 6 \mathcal {L} \left\{x ^ {\prime} (t) \right\} (s) = 0 \\ \Leftrightarrow \left(s ^ {3} X (s) - s ^ {2} x (0) - s x ^ {\prime} (0) - x ^ {\prime \prime} (0)\right) + \left(s ^ {2} X (s) - s x (0) - x ^ {\prime} (0)\right) - 6 \left(s X (s) - x (0)\right) = 0 \\ \Leftrightarrow \left(s ^ {3} + s ^ {2} - 6 s\right) X (s) - s - 2 = 0 \\ \Leftrightarrow X (s) = \frac {s + 2}{s ^ {3} + s ^ {2} - 6 s} = \frac {s + 2}{s (s + 3) (s - 2)} \\ \end{array}
$$

$$
\mathrm {K h i} \mathrm {d o}: x (t) = - \frac {1}{3} \mathcal {L} ^ {- 1} \left\{\frac {1}{s} \right\} - \frac {1}{1 5} \mathcal {L} ^ {- 1} \left\{\frac {1}{s + 3} \right\} + \frac {2}{5} \mathcal {L} ^ {- 1} \left\{\frac {1}{s - 2} \right\} = - \frac {1}{3} - \frac {1}{1 5} e ^ {- 3 t} + \frac {2}{5} e ^ {2 t}.
$$

## Bài 3: Phép tịnh tiên và phân thúc đơn giản

Giài: b) Đật $X(s) = \mathcal{L}\{x(t)\}(s)$, biên dôi Laplace 2 vê ta có:

$$
\begin{array}{l} \mathcal {L} \left\{x ^ {(3)} (t) \right\} (s) + \mathcal {L} \left\{x ^ {\prime \prime} (t) \right\} (s) - 6 \mathcal {L} \left\{x ^ {\prime} (t) \right\} (s) = 0 \\ \Leftrightarrow \left(s ^ {3} X (s) - s ^ {2} x (0) - s x ^ {\prime} (0) - x ^ {\prime \prime} (0)\right) + \left(s ^ {2} X (s) - s x (0) - x ^ {\prime} (0)\right) - 6 \left(s X (s) - x (0)\right) = 0 \\ \Leftrightarrow \left(s ^ {3} + s ^ {2} - 6 s\right) X (s) - s - 2 = 0 \\ \Leftrightarrow X (s) = \frac {s + 2}{s ^ {3} + s ^ {2} - 6 s} = \frac {s + 2}{s (s + 3) (s - 2)} \\ \end{array}
$$

$$
\mathrm {D} \check {\mathrm {a t}} X (s) = \frac {A}{s} + \frac {B}{s + 3} + \frac {C}{s - 2} \Rightarrow A = - \frac {1}{3}, B = - \frac {1}{1 5}, C = \frac {2}{5}
$$

$$
\mathrm {h i} \mathrm {d o}: x (t) = - \frac {1}{3} \mathcal {L} ^ {- 1} \left\{\frac {1}{s} \right\} - \frac {1}{1 5} \mathcal {L} ^ {- 1} \left\{\frac {1}{s + 3} \right\} + \frac {2}{5} \mathcal {L} ^ {- 1} \left\{\frac {1}{s - 2} \right\} = - \frac {1}{3} - \frac {1}{1 5} e ^ {- 3 t} + \frac {2}{5} e ^ {2 t}.
$$

e) Dăt $ X(s) = \mathcal{L}\{x(t)\}(s)$, biên dôi Laplace 2 vê ta có:

$$
\begin{array}{l} \mathcal {L} \left\{x ^ {(4)} (t) \right\} (s) + 8 \mathcal {L} \left\{x ^ {\prime \prime} (t) \right\} (s) - 9 \mathcal {L} \left\{x (t) \right\} (s) = 0 \\ \Leftrightarrow \left(s ^ {4} X (s) - s ^ {3} x (0) - s ^ {2} x ^ {\prime} (0) - s x ^ {\prime \prime} (0) - x ^ {(3)} (0)\right) + 8 \left(s ^ {2} X (s) - s x (0) - x ^ {\prime} (0)\right) - 9 X (s) = 0 \\ \Leftrightarrow \left(s ^ {4} + 8 s ^ {2} - 9\right) X (s) - s - 1 = 0 \\ \Leftrightarrow X (s) = \frac {s + 1}{s ^ {4} + 8 s ^ {2} - 9} = \frac {s + 1}{\left(s ^ {2} - 1\right) \left(s ^ {2} + 9\right)} = \frac {1}{(s - 1) \left(s ^ {2} + 9\right)} \\ \end{array}
$$

## Bài 3: Phép tính tiên và phân thúc đơn giản

Dhet $ X(s)=\frac{A}{s-1}+\frac{Bs+C}{s^{2}+9}\Rightarrow A=\frac{1}{10},B=C=-\frac{1}{10} $

Khi do: $ x ( t )=\frac{1}{1 0} \mathcal{L}^{-1} \left\{\frac{1}{s-1}\right\}-\frac{1}{1 0} \mathcal{L}^{-1} \left\{\frac{s}{s^{2}+9}\right\}-\frac{1}{3 0} \mathcal{L}^{-1} \left\{\frac{3}{s^{2}+9}\right\}$ $ = \frac{1}{1 0} e^{t}-\frac{1}{1 0} \cos 3 t-\frac{1}{3 0} \sin 3 t. $

## Bài 3: Phép tính tiên và phân thúc đơn giản

Khi do:

$$
\begin{array}{l} x (t) = \frac {1}{1 0} \mathcal {L} ^ {- 1} \left\{\frac {1}{s - 1} \right\} - \frac {1}{1 0} \mathcal {L} ^ {- 1} \left\{\frac {s}{s ^ {2} + 9} \right\} - \frac {1}{3 0} \mathcal {L} ^ {- 1} \left\{\frac {3}{s ^ {2} + 9} \right\} \\ = \frac {1}{1 0} e ^ {t} - \frac {1}{1 0} \cos 3 t - \frac {1}{3 0} \sin 3 t. \\ \end{array}
$$

3. Chú y (Các kỹ thuật biên dôi bô sung):

a)

$$
\mathcal {L} ^ {- 1} \left\{\frac {s}{\left(s ^ {2} + k ^ {2}\right) ^ {2}} \right\} = \frac {1}{2 k} t \sin k t.
$$

b)

$$
\mathcal {L} ^ {- 1} \left\{\frac {1}{\left(s ^ {2} + k ^ {2}\right) ^ {2}} \right\} = \frac {1}{2 k ^ {3}} (\sin k t - k t \cos k t).
$$

## Bài 3: Phép tính tiên và phân thúc đơn giản

Dalat $ X(s)=\frac{A}{s-1}+\frac{Bs+C}{s^{2}+9}\Rightarrow A=\frac{1}{10},B=C=-\frac{1}{10} $

Khi do:

$$
\begin{array}{l} x (t) = \frac {1}{1 0} \mathcal {L} ^ {- 1} \left\{\frac {1}{s - 1} \right\} - \frac {1}{1 0} \mathcal {L} ^ {- 1} \left\{\frac {s}{s ^ {2} + 9} \right\} - \frac {1}{3 0} \mathcal {L} ^ {- 1} \left\{\frac {3}{s ^ {2} + 9} \right\} \\ = \frac {1}{1 0} e ^ {t} - \frac {1}{1 0} \cos 3 t - \frac {1}{3 0} \sin 3 t. \\ \end{array}
$$

3. Chú y (Các kỹ thuật biên dôi bô sung):

a)

$$
\mathcal {L} ^ {- 1} \left\{\frac {s}{\left(s ^ {2} + k ^ {2}\right) ^ {2}} \right\} = \frac {1}{2 k} t \sin k t.
$$

b)

$$
\mathcal {L} ^ {- 1} \left\{\frac {1}{\left(s ^ {2} + k ^ {2}\right) ^ {2}} \right\} = \frac {1}{2 k ^ {3}} (\sin k t - k t \cos k t).
$$

C/M: Theo Bài 2, ta đã chúng minh được

$$
\mathcal {L} \{t \sin k t \} (s) = \frac {2 k s}{\left(s ^ {2} + k ^ {2}\right) ^ {2}} \mathrm {v a} \mathcal {L} \{t \cos k t \} (s) = \frac {s ^ {2} - k ^ {2}}{\left(s ^ {2} + k ^ {2}\right) ^ {2}}.
$$

a) Dpcm $ \Leftrightarrow \frac{s}{(s^{2}+k^{2})^{2}}=\mathcal{L}\left\{\frac{1}{2k} t \sin k t\right\}(s)=\frac{1}{2k}\mathcal{L}\left\{t \sin k t\right\}(s). $ Diêu này là dúng.

## Bài 3: Phép tịnh tiên và phân thúc đơn giản

$$
\begin{array}{l} = \frac {1}{2 k ^ {3}} \mathcal {L} \left\{\sin k t \right\} (s) - \frac {1}{2 k ^ {2}} \mathcal {L} \left\{t \cos k t \right\} (s) \\ = \frac {1}{2 k ^ {3}} \frac {k}{s ^ {2} + k ^ {2}} - \frac {1}{2 k ^ {2}} \frac {s ^ {2} - k ^ {2}}{\left(s ^ {2} + k ^ {2}\right) ^ {2}} \\ = \frac {1}{2 k ^ {2}} \left(\frac {1}{s ^ {2} + k ^ {2}} - \frac {s ^ {2} - k ^ {2}}{\left(s ^ {2} + k ^ {2}\right) ^ {2}}\right). D i e u n a y l a d u n g. \\ \end{array}
$$

## Bài 3: Phép tính tiên và phân thúc đơn giản

$$
\begin{array}{l} = \frac {1}{2 k ^ {3}} \mathcal {L} \left\{\sin k t \right\} (s) - \frac {1}{2 k ^ {2}} \mathcal {L} \left\{t \cos k t \right\} (s) \\ = \frac {1}{2 k ^ {3}} \frac {k}{s ^ {2} + k ^ {2}} - \frac {1}{2 k ^ {2}} \frac {s ^ {2} - k ^ {2}}{\left(s ^ {2} + k ^ {2}\right) ^ {2}} \\ = \frac {1}{2 k ^ {2}} \left(\frac {1}{s ^ {2} + k ^ {2}} - \frac {s ^ {2} - k ^ {2}}{\left(s ^ {2} + k ^ {2}\right) ^ {2}}\right). D i e u n a y l a d u n g. \\ \end{array}
$$

Ví du: Giài các PTVP sau:

a) $ x^{\prime\prime}+9 x=2 \sin 3 t, $ $ x(0)=x^{\prime}(0)=0. $

## Bài 3: Phép tính tiên và phân thúc đơn giản

$$
\begin{array}{l} = \frac {1}{2 k ^ {3}} \mathcal {L} \left\{\sin k t \right\} (s) - \frac {1}{2 k ^ {2}} \mathcal {L} \left\{t \cos k t \right\} (s) \\ = \frac {1}{2 k ^ {3}} \frac {k}{s ^ {2} + k ^ {2}} - \frac {1}{2 k ^ {2}} \frac {s ^ {2} - k ^ {2}}{\left(s ^ {2} + k ^ {2}\right) ^ {2}} \\ = \frac {1}{2 k ^ {2}} \left(\frac {1}{s ^ {2} + k ^ {2}} - \frac {s ^ {2} - k ^ {2}}{\left(s ^ {2} + k ^ {2}\right) ^ {2}}\right). D i e u n a y l a d u n g. \\ \end{array}
$$

Ví du: Giài các PTVP sau:

a) $ x^{\prime \prime}+9 x=2 \sin 3 t, $ $ x(0)=x^{\prime}(0)=0. $

Goi y: a) Biên doi Laplace 2 về tính duoc $ X(s)=\frac{6}{(s^{2}+9)^{2}} \Rightarrow x(t)=\frac{1}{9} \sin 3 t-\frac{1}{3} t \cos 3 t. $

b) Biên doi Laplace 2 về tính duoc $ X(s)=\frac{4}{(s-1)^{2}(s^{2}+1)^{2}}. $ Dê tính nghiem $ x(t), $ Cách 1: Phân tích

$ X ( s )=\frac{A}{s-1}+\frac{B}{(s-1)^{2}}+\frac{C s+D}{s^{2}+1}+\frac{E s+F}{(s^{2}+1)^{2}} $ hoặc Cách 2: Sử dụng công thức tích chập bài sau.

## Chuong 3: PHU'ONG PHÁP BIÊN DÔI LAPLACE

## Bai 4:

DAO HAM, TÍCH PHÂN VÀ TÍCH CÙA CÁC PHÉP BIÊN DÔI

## Bài 4: Đào hàm, tích phàn và tích của các phép biên doi

## I. Tích cháp cua hai hàm sô

1. Dinh nghia: Tích chập của hai ham số $f(t)$ và $g(t)$, xác định trên $[0, \infty)$ và liên tục tùng khúc trên mối doan hũu hàn, được ký hiệu là $(f * g)(t)$ hoặc $f(t) * g(t)$ và được xác định bài

$$
f (t) * g (t) = \int_ {0} ^ {t} f (r) g (t - r) d r, \quad \mathrm {v o i} t \geq 0.
$$

**Chú y:** Tích cháp có tính chât giao hoán $f(t)*g(t)=g(t)*f(t)$.

**Ví du:** a) $\sin t*\cos t$ b) $t*e^{at}$ c) $t^2*\cos t$.

## Bài 4: Đạo hàm, tích phân và tích của các phép biên doi

## I. Tích cháp cua hai hàm sô

1. Dinh nghia: Tích chập của hai hàm số $f(t)$ và $g(t)$, xác định trên $[0, \infty)$ và liên tục tùng khúc trên mối doan hũu hàn, được ký hiệu là $(f * g)(t)$ hoặc $f(t) * g(t)$ và được xác định bài

$$
f (t) * g (t) = \int_ {0} ^ {t} f (r) g (t - r) d r, \quad \mathrm {v o i} t \geq 0.
$$

Chu y: Tích cháp có tính chât giao hoán $ f(t)*g(t)=g(t)*f(t). $

Ví du: a) $ \sin t * \cos t $ b) $ t * e^{a t} $ c) $ t^{2} * \cos t. $

Giái: a) Ta có:

$$
\begin{array}{l} \sin t * \cos t = \int_ {0} ^ {t} \sin r \cos (t - r) d r = \frac {1}{2} \int_ {0} ^ {t} \left(\sin t + \sin (2 r - t)\right) d r \\ = \frac {1}{2} \left(\left(\sin t\right). r \Big | _ {0} ^ {t} - \frac {1}{2} \cos (2 r - t) \Big | _ {0} ^ {t}\right) = \frac {1}{2} t \sin t. \\ \end{array}
$$

## Bài 4: Đạo hàm, tích phân và tích của các phép biên doi

## I. Tích cháp cúa hai hàm sô

1. Dinh nghia: Tích chập của hai hàm số $f(t)$ và $g(t)$, xác định trên $[0, \infty)$ và liên tục tùng khúc trên mối doạn hữu h�n, được ký hiệu là $(f * g)(t)$ hoặc $f(t) * g(t)$ và được xác định bài

$$
f (t) * g (t) = \int_ {0} ^ {t} f (r) g (t - r) d r, \quad \mathrm {v o i} t \geq 0.
$$

Chu y: Tích chập có tính chât giao hoán $ f(t)*g(t)=g(t)*f(t). $

Ví du: a) $ \sin t * \cos t $ b) $ t * e^{a t} $ c) $ t^{2} * \cos t. $

Giái: a) Ta có:

$$
\begin{array}{l} \sin t * \cos t = \int_ {0} ^ {t} \sin r \cos (t - r) d r = \frac {1}{2} \int_ {0} ^ {t} \left(\sin t + \sin (2 r - t)\right) d r \\ = \frac {1}{2} \left(\left(\sin t\right). r \Big | _ {0} ^ {t} - \frac {1}{2} \cos (2 r - t) \Big | _ {0} ^ {t}\right) = \frac {1}{2} t \sin t. \\ \end{array}
$$

2. Dính lý (Biên đội Laplace của tích chập): Nếu các hàm $f(t)$ và $g(t)$ thoa măn giá thiét

i) liên túc tùng khúc trên mõi doan hũu hăn cua $[0, \infty)$,

ii) là hàm bì chăn mũ trên $[0, \infty)$,

## Bài 4: Đạo hàm, tích phân và tích của các phép biên doi

thi

$$
\mathcal {L} \{f (t) * g (t) \} (s) = \mathcal {L} \{f (t) \} (s). \mathcal {L} \{g (t) \} (s) = F (s). G (s),
$$

túc là

$$
\mathcal {L} ^ {- 1} \{F (s). G (s) \} = f (t) * g (t).
$$

$$
\underline {{\mathbf {V i} \mathrm {d u}}}: \mathrm {a}) \mathcal {L} ^ {- 1} \left\{\frac {2}{(s - 1) \left(s ^ {2} + 4\right)} \right\} \quad \mathrm {b}) \mathcal {L} ^ {- 1} \left\{\frac {1}{s \left(s ^ {2} + 4 s + 5\right)} \right\}.
$$

## Bài 4: Đào hàm, tích phân và tích của các phép biên doi

thi

$$
\mathcal {L} \{f (t) * g (t) \} (s) = \mathcal {L} \{f (t) \} (s). \mathcal {L} \{g (t) \} (s) = F (s). G (s),
$$

túc là

$$
\mathcal {L} ^ {- 1} \{F (s). G (s) \} = f (t) * g (t).
$$

$$
\underline {{\mathbf {V i d u}}}: \mathrm {a)} \mathcal {L} ^ {- 1} \left\{\frac {2}{(s - 1) \left(s ^ {2} + 4\right)} \right\} \quad \mathrm {b)} \mathcal {L} ^ {- 1} \left\{\frac {1}{s \left(s ^ {2} + 4 s + 5\right)} \right\}.
$$

$$
\text {a)} \mathcal {L} ^ {- 1} \left\{\frac {2}{(s - 1) \left(s ^ {2} + 4\right)} \right\} = \mathcal {L} ^ {- 1} \left\{\frac {1}{s - 1}. \frac {2}{s ^ {2} + 4} \right\} \Rightarrow \left\{ \begin{array}{l l} F (s) = \frac {1}{s - 1} \\ G (s) = \frac {2}{s ^ {2} + 4} \end{array} \right. \Rightarrow \left\{ \begin{array}{l l} f (t) = e ^ {t} \\ g (t) = \sin 2 t. \end{array} \right.
$$

Khi do: $ \mathcal{L}^{-1}\left\{\frac{2}{(s-1)(s^{2}+4)}\right\}=f(t)*g(t)=\cdots=\frac{2}{5} e^{t}-\frac{2}{5}\cos 2t-\frac{1}{5}\sin 2t. $

$$
\mathcal {L} ^ {- 1} \left\{\frac {1}{s \left(s ^ {2} + 4 s + 5\right)} \right\} = \mathcal {L} ^ {- 1} \left\{\frac {1}{s}. \frac {1}{s ^ {2} + 4 s + 5} \right\} \Rightarrow \left\{ \begin{array}{l l} F (s) = \frac {1}{s} \\ G (s) = \frac {1}{s ^ {2} + 4 s + 5} \end{array} \right. \Rightarrow \left\{ \begin{array}{l l} f (t) = 1 \\ g (t) = e ^ {- 2 t} \sin t. \end{array} \right.
$$

Khi do: $ \mathcal{L}^{-1}\left\{\frac{1}{s(s^{2}+4s+5)}\right\}=f(t)*g(t)=\cdots=\frac{1}{5}-\frac{1}{5} e^{-2 t}\cos t-\frac{2}{5} e^{-2 t}\sin t. $

## Bài 4: Đạo hàm, tích phân và tích của các biên doi

## II. Dao hàm, tích phân cua biên doi Laplace

## 1. Dinh lý 1: (Đao hàm của biên doi Laplace)

Nếu hàm $f(t)$ thòa măn già thiệt

i) liên tuc tùng khúc trên [0, $ \infty $),

ii) là hàm bị chăn mũ trên $ [0,\infty) $ , túc là tôn tài các hàng sô không am $ M $ và $ \alpha $ sao cho $ |f(t)|\leq Me^{\alpha t} $ với mọi $ t\geq 0 $ ,

thi

$$
F ^ {\prime} (s) = - \mathcal {L} \{t f (t) \} (s), \mathrm {t u c l a} \mathcal {L} ^ {- 1} \{F (s) \} = - \frac {1}{t} \mathcal {L} ^ {- 1} \{F ^ {\prime} (s) \}
$$

và tông quát

$$
F ^ {(n)} (s) = (- 1) ^ {n} \mathcal {L} \{t ^ {n} f (t) \} (s), \mathrm {t u c l a} \mathcal {L} ^ {- 1} \{F (s) \} = \frac {(- 1) ^ {n}}{t ^ {n}} \mathcal {L} ^ {- 1} \{F ^ {(n)} (s) \}
$$

vói $ s > \alpha $ và $ F(s) = \mathcal{L}\{f(t)\} (s). $

## Bài 4: Đạo hàm, tích phân và tích của các biên doi

## II. Dao hàm, tích phân cua biên doi Laplace

1. Dinh lý 1: (Đao hàm của biên doi Laplace)

Nếu hàm $f(t)$ thỏa măn giá thiệt

i) liên tuc tùng khuc trên $[0, \infty)$,

ii) là hàm bị chăn mũ trên $ [0,\infty) $ , túc là tôn tài các hàng sô không am $ M $ và $ \alpha $ sao cho $ |f(t)|\leq Me^{\alpha t} $ với mọi $ t\geq 0 $ ,

thi

$$
F ^ {\prime} (s) = - \mathcal {L} \{t f (t) \} (s), \mathrm {t u c l a} \mathcal {L} ^ {- 1} \{F (s) \} = - \frac {1}{t} \mathcal {L} ^ {- 1} \{F ^ {\prime} (s) \}
$$

và tông quát

$$
F ^ {(n)} (s) = (- 1) ^ {n} \mathcal {L} \left\{t ^ {n} f (t) \right\} (s), \mathrm {t u c l a} \mathcal {L} ^ {- 1} \left\{F (s) \right\} = \frac {(- 1) ^ {n}}{t ^ {n}} \mathcal {L} ^ {- 1} \left\{F ^ {(n)} (s) \right\}
$$

vói $ s > \alpha $ và $ F(s) = \mathcal{L}\{f(t)\}(s). $

$$
\begin{array}{l} \mathrm {C} / \mathrm {M}: \mathrm {T a} \mathrm {c o} F (s) = \int_ {0} ^ {\infty} e ^ {- s t} f (t) d t \Rightarrow F ^ {\prime} (s) = \frac {d}{d s} \int_ {0} ^ {\infty} e ^ {- s t} f (t) d t = \int_ {0} ^ {\infty} \frac {d}{d s} \left(e ^ {- s t} f (t)\right) d t \\ = - \int_ {0} ^ {\infty} e ^ {- s t} \left(t f (t)\right) d t = - \mathcal {L} \left\{t f (t) \right\} (s). \mathrm {T u o n g t u r ch u n g m i n h c h o} F ^ {(n)} (s) \\ \end{array}
$$

## Bài 4: Đạo hàm, tích phân và tích của các biên doi

Ví du: a) $ \mathcal{L}\{t^{2}\cos 2t\} $ b) $ \mathcal{L}\{t^{2}\sin kt\} $ c) $ \mathcal{L}\{t e^{-t}\sin^{2} t\}. $

## Bài 4: Đạo hàm, tích phân và tích của các biên dôi

Ví du: a) $ \mathcal{L}\{t^{2}\cos 2t\} $ b) $ \mathcal{L}\{t^{2}\sin kt\} $ c) $ \mathcal{L}\{t e^{-t}\sin^{2} t\}. $

## 2. Một sô bài toán áp dụng

- Ví duỷ 1: (Giài PTVP tuyên tính thuàn nhật cáp 2 với hê sô là hàm sô)

a) $ t x^{\prime\prime} + ( t-2 ) x^{\prime} + x=0 $ $ x(0)=0. $

b) $ t x^{\prime\prime} + ( 3 t-1 ) x^{\prime} + 3 x=0 $ $ x(0)=0. $

c) $ t x^{\prime\prime} + 2 ( t-1 ) x^{\prime} - 2 x=0 $ $ x(0)=0. $

d) $ t x^{\prime\prime} + ( 4 t-3 ) x^{\prime} + 4 x=0 $ $ x(0)=0. $

## Bài 4: Đạo hàm, tích phân và tích của các biên doi

Ví du: a) $ \mathcal{L}\{t^{2}\cos 2t\} $ b) $ \mathcal{L}\{t^{2}\sin kt\} $ c) $ \mathcal{L}\{t e^{-t}\sin^{2} t\}. $

Giài: a) Đật $ F(s) = \mathcal{L}\{\cos 2t\}(s) = \frac{s}{s^{2}+4} \Rightarrow F^{\prime \prime}(s) = (-1)^{2} \mathcal{L}\{t^{2}\cos 2t\}(s) $ $ \Rightarrow \mathcal{L}\{t^{2}\cos 2t\}(s) = F^{\prime \prime}(s) = \frac{2 s^{3}-2 4 s}{(s^{2}+4)^{3}}. $ Tuông tư cho câu b) và c).

## 2. Một sô bài toán ap dụng

- Ví du 1: (Giài PTVP tuyên tính thuần nhật cáp 2 với hê số là hàm số)

a) $tx'' + (t - 2)x' + x = 0,$ $x(0) = 0.$

b) $tx'' + (3t - 1)x' + 3x = 0,$ $x(0) = 0.$

c) $tx'' + 2(t - 1)x' - 2x = 0,$ $x(0) = 0.$

d) $tx'' + (4t - 3)x' + 4x = 0,$ $x(0) = 0.$

Giài: b) Biên đội Laplace 2 về ta có:

$$
\mathcal {L} \left\{t x ^ {\prime \prime} (t) \right\} (s) + 3 \mathcal {L} \left\{t x ^ {\prime} (t) \right\} (s) - \mathcal {L} \left\{x ^ {\prime} (t) \right\} (s) + 3 \mathcal {L} \left\{x (t) \right\} (s) = 0 \quad (*)
$$

Dăt $ X(s) = \mathcal{L}\{x(t)\}(s)$, ta có:

$$
\mathcal {L} \left\{x ^ {\prime} (t) \right\} (s) = s X (s) - x (0) = s X (s) \Rightarrow \mathcal {L} \left\{t x ^ {\prime} (t) \right\} (s) = - \left(s X (s)\right) ^ {\prime} = - X (s) - s X ^ {\prime} (s)
$$

## Bài 4: Đạo hàm, tích phân và tích của các biên doi

và

$$
\begin{array}{l} \mathcal {L} \left\{x ^ {\prime \prime} (t) \right\} (s) = s ^ {2} X (s) - s x (0) - x ^ {\prime} (0) = s ^ {2} X (s) - x ^ {\prime} (0) \\ \Rightarrow \mathcal {L} \left\{t x ^ {\prime \prime} (t) \right\} (s) = - \left(s ^ {2} X (s) - x ^ {\prime} (0)\right) ^ {\prime} = - 2 s X (s) - s ^ {2} X ^ {\prime} (s). \\ \end{array}
$$

Thay vào (*) ta có:

$$
\begin{array}{l} - 2 s X (s) - s ^ {2} X ^ {\prime} (s) + 3 \left(- X (s) - s X ^ {\prime} (s)\right) - s X (s) + 3 X (s) = 0 \\ \Leftrightarrow \left(s ^ {2} + 3 s\right) X ^ {\prime} (s) + 3 s X (s) = 0 \Leftrightarrow (s + 3) X ^ {\prime} (s) + 3 X (s) = 0. \\ \end{array}
$$

PT trên là PT phân ly biên sô, ta tính được nghiênmış $ X(s) = \frac{C}{(s+3)^{3}} $ với $ C \neq 0 $.

Khi đó: Nghiêm của phuong trình dã cho là $ x(t) = \frac{C}{2} \mathcal{L}^{-1} \left\{ \frac{2!}{(s+3)^{3}} \right\} = K e^{-3 t} t^{2}. $

## Bài 4: Đạo hàm, tích phân và tích của các biên dối

và

$$
\begin{array}{l} \mathcal {L} \left\{x ^ {\prime \prime} (t) \right\} (s) = s ^ {2} X (s) - s x (0) - x ^ {\prime} (0) = s ^ {2} X (s) - x ^ {\prime} (0) \\ \Rightarrow \mathcal {L} \left\{t x ^ {\prime \prime} (t) \right\} (s) = - \left(s ^ {2} X (s) - x ^ {\prime} (0)\right) ^ {\prime} = - 2 s X (s) - s ^ {2} X ^ {\prime} (s). \\ \end{array}
$$

Thay vào (*) ta có:

$$
\begin{array}{l} - 2 s X (s) - s ^ {2} X ^ {\prime} (s) + 3 \left(- X (s) - s X ^ {\prime} (s)\right) - s X (s) + 3 X (s) = 0 \\ \Leftrightarrow \left(s ^ {2} + 3 s\right) X ^ {\prime} (s) + 3 s X (s) = 0 \Leftrightarrow (s + 3) X ^ {\prime} (s) + 3 X (s) = 0. \\ \end{array}
$$

PT trên là PT phân ly biên sô, ta tính được nghiênmış $ X(s)=\frac{C}{(s+3)^{3}} $ với $ C\neq0. $

Khi đó: Nghiêm của phường trình đã cho là $ x(t)=\frac{C}{2}\mathcal{L}^{-1}\left\{\frac{2!}{(s+3)^{3}}\right\}=Ke^{-3t}t^{2} $

- Ví du 2: Tìm các biên dối Laplace nguoc sau dây:

$$
\begin{array}{l} a) \mathcal {L} ^ {- 1} \left\{\arctan \frac {1}{s} \right\} b) \mathcal {L} ^ {- 1} \left\{\operatorname {a r c c o t} \frac {1}{s} \right\} \\ c) \mathcal {L} ^ {- 1} \left\{\ln \frac {s ^ {2} + 1}{s ^ {2} + 4} \right\} d) \mathcal {L} ^ {- 1} \left\{\arctan \frac {3}{s + 2} \right\}. \\ \end{array}
$$

## Bài 4: Đạo hàm, tích phân và tích của các biên dối

và

$$
\begin{array}{l} \mathcal {L} \left\{x ^ {\prime \prime} (t) \right\} (s) = s ^ {2} X (s) - s x (0) - x ^ {\prime} (0) = s ^ {2} X (s) - x ^ {\prime} (0) \\ \Rightarrow \mathcal {L} \left\{t x ^ {\prime \prime} (t) \right\} (s) = - \left(s ^ {2} X (s) - x ^ {\prime} (0)\right) ^ {\prime} = - 2 s X (s) - s ^ {2} X ^ {\prime} (s). \\ \end{array}
$$

$$
\begin{array}{l} - 2 s X (s) - s ^ {2} X ^ {\prime} (s) + 3 \left(- X (s) - s X ^ {\prime} (s)\right) - s X (s) + 3 X (s) = 0 \\ \Leftrightarrow \left(s ^ {2} + 3 s\right) X ^ {\prime} (s) + 3 s X (s) = 0 \Leftrightarrow (s + 3) X ^ {\prime} (s) + 3 X (s) = 0. \\ \end{array}
$$

PT trên là PT phân ly biên sô, ta tính được nghiênmış $ X(s) = \frac{C}{(s+3)^{3}} $ với $ C\neq 0. $

Khi đó: Nghiêm của phuông trình đã cho là $ x(t) = \frac{C}{2}\mathcal{L}^{-1}\left\{\frac{2!}{(s+3)^{3}}\right\} = Ke^{-3t}t^{2}. $

- Ví du 2: Tìm các biên dối Laplace nguoc sau dây:

$$
\begin{array}{l} a) \mathcal {L} ^ {- 1} \left\{\arctan \frac {1}{s} \right\} b) \mathcal {L} ^ {- 1} \left\{\operatorname {a r c c o t} \frac {1}{s} \right\} \\ c) \mathcal {L} ^ {- 1} \left\{\ln \frac {s ^ {2} + 1}{s ^ {2} + 4} \right\} d) \mathcal {L} ^ {- 1} \left\{\arctan \frac {3}{s + 2} \right\}. \\ \end{array}
$$

Giài: c) Đalet $ F(s)=\ln \frac{s^{2}+1}{s^{2}+4}=\ln(s^{2}+1)-\ln(s^{2}+4) $ ta có:

$$
f (t) = - \frac {1}{t} \mathcal {L} ^ {- 1} \left\{F ^ {\prime} (s) \right\} = - \frac {1}{t} \mathcal {L} ^ {- 1} \left\{\frac {2 s}{s ^ {2} + 1} - \frac {2 s}{s ^ {2} + 4} \right\} = \frac {2}{t} (\cos 2 t - \cos t)
$$

$$
f (t) = - \frac {1}{t} \mathcal {L} ^ {- 1} \left\{F ^ {\prime} (s) \right\} = - \frac {1}{t} \mathcal {L} ^ {- 1} \left\{\frac {2 s}{s ^ {2} + 1} - \frac {2 s}{s ^ {2} + 4} \right\} = \frac {2}{t} (\cos 2 t - \cos t)
$$

3. Dinh lý 2: (Tích phân cúa biên dối Laplace)

Nếu hàm $f(t)$ thoa măn già thiệt

i) liên tuc tùng khúc trên $[0, \infty)$ và $\exists \lim_{t\to 0^{+}}\frac{f(t)}{t},$

ii) là hàm bị chăn mũ trên $ [0,\infty) $ , túc là tôn tài các hàng sô không am $ M $ và $ \alpha $ sao cho $ |f(t)|\leq Me^{\alpha t} $ với mọi $ t\geq 0 $ ,

thi

$$
\mathcal {L} \left\{\frac {f (t)}{t} \right\} (s) = \int_ {s} ^ {\infty} F (\lambda) d \lambda , \mathrm {t u c l a} f (t) = t \mathcal {L} ^ {- 1} \left\{\int_ {s} ^ {\infty} F (\lambda) d \lambda \right\}
$$

vói $ s > \alpha $ và $ F(s) = \mathcal{L}\{f(t)\}(s). $

$$
f (t) = - \frac {1}{t} \mathcal {L} ^ {- 1} \left\{F ^ {\prime} (s) \right\} = - \frac {1}{t} \mathcal {L} ^ {- 1} \left\{\frac {2 s}{s ^ {2} + 1} - \frac {2 s}{s ^ {2} + 4} \right\} = \frac {2}{t} (\cos 2 t - \cos t)
$$

3. Dinh lý 2: (Tích phân cúa biên dối Laplace)

Nếu hàm $f(t)$ thoa măn già thiệt

i) liên tuc tùng khuc trên $[0, \infty)$ và $\exists \lim_{t\to 0^{+}}\frac{f(t)}{t},$

ii) là hàm bị chăn mũ trên $ [0,\infty) $ , túc là tôn tài các hàng sô không am $ M $ và $ \alpha $ sao cho $ |f(t)|\leq Me^{\alpha t} $ với mọi $ t\geq 0 $ ,

thi

$$
\mathcal {L} \left\{\frac {f (t)}{t} \right\} (s) = \int_ {s} ^ {\infty} F (\lambda) d \lambda , \mathrm {t u c l a} f (t) = t \mathcal {L} ^ {- 1} \left\{\int_ {s} ^ {\infty} F (\lambda) d \lambda \right\}
$$

vói $ s > \alpha $ và $ F(s) = \mathcal{L}\{f(t)\}(s). $

C/M: Ta có $ \mathcal{I}=\int_{s}^{\infty} F(\lambda) d\lambda=\int_{s}^{\infty} \left(\int_{0}^{\infty} e^{-\lambda t} f(t) d t\right) d\lambda. $ Doi thu tui tich phan ta co:

## Bài 4: Đạo hàm, tích phân và tích của các phép biên doi

$$
\begin{array}{l} \mathcal {I} = \int_ {0} ^ {\infty} \left(\int_ {s} ^ {\infty} e ^ {- \lambda t} f (t) d \lambda\right) d t = - \int_ {0} ^ {\infty} f (t) \left(\frac {e ^ {- \lambda t}}{t} \Bigg | _ {\lambda = s} ^ {\lambda = \infty}\right) d t \\ = - \int_ {0} ^ {\infty} f (t) \left(0 - \frac {e ^ {- s t}}{t}\right) d t = \int_ {0} ^ {\infty} e ^ {- s t} \frac {f (t)}{t} d t = \mathscr {L} \left\{\frac {f (t)}{t} \right\} (s). \\ \end{array}
$$

$$
\underline {{\mathbf {V i} \mathbf {d u}}}: \mathrm {a)} \mathcal {L} \left\{\frac {\sinh t}{t} \right\} \quad \mathrm {b)} \mathcal {L} \left\{\frac {1 - \cos 2 t}{t} \right\} \quad \mathrm {c)} \mathcal {L} ^ {- 1} \left\{\frac {s}{(s ^ {2} + 1) ^ {3}} \right\}.
$$

$$
\begin{array}{l} \mathcal {I} = \int_ {0} ^ {\infty} \left(\int_ {s} ^ {\infty} e ^ {- \lambda t} f (t) d \lambda\right) d t = - \int_ {0} ^ {\infty} f (t) \left(\frac {e ^ {- \lambda t}}{t} \Bigg | _ {\lambda = s} ^ {\lambda = \infty}\right) d t \\ = - \int_ {0} ^ {\infty} f (t) \left(0 - \frac {e ^ {- s t}}{t}\right) d t = \int_ {0} ^ {\infty} e ^ {- s t} \frac {f (t)}{t} d t = \mathscr {L} \left\{\frac {f (t)}{t} \right\} (s). \\ \end{array}
$$

$$
\underline {{\mathbf {V i} \mathrm {d u}}}: \mathrm {a)} \mathcal {L} \left\{\frac {\sinh t}{t} \right\} \quad \mathrm {b)} \mathcal {L} \left\{\frac {1 - \cos 2 t}{t} \right\} \quad \mathrm {c)} \mathcal {L} ^ {- 1} \left\{\frac {s}{(s ^ {2} + 1) ^ {3}} \right\}.
$$

Giãi: a) Ta có $ F(s) = \mathcal{L}\{\sinh t\}(s) = \frac{1}{s^{2} - 1} $ (DK: $ s > 1 $ ). Khi dó:

$$
\begin{array}{l} \mathcal {L} \left\{\frac {\sinh t}{t} \right\} (s) = \int_ {s} ^ {\infty} F (\lambda) d \lambda = \int_ {s} ^ {\infty} \frac {1}{\lambda^ {2} - 1} d \lambda \\ = \frac {1}{2} \int_ {s} ^ {\infty} \left(\frac {1}{\lambda - 1} - \frac {1}{\lambda + 1}\right) d \lambda = \frac {1}{2} \ln \left. \frac {| \lambda - 1 |}{| \lambda + 1 |} \right| _ {s} ^ {\infty} \\ = \frac {1}{2} \left(\lim _ {\lambda \rightarrow \infty} \ln \frac {| \lambda - 1 |}{| \lambda + 1 |} - \ln \frac {| s - 1 |}{| s + 1 |}\right) = - \frac {1}{2} \ln \frac {| s - 1 |}{| s + 1 |} = \frac {1}{2} \ln \frac {s + 1}{s - 1} \mathrm {d o} s > 1. \\ \end{array}
$$

## Bài 4: Đạo hàm, tích phân và tích của các phép biên doi

## III. Biên doi Laplace của hàm liên tục tùngkhúc

1. Dinh nghi:a: Hàm bác thang (Heaviside) tài $t = a$ được ký hiệu là $u_{a}(t)$ và được xác định boi

$$
u _ {a} (t) = \left\{ \begin{array}{l l} 0 & \mathrm {nêu} t < a \\ 1 & \mathrm {nêu} t \geq a \end{array} , \quad \mathrm {h oăc t a cūng viêt} u _ {a} (t) = u (t - a). \right.
$$

## Bài 4: Đạo hàm, tích phân và tích của các phép biên doi

## III. Biên doi Laplace của hàm liên tục tùngkhúc

1. Dinh nghi:a: Hàm bác thang (Heaviside) tài $t = a$ được ký hiệu là $u_{a}(t)$ và được xác định boi

$$
u _ {a} (t) = \left\{ \begin{array}{l l} 0 & \mathrm {n} \hat {\mathrm {e u}} t < a \\ 1 & \mathrm {n} \hat {\mathrm {e u}} t \geq a \end{array} , \quad \mathrm {h o} \check {a c} \mathrm {t a} \mathrm {c u n g} \mathrm {v i e t} u _ {a} (t) = u (t - a). \right.
$$

2. Dinh lý: Nếu $ F(s) = \mathcal{L}\{f(t)\}(s) $ tôn tải với mοi $ s > \alpha $ , thì $\mathcal{L}\left\{u(t-a)f(t-a)\right\}(s)$ tôn tải với mοi $ s > \alpha + a $ và

$$
\mathcal {L} \left\{u (t - a) f (t - a) \right\} (s) = e ^ {- a s} F (s),
$$

túc là

$$
u (t - a) f (t - a) = \mathcal {L} ^ {- 1} \left\{e ^ {- a s} F (s) \right\}.
$$

## III. Biên doi Laplace của hàm liên tục tùngkhúc

1. Dinh nghi:a: Hàm bác thang (Heaviside) tài $t = a$ được ký hiệu là $u_{a}(t)$ và được xác định boi

$$
u _ {a} (t) = \left\{ \begin{array}{l l} 0 & \mathrm {n} \hat {\mathrm {e u}} t < a \\ 1 & \mathrm {n} \hat {\mathrm {e u}} t \geq a \end{array} , \quad \mathrm {h o} \check {a c} \mathrm {t a} \mathrm {c u n g} \mathrm {v i e t} u _ {a} (t) = u (t - a). \right.
$$

2. Dinh lý: Nếu $ F(s) = \mathcal{L}\{f(t)\}(s) $ tôn tải với mοi $ s > \alpha $ , thì $\mathcal{L}\left\{u(t-a)f(t-a)\right\}(s)$ tôn tải với mοi $ s > \alpha + a $ và

$$
\mathcal {L} \left\{u (t - a) f (t - a) \right\} (s) = e ^ {- a s} F (s),
$$

túc là

$$
u (t - a) f (t - a) = \mathcal {L} ^ {- 1} \left\{e ^ {- a s} F (s) \right\}.
$$

C/M: Ta co VT $ = e^{-as} F(s) = e^{-as}\int_{0}^{\infty} e^{-s\lambda} f(\lambda) d\lambda = \int_{0}^{\infty} e^{-s(\lambda + a)} f(\lambda) d\lambda. $

Dăt $ t=\lambda+a \Rightarrow \mathrm{VT}=\int_{a}^{\infty} e^{-st} f(t-a) d t.$ Ta thây: $ u(t-a)f(t-a)=\left\{\begin{array}{ll}0&\mathrm{nêu} t<a\\ f(t-a)&\mathrm{nêu} t\geq a.\end{array}\right. $

$$
\Rightarrow \mathrm {V T} = \int_ {a} ^ {\infty} e ^ {- s t} u (t - a) f (t - a) d t = \int_ {0} ^ {\infty} e ^ {- s t} u (t - a) f (t - a) d t = \mathscr {L} \left\{u (t - a) f (t - a) \right\} (s).
$$

Ví du: Tim $ \mathcal{L}\{g(t)\} (s) $ biêt

$$
\mathrm {a}) g (t) = \left\{ \begin{array}{l l} 0, & 0 \leq t < 2 \pi \\ \cos 2 t, & t \geq 2 \pi \end{array} \right. \quad \mathrm {b}) g (t) = \left\{ \begin{array}{l l} t, & 0 \leq t \leq 1 \\ 0, & t > 1 \end{array} \right.
$$

## Bài 4: Đạo hàm, tích phân và tích của các phép biên doi

$$
\Rightarrow \mathrm {V T} = \int_ {a} ^ {\infty} e ^ {- s t} u (t - a) f (t - a) d t = \int_ {0} ^ {\infty} e ^ {- s t} u (t - a) f (t - a) d t = \mathscr {L} \left\{u (t - a) f (t - a) \right\} (s).
$$

Ví du: Tim $ \mathcal{L}\{g(t)\} (s) $ biêt

$$
\mathrm {a}) g (t) = \left\{ \begin{array}{l l} 0, & 0 \leq t < 2 \pi \\ \cos 2 t, & t \geq 2 \pi \end{array} \right. \quad \mathrm {b}) g (t) = \left\{ \begin{array}{l l} t, & 0 \leq t \leq 1 \\ 0, & t > 1 \end{array} \right.
$$

Giai: a) Ta co: $ g ( t ) = u ( t - 2 \pi ) \cos 2 t = u ( t - 2 \pi ) \cos 2 ( t - 2 \pi ). $

$$
\mathrm {K h i} \mathrm {d o}: \mathcal {L} \{g (t) \} (s) = \mathcal {L} \{u (t - 2 \pi) \cos 2 (t - 2 \pi) \} (s) = e ^ {- 2 \pi s} \mathcal {L} \{\cos 2 t \} (s) = e ^ {- 2 \pi s}. \frac {s}{s ^ {2} + 4}
$$

$$
\Rightarrow \mathrm {V T} = \int_ {a} ^ {\infty} e ^ {- s t} u (t - a) f (t - a) d t = \int_ {0} ^ {\infty} e ^ {- s t} u (t - a) f (t - a) d t = \mathscr {L} \left\{u (t - a) f (t - a) \right\} (s).
$$

Ví du: Tim $ \mathcal{L}\{g(t)\} (s) $ biêt

$$
\mathrm {a}) g (t) = \left\{ \begin{array}{l l} 0, & 0 \leq t < 2 \pi \\ \cos 2 t, & t \geq 2 \pi \end{array} \right. \quad \mathrm {b}) g (t) = \left\{ \begin{array}{l l} t, & 0 \leq t \leq 1 \\ 0, & t > 1 \end{array} \right.
$$

Giái: a) Ta có: $ g ( t ) = u ( t - 2 \pi ) \cos 2 t = u ( t - 2 \pi ) \cos 2 ( t - 2 \pi ). $

$$
\mathrm {K h i} \mathrm {d o}: \mathcal {L} \{g (t) \} (s) = \mathcal {L} \{u (t - 2 \pi) \cos 2 (t - 2 \pi) \} (s) = e ^ {- 2 \pi s} \mathcal {L} \{\cos 2 t \} (s) = e ^ {- 2 \pi s}. \frac {s}{s ^ {2} + 4}
$$

b) Ta co: $ g ( t )=\left( 1-u ( t-1 ) \right) t=t-t u ( t-1 ). $

$$
\begin{array}{l} \mathcal {L} \{g (t) \} (s) = \mathcal {L} \{t \} (s) - \mathcal {L} \{u (t - 1) t \} (s) \\ = \frac {1}{s ^ {2}} - \mathcal {L} \{u (t - 1) (t - 1) \} (s) - \mathcal {L} \{u (t - 1). 1 \} (s) \\ = \frac {1}{s ^ {2}} - e ^ {- s} \mathcal {L} \{t \} (s) - e ^ {- s} \mathcal {L} \{1 \} (s) \frac {1}{s ^ {2}} - e ^ {- s} \left(\frac {1}{s ^ {2}} + \frac {1}{s}\right) = \frac {1 - e ^ {- s} (s + 1)}{s ^ {2}}. \\ \end{array}
$$

## Bài 4: Đào hàm, tích phân và tích của các phép biên doi

3. Áp dụng giài bài toán giá trị ban dâu: Giài các PTVP

$$
\left\{ \begin{array}{l} x ^ {\prime \prime} + 9 x = f (t) \\ x (0) = x ^ {\prime} (0) = 0 \end{array} \right.
$$

$$
\mathrm {v o i} f (t) = \left\{ \begin{array}{l l} 1, & 0 \leq t < \pi \\ 0, & t \geq \pi . \end{array} \right.
$$

$$
\left\{ \begin{array}{l} x ^ {\prime \prime} + 2 x ^ {\prime} + 5 x = f (t) \\ x (0) = x ^ {\prime} (0) = 0 \end{array} \right.
$$

$$
\mathrm {v o i} f (t) = \left\{ \begin{array}{l l} 2 0 \cos t, & 0 \leq t < 2 \pi \\ 0, & t \geq 2 \pi . \end{array} \right.
$$

$$
\left\{ \begin{array}{l} x ^ {\prime \prime} + x = f (t) \\ x (0) = x ^ {\prime} (0) = 0 \end{array} \right.
$$

$$
\mathrm {v o i} f (t) = \left\{ \begin{array}{l l} t, & 0 \leq t \leq 1 \\ 0, & t > 1. \end{array} \right.
$$

## Bài 4: Đào hàm, tích phân và tích của các phép biên doi

3. Áp dụng giài bài toán giá trị ban dàu: Giài các PTVP

$$
\left\{ \begin{array}{l l} x ^ {\prime \prime} + 9 x = f (t) \\ x (0) = x ^ {\prime} (0) = 0 \end{array} \right. \quad \mathrm {v o i} f (t) = \left\{ \begin{array}{l l} 1, & 0 \leq t < \pi \\ 0, & t \geq \pi . \end{array} \right.
$$

$$
\left\{ \begin{array}{l l} x ^ {\prime \prime} + 2 x ^ {\prime} + 5 x = f (t) \\ x (0) = x ^ {\prime} (0) = 0 \end{array} \right. \quad \mathrm {v o i} f (t) = \left\{ \begin{array}{l l} 2 0 \cos t, & 0 \leq t < 2 \pi \\ 0, & t \geq 2 \pi . \end{array} \right.
$$

$$
\left\{ \begin{array}{l l} x ^ {\prime \prime} + x = f (t) \\ x (0) = x ^ {\prime} (0) = 0 \end{array} \right. \quad \mathrm {v o i} f (t) = \left\{ \begin{array}{l l} t, & 0 \leq t \leq 1 \\ 0, & t > 1. \end{array} \right.
$$

Giái: a) Ta thây: $ f(t)=1-u(t-\pi). $ Biên dôi Laplace 2 vê ta duoc

$$
\begin{array}{l} \mathcal {L} \left\{x ^ {\prime \prime} (t) \right\} (s) + 9 \mathcal {L} \left\{x (t) \right\} (s) = \mathcal {L} \left\{1 \right\} (s) - \mathcal {L} \left\{u (t - \pi). 1 \right\} (s) \\ \Leftrightarrow s ^ {2} X (s) - s x (0) - x ^ {\prime} (0) + 9 X (s) = \frac {1}{s} - e ^ {- \pi s}. \frac {1}{s} \Leftrightarrow X (s) = \frac {1}{s \left(s ^ {2} + 9\right)} - e ^ {- \pi s}. \frac {1}{s \left(s ^ {2} + 9\right)} \\ \end{array}
$$

Khi do:

$$
\begin{array}{l} x (t) = \mathcal {L} ^ {- 1} \{F (s) \} - \mathcal {L} ^ {- 1} \{e ^ {- \pi s} F (s) \} = f (t) - u (t - \pi) f (t - \pi) \\ = \frac {1}{9} (1 - \cos 3 t) - \frac {1}{9} u (t - \pi) \left(1 - \cos 3 (t - \pi)\right) = \frac {1}{9} (1 - \cos 3 t) - \frac {1}{9} u (t - \pi) \left(1 + \cos 3 t\right). \\ \end{array}
$$

## Chúc các em học tôt!