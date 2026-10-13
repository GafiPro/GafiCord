# GafiCord

GafiCord customizes the **existing Discord desktop client**. It is not a Discord clone or a separate chat application.

The repository starts with two parts:

- **GafiCord Theme** — a dark violet CSS theme loaded by Vencord's Online Themes feature.
- **GafiCompact** — a small private Vencord plugin that toggles a more compact message layout with `Ctrl+Shift+M`.

Everything in this repository is free and open source. No paid APIs, hosted services, or subscriptions are required.

## Theme installation

1. Install Vencord for the Discord desktop client from [vencord.dev](https://vencord.dev/).
2. Open Discord → **User Settings → Vencord → Themes → Online Themes**.
3. Add this raw CSS URL:

   `https://raw.githubusercontent.com/GafiPro/GafiCord/main/themes/GafiCord.theme.css`

4. Enable **GafiCord** in the theme list and reload Discord if needed.

The theme changes Discord's existing colours and surfaces using CSS. It does not create a separate interface or application.

## Install the custom plugin

Custom plugins are not supported by the standard Vencord installer. They require a development build of Vencord from source.

1. Follow [Vencord's source installation guide](https://docs.vencord.dev/installing/).
2. Copy `vencord-plugin/gafiCompact/` from this repository into the Vencord source tree at `src/userplugins/gafiCompact/`.
3. Build and inject Vencord using the commands in the official guide.
4. Restart Discord and enable **GafiCompact** under **User Settings → Vencord → Plugins**.

### GafiCompact controls

- Press **Ctrl+Shift+M** to toggle compact message spacing.
- Press the shortcut again to restore the normal spacing.
- The mode resets when Discord restarts.

The shortcut ignores input fields, text areas, and content-editable elements, so it will not trigger while typing.

## Development

- Edit the theme in `themes/GafiCord.theme.css`. The Online Themes URL points to the latest version on the `main` branch.
- Edit the plugin in `vencord-plugin/gafiCompact/`, then copy it into your Vencord source tree and rebuild to test changes.
- Discord's internal class names can change with client updates, so CSS selectors may occasionally need maintenance.

## Important note

Discord's Terms of Service restrict unauthorized software that modifies its services. Using a modified client may carry account and stability risks. This repository is an unofficial personal customization project and is not affiliated with Discord or Vencord.

## Links

- [GafiCord source](https://github.com/GafiPro/GafiCord)
- [Vencord](https://vencord.dev/)
- [Vencord custom plugin documentation](https://docs.vencord.dev/installing/custom-plugins/)
- [Discord Terms of Service](https://discord.com/terms)
