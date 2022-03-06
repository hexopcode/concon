export class ConconConsoleElement extends HTMLElement {
  constructor() {
    super();
  }

  log(text: string) {
    const child = document.createElement('div');
    child.innerHTML = text;
    this.appendChild(child);
  }
}