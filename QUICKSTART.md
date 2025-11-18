# ⚡ Quick Start - 3 Steps

## 1️⃣ Install Dependencies
```bash
cd tmot-monitoring
npm install
```

## 2️⃣ Run Development Server
```bash
npm run dev
```

## 3️⃣ Open Browser
```
http://localhost:5000
```

---

## 🎯 What You'll See

### Timeline Viewer (Home)
- Gantt-style timeline of machine activity
- Date range selector
- Export to CSV button
- Color-coded status bars

### Machine Status
- Real-time machine monitoring table
- Group filtering (PIS, SECTOR, SIDE MOLD, BLADE)
- Performance ratios with color indicators
- STOP hours tracking

### Setup
- Configure weekly/monthly target ratios
- Edit individual machines
- Save/Cancel changes

---

## 📊 Sample Data

**19 machines** across **4 groups**:
- PIS: 8 machines
- SECTOR: 5 machines  
- SIDE MOLD: 4 machines
- BLADE: 2 machines

---

## 🎨 Color Guide

### Machine States
🟢 **Green** = STOP
🟡 **Yellow** = RUN
⚪ **Gray** = IDLE

### Performance
⚪ **White** = Good (≥80%)
🟡 **Yellow** = Warning (50-80%)
🔴 **Red** = Critical (<50%)

---

## 🚀 Next Steps

1. ✅ Explore all pages
2. ✅ Try group filtering
3. ✅ Export data to CSV
4. ✅ Edit machine targets
5. ✅ Check timeline visualization

---

## 📚 Documentation

- `README.md` - Full documentation
- `GUIDE.md` - Detailed setup guide
- `SETUP.md` - Installation walkthrough

---

## 💡 Pro Tips

- Use Chrome/Edge for best experience
- Mock data auto-loads on page refresh
- Timeline tooltips show duration & time
- CSV export includes all machines

---

**Ready? Let's go! 🎉**

```bash
npm run dev
```
