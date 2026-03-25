import LegalPageLayout from "./LegalPageLayout";

const sections = [
  {
    title: "Information We Collect",
    paragraphs: [
      "We collect account and profile data you provide, such as your name, email address, and resume content uploaded to the platform.",
      "We also collect technical usage information including IP address, browser information, device type, and activity logs to maintain security and improve service performance.",
    ],
  },
  {
    title: "How We Use Information",
    paragraphs: [
      "We use your information to provide TalentProbe services, including resume analysis, ATS checks, profession analysis, and account management.",
      "We may use aggregated and de-identified analytics to improve product quality, reliability, and user experience.",
    ],
  },
  {
    title: "Data Sharing",
    paragraphs: [
      "We do not sell your personal data. We may share data with trusted infrastructure and service providers only as necessary to operate the platform.",
      "We may disclose information when required by law, regulation, legal process, or to protect our legal rights, users, and systems.",
    ],
  },
  {
    title: "Data Retention and Security",
    paragraphs: [
      "We retain data only as long as needed for service delivery, legal obligations, and dispute resolution.",
      "We use commercially reasonable administrative, technical, and organizational safeguards to protect personal data, but no system can be fully secure.",
    ],
  },
  {
    title: "Your Rights",
    paragraphs: [
      "Subject to applicable law, you may request access, correction, deletion, or restriction of your personal data.",
      "To exercise rights or privacy requests, contact us at info@taleeftech.com.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      effectiveDate="March 25, 2026"
      lastUpdated="March 25, 2026"
      intro="This Privacy Policy explains how Taleef Technologies collects, uses, stores, and protects personal information when you use TalentProbe."
      sections={sections}
    />
  );
}
