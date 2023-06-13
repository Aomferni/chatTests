<template>
  <a-layout>
    <a-layout-header style="color: #fff;">
      Header
    </a-layout-header>
    <a-layout-content style="background: #fff; padding: 24px; margin: 24px; minHeight: 100%; height: 80vh;">
      <a-row>
        <a-col span="10">
          <div style="overflow-y: scroll; height: 75vh;">
            <div style="display: block; font-size: 30px; font-style: oblique;">
              {{ qNum }}
            </div>
            <div style="display: block; font-size: 20px;">
              题目：{{ qTitle }}
            </div>
            <a-radio-group v-model:value="value" @change="optionsChange">
              <a-radio style="display: block; font-size: 17px; margin-top: 10px;" :value="1">A. {{ qOptions.A }}</a-radio>
              <a-radio style="display: block; font-size: 17px; margin-top: 10px;" :value="2">B. {{ qOptions.B }}</a-radio>
              <a-radio style="display: block; font-size: 17px; margin-top: 10px;" :value="3">C. {{ qOptions.C }}</a-radio>
              <a-radio style="display: block; font-size: 17px; margin-top: 10px;" :value="4">D. {{ qOptions.D }}</a-radio>
            </a-radio-group>
            <div style="display: block; margin-top: 20px;">
              <a-space>
                <a-button type="primary" size="large">上一题</a-button>
                <a-button type="primary" size="large" @click="seeTheParse">查看解析</a-button>
                <a-button type="primary" size="large">下一题</a-button>
              </a-space>
            </div>
            <div style="margin-top: 20px;">
              <a-card v-if="seeParse" title="解析" style="width: 80%">
                <template #extra><a-button type="primary" size="small" @click="closeParse">关闭</a-button></template>
                <p>{{ parse }}</p>
              </a-card>
            </div>
                </div>
              </a-col>
              <a-col span="14" style="background-color: #f0f2f5;">
            <a-button type="primary" size="large" @click="clickConfig">设置</a-button>
            <div
              class="group px-4 py-3 hover:bg-slate-100 rounded-lg"
              v-for="item of messageList.filter((v) => v.role !== 'system')"
            >
              <div>
                <div class="font-bold">{{ roleAlias[item.role] }}：</div>
                <Copy class="invisible group-hover:visible" :content="item.content" />
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

          <div class="sticky bottom-0 w-full p-6 pb-8 bg-gray-100">
            <div class="-mt-2 mb-2 text-sm text-gray-500" v-if="isConfig">
              请输入 API Key：
            </div>
            <div class="flex">
              <input
                class="input"
                :type="isConfig ? 'password' : 'text'"
                :placeholder="isConfig ? 'sk-xxxxxxxxxx' : '请输入'"
                v-model="messageContent"
                @keydown.enter="isTalking || sendOrSave()"
              />
              <button class="btn" :disabled="isTalking" @click="sendOrSave()">
                {{ isConfig ? "保存" : "发送" }}
              </button>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-layout-content>
    <a-layout-footer>
      Footer
    </a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
import type { ChatMessage } from "@/types";
import { ref, watch, nextTick, onMounted } from "vue";
import { chat } from "@/libs/gpt";
import cryptoJS from "crypto-js";
import Loding from "@/components/Loding.vue";
import Copy from "@/components/Copy.vue";
import { md } from "@/libs/markdown";

let apiKey = "";
let isConfig = ref(true);
let isTalking = ref(false);
let messageContent = ref("");
const chatListDom = ref<HTMLDivElement>();
const decoder = new TextDecoder("utf-8");
const roleAlias = { user: "ME", assistant: "ChatGPT", system: "System" };
const messageList = ref<ChatMessage[]>([
  {
    role: "system",
    content: "你是 ChatGPT，OpenAI 训练的大型语言模型，尽可能简洁地回答。",
  },
  {
    role: "assistant",
    content: `你好，我是AI语言模型，我可以提供一些常用服务和信息，例如：

1. 翻译：我可以把中文翻译成英文，英文翻译成中文，还有其他一些语言翻译，比如法语、日语、西班牙语等。

2. 咨询服务：如果你有任何问题需要咨询，例如健康、法律、投资等方面，我可以尽可能为你提供帮助。

3. 闲聊：如果你感到寂寞或无聊，我们可以聊一些有趣的话题，以减轻你的压力。

请告诉我你需要哪方面的帮助，我会根据你的需求给你提供相应的信息和建议。`,
  },
]);

const value = ref(1)
const qNum = ref("No.1")
const qTitle = ref('以下关于数据流图基本加工的叙述中，不正确的是（ ）。以下关于数据流图基本加工的叙述中，不正确的是（ ）。以下关于数据流图基本加工的叙述中，不正确的是（ ）。以下关于数据流图基本加工的叙述中，不正确的是（ ）。以下关于数据流图基本加工的叙述中，不正确的是（ ）。')
const qOptions = {
  'A': '对每一个基本加工，必须有一个加工规格说明',
  'B': '加工规格说明必须描述把输入数据流变换为输出数据流的加工规则加工规格说明必须描述把输入数据流变换为输出数据流的加工规则加工规格说明必须描述把输入数据流变换为输出数据流的加工规则加工规格说明必须描述把输入数据流变换为输出数据流的加工规则',
  'C': '加工规格说明需要给出实现加工的细节',
  'D': '决策树、决策表可以用来表示加工规格说明',
}
const qRight = ref(1)
const seeParse = ref(false)
const parse = ref("解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析解析")

const promt = ref('')



const optionsChange = (_e) => {
  console.log(_e.target.value)
  console.log(value.value)
  console.log(qRight.value);
}

const seeTheParse = () => {
  seeParse.value = true
}

const closeParse = () => {
  seeParse.value = false
}


onMounted(() => {
  if (getAPIKey()) {
    switchConfigStatus();
  }
});

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
  }
};

const readStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  status: number
) => {
  let partialLine = "";

  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { value, done } = await reader.read();
    if (done) break;

    const decodedText = decoder.decode(value, { stream: true });

    if (status !== 200) {
      const json = JSON.parse(decodedText); // start with "data: "
      const content = json.error.message ?? decodedText;
      appendLastMessageContent(content);
      return;
    }

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
    }
  }
};

const appendLastMessageContent = (content: string) =>
  (messageList.value[messageList.value.length - 1].content += content);

const sendOrSave = () => {
  if (!messageContent.value.length) return;
  if (isConfig.value) {
    if (saveAPIKey(messageContent.value.trim())) {
      switchConfigStatus();
    }
    clearMessageContent();
  } else {
    sendChatMessage();
  }
};

const clickConfig = () => {
  if (!isConfig.value) {
    messageContent.value = getAPIKey();
  } else {
    clearMessageContent();
  }
  switchConfigStatus();
};

const getSecretKey = () => "lianginx";

const saveAPIKey = (apiKey: string) => {
  if (apiKey.slice(0, 3) !== "sk-" || apiKey.length !== 51) {
    alert("API Key 错误，请检查后重新输入！");
    return false;
  }
  const aesAPIKey = cryptoJS.AES.encrypt(apiKey, getSecretKey()).toString();
  localStorage.setItem("apiKey", aesAPIKey);
  return true;
};

const getAPIKey = () => {
  if (apiKey) return apiKey;
  const aesAPIKey = localStorage.getItem("apiKey") ?? "";
  apiKey = cryptoJS.AES.decrypt(aesAPIKey, getSecretKey()).toString(
    cryptoJS.enc.Utf8
  );
  return apiKey;
};

const switchConfigStatus = () => (isConfig.value = !isConfig.value);

const clearMessageContent = () => (messageContent.value = "");

const scrollToBottom = () => {
  if (!chatListDom.value) return;
  scrollTo(0, chatListDom.value.scrollHeight);
};

watch(messageList.value, () => nextTick(() => scrollToBottom()));
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
