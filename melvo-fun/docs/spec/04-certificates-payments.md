# Spec 04 — Certificates and Payments

## Certificates

- Students receive a certificate when they meet the course's completion rule (set by admin: e.g. 100% progress, required tests passed, minimum average). Admin can also issue manually, and revoke with a reason.
- Each certificate has a unique **certificate code**, e.g. `MF-7K3Q-9XPA`.
- Certificate record: student name, student ID, course, completion date, certificate code, issue date, status.
- PDF certificate with the code and a QR code linking to verification.
- **Public verification without login** at `melvo.fun/verify` and `melvo.fun/verify/<code>`: shows name, partly masked student ID, course, completion date, issue date, and Valid or Revoked.
- Guests never receive certificates.

## Payments (Razorpay)

- A course can be free or paid (price in INR). Coupons can give a percentage or fixed discount.
- Visitors and logged-in users can buy a paid course.
- After successful payment, the buyer gets a **student account** (created automatically if they don't have one, with login details emailed) and a **self-paced enrollment** in that course. If they already are a student, the course is added to their account.
- Access is granted from the verified Razorpay webhook, never from the browser alone.
- Receipt or GST invoice emailed and downloadable, numbered sequentially per financial year.
- Admin can see orders, issue refunds (optionally revoking access), and manage coupons. All audit-logged.
- Required public pages: privacy policy, terms, refund and cancellation policy, contact.
