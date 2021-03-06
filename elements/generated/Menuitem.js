/* This Source Code Form is subject to the terms of the Mozilla Public
  * License, v. 2.0. If a copy of the MPL was not distributed with this
  * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// This is loaded into all XUL windows. Wrap in a block to prevent
// leaking to window scope.
{

class MozMenuitem extends MozMenuitemBase {
  connectedCallback() {
    super.connectedCallback()
    this.appendChild(MozXULElement.parseXULToFragment(`
      <label class="menu-text" inherits="value=label,accesskey,crop,highlightable" crop="right"></label>
      <hbox class="menu-accel-container" anonid="accel">
        <label class="menu-accel" inherits="value=acceltext"></label>
      </hbox>
    `));

  }
}

customElements.define("menuitem", MozMenuitem);

}
