import { useState } from "react";
import { useToast } from "@/context/AppContext";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe2,
  ChevronRight,
  Star,
  Navigation2,
  Plus,
  Link2,
  Lightbulb,
  Camera,
  Home,
  X,
  Share2,
} from "lucide-react";
import { getDestinationById } from "@/constants/destinations";
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';
import { translations } from "@/constants/translations";
import type { UserProfile } from "@/types";

/* ─────────── Gallery images orla de atalaia ─────────── */
const GALLERY_URLS = [
  //foto praia
  "https://images.unsplash.com/photo-1662781288502-5d3a42cf4290?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  //foto ponte praia
  "https://imgmd.net/images/v1/guia/1703215/orla-de-atalaia.jpg",
  //foto praia mato
  "https://images.unsplash.com/photo-1748288147802-ebb42e5dbda2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  //foto lagos
  "https://s3.a8se.com/images/lagos_da_orla_de_atalaia_governo_d.2e16d0ba.fill-770x515.jpg",
  //foto orla natal
  "https://www.se.gov.br/anexos/uploads/image/image/362813/slide_17326566d6e27cbf478c2cff6194bffc.jpg",
  //foto peixes (substituir, n achei onde a ft esta)
  "https://images.unsplash.com/photo-1566151442928-b58e10e2b62e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
];




/* ─────────── Seed reviews for demo ─────────── */
interface ExtendedReview {
  id: string;
  userName: string;
  initials: string;
  rating: number;
  comment: string;
  date: string;
  partnerResponse: string | null;
}

const SEED_REVIEWS: ExtendedReview[] = [
  {
    id: "seed-1",
    userName: "João Carlos Silva",
    initials: "JC",
    rating: 5,
    comment:
      "Lugar incrível! O pôr do sol é de partir o coração. Fui com minha família e todos amaram. A infraestrutura é excelente e muito bem conservada.",
    date: "2026-04-20",
    partnerResponse:
      "Que alegria receber esse carinho! Esperamos todos vocês novamente em breve. 🌅",
  },
  {
    id: "seed-2",
    userName: "Ana Beatriz Ferreira",
    initials: "AF",
    rating: 4,
    comment:
      "Muito bonito e bem cuidado. Fantástico para quem vai com crianças. Só senti falta de mais sombra nas áreas de descanso.",
    date: "2026-04-12",
    partnerResponse: null,
  },
  {
    id: "seed-3",
    userName: "Roberto Menezes",
    initials: "RM",
    rating: 5,
    comment:
      "Experiência maravilhosa! O espaço é seguro e bem sinalizado. Recomendo demais para quem visita Sergipe pela primeira vez.",
    date: "2026-03-28",
    partnerResponse: null,
  },
];

const SPECIFIC_REVIEWS: Record<string, ExtendedReview[]> = {
  "orla-atalaia": [
    {
      id: "orla-1",
      userName: "João Carlos Silva",
      initials: "JC",
      rating: 5,
      comment: "Lugar incrível! O calçadão é perfeito para caminhar no fim da tarde. Fui com meus filhos e eles adoraram o parquinho dos lagos. Muito seguro.",
      date: "2026-04-20",
      partnerResponse: null
    },
    {
      id: "orla-2",
      userName: "Ana Beatriz Ferreira",
      initials: "AF",
      rating: 4,
      comment: "A praia é linda e a infraestrutura de quiosques é excelente. Só achei um pouco difícil achar vaga de estacionamento nos finais de semana de sol.",
      date: "2026-04-12",
      partnerResponse: null
    },
    {
      id: "orla-3",
      userName: "Roberto Menezes",
      initials: "RM",
      rating: 5,
      comment: "O pôr do sol na Passarela do Caranguejo é simplesmente imperdível. Comida típica maravilhosa, música ao vivo e clima muito acolhedor.",
      date: "2026-03-28",
      partnerResponse: null
    }
  ],
  "miauteria": [
    {
      id: "miauteria-1",
      userName: "Carolina Costa",
      initials: "CC",
      rating: 5,
      comment: "Lugar dos sonhos! Os gatinhos são super dóceis, brincalhões e muito bem cuidados. O café expresso e o bolo de cenoura com chocolate são simplesmente maravilhosos.",
      date: "2026-05-10",
      partnerResponse: "Ah, muito obrigado pelo carinho com nossos gatinhos, Carolina! O bolo de cenoura é feito com muito amor. Volte logo! 🐾"
    },
    {
      id: "miauteria-2",
      userName: "Gabriel Santos",
      initials: "GS",
      rating: 5,
      comment: "Excelente iniciativa de apoio às ONGs de resgate. Fui com minha namorada e adoramos o ambiente. É extremamente limpo, silencioso e muito aconchegante.",
      date: "2026-04-28",
      partnerResponse: null
    },
    {
      id: "miauteria-3",
      userName: "Juliana Rocha",
      initials: "JR",
      rating: 4,
      comment: "Ambiente muito calmo e relaxante. Recomendo agendar antes para conseguir entrar na sala de convivência dos gatinhos. Uma experiência de puro amor!",
      date: "2026-04-15",
      partnerResponse: null
    }
  ],
  "museu-gente": [
    {
      id: "museu-1",
      userName: "Matheus Oliveira",
      initials: "MO",
      rating: 5,
      comment: "Sem dúvidas o melhor museu interativo do Nordeste! As cabines de sotaque e o carrossel folclórico são geniais. E o melhor de tudo: a entrada é totalmente gratuita!",
      date: "2026-05-02",
      partnerResponse: "Ficamos honrados com sua avaliação! Nossa missão é justamente valorizar a identidade sergipana de forma inovadora e acessível a todos."
    },
    {
      id: "museu-2",
      userName: "Fernanda Lima",
      initials: "FL",
      rating: 5,
      comment: "Uma imersão fantástica e divertida na cultura de Sergipe. As instalações tecnológicas são super modernas e prendem a atenção de crianças e adultos de forma única.",
      date: "2026-04-18",
      partnerResponse: null
    },
    {
      id: "museu-3",
      userName: "Ricardo Gomes",
      initials: "RG",
      rating: 5,
      comment: "Riquíssimo em detalhes e história. O atendimento dos guias locais é espetacular, explicando cada manifestação folclórica com muito orgulho e carisma.",
      date: "2026-03-30",
      partnerResponse: null
    }
  ],
  "canion-xingo": [
    {
      id: "canion-1",
      userName: "Lucas Almeida",
      initials: "LA",
      rating: 5,
      comment: "Uma verdadeira maravilha da natureza! A navegação de catamarã pelo Velho Chico é fascinante e a parada para banho no Paraíso Talhado é revigorante.",
      date: "2026-05-05",
      partnerResponse: "Navegar pelo Velho Chico é uma experiência mágica mesmo, Lucas! Agradecemos a visita e o registro do seu momento incrível."
    },
    {
      id: "canion-2",
      userName: "Patrícia Souza",
      initials: "PS",
      rating: 5,
      comment: "Visual sensacional! Os paredões de rocha avermelhada são imponentes. Dica de ouro: compre o passeio de canoa por dentro das fendas estreitas, vale muito a pena.",
      date: "2026-04-22",
      partnerResponse: null
    },
    {
      id: "canion-3",
      userName: "Carlos Santos",
      initials: "CS",
      rating: 5,
      comment: "Uma experiência inesquecível em Sergipe. A infraestrutura do passeio é excelente, com segurança exemplar, música ambiente e bom serviço de bordo no catamarã.",
      date: "2026-04-02",
      partnerResponse: null
    }
  ],
  "mercado-thales": [
    {
      id: "mercado-1",
      userName: "Sofia Guimarães",
      initials: "SG",
      rating: 5,
      comment: "Perfeito para comprar castanhas de caju frescas, queijos coalho regionais e artesanato de palha ou renda. Os preços são ótimos e a cultura ferve aqui.",
      date: "2026-05-08",
      partnerResponse: "O Mercado Thales Ferraz é o coração pulsante do nosso comércio cultural! Obrigado pela visita e por valorizar nossos produtores locais."
    },
    {
      id: "mercado-2",
      userName: "Thiago Santos",
      initials: "TS",
      rating: 4,
      comment: "Muita variedade de temperos regionais e artesanatos típicos. Recomendo muito subir ao andar superior para almoçar uma carne de sol com pirão de leite.",
      date: "2026-04-20",
      partnerResponse: null
    },
    {
      id: "mercado-3",
      userName: "Mariana Dias",
      initials: "MD",
      rating: 5,
      comment: "Uma explosão autêntica de cores, aromas e sabores da terra sergipana. Os comerciantes locais são extremamente atenciosos e o espaço é cheio de vida.",
      date: "2026-03-15",
      partnerResponse: null
    }
  ],
  "centro-historico": [
    {
      id: "centro-1",
      userName: "Eduardo Rocha",
      initials: "ER",
      rating: 5,
      comment: "Arquitetura colonial belíssima e cheia de história. O Palácio Olímpio Campos é espetacular e a visita guiada é uma verdadeira aula sobre o estado.",
      date: "2026-05-12",
      partnerResponse: "Preservar nossa história e abrir as portas da memória política de Sergipe é o nosso maior objetivo. Obrigado pela visita, Eduardo!"
    },
    {
      id: "centro-2",
      userName: "Beatriz Mota",
      initials: "BM",
      rating: 4,
      comment: "Lugar muito bonito, com praças amplas. A Catedral Metropolitana é linda por dentro e por fora. Recomendo fazer a caminhada histórica durante o dia.",
      date: "2026-04-25",
      partnerResponse: null
    },
    {
      id: "centro-3",
      userName: "André Luiz",
      initials: "AL",
      rating: 5,
      comment: "Uma verdadeira viagem no tempo em Aracaju. Os casarios coloridos do século XIX são ótimos pontos para fotografar e há ótimos cafés no entorno.",
      date: "2026-04-05",
      partnerResponse: null
    }
  ],
  "parque-sementeira": [
    {
      id: "sementeira-1",
      userName: "Amanda Reis",
      initials: "AR",
      rating: 5,
      comment: "O pulmão verde de Aracaju! Perfeito para fazer piqueniques em família, andar de bicicleta sob as sombras das árvores ou simplesmente relaxar no fim de tarde.",
      date: "2026-05-06",
      partnerResponse: "Cuidar da Sementeira para oferecer esse refúgio de paz aos aracajuanos é nosso prazer. Ficamos felizes que aproveitou, Amanda!"
    },
    {
      id: "sementeira-2",
      userName: "Pedro Viana",
      initials: "PV",
      rating: 5,
      comment: "Muito bem cuidado, limpo e com segurança presente. Ótimo espaço para caminhadas e corridas matinais e para as crianças brincarem nos parquinhos de madeira.",
      date: "2026-04-27",
      partnerResponse: null
    },
    {
      id: "sementeira-3",
      userName: "Letícia Neves",
      initials: "LN",
      rating: 4,
      comment: "Um refúgio delicioso de paz e verde no meio da cidade. Os lagos artificiais com patos e gansos são lindos e dão um charme super especial ao parque.",
      date: "2026-04-10",
      partnerResponse: null
    }
  ],
  "memorial-sergipe": [
    {
      id: "memorial-1",
      userName: "Camila Vieira",
      initials: "CV",
      rating: 5,
      comment: "Acervo riquíssimo sobre a história do cangaço, com destaque para os pertences originais de Lampião e Maria Bonita. Uma excelente aula de história local.",
      date: "2026-05-09",
      partnerResponse: "O cangaço é parte fundamental da nossa memória sertaneja. Agradecemos por compartilhar sua experiência no Memorial de Sergipe!"
    },
    {
      id: "memorial-2",
      userName: "Marcelo Dantas",
      initials: "MD",
      rating: 5,
      comment: "Muito educativo e indispensável para quem quer entender a história política, econômica e artística do povo sergipano. Equipe de recepção muito atenciosa.",
      date: "2026-04-20",
      partnerResponse: null
    },
    {
      id: "memorial-3",
      userName: "Vanessa Souza",
      initials: "VS",
      rating: 5,
      comment: "Um verdadeiro tesouro histórico em Aracaju. A galeria de arte sacra e os documentos antigos são fascinantes. Vale muito a pena conhecer.",
      date: "2026-04-01",
      partnerResponse: null
    }
  ]
};

/* ─────────── Extra description paragraphs per category ─────────── */
type Lang = "pt" | "en" | "es";
type DescMap = Record<Lang, string[]>;

const EXTRA_DESC: Record<string, DescMap> = {
  PRAIA: {
    pt: [
      "O local conta com infraestrutura completa para os visitantes: banheiros públicos, vestiários, chuveiros e postos de guarda-vidas estrategicamente posicionados ao longo de toda a extensão. A área gastronômica reúne dezenas de quiosques e restaurantes que servem frutos do mar frescos, drinks tropicais e delícias típicas sergipanas.",
      "Ao entardecer, o calçadão se transforma em um animado ponto de encontro entre moradores e turistas. Os arcos iluminados e as tendas de artesanato criam uma atmosfera única que une modernidade com a tradicional hospitalidade sergipana — perfeito para quem quer sentir a alma verdadeira de Aracaju.",
    ],
    en: [
      "The spot features complete infrastructure for visitors: public bathrooms, changing rooms, showers, and lifeguard stations placed throughout the entire stretch. The gastronomic area gathers dozens of kiosks and restaurants serving fresh seafood, tropical drinks and typical Sergipe delicacies.",
      "At dusk, the boardwalk transforms into a lively meeting point for locals and tourists. The illuminated arches and craft tents create a unique atmosphere that blends modernity with traditional Sergipe hospitality — perfect for experiencing the true soul of Aracaju.",
    ],
    es: [
      "El lugar cuenta con infraestructura completa para los visitantes: baños públicos, vestuarios, duchas y puestos de salvavidas estratégicamente ubicados. El área gastronómica reúne decenas de quioscos y restaurantes que sirven mariscos frescos, bebidas tropicales y delicias típicas sergipanas.",
      "Al atardecer, el paseo marítimo se transforma en un animado punto de encuentro entre residentes y turistas. Los arcos iluminados y las tiendas de artesanía crean una atmósfera única que combina modernidad con la tradicional hospitalidad sergipana.",
    ],
  },
  CULTURA: {
    pt: [
      "As exposições são organizadas de forma temática, conduzindo o visitante por uma jornada imersiva pela identidade sergipana. Cada ambiente foi cuidadosamente projetado para valorizar as tradições regionais — da culinária às manifestações culturais, do folclore à produção artística contemporânea.",
      "O espaço também promove atividades educativas, workshops e eventos culturais ao longo do ano. Uma excelente oportunidade para aprofundar o conhecimento sobre a riqueza histórica e cultural de Sergipe de forma lúdica e envolvente.",
    ],
    en: [
      "Exhibitions are organized thematically, guiding visitors on an immersive journey through Sergipe's identity. Each space was carefully designed to highlight regional traditions — from cuisine to cultural manifestations, from folklore to contemporary artistic production.",
      "The space also promotes educational activities, workshops and cultural events throughout the year. An excellent opportunity to deepen knowledge of Sergipe's rich history in a fun and engaging way.",
    ],
    es: [
      "Las exposiciones están organizadas temáticamente, guiando al visitante en un viaje inmersivo por la identidad sergipana. Cada ambiente fue cuidadosamente diseñado para valorar las tradiciones regionales.",
      "El espacio también promueve actividades educativas, talleres y eventos culturales a lo largo del año. Una excelente oportunidad para profundizar el conocimiento sobre la rica historia de Sergipe.",
    ],
  },
  NATUREZA: {
    pt: [
      "A biodiversidade local é impressionante. Espécies de aves, peixes e vegetação nativa convivem em harmonia neste ecossistema preservado. Guias locais especializados estão disponíveis para conduzir excursões e compartilhar conhecimentos sobre a fauna e flora da região.",
      "Uma visita obrigatória para amantes da natureza que buscam reconexão com o meio ambiente e experiências autênticas longe do burburinho urbano.",
    ],
    en: [
      "The local biodiversity is impressive. Bird species, fish and native vegetation coexist harmoniously in this preserved ecosystem. Specialized local guides are available to lead excursions and share knowledge about the region's fauna and flora.",
      "A must-visit for nature lovers seeking reconnection with the environment and authentic experiences away from the urban hustle.",
    ],
    es: [
      "La biodiversidad local es impresionante. Especies de aves, peces y vegetación nativa conviven en armonía en este ecosistema preservado. Guías locales especializados están disponibles para conducir excursiones.",
      "Una visita obligada para los amantes de la naturaleza que buscan reconectarse con el medio ambiente y vivir experiencias auténticas.",
    ],
  },
  GASTRONOMIA: {
    pt: [
      "O espaço é um verdadeiro encontro de sabores onde a culinária tradicional sergipana ganha vida. Cada prato conta uma história de ingredientes locais, técnicas transmitidas de geração em geração e muito amor pela cultura gastronômica do estado.",
      "Além da experiência culinária, o ambiente acolhedor e animado é perfeito para conhecer novas pessoas e vivenciar a hospitalidade típica do sergipano. Uma parada obrigatória em qualquer roteiro por Sergipe.",
    ],
    en: [
      "The space is a true meeting of flavors where traditional Sergipe cuisine comes to life. Each dish tells a story of local ingredients, techniques passed down through generations and great love for the state's gastronomic culture.",
      "Beyond the culinary experience, the welcoming and lively atmosphere is perfect for meeting new people and experiencing the typical Sergipe hospitality. A must-stop on any tour of Sergipe.",
    ],
    es: [
      "El espacio es un verdadero encuentro de sabores donde la cocina tradicional sergipana cobra vida. Cada plato cuenta una historia de ingredientes locales y técnicas transmitidas de generación en generación.",
      "Además de la experiencia culinaria, el ambiente acogedor y animado es perfecto para conocer nuevas personas y vivir la típica hospitalidad sergipana.",
    ],
  },
  HISTÓRIA: {
    pt: [
      "As ruas e edificações deste local testemunharam séculos de história e transformações culturais. Cada pedra, cada parede e cada ornamento carrega uma narrativa que remete às raízes mais profundas da formação do Brasil e do povo sergipano.",
      "Visitar este patrimônio é uma oportunidade única de viajar no tempo e entender como a história moldou a identidade cultural, a arquitetura e os costumes de Sergipe. Um tesouro nacional que merece toda valorização.",
    ],
    en: [
      "The streets and buildings of this location have witnessed centuries of history and cultural transformations. Every stone, wall and ornament carries a narrative rooted in the deep origins of Brazil and the Sergipe people.",
      "Visiting this heritage is a unique opportunity to travel through time and understand how history shaped the cultural identity, architecture and customs of Sergipe.",
    ],
    es: [
      "Las calles y edificaciones de este lugar han sido testigos de siglos de historia y transformaciones culturales. Cada piedra y cada ornamento lleva una narrativa vinculada a las raíces más profundas de Brasil.",
      "Visitar este patrimonio es una oportunidad única de viajar en el tiempo y entender cómo la historia moldeó la identidad cultural de Sergipe.",
    ],
  },
};
EXTRA_DESC["PET FRIENDLY"] = {
  pt: [
    "O espaço foi especialmente criado para proporcionar bem-estar tanto para animais quanto para seus tutores. Toda a estrutura é pensada para garantir segurança, conforto e diversão em um ambiente que abraça a causa animal.",
    "Além de ser pet friendly, o local mantém parcerias com ONGs de proteção animal e incentiva a adoção responsável. Uma iniciativa que combina entretenimento com impacto social positivo na comunidade.",
  ],
  en: [
    "The space was specially created to provide well-being for both animals and their owners. The entire structure is designed to ensure safety, comfort and fun in an environment that embraces the animal cause.",
    "In addition to being pet friendly, the venue maintains partnerships with animal protection NGOs and encourages responsible adoption. An initiative that combines entertainment with positive social impact.",
  ],
  es: [
    "El espacio fue especialmente creado para proporcionar bienestar tanto para los animales como para sus tutores. Toda la estructura está pensada para garantizar seguridad, confort y diversión.",
    "Además de ser pet friendly, el local mantiene alianzas con ONGs de protección animal y fomenta la adopción responsable.",
  ],
};

const SPECIFIC_DESC: Record<string, Record<Lang, string[]>> = {
  "orla-atalaia": {
    pt: [
      "A infraestrutura inclui ciclovias, quadras poliesportivas, lagos artificiais com pedalinhos, parquinhos infantis de alta qualidade e o famoso Oceanário de Aracaju. A iluminação moderna à noite convida a caminhadas seguras e agradáveis.",
      "Há dezenas de quiosques e restaurantes servindo pratos regionais icônicos como o caranguejo cozido e doces locais. É o principal ponto de encontro de turistas e sergipanos que buscam lazer ao ar livre e gastronomia à beira-mar."
    ],
    en: [
      "The infrastructure includes bike lanes, sports courts, artificial lakes with paddleboats, high-quality playgrounds, and the famous Aracaju Oceanarium. Modern lighting at night makes it perfect for safe and pleasant walks.",
      "Dozens of kiosks and restaurants serve iconic regional dishes like boiled crab and local sweets. It is the main meeting point for tourists and locals seeking outdoor leisure and scenic dining."
    ],
    es: [
      "La infraestructura incluye ciclovías, canchas deportivas, lagos artificiales con botes a pedal, parques infantiles de alta calidad y el famoso Oceanario de Aracaju. La iluminación moderna por la noche invita a paseos seguros y agradables.",
      "Decenas de quioscos y restaurantes sirven platos regionales icónicos como el cangrejo cocido y dulces locales. Es el principal punto de encuentro para turistas y lugareños."
    ]
  },
  "miauteria": {
    pt: [
      "O espaço possui salas especialmente adaptadas com pontes suspensas, arranhadores e brinquedos aéreos, garantindo a diversão e a segurança dos gatinhos. É possível interagir diretamente com eles em sessões agendadas.",
      "No menu, destacam-se os cafés expressos especiais, os bolos artesanais, salgados com opções veganas e bebidas geladas exclusivas. Todo o lucro das visitas contribui para ONGs parceiras que cuidam de animais resgatados."
    ],
    en: [
      "The space features rooms specially adapted with suspension bridges, scratching posts, and aerial toys, ensuring the kittens' fun and safety. You can interact directly with them in scheduled sessions.",
      "The menu highlights special espresso coffees, artisanal cakes, savory items with vegan options, and exclusive cold drinks. All proceeds from visits go to partner NGOs that care for rescued animals."
    ],
    es: [
      "El espacio cuenta con salas especialmente adaptadas con puentes colgantes, rascadores y juguetes aéreos, garantizando la diversión y seguridad de los gatitos. Es posible interactuar con ellos en sesiones programadas.",
      "En el menú destacan cafés expresos especiales, tartas artesanales y bebidas frías exclusivas. Todo el beneficio de las visitas contribuye a ONGs asociadas."
    ]
  },
  "museu-gente": {
    pt: [
      "O acervo é totalmente tecnológico e interativo, permitindo que o visitante experimente a culinária virtualmente, ouça os sotaques do estado na cabine de fala e assista a apresentações folclóricas digitais em tamanho real.",
      "Instalado no prédio histórico do antigo Ateneu Pedro II, o museu é referência nacional em museografia moderna e é totalmente gratuito, sendo uma das atrações mais recomendadas de Sergipe."
    ],
    en: [
      "The collection is fully technological and interactive, allowing visitors to virtually experience local cuisine, hear regional accents in a speech booth, and watch life-size digital folk performances.",
      "Housed in the historic building of the former Ateneu Pedro II, the museum is a national reference in modern museography and is completely free, making it one of Sergipe's most recommended attractions."
    ],
    es: [
      "La colección es totalmente tecnológica e interactiva, lo que permite a los visitantes experimentar la cocina virtualmente, escuchar los acentos regionales en cabinas de voz y ver espectáculos folclóricos digitales.",
      "Ubicado en el edificio histórico del antiguo Ateneu Pedro II, el museo es un referente nacional en museografía moderna y es completamente gratuito."
    ]
  },
  "canion-xingo": {
    pt: [
      "O passeio clássico de catamarã ou escuna navega pelas águas calmas e verde-esmeralda do Rio São Francisco, cercado por paredões rochosos de tons terrosos esculpidos pelo tempo ao longo de milhares de anos.",
      "No local conhecido como o 'Paraíso Talhado', os visitantes podem fazer passeios de canoa em fendas estreitas e nadar em áreas de banho cercadas e seguras, no coração da caatinga."
    ],
    en: [
      "The classic catamaran or schooner tour navigates the calm, emerald-green waters of the São Francisco River, surrounded by earth-toned rock walls carved by time over thousands of years.",
      "At the spot known as 'Paraíso Talhado', visitors can take canoe rides through narrow rock crevices and swim in safe, enclosed swimming areas in the heart of the semiarid landscape."
    ],
    es: [
      "El clásico recorrido en catamarán o goleta navega por las tranquilas aguas verde esmeralda del río São Francisco, rodeado de paredes de roca esculpidas por el tiempo.",
      "En el lugar conocido como 'Paraíso Talhado', los visitantes pueden dar paseos en canoa por estrechas grietas y nadar en zonas de baño cerradas y seguras."
    ]
  },
  "mercado-thales": {
    pt: [
      "O espaço abriga centenas de boxes que vendem castanhas, queijo coalho, manteiga de garrafa, doces caseiros, além de artesanatos feitos de argila, palha, renda e madeira legítima sergipana.",
      "Interligado aos mercados Antônio Franco e Maria Virgínia, forma um complexo cultural vibrante onde é possível ouvir repentistas e provar a autêntica culinária no andar superior."
    ],
    en: [
      "The space houses hundreds of stalls selling cashews, coalho cheese, bottled butter, homemade sweets, as well as crafts made of clay, straw, lace, and authentic Sergipe wood.",
      "Connected to the Antônio Franco and Maria Virgínia markets, it forms a vibrant cultural complex where you can hear folk singers and taste authentic local food on the upper floor."
    ],
    es: [
      "El espacio alberga cientos de puestos que venden castañas de cajú, queso coalho, mantequilla de botella, dulces caseros y artesanías hechas de barro, paja y encaje.",
      "Conectado a los mercados Antônio Franco y Maria Virgínia, forma un complejo cultural vibrante donde se puede escuchar a los cantores populares."
    ]
  },
  "centro-historico": {
    pt: [
      "Destaque para a belíssima Catedral Metropolitana, a Praça Olímpio Campos e o Palácio Olímpio Campos, que guarda relíquias da época imperial do estado e belos afrescos restaurados.",
      "A caminhada pelas ruas de paralelepípedos revela casarios coloridos do século XIX que hoje abrigam centros culturais, cafeterias charmosas e lojas de tecidos tradicionais."
    ],
    en: [
      "Highlights include the beautiful Metropolitan Cathedral, Olímpio Campos Square, and the Olímpio Campos Palace, which preserves relics from the state's imperial era and beautiful restored frescoes.",
      "Walking along the cobblestone streets reveals colorful 19th-century houses that now host cultural centers, charming cafés, and traditional fabric stores."
    ],
    es: [
      "Destacan la bellísima Catedral Metropolitana, la Plaza Olímpio Campos y el Palacio Olímpio Campos, que guarda reliquias de la época imperial y hermosos frescos restaurados.",
      "El paseo por las calles empedradas revela casas de colores del siglo XIX que hoy albergan centros culturais y cafeterías con encanto."
    ]
  },
  "parque-sementeira": {
    pt: [
      "Possui lagos com patos e gansos, quiosques para picnic, pista de corrida pavimentada, parquinhos de madeira para crianças e amplas áreas de gramado sob a sombra de eucaliptos gigantes.",
      "É um refúgio ecológico no meio da cidade onde famílias se reúnem para andar de bicicleta, praticar ioga, soltar pipa e realizar ensaios fotográficos ao ar livre com luz natural."
    ],
    en: [
      "It features lakes with ducks and geese, picnic kiosks, a paved running track, wooden playgrounds for kids, and wide grassy areas under the shade of giant eucalyptus trees.",
      "It is an ecological refuge in the middle of the city where families gather to ride bikes, practice yoga, fly kites, and hold outdoor photo shoots in natural light."
    ],
    es: [
      "Cuenta con lagos con patos y gansos, quioscos para pícnic, pista para correr pavimentada, parques infantiles de madera y amplias zonas de césped bajo la sombra de eucaliptos gigantes.",
      "Es un refugio ecológico en medio de la ciudad donde las familias se reúnen para andar en bicicleta, practicar yoga y pasar el día al aire libre."
    ]
  },
  "memorial-sergipe": {
    pt: [
      "A coleção exibe arte sacra preciosa, utensílios de engenhos coloniais, documentos raros sobre o cangaço (incluindo pertences de Lampião e Maria Bonita) e a história política do estado.",
      "Gerido pela Universidade Tiradentes, o museu desempenha papel crucial na preservação da memória local e serve de campo de pesquisa para estudantes e historiadores de todo o país."
    ],
    en: [
      "The collection displays precious sacred art, colonial sugar mill utensils, rare documents on the cangaço history (including belongings of Lampião and Maria Bonita), and political history.",
      "Managed by Tiradentes University, the museum plays a crucial role in preserving local memory and serves as a research ground for students and historians from across the country."
    ],
    es: [
      "La colección exhibe valioso arte sacro, utensilios de ingenios azucareros coloniales, documentos raros sobre la historia del cangaço y la historia política del estado.",
      "Gestionado por la Universidad Tiradentes, el museo desempeña un papel crucial en la preservación de la memoria local y la investigación histórica."
    ]
  }
};

/* ─────────── Schedule helpers ─────────── */
function parseSchedule(
  hours: string,
  lang: Lang,
  closedLabel: string
): { day: string; time: string; isToday: boolean; isOpen: boolean }[] {
  const today = new Date().getDay(); // 0=Sun … 6=Sat
  const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon → Sun display order

  const DAYS: Record<Lang, Record<number, string>> = {
    pt: { 0: "Dom", 1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui", 5: "Sex", 6: "Sáb" },
    en: { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" },
    es: { 0: "Dom", 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb" },
  };
  const dayNames = DAYS[lang];

  const allDays = (time: string) =>
    DAY_ORDER.map((d) => ({
      day: dayNames[d],
      time,
      isToday: d === today,
      isOpen: time !== closedLabel,
    }));

  if (/24\s*horas?|24h/i.test(hours)) return allDays("24h");

  if (/diariamente/i.test(hours) || /todos los d/i.test(hours)) {
    const m = hours.match(/(\d+)h[^\d]*(\d+)h/);
    return allDays(m ? `${m[1]}h — ${m[2]}h` : hours);
  }

  if (/segunda[^,]+s[áa]bado/i.test(hours)) {
    const m = hours.match(/(\d+)h[^\d]*(\d+)h/);
    const time = m ? `${m[1]}h — ${m[2]}h` : hours;
    return DAY_ORDER.map((d) => ({
      day: dayNames[d],
      time: d === 0 ? closedLabel : time,
      isToday: d === today,
      isOpen: d !== 0,
    }));
  }

  const parts = hours.split("|");
  if (parts.length === 2) {
    const m1 = parts[0].match(/(\d+)h[^\d]*(\d+)h/);
    const m2 = parts[1].match(/(\d+)h[^\d]*(\d+)h/);
    const t1 = m1 ? `${m1[1]}h — ${m1[2]}h` : parts[0].trim();
    const t2 = m2 ? `${m2[1]}h — ${m2[2]}h` : parts[1].trim();
    return DAY_ORDER.map((d) => {
      const time = d >= 2 && d <= 5 ? t1 : d === 6 || d === 0 ? t2 : closedLabel;
      return { day: dayNames[d], time, isToday: d === today, isOpen: time !== closedLabel };
    });
  }

  return allDays(hours);
}

function isOpenNow(hours: string): boolean {
  if (/24\s*horas?|24h/i.test(hours)) return true;
  const h = new Date().getHours();
  const day = new Date().getDay();
  if (/segunda[^,]+s[áa]bado/i.test(hours) && day === 0) return false;
  const m = hours.match(/(\d+)h[^\d]*(\d+)h/);
  if (m) return h >= parseInt(m[1]) && h < parseInt(m[2]);
  return true;
}

/* ─────────── Component types ─────────── */
interface Review {
  id: string;
  destinationId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface DetalheScreenProps {
  destinationId?: string;
  onNavigate: (screen: string) => void;
  onOpenGPS: (destinationId?: string) => void;
  onAddToRoteiro: (destinationId: string, note?: string) => void;
  isInRoteiro: boolean;
  language: "pt" | "en" | "es";
  reviews: Review[];
  onAddReview: (
    destinationId: string,
    rating: number,
    comment: string,
    userName: string
  ) => void;
  userProfile: UserProfile;
}

/* ─────────── Star component ─────────── */
function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={
            s <= Math.round(rating) ? "text-[#F5A623] fill-[#F5A623]" : "text-[#ddd]"
          }
        />
      ))}
    </div>
  );
}

/* ─────────── Main component ─────────── */
export function DetalheScreen({
  destinationId,
  onNavigate,
  onOpenGPS,
  onAddToRoteiro,
  isInRoteiro,
  language,
  reviews,
  onAddReview,
  userProfile,
}: DetalheScreenProps) {
  const { toast: onToast } = useToast();
  const t = translations[language];
  const destination = destinationId ? getDestinationById(destinationId) : null;

  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  /* ── Not found ── */
  if (!destination) {
    return (
      <div className="bg-[var(--branco)] min-h-screen flex items-center justify-center" style={{ paddingTop: 'calc(var(--navbar-height) + env(safe-area-inset-top, 0px))' }}>
        <div className="text-center px-4">
          <div className="flex justify-center text-[var(--cinza-txt)] mb-4">
            <MapPin size={48} />
          </div>
          <p className="text-[var(--cinza-txt)] mb-6 text-lg">{t.notFound}</p>
          <button
            onClick={() => onNavigate("guia")}
            className="px-6 py-3 bg-[var(--primary)] text-white rounded-[var(--radius-sm)] font-bold text-sm hover:opacity-90 transition-opacity"
          >
            {t.backToGuide}
          </button>
        </div>
      </div>
    );
  }

  /* ── Derived data ── */
  const lang = language as Lang;
  const openNow = isOpenNow(destination.hours);
  const schedule = parseSchedule(destination.hours, lang, t.closed);
  const galleryPhotos = destination.gallery && destination.gallery.length > 0
    ? destination.gallery.filter((url) => url !== destination.image)
    : GALLERY_URLS.filter((url) => url !== destination.image);

  const extraDesc = SPECIFIC_DESC[destination.id] || EXTRA_DESC[destination.category];
  const p2 = extraDesc?.[lang]?.[0] ?? "";
  const p3 = extraDesc?.[lang]?.[1] ?? "";

  /* merge seed reviews + user reviews */
  const userReviewsMapped: ExtendedReview[] = reviews.map((r) => ({
    id: r.id,
    userName: r.userName,
    initials: r.userName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    rating: r.rating,
    comment: r.comment,
    date: r.date,
    partnerResponse: null,
  }));
  const seedReviews = SPECIFIC_REVIEWS[destination.id] || SEED_REVIEWS;
  const allReviews = [...seedReviews, ...userReviewsMapped];

  /* rating distribution */
  const dist = [5, 4, 3, 2, 1].map((star) => {
    const count = allReviews.filter((r) => r.rating === star).length;
    return {
      star,
      pct: allReviews.length > 0 ? Math.round((count / allReviews.length) * 100) : 0,
    };
  });

  const avgRating =
    allReviews.length > 0
      ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
      : destination.rating;

  /* subcriteria (mock) */
  const criteria = [
    { label: t.ratingService, score: 4.7, color: "bg-[var(--azul)]" },
    { label: t.ratingStructure, score: 4.6, color: "bg-[var(--verde)]" },
    { label: t.ratingLocation, score: 4.9, color: "bg-[var(--primary)]" },
    { label: t.ratingValue, score: 4.8, color: "bg-[var(--roxo)]" },
  ];

  /* full description */
  const mainDesc =
    lang === "en" && destination.fullDesc_en
      ? destination.fullDesc_en
      : lang === "es" && destination.fullDesc_es
      ? destination.fullDesc_es
      : destination.fullDesc;

  const tipText =
    lang === "en" && destination.tip_en
      ? destination.tip_en
      : lang === "es" && destination.tip_es
      ? destination.tip_es
      : destination.tip;

  const dateLocale =
    lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US";

  /* ── JSX ── */
  return (
    <div className="bg-[var(--branco)] min-h-screen" style={{ paddingTop: 'calc(var(--navbar-height) + env(safe-area-inset-top, 0px))' }}>

      {/* ══════════════════ HERO ══════════════════ */}
      <div className="relative w-full overflow-hidden mt-0" style={{ height: "400px" }}>
        <ImageWithFallback
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/10 to-black/80" />

        {/* Top: breadcrumb + badge */}
        <div className="absolute top-0 left-0 right-0 px-4 sm:px-6 pt-5">
          {/* Breadcrumb */}
          <nav className="flex items-center flex-wrap gap-1 text-white/80 text-xs mb-3 select-none">
            <button
              onClick={() => onNavigate("home")}
              className="flex items-center gap-1 hover:text-white transition-colors min-h-[28px]"
            >
              <Home size={11} />
              <span>{t.breadcrumbHome}</span>
            </button>
            <ChevronRight size={11} className="text-white/40 shrink-0" />
            <button
              onClick={() => onNavigate("guia")}
              className="hover:text-white transition-colors min-h-[28px]"
            >
              {t.breadcrumbDestinations}
            </button>
            <ChevronRight size={11} className="text-white/40 shrink-0" />
            <span className="text-white/60">{destination.region}</span>
            <ChevronRight size={11} className="text-white/40 shrink-0" />
            <span className="text-white font-medium truncate max-w-[140px] sm:max-w-none">
              {destination.name}
            </span>
          </nav>

          {/* Category badge */}
          <CategoryBadge category={destination.category} size="md" className="shadow-md" />
        </div>

        {/* Close / back button */}
        <button
          onClick={() => onNavigate("guia")}
          aria-label="Fechar"
          className="absolute top-5 right-4 w-9 h-9 flex items-center justify-center bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-black/50 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Bottom: address preview */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-6">
          <div className="flex items-center gap-2 text-white/75 text-sm">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">{destination.address}</span>
          </div>
        </div>
      </div>

      {/* ══════════════════ MAIN CONTENT ══════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 py-10">

          {/* ── LEFT COLUMN (65%) ── */}
          <div className="flex-1 min-w-0">

            {/* Title */}
            <h1
              className="font-['Fjalla_One'] text-[var(--preto)] tracking-wide leading-tight mb-3"
              style={{ fontSize: "40px" }}
            >
              {destination.name}
            </h1>

            {/* Location link */}
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(destination.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[var(--azul)] text-sm mb-5 hover:underline"
            >
              <MapPin size={15} className="shrink-0 text-[var(--azul)]" />
              <span>{destination.address}</span>
            </a>

            {/* Rating + hours row */}
            <div className="flex flex-wrap items-center gap-4 mb-7">
              <div className="flex items-center gap-2">
                <StarRow rating={parseFloat(destination.rating)} size={18} />
                <span className="font-bold text-[var(--preto)]">{destination.rating}</span>
                <span className="text-[var(--cinza-txt)] text-sm">
                  ({destination.reviews} {t.reviews})
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Clock size={14} className="text-[var(--cinza-txt)]" />
                {openNow ? (
                  <>
                    <span className="text-[var(--verde)] font-medium">{t.openNow}</span>
                    <span className="text-[var(--cinza-txt)]">· {destination.hours}</span>
                  </>
                ) : (
                  <span className="text-[var(--vermelho)] font-medium">{destination.hours}</span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mb-9">
              <button
                onClick={() => onOpenGPS(destinationId)}
                className="flex items-center gap-2 px-5 py-3 bg-[#0D9488] text-white rounded-[var(--radius-sm)] font-bold text-sm hover:bg-[#0F766E] transition-colors min-h-[44px]"
              >
                <Navigation2 size={16} />
                {t.howToGet}
              </button>
              <button
                onClick={() => { if (destinationId) onAddToRoteiro(destinationId); }}
                disabled={isInRoteiro}
                className={`flex items-center gap-2 px-5 py-3 rounded-[var(--radius-sm)] font-bold text-sm transition-colors min-h-[44px] ${
                  isInRoteiro
                    ? "bg-[var(--cinza-med)] text-[var(--cinza-txt)] cursor-not-allowed"
                    : "bg-[var(--primary)] text-white hover:bg-[var(--vermelho)]"
                }`}
              >
                <Plus size={16} />
                {isInRoteiro ? t.alreadyInItinerary : t.addToItinerary}
              </button>
              <button
                onClick={async () => {
                  const locationText = `${destination.name} — ${destination.address}`;
                  try {
                    if (navigator.share) {
                      await navigator.share({
                        title: destination.name,
                        text: locationText,
                        url: `https://maps.google.com/?q=${encodeURIComponent(destination.address)}`,
                      });
                    } else {
                      await navigator.clipboard.writeText(locationText);
                      onToast(`📍 Localização copiada: ${destination.name}`);
                    }
                  } catch {
                    try {
                      await navigator.clipboard.writeText(locationText);
                      onToast(`📍 Localização copiada: ${destination.name}`);
                    } catch {
                      onToast('⚠️ Não foi possível copiar a localização.');
                    }
                  }
                }}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-[var(--cinza-med)] text-[var(--preto)] rounded-[var(--radius-sm)] font-bold text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors min-h-[44px]"
              >
                <Share2 size={16} />
                Compartilhar
              </button>
            </div>

            {/* Description paragraphs */}
            <div className="space-y-4 mb-10">
              <p className="text-[15px] text-[var(--cinza-txt)] leading-relaxed">{mainDesc}</p>
              {p2 && <p className="text-[15px] text-[var(--cinza-txt)] leading-relaxed">{p2}</p>}
              {p3 && <p className="text-[15px] text-[var(--cinza-txt)] leading-relaxed">{p3}</p>}
            </div>

            {/* Photo Gallery */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Camera size={18} className="text-[var(--primary)]" />
                <h3 className="font-['Fjalla_One'] text-xl text-[var(--preto)]">{t.photoGallery}</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {galleryPhotos.slice(0, 6).map((url, i) => (
                  <div
                    key={i}
                    className="relative overflow-hidden rounded-[var(--radius-sm)] cursor-pointer group"
                    style={{ aspectRatio: "1 / 1" }}
                    onClick={() => setLightboxImg(url)}
                  >
                    <ImageWithFallback
                      src={url}
                      alt={`${destination.name} ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* No overlay */}
                  </div>
                ))}
              </div>
            </div>

            {/* Leave a Review */}
            <div className="border-t border-[var(--cinza-med)] pt-8">
              <h3 className="font-['Fjalla_One'] text-xl text-[var(--preto)] mb-4">{t.leaveReview}</h3>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className={`text-4xl cursor-pointer bg-transparent border-none transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                      star <= (hoveredRating || selectedRating)
                        ? "text-[#F5A623]"
                        : "text-[#E2E0DB]"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={t.reviewPlaceholder}
                className="w-full px-4 py-3 border border-[var(--cinza-med)] rounded-[var(--radius-sm)] text-sm resize-none outline-none min-h-[110px] bg-white focus:border-[var(--primary)] transition-colors"
              />
              <button
                onClick={() => {
                  if (selectedRating === 0) { onToast(t.selectRating); return; }
                  if (!reviewComment.trim()) { onToast(t.writeComment); return; }
                  if (destinationId) {
                    onAddReview(destinationId, selectedRating, reviewComment, userProfile.name);
                    onToast(t.reviewPublished);
                    setSelectedRating(0);
                    setReviewComment("");
                  }
                }}
                className="mt-3 px-6 py-3 bg-[var(--preto)] text-white rounded-[var(--radius-sm)] font-bold text-sm hover:opacity-90 min-h-[44px] transition-opacity"
              >
                {t.publishReview}
              </button>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR (35%) ── */}
          <div className="w-full lg:w-[360px] shrink-0">
            <div className="lg:sticky lg:top-[82px] space-y-4">

              {/* Contact Info Card */}
              <div className="bg-white border border-[var(--cinza-med)] rounded-[12px] p-5 shadow-[var(--sombra-sm)]">
                <h4 className="font-['Fjalla_One'] text-base text-[var(--preto)] mb-4">
                  {t.contactInfo}
                </h4>
                <div className="space-y-3">
                  <a
                    href={`tel:${destination.phone}`}
                    className="flex items-center gap-3 text-sm text-[var(--cinza-txt)] hover:text-[var(--primary)] transition-colors min-h-[44px]"
                  >
                    <div className="w-9 h-9 rounded-full bg-[var(--cinza-leve)] flex items-center justify-center shrink-0">
                      <Phone size={14} className="text-[var(--primary)]" />
                    </div>
                    <span>{destination.phone}</span>
                  </a>
                  <a
                    href={`mailto:${destination.email}`}
                    className="flex items-center gap-3 text-sm text-[var(--cinza-txt)] hover:text-[var(--primary)] transition-colors min-h-[44px]"
                  >
                    <div className="w-9 h-9 rounded-full bg-[var(--cinza-leve)] flex items-center justify-center shrink-0">
                      <Mail size={14} className="text-[var(--primary)]" />
                    </div>
                    <span className="truncate">{destination.email}</span>
                  </a>
                  <div className="flex items-center gap-3 text-sm text-[var(--cinza-txt)] min-h-[44px]">
                    <div className="w-9 h-9 rounded-full bg-[var(--cinza-leve)] flex items-center justify-center shrink-0">
                      <Globe2 size={14} className="text-[var(--primary)]" />
                    </div>
                    <span>{destination.social}</span>
                  </div>
                </div>
              </div>

              {/* Local Tip Card */}
              <div className="rounded-[12px] p-5" style={{ backgroundColor: "#FFF3E0", border: "1px solid #FFD9B3" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={18} style={{ color: "#E65C00" }} />
                  <h4 className="font-bold text-sm" style={{ color: "#E65C00" }}>
                    {t.localTip}
                  </h4>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#7A3700" }}>
                  {tipText}
                </p>
              </div>

              {/* Opening Hours Card */}
              <div className="bg-white border border-[var(--cinza-med)] rounded-[12px] p-5 shadow-[var(--sombra-sm)]">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[var(--primary)]" />
                    <h4 className="font-['Fjalla_One'] text-base text-[var(--preto)]">
                      {t.openingHours}
                    </h4>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      openNow
                        ? "bg-[#DCFCE7] text-[var(--verde)]"
                        : "bg-[#FEE2E2] text-[var(--vermelho)]"
                    }`}
                  >
                    {openNow ? `🟢 ${t.openNow}` : `🔴 ${t.closed}`}
                  </span>
                </div>
                <div className="space-y-1">
                  {schedule.map((row, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-[6px] ${
                        row.isToday ? "bg-[var(--laranja-leve)]" : ""
                      }`}
                    >
                      <span
                        className={`font-medium ${
                          row.isToday ? "text-[var(--primary)]" : "text-[var(--cinza-txt)]"
                        }`}
                      >
                        {row.day}
                      </span>
                      <span
                        className={
                          row.isToday
                            ? "text-[var(--primary)] font-bold"
                            : row.isOpen
                            ? "text-[var(--preto)]"
                            : "text-[var(--cinza-txt)]"
                        }
                      >
                        {row.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map Card */}
              <div className="bg-white border border-[var(--cinza-med)] rounded-[12px] overflow-hidden shadow-[var(--sombra-sm)]">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--cinza-med)]">
                  <MapPin size={16} className="text-[var(--primary)]" />
                  <h4 className="font-['Fjalla_One'] text-base text-[var(--preto)]">
                    {t.mapLocation}
                  </h4>
                </div>
                <iframe
                  title={`${destination.name} map`}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${destination.lon - 0.013},${destination.lat - 0.013},${destination.lon + 0.013},${destination.lat + 0.013}&layer=mapnik&marker=${destination.lat},${destination.lon}`}
                  className="w-full border-0"
                  style={{ height: "200px" }}
                  loading="lazy"
                />
                <div className="px-4 py-3">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${destination.lat}&mlon=${destination.lon}&zoom=15`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm text-[var(--azul)] font-medium hover:underline min-h-[44px]"
                  >
                    <Navigation2 size={14} />
                    {t.howToGet}
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════ REVIEWS SECTION ══════════════════ */}
      <section className="bg-[var(--cinza-leve)] py-14 mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

          <h2 className="font-['Fjalla_One'] text-2xl text-[var(--preto)] mb-8">
            {t.reviewsSummary}
          </h2>

          <div className="flex flex-col lg:flex-row gap-8 mb-10">

            {/* Big rating */}
            <div className="flex flex-col items-center justify-center bg-white rounded-[var(--radius)] p-8 shadow-[var(--sombra-sm)] min-w-[170px]">
              <div
                className="font-['Fjalla_One'] text-[var(--preto)] leading-none"
                style={{ fontSize: "62px" }}
              >
                {avgRating}
              </div>
              <div className="flex mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={18} className="text-[#F5A623] fill-[#F5A623]" />
                ))}
              </div>
              <p className="text-xs text-[var(--cinza-txt)] mt-2 text-center">
                {allReviews.length} {t.reviews}
              </p>
            </div>

            <div className="flex-1 space-y-6">
              {/* Star distribution */}
              <div className="space-y-2">
                {dist.map(({ star, pct }) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm text-[var(--cinza-txt)] w-4 text-right">{star}</span>
                    <Star size={13} className="text-[#F5A623] fill-[#F5A623] shrink-0" />
                    <div className="flex-1 h-2 bg-[var(--cinza-med)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#F5A623] rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-[var(--cinza-txt)] w-9 text-right">{pct}%</span>
                  </div>
                ))}
              </div>

              {/* Subcriteria */}
              <div className="grid grid-cols-2 gap-3">
                {criteria.map(({ label, score, color }) => (
                  <div
                    key={label}
                    className="bg-white rounded-[var(--radius-sm)] p-4 shadow-[var(--sombra-sm)]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[var(--cinza-txt)]">{label}</span>
                      <span className="font-bold text-sm text-[var(--preto)]">{score}</span>
                    </div>
                    <div className="h-1.5 bg-[var(--cinza-med)] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full`}
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Individual reviews */}
          <h3 className="font-['Fjalla_One'] text-xl text-[var(--preto)] mb-5">
            {t.userReviews}
          </h3>
          <div className="space-y-4">
            {allReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-[var(--radius)] p-6 shadow-[var(--sombra-sm)]"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar initials */}
                  <div className="w-11 h-11 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm shrink-0 select-none">
                    {review.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between flex-wrap gap-2 mb-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-bold text-sm text-[var(--preto)]">{review.userName}</span>
                        <span className="text-[10px] text-[var(--cinza-txt)] bg-[var(--cinza-leve)] px-2 py-0.5 rounded-full">
                          {t.verifiedVisitor}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--cinza-txt)]">
                        {new Date(review.date).toLocaleDateString(dateLocale)}
                      </span>
                    </div>
                    <StarRow rating={review.rating} size={13} />
                    <p className="mt-2 text-sm text-[var(--cinza-txt)] leading-relaxed">
                      {review.comment}
                    </p>

                    {review.partnerResponse && (
                      <div
                        className="mt-4 p-4 rounded-[var(--radius-sm)]"
                        style={{
                          backgroundColor: "#FFF3E0",
                          borderLeft: "4px solid var(--primary)",
                        }}
                      >
                        <p className="text-xs font-bold text-[var(--primary)] mb-1">
                          {t.partnerResponse}
                        </p>
                        <p className="text-xs text-[#7A3700] leading-relaxed">
                          {review.partnerResponse}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ LIGHTBOX ══════════════════ */}
      {lightboxImg && (
        <div
          className="fixed inset-0 bg-black/92 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <X size={20} />
          </button>
          <img
            src={lightboxImg}
            alt="Gallery fullscreen"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
