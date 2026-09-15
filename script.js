/* =========================================================
   Dymond Kong — Portfolio 2026
   Noir edition interactions
   ========================================================= */

/* ---------------------------------------------------------
   Contact delivery settings
   ---------------------------------------------------------
   CONTACT_EMAIL   where messages should land.
   FORM_ENDPOINT   the service that forwards the form to that
                   inbox. FormSubmit needs no account: the first
                   message sent from the live site triggers a
                   one-time activation email to CONTACT_EMAIL.
                   Click the link in it and every later message
                   arrives in the inbox automatically.
                   Set FORM_ENDPOINT to "" to skip the service
                   and simply open the visitor's mail app with
                   everything pre-filled.
--------------------------------------------------------- */
const CONTACT_EMAIL = "kongdymond56@gmail.com";
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

const menuIcon = document.querySelector("#menu-icon");
const mobileMenu = document.querySelector(".mobile-menu");
const header = document.querySelector(".header");
const canvas = document.querySelector("#particle-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navLinks = document.querySelectorAll(".navbar a");
const sections = document.querySelectorAll("section[id]");
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");
const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");
const toast = document.querySelector(".toast");
const showEmailButton = document.querySelector(".show-email");
const accordionItems = document.querySelectorAll(".accordion-item");

let particles = [];
let toastTimer;
const mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
    active: false
};

/* ---------- mobile navigation ---------- */

if (menuIcon && mobileMenu) {
    menuIcon.addEventListener("click", () => {
        menuIcon.classList.toggle("open");
        mobileMenu.classList.toggle("active");
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            menuIcon.classList.remove("open");
            mobileMenu.classList.remove("active");
        });
    });
}

/* ---------- accordion ---------- */

accordionItems.forEach((item) => {
    const head = item.querySelector(".accordion-head");
    if (!head) return;

    head.addEventListener("click", () => {
        // each panel toggles on its own — opening one never closes another
        item.classList.toggle("open");
    });
});

/* ---------- particle field ---------- */

function createParticle(randomPosition = false) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.05 + Math.random() * 0.16;

    return {
        x: randomPosition ? Math.random() * window.innerWidth : mouse.x,
        y: randomPosition ? Math.random() * window.innerHeight : mouse.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 0.5 + Math.random() * 1.2,
        life: 0.18 + Math.random() * 0.34
    };
}

function resizeCanvas() {
    if (!canvas || !ctx) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * pixelRatio);
    canvas.height = Math.floor(window.innerHeight * pixelRatio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const count = Math.min(70, Math.floor((window.innerWidth * window.innerHeight) / 22000));
    particles = Array.from({ length: count }, () => createParticle(true));
}

function drawParticles() {
    if (!ctx) return;

    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((particle, index) => {
        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;
        const distance = Math.hypot(dx, dy);

        if (mouse.active && distance < 160) {
            const force = (160 - distance) / 160;
            particle.vx += (dx / Math.max(distance, 1)) * force * 0.012;
            particle.vy += (dy / Math.max(distance, 1)) * force * 0.012;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.996;
        particle.vy *= 0.996;

        if (
            particle.x < -20 || particle.x > window.innerWidth + 20 ||
            particle.y < -20 || particle.y > window.innerHeight + 20
        ) {
            particles[index] = createParticle(true);
            return;
        }

        ctx.globalAlpha = particle.life;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.globalAlpha = 0.05;
    ctx.strokeStyle = "#ffffff";

    for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
            const a = particles[i];
            const b = particles[j];
            const distance = Math.hypot(a.x - b.x, a.y - b.y);

            if (distance < 130) {
                ctx.lineWidth = 1 - distance / 130;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(drawParticles);
}

/* ---------- pointer ---------- */

window.addEventListener("pointermove", (event) => {
    mouse.targetX = event.clientX;
    mouse.targetY = event.clientY;
    mouse.active = true;
});

window.addEventListener("pointerleave", () => {
    mouse.active = false;
});

/* ---------- reveal on scroll ---------- */

const revealTargets = [
    ".portrait-frame",
    ".hero-copy",
    ".scroll-cue",
    ".section-heading",
    ".accordion",
    ".about-img",
    ".stat-row",
    ".service-box",
    ".project-filters",
    ".project-card",
    ".contact-intro",
    ".contact-form",
    ".footer-top"
];

document.querySelectorAll(revealTargets.join(",")).forEach((element, index) => {
    element.classList.add("reveal");
    element.style.transitionDelay = `${Math.min(index % 6, 5) * 70}ms`;
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.14 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

/* ---------- subtle magnetic buttons ---------- */

document.querySelectorAll(".btn, .filter-btn, .show-email, .social-icons a, .project-foot a").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
        if (prefersReducedMotion) return;

        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    });

    element.addEventListener("pointerleave", () => {
        element.style.transform = "";
    });
});

/* ---------- scroll state ---------- */

function updateScrollState() {
    header.classList.toggle("scrolled", window.scrollY > 30);

    const scrollRatio = window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1);
    document.documentElement.style.setProperty("--page-scroll", scrollRatio.toFixed(3));

    let currentSection;
    sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - 200) {
            currentSection = section;
        }
    });

    if (currentSection) {
        navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${currentSection.id}`);
        });
    }
}

/* ---------- project filters ---------- */

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((item) => item.classList.toggle("active", item === button));

        projectCards.forEach((card) => {
            const categories = card.dataset.category.split(" ");
            const shouldShow = filter === "all" || categories.includes(filter);
            card.classList.toggle("hide", !shouldShow);

            if (shouldShow) {
                card.classList.remove("visible");
                window.setTimeout(() => card.classList.add("visible"), 40);
            }
        });
    });
});

/* ---------- toast + form ---------- */

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3200);
}

/* ---------- contact form validation + delivery ---------- */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

const validators = {
    name(value) {
        if (!value) return "Please enter your name so I know who I am replying to.";
        if (value.length < 2) return "That name looks a little short.";
        return "";
    },
    email(value) {
        if (!value) return "Please enter an email address I can reply to.";
        if (!EMAIL_PATTERN.test(value)) return "That email address does not look complete.";
        return "";
    },
    phone(value) {
        if (value && !/^[\d\s+()-]{6,}$/.test(value)) return "Please use digits, spaces, or + only.";
        return "";
    },
    subject(value) {
        if (!value) return "Please add a subject so I can prioritise your message.";
        return "";
    },
    message(value) {
        if (!value) return "Please write a short message.";
        if (value.length < 10) return "A little more detail would help. Ten characters or more, please.";
        return "";
    }
};

function setFieldError(field, message) {
    const wrapper = field.closest("label");
    const slot = wrapper ? wrapper.querySelector(".field-error") : null;

    if (message) {
        field.setAttribute("aria-invalid", "true");
        if (slot) {
            slot.textContent = message;
            slot.classList.add("show");
        }
    } else {
        field.removeAttribute("aria-invalid");
        if (slot) {
            slot.classList.remove("show");
            slot.textContent = "";
        }
    }
}

function setFormStatus(message, state) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.classList.remove("is-error", "is-success");
    if (state) formStatus.classList.add(state);
}

function validateForm(form) {
    let firstInvalid = null;

    Object.keys(validators).forEach((name) => {
        const field = form.elements[name];
        if (!field) return;

        const error = validators[name](field.value.trim());
        setFieldError(field, error);
        if (error && !firstInvalid) firstInvalid = field;
    });

    return firstInvalid;
}

function openMailClient(values) {
    const body = [
        `Name: ${values.name}`,
        `Email: ${values.email}`,
        values.phone ? `Phone: ${values.phone}` : null,
        "",
        values.message
    ].filter((line) => line !== null).join("\n");

    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
}

async function postToEndpoint(values) {
    const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone || "Not provided",
        subject: values.subject,
        message: values.message,
        _subject: `Portfolio enquiry: ${values.subject}`,
        _template: "table",
        _captcha: "false"
    };

    const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
    return response;
}

if (contactForm) {
    contactForm.querySelectorAll("input, textarea").forEach((field) => {
        field.addEventListener("input", () => {
            if (field.hasAttribute("aria-invalid")) setFieldError(field, "");
        });

        field.addEventListener("blur", () => {
            const rule = validators[field.name];
            if (rule) setFieldError(field, rule(field.value.trim()));
        });
    });

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const firstInvalid = validateForm(contactForm);

        if (firstInvalid) {
            setFormStatus("Please complete the highlighted fields before sending.", "is-error");
            firstInvalid.focus();
            showToast("Some details are still missing.");
            return;
        }

        const values = {
            name: contactForm.elements.name.value.trim(),
            email: contactForm.elements.email.value.trim(),
            phone: contactForm.elements.phone.value.trim(),
            subject: contactForm.elements.subject.value.trim(),
            message: contactForm.elements.message.value.trim()
        };

        if (!FORM_ENDPOINT) {
            setFormStatus(`Opening your email app so you can send this to ${CONTACT_EMAIL}.`, "is-success");
            showToast("Your message is ready to send.");
            openMailClient(values);
            return;
        }

        const submitButton = contactForm.querySelector("button[type='submit']");
        const label = submitButton ? submitButton.querySelector(".btn-label") : null;
        const originalLabel = label ? label.textContent : "";

        if (submitButton) submitButton.disabled = true;
        if (label) label.textContent = "Sending";
        setFormStatus("Sending your message…");

        try {
            await postToEndpoint(values);
            setFormStatus("Thank you. Your message is on its way and I will reply shortly.", "is-success");
            showToast("Message sent. I will get back to you soon.");
            contactForm.reset();
        } catch (error) {
            setFormStatus(
                `Direct sending is unavailable right now, so I have opened your email app with the message ready for ${CONTACT_EMAIL}.`,
                "is-error"
            );
            showToast("Sending failed. Opening your email app instead.");
            openMailClient(values);
        } finally {
            if (submitButton) submitButton.disabled = false;
            if (label) label.textContent = originalLabel;
        }
    });
}

if (showEmailButton) {
    showEmailButton.addEventListener("click", () => {
        const email = showEmailButton.dataset.email;
        showToast(email);
        showEmailButton.textContent = email;

        window.setTimeout(() => {
            showEmailButton.textContent = "Show Email";
        }, 3600);
    });
}

/* ---------- boot ---------- */

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", resizeCanvas);

if (!prefersReducedMotion && canvas) {
    resizeCanvas();
    drawParticles();
} else if (canvas) {
    canvas.remove();
}

updateScrollState();
