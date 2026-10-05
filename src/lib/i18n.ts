import type { Lang } from "./form";

// Option arrays are index-aligned with ROLES/INTERESTS/DIRECTIONS/INTENTS in form.ts:
// the visitor sees their language, the DB always stores the Russian value, so Excel stays filterable.
export type Dict = {
  label: string;
  title: string;
  q: string[];
  other: string;
  submit: string;
  saved: string;
  pending: string;
  allSent: string;
  needContact: string;
  roles: string[];
  interests: string[];
  directions: string[];
  intents: string[];
};

export const DICT: Record<Lang, Dict> = {
  ru: {
    label: "RU",
    title: "Анкета iRidi",
    q: ["Имя", "Компания", "Кто вы?", "Что интересует на стенде iRidi", "Интересующие направления",
      "Что интересует", "Телефон", "Email", "Выслать/сделать после выставки"],
    other: "Другое",
    submit: "Сохранить анкету",
    saved: "Анкета сохранена",
    pending: "Ждут отправки",
    allSent: "Всё отправлено",
    needContact: "Укажите телефон или email",
    roles: ["интегратор", "дизайнер, архитектор", "электрик, слаботочник", "застройщик, девелопер",
      "проектировщик", "частное лицо, смотрю для себя", "заказчик от юр. лица",
      "инженер по эксплуатации", "продавец УД, ЭУИ, инженерки"],
    interests: ["материалы о продуктах", "ищу себе инсталлятора", "обучающие курсы",
      "ищу вендора как инсталлятор", "хочу стать дистрибьютором",
      "договориться о презентации pre-sale менеджера"],
    directions: ["SmartHome", "Коммерция, AV", "МКД", "Отели", "BMS"],
    intents: ["Нужно КП, презентация, встреча или партнерство", "Будущие планы",
      "Смотрю, что есть на рынке"],
  },
  en: {
    label: "EN",
    title: "iRidi questionnaire",
    q: ["Name", "Company", "Who are you?", "What interests you at the iRidi booth", "Areas of interest",
      "What are you looking for", "Phone", "Email", "Send / do after the exhibition"],
    other: "Other",
    submit: "Save",
    saved: "Saved",
    pending: "Waiting to sync",
    allSent: "All synced",
    needContact: "Enter a phone number or email",
    roles: ["System integrator", "Designer, architect", "Electrician, low-voltage installer",
      "Property developer", "Design engineer", "Private person, looking for myself",
      "Client representing a company", "Facility engineer",
      "Reseller of smart home, wiring devices, building systems"],
    interests: ["Product materials", "Looking for an installer", "Training courses",
      "I'm an installer looking for a vendor", "Want to become a distributor",
      "Book a presentation with a pre-sales manager"],
    directions: ["SmartHome", "Commercial, AV", "Apartment buildings", "Hotels", "BMS"],
    intents: ["Need a quote, presentation, meeting or partnership", "Future plans",
      "Just looking at what's on the market"],
  },
  de: {
    label: "DE",
    title: "iRidi Fragebogen",
    q: ["Name", "Firma", "Wer sind Sie?", "Was interessiert Sie am iRidi-Stand", "Interessensbereiche",
      "Was suchen Sie", "Telefon", "E-Mail", "Nach der Messe senden / erledigen"],
    other: "Sonstiges",
    submit: "Speichern",
    saved: "Gespeichert",
    pending: "Warten auf Übertragung",
    allSent: "Alles übertragen",
    needContact: "Bitte Telefon oder E-Mail angeben",
    roles: ["Systemintegrator", "Designer, Architekt", "Elektriker, Schwachstrominstallateur",
      "Bauträger, Projektentwickler", "Fachplaner", "Privatperson, für mich selbst",
      "Auftraggeber (Unternehmen)", "Betriebsingenieur, Facility Manager",
      "Händler für Smart Home, Elektroinstallation, Haustechnik"],
    interests: ["Produktunterlagen", "Suche einen Installateur", "Schulungen",
      "Installateur, suche einen Hersteller", "Möchte Distributor werden",
      "Präsentation mit einem Pre-Sales-Manager vereinbaren"],
    directions: ["SmartHome", "Gewerbe, AV", "Mehrfamilienhäuser", "Hotels", "BMS"],
    intents: ["Brauche Angebot, Präsentation, Termin oder Partnerschaft", "Zukünftige Pläne",
      "Schaue mich auf dem Markt um"],
  },
  zh: {
    label: "中文",
    title: "iRidi 调查问卷",
    q: ["姓名", "公司", "您的身份", "您对 iRidi 展台的哪些内容感兴趣", "感兴趣的方向",
      "您的需求", "电话", "电子邮箱", "展会后需要发送/跟进的内容"],
    other: "其他",
    submit: "保存",
    saved: "已保存",
    pending: "等待同步",
    allSent: "已全部同步",
    needContact: "请填写电话或电子邮箱",
    roles: ["系统集成商", "设计师、建筑师", "电工、弱电工程师", "开发商", "设计工程师",
      "个人，为自己了解", "企业客户", "运维工程师", "智能家居、电气安装产品、建筑设备经销商"],
    interests: ["产品资料", "寻找安装商", "培训课程", "作为安装商寻找供应商", "希望成为分销商",
      "预约售前经理演示"],
    directions: ["SmartHome", "商业、AV", "住宅楼", "酒店", "BMS"],
    intents: ["需要报价、演示、会面或合作", "未来计划", "了解市场现状"],
  },
};
