FROM node:20-slim

WORKDIR /app

# Copy package files và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Vite dev server sẽ chạy dựa trên config trong vite.config.ts (đọc từ .env)
# Chúng ta không cần build static vì user muốn đơn giản
CMD ["npm", "run", "dev"]
