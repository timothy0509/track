# TimoTrack Roadmap

## Project Overview

**TimoTrack** is a comprehensive time tracking application inspired by Toggl Track, built with:
- **Frontend**: TanStack Start (React 19, file-based routing, SSR)
- **Backend**: Convex (real-time database, serverless functions)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Deployment**: Vercel

---

## Completed Phases

### Phase 1: Foundation (Weeks 1-2)
- [x] **1.1** Replace T3 Stack, initialize TanStack Start + Convex
- [x] **1.2** shadcn/ui components + base layout (AppLayout, Sidebar, TopBar, AuthLayout)
- [x] **1.3** Convex schema (21 tables) + mock auth system
- [x] **1.4** Workspace management (CRUD, onboarding wizard, member invitation, RBAC)

### Phase 2: Core Time Tracking (Weeks 3-4)
- [x] **2.1** Timer functionality (live timer, start/stop, keyboard shortcuts)
- [x] **2.2** Manual entry + time entry CRUD (create, edit, delete, favorite)
- [x] **2.3** Projects + Clients (CRUD, colors, budgets, estimates, client association)
- [x] **2.4** Tasks + Tags + AutoComplete (task CRUD, tag CRUD, autocomplete suggestions)

### Phase 3: Advanced Tracking (Weeks 5-6)
- [x] **3.1** Offline tracking (IndexedDB, sync queue, offline indicator)
- [x] **3.2** Sharing + Favorites (share entries, accept shares, favorites page)
- [x] **3.3** Time rounding + duration entries (5/10/15/30/60 min rounding, up/down/nearest)
- [x] **3.4** Calendar view + integrations (react-calendar, Google/Outlook calendar sync)

---

## Upcoming Phases

### Phase 4: Reporting & Analytics (Weeks 7-9)

- [ ] **4.1** Report Builder
  - Filter builder with AND/OR logic
  - Date range picker with presets (today, this week, this month, custom)
  - Grouping controls (up to 3 levels: project, task, tag, user, client)
  - Report configuration save/load

- [ ] **4.2** Chart Components
  - Recharts integration
  - Bar chart, stacked bar chart, grouped bar chart
  - Donut chart
  - Line chart, multi-line chart
  - Responsive chart sizing

- [ ] **4.3** Table & Pivot Table Views
  - Data table with customizable columns
  - Pivot table view with drag-and-drop grouping
  - Sorting and filtering in tables
  - Column aggregation (sum, average, count)

- [ ] **4.4** Report Types
  - Summary report (total time, billable vs non-billable, by project/client)
  - Detailed report (entry-level detail with all fields)
  - Workload report (team member utilization, capacity)
  - Profitability report (revenue, costs, profit margins)

- [ ] **4.5** Export, Sharing & Scheduling
  - PDF export (@react-pdf/renderer)
  - Excel export (exceljs)
  - CSV export (papaparse)
  - Report sharing (public links, user-specific access)
  - Scheduled reports (daily, weekly, monthly via email)

### Phase 5: Financial & Team Features (Weeks 10-11)

- [ ] **5.1** Billable Rates & Financial Tracking
  - Billable rate hierarchy (workspace > team > project > task)
  - Historical rate tracking
  - Labor cost tracking (hourly cost per user)
  - Revenue and profit calculation
  - Currency conversion

- [ ] **5.2** Teams & User Groups
  - Team CRUD operations
  - User group CRUD operations
  - Team member management
  - Bulk permissions via teams/groups
  - Team-level reporting

- [ ] **5.3** Project Estimates & Budgets
  - Project time estimates
  - Budget configuration (hours, amount, fixed fee)
  - Budget alerts (threshold-based notifications)
  - Fixed fee projects
  - Recurring projects
  - Budget progress visualization

### Phase 6: Enterprise & Polish (Weeks 12-13)

- [ ] **6.1** Custom Dashboards & Analytics
  - Dashboard widget system (draggable, resizable)
  - Utilization view (team capacity vs actual)
  - Adherence view (scheduled vs tracked time)
  - Custom chart configurations
  - Saved dashboard layouts

- [ ] **6.2** Audit Logging & Team Management
  - Audit log viewer (filter by user, action, date)
  - Team member activity tracking
  - Team reminders (inactive member alerts)
  - Required fields enforcement (description, project, task, tag)
  - Compliance reporting

- [ ] **6.3** Bulk Operations
  - Bulk edit time entries (change project, add tags, toggle billable)
  - Bulk edit projects (change client, update rates)
  - Bulk archive/delete operations
  - Bulk member role changes
  - Undo bulk operations

- [ ] **6.4** Settings & Customization
  - Workspace settings (name, currency, time format, date format)
  - Profile settings (name, email, timezone, preferences)
  - Notification settings (email, in-app, scheduled reports)
  - Billing & subscription management
  - Integration settings (Google Calendar, Outlook, webhooks)
  - Theme customization (light/dark mode, accent colors)

- [ ] **6.5** Final Polish & Deployment
  - Performance optimization (virtualization, code splitting, caching)
  - Error boundaries for all routes
  - Loading states and skeleton loaders
  - Accessibility audit (WCAG 2.1 AA)
  - Production Convex deployment
  - Vercel deployment with CI/CD
  - Monitoring and error tracking (Sentry)

---

## Future Enhancements (Post-v1)

### Platform Expansion
- [ ] Desktop app (Electron/Tauri)
- [ ] Mobile app (React Native)
- [ ] Browser extension (Chrome, Firefox, Edge)
- [ ] CLI tool for terminal-based tracking

### Integrations
- [ ] Jira integration (auto-import work logs)
- [ ] GitHub integration (PR/issue time tracking)
- [ ] Slack integration (slash commands, reminders)
- [ ] Asana integration
- [ ] Linear integration
- [ ] Notion integration
- [ ] Zapier webhook support
- [ ] REST API for third-party access

### Enterprise Features
- [ ] SSO (SAML, OIDC)
- [ ] SCIM provisioning
- [ ] Custom branding (white-label)
- [ ] Timesheet approval workflow
- [ ] Invoice generation
- [ ] Multi-currency support
- [ ] GDPR compliance tools
- [ ] Data retention policies

### AI Features
- [ ] Auto-categorization of time entries
- [ ] Smart suggestions for descriptions/projects
- [ ] Anomaly detection (unusual time entries)
- [ ] Predictive budget alerts
- [ ] Natural language time entry ("meeting with client for 2 hours")

---

## Technical Debt & Improvements

- [ ] Replace mock auth with real authentication (Clerk, NextAuth, or Convex Auth)
- [ ] Regenerate Convex `_generated` types with `npx convex dev`
- [ ] Add comprehensive error handling and user feedback
- [ ] Implement proper input validation with Zod
- [ ] Add unit and integration tests
- [ ] Set up CI/CD pipeline
- [ ] Add E2E tests with Playwright
- [ ] Performance profiling and optimization
- [ ] Add analytics/telemetry (privacy-respecting)
- [ ] Internationalization (i18n) support
- [ ] Accessibility audit and fixes

---

## Architecture Notes

### Current Structure
```
track/
├── convex/                    # Backend (Convex)
│   ├── schema/                # Database schema (21 tables)
│   ├── queries/               # Read operations
│   ├── mutations/             # Write operations
│   ├── actions/               # External API calls
│   └── lib/                   # Shared helpers
├── src/
│   ├── routes/                # TanStack Start file-based routes
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── layout/            # App shell components
│   │   ├── timer/             # Timer-related components
│   │   ├── entries/           # Entry list components
│   │   ├── projects/          # Project components
│   │   ├── clients/           # Client components
│   │   ├── tasks/             # Task components
│   │   ├── tags/              # Tag components
│   │   ├── reports/           # Report components
│   │   ├── teams/             # Team components
│   │   ├── members/           # Member components
│   │   ├── settings/          # Settings components
│   │   └── shared/            # Shared utilities
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Client-side utilities
│   └── providers/             # React context providers
└── public/                    # Static assets
```

### Key Dependencies
| Package | Purpose |
|---------|---------|
| @tanstack/start | Full-stack React framework |
| @tanstack/react-router | File-based routing |
| @tanstack/react-virtual | List virtualization |
| convex | Real-time backend |
| tailwindcss | Utility-first CSS |
| shadcn/ui | Component library |
| lucide-react | Icon library |
| react-calendar | Calendar component |
| date-fns | Date utilities |
| recharts | Chart library (planned) |
| @react-pdf/renderer | PDF export (planned) |
| exceljs | Excel export (planned) |
| papaparse | CSV export (planned) |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start Convex dev server (in separate terminal)
npx convex dev

# Start dev server
npm run dev
```

### Environment Variables
```env
VITE_CONVEX_URL=https://your-project.convex.cloud
```

---

## Contributing

1. Pick an unchecked item from the roadmap
2. Create a feature branch
3. Implement the feature
4. Run `npx tsc --noEmit` to verify types
5. Submit a PR

---

*Last updated: April 2025*
