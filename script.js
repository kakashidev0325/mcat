document.documentElement.classList.add("js");

const CONFIG = {
  tokenAddress: "",
  pumpFunUrl: "",
  twitter: "https://x.com/moustacheonx",
  telegram: "https://t.me",
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function getPumpFunUrl() {
  if (CONFIG.pumpFunUrl) return CONFIG.pumpFunUrl;
  if (CONFIG.tokenAddress) return `https://pump.fun/coin/${CONFIG.tokenAddress}`;
  return "https://pump.fun";
}

function initContract() {
  const display = document.getElementById("ca-display");
  const copyBtn = document.getElementById("copy-ca");
  const toast = document.getElementById("copy-toast");
  const address = CONFIG.tokenAddress;

  if (!address) {
    display.textContent = "CePvX5yJSR3ZkSnU5SoeMuYS1exwBJR1YKyN5Ps8pump";
    copyBtn.disabled = true;
    copyBtn.title = "Contract address CePvX5yJSR3ZkSnU5SoeMuYS1exwBJR1YKyN5Ps8pump";
    return;
  }

  display.textContent = address;

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(address);
      copyBtn.textContent = "Copied";
      toast.textContent = "Contract address copied.";
      toast.classList.add("show");

      setTimeout(() => {
        copyBtn.textContent = "Copy";
        toast.classList.remove("show");
      }, 2500);
    } catch {
      toast.textContent = "Copy failed — select and copy manually.";
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2500);
    }
  });
}

function initNav() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });

  links.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    document.documentElement.style.setProperty("--progress", progress.toFixed(4));
    header.classList.toggle("scrolled", window.scrollY > 20);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initSocialLinks() {
  const pumpUrl = getPumpFunUrl();

  document.querySelectorAll("[data-pumpfun]").forEach((el) => {
    el.href = pumpUrl;
  });

  [
    ["[data-twitter]", CONFIG.twitter],
    ["[data-telegram]", CONFIG.telegram],
  ].forEach(([selector, url]) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (url) el.href = url;
      else el.remove();
    });
  });

  document.querySelectorAll(".nav-socials, .footer-links").forEach((el) => {
    if (!el.children.length) el.remove();
  });
}

function initPaws() {
  const field = document.querySelector(".paw-field");
  if (!field || reduceMotion) return;

  const count = window.innerWidth < 720 ? 8 : 16;

  for (let i = 0; i < count; i++) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#stache");
    svg.appendChild(use);

    const size = 16 + Math.random() * 22;
    const tones = ["var(--gold)", "var(--cream)", "var(--sky)", "var(--ginger)"];
    svg.style.width = `${size * 2.15}px`;
    svg.style.height = `${size}px`;
    svg.style.left = `${Math.random() * 100}%`;
    svg.style.color = tones[i % tones.length];
    svg.style.animationDuration = `${14 + Math.random() * 16}s`;
    svg.style.animationDelay = `${-Math.random() * 30}s`;
    svg.style.setProperty("--r", `${Math.random() * 50 - 25}deg`);
    svg.style.setProperty("--o", (0.16 + Math.random() * 0.22).toFixed(2));

    field.appendChild(svg);
  }
}

function initReveal() {
  const items = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window) || reduceMotion) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }

  document.querySelectorAll("[data-count]").forEach((el) => {
    const from = Number(el.dataset.from || 0);
    const suffix = el.dataset.suffix || "";
    el.textContent = formatCount(from, el.dataset.format === "compact") + suffix;
  });

  items.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.hasAttribute("data-reveal"));
    const index = siblings.indexOf(el);
    el.style.setProperty("--stagger", `${Math.min(index, 6) * 0.09}s`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          entry.target.querySelectorAll("[data-count]").forEach(runCount);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

function formatCount(value, compact) {
  if (!compact) return String(Math.round(value));
  if (value >= 1e9) return "1B";
  if (value >= 1e6) return `${Math.round(value / 1e6)}M`;
  if (value >= 1e3) return `${Math.round(value / 1e3)}K`;
  return String(Math.round(value));
}

function runCount(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = "1";

  const target = Number(el.dataset.count);
  const from = Number(el.dataset.from || 0);
  const suffix = el.dataset.suffix || "";
  const compact = el.dataset.format === "compact";
  const duration = 1200;
  const start = performance.now();

  el.classList.add("pop");
  el.textContent = formatCount(from, compact) + suffix;

  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = from + (target - from) * eased;
    el.textContent = formatCount(t === 1 ? target : value, compact) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function initSparkles() {
  const field = document.querySelector(".sparkles");
  if (!field || reduceMotion) return;

  for (let i = 0; i < 10; i++) {
    const spark = document.createElement("span");
    spark.className = "sparkle";
    const angle = (i / 10) * Math.PI * 2 + 0.3;
    const radius = 36 + (i % 3) * 5;
    spark.style.left = `${50 + Math.cos(angle) * radius}%`;
    spark.style.top = `${50 + Math.sin(angle) * radius}%`;
    spark.style.setProperty("--s", `${7 + (i % 4) * 3}px`);
    spark.style.setProperty("--dur", `${1.5 + (i % 5) * 0.35}s`);
    spark.style.setProperty("--delay", `${-i * 0.27}s`);
    field.appendChild(spark);
  }
}

function initPawTrail() {
  if (reduceMotion || window.matchMedia("(hover: none)").matches) return;

  let last = 0;

  window.addEventListener("pointermove", (e) => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    const now = performance.now();
    if (now - last < 90) return;
    last = now;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#stache");
    svg.appendChild(use);
    svg.classList.add("trail-paw");
    svg.style.left = `${e.clientX}px`;
    svg.style.top = `${e.clientY}px`;
    svg.style.setProperty("--r", `${Math.random() * 40 - 20}deg`);
    document.body.appendChild(svg);
    svg.addEventListener("animationend", () => svg.remove());
  }, { passive: true });
}

function initProfileCycle() {
  const items = [...document.querySelectorAll(".profile-list li")];
  if (!items.length || reduceMotion) return;

  let index = 0;
  const mark = () => {
    items.forEach((el, i) => el.classList.toggle("is-hot", i === index));
    index = (index + 1) % items.length;
  };

  mark();
  setInterval(mark, 1500);
}

function initConfetti() {
  const field = document.querySelector(".confetti-field");
  if (!field || reduceMotion) return;

  const colors = ["#ffe14d", "#3ec8ea", "#ff5d86", "#7eb6ef", "#fff6d8", "#8eb6ff"];
  const count = window.innerWidth < 720 ? 16 : 32;

  for (let i = 0; i < count; i++) {
    const bit = document.createElement("span");
    const wide = 6 + Math.random() * 7;
    bit.style.left = `${Math.random() * 100}%`;
    bit.style.setProperty("--w", `${wide}px`);
    bit.style.setProperty("--h", `${i % 4 === 0 ? wide : 12 + Math.random() * 12}px`);
    bit.style.setProperty("--c", colors[i % colors.length]);
    bit.style.setProperty("--spin", `${160 + Math.random() * 280}deg`);
    bit.style.setProperty("--drift", `${-36 + Math.random() * 72}px`);
    bit.style.animationDuration = `${9 + Math.random() * 11}s`;
    bit.style.animationDelay = `${-Math.random() * 18}s`;
    if (i % 4 === 0) bit.style.borderRadius = "50%";
    field.appendChild(bit);
  }
}

function initCoinTilt() {
  const hero = document.querySelector(".hero");
  const coin = document.querySelector(".coin-tilt");
  if (!hero || !coin || reduceMotion || window.matchMedia("(hover: none)").matches) return;

  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    coin.style.setProperty("--rx", `${x * 18}deg`);
    coin.style.setProperty("--ry", `${-y * 18}deg`);
  });

  hero.addEventListener("mouseleave", () => {
    coin.style.setProperty("--rx", "0deg");
    coin.style.setProperty("--ry", "0deg");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initContract();
  initNav();
  initSocialLinks();
  initPaws();
  initConfetti();
  initSparkles();
  initPawTrail();
  initReveal();
  initProfileCycle();
  initCoinTilt();
});
