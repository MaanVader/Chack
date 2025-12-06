// convex/organizations.ts

import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all organizations for a user (via memberships)
export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get all memberships for the user
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get organization details for each membership
    const orgs = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get(membership.orgId as any);
        return org
          ? {
              ...org,
              _id: org._id,
              role: membership.role,
              membershipId: membership._id,
            }
          : null;
      })
    );

    return orgs.filter((org) => org !== null);
  },
});

// Get a single organization by ID
export const get = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orgId as any);
  },
});

