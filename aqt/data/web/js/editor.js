"use strict";
/* Copyright: Ankitects Pty Ltd and contributors
 * License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html */
let currentField = null;
let changeTimer = null;
let currentNoteId = null;
/* kept for compatibility with add-ons */
String.prototype.format = function () {
    const args = arguments;
    return this.replace(/\{\d+\}/g, function (m) {
        return args[m.match(/\d+/)];
    });
};
function setFGButton(col) {
    $("#forecolor")[0].style.backgroundColor = col;
}
function saveNow(keepFocus) {
    if (!currentField) {
        return;
    }
    clearChangeTimer();
    if (keepFocus) {
        saveField("key");
    }
    else {
        // triggers onBlur, which saves
        currentField.blur();
    }
}
function triggerKeyTimer() {
    clearChangeTimer();
    changeTimer = setTimeout(function () {
        updateButtonState();
        saveField("key");
    }, 600);
}
function onKey(evt) {
    // esc clears focus, allowing dialog to close
    if (evt.which === 27) {
        currentField.blur();
        return;
    }
    // fix Ctrl+right/left handling in RTL fields
    if (currentField.dir === "rtl") {
        const selection = window.getSelection();
        let granularity = "character";
        let alter = "move";
        if (evt.ctrlKey) {
            granularity = "word";
        }
        if (evt.shiftKey) {
            alter = "extend";
        }
        if (evt.which === 39) {
            selection.modify(alter, "right", granularity);
            evt.preventDefault();
            return;
        }
        else if (evt.which === 37) {
            selection.modify(alter, "left", granularity);
            evt.preventDefault();
            return;
        }
    }
    triggerKeyTimer();
}
function insertNewline() {
    if (!inPreEnvironment()) {
        setFormat("insertText", "\n");
        return;
    }
    // in some cases inserting a newline will not show any changes,
    // as a trailing newline at the end of a block does not render
    // differently. so in such cases we note the height has not
    // changed and insert an extra newline.
    const r = window.getSelection().getRangeAt(0);
    if (!r.collapsed) {
        // delete any currently selected text first, making
        // sure the delete is undoable
        setFormat("delete");
    }
    const oldHeight = currentField.clientHeight;
    setFormat("inserthtml", "\n");
    if (currentField.clientHeight === oldHeight) {
        setFormat("inserthtml", "\n");
    }
}
// is the cursor in an environment that respects whitespace?
function inPreEnvironment() {
    let n = window.getSelection().anchorNode;
    if (n.nodeType === 3) {
        n = n.parentNode;
    }
    return window.getComputedStyle(n).whiteSpace.startsWith("pre");
}
function onInput() {
    // empty field?
    if (currentField.innerHTML === "") {
        currentField.innerHTML = "<br>";
    }
    // make sure IME changes get saved
    triggerKeyTimer();
}
function updateButtonState() {
    const buts = ["bold", "italic", "underline", "superscript", "subscript"];
    for (const name of buts) {
        if (document.queryCommandState(name)) {
            $("#" + name).addClass("highlighted");
        }
        else {
            $("#" + name).removeClass("highlighted");
        }
    }
    // fixme: forecolor
    //    'col': document.queryCommandValue("forecolor")
}
function toggleEditorButton(buttonid) {
    if ($(buttonid).hasClass("highlighted")) {
        $(buttonid).removeClass("highlighted");
    }
    else {
        $(buttonid).addClass("highlighted");
    }
}
function setFormat(cmd, arg, nosave = false) {
    document.execCommand(cmd, false, arg);
    if (!nosave) {
        saveField("key");
        updateButtonState();
    }
}
function clearChangeTimer() {
    if (changeTimer) {
        clearTimeout(changeTimer);
        changeTimer = null;
    }
}
function onFocus(elem) {
    if (currentField === elem) {
        // anki window refocused; current element unchanged
        return;
    }
    currentField = elem;
    pycmd("focus:" + currentFieldOrdinal());
    enableButtons();
    // don't adjust cursor on mouse clicks
    if (mouseDown) {
        return;
    }
    // do this twice so that there's no flicker on newer versions
    caretToEnd();
    // scroll if bottom of element off the screen
    function pos(obj) {
        let cur = 0;
        do {
            cur += obj.offsetTop;
        } while ((obj = obj.offsetParent));
        return cur;
    }
    const y = pos(elem);
    if (window.pageYOffset + window.innerHeight < y + elem.offsetHeight ||
        window.pageYOffset > y) {
        window.scroll(0, y + elem.offsetHeight - window.innerHeight);
    }
}
function focusField(n) {
    if (n === null) {
        return;
    }
    $("#f" + n).focus();
}
function focusIfField(x, y) {
    const elements = document.elementsFromPoint(x, y);
    for (let i = 0; i < elements.length; i++) {
        let elem = elements[i];
        if (elem.classList.contains("field")) {
            elem.focus();
            // the focus event may not fire if the window is not active, so make sure
            // the current field is set
            currentField = elem;
            return true;
        }
    }
    return false;
}
function onPaste(elem) {
    pycmd("paste");
    window.event.preventDefault();
}
function caretToEnd() {
    const r = document.createRange();
    r.selectNodeContents(currentField);
    r.collapse(false);
    const s = document.getSelection();
    s.removeAllRanges();
    s.addRange(r);
}
function onBlur() {
    if (!currentField) {
        return;
    }
    if (document.activeElement === currentField) {
        // other widget or window focused; current field unchanged
        saveField("key");
    }
    else {
        saveField("blur");
        currentField = null;
        disableButtons();
    }
}
function saveField(type) {
    clearChangeTimer();
    if (!currentField) {
        // no field has been focused yet
        return;
    }
    // type is either 'blur' or 'key'
    pycmd(type +
        ":" +
        currentFieldOrdinal() +
        ":" +
        currentNoteId +
        ":" +
        currentField.innerHTML);
}
function currentFieldOrdinal() {
    return currentField.id.substring(1);
}
function wrappedExceptForWhitespace(text, front, back) {
    const match = text.match(/^(\s*)([^]*?)(\s*)$/);
    return match[1] + front + match[2] + back + match[3];
}
function disableButtons() {
    $("button.linkb:not(.perm)").prop("disabled", true);
}
function enableButtons() {
    $("button.linkb").prop("disabled", false);
}
// disable the buttons if a field is not currently focused
function maybeDisableButtons() {
    if (!document.activeElement || document.activeElement.className !== "field") {
        disableButtons();
    }
    else {
        enableButtons();
    }
}
function wrap(front, back) {
    wrapInternal(front, back, false);
}
/* currently unused */
function wrapIntoText(front, back) {
    wrapInternal(front, back, true);
}
function wrapInternal(front, back, plainText) {
    const s = window.getSelection();
    let r = s.getRangeAt(0);
    const content = r.cloneContents();
    const span = document.createElement("span");
    span.appendChild(content);
    if (plainText) {
        const new_ = wrappedExceptForWhitespace(span.innerText, front, back);
        setFormat("inserttext", new_);
    }
    else {
        const new_ = wrappedExceptForWhitespace(span.innerHTML, front, back);
        setFormat("inserthtml", new_);
    }
    if (!span.innerHTML) {
        // run with an empty selection; move cursor back past postfix
        r = s.getRangeAt(0);
        r.setStart(r.startContainer, r.startOffset - back.length);
        r.collapse(true);
        s.removeAllRanges();
        s.addRange(r);
    }
}
function onCutOrCopy() {
    pycmd("cutOrCopy");
    return true;
}
function setFields(fields) {
    let txt = "";
    // webengine will include the variable after enter+backspace
    // if we don't convert it to a literal colour
    const color = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("--text-fg");
    for (let i = 0; i < fields.length; i++) {
        const n = fields[i][0];
        let f = fields[i][1];
        if (!f) {
            f = "<br>";
        }
        txt += `
        <tr>
            <td class=fname id="name${i}">
                <span class="fieldname">${n}</span>
            </td>
        </tr>
        <tr>
            <td width=100%>
                <div id=f${i}
                     onkeydown='onKey(window.event);'
                     oninput='onInput();'
                     onmouseup='onKey(window.event);'
                     onfocus='onFocus(this);'
                     onblur='onBlur();'
                     class='field clearfix'
                     onpaste='onPaste(this);'
                     oncopy='onCutOrCopy(this);'
                     oncut='onCutOrCopy(this);'
                     contentEditable=true
                     class=field
                     style='color: ${color}'
                >${f}</div>
            </td>
        </tr>`;
    }
    $("#fields").html(`
    <table cellpadding=0 width=100% style='table-layout: fixed;'>
${txt}
    </table>`);
    maybeDisableButtons();
}
function setBackgrounds(cols) {
    for (let i = 0; i < cols.length; i++) {
        if (cols[i] == "dupe") {
            $("#f" + i).addClass("dupe");
        }
        else {
            $("#f" + i).removeClass("dupe");
        }
    }
}
function setFonts(fonts) {
    for (let i = 0; i < fonts.length; i++) {
        const n = $("#f" + i);
        n.css("font-family", fonts[i][0]).css("font-size", fonts[i][1]);
        n[0].dir = fonts[i][2] ? "rtl" : "ltr";
    }
}
function setNoteId(id) {
    currentNoteId = id;
}
function showDupes() {
    $("#dupes").show();
}
function hideDupes() {
    $("#dupes").hide();
}
/// If the field has only an empty br, remove it first.
let insertHtmlRemovingInitialBR = function (html) {
    if (html !== "") {
        // remove <br> in empty field
        if (currentField && currentField.innerHTML === "<br>") {
            currentField.innerHTML = "";
        }
        setFormat("inserthtml", html);
    }
};
let pasteHTML = function (html, internal, extendedMode) {
    html = filterHTML(html, internal, extendedMode);
    insertHtmlRemovingInitialBR(html);
};
let filterHTML = function (html, internal, extendedMode) {
    // wrap it in <top> as we aren't allowed to change top level elements
    const top = $.parseHTML("<ankitop>" + html + "</ankitop>")[0];
    if (internal) {
        filterInternalNode(top);
    }
    else {
        filterNode(top, extendedMode);
    }
    let outHtml = top.innerHTML;
    if (!extendedMode && !internal) {
        // collapse whitespace
        outHtml = outHtml.replace(/[\n\t ]+/g, " ");
    }
    outHtml = outHtml.trim();
    //console.log(`input html: ${html}`);
    //console.log(`outpt html: ${outHtml}`);
    return outHtml;
};
let allowedTagsBasic = {};
let allowedTagsExtended = {};
let TAGS_WITHOUT_ATTRS = ["P", "DIV", "BR", "SUB", "SUP"];
for (const tag of TAGS_WITHOUT_ATTRS) {
    allowedTagsBasic[tag] = { attrs: [] };
}
TAGS_WITHOUT_ATTRS = [
    "B",
    "BLOCKQUOTE",
    "CODE",
    "DD",
    "DL",
    "DT",
    "EM",
    "H1",
    "H2",
    "H3",
    "I",
    "LI",
    "OL",
    "PRE",
    "RP",
    "RT",
    "RUBY",
    "STRONG",
    "TABLE",
    "U",
    "UL",
];
for (const tag of TAGS_WITHOUT_ATTRS) {
    allowedTagsExtended[tag] = { attrs: [] };
}
allowedTagsBasic["IMG"] = { attrs: ["SRC"] };
allowedTagsExtended["A"] = { attrs: ["HREF"] };
allowedTagsExtended["TR"] = { attrs: ["ROWSPAN"] };
allowedTagsExtended["TD"] = { attrs: ["COLSPAN", "ROWSPAN"] };
allowedTagsExtended["TH"] = { attrs: ["COLSPAN", "ROWSPAN"] };
allowedTagsExtended["FONT"] = { attrs: ["COLOR"] };
const allowedStyling = {
    color: true,
    "background-color": true,
    "font-weight": true,
    "font-style": true,
    "text-decoration-line": true,
};
let isNightMode = function () {
    return document.body.classList.contains("nightMode");
};
let filterExternalSpan = function (node) {
    // filter out attributes
    let toRemove = [];
    for (const attr of node.attributes) {
        const attrName = attr.name.toUpperCase();
        if (attrName !== "STYLE") {
            toRemove.push(attr);
        }
    }
    for (const attributeToRemove of toRemove) {
        node.removeAttributeNode(attributeToRemove);
    }
    // filter styling
    toRemove = [];
    for (const name of node.style) {
        if (!allowedStyling.hasOwnProperty(name)) {
            toRemove.push(name);
        }
        if (name === "background-color" && node.style[name] === "transparent") {
            // google docs adds this unnecessarily
            toRemove.push(name);
        }
        if (isNightMode()) {
            // ignore coloured text in night mode for now
            if (name === "background-color" || name == "color") {
                toRemove.push(name);
            }
        }
    }
    for (let name of toRemove) {
        node.style.removeProperty(name);
    }
};
allowedTagsExtended["SPAN"] = filterExternalSpan;
// add basic tags to extended
Object.assign(allowedTagsExtended, allowedTagsBasic);
// filtering from another field
let filterInternalNode = function (node) {
    if (node.style) {
        node.style.removeProperty("background-color");
        node.style.removeProperty("font-size");
        node.style.removeProperty("font-family");
    }
    // recurse
    for (const child of node.childNodes) {
        filterInternalNode(child);
    }
};
// filtering from external sources
let filterNode = function (node, extendedMode) {
    // text node?
    if (node.nodeType === 3) {
        return;
    }
    // descend first, and take a copy of the child nodes as the loop will skip
    // elements due to node modifications otherwise
    const nodes = [];
    for (const child of node.childNodes) {
        nodes.push(child);
    }
    for (const child of nodes) {
        filterNode(child, extendedMode);
    }
    if (node.tagName === "ANKITOP") {
        return;
    }
    let tag;
    if (extendedMode) {
        tag = allowedTagsExtended[node.tagName];
    }
    else {
        tag = allowedTagsBasic[node.tagName];
    }
    if (!tag) {
        if (!node.innerHTML || node.tagName === "TITLE") {
            node.parentNode.removeChild(node);
        }
        else {
            node.outerHTML = node.innerHTML;
        }
    }
    else {
        if (typeof tag === "function") {
            // filtering function provided
            tag(node);
        }
        else {
            // allowed, filter out attributes
            const toRemove = [];
            for (const attr of node.attributes) {
                const attrName = attr.name.toUpperCase();
                if (tag.attrs.indexOf(attrName) === -1) {
                    toRemove.push(attr);
                }
            }
            for (const attributeToRemove of toRemove) {
                node.removeAttributeNode(attributeToRemove);
            }
        }
    }
};
let adjustFieldsTopMargin = function () {
    const topHeight = $("#topbuts").height();
    const margin = topHeight + 8;
    document.getElementById("fields").style.marginTop = margin + "px";
};
let mouseDown = 0;
$(function () {
    document.body.onmousedown = function () {
        mouseDown++;
    };
    document.body.onmouseup = function () {
        mouseDown--;
    };
    document.onclick = function (evt) {
        const src = evt.target;
        if (src.tagName === "IMG") {
            // image clicked; find contenteditable parent
            let p = src;
            while ((p = p.parentNode)) {
                if (p.className === "field") {
                    $("#" + p.id).focus();
                    break;
                }
            }
        }
    };
    // prevent editor buttons from taking focus
    $("button.linkb").on("mousedown", function (e) {
        e.preventDefault();
    });
    window.onresize = function () {
        adjustFieldsTopMargin();
    };
    adjustFieldsTopMargin();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcXQvYXF0L2RhdGEvd2ViL2pzL2VkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7a0ZBQ2tGO0FBRWxGLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQztBQUN4QixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDdkIsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBTXpCLHlDQUF5QztBQUN6QyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRztJQUN0QixNQUFNLElBQUksR0FBRyxTQUFTLENBQUM7SUFDdkIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUM7UUFDdkMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBRUYsU0FBUyxXQUFXLENBQUMsR0FBRztJQUNwQixDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxHQUFHLENBQUM7QUFDbkQsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFDLFNBQVM7SUFDdEIsSUFBSSxDQUFDLFlBQVksRUFBRTtRQUNmLE9BQU87S0FDVjtJQUVELGdCQUFnQixFQUFFLENBQUM7SUFFbkIsSUFBSSxTQUFTLEVBQUU7UUFDWCxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7U0FBTTtRQUNILCtCQUErQjtRQUMvQixZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDdkI7QUFDTCxDQUFDO0FBRUQsU0FBUyxlQUFlO0lBQ3BCLGdCQUFnQixFQUFFLENBQUM7SUFDbkIsV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUNyQixpQkFBaUIsRUFBRSxDQUFDO1FBQ3BCLFNBQVMsQ0FBQyxLQUFL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LE9BQU8sR0FBRyxVQUFVLEdBQWU7UUFDeEMsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQWlCLENBQUM7UUFDbEMsSUFBSSxHQUFHLENBQUMsT0FBTyxLQUFLLEtBQUssRUFBRTtZQUN2Qiw2Q0FBNkM7WUFDN0MsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO1lBQ1osT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBcUIsQ0FBQyxFQUFFO2dCQUNsQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEtBQUssT0FBTyxFQUFFO29CQUN6QixDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDdEIsTUFBTTtpQkFDVDthQUNKO1NBQ0o7SUFDTCxDQUFDLENBQUM7SUFFRiwyQ0FBMkM7SUFDM0MsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN2QixDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxRQUFRLEdBQUc7UUFDZCxxQkFBcUIsRUFBRSxDQUFDO0lBQzVCLENBQUMsQ0FBQztJQUVGLHFCQUFxQixFQUFFLENBQUM7QUFDNUIsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBDb3B5cmlnaHQ6IEFua2l0ZWN0cyBQdHkgTHRkIGFuZCBjb250cmlidXRvcnNcbiAqIExpY2Vuc2U6IEdOVSBBR1BMLCB2ZXJzaW9uIDMgb3IgbGF0ZXI7IGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9hZ3BsLmh0bWwgKi9cblxubGV0IGN1cnJlbnRGaWVsZCA9IG51bGw7XG5sZXQgY2hhbmdlVGltZXIgPSBudWxsO1xubGV0IGN1cnJlbnROb3RlSWQgPSBudWxsO1xuXG5kZWNsYXJlIGludGVyZmFjZSBTdHJpbmcge1xuICAgIGZvcm1hdCguLi5hcmdzKTogc3RyaW5nO1xufVxuXG4vKiBrZXB0IGZvciBjb21wYXRpYmlsaXR5IHdpdGggYWRkLW9ucyAqL1xuU3RyaW5nLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgYXJncyA9IGFyZ3VtZW50cztcbiAgICByZXR1cm4gdGhpcy5yZXBsYWNlKC9cXHtcXGQrXFx9L2csIGZ1bmN0aW9uIChtKSB7XG4gICAgICAgIHJldHVybiBhcmdzW20ubWF0Y2goL1xcZCsvKV07XG4gICAgfSk7XG59O1xuXG5mdW5jdGlvbiBzZXRGR0J1dHRvbihjb2wpIHtcbiAgICAkKFwiI2ZvcmVjb2xvclwiKVswXS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBjb2w7XG59XG5cbmZ1bmN0aW9uIHNhdmVOb3coa2VlcEZvY3VzKSB7XG4gICAgaWYgKCFjdXJyZW50RmllbGQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNsZWFyQ2hhbmdlVGltZXIoKTtcblxuICAgIGlmIChrZWVwRm9jdXMpIHtcbiAgICAgICAgc2F2ZUZpZWxkKFwia2V5XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHRyaWdnZXJzIG9uQmx1ciwgd2hpY2ggc2F2ZXNcbiAgICAgICAgY3VycmVudEZpZWxkLmJsdXIoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRyaWdnZXJLZXlUaW1lcigpIHtcbiAgICBjbGVhckNoYW5nZVRpbWVyKCk7XG4gICAgY2hhbmdlVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdXBkYXRlQnV0dG9uU3RhdGUoKTtcbiAgICAgICAgc2F2ZUZpZWxkKFwia2V5XCIpO1xuICAgIH0sIDYwMCk7XG59XG5cbmludGVyZmFjZSBTZWxlY3Rpb24ge1xuICAgIG1vZGlmeShzOiBzdHJpbmcsIHQ6IHN0cmluZywgdTogc3RyaW5nKTogdm9pZDtcbn1cblxuZnVuY3Rpb24gb25LZXkoZXZ0OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgLy8gZXNjIGNsZWFycyBmb2N1cywgYWxsb3dpbmcgZGlhbG9nIHRvIGNsb3NlXG4gICAgaWYgKGV2dC53aGljaCA9PT0gMjcpIHtcbiAgICAgICAgY3VycmVudEZpZWxkLmJsdXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGZpeCBDdHJsK3JpZ2h0L2xlZnQgaGFuZGxpbmcgaW4gUlRMIGZpZWxkc1xuICAgIGlmIChjdXJyZW50RmllbGQuZGlyID09PSBcInJ0bFwiKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgbGV0IGdyYW51bGFyaXR5ID0gXCJjaGFyYWN0ZXJcIjtcbiAgICAgICAgbGV0IGFsdGVyID0gXCJtb3ZlXCI7XG4gICAgICAgIGlmIChldnQuY3RybEtleSkge1xuICAgICAgICAgICAgZ3JhbnVsYXJpdHkgPSBcIndvcmRcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZ0LnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICBhbHRlciA9IFwiZXh0ZW5kXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2dC53aGljaCA9PT0gMzkpIHtcbiAgICAgICAgICAgIHNlbGVjdGlvbi5tb2RpZnkoYWx0ZXIsIFwicmlnaHRcIiwgZ3JhbnVsYXJpdHkpO1xuICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoZXZ0LndoaWNoID09PSAzNykge1xuICAgICAgICAgICAgc2VsZWN0aW9uLm1vZGlmeShhbHRlciwgXCJsZWZ0XCIsIGdyYW51bGFyaXR5KTtcbiAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdHJpZ2dlcktleVRpbWVyKCk7XG59XG5cbmZ1bmN0aW9uIGluc2VydE5ld2xpbmUoKSB7XG4gICAgaWYgKCFpblByZUVudmlyb25tZW50KCkpIHtcbiAgICAgICAgc2V0Rm9ybWF0KFwiaW5zZXJ0VGV4dFwiLCBcIlxcblwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGluIHNvbWUgY2FzZXMgaW5zZXJ0aW5nIGEgbmV3bGluZSB3aWxsIG5vdCBzaG93IGFueSBjaGFuZ2VzLFxuICAgIC8vIGFzIGEgdHJhaWxpbmcgbmV3bGluZSBhdCB0aGUgZW5kIG9mIGEgYmxvY2sgZG9lcyBub3QgcmVuZGVyXG4gICAgLy8gZGlmZmVyZW50bHkuIHNvIGluIHN1Y2ggY2FzZXMgd2Ugbm90ZSB0aGUgaGVpZ2h0IGhhcyBub3RcbiAgICAvLyBjaGFuZ2VkIGFuZCBpbnNlcnQgYW4gZXh0cmEgbmV3bGluZS5cblxuICAgIGNvbnN0IHIgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuZ2V0UmFuZ2VBdCgwKTtcbiAgICBpZiAoIXIuY29sbGFwc2VkKSB7XG4gICAgICAgIC8vIGRlbGV0ZSBhbnkgY3VycmVudGx5IHNlbGVjdGVkIHRleHQgZmlyc3QsIG1ha2luZ1xuICAgICAgICAvLyBzdXJlIHRoZSBkZWxldGUgaXMgdW5kb2FibGVcbiAgICAgICAgc2V0Rm9ybWF0KFwiZGVsZXRlXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IG9sZEhlaWdodCA9IGN1cnJlbnRGaWVsZC5jbGllbnRIZWlnaHQ7XG4gICAgc2V0Rm9ybWF0KFwiaW5zZXJ0aHRtbFwiLCBcIlxcblwiKTtcbiAgICBpZiAoY3VycmVudEZpZWxkLmNsaWVudEhlaWdodCA9PT0gb2xkSGVpZ2h0KSB7XG4gICAgICAgIHNldEZvcm1hdChcImluc2VydGh0bWxcIiwgXCJcXG5cIik7XG4gICAgfVxufVxuXG4vLyBpcyB0aGUgY3Vyc29yIGluIGFuIGVudmlyb25tZW50IHRoYXQgcmVzcGVjdHMgd2hpdGVzcGFjZT9cbmZ1bmN0aW9uIGluUHJlRW52aXJvbm1lbnQoKSB7XG4gICAgbGV0IG4gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuYW5jaG9yTm9kZSBhcyBFbGVtZW50O1xuICAgIGlmIChuLm5vZGVUeXBlID09PSAzKSB7XG4gICAgICAgIG4gPSBuLnBhcmVudE5vZGUgYXMgRWxlbWVudDtcbiAgICB9XG4gICAgcmV0dXJuIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG4pLndoaXRlU3BhY2Uuc3RhcnRzV2l0aChcInByZVwiKTtcbn1cblxuZnVuY3Rpb24gb25JbnB1dCgpIHtcbiAgICAvLyBlbXB0eSBmaWVsZD9cbiAgICBpZiAoY3VycmVudEZpZWxkLmlubmVySFRNTCA9PT0gXCJcIikge1xuICAgICAgICBjdXJyZW50RmllbGQuaW5uZXJIVE1MID0gXCI8YnI+XCI7XG4gICAgfVxuXG4gICAgLy8gbWFrZSBzdXJlIElNRSBjaGFuZ2VzIGdldCBzYXZlZFxuICAgIHRyaWdnZXJLZXlUaW1lcigpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVCdXR0b25TdGF0ZSgpIHtcbiAgICBjb25zdCBidXRzID0gW1wiYm9sZFwiLCBcIml0YWxpY1wiLCBcInVuZGVybGluZVwiLCBcInN1cGVyc2NyaXB0XCIsIFwic3Vic2NyaXB0XCJdO1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiBidXRzKSB7XG4gICAgICAgIGlmIChkb2N1bWVudC5xdWVyeUNvbW1hbmRTdGF0ZShuYW1lKSkge1xuICAgICAgICAgICAgJChcIiNcIiArIG5hbWUpLmFkZENsYXNzKFwiaGlnaGxpZ2h0ZWRcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKFwiI1wiICsgbmFtZSkucmVtb3ZlQ2xhc3MoXCJoaWdobGlnaHRlZFwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGZpeG1lOiBmb3JlY29sb3JcbiAgICAvLyAgICAnY29sJzogZG9jdW1lbnQucXVlcnlDb21tYW5kVmFsdWUoXCJmb3JlY29sb3JcIilcbn1cblxuZnVuY3Rpb24gdG9nZ2xlRWRpdG9yQnV0dG9uKGJ1dHRvbmlkKSB7XG4gICAgaWYgKCQoYnV0dG9uaWQpLmhhc0NsYXNzKFwiaGlnaGxpZ2h0ZWRcIikpIHtcbiAgICAgICAgJChidXR0b25pZCkucmVtb3ZlQ2xhc3MoXCJoaWdobGlnaHRlZFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAkKGJ1dHRvbmlkKS5hZGRDbGFzcyhcImhpZ2hsaWdodGVkXCIpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2V0Rm9ybWF0KGNtZDogc3RyaW5nLCBhcmc/OiBhbnksIG5vc2F2ZTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoY21kLCBmYWxzZSwgYXJnKTtcbiAgICBpZiAoIW5vc2F2ZSkge1xuICAgICAgICBzYXZlRmllbGQoXCJrZXlcIik7XG4gICAgICAgIHVwZGF0ZUJ1dHRvblN0YXRlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjbGVhckNoYW5nZVRpbWVyKCkge1xuICAgIGlmIChjaGFuZ2VUaW1lcikge1xuICAgICAgICBjbGVhclRpbWVvdXQoY2hhbmdlVGltZXIpO1xuICAgICAgICBjaGFuZ2VUaW1lciA9IG51bGw7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBvbkZvY3VzKGVsZW0pIHtcbiAgICBpZiAoY3VycmVudEZpZWxkID09PSBlbGVtKSB7XG4gICAgICAgIC8vIGFua2kgd2luZG93IHJlZm9jdXNlZDsgY3VycmVudCBlbGVtZW50IHVuY2hhbmdlZFxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGN1cnJlbnRGaWVsZCA9IGVsZW07XG4gICAgcHljbWQoXCJmb2N1czpcIiArIGN1cnJlbnRGaWVsZE9yZGluYWwoKSk7XG4gICAgZW5hYmxlQnV0dG9ucygpO1xuICAgIC8vIGRvbid0IGFkanVzdCBjdXJzb3Igb24gbW91c2UgY2xpY2tzXG4gICAgaWYgKG1vdXNlRG93bikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIGRvIHRoaXMgdHdpY2Ugc28gdGhhdCB0aGVyZSdzIG5vIGZsaWNrZXIgb24gbmV3ZXIgdmVyc2lvbnNcbiAgICBjYXJldFRvRW5kKCk7XG4gICAgLy8gc2Nyb2xsIGlmIGJvdHRvbSBvZiBlbGVtZW50IG9mZiB0aGUgc2NyZWVuXG4gICAgZnVuY3Rpb24gcG9zKG9iaikge1xuICAgICAgICBsZXQgY3VyID0gMDtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgY3VyICs9IG9iai5vZmZzZXRUb3A7XG4gICAgICAgIH0gd2hpbGUgKChvYmogPSBvYmoub2Zmc2V0UGFyZW50KSk7XG4gICAgICAgIHJldHVybiBjdXI7XG4gICAgfVxuXG4gICAgY29uc3QgeSA9IHBvcyhlbGVtKTtcbiAgICBpZiAoXG4gICAgICAgIHdpbmRvdy5wYWdlWU9mZnNldCArIHdpbmRvdy5pbm5lckhlaWdodCA8IHkgKyBlbGVtLm9mZnNldEhlaWdodCB8fFxuICAgICAgICB3aW5kb3cucGFnZVlPZmZzZXQgPiB5XG4gICAgKSB7XG4gICAgICAgIHdpbmRvdy5zY3JvbGwoMCwgeSArIGVsZW0ub2Zmc2V0SGVpZ2h0IC0gd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGZvY3VzRmllbGQobikge1xuICAgIGlmIChuID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgJChcIiNmXCIgKyBuKS5mb2N1cygpO1xufVxuXG5mdW5jdGlvbiBmb2N1c0lmRmllbGQoeCwgeSkge1xuICAgIGNvbnN0IGVsZW1lbnRzID0gZG9jdW1lbnQuZWxlbWVudHNGcm9tUG9pbnQoeCwgeSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgZWxlbSA9IGVsZW1lbnRzW2ldIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBpZiAoZWxlbS5jbGFzc0xpc3QuY29udGFpbnMoXCJmaWVsZFwiKSkge1xuICAgICAgICAgICAgZWxlbS5mb2N1cygpO1xuICAgICAgICAgICAgLy8gdGhlIGZvY3VzIGV2ZW50IG1heSBub3QgZmlyZSBpZiB0aGUgd2luZG93IGlzIG5vdCBhY3RpdmUsIHNvIG1ha2Ugc3VyZVxuICAgICAgICAgICAgLy8gdGhlIGN1cnJlbnQgZmllbGQgaXMgc2V0XG4gICAgICAgICAgICBjdXJyZW50RmllbGQgPSBlbGVtO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBvblBhc3RlKGVsZW0pIHtcbiAgICBweWNtZChcInBhc3RlXCIpO1xuICAgIHdpbmRvdy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG5mdW5jdGlvbiBjYXJldFRvRW5kKCkge1xuICAgIGNvbnN0IHIgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgIHIuc2VsZWN0Tm9kZUNvbnRlbnRzKGN1cnJlbnRGaWVsZCk7XG4gICAgci5jb2xsYXBzZShmYWxzZSk7XG4gICAgY29uc3QgcyA9IGRvY3VtZW50LmdldFNlbGVjdGlvbigpO1xuICAgIHMucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgcy5hZGRSYW5nZShyKTtcbn1cblxuZnVuY3Rpb24gb25CbHVyKCkge1xuICAgIGlmICghY3VycmVudEZpZWxkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gY3VycmVudEZpZWxkKSB7XG4gICAgICAgIC8vIG90aGVyIHdpZGdldCBvciB3aW5kb3cgZm9jdXNlZDsgY3VycmVudCBmaWVsZCB1bmNoYW5nZWRcbiAgICAgICAgc2F2ZUZpZWxkKFwia2V5XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNhdmVGaWVsZChcImJsdXJcIik7XG4gICAgICAgIGN1cnJlbnRGaWVsZCA9IG51bGw7XG4gICAgICAgIGRpc2FibGVCdXR0b25zKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzYXZlRmllbGQodHlwZSkge1xuICAgIGNsZWFyQ2hhbmdlVGltZXIoKTtcbiAgICBpZiAoIWN1cnJlbnRGaWVsZCkge1xuICAgICAgICAvLyBubyBmaWVsZCBoYXMgYmVlbiBmb2N1c2VkIHlldFxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIHR5cGUgaXMgZWl0aGVyICdibHVyJyBvciAna2V5J1xuICAgIHB5Y21kKFxuICAgICAgICB0eXBlICtcbiAgICAgICAgICAgIFwiOlwiICtcbiAgICAgICAgICAgIGN1cnJlbnRGaWVsZE9yZGluYWwoKSArXG4gICAgICAgICAgICBcIjpcIiArXG4gICAgICAgICAgICBjdXJyZW50Tm90ZUlkICtcbiAgICAgICAgICAgIFwiOlwiICtcbiAgICAgICAgICAgIGN1cnJlbnRGaWVsZC5pbm5lckhUTUxcbiAgICApO1xufVxuXG5mdW5jdGlvbiBjdXJyZW50RmllbGRPcmRpbmFsKCkge1xuICAgIHJldHVybiBjdXJyZW50RmllbGQuaWQuc3Vic3RyaW5nKDEpO1xufVxuXG5mdW5jdGlvbiB3cmFwcGVkRXhjZXB0Rm9yV2hpdGVzcGFjZSh0ZXh0LCBmcm9udCwgYmFjaykge1xuICAgIGNvbnN0IG1hdGNoID0gdGV4dC5tYXRjaCgvXihcXHMqKShbXl0qPykoXFxzKikkLyk7XG4gICAgcmV0dXJuIG1hdGNoWzFdICsgZnJvbnQgKyBtYXRjaFsyXSArIGJhY2sgKyBtYXRjaFszXTtcbn1cblxuZnVuY3Rpb24gZGlzYWJsZUJ1dHRvbnMoKSB7XG4gICAgJChcImJ1dHRvbi5saW5rYjpub3QoLnBlcm0pXCIpLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbn1cblxuZnVuY3Rpb24gZW5hYmxlQnV0dG9ucygpIHtcbiAgICAkKFwiYnV0dG9uLmxpbmtiXCIpLnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG59XG5cbi8vIGRpc2FibGUgdGhlIGJ1dHRvbnMgaWYgYSBmaWVsZCBpcyBub3QgY3VycmVudGx5IGZvY3VzZWRcbmZ1bmN0aW9uIG1heWJlRGlzYWJsZUJ1dHRvbnMoKSB7XG4gICAgaWYgKCFkb2N1bWVudC5hY3RpdmVFbGVtZW50IHx8IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuY2xhc3NOYW1lICE9PSBcImZpZWxkXCIpIHtcbiAgICAgICAgZGlzYWJsZUJ1dHRvbnMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBlbmFibGVCdXR0b25zKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB3cmFwKGZyb250LCBiYWNrKSB7XG4gICAgd3JhcEludGVybmFsKGZyb250LCBiYWNrLCBmYWxzZSk7XG59XG5cbi8qIGN1cnJlbnRseSB1bnVzZWQgKi9cbmZ1bmN0aW9uIHdyYXBJbnRvVGV4dChmcm9udCwgYmFjaykge1xuICAgIHdyYXBJbnRlcm5hbChmcm9udCwgYmFjaywgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIHdyYXBJbnRlcm5hbChmcm9udCwgYmFjaywgcGxhaW5UZXh0KSB7XG4gICAgY29uc3QgcyA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICBsZXQgciA9IHMuZ2V0UmFuZ2VBdCgwKTtcbiAgICBjb25zdCBjb250ZW50ID0gci5jbG9uZUNvbnRlbnRzKCk7XG4gICAgY29uc3Qgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIHNwYW4uYXBwZW5kQ2hpbGQoY29udGVudCk7XG4gICAgaWYgKHBsYWluVGV4dCkge1xuICAgICAgICBjb25zdCBuZXdfID0gd3JhcHBlZEV4Y2VwdEZvcldoaXRlc3BhY2Uoc3Bhbi5pbm5lclRleHQsIGZyb250LCBiYWNrKTtcbiAgICAgICAgc2V0Rm9ybWF0KFwiaW5zZXJ0dGV4dFwiLCBuZXdfKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBuZXdfID0gd3JhcHBlZEV4Y2VwdEZvcldoaXRlc3BhY2Uoc3Bhbi5pbm5lckhUTUwsIGZyb250LCBiYWNrKTtcbiAgICAgICAgc2V0Rm9ybWF0KFwiaW5zZXJ0aHRtbFwiLCBuZXdfKTtcbiAgICB9XG4gICAgaWYgKCFzcGFuLmlubmVySFRNTCkge1xuICAgICAgICAvLyBydW4gd2l0aCBhbiBlbXB0eSBzZWxlY3Rpb247IG1vdmUgY3Vyc29yIGJhY2sgcGFzdCBwb3N0Zml4XG4gICAgICAgIHIgPSBzLmdldFJhbmdlQXQoMCk7XG4gICAgICAgIHIuc2V0U3RhcnQoci5zdGFydENvbnRhaW5lciwgci5zdGFydE9mZnNldCAtIGJhY2subGVuZ3RoKTtcbiAgICAgICAgci5jb2xsYXBzZSh0cnVlKTtcbiAgICAgICAgcy5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICAgICAgcy5hZGRSYW5nZShyKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIG9uQ3V0T3JDb3B5KCkge1xuICAgIHB5Y21kKFwiY3V0T3JDb3B5XCIpO1xuICAgIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBzZXRGaWVsZHMoZmllbGRzKSB7XG4gICAgbGV0IHR4dCA9IFwiXCI7XG4gICAgLy8gd2ViZW5naW5lIHdpbGwgaW5jbHVkZSB0aGUgdmFyaWFibGUgYWZ0ZXIgZW50ZXIrYmFja3NwYWNlXG4gICAgLy8gaWYgd2UgZG9uJ3QgY29udmVydCBpdCB0byBhIGxpdGVyYWwgY29sb3VyXG4gICAgY29uc3QgY29sb3IgPSB3aW5kb3dcbiAgICAgICAgLmdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KVxuICAgICAgICAuZ2V0UHJvcGVydHlWYWx1ZShcIi0tdGV4dC1mZ1wiKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpZWxkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBuID0gZmllbGRzW2ldWzBdO1xuICAgICAgICBsZXQgZiA9IGZpZWxkc1tpXVsxXTtcbiAgICAgICAgaWYgKCFmKSB7XG4gICAgICAgICAgICBmID0gXCI8YnI+XCI7XG4gICAgICAgIH1cbiAgICAgICAgdHh0ICs9IGBcbiAgICAgICAgPHRyPlxuICAgICAgICAgICAgPHRkIGNsYXNzPWZuYW1lIGlkPVwibmFtZSR7aX1cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZpZWxkbmFtZVwiPiR7bn08L3NwYW4+XG4gICAgICAgICAgICA8L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgICA8dGQgd2lkdGg9MTAwJT5cbiAgICAgICAgICAgICAgICA8ZGl2IGlkPWYke2l9XG4gICAgICAgICAgICAgICAgICAgICBvbmtleWRvd249J29uS2V5KHdpbmRvdy5ldmVudCk7J1xuICAgICAgICAgICAgICAgICAgICAgb25pbnB1dD0nb25JbnB1dCgpOydcbiAgICAgICAgICAgICAgICAgICAgIG9ubW91c2V1cD0nb25LZXkod2luZG93LmV2ZW50KTsnXG4gICAgICAgICAgICAgICAgICAgICBvbmZvY3VzPSdvbkZvY3VzKHRoaXMpOydcbiAgICAgICAgICAgICAgICAgICAgIG9uYmx1cj0nb25CbHVyKCk7J1xuICAgICAgICAgICAgICAgICAgICAgY2xhc3M9J2ZpZWxkIGNsZWFyZml4J1xuICAgICAgICAgICAgICAgICAgICAgb25wYXN0ZT0nb25QYXN0ZSh0aGlzKTsnXG4gICAgICAgICAgICAgICAgICAgICBvbmNvcHk9J29uQ3V0T3JDb3B5KHRoaXMpOydcbiAgICAgICAgICAgICAgICAgICAgIG9uY3V0PSdvbkN1dE9yQ29weSh0aGlzKTsnXG4gICAgICAgICAgICAgICAgICAgICBjb250ZW50RWRpdGFibGU9dHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgY2xhc3M9ZmllbGRcbiAgICAgICAgICAgICAgICAgICAgIHN0eWxlPSdjb2xvcjogJHtjb2xvcn0nXG4gICAgICAgICAgICAgICAgPiR7Zn08L2Rpdj5cbiAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgIDwvdHI+YDtcbiAgICB9XG4gICAgJChcIiNmaWVsZHNcIikuaHRtbChgXG4gICAgPHRhYmxlIGNlbGxwYWRkaW5nPTAgd2lkdGg9MTAwJSBzdHlsZT0ndGFibGUtbGF5b3V0OiBmaXhlZDsnPlxuJHt0eHR9XG4gICAgPC90YWJsZT5gKTtcbiAgICBtYXliZURpc2FibGVCdXR0b25zKCk7XG59XG5cbmZ1bmN0aW9uIHNldEJhY2tncm91bmRzKGNvbHMpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGNvbHNbaV0gPT0gXCJkdXBlXCIpIHtcbiAgICAgICAgICAgICQoXCIjZlwiICsgaSkuYWRkQ2xhc3MoXCJkdXBlXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJChcIiNmXCIgKyBpKS5yZW1vdmVDbGFzcyhcImR1cGVcIik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNldEZvbnRzKGZvbnRzKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmb250cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBuID0gJChcIiNmXCIgKyBpKTtcbiAgICAgICAgbi5jc3MoXCJmb250LWZhbWlseVwiLCBmb250c1tpXVswXSkuY3NzKFwiZm9udC1zaXplXCIsIGZvbnRzW2ldWzFdKTtcbiAgICAgICAgblswXS5kaXIgPSBmb250c1tpXVsyXSA/IFwicnRsXCIgOiBcImx0clwiO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2V0Tm90ZUlkKGlkKSB7XG4gICAgY3VycmVudE5vdGVJZCA9IGlkO1xufVxuXG5mdW5jdGlvbiBzaG93RHVwZXMoKSB7XG4gICAgJChcIiNkdXBlc1wiKS5zaG93KCk7XG59XG5cbmZ1bmN0aW9uIGhpZGVEdXBlcygpIHtcbiAgICAkKFwiI2R1cGVzXCIpLmhpZGUoKTtcbn1cblxuLy8vIElmIHRoZSBmaWVsZCBoYXMgb25seSBhbiBlbXB0eSBiciwgcmVtb3ZlIGl0IGZpcnN0LlxubGV0IGluc2VydEh0bWxSZW1vdmluZ0luaXRpYWxCUiA9IGZ1bmN0aW9uIChodG1sOiBzdHJpbmcpIHtcbiAgICBpZiAoaHRtbCAhPT0gXCJcIikge1xuICAgICAgICAvLyByZW1vdmUgPGJyPiBpbiBlbXB0eSBmaWVsZFxuICAgICAgICBpZiAoY3VycmVudEZpZWxkICYmIGN1cnJlbnRGaWVsZC5pbm5lckhUTUwgPT09IFwiPGJyPlwiKSB7XG4gICAgICAgICAgICBjdXJyZW50RmllbGQuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBzZXRGb3JtYXQoXCJpbnNlcnRodG1sXCIsIGh0bWwpO1xuICAgIH1cbn07XG5cbmxldCBwYXN0ZUhUTUwgPSBmdW5jdGlvbiAoaHRtbCwgaW50ZXJuYWwsIGV4dGVuZGVkTW9kZSkge1xuICAgIGh0bWwgPSBmaWx0ZXJIVE1MKGh0bWwsIGludGVybmFsLCBleHRlbmRlZE1vZGUpO1xuICAgIGluc2VydEh0bWxSZW1vdmluZ0luaXRpYWxCUihodG1sKTtcbn07XG5cbmxldCBmaWx0ZXJIVE1MID0gZnVuY3Rpb24gKGh0bWwsIGludGVybmFsLCBleHRlbmRlZE1vZGUpIHtcbiAgICAvLyB3cmFwIGl0IGluIDx0b3A+IGFzIHdlIGFyZW4ndCBhbGxvd2VkIHRvIGNoYW5nZSB0b3AgbGV2ZWwgZWxlbWVudHNcbiAgICBjb25zdCB0b3AgPSAkLnBhcnNlSFRNTChcIjxhbmtpdG9wPlwiICsgaHRtbCArIFwiPC9hbmtpdG9wPlwiKVswXSBhcyBFbGVtZW50O1xuICAgIGlmIChpbnRlcm5hbCkge1xuICAgICAgICBmaWx0ZXJJbnRlcm5hbE5vZGUodG9wKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmaWx0ZXJOb2RlKHRvcCwgZXh0ZW5kZWRNb2RlKTtcbiAgICB9XG4gICAgbGV0IG91dEh0bWwgPSB0b3AuaW5uZXJIVE1MO1xuICAgIGlmICghZXh0ZW5kZWRNb2RlICYmICFpbnRlcm5hbCkge1xuICAgICAgICAvLyBjb2xsYXBzZSB3aGl0ZXNwYWNlXG4gICAgICAgIG91dEh0bWwgPSBvdXRIdG1sLnJlcGxhY2UoL1tcXG5cXHQgXSsvZywgXCIgXCIpO1xuICAgIH1cbiAgICBvdXRIdG1sID0gb3V0SHRtbC50cmltKCk7XG4gICAgLy9jb25zb2xlLmxvZyhgaW5wdXQgaHRtbDogJHtodG1sfWApO1xuICAgIC8vY29uc29sZS5sb2coYG91dHB0IGh0bWw6ICR7b3V0SHRtbH1gKTtcbiAgICByZXR1cm4gb3V0SHRtbDtcbn07XG5cbmxldCBhbGxvd2VkVGFnc0Jhc2ljID0ge307XG5sZXQgYWxsb3dlZFRhZ3NFeHRlbmRlZCA9IHt9O1xuXG5sZXQgVEFHU19XSVRIT1VUX0FUVFJTID0gW1wiUFwiLCBcIkRJVlwiLCBcIkJSXCIsIFwiU1VCXCIsIFwiU1VQXCJdO1xuZm9yIChjb25zdCB0YWcgb2YgVEFHU19XSVRIT1VUX0FUVFJTKSB7XG4gICAgYWxsb3dlZFRhZ3NCYXNpY1t0YWddID0geyBhdHRyczogW10gfTtcbn1cblxuVEFHU19XSVRIT1VUX0FUVFJTID0gW1xuICAgIFwiQlwiLFxuICAgIFwiQkxPQ0tRVU9URVwiLFxuICAgIFwiQ09ERVwiLFxuICAgIFwiRERcIixcbiAgICBcIkRMXCIsXG4gICAgXCJEVFwiLFxuICAgIFwiRU1cIixcbiAgICBcIkgxXCIsXG4gICAgXCJIMlwiLFxuICAgIFwiSDNcIixcbiAgICBcIklcIixcbiAgICBcIkxJXCIsXG4gICAgXCJPTFwiLFxuICAgIFwiUFJFXCIsXG4gICAgXCJSUFwiLFxuICAgIFwiUlRcIixcbiAgICBcIlJVQllcIixcbiAgICBcIlNUUk9OR1wiLFxuICAgIFwiVEFCTEVcIixcbiAgICBcIlVcIixcbiAgICBcIlVMXCIsXG5dO1xuZm9yIChjb25zdCB0YWcgb2YgVEFHU19XSVRIT1VUX0FUVFJTKSB7XG4gICAgYWxsb3dlZFRhZ3NFeHRlbmRlZFt0YWddID0geyBhdHRyczogW10gfTtcbn1cblxuYWxsb3dlZFRhZ3NCYXNpY1tcIklNR1wiXSA9IHsgYXR0cnM6IFtcIlNSQ1wiXSB9O1xuXG5hbGxvd2VkVGFnc0V4dGVuZGVkW1wiQVwiXSA9IHsgYXR0cnM6IFtcIkhSRUZcIl0gfTtcbmFsbG93ZWRUYWdzRXh0ZW5kZWRbXCJUUlwiXSA9IHsgYXR0cnM6IFtcIlJPV1NQQU5cIl0gfTtcbmFsbG93ZWRUYWdzRXh0ZW5kZWRbXCJURFwiXSA9IHsgYXR0cnM6IFtcIkNPTFNQQU5cIiwgXCJST1dTUEFOXCJdIH07XG5hbGxvd2VkVGFnc0V4dGVuZGVkW1wiVEhcIl0gPSB7IGF0dHJzOiBbXCJDT0xTUEFOXCIsIFwiUk9XU1BBTlwiXSB9O1xuYWxsb3dlZFRhZ3NFeHRlbmRlZFtcIkZPTlRcIl0gPSB7IGF0dHJzOiBbXCJDT0xPUlwiXSB9O1xuXG5jb25zdCBhbGxvd2VkU3R5bGluZyA9IHtcbiAgICBjb2xvcjogdHJ1ZSxcbiAgICBcImJhY2tncm91bmQtY29sb3JcIjogdHJ1ZSxcbiAgICBcImZvbnQtd2VpZ2h0XCI6IHRydWUsXG4gICAgXCJmb250LXN0eWxlXCI6IHRydWUsXG4gICAgXCJ0ZXh0LWRlY29yYXRpb24tbGluZVwiOiB0cnVlLFxufTtcblxubGV0IGlzTmlnaHRNb2RlID0gZnVuY3Rpb24gKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucyhcIm5pZ2h0TW9kZVwiKTtcbn07XG5cbmxldCBmaWx0ZXJFeHRlcm5hbFNwYW4gPSBmdW5jdGlvbiAobm9kZSkge1xuICAgIC8vIGZpbHRlciBvdXQgYXR0cmlidXRlc1xuICAgIGxldCB0b1JlbW92ZSA9IFtdO1xuICAgIGZvciAoY29uc3QgYXR0ciBvZiBub2RlLmF0dHJpYnV0ZXMpIHtcbiAgICAgICAgY29uc3QgYXR0ck5hbWUgPSBhdHRyLm5hbWUudG9VcHBlckNhc2UoKTtcbiAgICAgICAgaWYgKGF0dHJOYW1lICE9PSBcIlNUWUxFXCIpIHtcbiAgICAgICAgICAgIHRvUmVtb3ZlLnB1c2goYXR0cik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGVUb1JlbW92ZSBvZiB0b1JlbW92ZSkge1xuICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZU5vZGUoYXR0cmlidXRlVG9SZW1vdmUpO1xuICAgIH1cbiAgICAvLyBmaWx0ZXIgc3R5bGluZ1xuICAgIHRvUmVtb3ZlID0gW107XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIG5vZGUuc3R5bGUpIHtcbiAgICAgICAgaWYgKCFhbGxvd2VkU3R5bGluZy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgdG9SZW1vdmUucHVzaChuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmFtZSA9PT0gXCJiYWNrZ3JvdW5kLWNvbG9yXCIgJiYgbm9kZS5zdHlsZVtuYW1lXSA9PT0gXCJ0cmFuc3BhcmVudFwiKSB7XG4gICAgICAgICAgICAvLyBnb29nbGUgZG9jcyBhZGRzIHRoaXMgdW5uZWNlc3NhcmlseVxuICAgICAgICAgICAgdG9SZW1vdmUucHVzaChuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNOaWdodE1vZGUoKSkge1xuICAgICAgICAgICAgLy8gaWdub3JlIGNvbG91cmVkIHRleHQgaW4gbmlnaHQgbW9kZSBmb3Igbm93XG4gICAgICAgICAgICBpZiAobmFtZSA9PT0gXCJiYWNrZ3JvdW5kLWNvbG9yXCIgfHwgbmFtZSA9PSBcImNvbG9yXCIpIHtcbiAgICAgICAgICAgICAgICB0b1JlbW92ZS5wdXNoKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAobGV0IG5hbWUgb2YgdG9SZW1vdmUpIHtcbiAgICAgICAgbm9kZS5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcbiAgICB9XG59O1xuXG5hbGxvd2VkVGFnc0V4dGVuZGVkW1wiU1BBTlwiXSA9IGZpbHRlckV4dGVybmFsU3BhbjtcblxuLy8gYWRkIGJhc2ljIHRhZ3MgdG8gZXh0ZW5kZWRcbk9iamVjdC5hc3NpZ24oYWxsb3dlZFRhZ3NFeHRlbmRlZCwgYWxsb3dlZFRhZ3NCYXNpYyk7XG5cbi8vIGZpbHRlcmluZyBmcm9tIGFub3RoZXIgZmllbGRcbmxldCBmaWx0ZXJJbnRlcm5hbE5vZGUgPSBmdW5jdGlvbiAobm9kZSkge1xuICAgIGlmIChub2RlLnN0eWxlKSB7XG4gICAgICAgIG5vZGUuc3R5bGUucmVtb3ZlUHJvcGVydHkoXCJiYWNrZ3JvdW5kLWNvbG9yXCIpO1xuICAgICAgICBub2RlLnN0eWxlLnJlbW92ZVByb3BlcnR5KFwiZm9udC1zaXplXCIpO1xuICAgICAgICBub2RlLnN0eWxlLnJlbW92ZVByb3BlcnR5KFwiZm9udC1mYW1pbHlcIik7XG4gICAgfVxuICAgIC8vIHJlY3Vyc2VcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIG5vZGUuY2hpbGROb2Rlcykge1xuICAgICAgICBmaWx0ZXJJbnRlcm5hbE5vZGUoY2hpbGQpO1xuICAgIH1cbn07XG5cbi8vIGZpbHRlcmluZyBmcm9tIGV4dGVybmFsIHNvdXJjZXNcbmxldCBmaWx0ZXJOb2RlID0gZnVuY3Rpb24gKG5vZGUsIGV4dGVuZGVkTW9kZSkge1xuICAgIC8vIHRleHQgbm9kZT9cbiAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gZGVzY2VuZCBmaXJzdCwgYW5kIHRha2UgYSBjb3B5IG9mIHRoZSBjaGlsZCBub2RlcyBhcyB0aGUgbG9vcCB3aWxsIHNraXBcbiAgICAvLyBlbGVtZW50cyBkdWUgdG8gbm9kZSBtb2RpZmljYXRpb25zIG90aGVyd2lzZVxuXG4gICAgY29uc3Qgbm9kZXMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIG5vZGUuY2hpbGROb2Rlcykge1xuICAgICAgICBub2Rlcy5wdXNoKGNoaWxkKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBub2Rlcykge1xuICAgICAgICBmaWx0ZXJOb2RlKGNoaWxkLCBleHRlbmRlZE1vZGUpO1xuICAgIH1cblxuICAgIGlmIChub2RlLnRhZ05hbWUgPT09IFwiQU5LSVRPUFwiKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgdGFnO1xuICAgIGlmIChleHRlbmRlZE1vZGUpIHtcbiAgICAgICAgdGFnID0gYWxsb3dlZFRhZ3NFeHRlbmRlZFtub2RlLnRhZ05hbWVdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRhZyA9IGFsbG93ZWRUYWdzQmFzaWNbbm9kZS50YWdOYW1lXTtcbiAgICB9XG4gICAgaWYgKCF0YWcpIHtcbiAgICAgICAgaWYgKCFub2RlLmlubmVySFRNTCB8fCBub2RlLnRhZ05hbWUgPT09IFwiVElUTEVcIikge1xuICAgICAgICAgICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9kZS5vdXRlckhUTUwgPSBub2RlLmlubmVySFRNTDtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGFnID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIC8vIGZpbHRlcmluZyBmdW5jdGlvbiBwcm92aWRlZFxuICAgICAgICAgICAgdGFnKG5vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gYWxsb3dlZCwgZmlsdGVyIG91dCBhdHRyaWJ1dGVzXG4gICAgICAgICAgICBjb25zdCB0b1JlbW92ZSA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBhdHRyIG9mIG5vZGUuYXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJOYW1lID0gYXR0ci5uYW1lLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRhZy5hdHRycy5pbmRleE9mKGF0dHJOYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9SZW1vdmUucHVzaChhdHRyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZVRvUmVtb3ZlIG9mIHRvUmVtb3ZlKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGVOb2RlKGF0dHJpYnV0ZVRvUmVtb3ZlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmxldCBhZGp1c3RGaWVsZHNUb3BNYXJnaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgdG9wSGVpZ2h0ID0gJChcIiN0b3BidXRzXCIpLmhlaWdodCgpO1xuICAgIGNvbnN0IG1hcmdpbiA9IHRvcEhlaWdodCArIDg7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWVsZHNcIikuc3R5bGUubWFyZ2luVG9wID0gbWFyZ2luICsgXCJweFwiO1xufTtcblxubGV0IG1vdXNlRG93biA9IDA7XG5cbiQoZnVuY3Rpb24gKCkge1xuICAgIGRvY3VtZW50LmJvZHkub25tb3VzZWRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG1vdXNlRG93bisrO1xuICAgIH07XG5cbiAgICBkb2N1bWVudC5ib2R5Lm9ubW91c2V1cCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbW91c2VEb3duLS07XG4gICAgfTtcblxuICAgIGRvY3VtZW50Lm9uY2xpY2sgPSBmdW5jdGlvbiAoZXZ0OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHNyYyA9IGV2dC50YXJnZXQgYXMgRWxlbWVudDtcbiAgICAgICAgaWYgKHNyYy50YWdOYW1lID09PSBcIklNR1wiKSB7XG4gICAgICAgICAgICAvLyBpbWFnZSBjbGlja2VkOyBmaW5kIGNvbnRlbnRlZGl0YWJsZSBwYXJlbnRcbiAgICAgICAgICAgIGxldCBwID0gc3JjO1xuICAgICAgICAgICAgd2hpbGUgKChwID0gcC5wYXJlbnROb2RlIGFzIEVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHAuY2xhc3NOYW1lID09PSBcImZpZWxkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgJChcIiNcIiArIHAuaWQpLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBwcmV2ZW50IGVkaXRvciBidXR0b25zIGZyb20gdGFraW5nIGZvY3VzXG4gICAgJChcImJ1dHRvbi5saW5rYlwiKS5vbihcIm1vdXNlZG93blwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG5cbiAgICB3aW5kb3cub25yZXNpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGFkanVzdEZpZWxkc1RvcE1hcmdpbigpO1xuICAgIH07XG5cbiAgICBhZGp1c3RGaWVsZHNUb3BNYXJnaW4oKTtcbn0pO1xuIl19