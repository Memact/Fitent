import { fetchWithTimeout, isAbortError, verifyConnectionRequest } from "./_auth.js";

const MEMACT_BASE_URL = process.env.MEMACT_BASE_URL || "https://api.memact.com";
const MEMACT_API_KEY = process.env.MEMACT_API_KEY || "";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "method_not_allowed" });
  }

  const connectionId = request.query?.connection_id || "";
  if (!connectionId) {
    return response.status(400).json({ error: "missing_connection_id" });
  }

  const auth = verifyConnectionRequest(request, connectionId);
  if (!auth.ok) {
    return response.status(auth.status).json({ error: auth.error });
  }

  if (!MEMACT_API_KEY) {
    return response.status(200).json({
      connected: true,
      status: "memact_not_configured",
      context: {},
      missing: ["age", "weight", "height", "activity", "goal", "dietaryPreference", "allergies"]
    });
  }

  try {
    const payload = await readFitentContext(connectionId);
    return response.status(200).json({
      connected: true,
      context: normalizeMemactMemory(payload),
      missing: findMissingFields(normalizeMemactMemory(payload)),
      source: payload?.packet ? "memact_cap" : "memact_memory"
    });
  } catch (error) {
    if (isAbortError(error)) {
      return response.status(504).json({ error: "memact_timeout" });
    }

    return response.status(502).json({
      error: "memact_unavailable",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

async function readFitentContext(connectionId) {
  try {
    const requestResponse = await fetchWithTimeout(new URL("/v1/cap/requests", MEMACT_BASE_URL), {
      method: "POST",
      headers: apiHeaders(connectionId),
      body: JSON.stringify({
        connection_id: connectionId,
        purpose: "fitent_onboarding_prefill",
        requested_categories: ["fitness", "dietary_preferences"],
        requested_context: [
          { description: "fitness goal", field_hint: "fitness.goal", category_hint: "fitness", required: true },
          { description: "activity level", field_hint: "fitness.activity_level", category_hint: "fitness", required: true },
          { description: "dietary preference", field_hint: "diet.preference", category_hint: "dietary_preferences", required: false },
          { description: "allergies or food restrictions", field_hint: "diet.allergy", category_hint: "dietary_preferences", required: false },
          { description: "macro preference", field_hint: "fitness.macro_split", category_hint: "fitness", required: false },
          { description: "water target", field_hint: "fitness.water_target_ml", category_hint: "fitness", required: false }
        ]
      })
    });

    if (!requestResponse.ok) throw new Error("cap_request_failed");
    const requestPayload = await requestResponse.json();
    const capRequest = requestPayload.request;

    const packetResponse = await fetchWithTimeout(new URL("/v1/cap/packets", MEMACT_BASE_URL), {
      method: "POST",
      headers: apiHeaders(connectionId),
      body: JSON.stringify({
        connection_id: connectionId,
        request_id: capRequest?.request_id,
        cap_request: capRequest
      })
    });

    if (!packetResponse.ok) throw new Error("cap_packet_failed");
    return packetResponse.json();
  } catch {
    return readMemoryFallback(connectionId);
  }
}

async function readMemoryFallback(connectionId) {
  const url = new URL("/v1/memory", MEMACT_BASE_URL);
  url.searchParams.set("connection_id", connectionId);
  url.searchParams.set("category", "fitness");
  const memactResponse = await fetchWithTimeout(url, {
    headers: apiHeaders(connectionId, false)
  });

  if (!memactResponse.ok) {
    const error = new Error("memact_context_lookup_failed");
    error.status = memactResponse.status;
    throw error;
  }

  return memactResponse.json();
}

function apiHeaders(connectionId, json = true) {
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${MEMACT_API_KEY}`,
    "X-Memact-Connection-Id": connectionId
  };
}

function normalizeMemactMemory(payload = {}) {
  const capFragments = payload.packet?.allowed_context || payload.allowed_context || [];
  const records = capFragments.length ? capFragments : payload.memory || payload.records || payload.entries || [];
  const merged = Array.isArray(records)
    ? records.reduce((acc, item) => ({ ...acc, ...normalizeContextFragment(item) }), {})
    : payload.context || {};

  return {
    age: merged.age,
    weight_kg: merged.weight_kg || merged.weight,
    height_cm: merged.height_cm || merged.height,
    activity_level: merged.activity_level || merged.activity,
    fitness_goal: merged.fitness_goal || merged.goal,
    macro_split: merged.macro_split || merged.macroSplit,
    water_target_ml: merged.water_target_ml || merged.waterTarget,
    dietary_preference: merged.dietary_preference || merged.dietaryPreference,
    allergies_or_restrictions: merged.allergies_or_restrictions || merged.allergies
  };
}

function normalizeContextFragment(item = {}) {
  const value = item.value || item.attributes || item.context || {};
  if (item.field_path) return { [fieldPathToFitentKey(item.field_path)]: value };
  return value;
}

function fieldPathToFitentKey(fieldPath) {
  const map = {
    "fitness.goal": "fitness_goal",
    "fitness.activity_level": "activity_level",
    "fitness.macro_split": "macro_split",
    "fitness.water_target_ml": "water_target_ml",
    "diet.preference": "dietary_preference",
    "diet.allergy": "allergies_or_restrictions",
    "diet.restrictions": "allergies_or_restrictions"
  };
  return map[fieldPath] || String(fieldPath).replace(/\./g, "_");
}

function findMissingFields(context = {}) {
  return [
    ["age", context.age],
    ["weight", context.weight_kg],
    ["height", context.height_cm],
    ["activity", context.activity_level],
    ["goal", context.fitness_goal],
    ["dietaryPreference", context.dietary_preference],
    ["allergies", context.allergies_or_restrictions]
  ]
    .filter(([, value]) => value === undefined || value === null || String(value).trim() === "")
    .map(([field]) => field);
}
