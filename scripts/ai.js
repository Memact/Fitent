// ================================================================
// Vite Build-Time Environment Variable Core Architecture
// ================================================================
const VITE_GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY || null;
const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || null;

// Local browser storage fallback pattern (for manual settings cog injections)
const LOCAL_GEMINI_KEY = localStorage.getItem('user_gemini_key');
const LOCAL_SUPABASE_URL = localStorage.getItem('user_supabase_url');

// Operational production runtime parameters computation
const activeGeminiKey = VITE_GEMINI_KEY || LOCAL_GEMINI_KEY;
const activeSupabaseUrl = VITE_SUPABASE_URL || LOCAL_SUPABASE_URL;

export const isCloudModeActive = Boolean(activeGeminiKey && activeSupabaseUrl);

// ================================================================
// Client-Side API Fault Isolation & Banner Injection Pipeline
// ================================================================
export function checkApiStatus() {
  if (!isCloudModeActive) {
    console.warn("Fitent: Running in Local-First Demo Mode (No compile-time or local keys found).");
    showStatusBanner("demo");
    return false;
  }
  return true;
}

export function showStatusBanner(type, message = "") {
  const aiContainer = document.getElementById('ai-coach-view') || document.getElementById('main-ai-feed') || document.body;
  
  if (document.getElementById('api-status-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'api-status-banner';
  
  if (type === 'demo') {
    banner.className = 'bg-blue-500/20 border border-blue-500 text-blue-200 p-4 rounded-xl my-3 text-sm text-center font-medium backdrop-blur-md transition-all duration-300';
    banner.innerText = 'Running in Local-First Demo Mode. Calorie calculations and local metric updates persist offline!';
  } else if (type === 'error') {
    banner.className = 'bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl my-3 text-sm text-center font-medium backdrop-blur-md transition-all duration-300';
    banner.innerText = message || 'API Connection Fault (401/403 Invalid Context). Verify credentials inside your Settings layer.';
  }

  aiContainer.prepend(banner);
}

// ================================================================
// Main AI Closure Component Structure
// ================================================================
window.AI = (() => {

  // ── Contextual rule-based local fallback response engine ───────
  const rules = [
    {
      test: /^(hi|hello|hey|good morning|good evening|good afternoon)/i,
      reply: (ctx) => `Hey there. I'm your nutrition coach. You've logged **${ctx.calories} kcal** today with **${Math.round(ctx.calPct)}%** of your goal hit. How can I help you today?`
    },
    {
      test: /how.*doing|progress|status|summary/i,
      reply: (ctx) => {
        const hydMsg = ctx.hydPct >= 1 ? 'Hydration goal met!' : `Hydration at ${Math.round(ctx.hydPct * 100)}%.`;
        return `**Daily Summary:**\n- Calories: ${ctx.calories}/${ctx.targetCal} kcal (${Math.round(ctx.calPct)}%)\n- Protein: ${ctx.protein}/${ctx.targetProtein}g\n- Carbs: ${ctx.carbs}/${ctx.targetCarbs}g\n- Fat: ${ctx.fat}/${ctx.targetFat}g\n- ${hydMsg}\n\nHealth Score: **${ctx.score}/100**`;
      }
    },
    {
      test: /water|hydrat|drink/i,
      reply: (ctx) => {
        const rem = Math.max(0, ctx.waterTarget - ctx.water);
        if (ctx.hydPct >= 1) return `Amazing! You've hit your hydration goal of ${ctx.waterTarget}ml. Keep sipping!`;
        return `You've had **${ctx.water}ml** of your ${ctx.waterTarget}ml goal. That's ${Math.round(ctx.hydPct * 100)}%. You need **${rem}ml** more — try a glass every hour!`;
      }
    },
    {
      test: /protein|muscle|build|strength/i,
      reply: (ctx) => {
        if (ctx.protPct >= 0.9) return `Excellent protein intake! You're at **${ctx.protein}g** of ${ctx.targetProtein}g. Keep it up!`;
        return `Your protein is at **${ctx.protein}g** (${Math.round(ctx.protPct * 100)}% of goal). To hit ${ctx.targetProtein}g, try adding: eggs, Greek yogurt, chicken, paneer, tofu, or dal to your next meal.`;
      }
    },
    {
      test: /calori|calorie|kcal|eat|food/i,
      reply: (ctx) => {
        const rem = Math.max(0, ctx.targetCal - ctx.calories);
        if (ctx.calPct > 1.1) return `You're **${ctx.calories - ctx.targetCal} kcal over** your target. Consider a lighter dinner or skip the evening snack.`;
        if (ctx.calPct < 0.5 && ctx.calories === 0) return `You haven't logged any food yet today. Start with breakfast to fuel your body and track your nutrition!`;
        return `You've eaten **${ctx.calories} kcal** (${Math.round(ctx.calPct * 100)}% of goal). ${rem > 0 ? `You have ${Math.round(rem)} kcal remaining.` : 'You\'ve hit your calorie goal!'}`;
      }
    },
    {
      test: /streak|consistency|habit/i,
      reply: (ctx) => `Your current tracking streak is **${ctx.streak} day${ctx.streak !== 1 ? 's' : ''}**! ${ctx.streak >= 7 ? 'Incredible consistency!' : 'Great start!'}`
    }
  ];

  function getContext() {
    const profile = typeof Storage !== 'undefined' ? Storage.getProfile() : {};
    const dateKey = typeof Tracker !== 'undefined' ? Tracker.currentDate : new Date().toISOString().split('T')[0];
    const consumed = typeof Tracker !== 'undefined' ? Tracker.computeTotals(dateKey) : { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const water = typeof Storage !== 'undefined' ? Storage.getWater(dateKey) : 0;
    const waterTarget = profile.waterTarget || 2500;
    const targets = typeof Dashboard !== 'undefined' ? Dashboard.computeTargets(profile) : { calories: 2000, protein: 150, carbs: 200, fat: 65 };
    const score = typeof Analytics !== 'undefined' ? Analytics.calculateHealthScore(consumed, targets, water, waterTarget) : 70;
    const streak = typeof Storage !== 'undefined' ? Storage.getStreak() : 0;

    return {
      calories: Math.round(consumed.calories),
      protein: Math.round(consumed.protein * 10) / 10,
      carbs: Math.round(consumed.carbs * 10) / 10,
      fat: Math.round(consumed.fat * 10) / 10,
      water,
      waterTarget,
      targetCal: targets.calories,
      targetProtein: targets.protein,
      targetCarbs: targets.carbs,
      targetFat: targets.fat,
      calPct: targets.calories > 0 ? consumed.calories / targets.calories : 0,
      protPct: targets.protein > 0 ? consumed.protein / targets.protein : 0,
      hydPct: waterTarget > 0 ? water / waterTarget : 0,
      score,
      streak,
      goal: profile.goal || 'maintain'
    };
  }

  function getReply(prompt) {
    const ctx = getContext();
    const matched = rules.find(r => r.test.test(prompt));
    if (matched) return matched.reply(ctx);
    return `I'm here to help with your nutrition. You've logged **${ctx.calories} kcal** today (${Math.round(ctx.calPct * 100)}% of goal). Ask me about meals, macros, hydration, recipes, or your progress.`;
  }

  function checkAndParseChatReply(prompt) {
    const pendingField = sessionStorage.getItem('fitent_ai_pending_field');
    if (!pendingField) return null;

    const profile = typeof Storage !== 'undefined' ? Storage.getProfile() : {};
    if (!profile.memactConnectionId) {
      sessionStorage.removeItem('fitent_ai_pending_field');
      return null;
    }

    let parsedValue = null;
    let feedback = "";

    if (pendingField === 'age') {
      const match = prompt.match(/\b(\d{1,3})\b/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val >= 1 && val <= 120) {
          parsedValue = val;
          profile.age = val;
          feedback = `Got it! I've updated your age to **${val}** and proposed it to Memact.`;
        }
      }
    } else if (pendingField === 'weight') {
      const match = prompt.match(/\b(\d+(?:\.\d+)?)\s*(?:kg|lbs|kilos)?\b/i);
      if (match) {
        let val = parseFloat(match[1]);
        if (prompt.toLowerCase().includes('lbs')) {
          val = Math.round(val / 2.20462 * 10) / 10;
        }
        if (val >= 20 && val <= 300) {
          parsedValue = val;
          profile.weight = val;
          feedback = `Awesome! I've updated your weight to **${val} kg** and proposed it to Memact.`;
        }
      }
    } else if (pendingField === 'height') {
      const match = prompt.match(/\b(\d+(?:\.\d+)?)\s*(?:cm|m|feet|ft)?\b/i);
      if (match) {
        let val = parseFloat(match[1]);
        if (val < 3) {
          val = Math.round(val * 100);
        }
        if (val >= 50 && val <= 280) {
          parsedValue = val;
          profile.height = val;
          feedback = `Super! I've set your height to **${val} cm** and proposed it to Memact.`;
        }
      }
    } else if (pendingField === 'activity') {
      const p = prompt.toLowerCase();
      if (p.includes('sedentary') || p.includes('desk')) {
        parsedValue = '1.2';
      } else if (p.includes('light')) {
        parsedValue = '1.375';
      } else if (p.includes('moderate') || p.includes('medium') || p.includes('normal')) {
        parsedValue = '1.55';
      } else if (p.includes('active') || p.includes('high')) {
        parsedValue = '1.725';
      } else if (p.includes('very active') || p.includes('athlete')) {
        parsedValue = '1.9';
      }
      if (parsedValue) {
        profile.activity = parsedValue;
        const labels = { '1.2': 'Sedentary', '1.375': 'Light', '1.55': 'Moderate', '1.725': 'Active', '1.9': 'Very Active' };
        feedback = `Perfect. Your activity level is set to **${labels[parsedValue]}** and proposed to Memact.`;
      }
    } else if (pendingField === 'goal') {
      const p = prompt.toLowerCase();
      if (p.includes('lose') || p.includes('diet') || p.includes('deficit') || p.includes('slimmer')) {
        parsedValue = 'lose';
      } else if (p.includes('maintain') || p.includes('keep') || p.includes('stay')) {
        parsedValue = 'maintain';
      } else if (p.includes('gain') || p.includes('bulk') || p.includes('muscle')) {
        parsedValue = 'gain';
      }
      if (parsedValue) {
        profile.goal = parsedValue;
        const labels = { 'lose': 'Lose weight', 'maintain': 'Maintain', 'gain': 'Gain muscle' };
        feedback = `Great goal: **${labels[parsedValue]}** has been saved and proposed to Memact.`;
      }
    } else if (pendingField === 'dietaryPreference') {
      const p = prompt.toLowerCase();
      if (p.includes('vegetarian') || p.includes('veg')) {
        parsedValue = 'vegetarian';
      } else if (p.includes('vegan')) {
        parsedValue = 'vegan';
      } else if (p.includes('high protein') || p.includes('protein')) {
        parsedValue = 'high-protein';
      } else if (p.includes('low carb') || p.includes('keto')) {
        parsedValue = 'low-carb';
      } else if (p.includes('balanced') || p.includes('normal') || p.includes('anything')) {
        parsedValue = 'balanced';
      }
      if (parsedValue) {
        profile.dietaryPreference = parsedValue;
        feedback = `Dietary preference set to **${parsedValue}** and proposed to Memact.`;
      }
    } else if (pendingField === 'allergies') {
      if (prompt.trim().length > 1) {
        parsedValue = prompt.replace(/^(my allergies are|i have|none|no)\s+/i, '').trim();
        profile.allergies = parsedValue;
        feedback = `Allergies/restrictions updated to "**${parsedValue}**" and proposed to Memact.`;
      }
    }

    if (parsedValue !== null) {
      sessionStorage.removeItem('fitent_ai_pending_field');
      if (typeof Storage !== 'undefined') {
        Storage.saveProfile(profile);
      }
      if (window.MemactIntegration) {
        window.MemactIntegration.proposeMissingContextToMemact(profile);
        window.MemactIntegration.render();
      }
      if (typeof App !== 'undefined' && App.refresh) App.refresh();
      if (typeof Dashboard !== 'undefined' && Dashboard.refresh) Dashboard.refresh();
      return feedback;
    }

    return null;
  }

  function appendMissingFieldQuestionIfNeeded(response) {
    const profile = typeof Storage !== 'undefined' ? Storage.getProfile() : {};
    if (!profile.memactConnectionId) return response;

    const missing = getMissingFieldsLocal(profile);
    if (!missing.length) return response;

    const field = missing[0];
    sessionStorage.setItem('fitent_ai_pending_field', field);

    const questions = {
      age: "By the way, your **age** is missing from your profile. Could you tell me how old you are?",
      weight: "By the way, your **weight** is missing from your profile. What is your current weight in kg?",
      height: "By the way, your **height** is missing from your profile. What is your height in cm?",
      activity: "By the way, what is your typical **activity level**? (Sedentary, Light, Moderate, Active, or Athlete)",
      goal: "By the way, what is your primary **fitness goal**? (Lose weight, Maintain, or Gain muscle)",
      dietaryPreference: "By the way, do you have a **dietary preference**? (Balanced, Vegetarian, Vegan, High protein, or Low carb)",
      allergies: "By the way, do you have any **allergies or dietary restrictions**? (e.g. peanuts, lactose, none)"
    };

    const question = questions[field] || "";
    if (question) {
      return response + `\n\n_${question}_`;
    }
    return response;
  }

  function getMissingFieldsLocal(profile) {
    const required = ["age", "weight", "height", "activity", "goal", "dietaryPreference", "allergies"];
    return required.filter((field) => {
      const value = profile[field];
      return value === undefined || value === null || String(value).trim() === "";
    });
  }

  // Helper to ensure appendMessage functionality locally if global is missing
  function addChatBubble(type, text, id = null) {
    const feed = document.getElementById('main-ai-feed');
    if (!feed) return;
    const html = `<div class="chat-bubble ${type}" ${id ? `id="${id}"` : ''}><p>${text.replace(/\n/g, '<br>')}</p></div>`;
    feed.insertAdjacentHTML('beforeend', html);
    feed.scrollTop = feed.scrollHeight;
  }

  // Text Model API
  async function queryCloudGeminiAI(prompt) {
    try {
      // Switched to gemini-1.5-flash for faster and better responses
      const targetEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeGeminiKey}`;
      const response = await fetch(targetEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (response.status === 401 || response.status === 403) {
        showStatusBanner('error', 'Remote AI processing engine rejected your credentials (401/403). Falling back to offline engine!');
        return null;
      }

      const rawResult = await response.json();
      return rawResult?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (err) {
      console.error("Intercepted runtime network drop:", err);
      return null;
    }
  }

  // Vision Model API (Snap & Log)
  async function queryCloudGeminiVision(base64Data, mimeType) {
    try {
      const targetEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeGeminiKey}`;
      const b64 = base64Data.split(',')[1];
      const response = await fetch(targetEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Analyze this meal. Return ONLY a valid JSON object with exact keys: 'name' (string), 'calories' (number), 'protein' (number), 'carbs' (number), 'fat' (number). Estimate the values per average portion. Do not include markdown formatting, backticks, or any other text." },
              { inline_data: { mime_type: mimeType, data: b64 } }
            ]
          }]
        })
      });
      const rawResult = await response.json();
      const text = rawResult?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      if (text) {
        const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
      }
      return null;
    } catch (err) {
      console.error("Vision API Error:", err);
      return null;
    }
  }

  // Mini coach chat panel handler module
  function initMainChat() {
    const feed = document.getElementById('main-ai-feed');
    const form = document.getElementById('main-ai-form');
    const input = document.getElementById('main-ai-input');
    const clearBtn = document.getElementById('clear-ai-chat');
    
    // Feature UI hooks
    const micBtn = document.getElementById('voice-input-btn');
    const imageUpload = document.getElementById('image-upload-input');
    
    if (!form || !feed) return; 
    if (form.dataset.initialized) return;
    form.dataset.initialized = 'true';

    // 📸 AI VISION IMPLEMENTATION (Snap & Log)
    if (imageUpload) {
      imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64String = event.target.result;
          const mimeType = file.type;
          
          addChatBubble('user-bubble', 'Uploaded a meal photo');
          const typingId = 'typing-' + Date.now();
          addChatBubble('ai-bubble', 'Analyzing meal image...', typingId);

          if (!isCloudModeActive) {
            document.getElementById(typingId)?.remove();
            addChatBubble('ai-bubble', 'Image analysis requires Cloud Mode (API Key). Currently in Local Demo Mode.');
            return;
          }

          const nutritionData = await queryCloudGeminiVision(base64String, mimeType);
          document.getElementById(typingId)?.remove();

          if (nutritionData && nutritionData.name) {
             const dateKey = typeof window.Tracker !== 'undefined' ? window.Tracker.currentDate : new Date().toISOString().split('T')[0];
             const entry = {
                name: nutritionData.name,
                calories: Math.round(nutritionData.calories || 0),
                protein: Math.round((nutritionData.protein || 0)*10)/10,
                carbs: Math.round((nutritionData.carbs || 0)*10)/10,
                fat: Math.round((nutritionData.fat || 0)*10)/10,
                meal: 'snacks',
                quantity: 100
             };
             
             if (typeof window.Storage !== 'undefined' && window.Storage.addFood) {
                window.Storage.addFood(dateKey, entry);
                if (typeof window.App !== 'undefined') window.App.refresh();
                addChatBubble('ai-bubble', `Successfully logged **${entry.name}**!\n\nCalories: ${entry.calories} kcal\nProtein: ${entry.protein}g | Carbs: ${entry.carbs}g | Fat: ${entry.fat}g`);
             } else {
                addChatBubble('ai-bubble', `I analyzed the image as **${entry.name}** (${entry.calories} kcal), but couldn't save it to your log right now.`);
             }
          } else {
             addChatBubble('ai-bubble', 'I couldn\'t recognize the food in the image. Please try another photo or describe it.');
          }
          imageUpload.value = ''; 
        };
        reader.readAsDataURL(file);
      });
    }

    // 🎤 VOICE-TO-TEXT IMPLEMENTATION
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition && micBtn) {
      micBtn.style.display = 'none'; 
      micBtn.title = "Voice input not supported in this browser";
    } else if (micBtn) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      micBtn.addEventListener('click', () => {
        try { recognition.start(); } catch (e) { console.error("Speech recognition failed", e); }
      });

      recognition.onstart = () => {
        micBtn.classList.add('recording');
        micBtn.style.transform = 'scale(1.2)';
        if (input) input.placeholder = "Listening...";
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (input) input.value = transcript;
      };

      recognition.onend = () => {
        micBtn.classList.remove('recording');
        micBtn.style.transform = 'scale(1)';
        if (input) input.placeholder = "Ask about meals or snap a photo...";
        if (input && input.value.trim() !== '') {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      };

      recognition.onerror = (event) => {
        micBtn.classList.remove('recording');
        micBtn.style.transform = 'scale(1)';
        if (input) input.placeholder = "Ask about meals or snap a photo...";
        if (event.error === 'not-allowed') alert("Microphone access denied.");
      };
    }

    // Standard Chat Form Listeners
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        feed.innerHTML = `
          <div class="chat-bubble ai-bubble">
            <p>Chat cleared. How can I help you today?</p>
          </div>
        `;
      });
    }

    document.querySelectorAll('.prompt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (input) {
          input.value = btn.textContent;
          input.focus();
        }
      });
    });

    const pushMessage = typeof window.appendMessage === 'function' ? window.appendMessage : addChatBubble;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const prompt = input?.value.trim();
      if (!prompt) return;
      
      pushMessage('user-bubble', prompt);
      input.value = '';
      
      const typingId = 'typing-' + Date.now();
      pushMessage('ai-bubble', '...', typingId);
      
      let finalReply = checkAndParseChatReply(prompt);
      
      if (!finalReply) {
        if (isCloudModeActive) {
          finalReply = await queryCloudGeminiAI(prompt);
        }

        if (!finalReply) {
          finalReply = getReply(prompt);
        }
        
        finalReply = appendMissingFieldQuestionIfNeeded(finalReply);
      }
      
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      pushMessage('ai-bubble', finalReply);
    });
  }

  // Dashboard coach insights panel generator module
  function generateInsights() {
    const container = document.getElementById('ai-insights');
    if (!container) return;
    const ctx = getContext();
    const insights = [];

    if (ctx.calories === 0) {
      insights.push({ type: 'info', title: 'Ready to track!', msg: 'Log your first meal to see your daily nutrition analysis.' });
    } else if (ctx.calPct > 1.1) {
      insights.push({ type: 'warning', title: 'Over calorie limit', msg: `You're ${Math.round(ctx.calories - ctx.targetCal)} kcal over your daily goal.` });
    } else if (ctx.calPct >= 0.85) {
      insights.push({ type: 'success', title: 'Calorie goal on track', msg: `Great job! ${Math.round(ctx.calPct * 100)}% of your daily calorie target reached.` });
    }

    if (ctx.hydPct >= 1) {
      insights.push({ type: 'success', title: 'Hydration goal met!', msg: `You've hit your ${ctx.waterTarget}ml water target today. Keep it up!` });
    }

    if (ctx.streak >= 3) {
      insights.push({ type: 'success', title: `${ctx.streak}-day streak!`, msg: `Impressive consistency! Keep logging daily to maintain your healthy habit.` });
    }

    container.innerHTML = insights.map(i => `
      <div class="insight-card ${i.type}">
        <strong>${i.title}</strong>
        <span>${i.msg}</span>
      </div>
    `).join('');
  }

  function init() {
    checkApiStatus();
    initMainChat();
    generateInsights();
  }

  return { init, initMainChat, generateInsights, getReply, queryCloudGeminiAI, isCloudModeActive: () => Boolean(activeGeminiKey) };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.AI.init());
} else {
  window.AI.init();
}