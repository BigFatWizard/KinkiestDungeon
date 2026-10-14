"use strict";
let MouseX = 0;
let MouseY = 0;
function MouseIn(Left, Top, Width, Height) {
    return MouseXIn(Left, Width) && MouseYIn(Top, Height);
}
function PointIn(X, Y, Left, Top, Width, Height) {
    return (X >= Left) && (X <= Left + Width) && (Y >= Top) && (Y <= Top + Height);
}
function MouseXIn(Left, Width) {
    return (MouseX >= Left) && (MouseX <= Left + Width);
}
function MouseYIn(Top, Height) {
    return (MouseY >= Top) && (MouseY <= Top + Height);
}
function MouseHovering(Left, Top, Width, Height) {
    return MouseIn(Left, Top, Width, Height) && !CommonIsMobile;
}
//# sourceMappingURL=Mouse.js.map