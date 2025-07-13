// NOBLEVEST Main JavaScript

// Global variables
let currentUser = null;
let isLoggedIn = false;

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

// App initialization
function initializeApp() {
  checkAuthStatus();
  initializeAnimations();
  initializeTooltips();
  initializeModals();

  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

// Check authentication status
function checkAuthStatus() {
  const token = localStorage.getItem("authToken");
  const userData = localStorage.getItem("userData");

  if (token && userData) {
    currentUser = JSON.parse(userData);
    isLoggedIn = true;
    updateNavigation();
  }
}

// Update navigation based on auth status
function updateNavigation() {
  const navbar = document.querySelector(".navbar-nav");
  if (!navbar) return;

  if (isLoggedIn) {
    // Replace login/register with user menu
    const authLinks = navbar.querySelector(".navbar-nav:last-child") || navbar;
    authLinks.innerHTML = `
            <div class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user-circle me-1"></i> ${
                      currentUser.fullName || "User"
                    }
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="dashboard.html"><i class="fas fa-tachometer-alt me-2"></i>Dashboard</a></li>
                    <li><a class="dropdown-item" href="deposit.html"><i class="fas fa-plus-circle me-2"></i>Deposit</a></li>
                    <li><a class="dropdown-item" href="withdraw.html"><i class="fas fa-minus-circle me-2"></i>Withdraw</a></li>
                    <li><a class="dropdown-item" href="invest.html"><i class="fas fa-chart-line me-2"></i>Invest</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="logout()"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                </ul>
            </div>
        `;
  }
}

// Initialize animations
function initializeAnimations() {
  // Animate elements on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
      }
    });
  });

  // Observe all feature cards and plan cards
  document.querySelectorAll(".feature-card, .plan-card").forEach((card) => {
    observer.observe(card);
  });

  // Counter animation for stats
  animateCounters();
}

// Animate counter numbers
function animateCounters() {
  const counters = document.querySelectorAll(".stat-number");

  counters.forEach((counter) => {
    const target = parseInt(counter.innerText.replace(/[^0-9]/g, ""));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      const formattedValue = formatStatNumber(current, counter.innerText);
      counter.innerText = formattedValue;
    }, 16);
  });
}

// Format stat numbers
function formatStatNumber(value, originalText) {
  const rounded = Math.round(value);

  if (originalText.includes("$")) {
    if (originalText.includes("M")) {
      return `$${(rounded / 1000000).toFixed(1)}M+`;
    } else if (originalText.includes("K")) {
      return `$${(rounded / 1000).toFixed(0)}K+`;
    }
    return `$${rounded}`;
  } else if (originalText.includes("%")) {
    return `${rounded}%`;
  } else if (originalText.includes("K")) {
    return `${(rounded / 1000).toFixed(0)}K+`;
  }

  return rounded.toString();
}

// Initialize tooltips
function initializeTooltips() {
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

// Initialize modals
function initializeModals() {
  // Auto-show modals with data-auto-show attribute
  document.querySelectorAll("[data-auto-show]").forEach((modal) => {
    const modalInstance = new bootstrap.Modal(modal);
    setTimeout(() => {
      modalInstance.show();
    }, parseInt(modal.dataset.autoShow) || 1000);
  });
}

// Show loading spinner
function showLoading(element) {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }

  if (element) {
    element.innerHTML = `
            <div class="d-flex justify-content-center align-items-center p-3">
                <div class="spinner-custom"></div>
            </div>
        `;
  }
}

// Hide loading spinner
function hideLoading(element, originalContent) {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }

  if (element) {
    element.innerHTML = originalContent || "";
  }
}

// Show alert message
function showAlert(message, type = "info", container = null) {
  const alertClass = `alert-${type}`;
  const iconClass = getAlertIcon(type);

  const alertHtml = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            <i class="${iconClass} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

  if (container) {
    if (typeof container === "string") {
      container = document.querySelector(container);
    }
    container.innerHTML = alertHtml;
  } else {
    // Show as toast
    showToast(message, type);
  }
}

// Get alert icon based on type
function getAlertIcon(type) {
  const icons = {
    success: "fas fa-check-circle",
    danger: "fas fa-exclamation-triangle",
    warning: "fas fa-exclamation-circle",
    info: "fas fa-info-circle",
  };
  return icons[type] || icons.info;
}

// Show toast notification
function showToast(message, type = "info") {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container position-fixed top-0 end-0 p-3";
    toastContainer.style.zIndex = "9999";
    document.body.appendChild(toastContainer);
  }

  const toastId = "toast-" + Date.now();
  const iconClass = getAlertIcon(type);
  const bgClass = `bg-${type}`;

  const toastHtml = `
        <div class="toast ${bgClass} text-white" id="${toastId}" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="${iconClass} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

  toastContainer.insertAdjacentHTML("beforeend", toastHtml);

  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
  toast.show();

  // Remove toast element after it's hidden
  toastElement.addEventListener("hidden.bs.toast", () => {
    toastElement.remove();
  });
}

// Form validation helper
function validateForm(form) {
  if (typeof form === "string") {
    form = document.querySelector(form);
  }

  let isValid = true;
  const errors = [];

  // Get all required fields
  const requiredFields = form.querySelectorAll("[required]");

  requiredFields.forEach((field) => {
    const value = field.value.trim();
    const fieldName =
      field.getAttribute("name") || field.getAttribute("id") || "Field";

    if (!value) {
      isValid = false;
      errors.push(`${fieldName} is required`);
      field.classList.add("is-invalid");
    } else {
      field.classList.remove("is-invalid");
      field.classList.add("is-valid");
    }

    // Email validation
    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errors.push("Please enter a valid email address");
        field.classList.add("is-invalid");
        field.classList.remove("is-valid");
      }
    }

    // Phone validation
    if (field.type === "tel" && value) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ""))) {
        isValid = false;
        errors.push("Please enter a valid phone number");
        field.classList.add("is-invalid");
        field.classList.remove("is-valid");
      }
    }

    // Password validation
    if (field.type === "password" && value) {
      if (value.length < 8) {
        isValid = false;
        errors.push("Password must be at least 8 characters long");
        field.classList.add("is-invalid");
        field.classList.remove("is-valid");
      }
    }

    // Confirm password validation
    if (field.name === "confirmPassword" && value) {
      const passwordField = form.querySelector('[name="password"]');
      if (passwordField && value !== passwordField.value) {
        isValid = false;
        errors.push("Passwords do not match");
        field.classList.add("is-invalid");
        field.classList.remove("is-valid");
      }
    }
  });

  return { isValid, errors };
}

// Format currency
function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

// Format date
function formatDate(date, options = {}) {
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return new Intl.DateTimeFormat("en-US", {
    ...defaultOptions,
    ...options,
  }).format(new Date(date));
}

// Copy to clipboard
function copyToClipboard(text, successMessage = "Copied to clipboard!") {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast(successMessage, "success");
      })
      .catch(() => {
        fallbackCopyToClipboard(text, successMessage);
      });
  } else {
    fallbackCopyToClipboard(text, successMessage);
  }
}

// Fallback copy to clipboard
function fallbackCopyToClipboard(text, successMessage) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
    showToast(successMessage, "success");
  } catch (err) {
    showToast("Failed to copy to clipboard", "danger");
  }

  document.body.removeChild(textArea);
}

// Logout function
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    currentUser = null;
    isLoggedIn = false;

    showToast("Logged out successfully", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  }
}

// API helper functions
const API = {
  baseURL: "https://api.noblevest.com", // Replace with actual API URL

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  },

  // GET request
  get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, params[key]);
    });

    return this.request(url.pathname + url.search);
  },

  // POST request
  post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // PUT request
  put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // DELETE request
  delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  },
};

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    showAlert,
    showToast,
    validateForm,
    formatCurrency,
    formatDate,
    copyToClipboard,
    API,
  };
}
// Add any additional JavaScript functionality here
// For example, you can add event listeners for buttons or forms