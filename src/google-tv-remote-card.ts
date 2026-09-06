import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

interface RemoteCardConfig {
  remote_entity: string;
  media_entity: string;
  volume_entity?: string;
  title?: string;
  show_title?: boolean;
  show_navigation?: boolean;
  show_buttons?: boolean;
  show_volume?: boolean;
  label_navigation?: string;
  label_volume?: string;
}

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

  private get _isOn(): boolean {
    const state = this.hass?.states[this.config.media_entity];
    return state?.state !== "off" && state?.state !== "unavailable" && state?.state !== undefined;
  }

  static styles = css`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .remote {
      width: 280px;
      margin: 0 auto;
      background: #f5f5f5;
      border-radius: 40px;
      padding: 28px 22px 36px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      font-family: sans-serif;
    }

    .lbl {
      font-size: 10px;
      color: #999;
      text-align: center;
      letter-spacing: 0.08em;
    }

    .hr {
      height: 1px;
      background: #e0e0e0;
      margin: 0 4px;
    }

    /* Top row with power button */
    .top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 34px;
    }
    .power-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: #fff;
      border: 1px solid #ddd;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.1s, transform 0.1s;
      -webkit-tap-highlight-color: transparent;
      --mdc-icon-size: 20px;
      color: #aaa;
    }
    .power-btn:active {
      transform: scale(0.92);
      background: #f0f0f0;
    }
    .power-btn.on {
      border-color: #4CAF5066;
      color: #4CAF50;
    }
    .power-btn.off {
      border-color: #ddd;
      color: #aaa;
    }
    .top-title {
      flex: 1;
      text-align: center;
      font-size: 10px;
      color: #999;
      letter-spacing: 0.08em;
    }
    .top-spacer {
      width: 34px;
      flex-shrink: 0;
    }

    /* D-pad */
    .pad {
      width: 220px;
      height: 220px;
      border-radius: 50%;
      background: #fff;
      border: 1px solid #ddd;
      margin: 0 auto;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    .arr {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .arr.u { top: 0;    left: 50%; transform: translateX(-50%); }
    .arr.d { bottom: 0; left: 50%; transform: translateX(-50%); }
    .arr.l { left: 0;   top: 50%; transform: translateY(-50%); }
    .arr.r { right: 0;  top: 50%; transform: translateY(-50%); }

    .icon-wrap {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      --mdc-icon-size: 28px;
      color: #666;
      transition: background 0.1s, color 0.08s;
    }
    .arr:active .icon-wrap {
      background: #f0f0f0;
      color: #111;
    }

    .ok {
      width: 78px;
      height: 78px;
      border-radius: 50%;
      background: #f0f0f0;
      border: 1px solid #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 500;
      color: #333;
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: background 0.1s;
      -webkit-tap-highlight-color: transparent;
    }
    .ok:active {
      background: #e0e0e0;
      color: #111;
    }

    /* Bottom buttons */
    .btn-row {
      display: flex;
      justify-content: center;
      gap: 16px;
    }
    .btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 18px;
      width: 80px;
      height: 72px;
      cursor: pointer;
      font-size: 11px;
      color: #666;
      transition: transform 0.1s, background 0.1s;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .btn:active {
      transform: scale(0.92);
      background: #f0f0f0;
    }
    .btn ha-icon {
      --mdc-icon-size: 26px;
      color: #666;
    }

    /* Volume */
    .vol-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .vol-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: #fff;
      border: 1px solid #ddd;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.1s, transform 0.1s;
      -webkit-tap-highlight-color: transparent;
      --mdc-icon-size: 18px;
      color: #666;
    }
    .vol-btn:active {
      background: #f0f0f0;
      transform: scale(0.92);
    }
    .vol-btn.muted {
      border-color: #c0392b66;
      color: #c0392b;
    }
    input[type="range"] {
      width: 120px;
      height: 4px;
      accent-color: #378ADD;
      cursor: pointer;
      flex-shrink: 0;
    }
  `;

  private call(service: string, data: any) {
    this.hass.callService(service.split(".")[0], service.split(".")[1], data);
  }

  private sendKey(key: string) {
    this.call("remote.send_command", {
      entity_id: this.config.remote_entity,
      command: key,
    });
  }

  private togglePower() {
    const service = this._isOn ? "media_player.turn_off" : "media_player.turn_on";
    this.call(service, { entity_id: this.config.media_entity });
  }

  private get _volEntity(): string {
    return this.config.volume_entity ?? this.config.media_entity;
  }

  private setVolume(v: number) {
    v = Math.max(0, Math.min(1, Math.round(v * 100) / 100));
    this._volume = v;
    this.call("media_player.volume_set", {
      entity_id: this._volEntity,
      volume_level: v,
    });
  }

  private onSlider(e: Event) {
    this.setVolume(parseFloat((e.target as HTMLInputElement).value));
  }

  private volStep(delta: number) {
    this.setVolume(this._volume + delta);
  }

  private toggleMute() {
    this._muted = !this._muted;
    this.call("media_player.volume_mute", {
      entity_id: this._volEntity,
      is_volume_muted: this._muted,
    });
  }

  render() {
    const cfg = this.config;
    const showTitle      = cfg.show_title      !== false;
    const showNavigation = cfg.show_navigation !== false;
    const showButtons    = cfg.show_buttons    !== false;
    const showVolume     = cfg.show_volume     !== false;
    const lblNavigation  = cfg.label_navigation ?? "navigatie";
    const lblVolume      = cfg.label_volume     ?? "volume";
    const isOn           = this._isOn;

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
}
