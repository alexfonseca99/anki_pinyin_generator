"use strict";
/* Copyright: Ankitects Pty Ltd and contributors
 * License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html */
var time; // set in python code
let maxTime = 0;
$(function () {
    $("#ansbut").focus();
    updateTime();
    setInterval(function () {
        time += 1;
        updateTime();
    }, 1000);
});
let updateTime = function () {
    let timeNode = $("#time");
    if (!maxTime) {
        timeNode.text("");
        return;
    }
    time = Math.min(maxTime, time);
    const m = Math.floor(time / 60);
    const s = time % 60;
    let sStr = s.toString();
    if (s < 10) {
        sStr = "0" + s;
    }
    if (maxTime === time) {
        timeNode.html("<font color=red>" + m + ":" + sStr + "</font>");
    }
    else {
        timeNode.text(m + ":" + sStr);
    }
};
function showQuestion(txt, maxTime_) {
    // much faster than jquery's .html()
    $("#middle")[0].innerHTML = txt;
    time = 0;
    maxTime = maxTime_;
}
function showAnswer(txt) {
    $("#middle")[0].innerHTML = txt;
}
function selectedAnswerButton() {
    let node = document.activeElement;
    if (!node) {
        return;
    }
    return node.dataset.ease;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV2aWV3ZXItYm90dG9tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcXQvYXF0L2RhdGEvd2ViL2pzL3Jldmlld2VyLWJvdHRvbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7a0ZBQ2tGO0FBRWxGLElBQUksSUFBWSxDQUFDLENBQUMscUJBQXFCO0FBRXZDLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNoQixDQUFDLENBQUM7SUFDRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDckIsVUFBVSxFQUFFLENBQUM7SUFDYixXQUFXLENBQUM7UUFDUixJQUFJLElBQUksQ0FBQyxDQUFDO1FBQ1YsVUFBVSxFQUFFLENBQUM7SUFDakIsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2IsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLFVBQVUsR0FBRztJQUNiLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxQixJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ1YsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsQixPQUFPO0tBQ1Y7SUFDRCxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDL0IsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDaEMsTUFBTSxDQUFDLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNwQixJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDeEIsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFO1FBQ1IsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7S0FDbEI7SUFDRCxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7UUFDbEIsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQztLQUNsRTtTQUFNO1FBQ0gsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQ2pDO0FBQ0wsQ0FBQyxDQUFDO0FBRUYsU0FBUyxZQUFZLENBQUMsR0FBRyxFQUFFLFFBQVE7SUFDL0Isb0NBQW9DO0lBQ3BDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO0lBQ2hDLElBQUksR0FBRyxDQUFDLENBQUM7SUFDVCxPQUFPLEdBQUcsUUFBUSxDQUFDO0FBQ3ZCLENBQUM7QUFFRCxTQUFTLFVBQVUsQ0FBQyxHQUFHO0lBQ25CLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO0FBQ3BDLENBQUM7QUFFRCxTQUFTLG9CQUFvQjtJQUN6QixJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsYUFBNEIsQ0FBQztJQUNqRCxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1AsT0FBTztLQUNWO0lBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztBQUM3QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyogQ29weXJpZ2h0OiBBbmtpdGVjdHMgUHR5IEx0ZCBhbmQgY29udHJpYnV0b3JzXG4gKiBMaWNlbnNlOiBHTlUgQUdQTCwgdmVyc2lvbiAzIG9yIGxhdGVyOyBodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvYWdwbC5odG1sICovXG5cbnZhciB0aW1lOiBudW1iZXI7IC8vIHNldCBpbiBweXRob24gY29kZVxuXG5sZXQgbWF4VGltZSA9IDA7XG4kKGZ1bmN0aW9uICgpIHtcbiAgICAkKFwiI2Fuc2J1dFwiKS5mb2N1cygpO1xuICAgIHVwZGF0ZVRpbWUoKTtcbiAgICBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRpbWUgKz0gMTtcbiAgICAgICAgdXBkYXRlVGltZSgpO1xuICAgIH0sIDEwMDApO1xufSk7XG5cbmxldCB1cGRhdGVUaW1lID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCB0aW1lTm9kZSA9ICQoXCIjdGltZVwiKTtcbiAgICBpZiAoIW1heFRpbWUpIHtcbiAgICAgICAgdGltZU5vZGUudGV4dChcIlwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aW1lID0gTWF0aC5taW4obWF4VGltZSwgdGltZSk7XG4gICAgY29uc3QgbSA9IE1hdGguZmxvb3IodGltZSAvIDYwKTtcbiAgICBjb25zdCBzID0gdGltZSAlIDYwO1xuICAgIGxldCBzU3RyID0gcy50b1N0cmluZygpO1xuICAgIGlmIChzIDwgMTApIHtcbiAgICAgICAgc1N0ciA9IFwiMFwiICsgcztcbiAgICB9XG4gICAgaWYgKG1heFRpbWUgPT09IHRpbWUpIHtcbiAgICAgICAgdGltZU5vZGUuaHRtbChcIjxmb250IGNvbG9yPXJlZD5cIiArIG0gKyBcIjpcIiArIHNTdHIgKyBcIjwvZm9udD5cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGltZU5vZGUudGV4dChtICsgXCI6XCIgKyBzU3RyKTtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBzaG93UXVlc3Rpb24odHh0LCBtYXhUaW1lXykge1xuICAgIC8vIG11Y2ggZmFzdGVyIHRoYW4ganF1ZXJ5J3MgLmh0bWwoKVxuICAgICQoXCIjbWlkZGxlXCIpWzBdLmlubmVySFRNTCA9IHR4dDtcbiAgICB0aW1lID0gMDtcbiAgICBtYXhUaW1lID0gbWF4VGltZV87XG59XG5cbmZ1bmN0aW9uIHNob3dBbnN3ZXIodHh0KSB7XG4gICAgJChcIiNtaWRkbGVcIilbMF0uaW5uZXJIVE1MID0gdHh0O1xufVxuXG5mdW5jdGlvbiBzZWxlY3RlZEFuc3dlckJ1dHRvbigpIHtcbiAgICBsZXQgbm9kZSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGUuZGF0YXNldC5lYXNlO1xufVxuIl19