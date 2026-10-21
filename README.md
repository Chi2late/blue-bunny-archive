# Blue Bunny Archive

移动端优先的私人旅行规划网站。当前仅实现 Phase 0 和 Phase 1：创建旅程、添加多个日期与地点、编辑及删除地点、长按拖动排序、查看当天路线示意。

## 本地启动

```bash
npm install
npm run dev
```

运行 `npm run build` 会同时检查 TypeScript 并生成生产版本。旅行、日期、地点和行程通过 `src/repositories/travelRepository.ts` 保存到当前浏览器的 localStorage。不同设备之间暂不同步。

路线图是顺序示意，不提供真实道路或路线计算。地点详情中的导航按钮会打开高德地图搜索。青岛示例封面来自 [Bridget Coila / Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Qingdao_Pier.jpg)，按 [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) 使用，并在页面中标注。
