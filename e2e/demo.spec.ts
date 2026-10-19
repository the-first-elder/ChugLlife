import { test, expect, type BrowserContext, type Page } from "@playwright/test";

const KEY_A =
  "0x1111111111111111111111111111111111111111111111111111111111111111" as const;
const KEY_B =
  "0x2222222222222222222222222222222222222222222222222222222222222222" as const;

async function startDemoUser(
  context: BrowserContext,
  key: string
): Promise<{ page: Page; address: string }> {
  const page = await context.newPage();
  page.on("pageerror", (err) => console.error("pageerror:", err.message));
  await page.goto("/login");

  const demoButton = page.getByRole("button", {
    name: /Try the Chug(life|Match) demo/i,
  });
  await expect(demoButton).toBeVisible();
  await page.evaluate((k) => {
    localStorage.setItem("_chugDemoPrivateKey", k);
    const helpers = (
      window as unknown as {
        __chugMatch?: { startDemo: (k: string) => void };
      }
    ).__chugMatch;
    helpers?.startDemo(k);
  }, key);
  await demoButton.click();

  await expect(
    page.getByTestId("my-address"),
    "demo identity ready"
  ).toBeVisible({ timeout: 120_000 });
  const address = (
    await page.getByTestId("my-address").textContent()
  )?.trim() as string;

  await page.goto("/conversations");
  await expect(page.getByText("Chogmates", { exact: false })).toBeVisible();
  return { page, address: address.toLowerCase() };
}

test("landing page renders the vibe pitch", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /Your Chog is/i
  );
  await expect(page.getByText(/vibe-dating/i)).toBeVisible();
  const demoLink = page.getByRole("link", { name: /Try the demo/i });
  await expect(demoLink).toBeVisible();
  await demoLink.click();
  await expect(
    page.getByRole("button", { name: /Try the Chug(life|Match) demo/i })
  ).toBeVisible();
});

test("demo mode signs in and lists chogmates", async ({ browser }) => {
  const context = await browser.newContext();
  const { page } = await startDemoUser(context, KEY_A);
  await expect(
    page.getByText(/No chogmates yet|Go make some noise/i)
  ).toBeVisible();
  // Exit demo resets state
  await page.getByTestId("logout").click();
  await expect(page).toHaveURL(/\/login/);
  await context.close();
});

test("match tab shows bundled Chogs and their vibes", async ({ browser }) => {
  const context = await browser.newContext();
  const { page } = await startDemoUser(context, KEY_A);
  await page.goto("/match");
  await expect(page.getByTestId("my-chogs-grid")).toBeVisible();
  await expect(page.locator("[data-testid=my-chogs-grid] > *").first()).toBeVisible();
  await context.close();
});
