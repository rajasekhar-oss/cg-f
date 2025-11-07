import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { WaitingRoomComponent } from '../pages/gang-play/waiting-room.component';

@Injectable({ providedIn: 'root' })
export class LeaveRoomGuard implements CanDeactivate<WaitingRoomComponent> {
  canDeactivate(component: WaitingRoomComponent, currentRoute: any, currentState: any, nextState?: any): Promise<boolean> | boolean {
    if (component.roomEnded) return true;
    // Use the component's own modal logic for leave/end
    const nextUrl = nextState && nextState.url ? nextState.url : undefined;
    return component.showLeaveOrEndRoomModal(nextUrl);
  }
}
