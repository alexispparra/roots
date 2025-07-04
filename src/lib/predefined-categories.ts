
import type { IconName } from '@/components/category-icon';

export type PredefinedCategory = {
  name: string;
  icon: IconName;
};

export const predefinedCategories: PredefinedCategory[] = [
    { name: 'TERRENO', icon: 'LandPlot' },
    { name: 'GASTOS GENERALES, IMPUESTOS Y TRAMITES', icon: 'Landmark' },
    { name: 'DEMOLICION', icon: 'Hammer' },
    { name: 'PILOTES Y MOVIMIENTO DE SUELOS', icon: 'Shovel' },
    { name: 'HORMIGON', icon: 'Layers' },
    { name: 'MAQUILLAJE DE HORMIGON', icon: 'Paintbrush' },
    { name: 'ALBAÑILERIA', icon: 'BrickWall' },
    { name: 'INSTALACION ELECTRICA', icon: 'PlugZap' },
    { name: 'INSTALACION SANITARIA, GAS Y RIEGO', icon: 'Wrench' },
    { name: 'HERRERIA', icon: 'Anvil' },
    { name: 'CALEFACCION', icon: 'ThermometerSun' },
    { name: 'YESERIA', icon: 'Grab' },
    { name: 'COLOCACIONES', icon: 'Grid' },
    { name: 'SOLADOS', icon: 'Square' },
    { name: 'REVESTIMIENTO', icon: 'LayoutGrid' },
    { name: 'PINTURA', icon: 'Paintbrush2' },
    { name: 'ABERTURAS', icon: 'PanelTop' },
    { name: 'ZINGUERIA', icon: 'Sheet' },
    { name: 'HERRAJES', icon: 'KeyRound' },
    { name: 'A/C', icon: 'AirVent' },
    { name: 'MESADAS', icon: 'Table2' },
    { name: 'ASCENSOR', icon: 'ArrowUpDown' },
    { name: 'COCINAS', icon: 'CookingPot' },
    { name: 'MUEBLES', icon: 'Sofa' },
    { name: 'PUERTAS', icon: 'DoorClosed' },
    { name: 'INCENDIO', icon: 'FlameKindling' },
    { name: 'PAISAJISMO', icon: 'Trees' },
    { name: 'VIDRIERO', icon: 'Square' },
    { name: 'ESCRIBANIA', icon: 'PenTool' },
    { name: 'CONTADURIA', icon: 'Calculator' },
    { name: 'MKT + VENTA', icon: 'Megaphone' },
];
