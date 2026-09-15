const menuIcon = document.querySelector("#menu-icon");
const navbar = document.querySelector(".navbar");
const header = document.querySelector(".header");
const cursorGlow = document.querySelector(".cursor-glow");
const canvas = document.querySelector("#particle-canvas");
const ctx = canvas.getContext("2d");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navLinks = document.querySelectorAll(".navbar a");
const sections = document.querySelectorAll("section[id]");
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");
const contactForm = document.querySelector(".contact form");
const toast = document.querySelector(".toast");
const showEmailButton = document.querySelector(".show-email");

let particles = [];
let animationFrameId;
let toastTimer;
let mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
    active: false
};

menuIcon.addEventListener("click", () => {
    menuIcon.classList.toggle("bx-x");
    navbar.classList.toggle("active");
});

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        menuIcon.classList.remove("bx-x");
        navbar.classList.remove("active");
    });
});

document.querySelector(".gradient-btn").addEventListener("click", () => {
    document.querySelector("#contact").scrollIntoView({ behavior: "smooth" });
});

function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * pixelRatio);
    canvas.height = Math.floor(window.innerHeight * pixelRatio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const count = Math.min(78, Math.floor((window.innerWidth * window.innerHeight) / 18000));
    particles = Array.from({ length: count }, () => createParticle(true));
}

function createParticle(randomPosition = false) {
    const shades = ["#111111", "#3f3f3f", "#6f6f6f", "#9f9f9f", "#c8c8c8"];
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.06 + Math.random() * 0.18;

    return {
        x: randomPosition ? Math.random() * window.innerWidth : mouse.x,
        y: randomPosition ? Math.random() * window.innerHeight : mouse.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 0.7 + Math.random() * 1.5,
        color: shades[Math.floor(Math.random() * shades.length)],
        life: 0.12 + Math.random() * 0.2
    };
}

function drawParticles() {
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((particle, index) => {
        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;
        const distance = Math.hypot(dx, dy);

        if (mouse.active && distance < 150) {
            const force = (150 - distance) / 150;
            particle.vx += (dx / Math.max(distance, 1)) * force * 0.014;
            particle.vy += (dy / Math.max(distance, 1)) * force * 0.014;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.996;
        particle.vy *= 0.996;

        if (particle.x < -20 || particle.x > window.innerWidth + 20 || particle.y < -20 || particle.y > window.innerHeight + 20) {
            particles[index] = createParticle(true);
            return;
        }

        const glow = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 8);
        glow.addColorStop(0, particle.color);
        glow.addColorStop(1, "transparent");

        ctx.globalAlpha = particle.life;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.34;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.globalAlpha = 0.055;
    for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
            const a = particles[i];
            const b = particles[j];
            const distance = Math.hypot(a.x - b.x, a.y - b.y);

            if (distance < 125) {
                ctx.strokeStyle = "#111111";
                ctx.lineWidth = 1 - distance / 125;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        }
    }

    ctx.globalAlpha = 1;
    animationFrameId = requestAnimationFrame(drawParticles);
}

function spawnTrailDot(x, y) {
    if (prefersReducedMotion) return;

    const dot = document.createElement("span");
    dot.className = "trail-dot";
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    dot.style.opacity = `${0.18 + Math.random() * 0.22}`;
    document.body.appendChild(dot);

    window.setTimeout(() => dot.remove(), 900);
}

let trailTimer = 0;
window.addEventListener("pointermove", (event) => {
    mouse.targetX = event.clientX;
    mouse.targetY = event.clientY;
    mouse.active = true;

    document.documentElement.style.setProperty("--mouse-x", ((event.clientX / window.innerWidth) * 100).toFixed(2));
    document.documentElement.style.setProperty("--mouse-y", ((event.clientY / window.innerHeight) * 100).toFixed(2));

    if (cursorGlow) {
        cursorGlow.style.opacity = "1";
        cursorGlow.style.left = `${event.clientX}px`;
        cursorGlow.style.top = `${event.clientY}px`;
    }

    const now = Date.now();
    if (now - trailTimer > 90) {
        spawnTrailDot(event.clientX, event.clientY);
        trailTimer = now;
    }
});

window.addEventListener("pointerleave", () => {
    mouse.active = false;
    if (cursorGlow) cursorGlow.style.opacity = "0";
});

const revealTargets = [
    ".home-content",
    ".hero-visual",
    ".about-img",
    ".about-content",
    ".section-heading",
    ".service-box",
    ".project-filters",
    ".project-card",
    ".contact-intro",
    ".contact form"
];

document.querySelectorAll(revealTargets.join(",")).forEach((element) => {
    element.classList.add("reveal");
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.16 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

function addTiltEffect(card) {
    card.addEventListener("pointermove", (event) => {
        if (prefersReducedMotion) return;

        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateX = ((y / rect.height) - 0.5) * -5;
        const rotateY = ((x / rect.width) - 0.5) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener("pointerleave", () => {
        card.style.transform = "";
    });
}

document.querySelectorAll(".service-box, .project-card").forEach(addTiltEffect);

document.querySelectorAll(".btn, .gradient-btn, .social-icons a, .filter-btn, .show-email").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
        if (prefersReducedMotion) return;

        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px) scale(1.03)`;
    });

    element.addEventListener("pointerleave", () => {
        element.style.transform = "";
    });
});

function updateScrollState() {
    header.classList.toggle("scrolled", window.scrollY > 30);

    const scrollRatio = window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1);
    document.documentElement.style.setProperty("--page-scroll", scrollRatio.toFixed(3));

    let currentSection;
    sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - 180) {
            currentSection = section;
        }
    });

    if (currentSection) {
        navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${currentSection.id}`);
        });
    }
}

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

contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showToast("Message ready. I will get back to you soon.");
    contactForm.reset();
});

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3200);
}

showEmailButton.addEventListener("click", () => {
    const email = showEmailButton.dataset.email;
    showToast(email);
    showEmailButton.innerHTML = `<i class="bx bx-envelope-open"></i>${email}`;

    window.setTimeout(() => {
        showEmailButton.innerHTML = `<i class="bx bx-envelope"></i>Show Email`;
    }, 3200);
});

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", resizeCanvas);

if (!prefersReducedMotion) {
    resizeCanvas();
    drawParticles();
} else {
    canvas.remove();
}

updateScrollState();
