"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { nairaInputToKobo } from "@/lib/format";
import type { AdType, ApiError, Campaign, CampaignObjective, Creative } from "@/lib/types";
import { AD_TYPES } from "@/lib/types";
import { Button } from "./Button";
import { Field, FieldErrors, SelectInput, TextInput } from "./Field";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  objective: z.enum(["impressions", "clicks"]),
  ad_type: z.enum(AD_TYPES),
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

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5" noValidate>
      <Field id="name" label="Campaign name" helper="Something you will recognise later, like “Detty December sales”.">
        <TextInput id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="objective"
          label="Objective"
          helper={objective === "clicks" ? "You pay when someone taps your ad." : "You pay for every 1,000 times your ad is seen."}
        >
          <SelectInput
            id="objective"
            value={objective}
            onChange={(e) => setObjective(e.target.value as CampaignObjective)}
          >
            <option value="impressions">Views</option>
            <option value="clicks">Clicks</option>
          </SelectInput>
        </Field>
        <Field id="ad_type" label="Ad format">
          <SelectInput id="ad_type" value={adType} onChange={(e) => setAdType(e.target.value as AdType)}>
            <option value="banner">Banner</option>
            <option value="interstitial">Interstitial</option>
            <option value="rewarded">Rewarded video</option>
            <option value="audio">Audio</option>
          </SelectInput>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="total_budget" label="Total budget (₦)" helper="The most this campaign can ever spend.">
          <TextInput
            id="total_budget"
            inputMode="decimal"
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
          />
        </Field>
        <Field id="daily_budget" label="Daily budget (₦)" helper="Spending pauses each day once this is hit.">
          <TextInput
            id="daily_budget"
            inputMode="decimal"
            value={dailyBudget}
            onChange={(e) => setDailyBudget(e.target.value)}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-ink">Target locations</legend>
        <p className="mb-2 text-xs text-muted">Country is fixed to Nigeria for MVP.</p>
        <div className="flex flex-wrap gap-3 text-sm text-ink">
          {LOCATIONS.map((location) => (
            <label key={location} className="flex min-h-[44px] items-center gap-2">
              <input
                type="checkbox"
                checked={locations.includes(location)}
                onChange={() => toggleLocation(location)}
                className="h-4 w-4 accent-naija"
              />
              {location}
            </label>
          ))}
        </div>
      </fieldset>

      <Field id="creative" label="Creative" helper="The picture, video or sound people will see.">
        <SelectInput
          id="creative"
          value={creativeId}
          onChange={(e) => setCreativeId(e.target.value)}
          disabled={creatives.length === 0}
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
        </SelectInput>
      </Field>
      {creativesError && (
        <p role="alert" className="text-sm text-alert">
          {creativesError} — upload a creative, then reload this page.
        </p>
      )}

      <Field
        id="destination_url"
        label="Destination URL"
        helper="Where people land when they tap your ad."
      >
        <TextInput
          id="destination_url"
          type="url"
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
          placeholder="https://yourbusiness.ng/offer"
        />
      </Field>

      <FieldErrors errors={errors} />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Submitting…" : "Submit for review"}
        </Button>
        <Button variant="ghost" onClick={() => router.push("/business/campaigns")} type="button">
          Cancel
        </Button>
      </div>
    </form>
  );
}
