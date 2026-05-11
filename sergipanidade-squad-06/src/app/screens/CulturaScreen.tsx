import { useState, useEffect, useRef } from 'react';
import {
  Search, MapPin, ArrowRight, ArrowLeft, ChevronRight,
  Instagram, Globe, Mail, X, Calendar, Music, Palette,
  Camera, BookOpen, Footprints, Shapes, Scissors, Award,
  Eye, ExternalLink, Clock, Users, Star, Landmark,
  BookMarked, Ticket, BookHeart, Tent,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { HeroSlideshow } from '../components/HeroSlideshow';
import { SERGIPE_CULTURE } from '../data/sergipeImages';
import imgCultura from '../../imports/img_cultura.jpeg';

// ─── Image Constants ─────────────────────────────────────────
const IMG_ARTISAN = 'https://images.unsplash.com/photo-1660386383798-7f957c379452?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';
const IMG_PAINTER = 'https://images.unsplash.com/photo-1711809814870-72b7c756bd37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';
const IMG_PHOTO = 'https://images.unsplash.com/photo-1642932516003-00f97bd01a43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';
const IMG_MUSIC = 'https://images.unsplash.com/photo-1732066919734-a905ed7aed24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';
const IMG_DANCE = 'https://images.unsplash.com/photo-1767979349910-655bdc4e2f4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';
const IMG_LACE = 'https://images.unsplash.com/photo-1766414435654-c0fd3ecdad35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';
const IMG_RIVER = 'https://images.unsplash.com/photo-1656747679959-2c7519e49765?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';
const IMG_MURAL = 'https://images.unsplash.com/photo-1693498892953-b37618b67544?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';
const IMG_MARKET = 'https://images.unsplash.com/photo-1765461069097-7bb0db2af224?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';
const IMG_WRITER = 'https://images.unsplash.com/photo-1598893768907-fc3e27c64df6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';
const IMG_HERITAGE = 'https://images.unsplash.com/photo-1776905177837-46124c0b9424?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';
const IMG_CONCERT = 'https://images.unsplash.com/photo-1760965824369-1a867927c1e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';
const IMG_SCULPTOR = 'https://images.unsplash.com/photo-1761410379143-f8276f48b1a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';
const IMG_MUSEUM = 'https://images.unsplash.com/photo-1761641062457-bc8603350eb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';
const IMG_THEATER = 'https://images.unsplash.com/photo-1761229660731-891484da5c35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';
const IMG_FESTIVAL = 'https://images.unsplash.com/photo-1655770926081-66ec8decf028?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';
const IMG_CHURCH = 'https://images.unsplash.com/photo-1762995350070-62072b173bb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';

// ─── Types ───────────────────────────────────────────────────
type CulturaTab = 'artistas' | 'historias' | 'eventos' | 'patrimonio';
type ArtistFilter = 'todos' | 'artesanato' | 'pintura' | 'fotografia' | 'musica' | 'literatura' | 'danca' | 'escultura';

interface Artist {
  id: string;
  name: string;
  city: string;
  linguagem: string;
  bio: string;
  bioFull: string;
  photo: string;
  coverPhoto: string;
  awards: string;
  years: string;
  instagram: string;
  works: { title: string; year: string; img: string; desc: string; tecnica: string }[];
}

interface Story {
  id: string;
  category: 'FOLCLORE' | 'TRADIÇÃO' | 'PERSONALIDADE' | 'GASTRONOMIA';
  title: string;
  intro: string;
  body: string[];
  author: string;
  date: string;
  img: string;
  imgCaption: string;
  relatedImg: string;
}

interface CulturaEvent {
  id: string;
  name: string;
  type: string;
  day: string;
  month: string;
  local: string;
  city: string;
  desc: string;
  img: string;
  free: boolean;
  online: boolean;
  thisWeek: boolean;
}

interface Heritage {
  id: string;
  name: string;
  type: 'PATRIMÔNIO MATERIAL' | 'PATRIMÔNIO IMATERIAL';
  year: string;
  institute: string;
  desc: string;
  img: string;
  height?: 'tall' | 'normal';
}

// ─── Mock Data ───────────────────────────────────────────────
const ARTISTS: Artist[] = [
  {
    id: 'cicero',
    name: 'Cícero Brites',
    city: 'Aracaju · SE',
    linguagem: 'artesanato',
    bio: 'Artesão sergipano que transforma argila e fibras naturais em expressões da alma nordestina. Referência em cerâmica utilitária e decorativa.',
    bioFull: 'Cícero Brites nasceu em 1975, em Aracaju, e desde os 8 anos observava as mãos da avó moldando o barro. Aprendeu o ofício nas margens do Rio Sergipe, onde a terra vermelha servia de matéria-prima e a imaginação, de molde. Ao longo de mais de 30 anos, desenvolveu uma linguagem própria que mistura técnicas ancestrais da cerâmica nordestina com formas contemporâneas. Suas peças já foram expostas em mostras nacionais e integram acervos do Museu da Gente Sergipana. Hoje, Cícero mantém um ateliê aberto no bairro Industrial onde ensina o ofício a jovens da comunidade.',
    photo: IMG_ARTISAN,
    coverPhoto: IMG_MARKET,
    awards: ' Prêmio Cultura SE 2023',
    years: '30+ anos de trajetória',
    instagram: '@cicero.brites.arte',
    works: [
      { title: 'Série Caatinga', year: '2023', img: IMG_ARTISAN, desc: 'Conjunto de vasos que retrata a exuberância do bioma caatinga em formas orgânicas.', tecnica: 'Cerâmica vidrada' },
      { title: 'Memória do Rio', year: '2022', img: IMG_LACE, desc: 'Instalação que evoca a relação dos sergipanos com o Rio São Francisco.', tecnica: 'Argila e fibra natural' },
      { title: 'Corpus Sertão', year: '2021', img: IMG_SCULPTOR, desc: 'Esculturas que representam figuras do cotidiano sertanejo com traço expressionista.', tecnica: 'Terracota' },
    ],
  },
  {
    id: 'maria',
    name: 'Maria das Graças Santos',
    city: 'Lagarto · SE',
    linguagem: 'pintura',
    bio: 'Pintora autodidata cujas telas capturam a luz única do sertão sergipano e os rostos marcados pela sabedoria popular.',
    bioFull: 'Maria das Graças Santos começou a pintar aos 35 anos, depois de criar três filhos e trabalhar durante décadas como professora rural em Lagarto. Sem formação acadêmica formal, desenvolveu um estilo expressivo e intimista que mistura cores vibrantes com retratos humanos de grande potência emocional. Suas obras já foram adquiridas por colecionadores de São Paulo, Rio de Janeiro e Portugal.',
    photo: IMG_PAINTER,
    coverPhoto: IMG_MURAL,
    awards: ' Menção Honrosa — FUNESC 2022',
    years: '15 anos de trajetória',
    instagram: '@mariagraca.arte',
    works: [
      { title: 'Olhares do Sertão', year: '2024', img: IMG_PAINTER, desc: 'Série de retratos de mulheres sertanejas com olhar direto e cores quentes.', tecnica: 'Óleo sobre tela' },
      { title: 'Roça em Festa', year: '2023', img: IMG_FESTIVAL, desc: 'Cena de festa junina captada em traços livres e alegres.', tecnica: 'Acrílica sobre madeira' },
      { title: 'Cabeça d\'Água', year: '2022', img: IMG_RIVER, desc: 'Abstração das cheias do rio São Francisco com paleta azul-terrosa.', tecnica: 'Técnica mista' },
    ],
  },
  {
    id: 'fabricio',
    name: 'Fabrício Souza',
    city: 'Aracaju · SE',
    linguagem: 'fotografia',
    bio: 'Fotógrafo documental especializado em comunidades quilombolas e manifestações religiosas afro-sergipanas.',
    bioFull: 'Fabrício Souza usa a fotografia como ferramenta de memória e resistência. Ao longo de 18 anos, documentou mais de 40 comunidades quilombolas em Sergipe, criando um acervo único de mais de 60 mil imagens. Seu trabalho foi publicado pelo Ministério da Cultura e exposto em Brasília, São Paulo e na Bienal de Arte do Nordeste.',
    photo: IMG_PHOTO,
    coverPhoto: IMG_MUSEUM,
    awards: ' Prêmio Vladimir Carvalho 2021',
    years: '18 anos de trajetória',
    instagram: '@fabricio.foto.se',
    works: [
      { title: 'Mocambo — A Maior Quilombola', year: '2023', img: IMG_PHOTO, desc: 'Ensaio visual sobre a vida cotidiana no Quilombo Mocambo, o maior de Sergipe.', tecnica: 'Fotografia digital P&B' },
      { title: 'Terreiros de Sergipe', year: '2022', img: IMG_DANCE, desc: 'Registros de cerimônias sagradas do candomblé nagô sergipano.', tecnica: 'Fotografia analógica colorida' },
      { title: 'Orla — Retratos da Cidade', year: '2021', img: IMG_MURAL, desc: 'Série sobre os personagens que habitam a Orla de Atalaia ao entardecer.', tecnica: 'Fotografia urbana' },
    ],
  },
  {
    id: 'ana',
    name: 'Ana Lima',
    city: 'Itabaiana · SE',
    linguagem: 'musica',
    bio: 'Cantora e compositora de forró pé-de-serra que mantém viva a tradição do forró sergipano com composições autorais e raízes.',
    bioFull: 'Ana Lima cresceu ouvindo forró nas festas de São João de Itabaiana. Filha de sanfoneiro, aprendeu a tocar antes de andar de bicicleta. Formou sua primeira banda aos 17 anos e desde então percorreu todos os estados nordestinos com sua música. Tem três álbuns lançados e colabora com o projeto "Forró nas Escolas" em parceria com a SEED-SE.',
    photo: IMG_MUSIC,
    coverPhoto: IMG_CONCERT,
    awards: ' Melhor Álbum Forró — SESC 2023',
    years: '20 anos de trajetória',
    instagram: '@analima.forro',
    works: [
      { title: 'Álbum "Raízes"', year: '2023', img: IMG_MUSIC, desc: '12 composições autorais de forró pé-de-serra com sanfona, zabumba e triângulo.', tecnica: 'Forró tradicional' },
      { title: 'EP "Nas Serras"', year: '2021', img: IMG_CONCERT, desc: 'EP ao vivo gravado no coração da Serra de Itabaiana.', tecnica: 'Forró / MPB' },
      { title: 'Participação — "Sergipe Canta"', year: '2020', img: IMG_FESTIVAL, desc: 'Coletânea estadual com 20 artistas sergipanos.', tecnica: 'Voz e violão' },
    ],
  },
  {
    id: 'josefa',
    name: 'Josefa Nascimento',
    city: 'São Cristóvão · SE',
    linguagem: 'literatura',
    bio: 'Escritora e pesquisadora das tradições orais sergipanas. Autora de 6 livros que resgatam lendas e histórias das comunidades do interior.',
    bioFull: 'Josefa Nascimento é professora doutora e escritora nascida em São Cristóvão. Pesquisa há 25 anos as tradições orais do interior sergipano, coletando histórias de benzedeiras, mestres de reisado e repentistas. Seus livros são adotados em escolas públicas do Estado e ela é membro honorária da Academia Sergipana de Letras.',
    photo: IMG_WRITER,
    coverPhoto: IMG_CHURCH,
    awards: ' Academia Sergipana de Letras 2020',
    years: '25 anos de trajetória',
    instagram: '@josefa.nascimento.se',
    works: [
      { title: '"Contos da Caatinga"', year: '2024', img: IMG_WRITER, desc: 'Coletânea de 22 contos baseados em narrativas orais do sertão sergipano.', tecnica: 'Conto literário' },
      { title: '"A Benzedeira de Brejo Grande"', year: '2022', img: IMG_RIVER, desc: 'Romance sobre uma mulher sábia e sua comunidade ribeirinha.', tecnica: 'Romance' },
      { title: '"Lendas de Sergipe"', year: '2019', img: IMG_CHURCH, desc: 'Compilação ilustrada de lendas tradicionais sergipanas para jovens leitores.', tecnica: 'Literatura infantojuvenil' },
    ],
  },
  {
    id: 'karoline',
    name: 'Karoline Ferreira',
    city: 'Aracaju · SE',
    linguagem: 'danca',
    bio: 'Coreógrafa e bailarina, diretora do Grupo Sergipano de Danças Populares. Referência na preservação do reisado e do samba de pareia.',
    bioFull: 'Karoline Ferreira fundou o Grupo Sergipano de Danças Populares em 2008 com jovens da periferia de Aracaju. O grupo já se apresentou em mais de 15 países, levando a cultura sergipana para palcos internacionais. Karoline documenta e preserva mais de 30 manifestações culturais sergipanas em risco de desaparecimento.',
    photo: IMG_DANCE,
    coverPhoto: IMG_FESTIVAL,
    awards: ' Prêmio Funarte 2022',
    years: '16 anos de trajetória',
    instagram: '@karoline.danca.se',
    works: [
      { title: '"Raízes" — Espetáculo', year: '2024', img: IMG_DANCE, desc: 'Espetáculo de dança contemporânea com base nas danças populares sergipanas.', tecnica: 'Dança contemporânea / Folclore' },
      { title: 'Samba de Pareia em Cena', year: '2022', img: IMG_FESTIVAL, desc: 'Registro e reencenação do samba de pareia da comunidade de Tobias Barreto.', tecnica: 'Dança popular' },
      { title: 'Workshop Internacional', year: '2023', img: IMG_THEATER, desc: 'Masterclass de danças populares nordestinas — Lisboa, Portugal.', tecnica: 'Pedagogia do movimento' },
    ],
  },
  {
    id: 'manoel',
    name: 'Manoel Ribeiro',
    city: 'Laranjeiras · SE',
    linguagem: 'escultura',
    bio: 'Escultor em pedra-sabão e madeira que recria a imaginária religiosa e os santos populares do catolicismo popular sergipano.',
    bioFull: 'Manoel Ribeiro aprendeu a esculpir com seu pai, que era entalhador de retábulos em igrejas coloniais do Vale do Cotinguiba. Hoje, aos 68 anos, é um dos últimos mestres vivos da imaginária popular sergipana. Suas obras integram acervos de museus e igrejas históricas do Brasil e do exterior.',
    photo: IMG_SCULPTOR,
    coverPhoto: IMG_CHURCH,
    awards: ' Mestre da Cultura Sergipana — SECULT 2018',
    years: '45 anos de trajetória',
    instagram: '@manoel.imaginaria.se',
    works: [
      { title: 'São Francisco do Sertão', year: '2024', img: IMG_SCULPTOR, desc: 'Escultura em cedro representando São Francisco de Assis com motivos sertanejos.', tecnica: 'Madeira entalhada e policromada' },
      { title: 'Nossa Senhora das Dores', year: '2023', img: IMG_CHURCH, desc: 'Imagem sacra em pedra-sabão encomendada para a Igreja de Laranjeiras.', tecnica: 'Pedra-sabão' },
      { title: 'Presépio do Rio São Francisco', year: '2022', img: IMG_ARTISAN, desc: 'Presépio com figuras que vestem roupas típicas do cangaço e da vida ribeirinha.', tecnica: 'Argila e tinta acrílica' },
    ],
  },
  {
    id: 'beatriz',
    name: 'Beatriz Campos',
    city: 'Estância · SE',
    linguagem: 'artesanato',
    bio: 'Rendeira de bilro que mantém viva a tradição da renda de agulha estanciana, técnica que corre o risco de desaparecer.',
    bioFull: 'Beatriz Campos é a mais jovem mestra de renda de bilro de Sergipe. Aprendeu a técnica com sua bisavó e transformou o artesanato em sua principal fonte de renda, além de lecionar em oficinas pelo Estado. Fundou a Associação de Rendeiras de Estância em 2018 e hoje coordena 40 artesãs.',
    photo: IMG_LACE,
    coverPhoto: IMG_ARTISAN,
    awards: ' Artesã do Ano — SEBRAE SE 2024',
    years: '12 anos de trajetória',
    instagram: '@beatriz.renda.se',
    works: [
      { title: 'Coleção "Mangue"', year: '2024', img: IMG_LACE, desc: 'Peças de renda inspiradas nos padrões e formas dos manguezais sergipanos.', tecnica: 'Renda de bilro' },
      { title: 'Véu Nupcial "Canavieira"', year: '2023', img: IMG_ARTISAN, desc: 'Véu artesanal com motivos da paisagem canavieira do sul de Sergipe.', tecnica: 'Renda de agulha e bilro' },
      { title: 'Instalação "Malha"', year: '2022', img: IMG_MARKET, desc: 'Instalação artística de grande escala com renda de bilro para exposição na BIENAL-NE.', tecnica: 'Renda de bilro / Arte contemporânea' },
    ],
  },
];

const STORIES: Story[] = [
  {
    id: 'foz-sao-francisco',
    category: 'FOLCLORE',
    title: 'A Foz do Rio São Francisco: onde o rio encontra o mar',
    intro: 'O lugar onde as águas doces e salgadas se encontram é sagrado para quilombolas, pescadores e ribeirinhos. Conheça as lendas que habitam esse ponto único do litoral sergipano.',
    body: [
      'A foz do Rio São Francisco, em Sergipe, é um dos encontros mais singulares da natureza brasileira: as águas marrons do "Velho Chico" disputam espaço com o azul do Atlântico numa dança de correntes que intriga visitantes e encanta moradores há séculos.',
      'Para os moradores de Brejo Grande, o rio é muito mais que uma fronteira entre Sergipe e Alagoas. É o pai provedor, o caminho dos ancestrais, a rota de fuga de escravizados que buscavam liberdade nos quilombos das margens.',
      'A lenda mais conhecida da região fala sobre a Mãe d\'Água, uma sereia de cabelos verdes que habita exatamente o ponto de encontro das águas. Segundo os pescadores mais velhos, nos dias de lua nova, é possível ouvi-la cantar no silêncio entre as ondas. Quem a seguir ao fundo das águas, dizem, aprende a arte de pescar com os olhos fechados.',
      'As comunidades quilombolas do entorno preservam rituais de agradecimento ao rio realizados semestralmente. Barcos enfeitados com flores e velas saem das margens ao entardecer enquanto rezas e cantos embalados pelo som do zabumba pedem pela fartura da pesca.',
    ],
    author: 'Equipe Sergipanidade',
    date: '12 mai 2025',
    img: IMG_RIVER,
    imgCaption: 'A foz do Rio São Francisco, entre Sergipe e Alagoas — um dos encontros mais singulares da natureza brasileira.',
    relatedImg: IMG_ARTISAN,
  },
  {
    id: 'candomble-nago',
    category: 'TRADIÇÃO',
    title: 'Candomblé Nagô em Sergipe: a força de uma tradição viva',
    intro: 'Os terreiros nagôs de Sergipe são um dos pilares da cultura afro-brasileira no Nordeste. Conheça a história da resistência e da espiritualidade que sobreviveu séculos de perseguição.',
    body: [
      'Em Sergipe, o candomblé nagô chegou com os africanos escravizados trazidos da região do atual Benim e da Nigéria. Com eles vieram os orixás, as cantigas, os ritmos, as folhas sagradas e toda uma cosmologia que resistiu a séculos de perseguição religiosa.',
      'Os mais antigos terreiros conhecidos do Estado datam do século XIX, localizados nos bairros históricas de Aracaju. Diferentemente do candomblé baiano, mais conhecido pelo grande público, o candomblé nagô sergipano manteve características muito particulares nos ritmos, nas vestimentas e na forma de conduzir os rituais.',
      'O pesquisador e babalorixá Pai Ilê de Aracaju explica que a preservação desses elementos deve-se à relativa menor pressão sofrida pelos terreiros sergipanos em comparação com outras regiões, o que permitiu uma transmissão mais fiel dos conhecimentos ancestrais.',
      'Hoje, o Candomblé Nagô de Sergipe está em processo de reconhecimento como patrimônio imaterial pelo IPHAN, numa vitória que representa décadas de luta de mães e pais de santo pela legitimação de suas práticas.',
    ],
    author: 'Colaboração especial — Profa. Dra. Josefa Nascimento',
    date: '28 abr 2025',
    img: IMG_DANCE,
    imgCaption: 'Cerimônia de candomblé nagô em um dos terreiros históricos de Aracaju.',
    relatedImg: IMG_FESTIVAL,
  },
  {
    id: 'renda-bilro',
    category: 'TRADIÇÃO',
    title: 'A Renda de Bilro de Estância: tecendo memória com linha e paciência',
    intro: 'Nas mãos de mestras como Beatriz Campos, filamentos de algodão se transformam em rendas delicadas que contam a história das mulheres do litoral sul sergipano.',
    body: [
      'A renda de bilro chegou ao litoral sergipano com os colonizadores portugueses no século XVIII, mas foi nas mãos das mulheres de Estância e Indiaroba que ganhou sua identidade única. Diferentemente da renda europeia, a renda sergipana incorpora motivos locais: folhas de mangue, flores do agreste, peixes e estrelas-do-mar.',
      'O processo é laborioso. Sobre uma almofada cilíndrica, a rendeira manipula dezenas de bilros — pequenos bastões de madeira com linhas enroladas — trançando-os em sequências precisas que formam padrões transmitidos de geração em geração apenas pela memória visual.',
      'Nos anos 1980, o risco de extinção era real. Com a chegada dos rendados industriais baratos, muitas mestras abandonaram o ofício. Foi a organização em associações comunitárias, apoiada pelo SEBRAE e pela FUNESC, que reverteu esse processo ao criar mercados regionais e nacionais para a renda artesanal.',
      'Hoje, a Associação de Rendeiras de Estância tem 40 membros e lista de espera para novos cursos. A renda voltou a ser orgulho — e renda.',
    ],
    author: 'Equipe Sergipanidade',
    date: '05 mai 2025',
    img: IMG_LACE,
    imgCaption: 'Mãos de mestra rendeira em Estância: o trabalho de horas que se transforma em arte delicada.',
    relatedImg: IMG_ARTISAN,
  },
  {
    id: 'culinaria-sergipana',
    category: 'GASTRONOMIA',
    title: 'O Dendê e a Culinária Sergipana: entre o mar e o sertão',
    intro: 'A comida sergipana é uma síntese da diversidade do Estado: o frutos do mar do litoral, o bode e o cará do sertão, e o dendê que veio da África para ficar.',
    body: [
      'Poucos estados brasileiros têm uma culinária tão genuinamente híbrida quanto Sergipe. Em menos de 280 km, passamos da culinária litorânea — farta em crustáceos, frutos do mar e leite de coco — para a cozinha sertaneja, baseada no milho, no feijão e na carne seca.',
      'O elemento que une essas cozinhas é o dendê, óleo extraído do fruto da palmeira azeeiro, trazido pelos africanos escravizados. Em Sergipe, o dendê aparece no moqueca, no sarapatel, no arroz-de-coco e em inúmeras preparações que não têm nomes nos dicionários mas estão gravadas no paladar de qualquer sergipano.',
      'A "moqueca sergipana" é um ponto de honra local. Diferente da capixaba e da baiana, usa menos azeite-de-dendê e incorpora o coco-de-bode (fruto nativo) como espessante. O resultado é um caldo mais leve mas igualmente perfumado.',
      'No Mercado Municipal Thales Ferraz, em Aracaju, as barracas da Avenida da Cultura são o melhor laboratório para entender essa riqueza. Buchada, sarapatel, carne de sol com manteiga de garrafa, mungunzá de milho verde — uma aula de história em cada prato.',
    ],
    author: 'Equipe Sergipanidade',
    date: '18 abr 2025',
    img: IMG_MARKET,
    imgCaption: 'O Mercado Municipal Thales Ferraz, em Aracaju: a alma gastronômica de Sergipe.',
    relatedImg: IMG_RIVER,
  },
];

const EVENTS: CulturaEvent[] = [
  {
    id: 'festival-bom-gosto',
    name: 'Festival Bom Gosto 2025',
    type: 'Festival',
    day: '15', month: 'JUN',
    local: 'Orla de Atalaia',
    city: 'Aracaju',
    desc: 'O maior festival gastronômico de Sergipe reúne mais de 80 expositores, shows culturais e oficinas de culinária tradicional.',
    img: IMG_FESTIVAL,
    free: true,
    online: false,
    thisWeek: false,
  },
  {
    id: 'expo-cores',
    name: 'Exposição "Cores de Sergipe"',
    type: 'Exposição',
    day: '20', month: 'JUN',
    local: 'Museu da Gente Sergipana',
    city: 'Aracaju',
    desc: 'Mostra coletiva com 30 artistas sergipanos explorando a paleta visual do Estado — do verde dos manguezais ao vermelho do sertão.',
    img: IMG_MUSEUM,
    free: false,
    online: false,
    thisWeek: true,
  },
  {
    id: 'forro-liberdade',
    name: 'Forró da Liberdade',
    type: 'Show',
    day: '01', month: 'JUL',
    local: 'Praça Fausto Cardoso',
    city: 'Aracaju',
    desc: 'Noite de forró pé-de-serra com seis bandas sergipanas ao ar livre. Sanfona, zabumba e triângulo do pôr do sol à meia-noite.',
    img: IMG_CONCERT,
    free: true,
    online: false,
    thisWeek: false,
  },
  {
    id: 'sao-joao-laranjeiras',
    name: 'São João de Laranjeiras',
    type: 'Festival',
    day: '24', month: 'JUN',
    local: 'Centro Histórico',
    city: 'Laranjeiras',
    desc: 'O mais tradicional São João do interior sergipano, com danças de reisado, quadrilha junina, bandas de pífano e toda a magia do interior.',
    img: IMG_DANCE,
    free: true,
    online: false,
    thisWeek: false,
  },
  {
    id: 'teatro-nupeart',
    name: 'Espetáculo "Nordeste Encena"',
    type: 'Teatro',
    day: '05', month: 'JUL',
    local: 'Teatro Atheneu',
    city: 'Aracaju',
    desc: 'Festival de teatro nordestino com grupos do PA, CE, RN, PB e SE apresentando montagens contemporâneas baseadas em textos da literatura regional.',
    img: IMG_THEATER,
    free: false,
    online: false,
    thisWeek: false,
  },
  {
    id: 'feira-artesanato',
    name: 'Feira Nacional do Artesanato',
    type: 'Feira',
    day: '28', month: 'JUN',
    local: 'Centro de Convenções',
    city: 'Aracaju',
    desc: 'Quatro dias de feira com artesãos de todo o Brasil. Cerâmica, bordado, couro, madeira e muito mais numa vitrine da produção artesanal nacional.',
    img: IMG_MARKET,
    free: false,
    online: false,
    thisWeek: false,
  },
];

const HERITAGE: Heritage[] = [
  {
    id: 'sao-cristovao',
    name: 'Centro Histórico de São Cristóvão',
    type: 'PATRIMÔNIO MATERIAL',
    year: '2010',
    institute: 'UNESCO',
    desc: 'A quarta cidade mais antiga do Brasil, com conjunto arquitetônico colonial que inclui igrejas, conventos e casarões do século XVII. Inscrita no Patrimônio Mundial da Humanidade.',
    img: IMG_CHURCH,
    height: 'tall',
  },
  {
    id: 'lambe-sujos',
    name: 'Dança dos Lambe-Sujos e Caboclinhos',
    type: 'PATRIMÔNIO IMATERIAL',
    year: '2009',
    institute: 'IPHAN',
    desc: 'Manifestação cultural única de Laranjeiras que encena simbolicamente a história da escravidão com máscaras, chocalhos e cantos rituais.',
    img: IMG_DANCE,
    height: 'normal',
  },
  {
    id: 'museu-gente',
    name: 'Museu da Gente Sergipana',
    type: 'PATRIMÔNIO MATERIAL',
    year: '2011',
    institute: 'SECULT-SE',
    desc: 'Museu interativo instalado no Solar Moreira Lima que conta a história do povo sergipano através de tecnologia e objetos de memória. Um dos mais visitados do Nordeste.',
    img: IMG_MUSEUM,
    height: 'normal',
  },
  {
    id: 'festas-laranjeiras',
    name: 'Festas de Laranjeiras',
    type: 'PATRIMÔNIO IMATERIAL',
    year: '2006',
    institute: 'IPHAN',
    desc: 'Conjunto de 14 manifestações culturais do município de Laranjeiras — de folguedos afro-brasileiros a danças de origem indígena — tombadas como patrimônio imaterial do Brasil.',
    img: IMG_FESTIVAL,
    height: 'tall',
  },
  {
    id: 'ceramica-itabaiana',
    name: 'Cerâmica Artesanal de Itabaiana',
    type: 'PATRIMÔNIO IMATERIAL',
    year: '2017',
    institute: 'IPHAN-SE',
    desc: 'Tradição ceramista transmitida há séculos nas famílias da Serra de Itabaiana. Peças utilitárias e decorativas moldadas com argila local usando técnicas pré-colombianas.',
    img: IMG_ARTISAN,
    height: 'normal',
  },
  {
    id: 'ruinas-cottia',
    name: 'Ruínas Históricas do Vale do Cotinguiba',
    type: 'PATRIMÔNIO MATERIAL',
    year: '1987',
    institute: 'IPHAN',
    desc: 'Conjunto de ruínas de engenhos e casarões do ciclo do açúcar no vale do Cotinguiba. Testemunhos arquitetônicos do apogeu econômico sergipano nos séculos XVIII e XIX.',
    img: IMG_HERITAGE,
    height: 'normal',
  },
];

// ─── LANGUAGE ICONS MAP ───────────────────────────────────────
const LINGUA_ICON: Record<ArtistFilter, typeof Music> = {
  todos: Shapes,
  artesanato: Scissors,
  pintura: Palette,
  fotografia: Camera,
  musica: Music,
  literatura: BookOpen,
  danca: Footprints,
  escultura: Shapes,
};

const LINGUA_LABEL: Record<ArtistFilter, string> = {
  todos: 'Todos',
  artesanato: 'Artesanato',
  pintura: 'Pintura',
  fotografia: 'Fotografia',
  musica: 'Música',
  literatura: 'Literatura',
  danca: 'Dança',
  escultura: 'Escultura',
};

const EVENT_TYPES = ['Todos', 'Festival', 'Exposição', 'Show', 'Teatro', 'Feira', 'Gastronomia'];
const EVENT_QUICK = [
  { id: 'semana', label: 'Próximos 7 dias' },
  { id: 'gratuito', label: 'Gratuitos' },
  { id: 'presencial', label: 'Presenciais' },
];

// ─── COMPONENT ───────────────────────────────────────────────
interface CulturaScreenProps {
  onToast: (msg: string) => void;
  language?: 'pt' | 'en' | 'es';
}

export function CulturaScreen({ onToast }: CulturaScreenProps) {
  const [activeTab, setActiveTab] = useState<CulturaTab>('artistas');
  const [artistFilter, setArtistFilter] = useState<ArtistFilter>('todos');
  const [eventType, setEventType] = useState('Todos');
  const [eventQuick, setEventQuick] = useState<string[]>([]);
  const [eventsView, setEventsView] = useState<'lista' | 'calendario'>('lista');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<Artist['works'][0] | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedArtist, selectedStory]);

  const filteredArtists = ARTISTS.filter((a) => {
    const matchFilter = artistFilter === 'todos' || a.linguagem === artistFilter;
    const matchSearch = !searchTerm || a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.city.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filteredEvents = EVENTS.filter((e) => {
    const matchType = eventType === 'Todos' || e.type === eventType;
    const matchQuick = eventQuick.every((q) => {
      if (q === 'semana') return e.thisWeek;
      if (q === 'gratuito') return e.free;
      if (q === 'presencial') return !e.online;
      return true;
    });
    const matchSearch = !searchTerm || e.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchQuick && matchSearch;
  });

  const filteredStories = STORIES.filter((s) =>
    !searchTerm || s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Artist Detail ──────────────────────────────────────────
  if (selectedArtist) {
    const related = ARTISTS.filter((a) => a.id !== selectedArtist.id).slice(0, 3);
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: 'var(--branco)',
          paddingTop: 'calc(56px + env(safe-area-inset-top))',
          paddingBottom: 'calc(72px + env(safe-area-inset-bottom))',
        }}
      >
        {/* Back */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 pb-2">
          <button
            onClick={() => setSelectedArtist(null)}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer min-h-[44px] hover:opacity-70 transition-opacity"
            style={{ color: '#0D7377', fontSize: '14px' }}
          >
            <ArrowLeft size={18} />
            Voltar aos artistas
          </button>
        </div>

        {/* Cover */}
        <div className="relative h-[320px] sm:h-[400px] overflow-hidden">
          <ImageWithFallback src={selectedArtist.coverPhoto} alt="Capa" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* Header info */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="relative flex items-end gap-5 -mt-14 mb-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0 bg-[var(--cinza-leve)]">
              <ImageWithFallback src={selectedArtist.photo} alt={selectedArtist.name} className="w-full h-full object-cover" />
            </div>
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-['Fjalla_One'] text-white drop-shadow-lg" style={{ fontSize: '28px' }}>
                  {selectedArtist.name}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-white font-bold uppercase tracking-wider"
                  style={{ backgroundColor: '#0D7377', fontSize: '11px' }}
                >
                  {LINGUA_LABEL[selectedArtist.linguagem as ArtistFilter]}
                </span>
              </div>
            </div>
          </div>

          {/* Post-cover row */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-1.5" style={{ color: '#0D7377', fontSize: '14px' }}>
              <MapPin size={15} />
              <span>{selectedArtist.city}</span>
            </div>
            <span className="text-[var(--cinza-txt)] text-sm">{selectedArtist.awards}</span>
            <span className="text-[var(--cinza-txt)] text-sm">{selectedArtist.years}</span>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-[14px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] mb-8 max-w-3xl">
            <p style={{ color: '#4A4A4A', fontSize: '15px', lineHeight: 1.8 }}>
              {selectedArtist.bioFull}
            </p>
          </div>

          {/* Works */}
          <h2 className="font-['Fjalla_One'] mb-1" style={{ color: '#1A1A1A', fontSize: '22px' }}>
            Obras em destaque
          </h2>
          <p className="mb-5" style={{ color: '#8A8A8A', fontSize: '14px' }}>
            Clique em uma obra para ver em destaque
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {selectedArtist.works.map((work, i) => (
              <button
                key={i}
                onClick={() => setSelectedArtwork(work)}
                className="group text-left bg-white rounded-[14px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                           hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-200
                           border-none cursor-pointer"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <ImageWithFallback src={work.img} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Eye size={28} color="white" className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-semibold mb-0.5" style={{ color: '#1A1A1A', fontSize: '14px' }}>{work.title}</p>
                  <p style={{ color: '#8A8A8A', fontSize: '12px' }}>{work.tecnica} · {work.year}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Social links */}
          <div className="bg-white rounded-[14px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] mb-8">
            <h3 className="font-semibold mb-4" style={{ color: '#1A1A1A', fontSize: '16px' }}>
              Onde encontrar
            </h3>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Instagram, label: selectedArtist.instagram, href: '#' },
                { icon: Globe, label: 'Site pessoal', href: '#' },
                { icon: Mail, label: 'E-mail', href: '#' },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={(e) => { e.preventDefault(); onToast(`🔗 Abrindo ${label}`); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all min-h-[44px]"
                  style={{ borderColor: '#D9D9D9', color: '#0D7377', fontSize: '13px' }}
                >
                  <Icon size={15} />
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Related artists */}
          <h2 className="font-['Fjalla_One'] mb-5" style={{ color: '#1A1A1A', fontSize: '22px' }}>
            Outros artistas que você pode gostar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-8">
            {related.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedArtist(a)}
                className="text-left bg-white rounded-[14px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                           hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-200
                           border-none cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <ImageWithFallback src={a.photo} alt={a.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="font-semibold" style={{ color: '#1A1A1A', fontSize: '14px' }}>{a.name}</p>
                  <p style={{ color: '#8A8A8A', fontSize: '12px' }}>{LINGUA_LABEL[a.linguagem as ArtistFilter]} · {a.city}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Artwork Lightbox */}
        {selectedArtwork && (
          <div className="fixed inset-0 z-[990] flex items-center justify-center p-4" onClick={() => setSelectedArtwork(null)}>
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
            <div
              className="relative bg-white rounded-[14px] overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <ImageWithFallback src={selectedArtwork.img} alt={selectedArtwork.title} className="w-full max-h-[50vh] object-cover" />
                <button
                  onClick={() => setSelectedArtwork(null)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center border-none cursor-pointer hover:bg-black/80 transition-colors"
                >
                  <X size={16} color="white" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <h3 className="font-['Fjalla_One'] mb-1" style={{ color: '#1A1A1A', fontSize: '22px' }}>
                  {selectedArtwork.title}
                </h3>
                <p className="mb-3" style={{ color: '#0D7377', fontSize: '13px', fontWeight: 600 }}>
                  {selectedArtwork.tecnica} · {selectedArtwork.year}
                </p>
                <p style={{ color: '#4A4A4A', fontSize: '15px', lineHeight: 1.7 }}>
                  {selectedArtwork.desc}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Story Detail ───────────────────────────────────────────
  if (selectedStory) {
    const related = STORIES.filter((s) => s.id !== selectedStory.id).slice(0, 3);
    const catColor = '#0D7377';
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: 'var(--branco)',
          paddingTop: 'calc(56px + env(safe-area-inset-top))',
          paddingBottom: 'calc(72px + env(safe-area-inset-bottom))',
        }}
      >
        {/* Back */}
        <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-6 pb-2">
          <button
            onClick={() => setSelectedStory(null)}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer min-h-[44px] hover:opacity-70 transition-opacity"
            style={{ color: '#0D7377', fontSize: '14px' }}
          >
            <ArrowLeft size={18} />
            Voltar às histórias
          </button>
        </div>

        {/* Hero */}
        <div className="relative h-[300px] sm:h-[420px] overflow-hidden">
          <ImageWithFallback src={selectedStory.img} alt={selectedStory.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-10 max-w-3xl mx-auto">
            <span
              className="inline-block px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-4 text-white"
              style={{ backgroundColor: catColor, fontSize: '11px' }}
            >
              {selectedStory.category}
            </span>
            <h1
              className="font-['Fjalla_One'] text-white leading-tight mb-2"
              style={{ fontSize: 'clamp(22px, 4vw, 36px)' }}
            >
              {selectedStory.title}
            </h1>
          </div>
        </div>

        {/* Meta */}
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-5 border-b" style={{ borderColor: '#D9D9D9' }}>
          <p style={{ color: '#8A8A8A', fontSize: '13px' }}>
            Por <strong style={{ color: '#1A1A1A' }}>{selectedStory.author}</strong> · {selectedStory.date}
          </p>
        </div>

        {/* Body */}
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
          <p
            className="mb-8 leading-relaxed font-medium"
            style={{ color: '#1A1A1A', fontSize: '18px', lineHeight: 1.7 }}
          >
            {selectedStory.intro}
          </p>

          {selectedStory.body.map((paragraph, i) => (
            <div key={i}>
              {i === 1 && (
                <div className="my-8">
                  <div className="rounded-[14px] overflow-hidden mb-2">
                    <ImageWithFallback src={selectedStory.relatedImg} alt="Ilustração" className="w-full max-h-[340px] object-cover" />
                  </div>
                  <p style={{ color: '#8A8A8A', fontSize: '13px' }} className="text-center italic">
                    {selectedStory.imgCaption}
                  </p>
                </div>
              )}
              <p
                className="mb-6"
                style={{ color: '#4A4A4A', fontSize: '16px', lineHeight: 1.9 }}
              >
                {paragraph}
              </p>
            </div>
          ))}
        </div>

        {/* More stories */}
        <div className="bg-[var(--cinza-leve)] py-12 px-4 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-['Fjalla_One'] mb-6" style={{ color: '#1A1A1A', fontSize: '24px' }}>
              Explore mais histórias
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStory(s)}
                  className="text-left bg-white rounded-[14px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                             hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-200
                             border-none cursor-pointer"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <ImageWithFallback src={s.img} alt={s.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <span className="text-[#0D7377] font-bold uppercase tracking-wider block mb-1.5" style={{ fontSize: '10px' }}>
                      {s.category}
                    </span>
                    <p className="font-semibold leading-tight" style={{ color: '#1A1A1A', fontSize: '14px' }}>
                      {s.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Pin Component ────────────────────────────────────────────
  const CategoryPin = ({ Icon, isActive }: { Icon: LucideIcon; isActive?: boolean }) => (
    <div className="relative flex items-center justify-center" style={{ width: 28, height: 36 }}>
      {/* Pin shape */}
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14 0C6.26801 0 0 6.26801 0 14C0 21.732 14 36 14 36C14 36 28 21.732 28 14C28 6.26801 21.732 0 14 0Z"
          fill={isActive ? '#0D7377' : '#D9D9D9'}
          style={{ transition: 'fill 0.2s' }}
        />
      </svg>
      {/* Icon inside pin */}
      <div className="absolute" style={{ top: 6 }}>
        <Icon size={14} color="#FFFFFF" strokeWidth={2.5} />
      </div>
    </div>
  );

  // ── Main Screen ────────────────────────────────────────────
  const TABS: { id: CulturaTab; label: string; Icon: LucideIcon }[] = [
    { id: 'artistas', label: 'Artistas', Icon: Palette },
    { id: 'historias', label: 'Histórias', Icon: BookOpen },
    { id: 'eventos', label: 'Eventos', Icon: Tent },
    { id: 'patrimonio', label: 'Patrimônio', Icon: Landmark },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--branco)',
        paddingTop: 'calc(56px + env(safe-area-inset-top))',
        paddingBottom: 'calc(72px + env(safe-area-inset-bottom))',
      }}
    >
      {/* ── HEADER ESTÁTICO ── */}
      <div className="relative w-full h-[480px] overflow-hidden flex items-center justify-center">
        {/* Foto de fundo */}
        <ImageWithFallback
          src={imgCultura}
          alt="Cultura Sergipana"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay escuro */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.65) 100%)' }}
        />

        {/* Conteúdo centralizado */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-5 sm:px-12 mt-4">

          {/* Título */}
          <h1
            className="text-white mb-4 leading-tight font-bold"
            style={{ fontSize: 'clamp(32px, 6vw, 52px)', maxWidth: '700px' }}
          >
            A alma de Sergipe em forma de arte e história
          </h1>

          {/* Subtítulo */}
          <p
            className="mb-10 mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.75)', fontSize: '17px', maxWidth: '600px' }}
          >
            Conheça os artistas, as histórias e os eventos que fazem Sergipe único
          </p>

          {/* Search bar */}
          <div className="flex gap-2 w-full mx-auto" style={{ maxWidth: '560px' }}>
            <div className="relative flex-1 bg-white flex items-center shadow-lg" style={{ borderRadius: '8px' }}>
              <Search size={18} className="absolute left-4 pointer-events-none" style={{ color: '#8A8A8A' }} />
              <input
                type="text"
                placeholder="Buscar artista, história, evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 h-[50px] outline-none border-none bg-transparent"
                style={{ color: '#1A1A1A', fontSize: '15px', borderRadius: '8px' }}
              />
            </div>
            <button
              onClick={() => onToast(`Buscando: "${searchTerm}"`)}
              className="px-6 font-bold tracking-widest uppercase border-none cursor-pointer transition-colors flex items-center justify-center"
              style={{ backgroundColor: '#0D7377', color: '#FFFFFF', fontSize: '14px', minWidth: '120px', minHeight: '50px', borderRadius: '8px' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0A5E62')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0D7377')}
            >
              EXPLORAR
            </button>
          </div>
        </div>

        {/* Transição fade sutil para o conteúdo na parte inferior */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, #F7F6F3 100%)' }}
        />
      </div>

      {/* ── STICKY TABS ── */}
      <div
        ref={tabsRef}
        className="sticky z-[80] bg-white overflow-x-auto"
        style={{
          top: 'calc(56px + env(safe-area-inset-top))',
          borderBottom: '1px solid #D9D9D9',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex max-w-5xl mx-auto px-4 sm:px-8">
          {TABS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="relative flex items-center gap-2.5 px-4 sm:px-5 py-4 whitespace-nowrap
                           bg-transparent border-none cursor-pointer min-h-[52px] transition-colors"
                style={{ color: isActive ? '#0D7377' : '#8A8A8A' }}
              >
                <CategoryPin Icon={Icon} isActive={isActive} />
                <span style={{
                  fontFamily: 'Urbanist, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  letterSpacing: '0.02em'
                }}>
                  {label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full" style={{ backgroundColor: '#0D7377' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">

        {/* ── ARTISTAS ── */}
        {activeTab === 'artistas' && (
          <div>
            <div className="mb-8">
              <h2 className="font-['Fjalla_One'] mb-1" style={{ color: '#1A1A1A', fontSize: '28px' }}>
                Talentos de Sergipe
              </h2>
              <p style={{ color: '#4A4A4A', fontSize: '15px' }}>
                Artistas locais que carregam a identidade cultural sergipana em cada obra
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-8">
              {(Object.keys(LINGUA_LABEL) as ArtistFilter[]).map((key) => {
                const Icon = LINGUA_ICON[key];
                const isActive = artistFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setArtistFilter(key)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border whitespace-nowrap cursor-pointer transition-all min-h-[40px]"
                    style={{
                      backgroundColor: isActive ? '#0D7377' : '#FFFFFF',
                      borderColor: isActive ? '#0D7377' : '#D9D9D9',
                      color: isActive ? '#FFFFFF' : '#4A4A4A',
                      fontSize: '13px',
                    }}
                  >
                    <Icon size={13} />
                    {LINGUA_LABEL[key]}
                  </button>
                );
              })}
            </div>

            {/* Artists grid */}
            {filteredArtists.length === 0 ? (
              <div className="text-center py-20" style={{ color: '#8A8A8A' }}>
                <Shapes size={40} className="mx-auto mb-3 opacity-30" />
                <p style={{ fontSize: '16px' }}>Nenhum artista encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredArtists.map((artist) => (
                  <div
                    key={artist.id}
                    className="bg-white rounded-[14px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                               hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Photo */}
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <ImageWithFallback
                        src={artist.photo}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Badge */}
                      <div
                        className="absolute top-3 left-3 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
                        style={{ backgroundColor: '#EEEDE9', color: '#1A1A1A', fontSize: '10px' }}
                      >
                        {LINGUA_LABEL[artist.linguagem as ArtistFilter]}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3 className="font-semibold mb-1" style={{ color: '#1A1A1A', fontSize: '16px' }}>
                        {artist.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mb-3" style={{ color: '#0D7377', fontSize: '13px' }}>
                        <MapPin size={13} />
                        <span>{artist.city}</span>
                      </div>
                      <p className="mb-3 line-clamp-2" style={{ color: '#4A4A4A', fontSize: '13px', lineHeight: 1.6 }}>
                        {artist.bio}
                      </p>
                      <p className="mb-4" style={{ color: '#8A8A8A', fontSize: '12px' }}>
                        {artist.awards} · {artist.years}
                      </p>
                      <button
                        onClick={() => setSelectedArtist(artist)}
                        className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer font-semibold min-h-[36px] transition-colors hover:gap-2.5"
                        style={{ color: '#0D7377', fontSize: '13px' }}
                      >
                        Ver perfil completo
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HISTÓRIAS ── */}
        {activeTab === 'historias' && (
          <div>
            <div className="mb-8">
              <h2 className="font-['Fjalla_One'] mb-1" style={{ color: '#1A1A1A', fontSize: '28px' }}>
                Raízes Sergipanas
              </h2>
              <p style={{ color: '#4A4A4A', fontSize: '15px' }}>
                Lendas, tradições e personagens que moldaram a identidade de Sergipe
              </p>
            </div>

            <div className="flex flex-col gap-8">
              {filteredStories.map((story, i) => {
                const imageLeft = i % 2 === 0;
                return (
                  <div
                    key={story.id}
                    className={`bg-white rounded-[14px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                                hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] transition-shadow
                                flex flex-col ${imageLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}
                  >
                    {/* Image — 45% */}
                    <div className="sm:w-[45%] h-[220px] sm:h-auto overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={story.img}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
                      <span
                        className="inline-block mb-3 px-3 py-1 rounded-full font-bold uppercase tracking-wider w-fit"
                        style={{ backgroundColor: 'rgba(13,115,119,0.10)', color: '#0D7377', fontSize: '11px' }}
                      >
                        {story.category}
                      </span>
                      <h3
                        className="font-['Fjalla_One'] mb-3 leading-tight"
                        style={{ color: '#1A1A1A', fontSize: '22px' }}
                      >
                        {story.title}
                      </h3>
                      <p
                        className="mb-4 line-clamp-3"
                        style={{ color: '#4A4A4A', fontSize: '14px', lineHeight: 1.7 }}
                      >
                        {story.intro}
                      </p>
                      <p className="mb-5" style={{ color: '#8A8A8A', fontSize: '12px' }}>
                        Por <strong style={{ color: '#1A1A1A' }}>{story.author}</strong> · {story.date}
                      </p>
                      <button
                        onClick={() => setSelectedStory(story)}
                        className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer font-semibold min-h-[36px] transition-all hover:gap-2.5 w-fit"
                        style={{ color: '#0D7377', fontSize: '14px' }}
                      >
                        Ler história completa
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── EVENTOS ── */}
        {activeTab === 'eventos' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="font-['Fjalla_One'] mb-1" style={{ color: '#1A1A1A', fontSize: '28px' }}>
                  Agenda Cultural
                </h2>
                <p style={{ color: '#4A4A4A', fontSize: '15px' }}>
                  Festivais, exposições, shows e celebrações em Sergipe
                </p>
              </div>
              {/* View toggle */}
              <div className="flex rounded-[10px] overflow-hidden border" style={{ borderColor: '#D9D9D9' }}>
                {(['lista', 'calendario'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setEventsView(v)}
                    className="px-4 py-2 capitalize border-none cursor-pointer transition-colors min-h-[40px]"
                    style={{
                      backgroundColor: eventsView === v ? '#0D7377' : '#FFFFFF',
                      color: eventsView === v ? '#FFFFFF' : '#4A4A4A',
                      fontSize: '13px',
                    }}
                  >
                    {v === 'lista' ? '☰ Lista' : '🗓 Calendário'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {EVENT_QUICK.map(({ id, label }) => {
                const isActive = eventQuick.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() =>
                      setEventQuick((prev) =>
                        isActive ? prev.filter((q) => q !== id) : [...prev, id]
                      )
                    }
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border cursor-pointer transition-all min-h-[38px]"
                    style={{
                      backgroundColor: isActive ? '#E6F4F4' : '#FFFFFF',
                      borderColor: isActive ? '#0D7377' : '#D9D9D9',
                      color: isActive ? '#0D7377' : '#4A4A4A',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Type filter pills */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-8">
              {EVENT_TYPES.map((type) => {
                const isActive = eventType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setEventType(type)}
                    className="flex-shrink-0 px-4 py-2 rounded-full border whitespace-nowrap cursor-pointer transition-all min-h-[38px]"
                    style={{
                      backgroundColor: isActive ? '#1A1A1A' : '#FFFFFF',
                      borderColor: isActive ? '#1A1A1A' : '#D9D9D9',
                      color: isActive ? '#FFFFFF' : '#4A4A4A',
                      fontSize: '13px',
                    }}
                  >
                    {type}
                  </button>
                );
              })}
            </div>

            {eventsView === 'lista' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredEvents.length === 0 ? (
                  <div className="col-span-2 text-center py-20" style={{ color: '#8A8A8A' }}>
                    <Ticket size={40} className="mx-auto mb-3 opacity-30" />
                    <p style={{ fontSize: '16px' }}>Nenhum evento encontrado com esses filtros</p>
                  </div>
                ) : filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-[14px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                               hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <ImageWithFallback src={event.img} alt={event.name} className="w-full h-full object-cover" />
                      {/* Type badge */}
                      <div
                        className="absolute top-3 left-3 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
                        style={{ backgroundColor: '#EEEDE9', color: '#1A1A1A', fontSize: '10px' }}
                      >
                        {event.type.toUpperCase()}
                      </div>
                      {event.free && (
                        <div
                          className="absolute top-3 right-3 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
                          style={{ backgroundColor: '#E6F4F4', color: '#0D7377', fontSize: '10px' }}
                        >
                          GRATUITO
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      {/* Date */}
                      <div className="flex items-baseline gap-1.5 mb-3">
                        <span className="font-['Fjalla_One']" style={{ color: '#0D7377', fontSize: '28px', lineHeight: 1 }}>
                          {event.day}
                        </span>
                        <span className="font-bold uppercase" style={{ color: '#0D7377', fontSize: '14px' }}>
                          {event.month}
                        </span>
                      </div>

                      <h3 className="font-semibold mb-2 leading-tight" style={{ color: '#1A1A1A', fontSize: '16px' }}>
                        {event.name}
                      </h3>

                      <div className="flex items-center gap-1.5 mb-3" style={{ color: '#0D7377', fontSize: '13px' }}>
                        <MapPin size={13} />
                        <span>{event.local} · {event.city}</span>
                      </div>

                      <p className="mb-4 line-clamp-2" style={{ color: '#4A4A4A', fontSize: '13px', lineHeight: 1.6 }}>
                        {event.desc}
                      </p>

                      <button
                        onClick={() => onToast(`🎟️ Saiba mais: ${event.name}`)}
                        className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer font-semibold min-h-[36px] transition-all hover:gap-2.5"
                        style={{ color: '#0D7377', fontSize: '13px' }}
                      >
                        Saiba mais
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Calendário view — simplified */
              <div className="bg-white rounded-[14px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <div className="text-center mb-6">
                  <h3 className="font-['Fjalla_One']" style={{ color: '#1A1A1A', fontSize: '22px' }}>
                    Junho / Julho 2025
                  </h3>
                </div>
                <div className="space-y-3">
                  {filteredEvents.sort((a, b) => parseInt(a.day) - parseInt(b.day)).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 p-4 rounded-[10px] hover:bg-[var(--cinza-leve)] transition-colors cursor-pointer"
                      onClick={() => onToast(`📅 ${event.name}`)}
                    >
                      <div
                        className="flex-shrink-0 w-14 h-14 rounded-[10px] flex flex-col items-center justify-center"
                        style={{ backgroundColor: '#F5EDE6' }}
                      >
                        <span className="font-['Fjalla_One']" style={{ color: '#0D7377', fontSize: '20px', lineHeight: 1 }}>
                          {event.day}
                        </span>
                        <span className="font-bold uppercase" style={{ color: '#0D7377', fontSize: '10px' }}>
                          {event.month}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate" style={{ color: '#1A1A1A', fontSize: '15px' }}>
                          {event.name}
                        </p>
                        <p className="truncate" style={{ color: '#8A8A8A', fontSize: '13px' }}>
                          {event.local} · {event.city}
                        </p>
                      </div>
                      <span
                        className="flex-shrink-0 px-2.5 py-1 rounded-full font-bold uppercase"
                        style={{ backgroundColor: '#EEEDE9', color: '#1A1A1A', fontSize: '10px' }}
                      >
                        {event.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PATRIMÔNIO ── */}
        {activeTab === 'patrimonio' && (
          <div>
            <div className="mb-8">
              <h2 className="font-['Fjalla_One'] mb-1" style={{ color: '#1A1A1A', fontSize: '28px' }}>
                Memória de Sergipe
              </h2>
              <p style={{ color: '#4A4A4A', fontSize: '15px' }}>
                Sítios históricos, patrimônios imateriais e tradições tombadas
              </p>
            </div>

            {/* Masonry-like grid */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
              {HERITAGE.map((item) => (
                <div
                  key={item.id}
                  className="break-inside-avoid bg-white rounded-[14px] overflow-hidden
                             shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                             hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5
                             transition-all duration-200 cursor-pointer"
                  onClick={() => onToast(`🏛️ Conhecendo: ${item.name}`)}
                >
                  <div
                    className="overflow-hidden"
                    style={{ height: item.height === 'tall' ? '260px' : '200px' }}
                  >
                    <ImageWithFallback
                      src={item.img}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    {/* Type badge */}
                    <span
                      className="inline-block mb-3 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: item.type === 'PATRIMÔNIO MATERIAL' ? 'rgba(13,115,119,0.10)' : '#E6F4F4',
                        color: '#0D7377',
                        fontSize: '10px',
                      }}
                    >
                      {item.type}
                    </span>
                    <h3 className="font-semibold mb-1.5 leading-tight" style={{ color: '#1A1A1A', fontSize: '15px' }}>
                      {item.name}
                    </h3>
                    <p className="mb-3" style={{ color: '#8A8A8A', fontSize: '12px' }}>
                      Tombado em {item.year} · {item.institute}
                    </p>
                    <p className="mb-4 line-clamp-3" style={{ color: '#4A4A4A', fontSize: '13px', lineHeight: 1.6 }}>
                      {item.desc}
                    </p>
                    <button
                      className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer font-semibold min-h-[36px] hover:gap-2.5 transition-all"
                      style={{ color: '#0D7377', fontSize: '13px' }}
                    >
                      Conhecer história
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
