class InputBoxSpell extends InputBox {
  connectedCallback() {
    super.connectedCallback()
    this.appendChild(MozXULElement.parseXULToFragment(`
      <children></children>
      <menupopup anonid="input-box-contextmenu" class="textbox-contextmenu" onpopupshowing="var input =
                                       this.parentNode.getElementsByAttribute('anonid', 'input')[0];
                                     if (document.commandDispatcher.focusedElement != input)
                                       input.focus();
                                     this.parentNode._doPopupItemEnablingSpell(this);" onpopuphiding="this.parentNode._doPopupItemDisabling(this);" oncommand="var cmd = event.originalTarget.getAttribute('cmd'); if(cmd) { this.parentNode.doCommand(cmd); event.stopPropagation(); }">
        <menuitem label="FROM-DTD.spellNoSuggestions.label;" anonid="spell-no-suggestions" disabled="true"></menuitem>
        <menuitem label="FROM-DTD.spellAddToDictionary.label;" accesskey="FROM-DTD.spellAddToDictionary.accesskey;" anonid="spell-add-to-dictionary" oncommand="this.parentNode.parentNode.spellCheckerUI.addToDictionary();"></menuitem>
        <menuitem label="FROM-DTD.spellUndoAddToDictionary.label;" accesskey="FROM-DTD.spellUndoAddToDictionary.accesskey;" anonid="spell-undo-add-to-dictionary" oncommand="this.parentNode.parentNode.spellCheckerUI.undoAddToDictionary();"></menuitem>
        <menuseparator anonid="spell-suggestions-separator"></menuseparator>
        <menuitem label="FROM-DTD.undoCmd.label;" accesskey="FROM-DTD.undoCmd.accesskey;" cmd="cmd_undo"></menuitem>
        <menuseparator></menuseparator>
        <menuitem label="FROM-DTD.cutCmd.label;" accesskey="FROM-DTD.cutCmd.accesskey;" cmd="cmd_cut"></menuitem>
        <menuitem label="FROM-DTD.copyCmd.label;" accesskey="FROM-DTD.copyCmd.accesskey;" cmd="cmd_copy"></menuitem>
        <menuitem label="FROM-DTD.pasteCmd.label;" accesskey="FROM-DTD.pasteCmd.accesskey;" cmd="cmd_paste"></menuitem>
        <menuitem label="FROM-DTD.deleteCmd.label;" accesskey="FROM-DTD.deleteCmd.accesskey;" cmd="cmd_delete"></menuitem>
        <menuseparator></menuseparator>
        <menuitem label="FROM-DTD.selectAllCmd.label;" accesskey="FROM-DTD.selectAllCmd.accesskey;" cmd="cmd_selectAll"></menuitem>
        <menuseparator anonid="spell-check-separator"></menuseparator>
        <menuitem label="FROM-DTD.spellCheckToggle.label;" type="checkbox" accesskey="FROM-DTD.spellCheckToggle.accesskey;" anonid="spell-check-enabled" oncommand="this.parentNode.parentNode.spellCheckerUI.toggleEnabled();"></menuitem>
        <menu label="FROM-DTD.spellDictionaries.label;" accesskey="FROM-DTD.spellDictionaries.accesskey;" anonid="spell-dictionaries">
          <menupopup anonid="spell-dictionaries-menu" onpopupshowing="event.stopPropagation();" onpopuphiding="event.stopPropagation();"></menupopup>
        </menu>
      </menupopup>
    `));
    this._spellCheckInitialized = false;

    this._enabledCheckbox = document.getAnonymousElementByAttribute(this, "anonid", "spell-check-enabled");

    this._suggestionsSeparator = document.getAnonymousElementByAttribute(this, "anonid", "spell-no-suggestions");

    this._dictionariesMenu = document.getAnonymousElementByAttribute(this, "anonid", "spell-dictionaries-menu");

    this._setupEventListeners();
  }

  get spellCheckerUI() {
    if (!this._spellCheckInitialized) {
      this._spellCheckInitialized = true;

      if (ChromeUtils.getClassName(document) != "XULDocument")
        return null;

      var textbox = document.getBindingParent(this);
      if (!textbox || textbox.localName != "textbox")
        return null;

      try {
        ChromeUtils.import("resource://gre/modules/InlineSpellChecker.jsm", this);
        this.InlineSpellCheckerUI = new this.InlineSpellChecker(textbox.editor);
      } catch (ex) {}
    }

    return this.InlineSpellCheckerUI;
  }

  _doPopupItemEnablingSpell(popupNode) {
    var spellui = this.spellCheckerUI;
    if (!spellui || !spellui.canSpellCheck) {
      this._setMenuItemVisibility("spell-no-suggestions", false);
      this._setMenuItemVisibility("spell-check-enabled", false);
      this._setMenuItemVisibility("spell-check-separator", false);
      this._setMenuItemVisibility("spell-add-to-dictionary", false);
      this._setMenuItemVisibility("spell-undo-add-to-dictionary", false);
      this._setMenuItemVisibility("spell-suggestions-separator", false);
      this._setMenuItemVisibility("spell-dictionaries", false);
      return;
    }

    spellui.initFromEvent(document.popupRangeParent,
      document.popupRangeOffset);

    var enabled = spellui.enabled;
    var showUndo = spellui.canSpellCheck && spellui.canUndo();
    this._enabledCheckbox.setAttribute("checked", enabled);

    var overMisspelling = spellui.overMisspelling;
    this._setMenuItemVisibility("spell-add-to-dictionary", overMisspelling);
    this._setMenuItemVisibility("spell-undo-add-to-dictionary", showUndo);
    this._setMenuItemVisibility("spell-suggestions-separator", overMisspelling || showUndo);

    // suggestion list
    var numsug = spellui.addSuggestionsToMenu(popupNode, this._suggestionsSeparator, 5);
    this._setMenuItemVisibility("spell-no-suggestions", overMisspelling && numsug == 0);

    // dictionary list
    var numdicts = spellui.addDictionaryListToMenu(this._dictionariesMenu, null);
    this._setMenuItemVisibility("spell-dictionaries", enabled && numdicts > 1);

    this._doPopupItemEnabling(popupNode);
  }

  _doPopupItemDisabling() {
    if (this.spellCheckerUI) {
      this.spellCheckerUI.clearSuggestionsFromMenu();
      this.spellCheckerUI.clearDictionaryListFromMenu();
    }
  }

  _setupEventListeners() {

  }
}