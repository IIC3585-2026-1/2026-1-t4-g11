export interface Vault {
  name: string;
  notes: VaultNote[];
}

export interface VaultNote {
  id: string;
  name: string;
  contents: string;
}
