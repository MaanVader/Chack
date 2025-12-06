// convex/auth.ts

import { query } from "./_generated/server";
import { v } from "convex/values";

export const isOnboarded = query({
  args: { userId: v.string() },
  async handler(ctx, { userId }) {
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    return Boolean(membership);
  },
});

// Get the first organization for a user (for now, we'll use the first one)
// Later we can add org switching
export const getDefaultOrg = query({
  args: { userId: v.string() },
  async handler(ctx, { userId }) {
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!membership) {
      return null;
    }

    const org = await ctx.db.get(membership.orgId as any);
    return org ? { ...org, _id: org._id, role: membership.role } : null;
  },
});
