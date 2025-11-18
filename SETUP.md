# TMOT Machine Monitoring - Quick Setup Guide

## 🚀 Quick Start

```bash
cd tmot-monitoring
npm install
npm run dev
```

Open browser at `http://localhost:5000`

## 📋 What's Included

### ✅ Complete Features
1. **Machine Status Dashboard** - Real-time monitoring with color-coded states
2. **Timeline Viewer** - Gantt-style visualization 
3. **Machine Setup** - Configure target ratios
4. **Group Filtering** - Filter by PIS, SECTOR, SIDE MOLD, BLADE
5. **Data Export** - Export to CSV
6. **Responsive Design** - Desktop & tablet support

### 🎨 Design System
- **Colors**: Matches original design (Red/Yellow/Green status indicators)
- **Layout**: Faithful recreation of TMOT interface
- **Typography**: Calibri font family
- **Components**: Reusable React components with TypeScript

### 📁 Project Structure
```
src/
├── components/        # UI components
│   ├── MachineStatusTable.tsx
│   ├── TimelineViewer.tsx
│   ├── MachineSetup.tsx
│   ├── Navigation.tsx
│   └── GroupFilter.tsx
├── store/            # State management (Zustand)
├── types/            # TypeScript definitions
├── services/         # Mock data & API
└── App.tsx           # Main app
```

## 🔧 Development

### Mock Data
The app uses mock data by default. Real data is in:
- `src/services/mockData.ts`

### Adding Real API
Replace mock calls in `src/store/machineStore.ts`:

```typescript
// Replace this:
const { mockMachines, delay } = await import('../services/mockData');
await delay(500);
set({ machines: mockMachines, isLoading: false });

// With this:
const response = await fetch('/api/machines');
const data = await response.json();
set({ machines: data, isLoading: false });
```

### API Endpoints Needed
- `GET /api/machines` - Get all machines
- `GET /api/timeline?from=&to=` - Get timeline data
- `POST /api/export` - Export data

## 🎯 Key Features Implemented

### 1. Machine Status Table
- ✅ Real-time status (STOP/RUN)
- ✅ Color-coded ratios
- ✅ Group filtering
- ✅ STOP hours tracking
- ✅ Weekly/Monthly metrics

### 2. Timeline Viewer
- ✅ Date range selection
- ✅ Gantt chart visualization
- ✅ Color-coded status bars
- ✅ Export functionality
- ✅ Scrollable timeline

### 3. Machine Setup
- ✅ Edit target ratios
- ✅ Save/Cancel functionality
- ✅ Group filtering
- ✅ Inline editing

## 🎨 Color Scheme

### Machine States
- 🟢 STOP = Green (#4ade80)
- 🟡 RUN = Yellow (#fbbf24)
- ⚪ IDLE = Gray

### Performance Indicators
- 🔴 < 50% = Red (#f87171)
- 🟡 50-80% = Yellow (#fef3c7)
- ⚪ > 80% = White

## 📦 Technologies

- **React 18** + **TypeScript** - Modern React with type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **date-fns** - Date utilities

## 🚢 Deployment

```bash
npm run build
# Upload dist/ folder to your web server
```

## 📝 Notes

- Mock data includes 12 machines across 4 groups
- All components are TypeScript for better IDE support
- State management is centralized in Zustand store
- Responsive design works on screens > 1024px
- Easy to extend with new features

## 🔄 Next Steps

1. **Backend Integration**: Connect to real API endpoints
2. **WebSocket**: Add real-time updates
3. **Authentication**: Add user login
4. **More Export Formats**: Add Excel, PDF export
5. **Charts**: Add performance charts
6. **Notifications**: Add alerts for machine issues

## 💡 Tips

- Use Chrome DevTools for debugging
- Check console for any errors
- Mock data auto-loads on page load
- State persists during navigation
- Edit mode is per-machine in setup

---

**Built with ❤️ for TMOT Machine Monitoring System**
