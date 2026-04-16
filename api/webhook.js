const { Bot, InlineKeyboard } = require("grammy");
const Groq = require("groq-sdk");

// --- Инициализация ---
const bot = new Bot(process.env.BOT_TOKEN);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `Ты — эксперт-консультант по банковским гарантиям в России.
Отвечай кратко, понятным языком, по делу. Максимум 1500 символов.
Если вопрос не связан с банковскими гарантиями, тендерами или госзакупками — вежливо скажи, что специализируешься только на этой теме.
Используй актуальное законодательство (44-ФЗ, 223-ФЗ).
Не давай конкретных юридических рекомендаций — предлагай обратиться к специалисту для конкретного случая.`;

// --- Главное меню ---
function mainMenu() {
  return new InlineKeyboard()
    .text("Что такое БГ?", "what_is_bg")
    .text("Виды гарантий", "types")
    .row()
    .text("Как получить?", "how_to_get")
    .text("Документы", "documents")
    .row()
    .text("Стоимость", "cost")
    .text("Сроки", "terms")
    .row()
    .text("44-ФЗ и 223-ФЗ", "laws")
    .text("Частые вопросы", "faq");
}

// --- /start ---
bot.command("start", async (ctx) => {
  await ctx.reply(
    "Здравствуйте! Я бот-консультант по банковским гарантиям.\n\n" +
      "Выберите тему из меню или задайте вопрос текстом — я постараюсь помочь с помощью ИИ.",
    { reply_markup: mainMenu() }
  );
});

bot.command("menu", async (ctx) => {
  await ctx.reply("Главное меню:", { reply_markup: mainMenu() });
});

// --- База знаний ---
const knowledge = {
  what_is_bg: {
    title: "Что такое банковская гарантия?",
    text:
      "Банковская гарантия (БГ) — это обязательство банка выплатить заказчику определённую сумму, " +
      "если исполнитель (принципал) не выполнит условия контракта.\n\n" +
      "Участники:\n" +
      "• Принципал — исполнитель, который получает гарантию\n" +
      "• Бенефициар — заказчик, в чью пользу выдана гарантия\n" +
      "• Гарант — банк, который выдаёт гарантию\n\n" +
      "БГ используется в госзакупках, коммерческих тендерах и договорных отношениях.",
    buttons: () =>
      new InlineKeyboard()
        .text("Виды гарантий", "types")
        .text("Как получить?", "how_to_get")
        .row()
        .text("Назад в меню", "back_menu"),
  },

  types: {
    title: "Виды банковских гарантий",
    text:
      "Основные виды БГ:\n\n" +
      "1. Гарантия участия в тендере — обеспечение заявки (0.5–5% от НМЦ)\n\n" +
      "2. Гарантия исполнения контракта — обеспечение выполнения обязательств (5–30% от цены контракта)\n\n" +
      "3. Гарантия возврата аванса — гарантирует возврат авансового платежа при неисполнении\n\n" +
      "4. Гарантия гарантийных обязательств — обеспечение гарантийного периода после выполнения работ",
    buttons: () =>
      new InlineKeyboard()
        .text("Стоимость", "cost")
        .text("Документы", "documents")
        .row()
        .text("Назад в меню", "back_menu"),
  },

  how_to_get: {
    title: "Как получить банковскую гарантию?",
    text:
      "Порядок получения БГ:\n\n" +
      "1. Подготовить пакет документов\n" +
      "2. Подать заявку в банк (или через брокера)\n" +
      "3. Банк проверяет компанию (1–5 дней)\n" +
      "4. Согласование условий и подписание договора\n" +
      "5. Оплата комиссии\n" +
      "6. Выпуск гарантии и внесение в реестр ЕИС\n\n" +
      "Через брокеров процесс обычно быстрее — от 1 дня.",
    buttons: () =>
      new InlineKeyboard()
        .text("Документы", "documents")
        .text("Стоимость", "cost")
        .row()
        .text("Назад в меню", "back_menu"),
  },

  documents: {
    title: "Необходимые документы",
    text:
      "Стандартный пакет документов:\n\n" +
      "• Учредительные документы (устав, ОГРН, ИНН)\n" +
      "• Бухгалтерская отчётность за последний период\n" +
      "• Карточка предприятия\n" +
      "• Паспорт руководителя\n" +
      "• Проект контракта или ссылка на закупку\n" +
      "• Справка об отсутствии задолженности по налогам\n" +
      "• Выписка из ЕГРЮЛ\n\n" +
      "Некоторые банки принимают заявки с минимальным набором — только ИНН и ссылка на закупку.",
    buttons: () =>
      new InlineKeyboard()
        .text("Как получить?", "how_to_get")
        .text("Стоимость", "cost")
        .row()
        .text("Назад в меню", "back_menu"),
  },

  cost: {
    title: "Стоимость банковской гарантии",
    text:
      "Комиссия банка обычно составляет:\n\n" +
      "• Обеспечение заявки: 1–5% от суммы гарантии\n" +
      "• Обеспечение контракта: 2–10% годовых\n" +
      "• Возврат аванса: 2–10% годовых\n\n" +
      "Факторы, влияющие на стоимость:\n" +
      "• Финансовое состояние компании\n" +
      "• Сумма и срок гарантии\n" +
      "• Опыт исполнения контрактов\n" +
      "• Наличие обеспечения (залог)\n\n" +
      "Минимальная стоимость на рынке — от 2% для надёжных компаний.",
    buttons: () =>
      new InlineKeyboard()
        .text("Как получить?", "how_to_get")
        .text("Сроки", "terms")
        .row()
        .text("Назад в меню", "back_menu"),
  },

  terms: {
    title: "Сроки оформления",
    text:
      "Сроки зависят от банка и суммы:\n\n" +
      "• Экспресс (через брокера): 1–3 дня\n" +
      "• Стандартно в банке: 3–10 рабочих дней\n" +
      "• Крупные суммы (от 50 млн): до 2–3 недель\n\n" +
      "Срок действия гарантии:\n" +
      "• Гарантия заявки: обычно 1–2 месяца\n" +
      "• Гарантия контракта: на срок контракта + 1 месяц\n" +
      "• Гарантийные обязательства: по условиям контракта",
    buttons: () =>
      new InlineKeyboard()
        .text("Стоимость", "cost")
        .text("Документы", "documents")
        .row()
        .text("Назад в меню", "back_menu"),
  },

  laws: {
    title: "44-ФЗ и 223-ФЗ",
    text:
      "Два основных закона о закупках:\n\n" +
      "44-ФЗ — госзакупки:\n" +
      "• БГ обязательна из реестра Минфина\n" +
      "• Размер обеспечения заявки: 0.5–5% от НМЦ\n" +
      "• Обеспечение контракта: 5–30%\n" +
      "• Гарантия вносится в реестр ЕИС\n\n" +
      "223-ФЗ — закупки госкомпаний:\n" +
      "• Требования устанавливает сам заказчик\n" +
      "• Условия по БГ прописываются в положении о закупках\n" +
      "• Более гибкие требования к банкам",
    buttons: () =>
      new InlineKeyboard()
        .text("Виды гарантий", "types")
        .text("Частые вопросы", "faq")
        .row()
        .text("Назад в меню", "back_menu"),
  },

  faq: {
    title: "Частые вопросы",
    text: "Выберите вопрос:",
    buttons: () =>
      new InlineKeyboard()
        .text("Могут ли отказать?", "faq_reject")
        .row()
        .text("ИП может получить БГ?", "faq_ip")
        .row()
        .text("Что если банк лишили лицензии?", "faq_license")
        .row()
        .text("Кто создатель бота?", "faq_creator")
        .row()
        .text("План НКД по пилоту", "faq_nkd")
        .row()
        .text("Назад в меню", "back_menu"),
  },

  faq_reject: {
    title: "Могут ли отказать в выдаче БГ?",
    text:
      "Да, банк может отказать. Частые причины:\n\n" +
      "• Плохое финансовое состояние компании\n" +
      "• Компания в реестре недобросовестных поставщиков (РНП)\n" +
      "• Недостаточный опыт исполнения контрактов\n" +
      "• Задолженность по налогам\n" +
      "• Компания зарегистрирована менее 6 месяцев назад\n\n" +
      "Совет: если один банк отказал — попробуйте другой или обратитесь к брокеру.",
    buttons: () =>
      new InlineKeyboard()
        .text("Другие вопросы", "faq")
        .text("Назад в меню", "back_menu"),
  },

  faq_ip: {
    title: "Может ли ИП получить банковскую гарантию?",
    text:
      "Да, индивидуальные предприниматели могут получить БГ.\n\n" +
      "Условия для ИП обычно такие же, как для юрлиц, но:\n" +
      "• Комиссия может быть чуть выше\n" +
      "• Некоторые банки не работают с ИП\n" +
      "• Через брокеров обычно проще найти подходящий банк\n\n" +
      "Документы: те же + копия паспорта, свидетельство о регистрации ИП.",
    buttons: () =>
      new InlineKeyboard()
        .text("Другие вопросы", "faq")
        .text("Назад в меню", "back_menu"),
  },

  faq_creator: {
    title: "Создатель бота",
    text: "Этот бот создан Охапкиной Кристиной.",
    buttons: () =>
      new InlineKeyboard()
        .text("Другие вопросы", "faq")
        .text("Назад в меню", "back_menu"),
  },

  faq_nkd: {
    title: "Какой план НКД по пилоту?",
    text: "План на 2026 — 300 миллионов рублей.",
    buttons: () =>
      new InlineKeyboard()
        .text("Что имеем по факту?", "faq_nkd_fact")
        .row()
        .text("Другие вопросы", "faq")
        .text("Назад в меню", "back_menu"),
  },

  faq_nkd_fact: {
    title: "Что имеем по факту?",
    text: "50 миллионов.",
    buttons: () =>
      new InlineKeyboard()
        .text("Другие вопросы", "faq")
        .text("Назад в меню", "back_menu"),
  },

  faq_license: {
    title: "Что если банк лишили лицензии?",
    text:
      "Если у банка отозвали лицензию после выдачи БГ:\n\n" +
      "• По 44-ФЗ: нужно предоставить новое обеспечение в течение 1 месяца\n" +
      "• Заказчик не может расторгнуть контракт сразу\n" +
      "• Вы обязаны заменить гарантию за свой счёт\n\n" +
      "Совет: выбирайте банки из топ-50 рейтинга — у них минимальный риск отзыва лицензии.",
    buttons: () =>
      new InlineKeyboard()
        .text("Другие вопросы", "faq")
        .text("Назад в меню", "back_menu"),
  },
};

// --- Обработка inline-кнопок из базы знаний ---
for (const [key, item] of Object.entries(knowledge)) {
  bot.callbackQuery(key, async (ctx) => {
    await ctx.answerCallbackQuery();
    try {
      await ctx.editMessageText(`*${item.title}*\n\n${item.text}`, {
        parse_mode: "Markdown",
        reply_markup: item.buttons(),
      });
    } catch {
      await ctx.reply(`*${item.title}*\n\n${item.text}`, {
        parse_mode: "Markdown",
        reply_markup: item.buttons(),
      });
    }
  });
}

// Кнопка "Назад в меню"
bot.callbackQuery("back_menu", async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    await ctx.editMessageText(
      "Главное меню — выберите тему или задайте вопрос текстом:",
      { reply_markup: mainMenu() }
    );
  } catch {
    await ctx.reply("Главное меню:", { reply_markup: mainMenu() });
  }
});

// --- ИИ-ответы на текстовые вопросы ---
bot.on("message:text", async (ctx) => {
  const userText = ctx.message.text;

  if (userText.startsWith("/")) return;

  await ctx.replyWithChatAction("typing");

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userText },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 1024,
    });
    const response =
      chatCompletion.choices[0]?.message?.content ||
      "Не удалось сформировать ответ.";

    const keyboard = new InlineKeyboard()
      .text("Открыть меню", "back_menu")
      .text("Задать ещё вопрос", "ask_more");

    await ctx.reply(response, { reply_markup: keyboard });
  } catch (error) {
    console.error("Groq API error:", error.message);
    await ctx.reply(
      "Извините, не удалось получить ответ от ИИ. Попробуйте позже или выберите тему из меню.",
      { reply_markup: mainMenu() }
    );
  }
});

bot.callbackQuery("ask_more", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply("Задайте ваш вопрос по банковским гарантиям:");
});

// --- Инициализация бота (один раз за холодный старт) ---
let initialized = false;
async function initBot() {
  if (!initialized) {
    await bot.init();
    initialized = true;
  }
}

// --- Vercel webhook handler ---
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true });
  }

  try {
    await initBot();

    let update = req.body;
    if (typeof update === "string") {
      update = JSON.parse(update);
    }

    await bot.handleUpdate(update);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(200).json({ ok: true });
  }
};
