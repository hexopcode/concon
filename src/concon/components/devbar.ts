export const LIST_SOURCES = 'listsources';

export class ConconDevBarElement extends HTMLElement {
  private readonly loadButton: HTMLButtonElement;

  constructor() {
    super();
    this.loadButton = this.querySelector('.devbar-button')! as HTMLButtonElement;
    this.loadButton.addEventListener('click', this.listSources.bind(this));
  }

  private listSources() {
    this.dispatchEvent(new CustomEvent(LIST_SOURCES));
  }
}