import type { CategoryId, Experience, Floor, L, Mall, Offer, Product, Scene, Store, Variant } from "./types";

const l = (en: string, ar: string): L => ({ en, ar });

export const MALL: Mall = {
  id: "vistra-central",
  name: "VISTRA Central",
  description: l(
    "A spatial retail destination where architecture, brands and technology meet.",
    "وجهة تسوق مكانية تلتقي فيها العمارة والعلامات التجارية والتقنية.",
  ),
  floors: ["ground", "first"],
  heroImage: "/images/mall/hero.jpg",
  coordinates: { lat: "25.1972° N", lng: "55.2744° E" },
};

export const CATEGORIES: CategoryId[] = ["fashion", "electronics", "beauty", "jewelry", "home", "dining", "sports", "entertainment"];

export const FLOORS: Floor[] = [
  { id: "ground", name: l("Ground Floor", "الطابق الأرضي"), level: 0, scenes: ["entrance", "atrium", "fashion", "electronics", "luxury", "cafe"] },
  { id: "first", name: l("First Floor", "الطابق الأول"), level: 1, scenes: ["beauty", "home", "sports", "dining", "lounge"] },
];

const scene = (
  id: string,
  floorId: string,
  title: L,
  map: { x: number; y: number },
  connectedScenes: Scene["connectedScenes"],
  info: Scene["info"] = [],
): Scene => ({
  id,
  title,
  floorId,
  panorama: `/panoramas/${id}.jpg`,
  thumbnail: `/panoramas/${id}-thumb.jpg`,
  initialYaw: 0,
  initialPitch: 0,
  connectedScenes,
  info,
  map,
});

/**
 * The navigation graph. This is the ONLY place scene relationships are declared;
 * hotspots, the floor map and the thumbnails strip are all derived from it.
 */
export const SCENES: Scene[] = [
  scene("entrance", "ground", l("Main Entrance", "المدخل الرئيسي"), { x: 500, y: 520 }, [{ to: "atrium", anchor: "front" }]),
  scene("atrium", "ground", l("Grand Atrium", "الأتريوم الكبير"), { x: 500, y: 340 }, [
    { to: "entrance", anchor: "back" },
    { to: "fashion", anchor: "fashion-gate" },
    { to: "electronics", anchor: "electronics-gate" },
    { to: "luxury", anchor: "front" },
    { to: "beauty", anchor: "lift" },
  ], [{ id: "atrium-sculpture", anchor: "ped0", title: l("Light Sculpture", "منحوتة الضوء"), text: l("“Aperture” — a 6 m kinetic light installation that follows the rhythm of the day.", "«أبرتشر» — تركيب ضوئي متحرك بارتفاع ٦ أمتار يتبع إيقاع اليوم.") }]),
  scene("fashion", "ground", l("Fashion Avenue", "ممشى الأزياء"), { x: 230, y: 340 }, [{ to: "atrium", anchor: "back" }]),
  scene("electronics", "ground", l("Electronics District", "حي الإلكترونيات"), { x: 770, y: 340 }, [{ to: "atrium", anchor: "back" }]),
  scene("luxury", "ground", l("Luxury Gallery", "معرض الفخامة"), { x: 500, y: 140 }, [
    { to: "atrium", anchor: "back" },
    { to: "cafe", anchor: "cafe-gate" },
  ]),
  scene("cafe", "ground", l("Central Café", "المقهى المركزي"), { x: 770, y: 140 }, [{ to: "luxury", anchor: "back" }]),
  scene("beauty", "first", l("Beauty Boulevard", "شارع الجمال"), { x: 150, y: 340 }, [
    { to: "atrium", anchor: "lift-1" },
    { to: "home", anchor: "front" },
  ]),
  scene("home", "first", l("Home & Living", "المنزل والمعيشة"), { x: 370, y: 340 }, [
    { to: "beauty", anchor: "back" },
    { to: "sports", anchor: "front" },
  ]),
  scene("sports", "first", l("Sports Zone", "منطقة الرياضة"), { x: 590, y: 340 }, [
    { to: "home", anchor: "back" },
    { to: "dining", anchor: "front" },
  ]),
  scene("dining", "first", l("Dining Area", "منطقة المطاعم"), { x: 810, y: 340 }, [
    { to: "sports", anchor: "back" },
    { to: "lounge", anchor: "front" },
  ]),
  scene("lounge", "first", l("Entertainment Lounge", "صالة الترفيه"), { x: 810, y: 150 }, [{ to: "dining", anchor: "back" }]),
];

type StoreSeed = Omit<Store, "slug" | "coverImage" | "monogram" | "contact" | "socialLinks" | "featured"> & { featured?: boolean };
const S = (s: StoreSeed): Store => ({
  ...s,
  slug: s.id,
  coverImage: `/images/stores/${s.id}.jpg`,
  monogram: s.name.split(/[\s&]+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2),
  featured: !!s.featured,
  contact: { phone: "+971 4 555 01" + String(s.id.length).padStart(2, "0"), email: `hello@${s.id}.demo`, website: `https://${s.id}.example` },
  socialLinks: { instagram: `https://instagram.com/${s.id}`, x: `https://x.com/${s.id}` },
});

const H1 = l("Daily 10:00 – 22:00", "يوميًا ١٠:٠٠ – ٢٢:٠٠");
const H2 = l("Daily 10:00 – 23:00", "يوميًا ١٠:٠٠ – ٢٣:٠٠");
const H3 = l("Daily 08:00 – 23:30", "يوميًا ٠٨:٠٠ – ٢٣:٣٠");

export const STORES: Store[] = [
  S({ id: "atelier-noir", name: "ATELIER NOIR", tagline: l("Tailoring, in black.", "الخياطة بلون الأسود."), category: "fashion", floorId: "ground", sceneId: "fashion", bay: "atelier-noir", color: "#e7e3da", featured: true, hours: H1, map: { x: 110, y: 380, w: 150, h: 90 },
    description: l("Monochrome ready-to-wear and made-to-measure tailoring cut from Italian wool and Japanese cotton.", "ملابس جاهزة وخياطة حسب الطلب بدرجات أحادية من الصوف الإيطالي والقطن الياباني.") }),
  S({ id: "haute-line", name: "HAUTE LINE", tagline: l("Accessories with a pulse.", "إكسسوارات نابضة بالحياة."), category: "fashion", floorId: "ground", sceneId: "fashion", bay: "haute-line", color: "#ffb39b", hours: H1, map: { x: 110, y: 200, w: 150, h: 90 },
    description: l("Silk scarves, leather goods and footwear in a palette of warm tones.", "أوشحة حريرية ومنتجات جلدية وأحذية بألوان دافئة.") }),
  S({ id: "orbit-tech", name: "ORBIT TECH", tagline: l("Tomorrow, unboxed.", "المستقبل بين يديك."), category: "electronics", floorId: "ground", sceneId: "electronics", bay: "orbit-tech", color: "#7be7f5", featured: true, hours: H2, map: { x: 720, y: 380, w: 150, h: 90 },
    description: l("The latest smartphones, wearables and ultralight laptops with hands-on demo stations.", "أحدث الهواتف والأجهزة القابلة للارتداء وأجهزة اللابتوب الخفيفة مع محطات تجربة مباشرة.") }),
  S({ id: "aura-audio", name: "AURA AUDIO", tagline: l("Hear it differently.", "اسمعها بشكل مختلف."), category: "electronics", floorId: "ground", sceneId: "electronics", bay: "aura-audio", color: "#b49bff", hours: H2, map: { x: 720, y: 200, w: 150, h: 90 },
    description: l("Reference headphones and spatial speakers in a private listening lounge.", "سماعات مرجعية ومكبرات صوت مكانية داخل صالة استماع خاصة.") }),
  S({ id: "velora", name: "VELORA", tagline: l("Quiet luxury, set in gold.", "فخامة هادئة مرصعة بالذهب."), category: "jewelry", floorId: "ground", sceneId: "luxury", bay: "velora", color: "#c8a96a", featured: true, hours: H1, map: { x: 340, y: 40, w: 140, h: 90 },
    description: l("Fine jewellery and haute horlogerie crafted by hand in small editions.", "مجوهرات راقية وساعات فاخرة مصنوعة يدويًا بإصدارات محدودة.") }),
  S({ id: "cafe-lumen", name: "CAFÉ LUMEN", tagline: l("Slow coffee, bright rooms.", "قهوة هادئة وأجواء مضيئة."), category: "dining", floorId: "ground", sceneId: "cafe", bay: "cafe-lumen", color: "#ffbe6e", hours: H3, map: { x: 840, y: 40, w: 130, h: 80 },
    description: l("Specialty coffee, pastry and breakfast served beneath a sculptural skylight.", "قهوة مختصة ومعجنات وإفطار يُقدَّم تحت سقف زجاجي منحوت.") }),
  S({ id: "maison-eclat", name: "MAISON ÉCLAT", tagline: l("The art of radiance.", "فن الإشراق."), category: "beauty", floorId: "first", sceneId: "beauty", bay: "maison-eclat", color: "#ffc8d7", featured: true, hours: H1, map: { x: 60, y: 200, w: 150, h: 90 },
    description: l("Skincare, fragrance and colour from a Parisian house with a laboratory heart.", "عناية بالبشرة وعطور ومكياج من دار باريسية بروح مخبرية.") }),
  S({ id: "form-living", name: "FORM & LIVING", tagline: l("Objects for slow living.", "قطع لحياة هادئة."), category: "home", floorId: "first", sceneId: "home", bay: "form-living", color: "#e6cfa6", hours: H1, map: { x: 290, y: 380, w: 170, h: 90 },
    description: l("Sculptural furniture, lighting and ceramics in natural materials.", "أثاث وإضاءة وخزف بتصاميم نحتية من مواد طبيعية.") }),
  S({ id: "kinetic", name: "KINETIC", tagline: l("Built to move.", "صُنع للحركة."), category: "sports", floorId: "first", sceneId: "sports", bay: "kinetic", color: "#ff6a3c", hours: H2, map: { x: 510, y: 200, w: 160, h: 90 },
    description: l("Performance footwear, apparel and gear with a gait-analysis studio.", "أحذية وملابس ومعدات أداء مع استوديو لتحليل الحركة.") }),
  S({ id: "nomad-table", name: "NOMAD TABLE", tagline: l("Dinner, without borders.", "عشاء بلا حدود."), category: "dining", floorId: "first", sceneId: "dining", bay: "nomad-table", color: "#ffaf64", featured: true, hours: H3, map: { x: 730, y: 380, w: 170, h: 90 },
    description: l("A tasting-menu restaurant tracing spice routes from Marrakech to Kyoto.", "مطعم قوائم تذوق يتتبع طرق التوابل من مراكش إلى كيوتو.") }),
  S({ id: "pulse-arcade", name: "PULSE ARCADE", tagline: l("Play, amplified.", "اللعب بحلة جديدة."), category: "entertainment", floorId: "first", sceneId: "lounge", bay: "pulse-arcade", color: "#c35bff", hours: H2, map: { x: 720, y: 60, w: 160, h: 90 },
    description: l("VR arenas, retro cabinets and a neon lounge for all ages.", "ساحات واقع افتراضي وأجهزة كلاسيكية وصالة نيون لجميع الأعمار.") }),
];

const V = (en: string, ar: string, swatch: string): Variant => ({ name: l(en, ar), swatch });
const BLACK = V("Black", "أسود", "#16161a"), IVORY = V("Ivory", "عاجي", "#e9e5dc"), GOLD = V("Champagne", "شامبانيا", "#c8a96a"), SILVER = V("Silver", "فضي", "#aab2bf");

type PSeed = [slug: string, storeId: string, bayIdx: 0 | 1 | 2, name: L, desc: L, price: number, discount: number | undefined, category: CategoryId, variants: Variant[], isNew?: boolean];
const PRODUCT_SEEDS: PSeed[] = [
  ["noir-wool-coat", "atelier-noir", 0, l("Noir Wool Overcoat", "معطف نوار الصوفي"), l("Double-faced Italian wool with a clean, structured line.", "صوف إيطالي مزدوج الوجه بخط نظيف ومنظم."), 890, 690, "fashion", [BLACK, V("Charcoal", "فحمي", "#3a3a40")]],
  ["noir-leather-tote", "atelier-noir", 1, l("Noir Leather Tote", "حقيبة نوار الجلدية"), l("Full-grain leather tote with a champagne-gold clasp.", "حقيبة من الجلد الطبيعي بإبزيم شامبانيا ذهبي."), 540, undefined, "fashion", [BLACK, V("Cognac", "كونياك", "#8a5a36")], true],
  ["noir-court-sneaker", "atelier-noir", 2, l("Court Sneaker", "حذاء كورت الرياضي"), l("A minimalist leather sneaker, hand-finished in Portugal.", "حذاء جلدي بسيط بتشطيب يدوي في البرتغال."), 260, 195, "fashion", [IVORY, BLACK]],
  ["haute-silk-scarf", "haute-line", 0, l("Silk Twill Scarf", "وشاح الحرير التويل"), l("Hand-rolled edges and a bold geometric print.", "حواف مطوية يدويًا ونقشة هندسية جريئة."), 180, undefined, "fashion", [V("Ruby", "ياقوتي", "#b8454f"), GOLD]],
  ["haute-crossbody", "haute-line", 1, l("Soft Crossbody", "حقيبة كروس ناعمة"), l("Butter-soft leather with an adjustable chain strap.", "جلد ناعم كالزبدة مع حزام سلسلة قابل للتعديل."), 420, 336, "fashion", [V("Sand", "رملي", "#d9b99b"), BLACK]],
  ["haute-loafer", "haute-line", 2, l("Penny Loafer", "حذاء بيني لوفر"), l("A classic loafer reworked with a sculpted heel.", "لوفر كلاسيكي بكعب منحوت."), 310, undefined, "fashion", [V("Oxblood", "عنابي", "#5a2d22"), BLACK]],
  ["orbit-phone-x", "orbit-tech", 0, l("Orbit Phone X", "أوربت فون إكس"), l("6.7″ edge-to-edge display, titanium frame and a 3-day battery.", "شاشة ٦٫٧ بوصة بلا حواف وإطار تيتانيوم وبطارية تدوم ٣ أيام."), 1099, 999, "electronics", [V("Graphite", "جرافيت", "#1c2230"), SILVER], true],
  ["orbit-watch-s", "orbit-tech", 1, l("Orbit Watch S", "ساعة أوربت إس"), l("Sapphire glass, ECG and a week of battery life.", "زجاج ياقوتي وتخطيط قلب وبطارية تدوم أسبوعًا."), 449, undefined, "electronics", [SILVER, BLACK]],
  ["orbit-book-air", "orbit-tech", 2, l("Orbit Book Air 14", "أوربت بوك إير ١٤"), l("14″ ultralight laptop weighing 980 g.", "لابتوب خفيف ١٤ بوصة بوزن ٩٨٠ جرامًا."), 1399, 1199, "electronics", [SILVER, V("Midnight", "منتصف الليل", "#1c2230")]],
  ["aura-halo-headphones", "aura-audio", 0, l("Halo Headphones", "سماعات هالو"), l("Adaptive noise cancelling with 40 h playback.", "عزل ضوضاء تكيفي وتشغيل ٤٠ ساعة."), 399, 319, "electronics", [BLACK, IVORY]],
  ["aura-orb-speaker", "aura-audio", 1, l("Orb Spatial Speaker", "مكبر أورب المكاني"), l("360° sound in a sculptural form.", "صوت ٣٦٠ درجة بتصميم نحتي."), 299, undefined, "electronics", [V("Violet", "بنفسجي", "#2b2742"), IVORY], true],
  ["aura-studio-headphones", "aura-audio", 2, l("Studio Reference", "ستوديو ريفرنس"), l("Open-back reference headphones tuned for critical listening.", "سماعات مفتوحة الخلف للاستماع الدقيق."), 549, undefined, "electronics", [IVORY, BLACK]],
  ["velora-solitaire-ring", "velora", 0, l("Solitaire Ring", "خاتم سوليتير"), l("A 0.8 ct diamond set in recycled 18k gold.", "ألماسة ٠٫٨ قيراط بذهب عيار ١٨ معاد تدويره."), 3200, undefined, "jewelry", [GOLD, SILVER]],
  ["velora-pearl-necklace", "velora", 1, l("Akoya Pearl Necklace", "قلادة لؤلؤ أكويا"), l("Hand-knotted pearls with an 18k clasp.", "لؤلؤ معقود يدويًا بإبزيم ذهب ١٨."), 1450, 1160, "jewelry", [IVORY]],
  ["velora-chrono", "velora", 2, l("Velora Chronograph", "ساعة فيلورا كرونوغراف"), l("Automatic movement in a 39 mm gold case.", "حركة أوتوماتيكية بعلبة ذهبية ٣٩ مم."), 6800, undefined, "jewelry", [GOLD], true],
  ["lumen-signature-latte", "cafe-lumen", 0, l("Signature Latte", "لاتيه لومين الخاص"), l("Double ristretto with silky oat milk and cardamom.", "ريستريتو مزدوج مع حليب الشوفان والهيل."), 6, undefined, "dining", [V("Hot", "ساخن", "#8a5a36"), V("Iced", "بارد", "#bfefff")]],
  ["lumen-pastry-box", "cafe-lumen", 1, l("Morning Pastry Box", "علبة معجنات الصباح"), l("Six pastries baked at dawn.", "ست معجنات تُخبز عند الفجر."), 24, 19, "dining", [V("Classic", "كلاسيكي", "#d9b88a")]],
  ["lumen-cold-brew", "cafe-lumen", 2, l("Cold Brew Reserve", "كولد برو ريزيرف"), l("18-hour steeped single origin.", "قهوة أحادية المصدر منقوعة ١٨ ساعة."), 8, undefined, "dining", [V("Black", "أسود", "#2a1d17")]],
  ["eclat-glow-serum", "maison-eclat", 0, l("Éclat Glow Serum", "سيروم إيكلا للإشراق"), l("Vitamin C and niacinamide for visible radiance.", "فيتامين C ونياسيناميد لإشراقة ظاهرة."), 120, 96, "beauty", [V("30 ml", "٣٠ مل", "#f4d6dc"), V("50 ml", "٥٠ مل", "#f1c1cb")]],
  ["eclat-noir-perfume", "maison-eclat", 1, l("Éclat Noir Eau de Parfum", "عطر إيكلا نوار"), l("Oud, amber and black pepper.", "عود وعنبر وفلفل أسود."), 210, undefined, "beauty", [V("50 ml", "٥٠ مل", "#1b1b1f"), V("100 ml", "١٠٠ مل", "#2b2b30")], true],
  ["eclat-velvet-cream", "maison-eclat", 2, l("Velvet Night Cream", "كريم الليل المخملي"), l("Peptide-rich overnight repair.", "ترميم ليلي غني بالببتيدات."), 95, undefined, "beauty", [V("50 ml", "٥٠ مل", "#f1e4de")]],
  ["form-arc-chair", "form-living", 0, l("Arc Lounge Chair", "كرسي أرك"), l("Solid oak frame with a curved bouclé seat.", "إطار من البلوط الصلب ومقعد منحني من البوكليه."), 1250, 990, "home", [V("Oak", "بلوط", "#b08968"), IVORY]],
  ["form-halo-lamp", "form-living", 1, l("Halo Table Lamp", "مصباح هالو"), l("Hand-blown glass with a warm diffused glow.", "زجاج منفوخ يدويًا بإضاءة دافئة منتشرة."), 340, undefined, "home", [IVORY, GOLD]],
  ["form-stone-vase", "form-living", 2, l("Stone Vase", "مزهرية حجرية"), l("Textured stoneware, glazed inside.", "خزف محبب ومطلي من الداخل."), 120, undefined, "home", [V("Slate", "أردوازي", "#8c8478"), IVORY]],
  ["kinetic-velocity-runner", "kinetic", 0, l("Velocity Runner", "حذاء فيلوسيتي للجري"), l("Carbon-plated racing shoe, 198 g.", "حذاء سباق بصفيحة كربون وزن ١٩٨ جرامًا."), 240, 192, "sports", [V("Flare", "ناري", "#ff6a3c"), BLACK], true],
  ["kinetic-pro-bottle", "kinetic", 1, l("Pro Insulated Bottle", "زجاجة برو المعزولة"), l("Keeps drinks cold for 24 hours.", "تحافظ على برودة المشروبات ٢٤ ساعة."), 38, undefined, "sports", [V("Slate", "أردوازي", "#2b3a4a")]],
  ["kinetic-trail-pack", "kinetic", 2, l("Trail Pack 20L", "حقيبة تريل ٢٠ لتر"), l("Lightweight trail pack with a hydration sleeve.", "حقيبة خفيفة للمسارات مع جيب للمياه."), 140, undefined, "sports", [V("Moss", "طحلبي", "#33433a")]],
  ["nomad-tasting-menu", "nomad-table", 0, l("Seven-Course Tasting", "قائمة التذوق السباعية"), l("A journey along the spice routes, with optional pairing.", "رحلة على طرق التوابل مع خيار المشروبات المرافقة."), 145, undefined, "dining", [V("Classic", "كلاسيكي", "#e7e3da"), V("With pairing", "مع المشروبات", "#8f3b2a")]],
  ["nomad-saffron-bowl", "nomad-table", 1, l("Saffron Lamb Bowl", "طبق لحم بالزعفران"), l("Slow-cooked lamb, saffron rice and pomegranate.", "لحم مطهو ببطء مع أرز بالزعفران ورمان."), 32, 26, "dining", [V("Regular", "عادي", "#d99a2b")]],
  ["nomad-spiced-tea", "nomad-table", 2, l("Spiced Tea Service", "خدمة الشاي بالتوابل"), l("Cardamom, cinnamon and black tea for two.", "هيل وقرفة وشاي أسود لشخصين."), 18, undefined, "dining", [V("For two", "لشخصين", "#a5472a")]],
  ["pulse-vr-headset", "pulse-arcade", 0, l("VR Arena Session", "جلسة ساحة الواقع الافتراضي"), l("60 minutes in a free-roam VR arena.", "٦٠ دقيقة في ساحة واقع افتراضي مفتوحة."), 35, 28, "entertainment", [V("60 min", "٦٠ دقيقة", "#1a1030")], true],
  ["pulse-game-pad", "pulse-arcade", 1, l("Arcade Credit Pack", "حزمة رصيد الألعاب"), l("100 credits for every cabinet in the lounge.", "١٠٠ رصيد لكل أجهزة الصالة."), 20, undefined, "entertainment", [V("100", "١٠٠", "#241a44")]],
  ["pulse-day-pass", "pulse-arcade", 2, l("Neon Day Pass", "تذكرة نيون اليومية"), l("Unlimited play from open to close.", "لعب غير محدود من الافتتاح حتى الإغلاق."), 55, undefined, "entertainment", [V("Day", "يوم", "#ff50c8")]],
];

const storeById = (id: string) => STORES.find((s) => s.id === id)!;

export const PRODUCTS: Product[] = PRODUCT_SEEDS.map(([slug, storeId, bayIdx, name, description, price, discountPrice, category, variants, newArrival]) => {
  const st = storeById(storeId);
  return {
    id: slug,
    slug,
    name,
    storeId,
    category,
    images: [`/images/products/${slug}.jpg`],
    price,
    discountPrice,
    description,
    variants,
    hotspotId: `${st.bay}#${bayIdx}`,
    sceneId: st.sceneId,
    newArrival,
  };
});

export const OFFERS: Offer[] = [
  { id: "seasonal-edit", title: l("The VISTRA Seasonal Edit", "إصدار فيسترا الموسمي"), description: l("Up to 30% across fashion, beauty and home — curated for the season.", "خصومات تصل إلى ٣٠٪ على الأزياء والجمال والمنزل — مختارة للموسم."), storeId: "maison-eclat", discount: 30, startDate: "2026-11-01", endDate: "2026-12-31", image: "/images/campaigns/seasonal-edit.jpg", campaign: true },
  { id: "winter-tailoring", title: l("Winter Tailoring", "خياطة الشتاء"), description: l("Overcoats and knitwear, tailored for the cold.", "معاطف وملابس صوفية مفصلة لأجواء البرد."), storeId: "atelier-noir", productId: "noir-wool-coat", discount: 22, startDate: "2026-11-01", endDate: "2026-12-15", image: "/images/campaigns/winter-tailoring.jpg", campaign: true },
  { id: "sound-season", title: l("Sound Season", "موسم الصوت"), description: l("Headphones and speakers at special prices.", "سماعات ومكبرات صوت بأسعار خاصة."), storeId: "aura-audio", productId: "aura-halo-headphones", discount: 20, startDate: "2026-11-05", endDate: "2026-11-30", image: "/images/campaigns/sound-season.jpg", campaign: true },
  { id: "gold-hour", title: l("The Gold Hour", "ساعة الذهب"), description: l("Pearls and fine pieces for gifting season.", "لآلئ وقطع فاخرة لموسم الهدايا."), storeId: "velora", productId: "velora-pearl-necklace", discount: 20, startDate: "2026-11-10", endDate: "2026-12-24", image: "/images/campaigns/gold-hour.jpg", campaign: true },
  ...PRODUCTS.filter((p) => p.discountPrice && !["noir-wool-coat", "aura-halo-headphones", "velora-pearl-necklace"].includes(p.id)).map<Offer>((p, i) => ({
    id: `offer-${p.id}`,
    title: p.name,
    description: p.description,
    storeId: p.storeId,
    productId: p.id,
    discount: Math.round((1 - p.discountPrice! / p.price) * 100),
    startDate: "2026-11-01",
    endDate: ["2026-11-30", "2026-12-10", "2026-12-31"][i % 3],
    image: p.images[0],
  })),
];

export const EXPERIENCES: Experience[] = [
  { id: "grand-atrium", title: l("The Grand Atrium", "الأتريوم الكبير"), tagline: l("A 24-metre skylit heart.", "قلب مضيء بارتفاع ٢٤ مترًا."), image: "/images/mall/atrium.jpg", sceneId: "atrium", tone: "#7be7f5" },
  { id: "luxury-avenue", title: l("Luxury Avenue", "جادة الفخامة"), tagline: l("Gold, marble and quiet.", "ذهب ورخام وهدوء."), image: "/images/mall/luxury-avenue.jpg", sceneId: "luxury", tone: "#c8a96a" },
  { id: "fashion-district", title: l("The Fashion District", "حي الأزياء"), tagline: l("Runways, reimagined.", "منصات عرض بحلة جديدة."), image: "/images/mall/fashion-district.jpg", sceneId: "fashion", tone: "#e7e3da" },
  { id: "technology-zone", title: l("Technology Zone", "منطقة التقنية"), tagline: l("Touch what's next.", "المس ما هو قادم."), image: "/images/mall/technology-zone.jpg", sceneId: "electronics", tone: "#7be7f5" },
  { id: "dining-boulevard", title: l("Dining Boulevard", "جادة المطاعم"), tagline: l("Where the evening begins.", "حيث يبدأ المساء."), image: "/images/mall/dining-boulevard.jpg", sceneId: "dining", tone: "#ffaf64" },
  { id: "lifestyle-gallery", title: l("Lifestyle Gallery", "معرض نمط الحياة"), tagline: l("Objects with a story.", "قطع لكل منها حكاية."), image: "/images/mall/lifestyle-gallery.jpg", sceneId: "home", tone: "#e6cfa6" },
];
