"use strict";
let KDTextBoxStyle = {
    backgroundColor: "#000000a0",
    fontFamily: "'Courier New', 'Arial', sans-serif",
    fontSize: "14px",
    color: KDBaseWhite,
    lineHeight: 1.6,
};
let documentcache = new Map();
function ElementValue(ID, Value = null) {
    const e = document.getElementById(ID);
    if (!e) {
        return "";
    }
    if (Value == null)
        return e.value.trim();
    e.value = Value;
    return "";
}
function ElementContent(ID, Content = null) {
    const e = document.getElementById(ID);
    if (!e) {
        console.error("ElementContent called on a missing element: " + ID.toString());
        return "";
    }
    if (Content == null)
        return e.innerHTML;
    e.innerHTML = Content;
    return "";
}
function ElementCreateTextArea(ID) {
    if (document.getElementById(ID) == null) {
        var TextArea = document.createElement("TextArea");
        TextArea.setAttribute("ID", ID);
        TextArea.setAttribute("screen-generated", CurrentScreen);
        TextArea.setAttribute("name", ID);
        TextArea.setAttribute("autocapitalize", "off");
        TextArea.setAttribute("autocomplete", "off");
        TextArea.setAttribute("autocorrect", "off");
        TextArea.setAttribute("spellcheck", "false");
        TextArea.className = "HideOnPopup";
        Object.assign(TextArea.style, KDTextBoxStyle);
        document.body.appendChild(TextArea);
    }
}
function ElementCreateInput(ID, Type, Value, MaxLength = null) {
    if (document.getElementById(ID) == null) {
        var Input = document.createElement("input");
        Input.setAttribute("ID", ID);
        Input.setAttribute("name", ID);
        Input.setAttribute("type", Type);
        Input.setAttribute("value", Value);
        Input.setAttribute("screen-generated", CurrentScreen);
        Input.setAttribute("maxlength", MaxLength);
        Input.setAttribute("onfocus", "this.removeAttribute('readonly');");
        Input.setAttribute("autocapitalize", "off");
        Input.setAttribute("autocomplete", "off");
        Input.setAttribute("autocorrect", "off");
        Input.setAttribute("spellcheck", "false");
        Input.className = "HideOnPopup";
        document.body.appendChild(Input);
        Object.assign(Input.style, KDTextBoxStyle);
        return Input;
    }
}
function ElementCreateRangeInput(id, value, min, max, step, thumbIcon = null, vertical = false) {
    if (document.getElementById(id) == null) {
        const input = (document.createElement("input"));
        input.setAttribute("id", id);
        input.setAttribute("name", id);
        input.setAttribute("type", "range");
        input.removeAttribute("readonly");
        input.setAttribute("min", min);
        input.setAttribute("max", max);
        input.setAttribute("step", step);
        input.value = String(value);
        if (thumbIcon)
            input.setAttribute("data-thumb", thumbIcon);
        input.setAttribute("onfocus", "this.removeAttribute('readonly');");
        input.classList.add("HideOnPopup");
        if (vertical)
            input.classList.add("Vertical");
        document.body.appendChild(input);
        Object.assign(input.style, KDTextBoxStyle);
        return input;
    }
}
function ElementCreateDropdown(ID, Options, ClickEventListener = null) {
    if (document.getElementById(ID) == null) {
        var CustomSelect = document.createElement("DIV");
        CustomSelect.setAttribute("class", "custom-select");
        CustomSelect.setAttribute("ID", ID);
        var Select = document.createElement("select");
        Select.setAttribute("Name", ID + "-select");
        Select.setAttribute("ID", ID + "-select");
        var DivOptions = document.createElement("DIV");
        DivOptions.setAttribute("class", "select-items select-hide");
        for (let i = 0; i < Options.length; i++) {
            var Option = document.createElement("option");
            var InnerDiv = document.createElement("DIV");
            Option.setAttribute("value", Options[i]);
            Option.innerHTML = Options[i];
            InnerDiv.innerHTML = Options[i];
            InnerDiv.addEventListener("click", function () {
                var s = this.parentElement.parentElement.getElementsByTagName("select")[0];
                var h = this.parentElement.previousElementSibling;
                for (let j = 0; j < s.length; j++) {
                    if (s.options[j].innerHTML == this.innerHTML) {
                        s.selectedIndex = j;
                        h.innerHTML = this.innerHTML;
                        var y = this.parentElement.getElementsByClassName("same-as-selected");
                        for (let k = 0; k < y.length; k++) {
                            y[k].removeAttribute("class");
                        }
                        this.setAttribute("class", "same-as-selected");
                        break;
                    }
                }
                h.click();
                s.dispatchEvent(new Event("change"));
            });
            Select.appendChild(Option);
            DivOptions.appendChild(InnerDiv);
        }
        var SelectedItem = document.createElement("DIV");
        SelectedItem.setAttribute("class", "select-selected");
        SelectedItem.innerHTML = Select.options[0].innerHTML;
        SelectedItem.addEventListener("click", function (e) {
            e.stopPropagation();
            ElementCloseAllSelect(this);
            this.nextElementSibling.classList.toggle("select-hide");
        });
        if (ClickEventListener != null)
            Select.addEventListener("change", ClickEventListener);
        CustomSelect.appendChild(Select);
        CustomSelect.appendChild(SelectedItem);
        CustomSelect.appendChild(DivOptions);
        document.body.appendChild(CustomSelect);
        document.addEventListener("click", ElementCloseAllSelect);
    }
}
function ElementCloseAllSelect(elmnt) {
    var arrNo = [];
    var y = document.getElementsByClassName("select-selected");
    for (let i = 0; i < y.length; i++) {
        if (elmnt == y[i])
            arrNo.push(i);
    }
    var x = document.getElementsByClassName("select-items");
    for (let i = 0; i < x.length; i++) {
        if (arrNo.indexOf(i))
            x[i].classList.add("select-hide");
    }
}
function ElementCreateDiv(ID) {
    if (document.getElementById(ID) == null) {
        var Div = document.createElement("div");
        Div.setAttribute("ID", ID);
        Div.setAttribute("name", ID);
        Div.setAttribute("screen-generated", CurrentScreen);
        Div.className = "HideOnPopup";
        document.body.appendChild(Div);
    }
}
function ElementRemove(ID) {
    if (document.getElementById(ID) != null)
        document.getElementById(ID).parentNode.removeChild(document.getElementById(ID));
}
function ElementPosition(ElementID, X, Y, W, H = null) {
    var E = document.getElementById(ElementID);
    if (!E) {
        console.warn("A call to ElementPosition was made on non-existent element with ID '" + ElementID + "'");
        return;
    }
    if (E.tagName.toLowerCase() === "input" && E.getAttribute("type") === "range" && E.classList.contains("Vertical")) {
        var tmp = W;
        W = H;
        H = tmp;
    }
    documentcache.set(E, {
        x: X,
        y: Y,
    });
    const HRatio = PIXICanvas.clientHeight / 1000;
    const WRatio = PIXICanvas.clientWidth / 2000;
    const Font = PIXICanvas.clientWidth <= PIXICanvas.clientHeight * 2 ? PIXICanvas.clientWidth / 50 : PIXICanvas.clientHeight / 25;
    const Height = H ? H * HRatio : Font * 1.15;
    const Width = W * WRatio - 18;
    const Top = PIXICanvas.offsetTop + Y * HRatio - Height / 2;
    const Left = PIXICanvas.offsetLeft + (X - W / 2) * WRatio;
    Object.assign(E.style, {
        fontSize: Font + "px",
        fontFamily: KDTextBoxStyle.fontFamily,
        position: "fixed",
        left: Left + "px",
        top: Top + "px",
        width: Width + "px",
        height: Height + "px",
        display: "inline",
    });
    Object.assign(E, {
        KD_X: X,
        KD_Y: Y,
    });
}
function ElementPositionFix(ElementID, Font, X, Y, W, H) {
    var E = document.getElementById(ElementID);
    if (!E) {
        console.warn("A call to ElementPositionFix was made on non-existent element with ID '" + ElementID + "'");
        return;
    }
    documentcache.set(E, {
        x: X,
        y: Y,
    });
    const HRatio = PIXICanvas.clientHeight / 1000;
    const WRatio = PIXICanvas.clientWidth / 2000;
    Font *= Math.max(HRatio, WRatio);
    const Top = PIXICanvas.offsetTop + Y * HRatio;
    const Height = H * HRatio;
    const Left = PIXICanvas.offsetLeft + X * WRatio;
    const Width = W * WRatio;
    Object.assign(E.style, {
        fontSize: Font + "px",
        fontFamily: KDTextBoxStyle.fontFamily,
        position: "fixed",
        left: Left + "px",
        top: Top + "px",
        width: Width + "px",
        height: Height + "px",
        display: "inline"
    });
}
function ElementSetDataAttribute(ID, Name, Value) {
    var element = document.getElementById(ID);
    if (element != null) {
        element.setAttribute(("data-" + Name).toLowerCase(), Value.toString().toLowerCase());
    }
}
function ElementSetAttribute(ID, Name, Value) {
    var element = document.getElementById(ID);
    if (element != null) {
        element.setAttribute(Name, Value);
    }
}
function ElementScrollToEnd(ID) {
    var element = document.getElementById(ID);
    if (element != null)
        element.scrollTop = element.scrollHeight;
}
function ElementGetScrollPercentage(ID) {
    var element = document.getElementById(ID);
    if (element != null)
        return (element.scrollTop + element.clientHeight) / element.scrollHeight;
    return null;
}
function ElementIsScrolledToEnd(ID) {
    var element = document.getElementById(ID);
    return element != null && element.scrollHeight - element.scrollTop - element.clientHeight < 1;
}
function ElementFocus(ID) {
    if ((document.getElementById(ID) != null) && !CommonIsMobile)
        document.getElementById(ID).focus();
}
function ElementToggleGeneratedElements(Screen, ShouldDisplay) {
    const generatedElements = Array.from(document.querySelectorAll(`[screen-generated="${Screen}"]`));
    generatedElements.forEach((element) => element.style.display = ShouldDisplay ? '' : 'none');
}
//# sourceMappingURL=Element.js.map