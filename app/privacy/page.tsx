import MarketingShell from '@/components/site/MarketingShell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'Privacy policy for SCX Dashboards Ltd, including how consultation, client, payment, and dashboard information is handled.',
};

const linkClass = 'text-blue-400 hover:text-blue-300';

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">Legal</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Privacy Policy</h1>
        <p className="mt-4 text-sm text-[#8b949e]">Effective date: October 20, 2026</p>
        <p className="mt-1 text-sm text-[#8b949e]">Last updated: October 20, 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-[#c9d1d9] sm:text-base">
          <section className="space-y-3">
            <p>
              SCX Dashboards (&ldquo;SCX Dashboards,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), operated by SCX Dashboards Ltd, is committed to protecting the privacy, security, and confidentiality of personal and business information entrusted to us.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, process, disclose, and protect information when individuals and businesses interact with our website, request quotations, purchase services, or use our custom software solutions.
            </p>
            <p>
              By using our services, you acknowledge the practices described in this Privacy Policy, subject to applicable privacy laws and any consent requirements.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
            <p>
              We collect information reasonably necessary to provide our services, communicate with clients, operate our business, and fulfill legal obligations.
            </p>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">1.1 Information Submitted Through Quote Forms</h3>
              <p>When requesting a quotation, you may provide:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Full name and contact information.</li>
                <li>Business or organization name.</li>
                <li>Business email address and telephone number.</li>
                <li>Company website and industry.</li>
                <li>Project requirements and requested functionality.</li>
                <li>Existing software, technology, and integration requirements.</li>
                <li>Project budget and desired implementation timeline.</li>
                <li>Additional information voluntarily submitted through forms or correspondence.</li>
              </ul>
              <p>We use this information primarily to evaluate project requirements, prepare quotations, and communicate with prospective clients.</p>
              <p>Submitting a quotation does not automatically enroll you in a recurring payment service.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">1.2 Client Account Information</h3>
              <p>When purchasing or using our services, we may collect:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Authorized business representative information.</li>
                <li>Account credentials and authentication details.</li>
                <li>Billing contact information.</li>
                <li>Service agreements and project specifications.</li>
                <li>Technical support communications.</li>
                <li>Subscription preferences and transaction records.</li>
                <li>Account activity and administrative audit logs.</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">1.3 Payment and Billing Information</h3>
              <p>Payments may be processed through Stripe, a third-party payment processing provider.</p>
              <p>
                Depending on the payment method, Stripe may collect information such as card details, billing addresses, payment credentials, and transaction-related information.
              </p>
              <p>
                SCX Dashboards generally receives limited payment information, such as payment status, transaction identifiers, amounts, billing details, and limited payment-method identifiers.
              </p>
              <p>
                When Stripe Elements is used as intended, complete payment card information is collected and processed through Stripe&rsquo;s payment infrastructure rather than directly stored on our application servers.
              </p>
              <p>
                We use payment information to process authorized transactions, administer subscriptions, issue invoices and refunds, prevent fraud, and satisfy accounting obligations.
              </p>
              <p>
                Stripe&rsquo;s privacy practices are described at{' '}
                <a href="https://stripe.com/privacy" className={linkClass}>
                  https://stripe.com/privacy
                </a>
                .
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">1.4 Business and Dashboard Data</h3>
              <p>
                In providing custom dashboards, analytics, and administrative portals, we may process information made available by our business clients.
              </p>
              <p>This may include:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Sales, revenue, and financial performance data.</li>
                <li>Customer relationship management records.</li>
                <li>Operational and administrative information.</li>
                <li>Marketing and advertising analytics.</li>
                <li>Employee or workforce management information.</li>
                <li>Inventory and fulfillment data.</li>
                <li>Customer service records.</li>
                <li>Other information connected through authorized business integrations.</li>
              </ul>
              <p>The precise categories of information processed depend on the client&rsquo;s project requirements and agreed system configuration.</p>
              <p>
                Business clients are responsible for confirming that they have the necessary authority and lawful basis to provide this information for processing.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">1.5 AI Interactions and Generated Content</h3>
              <p>Where AI functionality is included, we may process information such as:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>User questions and instructions submitted to an AI assistant.</li>
                <li>Relevant database records retrieved to answer those questions.</li>
                <li>AI-generated summaries, reports, and responses.</li>
                <li>Workflow execution records.</li>
                <li>Error reports and usage logs.</li>
                <li>Authorized requests to connected business applications.</li>
              </ul>
              <p>
                AI-related data processing will be limited to purposes reasonably necessary to deliver, maintain, secure, and support the agreed functionality, together with any additional uses expressly authorized by the client.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">1.6 Automatically Collected Technical Information</h3>
              <p>When you visit our website or use hosted software, we may collect:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>IP address.</li>
                <li>Browser and device information.</li>
                <li>Operating system information.</li>
                <li>Approximate geographic region derived from network information.</li>
                <li>Pages visited and interactions with our services.</li>
                <li>Session timestamps.</li>
                <li>Security, performance, and diagnostic logs.</li>
              </ul>
              <p>We use this information for website functionality, security, performance monitoring, fraud prevention, and service improvement.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. How We Use Information</h2>
            <p>SCX Dashboards may use information to:</p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>Respond to quotation requests and business inquiries.</li>
              <li>Evaluate requirements and prepare customized proposals.</li>
              <li>Develop, deploy, host, and maintain software solutions.</li>
              <li>Operate AI-powered analytics and dashboard functionality.</li>
              <li>Integrate authorized third-party business systems.</li>
              <li>Process payments, invoices, refunds, and subscriptions.</li>
              <li>Provide technical support and customer service.</li>
              <li>Monitor application performance and system security.</li>
              <li>Identify and prevent fraud, misuse, and unauthorized access.</li>
              <li>Maintain legally required business and accounting records.</li>
              <li>Comply with applicable laws and enforce our agreements.</li>
              <li>Send promotional communications where permitted by law and applicable consent requirements.</li>
            </ol>
            <p>We will not use personal information for materially unrelated purposes without an appropriate legal basis or required consent.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. Business Client Data and Processing Responsibilities</h2>
            <p>
              When SCX Dashboards processes information contained in a client&rsquo;s business systems, the client ordinarily determines which data is collected, the purposes for processing, and which users are authorized to access that information.
            </p>
            <p>
              In these circumstances, the client generally acts as the organization responsible for the underlying business information, while SCX Dashboards acts as a service provider processing information on the client&rsquo;s behalf.
            </p>
            <p>
              SCX Dashboards may separately determine how it processes information for its own operational purposes, including invoicing, account administration, security, and customer support.
            </p>
            <p>Where required, additional contractual arrangements may define the parties&rsquo; respective responsibilities for processing personal information.</p>
            <p>
              Individuals seeking access to, correction of, or deletion of information held within a client&rsquo;s business dashboard may need to direct their request to the organization operating that dashboard.
            </p>
            <p>We will reasonably assist clients with such requests as required by applicable law and our agreements.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. AI Data Processing and Third-Party AI Providers</h2>
            <p>Our services may incorporate AI models and infrastructure supplied by external technology providers.</p>
            <p>
              Depending on the agreed implementation, relevant inputs, retrieved records, and contextual information may be transmitted to those providers for processing.
            </p>
            <p>We seek to limit transmitted information to what is reasonably necessary for the requested functionality.</p>
            <p>
              SCX Dashboards does not authorize the use of confidential client business data to train general-purpose AI models for unrelated purposes without the client&rsquo;s express written authorization.
            </p>
            <p>
              Where third-party AI providers are used, their data handling practices, contractual obligations, retention settings, and available privacy controls will be evaluated as appropriate to the proposed services.
            </p>
            <p>
              AI systems may generate inaccurate information or unintended outputs. Clients should avoid entering unnecessary sensitive personal information into AI interfaces and should apply suitable human oversight to important decisions.
            </p>
            <p>Use of AI features does not transfer ownership of client-provided business data to SCX Dashboards.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Third-Party Service Providers</h2>
            <p>To operate our services, we may rely on third-party service providers for functions including:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Payment processing and subscription billing.</li>
              <li>Cloud hosting and data storage.</li>
              <li>Database infrastructure and authentication.</li>
              <li>Artificial intelligence processing.</li>
              <li>Email delivery and customer support.</li>
              <li>Security monitoring and technical diagnostics.</li>
              <li>Website analytics and operational reporting.</li>
            </ul>
            <p>These providers may process information on our behalf or, where applicable, in their own capacity under their privacy policies.</p>
            <p>
              We seek to use service providers that maintain appropriate security and privacy protections, and we assess applicable contractual and legal requirements before sharing personal information.
            </p>
            <p>We do not sell client business data or personal information to data brokers.</p>
            <p>
              Where appropriate or legally required, clients will receive information about relevant service providers, their roles, and any applicable data processing terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. International Data Processing</h2>
            <p>SCX Dashboards may use cloud infrastructure or third-party service providers located outside Canada.</p>
            <p>
              As a result, information may be transferred to, stored in, or processed in other jurisdictions, including the United States, depending on the selected infrastructure and service providers.
            </p>
            <p>
              Information processed outside Canada may be subject to the laws of the jurisdiction in which it is held, including lawful access requests by public authorities.
            </p>
            <p>
              Where required by law, we will provide additional information concerning international processing arrangements and implement appropriate contractual, administrative, and technical safeguards.
            </p>
            <p>
              Questions about international service providers or our applicable data handling practices may be directed to our Privacy Officer using the contact information below.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">7. Data Security</h2>
            <p>We maintain security practices designed to protect information against unauthorized access, disclosure, misuse, alteration, or destruction.</p>
            <p>Depending on the service and system configuration, safeguards may include:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Authentication and authorization controls.</li>
              <li>Restricted administrative access.</li>
              <li>Secure data transmission.</li>
              <li>Access logging and monitoring.</li>
              <li>Credential and secret management.</li>
              <li>Software updates and vulnerability remediation.</li>
              <li>Backup and recovery measures.</li>
              <li>Contractual confidentiality obligations.</li>
            </ul>
            <p>Specific technical controls, service levels, and security commitments may be further defined in client agreements.</p>
            <p>No electronic storage or transmission system can be guaranteed to be completely secure.</p>
            <p>
              We will investigate suspected security incidents and provide notifications to affected parties or regulators where required by applicable law and contractual obligations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">8. Data Retention</h2>
            <p>
              We retain personal and business information only for as long as reasonably necessary to fulfill the purposes described in this Privacy Policy, satisfy contractual obligations, comply with applicable legal requirements, and resolve legitimate business disputes.
            </p>
            <p>Retention periods vary depending on the type of information and applicable circumstances.</p>
            <p>For example:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Quote submissions may be retained while an inquiry or business relationship remains active and for a reasonable follow-up period.</li>
              <li>Billing and transaction records may be retained for applicable accounting and tax obligations.</li>
              <li>Client dashboard data will be retained according to the service agreement, applicable hosting arrangements, and legal requirements.</li>
              <li>Security and diagnostic logs may be retained for operational and fraud prevention purposes.</li>
            </ul>
            <p>Following termination, data may be returned, exported, deleted, or retained as required by the relevant agreement and applicable law.</p>
            <p>Backup copies may remain temporarily within ordinary backup retention cycles.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">9. Cookies and Similar Technologies</h2>
            <p>Our website and hosted services may use cookies or similar technologies to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Maintain website and application functionality.</li>
              <li>Support authentication and session security.</li>
              <li>Remember user preferences.</li>
              <li>Detect suspicious activity.</li>
              <li>Understand website performance and usage.</li>
            </ul>
            <p>
              Where non-essential analytics, advertising, or tracking technologies are implemented, we will provide relevant notices and obtain consent where legally required.
            </p>
            <p>Users may also manage certain cookie preferences through browser settings or available website controls.</p>
            <p>Disabling essential cookies may affect website or application functionality.</p>
            <p>
              This website does not currently use non-essential analytics, advertising, or session-recording tools. Essential cookies may be used so the site, and any payment form offered on it, can function.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">10. Marketing Communications</h2>
            <p>
              We may contact prospective and existing business clients regarding quotations, service inquiries, project updates, account notices, or other relevant business communications.
            </p>
            <p>Promotional messages will be sent only where permitted by applicable law.</p>
            <p>
              Recipients may unsubscribe from promotional communications using the unsubscribe mechanism provided or by contacting us.
            </p>
            <p>
              Unsubscribing from marketing communications does not necessarily prevent essential transactional communications concerning existing services, billing, security, or support.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">11. Access, Correction, and Privacy Rights</h2>
            <p>Subject to applicable law, individuals may have rights to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Request access to personal information held about them.</li>
              <li>Request correction of inaccurate or incomplete information.</li>
              <li>Withdraw consent where processing relies on consent, subject to lawful restrictions.</li>
              <li>Request deletion of personal information where applicable.</li>
              <li>Ask questions about our data handling practices.</li>
              <li>Submit privacy-related complaints.</li>
            </ul>
            <p>Additional rights may apply depending on an individual&rsquo;s jurisdiction.</p>
            <p>
              Requests can be submitted to{' '}
              <a href="mailto:support@scxdashboards.com" className={linkClass}>
                support@scxdashboards.com
              </a>
              .
            </p>
            <p>We may request reasonable identity verification before fulfilling a request and will respond within applicable legal timeframes.</p>
            <p>Where an inquiry concerns personal information controlled by a business client, we may refer the requester to that client.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">12. Confidentiality of Business Information</h2>
            <p>SCX Dashboards treats non-public business information supplied by clients as confidential, subject to the applicable services agreement.</p>
            <p>
              Confidential information may include internal financial records, customer databases, business strategies, operating procedures, software credentials, and proprietary company information.
            </p>
            <p>
              We will not intentionally disclose confidential business information to unrelated third parties except as authorized, necessary to provide contracted services, or legally required.
            </p>
            <p>Our confidentiality obligations may be supplemented by a separate non-disclosure agreement or service agreement.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">13. Children&rsquo;s Privacy</h2>
            <p>SCX Dashboards provides services primarily to businesses and professional users.</p>
            <p>Our public website and commercial services are not directed toward children.</p>
            <p>We do not knowingly collect personal information directly from children through our general quotation and sales processes.</p>
            <p>Any proposed client project involving children&rsquo;s personal information requires separate review and suitable contractual and privacy safeguards.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">14. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy to reflect changes in business operations, technology, service providers, or applicable legal requirements.</p>
            <p>The latest version will be published on our website with its effective date.</p>
            <p>
              Where legally required, we will provide additional notice or obtain consent before materially changing how personal information is processed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">15. Contact Our Privacy Officer</h2>
            <p>Questions about this Privacy Policy, personal information, international processing, or privacy rights may be directed to:</p>
            <p>
              <strong className="text-white">SCX Dashboards</strong>
              <br />
              <strong className="text-white">Operating legal entity:</strong> SCX Dashboards Ltd
              <br />
              <strong className="text-white">Privacy Officer</strong>
              <br />
              <strong className="text-white">Country:</strong> Canada
              <br />
              <strong className="text-white">Privacy email:</strong>{' '}
              <a href="mailto:support@scxdashboards.com" className={linkClass}>
                support@scxdashboards.com
              </a>
              <br />
              <strong className="text-white">Customer support email:</strong>{' '}
              <a href="mailto:support@scxdashboards.com" className={linkClass}>
                support@scxdashboards.com
              </a>
              <br />
              <strong className="text-white">Website:</strong>{' '}
              <a href="https://www.scxdashboards.com" className={linkClass}>
                www.scxdashboards.com
              </a>
            </p>
            <p>We will review privacy-related inquiries and respond in accordance with applicable law.</p>
          </section>
        </div>
      </article>
    </MarketingShell>
  );
}
