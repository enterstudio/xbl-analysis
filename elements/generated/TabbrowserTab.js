/* This Source Code Form is subject to the terms of the Mozilla Public
  * License, v. 2.0. If a copy of the MPL was not distributed with this
  * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// This is loaded into all XUL windows. Wrap in a block to prevent
// leaking to window scope.
{

class MozTabbrowserTab extends MozTab {
  constructor() {
    super();

    this.addEventListener("mouseover", (event) => {
      if (event.originalTarget.getAttribute("anonid") == "close-button") {
        this.mOverCloseButton = true;
      }

      this._mouseenter();
    });

    this.addEventListener("mouseout", (event) => {
      if (event.originalTarget.getAttribute("anonid") == "close-button") {
        this.mOverCloseButton = false;
      }

      this._mouseleave();
    });

    this.addEventListener("dragstart", (event) => {
      this.style.MozUserFocus = "";
    }, true);

    this.addEventListener("dragstart", (event) => {
      if (this.mOverCloseButton) {
        event.stopPropagation();
      }
    });

    this.addEventListener("mousedown", (event) => {
      let tabContainer = this.parentNode;

      if (tabContainer._closeTabByDblclick &&
        event.button == 0 &&
        event.detail == 1) {
        this._selectedOnFirstMouseDown = this.selected;
      }

      if (this.selected) {
        this.style.MozUserFocus = "ignore";
      } else if (this.mOverCloseButton || this._overPlayingIcon) {
        // Prevent tabbox.xml from selecting the tab.
        event.stopPropagation();
      }

      if (event.button == 1) {
        gBrowser.warmupTab(gBrowser._findTabToBlurTo(this));
      }

      if (event.button == 0 && tabContainer._multiselectEnabled) {
        let shiftKey = event.shiftKey;
        let accelKey = event.getModifierState("Accel");
        if (shiftKey) {
          const lastSelectedTab = gBrowser.lastMultiSelectedTab;
          if (!accelKey) {
            gBrowser.selectedTab = lastSelectedTab;

            // Make sure selection is cleared when tab-switch doesn't happen.
            gBrowser.clearMultiSelectedTabs(false);
          }
          gBrowser.addRangeToMultiSelectedTabs(lastSelectedTab, this);

          // Prevent tabbox.xml from selecting the tab.
          event.stopPropagation();
        } else if (accelKey) {
          // Ctrl (Cmd for mac) key is pressed
          if (this.multiselected) {
            gBrowser.removeFromMultiSelectedTabs(this, true);
          } else if (this != gBrowser.selectedTab) {
            gBrowser.addToMultiSelectedTabs(this, false);
            gBrowser.lastMultiSelectedTab = this;
          }

          // Prevent tabbox.xml from selecting the tab.
          event.stopPropagation();
        } else if (!this.selected && this.multiselected) {
          gBrowser.lockClearMultiSelectionOnce();
        }
      }
    }, true);

    this.addEventListener("mouseup", (event) => {
      // Make sure that clear-selection is released.
      // Otherwise selection using Shift key may be broken.
      gBrowser.unlockClearMultiSelection();

      this.style.MozUserFocus = "";
    });

    this.addEventListener("click", (event) => {
      if (event.button != 0) { return; }
      if (event.getModifierState("Accel") || event.shiftKey) {
        return;
      }

      if (gBrowser.multiSelectedTabsCount > 0 &&
        !this.mOverCloseButton &&
        !this._overPlayingIcon) {
        // Tabs were previously multi-selected and user clicks on a tab
        // without holding Ctrl/Cmd Key

        // Force positional attributes to update when the
        // target (of the click) is the "active" tab.
        let updatePositionalAttr = gBrowser.selectedTab == this;

        gBrowser.clearMultiSelectedTabs(updatePositionalAttr);
      }

      if (this._overPlayingIcon) {
        if (this.multiselected) {
          gBrowser.toggleMuteAudioOnMultiSelectedTabs(this);
        } else {
          this.toggleMuteAudio();
        }
        return;
      }

      if (event.originalTarget.getAttribute("anonid") == "close-button") {
        if (this.multiselected) {
          gBrowser.removeMultiSelectedTabs();
        } else {
          gBrowser.removeTab(this, {
            animate: true,
            byMouse: event.mozInputSource == MouseEvent.MOZ_SOURCE_MOUSE,
          });
        }
        // This enables double-click protection for the tab container
        // (see tabbrowser-tabs 'click' handler).
        gBrowser.tabContainer._blockDblClick = true;
      }
    });

    this.addEventListener("dblclick", (event) => {
      if (event.button != 0) { return; }
      // for the one-close-button case
      if (event.originalTarget.getAttribute("anonid") == "close-button") {
        event.stopPropagation();
      }

      let tabContainer = this.parentNode;
      if (tabContainer._closeTabByDblclick &&
        this._selectedOnFirstMouseDown &&
        this.selected &&
        !this._overPlayingIcon) {
        gBrowser.removeTab(this, {
          animate: true,
          byMouse: event.mozInputSource == MouseEvent.MOZ_SOURCE_MOUSE,
        });
      }
    }, true);

    this.addEventListener("animationend", (event) => {
      if (event.originalTarget.getAttribute("anonid") == "tab-loading-burst") {
        this.removeAttribute("bursting");
      }
    });

  }

  connectedCallback() {
    super.connectedCallback()
    this.appendChild(MozXULElement.parseXULToFragment(`
      <stack class="tab-stack" flex="1">
        <vbox inherits="selected=visuallyselected,fadein" class="tab-background">
          <hbox inherits="selected=visuallyselected,multiselected,before-multiselected" class="tab-line"></hbox>
          <spacer flex="1"></spacer>
          <hbox class="tab-bottom-line"></hbox>
        </vbox>
        <hbox inherits="pinned,bursting,notselectedsinceload" anonid="tab-loading-burst" class="tab-loading-burst"></hbox>
        <hbox inherits="pinned,selected=visuallyselected,titlechanged,attention" class="tab-content" align="center">
          <hbox inherits="fadein,pinned,busy,progress,selected=visuallyselected" anonid="tab-throbber" class="tab-throbber" layer="true"></hbox>
          <image inherits="fadein,pinned,busy,progress,selected=visuallyselected" class="tab-throbber-fallback" role="presentation" layer="true"></image>
          <hbox inherits="fadein,pinned,busy,progress,selected=visuallyselected,pendingicon" anonid="tab-icon-pending" class="tab-icon-pending"></hbox>
          <image inherits="src=image,triggeringprincipal=iconloadingprincipal,requestcontextid,fadein,pinned,selected=visuallyselected,busy,crashed,sharing" anonid="tab-icon-image" class="tab-icon-image" validate="never" role="presentation"></image>
          <image inherits="sharing,selected=visuallyselected,pinned" anonid="sharing-icon" class="tab-sharing-icon-overlay" role="presentation"></image>
          <image inherits="crashed,busy,soundplaying,soundplaying-scheduledremoval,pinned,muted,blocked,selected=visuallyselected,activemedia-blocked" anonid="overlay-icon" class="tab-icon-overlay" role="presentation"></image>
          <hbox class="tab-label-container" inherits="pinned,selected=visuallyselected,labeldirection" onoverflow="this.setAttribute('textoverflow', 'true');" onunderflow="this.removeAttribute('textoverflow');" flex="1">
            <label class="tab-text tab-label" anonid="tab-label" inherits="text=label,accesskey,fadein,pinned,selected=visuallyselected,attention" role="presentation"></label>
          </hbox>
          <image inherits="soundplaying,soundplaying-scheduledremoval,pinned,muted,blocked,selected=visuallyselected,activemedia-blocked" anonid="soundplaying-icon" class="tab-icon-sound" role="presentation"></image>
          <image anonid="close-button" inherits="fadein,pinned,selected=visuallyselected" class="tab-close-button close-icon" role="presentation"></image>
        </hbox>
      </stack>
    `));
    this._selectedOnFirstMouseDown = false;

    /**
     * Describes how the tab ended up in this mute state. May be any of:
     *
     * - undefined: The tabs mute state has never changed.
     * - null: The mute state was last changed through the UI.
     * - Any string: The ID was changed through an extension API. The string
     * must be the ID of the extension which changed it.
     */
    this.muteReason = undefined;

    this.mOverCloseButton = false;

    this.mCorrespondingMenuitem = null;

    if (!("_lastAccessed" in this)) {
      this.updateLastAccessed();
    }

  }

  set _visuallySelected(val) {
    if (val == (this.getAttribute("visuallyselected") == "true")) {
      return val;
    }

    if (val) {
      this.setAttribute("visuallyselected", "true");
    } else {
      this.removeAttribute("visuallyselected");
    }
    gBrowser._tabAttrModified(this, ["visuallyselected"]);

    return val;
  }

  set _selected(val) {
    // in e10s we want to only pseudo-select a tab before its rendering is done, so that
    // the rest of the system knows that the tab is selected, but we don't want to update its
    // visual status to selected until after we receive confirmation that its content has painted.
    if (val)
      this.setAttribute("selected", "true");
    else
      this.removeAttribute("selected");

    // If we're non-e10s we should update the visual selection as well at the same time,
    // *or* if we're e10s and the visually selected tab isn't changing, in which case the
    // tab switcher code won't run and update anything else (like the before- and after-
    // selected attributes).
    if (!gMultiProcessBrowser || (val && this.hasAttribute("visuallyselected"))) {
      this._visuallySelected = val;
    }

    return val;
  }

  get pinned() {
    return this.getAttribute("pinned") == "true";
  }

  get hidden() {
    return this.getAttribute("hidden") == "true";
  }

  get muted() {
    return this.getAttribute("muted") == "true";
  }

  get multiselected() {
    return this.getAttribute("multiselected") == "true";
  }

  get beforeMultiselected() {
    return this.getAttribute("before-multiselected") == "true";
  }

  get userContextId() {
    return this.hasAttribute("usercontextid") ?
      parseInt(this.getAttribute("usercontextid")) :
      0;
  }

  get soundPlaying() {
    return this.getAttribute("soundplaying") == "true";
  }

  get activeMediaBlocked() {
    return this.getAttribute("activemedia-blocked") == "true";
  }

  get isEmpty() {
    // Determines if a tab is "empty", usually used in the context of determining
    // if it's ok to close the tab.
    if (this.hasAttribute("busy"))
      return false;

    if (this.hasAttribute("customizemode"))
      return false;

    let browser = this.linkedBrowser;
    if (!isBlankPageURL(browser.currentURI.spec))
      return false;

    if (!checkEmptyPageOrigin(browser))
      return false;

    if (browser.canGoForward || browser.canGoBack)
      return false;

    return true;
  }

  get lastAccessed() {
    return this._lastAccessed == Infinity ? Date.now() : this._lastAccessed;
  }

  get _overPlayingIcon() {
    let iconVisible = this.hasAttribute("soundplaying") ||
      this.hasAttribute("muted") ||
      this.hasAttribute("activemedia-blocked");
    let soundPlayingIcon =
      document.getAnonymousElementByAttribute(this, "anonid", "soundplaying-icon");
    let overlayIcon =
      document.getAnonymousElementByAttribute(this, "anonid", "overlay-icon");

    return soundPlayingIcon && soundPlayingIcon.matches(":hover") ||
      (overlayIcon && overlayIcon.matches(":hover") && iconVisible);
  }

  updateLastAccessed(aDate) {
    this._lastAccessed = this.selected ? Infinity : (aDate || Date.now());
  }

  /**
   * While it would make sense to track this in a field, the field will get nuked
   * once the node is gone from the DOM, which causes us to think the tab is not
   * closed, which causes us to make wrong decisions. So we use an expando instead.
   * <field name="closing">false</field>
   */
  _mouseenter() {
    if (this.hidden || this.closing) {
      return;
    }

    let tabContainer = this.parentNode;
    let visibleTabs = tabContainer._getVisibleTabs();
    let tabIndex = visibleTabs.indexOf(this);

    if (this.selected)
      tabContainer._handleTabSelect();

    if (tabIndex == 0) {
      tabContainer._beforeHoveredTab = null;
    } else {
      let candidate = visibleTabs[tabIndex - 1];
      let separatedByScrollButton =
        tabContainer.getAttribute("overflow") == "true" &&
        candidate.pinned && !this.pinned;
      if (!candidate.selected && !separatedByScrollButton) {
        tabContainer._beforeHoveredTab = candidate;
        candidate.setAttribute("beforehovered", "true");
      }
    }

    if (tabIndex == visibleTabs.length - 1) {
      tabContainer._afterHoveredTab = null;
    } else {
      let candidate = visibleTabs[tabIndex + 1];
      if (!candidate.selected) {
        tabContainer._afterHoveredTab = candidate;
        candidate.setAttribute("afterhovered", "true");
      }
    }

    tabContainer._hoveredTab = this;
    if (this.linkedPanel && !this.selected) {
      this.linkedBrowser.unselectedTabHover(true);
      this.startUnselectedTabHoverTimer();
    }

    // Prepare connection to host beforehand.
    SessionStore.speculativeConnectOnTabHover(this);

    let tabToWarm = this;
    if (this.mOverCloseButton) {
      tabToWarm = gBrowser._findTabToBlurTo(this);
    }
    gBrowser.warmupTab(tabToWarm);
  }

  _mouseleave() {
    let tabContainer = this.parentNode;
    if (tabContainer._beforeHoveredTab) {
      tabContainer._beforeHoveredTab.removeAttribute("beforehovered");
      tabContainer._beforeHoveredTab = null;
    }
    if (tabContainer._afterHoveredTab) {
      tabContainer._afterHoveredTab.removeAttribute("afterhovered");
      tabContainer._afterHoveredTab = null;
    }

    tabContainer._hoveredTab = null;
    if (this.linkedPanel && !this.selected) {
      this.linkedBrowser.unselectedTabHover(false);
      this.cancelUnselectedTabHoverTimer();
    }
  }

  startUnselectedTabHoverTimer() {
    // Only record data when we need to.
    if (!this.linkedBrowser.shouldHandleUnselectedTabHover) {
      return;
    }

    if (!TelemetryStopwatch.running("HOVER_UNTIL_UNSELECTED_TAB_OPENED", this)) {
      TelemetryStopwatch.start("HOVER_UNTIL_UNSELECTED_TAB_OPENED", this);
    }

    if (this._hoverTabTimer) {
      clearTimeout(this._hoverTabTimer);
      this._hoverTabTimer = null;
    }
  }

  cancelUnselectedTabHoverTimer() {
    // Since we're listening "mouseout" event, instead of "mouseleave".
    // Every time the cursor is moving from the tab to its child node (icon),
    // it would dispatch "mouseout"(for tab) first and then dispatch
    // "mouseover" (for icon, eg: close button, speaker icon) soon.
    // It causes we would cancel present TelemetryStopwatch immediately
    // when cursor is moving on the icon, and then start a new one.
    // In order to avoid this situation, we could delay cancellation and
    // remove it if we get "mouseover" within very short period.
    this._hoverTabTimer = setTimeout(() => {
      if (TelemetryStopwatch.running("HOVER_UNTIL_UNSELECTED_TAB_OPENED", this)) {
        TelemetryStopwatch.cancel("HOVER_UNTIL_UNSELECTED_TAB_OPENED", this);
      }
    }, 100);
  }

  finishUnselectedTabHoverTimer() {
    // Stop timer when the tab is opened.
    if (TelemetryStopwatch.running("HOVER_UNTIL_UNSELECTED_TAB_OPENED", this)) {
      TelemetryStopwatch.finish("HOVER_UNTIL_UNSELECTED_TAB_OPENED", this);
    }
  }

  startMediaBlockTimer() {
    TelemetryStopwatch.start("TAB_MEDIA_BLOCKING_TIME_MS", this);
  }

  finishMediaBlockTimer() {
    TelemetryStopwatch.finish("TAB_MEDIA_BLOCKING_TIME_MS", this);
  }

  toggleMuteAudio(aMuteReason) {
    let browser = this.linkedBrowser;
    let modifiedAttrs = [];
    let hist = Services.telemetry.getHistogramById("TAB_AUDIO_INDICATOR_USED");

    if (this.hasAttribute("activemedia-blocked")) {
      this.removeAttribute("activemedia-blocked");
      modifiedAttrs.push("activemedia-blocked");

      browser.resumeMedia();
      hist.add(3 /* unblockByClickingIcon */ );
      this.finishMediaBlockTimer();
    } else {
      if (browser.audioMuted) {
        if (this.linkedPanel) {
          // "Lazy Browser" should not invoke its unmute method
          browser.unmute();
        }
        this.removeAttribute("muted");
        hist.add(1 /* unmute */ );
      } else {
        if (this.linkedPanel) {
          // "Lazy Browser" should not invoke its mute method
          browser.mute();
        }
        this.setAttribute("muted", "true");
        hist.add(0 /* mute */ );
      }
      this.muteReason = aMuteReason || null;
      modifiedAttrs.push("muted");
    }
    gBrowser._tabAttrModified(this, modifiedAttrs);
  }

  setUserContextId(aUserContextId) {
    if (aUserContextId) {
      if (this.linkedBrowser) {
        this.linkedBrowser.setAttribute("usercontextid", aUserContextId);
      }
      this.setAttribute("usercontextid", aUserContextId);
    } else {
      if (this.linkedBrowser) {
        this.linkedBrowser.removeAttribute("usercontextid");
      }
      this.removeAttribute("usercontextid");
    }

    ContextualIdentityService.setTabStyle(this);
  }
}

customElements.define("tabbrowser-tab", MozTabbrowserTab);

}
