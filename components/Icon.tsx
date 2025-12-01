
import React from 'react';
import { 
  Users, Filter, ShoppingBag, Globe, Settings, 
  MessageCircle, FileText, CheckCircle, Clock, 
  AlertCircle, ChevronRight, Menu, X, DollarSign,
  Briefcase, Search, Moon, Sun, UserPlus, FileBarChart,
  LogOut, Download, Trash2, Edit, Save, MoreHorizontal,
  Grid, Shield, Key, Eye, EyeOff, Activity,
  Video, Mic, Image as ImageIcon, Paperclip, PlayCircle,
  Archive, FileWarning, Car, Laptop, Smartphone, Calculator,
  Rocket, Zap, Sparkles, Brain
} from 'lucide-react';

export type IconName = 
  | 'users' | 'filter' | 'shopping-bag' | 'globe' | 'settings' 
  | 'message' | 'file' | 'check' | 'clock' 
  | 'alert' | 'chevron-right' | 'menu' | 'close' | 'dollar'
  | 'briefcase' | 'search' | 'moon' | 'sun' | 'add-user' | 'chart'
  | 'logout' | 'download' | 'trash' | 'edit' | 'save' | 'more' | 'grid'
  | 'shield' | 'key' | 'eye' | 'eye-off' | 'activity'
  | 'video' | 'mic' | 'image' | 'paperclip' | 'play' | 'archive' | 'file-warning'
  | 'car' | 'laptop' | 'smartphone' | 'calculator' | 'rocket'
  | 'zap' | 'sparkles' | 'brain';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className = '' }) => {
  const icons: Record<IconName, React.ElementType> = {
    users: Users,
    filter: Filter,
    'shopping-bag': ShoppingBag,
    globe: Globe,
    settings: Settings,
    message: MessageCircle,
    file: FileText,
    check: CheckCircle,
    clock: Clock,
    alert: AlertCircle,
    'chevron-right': ChevronRight,
    menu: Menu,
    close: X,
    dollar: DollarSign,
    briefcase: Briefcase,
    search: Search,
    moon: Moon,
    sun: Sun,
    'add-user': UserPlus,
    chart: FileBarChart,
    logout: LogOut,
    download: Download,
    trash: Trash2,
    edit: Edit,
    save: Save,
    more: MoreHorizontal,
    grid: Grid,
    shield: Shield,
    key: Key,
    eye: Eye,
    'eye-off': EyeOff,
    activity: Activity,
    video: Video,
    mic: Mic,
    image: ImageIcon,
    paperclip: Paperclip,
    play: PlayCircle,
    archive: Archive,
    'file-warning': FileWarning,
    car: Car,
    laptop: Laptop,
    smartphone: Smartphone,
    calculator: Calculator,
    rocket: Rocket,
    zap: Zap,
    sparkles: Sparkles,
    brain: Brain
  };

  const IconComponent = icons[name];

  if (!IconComponent) return null;

  return <IconComponent size={size} className={className} />;
};