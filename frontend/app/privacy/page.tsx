import Header from "../components/Header";
import Footer from "../components/Footer";

const toc = [
  { id: "introduction", label: "Introduction" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use", label: "How We Use Information" },
  { id: "cookies", label: "Cookies and Tracking" },
  { id: "sharing", label: "Sharing of Information" },
  { id: "security", label: "Security" },
  { id: "your-rights", label: "Your Rights" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Us" },
];

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header activeList={{ privacy: true }} />
      <div className="flex-1 flex justify-center items-start py-12 px-4">
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-center">
            Privacy Policy
          </h1>
          <p className="text-center text-sm text-gray-500 mb-6">
            Last updated: July 12, 2025
          </p>

          {/* Table of Contents */}
          <nav className="mb-6">
            <ol className="flex flex-wrap justify-center space-x-4 text-sm text-blue-700">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="hover:underline">
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sections */}
          <section id="introduction" className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Introduction</h2>
            <p className="text-gray-700">
              At Adey, we respect your privacy and are committed to protecting
              your personal information. This policy describes how we collect,
              use, and safeguard your data.
            </p>
          </section>

          <section id="information-we-collect" className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">
              Information We Collect
            </h2>
            <p className="text-gray-700">
              We collect information you provide directly, such as name, email,
              payment details, business name, logo, description, and files you
              upload, as well as automatically collected data like IP addresses
              and usage metrics.
            </p>
          </section>

          <section id="how-we-use" className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">
              How We Use Information
            </h2>
            <p className="text-gray-700">
              Your information is used to provide and improve our Service,
              communicate updates, process payments, and comply with legal
              obligations.
            </p>
          </section>
          <section id="cookies" className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">
              Cookies and Tracking
            </h2>
            <p className="text-gray-700">
              We use cookies solely to support secure authentication both for
              email/password logins and Google OAuth. We do not deploy any
              analytics, marketing, or personalization cookies, nor do we track
              your behavior. You can manage any cookie preferences in your
              browser settings.
            </p>
          </section>

          <section id="sharing" className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">
              Sharing of Information
            </h2>
            <p className="text-gray-700">
              We do not sell, rent, or lease your personal information to any
              third parties. We only disclose your data when required by law.
            </p>
          </section>

          <section id="security" className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Security</h2>
            <p className="text-gray-700">
              We implement reasonable security measures to protect your
              information, though no method is 100% secure.
            </p>
          </section>

          <section id="your-rights" className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Your Rights</h2>
            <p className="text-gray-700">
              You have the right to access, correct, or delete your personal
              data, and to object to or restrict certain processing activities.
            </p>
          </section>

          <section id="changes" className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">
              Changes to This Policy
            </h2>
            <p className="text-gray-700">
              We may update this policy periodically. We will notify you of
              significant changes by updating the "Last updated" date.
            </p>
          </section>

          <section id="contact" className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:contact@adey-chatbot.website"
                className="text-blue-700 hover:underline"
              >
                contact@adey-chatbot.website
              </a>
              .
            </p>
          </section>

          <div className="text-right">
            <a href="#" className="text-sm text-blue-700 hover:underline">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
