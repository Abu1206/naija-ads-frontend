# Naija Ads: Design Direction

Naija Ads is where Nigerian game and app developers get paid for the attention they've built, and where Nigerian businesses buy that attention without wrestling Google Ads. The design has to make both sides feel the same thing: this is ours, it's simple, and the money is handled properly.

This doc is the short version of every design decision so far. The live tokens and components are on the design canvas.

## The feel

Warm, but not casual about money. Think a good Lagos fintech app that a game dev would also happily screenshot and post on X. Friendly rounded headings, calm green surfaces, and one warm accent that only ever shows up when cash is involved.

Nigerian, not costumed. We use the flag's green as the brand anchor and stop there. No flag banners, no kente patterns, no green-white-green gradients behind everything. The three-bar flag motif lives in the logo mark and nowhere else.

Quiet confidence. Advertisers are trusting us with a wallet balance and developers are trusting us with a payout. Screens should feel steady: generous spacing, clear numbers, nothing bouncing around.

## Who we're designing for

Developers are mostly young, building games on mid-range Android phones, often on mobile data. They want to register an app, drop in an ad spot and see earnings without reading a manual.

Businesses are usually small shops and brands who have never run a mobile ad campaign. They need the campaign builder to feel like filling in a form, not operating a trading desk.

Admins are the referees. They scan queues all day, so status and fraud flags have to be readable at a glance.

## Colour

Green is the brand. Deep Forest is the dark surface. Gold is money. Red is trouble. Everything else is a quiet neutral with a slight green tint so nothing clashes.

| Token | Hex | Used for |
|-|-|-|
| Naija Green | #008751 | Primary buttons, links, focus rings |
| Green text | #006B40 | Green text on light backgrounds (passes contrast) |
| Deep Forest | #072B1C | Top bar, wallet card, dark sections |
| Matte Gold | #CFA24A | Balances, payouts, rewards, "Withdraw" and "Fund wallet" |
| Alert Red | #C62828 | Rejected campaigns, fraud flags, destructive actions |
| Cloud | #F4F7F1 | App background |
| White | #FFFFFF | Cards and inputs |
| Ink | #0C2216 | Body text |
| Muted | #4D6054 | Helper text, captions |
| Mist | #D9E2D6 | Borders and dividers |
| Green tint | #E3F1E8 | Approved badge, ad card illustration backgrounds |
| Gold tint | #F3EAD2 | Pending badge background |
| Red tint | #FBE3E3 | Rejected badge background |

Gold on Deep Forest is the signature pairing, and it's the first thing we want people to remember. Two rules keep it working. Gold is only ever text on Deep Forest. On light backgrounds it becomes a button fill with Ink text. And we keep it matte: the first version was too bright and read as shiny, so #CFA24A is deliberately duller. If it ever looks flashy next to the green, go duller, not brighter.

Red is rare on purpose. If red shows up on a screen, an admin or advertiser should feel they need to look at it.

## Typography

Headings and money use Quicksand, at 600 or 700. Body, buttons, labels and form fields use DM Sans. That's it, two families. We tried a mono font for balances and dropped it, because money looks more at home in the same rounded face as the headings.

| Style | Font | Size |
|-|-|-|
| Display | Quicksand 700 | 38 |
| Heading | Quicksand 600 | 24 |
| Money | Quicksand 700 | 17 to 44, depending on context |
| Body | DM Sans 400 | 16 / 24 |
| Caption | DM Sans 700 | 13 |

Two things to watch with Quicksand. It stops at bold and its strokes are thin, so never use it small or light. Use it for big, clear things only. The ₦ glyph itself always sets in the DM Sans body stack (`<Naira>` splits it out in MetricCard and WalletCard) — that stack is the rendering path proven clean on-device, while neither primary font draws ₦ reliably alone. Both fonts still load `["latin", "latin-ext"]` so the primary faces cover it where present. If the whole thing ever feels too playful once real screens exist, Outfit and Plus Jakarta Sans are the backup picks because they come in heavier weights.

Fewer fonts also means a faster first load, which matters for people on mobile data.

## Shape and space

Flat and light. Table and chart panels stand alone on the Cloud page ground with no enclosing border — the white tint carries the edge. One-pixel Mist still separates what needs separating: row dividers, title rules, popovers and the nav rail. Almost no shadows, no gradients. Radius is 8 for buttons and inputs, 14 for cards, 20 for the wallet card, and a full pill for badges. Spacing runs on 4, 8, 12, 16, 24, 32 and 48.

## Components

Buttons are at least 44 high. Primary is green with white text. Secondary is white with a green outline. Gold buttons only appear next to money (Withdraw earnings, Fund wallet). Destructive actions are outlined red, never filled. Cancel is a plain text button.

Inputs are 48 high with the label above, never as a placeholder, and a short helper line underneath in Muted.

The wallet card is Deep Forest with a small caps label, the balance in gold, and the main action below it. It is the most recognisable object in the product.

Metric tiles are Deep Forest too: white numerals for counts and rates, gold numerals for cash, labels in pale green, icons in a white wash. Errors on dark surfaces use a lightened red that still passes contrast.

Ad type cards (banner, pop-up, rewarded video, audio) show a simple flat shape for each format, the name, and the minimum CPM. The real minimum prices come from admin settings, so the design shows a placeholder until they're set.

Status badges are pills with a dot: pending review in gold tint, approved in green tint, rejected in red tint, flagged for fraud in Ink with white text.

Dashboard navigation blends into the app background (Cloud), separated from the content by a Mist border: the wordmark in ink with green, a collapse toggle beside it, nav links in muted with the active item in pine plus a thin green bar at the rail's rim. No pills, no captions. On phones the sidebar becomes a horizontal strip above the content. Gold lives in the wallet card and on cash metric numerals — never in the nav. Marketing pages carry the same Forest surface as a slim header with the same gold wordmark.

## Voice

Plain English, short sentences, no ad-tech jargon. Say "views" before "impressions" and explain CPM once, right where it first appears. Show exact naira amounts, always with the ₦ sign.

Button labels say what happens: Create campaign, Add ad spot, Withdraw earnings. Error messages say what went wrong and what to do next. A little Naija flavour in empty states and success messages is welcome if it's light and the team is comfortable with it. Never in money screens, errors, or anything an admin reads.

## Accessibility and performance

Text must hit 4.5 to 1 contrast against its background, which is why green text on light surfaces uses the darker #006B40. Tap targets are 44 or larger. Status is never shown by colour alone, so every badge carries a text label. Pages are tested at phone width first. Two font families, few weights, no heavy imagery.

## Still open

The logo and wordmark are placeholders. The real minimum CPM per ad type isn't set. Dark mode isn't designed. Empty states, error states and loading states haven't been drawn yet.

Next up are the three screens that matter most: the advertiser campaign builder, the developer's ad spot setup, and the admin review queue.
