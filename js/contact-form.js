import gsap from "gsap";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Setup Contact Page Form
  const contactForm = document.getElementById("contact-form-element");
  if (contactForm) {
    const emailInput = document.getElementById("contact-email");
    if (emailInput) {
      const urlParams = new URLSearchParams(window.location.search);
      const prefilledEmail = urlParams.get("email");
      if (prefilledEmail) {
        emailInput.value = prefilledEmail;
      }
    }

    const submitBtn = contactForm.querySelector("a.btn");
    const submitText = submitBtn
      ? submitBtn.querySelector("span:not(.btn-line)") || submitBtn
      : null;
    const originalText = submitText
      ? submitText.textContent.trim()
      : "LET'S START BUILDING";
    const statusDiv = contactForm.querySelector(".form-status");

    if (submitBtn) {
      submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        // Form Validation
        const nameInput = document.getElementById("contact-name");
        const emailInput = document.getElementById("contact-email");
        const messageInput = document.getElementById("contact-message");

        if (
          !nameInput.value.trim() ||
          !emailInput.value.trim() ||
          !messageInput.value.trim()
        ) {
          showStatus(
            statusDiv,
            "Error: All fields are required for transmission.",
            true,
          );
          return;
        }

        if (!validateEmail(emailInput.value.trim())) {
          showStatus(statusDiv, "Error: Invalid return address (email).", true);
          return;
        }

        // Set Loading State
        setFormDisabled(contactForm, true);
        if (submitText) submitText.textContent = "TRANSMITTING SIGNAL...";

        try {
          const response = await fetch("/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: nameInput.value.trim(),
              email: emailInput.value.trim(),
              message: messageInput.value.trim(),
              type: "contact",
            }),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            showStatus(
              statusDiv,
              "Signal Secured. Our crew will respond shortly.",
              false,
            );
            contactForm.reset();
          } else {
            showStatus(
              statusDiv,
              result.error || "Transmission Interrupted. Please try again.",
              true,
            );
          }
        } catch (err) {
          console.error("Submission error:", err);
          showStatus(
            statusDiv,
            "Connection Timeout. Verify link and try again.",
            true,
          );
        } finally {
          setFormDisabled(contactForm, false);
          if (submitText) submitText.textContent = originalText;
        }
      });
    }
  }

  // 2. Setup Footer Subscription Forms
  const footerForms = document.querySelectorAll(".footer-form");
  footerForms.forEach((form) => {
    const submitBtn = form.querySelector("a.btn");
    const submitText = submitBtn
      ? submitBtn.querySelector("span:not(.btn-line)") || submitBtn
      : null;
    const originalText = submitText
      ? submitText.textContent.trim()
      : "TRANSMIT MESSAGE";
    const statusDiv = form.querySelector(".form-status");
    const emailInput = form.querySelector(".footer-email-input");

    if (submitBtn) {
      submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        if (!emailInput || !emailInput.value.trim()) {
          showStatus(statusDiv, "Address required.", true);
          return;
        }

        if (!validateEmail(emailInput.value.trim())) {
          showStatus(statusDiv, "Invalid address.", true);
          return;
        }

        // Capture email and redirect
        const enteredEmail = emailInput.value.trim();
        window.location.href = `/contact?email=${encodeURIComponent(enteredEmail)}`;
      });
    }
  });
});

// Helper: Disable/Enable Form Controls
function setFormDisabled(form, disabled) {
  const inputs = form.querySelectorAll("input, textarea");
  inputs.forEach((input) => {
    input.disabled = disabled;
    if (disabled) {
      input.style.opacity = "0.6";
    } else {
      input.style.opacity = "1";
    }
  });

  const submitBtn = form.querySelector("a.btn");
  if (submitBtn) {
    if (disabled) {
      submitBtn.style.pointerEvents = "none";
      submitBtn.style.opacity = "0.6";
    } else {
      submitBtn.style.pointerEvents = "auto";
      submitBtn.style.opacity = "1";
    }
  }
}

// Helper: Email Validation Regex
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Helper: Animate Status Message
function showStatus(element, message, isError) {
  if (!element) return;

  element.textContent = message;

  if (isError) {
    element.style.borderColor = "var(--base-500)"; // #ee6436 (Orange-Red Theme Warning Color)
    element.style.color = "var(--base-500)";
    element.style.backgroundColor = "rgba(238, 100, 54, 0.05)";
    element.style.border = "1px solid var(--base-500)";
  } else {
    element.style.borderColor = "var(--base-200)"; // Neutral theme color
    element.style.color = "var(--base-100)";
    element.style.backgroundColor = "var(--base-300)"; // Darker theme color
    element.style.border = "1px dashed var(--base-200)";
  }

  // Reset GSAP animation styles
  gsap.killTweensOf(element);
  element.style.display = "block";

  if (isError) {
    // Premium Error Micro-animation: Shake and Fade In
    gsap.fromTo(
      element,
      { opacity: 0, y: 10, x: 0 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          gsap
            .timeline()
            .to(element, { x: -8, duration: 0.05, ease: "none" })
            .to(element, { x: 8, duration: 0.1, ease: "none" })
            .to(element, { x: -6, duration: 0.1, ease: "none" })
            .to(element, { x: 6, duration: 0.1, ease: "none" })
            .to(element, { x: 0, duration: 0.05, ease: "none" });
        },
      },
    );
  } else {
    // Premium Success Micro-animation: Smooth Rise and Fade In
    gsap.fromTo(
      element,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" },
    );
  }
}
