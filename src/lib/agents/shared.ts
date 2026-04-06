import Anthropic from "@anthropic-ai/sdk";

// ---------------------------------------------------------------------------
// Claude API Client
// ---------------------------------------------------------------------------

let _client: Anthropic | null = null;

export function getClaudeClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export type ClaudeModel =
  | "claude-haiku-4-5-20251001"
  | "claude-sonnet-4-20250514"
  | "claude-opus-4-0-20250514";

export async function callClaude(
  prompt: string,
  opts: {
    system?: string;
    model?: ClaudeModel;
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const client = getClaudeClient();
  const model = opts.model ?? "claude-sonnet-4-20250514";
  const maxTokens = opts.maxTokens ?? 4096;

  const msg = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature: opts.temperature ?? 0.7,
    ...(opts.system ? { system: opts.system } : {}),
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  return {
    text,
    inputTokens: msg.usage.input_tokens,
    outputTokens: msg.usage.output_tokens,
  };
}

// ---------------------------------------------------------------------------
// Agent Logger — writes to agent_logs table in Supabase
// ---------------------------------------------------------------------------

export interface LogEntry {
  agent_name: string;
  action: string;
  details?: Record<string, unknown>;
  property_id?: string;
  status: "completed" | "failed" | "partial";
  tokens_used?: number;
  duration_ms?: number;
}

export async function logAgentAction(entry: LogEntry): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

  try {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = await createServiceClient();
    await supabase.from("agent_logs").insert({
      agent_name: entry.agent_name,
      action: entry.action,
      details: entry.details ?? null,
      property_id: entry.property_id ?? null,
      status: entry.status,
      tokens_used: entry.tokens_used ?? null,
      duration_ms: entry.duration_ms ?? null,
    });
  } catch (err) {
    console.error("Failed to log agent action:", err);
  }
}

/** Fetch recent logs for a given agent (or all agents). */
export async function getAgentLogs(
  agentName?: string,
  limit = 20
): Promise<LogEntry[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  try {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = await createServiceClient();
    let query = supabase
      .from("agent_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (agentName) query = query.eq("agent_name", agentName);

    const { data } = await query;
    return (data ?? []) as LogEntry[];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Cron Auth Middleware
// ---------------------------------------------------------------------------

export function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

// ---------------------------------------------------------------------------
// Helper: timed execution wrapper
// ---------------------------------------------------------------------------

export async function timedExecution<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration_ms: number }> {
  const start = Date.now();
  const result = await fn();
  return { result, duration_ms: Date.now() - start };
}
