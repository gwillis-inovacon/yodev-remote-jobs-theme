import { apiInitializer } from "discourse/lib/api";

// Store the API reference for use in message handlers
let discourseApi = null;

// ============================================
// YODEV LOGIN MODAL & TOAST (Remote Jobs specific)
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
  if (document.getElementById('yodev-remotejobs-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'yodev-remotejobs-styles';
  styles.textContent = `
    .yodev-remotejobs-overlay {
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
      opacity: 0;
    }

    .yodev-remotejobs-overlay.is-visible {
      animation: yodev-remotejobs-fade-in 0.2s ease-out forwards;
    }

    @keyframes yodev-remotejobs-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes yodev-remotejobs-slide-up {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes yodev-remotejobs-slide-in-right {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }

    .yodev-remotejobs-modal {
      background: #1a1a2e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 32px;
      max-width: 420px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      position: relative;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }

    .yodev-remotejobs-overlay.is-visible .yodev-remotejobs-modal {
      animation: yodev-remotejobs-slide-up 0.3s ease-out forwards;
    }

    .yodev-remotejobs-close {
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

    .yodev-remotejobs-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .yodev-remotejobs-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .yodev-remotejobs-logo {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      margin-bottom: 16px;
    }

    .yodev-remotejobs-title {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 8px 0;
    }

    .yodev-remotejobs-subtitle {
      font-size: 14px;
      color: #a0a0b0;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    .yodev-remotejobs-features {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-bottom: 24px;
    }

    .yodev-remotejobs-feature {
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

    .yodev-remotejobs-feature i {
      font-size: 14px;
      color: #6e9fff;
    }

    .yodev-remotejobs-member-section {
      width: 100%;
      margin-bottom: 20px;
    }

    .yodev-remotejobs-member-title {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 12px 0;
    }

    .yodev-remotejobs-btn {
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

    .yodev-remotejobs-btn-primary {
      background: linear-gradient(135deg, #5b8def 0%, #6e9fff 100%);
      color: #ffffff;
      border: none;
      box-shadow: 0 4px 12px rgba(91, 141, 239, 0.3);
    }

    .yodev-remotejobs-btn-primary:hover {
      background: linear-gradient(135deg, #4a7de0 0%, #5b8def 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(91, 141, 239, 0.4);
    }

    .yodev-remotejobs-divider {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
      margin: 20px 0;
    }

    .yodev-remotejobs-divider-line {
      flex: 1;
      height: 1px;
      background: rgba(255, 255, 255, 0.15);
    }

    .yodev-remotejobs-divider-text {
      font-size: 12px;
      color: #666;
    }

    .yodev-remotejobs-register-section {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 16px;
      width: 100%;
    }

    .yodev-remotejobs-register-text {
      font-size: 13px;
      color: #909099;
      margin: 0 0 8px 0;
      line-height: 1.4;
    }

    .yodev-remotejobs-register-link {
      color: #6e9fff;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.2s;
    }

    .yodev-remotejobs-register-link:hover {
      color: #8fb3ff;
      text-decoration: underline;
    }

    /* Toast notification */
    .yodev-remotejobs-toast {
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
      animation: yodev-remotejobs-slide-in-right 0.3s ease-out backwards;
      border-left: 4px solid #6e9fff;
      max-width: 360px;
    }

    .yodev-remotejobs-toast-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .yodev-remotejobs-toast-content {
      flex: 1;
    }

    .yodev-remotejobs-toast-title {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 4px 0;
    }

    .yodev-remotejobs-toast-message {
      font-size: 13px;
      color: #a0a0b0;
      margin: 0;
    }

    .yodev-remotejobs-toast-btn {
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

    .yodev-remotejobs-toast-btn:hover {
      background: linear-gradient(135deg, #4a7de0 0%, #5b8def 100%);
      transform: translateY(-1px);
    }

    .yodev-remotejobs-toast-close {
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

    .yodev-remotejobs-toast-close:hover {
      color: #fff;
    }
  `;
  document.head.appendChild(styles);
}

function showYoDevToast(config, onContinue) {
  injectYoDevLoginStyles();

  const existing = document.querySelector('.yodev-remotejobs-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'yodev-remotejobs-toast';
  toast.style.position = 'relative';
  toast.innerHTML = `
    <button class="yodev-remotejobs-toast-close">&times;</button>
    <img src="${config.appLogo}" alt="${config.appName}" class="yodev-remotejobs-toast-icon" />
    <div class="yodev-remotejobs-toast-content">
      <p class="yodev-remotejobs-toast-title">Welcome back!</p>
      <p class="yodev-remotejobs-toast-message">Click to set up your ${config.appName}</p>
    </div>
    <button class="yodev-remotejobs-toast-btn">Set Preferences</button>
  `;

  document.body.appendChild(toast);

  const closeToast = () => toast.remove();

  toast.querySelector('.yodev-remotejobs-toast-close').addEventListener('click', closeToast);
  toast.querySelector('.yodev-remotejobs-toast-btn').addEventListener('click', () => {
    closeToast();
    if (onContinue) onContinue();
  });

  setTimeout(closeToast, 30000);
}

// Store escape handler reference for cleanup
let currentEscHandler = null;

function showYoDevLoginModal(config) {
  injectYoDevLoginStyles();

  const existing = document.querySelector('.yodev-remotejobs-overlay');
  if (existing) existing.remove();

  // Clean up any existing escape handler
  if (currentEscHandler) {
    document.removeEventListener('keydown', currentEscHandler);
    currentEscHandler = null;
  }

  const featuresHtml = config.appFeatures.map(f =>
    `<div class="yodev-remotejobs-feature"><i class="fa fa-${f.icon}"></i><span>${f.text}</span></div>`
  ).join('');

  const overlay = document.createElement('div');
  overlay.className = 'yodev-remotejobs-overlay';
  overlay.innerHTML = `
    <div class="yodev-remotejobs-modal" style="max-width: 420px; width: 90%; opacity: 0;">
      <button class="yodev-remotejobs-close" aria-label="Close">&times;</button>
      <div class="yodev-remotejobs-content">
        <img src="${config.appLogo}" alt="${config.appName}" class="yodev-remotejobs-logo" />
        <h2 class="yodev-remotejobs-title">${config.appName}</h2>
        <p class="yodev-remotejobs-subtitle">${config.appSubtitle}</p>
        <div class="yodev-remotejobs-features">${featuresHtml}</div>
        <div class="yodev-remotejobs-member-section">
          <p class="yodev-remotejobs-member-title">Already a yoDEV member?</p>
          <button class="yodev-remotejobs-btn yodev-remotejobs-btn-primary" id="yodev-remotejobs-signin-btn">
            <i class="fa fa-sign-in"></i> Sign In with yoDEV
          </button>
        </div>
        <div class="yodev-remotejobs-divider">
          <div class="yodev-remotejobs-divider-line"></div>
          <span class="yodev-remotejobs-divider-text">or</span>
          <div class="yodev-remotejobs-divider-line"></div>
        </div>
        <div class="yodev-remotejobs-register-section">
          <p class="yodev-remotejobs-register-text">
            Not a yoDEV member yet? Registration takes just a minute and gives you access to ${config.appName} and other community features.
          </p>
          <a href="#" class="yodev-remotejobs-register-link" id="yodev-remotejobs-register-link">Register at yoDEV.dev &rarr;</a>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Trigger animation after element is in DOM
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('is-visible');
    });
  });

  const closeModal = () => {
    overlay.remove();
    // Clean up escape handler
    if (currentEscHandler) {
      document.removeEventListener('keydown', currentEscHandler);
      currentEscHandler = null;
    }
  };

  overlay.querySelector('.yodev-remotejobs-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  // Create and store escape handler
  currentEscHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };
  document.addEventListener('keydown', currentEscHandler);

  overlay.querySelector('#yodev-remotejobs-signin-btn').addEventListener('click', () => {
    closeModal();

    // Also close the remote jobs iframe modal if open
    const remoteJobsModal = document.getElementById('remote-jobs-modal');
    if (remoteJobsModal) remoteJobsModal.remove();

    // Store pending action
    localStorage.setItem('yodev_pending_app', JSON.stringify({
      appId: 'jobalerts',
      timestamp: Date.now()
    }));

    // Try multiple methods to trigger Discourse login
    try {
      if (window.Discourse && window.Discourse.__container__) {
        const router = window.Discourse.__container__.lookup('router:main');
        if (router) {
          router.transitionTo('login');
          return;
        }

        const route = window.Discourse.__container__.lookup('route:application');
        if (route && route.send) {
          route.send('showLogin');
          return;
        }

        const controller = window.Discourse.__container__.lookup('controller:application');
        if (controller && controller.send) {
          controller.send('showLogin');
          return;
        }
      }
    } catch (e) {
      console.error('Failed to trigger Discourse login:', e);
    }

    // Fallback: navigate to login page
    window.location.href = '/login';
  });

  overlay.querySelector('#yodev-remotejobs-register-link').addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();

    // Store pending action
    localStorage.setItem('yodev_pending_app', JSON.stringify({
      appId: 'jobalerts',
      timestamp: Date.now()
    }));

    // Try to trigger Discourse signup
    try {
      if (window.Discourse && window.Discourse.__container__) {
        const router = window.Discourse.__container__.lookup('router:main');
        if (router) {
          router.transitionTo('signup');
          return;
        }

        const route = window.Discourse.__container__.lookup('route:application');
        if (route && route.send) {
          route.send('showCreateAccount');
          return;
        }

        const controller = window.Discourse.__container__.lookup('controller:application');
        if (controller && controller.send) {
          controller.send('showCreateAccount');
          return;
        }
      }
    } catch (e) {
      console.error('Failed to trigger Discourse signup:', e);
    }

    // Fallback
    window.location.href = '/signup';
  });
}

let pendingActionHandled = false;

function checkPendingAppAction() {
  if (pendingActionHandled) return;

  const pending = localStorage.getItem('yodev_pending_app');
  if (!pending) return;

  try {
    const { appId, timestamp } = JSON.parse(pending);

    if (Date.now() - timestamp > 300000) {
      localStorage.removeItem('yodev_pending_app');
      return;
    }

    const currentUser = discourseApi?.getCurrentUser();
    if (!currentUser) return;

    if (appId === 'jobalerts') {
      pendingActionHandled = true;
      localStorage.removeItem('yodev_pending_app');
      // Show toast, then reopen modal and notify iframe user is now logged in
      showYoDevToast(REMOTE_JOBS_CONFIG, () => {
        showRemoteJobsModal();
        // Give iframe time to load, then send user data
        setTimeout(() => sendUserDataToIframe(), 500);
      });
    }
  } catch (e) {
    localStorage.removeItem('yodev_pending_app');
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
      // Close the remote jobs modal first to avoid visual conflict
      const remoteJobsModal = document.getElementById('remote-jobs-modal');
      if (remoteJobsModal) remoteJobsModal.remove();

      // Store pending action so we can resume after login
      localStorage.setItem('yodev_pending_app', JSON.stringify({
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
      <button class="remote-jobs-modal-close">&times;</button>
      <iframe
        src="${settings.remote_jobs_url}"
        frameborder="0"
        allow="clipboard-write"
      ></iframe>
    </div>
  `;

  document.body.appendChild(modal);

  // Close on backdrop click
  modal.querySelector(".remote-jobs-modal-backdrop").addEventListener("click", () => {
    modal.remove();
  });

  // Close on X button click
  modal.querySelector(".remote-jobs-modal-close").addEventListener("click", () => {
    modal.remove();
  });

  // Close on Escape key
  const escHandler = (e) => {
    if (e.key === "Escape") {
      modal.remove();
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);

  // Send user data when iframe loads
  const iframe = modal.querySelector("iframe");
  iframe.addEventListener("load", () => {
    setTimeout(() => sendUserDataToIframe(), 100);
  });
}

// ============================================
// SIDEBAR BUTTON
// ============================================

function addRemoteJobsSidebarButton(api) {
  const existingButton = document.querySelector('.remote-jobs-sidebar-btn');
  const sidebarContent = document.querySelector('#sidebar-section-content-community');

  if (!sidebarContent) return false;

  if (existingButton) return true;

  // Find InovaJobs button to position after it
  const inovaJobsButton = sidebarContent.querySelector('a[href*="inovajobs"], .inovajobs-sidebar-btn');

  const listItem = document.createElement('li');
  listItem.className = 'sidebar-section-link-wrapper';

  const link = document.createElement('a');
  link.className = 'remote-jobs-sidebar-btn sidebar-section-link sidebar-row';
  link.href = '#';
  link.title = 'Remote Jobs';

  const iconSpan = document.createElement('span');
  iconSpan.className = 'sidebar-section-link-prefix icon';
  iconSpan.innerHTML = '<svg class="fa d-icon d-icon-briefcase svg-icon prefix-icon svg-string" aria-hidden="true"><use href="#briefcase"></use></svg>';

  const textSpan = document.createElement('span');
  textSpan.className = 'sidebar-section-link-content-text';
  textSpan.textContent = 'Remote Jobs';

  link.appendChild(iconSpan);
  link.appendChild(textSpan);
  listItem.appendChild(link);

  link.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    showRemoteJobsModal();
  });

  // Position after InovaJobs if it exists
  if (inovaJobsButton && inovaJobsButton.closest('li')) {
    console.log('Remote Jobs: Adding button to desktop sidebar after InovaJobs');
    inovaJobsButton.closest('li').insertAdjacentElement('afterend', listItem);
  } else {
    // Otherwise add at end
    sidebarContent.appendChild(listItem);
  }

  return true;
}

function addRemoteJobsSidebarButtonWithRetry(api, maxAttempts = 10, delayMs = 500) {
  let attempts = 0;
  const tryPlacement = () => {
    attempts++;
    const success = addRemoteJobsSidebarButton(api);
    if (!success && attempts < maxAttempts) {
      setTimeout(tryPlacement, delayMs * attempts);
    }
  };
  tryPlacement();
}

// ============================================
// STYLES
// ============================================

function injectStyles() {
  if (document.getElementById('remote-jobs-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'remote-jobs-styles';
  styles.textContent = `
    .remote-jobs-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .remote-jobs-modal-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
    }

    .remote-jobs-modal-container {
      position: relative;
      width: 95%;
      max-width: 1400px;
      height: 90%;
      max-height: 900px;
      background: #1a1a2e;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .remote-jobs-modal-close {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 10;
      background: rgba(0, 0, 0, 0.5);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .remote-jobs-modal-close:hover {
      background: rgba(0, 0, 0, 0.7);
    }

    .remote-jobs-modal iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  `;
  document.head.appendChild(styles);
}

// ============================================
// MAIN EXPORT
// ============================================

export default apiInitializer("1.0", (api) => {
  discourseApi = api;

  injectStyles();

  // Desktop sidebar button
  api.onPageChange(() => {
    addRemoteJobsSidebarButtonWithRetry(api);
  });

  // Check for pending app action (post-login)
  api.onPageChange(() => {
    checkPendingAppAction();
  });
  setTimeout(checkPendingAppAction, 1000);
  setTimeout(checkPendingAppAction, 2000);
  setTimeout(checkPendingAppAction, 3000);

  // Listen for iframe messages
  window.addEventListener('message', handleIframeMessage);
});
