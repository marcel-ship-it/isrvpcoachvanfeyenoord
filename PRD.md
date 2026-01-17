# Product Requirements Document: isrvpcoach.nl

**Version:** 1.0  
**Date:** 17 januari 2026  
**Owner:** Marcel Wiebenga  
**Status:** Pre-Launch  
**Target Launch:** 18-19 januari 2026 (dit weekend)

---

## 1. PRODUCT OVERVIEW

### 1.1 Concept
Een single-purpose viral website die in real-time bijhoudt of Robin van Persie nog trainer is van Feyenoord en publiek sentiment meet via een poll.

### 1.2 Doelstellingen
- **Primair:** Traffic genereren en experimenteren met viral content mechanics
- **Secundair:** Real-time sentiment tracking testen
- **Tijdlijn:** Moet live zijn terwijl RvP discourse actueel is (max 2-4 weken relevantie)

### 1.3 Type Project
- Persoonlijk side project (niet Ringo-gerelateerd)
- Fun/experimentation focus
- Quick launch over perfectie

---

## 2. CORE FEATURES

### 2.1 Hero Status Display

**Functie:** Beantwoord de vraag "Is Robin van Persie nog trainer van Feyenoord?"

**Display:**
- Grote JA/NEE display
- Groen (JA) of Rood (NEE) achtergrond
- Laatste update timestamp
- Standaard status: JA

**Mechanisme:**
- Manual toggle door admin
- Reden: Voorkomt false positives van geautomatiseerde scraping
- Admin beslist wanneer status flips naar NEE

**Admin Toggle:**
- Password protected
- Wachtwoord: `rvp2026`
- Toegang via klein "admin" linkje in header
- Modal popup voor password input

### 2.2 Publieke Poll

**Vraag:** "Robin van Persie: In of Out?"

**Antwoord Opties:**
- **IN** (Blijven) - Groen
- **OUT** (Weg) - Rood

**Functionaliteit:**
- Één stem per device (localStorage based)
- Real-time percentage display
- Totaal aantal stemmen zichtbaar
- Vote kan niet gewijzigd worden

**Data Visualisatie:**
- Huidige percentages met progress bars
- 7-daagse trend line chart
- Y-as: % OUT stemmen
- X-as: Laatste 7 dagen

**Reasoning:**
Daily trends tonen momentum shifts. Waardevoller dan statische percentages - onthult of sentiment harder of zachter wordt over tijd.

### 2.3 Nieuws Feed

**Titel:** "Laatste Nieuws & Geruchten"

**Content per item:**
- Source naam (bv. Voetbal International)
- Headline
- Timestamp (relatief: "2 uur geleden")
- Link naar origineel artikel

**Bronnen:**
- Voetbal International
- Algemeen Dagblad (Sportwereld)
- ESPN.nl
- 1908.nl (Feyenoord fansite)

**Aantal items:** 5-10 meest recente

**Update frequentie:** Elke 15 minuten (indicatie getoond aan gebruiker)

**Filtering:**
- Automatisch gefilterd op keywords: "Robin van Persie" + "Feyenoord"

**Reasoning:**
Vier bronnen = voldoende diversiteit zonder ruis. 15min refresh = vers zonder RSS feeds te hammeren.

---

## 3. TECHNICAL SPECIFICATIONS

### 3.1 Tech Stack

**Frontend:**
- React (via Vite)
- Recharts (voor trend visualisatie)
- Inline CSS (geen separate stylesheet voor snelheid)

**Hosting:**
- Vercel (gratis tier)
- Static site + serverless functions mogelijk

**Data Persistence:**
- LocalStorage voor vote tracking (client-side)
- Optioneel: Supabase free tier voor poll aggregation (post-MVP)

**Domain:**
- isrvpcoach.nl (beschikbaar per 17 jan 2026)
- Te registreren via SIDN

### 3.2 Data Schema

**LocalStorage (Client):**
```
rvp-voted: "in" | "out"
```

**Poll Results (In-memory, MVP):**
```javascript
{
  in: number,
  out: number
}
```

**Status State:**
```javascript
{
  isCoach: boolean,
  lastUpdated: datetime
}
```

### 3.3 RSS Feed Integration (Optional Post-MVP)

**Serverless Function:**
- Vercel Edge Function
- Cron: elke 15 minuten
- Parse RSS feeds van 4 bronnen
- Filter op keywords
- Return laatste 10 items

---

## 4. USER EXPERIENCE

### 4.1 User Flow

**First-time Visitor:**
1. Land op homepage
2. Zie immediate answer (JA/NEE status)
3. Scroll naar poll
4. Cast vote (IN of OUT)
5. Zie results + trend
6. Scroll naar nieuws feed
7. Click through naar interessante artikelen

**Repeat Visitor:**
1. Check of status is gewijzigd
2. Zie poll results update
3. Check nieuwe nieuws items

**Admin:**
1. Click "admin" in header
2. Enter password: `rvp2026`
3. Toggle status JA ↔ NEE
4. Status update immediate zichtbaar

### 4.2 Mobile Responsive

**Prioriteit:** Hoog
- 70%+ traffic verwacht via mobile (social sharing)
- Single column layout op <768px
- Touch-friendly poll buttons
- Readable font sizes (min 16px body)

---

## 5. DESIGN GUIDELINES

### 5.1 Kleuren

**Primary Palette:**
- Feyenoord Rood: `#e30613`
- Zwart: `#000000`
- Donkergrijs background: `#1a1a1a` tot `#2d2d2d`

**Status Colors:**
- JA (Coach): Groen `#2d5c3f`
- NEE (Not Coach): Rood `#c41e3a`

**UI Elements:**
- Text: `#ffffff` (wit)
- Secondary text: `#999999`
- Tertiary text: `#666666`
- Borders: `#333333`

### 5.2 Typography

**Font Stack:**
```
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
```

**Sizes:**
- Hero status (JA/NEE): 4rem (64px)
- H1 (site title): 1.5rem
- H2 (hero vraag): 2rem
- H3 (section titles): 1.5rem
- Body: 1rem (16px)
- Small: 0.9rem

**Weights:**
- Bold: 700 (headers, CTA's, status)
- Regular: 400 (body)

### 5.3 Spacing

**Section Padding:**
- Hero: 4rem vertical
- Poll: 3rem vertical
- News: 3rem vertical

**Component Padding:**
- Cards: 2rem
- Buttons: 1.5rem
- Inputs: 0.75rem

### 5.4 Components

**Buttons:**
- Border radius: 8px
- Hover effect: scale(1.05)
- Font weight: bold

**Cards:**
- Border radius: 12px
- Box shadow: `0 4px 12px rgba(0,0,0,0.3)`
- Background: `#222222`

---

## 6. CONTENT REQUIREMENTS

### 6.1 Copy Tone

**Kenmerken:**
- Neutraal/factual (geen bias voor IN of OUT)
- Direct/to-the-point
- Nederlands (target audience)
- Geen sensationalisme

**Voorbeelden:**
- ✅ "Is Robin van Persie nog steeds trainer van Feyenoord?"
- ❌ "ONTPLOFFING bij Feyenoord: Hoe lang houdt RvP het nog vol?"

### 6.2 Disclaimer

**Footer text:**
```
isrvpcoach.nl - Een onafhankelijke status tracker
Geen officiële bron. Voor officieel nieuws, check Feyenoord.nl
```

**Reasoning:**
Legal protection + verwachtingsmanagement dat dit geen officiële Feyenoord site is.

---

## 7. SUCCESS METRICS

### 7.1 Launch Week KPIs (Optional tracking)

**Traffic:**
- 1,000+ unique visitors = decent viral pickup
- 5,000+ = success

**Engagement:**
- 500+ poll votes = engaged audience
- 20%+ vote rate (votes/visitors)

**Viral Spread:**
- Gedeeld op Feyenoord Twitter/Reddit
- Mention in 1908.nl of andere fansite

### 7.2 Analytics (Optional)

**Tools:**
- Vercel Analytics (gratis, privacy-friendly)
- Of: Plausible Analytics

**Events to track:**
- Page views
- Poll votes (IN vs OUT)
- News article clicks
- Admin toggle usage

---

## 8. LAUNCH TIMELINE

### Week van 17 januari 2026

**Zaterdag 18 januari:**
- [ ] Domain registreren (isrvpcoach.nl)
- [ ] Deploy naar Vercel
- [ ] Koppel domain aan Vercel
- [ ] Test admin toggle
- [ ] Test poll functionaliteit
- [ ] Soft launch: deel met 5-10 vrienden voor feedback

**Zondag 19 januari:**
- [ ] Fix eventuele bugs
- [ ] Officiële launch
- [ ] Share op sociale media
- [ ] Monitor traffic/engagement

---

## 9. MVP SCOPE

### 9.1 In Scope (Launch Weekend)

✅ Hero JA/NEE status display
✅ Admin toggle (password protected)
✅ Poll met IN/OUT opties
✅ Poll results display (percentages + bars)
✅ 7-daagse trend chart
✅ Mock nieuws feed (5 items)
✅ Mobile responsive design
✅ LocalStorage voor vote tracking
✅ Domain + Vercel deployment

### 9.2 Out of Scope (Post-MVP)

❌ Echte RSS feed integratie
❌ Supabase voor poll data aggregatie
❌ User comments/discussion
❌ Social sharing buttons
❌ Multiple language support
❌ Historical vote data export
❌ Email notifications voor status changes
❌ API voor external access

---

## 10. POST-LAUNCH ITERATION

### 10.1 If High Traffic (5,000+ visitors)

**Prioriteiten:**
1. Supabase integratie voor centrale poll data
2. Echte RSS feed scraping
3. Social share buttons
4. Analytics dashboard

### 10.2 If Low Traffic (<500 visitors)

**Leren:**
- Timing analysis (was RvP discourse over?)
- Distribution channels (waar gedeeld?)
- Content resonance (welk deel heeft aandacht?)

**Pivot Options:**
- Template maken voor andere "Is [X] still [Y]?" sites
- Archiveren en focussen op volgende experiment

---

## 11. RISKS & MITIGATIONS

### 11.1 Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Vercel downtime | Hoog | Laag | Accepteren (gratis tier) |
| RSS feeds down | Medium | Medium | Start met mock data, add RSS later |
| Poll manipulation | Medium | Medium | LocalStorage + rate limiting (post-MVP) |
| Mobile niet responsive | Hoog | Laag | Test op echte devices voor launch |

### 11.2 Content Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| RvP ontslagen voor launch | Hoog | Medium | Launch ook met NEE status - momentum blijft |
| Discourse wordt irrelevant | Hoog | Medium | Accepteren - dit is tijd-gelimiteerd experiment |
| Juridische claims Feyenoord | Laag | Zeer laag | Duidelijke disclaimer, geen officiële branding |

---

## 12. OPEN QUESTIONS

### 12.1 Voor Launch

- [ ] Moeten we analytics inbouwen vanaf dag 1? → Nee, optioneel
- [ ] Cookie banner nodig? → Alleen LocalStorage = geen banner nodig (AVG)
- [ ] Backup domain als .nl niet op tijd geregeld? → rvpstatus.com

### 12.2 Voor Post-Launch

- [ ] RSS feed integratie prioriteit? → Alleen bij >1,000 visitors
- [ ] Supabase setup als poll data verloren gaat? → Alleen bij >500 votes
- [ ] Archiveren na RvP vertrek? → Ja, maar houd site live als case study

---

## 13. APPENDIX

### 13.1 Competitor Analysis

**Vergelijkbare sites:**
- isborisbekaert.com (Belgian football)
- isthereanydeal.com (game pricing tracker)
- isitchristmas.com (single-purpose status)

**Learning:**
- Single-purpose = viral potential
- Humor/timing > production value
- Mobile-first essential

### 13.2 Technical Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "recharts": "^2.10.3",
  "vite": "^5.0.8"
}
```

### 13.3 File Structure

```
isrvpcoach/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   └── App.jsx (alle logica + UI)
└── README.md
```

---

## 14. SIGN-OFF

**Product Owner:** Marcel Wiebenga  
**Launch Date:** 18-19 januari 2026  
**Budget:** ~€10 (domain only, Vercel free tier)  
**Time Investment:** 6-8 uur (setup + deployment)  

**Approval:** Ready to build ✅

---

**Document Version History:**

| Versie | Datum | Wijzigingen | Author |
|--------|-------|-------------|--------|
| 1.0 | 17 jan 2026 | Initial PRD | Marcel Wiebenga |

---

*End of Document*
