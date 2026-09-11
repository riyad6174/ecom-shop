# Smart Tracker Duo Landing Page — Sheii Shop

## 1. Page objective

এই পেজের একমাত্র প্রধান লক্ষ্য হবে: **ভিজিটর যেন দ্রুত বুঝতে পারে কোন tracker তার জন্য উপযুক্ত, এক বা দুইটি বেছে নিতে পারে, quantity নির্ধারণ করে existing checkout popup-এ অর্ডার সম্পন্ন করতে পারে।**

পেজের মূল conversion path:

> **সমস্যা অনুভব → দুইটি সমাধান দেখা → নিজের প্রয়োজন অনুযায়ী বেছে নেওয়া → quantity নির্বাচন → checkout**

এখানে নতুন checkout design তৈরি করার প্রয়োজন নেই। Existing checkout popup-কে 그대로 ব্যবহার করে শুধু selection state এবং quantity section যুক্ত করতে হবে।

---

## 2. Recommended positioning

দুই product-কে আলাদা আলাদা “কে ভালো” হিসেবে না দেখিয়ে একটি সহজ প্রশ্নের উত্তর হিসেবে position করুন:

> **আপনার সবচেয়ে গুরুত্বপূর্ণ জিনিসগুলো হারিয়ে গেলে—আপনি কি অনুমান করবেন, নাকি ফোনে দেখে খুঁজে নেবেন?**

এরপর দুই কার্ডে দুইটি option:

| Product | Suggested role in the page | Copy direction |
|---|---|---|
| **Borofone BC110 — White** | Clean everyday option | “সাদা, মিনিমাল tracker—দৈনন্দিন জিনিসের সঙ্গে সহজে ব্যবহার করুন” |
| **HOCO E103 — Black + Silicone Cover** | Protected carry option | “কালো tracker-এর সঙ্গে silicone cover—চাবি, ব্যাগ ও outdoor carry-এর জন্য” |

**গুরুত্বপূর্ণ:** বর্তমান Sheii Shop homepage-এ Hoco মডেল হিসেবে E101 দেখা যাচ্ছে, কিন্তু এই brief-এ E103 বলা হয়েছে। Landing page-এ শুধু “দুটিই Android + iOS support করে” বললে দুই product একই মনে হবে। তাই card, image, badge, color label এবং included accessory দিয়ে পার্থক্যটি প্রথম দেখাতেই দেখাতে হবে। Launch-এর আগে product SKU, image, package, manual, pairing method, reset method, warranty এবং inventory একই মডেলের কিনা যাচাই করুন। ভুল model-name থাকলে customer trust ও return দুটোই ক্ষতিগ্রস্ত হবে।

---

## 3. Above-the-fold UI

### Hook question

**“চাবি, ওয়ালেট বা ব্যাগ হারিয়ে গেলে—শেষবার কোথায় রেখেছিলেন মনে করার চেষ্টা করবেন, নাকি ফোনে দেখে খুঁজে নেবেন?”**

Subheadline:

**iPhone ও Android—দুই ধরনের ফোনেই ব্যবহারযোগ্য Smart Tracker। আপনার প্রয়োজন অনুযায়ী একটি বা দুটিই বেছে নিন।**

Small trust strip:

`৳৯৯৯/টি` · `Cash on Delivery` · `Original product` · `Support available`

Hero CTA:

**“আমার জন্য tracker বেছে নিন”**

এই CTA-টি product cards পর্যন্ত smooth-scroll করবে। Hero-তে সরাসরি “Buy Now” না দিয়ে প্রথমে product choice দেখানো ভালো, কারণ এই landing page-এর differentiator হলো guided selection।

### Visual direction

- Background: near-black navy, যেমন `#080B14` বা `#0B1020`
- Accent gradient: electric violet → cyan, যেমন `#7C3AED → #06B6D4`
- Hero product visuals: বাম পাশে **সাদা Borofone BC110**, ডান পাশে **কালো HOCO E103 + silicone cover**, subtle glow, no busy background
- Hero-তে প্রত্যেক product-এর নিচে স্থায়ী color/accessory label দিন: `WHITE TRACKER` এবং `BLACK + SILICONE COVER`
- Glass panel: translucent navy, 1px low-opacity border, 20–24px radius
- Bangla font: **Hind Siliguri** অথবা **Noto Sans Bengali**; fallback system sans-serif
- Body text white নয়, `#D9E1F2`; secondary text `#9BA8BF`

---

## 4. Product selection section

### Section heading

**“আপনার জন্য কোনটা বেশি মানানসই?”**

Supporting copy:

**দুটিই নিতে পারেন, অথবা শুধু প্রয়োজনের product-টি select করুন।**

### Card design

প্রতিটি card-এ থাকবে:

1. Product image
2. Brand + model
3. One-line benefit
4. 3টি short proof point
5. Price: **৳৯৯৯**
6. Checkbox / selectable card state
7. Selected হলে cyan-violet border, check icon, এবং “নির্বাচিত” label
8. উপরে prominent visual badge: `সাদা ডিভাইস` অথবা `কালো + silicone cover`
9. Card-এর ছবিতে device ও included accessory একই frame-এ দেখা যাবে

Suggested card copy:

**Borofone BC110 — White**

> সাদা রঙের clean smart finder tag — iPhone ও Android দুটিতেই ব্যবহারযোগ্য

- **রং:** White
- Apple Find My ও Google Find Hub/Find My support
- কাছাকাছি থাকলে ring করে খুঁজে পাওয়া যায়
- চাবি, wallet, bag ও luggage-এর জন্য উপযোগী

**HOCO E103 — Black + Silicone Cover**

> কালো tracker, সঙ্গে protective silicone cover — carry করার জন্য বেশি practical

- **রং:** Black
- **সঙ্গে থাকছে:** Silicone protective cover
- Apple Find My ও Google Find My support
- চাবি, bag zip, luggage ও outdoor carry-এর জন্য উপযোগী

Card footer:

`৳৯৯৯/টি` · `দুটিই Android + iOS support করে` · `একটি বা দুটিই নিন`

### UX rules

- Card-এর যেকোনো জায়গায় tap করলে select হবে; শুধু ছোট checkbox নয়।
- দুটো product-ই একই price এবং Android + iOS support করায় compatibility-কে differentiator হিসেবে ব্যবহার করবেন না। **Color, included silicone cover, visual style এবং use-case**-কে differentiator করুন।
- দুই card-এর image background আলাদা রাখুন: Borofone-এর জন্য soft white/ice-blue glow; HOCO-এর জন্য charcoal/amber glow। এতে thumbnail-এই product আলাদা বোঝা যাবে।
- Card title-এ model-এর পরে color/accessory বাধ্যতামূলকভাবে লিখুন: `Borofone BC110 — White` এবং `HOCO E103 — Black + Silicone Cover`। শুধু `Borofone` বনাম `Hoco` লিখবেন না।
- Selection summary-তেও color/accessory পুনরায় দেখান, যাতে checkout-এর আগে ভুল selection না হয়।
- দুইটির বেশি option, unnecessary color variant বা long specification table উপরের অংশে দেবেন না। এতে choice overload বাড়বে।
- Mobile-এ cards stacked; desktop-এ 2-column.

### Recommended card micro-layout

```text
┌──────────────────────────────┐
│ WHITE                         │  ← color badge
│ [Borofone white product img]  │
│ Borofone BC110                │
│ সাদা smart finder tag         │
│ Android + iOS                 │
│ ৳৯৯৯/টি       [Select]       │
└──────────────────────────────┘

┌──────────────────────────────┐
│ BLACK + SILICONE COVER        │  ← accessory badge
│ [Black device + cover image]  │
│ HOCO E103                     │
│ silicone cover-সহ compact tag │
│ Android + iOS                 │
│ ৳৯৯৯/টি       [Select]       │
└──────────────────────────────┘
```

এই badge দুটির visual style-ও আলাদা রাখুন: `WHITE` badge-এ light silver chip এবং `BLACK + SILICONE COVER` badge-এ dark charcoal chip-এর সঙ্গে thin amber outline। একই product photo বা একই background ব্যবহার করলে user আবার confused হতে পারে।

---

## 5. Selection-to-quantity flow

Product select না করলে quantity panel hidden থাকবে। অন্তত একটি select করলেই panelটি animated reveal হবে।

### Panel copy

**“আপনার selection”**

Selected item rows:

- Product name + color/accessory label
- Thumbnail
- `− 1 +` quantity control
- Line total
- Remove link

Example summary labels:

- `Borofone BC110 — White`
- `HOCO E103 — Black + Silicone Cover`

Summary:

- Product subtotal
- Delivery charge: existing checkout logic অনুযায়ী
- Total: dynamic

Primary button:

**“Quantity নিশ্চিত করে checkout-এ যান”**

Secondary microcopy:

**“পরের ধাপে আপনার delivery details নেওয়া হবে।”**

### Recommended logic

```text
if selectedProducts.length === 0:
  quantityPanel = hidden
  checkoutCTA = disabled
else:
  quantityPanel = visible
  checkoutCTA = enabled

on checkoutCTA:
  pass selected product IDs + quantities to existing checkout popup
```

Existing popup-এ product data পাঠানোর সময় শুধু title নয়, **product ID/SKU, quantity, unit price এবং selected variant** পাঠান। এতে order record-এ ভুল product যাওয়ার ঝুঁকি কমে।

---

## 6. Benefits / use-case section

### Heading

**“একটি ছোট tracker, অনেক বড় স্বস্তি”**

চার বা ছয়টি visual tile:

- চাবি: “চাবি কোথায় রেখেছেন খুঁজে পাওয়া”
- Wallet: “ওয়ালেট ভুলে গেলে দ্রুত locate করা”
- Bag: “ব্যাগ বা laptop bag-এর সঙ্গে লাগিয়ে রাখা”
- Luggage: “ভ্রমণে লাগেজ নজরে রাখা”
- Bicycle: “বাইক বা gear bag-এর সঙ্গে ব্যবহার”
- Remote / daily items: “প্রতিদিন হারিয়ে যাওয়া ছোট জিনিস”

Copy rule: “GPS tracker” বলবেন না, যদি productটি GPS না হয়। Safer wording হলো **Bluetooth Smart Tracker / anti-lost tracker**। “বিশ্বের যেকোনো জায়গা থেকে live tracking” ধরনের absolute claim করবেন না; network availability ও nearby devices-এর উপর location update নির্ভর করতে পারে।

Inline CTA:

**“আমার জিনিসগুলোকে খুঁজে পাওয়ার মতো করে রাখুন”**

CTA click করলে product selection section-এ scroll করবে।

---

## 7. How it connects: video + step-by-step

### Section heading

**“ফোনে connect করতে কতক্ষণ লাগে?”**

Answer line:

**“প্রথমবার pair করুন, তারপর tracker-টি আপনার selected ecosystem-এর app থেকে manage করুন।”**

এখানে দুইটি tab রাখুন:

- **iPhone user**
- **Android user**

প্রতিটি tab-এ উপরে 30–60 second vertical video এবং নিচে numbered steps.

### iPhone steps — verify against actual manual

1. Tracker-এর battery tab খুলে device activate করুন।
2. iPhone-এ Find My app খুলুন।
3. `Items` → `+` → `Add Other Item` নির্বাচন করুন।
4. Tracker-এর নাম select করে on-screen instructions follow করুন।
5. একটি clear name দিন, যেমন “আমার চাবি”।
6. অন্য ফোন থেকে ring/location test করুন।

### Android steps — verify against actual manual

1. Tracker activate করুন।
2. Android-এ Google Find Hub/Find My Device support আছে কিনা এবং প্রয়োজনীয় permissions on আছে কিনা দেখুন।
3. App-এ add device/compatible tracker flow খুলুন।
4. Tracker-এর নাম দিন এবং pairing complete করুন।
5. Ring ও last-known-location test করুন।

**Implementation note:** Apple ও Google-এর app naming/flow OS version অনুযায়ী বদলাতে পারে। Final video ও text current device দিয়ে record করে তারপর publish করুন।

Video captions অবশ্যই দিন, কারণ অনেক visitor sound off করে দেখে।

---

## 8. Warranty section — product section-এর পরেই

আপনার প্রস্তাব অনুযায়ী warranty section product selection-এর কাছাকাছি রাখা ভালো; তবে product cards-এর পরে এবং setup section-এর আগে রাখলে trust objection আগে কাটে।

### Heading

**“কেন Sheii Shop থেকে নেবেন?”**

চারটি trust block:

- Genuine product sourcing
- Checking before dispatch
- Clear warranty terms
- WhatsApp/call support

### Certificate presentation

- Authentic dealership/importer certificate-এর একটি sharp image ব্যবহার করুন।
- Image-এর পাশে 2–3 লাইনে certificate-এর অর্থ ব্যাখ্যা করুন।
- Certificate number, issuer, validity date এবং applicable brand স্পষ্ট দেখা যেতে হবে।
- Sensitive personal information থাকলে প্রয়োজনমতো redact করুন, কিন্তু certificate-কে misleadingভাবে crop করবেন না।
- “Authorized importer” claim শুধু valid document থাকলেই ব্যবহার করুন।

Suggested copy:

**“শুধু tracker বিক্রি নয়—সঠিক product, পরিষ্কার তথ্য ও after-sales support দেওয়াই আমাদের লক্ষ্য।”**

Warranty card:

> **Warranty:** [X মাস] service/replacement warranty — কোন অংশ covered, কোনটি নয়, এবং claim করার নিয়ম স্পষ্ট লিখুন।

বর্তমানে warranty duration brief-এ দেওয়া নেই। তাই `[X মাস]` placeholder পূরণ না করে publish করবেন না।

---

## 9. Reset / troubleshooting section

### Heading

**“Connect না হলে reset করবেন কীভাবে?”**

Accordion format ব্যবহার করুন যাতে পেজ লম্বা না লাগে।

Suggested structure:

1. Tracker-টি phone app থেকে remove/unpair করুন।
2. Battery খুলে 30–60 সেকেন্ড অপেক্ষা করুন—শুধু manual-এ এই instruction থাকলে।
3. Battery পুনরায় insert করুন এবং sound/indicator confirm করুন।
4. App বন্ধ করে আবার খুলে নতুন করে add করুন।
5. অন্য ফোনে আগে paired থাকলে সেই account/device থেকে remove হয়েছে কিনা নিশ্চিত করুন।

Support callout:

**“তবুও কাজ না করলে নিজে বারবার reset না করে আমাদের WhatsApp-এ model name ও সমস্যার ছোট ভিডিও পাঠান।”**

Support CTA:

- WhatsApp: **+880 1814-575428** — বর্তমান product page-এ ব্যবহৃত নম্বর
- Phone: **+880 1609-596652** — বর্তমান product page-এ ব্যবহৃত নম্বর

**Number consistency fix:** সাইটের footer ও product page-এ phone numbers আলাদা দেখা যাচ্ছে। একটি primary WhatsApp এবং একটি primary call number নির্ধারণ করে সব জায়গায় একই রাখুন।

Reset-এর exact button/battery procedure actual E103 এবং BC110 manual দিয়ে verify করুন; generic instructionকে final instruction হিসেবে publish করবেন না।

---

## 10. Reviews: multiple image column grid

### Heading

**“যারা ব্যবহার করেছেন, তারা কী বলছেন?”**

Recommended layout:

- Desktop: 3-column masonry grid
- Mobile: 2-column compact grid
- প্রতি review tile: customer image/screenshot, 1–2 line quote, first name বা initials, product badge
- শুরুতে 6টি review; “আরও review দেখুন” expand interaction

Review copy কখনো বানিয়ে লিখবেন না। Real customer permission নিয়ে screenshot/image ব্যবহার করুন এবং প্রয়োজন হলে order details/phone number blur করুন।

Useful review categories:

- Setup সহজ
- iPhone/Android compatibility
- Key/wallet use case
- Delivery experience
- Support experience

Reviews-এর ঠিক নিচে CTA দিন:

**“অন্যরা ব্যবহার করছেন—এবার আপনার প্রয়োজনের tracker বেছে নিন”**

---

## 11. Return policy section

এই section-এ dense legal paragraph নয়; 3-step expectation দিন।

### Heading

**“কোনো সমস্যা হলে কী হবে?”**

Cards:

1. **Delivery-এর সময় check করুন** — package গ্রহণের আগে কী কী check করা যাবে তা বলুন।
2. **Issue document করুন** — unboxing video, order ID এবং সমস্যার ছবি/video দরকার কিনা লিখুন।
3. **Support-এ যোগাযোগ করুন** — কত ঘণ্টা/দিনের মধ্যে জানাতে হবে এবং কোন channel ব্যবহার করতে হবে লিখুন।

Return policy-তে স্পষ্ট করুন:

- Change-of-mind return আছে কি না
- Used/activated device returnযোগ্য কি না
- Damaged/defective item-এর procedure
- Delivery charge কে বহন করবে
- Replacement বনাম refund-এর নিয়ম

CTA: **“Return policy বিস্তারিত দেখুন”** — existing policy page-এ link.

---

## 12. Final CTA section

Dark page-এর শেষে brighter gradient panel ব্যবহার করুন।

Headline:

**“আজ থেকেই আপনার দরকারি জিনিসগুলোকে trackable করে রাখুন”**

Subheadline:

**একটি নিন, অথবা iPhone ও Android ব্যবহারের জন্য দুটিই নিন—প্রতিটি মাত্র ৳৯৯৯।**

Primary CTA:

**“আমার tracker বেছে নিয়ে অর্ডার করুন”**

Secondary:

**“WhatsApp-এ প্রশ্ন করুন”**

Final trust row:

`Cash on Delivery` · `Fast delivery` · `Original product` · `Support available`

---

## 13. Recommended page order

```text
1. Sticky mobile header + progress/CTA
2. Hook question hero
3. Product selection cards
4. Dynamic selected-products + quantity panel
5. Warranty / why Sheii Shop
6. Use cases / benefits
7. iPhone + Android setup video and steps
8. Product comparison: “কোনটা আপনার জন্য?”
9. Reset / troubleshooting
10. Customer reviews image grid
11. Return policy
12. FAQ
13. Final CTA
14. Existing checkout popup
```

### Why this order works

প্রথমে choice এবং price পরিষ্কার হয়; তারপর trust আসে; এরপর product education ও objection handling হয়; সবশেষে social proof, policy এবং final CTA purchase risk কমায়। Setup video product card-এর একদম আগে দিলে initial selection দেরি হতে পারে, তাই তা cards-এর পরে রাখা ভালো।

---

## 14. Product comparison block

Long specification table-এর বদলে 5-row comparison রাখুন:

| বিষয় | Borofone BC110 | HOCO E103 |
|---|---|---|
| Best for | Clean white everyday tracker | Black tracker with silicone protection |
| Color | White | Black |
| Included accessory | Standard package contents | Silicone cover included |
| iPhone + Android | Yes | Yes |
| Battery | Publish only verified spec | Publish only verified spec |
| Price | ৳৯৯৯ | ৳৯৯৯ |

Bottom line:

**“দুটিই নিতে চাইলে দুটো card select করুন—quantity আলাদা করে ঠিক করা যাবে।”**

---

## 15. Mobile-first details

- Bottom sticky bar: `Selected: 0` + **“বেছে নিন”**; selection হলে **“Checkout”**.
- Sticky bar যেন content ঢেকে না রাখে; safe-area padding রাখুন।
- Minimum tap target 44px.
- Text size: body 16–17px, button 16px, heading 28–36px mobile.
- Cards, video, review images lazy-load করুন।
- Hero image WebP/AVIF এবং compressed রাখুন।
- FAQ/step sections accordion করুন।
- Buttons-এ শুধু “Order Now” না লিখে destination-specific copy ব্যবহার করুন: **“এই tracker-টি বেছে নিন”**, **“Quantity নিশ্চিত করে checkout-এ যান”**.

---

## 16. Analytics and experiment plan

Track these events:

- `hero_cta_click`
- `product_card_view`
- `product_selected` with product ID
- `product_deselected`
- `quantity_changed`
- `setup_video_play`
- `comparison_expanded`
- `whatsapp_click`
- `checkout_opened`
- `checkout_completed`
- `return_policy_opened`

First A/B tests:

1. Hook question A vs. “কোনো জিনিস হারালে আর খুঁজে বেড়াবেন না” benefit headline
2. Product cards-এর আগে trust strip বনাম cards-এর পরে trust strip
3. Hero CTA “tracker বেছে নিন” বনাম “দুটো product দেখুন”

Primary success metric হবে **checkout completed per landing-page visitor**, শুধু card click নয়।

---

## 17. Pre-launch checklist

- [ ] Hoco model E101 বনাম E103 discrepancy resolved
- [ ] Borofone white unit and HOCO black unit physically checked
- [ ] HOCO E103 silicone cover is included in every sellable package
- [ ] দুই product-এর exact image and SKU checked
- [ ] iOS/Android app naming verified on current OS versions
- [ ] Pairing video recorded from actual product
- [ ] Reset process verified from manual/sample
- [ ] Warranty duration and exclusions published
- [ ] Return policy linked and consistent
- [ ] Certificate authentic, legible, and applicable to claimed brand
- [ ] WhatsApp and phone numbers consistent across page/footer
- [ ] Price, stock, discount, delivery fee confirmed
- [ ] Existing checkout popup accepts multiple selected products and quantities
- [ ] Mobile sticky CTA tested on Android and iPhone
- [ ] Real customer review permissions and privacy blur completed

---

## 18. Short sample copy set

**Hero H1:**

> জিনিস হারানোর আগে—একবার tracker বেছে নিন

**Hero subheadline:**

> চাবি, ওয়ালেট, ব্যাগ বা লাগেজ—ফোন থেকেই খুঁজে পাওয়ার সহজ সমাধান। দুটিই iPhone ও Android support করে; পার্থক্য হলো **Borofone সাদা**, আর **HOCO E103 কালো এবং silicone cover-সহ**।

**Selection heading:**

> কোন tracker আপনার জন্য?

**Selection helper:**

> Compatibility নিয়ে চিন্তা নেই—দুটিই iPhone ও Android support করে। আপনার পছন্দ অনুযায়ী **সাদা Borofone** বা **কালো HOCO silicone cover-সহ** বেছে নিন।

**Benefit heading:**

> ছোট ডিভাইস, বড় নিশ্চিন্তি

**Trust CTA:**

> Original product ও support সহ অর্ডার করুন

**Final CTA:**

> আপনার প্রয়োজনের tracker আজই বেছে নিন — ৳৯৯৯/টি

---

### Reference notes

- Existing Borofone page inspected: https://www.sheiishop.com/product/borofone-bc110-smart-finder-tag-works-with-ios-android-devices
- Existing Sheii Shop homepage inspected: https://www.sheiishop.com/
- Hoco E103 external specification cross-check: https://phonehublb.com/products/anti-lost-bluetooth-tracker-hoco-e103-dual

External product pages are useful for preliminary reference only. Final technical claims should be checked against the exact stock, packaging, manual, and test device that Sheii Shop will ship.
