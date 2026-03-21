import { supabase } from "@/lib/supabase";

/**
 * Typed wrapper around `supabase.functions.invoke`.
 * Centralises the invoke + error-throw pattern used by all analytics services.
 */
export async function invokeFunction<T>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, { body });
  if (error) throw new Error(error.message);
  return data as T;
}
