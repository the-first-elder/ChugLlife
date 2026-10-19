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
    (await page.getByTestId("my-address").textContent()) as string
  ).trim();

  await page.goto("/conversations");
  return { page, address: address.toLowerCase() };
}

async function sendUsingNewChat(page: Page, toAddress: string, text: string) {
  await page.goto(`/new/${toAddress}`);
  await expect(page.locator("button")).toBeVisible();
  // NewConversationView auto-starts the DM once ready
  await page.waitForURL(/\/c\//, { timeout: 60_000 });
  await startTopicChat(page, text);
}

async function startTopicChat(page: Page, text: string) {
  const composer = page.getByTestId("composer-input");
  await expect(composer).toBeVisible({ timeout: 60_000 });
  await composer.fill(text);
  await page.keyboard.press("Enter");
}

test("two demo identities chat end-to-end over XMTP", async ({ browser }) => {
  test.setTimeout(300_000);
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const a = await startDemoUser(ctxA, KEY_A);
  const b = await startDemoUser(ctxB, KEY_B);

  // A opens a chat with B by address (the Vibe Match chat button does this too)
  await sendUsingNewChat(a.page, b.address, "gm from chog A 🐸");
  await expect(a.page.getByText("gm from chog A")).toBeVisible({ timeout: 60_000 });

  // B should receive the new DM and see the message
  await expect(
    b.page.getByText("gm from chog A", { exact: false })
  ).toBeVisible({ timeout: 120_000 });

  // B replies
  await b.page.getByTestId("conversation-cell").first().click();
  await startTopicChat(b.page, "gm back from chog B");
  await expect(b.page.getByText("gm back from chog B")).toBeVisible({
    timeout: 60_000,
  });

  // A sees the reply
  await expect(
    a.page.getByText("gm back from chog B", { exact: false })
  ).toBeVisible({ timeout: 120_000 });

  await ctxA.close();
  await ctxB.close();
});
