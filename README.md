# TMOT Machine Monitoring System

ระบบติดตามสถานะเครื่องจักรแบบ Real-time สำหรับ True Mold (Thailand) Co., Ltd. (Bridgestone Group)

**Live Demo:** https://machine-monitoring-system.vercel.app

![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black)

---

## สารบัญ

- [ฟีเจอร์หลัก](#ฟีเจอร์หลัก)
- [เทคโนโลยีที่ใช้](#เทคโนโลยีที่ใช้)
- [โครงสร้างโปรเจ็ค](#โครงสร้างโปรเจ็ค)
- [การติดตั้ง](#การติดตั้ง)
- [การพัฒนา (Development)](#การพัฒนา-development)
- [การ Deploy Production](#การ-deploy-production)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [ระบบสี](#ระบบสี)

---

## ฟีเจอร์หลัก

### 1. Timeline Viewer (หน้าแรก)
- แสดง Gantt Chart ของการทำงานเครื่องจักร
- เลือกช่วงวันที่แบบกำหนดเอง
- ปุ่ม Quick Select: Today, Yesterday, This Week, Last 7 Days, This Month, Last 30 Days
- บันทึกช่วงวันที่ล่าสุดใน localStorage
- Export ข้อมูลเป็น CSV
- แสดงสถานะด้วยสี (RUN/STOP/REWORK)
- Tooltip แสดงรายละเอียดเมื่อ hover
- จัดกลุ่มตาม Group Name

### 2. Machine Monitoring (สถานะเครื่องจักร)
- แสดงสถานะเครื่องจักรแบบ Real-time (อัพเดททุก 10 วินาที)
- ตารางแบบ 2 คอลัมน์ responsive
- แสดงสี indicator ตามสถานะ (STOP/RUN/REWORK)
- คำนวณ Weekly/Monthly Actual Ratio อัตโนมัติ
- กรองตาม Group
- Dark/Light mode

### 3. Machine Setup (ตั้งค่าเครื่องจักร)
- เพิ่ม/แก้ไข/ลบเครื่องจักร
- ตั้งค่า Weekly Target และ Monthly Target
- Inline editing พร้อม validation
- กรองตาม Group
- ยืนยันก่อนลบ

### 4. Simulation (เฉพาะ Development)
- สร้างข้อมูลจำลองสำหรับทดสอบ
- ซ่อนอัตโนมัติใน Production mode

---

## เทคโนโลยีที่ใช้

| หมวด | เทคโนโลยี |
|------|----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Dark Mode |
| **State Management** | Zustand |
| **Animation** | Framer Motion |
| **Table** | TanStack React Table |
| **Icons** | Lucide React |
| **Date** | date-fns |
| **Database** | MySQL / TiDB Cloud |
| **ORM** | Prisma |
| **API** | Vercel Serverless Functions / Express.js |
| **Hosting** | Vercel / PM2 (Local) |

---

## โครงสร้างโปรเจ็ค

```
machine-monitoring-system/
│
├── api/                        # Vercel Serverless Functions
│   ├── health.ts               # Health check endpoint
│   ├── machine-status.ts       # สถานะเครื่องจักร
│   ├── machine-settings.ts     # CRUD ตั้งค่าเครื่องจักร
│   ├── timeline-data.ts        # ข้อมูล Timeline
│   └── timeline-segments.ts    # Segment data
│
├── src/                        # React Frontend
│   ├── components/             # UI Components
│   │   ├── Header.tsx          # Navigation + Dark mode
│   │   ├── TimelineViewer.tsx  # หน้า Timeline
│   │   ├── MachineStatusTable.tsx  # ตารางสถานะ
│   │   ├── MachineSetup.tsx    # หน้าตั้งค่า
│   │   ├── SimulationPage.tsx  # หน้า Simulation (Dev only)
│   │   ├── DataTable.tsx       # Reusable table
│   │   ├── ErrorBoundary.tsx   # Error handling
│   │   └── PageTransition.tsx  # Animation wrapper
│   │
│   ├── pages/                  # Page components
│   │   └── MachineStatusPage.tsx
│   │
│   ├── store/                  # Zustand State
│   │   ├── useMachineStore.ts  # Machine data store
│   │   └── useThemeStore.ts    # Theme store
│   │
│   ├── lib/                    # Utilities
│   │   └── api.ts              # API client
│   │
│   ├── types/                  # TypeScript Types
│   │   └── index.ts
│   │
│   ├── utils/                  # Helper functions
│   │   └── helpers.ts
│   │
│   ├── App.tsx                 # Main App
│   └── main.tsx                # Entry point
│
├── scripts/                    # Production Scripts (Windows)
│   ├── start-production.bat    # เริ่ม server
│   ├── stop-production.bat     # หยุด server
│   ├── install-startup.bat     # ติดตั้ง Windows startup
│   └── startup-service.bat     # Script สำหรับ startup
│
├── prisma/                     # Database
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data
│
├── logs/                       # PM2 Logs
│
├── server.cjs                  # Express Production Server
├── ecosystem.config.cjs        # PM2 Configuration
├── vercel.json                 # Vercel Configuration
├── package.json
└── .env.local                  # Environment Variables (git ignored)
```

---

## การติดตั้ง

### ความต้องการระบบ
- Node.js 18+
- npm หรือ yarn
- MySQL Database (หรือ TiDB Cloud)

### ขั้นตอนการติดตั้ง

```bash
# 1. Clone repository
git clone https://github.com/mctery/machine-monitoring-system.git
cd machine-monitoring-system

# 2. ติดตั้ง dependencies
npm install

# 3. สร้างไฟล์ environment
cp .env.example .env.local

# 4. แก้ไขค่า database ใน .env.local
```

### Environment Variables

สร้างไฟล์ `.env.local` ด้วยค่าต่อไปนี้:

```env
# Database Configuration
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database
DB_SSL=true   # ใส่ true ถ้าใช้ TiDB Cloud

# Optional
DATABASE_URL="mysql://user:password@host:port/database"
```

### Database Setup

```bash
# Push schema ไป database
npm run db:push

# Seed ข้อมูลตัวอย่าง (60 เครื่อง)
npm run db:seed

# เปิด Prisma Studio (GUI)
npm run db:studio
```

---

## การพัฒนา (Development)

### รัน Development Server

```bash
# วิธีที่ 1: รันผ่าน Vercel CLI (แนะนำ - รวม API)
npm run dev:vercel

# วิธีที่ 2: รันเฉพาะ Frontend
npm run dev
```

เปิด browser ที่: **http://localhost:3000**

### Scripts ที่มี

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `npm run dev` | รัน Vite dev server (Frontend only) |
| `npm run dev:vercel` | รัน Vercel dev (Frontend + API) |
| `npm run build` | Build สำหรับ production (รวม Prisma generate) |
| `npm run preview` | Preview production build |
| `npm run start` | รัน Express production server |
| `npm run start:pm2` | รันผ่าน PM2 |
| `npm run stop:pm2` | หยุด PM2 |
| `npm run logs:pm2` | ดู PM2 logs |
| `npm run db:push` | Push Prisma schema |
| `npm run db:seed` | Seed ข้อมูลตัวอย่าง |
| `npm run db:studio` | เปิด Prisma Studio |

---

## การ Deploy Production

### วิธีที่ 1: Vercel (Cloud)

```bash
# ติดตั้ง Vercel CLI
npm install -g vercel

# Deploy
vercel

# ตั้งค่า Environment Variables บน Vercel Dashboard
# Settings > Environment Variables
```

### วิธีที่ 2: PM2 (Local Production)

#### รันแบบ Manual

```bash
# Build (Prisma generate + TypeScript + Vite)
npm run build

# รัน server
npm start

# หรือใช้ PM2
npm run start:pm2
```

#### รันผ่าน Windows Script

```bash
# เริ่ม server
scripts\start-production.bat

# หยุด server
scripts\stop-production.bat
```

#### ติดตั้ง Windows Startup (Auto-start เมื่อเปิดเครื่อง)

```bash
# คลิกขวา > Run as Administrator
scripts\install-startup.bat
```

Script จะทำการ:
1. ติดตั้ง PM2 (ถ้ายังไม่มี)
2. ติดตั้ง pm2-windows-startup
3. Build project
4. Start server
5. บันทึก process list สำหรับ auto-start

#### คำสั่ง PM2 ที่ใช้บ่อย

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `pm2 status` | ดูสถานะ server |
| `pm2 logs` | ดู logs แบบ real-time |
| `pm2 restart all` | Restart server |
| `pm2 stop all` | หยุด server |
| `pm2 monit` | เปิด monitoring dashboard |

---

## API Endpoints

### GET /api/health
ตรวจสอบสถานะ server และ database

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-01-06T12:00:00.000Z"
}
```

### GET /api/machine-status
ดึงข้อมูลสถานะเครื่องจักรทั้งหมด

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "machineName": "3G Laser 1",
      "groupName": "3G",
      "weeklyTarget": 80,
      "monthlyTarget": 80,
      "runHour": 6.5,
      "stopHour": 1.5,
      "runStatus": 1,
      "stopStatus": 0,
      "reworkStatus": 0,
      "weeklyActualRatio": 81.25,
      "monthlyActualRatio": 79.50
    }
  ],
  "groups": ["3G", "BLADE", "PIS"],
  "count": 60
}
```

### GET /api/timeline-data
ดึงข้อมูล Timeline ตามช่วงเวลา

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| from | ISO date | วันที่เริ่มต้น |
| to | ISO date | วันที่สิ้นสุด |

### GET /api/timeline-segments
ดึงข้อมูล segment สำหรับ Timeline

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| from | ISO date | วันที่เริ่มต้น |
| to | ISO date | วันที่สิ้นสุด |

### GET/POST/PUT/DELETE /api/machine-settings
CRUD สำหรับตั้งค่าเครื่องจักร

---

## Database Schema

### ตาราง machine_hours
เก็บข้อมูลชั่วโมงการทำงานของเครื่องจักร (บันทึกทุก 10 นาที)

```sql
CREATE TABLE machine_hours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  log_time DATETIME NOT NULL,
  machine_name VARCHAR(50) NOT NULL,
  run_hour DECIMAL(10,2) NOT NULL,
  stop_hour DECIMAL(10,2) NOT NULL,
  run_status TINYINT NOT NULL,      -- 1 = Running, 0 = Stopped
  stop_status TINYINT NOT NULL,
  rework_status INT NULL,           -- 1 = Rework
  INDEX idx_machine_time (machine_name, log_time)
);
```

### ตาราง machine_settings
เก็บการตั้งค่าเครื่องจักร

```sql
CREATE TABLE machine_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  machine_name VARCHAR(50) UNIQUE NOT NULL,
  group_name VARCHAR(50) NOT NULL,
  weekly_target DECIMAL(5,2) DEFAULT 80.00,
  monthly_target DECIMAL(5,2) DEFAULT 80.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## ระบบสี

### สถานะเครื่องจักร
| สถานะ | สี | คำอธิบาย |
|-------|-----|----------|
| RUN | เขียว | เครื่องกำลังทำงาน |
| STOP | เหลือง | เครื่องหยุด |
| REWORK | ส้ม | กำลัง Rework |

### Performance Indicators
| ระดับ | สี | เงื่อนไข |
|-------|-----|----------|
| Good | ขาว/เขียว | >= 80% ของ target |
| Warning | เหลือง | 50-80% ของ target |
| Critical | แดง | < 50% ของ target |

---

## กลุ่มเครื่องจักร

| กลุ่ม | เครื่องจักร |
|-------|------------|
| 3G | 3G Laser 1-4, Model No.7 |
| BLADE | Laser 1-2 |
| PIS | Laser High Contrast, Model 1-5 |
| SECTOR | SECTOR 1-20 |
| SECTOR (TR) | SECTOR 21-40 |
| SIDE MOLD | Letter 1-4 |

---

## การแก้ไขปัญหา

### ปัญหา: Database Connection Error
```
Error: ER_UNKNOWN_ERROR
```
**วิธีแก้:** ตรวจสอบว่าได้ตั้งค่า `DB_SSL=true` ใน `.env.local` (สำหรับ TiDB Cloud)

### ปัญหา: NaN แสดงในตาราง
**วิธีแก้:** ตรวจสอบว่า database มีข้อมูลในช่วงวันที่ที่เลือก

### ปัญหา: PM2 ไม่เริ่มทำงาน
```bash
# ลอง restart
pm2 kill
pm2 start ecosystem.config.cjs
```

---

## License

Copyright 2024-2025 True Mold (Thailand) Co., Ltd. (Bridgestone Group)

## ผู้พัฒนา

พัฒนาสำหรับ TMOT Manufacturing Operations
