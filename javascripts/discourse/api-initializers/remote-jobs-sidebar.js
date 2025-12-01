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

export default apiInitializer("1.8.0", (api) => {
  api.addSidebarSection(
    (BaseCustomSidebarSection, BaseCustomSidebarSectionLink) => {
      const RemoteJobsLink = class extends BaseCustomSidebarSectionLink {
        get name() {
          return "remote-jobs";
        }

        get classNames() {
          return "remote-jobs-sidebar-link";
        }

        get route() {
          return null;
        }

        get href() {
          return "#";
        }

        get title() {
          return settings.remote_jobs_button_text;
        }

        get text() {
          return settings.remote_jobs_button_text;
        }

        get prefixType() {
          return "icon";
        }

        get prefixValue() {
          return settings.remote_jobs_button_icon;
        }

        get suffixType() {
          return "icon";
        }

        get suffixValue() {
          return "external-link-alt";
        }

        get suffixCSSClass() {
          return "remote-jobs-external-icon";
        }
      };

      const RemoteJobsSection = class extends BaseCustomSidebarSection {
        get name() {
          return "remote-jobs-section";
        }

        get title() {
          return "Jobs";
        }

        get text() {
          return "Jobs";
        }

        get collapsedByDefault() {
          return false;
        }

        get displaySection() {
          return settings.remote_jobs_show_in_header;
        }

        get hideSectionHeader() {
          return true;
        }

        get links() {
          return [new RemoteJobsLink()];
        }
      };

      return RemoteJobsSection;
    },
    "top"
  );

  // Handle click on the sidebar link
  api.onPageChange(() => {
    const link = document.querySelector(".remote-jobs-sidebar-link a");
    if (link && !link.dataset.listenerAttached) {
      link.dataset.listenerAttached = "true";
      link.addEventListener("click", (e) => {
        e.preventDefault();
        showRemoteJobsModal();
      });
    }
  });
});
