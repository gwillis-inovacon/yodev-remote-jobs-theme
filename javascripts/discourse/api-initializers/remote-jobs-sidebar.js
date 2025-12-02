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

function addRemoteJobsButton() {
  // Desktop sidebar
  if (!document.querySelector('.remote-jobs-sidebar-btn')) {
    const sidebarContent = document.querySelector('#sidebar-section-content-community');
    if (sidebarContent) {
      console.log('Remote Jobs: Adding button to desktop sidebar');

      const listItem = document.createElement('li');
      listItem.className = 'sidebar-section-link-wrapper';
      listItem.innerHTML = `
        <a class="remote-jobs-sidebar-btn sidebar-section-link sidebar-row" href="#" title="${settings.remote_jobs_button_text}">
          <span class="sidebar-section-link-prefix icon">
            <svg class="fa d-icon d-icon-${settings.remote_jobs_button_icon} svg-icon prefix-icon svg-string" aria-hidden="true"><use href="#${settings.remote_jobs_button_icon}"></use></svg>
          </span>
          <span class="sidebar-section-link-content-text">${settings.remote_jobs_button_text}</span>
        </a>
      `;

      const button = listItem.querySelector('.remote-jobs-sidebar-btn');
      button.addEventListener('click', (e) => {
        e.preventDefault();
        showRemoteJobsModal();
      });

      // Insert after InovaJobs button if it exists
      const inovaJobsBtn = sidebarContent.querySelector('.inovajobs-sidebar-btn');
      if (inovaJobsBtn && inovaJobsBtn.closest('.sidebar-section-link-wrapper')) {
        inovaJobsBtn.closest('.sidebar-section-link-wrapper').insertAdjacentElement('afterend', listItem);
        console.log('Remote Jobs: Inserted after InovaJobs');
      } else {
        sidebarContent.appendChild(listItem);
        console.log('Remote Jobs: Added to end of sidebar');
      }
    }
  }

  // Mobile menu - target mobile scrollable content specifically
  const tryAddToMobileMenu = () => {
    // Check for any existing Remote Jobs button in mobile
    if (document.querySelector('.remote-jobs-mobile-btn')) return;

    const mobileSelectors = [
      '.menu-panel .panel-body',
      '.revamped.menu-panel .panel-body',
      '.menu-panel .menu-links-container',
      '.menu-panel [class*="content"]',
      '.menu-panel ul'
    ];

    for (const selector of mobileSelectors) {
      const container = document.querySelector(selector);
      if (container && !container.querySelector('.remote-jobs-mobile-btn')) {
        console.log(`Remote Jobs: Found mobile container: ${selector}`);

        const item = document.createElement('li');
        item.className = 'sidebar-section-link-wrapper';
        item.innerHTML = `
          <a class="remote-jobs-mobile-btn sidebar-section-link sidebar-row" href="#" title="${settings.remote_jobs_button_text}">
            <span class="sidebar-section-link-prefix icon">
              <svg class="fa d-icon d-icon-${settings.remote_jobs_button_icon} svg-icon prefix-icon svg-string" aria-hidden="true"><use href="#${settings.remote_jobs_button_icon}"></use></svg>
            </span>
            <span class="sidebar-section-link-content-text">${settings.remote_jobs_button_text}</span>
          </a>
        `;

        item.querySelector('.remote-jobs-mobile-btn').addEventListener('click', (e) => {
          e.preventDefault();
          showRemoteJobsModal();
        });

        // Try to insert after InovaJobs mobile button
        const inovaMobileBtn = container.querySelector('.inovajobs-universal-btn');
        if (inovaMobileBtn && inovaMobileBtn.closest('li')) {
          inovaMobileBtn.closest('li').insertAdjacentElement('afterend', item);
        } else if (container.tagName === 'UL') {
          // Find InovaJobs and insert after, or prepend
          const inovaItem = container.querySelector('.inovajobs-sidebar-btn, .inovajobs-universal-btn');
          if (inovaItem && inovaItem.closest('li')) {
            inovaItem.closest('li').insertAdjacentElement('afterend', item);
          } else {
            container.prepend(item);
          }
        } else {
          const ul = container.querySelector('ul') || container;
          if (ul.tagName === 'UL') {
            ul.prepend(item);
          } else {
            container.insertBefore(item, container.firstChild);
          }
        }

        console.log('Remote Jobs: Mobile button added');
        return true;
      }
    }
    return false;
  };

  // Try multiple times as mobile menu loads dynamically
  tryAddToMobileMenu();
  setTimeout(tryAddToMobileMenu, 500);
  setTimeout(tryAddToMobileMenu, 1000);
}

export default apiInitializer("1.8.0", (api) => {
  if (!settings.remote_jobs_show_in_header) {
    return;
  }

  console.log('Remote Jobs: Initializing');

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
