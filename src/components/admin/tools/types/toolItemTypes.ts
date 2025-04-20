
import * as Icons from "lucide-react";

export interface ToolItem {
  id: string;
  name: string;
  url: string;
  description: string;
  icon?: keyof typeof Icons;
}
