import { apiInitializer } from "discourse/lib/api";

function showRemoteJobsModal() {
  const existingModal = document.getElementById("remote-jobs-modal");
  if (existingModal) {
    existingModal.remove();
    return;
  }

  const modal = document.createElement("div");
  modal.id = "remote-jobs-modal";
  modal.className = "remote-jobs-modal";
  modal.innerHTML = `
    <div class="remote-jobs-modal-backdrop"></div>
    <div class="remote-jobs-modal-container">
      <div class="remote-jobs-modal-header">
        <h2>${settings.remote_jobs_button_text}</h2>
        <button class="remote-jobs-modal-close" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="remote-jobs-modal-content">
        <iframe src="${settings.remote_jobs_url}" frameborder="0" allowfullscreen></iframe>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const backdrop = modal.querySelector(".remote-jobs-modal-backdrop");
  const closeBtn = modal.querySelector(".remote-jobs-modal-close");

  backdrop.addEventListener("click", () => modal.remove());
  closeBtn.addEventListener("click", () => modal.remove());

  const handleEscape = (e) => {
    if (e.key === "Escape") {
      modal.remove();
      document.removeEventListener("keydown", handleEscape);
    }
  };
  document.addEventListener("keydown", handleEscape);

  requestAnimationFrame(() => {
    modal.classList.add("is-visible");
  });
}

function addRemoteJobsLinkToSidebar() {
  const sidebarContent = document.querySelector("#sidebar-section-content-community");
  if (!sidebarContent) {
    return false;
  }

  // Check if button already exists
  if (document.querySelector(".remote-jobs-sidebar-btn")) {
    return true;
  }

  console.log("✅ Adding Remote Jobs link to sidebar");

  const listItem = document.createElement("li");
  listItem.className = "sidebar-section-link-wrapper";

  const link = document.createElement("a");
  link.className = "remote-jobs-sidebar-btn sidebar-section-link sidebar-row";
  link.href = "#";
  link.title = settings.remote_jobs_button_text;

  const iconSpan = document.createElement("span");
  iconSpan.className = "sidebar-section-link-prefix icon";
  iconSpan.innerHTML = `<svg class="fa d-icon d-icon-${settings.remote_jobs_button_icon} svg-icon prefix-icon svg-string" aria-hidden="true"><use href="#${settings.remote_jobs_button_icon}"></use></svg>`;

  const textSpan = document.createElement("span");
  textSpan.className = "sidebar-section-link-content-text";
  textSpan.textContent = settings.remote_jobs_button_text;

  link.appendChild(iconSpan);
  link.appendChild(textSpan);
  listItem.appendChild(link);

  link.addEventListener("click", function (e) {
    e.preventDefault();
    showRemoteJobsModal();
  });

  // Try to insert after InovaJobs sidebar button, otherwise append to end
  const inovaJobsBtn = sidebarContent.querySelector(".inovajobs-sidebar-btn");

  if (inovaJobsBtn && inovaJobsBtn.closest(".sidebar-section-link-wrapper")) {
    inovaJobsBtn.closest(".sidebar-section-link-wrapper").insertAdjacentElement("afterend", listItem);
    console.log("✅ Remote Jobs link inserted after InovaJobs");
  } else {
    sidebarContent.appendChild(listItem);
    console.log("✅ Remote Jobs link added to sidebar (end)");
  }

  return true;
}

function initializeWithRetry(maxAttempts = 10, delayMs = 500) {
  let attempts = 0;

  const tryInitialize = () => {
    attempts++;
    console.log(`🔄 Remote Jobs init attempt ${attempts}/${maxAttempts}`);

    addRemoteJobsLinkToSidebar();
    repositionAfterInovaJobs();

    if (attempts < maxAttempts) {
      setTimeout(tryInitialize, delayMs * attempts);
    }
  };

  tryInitialize();
}

function repositionAfterInovaJobs() {
  const sidebarContent = document.querySelector("#sidebar-section-content-community");
  if (!sidebarContent) return;

  const remoteJobsLink = sidebarContent.querySelector(".remote-jobs-sidebar-btn");
  const inovaJobsBtn = sidebarContent.querySelector(".inovajobs-sidebar-btn");

  if (remoteJobsLink && inovaJobsBtn) {
    const remoteJobsWrapper = remoteJobsLink.closest(".sidebar-section-link-wrapper");
    const inovaJobsWrapper = inovaJobsBtn.closest(".sidebar-section-link-wrapper");

    if (remoteJobsWrapper && inovaJobsWrapper) {
      // Check if already in correct position
      if (inovaJobsWrapper.nextElementSibling !== remoteJobsWrapper) {
        inovaJobsWrapper.insertAdjacentElement("afterend", remoteJobsWrapper);
        console.log("✅ Remote Jobs repositioned after InovaJobs");
      }
    }
  }
}

function setupObservers() {
  // Sidebar observer - re-add link if sidebar content changes AND reposition
  const sidebarContent = document.querySelector("#sidebar-section-content-community");
  if (sidebarContent) {
    const sidebarObserver = new MutationObserver(() => {
      addRemoteJobsLinkToSidebar();
      // Try to reposition after InovaJobs if it was added later
      setTimeout(repositionAfterInovaJobs, 100);
    });
    sidebarObserver.observe(sidebarContent, {
      childList: true,
      subtree: false,
    });
  }

  console.log("👁️ Remote Jobs observers active");
}

function setupRouteChangeListener() {
  let currentUrl = window.location.href;

  const urlObserver = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      console.log("🔄 Remote Jobs: URL changed");
      setTimeout(() => {
        initializeWithRetry(5, 300);
      }, 300);
    }
  });

  urlObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("🔄 Remote Jobs: Route change listener active");
}

export default apiInitializer("1.8.0", (api) => {
  if (!settings.remote_jobs_show_in_header) {
    return;
  }

  // Initialize
  initializeWithRetry(10, 500);
  setupObservers();
  setupRouteChangeListener();

  // Also hook into page changes
  api.onPageChange(() => {
    setTimeout(() => addRemoteJobsLinkToSidebar(), 100);
  });
});
