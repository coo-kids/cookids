import { constant } from "@tsed/di";

const optionNames = {
  "rosa-parks": "GITHUB_LOCATION_ROSA_PARKS_OPTION_ID",
  "saint-lazare": "GITHUB_LOCATION_SAINT_LAZARE_OPTION_ID",
  "le-perreux-sur-marne": "GITHUB_LOCATION_LE_PERREUX_SUR_MARNE_OPTION_ID",
  "neuilly-plaisance": "GITHUB_LOCATION_NEUILLY_PLAISANCE_OPTION_ID",
  montreuil: "GITHUB_LOCATION_MONTREUIL_OPTION_ID"
} as const;

export function getDeliveryLocationOptionId(location: string): string {
  const name = optionNames[location as keyof typeof optionNames];
  const optionId = name ? constant<string>(`envs.${name}`) : undefined;
  if (!optionId) throw new Error(`Unknown GitHub delivery location: ${location}`);
  return optionId;
}
