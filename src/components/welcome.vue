<template>
<a-modal
    v-model:visible="showTips"
    title="~ 欢迎回来 💡 ChatTests ~"
    :footer="null"
    width="1000px"
  >
  <div class="page">
    <header class="header">
      <h1>~ 欢迎回来 💡 ChatTests ~</h1>
      <img
        src="https://secure2.wostatic.cn/static/suC4ErqKmTKqryhdPXuFqe/5921454725019c197a79a0f7c87c67f.jpg?auth_key=1691395341-hsHQ4S6KQbciFr4gvACx7b-0-ad74d9b598fe0df47dc59c2241e0aece&file_size=99293"
        alt="Logo"
        class="logo"
      />
      <p>!我们一起探索,知行合一的无限可能!</p>
    </header>

    <div class="content">
      <p>考试内容实际上是提供了一个令心智与技能展示的天地</p>
      <p>考试并不是要简单地呈现再认、再现已有的知识和能力</p>
      <p>而是评价被试的心智状况和发展潜质</p>
      <p>就此义而言,考试内容是一种思维游戏,或曰思维博弈</p>
      <p>——刘芃《卷里卷外:刘芃话考试》</p>
      <p></p>
      <p>让「测试/考试」回归为动态、辅助思考和测量个人认知边界的工具</p>
      <p>
        !在ChatTests,通过具体的问题引导,整合既往积累,完成更多了不起的事情吧!
      </p>
    </div>

    <div class="tests-ChatTests">
      <p>Tests For ChatTests</p>

      <a
        href="https://mp.weixin.qq.com/s/Ioo3N53_LVoCMvnl1GEpwQ"
        class="tests-ChatTests-link"
        >DataWhale 5月 大模型应用开发学习 TOP1 复盘</a
      >

      <a
        href="https://zaiwen-chattests.feishu.cn/docx/IeoQdvZcQo51Yzx8oJIcHSjqnyg"
        class="tests-ChatTests-link"
        >Datawhale版项目说明文档</a
      >

      <a
        href="https://www.bilibili.com/video/BV1DP411i7mT/"
        class="tests-ChatTests-link"
        >Datawhale版项目详情介绍</a
      >
      
    </div>
  </div>
</a-modal>
</template>

<script>
export default {
  name: "WelcomePage",
};
</script>

<style scoped>
.tests-ChatTests {
  background-color: #ffcc00;
  display: flex;
  justify-content: space-between;
}

.tests-ChatTests-link {
  margin: 10px;
  padding: 10px;
}
</style>
