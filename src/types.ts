export interface AppConfig {
  name: string;
  icon?: string;
  id: string;
  activity: string;
}

export interface RemoteCardConfig {
  remote_entity: string;
  media_entity: string;
  volume_entity?: string;
  title?: string;
  show_title?: boolean;
  show_navigation?: boolean;
  show_buttons?: boolean;
  show_apps?: boolean;
  show_volume?: boolean;
  show_label_navigation?: boolean; // NIEUW
  show_label_volume?: boolean;     // NIEUW
  show_button_labels?: boolean;    // NIEUW
  label_navigation?: string;
  label_volume?: string;
  apps?: (string | AppConfig)[];
}
