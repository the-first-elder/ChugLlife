# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chuglife.spec.ts >> community rooms list shows starter rooms and creation capacity
- Location: e2e/chuglife.spec.ts:50:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Capacity:')
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Capacity:') with timeout 30000ms
  - waiting for getByText('Capacity:')

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
- heading "Chuglife Rooms" [level=1]
- paragraph:
  - text: Public chatting rooms for the community. Room creators are
  - strong: Admins
  - text: ", with the power to assign"
  - strong: Chog Police
  - text: moderators, filter banned words, and ban troublemakers.
- text: Capacity
- strong: "0"
- text: / 1 rooms
- link "New Room":
  - /url: /rooms/new
  - button "New Room":
    - img
    - text: New Room
- img
- textbox "Search rooms":
  - /placeholder: Search rooms by name or vibe…
- heading "All Rooms" [level=2]
- text: 3 rooms
- link "🔥 Chog Dating & Traits Looking for your match? Compare eyes, jerseys, and find your chogmate. 1m ago Police Mod":
  - /url: /c/room-vibe-dating
  - text: 🔥
  - heading "Chog Dating & Traits" [level=3]
  - paragraph: Looking for your match? Compare eyes, jerseys, and find your chogmate.
  - text: 1m ago
  - img
  - text: Police Mod
  - img
- link "🐸 The Frog Pond Official community pond. Hang out, say gm, discuss Chogs and vibe. 1m ago Police Mod":
  - /url: /c/room-pond-alpha
  - text: 🐸
  - heading "The Frog Pond" [level=3]
  - paragraph: Official community pond. Hang out, say gm, discuss Chogs and vibe.
  - text: 1m ago
  - img
  - text: Police Mod
  - img
- link "⚡ Monad Speed Lounge 10,000 TPS chit-chat. Monad ecosystem alpha, testnet chatter, and devs. 1m ago Police Mod":
  - /url: /c/room-monad-lounge
  - text: ⚡
  - heading "Monad Speed Lounge" [level=3]
  - paragraph: 10,000 TPS chit-chat. Monad ecosystem alpha, testnet chatter, and devs.
  - text: 1m ago
  - img
  - text: Police Mod
  - img
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
> 58 |   await expect(page.getByText("Capacity:")).toBeVisible();
     |                                             ^ Error: expect(locator).toBeVisible() failed
  59 | });
  60 | 
  61 | test("chuglife shop renders room slot packs and custom flair", async ({ page }) => {
  62 |   await page.goto("/shop");
  63 |   await expect(page.getByRole("heading", { name: "Chuglife Shop" })).toBeVisible();
  64 |   await expect(page.getByText("Room Pack: 5 rooms")).toBeVisible();
  65 |   await expect(page.getByText("0.05 MON").first()).toBeVisible();
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