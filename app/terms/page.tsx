import MarketingShell from '@/components/site/MarketingShell';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of service',
  description: 'Terms of service for SCX Dashboards Ltd software development, dashboards, and related services.',
};

const linkClass = 'text-blue-400 hover:text-blue-300';

export default function TermsPage() {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">Legal</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Terms of Service</h1>
        <p className="mt-4 text-sm text-[#8b949e]">Effective date: October 20, 2026</p>
        <p className="mt-1 text-sm text-[#8b949e]">Last updated: October 20, 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-[#c9d1d9] sm:text-base">
          <section className="space-y-3">
            <p>
              Welcome to SCX Dashboards. These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the website, products, software, and professional services provided by SCX Dashboards (&ldquo;SCX Dashboards,&rdquo; &ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), operated by SCX Dashboards Ltd.
            </p>
            <p>
              By accessing our website, requesting a quotation, accepting a proposal, purchasing services, or using our software, you agree to these Terms, as applicable to your activities.
            </p>
            <p>
              If you act on behalf of a business or organization, you represent that you have the authority to bind that organization to the applicable agreements.
            </p>
            <p>Please read these Terms carefully before purchasing our services.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. Description of Services</h2>
            <p>
              SCX Dashboards is a business-to-business (B2B) software development and technology services company specializing in the design, development, integration, deployment, and management of custom software solutions.
            </p>
            <p>Our services may include:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Custom business intelligence and analytics dashboards.</li>
              <li>Administrative dashboards and internal business management portals.</li>
              <li>AI-powered analytics, reporting, and data visualization.</li>
              <li>Integrated artificial intelligence assistants and AI agents.</li>
              <li>Business workflow automation and third-party software integrations.</li>
              <li>Database architecture and data management solutions.</li>
              <li>Ongoing software hosting, maintenance, technical support, and infrastructure management.</li>
            </ul>
            <p>All software development projects are customized to the individual requirements of the client.</p>
            <p>
              The availability, functionality, features, and scope of services are determined by the applicable quotation, proposal, statement of work, or written service agreement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. Business Quotations and Proposals</h2>
            <p>SCX Dashboards operates through a consultation-based quotation process.</p>
            <p>
              Prospective clients may submit information through our website describing their business requirements, desired functionality, technical integrations, and project objectives.
            </p>
            <p>
              Submitting a quotation request does not establish a contractual relationship or obligate either party to proceed with a project.
            </p>
            <p>Following an assessment, SCX Dashboards may provide a customized proposal outlining:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>The proposed scope of work and deliverables.</li>
              <li>Project development and implementation fees.</li>
              <li>Expected project milestones and delivery schedules.</li>
              <li>Technical requirements and third-party integrations.</li>
              <li>Any recurring subscriptions or management fees.</li>
              <li>Payment schedules and other project-specific conditions.</li>
            </ul>
            <p>Quotes remain valid for the period identified in the proposal and may be revised before acceptance.</p>
            <p>
              A binding service agreement is established when the parties accept a proposal or statement of work according to its stated acceptance process.
            </p>
            <p>
              Where a separately executed service agreement conflicts with these Terms, that agreement takes precedence for the affected services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">3. Pricing and Payment Terms</h2>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">3.1 Custom Development Fees</h3>
              <p>
                SCX Dashboards charges individually negotiated fees based on project complexity, functionality, implementation requirements, and estimated development resources.
              </p>
              <p>
                Typical development and implementation fees may range from $5,000 to $15,000 USD, although actual fees may be higher or lower depending on the agreed scope.
              </p>
              <p>The applicable amount will be clearly disclosed and approved before payment is requested.</p>
              <p>Fees may be charged as a single upfront payment or according to agreed development milestones.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">3.2 Recurring Management and Subscription Fees</h3>
              <p>
                Certain services may require ongoing monthly payments for software hosting, maintenance, management, technical support, AI infrastructure, or other agreed services.
              </p>
              <p>Typical recurring management fees range from $2,000 to $5,000 USD per month.</p>
              <p>
                The precise subscription amount, included services, billing frequency, initial billing date, and applicable contractual term will be disclosed in the client&rsquo;s proposal or service agreement before subscription activation.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">3.3 Currency and Taxes</h3>
              <p>Unless otherwise expressly stated, all prices are quoted and billed in United States Dollars (USD).</p>
              <p>
                Applicable taxes, including GST, HST, sales tax, or other legally required taxes, will be identified and charged where applicable.
              </p>
              <p>Clients are responsible for currency conversion charges imposed by their financial institution or payment provider.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">3.4 Payment Processing</h3>
              <p>Payments are securely processed using Stripe and any other payment methods expressly offered by SCX Dashboards.</p>
              <p>SCX Dashboards does not require clients to provide complete payment card details directly to our personnel.</p>
              <p>Payment processing may be subject to additional authentication and fraud prevention procedures.</p>
              <p>Clients authorize SCX Dashboards to charge the agreed amount using their selected payment method.</p>
              <p>Payment confirmation and receipts will be provided electronically.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">3.5 Payment Authorization</h3>
              <p>For one-time purchases, clients authorize the specific payment amount disclosed at checkout or on the applicable invoice.</p>
              <p>
                For recurring subscriptions, clients expressly authorize SCX Dashboards and its payment processor to charge their selected payment method automatically at the agreed billing frequency until the subscription is cancelled or otherwise terminated in accordance with the applicable agreement.
              </p>
              <p>No recurring subscription will be activated without disclosure of its amount, billing schedule, and cancellation terms.</p>
              <p>Additional development fees, out-of-scope charges, or changes to monthly subscription pricing require prior client authorization.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">3.6 Failed or Overdue Payments</h3>
              <p>
                If a payment is declined or becomes overdue, SCX Dashboards may request an updated payment method, issue a payment reminder, or temporarily suspend affected services after reasonable notice.
              </p>
              <p>Suspension does not eliminate outstanding payment obligations.</p>
              <p>
                Where feasible, SCX Dashboards will provide the client with a reasonable opportunity to resolve an overdue balance before suspending essential services.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">4. Project Development and Delivery</h2>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">4.1 Commencement of Work</h3>
              <p>
                Development begins according to the timeline established in the accepted project agreement, subject to receipt of required payments, project materials, approvals, and access credentials.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">4.2 Estimated Delivery Timelines</h3>
              <p>Estimated completion dates are established individually for each project.</p>
              <p>
                Timelines may be affected by project complexity, technical dependencies, client-requested modifications, third-party providers, or delays in receiving required information.
              </p>
              <p>SCX Dashboards will communicate material changes to project timelines and work in good faith toward agreed milestones.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">4.3 Client Responsibilities</h3>
              <p>
                Clients agree to provide accurate information, reasonably timely feedback, necessary approvals, and authorized access to systems required for project completion.
              </p>
              <p>
                Clients are responsible for obtaining the rights, licenses, and permissions necessary to share data or connect third-party platforms to their dashboard.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">4.4 Scope Changes</h3>
              <p>
                Requests for additional features, integrations, revisions, or functionality outside the accepted project scope may require a revised quotation, additional payment, and adjusted delivery timeline.
              </p>
              <p>No additional charge will be processed without the client&rsquo;s authorization.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">4.5 Acceptance of Deliverables</h3>
              <p>
                Project deliverables will be reviewed and accepted in accordance with the acceptance criteria and process specified in the applicable statement of work.
              </p>
              <p>Clients should report material discrepancies between delivered functionality and agreed specifications within the agreed review period.</p>
              <p>SCX Dashboards will use commercially reasonable efforts to correct verified discrepancies covered by the accepted project scope.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Subscriptions, Renewals, and Cancellation</h2>
            <p>Ongoing software management services may operate through automatically renewing monthly subscriptions.</p>
            <p>Unless an accepted agreement expressly establishes a different disclosed commitment, subscriptions operate on a month-to-month basis.</p>
            <p>Subscriptions renew automatically on the agreed billing date unless cancelled before the next renewal.</p>
            <p>
              Clients may request cancellation at any time by contacting{' '}
              <a href="mailto:support@scxdashboards.com" className={linkClass}>
                support@scxdashboards.com
              </a>{' '}
              or through an account billing portal where available.
            </p>
            <p>
              Cancellation normally takes effect at the end of the current paid billing period, and no additional subscription renewal will be charged after the effective cancellation date.
            </p>
            <p>
              Fees already paid for an active billing period are generally non-refundable except where required by law, expressly agreed in writing, or provided under our{' '}
              <Link href="/refund" className={linkClass}>
                Refund &amp; Cancellation Policy
              </Link>
              .
            </p>
            <p>
              Cancellation of a management subscription does not automatically terminate an outstanding custom development agreement or eliminate fees for completed or contractually committed development work.
            </p>
            <p>
              The client will be informed if cancellation affects software hosting, integrations, managed infrastructure, or continued access to proprietary platform services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. Refunds and Project Cancellation</h2>
            <p>
              Because SCX Dashboards provides customized professional development services, refunds depend on the status of the project and the services already performed.
            </p>
            <p>
              Before substantive development begins, clients may request cancellation and a refund of amounts not already earned or committed to expressly approved, non-recoverable project expenses.
            </p>
            <p>
              After development begins, amounts attributable to completed work, accepted milestones, and authorized non-recoverable expenses are generally non-refundable.
            </p>
            <p>
              If a project is cancelled before completion, any refund of prepaid, unperformed work will be determined in accordance with the project agreement and our{' '}
              <Link href="/refund" className={linkClass}>
                Refund &amp; Cancellation Policy
              </Link>
              .
            </p>
            <p>
              Where SCX Dashboards materially fails to deliver agreed services, clients may be eligible for corrective work, service credits, or appropriate refunds under the applicable agreement and law.
            </p>
            <p>Nothing in these Terms limits rights or remedies that cannot legally be excluded.</p>
            <p>
              For complete details, please review our separate{' '}
              <Link href="/refund" className={linkClass}>
                Refund &amp; Cancellation Policy
              </Link>
              .
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">7. Intellectual Property Rights</h2>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">7.1 Client Data</h3>
              <p>Clients retain ownership of the business information, data, documents, and other materials they provide to SCX Dashboards.</p>
              <p>
                Clients grant SCX Dashboards a limited right to access, host, process, transform, and use such materials solely as necessary to provide the contracted services and otherwise as permitted by the applicable agreement.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">7.2 Custom Deliverables</h3>
              <p>
                Ownership, licensing, and transfer rights for custom-built dashboards, source code, designs, and other deliverables will be governed by the applicable project agreement.
              </p>
              <p>
                Unless expressly agreed otherwise in writing, SCX Dashboards retains ownership of its pre-existing frameworks, reusable code libraries, internal development tools, templates, methods, and proprietary technology.
              </p>
              <p>Upon full payment of applicable fees, clients receive the rights to use their delivered software specified in the project agreement.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">7.3 Third-Party Technology</h3>
              <p>Projects may incorporate third-party software, APIs, cloud infrastructure, artificial intelligence models, or open-source components.</p>
              <p>Such components remain subject to their respective licenses, terms, and restrictions.</p>
              <p>SCX Dashboards cannot transfer ownership of third-party technology that it does not own.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">8. Artificial Intelligence Features</h2>
            <p>Certain products may incorporate artificial intelligence systems, machine learning, automated reporting, and AI-powered assistants.</p>
            <p>Clients acknowledge that:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>AI-generated responses and analytical outputs may contain inaccuracies, omissions, or outdated information.</li>
              <li>Outputs may depend on the accuracy, completeness, and availability of underlying business data.</li>
              <li>AI systems may depend on external technology providers and integrations.</li>
              <li>AI functionality may occasionally be interrupted, modified, or unavailable.</li>
              <li>AI-generated recommendations should be reviewed by appropriately qualified personnel before material business decisions are made.</li>
            </ul>
            <p>
              AI-powered features are intended to assist business operations and do not independently replace professional financial, legal, medical, compliance, or other regulated advice.
            </p>
            <p>
              Unless specifically agreed through an appropriately reviewed arrangement, clients must not rely on automated AI outputs as the sole basis for decisions producing legal or similarly significant effects on individuals.
            </p>
            <p>Clients are responsible for reviewing and approving consequential actions initiated through AI-powered workflows.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">9. Data Protection and Confidentiality</h2>
            <p>SCX Dashboards recognizes that client systems may contain confidential operational, commercial, financial, or personal information.</p>
            <p>
              We will use commercially reasonable administrative, technical, and organizational measures appropriate to the contracted services to protect client information from unauthorized access, disclosure, alteration, and loss.
            </p>
            <p>We will not disclose confidential client information except:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>As necessary to provide contracted services through authorized personnel or service providers.</li>
              <li>With the client&rsquo;s authorization.</li>
              <li>Where legally required.</li>
              <li>As otherwise permitted by an applicable confidentiality or service agreement.</li>
            </ul>
            <p>
              Where personal information is processed on behalf of a client, the parties may enter into an additional data processing agreement defining their respective privacy and security responsibilities.
            </p>
            <p>Clients remain responsible for ensuring that their collection and use of information within custom dashboards complies with applicable laws.</p>
            <p>
              Further information is provided in our{' '}
              <Link href="/privacy" className={linkClass}>
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">10. Acceptable Use</h2>
            <p>Clients must not use SCX Dashboards services to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Conduct fraudulent, deceptive, or otherwise unlawful activities.</li>
              <li>Violate privacy, data protection, intellectual property, or other applicable laws.</li>
              <li>Access, manipulate, or disclose information without authorization.</li>
              <li>Distribute malware, malicious code, or harmful software.</li>
              <li>Interfere with the security or operation of our systems.</li>
              <li>Circumvent access controls or attempt unauthorized system access.</li>
              <li>Operate prohibited activities through integrated payment, data, or third-party systems.</li>
            </ul>
            <p>
              Clients must not provide sensitive regulated information requiring specialized safeguards, including protected health information or payment card data, for processing unless SCX Dashboards has expressly agreed in writing to support that use case and established the necessary safeguards.
            </p>
            <p>
              SCX Dashboards may suspend or terminate services used for unlawful activities or material violations of these Terms, subject to applicable contractual and legal obligations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">11. Third-Party Integrations</h2>
            <p>
              Custom dashboards may connect with external services including CRM systems, accounting software, databases, cloud platforms, payment services, communication tools, and AI providers.
            </p>
            <p>Such integrations may require separate accounts, subscriptions, licenses, or fees.</p>
            <p>
              Unless the applicable agreement states otherwise, SCX Dashboards is not responsible for interruptions, API changes, pricing changes, outages, or other actions controlled by independent third-party providers.
            </p>
            <p>We will make commercially reasonable efforts to assist with integration issues within the scope of contracted support services.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">12. Service Availability and Maintenance</h2>
            <p>SCX Dashboards may perform maintenance, security updates, software upgrades, and necessary infrastructure modifications.</p>
            <p>Planned interruptions will be communicated in advance where reasonably practicable.</p>
            <p>Unless a specific service-level agreement provides otherwise, SCX Dashboards does not guarantee uninterrupted or error-free operation.</p>
            <p>Any contractual uptime commitments, support response times, or service credits must be specified in the relevant service agreement.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">13. Warranties and Disclaimers</h2>
            <p>SCX Dashboards will perform its professional services with reasonable care and skill.</p>
            <p>Except for express warranties contained in an applicable service agreement or rights that cannot lawfully be excluded, we do not guarantee that software will:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Produce specific revenue, profit, efficiency, or business growth.</li>
              <li>Be free from all errors or interruptions.</li>
              <li>Remain compatible with every third-party technology.</li>
              <li>Produce consistently accurate AI-generated outputs.</li>
              <li>Satisfy requirements not included in the accepted project scope.</li>
            </ul>
            <p>Clients are responsible for independently validating important business information and maintaining appropriate operational controls.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">14. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, neither party will be liable for indirect, incidental, special, consequential, or punitive damages arising from the services, including lost profits, lost opportunities, or business interruption, except where such exclusions are prohibited by law.
            </p>
            <p>
              Unless an applicable agreement provides otherwise, each party&rsquo;s aggregate liability arising from a specific service agreement will not exceed the amounts paid or payable under that agreement during the twelve months preceding the event giving rise to the claim.
            </p>
            <p>This limitation does not apply to fraud, willful misconduct, payment obligations, or liabilities that cannot legally be limited.</p>
            <p>Any additional exceptions or negotiated liability terms will be addressed in the applicable client agreement.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">15. Suspension and Termination</h2>
            <p>Either party may terminate services according to the terms of the applicable agreement.</p>
            <p>SCX Dashboards may suspend or terminate services where:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Required payments remain overdue after appropriate notice.</li>
              <li>A material agreement violation remains unresolved.</li>
              <li>Services are being used unlawfully.</li>
              <li>Continued operation would create a material security risk.</li>
              <li>Termination is otherwise permitted by an applicable agreement or law.</li>
            </ul>
            <p>Where reasonably practicable, clients will receive notice and an opportunity to address the issue.</p>
            <p>
              Following termination, access to hosted software and related services may end, and client data will be handled according to the project agreement,{' '}
              <Link href="/privacy" className={linkClass}>
                Privacy Policy
              </Link>
              , and applicable data retention obligations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">16. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the Province of Alberta and the applicable federal laws of Canada, excluding conflict-of-law principles, unless otherwise required by law or agreed in a signed service agreement.
            </p>
            <p>The parties agree to attempt to resolve contractual disputes in good faith before commencing formal proceedings.</p>
            <p>
              Subject to applicable law and any valid alternative dispute resolution agreement, courts located in Alberta, Canada, will have jurisdiction over disputes arising from these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">17. Changes to These Terms</h2>
            <p>SCX Dashboards may update these Terms to reflect changes in services, legal obligations, or business operations.</p>
            <p>Updated Terms will be published on our website with a revised effective date.</p>
            <p>
              Material changes affecting existing paid services will be communicated where required and will not retroactively alter agreed pricing or material contractual rights without appropriate authorization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">18. Contact Information</h2>
            <p>SCX Dashboards is operated by:</p>
            <p>
              <strong className="text-white">Legal business name:</strong> SCX Dashboards Ltd
              <br />
              <strong className="text-white">Country:</strong> Canada
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
            <p>For questions regarding these Terms, billing, service agreements, or support, please contact us using the information above.</p>
            <p>
              By purchasing services from SCX Dashboards, you acknowledge that you have reviewed and agreed to the applicable service agreement, disclosed payment terms, and policies governing your purchase.
            </p>
          </section>
        </div>
      </article>
    </MarketingShell>
  );
}
