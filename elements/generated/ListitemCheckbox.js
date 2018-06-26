class ListitemCheckbox extends Listitem {
  connectedCallback() {
    super.connectedCallback()
    this.appendChild(MozXULElement.parseXULToFragment(`
      <children>
        <listcell type="checkbox" inherits="label,crop,checked,disabled,flexlabel"></listcell>
      </children>
    `));

    this._setupEventListeners();
  }

  set checked(val) {
    if (val)
      this.setAttribute("checked", "true");
    else
      this.removeAttribute("checked");
    var event = document.createEvent("Events");
    event.initEvent("CheckboxStateChange", true, true);
    this.dispatchEvent(event);
    return val;
  }

  get checked() {
    return this.getAttribute('checked') == 'true';
  }

  _setupEventListeners() {
    this.addEventListener("mousedown", (event) => {
      if (!this.disabled && !this.control.disabled) {
        this.checked = !this.checked;
        this.doCommand();
      }
    });

  }
}