FROM python:3.12-slim

WORKDIR /app

# Cài đặt dependencies từ requirements.txt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy mã nguồn
COPY main.py .
COPY src/ ./src/

# Thư mục data sẽ được mount qua volume ở docker-compose
RUN mkdir -p data


CMD ["python", "main.py"]
