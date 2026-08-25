const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

const closeSiteMenu = () => {
  siteHeader?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
  navToggle?.setAttribute("aria-label", "Open site menu");
};

navToggle?.addEventListener("click", () => {
  const isOpen = siteHeader.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close site menu" : "Open site menu");
});

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    closeSiteMenu();
  });
});

document.addEventListener("click", (event) => {
  if (!siteHeader?.contains(event.target)) {
    closeSiteMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSiteMenu();
    closeFlavorModal();
  }
});

const currentPage = window.location.pathname.split("/").pop() || "index.html";
siteNav?.querySelectorAll("a").forEach((link) => {
  const target = link.getAttribute("href")?.split("#")[0] || "";
  if (target === currentPage) link.classList.add("active");
});

/* ---------- Order form ---------- */
const orderForm = document.querySelector("#orderForm");
const summaryBox = document.querySelector("#summaryBox");
const summaryTotal = document.querySelector("#summaryTotal");
const summaryFulfilment = document.querySelector("#summaryFulfilment");
const summaryPayment = document.querySelector("#summaryPayment");
const summaryDate = document.querySelector("#summaryDate");
const summaryOrderType = document.querySelector("#summaryOrderType");
const deliveryFields = document.querySelector("#deliveryFields");
const deliveryAddress = document.querySelector("#deliveryAddress");
const sendOrderButton = document.querySelector("#sendOrder");
const productRows = [...document.querySelectorAll(".product-row")];
const WHATSAPP_NUMBER = "27640917447";

const FLAVOUR_OPTIONS = [
  { id: "chocolate", name: "Chocolate Chip" },
  { id: "ginger", name: "Ginger" },
  { id: "shortbread", name: "Shortbread" },
  { id: "vanilla", name: "Vanilla Butter" },
  { id: "oat", name: "Oat & Raisin" },
  { id: "coconut", name: "Coconut" },
  { id: "lemon", name: "Lemon" },
  { id: "mixed", name: "Assorted Mix" }
];

let selectedFlavours = []; // { id, name, qty, size: 'Single'|'Bulk' }
let orderType = "Single";

const getRadioValue = (name) => {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : "";
};

const formatCurrency = (value) => `R${value.toLocaleString("en-ZA")}`;

const selectedProducts = () =>
  productRows
    .map((row) => {
      const input = row.querySelector("input");
      const quantity = Math.max(0, Number(input?.value) || 0);
      const price = Number(row.dataset.price || 0);
      return { name: row.dataset.product, quantity, price };
    })
    .filter((item) => item.quantity > 0);

const buildOrderMessage = () => {
  const items = selectedProducts();
  const name = document.querySelector("#customerName")?.value.trim() || "";
  const phone = document.querySelector("#customerPhone")?.value.trim() || "";
  const date = document.querySelector("#orderDate")?.value || "";
  const time = document.querySelector("#orderTime")?.value || "";
  const fulfilment = getRadioValue("fulfilment") || "Collection";
  const payment = getRadioValue("payment") || "EFT / bank transfer";
  const address = deliveryAddress?.value.trim() || "";
  const notes = document.querySelector("#orderNotes")?.value.trim() || "";
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const flavourLines =
    selectedFlavours.length > 0
      ? [
          "",
          "Custom flavours:",
          ...selectedFlavours.map(
            (f) => `- ${f.name} × ${f.qty} (${f.size})`
          )
        ]
      : [];

  const lines = [
    "Hello The Biscuit Man, I would like to place an order.",
    "",
    `Order type: ${orderType}`,
    "",
    "Items:",
    ...items.map(
      (item) =>
        `- ${item.name} × ${item.quantity} (${formatCurrency(item.price * item.quantity)})`
    ),
    ...flavourLines,
    "",
    `Estimated total: ${formatCurrency(total)}`,
    `Fulfilment: ${fulfilment}`,
    fulfilment.includes("Courier") && address ? `Delivery address: ${address}` : "",
    date ? `Preferred date: ${date}` : "",
    time ? `Preferred time: ${time}` : "",
    `Payment preference: ${payment}`,
    name ? `Customer name: ${name}` : "",
    phone ? `Customer phone: ${phone}` : "",
    notes ? `Notes: ${notes}` : "",
    "",
    "Please confirm availability, final total (including any bulk discount), and collection or courier timing."
  ];

  return lines.filter(Boolean).join("\n");
};

const updateSummary = () => {
  if (!summaryBox) return;

  const items = selectedProducts();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const fulfilment = getRadioValue("fulfilment") || "Collection";
  const payment = getRadioValue("payment") || "EFT / bank transfer";
  const dateValue = document.querySelector("#orderDate")?.value || "";
  const timeValue = document.querySelector("#orderTime")?.value || "";

  if (summaryOrderType) summaryOrderType.textContent = orderType === "Bulk" ? "Bulk order" : "Single pack";
  if (summaryFulfilment) summaryFulfilment.textContent = fulfilment.includes("Courier") ? "Courier" : "Collection";
  if (summaryPayment) summaryPayment.textContent = payment.replace(" / bank transfer", "").replace(" / debit or credit card", "");
  if (summaryDate) summaryDate.textContent = dateValue ? `${dateValue}${timeValue ? ` at ${timeValue}` : ""}` : "Not set";
  if (summaryTotal) summaryTotal.textContent = formatCurrency(total);

  const hasContent = items.length > 0 || selectedFlavours.length > 0;
  summaryBox.textContent = hasContent
    ? buildOrderMessage()
    : "Choose products, flavours and quantities to preview your WhatsApp order message.";
};

const updateFlavoursPreview = () => {
  const preview = document.querySelector("#selectedFlavorsPreview");
  if (!preview) return;
  if (selectedFlavours.length === 0) {
    preview.textContent = "";
    return;
  }
  preview.textContent = selectedFlavours
    .map((f) => `${f.name} ×${f.qty} (${f.size})`)
    .join(" · ");
};

/* Order type toggle */
const orderTypeToggle = document.querySelector("#orderTypeToggle");
orderTypeToggle?.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", () => {
    orderTypeToggle.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    orderType = btn.dataset.type || "Single";
    updateSummary();
  });
});

/* Flavour modal */
const flavorModal = document.getElementById("flavorModal");
const flavorList = document.getElementById("flavorList");
const openFlavorBtn = document.getElementById("openFlavorModal");
const closeFlavorBtn = document.getElementById("closeFlavorModal");
const applyFlavorsBtn = document.getElementById("applyFlavors");
const clearFlavorsBtn = document.getElementById("clearFlavors");

const openFlavorModal = () => {
  if (!flavorModal || !flavorList) return;
  renderFlavorList();
  flavorModal.classList.add("open");
  flavorModal.setAttribute("aria-hidden", "false");
};

const closeFlavorModal = () => {
  if (!flavorModal) return;
  flavorModal.classList.remove("open");
  flavorModal.setAttribute("aria-hidden", "true");
};

const renderFlavorList = () => {
  if (!flavorList) return;
  flavorList.innerHTML = FLAVOUR_OPTIONS.map((opt) => {
    const existing = selectedFlavours.find((f) => f.id === opt.id);
    const checked = existing ? "checked" : "";
    const qty = existing ? existing.qty : 1;
    const size = existing ? existing.size : "Single";
    return `
      <div class="flavor-item" data-id="${opt.id}">
        <label>
          <input type="checkbox" data-flavour-id="${opt.id}" ${checked}>
          ${opt.name}
        </label>
        <div class="qty-mini">
          <button type="button" data-step="-1" aria-label="Decrease">−</button>
          <input type="number" min="1" value="${qty}" data-qty="${opt.id}" aria-label="Quantity for ${opt.name}">
          <button type="button" data-step="1" aria-label="Increase">+</button>
        </div>
        <select data-size="${opt.id}" aria-label="Size for ${opt.name}">
          <option value="Single" ${size === "Single" ? "selected" : ""}>Single</option>
          <option value="Bulk" ${size === "Bulk" ? "selected" : ""}>Bulk</option>
        </select>
      </div>
    `;
  }).join("");

  flavorList.querySelectorAll(".qty-mini button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input");
      const step = Number(btn.dataset.step);
      input.value = Math.max(1, (Number(input.value) || 1) + step);
    });
  });
};

openFlavorBtn?.addEventListener("click", openFlavorModal);
closeFlavorBtn?.addEventListener("click", closeFlavorModal);
flavorModal?.addEventListener("click", (e) => {
  if (e.target === flavorModal) closeFlavorModal();
});

applyFlavorsBtn?.addEventListener("click", () => {
  selectedFlavours = [];
  FLAVOUR_OPTIONS.forEach((opt) => {
    const checkbox = flavorList?.querySelector(`input[data-flavour-id="${opt.id}"]`);
    if (checkbox?.checked) {
      const qtyInput = flavorList.querySelector(`input[data-qty="${opt.id}"]`);
      const sizeSelect = flavorList.querySelector(`select[data-size="${opt.id}"]`);
      selectedFlavours.push({
        id: opt.id,
        name: opt.name,
        qty: Math.max(1, Number(qtyInput?.value) || 1),
        size: sizeSelect?.value || "Single"
      });
    }
  });
  updateFlavoursPreview();
  updateSummary();
  closeFlavorModal();
});

clearFlavorsBtn?.addEventListener("click", () => {
  selectedFlavours = [];
  updateFlavoursPreview();
  updateSummary();
  renderFlavorList();
});

if (orderForm) {
  productRows.forEach((row) => {
    const input = row.querySelector("input");
    row.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        const step = Number(button.dataset.step);
        input.value = Math.max(0, (Number(input.value) || 0) + step);
        updateSummary();
      });
    });

    input?.addEventListener("input", () => {
      input.value = Math.max(0, Number(input.value) || 0);
      updateSummary();
    });
  });

  document.querySelectorAll("input, textarea").forEach((element) => {
    element.addEventListener("input", updateSummary);
    element.addEventListener("change", updateSummary);
  });

  document.querySelectorAll("input[name='fulfilment']").forEach((radio) => {
    radio.addEventListener("change", () => {
      const needsDelivery = getRadioValue("fulfilment").includes("Courier");
      if (deliveryFields) deliveryFields.hidden = !needsDelivery;
      if (!needsDelivery && deliveryAddress) deliveryAddress.value = "";
      updateSummary();
    });
  });

  const openWhatsApp = () => {
    if (!selectedProducts().length && selectedFlavours.length === 0) {
      alert("Please choose at least one product or flavour before sending your WhatsApp order.");
      return;
    }

    if (getRadioValue("fulfilment").includes("Courier") && deliveryAddress && !deliveryAddress.value.trim()) {
      deliveryAddress.focus();
      alert("Please add a delivery / courier address or choose collection.");
      return;
    }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildOrderMessage())}`;
    window.open(url, "_blank", "noopener");
  };

  sendOrderButton?.addEventListener("click", openWhatsApp);
  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    openWhatsApp();
  });

  updateSummary();
  updateFlavoursPreview();
}

/* Gallery modal */
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const modalClose = document.querySelector(".modal-close");

document.querySelectorAll(".gallery-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const imageUrl = link.getAttribute("href");
    const altText = link.querySelector("img")?.getAttribute("alt") || "Biscuit gallery image";
    if (!imageModal || !modalImage || !imageUrl) return;
    modalImage.src = imageUrl;
    modalImage.alt = altText;
    imageModal.classList.add("open");
    imageModal.setAttribute("aria-hidden", "false");
  });
});

const closeModal = () => {
  if (!imageModal || !modalImage) return;
  imageModal.classList.remove("open");
  imageModal.setAttribute("aria-hidden", "true");
  modalImage.src = "";
};

modalClose?.addEventListener("click", closeModal);
imageModal?.addEventListener("click", (event) => {
  if (event.target === imageModal) closeModal();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && imageModal?.classList.contains("open")) closeModal();
});

window.addEventListener("load", () => {
  document.body.classList.add("is-loaded");
});
