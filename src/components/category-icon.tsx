
"use client";

import * as React from 'react';
import {
  LandPlot, Building, Hammer, Shovel, Layers, Paintbrush, BrickWall,
  PlugZap, Wrench, Anvil, ThermometerSun, PaintRoller, LayoutGrid,
  Grid, PanelTop, Paintbrush2, DoorOpen, Sheet, Grab, AirVent,
  Table2, ArrowUpDown, CookingPot, Sofa, DoorClosed, FlameKindling,
  Trees, Square as SquareIcon, PenTool, Calculator, Megaphone, Tag, Landmark, FileText,
  KeyRound,
  LucideProps
} from 'lucide-react';

export const iconMap = {
  LandPlot,
  Building,
  Hammer,
  Shovel,
  Layers,
  Paintbrush,
  BrickWall,
  PlugZap,
  Wrench,
  Anvil,
  ThermometerSun,
  PaintRoller,
  LayoutGrid,
  Grid,
  PanelTop,
  Paintbrush2,
  DoorOpen,
  Sheet,
  Grab,
  AirVent,
  Table2,
  ArrowUpDown,
  CookingPot,
  Sofa,
  DoorClosed,
  FlameKindling,
  Trees,
  Square: SquareIcon,
  PenTool,
  Calculator,
  Megaphone,
  Tag,
  Landmark,
  FileText,
  KeyRound,
  default: Building,
};

export type IconName = keyof typeof iconMap;

type CategoryIconProps = LucideProps & {
  name: IconName | string | undefined | null;
};

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  const Icon = name && name in iconMap ? iconMap[name as IconName] : iconMap.default;
  return <Icon {...props} />;
}
