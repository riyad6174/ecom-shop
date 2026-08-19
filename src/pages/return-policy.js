import Head from 'next/head';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import React from 'react';

function ReturnPolicy() {
  return (
    <>
      <Head>
        <title>Return &amp; Refund Policy | Sheii Shop</title>
        <meta
          name='description'
          content='Read Sheii Shop’s Return & Refund Policy — learn about our 7-day return and exchange conditions, eligible products, delivery charges, and refund methods.'
        />
        <meta
          name='keywords'
          content='Sheii Shop return policy, refund policy, exchange policy, Sheii Shop returns'
        />
        <meta name='robots' content='index, follow' />
        <link rel='canonical' href='https://www.sheiishop.com/return-policy' />

        <meta property='og:type' content='website' />
        <meta property='og:title' content='Return & Refund Policy | Sheii Shop' />
        <meta
          property='og:description'
          content='Learn about Sheii Shop’s 7-day return, exchange, and refund policy for wrong, defective, or damaged products.'
        />
        <meta
          property='og:image'
          content='https://www.sheiishop.com/assets/logo.png'
        />
        <meta
          property='og:url'
          content='https://www.sheiishop.com/return-policy'
        />
        <meta property='og:site_name' content='Sheii Shop' />

        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content='Return & Refund Policy | Sheii Shop' />
        <meta
          name='twitter:description'
          content='Learn about Sheii Shop’s 7-day return, exchange, and refund policy.'
        />
        <meta
          name='twitter:image'
          content='https://www.sheiishop.com/assets/logo.png'
        />

        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: 'Return & Refund Policy',
              url: 'https://www.sheiishop.com/return-policy',
              isPartOf: {
                '@type': 'WebSite',
                name: 'Sheii Shop',
                url: 'https://www.sheiishop.com',
              },
            }),
          }}
        />
      </Head>

      <div>
        <Navbar />

        <div className='max-w-screen-lg mx-auto px-5 py-16 text-gray-700 leading-relaxed [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_li]:mb-2 [&_strong]:text-gray-900'>
          <h1 className='text-3xl sm:text-4xl font-bold mb-8'>
            Return &amp; Refund Policy
          </h1>

          <p>
            At <strong>Sheii Shop</strong>, we want our customers to have a
            reliable and satisfactory shopping experience. If you receive a
            wrong, defective, or damaged product, you may request a return or
            exchange within <strong>7 days of receiving your order</strong>,
            subject to the conditions below.
          </p>

          <h2>1. Return &amp; Exchange Period</h2>
          <p>
            Customers may request a return or exchange within{' '}
            <strong>7 days from the date of delivery</strong>.
          </p>
          <p>
            After 7 days, return or exchange requests may not be accepted
            unless otherwise covered by a specific warranty or agreement.
          </p>

          <h2>2. Products Eligible for Return or Exchange</h2>
          <p>A product may be eligible for return or exchange if:</p>
          <ul>
            <li>
              You received the <strong>wrong product or wrong variant</strong>{' '}
              compared with your order.
            </li>
            <li>
              The product is <strong>not working as expected</strong> or
              appears to have a manufacturing/product defect.
            </li>
            <li>The product was <strong>damaged during delivery</strong>.</li>
            <li>
              The product has no physical or water damage caused by the
              customer after delivery.
            </li>
            <li>
              The product is returned with its original packaging,
              accessories, manuals, and other included items where
              applicable.
            </li>
          </ul>
          <p>
            For products reported as defective or not working as expected,{' '}
            <strong>Sheii Shop may inspect and test the product first</strong>{' '}
            before approving a return, replacement, or exchange.
          </p>

          <h2>3. Products Damaged During Delivery</h2>
          <p>
            If your product is damaged during delivery, please contact Sheii
            Shop as soon as possible.
          </p>
          <p>
            If the damage is confirmed to have occurred during delivery,{' '}
            <strong>
              Sheii Shop will arrange an exchange/replacement and will bear
              the applicable delivery cost
            </strong>
            .
          </p>
          <p>
            Customers may be asked to provide photographs, videos, or other
            evidence of the condition of the package and product.
          </p>
          <p>
            We strongly recommend checking your package and product
            immediately after delivery and keeping the packaging until the
            issue is resolved.
          </p>

          <h2>4. Wrong Product or Wrong Variant</h2>
          <p>
            If you receive a product or variant different from what you
            ordered, please contact us within the 7-day return period.
          </p>
          <p>For verification, customers may be asked to provide:</p>
          <ul>
            <li>Clear photographs of the received product and packaging; and/or</li>
            <li>A video call with our support team to verify the product.</li>
          </ul>
          <p>
            Once the issue is confirmed, Sheii Shop will arrange an
            appropriate exchange or replacement.
          </p>

          <h2>5. Defective or Non-Working Products</h2>
          <p>
            If a product does not work as expected, please contact us within
            7 days.
          </p>
          <p>
            Our team may first provide troubleshooting assistance and/or test
            the product to determine whether the issue is a genuine product
            defect.
          </p>
          <p>
            If the product is confirmed to be defective and meets our return
            conditions, we may offer an exchange, replacement, or refund
            depending on the product and circumstances.
          </p>

          <h2>6. Non-Returnable Products</h2>
          <p>
            The following products are generally{' '}
            <strong>not eligible for return or exchange</strong>:
          </p>
          <ul>
            <li>Products damaged by the customer</li>
            <li>Products with physical damage caused after delivery</li>
            <li>Products with water or liquid damage caused after delivery</li>
            <li>Broken products caused by misuse, accident, or improper handling</li>
            <li>Personal-use items</li>
            <li>Clearance or final-sale items</li>
            <li>
              Products that have been altered, modified, or tampered with by
              the customer
            </li>
            <li>
              Products missing essential accessories, parts, packaging, or
              included items, where applicable
            </li>
          </ul>

          <h2>7. Customer-Caused Damage</h2>
          <p>
            The product must not have physical or water damage caused after
            delivery.
          </p>
          <p>
            If a product is damaged, broken, misused, exposed to
            water/liquid, modified, or otherwise damaged by the customer
            after delivery, it may not qualify for return, exchange, or
            refund.
          </p>

          <h2>8. Return &amp; Exchange Delivery Charges</h2>
          <p>
            For customer-requested returns or exchanges that are not caused
            by a mistake or fault on the part of Sheii Shop,{' '}
            <strong>
              the customer is responsible for the applicable return and/or
              exchange delivery charges
            </strong>
            .
          </p>
          <p>If the return or exchange is due to:</p>
          <ul>
            <li>Sheii Shop sending the wrong product or variant; or</li>
            <li>The product being damaged during delivery,</li>
          </ul>
          <p>Sheii Shop will cover the applicable delivery cost.</p>

          <h2>9. Refund Methods</h2>
          <p>
            If a refund is approved, Sheii Shop may process the refund
            through one of the following methods, depending on the
            customer&apos;s preference and the circumstances:
          </p>
          <ul>
            <li><strong>bKash</strong></li>
            <li><strong>Nagad</strong></li>
            <li><strong>Bank transfer</strong></li>
            <li>
              <strong>Cash</strong>, if the customer visits the Sheii Shop
              office and a cash refund is approved
            </li>
          </ul>
          <p>
            Refund processing time may vary depending on the payment method
            and verification process.
          </p>

          <h2>10. Order Cancellation</h2>
          <p>
            Customers may request cancellation of an order before shipment.
          </p>
          <p>
            Once an order has been shipped, cancellation may no longer be
            possible, and the customer may need to receive the order and
            follow the applicable return policy.
          </p>
          <p>
            If an order has already been shipped, any applicable delivery or
            return charges may be deducted from the refund or may be payable
            by the customer.
          </p>

          <h2>11. How to Request a Return or Exchange</h2>
          <p>
            To request a return, exchange, or report a product issue, contact
            Sheii Shop through our official:
          </p>
          <ul>
            <li><strong>WhatsApp</strong></li>
            <li><strong>Phone</strong></li>
            <li><strong>Facebook Messenger</strong></li>
          </ul>
          <p>
            Please provide your order details and a clear description of the
            issue. Photos or videos may be requested for verification.
          </p>
          <p>
            Our support team will review the request and inform you of the
            next steps.
          </p>

          <h2>12. Important Conditions</h2>
          <ul>
            <li>
              Return or exchange requests must be made within{' '}
              <strong>7 days of delivery</strong>.
            </li>
            <li>
              Products may be inspected and tested before a return, exchange,
              or refund is approved.
            </li>
            <li>
              Customers should keep the original packaging and all included
              accessories until the issue is resolved.
            </li>
            <li>
              Approval of a return, exchange, or refund is subject to
              verification of the product&apos;s condition and the reason
              for the request.
            </li>
            <li>
              This policy applies to standard purchases and may be subject to
              specific product warranties or special terms communicated at
              the time of purchase.
            </li>
          </ul>

          <p>
            <strong>
              Sheii Shop reserves the right to inspect products and
              determine eligibility for return, exchange, or refund based on
              the conditions stated in this policy.
            </strong>
          </p>
        </div>

        <Footer />
      </div>
    </>
  );
}

export default ReturnPolicy;
