// ================================================================
// grocery.js - Smart Grocery List Generator Module
// Fitent
// ================================================================

window.Grocery = (() => {
  let shoppingListState = [];

  const groceryDatabase = {
    protein: [
      { name: "Chicken breast", baseQty: 500, unit: "g" },
      { name: "Lean beef", baseQty: 400, unit: "g" },
      { name: "Scrambled egg whites", baseQty: 10, unit: "eggs" },
      { name: "Greek yogurt", baseQty: 500, unit: "g" },
      { name: "Fresh paneer", baseQty: 400, unit: "g" },
      { name: "Organic tofu", baseQty: 300, unit: "g" },
      { name: "Atlantic salmon", baseQty: 350, unit: "g" }
    ],
    carbs: [
      { name: "Rolled oats", baseQty: 500, unit: "g" },
      { name: "Brown rice", baseQty: 750, unit: "g" },
      { name: "Sweet potatoes", baseQty: 600, unit: "g" },
      { name: "Whole wheat bread", baseQty: 1, unit: "loaf" },
      { name: "Quinoa grain", baseQty: 350, unit: "g" },
      { name: "Whole wheat pasta", baseQty: 400, unit: "g" }
    ],
    fats: [
      { name: "Avocado", baseQty: 3, unit: "pcs" },
      { name: "Raw almonds", baseQty: 200, unit: "g" },
      { name: "Extra virgin olive oil", baseQty: 250, unit: "ml" },
      { name: "Walnuts", baseQty: 150, unit: "g" },
      { name: "Chia seeds", baseQty: 100, unit: "g" },
      { name: "Peanut butter", baseQty: 340, unit: "g" }
    ],
    micronutrients: [
      { name: "Fresh spinach", baseQty: 200, unit: "g" },
      { name: "Broccoli florets", baseQty: 300, unit: "g" },
      { name: "Blueberries", baseQty: 150, unit: "g" },
      { name: "Bananas", baseQty: 5, unit: "pcs" },
      { name: "Red bell peppers", baseQty: 3, unit: "pcs" },
      { name: "Baby carrots", baseQty: 250, unit: "g" }
    ]
  };

  function generateWeeklyList() {
    const profile = window.Storage ? window.Storage.getProfile() : {};
    const baseCalories = 2000;
    let targetCalories = baseCalories;

    if (window.Dashboard && window.Dashboard.computeTargets) {
      targetCalories = window.Dashboard.computeTargets(profile).calories;
    }

    const multiplier = targetCalories / baseCalories;
    const split = profile.macroSplit || "balanced";
    const list = [];

    const addGroup = (type, badgeClass, scale = 1) => {
      const items = groceryDatabase[type] || [];
      items.forEach(item => {
        let qty = Math.round(item.baseQty * multiplier * scale);
        if (["eggs", "pcs", "loaf"].includes(item.unit)) {
          qty = Math.max(1, Math.round(item.baseQty * scale));
        }

        list.push({
          id: `${type}-${item.name.toLowerCase().replace(/\s+/g, "-")}`,
          name: item.name,
          quantity: qty,
          unit: item.unit,
          category: type,
          badgeClass,
          checked: false
        });
      });
    };

    if (split === "highprotein") {
      addGroup("protein", "badge-protein", 1.4);
      addGroup("carbs", "badge-carbs", 0.8);
      addGroup("fats", "badge-fats", 0.9);
    } else if (split === "lowcarb") {
      addGroup("protein", "badge-protein", 1.2);
      addGroup("carbs", "badge-carbs", 0.4);
      addGroup("fats", "badge-fats", 1.4);
    } else {
      addGroup("protein", "badge-protein");
      addGroup("carbs", "badge-carbs");
      addGroup("fats", "badge-fats");
    }

    addGroup("micronutrients", "badge-micronutrients");
    shoppingListState = list;

    const savedStates = localStorage.getItem("np_shopping_checklist");
    if (!savedStates) return;

    try {
      const checkedIds = JSON.parse(savedStates);
      shoppingListState.forEach(item => {
        item.checked = checkedIds.includes(item.id);
      });
    } catch (err) {
      console.error("Could not load checklist states", err);
    }
  }

  function toggleItem(id) {
    const item = shoppingListState.find(x => x.id === id);
    if (!item) return;

    item.checked = !item.checked;
    const checkedIds = shoppingListState.filter(x => x.checked).map(x => x.id);
    localStorage.setItem("np_shopping_checklist", JSON.stringify(checkedIds));
    render();
  }

  function getProgress() {
    if (shoppingListState.length === 0) return 0;
    const checked = shoppingListState.filter(x => x.checked).length;
    return Math.round((checked / shoppingListState.length) * 100);
  }

  function render() {
    const listContainer = document.getElementById("grocery-timeline");
    if (!listContainer) return;

    const categories = {
      protein: { title: "High Proteins", badge: "badge-protein", icon: groceryIcon("protein") },
      carbs: { title: "Complex Carbs", badge: "badge-carbs", icon: groceryIcon("carbs") },
      fats: { title: "Healthy Fats", badge: "badge-fats", icon: groceryIcon("fats") },
      micronutrients: { title: "Fruits & Vegetables", badge: "badge-micronutrients", icon: groceryIcon("micronutrients") }
    };

    const html = Object.entries(categories).map(([catKey, catMeta]) => {
      const items = shoppingListState.filter(x => x.category === catKey);
      if (items.length === 0) return "";

      return `
        <div class="glass-panel grocery-card">
          <div class="grocery-card-header">
            <h3><span class="category-icon" aria-hidden="true">${catMeta.icon}</span>${catMeta.title}</h3>
            <span class="grocery-badge ${catMeta.badge}">${catKey}</span>
          </div>
          <div class="grocery-item-list">
            ${items.map(item => `
              <button class="grocery-item ${item.checked ? "checked" : ""}" data-grocery-item-id="${item.id}" type="button" aria-pressed="${item.checked}">
                <span class="grocery-item-left">
                  <span class="grocery-checkbox"></span>
                  <span class="grocery-name">${item.name}</span>
                </span>
                <span class="grocery-qty">${item.quantity} ${item.unit}</span>
              </button>
            `).join("")}
          </div>
        </div>
      `;
    }).join("");

    listContainer.innerHTML = `<div class="grocery-grid">${html}</div>`;

    document.querySelectorAll("[data-grocery-item-id]").forEach(el => {
      el.addEventListener("click", () => toggleItem(el.dataset.groceryItemId));
    });

    const progress = getProgress();
    const ring = document.getElementById("grocery-progress-ring");
    if (ring) {
      ring.style.background = `conic-gradient(var(--accent) ${progress}%, rgba(148, 163, 184, 0.12) ${progress}%)`;
      const countEl = ring.querySelector("span");
      if (countEl) countEl.textContent = `${progress}%`;
    }
  }

  function copyToClipboard() {
    if (shoppingListState.length === 0) return;
    const text = shoppingListState.map(item => {
      const status = item.checked ? "[x]" : "[ ]";
      return `${status} ${item.name} - ${item.quantity} ${item.unit} (${item.category})`;
    }).join("\n");

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        if (window.Toast) window.Toast.show("Grocery list copied to clipboard!", "success");
      });
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      if (window.Toast) window.Toast.show("Grocery list copied to clipboard!", "success");
    }
  }

  function resetChecklist() {
    shoppingListState.forEach(item => {
      item.checked = false;
    });
    localStorage.removeItem("np_shopping_checklist");
    if (window.Toast) window.Toast.show("Shopping list cleared!", "info");
    render();
  }

  function groceryIcon(type) {
    const icons = {
      protein: '<svg class="app-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10c-1.7 1.7-2.1 4.5-.9 6.6l1.3 2.2c.5.8 1.6 1 2.3.3l9.4-9.4c.7-.7.5-1.8-.3-2.3l-2.2-1.3C14.5 4.9 11.7 5.3 10 7l-3 3Z"/><path d="m8 16 8-8"/><path d="M5.5 12.5 3 10"/><path d="M11.5 18.5 14 21"/></svg>',
      carbs: '<svg class="app-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 11c0-3.3 2.7-6 6-6h2c3.3 0 6 2.7 6 6v2c0 3.3-2.7 6-6 6h-2c-3.3 0-6-2.7-6-6v-2Z"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>',
      fats: '<svg class="app-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3s7 7.1 7 12.1A7 7 0 1 1 5 15.1C5 10.1 12 3 12 3Z"/><path d="M9 15a3 3 0 0 0 3 3"/></svg>',
      micronutrients: '<svg class="app-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 13c0-4.4 3.6-8 8-8h4v4c0 4.4-3.6 8-8 8H6v-4Z"/><path d="M6 17c0-3.3 2.7-6 6-6h1"/><path d="M6 21v-4"/></svg>'
    };
    return icons[type] || icons.micronutrients;
  }

  function init() {
    generateWeeklyList();
    render();

    const copyBtn = document.getElementById("grocery-btn-copy");
    if (copyBtn && !copyBtn.dataset.groceryBound) {
      copyBtn.dataset.groceryBound = "true";
      copyBtn.addEventListener("click", copyToClipboard);
    }

    const resetBtn = document.getElementById("grocery-btn-reset");
    if (resetBtn && !resetBtn.dataset.groceryBound) {
      resetBtn.dataset.groceryBound = "true";
      resetBtn.addEventListener("click", resetChecklist);
    }
  }

  return { init, refresh: init };
})();
