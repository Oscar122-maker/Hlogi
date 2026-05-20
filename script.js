const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

const closeSiteMenu = () => {
  if (!siteHeader) return;
  siteHeader.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
  navToggle?.setAttribute("aria-label", "Open site menu");
};

if (navToggle && siteHeader) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteHeader.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close site menu" : "Open site menu");
  });
}

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeSiteMenu);
});

const currentPath = window.location.pathname.split("/").pop();
siteNav?.querySelectorAll("a").forEach((link) => {
  const href = link.getAttribute("href");
  if (href === currentPath) {
    link.classList.add("active");
  }
});

const orderForm = document.querySelector("#orderForm");
const summaryBox = document.querySelector("#summaryBox");
const summaryTotal = document.querySelector("#summaryTotal");
const summaryFulfilment = document.querySelector("#summaryFulfilment");
const summaryPayment = document.querySelector("#summaryPayment");
const summaryDate = document.querySelector("#summaryDate");
const summaryContact = document.querySelector("#summaryContact");
const deliveryFields = document.querySelector("#deliveryFields");
const deliveryAddress = document.querySelector("#deliveryAddress");
const sendOrderButton = document.querySelector("#sendOrder");
const productRows = [...document.querySelectorAll(".product-row")];
const WHATSAPP_NUMBER = "27769700695";

const getRadioValue = (name) => {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : "";
};

const selectedProducts = () =>
  productRows
    .map((row) => {
      const input = row.querySelector("input");
      const quantity = Math.max(0, Number(input.value) || 0);
      const price = Number(row.dataset.price || 0);
      return { name: row.dataset.product, quantity, price };
    })
    .filter((item) => item.quantity > 0);

const formatCurrency = (value) => `R${value.toLocaleString("en-ZA")}`;

const orderMessage = () => {
  const items = selectedProducts();
  const name = document.querySelector("#customerName")?.value.trim() || "";
  const phone = document.querySelector("#customerPhone")?.value.trim() || "";
  const date = document.querySelector("#orderDate")?.value || "";
  const time = document.querySelector("#orderTime")?.value || "";
  const fulfilment = getRadioValue("fulfilment");
  const payment = getRadioValue("payment");
  const address = deliveryAddress?.value.trim() || "";
  const notes = document.querySelector("#orderNotes")?.value.trim() || "";

  const lines = [
    "Hello Hlogi Yummy Bakery, I would like to place an order.",
    "",
    "Order details:",
    ...items.map((item) => `- ${item.name} x ${item.quantity} @ ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)}`),
    "",
    `Total: ${formatCurrency(items.reduce((sum, item) => sum + item.price * item.quantity, 0))}`,
    "",
    `Fulfilment: ${fulfilment}`,
    fulfilment === "Delivery" && address ? `Delivery address: ${address}` : "",
    date ? `Preferred date: ${date}` : "",
    time ? `Preferred time: ${time}` : "",
    `Payment preference: ${payment}`,
    name ? `Customer name: ${name}` : "",
    phone ? `Contact number: ${phone}` : "",
    notes ? `Notes: ${notes}` : "",
    "",
    "Please confirm availability, pricing and collection or delivery timing."
  ];

  return lines.filter(Boolean).join("\n");
};

const updateSummary = () => {
  if (!summaryBox) return;
  const items = selectedProducts();

  const fulfilment = getRadioValue("fulfilment") || "Collection";
  const payment = getRadioValue("payment") || "EFT";
  const dateValue = document.querySelector("#orderDate")?.value || "";
  const timeValue = document.querySelector("#orderTime")?.value || "";
  const contactName = document.querySelector("#customerName")?.value.trim() || "";
  const contactPhone = document.querySelector("#customerPhone")?.value.trim() || "";

  if (summaryFulfilment) summaryFulfilment.textContent = fulfilment;
  if (summaryPayment) summaryPayment.textContent = payment;
  if (summaryDate) summaryDate.textContent = dateValue ? `${dateValue}${timeValue ? ` • ${timeValue}` : ""}` : "Not set";
  if (summaryContact) summaryContact.textContent = contactName || contactPhone ? `${contactName}${contactName && contactPhone ? " • " : ""}${contactPhone || contactName}` : "Pending";

  if (!items.length) {
    summaryBox.textContent = "Choose products and quantities to preview your order.";
    if (summaryTotal) summaryTotal.textContent = formatCurrency(0);
    return;
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  summaryBox.textContent = orderMessage();
  if (summaryTotal) summaryTotal.textContent = formatCurrency(total);
};

if (orderForm) {
  productRows.forEach((row) => {
    const input = row.querySelector("input");
    row.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        const step = Number(button.dataset.step);
        input.value = Math.max(0, Number(input.value || 0) + step);
        updateSummary();
      });
    });

    input.addEventListener("input", () => {
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
      const needsDelivery = getRadioValue("fulfilment") === "Delivery";
      if (deliveryFields) deliveryFields.hidden = !needsDelivery;
      if (!needsDelivery && deliveryAddress) deliveryAddress.value = "";
      updateSummary();
    });
  });

  const openWhatsApp = () => {
    const items = selectedProducts();
    if (!items.length) {
      alert("Please choose at least one bakery item before sending your WhatsApp order.");
      return;
    }

    if (getRadioValue("fulfilment") === "Delivery" && deliveryAddress && !deliveryAddress.value.trim()) {
      deliveryAddress.focus();
      alert("Please add a delivery address or choose collection.");
      return;
    }

    const message = orderMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
  };

  sendOrderButton?.addEventListener("click", openWhatsApp);
  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    openWhatsApp();
  });

  updateSummary();
}

const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const modalClose = document.querySelector(".modal-close");

document.querySelectorAll(".gallery-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const imageUrl = link.getAttribute("href");
    const altText = link.querySelector("img")?.getAttribute("alt") || "Gallery image";
    if (imageModal && modalImage && imageUrl) {
      modalImage.src = imageUrl;
      modalImage.alt = altText;
      imageModal.classList.add("open");
      imageModal.setAttribute("aria-hidden", "false");
    }
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
  if (event.target === imageModal) {
    closeModal();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && imageModal?.classList.contains("open")) {
    closeModal();
  }
});

const eventTargetDate = new Date("May 23, 2026 11:00:00");
const countdownDays = document.getElementById("countdownDays");
const countdownHours = document.getElementById("countdownHours");
const countdownMinutes = document.getElementById("countdownMinutes");
const countdownSeconds = document.getElementById("countdownSeconds");

const updateCountdown = () => {
  if (!countdownDays || !countdownHours || !countdownMinutes || !countdownSeconds) return;
  const now = new Date();
  const diff = eventTargetDate - now;
  if (diff <= 0) {
    countdownDays.textContent = "00";
    countdownHours.textContent = "00";
    countdownMinutes.textContent = "00";
    countdownSeconds.textContent = "00";
    return;
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  countdownDays.textContent = String(days).padStart(2, "0");
  countdownHours.textContent = String(hours).padStart(2, "0");
  countdownMinutes.textContent = String(minutes).padStart(2, "0");
  countdownSeconds.textContent = String(seconds).padStart(2, "0");
};

setInterval(updateCountdown, 1000);
updateCountdown();

window.addEventListener("load", () => {
  document.body.classList.add("is-loaded");
});
