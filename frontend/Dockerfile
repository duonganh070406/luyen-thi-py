FROM node:20-slim

WORKDIR /app

# Copy package files và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Vite dev server trong container bat buoc --host 0.0.0.0 moi truy cap duoc tu ngoai
EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
