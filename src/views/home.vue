<template>
  <a-modal
    v-model:visible="showTips"
    title="   欢迎来到北京大学智能图书馆-智能备考区"
    :footer="null"
    width="1000px"
  >
    <iframe
      src="./welcome.html"
      frameborder="0"
      width="100%"
      height="600px"
    ></iframe>
  </a-modal>
  <a-layout>
    <a-layout-header style="color: #fff">
      北京大学智能图书馆-AI备考助手
    </a-layout-header>
    <a-layout-content
      style="
        background: #fff;
        padding: 24px;
        margin: 24px;
        minheight: 100%;
        height: 80vh;
      "
    >
      <a-collapse>
        <a-collapse-panel key="1" header="设置">
          <div class="flex">
            <input
              class="input"
              :type="'password'"
              :placeholder="'请输入 API Key：sk-xxxxxxxxxx'"
              v-model="apiKey"
              @keydown.enter="save()"
            />
            <a-button type="primary" size="large" @click="save()">
              保存
            </a-button>
          </div>
          <a-radio-group v-model:value="type" @change="changeType">
            <a-radio-button value="zaiwen">在问</a-radio-button>
            <a-radio-button value="OpenAI">OpenAI</a-radio-button>
          </a-radio-group>
        </a-collapse-panel>
      </a-collapse>
      <a-row>
        <a-col :xs="{ span: 24 }" :lg="{ span: 10 }">
          <div style="overflow-y: scroll; height: 75vh">
            <div style="display: block; font-size: 30px; font-style: oblique">
              No.{{ qNum }}
            </div>
            <div style="display: block; font-size: 20px">
              题目：{{ globleQuestion.question }}
            </div>
            <a-radio-group v-model:value="value" @change="optionsChange">
              <a-radio
                style="display: block; font-size: 17px; margin-top: 10px"
                :value="1"
                >A. {{ globleQuestion.A }}</a-radio
              >
              <a-radio
                style="display: block; font-size: 17px; margin-top: 10px"
                :value="2"
                >B. {{ globleQuestion.B }}</a-radio
              >
              <a-radio
                style="display: block; font-size: 17px; margin-top: 10px"
                :value="3"
                >C. {{ globleQuestion.C }}</a-radio
              >
              <a-radio
                style="display: block; font-size: 17px; margin-top: 10px"
                :value="4"
                >D. {{ globleQuestion.D }}</a-radio
              >
            </a-radio-group>
            <div style="display: block; margin-top: 20px">
              <a-space>
                <a-button type="primary" size="large" @click="seeTheParse"
                  >提交答案</a-button
                >
                <!-- :disabled="true" -->
                <a-button type="primary" size="large" @click="updateQuestion"
                  >继续出题</a-button
                >
              </a-space>
            </div>
            <div style="margin-top: 20px">
              <a-card
                v-if="seeParse"
                :title="isAnswerCorrect ? '回答正确！' : '再接再历'"
                style="width: 80%"
              >
                <template #extra>
                  <a-button type="primary" size="small" @click="closeParse"
                    >关闭</a-button
                  >
                </template>
                <p>{{ globleQuestion.analyze }}</p>
              </a-card>
            </div>
          </div>
        </a-col>
        <a-col
          :xs="{ span: 24 }"
          :lg="{ span: 14 }"
          style="background-color: #ffffff"
        >
          <div
            id="chat"
            style="overflow-y: scroll; height: 35vh; border: #000000"
          >
            <div
              class="group px-4 py-3 hover:bg-slate-100 rounded-lg"
              v-for="item of messageList.filter((v) => v.role !== 'system')"
            >
              <div>
                <div class="font-bold">{{ roleAlias[item.role] }}：</div>
                <Copy
                  class="invisible group-hover:visible"
                  :content="item.content"
                />
              </div>
              <div>
                <div
                  class="prose text-sm text-slate-600 leading-relaxed"
                  v-if="item.content"
                  v-html="md.render(item.content)"
                ></div>
                <Loding v-else />
              </div>
            </div>
          </div>

          <div style="height: 10vh">
            <div class="sticky bottom-0 p-6 pb-8 bg-gray-100">
              <div class="flex">
                <input
                  class="input"
                  :type="'text'"
                  :placeholder="'请输入'"
                  v-model="messageContent"
                  @keydown.enter="isTalking || send()"
                />
                <a-button
                  type="primary"
                  size="large"
                  :disabled="isTalking"
                  @click="send()"
                >
                  发送
                </a-button>
              </div>
            </div>
          </div>

          <div style="overflow-y: scroll; height: 30vh">
            <div id="vditor" style="margin-top: 30px" />
          </div>
        </a-col>
      </a-row>
    </a-layout-content>
    <a-layout-footer> </a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
import type { ChatMessage } from "@/types";
import {
  ref,
  watch,
  nextTick,
  onMounted,
  reactive,
  computed,
  vShow,
  h,
} from "vue";
import { chat } from "@/libs/gpt";
import cryptoJS from "crypto-js";
import Loding from "@/components/Loding.vue";
import Copy from "@/components/Copy.vue";
import { md } from "@/libs/markdown";
import Vditor from "vditor";
import "vditor/dist/index.css";

let isTalking = ref(false);
let messageContent = ref("");
let type = ref("OpenAI");
let apiKey = ref("");
const decoder = new TextDecoder("utf-8");
const roleAlias = { user: "ME", assistant: "ChatTests", system: "System" };
const messageList = ref<ChatMessage[]>([
  {
    role: "system",
    content:
      "你是 一个能快速出题帮助用户通过不断刷题通过考试的大语言模型助手，需要对用户的疑问进行解答，并需要根据用户的需要创作相应的题目并给出解析。",
  },
  {
    role: "assistant",
    content: `你好，我是AI备考助手，我可以为你的备考保驾护航，你会在这个网站获得我的各种服务，例如：

1. 出题：我会根据你想备考的科目，进行出题并给出解析；

2. 辅导：对知识点有任何不理解的地方都可以与我沟通获得帮助；

3. 闲聊：如果你感到寂寞或无聊，我们可以聊一些有趣的话题，以减轻你的压力。

请告诉我你需要哪方面的帮助，我会根据你的需求给你提供相应的信息和建议。`,
  },
]);

const value = ref(1);
const seeParse = ref(false);
const isAnswerCorrect = ref(false);
const myNote = ref("");

const vditor = ref<Vditor | null>(null);

const showTips = ref(true);

const optionsChange = (value: any) => {
  if (value.target.value === globleQuestion.value.rightIndex) {
    // 回答正确
    // 在这里添加你的提示逻辑，例如显示一个提示框或修改相关的状态
    isAnswerCorrect.value = true;
  } else {
    // 回答错误
    // 在这里添加你的提示逻辑，例如显示一个提示框或修改相关的状态
    isAnswerCorrect.value = false;
  }
};

const changeType = (value: any) => {
  localStorage.setItem("type", type.value);
};

const globleQuestion = ref({
  question: "以下关于数据库模式设计的叙述中，不正确的是（）。",
  A: "遵循范式化设计规范",
  B: "保持冗余数据以提高查询效率",
  C: "优化查询性能",
  D: "合理选择适当的索引",
  rightIndex: 2,
  analyze:
    "数据库模式设计是指根据应用需求设计数据库的结构和组织方式。在数据库模式设计中，应当遵循范式化设计规范，即尽量避免数据冗余，确保数据的唯一性和一致性。冗余数据可能导致数据更新异常和一致性维护困难。同时，优化查询性能也是数据库设计的重要目标，包括合理设计表结构、使用合适的数据类型、优化查询语句等。合理选择适当的索引是提高数据库查询效率的重要手段，可以加快数据检索速度。然而，保持冗余数据以提高查询效率是错误的观念，因为冗余数据会增加数据存储成本，并且增加了数据更新时的复杂性。",
});
// 题目标题累加器
var accumulateQuestion = "";
// 返回出题信息
var questionInfo = "";
var learningScope = "数据库系统专家";
var learningArea = "";

const qNum = ref(1);

const qNumInner = ref(1);
const updateQuestion = () => {
  qNumInner.value++;
  nextQuestion();
  // globleQuestion.value = JSON.parse(jsonContent);
  // console.log(globleQuestion);
};

const jsonContent = `{
  "question": "以下关于数据库模式设计的叙述中，不正确的是（）。",
  "A": "遵循范式化设计规范",
  "B": "保持冗余数据以提高查询效率",
  "C": "优化查询性",
  "D": "合理选择适当的索引",
  "rightIndex": 2,
  "analyze": "数据库模式设计是指根据应用需求设计数据库的结构和组织方式。在数据库模式设计中，应当遵循范式化设计规范，即尽量避免数据冗余，确保数据的唯一性和一致性。冗余数据可能导致数据更新异常和一致性维护困难。同时，优化查询性能也是数据库设计的重要目标，包括合理设计表结构、使用合适的数据类型、优化查询语句等。合理选择适当的索引是提高数据库查询效率的重要手段，可以加快数据检索速度。然而，保持冗余数据以提高查询效率是错误的观念，因为冗余数据会增加数据存储成本，并且增加了数据更新时的复杂性。"
}`;

const seeTheParse = () => {
  console.log("see the parse");
  console.log(value);
  if (value.value === globleQuestion.value.rightIndex) {
    // 回答正确
    // 在这里添加你的提示逻辑，例如显示一个提示框或修改相关的状态
    isAnswerCorrect.value = true;
  } else {
    // 回答错误
    // 在这里添加你的提示逻辑，例如显示一个提示框或修改相关的状态
    isAnswerCorrect.value = false;
  }

  seeParse.value = true;
};

const closeParse = () => {
  seeParse.value = false;
};

onMounted(() => {
  getAPIKey();
  vditor.value = new Vditor("vditor", {
    height: 220,
    toolbarConfig: {
      pin: true,
    },
    cache: {
      enable: false,
    },
    after: () => {
      vditor.value!.setValue("# 记笔记是一个好习惯");
    },
  });
});

const nextQuestion_old = async () => {
  console.log("next question");
  seeParse.value = false;
  questionInfo = "";
  accumulateQuestion += globleQuestion.value.question;
  console.log("累加器：" + accumulateQuestion);
  const tmpMessageList = ref<ChatMessage[]>([
    {
      role: "system",
      content: `你是一个备考专家，需要为用户提供出单选题的服务，并排除用###符号分割的题干。
          每个题目需要有以下几个要素：
          1. 题干；
          2. A选项；
          3. B选项；
          4. C选项；
          5. D选项；
          6. 正确选项的数字表示(1代表A，2代表B，3代表C，4代表D)；
          7. 解析，50字以上，不超过200个词；
          以JSON格式提供你的输出，包含以下键：question(题干)，A(选项内容)，B(选项内容)，C(选项内容)，D(选项内容)，rightIndex(正确选项数字)，analyze(解析)

          举例输出JSON 如下：
          {
            "question": "以下关于数据库模式设计的叙述中，不正确的是（）。",
            "A": "遵循范式化设计规范",
            "B": "保持冗余数据以提高查询效率",
            "C": "优化查询性能",
            "D": "合理选择适当的索引",
            "rightIndex": 2,
            "analyze": "数据库模式设计是指根据应用需求设计数据库的结构和组织方式。在数据库模式设计中，应当遵循范式化设计规范，即尽量避免数据冗余，确保数据的唯一性和一致性。冗余数据可能导致数据更新异常和一致性维护困难。同时，优化查询性能也是数据库设计的重要目标，包括合理设计表结构、使用合适的数据类型、优化查询语句等。合理选择适当的索引是提高数据库查询效率的重要手段，可以加快数据检索速度。然而，保持冗余数据以提高查询效率是错误的观念，因为冗余数据会增加数据存储成本，并且增加了数据更新时的复杂性。"
          }`,
    },
    {
      role: "user",
      content:
        `请随机给出一个数据库系统相关的题目，范围是数据库系统、关系模型、SQL语言、数据模型、DBMS、范式化设计、索引、事务管理、并发控制、数据库安全、数据备份与恢复、数据仓库、数据挖掘、NoSQL数据库、大数据技术、数据库性能优化、数据库连接、数据库设计、数据库应用开发、数据库监控、容量规划、数据加密、数据一致性、分布式数据库、数据查询优化、数据存储与检索、数据库索引结构、关系代数、关系操作、关系数据库查询语言、关系数据库管理系统、数据库表、数据库视图、数据库触发器、数据库约束、数据库连接池、数据库连接字符串、数据库连接池配置、数据库连接池管理、数据库连接池性能优化、数据库连接池扩展、数据库连接池故障处理,排除 ###` +
        accumulateQuestion +
        `###`,
    },
  ]);
  try {
    const { body, status } = await chat(tmpMessageList.value, getAPIKey());
    if (body) {
      const reader = body.getReader();
      // await readStream(reader, status);
      await readStream2Question(reader, status);
    }
  } catch (error: any) {
    appendLastMessageContent(error);
  } finally {
    console.log("appendQuestionInfo res:" + questionInfo);
    // 进行转换
    globleQuestion.value = JSON.parse(questionInfo);
  }
};

const nextQuestion = async () => {
  console.log("next question");
  seeParse.value = false;
  questionInfo = "";
  accumulateQuestion += globleQuestion.value.question;
  console.log("累加器：" + accumulateQuestion);
  const tmpMessageList = ref<ChatMessage[]>([
    {
      role: "system",
      content: `你是一个备考专家，需要为用户提供出单选题的服务，并排除用###符号分割的题干。
          每个题目需要有以下几个要素：
          1. 题干；
          2. A选项；
          3. B选项；
          4. C选项；
          5. D选项；
          6. 正确选项的数字表示(1代表A，2代表B，3代表C，4代表D)；
          7. 解析，50字以上，不超过200个词；
          以JSON格式提供你的输出，包含以下键：question(题干)，A(选项内容)，B(选项内容)，C(选项内容)，D(选项内容)，rightIndex(正确选项数字)，analyze(解析)

          举例输出JSON 如下：
          {
            "question": "以下关于数据库模式设计的叙述中，不正确的是（）。",
            "A": "遵循范式化设计规范",
            "B": "保持冗余数据以提高查询效率",
            "C": "优化查询性能",
            "D": "合理选择适当的索引",
            "rightIndex": 2,
            "analyze": "数据库模式设计是指根据应用需求设计数据库的结构和组织方式。在数据库模式设计中，应当遵循范式化设计规范，即尽量避免数据冗余，确保数据的唯一性和一致性。冗余数据可能导致数据更新异常和一致性维护困难。同时，优化查询性能也是数据库设计的重要目标，包括合理设计表结构、使用合适的数据类型、优化查询语句等。合理选择适当的索引是提高数据库查询效率的重要手段，可以加快数据检索速度。然而，保持冗余数据以提高查询效率是错误的观念，因为冗余数据会增加数据存储成本，并且增加了数据更新时的复杂性。"
          }`,
    },
    {
      role: "user",
      content:
        `请随机给出一个` +
        learningScope +
        `的题目，范围是` +
        learningArea +
        `。排除已经出过的题目 ###` +
        accumulateQuestion +
        `###`,
    },
  ]);
  try {
    console.log(tmpMessageList);
    const { body, status } = await chat(tmpMessageList.value, getAPIKey());
    if (body) {
      const reader = body.getReader();
      // await readStream(reader, status);
      await readStream2Question(reader, status);
    }
  } catch (error: any) {
    appendLastMessageContent(error);
  } finally {
    console.log("appendQuestionInfo res:" + questionInfo);
    // 进行转换
    globleQuestion.value = JSON.parse(questionInfo);
  }
};

const nextQuestion_shortAnswer = async () => {
  console.log("next question");
  seeParse.value = false;
  questionInfo = "";
  accumulateQuestion += globleQuestion.value.question;
  console.log("累加器：" + accumulateQuestion);
  const tmpMessageList = ref<ChatMessage[]>([
    {
      role: "system",
      content: `你是一个备考专家，需要为用户提供出问答题的服务，并排除用###符号分割的题干。
          每个题目需要有以下几个要素：
          1. 题干；
          2. 提示；
          3. 答案，50字以上，不超过200个词；
          4. 参考资料；
          以JSON格式提供你的输出，包含以下键：question(题干)，clue(提示)，answer(答案)，reference(参考资料)

          举例输出JSON 如下：
          {
            "question": "为什么HTTP握手是3次而不是2次或4次？",
            "clue"": "也许这样更可靠，也许这样能减少浪费，",
            "answer": "三次握手之所以需要三次而不仅两次,主要是为了在连接建立时解决潜在的重复包和 ACK 丢失问题,这保证了 TCP 连接更加可靠。如果只有两次握手,那么客户端发送的 SYN 包有可能因为网络原因重复到达服务器端,服务器端会认为这是两次不同的连接请求,并分别发送 ACK 包进行确认,这会导致连接状态混乱。客户端需要确认服务器是否接收到其发送的 ACK 包。在两次握手中,服务器端发送 SYN/ACK 包后就开始发送数据包,而客户端此时还不知道服务器是否正确接收到其返回的 ACK 包。如果这个 ACK 包在网络中丢失,服务器仍然发送数据包,但客户端无法理解这些数据包,从而导致连接混乱。",
            "reference": "《计算机网络》，https://mp.weixin.qq.com/s/QxY2Y8BhGTaGgOG1dyRuFg",
          }`,
    },
    {
      role: "user",
      content:
        `请随机给出一个` +
        learningScope +
        `的题目，范围是` +
        learningArea +
        `排除 ###` +
        accumulateQuestion +
        `###`,
    },
  ]);
  try {
    const { body, status } = await chat(tmpMessageList.value, getAPIKey());
    if (body) {
      const reader = body.getReader();
      // await readStream(reader, status);
      await readStream2Question(reader, status);
    }
  } catch (error: any) {
    appendLastMessageContent(error);
  } finally {
    console.log("appendQuestionInfo res:" + questionInfo);
    // 进行转换
    globleQuestion.value = JSON.parse(questionInfo);
  }
};

const sendChatMessage = async (content: string = messageContent.value) => {
  try {
    isTalking.value = true;
    if (messageList.value.length === 2) {
      messageList.value.pop();
    }
    messageList.value.push({ role: "user", content });
    clearMessageContent();
    messageList.value.push({ role: "assistant", content: "" });

    const { body, status } = await chat(messageList.value, getAPIKey());
    if (body) {
      const reader = body.getReader();
      await readStream(reader, status);
    }
  } catch (error: any) {
    appendLastMessageContent(error);
  } finally {
    isTalking.value = false;
    scrollToBottom();
  }
};

const readStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  status: number,
) => {
  let partialLine = "";

  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { value, done } = await reader.read();
    if (done) break;

    const decodedText = decoder.decode(value, { stream: true });
    // console.log(decodedText)

    if (status !== 200) {
      const json = JSON.parse(decodedText); // start with "data: "
      const content = json.error.message ?? decodedText;
      appendLastMessageContent(content);
      return;
    }

    if (type.value === "zaiwen") {
      // for (const line of newLines) {
      //   // if (line.length === 0) continue; // ignore empty message
      //   appendLastMessageContent(line);
      //   scrollToBottom();
      // }
      appendLastMessageContent(decodedText);
      scrollToBottom();
    } else {
      const chunk = partialLine + decodedText;
      const newLines = chunk.split(/\r?\n/);
      partialLine = newLines.pop() ?? "";
      for (const line of newLines) {
        if (line.length === 0) continue; // ignore empty message
        if (line.startsWith(":")) continue; // ignore sse comment message
        if (line === "data: [DONE]") return; //

        const json = JSON.parse(line.substring(6)); // start with "data: "
        const content =
          status === 200
            ? json.choices[0].delta.content ?? ""
            : json.error.message;
        appendLastMessageContent(content);
        scrollToBottom();
      }
    }
  }
  console.log("partialLine:" + partialLine);
};

const readStream2Question = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  status: number,
) => {
  let partialLine = "";
  var resp = "";

  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { value, done } = await reader.read();
    qNum.value = qNumInner.value;
    if (done) break;

    const decodedText = decoder.decode(value, { stream: true });

    if (status !== 200) {
      const json = JSON.parse(decodedText); // start with "data: "
      const content = json.error.message ?? decodedText;
      //appendLastMessageContent(content);
      questionInfo += content;
      resp += content;
      return;
    }

    if (type.value === "zaiwen") {
      // for (const line of newLines) {
      //   questionInfo += line;
      // }
      questionInfo += decodedText;
      tryRenderPartialQuestion(questionInfo);
    } else {
      const chunk = partialLine + decodedText;
      const newLines = chunk.split(/\r?\n/);
      partialLine = newLines.pop() ?? "";
      for (const line of newLines) {
        if (line.length === 0) continue; // ignore empty message
        if (line.startsWith(":")) continue; // ignore sse comment message
        if (line === "data: [DONE]") return; //

        const json = JSON.parse(line.substring(6)); // start with "data: "
        const content =
          status === 200
            ? json.choices[0].delta.content ?? ""
            : json.error.message;
        //appendLastMessageContent(content);
        // appendQuestionInfo(content)
        questionInfo += content;
        console.log("questionInfo:" + questionInfo);
        tryRenderPartialQuestion(questionInfo);
        // console.log('tmp content:'+content)
        // resp += content
        // console.log('tmp resp:'+resp)
      }
    }
  }
  console.log("resp:" + resp);
};

const tryRenderPartialQuestion = (questionInfo: string) => {
  try {
    const content = questionInfo + '"}';
    globleQuestion.value = JSON.parse(content);
  } catch (error: any) {
    // do nothing
  }
};

const appendLastMessageContent = (content: string) =>
  (messageList.value[messageList.value.length - 1].content += content);

const save = () => {
  if (saveAPIKey(apiKey.value.trim())) {
  }
};

const send = () => {
  if (!messageContent.value.length) return;
  sendChatMessage();
};

const getSecretKey = () => "lianginx";

const saveAPIKey = (apiKey: string) => {
  if (apiKey.slice(0, 3) !== "sk-" || apiKey.length !== 51) {
    alert(
      "API Key 错误，请检查后重新输入！\n如无key可尝试 在问(zaiwen.top) 渠道",
    );
    return false;
  }
  const aesAPIKey = cryptoJS.AES.encrypt(apiKey, getSecretKey()).toString();
  localStorage.setItem("apiKey", aesAPIKey);
  return true;
};

const getAPIKey = () => {
  const aesAPIKey = localStorage.getItem("apiKey") ?? "";
  const apiKeyFromStorage = cryptoJS.AES.decrypt(
    aesAPIKey,
    getSecretKey(),
  ).toString(cryptoJS.enc.Utf8);
  apiKey.value = apiKeyFromStorage;
  const typeFromStorage = localStorage.getItem("type") ?? "zaiwen";
  type.value = typeFromStorage;
  return apiKeyFromStorage;
};

const clearMessageContent = () => (messageContent.value = "");

const scrollToBottom = () => {
  const myDiv = document.getElementById("chat");
  myDiv?.scrollTo(0, myDiv.scrollHeight);
};

watch(messageList.value, () => nextTick(() => scrollToBottom()));

const exportNote = () => {
  const note = myNote.value; // 获取 myNote 数据
  // 将数据导出为 txt 文件
  const blob = new Blob([note], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "note.txt";
  link.click();
};
</script>

<style scoped>
pre {
  font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica,
    "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB",
    "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN",
    "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti",
    SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
}
</style>
