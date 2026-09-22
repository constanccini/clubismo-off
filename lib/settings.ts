import data from "@/content/settings.json";
import { z } from "zod";

export const settings = z.object({
  showDemoNotice: z.boolean(),
  allowIndexing: z.boolean(),
}).parse(data);
