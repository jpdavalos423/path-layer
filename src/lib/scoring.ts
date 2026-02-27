import type { EdgeModifier, PersonNode } from "@/lib/types";

export const BASE_EDGE_COST = 10;

interface ComputeEdgeCostContext {
  youId: string;
}

export interface EdgeCostResult {
  cost: number;
  modifiers: EdgeModifier[];
}

export function computeEdgeCost(
  from: PersonNode,
  to: PersonNode,
  context: ComputeEdgeCostContext
): EdgeCostResult {
  const modifiers: EdgeModifier[] = [];

  if (from.school && to.school && from.school === to.school) {
    modifiers.push({ type: "same_school", value: -3, reason: `Same school: ${from.school}` });
  }

  const sharedOrgs = from.orgs.filter((org) => to.orgs.includes(org));
  if (sharedOrgs.length > 0) {
    const orgBonus = Math.max(-6, -4 * sharedOrgs.length);
    modifiers.push({
      type: "shared_org",
      value: orgBonus,
      reason: `Shared orgs: ${sharedOrgs.join(", ")}`
    });
  }

  if (from.id === context.youId || to.id === context.youId) {
    modifiers.push({ type: "first_degree_you", value: -2, reason: "First-degree connection to You" });
  }

  if (
    typeof from.gradYear === "number" &&
    typeof to.gradYear === "number" &&
    from.gradYear === to.gradYear
  ) {
    modifiers.push({
      type: "same_grad_year",
      value: -1,
      reason: `Same graduation year: ${from.gradYear}`
    });
  }

  const modifierSum = modifiers.reduce((sum, modifier) => sum + modifier.value, 0);
  return {
    cost: Math.max(1, BASE_EDGE_COST + modifierSum),
    modifiers
  };
}
