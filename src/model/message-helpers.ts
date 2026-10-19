import db from "./db";

/**
 * Shared reaction persistence helpers (used by both the network message
 * processor and the optimistic reaction sender).
 */
export async function applyReactionLike(
  action: "added" | "removed",
  reaction: { reactor: string; name: string; messageXMTPID: string }
) {
  if (action === "added") {
    const existing = await db.reactions
      .where("[messageXMTPID+reactor+name]")
      .equals([reaction.messageXMTPID, reaction.reactor, reaction.name])
      .first();
    if (existing) return;
    await db.reactions.add(reaction);
  } else {
    await db.reactions
      .where("[messageXMTPID+reactor+name]")
      .equals([reaction.messageXMTPID, reaction.reactor, reaction.name])
      .delete();
  }
}
