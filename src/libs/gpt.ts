import type { ChatMessage } from "@/types";

export async function chat(messageList: ChatMessage[], apiKey: string) {
  console.log(messageList);
  console.log(apiKey);
  try {
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
  } catch (error) {
    throw error;
  }
}

export async function getQuestion(apiKey: string) {
  const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);
const response = await openai.createCompletion({
  model: "text-davinci-003",
  prompt: "Say this is a test",
  max_tokens: 7,
  temperature: 0,
});

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        prompt: `你是一个备考专家，需要为用户提供出题服务。
          每个题目都是出自软件设计相关的题目，需要有以下几个要素：
          1. 题干；
          2. A/B/C/D四个选项；
          3. 正确选项；
          4. 解析，不超过200个词；
          以JSON格式提供你的输出，包含以下键：question(题干)，A/B/C/D(4个选项)，rightIndex(正确选项)，analyze(解析)

          举例输出JSON 中如下：
          {
          "question":"以下关于数据流图基本加工的叙述中，不正确的是（ ）。",
          "A":"对每一个基本加工，必须有一个加工规格说明",
          "B":"加工规格说明必须描述把输入数据流变换为输出数据流的加工规则",
          "C":"加工规格说明需要给出实现加工的细节",
          "D":"决策树、决策表可以用来表示加工规格说明",
          "rightIndex":1,
          "analyze":"解析解析"
          }
        `,
        max_tokens: 7,
      }),
    });

    const data = await response.json();

    // 处理完整结果
    console.log(data);
    return data;
    // 继续处理后续逻辑
    // ...
  } catch (error) {
    console.error(error);
  }
}
