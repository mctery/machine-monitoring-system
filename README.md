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
- [กลุ่มเครื่องจักร](#กลุ่มเครื่องจักร)
- [การแก้ไขปัญหา](#การแก้ไขปัญหา)

---

## ฟีเจอร์หลัก

### 1. Timeline Viewer (หน้าแรก `/`)
- แสดง Gantt Chart ของการทำงานเครื่องจักรแบบ Wall-clock time-based
- เลือกช่วงวันที่-เวลาด้วย `datetime-local` input (แม่นยำถึงนาที)
- Time axis แสดง 5 จุดเวลาอ้างอิงจาก From/To ที่เลือก
- บันทึกช่วงวันที่ล่าสุดใน localStorage
- Export ข้อมูลเป็น CSV (UTF-8 BOM)
- แสดงสถานะด้วยสี (RUN/STOP/REWORK)
- Instant tooltip (ไม่ delay) แสดง Log Time, Run Hour, Stop Hour เมื่อ hover
- จัดกลุ่มตาม Group Name พร้อมหัวข้อ "Timeline : All Machine"
- แสดง Actual Ratio 1/2, True Ratio 1/2, Warning Ratio พร้อม % suffix
- Ratio cell ไล่ระดับสีตามค่า (ทั้ง 4 columns)
- Timeline bar แสดงตำแหน่งจริงตามเวลา (absolute positioning) พร้อมแสดงช่องว่างเมื่อไม่มีข้อมูล
- Layout compact (text-xs, h-7 bars) เพื่อแสดงข้อมูลจำนวนมาก

### 2. Machine Monitoring (สถานะเครื่องจักร `/status`)
- แสดงสถานะเครื่องจักรแบบ Real-time (อัพเดททุก 10 วินาที)
- ตารางแบบ 2 คอลัมน์ responsive
- แสดงสี indicator ตามสถานะ (RUN/STOP/REWORK)
- คำนวณ Weekly/Monthly Actual Ratio อัตโนมัติ
- Animation เมื่อค่าเปลี่ยน (blue pulse + slide-in)
- กรองตาม Group
- Dark/Light mode

### 3. Machine Setup (ตั้งค่าเครื่องจักร `/setup`)
- เพิ่ม/แก้ไข/ลบเครื่องจักร (CRUD)
- ตั้งค่า Weekly Target และ Monthly Target
- Inline editing พร้อม validation
- Autocomplete สำหรับ Group Name
- กรองตาม Group
- Natural sort (เรียงลำดับเหมือนหน้า Monitoring)
- ยืนยันก่อนลบ (Confirm Modal)
- ปุ่ม Initialize Data สำหรับ seed ข้อมูลเริ่มต้น (60 เครื่อง)

### 4. Simulation (เฉพาะ Development `/simulation`)
- สร้างข้อมูลจำลองสำหรับทดสอบ
- Manual data entry + Quick Add (RUN/STOP/REWORK)
- Batch Insert mode (กำหนด from/to + interval, preview ก่อน insert)
- Generate 30 วันของข้อมูลทดสอบ
- ซ่อนอัตโนมัติใน Production mode

---

## เทคโนโลยีที่ใช้

| หมวด | เทคโนโลยี | เวอร์ชัน |
|------|----------|---------|
| **Frontend** | React, TypeScript, Vite | 18.3, 5.5, 5.4 |
| **Styling** | Tailwind CSS, Dark Mode (class strategy) | 3.4 |
| **State Management** | Zustand (+ localStorage persist สำหรับ theme/dateRange) | 4.5 |
| **Animation** | Framer Motion | 12.x |
| **Table** | TanStack React Table | 8.21 |
| **Icons** | Lucide React | 0.428 |
| **Date** | date-fns | 3.6 |
| **Database** | MySQL / TiDB Cloud (mysql2/promise) | 8.0 |
| **API** | Vercel Serverless Functions / Express.js | - / 4.22 |
| **Process Manager** | PM2 | - |
| **Hosting** | Vercel (Cloud) / PM2 (On-premise) | - |

---

## โครงสร้างโปรเจ็ค

```
machine-monitoring-system/
│
├── api/                           # Vercel Serverless Functions
│   ├── _db.ts                    # Shared utilities (CORS, date parsing, constants)
│   ├── health.ts                  # Health check endpoint
│   ├── machine-status.ts         # สถานะเครื่องจักร (GET)
│   ├── machine-settings.ts       # CRUD ตั้งค่าเครื่องจักร
│   ├── machine-hours.ts          # ดึง/สร้างข้อมูลชั่วโมงเครื่อง
│   ├── machine-hours-times.ts    # Lightweight timestamps (gap detection)
│   ├── timeline-data.ts          # ข้อมูล Timeline (aggregated)
│   ├── timeline-segments.ts      # Segment data (individual records)
│   ├── init-settings.ts          # Initialize ข้อมูลเครื่องจักรเริ่มต้น
│   └── seed-hours.ts             # Generate ข้อมูลทดสอบ
│
├── src/                           # React Frontend
│   ├── components/                # UI Components
│   │   ├── Header.tsx             # Navigation + Dark mode toggle
│   │   ├── TimelineViewer.tsx     # หน้า Timeline (Gantt Chart)
│   │   ├── MachineStatusTable.tsx # ตารางสถานะ Real-time
│   │   ├── MachineSetup.tsx       # หน้าตั้งค่าเครื่องจักร
│   │   ├── SimulationPage.tsx     # หน้า Simulation (Dev only)
│   │   ├── DataTable.tsx          # Reusable table component (TanStack)
│   │   ├── AnimatedCell.tsx       # Cell animation on value change
│   │   ├── ConfirmModal.tsx       # Confirmation dialog
│   │   ├── ErrorBoundary.tsx      # Error handling boundary
│   │   └── PageTransition.tsx     # Animation wrapper (Framer Motion)
│   │
│   ├── pages/                     # Page components
│   │   └── MachineStatusPage.tsx
│   │
│   ├── store/                     # Zustand State
│   │   ├── useMachineStore.ts     # Machine data store
│   │   └── useThemeStore.ts       # Theme store (Dark/Light, persisted)
│   │
│   ├── lib/                       # API Client
│   │   └── api.ts                 # Frontend API calls (local datetime formatting)
│   │
│   ├── types/                     # TypeScript Types
│   │   └── index.ts
│   │
│   ├── utils/                     # Helper functions
│   │   └── helpers.ts             # Color, format, ratio utilities
│   │
│   ├── App.tsx                    # Main App (React Router, lazy loading)
│   └── main.tsx                   # Entry point
│
├── scripts/                       # Scripts
│   ├── db-setup.cjs               # สร้างตาราง (CREATE TABLE)
│   ├── db-seed.cjs                # Seed ข้อมูลตัวอย่าง
│   ├── start-production.bat       # เริ่ม server (Windows)
│   ├── stop-production.bat        # หยุด server (Windows)
│   ├── install-startup.bat        # ติดตั้ง Windows startup
│   └── startup-service.bat        # Script สำหรับ startup
│
├── database/                      # Database utilities
│   └── seed.sql                   # Raw SQL seed
├── logs/                          # PM2 Logs
├── dist/                          # Production build output
│
├── server.cjs                     # Express Production Server (Port 8000)
├── ecosystem.config.cjs           # PM2 Configuration
├── vercel.json                    # Vercel Configuration
├── vite.config.ts                 # Vite build configuration
├── SETUP.md                       # Setup guide (ภาษาไทย)
├── package.json
└── .env.local                     # Environment Variables (git ignored)
```

---

## การติดตั้ง

> ดูรายละเอียดการติดตั้งแบบเต็มได้ที่ [SETUP.md](SETUP.md)

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
DB_SSL=false           # ใส่ true ถ้าใช้ TiDB Cloud

# Frontend API URL (optional)
VITE_API_URL=/api

# Production Server Port (optional, default: 3000)
PORT=3000
```

### Database Setup

```bash
# สร้างตาราง (CREATE TABLE IF NOT EXISTS)
npm run db:setup

# Seed ข้อมูลตัวอย่าง (60 เครื่อง)
npm run db:seed
```

---

## การพัฒนา (Development)

### รัน Development Server

```bash
# วิธีที่ 1: รันผ่าน Vercel CLI (แนะนำ - รวม API)
npm run dev:vercel

# วิธีที่ 2: รันเฉพาะ Frontend (port 5000, proxy API ไป localhost:3000)
npm run dev
```

### Scripts ที่มี

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `npm run dev` | รัน Vite dev server (Frontend only, port 5000) |
| `npm run dev:vercel` | รัน Vercel dev (Frontend + API) |
| `npm run build` | Build สำหรับ production (TypeScript + Vite) |
| `npm run preview` | Preview production build |
| `npm run start` | รัน Express production server |
| `npm run start:pm2` | รันผ่าน PM2 (Port 8000) |
| `npm run stop:pm2` | หยุด PM2 |
| `npm run restart:pm2` | Restart PM2 |
| `npm run logs:pm2` | ดู PM2 logs |
| `npm run db:setup` | สร้างตาราง database |
| `npm run db:seed` | Seed ข้อมูลตัวอย่าง |

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

**Vercel Config:**
- API Memory: 256MB per function
- Max Duration: 10 seconds per function
- SPA Fallback: enabled

### วิธีที่ 2: PM2 (On-premise Production)

**Production Port: 8000**

#### รันแบบ Manual

```bash
# Build (TypeScript + Vite)
npm run build

# รัน server (ใช้ PORT จาก .env.local หรือ default 3000)
npm start

# หรือใช้ PM2 (Port 8000 ตาม ecosystem.config.cjs)
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

#### PM2 Configuration

| ค่า | รายละเอียด |
|-----|-----------|
| Port | 8000 |
| Mode | fork (1 instance) |
| Max Memory | 500MB (restart เมื่อเกิน) |
| Auto Restart | enabled (max 10 ครั้ง, delay 5s) |
| Logs | `./logs/pm2-error.log`, `./logs/pm2-out.log` |
| Kill Timeout | 5000ms |
| Listen Timeout | 10000ms |

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

ระบบมี Dual API architecture:
- **Vercel Serverless** (`api/*.ts`) — สำหรับ Vercel deployment
- **Express** (`server.cjs`) — สำหรับ on-premise/PM2 production

ทั้งสองใช้ `mysql2/promise` query ตรงไปที่ MySQL

### GET /api/health
ตรวจสอบสถานะ server และ database

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-01-06T12:00:00.000Z"
}
```

### GET /api/machine-status
ดึงข้อมูลสถานะเครื่องจักรทั้งหมด พร้อมคำนวณ Weekly/Monthly Ratio

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "machineName": "3G Laser 1",
      "groupName": "3G",
      "weeklyTarget": 50,
      "monthlyTarget": 50,
      "runHour": 6.5,
      "stopHour": 1.5,
      "runStatus": 1,
      "stopStatus": 0,
      "reworkStatus": null,
      "logTime": "2026-01-06T12:00:00.000Z",
      "weeklyActualRatio": 81.25,
      "monthlyActualRatio": 79.50
    }
  ],
  "groups": ["3G", "BLADE", "PIS", "SECTOR", "SECTOR (TR)", "SIDE MOLD"],
  "count": 60
}
```

**การคำนวณ Ratio:**
- Weekly: คำนวณจากวันจันทร์ถึงปัจจุบัน = `(sum_run_hour / (sum_run_hour + sum_stop_hour)) * 100`
- Monthly: คำนวณจากวันที่ 1 ของเดือนถึงปัจจุบัน

### GET /api/machine-hours
ดึงข้อมูล machine_hours records

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| machine | string | ชื่อเครื่องจักร (filter) |
| from | datetime string | วันที่เริ่มต้น |
| to | datetime string | วันที่สิ้นสุด |
| limit | number | จำนวน records สูงสุด (default: 100, max: 1000) |

### POST /api/machine-hours
สร้าง machine hour record ใหม่

**Body:**
```json
{
  "logTime": "2026-01-06 12:00:00",
  "machineName": "3G Laser 1",
  "runHour": 6.5,
  "stopHour": 1.5,
  "runStatus": 1,
  "stopStatus": 0,
  "reworkStatus": null
}
```

### GET /api/timeline-data
ดึงข้อมูล Timeline แบบ aggregated ตามช่วงเวลา

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| from | datetime string | วันที่-เวลาเริ่มต้น (format: `YYYY-MM-DD HH:mm:ss` หรือ ISO) |
| to | datetime string | วันที่-เวลาสิ้นสุด |

### GET /api/timeline-segments
ดึงข้อมูล segment (individual machine_hours records) สำหรับ Timeline visualization

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| from | datetime string | วันที่-เวลาเริ่มต้น (format: `YYYY-MM-DD HH:mm:ss` หรือ ISO) |
| to | datetime string | วันที่-เวลาสิ้นสุด |

### GET/POST/PUT/DELETE /api/machine-settings
CRUD สำหรับตั้งค่าเครื่องจักร

| Method | คำอธิบาย | Parameters |
|--------|----------|------------|
| GET | ดึงรายการเครื่องจักรทั้งหมด | `group` (optional filter) |
| POST | เพิ่มเครื่องจักรใหม่ | Body: `machineName`, `groupName`, `weeklyTarget?`, `monthlyTarget?` |
| PUT | แก้ไขเครื่องจักร | Vercel: Query `id` / Express: Body `id` |
| DELETE | ลบเครื่องจักร | Vercel: Query `id` / Express: Body `id` |

### POST /api/init-settings
Initialize machine_settings ด้วยข้อมูลเครื่องจักรเริ่มต้น (60 เครื่อง, 6 กลุ่ม)

### POST /api/seed-hours
Generate ข้อมูลทดสอบ 30 วันย้อนหลัง (ลบข้อมูลเดิมก่อน, สำหรับ development)

### GET /api/machine-hours-times
ดึง timestamps แบบ lightweight สำหรับตรวจสอบช่องว่างของข้อมูล (gap detection)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| from | datetime string | วันที่-เวลาเริ่มต้น |
| to | datetime string | วันที่-เวลาสิ้นสุด |

---

## Database Schema

### ตาราง machine_hours
เก็บข้อมูลชั่วโมงการทำงานของเครื่องจักร (บันทึกจาก PLC ทุกๆ interval)

```sql
CREATE TABLE machine_hours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  log_time DATETIME NOT NULL,
  machine_name VARCHAR(50) NOT NULL,
  run_hour FLOAT NOT NULL,
  stop_hour FLOAT NOT NULL,
  run_status TINYINT NOT NULL,      -- 1 = Running, 0 = Stopped
  stop_status TINYINT NOT NULL,
  rework_status INT NULL,           -- 1 = Rework active, NULL = no rework
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
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_machine_name (machine_name),
  INDEX idx_group_name (group_name)
);
```

### Data Flow

```
MySQL DB (machine_hours + machine_settings)
    │
    │  mysql2/promise (direct queries)
    ▼
API Layer (server.cjs หรือ api/*.ts)
    │
    │  HTTP JSON responses
    ▼
src/lib/api.ts (fetch wrapper, local datetime formatting)
    │
    ▼
useMachineStore.ts (Zustand)
    │  mapStatusToMachine() / mapToTimelineData() / buildTimelineSegments()
    ▼
React Components (TanStack Table, Framer Motion, Tailwind CSS)
```

---

## ระบบสี

### สถานะเครื่องจักร
| สถานะ | สี (ตาราง) | สี (Timeline Bar) | คำอธิบาย |
|-------|------------|-------------------|----------|
| **RUN** | เหลือง `bg-yellow-300` | เหลือง `bg-yellow-500` | เครื่องกำลังทำงาน |
| **STOP** | เขียว `bg-green-400` | เขียว `bg-green-500` | เครื่องหยุด |
| **REWORK** | แดง `bg-red-500` | แดง `bg-red-500` | กำลัง Rework |
| **IDLE** | เทา/ฟ้า `bg-gray-300` | ฟ้า `bg-cyan-400` | ไม่มีข้อมูล |

### Performance Indicators (Ratio Cell Colors)
| ระดับ | ช่วง | สี (Light/Dark) | คำอธิบาย |
|-------|------|-----------------|----------|
| Excellent | 91-100% | ขาว `bg-white` / `bg-slate-300` | ผลงานดีเยี่ยม |
| Good | 76-90% | แดงอ่อน `bg-red-200` / `bg-red-400` | ผลงานดี |
| Average | 51-75% | แดงปานกลาง `bg-red-300` / `bg-red-500` | ปานกลาง |
| Warning | 26-50% | แดงเข้ม `bg-red-400` / `bg-red-600` | ต่ำกว่าเป้า |
| Critical | 0-25% | แดงเข้มมาก `bg-red-600` / `bg-red-700` | วิกฤต |

### Status Indicator (Machine Status Page)
| เงื่อนไข | สี | คำอธิบาย |
|----------|-----|----------|
| actual/target >= 80% | เขียว `bg-green-500` | ได้เป้า |
| actual/target >= 50% | เหลือง `bg-yellow-500` | ใกล้เป้า |
| actual/target < 50% | แดง `bg-red-500` | ต่ำกว่าเป้ามาก |

---

## กลุ่มเครื่องจักร

| กลุ่ม | จำนวน | เครื่องจักร |
|-------|-------|------------|
| PIS | 26 | Model 1-6, PIS Casting, Side piece 1-14, NC Lathe 1-5 |
| 3G | 3 | 3G Laser 1-3 |
| SECTOR | 8 | Turning 1-3, 8, Machining 3-4, 9-10 |
| SECTOR (TR) | 5 | Machining 1, 7-8, Turning 4, 9 |
| SIDE MOLD | 16 | Machining 2, 5-6, Turning 5, 7, Letter 1-11 |
| BLADE | 2 | Laser 1-2 |
| **รวม** | **60** | |

**Default Targets:** Weekly = 50%, Monthly = 50%

---

## การแก้ไขปัญหา

### ปัญหา: Database Connection Error
```
Error: ER_UNKNOWN_ERROR
```
**วิธีแก้:** ตรวจสอบว่าได้ตั้งค่า `DB_SSL=true` ใน `.env.local` (สำหรับ TiDB Cloud)

### ปัญหา: Self-signed Certificate Error
**วิธีแก้:** ระบบรองรับ self-signed certificates ผ่าน `ssl: { rejectUnauthorized: false }` โดยอัตโนมัติเมื่อ `DB_SSL=true`

### ปัญหา: NaN แสดงในตาราง
**วิธีแก้:** ตรวจสอบว่า database มีข้อมูลในช่วงวันที่ที่เลือก

### ปัญหา: Timeline ข้อมูลไม่ตรงกับ Database
**วิธีแก้:**
- ตรวจสอบว่า Timezone ของ server และ database ตรงกัน
- ระบบส่ง local datetime strings (`YYYY-MM-DD HH:mm:ss`) โดยไม่แปลงเป็น UTC
- ตรวจสอบช่วงเวลาที่เลือกใน datetime-local input ว่าครอบคลุมข้อมูลที่ต้องการ

### ปัญหา: PM2 ไม่เริ่มทำงาน
```bash
# ลอง restart
pm2 kill
pm2 start ecosystem.config.cjs
```

### ปัญหา: Port 8000 ถูกใช้อยู่
```bash
# หา process ที่ใช้ port 8000
netstat -ano | findstr :8000

# หยุด PM2 ทั้งหมด
pm2 kill
```

---

## Changelog

### v2.3.0 (2026-03-04)

#### Timeline Viewer - ออกแบบใหม่ทั้งหมด
- **Wall-clock time-based positioning**: เปลี่ยนจาก flex-width เป็น absolute positioning ตามเวลาจริง
- **Time axis**: แสดง 5 จุดเวลาอ้างอิงจาก From/To (รองรับ single-day `HH:mm` และ multi-day `MM/dd HH:mm`)
- **Instant tooltip**: เปลี่ยนจาก native browser tooltip เป็น custom DOM tooltip ที่แสดงทันที (ไม่มี delay)
- **Timeline gaps**: แสดงช่องว่างเมื่อไม่มีข้อมูล (คำนวณ segment width จาก median interval ระหว่าง records)
- **Compact layout**: ปรับเป็น text-xs, h-7 bars, px-2 py-1.5 เพื่อแสดงข้อมูลจำนวนมาก
- **Section title**: เพิ่มหัวข้อ "Timeline : All Machine"
- **% suffix**: แสดง % ท้ายค่า Ratio ทุก column
- **2 decimal places**: Run/Stop แสดงทศนิยม 2 ตำแหน่ง
- **Ratio gradient colors**: เพิ่มระบบไล่ระดับสีให้ ACTUAL RATIO 2 และ TRUE RATIO 2
- **ลบ Quick presets**: ลบปุ่ม Today, Yesterday, This Week ฯลฯ

#### Code Optimization & Refactoring
- **Shared API utilities** (`api/_db.ts`): รวม `setCORS()`, `parseDateParam()`, `errorMessage()` และ constants
- **Constants extraction**: แยก `DEFAULT_WEEKLY_TARGET`, `DEFAULT_MONTHLY_TARGET`, `DEFAULT_QUERY_LIMIT`, `MAX_QUERY_LIMIT` จาก hardcoded values
- **Duplicate ratio removal**: ลบ SQL duplicate ใน timeline-data (actualRatio1 เหมือน trueRatio1)
- **Refactored all API files**: 8 ไฟล์ใช้ shared utilities แทน inline CORS/date parsing/error handling
- **server.cjs sync**: เพิ่ม group filter ใน GET /machine-settings, ใช้ constants แทน hardcoded values
- **Dead code cleanup**: ลบ unused PageTransition variants (fadeIn, scaleIn, slideInLeft, slideInRight)
- **Removed files**: ลบ Prisma (schema, config, seed), mockData.ts, GroupFilter.tsx, test.ts

#### Bug Fixes
- **Timeline segment width**: แก้ segment ขยายเต็ม bar เมื่อ run_hour มีค่าสูง (ใช้ median interval แทน)
- **TIMELINE header overflow**: แก้ "00:00" ทับข้อความ "TIMELINE" และ "23:59" ถูกตัดขอบขวา
- **MachineSetup sort**: เพิ่ม natural sort ให้หน้า Setup เรียงลำดับเหมือนหน้า Monitoring

### v2.2.0 (2026-02-28)

#### Timeline Data Accuracy
- เปลี่ยน date picker เป็น `datetime-local` (แม่นยำถึงนาที)
- แก้ Timezone: ส่ง local datetime strings แทน UTC เพื่อให้ตรงกับ database
- แสดง run_hour/stop_hour จริงจาก database ใน timeline segments
- ใช้ run_hour + stop_hour เป็น weight สำหรับสัดส่วนแถบ timeline
- Tooltip แสดง Log Time, Run Hour, Stop Hour ที่ตรงกับ database
- API รองรับ local datetime format (`YYYY-MM-DD HH:mm:ss`)
- เพิ่ม SETUP.md สำหรับ guide การติดตั้ง

### v2.1.0

#### Documentation
- ปรับปรุง README ให้ตรงกับระบบจริง
- แก้ไขข้อมูลกลุ่มเครื่องจักรและจำนวนเครื่อง
- เพิ่ม metadata ใน package.json

### v2.0.0

#### Architecture Migration
- เปลี่ยนจาก Prisma runtime เป็น mysql2 direct queries
- เพิ่ม Express production server (server.cjs)
- เพิ่ม PM2 configuration
- เพิ่ม Windows startup scripts
- Dual API architecture (Vercel Serverless + Express)

### v1.0.0

#### Initial Release
- Machine Monitoring dashboard (Real-time status)
- Timeline Viewer (Gantt chart)
- Machine Setup (CRUD)
- Simulation page (Dev only)
- TanStack React Table + Framer Motion animations
- Dark/Light mode
- Zustand state management

---

## License

Copyright 2024-2026 True Mold (Thailand) Co., Ltd. (Bridgestone Group)

## ผู้พัฒนา

พัฒนาสำหรับ TMOT Manufacturing Operations
