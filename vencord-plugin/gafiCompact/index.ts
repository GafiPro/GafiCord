import { disableStyle, enableStyle } from "@api/Styles";
import definePlugin from "@utils/types";
import style from "./style.css?managed";

const COMPACT_CLASS = "gaficord-compact-mode";

function onKeyDown(event: KeyboardEvent) {
    if (
        event.defaultPrevented ||
        event.repeat ||
        !event.ctrlKey ||
        !event.shiftKey ||
        event.altKey ||
        event.metaKey ||
        event.code !== "KeyM"
    ) {
        return;
    }

    const target = event.target;
    if (
        target instanceof HTMLElement &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
    ) {
        return;
    }

    event.preventDefault();
    document.documentElement.classList.toggle(COMPACT_CLASS);
}

export default definePlugin({
    name: "GafiCompact",
    description: "Toggle a compact Discord message layout with Ctrl+Shift+M.",
    authors: [],

    start() {
        enableStyle(style);
        window.addEventListener("keydown", onKeyDown, true);
    },

    stop() {
        window.removeEventListener("keydown", onKeyDown, true);
        document.documentElement.classList.remove(COMPACT_CLASS);
        disableStyle(style);
    }
});
