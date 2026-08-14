export interface ElectronAPI {
  platform: string;
  onTrafficUpdate: (callback: (data: unknown) => void) => void;
}
