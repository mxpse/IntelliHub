/*
 * IntelliHub — Knowledge Base Data
 * Internal wiki, KB articles, playbooks, and resolved cases
 * All content is team-specific knowledge for the AI to reference.
 */

const KNOWLEDGE_BASE = {
  policies: [
    {
      id: "KB-204",
      type: "policy",
      title: "Configuration Troubleshooting Guide",
      content: "When troubleshooting unexpected reimbursement results, systematically validate each configuration layer before modifying values. Review areas include: rule hierarchy, calculation sequence, interval definitions, supporting adjustment logic, policy conditions, and test scenario design. Always confirm the source-of-record value before making changes in any environment.",
      tags: ["configuration", "troubleshooting", "reimbursement", "rule hierarchy"],
      status: "Approved",
      lastUpdated: "2025-11-15"
    },
    {
      id: "KB-301",
      type: "policy",
      title: "Change Control Process for Configuration Updates",
      content: "All configuration changes in production environments must follow the change control process: 1) Document the current state, 2) Identify the specific rule or value to change, 3) Test in a controlled scenario, 4) Obtain SME approval, 5) Implement with rollback plan, 6) Validate post-change. Emergency changes require post-implementation review within 48 hours.",
      tags: ["change control", "production", "configuration", "process"],
      status: "Approved",
      lastUpdated: "2025-10-22"
    },
    {
      id: "KB-156",
      type: "policy",
      title: "Data Classification and Handling Standards",
      content: "Team data is classified into four tiers: Tier 1 (Public), Tier 2 (Internal), Tier 3 (Confidential), Tier 4 (Restricted). Configuration data falls under Tier 3. CRM case data with client identifiers is Tier 4. All file exports must strip Tier 4 identifiers before sharing. Excel exports default to Tier 2 unless they contain configuration values.",
      tags: ["data classification", "security", "handling", "export"],
      status: "Approved",
      lastUpdated: "2025-09-30"
    },
    {
      id: "KB-089",
      type: "policy",
      title: "Escalation Matrix for Configuration Issues",
      content: "Escalation criteria: Level 1 — Team member self-resolves using KB and playbooks (0-4 hours). Level 2 — Engage SME if issue persists or affects multiple regions (4-8 hours). Level 3 — Engage Configuration Team Lead if production impact detected (immediate). Level 4 — Cross-functional escalation if platform-level issue suspected. Always document escalation rationale in the CRM case.",
      tags: ["escalation", "process", "configuration", "support"],
      status: "Approved",
      lastUpdated: "2025-12-01"
    }
  ],

  playbooks: [
    {
      id: "PLAY-015",
      type: "playbook",
      title: "Confirm Configuration Precedence Before Changing Values",
      content: "Validated team best practice: Always review the full rule evaluation sequence and supporting adjustment logic before modifying any reimbursement configuration value. Steps: 1) Identify all rules affecting the calculation, 2) Map the evaluation order, 3) Check for conflicting interval definitions, 4) Test with an isolated scenario, 5) Document findings before making changes. This prevents unintended cascading changes across related rules.",
      tags: ["configuration", "precedence", "reimbursement", "best practice"],
      status: "Validated",
      lastUpdated: "2025-11-20"
    },
    {
      id: "PLAY-022",
      type: "playbook",
      title: "Multi-Region Configuration Validation Checklist",
      content: "When validating configurations across regions: 1) Confirm base configuration is identical across regions, 2) Identify region-specific overrides, 3) Verify override precedence matches documented hierarchy, 4) Test each region independently using region-specific scenarios, 5) Compare outputs across regions for consistency, 6) Document any intentional differences with business justification.",
      tags: ["multi-region", "validation", "checklist", "configuration"],
      status: "Validated",
      lastUpdated: "2025-10-15"
    },
    {
      id: "PLAY-031",
      type: "playbook",
      title: "Root Cause Analysis Template for CRM Cases",
      content: "For every resolved CRM case, document: 1) Initial symptom reported, 2) Configuration area investigated, 3) Root cause identified (which specific rule, value, or sequence caused the issue), 4) Resolution applied, 5) Validation method used, 6) Preventive recommendation. Use the standard RCA template in the CRM system. Link to any KB articles referenced during resolution.",
      tags: ["RCA", "root cause", "CRM", "documentation", "template"],
      status: "Validated",
      lastUpdated: "2025-11-05"
    },
    {
      id: "PLAY-018",
      type: "playbook",
      title: "Controlled Test Scenario Design for Configuration Issues",
      content: "When designing a test scenario to isolate a configuration issue: 1) Use minimal data — only the fields relevant to the suspected rule, 2) Control all date and time variables, 3) Test one rule change at a time, 4) Compare against a known-good baseline, 5) Document expected vs actual results at each step. A well-designed test scenario should isolate a single configuration layer.",
      tags: ["testing", "scenario design", "isolation", "configuration"],
      status: "Validated",
      lastUpdated: "2025-10-28"
    }
  ],

  precedents: [
    {
      id: "CRM-101",
      type: "precedent",
      title: "Secondary Interval Rule Override — EMEA",
      content: "A secondary interval rule overrode the full-day classification for travel days spanning midnight boundaries. Resolution: Corrected rule evaluation sequence — interval definition moved below travel-period classification in precedence. Root cause was identified by mapping all rules affecting the travel-day calculation and finding the conflict.",
      region: "EMEA",
      similarity: 0.94,
      tags: ["interval", "travel", "rule precedence", "midnight boundary"],
      outcome: "Resolved",
      lastUpdated: "2025-08-12"
    },
    {
      id: "CRM-107",
      type: "precedent",
      title: "Adjustment Logic Timing Issue — Americas",
      content: "Adjustment logic applied partial-day deduction before the travel-period rule was evaluated. Resolution: Reordered policy condition evaluation so adjustment logic fires after period classification. The issue affected all multi-day domestic travel scenarios in the Americas region until the evaluation sequence was corrected.",
      region: "Americas",
      similarity: 0.91,
      tags: ["adjustment logic", "timing", "partial-day", "travel period"],
      outcome: "Resolved",
      lastUpdated: "2025-09-03"
    },
    {
      id: "CRM-114",
      type: "precedent",
      title: "Conflicting Interval Definitions Across Layers — APAC",
      content: "Multiple interval definitions conflicted across configuration layers. The lowest-level rule produced a partial-day cap unexpectedly. Resolution: Isolated conflicting layers using a controlled test scenario and removed the redundant interval definition from the lower layer. This pattern occurs when configuration is copied between regions without reviewing layer-specific overrides.",
      region: "APAC",
      similarity: 0.87,
      tags: ["interval conflict", "layers", "partial-day cap", "regional copy"],
      outcome: "Resolved",
      lastUpdated: "2025-07-20"
    },
    {
      id: "CRM-128",
      type: "precedent",
      title: "Currency Conversion Rule Interaction — Global",
      content: "Currency conversion rules interacted with per-diem calculation, causing incorrect amounts for cross-border travel. The conversion was applied before the per-diem tier was determined, resulting in amounts that fell into the wrong tier bracket. Resolution: Moved currency conversion to execute after per-diem tier classification.",
      region: "Global",
      similarity: 0.78,
      tags: ["currency", "conversion", "per-diem", "cross-border"],
      outcome: "Resolved",
      lastUpdated: "2025-10-01"
    },
    {
      id: "CRM-135",
      type: "precedent",
      title: "Weekend Override Not Applying for Holiday Periods",
      content: "Weekend override rules were not applying during holiday periods because the holiday rule had higher precedence and consumed the day classification before the weekend rule could evaluate. Resolution: Added a compound condition that checks both holiday and weekend status simultaneously rather than sequentially.",
      region: "EMEA",
      similarity: 0.82,
      tags: ["weekend", "holiday", "override", "compound condition"],
      outcome: "Resolved",
      lastUpdated: "2025-11-10"
    }
  ],

  wiki: [
    {
      id: "WIKI-001",
      type: "wiki",
      title: "Team Onboarding — Configuration Fundamentals",
      content: "New team members should familiarize themselves with: 1) The configuration hierarchy (global > regional > local), 2) Rule evaluation sequence (conditions checked top-to-bottom, first match wins unless overridden), 3) The difference between interval definitions and period classifications, 4) How adjustment logic interacts with base calculations. Complete the Configuration Fundamentals module before handling live cases.",
      tags: ["onboarding", "fundamentals", "training", "new member"],
      status: "Current",
      lastUpdated: "2025-12-01"
    },
    {
      id: "WIKI-002",
      type: "wiki",
      title: "Common Configuration Patterns and Anti-Patterns",
      content: "Patterns: 1) Single-responsibility rules (one rule, one behavior), 2) Layered overrides with explicit precedence, 3) Test-first configuration changes. Anti-patterns: 1) Copying configuration between regions without review, 2) Modifying values before understanding the evaluation sequence, 3) Stacking multiple adjustment rules without documenting interactions, 4) Bypassing change control for 'minor' changes.",
      tags: ["patterns", "anti-patterns", "configuration", "best practices"],
      status: "Current",
      lastUpdated: "2025-11-18"
    },
    {
      id: "WIKI-003",
      type: "wiki",
      title: "File Formats and Data Export Standards",
      content: "When exporting data for analysis: CSV format uses comma delimiters with UTF-8 encoding. TXT format uses tab delimiters. All exports must include a header row. Date formats follow ISO 8601 (YYYY-MM-DD). Currency values include the currency code as a separate column. Do not include row IDs or internal system identifiers in external-facing exports. Maximum recommended file size for Excel imports is 50MB.",
      tags: ["export", "file format", "CSV", "TXT", "standards"],
      status: "Current",
      lastUpdated: "2025-10-10"
    },
    {
      id: "WIKI-004",
      type: "wiki",
      title: "CRM Case Documentation Standards",
      content: "Every CRM case must include: 1) Clear problem statement, 2) Steps to reproduce, 3) Expected vs actual behavior, 4) Configuration area affected, 5) Region and scope of impact, 6) Resolution steps taken, 7) Root cause (if determined), 8) Linked KB articles or playbook entries referenced. Cases without proper documentation cannot be used as precedent for future resolution guidance.",
      tags: ["CRM", "documentation", "standards", "case management"],
      status: "Current",
      lastUpdated: "2025-11-25"
    },
    {
      id: "WIKI-005",
      type: "wiki",
      title: "AI Assistant Usage Guidelines",
      content: "IntelliHub AI provides suggestions based on approved policies, validated playbooks, and historical precedent. Guidelines: 1) AI recommendations require human review before action, 2) Always verify cited sources, 3) AI cannot approve changes or bypass governance, 4) Report any AI response that contradicts approved policy, 5) AI confidence scores are illustrative, not guarantees. The AI does not have access to live systems or real-time data.",
      tags: ["AI", "guidelines", "governance", "usage"],
      status: "Current",
      lastUpdated: "2025-12-05"
    }
  ]
};

/* ---- Team Conversation Thread ---- */
const TEAM_CONVERSATION = {
  channel: "CRM Resolution — Global Operations",
  people: {
    marco: { name: "Marco Oliveira", role: "Senior Configuration Consultant", region: "Brazil", initials: "MO", color: "#6264a7" },
    lena: { name: "Lena Dvorakova", role: "Platform Configuration Engineer", region: "Czech Republic", initials: "LD", color: "#2e7d5b" },
    rajesh: { name: "Rajesh Kapoor", role: "Configuration Team Lead", region: "India", initials: "RK", color: "#c4571f" },
    jason: { name: "Jason Torres", role: "Configuration Specialist", region: "US", initials: "JT", color: "#3572a5" },
    ai: { name: "IntelliHub AI", role: "Knowledge Companion", region: "", initials: "AI", color: "#0a6ed1", bot: true },
  },
  messages: [
    {
      person: "marco",
      time: "09:12",
      body: "Hey team — I'm seeing an issue with international travel reimbursement configuration. A multi-day travel scenario is producing partial-day results when the full-day rate should apply. The itinerary clearly spans complete days but the system is calculating as if some days are partial."
    },
    {
      person: "lena",
      time: "09:15",
      body: "I've seen something similar before. The first thing I'd check is the travel-period classification — how the system determines whether a day counts as full or partial. There are usually threshold rules for departure and arrival times that affect how each day is categorized."
    },
    {
      person: "rajesh",
      time: "09:18",
      body: "Good point, Lena. Also check the configuration hierarchy — rule precedence matters here. If there's a general interval definition that conflicts with the specific travel-period rule, the wrong one might be winning. And look at supporting adjustment logic — deduction or proration rules that could override the base calculation."
    },
    {
      person: "jason",
      time: "09:21",
      body: "I had a similar case last month with a US-based scenario. The issue was that policy conditions were evaluated before the interval definitions, so the system was applying a partial-day cap before it even determined the correct travel period. Once we sorted out the evaluation sequence, the full-day rate applied correctly."
    },
    {
      person: "ai",
      time: "09:22",
      isRecommendation: true,
      title: "Review Configuration Precedence Before Changing Values",
      body: "I found relevant approved knowledge, 14 comparable historical CRM cases, and validated team practices that apply to this scenario.",
      nextStep: "Review configuration precedence and calculation sequence before modifying reimbursement values.",
      citations: ["KB-204", "PLAY-015", "CRM-101", "CRM-107", "CRM-114"],
      confidence: 0.91,
    },
    {
      person: "marco",
      time: "09:24",
      body: "Has anyone encountered multi-day travel configurations producing partial-day results unexpectedly? Is this a known pattern?"
    },
  ]
};

/* Export for use in app */
window.KNOWLEDGE_BASE = KNOWLEDGE_BASE;
window.TEAM_CONVERSATION = TEAM_CONVERSATION;
