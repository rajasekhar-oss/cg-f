
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { GameComponent } from '../pages/game/game.component';

@Injectable({ providedIn: 'root' })
export class LeaveGameGuard implements CanDeactivate<GameComponent> {
  canDeactivate(component: GameComponent): Promise<boolean> | boolean {
    if (!component.canLeaveGame || component.gameEnded) return true;
    return new Promise(resolve => {
      const isCreator = component.isAdmin;
      const message = isCreator
        ? 'Do you want to end the game?'
        : 'Do you want to leave the game?';
      const title = isCreator ? 'End Game' : 'Leave Game';
      component.requestLeaveConfirmation(message, title,
        () => {
          if (isCreator) {
            component.endGame();
          } else {
            component.leaveGame();
          }
          resolve(true);
        },
        () => {
          resolve(false);
        }
      );
    });
  }
}
