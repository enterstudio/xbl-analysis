/* This Source Code Form is subject to the terms of the Mozilla Public
  * License, v. 2.0. If a copy of the MPL was not distributed with this
  * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// This is loaded into all XUL windows. Wrap in a block to prevent
// leaking to window scope.
{

class MozUrlbar extends MozTextbox {
  connectedCallback() {
    super.connectedCallback()
    this.appendChild(MozXULElement.parseXULToFragment(`
      <hbox flex="1" class="urlbar-textbox-container" tooltip="aHTMLTooltip">
        <children includes="image|deck|stack|box"></children>
        <moz-input-box anonid="moz-input-box" class="urlbar-input-box" flex="1">
          <children></children>
          <html:input anonid="scheme" class="urlbar-scheme textbox-input" required="required" inherits="textoverflow,focused"></html:input>
          <html:input anonid="input" class="urlbar-input textbox-input" allowevents="true" inputmode="mozAwesomebar" inherits="value,maxlength,disabled,size,readonly,placeholder,tabindex,accesskey,focused,textoverflow"></html:input>
        </moz-input-box>
        <image anonid="urlbar-go-button" class="urlbar-go-button urlbar-icon" onclick="gURLBar.handleCommand(event);" tooltiptext="FROM-DTD.goEndCap.tooltip;" inherits="pageproxystate,parentfocused=focused,usertyping"></image>
        <dropmarker anonid="historydropmarker" class="urlbar-history-dropmarker urlbar-icon chromeclass-toolbar-additional" tooltiptext="FROM-DTD.urlbar.openHistoryPopup.tooltip;" allowevents="true" inherits="open,parentfocused=focused,usertyping"></dropmarker>
        <children includes="hbox"></children>
      </hbox>
      <popupset anonid="popupset" class="autocomplete-result-popupset"></popupset>
      <children includes="toolbarbutton"></children>
    `));

  }
}

customElements.define("urlbar", MozUrlbar);

}
