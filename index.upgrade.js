(function () {
  "use strict";

  var MOBILE_TIMELINE_BREAKPOINT = 768;
  var REDUCED_MOTION_QUERY = window.matchMedia("(prefers-reduced-motion: reduce)");

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }
    callback();
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function textOrEmpty(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function parseMonthYear(value) {
    var label = textOrEmpty(value);
    if (!label) return 0;
    if (/present/i.test(label)) return Date.now();

    var months = {
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      may: 4,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11
    };

    var parts = label.split(/\s+/);
    if (parts.length < 2) {
      var yearOnly = parseInt(parts[0], 10);
      return Number.isFinite(yearOnly) ? new Date(yearOnly, 0, 1).getTime() : 0;
    }

    var month = months[parts[0].toLowerCase()];
    var year = parseInt(parts[1], 10);
    if (!Number.isFinite(year)) return 0;
    return new Date(year, Number.isFinite(month) ? month : 0, 1).getTime();
  }

  function summarize(descriptionList, maxItems) {
    if (!Array.isArray(descriptionList)) return [];
    return descriptionList
      .map(function (line) {
        return textOrEmpty(line).replace(/\s+/g, " ");
      })
      .filter(Boolean)
      .slice(0, maxItems);
  }

  function buildCvTimelineItems(resumeData) {
    var cvTimelineItems = [];

    var education = Array.isArray(resumeData.education) ? resumeData.education.slice() : [];
    education.sort(function (a, b) {
      return parseMonthYear(a.startDate) - parseMonthYear(b.startDate);
    });

    education.forEach(function (entry) {
      var subtitleBits = [textOrEmpty(entry.degree), textOrEmpty(entry.field)].filter(Boolean);
      cvTimelineItems.push({
        category: "Education",
        title: textOrEmpty(entry.institution) || "Academic Program",
        subtitle: subtitleBits.join(" | "),
        period: [textOrEmpty(entry.startDate), textOrEmpty(entry.endDate)].filter(Boolean).join(" - "),
        details: []
      });
    });

    var experience = Array.isArray(resumeData.experience) ? resumeData.experience.slice() : [];
    experience.sort(function (a, b) {
      return parseMonthYear(a.startDate) - parseMonthYear(b.startDate);
    });

    var leadershipExperience = experience.filter(function (entry) {
      var roleText = (textOrEmpty(entry.role) + " " + textOrEmpty(entry.company)).toLowerCase();
      return /(founder|chief|lead|manager|captain|president)/.test(roleText);
    });

    leadershipExperience.slice(-3).forEach(function (entry) {
      cvTimelineItems.push({
        category: "Leadership",
        title: textOrEmpty(entry.role) || "Leadership Role",
        subtitle: textOrEmpty(entry.company),
        period: [textOrEmpty(entry.startDate), textOrEmpty(entry.endDate)].filter(Boolean).join(" - "),
        details: summarize(entry.description, 2)
      });
    });

    var researchOrInternships = experience.filter(function (entry) {
      var roleText = (textOrEmpty(entry.role) + " " + textOrEmpty(entry.company)).toLowerCase();
      return /(research|intern|assistant|attendant|lab)/.test(roleText);
    });

    researchOrInternships.slice(-2).forEach(function (entry) {
      cvTimelineItems.push({
        category: "Research / Activities",
        title: textOrEmpty(entry.role) || "Research / Internship",
        subtitle: textOrEmpty(entry.company),
        period: [textOrEmpty(entry.startDate), textOrEmpty(entry.endDate)].filter(Boolean).join(" - "),
        details: summarize(entry.description, 1)
      });
    });

    var projects = Array.isArray(resumeData.projects) ? resumeData.projects : [];
    var researchProjects = projects.filter(function (project) {
      var projectText = (textOrEmpty(project.title) + " " + textOrEmpty(project.description)).toLowerCase();
      return /(research|medical|intern)/.test(projectText);
    });

    researchProjects.slice(0, 1).forEach(function (project) {
      cvTimelineItems.push({
        category: "Research",
        title: textOrEmpty(project.title) || "Research Project",
        subtitle: Array.isArray(project.tags) ? project.tags.join(" | ") : "",
        period: "Selected Work",
        details: [textOrEmpty(project.description)]
      });
    });

    projects
      .filter(function (project) {
        return !researchProjects.includes(project);
      })
      .slice(0, 2)
      .forEach(function (project) {
        cvTimelineItems.push({
          category: "Projects",
          title: textOrEmpty(project.title) || "Project",
          subtitle: Array.isArray(project.tags) ? project.tags.join(" | ") : "",
          period: "Build",
          details: [textOrEmpty(project.description)]
        });
      });

    var technicalSkills = resumeData.skills && Array.isArray(resumeData.skills.technical)
      ? resumeData.skills.technical.filter(Boolean)
      : [];
    if (technicalSkills.length) {
      cvTimelineItems.push({
        category: "Technical Skills",
        title: "Engineering Stack",
        subtitle: "Production-ready tools",
        period: "Current",
        details: [technicalSkills.slice(0, 10).join(" | ")]
      });
    }

    var certifications = Array.isArray(resumeData.certifications) ? resumeData.certifications : [];
    if (certifications.length) {
      cvTimelineItems.push({
        category: "Awards / Certifications",
        title: certifications[0].name || "Certification",
        subtitle: certifications.length > 1 ? certifications.length + " total certifications" : "Verified credential",
        period: "Certification",
        details: []
      });
    }

    if (!cvTimelineItems.length) {
      cvTimelineItems = [
        {
          category: "TODO",
          title: "Add CV timeline entries",
          subtitle: "Populate cvTimelineItems in index.upgrade.js",
          period: "TODO",
          details: ["No resume data was found. Add education, projects, and experience entries."]
        }
      ];
    }

    return cvTimelineItems;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function buildDesktopTimelineSection() {
    var section = document.createElement("section");
    section.className = "cv-timeline-section";
    section.id = "cv-timeline";
    section.setAttribute("aria-label", "Career timeline");

    section.innerHTML = [
      '<div class="cv-timeline-shell">',
      '  <div class="cv-timeline-surface">',
      '    <div class="cv-timeline-head">',
      '      <span>Apple-style Scroll Timeline</span>',
      '      <span>Resume Journey</span>',
      "    </div>",
      '    <h2 class="cv-timeline-title">CV Timeline</h2>',
      '    <p class="cv-timeline-subtitle">A depth-based walkthrough of education, leadership, research, projects, and skills.</p>',
      '    <div class="cv-depth-stage">',
      '      <div class="cv-depth-word" aria-hidden="true">Career</div>',
      '      <div class="cv-cards" data-cv-cards></div>',
      "    </div>",
      '    <div class="cv-track" aria-hidden="true"><div class="cv-track-fill"></div></div>',
      '    <div class="cv-track-label">01 / 01</div>',
      "  </div>",
      "</div>"
    ].join("");

    return section;
  }

  function buildMobileTimelineSection() {
    var section = document.createElement("section");
    section.className = "m-cv-timeline";
    section.id = "m-cv-timeline";
    section.setAttribute("aria-label", "Career timeline");

    section.innerHTML = [
      '<div class="m-section-title">',
      '  <div class="m-kicker">CV</div>',
      '  <h2>TIMELINE</h2>',
      '  <div class="m-mini">Education, leadership, projects, and technical growth.</div>',
      "</div>",
      '<div class="cv-mobile-list" data-cv-mobile-list></div>'
    ].join("");

    return section;
  }

  function renderCards(items, desktopHost, mobileHost) {
    var desktopCardsHost = desktopHost.querySelector("[data-cv-cards]");
    var mobileCardsHost = mobileHost.querySelector("[data-cv-mobile-list]");

    desktopCardsHost.innerHTML = items
      .map(function (item, index) {
        return [
          '<article class="cv-card" data-cv-index="' + index + '">',
          '  <div class="cv-card-header">',
          '    <span class="cv-tag">' + escapeHtml(item.category) + '</span>',
          '    <span class="cv-period">' + escapeHtml(item.period || "") + '</span>',
          "  </div>",
          '  <h3 class="cv-card-title">' + escapeHtml(item.title) + '</h3>',
          item.subtitle ? '  <p class="cv-card-subtitle">' + escapeHtml(item.subtitle) + '</p>' : "",
          '  <div class="cv-card-details">',
          (Array.isArray(item.details) ? item.details : [])
            .map(function (detail) {
              return '    <p class="cv-card-detail">' + escapeHtml(detail) + '</p>';
            })
            .join(""),
          "  </div>",
          "</article>"
        ].join("\n");
      })
      .join("\n");

    mobileCardsHost.innerHTML = items
      .map(function (item) {
        return [
          '<article class="cv-mobile-card">',
          '  <div class="cv-mobile-meta">',
          '    <span class="cv-tag">' + escapeHtml(item.category) + '</span>',
          item.period ? '    <span class="cv-period">' + escapeHtml(item.period) + '</span>' : "",
          "  </div>",
          '  <h3 class="cv-mobile-title">' + escapeHtml(item.title) + '</h3>',
          item.subtitle ? '  <p class="cv-card-subtitle">' + escapeHtml(item.subtitle) + '</p>' : "",
          (Array.isArray(item.details) ? item.details : [])
            .map(function (detail) {
              return '  <p class="cv-mobile-detail">' + escapeHtml(detail) + '</p>';
            })
            .join("\n"),
          "</article>"
        ].join("\n");
      })
      .join("\n");

    desktopHost.style.setProperty("--cv-count", String(items.length));
  }

  function animateDesktopTimeline(section) {
    if (!section || REDUCED_MOTION_QUERY.matches) return;

    var cards = Array.prototype.slice.call(section.querySelectorAll(".cv-card"));
    var progressLabel = section.querySelector(".cv-track-label");
    var rafId = 0;

    function run() {
      rafId = 0;
      if (window.innerWidth <= MOBILE_TIMELINE_BREAKPOINT) return;

      var sectionRect = section.getBoundingClientRect();
      var scrollableDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
      var rawProgress = (window.innerHeight * 0.5 - sectionRect.top) / scrollableDistance;
      var progress = clamp(rawProgress, 0, 1);

      section.style.setProperty("--cv-progress", progress.toFixed(5));

      var total = cards.length;
      var position = progress * (total - 1);
      var activeIndex = Math.round(position);

      if (progressLabel) {
        var shown = String(activeIndex + 1).padStart(2, "0");
        var count = String(total).padStart(2, "0");
        progressLabel.textContent = shown + " / " + count;
      }

      cards.forEach(function (card, index) {
        var delta = index - position;
        var absDelta = Math.abs(delta);
        var translateZ = 330 - absDelta * 470;
        var translateY = delta * 84;
        var translateX = delta * -15;
        var rotateY = delta * -7;
        var rotateX = delta * 2.1;
        var scale = 1 - Math.min(absDelta * 0.16, 0.58);
        var opacity = 1 - Math.min(absDelta * 0.46, 0.88);
        var blur = Math.min(absDelta * 7, 16);

        card.style.transform =
          "translate3d(" + translateX.toFixed(2) + "px, " + translateY.toFixed(2) + "px, " + translateZ.toFixed(2) + "px) " +
          "rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg) scale(" + scale.toFixed(3) + ")";
        card.style.opacity = opacity.toFixed(3);
        card.style.filter = "blur(" + blur.toFixed(2) + "px)";
        card.style.zIndex = String(total - Math.round(absDelta * 10));
      });
    }

    function queueRun() {
      if (!rafId) {
        rafId = window.requestAnimationFrame(run);
      }
    }

    window.addEventListener("scroll", queueRun, { passive: true });
    window.addEventListener("resize", queueRun);
    queueRun();
  }

  function enrichLinksAndButtons() {
    var allAnchors = Array.prototype.slice.call(document.querySelectorAll("a"));
    allAnchors.forEach(function (anchor) {
      if (anchor.getAttribute("target") === "_blank") {
        var rel = (anchor.getAttribute("rel") || "").toLowerCase();
        if (!rel.includes("noreferrer")) {
          anchor.setAttribute("rel", rel ? rel + " noreferrer" : "noreferrer");
        }
      }

      if (!anchor.getAttribute("aria-label")) {
        var text = textOrEmpty(anchor.textContent);
        if (!text) {
          var image = anchor.querySelector("img");
          if (image && textOrEmpty(image.alt)) {
            anchor.setAttribute("aria-label", textOrEmpty(image.alt));
          }
        }
      }
    });

    var logoButton = document.querySelector(".header-item-1");
    if (logoButton) {
      var goTop = function () {
        window.scrollTo({ top: 0, behavior: REDUCED_MOTION_QUERY.matches ? "auto" : "smooth" });
      };
      logoButton.addEventListener("click", goTop);
      logoButton.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          goTop();
        }
      });
    }

    var moodButtons = Array.prototype.slice.call(document.querySelectorAll(".color-btn"));
    if (moodButtons.length) {
      var primaryMoodButton = moodButtons[0];

      moodButtons.forEach(function (button, index) {
        button.setAttribute("role", "button");
        button.setAttribute("tabindex", "0");
        button.setAttribute("aria-label", "Change the mood");

        button.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            button.click();
          }
        });

        if (index > 0) {
          button.addEventListener("click", function () {
            primaryMoodButton.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
          });
        }
      });
    }

    Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]')).forEach(function (anchor) {
      anchor.addEventListener("click", function (event) {
        var href = anchor.getAttribute("href");
        if (!href || href === "#") return;
        var target = document.querySelector(href);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: REDUCED_MOTION_QUERY.matches ? "auto" : "smooth", block: "start" });
      });
    });
  }

  function mountTimeline(items) {
    var desktopAboutSection = document.querySelector("section.about");
    var mobileAboutSection = document.querySelector("#mobile-app .m-about");

    if (!desktopAboutSection || !mobileAboutSection) return;

    var desktopTimeline = document.querySelector("#cv-timeline");
    if (!desktopTimeline) {
      desktopTimeline = buildDesktopTimelineSection();
      desktopAboutSection.insertAdjacentElement("afterend", desktopTimeline);
    }

    var mobileTimeline = document.querySelector("#m-cv-timeline");
    if (!mobileTimeline) {
      mobileTimeline = buildMobileTimelineSection();
      mobileAboutSection.insertAdjacentElement("afterend", mobileTimeline);
    }

    renderCards(items, desktopTimeline, mobileTimeline);
    animateDesktopTimeline(desktopTimeline);
  }

  function injectTimelineCtas() {
    var mobileCtaRow = document.querySelector("#mobile-app .m-cta");
    if (mobileCtaRow && !mobileCtaRow.querySelector(".m-btn-cv")) {
      var mobileCvButton = document.createElement("a");
      mobileCvButton.className = "m-btn m-btn-cv";
      mobileCvButton.href = "#m-cv-timeline";
      mobileCvButton.textContent = "CV Timeline";
      mobileCtaRow.appendChild(mobileCvButton);
    }

    var desktopCtaHost = document.querySelector(".bottom-text");
    if (desktopCtaHost && !desktopCtaHost.querySelector(".cv-jump-link")) {
      var wrapper = document.createElement("div");
      wrapper.className = "okey-btn cv-jump-link";
      wrapper.innerHTML = '<a href="#cv-timeline">Jump to CV Timeline</a>';
      desktopCtaHost.appendChild(wrapper);
    }
  }

  async function loadResumeTimeline() {
    try {
      var response = await fetch("resume.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load resume.json");
      var resumeData = await response.json();
      return buildCvTimelineItems(resumeData || {});
    } catch (error) {
      return buildCvTimelineItems({});
    }
  }

  onReady(function () {
    injectTimelineCtas();
    enrichLinksAndButtons();
    loadResumeTimeline().then(function (cvTimelineItems) {
      window.cvTimelineItems = cvTimelineItems;
      mountTimeline(cvTimelineItems);
    });
  });
})();
