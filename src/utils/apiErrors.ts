export function isAccessDenied(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  return code === "feature_required" || code === "subscription_required";
}
