<template>
   <iframe
    src="../components/welcome.html"
    frameborder="0"
    width="100%"
    height="800px"
  ></iframe>
  <a-modal
    v-model:visible="showTips"
    title="欢迎使用GPT应用网站(ChatTests)"
    :footer="null"
    width="1000px"
  >
    <div style="font-size: 20px; text-align: center">
      <p style="font-size: 25px">DataWhale5月模型应用hackathon TOP1</p>
      <p style="color: red; font-size: 20px">得分：107.5/120</p>
      <p>
        斩获 <span style="font-size: 30px; color: blue">最佳创新奖</span> 和
        <span style="font-size: 30px; color: blue">最佳应用奖</span>
        两个最佳奖项！
      </p>
      <p style="font-style: italic">
        让考试和题目/问题，回归到辅助学习的核心作用上搭建通过确定的题目探索边界搭建知识框架的学习平台，提高理论知识学习效率
      </p>
      <p style="font-size: 30px; color: coral">
        掌控考试，利用考试提升个人对领域的理解，而不是被考试掌控
      </p>
      项目说明文档：<a
        href="https://hk4llw3wld.feishu.cn/docx/IeoQdvZcQo51Yzx8oJIcHSjqnyg"
        target="_blank"
        >点击跳转</a
      ><br />
      项目详情见：<a
        href="https://www.bilibili.com/video/BV1DP411i7mT/"
        target="_blank"
        >点击跳转</a
      ><br />
      项目答辩见：<a
        href="https://www.bilibili.com/video/BV1eo4y1P7oX/"
        target="_blank"
        >点击跳转</a
      ><br />
      <a-image
        :width="291"
        :height="300"
        :src="`ChatTests_user_group_wechat.png`"
        style="border: 10px"
      >
      </a-image>
      <a-image
        :width="300"
        :height="300"
        :src="`Amy_wechat.png`"
        style="border: 10px"
      >
      </a-image>
    </div>
  </a-modal>
</template>