const fs = require('fs');
const path = './src/app/screens/RoteiroScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace travelLabel 🚗
content = content.replace(/return `🚗 \$\{mStr\} · \$\{kmStr\}`;/g, 'return `${mStr} · ${kmStr}`;');

// Replace who options emojis with icons
content = content.replace(/\{ value: "solo", icon: "🧳", label: t\.options\.who\.alone \}/g, '{ value: "solo", icon: <User size={24} />, label: t.options.who.alone }');
content = content.replace(/\{ value: "casal", icon: "💑", label: t\.options\.who\.couple \}/g, '{ value: "casal", icon: <Heart size={24} />, label: t.options.who.couple }');
content = content.replace(/\{ value: "familia", icon: "👨‍👩‍👧", label: t\.options\.who\.family \}/g, '{ value: "familia", icon: <Users size={24} />, label: t.options.who.family }');
content = content.replace(/\{ value: "grupo", icon: "👥", label: t\.options\.who\.friends \}/g, '{ value: "grupo", icon: <UserPlus size={24} />, label: t.options.who.friends }');

// Replace budget options emojis with icons
content = content.replace(/\{ value: "economico", icon: "💚", label: t\.budgetEco, desc: t\.budgetEcoDesc \}/g, '{ value: "economico", icon: <PiggyBank size={18} />, label: t.budgetEco, desc: t.budgetEcoDesc }');
content = content.replace(/\{ value: "moderado", icon: "🧡", label: t\.budgetMod, desc: t\.budgetModDesc \}/g, '{ value: "moderado", icon: <Wallet size={18} />, label: t.budgetMod, desc: t.budgetModDesc }');
content = content.replace(/\{ value: "premium", icon: "💛", label: t\.budgetPremium, desc: t\.budgetPremiumDesc \}/g, '{ value: "premium", icon: <Gem size={18} />, label: t.budgetPremium, desc: t.budgetPremiumDesc }');

// Replace bot emoji
content = content.replace(/🤖/g, '<Bot size={36} className="text-white" />');

// Replace mapping/organizing emojis
content = content.replace(/📍 Organizando paradas por proximidade…/g, 'Organizando paradas por proximidade…');
content = content.replace(/📍 Organizando paradas por proximidade…/g, 'Organizando paradas por proximidade…');
content = content.replace(/📍 Organizing stops by proximity…/g, 'Organizing stops by proximity…');
content = content.replace(/✨ Adicionando dicas exclusivas…/g, 'Adicionando dicas exclusivas…');
content = content.replace(/✨ Agregando consejos exclusivos…/g, 'Agregando consejos exclusivos…');
content = content.replace(/✨ Adding exclusive tips…/g, 'Adding exclusive tips…');

fs.writeFileSync(path, content, 'utf8');
console.log('Done RoteiroScreen');
