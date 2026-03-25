import LegalPageLayout from "./LegalPageLayout";

const sections = [
  {
    title: "General Refund Terms",
    paragraphs: [
      "Subscription and package purchases are billed according to the plan details shown at checkout.",
      "Refund requests are reviewed case by case and are not automatically guaranteed unless required by applicable law.",
    ],
  },
  {
    title: "Eligibility for Refund Review",
    paragraphs: [
      "You may request a refund if you were charged incorrectly, billed multiple times in error, or experienced a material service failure not resolved by support.",
      "Requests should be submitted within 7 calendar days of the original charge, including account email, payment reference, and issue summary.",
    ],
  },
  {
    title: "Non-Refundable Cases",
    paragraphs: [
      "Refunds are generally not provided for partial use, unused remaining period, change of mind, or issues caused by user-side connectivity or device limitations.",
      "Where digital services have already been substantially delivered, refunds may be limited as permitted by law.",
    ],
  },
  {
    title: "How to Request a Refund",
    paragraphs: [
      "To request a refund, contact info@taleeftech.com with the subject line Refund Request and include relevant transaction details.",
      "We aim to respond within 5 business days and communicate outcome, rationale, and next steps.",
    ],
  },
  {
    title: "Chargebacks",
    paragraphs: [
      "Please contact us first before initiating a payment dispute with your bank or card provider so we can attempt to resolve your issue promptly.",
      "Fraudulent or abusive chargeback behavior may result in account suspension or termination, subject to applicable law.",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund Policy"
      effectiveDate="March 25, 2026"
      lastUpdated="March 25, 2026"
      intro="This Refund Policy describes how billing disputes and refund requests are handled for TalentProbe services and packages."
      sections={sections}
    />
  );
}
