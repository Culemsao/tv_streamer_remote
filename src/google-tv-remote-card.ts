import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { RemoteCardConfig, AppConfig } from './types';

// Vooraf gedefinieerde app-lijst met URL-schema's en icons
const DEFAULT_APPS: Record<string, { name: string; activity: string; icon: string }> = {
  netflix: { name: 'Netflix', activity: 'netflix://', icon: 'mdi:netflix' },
  nlziet: { name: 'NLZIET', activity: 'nlziet://', icon: 'mdi:television-play' },
  spotify: { name: 'Spotify', activity: 'spotify://', icon: 'mdi:spotify' },
  youtube: { name: 'YouTube', activity: 'youtube.com', icon: 'mdi:youtube' },
  videoland: { name: 'Videoland', activity: 'videoland-v2://', icon: 'mdi:play-box' },
  disneyplus: { name: 'Disney+', activity: 'disneyplus.com', icon: 'mdi:television-classic' },
  primevideo: { name: 'Prime Video', activity: 'primevideo.com', icon: 'mdi:video' },
  viaplay: { name: 'Viaplay', activity: 'viaplay://', icon: 'mdi:sports-car' },
  max: { name: 'Max (HBO)', activity: 'max.com', icon: 'mdi:movie-roll' },
  plex: { name: 'Plex', activity: 'plex://', icon: 'mdi:plex' },
  kodi: { name: 'Kodi', activity: 'kodi://', icon: 'mdi:kodi' },
}; 

@customElement("google-tv-remote-card")
export class GoogleTVRemoteCard extends LitElement {
  @property({ attribute: false }) hass: any;
  @property({ attribute: false }) config!: RemoteCardConfig;
  @state() private _volume = 0.4;
  @state() private _muted = false;

  setConfig(config: RemoteCardConfig) {
    if (!config.remote_entity || !config.media_entity) {
      throw new Error("remote_entity and media_entity are required");
    }
    this.config = config;
  }

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has("hass")) {
      const entity = this.config.volume_entity ?? this.config.media_entity;
      const state = this.hass?.states[entity];
      if (state?.attributes?.volume_level !== undefined) {
        this._volume = state.attributes.volume_level;
      }
      if (state?.attributes?.is_volume_muted !== undefined) {
        this._muted = state.attributes.is_volume_muted;
      }
    }
  }

  // Stuurt het juiste activity commando naar de remote entiteit
  private _launchApp(activity: string): void {
    if (!this.config || !this.hass) return;
    
    this.hass.callService('remote', 'turn_on', {
      entity_id: this.config.remote_entity,
      data: {
        activity: activity
      }
    });
  }

  private get _isOn(): boolean {
    const state = this.hass?.states[this.config.media_entity];
    return state?.state !== "off" && state?.state !== "unavailable" && state?.state !== undefined;
  }

  // Originele interactiefuncties voor de remote knoppen
  private togglePower(): void {
    if (!this.config || !this.hass) return;
    this.hass.callService('remote', 'toggle', {
      entity_id: this.config.remote_entity
    });
  } 

  private sendKey(key: string): void {
    if (!this.config || !this.hass) return;
    this.hass.callService('remote', 'send_command', {
      entity_id: this.config.remote_entity,
      command: key
    });
  }

  private volStep(step: number): void {
    if (!this.config || !this.hass) return;
    const newVol = Math.min(1, Math.max(0, this._volume + step));
    this.hass.callService('media_player', 'volume_set', {
      entity_id: this.config.media_entity,
      volume_level: newVol
    });
  }

  private onSlider(e: any): void {
    if (!this.config || !this.hass) return;
    const newVol = parseFloat(e.target.value);
    this.hass.callService('media_player', 'volume_set', {
      entity_id: this.config.media_entity,
      volume_level: newVol
    });
  }

  private toggleMute(): void {
    if (!this.config || !this.hass) return;
    this.hass.callService('media_player', 'volume_mute', {
      entity_id: this.config.media_entity,
      is_volume_muted: !this._muted
    });
  }

  render() {
    const cfg = this.config;
    const showTitle      = cfg.show_title      !== false;
    const showNavigation = cfg.show_navigation !== false;
    const showButtons    = cfg.show_buttons    !== false;
    const showApps       = cfg.show_apps       !== false;
    const showVolume     = cfg.show_volume     !== false;
    const lblNavigation  = cfg.label_navigation ?? "navigatie";
    const lblVolume      = cfg.label_volume     ?? "volume";
    const isOn           = this._isOn;
    
    // Valt terug op Netflix, NLZIET en Spotify als er niks is ingevuld in YAML
    const configuredApps = cfg?.apps || ['netflix', 'nlziet', 'spotify'];

    return html`
      <div class="remote">

        <div class="top-row">
          <div
            class="power-btn ${isOn ? "on" : "off"}"
            @click=${this.togglePower}
            title=${isOn ? "Turn off" : "Turn on"}
          >
            <ha-icon icon="mdi:power"></ha-icon>
          </div>
          ${showTitle && cfg.title ? html`
            <div class="top-title">${cfg.title}</div>
          ` : html`<div class="top-title"></div>`}
          <div class="top-spacer"></div>
        </div>

        ${showNavigation ? html`
          ${lblNavigation ? html`<div class="lbl">${lblNavigation}</div>` : nothing}
          <div class="pad">
            <div class="arr u" @click=${() => this.sendKey("DPAD_UP")}>
              <div class="icon-wrap"><ha-icon icon="mdi:chevron-up"></ha-icon></div>
            </div>
            <div class="arr d" @click=${() => this.sendKey("DPAD_DOWN")}>
              <div class="icon-wrap"><ha-icon icon="mdi:chevron-down"></ha-icon></div>
            </div>
            <div class="arr l" @click=${() => this.sendKey("DPAD_LEFT")}>
              <div class="icon-wrap"><ha-icon icon="mdi:chevron-left"></ha-icon></div>
            </div>
            <div class="arr r" @click=${() => this.sendKey("DPAD_RIGHT")}>
              <div class="icon-wrap"><ha-icon icon="mdi:chevron-right"></ha-icon></div>
            </div>
            <div class="ok" @click=${() => this.sendKey("DPAD_CENTER")}>ok</div>
          </div>
        ` : nothing}

        ${showButtons ? html`
          <div class="hr"></div>
          <div class="btn-row">
            <div class="btn" @click=${() => this.sendKey("BACK")}>
              <ha-icon icon="mdi:arrow-u-left-top"></ha-icon>
              <span>terug</span>
            </div>
            <div class="btn" @click=${() => this.sendKey("HOME")}>
              <ha-icon icon="mdi:home"></ha-icon>
              <span>home</span>
            </div>
          </div>
        ` : nothing}

        <!-- APPS BALK -->
        ${showApps ? html`
          <div class="hr"></div>
          <div class="app-row">
            ${configuredApps.map((appKeyOrObj: string | any) => {
              let name = '';
              let activity = '';
              let icon = 'mdi:apps';

              if (typeof appKeyOrObj === 'string' && DEFAULT_APPS[appKeyOrObj]) {
                name = DEFAULT_APPS[appKeyOrObj].name;
                activity = DEFAULT_APPS[appKeyOrObj].activity;
                icon = DEFAULT_APPS[appKeyOrObj].icon;
              } else if (typeof appKeyOrObj === 'object') {
                name = appKeyOrObj.name || '';
                activity = appKeyOrObj.activity || '';
                icon = appKeyOrObj.icon || 'mdi:apps';
              }

              if (!activity) return html``;

              return html`
                <ha-icon-button
                  .title="${name}"
                  @click="${() => this._launchApp(activity)}"
                >
                  <ha-icon .icon="${icon}"></ha-icon>
                </ha-icon-button>
              `;
            })}
          </div>
        ` : nothing}      

        ${showVolume ? html`
          <div class="hr"></div>
          ${lblVolume ? html`<div class="lbl">${lblVolume}</div>` : nothing}
          <div class="vol-wrap">
            <div class="vol-btn" @click=${() => this.volStep(-0.02)}>
              <ha-icon icon="mdi:minus"></ha-icon>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              .value=${String(this._volume)}
              @input=${this.onSlider}
            />
            <div class="vol-btn" @click=${() => this.volStep(0.02)}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </div>
            <div
              class="vol-btn ${this._muted ? "muted" : ""}"
              @click=${this.toggleMute}
            >
              <ha-icon icon=${this._muted ? "mdi:volume-off" : "mdi:volume-high"}></ha-icon>
            </div>
          </div>
        ` : nothing}

      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      .remote {
        padding: 16px;
      }
      .top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .power-btn {
        cursor: pointer;
      }
      .power-btn.on {
        color: var(--primary-color);
      }
      .power-btn.off {
        color: var(--disabled-text-color);
      }
      .top-title {
        font-weight: bold;
      }
      .lbl {
        text-align: center;
        margin-bottom: 8px;
        text-transform: uppercase;
        font-size: 0.8em;
        color: var(--secondary-text-color);
      }
      .pad {
        position: relative;
        width: 160px;
        height: 160px;
        margin: 20px auto;
      }
      .arr {
        position: absolute;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .arr.u { top: 0; left: 60px; width: 40px; height: 40px; }
      .arr.d { bottom: 0; left: 60px; width: 40px; height: 40px; }
      .arr.l { top: 60px; left: 0; width: 40px; height: 40px; }
      .arr.r { top: 60px; right: 0; width: 40px; height: 40px; }
      .ok {
        position: absolute;
        top: 50px;
        left: 50px;
        width: 60px;
        height: 60px;
        background: var(--primary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-weight: bold;
      }
      .btn-row {
        display: flex;
        justify-content: space-around;
        margin: 15px 0;
      }
      .btn {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 0.9em;
      }
      .app-row {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        margin: 10px 0;
        padding: 0 10px;
        flex-wrap: wrap;
      }
      .app-row ha-icon-button {
        color: var(--primary-text-color);
        background-color: var(--secondary-background-color);
        border-radius: 50%;
        --mdc-icon-button-size: 44px;
      }
      .app-row ha-icon-button:active {
        background-color: var(--divider-color);
      }
      .hr {
        height: 1px;
        background-color: var(--divider-color);
        margin: 10px 0;
      }
      .vol-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }
      .vol-btn {
        cursor: pointer;
      }
      .vol-btn.muted {
        color: var(--error-color);
      }
      input[type="range"] {
        flex: 1;
      }
    `;
  }
}
