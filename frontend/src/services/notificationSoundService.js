class NotificationSoundService {
  constructor() {
    this.audioContext = null;
    this.isEnabled = localStorage.getItem('notification_sounds_enabled') !== 'false';
    this.volume = parseFloat(localStorage.getItem('notification_volume') || '0.7');
    this.ringingInterval = null;
    this.isRinging = false;
    this.initAudioContext();
  }

  async initAudioContext() {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.warn('Audio context initialization failed:', error);
    }
  }

  async playNotificationSound(type = 'default') {
    if (!this.isEnabled || !this.audioContext) {
      return;
    }

    try {
      await this.initAudioContext();
      
      switch (type) {
        case 'video_call_request':
          await this.playVideoCallSound();
          break;
        case 'urgent':
          await this.playUrgentSound();
          break;
        case 'success':
          await this.playSuccessSound();
          break;
        default:
          await this.playDefaultSound();
      }
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  async playVideoCallSound() {
    // Create a pleasant notification sound for video calls
    const duration = 0.8;
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Pleasant bell-like sound
    oscillator1.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.1);
    
    oscillator2.frequency.setValueAtTime(1200, this.audioContext.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(1400, this.audioContext.currentTime + 0.1);

    // Envelope for smooth attack and decay
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator1.type = 'sine';
    oscillator2.type = 'sine';

    oscillator1.start(this.audioContext.currentTime);
    oscillator2.start(this.audioContext.currentTime);
    
    oscillator1.stop(this.audioContext.currentTime + duration);
    oscillator2.stop(this.audioContext.currentTime + duration);

    // Add a second tone for emphasis
    setTimeout(() => {
      this.playSecondTone();
    }, 300);
  }

  async playSecondTone() {
    if (!this.isEnabled || !this.audioContext) return;

    const duration = 0.6;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.25, this.audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.type = 'triangle';
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  async playUrgentSound() {
    // Urgent beeping sound
    const beepCount = 3;
    const beepDuration = 0.15;
    const pauseDuration = 0.1;

    for (let i = 0; i < beepCount; i++) {
      setTimeout(async () => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, this.audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + beepDuration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + beepDuration);
      }, i * (beepDuration + pauseDuration) * 1000);
    }
  }

  async playSuccessSound() {
    // Success chime
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);

    oscillator.type = 'triangle';
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.8);
  }

  async playDefaultSound() {
    // Simple notification beep
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    localStorage.setItem('notification_sounds_enabled', enabled.toString());
  }

  isNotificationEnabled() {
    return this.isEnabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('notification_volume', this.volume.toString());
  }

  getVolume() {
    return this.volume;
  }

  // Continuous ringing functionality
  async startRinging(type = 'video_call_request') {
    if (!this.isEnabled || this.isRinging) {
      return;
    }

    this.isRinging = true;
    
    // Play initial sound immediately
    await this.playNotificationSound(type);

    // Set up continuous ringing every 3 seconds
    this.ringingInterval = setInterval(async () => {
      if (this.isEnabled && this.isRinging) {
        await this.playNotificationSound(type);
      }
    }, 3000);
  }

  stopRinging() {
    if (this.ringingInterval) {
      clearInterval(this.ringingInterval);
      this.ringingInterval = null;
    }
    this.isRinging = false;
  }

  isCurrentlyRinging() {
    return this.isRinging;
  }

  // Override setEnabled to stop ringing when disabled
  setEnabled(enabled) {
    this.isEnabled = enabled;
    localStorage.setItem('notification_sounds_enabled', enabled.toString());
    
    if (!enabled) {
      this.stopRinging();
    }
  }

  // Test different notification sounds
  async testSound(type = 'video_call_request') {
    await this.playNotificationSound(type);
  }
}

// Create singleton instance
const notificationSoundService = new NotificationSoundService();
export default notificationSoundService;