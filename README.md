# Level & Plumb

Easy step-by-step DIY home improvement guides with illustrations, photos, videos and building-code checks for your region.

**Live site:** https://vick008.github.io/Victor-Alvarado/ (after GitHub Pages is turned on, see below)

## What's inside

- **27 illustrated guides across 16 trades:** Air Conditioning, Electrical (GFCI outlet, generator inlet & interlock), Plumbing (P-trap, toilets, faucets, drains, shutoff valves, water heater), Painting, Wallpaper, Walls & Ceilings, Flooring, Doors, Windows, Cabinets, Countertops, Shelving, Exterior, Heating, Ventilation, Structure.
- A **project library** of 69 more Painting, Wallpaper and Plumbing projects, each with a one-tap AI plan and video links.
- Each guide has an animated step-by-step drawing, tools and materials lists, safety warnings, a "Watch this step" video link on every step, and the code sections an inspector checks.
- **Code region picker** (US states, Canadian provinces, UK nations, Australian states) with links to the code that applies there and local rules, such as licensed-only electrical work in Australia.
- **Project Finder:** describe any project in plain words and get a full plan with materials, tools, safety, steps and code references.
- **Photo search:** take or upload a photo of a tool, device, material or problem and get it identified, with related projects.
- **Installable app** that works offline: on a phone, open the site and choose *Add to Home Screen*.

## Turn on GitHub Pages

1. Make the repository public (Settings → General → Danger Zone → Change visibility).
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch **`gh-pages`**, folder **`/ (root)`**, and save.
4. After a minute the site is live at `https://vick008.github.io/Victor-Alvarado/`.

## Turning on the AI features (Project Finder and photo search)

The guides work for everyone with no setup. The AI planner and photo search call the Claude API, which needs an API key. Choose one option:

**Option A: each visitor uses their own key (default).** Visitors paste a Claude API key from [console.anthropic.com](https://console.anthropic.com/settings/keys) into the Project Finder. The key is saved only in that browser and usage is billed to the visitor's own Anthropic account. Because the key is stored by the browser for the whole `vick008.github.io` site, only use this option if you trust every page you host there.

**Option B: you pay, visitors need no key.** Deploy the small proxy in `worker/` to Cloudflare Workers (free plan):

```bash
cd worker
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler deploy
```

Then put the worker's URL in `config.js`:

```js
window.LP_CONFIG = { proxyUrl: 'https://level-and-plumb-ai.<your-subdomain>.workers.dev' };
```

The proxy only accepts requests from the origins listed in `worker/wrangler.toml` (`ALLOWED_ORIGINS`), forces a single model and caps output size. Anyone using your site spends your API credit, so set a monthly spend limit in the Anthropic Console and consider adding a Cloudflare rate-limiting rule.

**Never commit an API key to this repository.**

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The whole app (HTML, CSS and JavaScript) |
| `config.js` | Site settings (AI proxy URL) |
| `vendor/anthropic.mjs` | Anthropic TypeScript SDK 1.6.0, bundled for the browser (MIT license) |
| `sw.js`, `manifest.webmanifest`, `icons/` | Offline support and phone install |
| `worker/` | Optional Cloudflare Worker that holds your API key |

## Credits and disclaimer

Photos are from [Wikimedia Commons](https://commons.wikimedia.org/) under the licenses credited under each photo. Video links open YouTube searches.

Code references follow the 2021 IRC, 2021 IPC and 2023 NEC unless your region says otherwise. Cities, counties, states and provinces adopt different editions and local amendments. AI-written plans can contain mistakes. Always confirm requirements with your local building department, get permits and inspections where required, and hire a licensed professional for work you are not qualified to do.
