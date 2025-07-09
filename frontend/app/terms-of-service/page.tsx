import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card } from "@/components/ui/card";

export default function TermsOfService() {
  const sections = [
    { id: "definitions", title: "1. Definitions" },
    { id: "company-info", title: "2. Company Information" },
    { id: "service-desc", title: "3. Service Description" },
    { id: "accounts", title: "4. Accounts & Eligibility" },
    { id: "subscriptions", title: "5. Subscription & Payments" },
    { id: "ugc", title: "6. User-Generated Content" },
    { id: "ip", title: "7. Intellectual Property" },
    { id: "privacy", title: "8. Privacy & Data Protection" },
    { id: "disclaimers", title: "9. Disclaimers & Limitation of Liability" },
    { id: "indemnification", title: "10. Indemnification" },
    { id: "changes", title: "11. Changes to These Terms" },
    { id: "law", title: "12. Governing Law & Dispute Resolution" },
    { id: "contact", title: "13. Contact Information" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <Header activeList={{}} />
      <main className="flex-1 px-4 md:px-8 py-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_220px] gap-8">
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <h1 className="text-5xl font-bold">Terms of Service</h1>
              <p className="text-sm text-muted-foreground">Last updated: June 27, 2025</p>
            </div>

            <section id="definitions" className="space-y-2">
              <h2 className="text-xl font-semibold">1. Definitions</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>"Service"</strong> means the Adey embeddable chatbot widget and all related features, content, and services provided through our website or application.</li>
                <li><strong>"User"</strong> or <strong>"you"</strong> means any individual or entity accessing or using the Service.</li>
                <li><strong>"Content"</strong> means any data, documents, text, images, or other materials you upload, submit, or make available through the Service.</li>
                <li><strong>"Account"</strong> means the user account you create to access and use the Service.</li>
                <li><strong>"Free Tier"</strong>, <strong>"Standard Tier"</strong>, and <strong>"Premium Tier"</strong> refer to the subscription levels offering increasing numbers of chatbots and allowed monthly conversations.</li>
              </ol>
            </section>

            <section id="company-info" className="space-y-2">
              <h2 className="text-xl font-semibold">2. Company Information</h2>
              <p>
                Adey<br />Woloska 141A<br />02-507 Warsaw, Poland<br />Email: <a href="mailto:natnaeltilahun157@gmail.com" className="underline">natnaeltilahun157@gmail.com</a><br />Phone: +48 579 334 867
              </p>
            </section>

            <section id="service-desc" className="space-y-2">
              <h2 className="text-xl font-semibold">3. Service Description</h2>
              <p>
                Adey provides a customizable, embeddable chatbot widget that lets you integrate an AI-driven chat interface into your website. Your customers can interact with the bot to ask questions about your business based on the data and documents you upload. There is no direct user-to-user communication via the Service.
              </p>
            </section>

            <section id="accounts" className="space-y-2">
              <h2 className="text-xl font-semibold">4. Accounts & Eligibility</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Registration:</strong> To use the Service, you must register for an Account by providing a valid email address and password or by using Google social login.</li>
                <li><strong>Security:</strong> You are responsible for maintaining the confidentiality of your Account credentials and for all activities under your Account.</li>
                <li><strong>Age Requirement:</strong> You must be at least 16 years old to use the Service. By registering, you represent and warrant that you meet this age requirement.</li>
                <li><strong>Suspension & Termination:</strong> We may suspend or terminate your Account for violation of this Agreement or for any unlawful or abusive behavior, at our sole discretion. We will notify you via email when reasonably possible.</li>
              </ol>
            </section>

            <section id="subscriptions" className="space-y-2">
              <h2 className="text-xl font-semibold">5. Subscription & Payments</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Tiers:</strong> The Service is offered in three tiers:<br /><strong>Free Tier:</strong> Limited number of chatbots and monthly conversations at no cost.<br /><strong>Standard Tier:</strong> Increased limits with a recurring subscription fee.<br /><strong>Premium Tier:</strong> Highest limits and priority support with a recurring subscription fee.</li>
                <li><strong>Billing:</strong> Subscriptions are billed monthly in advance via the payment processor you select (Google Play, Stripe, or PayPal). All fees are non-refundable, except as required by law.</li>
                <li><strong>Changes & Cancellations:</strong> You may upgrade, downgrade, or cancel your subscription at any time through your Account settings. Changes take effect at the next billing cycle.</li>
              </ol>
            </section>

            <section id="ugc" className="space-y-2">
              <h2 className="text-xl font-semibold">6. User-Generated Content</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Upload & Use:</strong> You may upload documents, images, and other business-related files to train your chatbot. These materials remain your property, and we do not redistribute them to other users.</li>
                <li><strong>License:</strong> By uploading Content, you grant us a worldwide, non-exclusive, royalty-free license to use, host, and process your Content solely to provide the Service.</li>
                <li><strong>Moderation:</strong> We reserve the right to review and remove Content that we deem illegal, offensive, or in violation of this Agreement. You can report inappropriate Content via our support channels.</li>
              </ol>
            </section>

            <section id="ip" className="space-y-2">
              <h2 className="text-xl font-semibold">7. Intellectual Property</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Our Rights:</strong> All rights, title, and interest in the Service and its underlying technology, software, and content are owned by Adey or its licensors.</li>
                <li><strong>Your Rights:</strong> You retain all ownership rights in the Content you upload. This Agreement does not transfer any ownership to us beyond the license described above.</li>
              </ol>
            </section>

            <section id="privacy" className="space-y-2">
              <h2 className="text-xl font-semibold">8. Privacy & Data Protection</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Privacy Policy:</strong> Our practices regarding data collection and use are described in our <a href="https://www.adey-chatbot.website/privacy" className="underline">Privacy Policy</a>.</li>
                <li><strong>Data Collected:</strong> We collect personal data such as name, email address, payment information, business name, logo, description, and files you upload to your chatbot.</li>
              </ol>
            </section>

            <section id="disclaimers" className="space-y-2">
              <h2 className="text-xl font-semibold">9. Disclaimers & Limitation of Liability</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Disclaimer:</strong> The Service is provided "as is" and "as available" without warranties of any kind. We disclaim all implied warranties, including merchantability and fitness for a particular purpose.</li>
                <li><strong>Limitation of Liability:</strong> To the fullest extent permitted by law, Adey will not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, even if advised of the possibility of such damages.</li>
              </ol>
            </section>

            <section id="indemnification" className="space-y-2">
              <h2 className="text-xl font-semibold">10. Indemnification</h2>
              <p>You agree to indemnify, defend, and hold harmless Adey and its officers, directors, employees, agents, and affiliates from any claims, liabilities, losses, damages, costs, or expenses arising out of or related to your use of the Service or your violation of this Agreement.</p>
            </section>

            <section id="changes" className="space-y-2">
              <h2 className="text-xl font-semibold">11. Changes to These Terms</h2>
              <p>We may revise these Terms from time to time. When we make significant changes, we will notify you by posting the updated Terms on our website and updating the "Last updated" date. Continued use of the Service constitutes your acceptance of the revised Terms.</p>
            </section>

            <section id="law" className="space-y-2">
              <h2 className="text-xl font-semibold">12. Governing Law & Dispute Resolution</h2>
              <p>This Agreement is governed by the laws of Poland without regard to its conflict-of-law provisions. Any disputes arising under or in connection with this Agreement will be resolved by the courts of Warsaw, Poland.</p>
            </section>

            <section id="contact" className="space-y-2">
              <h2 className="text-xl font-semibold">13. Contact Information</h2>
              <p>If you have any questions about these Terms, please contact us at:<br />Adey<br />Woloska 141A<br />02-507 Warsaw, Poland<br />Email: <a href="mailto:natnaeltilahun157@gmail.com" className="underline">natnaeltilahun157@gmail.com</a><br />Phone: +48 579 334 867</p>
            </section>
          </div>

          <aside className="hidden md:block">
            <Card className="sticky top-24 p-4 space-y-2">
              <h3 className="font-semibold">Sections</h3>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className="block text-sm hover:underline">
                    {s.title}
                  </a>
                ))}
              </nav>
            </Card>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

