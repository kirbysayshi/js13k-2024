import { CanvasCameraMan } from './camera-canvas-man';

type EntityId = { id: number; owned: boolean; destroyed: boolean };

class EntityIdManager {
  private lastId = 0;
  private entityIds: EntityId[] = [];

  createEntityId() {
    const id = ++this.lastId;
    const e = { id, owned: true, destroyed: false };
    this.entityIds.push(e);
    return e;
  }

  destroyEntityId(eid: EntityId) {
    eid.destroyed = true;
    const idx = this.entityIds.findIndex((e) => e.id === eid.id);
    if (idx === -1) return;
    // TODO: consider the swap trick, depending on whether there is display list
    // sorting
    this.entityIds.splice(idx, 1);
  }

  destroy() {
    for (const e of this.entityIds) {
      this.destroyEntityId(e);
    }
  }
}

export interface Updatable {
  update?(dt: number): void;
}

export interface Destroyable {
  destroy?(): void;
}

export interface Drawable {
  draw?(interp: number, vp: CanvasCameraMan): void;
}

export interface Initable {
  init?(): void;
}

export interface Entity {
  update?(dt: number): void;
  draw?(interp: number, vp: CanvasCameraMan): void;
}

export abstract class Entity
  implements Updatable, Destroyable, Drawable, Initable
{
  id;

  constructor(private eman: EntityManager) {
    this.id = eman.eidman.createEntityId();
    eman.register(this);
    this.init();
  }

  destroy() {
    this.eman.eidman.destroyEntityId(this.id);
    this.eman.unregister(this);
  }

  init(): this {
    return this;
  }
}

export class EntityManager<T extends Entity = Entity> {
  private entities: T[] = [];

  eidman = new EntityIdManager();

  register(entity: T) {
    this.entities.push(entity);
  }

  unregister(entity: T) {
    const idx = this.entities.indexOf(entity);
    if (idx === -1) return;
    this.entities.splice(idx, 1);
  }

  update(dt: number) {
    for (const e of this.entities) {
      e.update?.(dt);
    }
  }

  draw(interp: number, vp: CanvasCameraMan) {
    for (const e of this.entities) {
      e.draw?.(interp, vp);
    }
  }

  destroy() {
    for (const e of this.entities) {
      e.destroy?.();
    }
    this.eidman.destroy();
  }
}
