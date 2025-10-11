import Header from "../components/Header";
import Footer from "../components/Footer";

const toc = [
  { id: "definitions", label: "1. Definitions" },
  { id: "service-description", label: "2. Service Description" },
  { id: "accounts-eligibility", label: "3. Accounts & Eligibility" },
  { id: "subscription-payments", label: "4. Subscription & Payments" },
  { id: "user-content", label: "5. User-Generated Content" },
  { id: "intellectual-property", label: "6. Intellectual Property" },
  { id: "privacy-data", label: "7. Privacy & Data Protection" },
  {
    id: "disclaimers-liability",
    label: "8. Disclaimers & Limitation of Liability",
  },
  { id: "indemnification", label: "9. Indemnification" },
  { id: "changes-to-terms", label: "10. Changes to These Terms" },
  { id: "governing-law", label: "11. Governing Law & Dispute Resolution" },
  { id: "refund-policy", label: "12. Refund Policy" },
  { id: "prohibited-conduct", label: "13. Prohibited Conduct" },
  { id: "contact-info", label: "14. Contact Information" },
];

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header activeList={{ tos: true }} />
      <div className="flex-1 flex justify-center items-start py-12 px-4">
        <div className="w-full max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-center">
            Terms of Service
          </h1>
          <p className="text-center text-sm text-gray-500 mb-6">
            Last updated: June 27, 2025
          </p>

          {/* Table of Contents */}
          <nav className="mb-8">
            <ol className="flex flex-wrap justify-center space-x-6 text-sm text-blue-700">
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
          <section id="definitions" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">1. Definitions</h2>
            <ol className="space-y-2 text-gray-700 leading-relaxed">
              <li>
                <span className="font-semibold text-gray-900">"Service" </span>
                means the Adey embeddable chatbot widget and all related
                features, content, and services provided through our website or
                application.
              </li>
              <li>
                <span className="font-semibold text-gray-900">"User"</span> or{" "}
                <span className="font-semibold text-gray-900">"You"</span> means
                any individual or entity accessing or using the Service.
              </li>
              <li>
                <span className="font-semibold text-gray-900">"Content"</span>{" "}
                means any data, documents, text, images, or other materials you
                upload, submit, or make available through the Service.
              </li>
              <li>
                <span className="font-semibold text-gray-900">"Account"</span>{" "}
                means the user account you create to access and use the Service.
              </li>
              <li>
                <span className="font-semibold text-gray-900">"Free Tier"</span>
                ,{" "}
                <span className="font-semibold text-gray-900">
                  "Standard Tier"
                </span>
                , and{" "}
                <span className="font-semibold text-gray-900">
                  "Premium Tier"
                </span>{" "}
                refer to the subscription levels offering increasing numbers of
                chatbots and allowed monthly conversations.
              </li>
            </ol>
          </section>
          <section id="service-description" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              2. Service Description
            </h2>
            <p className="text-gray-700">
              Adey provides a customizable, embeddable chatbot widget that lets
              you integrate an AI-driven chat interface into your website. Your
              customers can interact with the bot to ask questions about your
              business based on the data and documents you upload. There is no
              direct user-to-user communication via the Service.
            </p>
          </section>
          <section id="accounts-eligibility" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              3. Accounts & Eligibility
            </h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>
                <b>Registration:</b> To use the Service, you must register for
                an Account by providing a valid email address and password or by
                using Google social login.
              </li>
              <li>
                <b>Security:</b> You are responsible for maintaining the
                confidentiality of your Account credentials and for all
                activities under your Account.
              </li>
              <li>
                <b>Age Requirement:</b> You must be at least 16 years old to use
                the Service. By registering, you represent and warrant that you
                meet this age requirement.
              </li>
              <li>
                <b>Suspension & Termination:</b> We may suspend or terminate
                your Account for violation of this Agreement or for any unlawful
                or abusive behavior, at our sole discretion. We will notify you
                via email when reasonably possible.
              </li>
            </ol>
          </section>
          <section id="subscription-payments" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              4. Subscription & Payments
            </h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>
                <b>Tiers:</b> The Service is offered in three tiers:
                <ul className="list-disc list-inside ml-6">
                  <li>
                    <b>Free Tier:</b> Limited number of chatbots and monthly
                    conversations at no cost.
                  </li>
                  <li>
                    <b>Standard Tier:</b> Increased limits with a recurring
                    subscription fee.
                  </li>
                  <li>
                    <b>Premium Tier:</b> Highest limits and priority support
                    with a recurring subscription fee.
                  </li>
                </ul>
              </li>
              <li>
                <b>Billing:</b> Subscriptions are billed monthly in advance via
                the payment processor you select (Google Play, Stripe, or
                PayPal). All fees are non-refundable, except as required by law.
              </li>
              <li>
                <b>Changes & Cancellations:</b> You may upgrade, downgrade, or
                cancel your subscription at any time through your Account
                settings. Changes take effect at the next billing cycle.
              </li>
            </ol>
          </section>
          <section id="user-content" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              5. User-Generated Content
            </h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>
                <b>Upload & Use:</b> You may upload documents, images, and other
                business-related files to train your chatbot. These materials
                remain your property, and we do not redistribute them to other
                users.
              </li>
              <li>
                <b>License:</b> By uploading Content, you grant us a worldwide,
                non-exclusive, royalty-free license to use, host, and process
                your Content solely to provide the Service.
              </li>
              <li>
                <b>Moderation:</b> We reserve the right to review and remove
                Content that we deem illegal, offensive, or in violation of this
                Agreement. You can report inappropriate Content via our support
                channels.
              </li>
            </ol>
          </section>
          <section id="intellectual-property" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              6. Intellectual Property
            </h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>
                <b>Our Rights:</b> All rights, title, and interest in the
                Service and its underlying technology, software, and content are
                owned by Adey or its licensors.
              </li>
              <li>
                <b>Your Rights:</b> You retain all ownership rights in the
                Content you upload. This Agreement does not transfer any
                ownership to us beyond the license described above.
              </li>
            </ol>
          </section>
          <section id="privacy-data" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              7. Privacy & Data Protection
            </h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>
                <b>Privacy Policy:</b> Our practices regarding data collection
                and use are described in our Privacy Policy at{" "}
                <a
                  href="https://www.adey-chatbot.website/privacy"
                  className="text-blue-700 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://www.adey-chatbot.website/privacy
                </a>
                .
              </li>
              <li>
                <b>Data Collected:</b> We collect personal data such as name,
                email address, payment information, business name, logo,
                description, and files you upload to your chatbot.
              </li>
            </ol>
          </section>
          <section id="disclaimers-liability" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              8. Disclaimers & Limitation of Liability
            </h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>
                <b>Disclaimer:</b> The Service is provided "as is" and "as
                available" without warranties of any kind. We disclaim all
                implied warranties, including merchantability and fitness for a
                particular purpose.
              </li>
              <li>
                <b>Limitation of Liability:</b> To the fullest extent permitted
                by law, Adey will not be liable for any indirect, incidental,
                special, consequential, or punitive damages arising from your
                use of the Service, even if advised of the possibility of such
                damages.
              </li>
            </ol>
          </section>
          <section id="indemnification" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify, defend, and hold harmless Adey and its
              officers, directors, employees, agents, and affiliates from any
              claims, liabilities, losses, damages, costs, or expenses arising
              out of or related to your use of the Service or your violation of
              this Agreement.
            </p>
          </section>
          <section id="changes-to-terms" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              10. Changes to These Terms
            </h2>
            <p className="text-gray-700">
              We may revise these Terms from time to time. When we make
              significant changes, we will notify you by posting the updated
              Terms on our website and updating the "Last updated" date.
              Continued use of the Service constitutes your acceptance of the
              revised Terms.
            </p>
          </section>
          <section id="governing-law" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              11. Governing Law & Dispute Resolution
            </h2>
            <p className="text-gray-700">
              This Agreement is governed by the laws of Poland without regard to
              its conflict-of-law provisions. Any disputes arising under or in
              connection with this Agreement will be resolved by the courts of
              Warsaw, Poland.
            </p>
          </section>
          <section id="refund-policy" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">12. Refund Policy</h2>
            <p className="text-gray-700">
              We do not provide refunds for any subscription fees, except as
              required by applicable law. You may cancel your subscription at
              any time, and access to the Service will continue until the end of
              the current billing period.
            </p>
          </section>
          <section id="prohibited-conduct" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              13. Prohibited Conduct
            </h2>
            <div>
              <p className="text-gray-700">
                You agree not to use the Service to:
              </p>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>
                  Upload or distribute malware, spam, or other harmful code.
                </li>
                <li>
                  Violate any applicable laws, including data protection and
                  privacy regulation
                </li>
                <li>
                  Interfere with or disrupt the integrity or performance of the
                  Service.
                </li>
              </ol>
            </div>
          </section>
          <section id="contact-info" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              14. Contact Information
            </h2>
            <p className="text-gray-700 font-semibold">Adey</p>
            <p className="text-gray-700">
              Woloska 141A
              <br />
              02-507 Warsaw, Poland
            </p>
            <p className="text-gray-700">
              Email:{" "}
              <a
                href="mailto:contact@adey-chatbot.website"
                className="text-blue-700 hover:underline"
              >
                contact@adey-chatbot.website
              </a>
            </p>
            <p className="text-gray-700">Phone: +48 579 334 867</p>
          </section>

          {/* Back to Top */}
          <div className="text-center">
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
