import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("11-tier activity rank ladder modal renders all levels", async ({ page }) => {
  await page.goto("/login");
  await page.evaluate(() => {
    localStorage.setItem(
      "_chugDemoPrivateKey",
      "0x1111111111111111111111111111111111111111111111111111111111111111"
    );
    const helpers = (
      window as unknown as {
        __chugMatch?: { startDemo: (k: string) => void };
      }
    ).__chugMatch;
    helpers?.startDemo(
      "0x1111111111111111111111111111111111111111111111111111111111111111"
    );
  });
  await page
    .getByRole("button", { name: /Try the Chug(life|Match) demo/i })
    .click();
  await expect(page.getByTestId("my-address")).toBeVisible({
    timeout: 120_000,
  });

  // Open the rank ladder from the profile strip
  await page.getByTestId("open-rank-ladder").click();

  // Rank modal should show title and all 11 progression ranks
  await expect(page.getByText("Chuglife Rank Ladder")).toBeVisible();
  await expect(page.getByText("Hatchling")).toBeVisible();
  await expect(page.getByText("Sprout")).toBeVisible();
  await expect(page.getByText("Tadpole")).toBeVisible();
  await expect(page.getByText("Hopper")).toBeVisible();
  await expect(page.getByText("Trailblazer")).toBeVisible();
  await expect(page.getByText("Pathfinder")).toBeVisible();
  await expect(page.getByText("Vanguard")).toBeVisible();
  await expect(page.getByText("Elite")).toBeVisible();
  await expect(page.getByText("Ascendant")).toBeVisible();
  await expect(page.getByText("Mythic")).toBeVisible();
  await expect(page.getByText("Legendary")).toBeVisible();

  // Close modal
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByText("Chuglife Rank Ladder")).not.toBeVisible();
});

test("community rooms list shows starter rooms and creation capacity", async ({ page }) => {
  await page.goto("/rooms");
  await expect(page.getByText("Chuglife Rooms")).toBeVisible();
  await expect(page.getByText("The Frog Pond")).toBeVisible();
  await expect(page.getByText("Monad Speed Lounge")).toBeVisible();
  await expect(page.getByText("Chog Dating & Traits")).toBeVisible();

  // Room capacity tracker (1 free room by default)
  await expect(page.getByText("Capacity:")).toBeVisible();
});

test("chuglife shop renders room slot packs and custom flair", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.getByRole("heading", { name: "Chuglife Shop" })).toBeVisible();
  await expect(page.getByText("Room Pack: 5 rooms")).toBeVisible();
  await expect(page.getByText("0.05 MON").first()).toBeVisible();
  await expect(page.getByText("Room Pack: 8 rooms")).toBeVisible();
  await expect(page.getByText("0.09 MON").first()).toBeVisible();
  await expect(page.getByText("Turbo Vibes (1h)")).toBeVisible();
});

test("mobile bottom navigation is present with all tabs", async ({ page }) => {
  await page.goto("/rooms");
  const bottomNav = page.getByRole("navigation", { name: "Bottom Navigation" });
  await expect(bottomNav).toBeVisible();
  await expect(page.getByTestId("bottom-nav-chats")).toBeVisible();
  await expect(page.getByTestId("bottom-nav-explore")).toBeVisible();
  await expect(page.getByTestId("bottom-nav-match")).toBeVisible();
  await expect(page.getByTestId("bottom-nav-rooms")).toBeVisible();
  await expect(page.getByTestId("bottom-nav-my-chogs")).toBeVisible();
  await expect(page.getByTestId("bottom-nav-shop")).toBeVisible();
});

test("bottom tab bar stays the single source of navigation on desktop too", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/rooms");
  const bottomNav = page.getByRole("navigation", { name: "Bottom Navigation" });
  await expect(bottomNav).toBeVisible();
  await expect(page.getByTestId("bottom-nav-rooms")).toBeVisible();
  // header must not show a competing nav — only the app bar actions
  await expect(page.getByTestId("nav-rooms")).toHaveCount(0);
});
