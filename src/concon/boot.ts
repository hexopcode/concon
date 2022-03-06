import {ConconConsoleElement, ConconElement, ConconScreenElement} from './components';

customElements.define('concon-element', ConconElement);
customElements.define('concon-console', ConconConsoleElement);
customElements.define('concon-screen', ConconScreenElement);

const concon = document.querySelector('concon-element')! as ConconElement;
concon.boot();