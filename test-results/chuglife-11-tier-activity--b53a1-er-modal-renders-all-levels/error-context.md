# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chuglife.spec.ts >> 11-tier activity rank ladder modal renders all levels
- Location: e2e/chuglife.spec.ts:5:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Hatchling')
Expected: visible
Error: strict mode violation: getByText('Hatchling') resolved to 6 elements:
    1) <span class="tracking-tight">Hatchling</span> aka getByRole('button', { name: 'Hatchling', exact: true })
    2) <span class="tracking-tight">Hatchling</span> aka getByTestId('open-rank-ladder')
    3) <span class="tracking-tight">Hatchling</span> aka getByText('Hatchling').nth(2)
    4) <div class="mt-0.5 flex items-center gap-2 text-lg font-extrabold tracking-tight">…</div> aka getByText('Hatchling🥚')
    5) <span class="tracking-tight">Hatchling</span> aka getByText('Hatchling').nth(4)
    6) <span class="truncate">Hatchling</span> aka getByText('Hatchling').nth(5)

Call log:
  - Expect "toBeVisible" getByText('Hatchling') with timeout 30000ms
  - waiting for getByText('Hatchling')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - banner [ref=e5]:
    - generic [ref=e6]:
      - link "Choglife Chuglife" [ref=e7] [cursor=pointer]:
        - /url: /
        - img "Choglife" [ref=e9]
        - generic [ref=e10]: Chuglife
      - button "Hatchling" [ref=e12] [cursor=pointer]:
        - generic "Level 1 · Hatchling Rank" [ref=e13]:
          - generic [aria-hidden] [ref=e15]: 🥚
          - generic [ref=e16]: Hatchling
  - generic [ref=e19]:
    - generic [ref=e20]:
      - generic [ref=e21]:
        - generic [ref=e22]:
          - generic [ref=e23]:
            - generic "Chog holder 0x4c8f6a01ace0dd45cfd3b5a918c6cbb553be1186" [ref=e24]: 🐸
            - generic [ref=e25]: 🥚
          - generic [ref=e26]:
            - generic [ref=e27]: Demo Chog Identity
            - generic [ref=e28]:
              - text: 0x4c8f...1186
              - button "Copy address" [ref=e29] [cursor=pointer]
        - generic [ref=e33]:
          - button "Hatchling L1 🌱 Sprout 2% 98 pts to go" [active] [ref=e34] [cursor=pointer]:
            - generic "Level 1 · Hatchling Rank" [ref=e35]:
              - generic [aria-hidden] [ref=e37]: 🥚
              - generic [ref=e38]: Hatchling
              - generic [ref=e39]: L1
            - generic [ref=e40]:
              - generic [ref=e41]:
                - generic [ref=e42]: 🌱 Sprout
                - generic [ref=e43]: 2%
              - generic [ref=e46]: 98 pts to go
          - button "Exit demo" [ref=e47] [cursor=pointer]
      - generic [ref=e51]:
        - generic [ref=e52]:
          - generic [ref=e53]:
            - strong [ref=e56]: "0"
            - text: messages sent
          - generic [ref=e57]: •
          - generic [ref=e58]:
            - strong [ref=e62]: 0h
            - text: active online
        - button "View Rank Ladder →" [ref=e63] [cursor=pointer]
    - generic [ref=e66]:
      - generic [ref=e67]:
        - heading "Chats (0)" [level=2] [ref=e68]
        - generic [ref=e69]:
          - button [ref=e70] [cursor=pointer]
          - link "New chat" [ref=e74] [cursor=pointer]:
            - /url: /match
      - generic [ref=e77]:
        - generic [ref=e78]: 🐸
        - paragraph [ref=e79]: No chogmates yet
        - paragraph [ref=e80]: Find matching Chog Genesis holders by trait, or jump into public chat rooms and climb the activity ranks!
        - generic [ref=e81]:
          - link "Vibe Match" [ref=e82] [cursor=pointer]:
            - /url: /match
          - link "Public Rooms" [ref=e85] [cursor=pointer]:
            - /url: /rooms
        - paragraph [ref=e91]: chats sync over XMTP · end-to-end encrypted
    - dialog "Chuglife Rank Ladder" [ref=e93]:
      - generic [ref=e94]:
        - generic [ref=e95]:
          - generic [ref=e96]:
            - generic [ref=e97]: 👑
            - generic [ref=e98]:
              - heading "Chuglife Rank Ladder" [level=2] [ref=e99]
              - paragraph [ref=e100]: 11 tiers · Climb through community activity
          - button "Close rank ladder" [ref=e101] [cursor=pointer]
        - generic [ref=e105]:
          - generic [ref=e106]:
            - generic [ref=e111]:
              - generic "Level 1 · Hatchling Rank" [ref=e112]:
                - generic [aria-hidden] [ref=e114]: 🥚
                - generic [ref=e115]: Hatchling
              - generic [ref=e116]: 2%
            - generic [ref=e117]:
              - generic [ref=e118]: Level 1 of 11
              - generic [ref=e119]:
                - text: Hatchling
                - generic [aria-hidden] [ref=e120]: 🥚
              - generic [ref=e121]: 2 activity pts
          - generic [ref=e123]:
            - generic [ref=e124]: "Next: 🌱 Sprout"
            - generic [ref=e125]: 98 pts to go
          - generic [ref=e128]:
            - generic [ref=e129]: 0 msgs
            - generic [ref=e132]: 0h online
            - generic [ref=e136]: 1 tiers unlocked
        - generic [ref=e139]:
          - generic [ref=e140]: Rank hierarchy
          - list [ref=e141]:
            - listitem [ref=e143]:
              - generic [ref=e144]: "1"
              - generic "Level 1 · Hatchling Rank" [ref=e145]:
                - generic [aria-hidden] [ref=e147]: 🥚
                - generic [ref=e148]: Hatchling
              - generic [ref=e149]:
                - generic [ref=e150]:
                  - generic [ref=e151]: Hatchling
                  - generic [ref=e152]: 0 pts
                - generic [ref=e153]: Tier 1
              - generic [ref=e154]: Current
            - listitem [ref=e155]:
              - generic [ref=e156]: "2"
              - generic "Level 2 · Sprout Rank" [ref=e157]:
                - generic [aria-hidden] [ref=e159]: 🌱
                - generic [ref=e160]: Sprout
              - generic [ref=e161]:
                - generic [ref=e162]:
                  - generic [ref=e163]: Sprout
                  - generic [ref=e164]: 100 pts
                - generic [ref=e165]: Tier 2
              - generic [aria-hidden] [ref=e166]: 🔒
            - listitem [ref=e167]:
              - generic [ref=e168]: "3"
              - generic "Level 3 · Tadpole Rank" [ref=e169]:
                - generic [aria-hidden] [ref=e171]: 🐸
                - generic [ref=e172]: Tadpole
              - generic [ref=e173]:
                - generic [ref=e174]:
                  - generic [ref=e175]: Tadpole
                  - generic [ref=e176]: 250 pts
                - generic [ref=e177]: Tier 3
              - generic [aria-hidden] [ref=e178]: 🔒
            - listitem [ref=e179]:
              - generic [ref=e180]: "4"
              - generic "Level 4 · Hopper Rank" [ref=e181]:
                - generic [aria-hidden] [ref=e183]: ⚡
                - generic [ref=e184]: Hopper
              - generic [ref=e185]:
                - generic [ref=e186]:
                  - generic [ref=e187]: Hopper
                  - generic [ref=e188]: 500 pts
                - generic [ref=e189]: Tier 4
              - generic [aria-hidden] [ref=e190]: 🔒
            - listitem [ref=e191]:
              - generic [ref=e192]: "5"
              - generic "Level 5 · Trailblazer Rank" [ref=e193]:
                - generic [aria-hidden] [ref=e195]: 🔥
                - generic [ref=e196]: Trailblazer
              - generic [ref=e197]:
                - generic [ref=e198]:
                  - generic [ref=e199]: Trailblazer
                  - generic [ref=e200]: 1,000 pts
                - generic [ref=e201]: Tier 5
              - generic [aria-hidden] [ref=e202]: 🔒
            - listitem [ref=e203]:
              - generic [ref=e204]: "6"
              - generic "Level 6 · Pathfinder Rank" [ref=e205]:
                - generic [aria-hidden] [ref=e207]: 💎
                - generic [ref=e208]: Pathfinder
              - generic [ref=e209]:
                - generic [ref=e210]:
                  - generic [ref=e211]: Pathfinder
                  - generic [ref=e212]: 2,000 pts
                - generic [ref=e213]: Tier 6
              - generic [aria-hidden] [ref=e214]: 🔒
            - listitem [ref=e215]:
              - generic [ref=e216]: "7"
              - generic "Level 7 · Vanguard Rank" [ref=e217]:
                - generic [aria-hidden] [ref=e219]: 👑
                - generic [ref=e220]: Vanguard
              - generic [ref=e221]:
                - generic [ref=e222]:
                  - generic [ref=e223]: Vanguard
                  - generic [ref=e224]: 4,000 pts
                - generic [ref=e225]: Tier 7
              - generic [aria-hidden] [ref=e226]: 🔒
            - listitem [ref=e227]:
              - generic [ref=e228]: "8"
              - generic "Level 8 · Elite Rank" [ref=e229]:
                - generic [aria-hidden] [ref=e231]: 🌌
                - generic [ref=e232]: Elite
              - generic [ref=e233]:
                - generic [ref=e234]:
                  - generic [ref=e235]: Elite
                  - generic [ref=e236]: 7,500 pts
                - generic [ref=e237]: Tier 8
              - generic [aria-hidden] [ref=e238]: 🔒
            - listitem [ref=e239]:
              - generic [ref=e240]: "9"
              - generic "Level 9 · Ascendant Rank" [ref=e241]:
                - generic [aria-hidden] [ref=e243]: ☄️
                - generic [ref=e244]: Ascendant
              - generic [ref=e245]:
                - generic [ref=e246]:
                  - generic [ref=e247]: Ascendant
                  - generic [ref=e248]: 13,000 pts
                - generic [ref=e249]: Tier 9
              - generic [aria-hidden] [ref=e250]: 🔒
            - listitem [ref=e251]:
              - generic [ref=e252]: "10"
              - generic "Level 10 · Mythic Rank" [ref=e253]:
                - generic [aria-hidden] [ref=e255]: 🐉
                - generic [ref=e256]: Mythic
                - generic [aria-hidden] [ref=e257]: ✨
              - generic [ref=e258]:
                - generic [ref=e259]:
                  - generic [ref=e260]: Mythic
                  - generic [ref=e261]: 21,000 pts
                - generic [ref=e262]: Tier 10
              - generic [aria-hidden] [ref=e263]: 🔒
            - listitem [ref=e264]:
              - generic [ref=e265]: "11"
              - generic "Level 11 · Legendary Rank" [ref=e266]:
                - generic [aria-hidden] [ref=e268]: ♛
                - generic [ref=e269]: Legendary
                - generic [aria-hidden] [ref=e270]: ✨
              - generic [ref=e271]:
                - generic [ref=e272]:
                  - generic [ref=e273]: Legendary
                  - generic [ref=e274]: 34,000 pts
                - generic [ref=e275]: Tier 11
              - generic [aria-hidden] [ref=e276]: 🔒
        - generic [ref=e277]:
          - generic [ref=e278]:
            - generic [ref=e279]: Chatting pushes your rank up
            - generic [ref=e282]: Hanging out boosts it too
          - paragraph [ref=e286]: Higher ranks unlock prestige badges, shop discounts & chat glow
  - navigation "Bottom Navigation" [ref=e289]:
    - generic [ref=e291]:
      - link "Chats" [ref=e292] [cursor=pointer]:
        - /url: /conversations
      - link "Explore" [ref=e299] [cursor=pointer]:
        - /url: /explore
      - link "Match" [ref=e306] [cursor=pointer]:
        - /url: /match
      - link "Rooms" [ref=e312] [cursor=pointer]:
        - /url: /rooms
      - link "My Chogs" [ref=e321] [cursor=pointer]:
        - /url: /collections
      - link "2 Shop" [ref=e328] [cursor=pointer]:
        - /url: /shop
        - generic [ref=e329]: "2"
        - generic [ref=e337]: Shop
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
> 33 |   await expect(page.getByText("Hatchling")).toBeVisible();
     |                                             ^ Error: expect(locator).toBeVisible() failed
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