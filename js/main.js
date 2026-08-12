/* Heritage Natural Stone — one-page pilot interactions */
(function () {
  "use strict";

  /* QA hook: ?noanim renders everything instantly */
  if (location.search.indexOf("noanim") !== -1) {
    document.documentElement.classList.add("no-anim");
  }

  var header = document.getElementById("siteHeader");
  var menuToggle = document.getElementById("menuToggle");
  var mobileMenu = document.getElementById("mobileMenu");

  /* --- Header: theme follows the section under it (hero/light/dark) --- */
  var themedSections = Array.prototype.slice.call(
    document.querySelectorAll("[data-header-theme]")
  );
  function onScroll() {
    var probe = header.offsetHeight * 0.6;
    var theme = "light";
    for (var i = 0; i < themedSections.length; i++) {
      var r = themedSections[i].getBoundingClientRect();
      if (r.top <= probe && r.bottom >= probe) {
        theme = themedSections[i].getAttribute("data-header-theme");
        break;
      }
    }
    /* over the hero the header stays transparent (default styling) */
    header.classList.toggle("is-light", theme === "light");
    header.classList.toggle("is-dark", theme === "dark");
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
     (CSS scroll-behavior:smooth makes Chrome drop fragment scrolls entirely,
     so anchors are handled here with scrollIntoView instead.) */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href").slice(1);
      var target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var smooth =
        !reduceMotion.matches &&
        !document.documentElement.classList.contains("no-anim");
      target.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
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
  var sections = ["who-we-are", "our-team", "what-we-do", "contact"]
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
