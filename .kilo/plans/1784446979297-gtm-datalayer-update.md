# GTM Datalayer Update Plan

## Goal
Replace existing GTM container ID `GTM-MJXWJ24V` with `GTM-5V6SWB8R` and add missing ecommerce datalayer events: `select_item`, `view_cart`, `remove_from_cart`.

---

## Task 1: Swap GTM Container ID

**File**: `src/pages/_document.js`

Replace the Stape custom loader with the standard Google Tag Manager loader and update the noscript iframe to use the new container `GTM-5V6SWB8R`.

- Line 18: Replace the entire inline script with the standard GTM snippet pointing to `https://www.googletagmanager.com/gtm.js?id=GTM-5V6SWB8R`
- Line 28: Replace `GTM-MJXWJ24V` with `GTM-5V6SWB8R` in the noscript iframe `src` and change domain to `googletagmanager.com`

---

## Task 2: Add `select_item` event to ProductCard

**File**: `src/components/product/ProductCard.jsx`

When a user clicks any link in a ProductCard to navigate to a product detail page, push a `select_item` event.

**Implementation**: Convert to using a click handler on the Link elements that:
1. Prevents default navigation only briefly to push the event
2. Pushes `select_item` to dataLayer
3. Then navigates via `router.push()`

```js
import { sendGTMEvent } from '@next/third-parties/google';
import { useRouter } from 'next/router';

const handleProductClick = (e) => {
  e.preventDefault();
  const slug = product?.slug;
  sendGTMEvent({ ecommerce: null });
  sendGTMEvent({
    event: 'select_item',
    ecommerce: {
      items: [{
        item_id: product.id || product._id || 'unknown',
        item_name: product.title || 'unknown',
        price: price || 0,
        item_category: product.category || 'General',
        item_list_name: 'Product List',
      }],
    },
  });
  router.push(`/product/${slug}`);
};
```

Apply to both the image `<Link>` (line 15) and the title `<Link>` (line 42) and the "Order Now" `<Link>` (line 71). Use the same handler function on all three.

---

## Task 3: Add `view_cart` event on cart icon click

**File**: `src/components/common/Navbar.jsx`

When the cart icon is clicked (opening OrderDialog), push a `view_cart` event if the cart is not empty.

Implementation: Wrap the existing `setIsOrderDialogOpen(true)` in a handler:

```js
const handleCartOpen = () => {
  if (cartItems.length > 0) {
    sendGTMEvent({ ecommerce: null });
    sendGTMEvent({
      event: 'view_cart',
      ecommerce: {
        currency: 'BDT',
        value: cartItems.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0),
        items: cartItems.map((item) => ({
          item_id: item.id || 'unknown',
          item_name: item.title || 'unknown',
          price: item.price || 0,
          quantity: item.quantity || 1,
          item_variant: item.selectedColor || item.selectedVariantValue,
          item_category: item.category || 'Accessories',
        })),
      },
    });
  }
  setIsOrderDialogOpen(true);
};
```

Apply to both desktop (line 64 `onClick`) and mobile (line 102 `onClick`) cart buttons.

---

## Task 4: Add `remove_from_cart` event

### 4a: CartCard component

**File**: `src/components/checkout/CartCard.jsx`

In `handleRemove`, push `remove_from_cart` event before dispatching the removal:

```js
const handleRemove = () => {
  sendGTMEvent({ ecommerce: null });
  sendGTMEvent({
    event: 'remove_from_cart',
    ecommerce: {
      currency: 'BDT',
      value: (item.price || 0) * (item.quantity || 1),
      items: [{
        item_id: item.id || 'unknown',
        item_name: item.title || 'unknown',
        price: item.price || 0,
        quantity: item.quantity || 1,
        item_variant: item.selectedColor || item.selectedVariantValue,
        item_category: item.category || 'Accessories',
      }],
    },
  });
  dispatch(removeFromCart({ ... }));
};
```

### 4b: OrderDialog remove handler

**File**: `src/components/checkout/OrderDialog.jsx`

Find the `removeFromCart` dispatch call and add the same `remove_from_cart` event push before it. Check line 409 area in the dialog's render where individual cart items show a remove button.

---

## Task 5: Verify existing events are correct

All existing `view_item`, `add_to_cart`, `begin_checkout`, and `purchase` events already use proper GA4 ecommerce schema (`items` array, `currency`, `value`, `transaction_id` on purchase). No schema changes needed — just verify they remain functional after the GTM ID swap.

---

## Files to Modify
1. `src/pages/_document.js` — swap GTM container ID
2. `src/components/product/ProductCard.jsx` — add `select_item`
3. `src/components/common/Navbar.jsx` — add `view_cart` on cart icon
4. `src/components/checkout/CartCard.jsx` — add `remove_from_cart`
5. `src/components/checkout/OrderDialog.jsx` — add `remove_from_cart` in the remove handler

---

## Open Question
The `_document.js` inline script and noscript will switch from Stape custom loader to the standard Google Tag Manager snippet (`googletagmanager.com/gtm.js`) with `GTM-5V6SWB8R`.
