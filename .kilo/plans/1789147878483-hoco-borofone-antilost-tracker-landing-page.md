# Hoco Borofone Anti-Lost Tracker Landing Page - Implementation Plan

## Project Overview
Create a new static landing page at `/product/hoco-borofone-antilost-tracker` for a combined product with two variants:
- **Borofone BC110 — White** (Clean everyday option)
- **HOCO E103 — Black + Silicone Cover** (Protected carry option)

Both priced at ৳৯৯৯ each, same page using existing OrderDialog and GTM infrastructure.

---

## Key Decisions

| Decision | Choice |
|----------|--------|
| Page type | New static page file: `src/pages/product/hoco-borofone-antilost-tracker.js` |
| Product data | Single combined entry in `products.js` with two variants |
| GTM tracking | `view_item` for combined product on load; `add_to_cart` with selected variant |
| Images | Dummy placeholder images (to be replaced later) |

---

## Implementation Tasks

### 1. Add Combined Product to `src/utils/products.js`
- Add new product entry with:
  - `slug: 'hoco-borofone-antilost-tracker'`
  - `title: 'Hoco E103 & Borofone BC110 Anti-Lost Tracker'`
  - `price: 999`, `originalPrice: 1250` (or similar)
  - `variants`: Two entries with `type` field:
    - `{ type: 'Borofone BC110 — White' }`
    - `{ type: 'HOCO E103 — Black + Silicone Cover' }`
  - `images`: Placeholder dummy images
  - Other required fields (description, inStock, etc.)

### 2. Create New Page File: `src/pages/product/hoco-borofone-antilost-tracker.js`

#### Page Structure (following strategy document order):
1. **Sticky mobile header** + progress/CTA
2. **Hero section** - Hook question + subheadline + trust strip + CTA scroll to products
3. **Product Selection Cards** - Two selectable cards with:
   - Color/accessory badges (WHITE / BLACK + SILICONE COVER)
   - Product images (dummy placeholders)
   - Name, one-line benefit, 3 proof points
   - Price ৳৯৯৯
   - Selectable card state (cyan-violet border, check icon, "নির্বাচিত" label)
   - Full card clickable (not just checkbox)
4. **Dynamic Quantity Panel** - Animated reveal when ≥1 product selected:
   - Selected items with thumbnail, name + color/accessory, qty control (− 1 +), line total, remove
   - Subtotal, delivery charge (existing logic), dynamic total
   - Primary CTA: "Quantity নিশ্চিত করে checkout-এ যান"
5. **Warranty/Trust Section** - "কেন Sheii Shop থেকে নেবেন?"
6. **Benefits/Use Cases** - 6 visual tiles (Key, Wallet, Bag, Luggage, Bicycle, Remote)
7. **Setup Section** - iPhone/Android tabs with video placeholder + steps
8. **Product Comparison** - 5-row table (Best for, Color, Included accessory, iPhone+Android, Battery, Price)
9. **Reset/Troubleshooting** - Accordion format
10. **Reviews Grid** - Masonry grid (placeholder images)
11. **Return Policy** - 3-step cards + link
12. **FAQ** - Accordion
13. **Final CTA** - Brighter gradient panel
14. **Existing OrderDialog** - Reused as-is

#### Technical Requirements:
- Use `sendGTMEvent` for:
  - `view_item` on page load (combined product)
  - `product_selected` / `product_deselected` with product ID when cards clicked
  - `quantity_changed` when qty changes
  - `checkout_opened` when OrderDialog opens
  - `purchase` on successful order (handled by OrderDialog)
- State management:
  - `selectedProducts: Array<{variantId, quantity}>` 
  - `quantityPanelVisible: boolean`
- Reuse `OrderDialog` component exactly as-is (passes cart items)
- Add selected variants to cart via `dispatch(addToCart(...))` with correct `selectedColor`/`variantKey`

### 3. Styling & Visual Design
- Background: near-black navy `#080B14` / `#0B1020`
- Accent gradient: electric violet → cyan `#7C3AED → #06B6D4`
- Glass panels: translucent navy, 1px low-opacity border, 20-24px radius
- Font: Hind Siliguri for Bangla
- Body text: `#D9E1F2`, secondary: `#9BA8BF`
- Card selection: cyan-violet border, check icon, "নির্বাচিত" label
- Badges: WHITE (light silver chip), BLACK + SILICONE COVER (dark charcoal + thin amber outline)
- Mobile: stacked cards; Desktop: 2-column
- Sticky bottom bar on mobile: "Selected: 0" → "Checkout"

### 4. Integration Points
- **OrderDialog**: Already handles multiple cart items with quantities and variants
- **GTM**: Events already implemented in OrderDialog (`begin_checkout`, `purchase`)
- **Cart**: Redux cartSlice accepts `selectedColor`/`variantKey` - use variant type as identifier
- **Navbar/Footer**: Reuse existing components

---

## Validation Checklist

- [ ] Page accessible at `/product/hoco-borofone-antilost-tracker`
- [ ] Hero loads with hook question, scrolls to product cards on CTA click
- [ ] Two product cards display with correct badges, info, price
- [ ] Clicking anywhere on card selects/deselects it
- [ ] Quantity panel appears only when ≥1 product selected
- [ ] Quantity controls work per product, line totals update
- [ ] "Quantity নিশ্চিত করে checkout-এ যান" opens OrderDialog with correct items
- [ ] OrderDialog shows both products with correct quantities, variants, prices
- [ ] GTM events fire: view_item, product_selected, quantity_changed, begin_checkout, purchase
- [ ] Mobile sticky bar shows selection count, navigates to checkout
- [ ] All sections render per strategy document order
- [ ] Dummy images display without errors
- [ ] Responsive: mobile stacked, desktop 2-col cards
- [ ] Bangla font (Hind Siliguri) loads correctly

---

## Files to Modify/Create

1. **Modify**: `src/utils/products.js` - Add combined product entry
2. **Create**: `src/pages/product/hoco-borofone-antilost-tracker.js` - New landing page
3. **No changes needed**: OrderDialog, cartSlice, Navbar, Footer, GTM setup

---

## Out of Scope
- Real product images (use placeholders)
- Actual setup videos (use placeholder/iframe)
- Real customer reviews (use placeholder)
- Warranty duration (placeholder `[X মাস]`)
- Certificate image (placeholder)
- A/B test implementation (analytics events ready for future)