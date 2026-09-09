import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { RemoteCardConfig, AppConfig } from './types';

// Vooraf gedefinieerde app-lijst met URL-schema's, icons én officiële Android Package IDs
const DEFAULT_APPS: Record<string, { name: string; activity: string; icon: string; packageId: string }> = { 
  netflix: { name: 'Netflix', activity: 'netflix://', icon: 'mdi:netflix', packageId: 'com.netflix.ninja' }, 
  nlziet: { name: 'NLZIET', activity: 'nlziet://', icon: 'mdi:television-play', packageId: 'nl.streamone.nlziet' }, 
  spotify: { name: 'Spotify', activity: 'spotify://', icon: 'mdi:spotify', packageId: 'com.spotify.tv.android' }, 
  youtube: { name: 'YouTube', activity: 'youtube.com', icon: 'mdi:youtube', packageId: 'com.google.android.youtube.tv' }, 
  videoland: { name: 'Videoland', activity: 'videoland-v2://', icon: 'mdi:play-box', packageId: 'nl.rtl.videoland.androidtv' }, 
  disneyplus: { name: 'Disney+', activity: 'disneyplus.com', icon: 'mdi:television-classic', packageId: 'com.disney.disneyplus' }, 
  primevideo: { name: 'Prime Video', activity: 'primevideo.com', icon: 'mdi:video', packageId: 'com.amazon.amazonvideo.livingroom' }, 
  viaplay: { name: 'Viaplay', activity: 'viaplay://', icon: 'mdi:sports-car', packageId: 'com.viaplay.android' }, 
  max: { name: 'Max (HBO)', activity: 'max.com', icon: 'mdi:movie-roll', packageId: 'com.wbd.stream' }, 
  plex: { name: 'Plex', activity: 'plex://', icon: 'mdi:plex', packageId: 'com.plexapp.android' }, 
  kodi: { name: 'Kodi', activity: 'kodi://', icon: 'mdi:kodi', packageId: 'org.xbmc.kodi' }, 
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

  private _launchApp(activity: string): void { 
    if (!this.config || !this.hass) return; 
    
    this.hass.callService('remote', 'turn_on', { 
      entity_id: this.config.remote_entity, 
      activity: activity 
    }); 
  } 

  private get _isOn(): boolean { 
    const remoteState = this.hass?.states[this.config.remote_entity]?.state;
    return remoteState === "on";
  } 

  private get _currentActivity(): string {
    const remoteState = this.hass?.states[this.config.remote_entity];
    return remoteState?.attributes?.current_activity || "";
  }

  private togglePower() { 
    if (!this.config || !this.hass) return; 
    this.hass.callService('remote', 'toggle', { 
      entity_id: this.config.remote_entity 
    }); 
  } 

  private sendKey(key: string) { 
    if (!this.config || !this.hass) return; 
    this.hass.callService('remote', 'send_command', { 
      entity_id: this.config.remote_entity, 
      command: key 
    }); 
  } 

  private volStep(step: number) { 
    if (!this.config || !this.hass) return; 
    const entity = this.config.volume_entity ?? this.config.media_entity; 
    let newVol = this._volume + step; 
    if (newVol > 1) newVol = 1; 
    if (newVol < 0) newVol = 0; 
    this.hass.callService('media_player', 'volume_set', { 
      entity_id: entity, 
      volume_level: newVol 
    }); 
  } 

  private onSlider(e: any) { 
    if (!this.config || !this.hass) return; 
    const entity = this.config.volume_entity ?? this.config.media_entity; 
    const newVol = parseFloat(e.target.value); 
    this.hass.callService('media_player', 'volume_set', { 
      entity_id: entity, 
      volume_level: newVol 
    }); 
  } 

  private toggleMute() { 
    if (!this.config || !this.hass) return; 
    const entity = this.config.volume_entity ?? this.config.media_entity; 
    this.hass.callService('media_player', 'volume_mute', { 
      entity_id: entity, 
      is_volume_muted: !this._muted 
    }); 
  } 

  render() { 
    const cfg = this.config; 
    const showTitle            = cfg.show_title            !== false; 
    const showNavigation       = cfg.show_navigation       !== false; 
    const showButtons          = cfg.show_buttons          !== false; 
    const showApps             = cfg.show_apps             !== false; 
    const showVolume           = cfg.show_volume           !== false; 
    const showLabelNavigation  = cfg.show_label_navigation  !== false;
    const showLabelVolume      = cfg.show_label_volume      !== false;
    const showButtonLabels     = cfg.show_button_labels     !== false;

    const lblNavigation  = cfg.label_navigation ?? "navigatie"; 
    const lblVolume      = cfg.label_volume     ?? "volume"; 
    const isOn           = this._isOn; 
    const currentAct     = this._currentActivity.toLowerCase(); 
    const configuredApps = cfg?.apps || ['netflix', 'nlziet', 'spotify']; 

    return html`
      <div class="remote">

        <div class="top-row">
          <div class="power-btn ${isOn ? "active" : ""}" @click=${this.togglePower} title=${isOn ? "Turn off" : "Turn on"}>
            <ha-icon icon="mdi:power"></ha-icon>
          </div>
          ${showTitle && cfg.title ? html`
            <div class="top-title">${cfg.title}</div>
          ` : html`<div class="top-title"></div>`}
          <div class="top-spacer"></div>
        </div>

        ${showNavigation ? html`
          ${showLabelNavigation && lblNavigation ? html`<div class="lbl">${lblNavigation}</div>` : nothing}
          <div class="pad">
            <div class="arr u" @click=${() => this.sendKey("DPAD_UP")}>
              <div class="icon-wrap">
                <ha-icon icon="mdi:chevron-up"></ha-icon>
              </div>
            </div>
            <div class="arr d" @click=${() => this.sendKey("DPAD_DOWN")}>
              <div class="icon-wrap">
                <ha-icon icon="mdi:chevron-down"></ha-icon>
              </div>
            </div>
            <div class="arr l" @click=${() => this.sendKey("DPAD_LEFT")}>
              <div class="icon-wrap">
                <ha-icon icon="mdi:chevron-left"></ha-icon>
              </div>
            </div>
            <div class="arr r" @click=${() => this.sendKey("DPAD_RIGHT")}>
              <div class="icon-wrap">
                <ha-icon icon="mdi:chevron-right"></ha-icon>
              </div>
            </div>
            <div class="ok" @click=${() => this.sendKey("DPAD_CENTER")}>ok</div>
          </div>
        ` : nothing}

        ${showButtons ? html`
          <div class="hr"></div>
          <div class="btn-row">
            <div class="btn ${!showButtonLabels ? 'no-label' : ''}" @click=${() => this.sendKey("BACK")}>
              <ha-icon icon="mdi:arrow-u-left-top"></ha-icon>
              ${showButtonLabels ? html`<span>terug</span>` : nothing}
            </div>
            <div class="btn ${!showButtonLabels ? 'no-label' : ''}" @click=${() => this.sendKey("HOME")}>
              <ha-icon icon="mdi:home"></ha-icon>
              ${showButtonLabels ? html`<span>home</span>` : nothing}
            </div>
          </div>
        ` : nothing}

        <!-- APPS BALK (Volledig optioneel via show_apps) -->
        ${showApps ? html`
          <div class="hr"></div>
          <div class="app-row">
            ${configuredApps.map((appKeyOrObj: string | any) => { 
              let name = ''; 
              let activity = ''; 
              let icon = 'mdi:apps'; 
              let packageId = '';

              if (typeof appKeyOrObj === 'string' && DEFAULT_APPS[appKeyOrObj]) { 
                name = DEFAULT_APPS[appKeyOrObj].name; 
                activity = DEFAULT_APPS[appKeyOrObj].activity; 
                icon = DEFAULT_APPS[appKeyOrObj].icon; 
                packageId = DEFAULT_APPS[appKeyOrObj].packageId;
              } else if (typeof appKeyOrObj === 'object') { 
                const appId = appKeyOrObj.id || '';
                const defaultApp = appId && DEFAULT_APPS[appId] ? DEFAULT_APPS[appId] : null;
                
                name = appKeyOrObj.name || defaultApp?.name || appId || ''; 
                activity = appKeyOrObj.activity || defaultApp?.activity || ''; 
                icon = appKeyOrObj.icon || defaultApp?.icon || 'mdi:apps'; 
                packageId = appKeyOrObj.packageId || defaultApp?.packageId || '';
              } 

              if (!activity && !packageId) return html``; 

              const isActive = isOn && (
                               (packageId && currentAct.includes(packageId.toLowerCase())) ||
                               (activity && currentAct.includes(activity.toLowerCase())) ||
                               (typeof appKeyOrObj === 'string' && currentAct.includes(appKeyOrObj.toLowerCase())) ||
                               (typeof appKeyOrObj === 'object' && appKeyOrObj.id && currentAct.includes(appKeyOrObj.id.toLowerCase()))
                               );

              return html`
                <ha-icon-button 
                  class="${isActive ? 'active' : ''}" 
                  .title="${name}" 
                  @click="${() => this._launchApp(activity)}"
                >
                  <ha-icon icon="${icon}"></ha-icon>
                </ha-icon-button>
              `; 
            })}
          </div>
        ` : nothing}      

        <!-- VOLUME SECTIE (Volledig optioneel via show_volume) -->
        ${showVolume ? html`
          <div class="hr"></div>
          ${showLabelVolume && lblVolume ? html`<div class="lbl">${lblVolume}</div>` : nothing}
          <div class="vol-wrap">
            <div class="vol-btn" @click=${() => this.volStep(-0.02)}>
              <ha-icon icon="mdi:minus"></ha-icon>
            </div>
            <input type="range" min="0" max="1" step="0.02" .value=${String(this._volume)} @input=${this.onSlider}/>
            <div class="vol-btn" @click=${() => this.volStep(0.02)}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </div>
            <div class="vol-btn ${this._muted ? "muted" : ""}" @click=${this.toggleMute}>
              <ha-icon icon=${this._muted ? "mdi:volume-off" : "mdi:volume-high"}></ha-icon>
            </div>
          </div>
        ` : nothing}

      </div>
    `; 
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
      transition: background 0.1s, transform 0.1s, color 0.1s;
      -webkit-tap-highlight-color: transparent;
      --mdc-icon-size: 20px;
      color: #aaa;
    }
    .power-btn:active {
      transform: scale(0.92);
      background: #f0f0f0;
    }
    .power-btn.active {
      border-color: #2ecc71;
      background-color: #2ecc71;
      color: #fff;
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
    .btn.no-label {
      height: 48px;
      border-radius: 12px;
    }
    .btn ha-icon {
      --mdc-icon-size: 26px;
      color: #666;
    }

    /* App row styling */
    .app-row {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin: 5px 0;
      padding: 0 10px;
      flex-wrap: wrap;
    }
    .app-row ha-icon-button {
      color: #666;
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 50%;
      --mdc-icon-button-size: 48px;
      --mdc-icon-size: 26px;
      transition: transform 0.1s, background-color 0.1s, color 0.1s;
    }
    .app-row ha-icon-button:active {
      transform: scale(0.92);
      background-color: #f0f0f0;
    }
    .app-row ha-icon-button.active {
      background-color: #2980b9;
      border-color: #2980b9;
      color: #fff;
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
