import { ReactNode } from "react";
import {
  User,
  Heart,
  Users,
  UserPlus,
  Waves,
  Landmark,
  UtensilsCrossed,
  TreePine,
  ShoppingBag,
  Music,
  Camera,
  PawPrint,
  PiggyBank,
  Wallet,
  Gem,
} from "lucide-react";

export interface WizardOption {
  value: string;
  icon: ReactNode;
  label: string;
  desc?: string;
}

export const getWhoOptions = (t: any): WizardOption[] => [
  { value: "solo", icon: <User size={24} />, label: t.options.who.alone },
  { value: "casal", icon: <Heart size={24} />, label: t.options.who.couple },
  {
    value: "familia",
    icon: <Users size={24} />,
    label: t.options.who.family,
  },
  {
    value: "grupo",
    icon: <UserPlus size={24} />,
    label: t.options.who.friends,
  },
];

export const getInterestOptions = (t: any): WizardOption[] => [
  {
    value: "praias",
    icon: <Waves size={18} />,
    label: t.options.interests.beaches,
  },
  {
    value: "cultura",
    icon: <Landmark size={18} />,
    label: t.options.interests.culture,
  },
  {
    value: "gastronomia",
    icon: <UtensilsCrossed size={18} />,
    label: t.options.interests.gastronomy,
  },
  {
    value: "natureza",
    icon: <TreePine size={18} />,
    label: t.options.interests.nature,
  },
  {
    value: "compras",
    icon: <ShoppingBag size={18} />,
    label: t.interestCompras,
  },
  { value: "musica", icon: <Music size={18} />, label: t.interestMusica },
  {
    value: "fotografia",
    icon: <Camera size={18} />,
    label: t.interestFotografia,
  },
  {
    value: "pet",
    icon: <PawPrint size={18} />,
    label: t.options.interests.pet,
  },
];

export const getBudgetOptions = (t: any): WizardOption[] => [
  {
    value: "economico",
    icon: <PiggyBank size={18} />,
    label: t.budgetEco,
    desc: t.budgetEcoDesc,
  },
  {
    value: "moderado",
    icon: <Wallet size={18} />,
    label: t.budgetMod,
    desc: t.budgetModDesc,
  },
  {
    value: "premium",
    icon: <Gem size={18} />,
    label: t.budgetPremium,
    desc: t.budgetPremiumDesc,
  },
];
