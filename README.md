# Google TV Remote Card

A custom Lovelace card for Home Assistant to control Google TV / Android TV devices.

<img width="289" height="538" alt="image" src="https://github.com/user-attachments/assets/4d656652-ae66-42ea-9222-db7d28f483dc" />
<img width="291" height="619" alt="image" src="https://github.com/user-attachments/assets/7340bc05-8ba3-47d5-b15c-816f783cb99a" />
<img width="288" height="697" alt="image" src="https://github.com/user-attachments/assets/5484a6f8-4f53-48d4-b481-36de0be0c543" />

## Features

- D-pad navigation with large tap targets
- Back and Home buttons (labels can be hidden)
- **App Launcher Bar**: Optional quick launch buttons for streaming apps (Netflix, NLZIET, Spotify, etc.)
- **Dynamic State Colors**: 
  - Power button lights up when the TV is on.
  - Home button lights up when the TV is on the Google TV home screen.
  - App buttons light up when that specific app is active on the screen.
- Volume slider with +/− step buttons and mute toggle
- Separate volume entity support (e.g. Sonos)
- Fully configurable: show/hide sections, toggle labels, custom icons, optional title

## Installation (HACS)

1. Add this repository to HACS → Frontend
2. Install "Google TV Remote Card"
3. Restart Home Assistant and clear browser cache
4. Add the card to your dashboard

## Configuration

```yaml
type: custom:google-tv-remote-card
remote_entity: remote.tv_streamer         # required
media_entity: media_player.tv_streamer    # required
volume_entity: media_player.sonos         # optional — separate entity for volume control
title: TV Streamer                        # optional
```

## Full configuration reference

```yaml
type: custom:google-tv-remote-card

# Entities
remote_entity: remote.tv_streamer         # required — Android TV Remote integration
media_entity: media_player.tv_streamer    # required — used for status state
volume_entity: media_player.sonos         # optional — overrides media_entity for volume

# Title
title: TV Streamer                        # optional — shown at top of card
show_title: true                          # default: true — set false to hide title

# Sections — all default to true
show_navigation: true                     # D-pad + ok button
show_buttons: true                        # Back and Home buttons
show_apps: true                           # Quick launch app bar (only renders if apps are listed)
show_volume: true                         # Volume slider, +/−, mute

# Label Visibility — all default to true
show_label_navigation: true               # set false to hide "navigatie" label text
show_label_volume: true                   # set false to hide "volume" label text
show_button_labels: true                  # set false to hide text ("terug", "home") under buttons

# Section labels
label_navigation: "navigatie"             # default: "navigatie"
label_volume: "volume"                    # default: "volume"

# App Launcher Configuration (Optional)
# If not specified, the app bar section will remain hidden.
apps:
  - netflix                               # uses built-in defaults (icon, schema, package ID)
  - id: nlziet
    icon: "phu:nlziet"                    # override default icon (supports custom icon sets)
  - name: "Plex"
    icon: "mdi:plex"
    activity: "plex://"                   # custom app link schema
    packageId: "com.plexapp.android"      # used to detect if app is currently open/active
```

## Built-in App IDs

You can use these shortcut IDs under your `apps:` configuration to automatically load defaults:
- `netflix`
- `nlziet`
- `spotify`
- `youtube`
- `videoland`
- `disneyplus`
- `primevideo`
- `viaplay`
- `max`
- `plex`
- `kodi`

## Minimal example (No app bar)

```yaml
type: custom:google-tv-remote-card
remote_entity: remote.tv_streamer
media_entity: media_player.tv_streamer
```

## Full example with custom Apps and clean design

```yaml
type: custom:google-tv-remote-card
remote_entity: remote.tv_streamer
media_entity: media_player.tv_streamer
show_title: false
show_label_navigation: false
show_button_labels: false
apps:
  - netflix
  - id: nlziet
    icon: "phu:nlziet"
  - spotify
```
