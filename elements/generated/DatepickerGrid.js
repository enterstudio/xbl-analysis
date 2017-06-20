class XblDatepickerGrid extends XblDatepicker {
  constructor() {
    super();
  }
  connectedCallback() {
    super.connectedCallback();
    console.log(this, "connected");

    this.innerHTML = `<vbox class="datepicker-mainbox">
<hbox class="datepicker-monthbox" align="center">
<button class="datepicker-previous datepicker-button" type="repeat" inherits="disabled" oncommand="document.getBindingParent(this)._increaseOrDecreaseMonth(-1);">
</button>
<spacer flex="1">
</spacer>
<deck anonid="monthlabeldeck">
<xbl-text-label class="datepicker-gridlabel" value="">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" value="">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" value="">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" value="">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" value="">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" value="">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" value="">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" value="">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" value="">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" value="">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" value="">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" value="">
</xbl-text-label>
</deck>
<xbl-text-label anonid="yearlabel" class="datepicker-gridlabel">
</xbl-text-label>
<spacer flex="1">
</spacer>
<button class="datepicker-next datepicker-button" type="repeat" inherits="disabled" oncommand="document.getBindingParent(this)._increaseOrDecreaseMonth(1);">
</button>
</hbox>
<grid class="datepicker-grid" role="grid">
<columns>
<column class="datepicker-gridrow" flex="1">
</column>
<column class="datepicker-gridrow" flex="1">
</column>
<column class="datepicker-gridrow" flex="1">
</column>
<column class="datepicker-gridrow" flex="1">
</column>
<column class="datepicker-gridrow" flex="1">
</column>
<column class="datepicker-gridrow" flex="1">
</column>
<column class="datepicker-gridrow" flex="1">
</column>
</columns>
<rows anonid="datebox">
<row anonid="dayofweekbox">
<xbl-text-label class="datepicker-weeklabel" role="columnheader">
</xbl-text-label>
<xbl-text-label class="datepicker-weeklabel" role="columnheader">
</xbl-text-label>
<xbl-text-label class="datepicker-weeklabel" role="columnheader">
</xbl-text-label>
<xbl-text-label class="datepicker-weeklabel" role="columnheader">
</xbl-text-label>
<xbl-text-label class="datepicker-weeklabel" role="columnheader">
</xbl-text-label>
<xbl-text-label class="datepicker-weeklabel" role="columnheader">
</xbl-text-label>
<xbl-text-label class="datepicker-weeklabel" role="columnheader">
</xbl-text-label>
</row>
<row>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
</row>
<row>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
</row>
<row>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
</row>
<row>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
</row>
<row>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
</row>
<row>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
<xbl-text-label class="datepicker-gridlabel" role="gridcell">
</xbl-text-label>
</row>
</rows>
</grid>
</vbox>`;
    let comment = document.createComment("Creating xbl-datepicker-grid");
    this.prepend(comment);
  }
  disconnectedCallback() {}

  get selectedItem() {
    return this._selectedItem;
  }
  _init() {
    var locale =
      Intl.DateTimeFormat().resolvedOptions().locale + "-u-ca-gregory";
    var dtfMonth = Intl.DateTimeFormat(locale, {
      month: "long",
      timeZone: "UTC"
    });
    var dtfWeekday = Intl.DateTimeFormat(locale, { weekday: "narrow" });

    var monthLabel = this.monthField.firstChild;
    var tempDate = new Date(Date.UTC(2005, 0, 1));
    for (var month = 0; month < 12; month++) {
      tempDate.setUTCMonth(month);
      monthLabel.setAttribute("value", dtfMonth.format(tempDate));
      monthLabel = monthLabel.nextSibling;
    }

    var fdow = Number(this.getAttribute("firstdayofweek"));
    if (!isNaN(fdow) && fdow >= 0 && fdow <= 6) this._weekStart = fdow;

    var weekbox = document.getAnonymousElementByAttribute(
      this,
      "anonid",
      "dayofweekbox"
    ).childNodes;
    var date = new Date();
    date.setDate(date.getDate() - (date.getDay() - this._weekStart));
    for (var i = 0; i < weekbox.length; i++) {
      weekbox[i].value = dtfWeekday.format(date);
      date.setDate(date.getDate() + 1);
    }
  }
  _setValueNoSync(aValue) {
    var dt = new Date(aValue);
    if (!isNaN(dt)) {
      this._dateValue = dt;
      this.setAttribute("value", this.value);
      this._updateUI();
    }
  }
  _updateUI(aField, aValue, aCheckMonth) {
    var date;
    var currentMonth;
    if (aCheckMonth) {
      if (!this._displayedDate) this._displayedDate = this.dateValue;

      var expectedMonth = aValue;
      if (aField == this.monthField) {
        this._displayedDate.setMonth(aValue);
      } else {
        expectedMonth = this._displayedDate.getMonth();
        this._displayedDate.setFullYear(aValue);
      }

      if (
        expectedMonth != -1 &&
        expectedMonth != 12 &&
        expectedMonth != this._displayedDate.getMonth()
      ) {
        // If the month isn't what was expected, then the month overflowed.
        // Setting the date to 0 will go back to the last day of the right month.
        this._displayedDate.setDate(0);
      }

      date = new Date(this._displayedDate);
      currentMonth = this._displayedDate.getMonth();
    } else {
      var samemonth =
        this._displayedDate &&
        this._displayedDate.getMonth() == this.month &&
        this._displayedDate.getFullYear() == this.year;
      if (samemonth) {
        var items = this.dateField.getElementsByAttribute("value", this.date);
        if (items.length) this.selectedItem = items[0];
        return;
      }

      date = this.dateValue;
      this._displayedDate = new Date(date);
      currentMonth = this.month;
    }

    if (this._todayItem) {
      this._todayItem.removeAttribute("today");
      this._todayItem = null;
    }

    if (this._selectedItem) {
      this._selectedItem.removeAttribute("selected");
      this._selectedItem = null;
    }

    // Update the month and year title
    this.monthField.selectedIndex = currentMonth;
    this.yearField.setAttribute("value", date.getFullYear());

    date.setDate(1);
    var firstWeekday = (7 + date.getDay() - this._weekStart) % 7;
    date.setDate(date.getDate() - firstWeekday);

    var today = new Date();
    var datebox = this.dateField;
    for (var k = 1; k < datebox.childNodes.length; k++) {
      var row = datebox.childNodes[k];
      for (var i = 0; i < 7; i++) {
        var item = row.childNodes[i];

        if (currentMonth == date.getMonth()) {
          item.value = date.getDate();

          // highlight today
          if (this._isSameDay(today, date)) {
            this._todayItem = item;
            item.setAttribute("today", "true");
          }

          // highlight the selected date
          if (this._isSameDay(this._dateValue, date)) {
            this._selectedItem = item;
            item.setAttribute("selected", "true");
          }
        } else {
          item.value = "";
        }

        date.setDate(date.getDate() + 1);
      }
    }

    this._fireEvent("monthchange", this);
  }
  _increaseOrDecreaseDateFromEvent(aEvent, aDiff) {
    if (aEvent.originalTarget == this && !this.disabled && !this.readOnly) {
      var newdate = this.dateValue;
      newdate.setDate(newdate.getDate() + aDiff);
      this.dateValue = newdate;
      this._fireEvent("change", this);
    }
    aEvent.stopPropagation();
    aEvent.preventDefault();
  }
  _increaseOrDecreaseMonth(aDir) {
    if (!this.disabled) {
      var month = this._displayedDate
        ? this._displayedDate.getMonth()
        : this.month;
      this._updateUI(this.monthField, month + aDir, true);
    }
  }
  _isSameDay(aDate1, aDate2) {
    return (
      aDate1 &&
      aDate2 &&
      aDate1.getDate() == aDate2.getDate() &&
      aDate1.getMonth() == aDate2.getMonth() &&
      aDate1.getFullYear() == aDate2.getFullYear()
    );
  }
}
customElements.define("xbl-datepicker-grid", XblDatepickerGrid);