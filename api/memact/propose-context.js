import { fetchWithTimeout, isAbortError, verifyConnectionRequest } from "./_auth.js";

const MEMACT_BASE_URL = process.env.MEMACT_BASE_URL || "https://api.memact.com";
const MEMACT_API_KEY = process.env.MEMACT_API_KEY || "";
const MEMACT_APP_ID = process.env.MEMACT_APP_ID || "fitent";
const FIELD_PATHS = {
  age: "fitness.age",
  weight_kg: "fitness.weight_kg",
  height_cm: "fitness.height_cm",
  activity_level: "fitness.activity_level",
  fitness_goal: "fitness.goal",
  macro_split: "fitness.macro_split",
  water_target_ml: "fitness.water_target_ml",
  dietary_preference: "diet.preference",
  allergies_or_restrictions: "diet.allergy"
};

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "method_not_allowed" });
  }

  const body = request.body || {};
  const connectionId = body.connection_id || "";
  if (!connectionId) return response.status(400).json({ error: "missing_connection_id" });

  const auth = verifyConnectionRequest(request, connectionId);
  if (!auth.ok) {
    return response.status(auth.status).json({ error: auth.error });
  }

  const proposal = {
    schema_version: "memact.app_context_proposal.v0",
    app_id: MEMACT_APP_ID,
    source_app: body.source_app || "Fitent",
    category: body.category || "fitness",
    context: body.context || {},
    proposed_at: body.proposed_at || new Date().toISOString(),
    source_type: "app",
    status: "pending",
    user_visible: true
  };

  if (!MEMACT_API_KEY) {
    return response.status(202).json({
      accepted: false,
      status: "memact_not_configured",
      proposal
    });
  }

  try {
    const capResult = await proposeCapFields(connectionId, proposal);
    if (capResult.accepted) {
      return response.status(200).json(capResult);
    }

    const memactResponse = await fetchWithTimeout(new URL("/v1/wiki/proposals", MEMACT_BASE_URL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MEMACT_API_KEY}`,
        "X-Memact-Connection-Id": connectionId
      },
      body: JSON.stringify({ connection_id: connectionId, proposal })
    });

    const payload = await memactResponse.json().catch(() => ({}));
    const accepted = memactResponse.ok && payload.accepted === true;
    return response.status(accepted ? 200 : memactResponse.status).json({
      ...payload,
      accepted
    });
  } catch (error) {
    if (isAbortError(error)) {
      return response.status(504).json({ error: "memact_timeout" });
    }

    return response.status(502).json({
      error: "memact_proposal_failed",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

async function proposeCapFields(connectionId, proposal) {
  const fields = Object.entries(proposal.context || {})
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(([key, value]) => ({
      title: titleFromFieldPath(FIELD_PATHS[key] || key),
      category: key.startsWith("diet") || key.includes("allerg") ? "dietary_preferences" : "fitness",
      field_path: FIELD_PATHS[key] || key,
      proposed_value: value,
      evidence_summary: "User saved this during Fitent onboarding.",
      sensitivity: key.includes("allerg") || key.includes("weight") || key.includes("height") ? "sensitive" : "normal",
      visibility: "private",
      confidence: 0.9,
      source_type: "app"
    }));

  if (!fields.length) return { accepted: false, status: "no_context_fields" };

  try {
    const results = [];
    for (const field of fields) {
      const memactResponse = await fetchWithTimeout(new URL("/v1/cap/proposals", MEMACT_BASE_URL), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MEMACT_API_KEY}`,
          "X-Memact-Connection-Id": connectionId
        },
        body: JSON.stringify({
          connection_id: connectionId,
          proposal: {
            app_id: MEMACT_APP_ID,
            connection_id: connectionId,
            ...field
          }
        })
      });
      const payload = await memactResponse.json().catch(() => ({}));
      if (!memactResponse.ok || payload.accepted !== true) return { accepted: false, status: "cap_proposal_failed", details: payload };
      results.push(payload.proposal || payload);
    }
    return { accepted: true, proposals: results };
  } catch {
    return { accepted: false, status: "cap_proposal_unavailable" };
  }
}

function titleFromFieldPath(fieldPath) {
  return String(fieldPath).split(".").slice(-1)[0].replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
