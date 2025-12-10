import { apiInitializer } from "discourse/lib/api";

// Store the API reference for use in message handlers
let discourseApi = null;

/**
 * Handle messages from the iframe (job alerts app)
 */
function handleIframeMessage(event) {
  // Verify origin matches our jobs board URL
  const jobsUrl = settings.remote_jobs_url || "";
  if (!jobsUrl) return;

  try {
    const allowedHost = new URL(jobsUrl).host;
    if (!event.origin.includes(allowedHost)) {
      return;
    }
  } catch (e) {
    return;
  }

  if (event.data.type === "request_user_data") {
    sendUserDataToIframe();
  }
}

/**
 * Send current user data to the iframe
 */
function sendUserDataToIframe() {
  const iframe = document.querySelector("#remote-jobs-modal iframe");
  if (!iframe) return;

  const currentUser = discourseApi?.getCurrentUser();

  if (currentUser) {
    const userData = {
      discourse_user_id: currentUser.id,
      username: currentUser.username,
      name: currentUser.name,
      email: currentUser.email,
      avatar_url: currentUser.avatar_template?.replace("{size}", "120"),
      is_admin: currentUser.admin,
      trust_level: currentUser.trust_level
    };

    // Create a simple token (backend will validate/re-sign)
    const token = generateUserToken(userData);

    iframe.contentWindow.postMessage({
      type: "discourse_user",
      user: userData,
      token: token
    }, settings.remote_jobs_url);
  } else {
    // User not logged in
    iframe.contentWindow.postMessage({
      type: "discourse_user",
      user: null,
      token: null
    }, settings.remote_jobs_url);
  }
}

/**
 * Generate a user token for iframe authentication
 */
function generateUserToken(userData) {
  const payload = {
    ...userData,
    exp: Date.now() + (5 * 60 * 1000), // 5 minute expiry
    iat: Date.now()
  };
  return btoa(JSON.stringify(payload));
}

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

function addDesktopButton() {
  // Already exists
  if (document.querySelector('.sidebar-sections .remote-jobs-btn')) return true;

  const sidebarContent = document.querySelector('#sidebar-section-content-community');
  if (!sidebarContent) return false;

  // Wait for InovaJobs button
  const inovaJobsBtn = sidebarContent.querySelector(':scope > .sidebar-section-link-wrapper .inovajobs-sidebar-btn');
  if (!inovaJobsBtn) return false; // Will retry

  console.log('Remote Jobs: Adding button to desktop sidebar after InovaJobs');

  const listItem = document.createElement('li');
  listItem.className = 'sidebar-section-link-wrapper remote-jobs-wrapper';
  listItem.innerHTML = `
    <a class="remote-jobs-btn sidebar-section-link sidebar-row" href="#" title="${settings.remote_jobs_button_text}">
      <span class="sidebar-section-link-prefix icon">
        <svg class="fa d-icon d-icon-${settings.remote_jobs_button_icon} svg-icon prefix-icon svg-string" aria-hidden="true"><use href="#${settings.remote_jobs_button_icon}"></use></svg>
      </span>
      <span class="sidebar-section-link-content-text">${settings.remote_jobs_button_text}</span>
    </a>
  `;

  listItem.querySelector('.remote-jobs-btn').addEventListener('click', (e) => {
    e.preventDefault();
    showRemoteJobsModal();
  });

  const inovaWrapper = inovaJobsBtn.closest('.sidebar-section-link-wrapper');
  if (inovaWrapper && inovaWrapper.parentElement === sidebarContent) {
    inovaWrapper.insertAdjacentElement('afterend', listItem);
    return true;
  }

  return false;
}

function addMobileButton() {
  // Global check - don't add if any button exists
  if (document.querySelector('.remote-jobs-btn')) return;

  // Only target hamburger/sidebar menu, NOT user menu
  const menuPanel = document.querySelector('.hamburger-panel .menu-panel, .sidebar-hamburger-dropdown');
  if (!menuPanel) return;

  // Skip if this is the user menu (has user-related content)
  if (menuPanel.querySelector('.quick-access-panel, .user-menu, [class*="user-menu"]')) return;

  const container = menuPanel.querySelector('.panel-body ul, .panel-body');
  if (!container) return;

  console.log('Remote Jobs: Adding mobile button');

  const item = document.createElement('li');
  item.className = 'sidebar-section-link-wrapper';
  item.innerHTML = `
    <a class="remote-jobs-btn sidebar-section-link sidebar-row" href="#" title="${settings.remote_jobs_button_text}">
      <span class="sidebar-section-link-prefix icon">
        <svg class="fa d-icon d-icon-${settings.remote_jobs_button_icon} svg-icon prefix-icon svg-string" aria-hidden="true"><use href="#${settings.remote_jobs_button_icon}"></use></svg>
      </span>
      <span class="sidebar-section-link-content-text">${settings.remote_jobs_button_text}</span>
    </a>
  `;

  item.querySelector('.remote-jobs-btn').addEventListener('click', (e) => {
    e.preventDefault();
    showRemoteJobsModal();
  });

  // Insert after InovaJobs or at start
  const inovaBtn = container.querySelector('.inovajobs-universal-btn, .inovajobs-sidebar-btn');
  if (inovaBtn) {
    const inovaWrapper = inovaBtn.closest('li');
    if (inovaWrapper) {
      inovaWrapper.insertAdjacentElement('afterend', item);
      return;
    }
  }

  if (container.tagName === 'UL') {
    container.prepend(item);
  } else {
    const ul = container.querySelector('ul');
    if (ul) ul.prepend(item);
  }
}

function addRemoteJobsButton() {
  // Desktop - retry until InovaJobs loads
  if (!addDesktopButton()) {
    setTimeout(addDesktopButton, 500);
    setTimeout(addDesktopButton, 1000);
    setTimeout(addDesktopButton, 2000);
  }

  // Mobile
  addMobileButton();
}

export default apiInitializer("1.8.0", (api) => {
  discourseApi = api;

  if (!settings.remote_jobs_show_in_header) {
    return;
  }

  console.log('Remote Jobs: Initializing');

  // Listen for messages from the iframe
  window.addEventListener("message", handleIframeMessage);

  // Add button on page changes
  api.onPageChange(() => {
    setTimeout(() => {
      addRemoteJobsButton();
    }, 1000);
  });

  // Re-add mobile button when hamburger menu is clicked
  document.addEventListener('click', (e) => {
    if (e.target.closest('.hamburger-panel') || e.target.closest('.btn-sidebar-toggle')) {
      setTimeout(() => {
        addRemoteJobsButton();
      }, 500);
    }
  });

  // MutationObserver for dynamic content (mobile menu appearing)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 &&
              (node.classList?.contains('menu-panel') ||
               node.querySelector?.('.menu-panel'))) {
            setTimeout(() => {
              addRemoteJobsButton();
            }, 100);
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial load
  setTimeout(() => addRemoteJobsButton(), 1000);

  console.log('Remote Jobs: Initialization complete');
});
