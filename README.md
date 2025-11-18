# 🏭 TMOT Machine Monitoring System

Real-time machine monitoring dashboard สำหรับติดตามสถานะและประสิทธิภาพการทำงานของเครื่องจักร

![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)

## ✨ Features

### 📊 Machine Status Dashboard
- แสดงสถานะเครื่องจักรแบบ real-time (STOP/RUN/IDLE)
- ระบบ color-coding สำหรับสถานะและประสิทธิภาพ
- ติดตาม STOP hours และ performance ratios
- Filter ตาม group (PIS, SECTOR, SIDE MOLD, BLADE)

### 📈 Timeline Viewer
- Gantt chart แสดง timeline การทำงาน
- เลือกช่วงเวลาที่ต้องการดูได้
- Export ข้อมูลเป็น CSV
- แสดงสถานะด้วยสีที่แตกต่างกัน

### ⚙️ Machine Setup
- ตั้งค่า Weekly และ Monthly Target Ratio
- แก้ไขค่าได้ทีละเครื่อง
- Save/Cancel changes
- Filter ตาม group

### 🎨 UI/UX
- Responsive design
- Dark mode สำหรับ Timeline Viewer
- Smooth animations และ transitions
- Professional และใช้งานง่าย

## 🚀 Quick Start

```bash
# Clone project
cd tmot-monitoring

# Install dependencies
npm install

# Run development server
npm run dev
```

เปิดเบราว์เซอร์ที่: **http://localhost:5000**

## 📁 Project Structure

```
tmot-monitoring/
├── src/
│   ├── components/          # React Components
│   │   ├── Header.tsx              # Navigation bar
│   │   ├── GroupFilter.tsx         # Group filter dropdown
│   │   ├── MachineStatusTable.tsx  # Status table
│   │   ├── TimelineViewer.tsx      # Timeline visualization
│   │   └── MachineSetup.tsx        # Setup configuration
│   ├── pages/              # Page components
│   │   ├── MachineStatusPage.tsx
│   │   └── ContactPage.tsx
│   ├── store/              # Zustand state management
│   │   └── useMachineStore.ts
│   ├── data/               # Mock data
│   │   └── mockData.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── utils/              # Helper functions
│   │   └── helpers.ts
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🛠️ Tech Stack

- **React 18.3** - UI library
- **TypeScript 5.5** - Type safety
- **Vite 5.4** - Build tool (รวดเร็วมาก!)
- **Tailwind CSS 3.4** - Utility-first CSS
- **Zustand 4.5** - State management (เบากว่า Redux)
- **React Router 6.26** - Routing
- **Lucide React** - Modern icons
- **date-fns 3.6** - Date utilities

## 🎨 Color System

### Machine States
| สถานะ | สี | Hex Code |
|------|---|----------|
| STOP | 🟢 Green | #4ade80 |
| RUN | 🟡 Yellow | #fbbf24 |
| IDLE | ⚪ Gray | #d1d5db |

### Performance Indicators
| Performance | สี | เงื่อนไข |
|------------|---|---------|
| Good | ⚪ White | ≥ 80% of target |
| Warning | 🟡 Yellow | 50-80% of target |
| Critical | 🔴 Red | < 50% of target |

## 📊 Data Structure

### Machine Type
```typescript
interface Machine {
  id: string;
  group: string;              // PIS, SECTOR, SIDE MOLD, BLADE
  machineName: string;
  state: 'STOP' | 'RUN' | 'IDLE';
  rework: string;
  stopHours: number;
  weeklyActualRatio: number;
  weeklyTargetRatio: number;
  monthlyActualRatio: number;
  monthlyTargetRatio: number;
}
```

### Timeline Type
```typescript
interface TimelineData {
  machineName: string;
  run: number;
  warning: number;
  stop: number;
  actualRatio1: number;
  actualRatio2: number;
  trueRatio1: number;
  trueRatio2: number;
  warningRatio: number;
  timeline: TimelineSegment[];
}
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server (port 5000)

# Production
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🌐 Pages

### 1. Timeline Viewer (`/`)
- แสดง Gantt chart ของการทำงานเครื่องจักร
- เลือกช่วงเวลาได้
- Export เป็น CSV
- สีแสดงสถานะ: เขียว (RUN), เหลือง (STOP), ฟ้า (IDLE)

### 2. Machine Status (`/status`)
- ตารางแสดงสถานะทุกเครื่อง
- Filter ตาม group
- สีแสดง performance
- แสดง STOP hours

### 3. Setup (`/setup`)
- ตั้งค่า target ratios
- แก้ไขได้ทีละเครื่อง
- Save changes

### 4. Contact (`/contact`)
- ข้อมูลบริษัท
- ข้อมูล system

## 🔌 API Integration (Future)

ปัจจุบันใช้ mock data แต่พร้อมสำหรับ integrate กับ backend:

### Required Endpoints
```typescript
// GET /api/machines
// Response: Machine[]

// GET /api/timeline?from={date}&to={date}
// Response: TimelineData[]

// POST /api/machines/:id/target
// Body: { weeklyTarget: number, monthlyTarget: number }
```

### การ integrate
แก้ไขใน `src/store/useMachineStore.ts`:

```typescript
// แทนที่ mock data
loadMachines: async () => {
  const response = await fetch('/api/machines');
  const data = await response.json();
  set({ machines: data });
}
```

## 🎯 Key Features Detail

### 1. Real-time Status Monitoring
- ✅ Color-coded status indicators
- ✅ Automatic refresh capability
- ✅ Performance ratio calculations
- ✅ STOP hours tracking

### 2. Timeline Visualization
- ✅ Interactive Gantt chart
- ✅ Hover tooltips with details
- ✅ Responsive timeline bars
- ✅ Date range selection

### 3. Configuration Management
- ✅ Inline editing
- ✅ Validation
- ✅ Save/Cancel functionality
- ✅ Group filtering

## 💡 Development Tips

### Mock Data
Mock data อยู่ใน `src/data/mockData.ts` มีข้อมูลเครื่อง 19 เครื่อง ใน 4 groups

### State Management
ใช้ Zustand เพราะ:
- เบากว่า Redux
- API ง่ายกว่า
- ไม่ต้อง boilerplate
- TypeScript support ดี

### Styling
ใช้ Tailwind CSS เพราะ:
- เขียนเร็ว
- ไม่ต้องสลับไฟล์
- Purge CSS อัตโนมัติ
- Responsive ง่าย

## 📦 Build & Deploy

```bash
# Build
npm run build

# Output อยู่ใน dist/
# Upload ไปที่ web server ของคุณ
```

### Deploy Options
- Vercel (แนะนำ)
- Netlify
- AWS S3 + CloudFront
- Azure Static Web Apps
- Docker container

## 🔐 Security Notes

- ไม่มี authentication ในตัว (ควร implement ถ้าเป็น production)
- ควรใช้ HTTPS
- ควร implement rate limiting สำหรับ API

## 🚧 Future Enhancements

- [ ] WebSocket สำหรับ real-time updates
- [ ] User authentication
- [ ] Role-based access control
- [ ] Advanced analytics และ charts
- [ ] Email/SMS notifications
- [ ] Mobile responsive improvements
- [ ] Excel export (แทน CSV)
- [ ] Historical data analysis
- [ ] Predictive maintenance alerts
- [ ] Multi-language support (TH/EN)

## 📝 Notes

- Mock data มีการ simulate timeline แบบ random
- สี performance คำนวณจาก actual/target ratio
- Timeline segments สร้างแบบอัตโนมัติ
- การ export เป็น CSV รองรับ Thai characters

## 🤝 Contributing

1. Fork the project
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

Copyright © 2023 True Mold (Thailand) Co., Ltd. (Bridgestone Group)

## 👥 Authors

Built with ❤️ for TMOT Manufacturing Operations

---

**สำหรับคำถามหรือปัญหา โปรดติดต่อ system administrator**
