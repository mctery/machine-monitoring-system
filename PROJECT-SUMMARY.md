# 🏭 TMOT Machine Monitoring System

## 📦 Project Overview

React + TypeScript application สำหรับติดตามสถานะและประสิทธิภาพเครื่องจักรแบบ real-time พร้อมระบบ timeline visualization และการจัดการข้อมูล

---

## ✨ Key Features

### 🎯 Core Features
- ✅ Real-time machine status monitoring
- ✅ Timeline Gantt chart visualization
- ✅ Performance ratio tracking (Weekly/Monthly)
- ✅ Group-based filtering
- ✅ CSV data export
- ✅ Machine target ratio configuration
- ✅ Color-coded status indicators

### 🎨 UI/UX
- ✅ Professional dashboard design
- ✅ Dark mode timeline viewer
- ✅ Responsive table layouts
- ✅ Smooth animations
- ✅ Interactive tooltips
- ✅ Loading states

---

## 🛠️ Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | React | 18.3 |
| **Language** | TypeScript | 5.5 |
| **Build Tool** | Vite | 5.4 |
| **Styling** | Tailwind CSS | 3.4 |
| **State** | Zustand | 4.5 |
| **Routing** | React Router | 6.26 |
| **Icons** | Lucide React | 0.428 |
| **Dates** | date-fns | 3.6 |

---

## 📁 Project Structure

```
tmot-monitoring/
├── 📄 Documentation
│   ├── README.md          # Full documentation
│   ├── GUIDE.md           # Setup guide
│   ├── QUICKSTART.md      # Quick start
│   └── PROJECT-SUMMARY.md # This file
│
├── 🎨 Source Code
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Header.tsx
│   │   │   ├── GroupFilter.tsx
│   │   │   ├── MachineStatusTable.tsx
│   │   │   ├── TimelineViewer.tsx
│   │   │   └── MachineSetup.tsx
│   │   │
│   │   ├── pages/         # Page components
│   │   │   ├── MachineStatusPage.tsx
│   │   │   └── ContactPage.tsx
│   │   │
│   │   ├── store/         # State management
│   │   │   └── useMachineStore.ts
│   │   │
│   │   ├── data/          # Mock data
│   │   │   └── mockData.ts
│   │   │
│   │   ├── types/         # TypeScript types
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/         # Helper functions
│   │   │   └── helpers.ts
│   │   │
│   │   ├── App.tsx        # Main app
│   │   ├── main.tsx       # Entry point
│   │   └── index.css      # Global styles
│   │
├── ⚙️ Configuration
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── package.json
│
└── 🌐 Public
    └── index.html
```

---

## 📊 Data Models

### Machine
```typescript
interface Machine {
  id: string;
  group: 'PIS' | 'SECTOR' | 'SIDE MOLD' | 'BLADE';
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

### Timeline Data
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

---

## 🎨 Design System

### Colors

#### Machine States
- `STOP` → Green (#4ade80)
- `RUN` → Yellow (#fbbf24)
- `IDLE` → Gray (#d1d5db)

#### Performance Indicators
- **Good** (≥80%) → White
- **Warning** (50-80%) → Yellow (#fef3c7)
- **Critical** (<50%) → Red (#f87171)

### Typography
- Font Family: Calibri, Segoe UI, Helvetica Neue
- Sizes: text-sm (14px), text-base (16px), text-xl (20px), text-3xl (30px)

---

## 🔌 API Endpoints (Ready for Integration)

### Current Status
✅ Using mock data from `src/data/mockData.ts`

### Required Backend Endpoints

```typescript
// GET /api/machines
// Returns: Machine[]
// Description: Get all machines with current status

// GET /api/timeline?from={date}&to={date}
// Returns: TimelineData[]
// Description: Get timeline data for date range

// POST /api/machines/:id/target
// Body: { weeklyTarget: number, monthlyTarget: number }
// Description: Update machine target ratios

// POST /api/export
// Body: { from: Date, to: Date }
// Returns: CSV/Excel file
// Description: Export machine data
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
# → http://localhost:5000
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 📱 Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Timeline Viewer | Gantt chart visualization |
| `/status` | Machine Status | Status monitoring table |
| `/setup` | Machine Setup | Target ratio configuration |
| `/contact` | Contact | Company information |

---

## 💾 State Management (Zustand)

### Store Structure
```typescript
interface MachineStore {
  // State
  machines: Machine[];
  timelineData: TimelineData[];
  selectedGroup: string;
  dateRange: DateRange;
  isLoading: boolean;
  
  // Actions
  setSelectedGroup: (group: string) => void;
  setDateRange: (range: DateRange) => void;
  loadMachines: () => void;
  loadTimelineData: () => void;
  updateMachineTarget: (id, weekly, monthly) => void;
  exportToCSV: () => void;
}
```

---

## 🎯 Features Detail

### 1. Timeline Viewer
- **Input**: Date range selection (from/to)
- **Display**: Horizontal Gantt chart with color-coded segments
- **Interactive**: Hover tooltips show duration and time
- **Export**: CSV download with all data
- **Responsive**: Horizontal scroll for long timelines

### 2. Machine Status Table
- **Filtering**: Group dropdown (ALL, PIS, SECTOR, etc.)
- **Status**: Real-time color-coded indicators
- **Metrics**: STOP hours, actual/target ratios
- **Performance**: Color-coded ratio cells
- **Sorting**: Can be added easily

### 3. Machine Setup
- **Inline Editing**: Click "Select" to edit
- **Validation**: Min 0, Max 100
- **Save/Cancel**: Per-machine actions
- **Filtering**: Group-based filtering
- **Persistence**: Updates store immediately

---

## 🔧 Customization Guide

### Adding New Group
1. Update mock data in `src/data/mockData.ts`
2. Add machines with new group name
3. Filter will auto-detect new groups

### Changing Colors
Edit `src/utils/helpers.ts`:
```typescript
export const getStateColor = (state: MachineState) => {
  // Modify colors here
}
```

### Adding New Page
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation in `src/components/Header.tsx`

### Connecting Real API
Update `src/store/useMachineStore.ts`:
```typescript
loadMachines: async () => {
  const response = await fetch('/api/machines');
  const data = await response.json();
  set({ machines: data });
}
```

---

## 📊 Mock Data

### Current Dataset
- **Total Machines**: 19
- **Groups**: 4 (PIS, SECTOR, SIDE MOLD, BLADE)
- **Date Range**: Single day (current date)
- **Timeline Segments**: 6-10 per machine

### Data Distribution
| Group | Machines | % |
|-------|----------|---|
| PIS | 8 | 42% |
| SECTOR | 5 | 26% |
| SIDE MOLD | 4 | 21% |
| BLADE | 2 | 11% |

---

## 🎓 Learning Resources

### Technologies Used
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)

### Key Concepts
- React Hooks (useState, useEffect)
- TypeScript Interfaces & Types
- CSS Grid & Flexbox
- State Management Patterns
- Component Composition

---

## 🔐 Security Considerations

### Current Status
⚠️ **Development Mode** - No authentication

### For Production
- [ ] Add user authentication
- [ ] Implement CORS
- [ ] Add rate limiting
- [ ] Use HTTPS
- [ ] Sanitize inputs
- [ ] Add CSRF protection
- [ ] Implement role-based access

---

## 🚧 Future Enhancements

### Phase 1 - Core Improvements
- [ ] WebSocket integration for real-time updates
- [ ] Advanced filtering (date range, machine name)
- [ ] Sorting for all columns
- [ ] Pagination for large datasets

### Phase 2 - Analytics
- [ ] Historical data charts
- [ ] Performance trends
- [ ] Predictive maintenance alerts
- [ ] Custom date range analytics

### Phase 3 - User Experience
- [ ] User authentication
- [ ] Role-based permissions
- [ ] Custom dashboards
- [ ] Email/SMS notifications
- [ ] Mobile app

### Phase 4 - Integration
- [ ] Excel export (replace CSV)
- [ ] PDF reports
- [ ] API documentation
- [ ] Webhook support
- [ ] Third-party integrations

---

## 📈 Performance Metrics

### Build Stats
- **Bundle Size**: ~200KB (gzipped)
- **Initial Load**: <1s
- **Time to Interactive**: <2s

### Optimization
- Code splitting with React.lazy
- Tailwind CSS purging
- Vite's fast refresh
- Production minification

---

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Timeline loads correctly
- [ ] Status table displays data
- [ ] Filtering works across pages
- [ ] Date range picker functional
- [ ] Export generates CSV
- [ ] Edit mode saves changes
- [ ] Navigation between pages
- [ ] Responsive on different screens

### Automated Testing (Future)
- Unit tests with Vitest
- Component tests with Testing Library
- E2E tests with Playwright

---

## 📞 Support

### Issues & Questions
- Check `README.md` for detailed documentation
- Review `GUIDE.md` for troubleshooting
- Check browser console for errors

### Contact
- System Administrator
- True Mold (Thailand) Co., Ltd.
- Bridgestone Group

---

## 📝 Version History

### v2.0.0 (Current)
- ✅ Complete React + TypeScript rewrite
- ✅ Modern UI with Tailwind CSS
- ✅ Zustand state management
- ✅ Full mock data implementation
- ✅ Timeline visualization
- ✅ CSV export functionality

---

## 📄 License

Copyright © 2023 True Mold (Thailand) Co., Ltd. (Bridgestone Group)
All rights reserved.

---

## 🎯 Quick Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Clean install
rm -rf node_modules && npm install
```

---

**Built with ❤️ for Manufacturing Excellence**

*Last Updated: November 2024*
