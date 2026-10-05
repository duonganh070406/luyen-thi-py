@echo off
cd /d "%~dp0"
set PYTHONUTF8=1
python --version >nul 2>nul
if errorlevel 1 (
  echo CHUA CAI PYTHON. Trinh duyet se mo trang tai ve. Hay tai Python 3.10 tro len, nho tick "Add python.exe to PATH", cai xong bam dup start.bat lai.
  start https://www.python.org/downloads/
  pause
  exit /b
)
if not exist .venv\ok.txt (
  echo Dang cai thu vien lan dau, vui long cho 1-2 phut...
  python -m venv .venv
  .venv\Scripts\python -m pip install -r requirements.txt && echo ok> .venv\ok.txt
)
if not exist .venv\ok.txt (
  echo CAI THU VIEN BI LOI. Hay chup man hinh cua so nay.
  pause
  exit /b
)
echo.
echo === DE NGUYEN CUA SO NAY. DONG CUA SO = TAT WEB ===
start /min "" cmd /c "ping -n 4 127.0.0.1 >nul & start http://localhost:3000"
.venv\Scripts\python app.py
pause
