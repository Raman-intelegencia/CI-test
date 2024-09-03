import { Injectable } from '@angular/core';
import { AccountAssociationsService } from './account-association-helper.service';

@Injectable({
  providedIn: 'root'
})
export class UserSessionService {
    private timeoutDuration!: number; // Stores the duration after which to log out the user, in milliseconds.
    private logoutTimer: ReturnType<typeof setTimeout> | null = null; // A reference to the logout timer.
    private userId = ""; // Stores the current user's ID.
    private activityDetected = false; // Tracks if activity has been detected since the last visibility change.
  
    constructor(
      private accountAssociationSvc: AccountAssociationsService, // Injected service to handle account associations.
    ){}
  
    /**
     * Initializes the user session service with a specific user and timeout duration.
     * @param userId The ID of the user for whom the session is being tracked.
     * @param timeoutDuration The duration of user inactivity (in seconds) after which to log out the user.
     */
    public initialize(userId: string, timeoutDuration: number): void {
      this.userId = userId;
      this.timeoutDuration = timeoutDuration * 1000; // Convert timeoutDuration to milliseconds.
      this.startMonitoring();
    }
  
    /**
     * Starts monitoring for user activity and tab visibility changes.
     */
    private startMonitoring(): void {
      this.setupActivityListeners();
      document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }
  
    /**
     * Sets up listeners for various user activity events to reset the inactivity timer.
     */
    private setupActivityListeners(): void {
      const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, () => {
          if (!this.activityDetected && document.visibilityState === 'visible') {
            this.activityDetected = true;
            this.resetTimer();
          }
        });
      });
    }
  
    /**
     * Handles changes in tab visibility, starting or resetting the logout timer as appropriate.
     */
    private handleVisibilityChange(): void {
      if (document.visibilityState === 'hidden') {
        this.startLogoutTimer();
      } else {
        // When tab becomes visible again, reset the activity flag to allow timer reset on next activity
        this.activityDetected = false;
        this.resetTimer();
      }
    }
  
    /**
     * Starts or restarts the logout timer based on the timeoutDuration.
     */
    private startLogoutTimer(): void {
      this.clearLogoutTimer(); // Ensure there's only one timer running.
      this.logoutTimer = setTimeout(() => {
        this.logoutUser();
      }, this.timeoutDuration);
    }
  
    /**
     * Resets the logout timer when user activity is detected or the tab becomes visible again.
     */
    private resetTimer(): void {
      if (document.visibilityState === 'visible') {
        this.startLogoutTimer();
      }
    }
  
    /**
     * Clears the logout timer, if it exists.
     */
    private clearLogoutTimer(): void {
      if (this.logoutTimer) {
        clearTimeout(this.logoutTimer);
        this.logoutTimer = null;
      }
    }
  
    /**
     * Logs out the user using the AccountAssociationsService.
     */
    private logoutUser(): void {
      if (!this.userId) {
        console.warn('Error: No user id found');
        return;
      }
      // Logs out the user by their ID, handling the session termination and cleanup.
      this.accountAssociationSvc.explicitlyLogoutRemovedUser(this.userId);
    }
  }
