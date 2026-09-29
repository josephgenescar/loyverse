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
- 💼 Sant Finans : revni, depans, pwofi ak pewòl
- 🔐 Dwa aksè pou caissier, vendeur, gérant ak propriétaire
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

## Finance cloud sync

Anvan ou itilize sync cloud pou depans, achats, fournisseurs ak pewòl, kouri migration ki nan `supabase-finance-migration.sql` nan Supabase SQL Editor.

Konektem kounye a bay kontwòl revni, depans operasyonèl, coût machandiz, pwofi ak peman salè. Li pa ranplase yon sistèm kontablite legal doub-antre: balans, journal debit/kredi, taks legal, fich salè ak audit trail dwe ajoute anvan itilizasyon kòm kontablite ofisyèl.

## QR MonCash et NatCash des commerçants

Exécutez `supabase-payment-methods.sql` dans le SQL Editor Supabase avant le déploiement. Cette migration crée `payment_methods`, les politiques RLS par utilisateur, le bucket privé `merchant-payment-qr` et les champs de confirmation des ventes cloud.

Déployez l’application sur Netlify. La fonction vérifie le token Supabase Auth, puis utilise ce token pour les opérations; les politiques RLS limitent les accès à l’UUID du commerçant. Aucun service-role key n’est nécessaire pour ces QR. `SUPABASE_URL` et `SUPABASE_ANON_KEY` peuvent être définies si le projet Supabase diffère de celui configuré dans l’application. GitHub Pages seul ne peut pas exécuter cette fonction.

Pour tester :

1. Connectez-vous avec le compte du commerçant A, ouvrez « Moyens de paiement », ajoutez un QR MonCash, activez-le et enregistrez. Vérifiez le preview avant l’enregistrement.
2. Faites de même avec NatCash, puis désactivez et réactivez chaque méthode. Remplacez un QR et vérifiez qu’il est mis à jour; supprimez ensuite un QR et confirmez que son bouton n’apparaît plus à la caisse.
3. Ajoutez un article au panier et sélectionnez MonCash ou NatCash. Vérifiez le QR, le nom, le téléphone, le total, le champ de référence et l’avertissement. Annulez une première fois : aucune vente ne doit être créée. Confirmez ensuite « Paiement reçu » et vérifiez le reçu, le caissier, l’heure, la méthode et la référence.
4. Ouvrez le rapport des ventes et le rapport journalier. Vérifiez les totaux espèces/MonCash/NatCash et filtrez les ventes par méthode.
5. Connectez-vous avec un deuxième compte marchand. Confirmez qu’il ne voit pas le QR de A; tentez aussi d’accéder directement à la ligne ou au fichier de A avec la session B et vérifiez que RLS/la fonction refusent l’accès.
6. Testez un faux fichier renommé en `.png`, un fichier de plus de 2 MB après compression, puis les trois langues disponibles. Les faux fichiers et les images trop lourdes doivent être refusés.

Aucune API MonCash ou NatCash n’est appelée : le caissier confirme manuellement le paiement après vérification sur son téléphone.
