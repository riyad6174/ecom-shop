# BulkSMSBD SMS API Documentation

## Overview

BulkSMSBD provides REST APIs for sending SMS messages and checking account balance. The API supports both **GET** and **POST** requests.

---

# Base URL

```text
http://bulksmsbd.net/api/
```

---

# Authentication

Every API request requires an API Key.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `api_key` | Yes | Your assigned API Key |

**Example**

```text
PH7HSfBBakv0S569DcUK
```

---

# Send SMS API

## Endpoint

```http
GET  /api/smsapi
POST /api/smsapi
```

### API URL

```text
http://bulksmsbd.net/api/smsapi
```

### Sample Request

```text
http://bulksmsbd.net/api/smsapi?api_key=PH7HSfBBakv0S569DcUK&type=text&number=8801712345678&senderid=SHEII SHOP&message=Hello
```

---

## Request Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `api_key` | Yes | API Key | `PH7HSfBBakv0S569DcUK` |
| `type` | Yes | SMS Type | `text` |
| `senderid` | Yes | Approved Sender ID | `SHEII SHOP` |
| `number` | Yes | Recipient mobile number | `88017XXXXXXXX` |
| `message` | Yes | SMS message body (URL Encode special characters) | `Hello%20World` |
| `messages` | Yes (Many SMS API) | Multiple recipients and messages in the required format | Refer to Many SMS Format |

---

# Phone Number Format

Use international format without the **+** sign.

**Valid Examples**

```text
8801712345678
8801812345678
8801912345678
```

Multiple recipients:

```text
8801712345678,8801812345678,8801912345678
```

---

# URL Encoding

Special characters must be URL encoded.

| Character | Encoded |
|-----------|----------|
| Space | `%20` |
| `&` | `%26` |
| `$` | `%24` |
| `@` | `%40` |

Example

```
Hello & Welcome
```

becomes

```
Hello%20%26%20Welcome
```

---

# OTP SMS Template

For OTP delivery, use the following format:

```text
Your {Brand Name} OTP is XXXX
```

### Example

```text
Your SHEII SHOP OTP is 4567
```

---

# Order Confirmation SMS Templates

All templates are designed to remain within the standard **160-character** SMS limit.

### Recommended Template

```text
Thank you for your order from {Brand}. Order #{OrderID} received. Total: ৳{Amount}. We'll confirm and process it soon.
```

### Alternative 1

```text
Your order has been received by {Brand}. Order #{OrderID}. Total Amount: ৳{Amount}. Thank you for shopping with us.
```

### Alternative 2

```text
Thanks for choosing {Brand}! We've received your order #{OrderID}. Total: ৳{Amount}. We'll update you once it's confirmed.
```

### Alternative 3

```text
{Brand}: Order #{OrderID} received. Total: ৳{Amount}. Thank you! We'll contact you shortly.
```

### Alternative 4

```text
Dear Customer, your order #{OrderID} has been received by {Brand}. Total Amount: ৳{Amount}. Thank you for your purchase.
```

---

# Credit Balance API

## Endpoint

```http
GET  /api/getBalanceApi
POST /api/getBalanceApi
```

### API URL

```text
http://bulksmsbd.net/api/getBalanceApi
```

### Sample Request

```text
http://bulksmsbd.net/api/getBalanceApi?api_key=PH7HSfBBakv0S569DcUK
```

---

# Response Codes

## Success

| Code | Description |
|------|-------------|
| **202** | SMS Submitted Successfully |

---

## Error Codes

| Code | Description |
|------|-------------|
| 1001 | Invalid Number |
| 1002 | Sender ID is incorrect or disabled |
| 1003 | Required fields are missing |
| 1005 | Internal Error |
| 1006 | Balance validity not available |
| 1007 | Insufficient balance |
| 1011 | User ID not found |
| 1012 | Masking SMS must be sent in Bengali |
| 1013 | No gateway found for this Sender ID using the provided API Key |
| 1014 | Sender Type Name not found using this Sender ID |
| 1015 | No valid gateway found for this Sender ID |
| 1016 | Active price information not found for this Sender Type |
| 1017 | Price information not found for this Sender Type |
| 1018 | Account owner is disabled |
| 1019 | Sender Type pricing is disabled for this account |
| 1020 | Parent account not found |
| 1021 | Parent account's active Sender Type pricing not found |
| 1031 | Account not verified. Please contact Administrator |
| 1032 | IP address is not whitelisted |

---

# Supported Integration Formats

| Technology | One to Many | Many to Many |
|------------|:-----------:|:------------:|
| JSON | ✅ | ✅ |
| PHP | ✅ | ✅ |
| Oracle | ✅ | ❌ |
| C# .NET | ✅ | ✅ |

---

# Example API Request

```http
GET http://bulksmsbd.net/api/smsapi?api_key=PH7HSfBBakv0S569DcUK&type=text&number=8801712345678&senderid=SHEII%20SHOP&message=Your%20SHEII%20SHOP%20OTP%20is%204567
```

---

# API Summary

| API | Method | Description |
|-----|--------|-------------|
| `/api/smsapi` | GET, POST | Send SMS |
| `/api/getBalanceApi` | GET, POST | Check SMS Credit Balance |

---

# Best Practices

- Always URL encode your message content.
- Use international phone numbers beginning with **880**.
- Ensure the Sender ID is approved before sending SMS.
- Keep transactional SMS within **160 characters** whenever possible.
- Use the recommended OTP format:
  ```
  Your {Brand Name} OTP is XXXX
  ```
- Use the recommended order confirmation format:
  ```
  Thank you for your order from {Brand}. Order #{OrderID} received. Total: ৳{Amount}. We'll confirm and process it soon.
  ```