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
  // Desktop sidebar - use data attribute to track
  const sidebarContent = document.querySelector('#sidebar-section-content-community');
  if (sidebarContent) {
    // Remove any existing buttons first (cleanup duplicates)
    sidebarContent.querySelectorAll('.remote-jobs-sidebar-btn').forEach(btn => {
      const wrapper = btn.closest('.sidebar-section-link-wrapper');
      if (wrapper) wrapper.remove();
    });

    // Only add if not already marked
    if (!sidebarContent.hasAttribute('data-remote-jobs-added')) {
      console.log('Remote Jobs: Adding button to desktop sidebar');
      sidebarContent.setAttribute('data-remote-jobs-added', 'true');

      const listItem = document.createElement('li');
      listItem.className = 'sidebar-section-link-wrapper remote-jobs-wrapper';
      listItem.innerHTML = `
        <a class="remote-jobs-sidebar-btn sidebar-section-link sidebar-row" href="#" title="${settings.remote_jobs_button_text}">
          <span class="sidebar-section-link-prefix icon">
            <svg class="fa d-icon d-icon-${settings.remote_jobs_button_icon} svg-icon prefix-icon svg-string" aria-hidden="true"><use href="#${settings.remote_jobs_button_icon}"></use></svg>
          </span>
          <span class="sidebar-section-link-content-text">${settings.remote_jobs_button_text}</span>
        </a>
      `;

      listItem.querySelector('.remote-jobs-sidebar-btn').addEventListener('click', (e) => {
        e.preventDefault();
        showRemoteJobsModal();
      });

      // Insert after InovaJobs button if it exists
      const inovaJobsBtn = sidebarContent.querySelector('.inovajobs-sidebar-btn');
      if (inovaJobsBtn && inovaJobsBtn.closest('.sidebar-section-link-wrapper')) {
        inovaJobsBtn.closest('.sidebar-section-link-wrapper').insertAdjacentElement('afterend', listItem);
      } else {
        sidebarContent.appendChild(listItem);
      }
    }
  }

  // Mobile menu
  const addToMobile = () => {
    // Skip if any mobile button already exists
    if (document.querySelector('.remote-jobs-mobile-btn')) return;

    const menuPanel = document.querySelector('.menu-panel');
    if (!menuPanel) return;

    // Clean up any stray buttons
    menuPanel.querySelectorAll('.remote-jobs-mobile-btn').forEach(btn => {
      const wrapper = btn.closest('.sidebar-section-link-wrapper, li');
      if (wrapper) wrapper.remove();
    });

    const container = menuPanel.querySelector('.panel-body ul, .panel-body');
    if (!container) return;

    console.log('Remote Jobs: Adding mobile button');

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
  };

  addToMobile();
  setTimeout(addToMobile, 500);
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
