import { Vector2, copy, v2 } from 'pocket-physics';
import { WorldUnitVector2, wv2 } from './camera-2d';

type WorldUnitVector2Integratable = {
  cpos: WorldUnitVector2;
  ppos: WorldUnitVector2;
  acel: WorldUnitVector2;
};

export function makeIntegratable(
  initial = wv2(),
): WorldUnitVector2Integratable {
  return {
    cpos: copy(wv2(), initial),
    ppos: copy(wv2(), initial),
    acel: wv2(),
  };
}
