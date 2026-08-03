import * as THREE from 'three';
import type { Mob } from '../Mob';
import type { MobManager } from '../MobManager';
import { Cow } from '../passive/Cow';
import { Pig } from '../passive/Pig';
import { Chicken } from '../passive/Chicken';
import { Goat } from '../passive/Goat';
import { Turtle } from '../passive/Turtle';
import { ToastSystem } from '../../ui/ToastSystem';
import { AudioManager } from '../../audio/AudioManager';
import type { ParticleSystem } from '../../world/ParticleSystem';

export class BreedingManager {
  private static instance: BreedingManager;
  private particleSystem: ParticleSystem | null = null;
  public static readonly TARGET_GROWTH_TIME = 60; // 60 seconds to grow from baby to adult
  public static readonly PARENT_BREEDING_COOLDOWN = 300; // 5-minute breeding cooldown

  static getInstance(): BreedingManager {
    if (!BreedingManager.instance) {
      BreedingManager.instance = new BreedingManager();
    }
    return BreedingManager.instance;
  }

  setParticleSystem(particleSystem: ParticleSystem): void {
    this.particleSystem = particleSystem;
  }

  createBabyMob(parent: Mob, position: THREE.Vector3): Mob | null {
    let baby: Mob | null = null;
    if (parent instanceof Cow) baby = new Cow(position);
    else if (parent instanceof Pig) baby = new Pig(position);
    else if (parent instanceof Chicken) baby = new Chicken(position);
    else if (parent instanceof Goat) baby = new Goat(position);
    else if (parent instanceof Turtle) baby = new Turtle(position);

    if (baby) {
      baby.isBaby = true;
      baby.growthTimer = 0;
      baby.mesh.scale.set(0.5, 0.5, 0.5);
    }
    return baby;
  }

  update(deltaTime: number, mobs: Mob[], mobManager: MobManager): void {
    // 1. Update Baby Mob Growth Interpolation (CP-260 & CP-261)
    for (const mob of mobs) {
      if (mob.isBaby) {
        mob.growthTimer += deltaTime;
        const progress = Math.min(1.0, 0.5 + 0.5 * (mob.growthTimer / BreedingManager.TARGET_GROWTH_TIME));
        mob.mesh.scale.set(progress, progress, progress);

        if (mob.growthTimer >= BreedingManager.TARGET_GROWTH_TIME) {
          mob.isBaby = false;
          mob.mesh.scale.set(1.0, 1.0, 1.0);
          ToastSystem.getInstance().show(`✨ ${mob.constructor.name} telah tumbuh dewasa!`, 'info');
        }
      }
    }

    // 2. Pair Detection for Mobs in Love Mode (CP-259 & CP-262)
    const inLoveMobs = mobs.filter((m) => m.isInLove() && !m.isBaby);

    for (let i = 0; i < inLoveMobs.length; i++) {
      for (let j = i + 1; j < inLoveMobs.length; j++) {
        const mobA = inLoveMobs[i];
        const mobB = inLoveMobs[j];

        // Must be same species
        if (mobA.constructor !== mobB.constructor) continue;

        // Check proximity (< 3.5 blocks)
        if (mobA.position.distanceTo(mobB.position) < 3.5) {
          // Reset love timers & apply 5-minute breeding cooldown
          mobA.loveTimer = 0;
          mobB.loveTimer = 0;
          mobA.breedingCooldown = BreedingManager.PARENT_BREEDING_COOLDOWN;
          mobB.breedingCooldown = BreedingManager.PARENT_BREEDING_COOLDOWN;

          // Spawn baby at midpoint
          const midpoint = mobA.position.clone().add(mobB.position).multiplyScalar(0.5);
          const baby = this.createBabyMob(mobA, midpoint);

          if (baby) {
            mobManager.addMob(baby);

            if (this.particleSystem) {
              this.particleSystem.spawnHeartParticles(midpoint.clone().add(new THREE.Vector3(0, 0.8, 0)));
            }
            AudioManager.getInstance().playSFX('pop');
            ToastSystem.getInstance().show(`🐣 Baby ${mobA.constructor.name} telah lahir!`, 'success');
          }
        }
      }
    }
  }
}
