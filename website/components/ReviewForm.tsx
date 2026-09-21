"use client";

import { useState } from "react";

export function ReviewForm({ businessId }: { businessId: number }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    const body = {
      businessId,
      authorName: String(formData.get("authorName") ?? ""),
      rating: Number(formData.get("rating")),
      comment: String(formData.get("comment") ?? ""),
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong.");
      }
      setStatus("done");
      formEl.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "done") {
    return (
      <p className="rounded-lg bg-brand-green/10 p-4 text-brand-green">
        Thanks, your review will appear after it&apos;s checked.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="authorName" className="block text-sm font-medium text-foreground">
          Your name
        </label>
        <input
          id="authorName"
          name="authorName"
          required
          maxLength={100}
          className="mt-1 w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-brand-blue focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="rating" className="block text-sm font-medium text-foreground">
          Rating
        </label>
        <select
          id="rating"
          name="rating"
          required
          defaultValue="5"
          className="mt-1 rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-brand-blue focus:outline-none"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "star" : "stars"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-foreground">
          Review
        </label>
        <textarea
          id="comment"
          name="comment"
          required
          maxLength={2000}
          rows={4}
          className="mt-1 w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-brand-blue focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="min-h-11 rounded-lg bg-brand-orange px-5 py-2.5 font-medium text-white transition hover:bg-brand-orange/90 disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
