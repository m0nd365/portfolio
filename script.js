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

/* ---------- splash ---------- */

(function runSplash() {
    const splash = document.querySelector("#splash");
    const mark = document.querySelector(".splash-mark");
    const shells = document.querySelectorAll(".page-shell, .page-flat");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!splash) return;

    // Snapped on rather than faded: the page is behind opaque white when this
    // runs, so the transition would only be a large composite competing with
    // the zoom for frames.
    const revealPage = () => shells.forEach((el) => {
        el.style.transition = "none";
        el.classList.add("page-in");
    });

    if (reduced) {
        splash.remove();
        revealPage();
        return;
    }

    window.__splashRunning = true;          // tells the head script to stand down
    document.documentElement.classList.add("splash-active");

    // belt and braces with the head script: images finishing late can nudge
    // the page, so pin it to the top until the splash hands over. Instant,
    // or the page's smooth scrolling turns this into a visible glide.
    const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    toTop();
    window.addEventListener("load", toTop);

    // overflow: hidden doesn't stop every wheel and touch (older iOS Safari),
    // so swallow them while the intro plays
    const blockScroll = (event) => event.preventDefault();
    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });

    // Lay the ring exactly over the O of DYMOND — same size, same place —
    // so when the glyph fades and the ring appears, the shape never moves.
    // Ratios are the O's proportions in Plus Jakarta Sans ExtraBold.
    const word = splash.querySelector(".splash-word");
    const letterO = splash.querySelector(".splash-letter.is-o");

    // Rasterise the O once and read its real proportions off the pixels, so
    // the ring matches whatever font actually loaded — down to the stroke
    // weight and where the ink sits relative to the baseline.
    let shape = {
        width: 0.72, height: 0.73, stroke: 0.17, shift: 0,
        ascent: 0.72, descent: 0.01, fontAscent: 0.98, fontDescent: 0.25
    };
    let measuredFor = "";

    const measureO = (style) => {
        const key = `${style.fontWeight} ${style.fontFamily}`;
        if (key === measuredFor) return;

        try {
            const box = 200;
            const baseline = box * 1.3;
            const canvas = document.createElement("canvas");
            canvas.width = box * 2;
            canvas.height = box * 2;

            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            ctx.font = `${style.fontWeight} ${box}px ${style.fontFamily}`;
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = "#000000";
            ctx.fillText("O", box * 0.4, baseline);

            const metrics = ctx.measureText("O");

            // where the ink starts and stops along a line of pixels
            const edges = (pixels, count) => {
                const found = [];
                let inside = false;
                for (let i = 0; i < count; i += 1) {
                    const on = pixels[i * 4 + 3] > 128;
                    if (on !== inside) {
                        found.push(i);
                        inside = on;
                    }
                }
                return found;
            };

            const inkTop = baseline - metrics.actualBoundingBoxAscent;
            const midY = Math.round(inkTop + metrics.actualBoundingBoxAscent / 2);
            const across = edges(ctx.getImageData(0, midY, canvas.width, 1).data, canvas.width);

            if (across.length === 4) {
                // down the true centre of the glyph, so the scan crosses the
                // top and bottom of the O rather than the side of one stroke
                const midX = Math.round((across[0] + across[3]) / 2);
                const down = edges(ctx.getImageData(midX, 0, 1, canvas.height).data, canvas.height);

                if (down.length === 4) {
                    const last = down[3];
                    const sideStroke = across[1] - across[0];
                    const capStroke = down[1] - down[0];

                    shape = {
                        width: (across[3] - across[0]) / box,
                        height: (last - down[0]) / box,
                        // the ink is rarely centred in the advance width
                        shift: (((across[0] + across[3]) / 2) - (box * 0.4 + metrics.width / 2)) / box,
                        // one CSS border can't be thick at the sides and thin
                        // on top the way a real O is, so split the difference
                        stroke: ((sideStroke + capStroke) / 2) / box,
                        ascent: (baseline - down[0]) / box,
                        descent: (last - baseline) / box,
                        fontAscent: metrics.fontBoundingBoxAscent / box,
                        fontDescent: metrics.fontBoundingBoxDescent / box
                    };
                    measuredFor = key;
                }
            }
        } catch (error) {
            /* keep the fallback ratios */
        }
    };

    let offset = { x: 0, y: 0 };            // how far the word has been slid

    const placeMark = () => {
        if (!mark || !word || !letterO) return;

        const style = window.getComputedStyle(word);
        const size = parseFloat(style.fontSize) || 100;

        measureO(style);

        const glyph = letterO.querySelector("i") || letterO;
        const rect = glyph.getBoundingClientRect();
        const outerH = size * shape.height;
        const stroke = size * shape.stroke;

        // the baseline sits below the line box top by the half-leading
        // plus the font's ascent; the ring is centred on the ink, not the box
        const leading = (rect.height - (shape.fontAscent + shape.fontDescent) * size) / 2;
        const baseline = rect.top + leading + shape.fontAscent * size;
        // letter-spacing is baked into the box as trailing space, so take it
        // back out before looking for the middle of the glyph itself
        const tracking = parseFloat(style.letterSpacing) || 0;

        // measured back in the word's own resting position, so this stays
        // correct however many times it is recalculated
        const applied = splash.classList.contains("stage-centre") ? offset : { x: 0, y: 0 };
        const restX = rect.left + (rect.width - tracking) / 2 + shape.shift * size - applied.x;
        const restY = baseline - (shape.ascent - shape.descent) * size / 2 - applied.y;

        // sideways only: the O keeps the line it was written on
        const targetX = window.innerWidth / 2;
        const targetY = restY;

        offset = { x: targetX - restX, y: 0 };
        splash.style.setProperty("--word-dx", `${offset.x.toFixed(2)}px`);

        // the ring sits on the O where it stands and travels with it
        mark.style.width = `${size * shape.width}px`;
        mark.style.height = `${outerH}px`;
        mark.style.borderWidth = `${stroke}px`;
        mark.style.left = `${restX}px`;
        mark.style.top = `${restY}px`;

        // the hole has to clear the corner furthest from where the O sits
        const corners = [
            Math.hypot(targetX, targetY),
            Math.hypot(window.innerWidth - targetX, targetY),
            Math.hypot(targetX, window.innerHeight - targetY),
            Math.hypot(window.innerWidth - targetX, window.innerHeight - targetY)
        ];
        const hole = Math.max(outerH - stroke * 2, 1);
        splash.style.setProperty("--splash-scale", ((Math.max(...corners) * 2.2) / hole).toFixed(2));
    };

    const timers = [];
    const at = (delay, fn) => timers.push(window.setTimeout(fn, delay));

    let finished = false;

    function finish(immediate) {
        if (finished) return;
        finished = true;

        timers.forEach(window.clearTimeout);
        toTop();
        window.removeEventListener("load", toTop);
        window.removeEventListener("wheel", blockScroll);
        window.removeEventListener("touchmove", blockScroll);
        if (mark) mark.style.willChange = "auto";   // let the layer go
        splash.classList.add("done");
        document.documentElement.classList.remove("splash-active");
        revealPage();

        window.setTimeout(() => splash.classList.add("gone"), immediate ? 0 : 500);
    }

    placeMark();
    window.addEventListener("resize", placeMark);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeMark);

    //  bars slide in → glyphs appear → blocks dissolve into letters →
    //  every letter but the O fades → the O becomes the ring → it zooms
    //  in until its counter opens onto the page
    at(60, () => splash.classList.add("stage-blocks"));
    at(560, () => splash.classList.add("stage-glyphs"));
    at(940, () => splash.classList.add("stage-letters"));

    at(1440, () => splash.classList.add("stage-mark"));      // the rest fade out
    at(1700, () => {
        placeMark();
        splash.classList.add("stage-centre");                 // word and ring slide across
    });

    // the page is painted and composited here, while the white still covers
    // everything, so nothing heavy happens once the hole is open
    at(1880, () => revealPage());

    // hand the glyph over to the ring in the middle of the slide: both are
    // moving on the same curve, and motion hides the change of shape
    at(1950, () => splash.classList.add("stage-swap"));

    // ring solid on top of the glyph — now the glyph can go, unseen
    at(2270, () => splash.classList.add("stage-hide"));

    // The zoom takes over just before the slide settles. Two eased motions
    // back to back read as a pause even with no gap between them — one
    // decelerating into rest, the next accelerating out of it — so the zoom
    // interrupts the last stretch and absorbs what is left of the travel.
    at(2350, () => splash.classList.add("stage-zoom"));

    // the ring has been fully opaque since well before the white goes
    at(2600, () => splash.classList.add("stage-open"));

    // end when the zoom actually ends rather than on a guessed clock
    mark.addEventListener("transitionend", (event) => {
        if (event.propertyName === "transform") finish(true);
    });

    // deliberate skips only, and not in the first moments — a stray
    // trackpad nudge right after a refresh should not kill the intro
    at(700, () => {
        splash.addEventListener("click", () => finish(false), { once: true });
        splash.addEventListener("touchstart", () => finish(false), { once: true, passive: true });

        document.addEventListener("keydown", function skip(event) {
            if (event.key === "Escape" || event.key === "Enter") {
                document.removeEventListener("keydown", skip);
                finish(false);
            }
        });
    });

    // last resort: never leave the page hidden, whatever else goes wrong
    window.setTimeout(() => finish(true), 8000);
    window.addEventListener("error", () => finish(true));
}());

/* ---------- light / dark ---------- */

const themeToggle = document.querySelector("#theme-toggle");
const heroPortrait = document.querySelector("#hero-portrait");
const PORTRAITS = { dark: "image1.jpg", light: "image1-light.jpg" };
const themeMeta = document.querySelector('meta[name="theme-color"]');
const root = document.documentElement;
let inkColour = "#ffffff";              // what the particle field draws with

function readInk() {
    const value = window.getComputedStyle(root).getPropertyValue("--text").trim();
    inkColour = value || "#ffffff";
}

function applyTheme(theme, remember) {
    if (theme === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");

    if (themeToggle) {
        themeToggle.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
    }
    if (themeMeta) {
        themeMeta.setAttribute("content", theme === "light" ? "#f6f6f4" : "#000000");
    }

    readInk();

    // the portrait comes pre-matted onto this theme's background colour
    if (heroPortrait) {
        const wanted = PORTRAITS[theme] || PORTRAITS.dark;
        if (!heroPortrait.getAttribute("src").endsWith(wanted)) {
            heroPortrait.src = wanted;
        }
    }

    if (remember) {
        try {
            localStorage.setItem("theme", theme);
        } catch (error) {
            /* private mode, blocked storage — the choice just won't persist */
        }
    }
}

applyTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark", false);

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light", true);
    });
}

const menuIcon = document.querySelector("#menu-icon");
const menuPanel = document.querySelector(".menu-panel");
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

/* ---------- menu panel (the + in the header) ---------- */

function setMenu(open) {
    if (!menuIcon || !menuPanel) return;

    menuPanel.classList.toggle("active", open);
    menuIcon.setAttribute("aria-expanded", String(open));
    menuIcon.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

if (menuIcon && menuPanel) {
    menuIcon.addEventListener("click", (event) => {
        event.stopPropagation();
        setMenu(menuIcon.getAttribute("aria-expanded") !== "true");
    });

    menuPanel.addEventListener("click", (event) => {
        if (event.target.closest("a")) setMenu(false);
        else event.stopPropagation();
    });

    document.addEventListener("click", () => setMenu(false));

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setMenu(false);
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

let lastParticleFrame = 0;

function drawParticles(now) {
    if (!ctx) return;

    // ~30fps is plenty for dots moving this slowly, and it halves the cost
    if (now && now - lastParticleFrame < 32) {
        requestAnimationFrame(drawParticles);
        return;
    }
    lastParticleFrame = now || 0;

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
        ctx.fillStyle = inkColour;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.globalAlpha = 0.05;
    ctx.strokeStyle = inkColour;

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
    ".exp-card",
    ".skill-card",
    ".chip-panel",
    ".edu-card",
    ".hero-copy",
    ".scroll-cue",
    ".section-heading",
    ".accordion",
    ".about-img",
    ".stat-row",
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
    // a little hysteresis, so hovering around the threshold can't flicker
    const y = window.scrollY;
    if (y > 48) header.classList.add("scrolled");
    else if (y < 16) header.classList.remove("scrolled");

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
