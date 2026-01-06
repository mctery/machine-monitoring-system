# Machine Monitoring System - Setup Guide

## สารบัญ
1. [ความต้องการระบบ](#1-ความต้องการระบบ)
2. [ติดตั้งโปรเจค](#2-ติดตั้งโปรเจค)
3. [ตั้งค่า Database](#3-ตั้งค่า-database)
4. [รันโหมด Development](#4-รันโหมด-development)
5. [รันโหมด Production](#5-รันโหมด-production)
6. [คำสั่งที่ใช้บ่อย](#6-คำสั่งที่ใช้บ่อย)

---

## 1. ความต้องการระบบ

ก่อนเริ่มต้น ต้องติดตั้งโปรแกรมเหล่านี้:

| โปรแกรม | เวอร์ชันขั้นต่ำ | ดาวน์โหลด |
|---------|---------------|-----------|
| Node.js | 18.x | https://nodejs.org |
| MySQL | 8.x | https://mysql.com หรือใช้ TiDB Cloud |
| Git | - | https://git-scm.com |
| PM2 | - | ติดตั้งผ่าน npm (สำหรับ Production) |

---

## 2. ติดตั้งโปรเจค

### 2.1 Clone โปรเจค
```bash
git clone https://github.com/mctery/machine-monitoring-system.git
cd machine-monitoring-system
```

### 2.2 ติดตั้ง Dependencies
```bash
npm install
```

### 2.3 สร้างไฟล์ Environment
```bash
# คัดลอกไฟล์ตัวอย่าง
cp .env.example .env.local
```

### 2.4 แก้ไขไฟล์ `.env.local`
เปิดไฟล์ `.env.local` แล้วใส่ค่าตามนี้:

```env
# Database Configuration
DB_HOST=your_database_host
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
DB_PORT=3306
DB_SSL=true          # ใส่ true ถ้าใช้ TiDB Cloud หรือ SSL

# สำหรับ Prisma (ใช้ตอน db:push, db:seed)
DATABASE_URL=mysql://user:password@host:port/database?sslaccept=strict

# Frontend (ปกติไม่ต้องแก้)
VITE_API_URL=/api
```

#### ตัวอย่าง: TiDB Cloud
```env
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_NAME=plc_log
DB_USER=abc123.root
DB_PASSWORD=yourpassword
DB_PORT=4000
DB_SSL=true

DATABASE_URL=mysql://abc123.root:yourpassword@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/plc_log?sslaccept=strict
```

#### ตัวอย่าง: MySQL localhost
```env
DB_HOST=localhost
DB_NAME=plc_log
DB_USER=root
DB_PASSWORD=yourpassword
DB_PORT=3306
DB_SSL=false

DATABASE_URL=mysql://root:yourpassword@localhost:3306/plc_log
```

---

## 3. ตั้งค่า Database

### 3.1 สร้าง Database
ถ้ายังไม่มี database ให้สร้างก่อน:

```sql
CREATE DATABASE plc_log;
```

### 3.2 สร้างตาราง
```bash
npm run db:push
```
คำสั่งนี้จะสร้างตาราง `machine_hours` และ `machine_settings` ให้อัตโนมัติ

### 3.3 ใส่ข้อมูลตัวอย่าง (ถ้าต้องการ)
```bash
npm run db:seed
```

---

## 4. รันโหมด Development

### วิธีที่ 1: ใช้ Vercel Dev (แนะนำ)
```bash
npm run dev:vercel
```
- เปิดเบราว์เซอร์ไปที่: http://localhost:3000
- รัน Frontend + API พร้อมกัน
- Hot reload ทั้ง frontend และ API

### วิธีที่ 2: ใช้ Vite อย่างเดียว
```bash
npm run dev
```
- เปิดเบราว์เซอร์ไปที่: http://localhost:5173
- รันเฉพาะ Frontend (ต้องมี API server แยก)

---

## 5. รันโหมด Production

### 5.1 Build โปรเจค
```bash
npm run build
```
จะได้โฟลเดอร์ `dist/` ที่มีไฟล์ static ทั้งหมด

### 5.2 รัน Production Server

#### วิธีที่ 1: รันด้วย Node.js โดยตรง
```bash
npm start
```
- Server รันที่: http://localhost:3000
- กด `Ctrl+C` เพื่อหยุด

#### วิธีที่ 2: รันด้วย PM2 (แนะนำสำหรับ Production จริง)

**ติดตั้ง PM2 (ครั้งแรกครั้งเดียว):**
```bash
npm install -g pm2
```

**เริ่ม Server:**
```bash
npm run start:pm2
```
- Server รันที่: http://localhost:8000
- รันใน background อัตโนมัติ
- Restart อัตโนมัติถ้า crash

**คำสั่ง PM2 อื่นๆ:**
```bash
# ดู logs
npm run logs:pm2

# หยุด server
npm run stop:pm2

# restart server
npm run restart:pm2

# ดูสถานะ
pm2 status
```

### 5.3 ตั้งให้รันอัตโนมัติเมื่อเปิดเครื่อง (Windows)

**สร้าง Startup Script:**
1. กด `Win + R` พิมพ์ `shell:startup` แล้ว Enter
2. สร้างไฟล์ `start-monitoring.bat` ใส่:
```batch
@echo off
cd /d "E:\Dev\machine-monitoring-system"
pm2 start ecosystem.config.cjs
```
3. บันทึกไฟล์

หรือใช้ PM2 save:
```bash
pm2 save
pm2 startup
```

---

## 6. คำสั่งที่ใช้บ่อย

| คำสั่ง | คำอธิบาย |
|--------|---------|
| `npm install` | ติดตั้ง dependencies |
| `npm run dev:vercel` | รัน Development mode |
| `npm run build` | Build สำหรับ Production |
| `npm start` | รัน Production server |
| `npm run start:pm2` | รัน Production ด้วย PM2 |
| `npm run stop:pm2` | หยุด PM2 server |
| `npm run logs:pm2` | ดู logs ของ PM2 |
| `npm run db:push` | สร้าง/อัพเดทตาราง |
| `npm run db:seed` | ใส่ข้อมูลตัวอย่าง |
| `npm run db:studio` | เปิด Prisma Studio |

---

## Troubleshooting

### ปัญหา: SSL Certificate Error
```
HANDSHAKE_SSL_ERROR / self-signed certificate
```
**แก้ไข:** ตรวจสอบว่า `DB_SSL=true` ในไฟล์ `.env.local`

### ปัญหา: Connection Refused
```
ECONNREFUSED 127.0.0.1:3306
```
**แก้ไข:**
- ตรวจสอบว่า MySQL server รันอยู่
- ตรวจสอบ DB_HOST, DB_PORT ถูกต้อง

### ปัญหา: API ไม่ทำงาน (Development)
```
AggregateError หรือ Proxy Error
```
**แก้ไข:** ใช้ `npm run dev:vercel` แทน `npm run dev`

### ปัญหา: Build Error
```
Cannot find module '@prisma/client'
```
**แก้ไข:** รัน `npx prisma generate` ก่อน build

---

## โครงสร้างไฟล์สำคัญ

```
machine-monitoring-system/
├── api/                    # Vercel Serverless Functions
│   ├── health.ts
│   ├── machine-hours.ts
│   ├── machine-settings.ts
│   ├── machine-status.ts
│   ├── timeline-data.ts
│   └── timeline-segments.ts
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data script
├── src/
│   ├── components/         # React components
│   ├── lib/api.ts          # Frontend API client
│   └── store/              # Zustand state management
├── dist/                   # Production build output
├── server.cjs              # Express production server
├── ecosystem.config.cjs    # PM2 configuration
├── .env.local              # Environment variables (ไม่ commit)
└── .env.example            # ตัวอย่าง environment
```

---

## Support

หากพบปัญหา กรุณาสร้าง Issue ที่:
https://github.com/mctery/machine-monitoring-system/issues
