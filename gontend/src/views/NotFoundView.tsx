import React, { MouseEvent } from 'react';
import Tophat from '../images/tophat.svg';

interface Coord2D {
  x: number;
  y: number;
}

function spring(
  timeStep: number,
  k: number,
  damping: number,
  mass: number,
  gravity: Coord2D,
  anchor: Coord2D,
  position: Coord2D,
  velocity: Coord2D,
): Coord2D {
  // https://www.khanacademy.org/partner-content/pixar/simulation/hair-simulation-code/p/step-4-2d-spring-mass-system
  const springForceY = -k * (position.y - anchor.y);
  const springForceX = -k * (position.x - anchor.x);

  const forceY = springForceY + mass * gravity.y - damping * velocity.y;
  const forceX = springForceX + mass * gravity.x - damping * velocity.x;

  const accelerationY = forceY / mass;
  const accelerationX = forceX / mass;

  return {
    y: velocity.y + accelerationY * timeStep,
    x: velocity.x + accelerationX * timeStep,
  };
}

export default class NotFoundView extends React.Component {
  private mainViewRef: React.RefObject<HTMLDivElement> = React.createRef();
  private hatRef: React.RefObject<HTMLImageElement> = React.createRef();
  private updateTimer?: number;
  private readonly gravity: Coord2D = { x: 0, y: 10 };
  private hatCoord: Coord2D = { x: 0, y: 0 };
  private hatSpeed: Coord2D = { x: 0, y: 0 };
  private sparks: Coord2D[] = [];
  private lastUpdate: number = 0;
  private mouseCoord?: Coord2D;
  private didInit: boolean = false;

  public componentDidMount(): void {
    this.updateTimer = window.setInterval(this.updateAction, 20);
  }

  public componentWillUnmount(): void {
    window.clearInterval(this.updateTimer);
  }

  private updateAction = () => {
    const mainView = this.mainViewRef.current!;
    const width = mainView.offsetWidth;
    const height = mainView.offsetHeight;

    if (!this.didInit) {
      this.didInit = true;
      this.hatCoord.x = width / 2;
      this.hatCoord.y = height / 2;
      this.lastUpdate = +new Date();
      return;
    }
    const now = +new Date();
    const delta = Math.min((now - this.lastUpdate) / 1000, 1);
    this.lastUpdate = now;

    const { mouseCoord, hatCoord } = this;
    if (!mouseCoord) {
      return;
    }
    this.hatSpeed = spring(delta * 2, 5, 10, 30, this.gravity, mouseCoord, hatCoord, this.hatSpeed);
    hatCoord.x += this.hatSpeed.x;
    hatCoord.y += this.hatSpeed.y;
    this.sparks.push({ x: hatCoord.x, y: hatCoord.y });
    while (this.sparks.length > 100) {
      this.sparks.shift();
    }
    this.forceUpdate();
  };

  private getMouseCoords = (event: MouseEvent<HTMLDivElement>) => {
    this.mouseCoord = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  public render() {
    return (
      <div className="NotFound-view" ref={this.mainViewRef} onMouseMove={this.getMouseCoords}>
        {this.sparks.map(({ x, y }, i) => (
          <div
            className="spark"
            key={i}
            style={{
              transform: `translate(${x - 8}px, ${y - 8}px) scale(${i / this.sparks.length})`,
            }}
          />
        ))}
        <img
          src={Tophat}
          width={32}
          height={32}
          style={{ transform: `translate(${this.hatCoord.x - 16}px, ${this.hatCoord.y - 16}px)` }}
        />
      </div>
    );
  }
}
