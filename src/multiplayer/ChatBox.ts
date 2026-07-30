export class ChatBox {
  private container: HTMLDivElement;
  private messageList: HTMLDivElement;
  private inputEl: HTMLInputElement;
  private isOpen = false;
  private onSendMessage: ((msg: string) => void) | null = null;

  constructor(onSendMessage: (msg: string) => void) {
    this.onSendMessage = onSendMessage;

    // Chat Container (Bottom-left overlay)
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed; bottom: 65px; left: 16px; width: 320px;
      z-index: 400; font-family: 'Courier New', monospace; font-size: 13px; color: #fff;
      pointer-events: auto; display: flex; flex-direction: column; gap: 6px;
    `;

    this.messageList = document.createElement('div');
    this.messageList.style.cssText = `
      max-height: 140px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;
      background: rgba(0, 0, 0, 0.4); padding: 8px; border-radius: 4px; text-shadow: 1px 1px 2px #000;
    `;
    this.container.appendChild(this.messageList);

    this.inputEl = document.createElement('input');
    this.inputEl.type = 'text';
    this.inputEl.placeholder = 'Tekan Enter untuk kirim...';
    this.inputEl.style.cssText = `
      width: 100%; padding: 6px 10px; font-family: inherit; font-size: 13px;
      color: #fff; background: rgba(0, 0, 0, 0.75); border: 1px solid #777;
      border-radius: 4px; outline: none; box-sizing: border-box; display: none;
    `;
    this.container.appendChild(this.inputEl);

    document.body.appendChild(this.container);

    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const text = this.inputEl.value.trim();
        if (text) {
          this.onSendMessage?.(text);
          this.addMessage('Saya', text);
        }
        this.close();
      } else if (e.key === 'Escape') {
        this.close();
      }
    });

    window.addEventListener('keydown', (e) => {
      if ((e.key === 't' || e.key === 'T') && !this.isOpen) {
        e.preventDefault();
        this.open();
      }
    });
  }

  open(): void {
    this.isOpen = true;
    this.inputEl.style.display = 'block';
    this.inputEl.value = '';
    this.inputEl.focus();
  }

  close(): void {
    this.isOpen = false;
    this.inputEl.style.display = 'none';
    this.inputEl.blur();
  }

  addMessage(author: string, text: string): void {
    const msg = document.createElement('div');
    msg.style.cssText = 'word-break: break-word;';
    msg.innerHTML = `<span style="color: #ffcc00; font-weight: bold;">[${author}]</span> ${text}`;
    this.messageList.appendChild(msg);
    this.messageList.scrollTop = this.messageList.scrollHeight;
  }

  get visible(): boolean {
    return this.isOpen;
  }
}
