// Dashboard JavaScript

document.addEventListener("DOMContentLoaded", function () {
  initializeDashboard();
});

function initializeDashboard() {
  loadUserData();
  updateStats();
  loadActiveInvestments();
  loadRecentActivity();
  checkAuthStatus();
}

function checkAuthStatus() {
  const token = localStorage.getItem("authToken");
  const userData = localStorage.getItem("userData");

  if (!token || !userData) {
    window.location.href = "login.html";
    return;
  }

  const user = JSON.parse(userData);
  document.getElementById("userName").textContent = user.fullName || "User";
  document.getElementById("welcomeName").textContent = user.fullName || "User";
}

function loadUserData() {
  const userData = localStorage.getItem("userData");
  if (userData) {
    const user = JSON.parse(userData);

    // Update UI with user data
    document.getElementById("totalBalance").textContent = formatCurrency(
      user.balance || 25000
    );
    document.getElementById("totalInvested").textContent = formatCurrency(
      user.totalInvested || 15000
    );
    document.getElementById("totalEarnings").textContent = formatCurrency(
      user.totalEarnings || 3750
    );
    document.getElementById("referralCount").textContent =
      user.referralCount || 12;

    // Update referral link
    const referralLink = document.getElementById("referralLink");
    if (referralLink) {
      referralLink.value = `https://noblevest.com/ref/${user.id || "USER123"}`;
    }
  }
}

function updateStats() {
  // Animate counters
  animateCounter("totalBalance", 25000, "$");
  animateCounter("totalInvested", 15000, "$");
  animateCounter("totalEarnings", 3750, "$");
  animateCounter("referralCount", 12);
}

function animateCounter(elementId, target, prefix = "") {
  const element = document.getElementById(elementId);
  if (!element) return;

  let current = 0;
  const increment = target / 100;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }

    let value = Math.round(current);
    if (prefix === "$") {
      value = formatCurrency(value);
    }
    element.textContent = value;
  }, 20);
}

function loadActiveInvestments() {
  // This would typically load from an API
  const investments = [
    {
      plan: "Crypto Starter",
      amount: 5000,
      roi: "12%",
      progress: 65,
      status: "Active",
    },
    {
      plan: "Forex Pro",
      amount: 10000,
      roi: "15%",
      progress: 80,
      status: "Active",
    },
  ];

  const tbody = document.getElementById("activeInvestments");
  if (tbody) {
    tbody.innerHTML = investments
      .map(
        (investment) => `
            <tr>
                <td><strong>${investment.plan}</strong></td>
                <td>${formatCurrency(investment.amount)}</td>
                <td>${investment.roi}</td>
                <td>
                    <div class="progress" style="height: 8px;">
                        <div class="progress-bar" style="width: ${
                          investment.progress
                        }%"></div>
                    </div>
                    <small class="text-muted">${
                      investment.progress
                    }% complete</small>
                </td>
                <td><span class="badge status-active">${
                  investment.status
                }</span></td>
            </tr>
        `
      )
      .join("");
  }
}

function loadRecentActivity() {
  const activities = [
    {
      icon: "fas fa-plus-circle",
      iconClass: "text-success",
      time: "2 hours ago",
      description: "Deposited $1,000 via USDT",
    },
    {
      icon: "fas fa-chart-line",
      iconClass: "text-primary",
      time: "1 day ago",
      description: "Invested in Crypto Starter plan",
    },
    {
      icon: "fas fa-coins",
      iconClass: "text-warning",
      time: "3 days ago",
      description: "Earned $125 from investments",
    },
    {
      icon: "fas fa-users",
      iconClass: "text-info",
      time: "5 days ago",
      description: "New referral joined",
    },
  ];

  const container = document.getElementById("recentActivity");
  if (container) {
    container.innerHTML = activities
      .map(
        (activity) => `
            <div class="activity-item">
                <div class="activity-icon ${activity.iconClass}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <small class="text-muted">${activity.time}</small>
                    <p class="mb-0">${activity.description}</p>
                </div>
            </div>
        `
      )
      .join("");
  }
}

// Add CSS for activity feed
const activityStyles = `
<style>
.activity-feed {
    max-height: 300px;
    overflow-y: auto;
}

.activity-item {
    display: flex;
    align-items: flex-start;
    padding: 15px 0;
    border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
    border-bottom: none;
}

.activity-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    background-color: rgba(var(--bs-primary-rgb), 0.1);
}

.activity-content {
    flex: 1;
}

.activity-content p {
    font-size: 0.9rem;
    color: #333;
}

.blog-preview img {
    height: 150px;
    object-fit: cover;
}

.blog-preview h6 a {
    color: #333;
    transition: color 0.3s ease;
}

.blog-preview h6 a:hover {
    color: var(--primary-color);
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML("beforeend", activityStyles);
// Format currency function
function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}