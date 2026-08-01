# FlockTrack

**Offline-first PWA for church attendance tracking. QR scan, Quick Tap, and Search check-in. Google Sheets backend via Apps Script.**

[![PWA](https://img.shields.io/badge/PWA-Offline--First-6c63ff?style=flat-square&logo=pwa)](https://morkmork26.github.io/JILGM-Attendance/)
[![Backend](https://img.shields.io/badge/Backend-Google%20Apps%20Script-0ea5e9?style=flat-square&logo=google)](https://developers.google.com/apps-script)
[![Hosting](https://img.shields.io/badge/Hosting-GitHub%20Pages-333?style=flat-square&logo=github)](https://pages.github.com)

> **Live App:** [morkmork26.github.io/JILGM-Attendance](https://morkmork26.github.io/JILGM-Attendance/)  
> **Setup Guide:** [morkmork26.github.io/FlockTrack_JILGM_AttendanceApp](https://morkmork26.github.io/FlockTrack_JILGM_AttendanceApp/)

---

## Problem

A church with 500+ members needs a modern, reliable attendance system that:
- Works on any device (phones, tablets, any OS)
- Functions without internet (rural areas, weak signal)
- Requires zero infrastructure cost
- Is simple enough for non-technical ushers to operate

## Solution

A Progressive Web App that runs entirely in the browser, uses Google Sheets as a database via Apps Script API, supports offline check-in with background sync, and can be installed like a native app on any device.

---

## Features

| Feature | Description |
|---------|-------------|
| **QR Scan Check-In** | Camera scans member's personal QR code for instant check-in |
| **Quick Tap** | Photo grid of members - tap to check in |
| **Search** | Type name to find and check in |
| **Offline-First** | Check-ins save to IndexedDB, sync when back online |
| **Real-Time Sync** | Background sync with Google Sheets every 10 seconds |
| **Device Access Control** | Admin approval system for usher devices |
| **Auto Registration** | Google Form generates member ID + personal QR code via email |
| **Duplicate Detection** | Blocks double registrations automatically |
| **Celebration Animations** | Particles, confetti, and streak badges on check-in |
| **Attendance Streaks** | Tracks consecutive Sunday attendance |
| **iOS + Android** | Full compatibility with Safari and Chrome PWA |
| **Admin Panel** | Remove check-ins, manage devices, send reports with backup |
| **Responsive** | Phone and iPad landscape layouts |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    User Devices                       │
│  (Android Chrome / iOS Safari / iPad / Desktop)      │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS (GET with encoded JSON)
                         ▼
┌─────────────────────────────────────────────────────┐
│              Google Apps Script (Web App)             │
│  - doGet() handles all requests                      │
│  - Member CRUD, attendance, device management        │
│  - QR code generation + email delivery               │
│  - Report generation with spreadsheet backup         │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│              Google Sheets (Database)                 │
│  Tabs: Members | Attendance | Visitors | Config |    │
│        Devices | Reports | Form Responses            │
└─────────────────────────────────────────────────────┘
```

**Hosting:** GitHub Pages (static files, free, HTTPS)  
**Offline:** Service Worker caches all assets; IndexedDB stores data locally  
**Sync:** Fire-and-forget GET requests; server data is authoritative  

---

## Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3 (no framework)
- **Storage:** IndexedDB (offline), Google Sheets (cloud)
- **API:** Google Apps Script deployed as Web App
- **QR Scanning:** [Html5-QRCode](https://github.com/mebjas/html5-qrcode)
- **PWA:** Service Worker, Web App Manifest, Add to Home Screen
- **Hosting:** GitHub Pages
- **Forms:** Google Forms with Apps Script trigger for auto-processing

---

## Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| iOS Safari drops POST body on Apps Script 302 redirect | Converted all writes to GET with `?data=encodeURIComponent(JSON.stringify(payload))` |
| Offline check-ins must not be lost | IndexedDB saves first, network sync is fire-and-forget. Pending sync queue retries on reconnect |
| Zero-cost infrastructure for 500+ members | Google Sheets as DB (free), Apps Script as API (free), GitHub Pages for hosting (free) |
| Camera not releasing on iOS when switching tabs | Explicit `stream.getTracks().forEach(t => t.stop())` on tab leave, restart on return |
| Multiple devices syncing simultaneously | Server is authoritative - local today's attendance is cleared and replaced from server each sync cycle |
| Flip camera (back to front to back) causes black screen | `qrScanner.stop()` is async; must `await` it before restarting with new facing mode |
| Deleted check-ins reappear after sync | Local blacklist (60s TTL) prevents sync from re-inserting recently removed records while server processes the delete |
| Google Sheets stores dates as Date objects, not strings | Server-side date comparison normalizes `Date` objects to `YYYY-MM-DD` before matching |
| Duplicate `onFormSubmit` functions in Apps Script | Second function silently overrode the first; removed the legacy duplicate detection version |
| Account lockout risk (Google flagging automated access) | Migrated to a mature personal account with real activity history; fresh accounts get flagged |
| iOS PWA doesn't persist camera permissions across sessions | Moved camera start to after init (not cold launch); reduces permission prompts but iOS limitation remains |
| Check-in overlay blocked by network latency (2-3s delay) | Made network fetch fire-and-forget; confirmation shows instantly from local write |
| Splash screen too fast on cached loads | Enforced 1.5s minimum display via `Date.now()` elapsed comparison before hiding |

---

## Project Structure

```
├── index.html          # Full PWA (single file, ~1900 lines)
├── sw.js               # Service Worker (cache-first strategy)
├── manifest.json       # PWA manifest
├── icon-192.png        # App icon
├── icon-512.png        # App icon (large)
├── gas/
│   └── Code.gs         # Google Apps Script backend
└── screenshots/        # App screenshots
```

---

## Setup & Deployment

See the full setup guide: [FlockTrack Setup Guide](https://morkmork26.github.io/FlockTrack_JILGM_AttendanceApp/)

Quick overview:
1. Create a Google Sheet with required tabs
2. Link a Google Form for member registration
3. Deploy `gas/Code.gs` as a Web App from Apps Script
4. Set the deployment URL in the app's Settings

---

## AI Disclosure

Built with AI-assisted development. I designed the architecture, managed deployment, and handled all real-world debugging and iteration with 500+ church members as end users.

---

## License

MIT
