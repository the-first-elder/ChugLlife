import { test, expect } from "@playwright/test";

test("11-tier activity rank ladder modal renders all levels", async ({ page }) => {
  await page.goto("/rooms");
  await expect(page.getByTestId("bottom-nav-ranks")).toBeVisible();
  await page.getByTestId("bottom-nav-ranks").click();

  // Rank modal should show title and all 11 progression ranks
  await expect(page.getByText("Activity Rank Ladder")).toBeVisible();
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
  await expect(page.getByText("Activity Rank Ladder")).not.toBeVisible();
});

test("community rooms list shows starter rooms and creation capacity", async ({ page }) => {
  await page.goto("/rooms");
  await expect(page.getByText("Community Rooms")).toBeVisible();
  await expect(page.getByText("The Frog Pond")).toBeVisible();
  await expect(page.getByText("Monad Speed Lounge")).toBeVisible();
  await expect(page.getByText("Chog Dating & Traits")).toBeVisible();

  // Room capacity tracker (1 free room by default)
  await expect(page.getByText("room slot", { exact: false })).toBeVisible();
});

test("chuglife shop renders room slot packs and custom flair", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.getByText("Chuglife Shop")).toBeVisible();
  await expect(page.getByText("5-Room Expansion Pack")).toBeVisible();
  await expect(page.getByText("1,000 MON")).toBeVisible();
  await expect(page.getByText("8-Room Mega Pack")).toBeVisible();
  await expect(page.getByText("1,500 MON")).toBeVisible();
  await expect(page.getByText("Turbo Vibes (24h)")).toBeVisible();
});

test("mobile bottom navigation is present with all tabs", async ({ page }) => {
  await page.goto("/rooms");
  const bottomNav = page.getByRole("navigation", { name: "Bottom Navigation" });
  await expect(bottomNav).toBeVisible();
  await expect(page.getByTestId("bottom-nav-chugmates")).toBeVisible();
  await expect(page.getByTestId("bottom-nav-rooms")).toBeVisible();
  await expect(page.getByTestId("bottom-nav-vibe-match")).toBeVisible();
  await expect(page.getByTestId("bottom-nav-shop")).toBeVisible();
  await expect(page.getByTestId("bottom-nav-ranks")).toBeVisible();
});
