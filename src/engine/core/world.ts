import type { EntityId } from '../types';

export class World {
  private nextEntity = 1;
  readonly entities = new Set<EntityId>();

  createEntity(): EntityId {
    const id = this.nextEntity++;
    this.entities.add(id);
    return id;
  }

  destroyEntity(id: EntityId): void {
    this.entities.delete(id);
  }
}
