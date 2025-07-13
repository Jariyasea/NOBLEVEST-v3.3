// NOBLEVEST Authentication JavaScript with Supabase Integration

// Supabase Configuration
const SUPABASE_URL = "https://ayhstyumenpgzaiflpqa.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5aHN0eXVtZW5wZ3phaWZscHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxODI3MzcsImV4cCI6MjA2Nzc1ODczN30.og4lm4GWRawW6ruF6_ERlaPNMa9Zs34xX8kNJsjDNpg";

// Load Supabase from CDN
const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
script.onload = initializeSupabase;
document.head.appendChild(script);

let supabase;

function initializeSupabase() {
  if (window.supabase && window.supabase.createClient) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    console.log("Supabase initialized successfully");
  } else {
    console.error("Supabase not loaded properly");
  }
}

// Initialize auth when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(initializeAuth, 1000); // Wait for Supabase to load
});

// Initialize authentication functionality
function initializeAuth() {
  // Check if we're on login page
  if (document.getElementById("emailLoginForm")) {
    initializeLogin();
  }

  // Check if we're on register page
  if (document.getElementById("registerForm")) {
    initializeRegister();
  }
}

// Initialize login functionality
function initializeLogin() {
  const emailForm = document.getElementById("emailLoginForm");
  const phoneForm = document.getElementById("phoneLoginForm");
  const otpForm = document.getElementById("otpLoginForm");
  const togglePassword = document.getElementById("togglePassword");

  // Email login form submission
  if (emailForm) {
    emailForm.addEventListener("submit", handleEmailLogin);
  }

  // Phone login form submission
  if (phoneForm) {
    phoneForm.addEventListener("submit", handlePhoneLogin);
  }

  // Email OTP form submission
  if (otpForm) {
    otpForm.addEventListener("submit", handleEmailOTPLogin);
  }

  // Password toggle
  if (togglePassword) {
    togglePassword.addEventListener("click", function () {
      const passwordField = document.getElementById("password");
      const icon = this.querySelector("i");

      if (passwordField.type === "password") {
        passwordField.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        passwordField.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  }

  // Initialize tab switching
  initializeLoginTabs();
}

// Initialize login tabs
function initializeLoginTabs() {
  const emailTab = document.getElementById("email-tab");
  const phoneTab = document.getElementById("phone-tab");
  const otpTab = document.getElementById("otp-tab");

  if (emailTab) {
    emailTab.addEventListener("click", function () {
      clearFormErrors("emailLoginForm");
    });
  }

  if (phoneTab) {
    phoneTab.addEventListener("click", function () {
      clearFormErrors("phoneLoginForm");
    });
  }

  if (otpTab) {
    otpTab.addEventListener("click", function () {
      clearFormErrors("otpLoginForm");
    });
  }
}

// Handle email login
async function handleEmailLogin(e) {
  e.preventDefault();

  if (!supabase) {
    showAlert(
      "Authentication service not ready. Please refresh the page.",
      "danger"
    );
    return;
  }

  const form = e.target;
  const formData = new FormData(form);
  const email = formData.get("email");
  const password = formData.get("password");

  // Validate form
  if (!email || !password) {
    showAlert("Please fill in all required fields", "danger");
    return;
  }

  if (password.length < 6) {
    showAlert("Password must be at least 6 characters long", "danger");
    return;
  }

  // Show loading
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin me-2"></i>Signing in...';
  submitBtn.disabled = true;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        showAlert(
          "Please check your email and click the confirmation link first",
          "warning"
        );
      } else if (error.message.includes("Invalid login credentials")) {
        showAlert("Invalid email or password. Please try again.", "danger");
      } else {
        showAlert(error.message, "danger");
      }
      return;
    }

    if (data.user) {
      showAlert("Login successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    }
  } catch (error) {
    console.error("Login error:", error);
    showAlert("Login failed. Please try again.", "danger");
  } finally {
    // Reset button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// Handle phone login
async function handlePhoneLogin(e) {
  e.preventDefault();

  if (!supabase) {
    showAlert(
      "Authentication service not ready. Please refresh the page.",
      "danger"
    );
    return;
  }

  const form = e.target;
  const formData = new FormData(form);
  const phone = formData.get("phone");
  const otp = formData.get("otp");
  const otpSection = document.getElementById("otpSection");
  const phoneLoginBtn = document.getElementById("phoneLoginBtn");
  const resendSection = document.getElementById("resendSection");
  const sentTo = document.getElementById("sentTo");

  // Check if we're sending OTP or verifying
  if (!otpSection.style.display || otpSection.style.display === "none") {
    // Send OTP
    if (!phone) {
      showAlert("Please enter your phone number", "danger");
      return;
    }

    // Show loading
    const originalText = phoneLoginBtn.innerHTML;
    phoneLoginBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin me-2"></i>Sending OTP...';
    phoneLoginBtn.disabled = true;

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      });

      if (error) {
        showAlert(error.message, "danger");
        return;
      }

      // Show OTP section
      otpSection.style.display = "block";
      resendSection.style.display = "block";
      sentTo.textContent = phone;
      phoneLoginBtn.innerHTML = '<i class="fas fa-key me-2"></i>Verify Code';

      showAlert("Verification code sent successfully!", "success");

      // Start countdown for resend
      startResendCountdown();
    } catch (error) {
      console.error("Send OTP error:", error);
      showAlert("Failed to send OTP. Please try again.", "danger");
    } finally {
      phoneLoginBtn.disabled = false;
    }
  } else {
    // Verify OTP
    if (!otp || otp.length !== 6) {
      showAlert("Please enter the 6-digit verification code", "danger");
      return;
    }

    // Show loading
    const originalText = phoneLoginBtn.innerHTML;
    phoneLoginBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin me-2"></i>Verifying...';
    phoneLoginBtn.disabled = true;

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: "sms",
      });

      if (error) {
        showAlert(error.message, "danger");
        return;
      }

      if (data.user) {
        showAlert("Login successful! Redirecting...", "success");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1500);
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      showAlert("Invalid verification code. Please try again.", "danger");
    } finally {
      phoneLoginBtn.innerHTML = originalText;
      phoneLoginBtn.disabled = false;
    }
  }
}

// Handle email OTP login
async function handleEmailOTPLogin(e) {
  e.preventDefault();

  if (!supabase) {
    showAlert(
      "Authentication service not ready. Please refresh the page.",
      "danger"
    );
    return;
  }

  const form = e.target;
  const formData = new FormData(form);
  const emailOtp = formData.get("emailOtp");
  const emailCode = formData.get("emailCode");
  const emailCodeSection = document.getElementById("emailCodeSection");
  const otpLoginBtn = document.getElementById("otpLoginBtn");
  const emailResendSection = document.getElementById("emailResendSection");
  const emailSentTo = document.getElementById("emailSentTo");

  // Check if we're sending OTP or verifying
  if (
    !emailCodeSection.style.display ||
    emailCodeSection.style.display === "none"
  ) {
    // Send Email OTP
    if (!emailOtp) {
      showAlert("Please enter your email address", "danger");
      return;
    }

    // Show loading
    const originalText = otpLoginBtn.innerHTML;
    otpLoginBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin me-2"></i>Sending Code...';
    otpLoginBtn.disabled = true;

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailOtp,
      });

      if (error) {
        showAlert(error.message, "danger");
        return;
      }

      // Show code section
      emailCodeSection.style.display = "block";
      emailResendSection.style.display = "block";
      emailSentTo.textContent = emailOtp;
      otpLoginBtn.innerHTML = '<i class="fas fa-key me-2"></i>Verify Code';

      showAlert("Verification code sent to your email!", "success");
    } catch (error) {
      console.error("Send Email OTP error:", error);
      showAlert(
        "Failed to send verification code. Please try again.",
        "danger"
      );
    } finally {
      otpLoginBtn.disabled = false;
    }
  } else {
    // Verify Email OTP
    if (!emailCode || emailCode.length !== 6) {
      showAlert("Please enter the 6-digit verification code", "danger");
      return;
    }

    // Show loading
    const originalText = otpLoginBtn.innerHTML;
    otpLoginBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin me-2"></i>Verifying...';
    otpLoginBtn.disabled = true;

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: emailOtp,
        token: emailCode,
        type: "email",
      });

      if (error) {
        showAlert(error.message, "danger");
        return;
      }

      if (data.user) {
        showAlert("Login successful! Redirecting...", "success");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1500);
      }
    } catch (error) {
      console.error("Verify Email OTP error:", error);
      showAlert("Invalid verification code. Please try again.", "danger");
    } finally {
      otpLoginBtn.innerHTML = originalText;
      otpLoginBtn.disabled = false;
    }
  }
}

// Start resend countdown
function startResendCountdown() {
  const resendLink = document.getElementById("resendOTP");
  const emailResendLink = document.getElementById("resendEmailOTP");
  let countdown = 60;

  const updateResend = () => {
    if (countdown > 0) {
      if (resendLink) {
        resendLink.textContent = `Resend (${countdown}s)`;
        resendLink.style.pointerEvents = "none";
        resendLink.style.color = "#999";
      }
      if (emailResendLink) {
        emailResendLink.textContent = `Resend (${countdown}s)`;
        emailResendLink.style.pointerEvents = "none";
        emailResendLink.style.color = "#999";
      }
      countdown--;
      setTimeout(updateResend, 1000);
    } else {
      if (resendLink) {
        resendLink.textContent = "Resend";
        resendLink.style.pointerEvents = "auto";
        resendLink.style.color = "";
        resendLink.onclick = function (e) {
          e.preventDefault();
          const phone = document.getElementById("phone").value;
          if (phone) handleResendOTP(phone);
        };
      }
      if (emailResendLink) {
        emailResendLink.textContent = "Resend";
        emailResendLink.style.pointerEvents = "auto";
        emailResendLink.style.color = "";
        emailResendLink.onclick = function (e) {
          e.preventDefault();
          const email = document.getElementById("emailOtp").value;
          if (email) handleResendEmailOTP(email);
        };
      }
    }
  };

  updateResend();
}

// Handle resend OTP
async function handleResendOTP(phone) {
  const resendLink = document.getElementById("resendOTP");
  const originalText = resendLink.textContent;

  resendLink.textContent = "Sending...";
  resendLink.style.pointerEvents = "none";

  try {
    const { error } = await supabase.auth.signInWithOtp({ phone });

    if (error) {
      showAlert(error.message, "danger");
    } else {
      showAlert("New verification code sent!", "success");
      startResendCountdown();
    }
  } catch (error) {
    console.error("Resend OTP error:", error);
    showAlert("Failed to resend OTP. Please try again.", "danger");
    resendLink.textContent = originalText;
    resendLink.style.pointerEvents = "auto";
  }
}

// Handle resend email OTP
async function handleResendEmailOTP(email) {
  const resendLink = document.getElementById("resendEmailOTP");
  const originalText = resendLink.textContent;

  resendLink.textContent = "Sending...";
  resendLink.style.pointerEvents = "none";

  try {
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      showAlert(error.message, "danger");
    } else {
      showAlert("New verification code sent!", "success");
      startResendCountdown();
    }
  } catch (error) {
    console.error("Resend Email OTP error:", error);
    showAlert("Failed to resend code. Please try again.", "danger");
    resendLink.textContent = originalText;
    resendLink.style.pointerEvents = "auto";
  }
}

// Initialize register functionality
function initializeRegister() {
  const form = document.getElementById("registerForm");
  if (form) {
    form.addEventListener("submit", handleRegister);

    // Add real-time validation
    const passwordField = form.querySelector('[name="password"]');
    const confirmPasswordField = form.querySelector('[name="confirmPassword"]');

    if (confirmPasswordField) {
      confirmPasswordField.addEventListener("input", function () {
        if (this.value && passwordField.value !== this.value) {
          this.classList.add("is-invalid");
          this.classList.remove("is-valid");
        } else if (this.value) {
          this.classList.remove("is-invalid");
          this.classList.add("is-valid");
        }
      });
    }
  }
}

// Handle registration
async function handleRegister(e) {
  e.preventDefault();

  if (!supabase) {
    showAlert(
      "Authentication service not ready. Please refresh the page.",
      "danger"
    );
    return;
  }

  const form = e.target;
  const formData = new FormData(form);

  const fullName = formData.get("fullName");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const referralCode = formData.get("referralCode");
  const termsAccepted = formData.get("terms");

  // Validate form
  if (!fullName || !email || !phone || !password || !confirmPassword) {
    showAlert("Please fill in all required fields", "danger");
    return;
  }

  if (password.length < 6) {
    showAlert("Password must be at least 6 characters long", "danger");
    return;
  }

  if (password !== confirmPassword) {
    showAlert("Passwords do not match", "danger");
    return;
  }

  if (!termsAccepted) {
    showAlert("Please accept the Terms & Conditions", "danger");
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin me-2"></i>Creating Account...';
  submitBtn.disabled = true;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard.html`,
        data: {
          full_name: fullName,
          phone: phone,
          referral_code: referralCode,
        },
      },
    });

    if (error) {
      showAlert(error.message, "danger");
      return;
    }

    if (data.user) {
      showAlert(
        "Account created successfully! Please check your email to verify your account.",
        "success"
      );
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    }
  } catch (error) {
    console.error("Registration error:", error);
    showAlert("Registration failed. Please try again.", "danger");
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// Clear form errors
function clearFormErrors(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.querySelectorAll(".is-invalid").forEach((field) => {
      field.classList.remove("is-invalid");
    });
    form.querySelectorAll(".is-valid").forEach((field) => {
      field.classList.remove("is-valid");
    });

    // Clear alert container
    const alertContainer = document.getElementById("alertContainer");
    if (alertContainer) {
      alertContainer.innerHTML = "";
    }
  }
}

// Show alert function
function showAlert(message, type = "info", container = "#alertContainer") {
  const alertContainer = document.querySelector(container);
  if (!alertContainer) return;

  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  // Clear existing alerts
  alertContainer.innerHTML = "";
  alertContainer.appendChild(alertDiv);

  // Auto-dismiss success/info alerts after 5 seconds
  if (type === "success" || type === "info") {
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove();
      }
    }, 5000);
  }
}
