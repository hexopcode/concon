export class ConconOutputElement extends HTMLElement {
  constructor() {
    super();
  }

  clear() {
    for (const child of Array.from(this.childNodes)) {
      child.remove();
    }
  }

  add(child: HTMLElement) {
    this.appendChild(child);
    child.scrollIntoView();
  }
}