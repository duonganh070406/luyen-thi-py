# Flow nghiep vu — EduQuest (luyen thi + phong thi online)

> Tai lieu nay ve cac luong flow nghiep vu cua he thong. Render bang bat ky
> cong cu ho tro Mermaid (VS Code, GitHub, trang `/gioi-thieu`... ).

## 1. Tong quan vai tro

```mermaid
flowchart LR
    subgraph NguoiDung["Nguoi luyen (khong can dang nhap)"]
        A1[Trang chu] --> A2[Luyen thi]
        A2 --> A3[Xem ket qua + giai thich]
        A3 --> A4[Bao loi cau hoi]
        A3 --> A5[Bieu do nang luc]
    end
    subgraph ThiSinh["Thi sinh (nhap ten + ma phong)"]
        B1[Phong thi] --> B2[Lam bai + tu luu]
        B2 --> B3[Tu dong thu bai]
        B3 --> B4[Bang xep hang]
    end
    subgraph QTV["Quan tri vien (dang nhap)"]
        C1[Import Excel/CSV] --> C2[Ngan hang de]
        C2 --> C3[Tao phong thi]
        C3 --> C4[Giam sat truc tiep]
        C4 --> C5[Dong bai + sua diem]
        C5 --> C6[Xuat bao cao CSV]
        A4 --> C7[Xu ly bao loi]
        C2 --> C8[ML goi y do kho]
    end
```

## 2. Luyen thi (khong dang nhap)

```mermaid
sequenceDiagram
    actor U as Nguoi luyen
    participant FE as Frontend /luyen-thi
    participant BE as Backend
    U->>FE: Chon mon + chu de (hon hop) + do kho + so cau
    FE->>BE: POST /api/subjects/{mon}/practice-quiz
    Note over BE: Loc chu de → tron do kho theo ty le<br/>De 50-30-20 · TB 30-40-30 · Kho 20-30-50<br/>→ tron cau hoi + dao dap an
    BE-->>FE: Danh sach cau hoi
    U->>FE: Chon dap an tung cau
    U->>FE: Nop bai
    FE->>BE: POST /api/subjects/{mon}/history (cham + luu)
    BE-->>FE: Ket qua + giai thich
    FE->>BE: GET /api/subjects/{mon}/competency
    BE-->>FE: Bieu do nang luc (chu de / do kho)
```

## 3. Import de Excel/CSV (format image.png)

```mermaid
flowchart TD
    S([File Excel/CSV]) --> H{Header hop le? Cau hoi - A - B - C - D - E - Dap an - Do kho - Chu de - Giai thich}
    H -- Thieu cot --> E1[Bao loi: thieu cot bat buoc]
    H -- Du cot --> R[Duyet tung dong]
    R --> V{>= 2 phuong an? Dap an khop?}
    V -- Khong --> E2[Ghi canh bao + bo qua/chuan hoa]
    V -- Ok --> N[Chuan hoa: Dap an ve A-E, Do kho ve De/TB/Kho]
    N --> J[(questions.json cua mon)]
```

## 4. Phong thi online (thi that)

```mermaid
sequenceDiagram
    actor A as Quan tri vien
    actor T as Thi sinh
    participant BE as Backend
    A->>BE: POST /api/rooms (mon, chu de, do kho, so cau, gio, tron, max vi pham)
    BE-->>A: Ma phong (vd X7K2PQ)
    A->>T: Cap ma phong + gio thi
    T->>BE: POST /api/rooms/join (ten + ma)
    BE-->>T: De rieng da tron + dap an dao
    loop Moi cau tra loi
        T->>BE: POST /api/rooms/answer (luu ngay)
    end
    T->>BE: Chuyen tab → POST /api/rooms/violation
    alt Vi pham >= gioi han
        BE->>BE: Tu dong thu bai
    else Het gio / Nop tay / QTV dong phong
        T->>BE: POST /api/rooms/submit
    end
    BE-->>T: Diem + bang xep hang
    A->>BE: GET /api/rooms/{id}/monitor (poll 3s)
    A->>BE: PUT leaderboard (sua diem) / GET export (CSV)
```

## 5. Chong gian lan + tu dong luu/thu

```mermaid
stateDiagram-v2
    [*] --> DangLam
    DangLam --> LuuNhay: Bam dap an → POST /answer
    LuuNhay --> DangLam
    DangLam --> CanhBao: visibilitychange/blur → POST /violation
    CanhBao --> DangLam: So lan < max
    CanhBao --> BiThu: So lan >= max → cham + submitted
    DangLam --> BiThu: Het gio / Nop bai / QTV dong phong
    BiThu --> [*]
```

## 6. Bao loi + ML do kho

```mermaid
flowchart LR
    U[Nguoi luyen] -->|POST /reports| Q[(reports.json)]
    Q --> A[QTV duyet → da_xu_ly]
    H[(history.json snapshot)] --> M{Tinh wrong_rate theo cau}
    M --> S{>=60% Kho · 30-60% TB · <30% De}
    S --> G[Goi y + nut Ap dung]
```
