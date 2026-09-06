# Google TV Remote Card

A custom Lovelace card for Home Assistant to control Google TV / Android TV devices.

## Features

- D-pad navigation with large tap targets
- Back and Home buttons
- Volume slider with +/− step buttons and mute toggle
- Separate volume entity support (e.g. Sonos)
- Fully configurable: show/hide sections, custom labels, optional title

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
media_entity: media_player.tv_streamer    # required — used as fallback for volume
volume_entity: media_player.sonos         # optional — overrides media_entity for volume

# Title
title: TV Streamer                        # optional — shown at top of card
show_title: true                          # default: true — set false to hide title

# Sections — all default to true
show_navigation: true                     # D-pad + ok button
show_buttons: true                        # Back and Home buttons
show_volume: true                         # Volume slider, +/−, mute

# Section labels — set to empty string "" to hide the label
label_navigation: "navigatie"             # default: "navigatie"
label_volume: "volume"                    # default: "volume"
```

## Minimal example

```yaml
type: custom:google-tv-remote-card
remote_entity: remote.tv_streamer
media_entity: media_player.tv_streamer
```

## Navigation only (e.g. for mobile)

```yaml
type: custom:google-tv-remote-card
remote_entity: remote.tv_streamer
media_entity: media_player.tv_streamer
show_title: false
show_volume: false
label_navigation: ""
```

manual reset repo
