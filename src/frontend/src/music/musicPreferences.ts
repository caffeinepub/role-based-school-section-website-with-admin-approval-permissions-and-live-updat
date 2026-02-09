// localStorage helpers for background music preferences

export interface MusicPreferences {
  enabled: boolean;
  muted: boolean;
}

const STORAGE_KEY = 'backgroundMusicPreferences';

const DEFAULT_PREFERENCES: MusicPreferences = {
  enabled: false,
  muted: true,
};

export function loadMusicPreferences(): MusicPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    
    const parsed = JSON.parse(stored);
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_PREFERENCES.enabled,
      muted: typeof parsed.muted === 'boolean' ? parsed.muted : DEFAULT_PREFERENCES.muted,
    };
  } catch (error) {
    console.error('Failed to load music preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

export function saveMusicPreferences(preferences: MusicPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save music preferences:', error);
  }
}
