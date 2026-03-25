import LegalPageLayout from "./LegalPageLayout";

const sections = [
  {
    title: "Acceptance of Terms",
    paragraphs: [
      "By accessing or using TalentProbe, you agree to be bound by these Terms and Conditions and all applicable laws.",
      "If you do not agree to these terms, you must stop using the service.",
    ],
  },
  {
    title: "Service Scope",
    paragraphs: [
      "TalentProbe provides AI-assisted resume analysis and related career tools. Outputs are informational and should not be considered employment, legal, or financial advice.",
      "We may update, suspend, or discontinue features at any time for maintenance, security, or product changes.",
    ],
  },
  {
    title: "User Responsibilities",
    paragraphs: [
      "You are responsible for the accuracy, legality, and ownership rights of content you upload, including resume files and job descriptions.",
      "You must not misuse the platform, attempt unauthorized access, interfere with system operation, or violate applicable laws.",
    ],
  },
  {
    title: "Payments and Plans",
    paragraphs: [
      "Paid plans and package limits are governed by the pricing terms shown at purchase. Fees may be updated prospectively.",
      "Refund treatment is governed by our Refund Policy and applicable consumer protection law.",
    ],
  },
  {
    title: "Limitation of Liability",
    paragraphs: [
      "To the maximum extent permitted by law, Taleef Technologies is not liable for indirect, incidental, special, consequential, or punitive damages arising from service use.",
      "Our total liability for claims related to the service is limited to the amount paid by you for the relevant billing period, unless otherwise required by law.",
    ],
  },
  {
    title: "Termination",
    paragraphs: [
      "We may suspend or terminate accounts for fraud, abuse, legal non-compliance, or material breach of these terms.",
      "You may stop using the service at any time and request account closure according to our support process.",
    ],
  },
  {
    title: "Governing Law",
    paragraphs: [
      "These terms are governed by the laws of the United Arab Emirates, unless a different mandatory law applies in your jurisdiction.",
      "Any dispute will be subject to the competent courts as determined by applicable law and contractual enforceability.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout
      title="Terms and Conditions"
      effectiveDate="March 25, 2026"
      lastUpdated="March 25, 2026"
      intro="These Terms and Conditions set the rules for access to and use of TalentProbe services provided by Taleef Technologies."
      sections={sections}
    />
  );
}
