/* This Source Code Form is subject to the terms of the Mozilla Public
  * License, v. 2.0. If a copy of the MPL was not distributed with this
  * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// This is loaded into all XUL windows. Wrap in a block to prevent
// leaking to window scope.
{

class MozHardblockedaddon extends MozXULElement {
  connectedCallback() {

    this.appendChild(MozXULElement.parseXULToFragment(`
      <image inherits="src=icon"></image>
      <vbox flex="1">
        <hbox class="addon-name-version">
          <label class="addonName" crop="end" inherits="value=name"></label>
          <label class="addonVersion" inherits="value=version"></label>
        </hbox>
        <hbox>
          <spacer flex="1"></spacer>
          <label class="blockedLabel" value="FROM-DTD.blocklist.blocked.label;"></label>
        </hbox>
      </vbox>
    `));

  }
}

customElements.define("hardblockedaddon", MozHardblockedaddon);

}
