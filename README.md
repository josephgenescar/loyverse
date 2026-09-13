# Konektem – Caisse Intelligente Haïtienne

Application POS (Point of Sale) complète pour commerçants haïtiens.

## Fichiers

- `index.html` — Page d'accueil (landing page)
- `app.html` — Application caisse (POS)

## Fonctionnalités

- 🛒 Caisse point de vente
- 📦 Gestion des stocks
- 🔗 Intégration API boutique (Piyay & autres)
- 📊 Back Office avec rapports
- 💊 Mode Pharmacie avec DCI/Dosage
- 📱 Responsive mobile & tablette
- 🗄️ Contact Entreprise → Supabase

## Déploiement

Hébergé sur GitHub Pages : https://[username].github.io/konektem

## PayPal Premium

PayPal itilize Netlify Functions; GitHub Pages pou kont li pa ka kouri pati backend lan.

Nan Netlify, mete environment variables sa yo:

- `PAYPAL_CLIENT_ID` — Client ID PayPal la
- `PAYPAL_CLIENT_SECRET` — Client Secret PayPal la, sèlman sou server la
- `PAYPAL_MODE` — `sandbox` pou tès oswa `live` pou peman reyèl
- `SITE_URL` — URL sit la, pa egzanp `https://konektem.netlify.app`
- `SUPABASE_SERVICE_KEY` — service role key Supabase la

Pou tès, kreye aplikasyon an sou PayPal Developer nan mòd Sandbox epi sèvi ak kont test yo. Anvan pwodiksyon, mete `PAYPAL_MODE=live` epi ranplase kle yo ak Live credentials. PayPal flow sa a se yon peman pou peryòd plan an; si ou bezwen renouvèlman otomatik chak mwa, fòk ou ajoute PayPal Subscriptions ak yon Product/Plan ID apa.
