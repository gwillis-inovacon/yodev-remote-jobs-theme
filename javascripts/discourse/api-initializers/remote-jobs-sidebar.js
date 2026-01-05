import { apiInitializer } from "discourse/lib/api";

// Store the API reference for use in message handlers
let discourseApi = null;

// ============================================
// YODEV LOGIN MODAL & TOAST
// ============================================

const REMOTE_JOBS_CONFIG = {
  appName: 'Job Alerts',
  appLogo: 'https://canada1.discourse-cdn.com/flex009/uploads/inovacon/optimized/1X/0453fb6aa23d6223f27068b8adaf9a1fff850f57_2_180x180.png',
  appSubtitle: 'Set your job preferences and get notified when matching remote developer jobs appear.',
  appFeatures: [
    { icon: 'briefcase', text: 'Remote Dev Jobs' },
    { icon: 'globe', text: 'Top Job Boards' },
    { icon: 'sync', text: 'Updated 6x Daily' },
    { icon: 'bell', text: 'Job Alerts' }
  ],
  registerUrl: 'https://www.yodev.dev/signup'
};

function injectYoDevLoginStyles() {
  if (document.getElementById('yodev-login-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'yodev-login-styles';
  styles.textContent = `
    .yodev-login-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: yodev-fade-in 0.2s ease-out;
    }

    @keyframes yodev-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes yodev-slide-up {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes yodev-slide-in-right {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }

    .yodev-login-modal {
      background: #1a1a2e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 32px;
      max-width: 420px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: yodev-slide-up 0.3s ease-out;
      position: relative;
    }

    .yodev-login-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #888;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .yodev-login-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .yodev-login-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .yodev-login-logo {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      margin-bottom: 16px;
    }

    .yodev-login-title {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 8px 0;
    }

    .yodev-login-subtitle {
      font-size: 14px;
      color: #a0a0b0;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    .yodev-login-features {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-bottom: 24px;
    }

    .yodev-login-feature {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      font-size: 13px;
      color: #e0e0e0;
    }

    .yodev-login-feature i {
      font-size: 14px;
      color: #6e9fff;
    }

    .yodev-login-member-section {
      width: 100%;
      margin-bottom: 20px;
    }

    .yodev-login-member-title {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 12px 0;
    }

    .yodev-login-btn {
      width: 100%;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
    }

    .yodev-login-btn-primary {
      background: linear-gradient(135deg, #5b8def 0%, #6e9fff 100%);
      color: #ffffff;
      border: none;
      box-shadow: 0 4px 12px rgba(91, 141, 239, 0.3);
    }

    .yodev-login-btn-primary:hover {
      background: linear-gradient(135deg, #4a7de0 0%, #5b8def 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(91, 141, 239, 0.4);
    }

    .yodev-login-divider {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
      margin: 20px 0;
    }

    .yodev-login-divider-line {
      flex: 1;
      height: 1px;
      background: rgba(255, 255, 255, 0.15);
    }

    .yodev-login-divider-text {
      font-size: 12px;
      color: #666;
    }

    .yodev-login-register-section {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 16px;
      width: 100%;
    }

    .yodev-login-register-text {
      font-size: 13px;
      color: #909099;
      margin: 0 0 8px 0;
      line-height: 1.4;
    }

    .yodev-login-register-link {
      color: #6e9fff;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.2s;
    }

    .yodev-login-register-link:hover {
      color: #8fb3ff;
      text-decoration: underline;
    }

    /* Toast notification */
    .yodev-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #1a1a2e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 16px 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
      z-index: 10001;
      display: flex;
      align-items: center;
      gap: 16px;
      animation: yodev-slide-in-right 0.3s ease-out;
      border-left: 4px solid #6e9fff;
      max-width: 360px;
    }

    .yodev-toast-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .yodev-toast-content {
      flex: 1;
    }

    .yodev-toast-title {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 4px 0;
    }

    .yodev-toast-message {
      font-size: 13px;
      color: #a0a0b0;
      margin: 0;
    }

    .yodev-toast-btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      background: linear-gradient(135deg, #5b8def 0%, #6e9fff 100%);
      color: #ffffff;
      border: none;
      white-space: nowrap;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(91, 141, 239, 0.3);
    }

    .yodev-toast-btn:hover {
      background: linear-gradient(135deg, #4a7de0 0%, #5b8def 100%);
      transform: translateY(-1px);
    }

    .yodev-toast-close {
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      color: #666;
      padding: 4px;
      line-height: 1;
      transition: color 0.2s;
    }

    .yodev-toast-close:hover {
      color: #fff;
    }
  `;
  document.head.appendChild(styles);
}

function showYoDevToast(config, onContinue) {
  injectYoDevLoginStyles();

  const existing = document.querySelector('.yodev-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'yodev-toast';
  toast.innerHTML = `
    <button class="yodev-toast-close">&times;</button>
    <img src="${config.appLogo}" alt="${config.appName}" class="yodev-toast-icon" />
    <div class="yodev-toast-content">
      <p class="yodev-toast-title">Welcome back!</p>
      <p class="yodev-toast-message">Click to set up your ${config.appName}</p>
    </div>
    <button class="yodev-toast-btn">Set Preferences</button>
  `;

  document.body.appendChild(toast);

  const closeToast = () => toast.remove();

  toast.querySelector('.yodev-toast-close').addEventListener('click', closeToast);
  toast.querySelector('.yodev-toast-btn').addEventListener('click', () => {
    closeToast();
    if (onContinue) onContinue();
  });

  setTimeout(closeToast, 30000);
}

function showYoDevLoginModal(config) {
  injectYoDevLoginStyles();

  const existing = document.querySelector('.yodev-login-overlay');
  if (existing) existing.remove();

  const featuresHtml = config.appFeatures.map(f =>
    `<div class="yodev-login-feature"><i class="fa fa-${f.icon}"></i><span>${f.text}</span></div>`
  ).join('');

  const overlay = document.createElement('div');
  overlay.className = 'yodev-login-overlay';
  overlay.innerHTML = `
    <div class="yodev-login-modal">
      <button class="yodev-login-close" aria-label="Close">&times;</button>
      <div class="yodev-login-content">
        <img src="${config.appLogo}" alt="${config.appName}" class="yodev-login-logo" />
        <h2 class="yodev-login-title">${config.appName}</h2>
        <p class="yodev-login-subtitle">${config.appSubtitle}</p>
        <div class="yodev-login-features">${featuresHtml}</div>
        <div class="yodev-login-member-section">
          <p class="yodev-login-member-title">Already a yoDEV member?</p>
          <button class="yodev-login-btn yodev-login-btn-primary" id="yodev-signin-btn">
            <i class="fa fa-sign-in"></i> Sign In with yoDEV
          </button>
        </div>
        <div class="yodev-login-divider">
          <div class="yodev-login-divider-line"></div>
          <span class="yodev-login-divider-text">or</span>
          <div class="yodev-login-divider-line"></div>
        </div>
        <div class="yodev-login-register-section">
          <p class="yodev-login-register-text">
            Not a yoDEV member yet? Registration takes just a minute and gives you access to ${config.appName} and other community features.
          </p>
          <a href="${config.registerUrl}" target="_blank" class="yodev-login-register-link">Register at yoDEV.dev &rarr;</a>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeModal = () => overlay.remove();

  overlay.querySelector('.yodev-login-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); }
  });

  overlay.querySelector('#yodev-signin-btn').addEventListener('click', () => {
    closeModal();
    if (window.Discourse && window.Discourse.__container__) {
      const route = window.Discourse.__container__.lookup('route:application');
      if (route) { route.send('showLogin'); return; }
    }
    window.location.href = '/login';
  });
}

function checkPendingAppAction() {
  const pending = sessionStorage.getItem('yodev_pending_app');
  if (!pending) return;

  try {
    const { appId, timestamp } = JSON.parse(pending);

    if (Date.now() - timestamp > 300000) {
      sessionStorage.removeItem('yodev_pending_app');
      return;
    }

    const currentUser = discourseApi?.getCurrentUser();
    if (!currentUser) return;

    sessionStorage.removeItem('yodev_pending_app');

    if (appId === 'jobalerts') {
      // Show toast, then reopen modal and notify iframe user is now logged in
      showYoDevToast(REMOTE_JOBS_CONFIG, () => {
        showRemoteJobsModal();
        // Give iframe time to load, then send user data
        setTimeout(() => sendUserDataToIframe(), 500);
      });
    }
  } catch (e) {
    sessionStorage.removeItem('yodev_pending_app');
  }
}

// ============================================
// IFRAME MESSAGE HANDLING
// ============================================

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

  // Existing: iframe requests user data
  if (event.data.type === "request_user_data") {
    sendUserDataToIframe();
  }

  // NEW: iframe requests login (user tried to set preferences while not logged in)
  if (event.data.type === "request_login") {
    const currentUser = discourseApi?.getCurrentUser();

    if (!currentUser) {
      // Store pending action so we can resume after login
      sessionStorage.setItem('yodev_pending_app', JSON.stringify({
        appId: 'jobalerts',
        timestamp: Date.now()
      }));
      showYoDevLoginModal(REMOTE_JOBS_CONFIG);
    } else {
      // Already logged in, just send user data
      sendUserDataToIframe();
    }
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

// ============================================
// REMOTE JOBS MODAL
// ============================================

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

// ============================================
// SIDEBAR BUTTONS
// ============================================

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

// ============================================
// INITIALIZATION
// ============================================

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

  // Check for pending app action after login
  setTimeout(() => checkPendingAppAction(), 1500);

  console.log('Remote Jobs: Initialization complete');
});
