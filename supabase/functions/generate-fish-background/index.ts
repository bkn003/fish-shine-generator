import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Mode = "generate" | "list" | "delete";

interface GeneratePayload {
  mode?: Mode;
  dayNumber?: number;
  dayLabel?: string;
  prompt?: string;
  variation?: boolean;
  save?: boolean;
  backgroundId?: string;
}

interface BackgroundRow {
  id: string;
  day_number: number;
  day_label: string;
  prompt: string;
  image_data: string;
  created_at: string;
}

const fallbackPrompt = (dayNumber: number, dayLabel: string, variation: boolean) => {
  const suffix = variation
    ? "Create a fresh variation with a new fish composition, different angle, and new cinematic lighting style."
    : "";

  return `Generate a premium vertical background for a fish price poster for ${dayLabel || `Day ${dayNumber}`}. Photorealistic fish market scene with real fresh fish textures, rich cinematic colors, high-end commercial look, no text, no watermark, no logos, no people. Keep center and lower-middle area clean and darker for text readability. ${suffix}`.trim();
};

async function resolveUser(req: Request, supabaseUrl: string, anonKey: string) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const authClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });

  const { data } = await authClient.auth.getUser();
  return data.user ?? null;
}

function mapBackground(row: BackgroundRow) {
  return {
    id: row.id,
    dayNumber: row.day_number,
    dayLabel: row.day_label,
    prompt: row.prompt,
    imageData: row.image_data,
    createdAt: row.created_at,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Server configuration is incomplete." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json().catch(() => ({}))) as GeneratePayload;
    const mode: Mode = payload.mode || "generate";

    const user = await resolveUser(req, SUPABASE_URL, SUPABASE_ANON_KEY);
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (mode === "list") {
      if (!user) {
        return new Response(JSON.stringify({ error: "Please sign in to view saved backgrounds." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await admin
        .from("ai_backgrounds")
        .select("id, day_number, day_label, prompt, image_data, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(18);

      if (error) {
        throw new Error(error.message);
      }

      return new Response(JSON.stringify({ backgrounds: (data || []).map((row) => mapBackground(row as BackgroundRow)) }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "delete") {
      if (!user) {
        return new Response(JSON.stringify({ error: "Please sign in to delete saved backgrounds." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!payload.backgroundId) {
        return new Response(JSON.stringify({ error: "backgroundId is required." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await admin
        .from("ai_backgrounds")
        .delete()
        .eq("id", payload.backgroundId)
        .eq("user_id", user.id);

      if (error) {
        throw new Error(error.message);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dayNumber = Math.max(1, Math.floor(payload.dayNumber || 1));
    const dayLabel = (payload.dayLabel || "").trim();
    const prompt = payload.prompt?.trim() || fallbackPrompt(dayNumber, dayLabel, Boolean(payload.variation));

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required. Please top up your workspace usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const errorText = await aiResponse.text();
      console.error("AI generation failed:", aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to generate background image." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResponse.json();
    const imageUrl = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "AI did not return an image." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let savedBackground = null;

    if (payload.save && user) {
      const { data: inserted, error: insertError } = await admin
        .from("ai_backgrounds")
        .insert({
          user_id: user.id,
          day_number: dayNumber,
          day_label: dayLabel,
          prompt,
          image_data: imageUrl,
        })
        .select("id, day_number, day_label, prompt, image_data, created_at")
        .single();

      if (insertError) {
        console.error("Failed to save AI background:", insertError);
      } else if (inserted) {
        savedBackground = mapBackground(inserted as BackgroundRow);
      }
    }

    return new Response(
      JSON.stringify({
        imageUrl,
        promptUsed: prompt,
        background: savedBackground,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("generate-fish-background error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
