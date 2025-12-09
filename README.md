# TMOT Machine Monitoring System

Real-time machine monitoring dashboard for tracking machine status and performance at True Mold (Thailand) Co., Ltd. (Bridgestone Group)

**Live Demo:** https://machine-monitoring-system.vercel.app

![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black)

## Features

### Machine Status Dashboard
- Real-time machine status monitoring (STOP/RUN)
- Color-coded status and performance indicators
- STOP hours and performance ratio tracking
- Filter by group (PIS, SECTOR, SECTOR (TR), SIDE MOLD, BLADE, 3G)

### Timeline Viewer
- Gantt chart visualization of machine operations
- Custom date range selection
- Export data to CSV
- Visual status representation with colors

### Machine Setup
- Configure Weekly and Monthly Target Ratios
- Edit settings per machine
- Save/Cancel changes with validation
- Group filtering

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Database | MySQL (mysql2) |
| Hosting | Vercel (Serverless Functions) |
| Icons | Lucide React |
| Date Utils | date-fns |

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL database

### Installation

```bash
# Clone repository
git clone https://github.com/mctery/machine-monitoring-system.git
cd machine-monitoring-system

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials
```

### Environment Variables

```env
DATABASE_URL="mysql://user:password@host:3306/database"
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database
```

### Development

```bash
# Run with Vercel dev (includes API)
npm run dev:vercel

# Or run frontend only
npm run dev
```

Open browser at: **http://localhost:3000**

### Database Setup

```bash
# Push schema to database
npm run db:push

# Seed sample data (60 machines)
npm run db:seed
```

## Project Structure

```
mqtt-monitoring-system/
├── api/                    # Vercel Serverless Functions
│   ├── db.ts              # MySQL connection pool
│   └── machine-hours.ts   # API endpoints
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data script
├── src/
│   ├── components/        # React Components
│   │   ├── Header.tsx
│   │   ├── GroupFilter.tsx
│   │   ├── MachineStatusTable.tsx
│   │   ├── TimelineViewer.tsx
│   │   └── MachineSetup.tsx
│   ├── pages/             # Page components
│   ├── store/             # Zustand state management
│   │   └── useMachineStore.ts
│   ├── lib/               # API client
│   │   └── api.ts
│   ├── types/             # TypeScript types
│   └── App.tsx
├── vercel.json            # Vercel configuration
└── package.json
```

## API Endpoints

### GET /api/machine-hours
Fetch machine hours data

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| machine | string | Filter by machine name |
| from | ISO date | Start date filter |
| to | ISO date | End date filter |
| limit | number | Max results (default: 100, max: 1000) |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "logTime": "2025-12-09T08:00:00.000Z",
      "machineName": "Machine-01",
      "runHour": 6.5,
      "stopHour": 1.5,
      "runStatus": 1,
      "stopStatus": 0,
      "reworkStatus": null
    }
  ],
  "count": 1
}
```

### POST /api/machine-hours
Create new machine hours entry

**Request Body:**
```json
{
  "logTime": "2025-12-09T08:00:00.000Z",
  "machineName": "Machine-01",
  "runHour": 6.5,
  "stopHour": 1.5,
  "runStatus": 1,
  "stopStatus": 0,
  "reworkStatus": null
}
```

## Database Schema

```sql
CREATE TABLE machine_hours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  log_time DATETIME NOT NULL,
  machine_name VARCHAR(50) NOT NULL,
  run_hour FLOAT NOT NULL,
  stop_hour FLOAT NOT NULL,
  run_status TINYINT NOT NULL,
  stop_status TINYINT NOT NULL,
  rework_status INT NULL
);
```

## Machine Groups

| Group | Machines |
|-------|----------|
| PIS | Model, PIS, Side piece, NC Lathe |
| SECTOR | SECTOR 1-20 |
| SECTOR (TR) | SECTOR 21-40 |
| SIDE MOLD | Letter 1-4 |
| BLADE | Laser 1-4 |
| 3G | 3G 1-4 |

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables on Vercel Dashboard
# Settings > Environment Variables > Add DATABASE_URL, DB_HOST, etc.
```

### Build for Production

```bash
npm run build
# Output in dist/
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run dev:vercel` | Start Vercel dev (with API) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed database with sample data |

## Color System

### Machine States
| State | Color | Description |
|-------|-------|-------------|
| RUN | Green | Machine is running |
| STOP | Yellow | Machine is stopped |

### Performance Indicators
| Level | Color | Condition |
|-------|-------|-----------|
| Good | White | >= 80% of target |
| Warning | Yellow | 50-80% of target |
| Critical | Red | < 50% of target |

## License

Copyright 2024 True Mold (Thailand) Co., Ltd. (Bridgestone Group)

## Authors

Built for TMOT Manufacturing Operations
