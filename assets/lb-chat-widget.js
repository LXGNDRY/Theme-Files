import { DialogComponent } from '@theme/dialog';

/**
 * lb-chat-widget.js — Legendary Branding AI customer-service widget.
 *
 * Config is injected via window.LB_CHAT_CONFIG by
 * snippets/lb-chat-widget.liquid (backend base URL + non-secret page
 * context only — the backend holds the real Anthropic API key).
 *
 * The launcher bubble ships in the initial markup at near-zero cost; no
 * network request happens until the customer actually opens the dialog
 * and sends a message.
 *
 * @typedef {object} Refs
 * @property {HTMLDialogElement} dialog
 * @property {HTMLElement} messages
 * @property {HTMLFormElement} form
 * @property {HTMLInputElement} input
 *
 * @extends {DialogComponent}
 */
class LbChatWidgetComponent extends DialogComponent {
  /** @type {string | null} */
  #sessionId = null;

  /** @type {boolean} */
  #requestInFlight = false;

  connectedCallback() {
    super.connectedCallback();

    const cfg = window.LB_CHAT_CONFIG;
    if (!cfg || !cfg.backendBase) {
      this.hidden = true;
      return;
    }

    this.#sessionId = this.#getOrCreateSessionId();
  }

  open() {
    this.showDialog();

    if (this.refs.messages && this.refs.messages.childElementCount === 0) {
      this.#appendMessage('assistant', window.LB_CHAT_CONFIG?.greeting ?? '');
    }

    this.refs.input?.focus();
  }

  close() {
    this.closeDialog();
  }

  /**
   * @param {SubmitEvent} event
   */
  sendMessage = async (event) => {
    event.preventDefault();

    const { input } = this.refs;
    const message = input?.value.trim();
    if (!message || this.#requestInFlight) return;

    input.value = '';
    this.#appendMessage('user', message);

    const loadingEl = this.#appendMessage('assistant', '', { pending: true });
    this.#requestInFlight = true;

    try {
      const reply = await this.#requestReply(message);
      loadingEl.textContent = reply;
      loadingEl.removeAttribute('data-pending');
    } catch (error) {
      console.error('[lb-chat-widget]', error);
      loadingEl.textContent = Theme.translations?.ai_chat_unavailable ?? this.#fallbackMessage();
      loadingEl.removeAttribute('data-pending');
      loadingEl.setAttribute('data-error', '');
    } finally {
      this.#requestInFlight = false;
    }
  };

  /**
   * @param {string} message
   * @returns {Promise<string>}
   */
  async #requestReply(message) {
    const cfg = window.LB_CHAT_CONFIG;
    const base = cfg.backendBase.replace(/\/$/, '');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${base}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          sessionId: this.#sessionId,
          message,
          pageContext: {
            url: window.location.href,
            templateType: cfg.templateName,
            handle: cfg.pageHandle,
          },
          locale: cfg.locale,
          customerId: cfg.customerLoggedIn ? cfg.customerId : null,
        }),
      });

      if (!response.ok) throw new Error(`Chat backend responded with ${response.status}`);

      const data = await response.json();
      return data.reply ?? this.#fallbackMessage();
    } finally {
      clearTimeout(timeout);
    }
  }

  #fallbackMessage() {
    return "Our assistant is unavailable right now. Please visit our contact page for help.";
  }

  /**
   * @param {'user' | 'assistant'} role
   * @param {string} text
   * @param {{ pending?: boolean }} [options]
   */
  #appendMessage(role, text, { pending = false } = {}) {
    const { messages } = this.refs;
    const bubble = document.createElement('p');
    bubble.className = `lb-chat-widget__message lb-chat-widget__message--${role}`;
    bubble.textContent = text;
    if (pending) bubble.setAttribute('data-pending', '');
    messages?.appendChild(bubble);
    if (messages) messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  #getOrCreateSessionId() {
    const key = 'lb-chat-session-id';
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(key, id);
    }
    return id;
  }
}

if (!customElements.get('lb-chat-widget-component')) {
  customElements.define('lb-chat-widget-component', LbChatWidgetComponent);
}
