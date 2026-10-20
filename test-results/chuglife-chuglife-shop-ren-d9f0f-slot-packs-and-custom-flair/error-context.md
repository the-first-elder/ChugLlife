# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chuglife.spec.ts >> chuglife shop renders room slot packs and custom flair
- Location: e2e/chuglife.spec.ts:61:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('0.05 MON').first()
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('0.05 MON').first() with timeout 30000ms
  - waiting for getByText('0.05 MON').first()

```

```yaml
- banner:
  - link "Choglife Chuglife":
    - /url: /
    - img "Choglife"
    - text: Chuglife
  - link "Sign in":
    - /url: /login
- img
- heading "Chuglife Shop" [level=1]
- paragraph: Room slots, power-ups and cosmetic flair — paid straight from your wallet in MON. Items unlock the moment your transfer lands.
- text: Your wallet
- img
- text: — MON points checkout — earn by chatting
- img
- strong: Turbo
- text: 2x rank progress
- img
- strong: "8"
- text: items to unlock
- img
- text: Paid in MON · settles on Monad
- paragraph: "Checkout offline: set VITE_SHOP_TREASURY in .env to accept payments."
- button "All Items" [pressed]
- button "🏘️ Room Capacity"
- button "⚡ Power-Ups"
- button "✨ Cosmetics"
- heading "Shop Catalog" [level=2]
- text: 8 items 200 MON 11,000 pts
- 'heading "Room Pack: 5 rooms" [level=3]'
- paragraph: Raise your room creation cap from 1 to 5. Keep the noise down, keep the vibes up.
- button "MON checkout offline" [disabled]:
  - img
  - text: MON checkout offline
- button "Use 11,000 pts" [disabled]:
  - img
  - text: Use 11,000 pts
- text: 900 MON 11,500 pts
- 'heading "Room Pack: 8 rooms" [level=3]'
- paragraph: Raise your room creation cap to 8. For true community landlords. Expand your network.
- button "MON checkout offline" [disabled]:
  - img
  - text: MON checkout offline
- button "Use 11,500 pts" [disabled]:
  - img
  - text: Use 11,500 pts
- text: 200 MON 10,300 pts
- heading "Turbo Vibes (1h)" [level=3]
- paragraph: Double your rank progress for one hour — climb the ladder twice as fast.
- button "MON checkout offline" [disabled]:
  - img
  - text: MON checkout offline
- button "Use 10,300 pts" [disabled]:
  - img
  - text: Use 10,300 pts
- text: 300 MON 10,500 pts
- heading "Neon Name Glow" [level=3]
- paragraph: Your name glows radioactive chog violet in every room and chat bubble.
- button "MON checkout offline" [disabled]:
  - img
  - text: MON checkout offline
- button "Use 10,500 pts" [disabled]:
  - img
  - text: Use 10,500 pts
- text: 300 MON 10,400 pts
- heading "Chog Police Badge" [level=3]
- paragraph: Honorary police shield displayed next to your handle across all public rooms.
- button "MON checkout offline" [disabled]:
  - img
  - text: MON checkout offline
- button "Use 10,400 pts" [disabled]:
  - img
  - text: Use 10,400 pts
- text: 500 MON 10,500 pts
- heading "Cosmic Neon Theme" [level=3]
- paragraph: Unlock a radiant violet particle aura on your chat bubbles and profile card.
- button "MON checkout offline" [disabled]:
  - img
  - text: MON checkout offline
- button "Use 10,500 pts" [disabled]:
  - img
  - text: Use 10,500 pts
- text: 300 MON 10,100 pts
- heading "Chog Reaction Pack" [level=3]
- paragraph: "Exclusive frog reaction set: 🚀 💎 🔥 👑 🐸 with pop animations."
- button "MON checkout offline" [disabled]:
  - img
  - text: MON checkout offline
- button "Use 10,100 pts" [disabled]:
  - img
  - text: Use 10,100 pts
- text: 1500 MON 12,500 pts
- heading "Founder Crown" [level=3]
- paragraph: A sparkling crown next to your handle. Pure prestige status. Prove you were early.
- button "MON checkout offline" [disabled]:
  - img
  - text: MON checkout offline
- button "Use 12,500 pts" [disabled]:
  - img
  - text: Use 12,500 pts
- img
- text: Room Capacity 0 / 1 rooms created
- paragraph: Every chog holder gets 1 room free. Buy 5-room or 8-room packs above to expand your chat territory.
- link "Create Room →":
  - /url: /rooms/new
- img
- text: Your Activity Rank
- button "View Full 11-Rank Ladder →"
- text: Sign in to see your rank climb the ladder.
- navigation "Bottom Navigation":
  - link "Chats":
    - /url: /login
    - img
    - text: Chats
  - link "Explore":
    - /url: /explore
    - img
    - text: Explore
  - link "Match":
    - /url: /match
    - img
    - text: Match
  - link "Rooms":
    - /url: /rooms
    - img
    - text: Rooms
  - link "My Chogs":
    - /url: /collections
    - img
    - text: My Chogs
  - link "Shop":
    - /url: /shop
    - img
    - text: Shop
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.use({ viewport: { width: 390, height: 844 } });
  4  | 
  5  | test("11-tier activity rank ladder modal renders all levels", async ({ page }) => {
  6  |   await page.goto("/login");
  7  |   await page.evaluate(() => {
  8  |     localStorage.setItem(
  9  |       "_chugDemoPrivateKey",
  10 |       "0x1111111111111111111111111111111111111111111111111111111111111111"
  11 |     );
  12 |     const helpers = (
  13 |       window as unknown as {
  14 |         __chugMatch?: { startDemo: (k: string) => void };
  15 |       }
  16 |     ).__chugMatch;
  17 |     helpers?.startDemo(
  18 |       "0x1111111111111111111111111111111111111111111111111111111111111111"
  19 |     );
  20 |   });
  21 |   await page
  22 |     .getByRole("button", { name: /Try the Chug(life|Match) demo/i })
  23 |     .click();
  24 |   await expect(page.getByTestId("my-address")).toBeVisible({
  25 |     timeout: 120_000,
  26 |   });
  27 | 
  28 |   // Open the rank ladder from the profile strip
  29 |   await page.getByTestId("open-rank-ladder").click();
  30 | 
  31 |   // Rank modal should show title and all 11 progression ranks
  32 |   await expect(page.getByText("Chuglife Rank Ladder")).toBeVisible();
  33 |   await expect(page.getByText("Hatchling")).toBeVisible();
  34 |   await expect(page.getByText("Sprout")).toBeVisible();
  35 |   await expect(page.getByText("Tadpole")).toBeVisible();
  36 |   await expect(page.getByText("Hopper")).toBeVisible();
  37 |   await expect(page.getByText("Trailblazer")).toBeVisible();
  38 |   await expect(page.getByText("Pathfinder")).toBeVisible();
  39 |   await expect(page.getByText("Vanguard")).toBeVisible();
  40 |   await expect(page.getByText("Elite")).toBeVisible();
  41 |   await expect(page.getByText("Ascendant")).toBeVisible();
  42 |   await expect(page.getByText("Mythic")).toBeVisible();
  43 |   await expect(page.getByText("Legendary")).toBeVisible();
  44 | 
  45 |   // Close modal
  46 |   await page.getByRole("button", { name: "Close" }).click();
  47 |   await expect(page.getByText("Chuglife Rank Ladder")).not.toBeVisible();
  48 | });
  49 | 
  50 | test("community rooms list shows starter rooms and creation capacity", async ({ page }) => {
  51 |   await page.goto("/rooms");
  52 |   await expect(page.getByText("Chuglife Rooms")).toBeVisible();
  53 |   await expect(page.getByText("The Frog Pond")).toBeVisible();
  54 |   await expect(page.getByText("Monad Speed Lounge")).toBeVisible();
  55 |   await expect(page.getByText("Chog Dating & Traits")).toBeVisible();
  56 | 
  57 |   // Room capacity tracker (1 free room by default)
  58 |   await expect(page.getByText("Capacity:")).toBeVisible();
  59 | });
  60 | 
  61 | test("chuglife shop renders room slot packs and custom flair", async ({ page }) => {
  62 |   await page.goto("/shop");
  63 |   await expect(page.getByRole("heading", { name: "Chuglife Shop" })).toBeVisible();
  64 |   await expect(page.getByText("Room Pack: 5 rooms")).toBeVisible();
> 65 |   await expect(page.getByText("0.05 MON").first()).toBeVisible();
     |                                                    ^ Error: expect(locator).toBeVisible() failed
  66 |   await expect(page.getByText("Room Pack: 8 rooms")).toBeVisible();
  67 |   await expect(page.getByText("0.09 MON").first()).toBeVisible();
  68 |   await expect(page.getByText("Turbo Vibes (1h)")).toBeVisible();
  69 | });
  70 | 
  71 | test("mobile bottom navigation is present with all tabs", async ({ page }) => {
  72 |   await page.goto("/rooms");
  73 |   const bottomNav = page.getByRole("navigation", { name: "Bottom Navigation" });
  74 |   await expect(bottomNav).toBeVisible();
  75 |   await expect(page.getByTestId("bottom-nav-chats")).toBeVisible();
  76 |   await expect(page.getByTestId("bottom-nav-explore")).toBeVisible();
  77 |   await expect(page.getByTestId("bottom-nav-match")).toBeVisible();
  78 |   await expect(page.getByTestId("bottom-nav-rooms")).toBeVisible();
  79 |   await expect(page.getByTestId("bottom-nav-my-chogs")).toBeVisible();
  80 |   await expect(page.getByTestId("bottom-nav-shop")).toBeVisible();
  81 | });
  82 | 
  83 | test("bottom tab bar stays the single source of navigation on desktop too", async ({ page }) => {
  84 |   await page.setViewportSize({ width: 1280, height: 900 });
  85 |   await page.goto("/rooms");
  86 |   const bottomNav = page.getByRole("navigation", { name: "Bottom Navigation" });
  87 |   await expect(bottomNav).toBeVisible();
  88 |   await expect(page.getByTestId("bottom-nav-rooms")).toBeVisible();
  89 |   // header must not show a competing nav — only the app bar actions
  90 |   await expect(page.getByTestId("nav-rooms")).toHaveCount(0);
  91 | });
  92 | 
```