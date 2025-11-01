// Simple in-memory data store
const state = {
  theme: "dark",
  products: [
    { id: generateId(), name: "Apex Wireless Headphones", category: "Audio", price: 199.99, targetCpa: 12.0 },
    { id: generateId(), name: "Nova Fitness Band", category: "Wearables", price: 99.0, targetCpa: 8.5 },
  ],
  // Campaign metrics (simulated real-time)
  metrics: {
    impressions: 1200,
    clicks: 210,
    conversions: 42,
    revenue: 4200,
  },
  timeline: []
};

// Utility
function generateId() {
  return Math.random().toString(36).slice(2, 9).toUpperCase();
}

function formatCurrency(n) {
  return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPercent(p) {
  return `${(p * 100).toFixed(1)}%`;
}

function updateAllUI() {
  // Products table
  const body = document.getElementById("productTableBody");
  body.innerHTML = "";
  if (state.products.length === 0) {
    document.getElementById("noProducts").style.display = "block";
  } else {
    document.getElementById("noProducts").style.display = "none";
  }
  state.products.forEach(prod => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${prod.id}</td>
      <td>${escapeHtml(prod.name)}</td>
      <td>${escapeHtml(prod.category)}</td>
      <td>${formatCurrency(prod.price)}</td>
      <td>${formatCurrency(prod.targetCpa)}</td>
    `;
    body.appendChild(row);
  });

  // Dashboard metrics
  document.getElementById("impressionsValue").textContent = numberWithCommas(state.metrics.impressions);
  document.getElementById("clicksValue").textContent = numberWithCommas(state.metrics.clicks);
  document.getElementById("conversionsValue").textContent = numberWithCommas(state.metrics.conversions);
  document.getElementById("revenueValue").textContent = formatCurrency(state.metrics.revenue);

  const ctr = state.metrics.impressions > 0 ? state.metrics.clicks / state.metrics.impressions : 0;
  const cr = state.metrics.clicks > 0 ? state.metrics.conversions / state.metrics.clicks : 0;
  document.getElementById("ctrValue").textContent = formatPercent(ctr);
  document.getElementById("crValue").textContent = formatPercent(cr);

  // Timeline
  const tl = document.getElementById("timeline");
  tl.innerHTML = "";
  state.timeline.slice().reverse().slice(0, 6).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    tl.appendChild(li);
  });
}

function numberWithCommas(n) {
  return n.toLocaleString();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Theme
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  // toggle icons
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;
  if (theme === "light") {
    toggle.querySelector(".sun").style.display = "none";
    toggle.querySelector(".moon").style.display = "inline-block";
  } else {
    toggle.querySelector(".sun").style.display = "inline-block";
    toggle.querySelector(".moon").style.display = "none";
  }
  localStorage.setItem("theme", theme);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Load theme
  const saved = localStorage.getItem("theme");
  if (saved) {
    state.theme = saved;
  }
  applyTheme(state.theme);

  // Initial UI
  updateAllUI();

  // Theme toggle
  document.getElementById("themeToggle").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme(state.theme);
  });

  // Navigation
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-section");
      document.getElementById("products").style.display = target === "products" ? "block" : "none";
      document.getElementById("dashboard").style.display = target === "dashboard" ? "block" : "none";
      // Focus for accessibility
      document.getElementById(target).focus();
    });
  });

  // Add Product modal
  const modal = document.getElementById("addProductModal");
  const addBtn = document.getElementById("addProductBtn");
  const closeBtn = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelBtn");

  function openModal() {
    modal.setAttribute("aria-hidden", "false");
    modal.style.display = "flex";
    // focus first input
    document.getElementById("prodName").focus();
  }
  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";
    document.getElementById("addProductForm").reset();
  }

  addBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  // Close on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Add product form submission
  document.getElementById("addProductForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("prodName").value.trim();
    const category = document.getElementById("prodCat").value.trim();
    const price = parseFloat(document.getElementById("prodPrice").value);
    const targetCpa = parseFloat(document.getElementById("prodCPA").value);

    if (!name || !category || isNaN(price) || isNaN(targetCpa)) return;

    const newProd = {
      id: generateId(),
      name,
      category,
      price,
      targetCpa
    };
    state.products.push(newProd);
    // Optionally, push a timeline event
    state.timeline.push(`Added product: ${name} (${category})`);
    updateAllUI();
    closeModal();
  });

  // Simulated real-time campaign updates
  setInterval(() => {
    // Randomized small increments
    const deltaImpr = Math.floor(Math.random() * 20) + 5;
    const deltaClicks = Math.floor(Math.random() * 8);
    const deltaConv = Math.random() < 0.4 ? Math.floor(Math.random() * 3) : 0;
    const avgPrice = state.products.length ? state.products.reduce((a,b)=>a+b.price,0)/state.products.length : 0;
    const deltaRev = deltaConv * avgPrice * (Math.random() < 0.9 ? 1.0 : 0.9);

    state.metrics.impressions += deltaImpr;
    state.metrics.clicks += deltaClicks;
    state.metrics.conversions += deltaConv;
    state.metrics.revenue += deltaRev;

    // timeline entry
    const actions = ["Impression", "Click", "Conversion", "Revenue"];
    const pick = actions[Math.floor(Math.random() * actions.length)];
    const entry = `${new Date().toLocaleTimeString()} - ${pick} updated`;
    state.timeline.push(entry);

    updateAllUI();
  }, 4000);
});
