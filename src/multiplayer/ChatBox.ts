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
      position: fixed; bottom: 80px; left: 16px; width: 340px;
      z-index: 400; font-family: monospace; font-size: 14px; color: #fff;
      pointer-events: auto; display: flex; flex-direction: column; gap: 4px;
      user-select: none;
    `;

    this.messageList = document.createElement('div');
    this.messageList.style.cssText = `
      max-height: 160px; overflow-y: auto; display: none; flex-direction: column; gap: 4px;
      background: rgba(0, 0, 0, 0.45); padding: 8px; border-radius: 2px;
      text-shadow: 2px 2px 0 #000;
    `;
    this.container.appendChild(this.messageList);

    this.inputEl = document.createElement('input');
    this.inputEl.type = 'text';
    this.inputEl.placeholder = 'Ketik pesan dan tekan Enter...';
    this.inputEl.style.cssText = `
      width: 100%; padding: 8px 12px; font-family: inherit; font-size: 14px;
      color: #fff; background: rgba(0, 0, 0, 0.75); border: 2px solid #555;
      border-radius: 2px; outline: none; box-sizing: border-box; display: none;
      text-shadow: 1px 1px 0 #000;
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
      if ((e.key === 't' || e.key === 'T') && !this.isOpen && document.pointerLockElement) {
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
    if (document.pointerLockElement) document.exitPointerLock();
  }

  close(): void {
    this.isOpen = false;
    this.inputEl.style.display = 'none';
    this.inputEl.blur();
  }

  addMessage(author: string, text: string): void {
    this.messageList.style.display = 'flex';
    const msg = document.createElement('div');
    msg.style.cssText = 'word-break: break-word; font-size: 14px; line-height: 1.3;';
    msg.innerHTML = `<span style="color: #ffff55; font-weight: bold;">&lt;${author}&gt;</span> ${text}`;
    this.messageList.appendChild(msg);
    this.messageList.scrollTop = this.messageList.scrollHeight;
  }

  get visible(): boolean {
    return this.isOpen;
  }
}
