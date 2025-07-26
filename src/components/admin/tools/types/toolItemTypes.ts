
import { 
  Globe, 
  MessageSquare, 
  Palette, 
  Zap, 
  Search, 
  FileText, 
  Image, 
  Music, 
  Video, 
  Code, 
  Database, 
  Shield, 
  Smartphone,
  Monitor,
  Mail,
  Calendar,
  Users,
  TrendingUp,
  BookOpen,
  Wrench,
  Star,
  Heart,
  Settings,
  Download,
  Upload,
  Link,
  Play,
  Pause,
  Share,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  X,
  Check,
  AlertTriangle,
  Info,
  HelpCircle,
  type LucideIcon
} from "lucide-react";

export interface ToolItem {
  id: string;
  name: string;
  url: string;
  description: string;
  icon?: string; // Agora usa string ao invés de keyof typeof Icons
}
