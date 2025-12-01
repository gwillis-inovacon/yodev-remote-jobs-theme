import Component from "@glimmer/component";
import { action } from "@ember/object";
import icon from "discourse/helpers/d-icon";

export default class RemoteJobsIcon extends Component {
  get shouldShow() {
    return settings.remote_jobs_show_in_header;
  }

  @action
  openModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById("remote-jobs-modal");
    if (existingModal) {
      existingModal.remove();
      return;
    }

    // Create modal
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

    // Add event listeners
    const backdrop = modal.querySelector(".remote-jobs-modal-backdrop");
    const closeBtn = modal.querySelector(".remote-jobs-modal-close");

    backdrop.addEventListener("click", () => modal.remove());
    closeBtn.addEventListener("click", () => modal.remove());

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        modal.remove();
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);

    // Animate in
    requestAnimationFrame(() => {
      modal.classList.add("is-visible");
    });
  }

  <template>
    {{#if this.shouldShow}}
      <li class="header-dropdown-toggle remote-jobs-button">
        <button
          class="btn btn-flat icon"
          title={{settings.remote_jobs_button_text}}
          {{on "click" this.openModal}}
        >
          {{icon settings.remote_jobs_button_icon}}
        </button>
      </li>
    {{/if}}
  </template>
}
