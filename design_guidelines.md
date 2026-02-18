# Design Guidelines: Palm Oil Purchase Planning Application

## Design Approach

**Selected Approach:** Design System - Material Design 3
**Justification:** This is a utility-focused, data-intensive application requiring efficient information access, real-time updates, and map integration. Material Design 3 provides excellent patterns for data displays, mobile responsiveness, and complex interactions needed for industrial/agricultural B2B tools.

**Key Design Principles:**
- Information clarity over visual flourish
- Mobile-first (field use by farmers)
- Fast data scanning and decision-making
- Trust and reliability through consistent patterns

## Core Design Elements

### A. Typography
- **Primary Font:** Noto Sans Thai (Google Fonts CDN) - excellent Thai language support
- **Headers:** 
  - H1: text-3xl font-bold (Factory names, main titles)
  - H2: text-2xl font-semibold (Section headers)
  - H3: text-xl font-medium (Card titles)
- **Body:** text-base font-normal
- **Data/Metrics:** text-lg font-semibold (prices, distances, queue numbers)
- **Labels:** text-sm font-medium text-gray-600

### B. Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8 (p-2, p-4, p-6, p-8, m-4, gap-6, etc.)
- Mobile: p-4, gap-4 for cards/sections
- Desktop: p-6 to p-8, gap-6 for spacing
- Component padding: p-4 to p-6
- Section margins: my-6 to my-8

### C. Component Library

**1. Navigation**
- Top app bar with logo, location indicator, user profile
- Bottom navigation (mobile): Home, Map, Messages, Profile
- Tab navigation for switching between "ใกล้ที่สุด" (Nearest) and "ราคาสูงสุด" (Best Price)

**2. Map Component**
- Full-screen interactive map showing 20 factories with custom markers
- Factory markers show status (operational/closed) via marker styling
- Tap marker to see quick info card overlay
- User location indicator with radius circle

**3. Factory Cards (Primary Component)**
- Rank badge (1-3) in top-left corner
- Factory name as header
- Three key metrics in row layout:
  - Price per kg (฿/กก.)
  - Distance (km)
  - Queue count (คิว: X ตัน)
- Status indicator (เปิด/ปิด) with icon
- Action buttons: "ดูรายละเอียด" (Details), "นัดหมาย" (Schedule)
- Use elevation/shadow for card depth

**4. Recommendation Section**
- AI suggestion banner with icon
- Toggle between recommendation modes (proximity vs. price-based)
- Top 3 factories displayed as cards in vertical list (mobile) or 3-column grid (desktop)

**5. Factory Detail Modal/Page**
- Full factory information
- Operating hours schedule (calendar view)
- Real-time queue visualization (bar chart or number display)
- Price history chart (line graph)
- Contact/messaging button
- Map with directions

**6. Messaging Interface**
- Chat-style interface for factory communication
- Factory profile header with status
- Message bubbles (sent/received)
- Quick scheduling templates
- Attachment support for documentation

**7. Forms & Inputs**
- Location permission prompt card
- Search bar for factory name filtering
- Date/time pickers for scheduling
- Radio buttons for recommendation mode selection

**8. Data Displays**
- Metric cards with icon, label, and large number
- Status badges (สีเขียว for open, สีแดง for closed)
- List views with dividers for factory listings
- Data tables for detailed comparisons (desktop)

**9. Dashboard (Home Screen)**
- Hero section: User location summary with refresh button
- Quick stats row: Total factories, Average price, Nearest factory
- Recommendation mode selector tabs
- Top 3 factory cards
- "ดูโรงงานทั้งหมด" (View All) button linking to full list/map

## Images

**Map Assets:**
- Custom factory location markers (operational vs closed states)
- User location pin icon
- No hero image - this is a utility dashboard

**Icons:**
- Use Material Icons via CDN
- Factory: factory icon
- Location: location_on
- Price: attach_money
- Queue: hourglass_empty
- Message: message
- Status: check_circle / cancel
- Calendar: event

## Mobile-First Layout Strategy

**Mobile (base):**
- Single column layout
- Bottom navigation bar
- Stacked factory cards
- Collapsible map view
- Full-width components

**Desktop (md: and up):**
- Sidebar navigation
- 2-3 column factory card grid
- Split view: Map (60%) | List (40%)
- Expanded data tables
- Quick action toolbar

## Critical Features
- Real-time data updates (WebSocket integration for queue/price changes)
- Geolocation API integration (user position detection)
- Google Maps or Mapbox integration
- Progressive Web App (PWA) for offline factory list cache
- Push notifications for price changes or scheduled appointments