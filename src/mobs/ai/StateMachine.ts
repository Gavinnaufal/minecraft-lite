export enum State {
  Idle,
  Wander,
  Chase,
  Attack,
}

export class StateMachine {
  current = State.Idle;
  private timer = 0;

  update(deltaTime: number, distanceToPlayer: number, detectRadius = 35): State {
    this.timer += deltaTime;

    if (distanceToPlayer < detectRadius) {
      if (distanceToPlayer < 1.8) return State.Attack;
      return State.Chase;
    }

    if (this.current === State.Idle && this.timer > 3) {
      this.timer = 0;
      return State.Wander;
    }

    if (this.current === State.Wander && this.timer > 5) {
      this.timer = 0;
      return State.Idle;
    }

    return this.current;
  }
}
