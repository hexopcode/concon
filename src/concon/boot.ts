import {
  ConconConsoleElement,
  ConconContextElement,
  ConconDevBarElement,
  ConconElement,
  ConconOutputElement,
  ConconScreenElement,
} from './components';

customElements.define('concon-context', ConconContextElement);
customElements.define('concon-devbar', ConconDevBarElement);
customElements.define('concon-screen', ConconScreenElement);
customElements.define('concon-element', ConconElement);
customElements.define('concon-output', ConconOutputElement);
customElements.define('concon-console', ConconConsoleElement);

const concon = document.querySelector('concon-element')! as ConconElement;
concon.boot();