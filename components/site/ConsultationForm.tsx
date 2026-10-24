'use client';

import { FormEvent, useState } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function ConsultationForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setError('');

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'We could not send your request.');
      }
      form.reset();
      setStatus('success');
    } catch (submitError) {
      setStatus('error');
      setError(submitError instanceof Error ? submitError.message : 'We could not send your request.');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-8 text-center">
        <h3 className="text-xl font-semibold text-white">Consultation request received</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#8b949e]">
          We have your request and will follow up at the email you provided to discuss the project. This request is not an invoice and does not start a payment.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-2 block text-[#c9d1d9]">Name</span>
          <input
            name="name"
            required
            autoComplete="name"
            className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2.5 text-white outline-none ring-blue-500/40 placeholder:text-[#484f58] focus:ring-2"
            placeholder="Your name"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-2 block text-[#c9d1d9]">Work email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2.5 text-white outline-none ring-blue-500/40 placeholder:text-[#484f58] focus:ring-2"
            placeholder="you@company.com"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-2 block text-[#c9d1d9]">Company</span>
          <input
            name="company"
            required
            autoComplete="organization"
            className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2.5 text-white outline-none ring-blue-500/40 placeholder:text-[#484f58] focus:ring-2"
            placeholder="Company name"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-2 block text-[#c9d1d9]">What do you need built?</span>
          <textarea
            name="message"
            required
            minLength={10}
            rows={5}
            className="w-full resize-y rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2.5 text-white outline-none ring-blue-500/40 placeholder:text-[#484f58] focus:ring-2"
            placeholder="Describe the dashboards, portals, reporting, or AI tools you want to discuss."
          />
        </label>
      </div>

      {status === 'error' && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-[#8b949e]">
          Submitting this form requests a consultation. It does not place an order or take payment.
        </p>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-wait disabled:opacity-70"
        >
          {status === 'submitting' ? 'Sending…' : 'Request a consultation'}
        </button>
      </div>
    </form>
  );
}
