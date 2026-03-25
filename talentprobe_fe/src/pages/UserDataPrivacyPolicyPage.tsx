import LegalPageLayout from "./LegalPageLayout";

const sections = [
  {
    title: "Data Categories",
    paragraphs: [
      "User data includes profile details, authentication identifiers, resume files, generated analysis outputs, and platform usage records.",
      "Sensitive fields are minimized where possible and processed only when required to provide product functionality.",
    ],
  },
  {
    title: "Purpose Limitation",
    paragraphs: [
      "User data is used only for account operations, resume intelligence features, service quality, customer support, and legitimate legal compliance needs.",
      "We do not use your resume content to train external public AI models without explicit authorization.",
    ],
  },
  {
    title: "Access Control",
    paragraphs: [
      "Access to user data is restricted to authorized personnel and systems with business need and role-based controls.",
      "We apply authentication, audit logging, and internal access governance to reduce unauthorized access risks.",
    ],
  },
  {
    title: "Storage and Transfer",
    paragraphs: [
      "Data may be stored and processed in jurisdictions where our providers operate, with contractual safeguards where required.",
      "When cross-border transfers apply, we use reasonable protections aligned with applicable privacy regulations.",
    ],
  },
  {
    title: "Deletion and Requests",
    paragraphs: [
      "You may request deletion of your account and associated data, subject to retention obligations for legal, tax, security, or dispute purposes.",
      "Submit requests to info@taleeftech.com and allow reasonable verification and response time.",
    ],
  },
];

export default function UserDataPrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="User Data Privacy Policy"
      effectiveDate="March 25, 2026"
      lastUpdated="March 25, 2026"
      intro="This User Data Privacy Policy provides additional detail on how Taleef Technologies governs, protects, and manages user data within TalentProbe."
      sections={sections}
    />
  );
}
