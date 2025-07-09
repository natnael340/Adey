import Header from "../components/Header";
import Footer from "../components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <Header activeList={{}} />
      <main className="flex-1 px-4 md:px-8 py-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: June 27, 2025</p>
          </div>
          <Accordion type="multiple" className="w-full space-y-2">
            <AccordionItem value="defintions">
              <AccordionTrigger>1. Definitions</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>"Service"</strong> means the Adey embeddable chatbot widget and all related features, content, and services provided through our website or application.</li>
                  <li><strong>"User"</strong> or <strong>"you"</strong> means any individual or entity accessing or using the Service.</li>
                  <li><strong>"Content"</strong> means any data, documents, text, images, or other materials you upload, submit, or make available through the Service.</li>
                  <li><strong>"Account"</strong> means the user account you create to access and use the Service.</li>
                  <li><strong>"Free Tier"</strong>, <strong>"Standard Tier"</strong>, and <strong>"Premium Tier"</strong> refer to the subscription levels offering increasing numbers of chatbots and allowed monthly conversations.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="company-info">
              <AccordionTrigger>2. Company Information</AccordionTrigger>
              <AccordionContent>
                <p>Adey<br />Woloska 141A<br />02-507 Warsaw, Poland<br />Email: <a href="mailto:natnaeltilahun157@gmail.com" className="underline">natnaeltilahun157@gmail.com</a><br />Phone: +48 579 334 867</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="service-desc">
              <AccordionTrigger>3. Service Description</AccordionTrigger>
              <AccordionContent>
                <p>Adey provides a customizable, embeddable chatbot widget that lets you integrate an AI-driven chat interface into your website. Your customers can interact with the bot to ask questions about your business based on the data and documents you upload. There is no direct user-to-user communication via the Service.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="accounts">
              <AccordionTrigger>4. Accounts & Eligibility</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Registration:</strong> To use the Service, you must register for an Account by providing a valid email address and password or by using Google social login.</li>
                  <li><strong>Security:</strong> You are responsible for maintaining the confidentiality of your Account credentials and for all activities under your Account.</li>
                  <li><strong>Age Requirement:</strong> You must be at least 16 years old to use the Service. By registering, you represent and warrant that you meet this age requirement.</li>
                  <li><strong>Suspension & Termination:</strong> We may suspend or terminate your Account for violation of this Agreement or for any unlawful or abusive behavior, at our sole discretion. We will notify you via email when reasonably possible.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="subscriptions">
              <AccordionTrigger>5. Subscription & Payments</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Tiers:</strong> The Service is offered in three tiers:<br /><strong>Free Tier:</strong> Limited number of chatbots and monthly conversations at no cost.<br /><strong>Standard Tier:</strong> Increased limits with a recurring subscription fee.<br /><strong>Premium Tier:</strong> Highest limits and priority support with a recurring subscription fee.</li>
                  <li><strong>Billing:</strong> Subscriptions are billed monthly in advance via the payment processor you select (Google Play, Stripe, or PayPal). All fees are non-refundable, except as required by law.</li>
                  <li><strong>Changes & Cancellations:</strong> You may upgrade, downgrade, or cancel your subscription at any time through your Account settings. Changes take effect at the next billing cycle.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="ugc">
              <AccordionTrigger>6. User-Generated Content</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Upload & Use:</strong> You may upload documents, images, and other business-related files to train your chatbot. These materials remain your property, and we do not redistribute them to other users.</li>
                  <li><strong>License:</strong> By uploading Content, you grant us a worldwide, non-exclusive, royalty-free license to use, host, and process your Content solely to provide the Service.</li>
                  <li><strong>Moderation:</strong> We reserve the right to review and remove Content that we deem illegal, offensive, or in violation of this Agreement. You can report inappropriate Content via our support channels.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="ip">
              <AccordionTrigger>7. Intellectual Property</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Our Rights:</strong> All rights, title, and interest in the Service and its underlying technology, software, and content are owned by Adey or its licensors.</li>
                  <li><strong>Your Rights:</strong> You retain all ownership rights in the Content you upload. This Agreement does not transfer any ownership to us beyond the license described above.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="privacy">
              <AccordionTrigger>8. Privacy & Data Protection</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Privacy Policy:</strong> Our practices regarding data collection and use are described in our <a href="https://www.adey-chatbot.website/privacy" className="underline">Privacy Policy</a>.</li>
                  <li><strong>Data Collected:</strong> We collect personal data such as name, email address, payment information, business name, logo, description, and files you upload to your chatbot.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="disclaimers">
              <AccordionTrigger>9. Disclaimers & Limitation of Liability</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Disclaimer:</strong> The Service is provided "as is" and "as available" without warranties of any kind. We disclaim all implied warranties, including merchantability and fitness for a particular purpose.</li>
                  <li><strong>Limitation of Liability:</strong> To the fullest extent permitted by law, Adey will not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, even if advised of the possibility of such damages.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="indemnification">
              <AccordionTrigger>10. Indemnification</AccordionTrigger>
              <AccordionContent>
                <p>You agree to indemnify, defend, and hold harmless Adey and its officers, directors, employees, agents, and affiliates from any claims, liabilities, losses, damages, costs, or expenses arising out of or related to your use of the Service or your violation of this Agreement.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="changes">
              <AccordionTrigger>11. Changes to These Terms</AccordionTrigger>
              <AccordionContent>
                <p>We may revise these Terms from time to time. When we make significant changes, we will notify you by posting the updated Terms on our website and updating the "Last updated" date. Continued use of the Service constitutes your acceptance of the revised Terms.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="law">
              <AccordionTrigger>12. Governing Law & Dispute Resolution</AccordionTrigger>
              <AccordionContent>
                <p>This Agreement is governed by the laws of Poland without regard to its conflict-of-law provisions. Any disputes arising under or in connection with this Agreement will be resolved by the courts of Warsaw, Poland.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="contact">
              <AccordionTrigger>13. Contact Information</AccordionTrigger>
              <AccordionContent>
                <p>If you have any questions about these Terms, please contact us at:<br />Adey<br />Woloska 141A<br />02-507 Warsaw, Poland<br />Email: <a href="mailto:natnaeltilahun157@gmail.com" className="underline">natnaeltilahun157@gmail.com</a><br />Phone: +48 579 334 867</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  );
}

