import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, type Schema } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

const recipeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Creative, poetic name of the drink in Chinese" },
    description: { type: Type.STRING, description: "Short poetic description of the mood in Chinese" },
    colorHex: { type: Type.STRING, description: "Hex color code representing the final drink" },
    visualStyle: { 
      type: Type.STRING, 
      enum: ['clear', 'creamy', 'sparkling', 'gradient', 'layered'],
      description: "Visual texture of the drink"
    },
    layers: {
      type: Type.OBJECT,
      properties: {
        emotion: {
          type: Type.OBJECT,
          description: "Layer 1: Base Spirit (Base)",
          properties: {
            name: { type: Type.STRING, description: "Poetic name for the layer" },
            alcoholType: { type: Type.STRING, description: "REAL alcohol brand/type (e.g. Absolut Vodka, Hendricks Gin)" },
            description: { type: Type.STRING, description: "Why this alcohol fits the mood (Poetic Chinese)" }
          },
          required: ["name", "alcoholType", "description"]
        },
        luck: {
          type: Type.OBJECT,
          description: "Layer 2: Luck Factor (Modifier)",
          properties: {
            level: { type: Type.STRING, description: "e.g., '小吉', '大凶'" },
            description: { type: Type.STRING, description: "Poetic interpretation of this luck level" },
            ingredient: { type: Type.STRING, description: "Real ingredient representing luck (e.g., Champagne, Blue Curacao)" }
          },
          required: ["level", "description", "ingredient"]
        },
        event: {
          type: Type.OBJECT,
          description: "Layer 3: Event Essence (Mixer)",
          properties: {
            name: { type: Type.STRING, description: "Name of the event extract" },
            description: { type: Type.STRING, description: "Poetic metaphor for this event's flavor" },
            ingredient: { type: Type.STRING, description: "Real mixer (e.g., Tonic Water, Ginger Beer, Fresh Lemon Juice)" }
          },
          required: ["name", "description", "ingredient"]
        },
        taste: {
          type: Type.OBJECT,
          description: "Layer 4: Taste Preference (Balance)",
          properties: {
            profile: { type: Type.STRING, description: "e.g., Bitter-Sweet" },
            notes: { type: Type.STRING, description: "Poetic philosophy of this taste" },
            ingredient: { type: Type.STRING, description: "Real syrup/bitters (e.g., Angostura Bitters, Agave Syrup, Honey)" }
          },
          required: ["profile", "notes", "ingredient"]
        },
        color: {
          type: Type.OBJECT,
          description: "Layer 5: Lucky Color (Visual)",
          properties: {
            name: { type: Type.STRING, description: "Name of the lucky color" },
            meaning: { type: Type.STRING, description: "Poetic meaning of this color" },
            ingredient: { type: Type.STRING, description: "Ingredient providing color (e.g., Grenadine, Midori, Butterfly Pea Flower)" }
          },
          required: ["name", "meaning", "ingredient"]
        },
        zodiac: {
          type: Type.OBJECT,
          description: "Layer 6: Zodiac Sign (Garnish)",
          properties: {
            sign: { type: Type.STRING, description: "User's zodiac sign" },
            prediction: { type: Type.STRING, description: "Poetic horoscope/guidance for today" },
            ingredient: { type: Type.STRING, description: "Specific garnish (e.g., Rosemary sprig, Orange peel, Edible Flower)" }
          },
          required: ["sign", "prediction", "ingredient"]
        },
        week: {
          type: Type.OBJECT,
          description: "Layer 7: Day of Week (Finish/Glass)",
          properties: {
            day: { type: Type.STRING, description: "Current day" },
            vibe: { type: Type.STRING, description: "Poetic sentiment about this day of the week" },
            ingredient: { type: Type.STRING, description: "Serving style or final touch (e.g., Crushed Ice, Smoked Glass, Sugar Rim)" }
          },
          required: ["day", "vibe", "ingredient"]
        }
      },
      required: ["emotion", "luck", "event", "taste", "color", "zodiac", "week"]
    },
    stats: {
      type: Type.OBJECT,
      properties: {
        intensity: { type: Type.NUMBER, description: "0 to 100 scale of emotional intensity" },
        abvDisplay: { type: Type.STRING, description: "Realistic ABV percentage" }
      },
      required: ["intensity", "abvDisplay"]
    }
  },
  required: ["name", "description", "colorHex", "visualStyle", "layers", "stats"]
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY || process.env.API_KEY)
  });
});

// Mood Analysis API Route
app.post('/api/analyze-mood', async (req, res) => {
  try {
    const { history, preferences } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey) {
      console.warn("No GEMINI_API_KEY found in server environment.");
      return res.status(503).json({
        error: "API_KEY_MISSING",
        message: "Gemini API Key未配置。您可以在 Settings > Secrets 中添加 GEMINI_API_KEY。"
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const conversationText = Array.isArray(history) 
      ? history.map((h: { question: string, answer: string }, i: number) => `Q${i+1}: ${h.question}\nA${i+1}: ${h.answer}`).join('\n\n')
      : '';

    const tarotInfo = preferences?.tarot 
      ? `${preferences.tarot.nameCN} (${preferences.tarot.name}) - 寓意：${preferences.tarot.meaning}` 
      : '未抽取';

    const systemInstruction = `
      你是一位“高维情绪调酒师”。任务是根据用户与你的【5轮深度对话记录】以及抽取的【塔罗牌】指引，将他们的情绪、潜意识和当下状态转化为一杯【七层结构】的现实主义特调。
      
      对话记录：
      ${conversationText}

      **抽取的塔罗牌：** ${tarotInfo}

      关键规则：
      1. **每一层都必须对应一个真实的、现实世界存在的鸡尾酒配料或元素**。
      2. **每一层都必须有一段诗意的、治愈的中文文本解释**。解释要结合上述对话中的细节（如用户提到的回忆、感觉、隐喻）以及**塔罗牌的启示**。
      
      分析维度与配料要求：
      1. **Layer 1: 情绪基酒 (Base Spirit)** 
         - 综合分析对话的整体基调。
         - 配料: 现实品牌或酒类 (如: 绝对伏特加, 孟买蓝宝石金酒, 麦卡伦12年, 朗姆酒)。
      2. **Layer 2: 运势 (Modifier)** 
         - 基于用户自评 ${preferences?.luck ?? 50}% 以及**塔罗牌的寓意**。
         - 配料: 修饰利口酒或风味酒 (如: 君度, 百利甜, 金巴利, 苦艾酒)。
      3. **Layer 3: 经历 (Mixer)** 
         - 提取对话中提到的具体事件或抽象感受。
         - 配料: 提取事件风味 (如: 汤力水, 干姜水, 鲜榨柠檬汁, 椰子水)。
      4. **Layer 4: 口味 (Balance)** 
         - 偏好 "${preferences?.taste || '平衡 Balanced'}"。
         - 配料: 糖浆或苦精 (如: 安格斯特拉苦精, 蜂蜜, 龙舌兰糖浆, 海盐)。
      5. **Layer 5: 颜色 (Visual)** 
         - ${preferences?.luckyColor ? `用户选了 ${preferences.luckyColor}` : '根据情绪生成颜色'}。
         - 配料: 能提供颜色的现实配料 (如: 蓝柑糖浆, 红石榴糖浆, 抹茶粉, 蝶豆花)。
      6. **Layer 6: 星座 (Garnish)** 
         - 用户是 ${preferences?.zodiac || '未知'}.
         - 配料: 装饰物 (如: 迷迭香, 橙皮, 樱桃, 橄榄, 食用金箔)。
      7. **Layer 7: 星期 (Style)** 
         - 今天是 ${preferences?.day || '今日'}.
         - 配料: 冰块形状或杯型处理 (如: 老冰, 碎冰, 盐边, 烟熏处理)。

      输出必须充满诗意，治愈，浪漫，并返回符合schema的JSON。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: "Start Analysis",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
        temperature: 1.0, 
      }
    });

    if (!response.text) {
      throw new Error("Empty response received from Gemini model");
    }

    const recipe = JSON.parse(response.text);
    return res.json(recipe);

  } catch (error: any) {
    console.error("Gemini Analysis Server Error:", error);
    return res.status(500).json({
      error: "ANALYSIS_FAILED",
      message: error?.message || "Failed to analyze mood with Gemini API"
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.use((req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Mood Mixology server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
