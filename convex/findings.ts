// convex/findings.ts

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all findings for an assessment
export const list = query({
  args: {
    assessmentId: v.string(),
    severity: v.optional(v.string()), // filter by severity
    status: v.optional(v.string()), // filter by status
  },
  handler: async (ctx, args) => {
    const severity = args.severity;
    const status = args.status;
    
    if (severity) {
      return await ctx.db
        .query("findings")
        .withIndex("by_assessment_severity", (q) =>
          q.eq("assessmentId", args.assessmentId).eq("severity", severity)
        )
        .order("desc")
        .collect();
    }

    if (status) {
      return await ctx.db
        .query("findings")
        .withIndex("by_assessment_status", (q) =>
          q.eq("assessmentId", args.assessmentId).eq("status", status)
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("findings")
      .withIndex("by_assessment", (q) =>
        q.eq("assessmentId", args.assessmentId)
      )
      .order("desc")
      .collect();
  },
});

// Get a single finding by ID
export const get = query({
  args: { findingId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.findingId as any);
  },
});

// Create a new finding
export const create = mutation({
  args: {
    assessmentId: v.string(),
    title: v.string(),
    description: v.string(),
    severity: v.string(), // "critical" | "high" | "medium" | "low" | "info"
    status: v.string(), // "open" | "confirmed" | "false_positive" | "resolved"
    cweId: v.optional(v.string()),
    cvssScore: v.optional(v.number()),
    location: v.optional(v.string()),
    evidence: v.optional(v.string()),
    remediation: v.optional(v.string()),
    createdByUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("findings", {
      assessmentId: args.assessmentId,
      title: args.title,
      description: args.description,
      severity: args.severity,
      status: args.status,
      cweId: args.cweId,
      cvssScore: args.cvssScore,
      location: args.location,
      evidence: args.evidence,
      remediation: args.remediation,
      createdByUserId: args.createdByUserId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update a finding
export const update = mutation({
  args: {
    findingId: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    severity: v.optional(v.string()),
    status: v.optional(v.string()),
    remediation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { findingId, ...updates } = args;
    const existing = await ctx.db.get(findingId as any);
    if (!existing) {
      throw new Error("Finding not found");
    }

    await ctx.db.patch(findingId as any, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Generate fake findings for testing
export const generateFake = mutation({
  args: {
    assessmentId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const fakeFindings = [
      {
        assessmentId: args.assessmentId,
        title: "SQL Injection in User Authentication",
        description:
          "The application is vulnerable to SQL injection attacks in the login endpoint. User input is directly concatenated into SQL queries without proper sanitization.",
        severity: "critical",
        status: "open",
        cweId: "CWE-89",
        cvssScore: 9.8,
        location: "/api/auth/login",
        evidence:
          "POST request to /api/auth/login with payload: username=' OR '1'='1",
        remediation:
          "Use parameterized queries or prepared statements. Implement input validation and sanitization.",
        createdByUserId: args.userId,
        createdAt: now,
        updatedAt: now,
      },
      {
        assessmentId: args.assessmentId,
        title: "Cross-Site Scripting (XSS) in Comments Section",
        description:
          "The comments section does not properly sanitize user input, allowing malicious scripts to be executed in other users' browsers.",
        severity: "high",
        status: "open",
        cweId: "CWE-79",
        cvssScore: 7.2,
        location: "/comments",
        evidence: "Stored XSS payload: <script>alert('XSS')</script>",
        remediation:
          "Implement proper output encoding. Use Content Security Policy (CSP) headers.",
        createdByUserId: args.userId,
        createdAt: now,
        updatedAt: now,
      },
      {
        assessmentId: args.assessmentId,
        title: "Weak Password Policy",
        description:
          "The application allows users to set weak passwords without sufficient complexity requirements.",
        severity: "medium",
        status: "open",
        cweId: "CWE-521",
        cvssScore: 5.3,
        location: "/api/users/register",
        evidence: "Password '123456' was accepted during registration",
        remediation:
          "Enforce strong password policy: minimum 12 characters, mix of uppercase, lowercase, numbers, and special characters.",
        createdByUserId: args.userId,
        createdAt: now,
        updatedAt: now,
      },
      {
        assessmentId: args.assessmentId,
        title: "Missing Security Headers",
        description:
          "The application is missing important security headers such as X-Frame-Options, X-Content-Type-Options, and Strict-Transport-Security.",
        severity: "low",
        status: "open",
        cvssScore: 3.1,
        location: "All endpoints",
        evidence: "HTTP response headers analysis",
        remediation:
          "Add security headers: X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Strict-Transport-Security: max-age=31536000",
        createdByUserId: args.userId,
        createdAt: now,
        updatedAt: now,
      },
      {
        assessmentId: args.assessmentId,
        title: "Information Disclosure in Error Messages",
        description:
          "Error messages reveal sensitive information about the application structure and database schema.",
        severity: "info",
        status: "open",
        location: "/api/users/123",
        evidence:
          "Error message: 'Table users does not exist' when accessing invalid user ID",
        remediation:
          "Implement generic error messages for production. Log detailed errors server-side only.",
        createdByUserId: args.userId,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const ids = [];
    for (const finding of fakeFindings) {
      const id = await ctx.db.insert("findings", finding);
      ids.push(id);
    }

    return ids;
  },
});

