# Twilio toll-free verification — resubmission pack (2026-10-24)
Number: +1 833-635-4687. Reviewed by independent qa-critic: "likely approve, no blockers". Evidence live at commit 1a6040c.

- Business legal name: Yardboat LLC
- Brand / DBA: Not Buying
- Website: https://notbuying.org
- Business email: hello@notbuying.org
- Use case category: Account Notifications (only this one)
- Estimated monthly volume: 1,000
- Opt-in type: Web Form
- Opt-in URL: https://notbuying.org/sms
- Opt-in image URL: https://notbuying.org/sms/opt-in.png
- Privacy policy URL: https://notbuying.org/privacy
- Terms URL: https://notbuying.org/terms

Use case description:
Not Buying (notbuying.org), operated by Yardboat LLC, helps people track purchases they chose not to make. Users who opt in text an item and price (e.g. "croissant 5"). We reply with a receipt showing progress toward their personal savings goal and a suggested 10% pledge to a charity they picked. We also send a one-time code to confirm the number when texts are turned on, one confirmation message after that, and one weekly recap every Sunday (an MMS card plus a link to their dashboard on notbuying.org). We send no marketing or promotional messages. No payments or donations are taken by text: any donation is made by the user on Every.org's secure HTTPS site. Texting is optional, and the full service works on the website. Recipients are US consumers who opt in on our web form.

Opt-in workflow description:
On the sign-up form at https://notbuying.org, below the mobile number field, is a separate, optional, unticked checkbox under the heading "Text messages (optional)". Its label reads: "Yes, text me. I agree to receive recurring automated text messages from Not Buying at the number above: replies to the items I log, a one-time code to confirm my number and a weekly Sunday recap. Consent is not required to use Not Buying. Message frequency varies (about 2-10 per week). Msg & data rates may apply. Reply HELP for help, STOP to opt out." An SMS Terms link sits beside the checkbox, and Terms and Privacy Policy links sit by the button. Accepting the Terms and Privacy Policy is a separate line and does not enroll anyone in texts. Users can create an account without ticking the box. When the box is ticked, we text a one-time code. Recurring messages start only after the user enters it, followed by a confirmation message. Users can also turn texts on or off from their dashboard with the same wording. Full details and a screenshot: https://notbuying.org/sms

Sample message 1:
Not Buying: No croissant. +$5. Bike: $155 of $500 (31%). $0.50 pledged to Feeding America (~5 meals). Every no is a yes to something.

Sample message 2:
Not Buying, Issue 03. $86 not spent, $8.60 to give. Send the difference + see your dashboard: https://notbuying.org/in/abc123

Sample message 3:
Not Buying: your code is 482913. Enter it to turn on texts. Msg & data rates may apply. Reply STOP to opt out.

Opt-in confirmation (if asked):
Not Buying: texts are on. Text what you skipped + price (croissant 5) for a receipt, plus a recap every Sunday. About 2-10 msgs/week. Msg & data rates may apply. Reply HELP for help, STOP to opt out.

HELP reply (if asked):
Not Buying: text what you skipped + price (croissant 5). Also: totals, undo, new goal bike 500, dashboard. Help: hello@notbuying.org. Msg&data rates may apply. STOP to opt out.
