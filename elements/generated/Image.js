class FirefoxImage extends XULElement {
  constructor() {
    super();
  }
  connectedCallback() {}

  set src(val) {
    this.setAttribute("src", val);
    return val;
  }

  get src() {
    return this.getAttribute("src");
  }
}
customElements.define("firefox-image", FirefoxImage);
