import type { ChatMessage } from "@/types";

export async function chat(messageList: ChatMessage[], apiKey: string) {
  try {
    const typeFromStorage = localStorage.getItem("type") ?? "zaiwen";
    if (typeFromStorage === "zaiwen") {
      const result = await fetch("https://www.gaosijiaoyu.cn/message", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageList,
        }),
      });
      return result;
    } else {
      const result = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "post",
        // signal: AbortSignal.timeout(8000),
        // 开启后到达设定时间会中断流式输出
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          stream: true,
          messages: messageList,
        }),
      });
      return result;
    }
  } catch (error) {
    throw error;
  }
}
