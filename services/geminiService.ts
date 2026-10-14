import { MoodRecipe, TarotCard } from "../types";

export const analyzeMood = async (
    history: { question: string, answer: string }[], 
    preferences: { 
        taste: string, 
        luck: number, 
        luckyColor?: string, 
        zodiac: string, 
        day: string,
        tarot?: TarotCard 
    }
): Promise<MoodRecipe> => {
  try {
    const res = await fetch('/api/analyze-mood', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ history, preferences }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
      let errMsg = `Server returned status ${res.status}`;
      if (contentType.includes('application/json')) {
        const errData = await res.json().catch(() => ({}));
        errMsg = errData.message || errMsg;
      }
      console.warn("API request returned non-OK:", res.status, errMsg);
      throw new Error(errMsg);
    }

    if (!contentType.includes('application/json')) {
      throw new Error('Unexpected non-JSON response from server');
    }

    const recipe: MoodRecipe = await res.json();
    return recipe;
  } catch (error: any) {
    console.warn("Gemini Analysis fallback activated:", error?.message || error);
    // Graceful fallback to guarantee smooth experience if network or API key is not ready
    return {
      name: "星露·琉璃之夜",
      description: "在夜幕与晨光的缝隙中，倾听心跳的回响，为你调制的专属情绪抚慰特调。",
      colorHex: preferences.luckyColor || "#6366f1",
      visualStyle: "layered",
      layers: {
        emotion: { 
          name: "月夜原液", 
          description: "沉淀着你方才诉说的情绪，深邃而平静，似雨后初霁的青苔原野。", 
          alcoholType: "孟买蓝宝石金酒 (Bombay Sapphire)" 
        },
        luck: { 
          level: preferences.luck > 50 ? "上吉" : "平顺", 
          description: preferences.tarot ? `牌面【${preferences.tarot.nameCN}】昭示：${preferences.tarot.meaning}，万物自有时节。` : "命途的微澜，正在暗处积蓄惊喜。", 
          ingredient: "君度橙酒 (Cointreau)" 
        },
        event: { 
          name: "浮生回响", 
          description: "散碎的记忆与心绪，在气泡细密的声响中一一化解为甘甜与释怀。", 
          ingredient: "干姜水 (Ginger Beer)" 
        },
        taste: { 
          profile: preferences.taste, 
          notes: "入口微甜，回味带着一丝清冽，正如你所渴望的那份平衡与安定。", 
          ingredient: "安格斯特拉苦精与野生蜂蜜" 
        },
        color: { 
          name: "暮光紫韵", 
          meaning: "在黑夜与白昼交界的片刻，情绪被允许拥有属于它自己的颜色与温度。", 
          ingredient: "蝶豆花天然萃取液" 
        },
        zodiac: { 
          sign: preferences.zodiac || "星河引者", 
          prediction: "星轨平稳，今夜宜放下多余思绪，安心安歇。", 
          ingredient: "炙烤迷迭香枝" 
        },
        week: { 
          day: preferences.day, 
          vibe: "将今日的疲惫封存于杯底，举杯向每一个真实的瞬间致意。", 
          ingredient: "手凿透亮方冰" 
        }
      },
      stats: { intensity: preferences.luck, abvDisplay: "8.5%" }
    };
  }
};