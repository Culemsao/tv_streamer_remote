export interface AppConfig {
  name: string;
  icon?: string;
  id: string; // Bijv. 'netflix', 'nlziet'
  activity: string; // Bijv. 'netflix://'
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
  label_navigation?: string;
  label_volume?: string;
  apps?: (string | AppConfig)[]; // Staat de app-lijst toe in Lovelace
}
