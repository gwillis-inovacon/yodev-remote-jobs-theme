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

function injectSidebarLink() {
  // Don't add if already exists
  if (document.querySelector(".remote-jobs-injected")) {
    return;
  }

  // Find the sidebar sections container
  const sidebar = document.querySelector(".sidebar-sections");
  if (!sidebar) {
    return;
  }

  // Find a good insertion point - look for existing sections
  const sections = sidebar.querySelectorAll(".sidebar-section-wrapper");
  if (sections.length === 0) {
    return;
  }

  // Create our link element
  const linkWrapper = document.createElement("div");
  linkWrapper.className = "sidebar-section-wrapper remote-jobs-injected";
  linkWrapper.innerHTML = `
    <div class="sidebar-section">
      <div class="sidebar-section-content">
        <ul class="sidebar-section-links">
          <li class="sidebar-section-link-wrapper">
            <a href="#" class="sidebar-section-link sidebar-row remote-jobs-link" title="${settings.remote_jobs_button_text}">
              <span class="sidebar-section-link-prefix icon">
                <svg class="fa d-icon d-icon-${settings.remote_jobs_button_icon} svg-icon svg-string" xmlns="http://www.w3.org/2000/svg"><use href="#${settings.remote_jobs_button_icon}"></use></svg>
              </span>
              <span class="sidebar-section-link-content-text">${settings.remote_jobs_button_text}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  `;

  // Insert after first section (or at position 2 if there are multiple)
  const insertAfter = sections.length > 1 ? sections[1] : sections[0];
  insertAfter.parentNode.insertBefore(linkWrapper, insertAfter.nextSibling);

  // Add click handler
  const link = linkWrapper.querySelector(".remote-jobs-link");
  link.addEventListener("click", (e) => {
    e.preventDefault();
    showRemoteJobsModal();
  });
}

export default apiInitializer("1.8.0", (api) => {
  if (!settings.remote_jobs_show_in_header) {
    return;
  }

  // Inject on page changes
  api.onPageChange(() => {
    setTimeout(injectSidebarLink, 100);
  });

  // Also try on initial load
  setTimeout(injectSidebarLink, 500);
  setTimeout(injectSidebarLink, 1000);
  setTimeout(injectSidebarLink, 2000);
});
