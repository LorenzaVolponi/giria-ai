const userNeutralPreference = new Map<string, boolean>();
const channelNeutralPreference = new Map<string, boolean>();

export type NeutralPreferenceInput = {
  userId?: string;
  channel?: string;
  preferNeutral?: boolean;
};

export function setNeutralPreference(input: NeutralPreferenceInput) {
  if (typeof input.preferNeutral !== "boolean") return;
  if (input.userId) userNeutralPreference.set(input.userId, input.preferNeutral);
  if (input.channel) channelNeutralPreference.set(input.channel, input.preferNeutral);
}

export function resolveNeutralPreference(input: NeutralPreferenceInput): boolean {
  if (typeof input.preferNeutral === "boolean") return input.preferNeutral;
  if (input.userId && userNeutralPreference.has(input.userId)) {
    return userNeutralPreference.get(input.userId) ?? true;
  }
  if (input.channel && channelNeutralPreference.has(input.channel)) {
    return channelNeutralPreference.get(input.channel) ?? true;
  }
  return true;
}
