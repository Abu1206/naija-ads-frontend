"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { nairaInputToKobo } from "@/lib/format";
import type { AdType, ApiError, Campaign, CampaignObjective, Creative } from "@/lib/types";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  objective: z.enum(["impressions", "clicks"]),
  ad_type: z.enum(["banner", "interstitial", "rewarded"]),
  total_budget_naira: z.coerce.number().positive("Total budget must be greater than zero."),
  daily_budget_naira: z.coerce.number().positive("Daily budget must be greater than zero."),
  destination_url: z.union([z.literal(""), z.url("Destination URL must be a full URL.")]),
});

const LOCATIONS = ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu"] as const;

export function CampaignForm({
  creatives,
  creativesError,
}: {
  creatives: Creative[];
  creativesError: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [objective, setObjective] = useState<CampaignObjective>("impressions");
  const [adType, setAdType] = useState<AdType>("banner");
  const [totalBudget, setTotalBudget] = useState("");
  const [dailyBudget, setDailyBudget] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [creativeId, setCreativeId] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  function toggleLocation(location: string) {
    setLocations((current) =>
      current.includes(location) ? current.filter((l) => l !== location) : [...current, location],
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse({
      name,
      objective,
      ad_type: adType,
      total_budget_naira: totalBudget,
      daily_budget_naira: dailyBudget,
      destination_url: destinationUrl,
    });
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((issue) => issue.message));
      return;
    }
    if (creativeId === "") {
      setErrors(["Attach a creative before submitting for review."]);
      return;
    }

    setErrors([]);
    setBusy(true);
    try {
      await apiFetch<Campaign>(endpoints.campaigns, {
        method: "POST",
        body: {
          name: parsed.data.name,
          objective: parsed.data.objective,
          ad_type: parsed.data.ad_type,
          total_budget_kobo: nairaInputToKobo(parsed.data.total_budget_naira),
          daily_budget_kobo: nairaInputToKobo(parsed.data.daily_budget_naira),
          target_country: "NG",
          target_locations: locations,
          destination_url: parsed.data.destination_url,
          creative_id: creativeId,
        },
      });
      router.push("/business/campaigns");
    } catch (err) {
      const api = err as ApiError;
      setErrors(api.fields ? Object.values(api.fields).flat() : [api.message ?? "Could not create campaign."]);
      setBusy(false);
    }
  }

  const field = "mt-1 w-full rounded-lg border px-3 py-2";

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5" noValidate>
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Campaign name
        </label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="objective" className="block text-sm font-medium">
            Objective
          </label>
          <select
            id="objective"
            value={objective}
            onChange={(e) => setObjective(e.target.value as CampaignObjective)}
            className={field}
          >
            <option value="impressions">Impressions</option>
            <option value="clicks">Clicks</option>
          </select>
        </div>
        <div>
          <label htmlFor="ad_type" className="block text-sm font-medium">
            Ad format
          </label>
          <select
            id="ad_type"
            value={adType}
            onChange={(e) => setAdType(e.target.value as AdType)}
            className={field}
          >
            <option value="banner">Banner</option>
            <option value="interstitial">Interstitial</option>
            <option value="rewarded">Rewarded video</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="total_budget" className="block text-sm font-medium">
            Total budget (₦)
          </label>
          <input
            id="total_budget"
            inputMode="decimal"
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="daily_budget" className="block text-sm font-medium">
            Daily budget (₦)
          </label>
          <input
            id="daily_budget"
            inputMode="decimal"
            value={dailyBudget}
            onChange={(e) => setDailyBudget(e.target.value)}
            className={field}
          />
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Target locations</legend>
        <p className="mb-2 text-xs text-gray-500">Country is fixed to Nigeria for MVP.</p>
        <div className="flex flex-wrap gap-3 text-sm">
          {LOCATIONS.map((location) => (
            <label key={location} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={locations.includes(location)}
                onChange={() => toggleLocation(location)}
              />
              {location}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="creative" className="block text-sm font-medium">
          Creative
        </label>
        <select
          id="creative"
          value={creativeId}
          onChange={(e) => setCreativeId(e.target.value)}
          disabled={creatives.length === 0}
          className={field}
        >
          <option value="">
            {creativesError
              ? "Creatives unavailable"
              : creatives.length === 0
                ? "No creatives uploaded yet"
                : "Select a creative"}
          </option>
          {creatives.map((creative) => (
            <option key={creative.id} value={creative.id}>
              {creative.ad_type} · {creative.id}
            </option>
          ))}
        </select>
        {creativesError && (
          <p role="alert" className="mt-1 text-sm text-red-600">
            {creativesError} — upload a creative, then reload this page.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="destination_url" className="block text-sm font-medium">
          Destination URL
        </label>
        <input
          id="destination_url"
          type="url"
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
          placeholder="https://yourbusiness.ng/offer"
          className={field}
        />
      </div>

      {errors.length > 0 && (
        <ul role="alert" className="list-disc space-y-1 pl-5 text-sm text-red-600">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-60"
        >
          {busy ? "Submitting…" : "Submit for review"}
        </button>
        <a href="/business/campaigns" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
          Cancel
        </a>
      </div>
    </form>
  );
}
