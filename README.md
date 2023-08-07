# ChatTests：AI带你刷题上瘾
> DataWhale5月模型应用hackathon TOP1
> 
> 得分：107.5/120
> 
> 斩获最佳创新奖和最佳应用奖两个最佳奖项！

项目说明文档：https://hk4llw3wld.feishu.cn/docx/IeoQdvZcQo51Yzx8oJIcHSjqnyg

项目详情见：https://www.bilibili.com/video/BV1DP411i7mT/

项目答辩见：https://www.bilibili.com/video/BV1eo4y1P7oX/ 

内测体验网站(后续会主要部署在 在问)：

https://yfor-chattests.hf.space/index.html#/

https://x3dsk4-5173.csb.app/#/

## ChatTests功能说明
目前网站通过 Vue3 + Typescript + Tailwind CSS 框架，调用openAI GPT3.5模型 API，
实现随机出《软件设计师》单选题和连续对话辅导，可在网页上直接记录纯文本笔记并导出。

需使用【在问】路线，或设置自己可用的OpenAI Key，目前仅建议PC端使用，手机端适配正在进行中

已新增：
1. 出题流输出
2. 笔记区支持富文本和Markdown即时渲染

已有功能：
1. 用户可在【刷题区】点击选项并提交，获得正确与否的反馈和解析内容
2. 有任何不懂的地方，均可在【聊天区】随时与GPT大模型对话获得辅导、或是解压帮助，支持流输出、连续对话与markdown渲染
  （PS：目前【刷题区】与【聊天区】独立）
3. 点击『继续出题』后，需要等待一段时间从GPT获得新的随机题目
4. 用户在使用网站的任何时候，均可在【笔记框】记录笔记，并导出内容

![preview](img/preview.gif)

对进入内测交流群可戳：
![image](public/Amy_wechat.png)

## ChatTest 项目愿景

  让考试和题目/问题，回归到辅助学习的核心作用上
  
  搭建通过确定的题目探索边界搭建知识框架的学习平台，提高理论知识学习效率；
  
  让用户掌控考试，利用考试提升个人对领域的理解，而不是被考试掌控

## 自部署指南
推荐直接fork到自己的仓库，使用codeSandBox进行自动部署。


## 许可证

本项目使用 [MIT](LICENSE) 协议
