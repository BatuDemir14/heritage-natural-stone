/* Heritage Natural Stone — one-page pilot interactions */
(function () {
  "use strict";

  /* QA hook: ?noanim renders everything instantly */
  if (location.search.indexOf("noanim") !== -1) {
    document.documentElement.classList.add("no-anim");
  }

  var bar = document.getElementById("siteBar");
  var barBrand = document.getElementById("barBrand");
  var hero = document.getElementById("top");
  var heroBrand = document.getElementById("heroBrand");
  var heroSlogan = document.getElementById("heroSlogan");
  var menuToggle = document.getElementById("menuToggle");
  var mobileMenu = document.getElementById("mobileMenu");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var noAnim = document.documentElement.classList.contains("no-anim");

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* --- Bar: shadow when stuck + theme follows the section under it --- */
  var themedSections = Array.prototype.slice.call(
    document.querySelectorAll("[data-header-theme]")
  );

  function updateBarTheme() {
    var rect = bar.getBoundingClientRect();
    bar.classList.toggle("is-stuck", rect.top <= 0);
    var probe = rect.top + rect.height * 0.5;
    var theme = "light";
    for (var i = 0; i < themedSections.length; i++) {
      var r = themedSections[i].getBoundingClientRect();
      if (r.top <= probe && r.bottom >= probe) {
        theme = themedSections[i].getAttribute("data-header-theme");
        break;
      }
    }
    bar.classList.toggle("is-dark", theme === "dark");
  }

  /* --- Hero logo choreography (desktop, motion allowed) ---
     The big centred logo shrinks while it flies into the empty brand slot
     of the bar; once seated, the bar's own (dark) logo takes over. */
  var fancyLogo =
    !noAnim &&
    !reduceMotion.matches &&
    window.matchMedia("(min-width: 901px)").matches;

  var logoBase = null; /* measured static geometry */

  function measureLogo() {
    /* measure in static flow: park the logo back where the spacer sits */
    var spacer = document.getElementById("heroBrandSpacer");
    heroBrand.style.transform = "";
    heroBrand.style.position = "";
    if (spacer) spacer.parentNode.removeChild(spacer);
    var r = heroBrand.getBoundingClientRect();
    logoBase = {
      w: r.width,
      h: r.height,
      cx: r.left + r.width / 2,
      cy: r.top + r.height / 2 + window.scrollY
    };
    /* reserve the logo's spot so the slogan doesn't jump when it goes fixed */
    spacer = document.createElement("div");
    spacer.id = "heroBrandSpacer";
    spacer.style.width = r.width + "px";
    spacer.style.height = r.height + "px";
    heroBrand.parentNode.insertBefore(spacer, heroBrand);
    heroBrand.style.position = "fixed";
    heroBrand.style.left = "0";
    heroBrand.style.top = "0";
    heroBrand.style.transformOrigin = "0 0";
    heroBrand.style.zIndex = "901";
  }

  function updateLogo() {
    if (!fancyLogo || !logoBase) return;
    var heroH = hero.offsetHeight;
    var y = window.scrollY;
    var p = clamp01(y / heroH);
    var e = p * p * (3 - 2 * p); /* smoothstep */

    if (p >= 1) {
      heroBrand.style.visibility = "hidden";
      barBrand.classList.remove("is-waiting");
      return;
    }
    heroBrand.style.visibility = "";
    barBrand.classList.add("is-waiting");

    var target = barBrand.getBoundingClientRect();
    var tCx = target.left + target.width / 2;
    var tCy = target.top + target.height / 2;
    var s = lerp(1, target.height / logoBase.h, e);
    var cx = lerp(logoBase.cx, tCx, e);
    var cy = lerp(logoBase.cy - y, tCy, e);
    heroBrand.style.transform =
      "translate(" + (cx - (logoBase.w * s) / 2) + "px," +
      (cy - (logoBase.h * s) / 2) + "px) scale(" + s + ")";
    heroSlogan.style.opacity = String(clamp01(1 - p / 0.35));
  }

  if (fancyLogo) {
    measureLogo();
    barBrand.classList.add("is-waiting");
    window.addEventListener("resize", function () {
      measureLogo();
      updateLogo();
    });
    /* fonts/layout settle after load — measure again */
    window.addEventListener("load", function () {
      measureLogo();
      updateLogo();
    });
  }

  /* --- Floating contact buttons: only after the bar has become the header --- */
  function updateRail() {
    document.body.classList.toggle(
      "past-hero",
      window.scrollY >= hero.offsetHeight - 4
    );
  }

  function onScroll() {
    updateBarTheme();
    updateLogo();
    updateRail();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* --- Mobile menu --- */
  function closeMenu() {
    menuToggle.classList.remove("is-open");
    mobileMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  menuToggle.addEventListener("click", function () {
    var open = !mobileMenu.classList.contains("is-open");
    menuToggle.classList.toggle("is-open", open);
    mobileMenu.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    mobileMenu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  mobileMenu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  /* --- Smooth in-page anchor scrolling ---
     Native smooth scrolling (CSS or scrollIntoView) is silently dropped by
     Chrome in some environments, so anchors run their own rAF animation. */
  var scrollAnim = null;

  function animateScrollTo(targetY) {
    /* rAF never fires in hidden/background tabs — jump straight there */
    if (document.visibilityState === "hidden") {
      window.scrollTo(0, targetY);
      return;
    }
    var startY = window.scrollY;
    var dist = targetY - startY;
    var duration = Math.min(1100, 350 + Math.abs(dist) * 0.25);
    var t0 = performance.now();
    var started = false;
    if (scrollAnim) cancelAnimationFrame(scrollAnim);

    function step(now) {
      started = true;
      var t = clamp01((now - t0) / duration);
      var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      window.scrollTo(0, startY + dist * e);
      if (t < 1) scrollAnim = requestAnimationFrame(step);
      else scrollAnim = null;
    }
    scrollAnim = requestAnimationFrame(step);
    /* watchdog: if no frame arrives (throttled tab), finish instantly */
    setTimeout(function () {
      if (!started && scrollAnim) {
        cancelAnimationFrame(scrollAnim);
        scrollAnim = null;
        window.scrollTo(0, targetY);
      }
    }, 250);
  }

  /* a wheel/touch from the user cancels the animation */
  ["wheel", "touchstart"].forEach(function (ev) {
    window.addEventListener(ev, function () {
      if (scrollAnim) { cancelAnimationFrame(scrollAnim); scrollAnim = null; }
    }, { passive: true });
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href").slice(1);
      var target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var barH = bar.offsetHeight;
      var maxY = document.documentElement.scrollHeight - window.innerHeight;
      var targetY = Math.min(
        maxY,
        Math.max(0, target.getBoundingClientRect().top + window.scrollY - barH)
      );
      if (reduceMotion.matches || noAnim) window.scrollTo(0, targetY);
      else animateScrollTo(targetY);
      if (history.pushState) history.pushState(null, "", "#" + id);
    });
  });

  /* --- Team: switch between first and second photo --- */
  document.querySelectorAll(".member__media").forEach(function (media) {
    var btn = media.querySelector(".member__next");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var showingAlt = media.classList.toggle("show-alt");
      btn.setAttribute(
        "aria-label",
        showingAlt ? "Show previous photo" : "Show next photo"
      );
    });
  });

  /* --- Intro reel: play only while on screen --- */
  var reel = document.getElementById("introReel");
  if (reel) {
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var p = reel.play();
              if (p && p.catch) p.catch(function () {});
            } else {
              reel.pause();
            }
          });
        },
        { threshold: 0.3 }
      ).observe(reel);
    } else {
      var p = reel.play();
      if (p && p.catch) p.catch(function () {});
    }
  }

  /* --- Reveal on scroll --- */
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* --- Active nav link by section --- */
  var sections = ["who-we-are", "what-we-do", "our-values", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var navLinks = document.querySelectorAll(".nav__link");

  if ("IntersectionObserver" in window && sections.length) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* --- Footer year --- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
