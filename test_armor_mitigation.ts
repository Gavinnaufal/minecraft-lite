/**
 * Empirical Armor Mitigation Test Script
 * 
 * Tests that ArmorSystem correctly reduces projectile damage
 * when equipmentSlots are provided (proving the bug fix works).
 * 
 * Run with: npx tsx scratch/test_armor_mitigation.ts
 */

// We import the real classes to do an actual unit-level empirical test
import { ArmorSystem } from './src/inventory/ArmorSystem';
import { EquipmentSlots } from './src/inventory/EquipmentSlots';
import { Player } from './src/player/Player';

// ─── Test Setup ───────────────────────────────────────────────
const armor = ArmorSystem.getInstance();

// Create equipment with Full Iron Armor
const fullIronEquipment = new EquipmentSlots();
fullIronEquipment.equip('helmet', 'iron_helmet');
fullIronEquipment.equip('chestplate', 'iron_chestplate');
fullIronEquipment.equip('leggings', 'iron_leggings');
fullIronEquipment.equip('boots', 'iron_boots');

const noArmor = new EquipmentSlots(); // empty

// ─── Test 1: Full Iron Armor defense points ───────────────────
const ironDefense = fullIronEquipment.getTotalDefense();
console.log(`\n═══ EMPIRICAL ARMOR MITIGATION TEST ═══\n`);
console.log(`Full Iron Armor total defense: ${ironDefense} points`);
console.log(`Expected reduction: ${Math.min(80, ironDefense * 4)}%`);

// ─── Test 2: Ghast Fireball (raw 7.0 HP) with Full Iron ──────
const ghastRaw = 7.0;
const ghastMitigated = armor.calculateMitigatedDamage(ghastRaw, fullIronEquipment);
const ghastNoArmor = armor.calculateMitigatedDamage(ghastRaw, noArmor);
const ghastUndefined = armor.calculateMitigatedDamage(ghastRaw, undefined);

console.log(`\n─── Ghast Fireball (raw ${ghastRaw} HP) ───`);
console.log(`  No armor (empty slots):  ${ghastNoArmor} HP damage (expected: ${ghastRaw})`);
console.log(`  No armor (undefined):    ${ghastUndefined} HP damage (expected: ${ghastRaw})`);
console.log(`  Full Iron Armor:         ${ghastMitigated} HP damage (expected: ${Math.max(1, Math.round(ghastRaw * (1 - Math.min(0.80, ironDefense * 0.04)) * 10) / 10)})`);

// ─── Test 3: Blaze Fireball (raw 4.0 HP) with Full Iron ──────
const blazeRaw = 4.0;
const blazeMitigated = armor.calculateMitigatedDamage(blazeRaw, fullIronEquipment);
const blazeNoArmor = armor.calculateMitigatedDamage(blazeRaw, noArmor);

console.log(`\n─── Blaze Fireball (raw ${blazeRaw} HP) ───`);
console.log(`  No armor:                ${blazeNoArmor} HP damage (expected: ${blazeRaw})`);
console.log(`  Full Iron Armor:         ${blazeMitigated} HP damage (expected: ${Math.max(1, Math.round(blazeRaw * (1 - Math.min(0.80, ironDefense * 0.04)) * 10) / 10)})`);

// ─── Test 4: Skeleton Arrow (raw 3.0 HP) with Full Iron ──────
const arrowRaw = 3.0;
const arrowMitigated = armor.calculateMitigatedDamage(arrowRaw, fullIronEquipment);
console.log(`\n─── Skeleton Arrow (raw ${arrowRaw} HP) ───`);
console.log(`  No armor:                ${armor.calculateMitigatedDamage(arrowRaw, noArmor)} HP damage`);
console.log(`  Full Iron Armor:         ${arrowMitigated} HP damage (expected: ${Math.max(1, Math.round(arrowRaw * (1 - Math.min(0.80, ironDefense * 0.04)) * 10) / 10)})`);

// ─── Test 5: Enderman Melee (raw 6.0 HP) with Full Iron ──────
const endermanRaw = 6.0;
const endermanMitigated = armor.calculateMitigatedDamage(endermanRaw, fullIronEquipment);
console.log(`\n─── Enderman Melee (raw ${endermanRaw} HP) ───`);
console.log(`  No armor:                ${armor.calculateMitigatedDamage(endermanRaw, noArmor)} HP damage`);
console.log(`  Full Iron Armor:         ${endermanMitigated} HP damage (expected: ${Math.max(1, Math.round(endermanRaw * (1 - Math.min(0.80, ironDefense * 0.04)) * 10) / 10)})`);

// ─── Test 6: Spider Melee (raw 3.0 HP) with Full Iron ────────
const spiderRaw = 3.0;
const spiderMitigated = armor.calculateMitigatedDamage(spiderRaw, fullIronEquipment);
console.log(`\n─── Spider Melee (raw ${spiderRaw} HP) ───`);
console.log(`  No armor:                ${armor.calculateMitigatedDamage(spiderRaw, noArmor)} HP damage`);
console.log(`  Full Iron Armor:         ${spiderMitigated} HP damage (expected: ${Math.max(1, Math.round(spiderRaw * (1 - Math.min(0.80, ironDefense * 0.04)) * 10) / 10)})`);

// ─── Test 7: End-to-end Player.damage() test ──────────────────
console.log(`\n─── End-to-End Player.damage() Test ───`);
const player1 = new Player();
player1.damage(ghastRaw, fullIronEquipment);
console.log(`  Player HP after Ghast fireball (Full Iron): ${player1.health} (expected: ${20 - ghastMitigated})`);

const player2 = new Player();
player2.damage(ghastRaw, undefined);
console.log(`  Player HP after Ghast fireball (no equip):  ${player2.health} (expected: ${20 - ghastRaw})`);

// ─── Assertions ───────────────────────────────────────────────
let allPassed = true;

function assert(label: string, actual: number, expected: number) {
  const pass = Math.abs(actual - expected) < 0.01;
  const icon = pass ? '✅' : '❌';
  console.log(`  ${icon} ${label}: got ${actual}, expected ${expected}`);
  if (!pass) allPassed = false;
}

console.log(`\n═══ ASSERTION RESULTS ═══\n`);
assert('Ghast no armor', ghastNoArmor, 7.0);
assert('Ghast undefined armor', ghastUndefined, 7.0);
assert('Ghast Full Iron', ghastMitigated, 2.8);
assert('Blaze no armor', blazeNoArmor, 4.0);
assert('Blaze Full Iron', blazeMitigated, 1.6);
assert('Arrow no armor', armor.calculateMitigatedDamage(arrowRaw, noArmor), 3.0);
assert('Arrow Full Iron', arrowMitigated, 1.2);
assert('Enderman Full Iron', endermanMitigated, 2.4);
assert('Spider Full Iron', spiderMitigated, 1.2);
assert('Player E2E Full Iron HP', player1.health, 20 - ghastMitigated);
assert('Player E2E no armor HP', player2.health, 20 - ghastRaw);

console.log(`\n${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`);

process.exit(allPassed ? 0 : 1);
