import MarketingShell from '@/components/site/MarketingShell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refunds and cancellation',
  description: 'Refund and cancellation policy for SCX Dashboards Ltd custom development projects and monthly management services.',
};

const linkClass = 'text-blue-400 hover:text-blue-300';

export default function RefundPage() {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">Legal</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Refund &amp; Cancellation Policy</h1>
        <p className="mt-4 text-sm text-[#8b949e]">Effective date: October 20, 2026</p>
        <p className="mt-1 text-sm text-[#8b949e]">Last updated: October 20, 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-[#c9d1d9] sm:text-base">
          <section className="space-y-3">
            <p>
              SCX Dashboards (&ldquo;SCX Dashboards,&rdquo; &ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) provides customized business software development, AI-powered dashboards, integrations, and ongoing software management services.
            </p>
            <p>
              Because our services are individually designed and delivered according to each client&rsquo;s requirements, refund eligibility depends on the nature of the purchased service, the stage of development, and the terms of the accepted project agreement.
            </p>
            <p>This policy explains how refunds, project cancellations, and recurring subscription cancellations are handled.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">1. Custom Software Development Fees</h2>
            <p>Development and implementation services are individually quoted and priced according to project requirements.</p>
            <p>
              The total cost, payment schedule, deliverables, and any applicable milestones are established in an accepted quotation, proposal, or service agreement before payment.
            </p>
            <p>Development fees may be collected upfront or through agreed project milestones.</p>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">1.1 Cancellation Before Development Begins</h3>
              <p>Clients may request cancellation before substantive development work begins.</p>
              <p>
                Where no substantive work has been performed, clients will generally be eligible for a refund of their payment, less any explicitly authorized, documented, and non-recoverable expenses already incurred for the project.
              </p>
              <p>Any deductions will be explained to the client.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">1.2 Cancellation After Development Begins</h3>
              <p>Once development begins, fees attributable to work already performed and authorized, non-recoverable project expenses are generally non-refundable.</p>
              <p>If a client cancels an active project, SCX Dashboards will assess:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Development work already completed.</li>
                <li>Completed and accepted project milestones.</li>
                <li>Work in progress.</li>
                <li>Third-party services or licenses purchased specifically for the project.</li>
                <li>Amounts prepaid for services not yet performed.</li>
                <li>Applicable terms of the accepted service agreement.</li>
              </ul>
              <p>
                Where the client has prepaid for work that has not been performed, the unused portion may be eligible for a partial refund after accounting for earned fees and authorized non-recoverable costs.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">1.3 Completed Projects</h3>
              <p>Fees for fully completed and accepted development services are generally non-refundable.</p>
              <p>
                If delivered software materially fails to meet agreed specifications, the client should notify SCX Dashboards so the issue can be investigated.
              </p>
              <p>Where a discrepancy falls within the agreed project scope, we will have a reasonable opportunity to correct the issue.</p>
              <p>
                Refunds, corrective work, or other remedies may be available where required by applicable law or the relevant service agreement.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">1.4 Project Delays</h3>
              <p>Project delivery timelines are established individually.</p>
              <p>
                If a project experiences a material delay, SCX Dashboards will communicate the reason and provide a revised estimated schedule where practicable.
              </p>
              <p>
                A delay does not automatically entitle the client to a full refund, particularly where work has already been performed or the delay resulted from unavailable client information, requested scope changes, or third-party dependencies.
              </p>
              <p>
                Where SCX Dashboards materially fails to perform its contractual obligations and does not remedy the failure within a reasonable period after receiving written notice, the client may be entitled to an appropriate refund or other contractual remedy.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">2. Monthly Management Subscriptions</h2>
            <p>SCX Dashboards may provide recurring services including:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Software hosting and infrastructure management.</li>
              <li>Technical maintenance and software updates.</li>
              <li>AI integrations and associated management.</li>
              <li>Dashboard monitoring and support.</li>
              <li>Database and third-party integration management.</li>
              <li>Other services specified in the client&rsquo;s agreement.</li>
            </ul>
            <p>Recurring fees are individually negotiated and generally range from $2,000 to $5,000 USD per month.</p>
            <p>The exact amount, billing schedule, and subscription commencement date are disclosed before subscription activation.</p>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">2.1 Automatic Renewal</h3>
              <p>Unless otherwise specified in the accepted agreement, monthly subscriptions automatically renew at the end of each billing period.</p>
              <p>Clients expressly authorize the recurring charges disclosed during subscription enrollment.</p>
              <p>Subscription amounts will not be increased without advance disclosure and any authorization required by law or the client&rsquo;s agreement.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">2.2 Cancelling a Subscription</h3>
              <p>Clients may request subscription cancellation at any time by emailing:</p>
              <p>
                <a href="mailto:support@scxdashboards.com" className={linkClass}>
                  support@scxdashboards.com
                </a>
              </p>
              <p>Where an online billing management portal is available, clients may also cancel through that portal.</p>
              <p>
                Unless a separately accepted agreement specifies a different contractual commitment, cancellation will take effect at the end of the current paid billing period.
              </p>
              <p>No further subscription renewal will be charged after the effective cancellation date.</p>
              <p>Cancellation requests should be submitted before the next scheduled billing date to avoid another renewal.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">2.3 Refunds for Subscription Payments</h3>
              <p>Fees for an active monthly service period are generally non-refundable once that period has begun.</p>
              <p>Partial-month refunds are not ordinarily provided for voluntary mid-cycle cancellations.</p>
              <p>However, refunds or service credits may be available in circumstances involving:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Duplicate or erroneous billing.</li>
                <li>Charges made without appropriate authorization.</li>
                <li>A verified failure by SCX Dashboards to provide materially contracted services.</li>
                <li>Other circumstances in which a refund is required by applicable law or an agreement.</li>
              </ul>
              <p>Each eligible request will be assessed according to the circumstances.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">2.4 Effect of Cancellation</h3>
              <p>When a managed service subscription ends, associated services may also be discontinued.</p>
              <p>
                Depending on the client&rsquo;s technical arrangement, this may include hosting, database administration, managed AI integrations, software updates, and technical support.
              </p>
              <p>Cancellation does not necessarily eliminate the client&rsquo;s rights to deliverables already purchased under a separate development agreement.</p>
              <p>Any applicable data export, transition assistance, or continued hosting arrangements will be governed by the relevant service agreement.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. Changes to Project Scope</h2>
            <p>
              Requests for additional features, technical integrations, expanded functionality, or modifications outside the original scope may require additional fees.
            </p>
            <p>All material changes and associated charges must be approved before additional work is billed.</p>
            <p>If a client chooses not to proceed with a proposed scope change, no charge will be made for that unapproved additional work.</p>
            <p>Previously authorized work remains subject to its original agreement and payment terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. Duplicate, Incorrect, or Unauthorized Charges</h2>
            <p>
              If a client believes that a payment was processed incorrectly, duplicated, or without authorization, they should contact SCX Dashboards promptly.
            </p>
            <p>We will investigate the payment history and relevant transaction information.</p>
            <p>Verified duplicate or erroneous charges will be refunded as appropriate.</p>
            <p>Suspected fraudulent or unauthorized transactions may require additional verification and coordination with Stripe or the client&rsquo;s payment provider.</p>
            <p>Nothing in this policy restricts a client&rsquo;s rights to contact their financial institution or exercise applicable payment dispute rights.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. How to Request a Refund</h2>
            <p>To request a refund or project cancellation, clients should contact:</p>
            <p>
              <strong className="text-white">Email:</strong>{' '}
              <a href="mailto:support@scxdashboards.com" className={linkClass}>
                support@scxdashboards.com
              </a>
              <br />
              <strong className="text-white">Subject:</strong> Refund Request – SCX Dashboards
            </p>
            <p>Please include:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Business or organization name.</li>
              <li>Contact information associated with the purchase.</li>
              <li>Invoice or transaction reference, if available.</li>
              <li>Date and amount of payment.</li>
              <li>Reason for requesting a refund or cancellation.</li>
            </ul>
            <p>Our team will review the request against the accepted agreement, project status, documented work, and applicable legal requirements.</p>
            <p>
              We aim to acknowledge requests within three business days and provide a substantive response within ten business days, subject to any additional investigation required.
            </p>
            <p>Approved refunds will be initiated promptly after approval.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. Refund Processing</h2>
            <p>Where technically supported, refunds will be issued to the original payment method used for the transaction.</p>
            <p>Payments processed through Stripe will generally be refunded through Stripe.</p>
            <p>
              Once a refund is initiated, the time required for the funds to appear in the customer&rsquo;s account depends on the payment method, financial institution, and payment processor.
            </p>
            <p>Bank processing timelines may vary, and SCX Dashboards cannot guarantee an exact date on which refunded funds will appear.</p>
            <p>
              Refunds will generally be issued in the original transaction currency, subject to payment-provider requirements. Exchange-rate fluctuations or bank conversion fees may affect the amount received in another currency.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">7. Payment Disputes</h2>
            <p>
              We encourage clients to contact our support team regarding billing errors, service concerns, or refund requests so that issues can be investigated and resolved efficiently.
            </p>
            <p>Clients retain all applicable rights to dispute transactions with their financial institution or payment provider.</p>
            <p>
              SCX Dashboards may provide relevant transaction records, signed agreements, payment authorizations, development documentation, and delivery records when responding to payment disputes.
            </p>
            <p>We will not knowingly submit inaccurate or misleading information in connection with a payment dispute.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">8. Exceptions and Applicable Law</h2>
            <p>
              This policy applies unless a separately accepted written agreement establishes different, legally enforceable refund or cancellation terms for a particular project or subscription.
            </p>
            <p>Nothing in this policy excludes or limits rights and remedies that cannot legally be waived.</p>
            <p>
              Where applicable law requires a refund, cancellation right, or other remedy, those requirements will take precedence over conflicting provisions of this policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">9. Policy Updates</h2>
            <p>SCX Dashboards may update this Refund &amp; Cancellation Policy to reflect changes in services, payment methods, or applicable requirements.</p>
            <p>Updates will be published on our website with a revised effective date.</p>
            <p>Changes will not retroactively eliminate refund rights or materially alter agreed contractual rights without appropriate authorization.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">10. Contact Information</h2>
            <p>For refunds, billing questions, subscription cancellations, or payment assistance, please contact:</p>
            <p>
              <strong className="text-white">SCX Dashboards</strong>
              <br />
              <strong className="text-white">Operating legal entity:</strong> SCX Dashboards Ltd
              <br />
              <strong className="text-white">Country:</strong> Canada
              <br />
              <strong className="text-white">Email:</strong>{' '}
              <a href="mailto:support@scxdashboards.com" className={linkClass}>
                support@scxdashboards.com
              </a>
              <br />
              <strong className="text-white">Website:</strong>{' '}
              <a href="https://www.scxdashboards.com" className={linkClass}>
                www.scxdashboards.com
              </a>
            </p>
            <p>Our team will review requests in accordance with this policy, applicable client agreements, and relevant legal requirements.</p>
          </section>
        </div>
      </article>
    </MarketingShell>
  );
}
