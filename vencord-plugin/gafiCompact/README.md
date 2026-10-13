# GafiCompact

A private Vencord user plugin for the GafiCord project. It adds a compact message-spacing mode to the existing Discord desktop client.

## Shortcut

- `Ctrl+Shift+M` — toggle compact message spacing.
- Press the shortcut again to return to normal spacing.
- The mode is intentionally session-only and resets when Discord restarts.

The shortcut is ignored while typing in an input, textarea, or content-editable element.

## Install into Vencord source

1. Set up Vencord from source by following the [official guide](https://docs.vencord.dev/installing/).
2. Copy this entire `gafiCompact` folder into `Vencord/src/userplugins/gafiCompact/`.
3. Rebuild and inject Vencord as described in the official guide.
4. Restart Discord, then enable **GafiCompact** in **User Settings → Vencord → Plugins**.

Do not put this folder in `src/plugins`: it is a private user plugin, not a contribution to the upstream Vencord project.
