export interface AppDef {
  name: string;
  scheme: string;
  match: string[];
}

export interface GoogleTVRemoteConfig {
  remote_entity: string;
  media_entity: string;
  volume_entity?: string;
  title?: string;
  show_title?: boolean;
  show_navigation?: boolean;
  show_buttons?: boolean;
  show_apps?: boolean;
  show_volume?: boolean;
  label_navigation?: string;
  label_volume?: string;
  apps?: string[];
}
