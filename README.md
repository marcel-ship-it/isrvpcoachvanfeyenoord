# isrvpcoach.nl - Deployment Guide

## 🚀 MAKKELIJKSTE MANIER: Via Vercel Website (AANBEVOLEN)

### Stap 1: Maak een GitHub account (als je die nog niet hebt)
1. Ga naar https://github.com/signup
2. Maak een gratis account

### Stap 2: Upload je code naar GitHub
1. Ga naar https://github.com/new
2. Repository naam: `isrvpcoach`
3. Zet op "Public"
4. Klik "Create repository"
5. Download deze hele `isrvpcoach` folder als ZIP
6. Ga terug naar je GitHub repo
7. Klik "uploading an existing file"
8. Sleep alle bestanden uit de ZIP naar GitHub
9. Klik "Commit changes"

### Stap 3: Deploy naar Vercel (100% gratis)
1. Ga naar https://vercel.com/signup
2. Klik "Continue with GitHub"
3. Geef Vercel toegang tot je GitHub
4. Klik "Import Project"
5. Selecteer je `isrvpcoach` repository
6. Klik "Deploy"
7. Wacht 2 minuten → KLAAR!

### Stap 4: Eigen domein koppelen
1. Registreer `isrvpcoach.nl` bij SIDN (https://sidn.nl)
2. In Vercel: ga naar je project → Settings → Domains
3. Voeg `isrvpcoach.nl` toe
4. Volg de DNS instructies die Vercel geeft
5. Wacht 10 minuten → LIVE!

---

## 💻 ALTERNATIEF: Via Terminal (Voor developers)

### Vereisten
- Node.js 18+ geïnstalleerd
- Terminal kennis

### Lokaal draaien
```bash
# Installeer dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Deployen naar Vercel
```bash
# Installeer Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

---

## 🔐 Admin Functionaliteit

**Wachtwoord:** `rvp2026`

Om de coach status te wijzigen:
1. Klik op "admin" in de header (rechts boven)
2. Voer wachtwoord in: `rvp2026`
3. Klik "Toggle Status"

**Wachtwoord aanpassen:**
- Open `src/App.jsx`
- Zoek naar regel: `if (adminPassword === 'rvp2026')`
- Wijzig `'rvp2026'` naar je eigen wachtwoord

---

## 📊 Features

✅ Live YES/NO status (Is RVP nog coach?)
✅ Publieke poll (In of Out?)
✅ 7-daagse trend chart
✅ Nieuws feed (mock data)
✅ Admin toggle voor status wijziging
✅ Mobile responsive
✅ One vote per device (localStorage)

---

## 🔄 Updates Pushen

### Via GitHub website:
1. Ga naar je repository op GitHub
2. Klik op het bestand dat je wilt wijzigen
3. Klik op het potlood icoon (Edit)
4. Maak je wijzigingen
5. Klik "Commit changes"
6. Vercel deployt automatisch binnen 1 minuut!

### Via Terminal:
```bash
git add .
git commit -m "Update site"
git push
```

---

## 🆘 Hulp Nodig?

### Veelvoorkomende problemen:

**"npm not found"**
→ Installeer Node.js: https://nodejs.org

**"Vercel deploy failed"**
→ Check of package.json correct is
→ Run `npm install` lokaal eerst

**"Site toont niet de laatste versie"**
→ Wacht 2 minuten na deploy
→ Hard refresh: Cmd+Shift+R (Mac) of Ctrl+Shift+R (Windows)

**"Admin wachtwoord werkt niet"**
→ Check of je `rvp2026` exact hebt getypt
→ Pas aan in `src/App.jsx` regel 33

---

## 📱 Structuur

```
isrvpcoach/
├── index.html          # Main HTML
├── package.json        # Dependencies
├── vite.config.js      # Build config
├── src/
│   ├── main.jsx       # React entry
│   └── App.jsx        # Main component (ALLE CODE HIER)
└── README.md          # This file
```

---

## 🎯 Post-Launch TODO

- [ ] Domein registreren bij SIDN
- [ ] Koppelen aan Vercel
- [ ] RSS feed integratie voor echte nieuws (optioneel)
- [ ] Supabase voor echte poll data (optioneel)
- [ ] Analytics toevoegen (optioneel)

---

**Gemaakt voor het weekend van 17-19 januari 2026**  
**Deployment tijd: ~15 minuten via Vercel website**  
**Kosten: €0 (Vercel gratis tier + domein ~€10/jaar)**
