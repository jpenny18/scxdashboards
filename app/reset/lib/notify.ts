import { Resend } from 'resend';
import { formatUsdFromCents } from '../config';

const resend = new Resend(process.env.RESEND_API_KEY);

export type ResetReceipt = {
  localOrderId: string;
  accountId: string;
  resetType: string;
  challengeAmount: string;
  platform: string;
  resetCategory: string;
  amountCents: number;
  originalCents: number;
  discountPercent: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  discordUsername: string;
  paymentIntentId: string;
  transactionId: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendResetPaymentEmails(order: ResetReceipt): Promise<void> {
  const amount = formatUsdFromCents(order.amountCents);
  const list = formatUsdFromCents(order.originalCents);
  const name = `${order.firstName} ${order.lastName}`.trim();
  const priceLine =
    order.discountPercent === 20 ? `${amount} (list ${list}, ${order.discountPercent}% off)` : amount;

  await Promise.all([
    resend.emails.send({
      from: 'support@shockwave-capital.com',
      to: 'support@shockwave-capital.com',
      subject: `Reset payment received (${order.challengeAmount})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #0D0D0D; font-size: 22px;">Reset payment received</h1>
          <p>Card payment is confirmed. Reset the existing account. Do not open a new one.</p>
          <p><strong>Order:</strong> ${escapeHtml(order.localOrderId)}</p>
          <p><strong>Account:</strong> ${escapeHtml(order.accountId)}</p>
          <p><strong>Customer:</strong> ${escapeHtml(name)} &lt;${escapeHtml(order.email)}&gt;</p>
          <p><strong>Phone:</strong> ${escapeHtml(order.phone)}</p>
          <p><strong>Country:</strong> ${escapeHtml(order.country)}</p>
          ${order.discordUsername ? `<p><strong>Discord:</strong> ${escapeHtml(order.discordUsername)}</p>` : ''}
          <p><strong>Reset:</strong> ${escapeHtml(order.resetType)} (${escapeHtml(order.resetCategory)})</p>
          <p><strong>Size:</strong> ${escapeHtml(order.challengeAmount)}</p>
          <p><strong>Platform:</strong> ${escapeHtml(order.platform)}</p>
          <p><strong>Paid:</strong> ${escapeHtml(priceLine)}</p>
          <p><strong>Payment:</strong> ${escapeHtml(order.paymentIntentId)}</p>
        </div>
      `,
    }),
    resend.emails.send({
      from: 'support@shockwave-capital.com',
      to: order.email,
      subject: 'Payment received for your reset fee',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #0D0D0D; font-size: 22px;">Payment received</h1>
          <p>Hello ${escapeHtml(order.firstName)},</p>
          <p>Your card payment of ${escapeHtml(amount)} was received for this ${escapeHtml(order.resetType)} (${escapeHtml(order.challengeAmount)}).</p>
          <p>Profit and loss return to zero, and the balance is restored to the original starting amount. It stays the same account.</p>
          <p>Questions: support@shockwave-capital.com</p>
        </div>
      `,
    }),
  ]);
}
