class PlacesPopupBase extends Popup {
  connectedCallback() {
    super.connectedCallback()
    this.appendChild(MozXULElement.parseXULToFragment(`
      <hbox flex="1">
        <vbox class="menupopup-drop-indicator-bar" hidden="true">
          <image class="menupopup-drop-indicator" mousethrough="always"></image>
        </vbox>
        <arrowscrollbox class="popup-internal-box" flex="1" orient="vertical" smoothscroll="false">
          <children></children>
        </arrowscrollbox>
      </hbox>
    `));
    this.AppConstants = (ChromeUtils.import("resource://gre/modules/AppConstants.jsm", {})).AppConstants;

    this._indicatorBar = document.getAnonymousElementByAttribute(this, "class",
      "menupopup-drop-indicator-bar");

    this._scrollBox = document.getAnonymousElementByAttribute(this, "class",
      "popup-internal-box");

    /**
     * This is the view that manage the popup
     */
    this._rootView = PlacesUIUtils.getViewForNode(this);

    /**
     * Sub-menus should be opened when the mouse drags over them, and closed
     * when the mouse drags off.  The overFolder object manages opening and
     * closing of folders when the mouse hovers.
     */
    this._overFolder = {
      _self: this,
      _folder: {
        elt: null,
        openTimer: null,
        hoverTime: 350,
        closeTimer: null
      },
      _closeMenuTimer: null,

      get elt() {
        return this._folder.elt;
      },
      set elt(val) {
        return this._folder.elt = val;
      },

      get openTimer() {
        return this._folder.openTimer;
      },
      set openTimer(val) {
        return this._folder.openTimer = val;
      },

      get hoverTime() {
        return this._folder.hoverTime;
      },
      set hoverTime(val) {
        return this._folder.hoverTime = val;
      },

      get closeTimer() {
        return this._folder.closeTimer;
      },
      set closeTimer(val) {
        return this._folder.closeTimer = val;
      },

      get closeMenuTimer() {
        return this._closeMenuTimer;
      },
      set closeMenuTimer(val) {
        return this._closeMenuTimer = val;
      },

      setTimer: function OF__setTimer(aTime) {
        var timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
        timer.initWithCallback(this, aTime, timer.TYPE_ONE_SHOT);
        return timer;
      },

      notify: function OF__notify(aTimer) {
        // Function to process all timer notifications.

        if (aTimer == this._folder.openTimer) {
          // Timer to open a submenu that's being dragged over.
          this._folder.elt.lastChild.setAttribute("autoopened", "true");
          this._folder.elt.lastChild.openPopup();
          this._folder.openTimer = null;
        } else if (aTimer == this._folder.closeTimer) {
          // Timer to close a submenu that's been dragged off of.
          // Only close the submenu if the mouse isn't being dragged over any
          // of its child menus.
          var draggingOverChild = PlacesControllerDragHelper
            .draggingOverChildNode(this._folder.elt);
          if (draggingOverChild)
            this._folder.elt = null;
          this.clear();

          // Close any parent folders which aren't being dragged over.
          // (This is necessary because of the above code that keeps a folder
          // open while its children are being dragged over.)
          if (!draggingOverChild)
            this.closeParentMenus();
        } else if (aTimer == this.closeMenuTimer) {
          // Timer to close this menu after the drag exit.
          var popup = this._self;
          // if we are no more dragging we can leave the menu open to allow
          // for better D&D bookmark organization
          if (PlacesControllerDragHelper.getSession() &&
            !PlacesControllerDragHelper.draggingOverChildNode(popup.parentNode)) {
            popup.hidePopup();
            // Close any parent menus that aren't being dragged over;
            // otherwise they'll stay open because they couldn't close
            // while this menu was being dragged over.
            this.closeParentMenus();
          }
          this._closeMenuTimer = null;
        }
      },

      //  Helper function to close all parent menus of this menu,
      //  as long as none of the parent's children are currently being
      //  dragged over.
      closeParentMenus: function OF__closeParentMenus() {
        var popup = this._self;
        var parent = popup.parentNode;
        while (parent) {
          if (parent.localName == "menupopup" && parent._placesNode) {
            if (PlacesControllerDragHelper.draggingOverChildNode(parent.parentNode))
              break;
            parent.hidePopup();
          }
          parent = parent.parentNode;
        }
      },

      //  The mouse is no longer dragging over the stored menubutton.
      //  Close the menubutton, clear out drag styles, and clear all
      //  timers for opening/closing it.
      clear: function OF__clear() {
        if (this._folder.elt && this._folder.elt.lastChild) {
          if (!this._folder.elt.lastChild.hasAttribute("dragover"))
            this._folder.elt.lastChild.hidePopup();
          // remove menuactive style
          this._folder.elt.removeAttribute("_moz-menuactive");
          this._folder.elt = null;
        }
        if (this._folder.openTimer) {
          this._folder.openTimer.cancel();
          this._folder.openTimer = null;
        }
        if (this._folder.closeTimer) {
          this._folder.closeTimer.cancel();
          this._folder.closeTimer = null;
        }
      }
    };

    this._setupEventListeners();
  }

  /**
   * Check if we should hide the drop indicator for the target
   */
  _hideDropIndicator(aEvent) {
    let target = aEvent.target;

    // Don't draw the drop indicator outside of markers or if current
    // node is not a Places node.
    let betweenMarkers =
      (this._startMarker.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING) &&
      (this._endMarker.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_PRECEDING);

    // Hide the dropmarker if current node is not a Places node.
    return !(target && target._placesNode && betweenMarkers);
  }

  /**
   * This function returns information about where to drop when
   * dragging over this popup insertion point
   */
  _getDropPoint(aEvent) {
    // Can't drop if the menu isn't a folder
    let resultNode = this._placesNode;

    if (!PlacesUtils.nodeIsFolder(resultNode) ||
      this._rootView.controller.disallowInsertion(resultNode)) {
      return null;
    }

    var dropPoint = { ip: null, folderElt: null };

    // The element we are dragging over
    let elt = aEvent.target;
    if (elt.localName == "menupopup")
      elt = elt.parentNode;

    // Calculate positions taking care of arrowscrollbox
    let scrollbox = this._scrollBox;
    let eventY = aEvent.layerY + (scrollbox.boxObject.y - this.boxObject.y);
    let scrollboxOffset = scrollbox.scrollBoxObject.y -
      (scrollbox.boxObject.y - this.boxObject.y);
    let eltY = elt.boxObject.y - scrollboxOffset;
    let eltHeight = elt.boxObject.height;

    if (!elt._placesNode) {
      // If we are dragging over a non places node drop at the end.
      dropPoint.ip = new PlacesInsertionPoint({
        parentId: PlacesUtils.getConcreteItemId(resultNode),
        parentGuid: PlacesUtils.getConcreteItemGuid(resultNode)
      });
      // We can set folderElt if we are dropping over a static menu that
      // has an internal placespopup.
      let isMenu = elt.localName == "menu" ||
        (elt.localName == "toolbarbutton" &&
          elt.getAttribute("type") == "menu");
      if (isMenu && elt.lastChild &&
        elt.lastChild.hasAttribute("placespopup"))
        dropPoint.folderElt = elt;
      return dropPoint;
    }

    let tagName = PlacesUtils.nodeIsTagQuery(elt._placesNode) ?
      elt._placesNode.title : null;
    if ((PlacesUtils.nodeIsFolder(elt._placesNode) &&
        !PlacesUIUtils.isFolderReadOnly(elt._placesNode, this._rootView)) ||
      PlacesUtils.nodeIsTagQuery(elt._placesNode)) {
      // This is a folder or a tag container.
      if (eventY - eltY < eltHeight * 0.20) {
        // If mouse is in the top part of the element, drop above folder.
        dropPoint.ip = new PlacesInsertionPoint({
          parentId: PlacesUtils.getConcreteItemId(resultNode),
          parentGuid: PlacesUtils.getConcreteItemGuid(resultNode),
          orientation: Ci.nsITreeView.DROP_BEFORE,
          tagName,
          dropNearNode: elt._placesNode
        });
        return dropPoint;
      } else if (eventY - eltY < eltHeight * 0.80) {
        // If mouse is in the middle of the element, drop inside folder.
        dropPoint.ip = new PlacesInsertionPoint({
          parentId: PlacesUtils.getConcreteItemId(elt._placesNode),
          parentGuid: PlacesUtils.getConcreteItemGuid(elt._placesNode),
          tagName
        });
        dropPoint.folderElt = elt;
        return dropPoint;
      }
    } else if (eventY - eltY <= eltHeight / 2) {
      // This is a non-folder node or a readonly folder.
      // If the mouse is above the middle, drop above this item.
      dropPoint.ip = new PlacesInsertionPoint({
        parentId: PlacesUtils.getConcreteItemId(resultNode),
        parentGuid: PlacesUtils.getConcreteItemGuid(resultNode),
        orientation: Ci.nsITreeView.DROP_BEFORE,
        tagName,
        dropNearNode: elt._placesNode
      });
      return dropPoint;
    }

    // Drop below the item.
    dropPoint.ip = new PlacesInsertionPoint({
      parentId: PlacesUtils.getConcreteItemId(resultNode),
      parentGuid: PlacesUtils.getConcreteItemGuid(resultNode),
      orientation: Ci.nsITreeView.DROP_AFTER,
      tagName,
      dropNearNode: elt._placesNode,
    });
    return dropPoint;
  }

  _cleanupDragDetails() {
    // Called on dragend and drop.
    PlacesControllerDragHelper.currentDropTarget = null;
    this._rootView._draggedElt = null;
    this.removeAttribute("dragover");
    this.removeAttribute("dragstart");
    this._indicatorBar.hidden = true;
  }

  _setupEventListeners() {
    this.addEventListener("DOMMenuItemActive", (event) => {
      let elt = event.target;
      if (elt.parentNode != this)
        return;

      if (this.AppConstants.platform === "macosx") {
        // XXX: The following check is a temporary hack until bug 420033 is
        // resolved.
        let parentElt = elt.parent;
        while (parentElt) {
          if (parentElt.id == "bookmarksMenuPopup" ||
            parentElt.id == "goPopup")
            return;

          parentElt = parentElt.parentNode;
        }
      }

      if (window.XULBrowserWindow) {
        let placesNode = elt._placesNode;

        var linkURI;
        if (placesNode && PlacesUtils.nodeIsURI(placesNode))
          linkURI = placesNode.uri;
        else if (elt.hasAttribute("targetURI"))
          linkURI = elt.getAttribute("targetURI");

        if (linkURI)
          window.XULBrowserWindow.setOverLink(linkURI, null);
      }
    });

    this.addEventListener("DOMMenuItemInactive", (event) => {
      let elt = event.target;
      if (elt.parentNode != this)
        return;

      if (window.XULBrowserWindow)
        window.XULBrowserWindow.setOverLink("", null);
    });

    this.addEventListener("dragstart", (event) => {
      let elt = event.target;
      if (!elt._placesNode)
        return;

      let draggedElt = elt._placesNode;

      // Force a copy action if parent node is a query or we are dragging a
      // not-removable node.
      if (!this._rootView.controller.canMoveNode(draggedElt))
        event.dataTransfer.effectAllowed = "copyLink";

      // Activate the view and cache the dragged element.
      this._rootView._draggedElt = draggedElt;
      this._rootView.controller.setDataTransfer(event);
      this.setAttribute("dragstart", "true");
      event.stopPropagation();
    });

    this.addEventListener("drop", (event) => {
      PlacesControllerDragHelper.currentDropTarget = event.target;

      let dropPoint = this._getDropPoint(event);
      if (dropPoint && dropPoint.ip) {
        PlacesControllerDragHelper.onDrop(dropPoint.ip, event.dataTransfer)
          .catch(Cu.reportError);
        event.preventDefault();
      }

      this._cleanupDragDetails();
      event.stopPropagation();
    });

    this.addEventListener("dragover", (event) => {
      PlacesControllerDragHelper.currentDropTarget = event.target;
      let dt = event.dataTransfer;

      let dropPoint = this._getDropPoint(event);
      if (!dropPoint || !dropPoint.ip ||
        !PlacesControllerDragHelper.canDrop(dropPoint.ip, dt)) {
        this._indicatorBar.hidden = true;
        event.stopPropagation();
        return;
      }

      // Mark this popup as being dragged over.
      this.setAttribute("dragover", "true");

      if (dropPoint.folderElt) {
        // We are dragging over a folder.
        // _overFolder should take the care of opening it on a timer.
        if (this._overFolder.elt &&
          this._overFolder.elt != dropPoint.folderElt) {
          // We are dragging over a new folder, let's clear old values
          this._overFolder.clear();
        }
        if (!this._overFolder.elt) {
          this._overFolder.elt = dropPoint.folderElt;
          // Create the timer to open this folder.
          this._overFolder.openTimer = this._overFolder
            .setTimer(this._overFolder.hoverTime);
        }
        // Since we are dropping into a folder set the corresponding style.
        dropPoint.folderElt.setAttribute("_moz-menuactive", true);
      } else {
        // We are not dragging over a folder.
        // Clear out old _overFolder information.
        this._overFolder.clear();
      }

      // Autoscroll the popup strip if we drag over the scroll buttons.
      let anonid = event.originalTarget.getAttribute("anonid");
      let scrollDir = 0;
      if (anonid == "scrollbutton-up") {
        scrollDir = -1;
      } else if (anonid == "scrollbutton-down") {
        scrollDir = 1;
      }
      if (scrollDir != 0) {
        this._scrollBox.scrollByIndex(scrollDir, true);
      }

      // Check if we should hide the drop indicator for this target.
      if (dropPoint.folderElt || this._hideDropIndicator(event)) {
        this._indicatorBar.hidden = true;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // We should display the drop indicator relative to the arrowscrollbox.
      let sbo = this._scrollBox.scrollBoxObject;
      let newMarginTop = 0;
      if (scrollDir == 0) {
        let elt = this.firstChild;
        while (elt && event.screenY > elt.boxObject.screenY +
          elt.boxObject.height / 2)
          elt = elt.nextSibling;
        newMarginTop = elt ? elt.boxObject.screenY - sbo.screenY :
          sbo.height;
      } else if (scrollDir == 1)
        newMarginTop = sbo.height;

      // Set the new marginTop based on arrowscrollbox.
      newMarginTop += sbo.y - this._scrollBox.boxObject.y;
      this._indicatorBar.firstChild.style.marginTop = newMarginTop + "px";
      this._indicatorBar.hidden = false;

      event.preventDefault();
      event.stopPropagation();
    });

    this.addEventListener("dragexit", (event) => {
      PlacesControllerDragHelper.currentDropTarget = null;
      this.removeAttribute("dragover");

      // If we have not moved to a valid new target clear the drop indicator
      // this happens when moving out of the popup.
      let target = event.relatedTarget;
      if (!target || !this.contains(target))
        this._indicatorBar.hidden = true;

      // Close any folder being hovered over
      if (this._overFolder.elt) {
        this._overFolder.closeTimer = this._overFolder
          .setTimer(this._overFolder.hoverTime);
      }

      // The autoopened attribute is set when this folder was automatically
      // opened after the user dragged over it.  If this attribute is set,
      // auto-close the folder on drag exit.
      // We should also try to close this popup if the drag has started
      // from here, the timer will check if we are dragging over a child.
      if (this.hasAttribute("autoopened") ||
        this.hasAttribute("dragstart")) {
        this._overFolder.closeMenuTimer = this._overFolder
          .setTimer(this._overFolder.hoverTime);
      }

      event.stopPropagation();
    });

    this.addEventListener("dragend", (event) => {
      this._cleanupDragDetails();
    });

  }
}