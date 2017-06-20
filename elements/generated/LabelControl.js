class XblLabelControl extends XblTextLabel {
  constructor() {
    super();
  }
  connectedCallback() {
    try {
      this.formatAccessKey(true);
    } catch (e) {}
    super.connectedCallback();
    console.log(this, "connected");

    this.innerHTML = `<children>
</children>
<span anonid="accessKeyParens">
</span>`;
    let comment = document.createComment("Creating xbl-label-control");
    this.prepend(comment);
  }
  disconnectedCallback() {}

  get labeledControlElement() {
    var control = this.control;
    return control ? document.getElementById(control) : null;
  }

  get control() {
    return this.getAttribute("control");
  }
  formatAccessKey(firstTime) {
    var control = this.labeledControlElement;
    if (!control) {
      var bindingParent = document.getBindingParent(this);
      if (
        bindingParent instanceof
        Components.interfaces.nsIDOMXULLabeledControlElement
      ) {
        control = bindingParent; // For controls that make the <label> an anon child
      }
    }
    if (control) {
      control.labelElement = this;
    }

    var accessKey = this.accessKey;
    // No need to remove existing formatting the first time.
    if (firstTime && !accessKey) return;

    if (this.mInsertSeparator === undefined) {
      try {
        var prefs = Components.classes[
          "@mozilla.org/preferences-service;1"
        ].getService(Components.interfaces.nsIPrefBranch);
        this.mUnderlineAccesskey =
          prefs.getIntPref("ui.key.menuAccessKey") != 0;

        const nsIPrefLocalizedString =
          Components.interfaces.nsIPrefLocalizedString;

        const prefNameInsertSeparator =
          "intl.menuitems.insertseparatorbeforeaccesskeys";
        const prefNameAlwaysAppendAccessKey =
          "intl.menuitems.alwaysappendaccesskeys";

        var val = prefs.getComplexValue(
          prefNameInsertSeparator,
          nsIPrefLocalizedString
        ).data;
        this.mInsertSeparator = val == "true";

        val = prefs.getComplexValue(
          prefNameAlwaysAppendAccessKey,
          nsIPrefLocalizedString
        ).data;
        this.mAlwaysAppendAccessKey = val == "true";
      } catch (e) {
        this.mInsertSeparator = true;
      }
    }

    if (!this.mUnderlineAccesskey) return;

    var afterLabel = document.getAnonymousElementByAttribute(
      this,
      "anonid",
      "accessKeyParens"
    );
    afterLabel.textContent = "";

    var oldAccessKey = this.getElementsByAttribute("class", "accesskey").item(
      0
    );
    if (oldAccessKey) {
      // Clear old accesskey
      this.mergeElement(oldAccessKey);
    }

    var oldHiddenSpan = this.getElementsByAttribute(
      "class",
      "hiddenColon"
    ).item(0);
    if (oldHiddenSpan) {
      this.mergeElement(oldHiddenSpan);
    }

    var labelText = this.textContent;
    if (!accessKey || !labelText || !control) {
      return;
    }
    var accessKeyIndex = -1;
    if (!this.mAlwaysAppendAccessKey) {
      accessKeyIndex = labelText.indexOf(accessKey);
      if (accessKeyIndex < 0) {
        // Try again in upper case
        accessKeyIndex = labelText
          .toUpperCase()
          .indexOf(accessKey.toUpperCase());
      }
    }

    const HTML_NS = "http://www.w3.org/1999/xhtml";
    var span = document.createElementNS(HTML_NS, "span");
    span.className = "accesskey";

    // Note that if you change the following code, see the comment of
    // nsTextBoxFrame::UpdateAccessTitle.

    // If accesskey is not in string, append in parentheses
    if (accessKeyIndex < 0) {
      // If end is colon, we should insert before colon.
      // i.e., "label:" -> "label(X):"
      var colonHidden = false;
      if (/:$/.test(labelText)) {
        labelText = labelText.slice(0, -1);
        var hiddenSpan = document.createElementNS(HTML_NS, "span");
        hiddenSpan.className = "hiddenColon";
        hiddenSpan.style.display = "none";
        // Hide the last colon by using span element.
        // I.e., label<span style="display:none;">:</span>
        this.wrapChar(hiddenSpan, labelText.length);
        colonHidden = true;
      }
      // If end is space(U+20),
      // we should not add space before parentheses.
      var endIsSpace = false;
      if (/ $/.test(labelText)) {
        endIsSpace = true;
      }
      if (this.mInsertSeparator && !endIsSpace) afterLabel.textContent = " (";
      else afterLabel.textContent = "(";
      span.textContent = accessKey.toUpperCase();
      afterLabel.appendChild(span);
      if (!colonHidden) afterLabel.appendChild(document.createTextNode(")"));
      else afterLabel.appendChild(document.createTextNode("):"));
      return;
    }
    this.wrapChar(span, accessKeyIndex);
  }
  wrapChar(element, index) {
    var treeWalker = document.createTreeWalker(
      this,
      NodeFilter.SHOW_TEXT,
      null
    );
    var node = treeWalker.nextNode();
    while (index >= node.length) {
      index -= node.length;
      node = treeWalker.nextNode();
    }
    if (index) {
      node = node.splitText(index);
    }
    node.parentNode.insertBefore(element, node);
    if (node.length > 1) {
      node.splitText(1);
    }
    element.appendChild(node);
  }
  mergeElement(element) {
    if (element.previousSibling instanceof Text) {
      element.previousSibling.appendData(element.textContent);
    } else {
      element.parentNode.insertBefore(element.firstChild, element);
    }
    element.remove();
  }
}
customElements.define("xbl-label-control", XblLabelControl);