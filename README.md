# Blue Bunny Archive

移动端优先的私人旅行规划与旅行档案网站。当前完成 Phase 0、Phase 1 和 Phase 2：创建旅程、管理每日地点与路线、现场打卡、点亮城市足迹、查看旅行年表和城市档案。

## 本地启动

```bash
npm install
npm run dev
```

运行 `npm run build` 会同时检查 TypeScript 并生成生产版本。旅行、日期、地点、行程、城市和打卡通过 `src/repositories/travelRepository.ts` 保存到当前浏览器的 localStorage。旧版 Phase 1 数据会自动迁移到数据版本 2，不同设备之间暂不同步。

路线图是顺序示意，不提供真实道路或路线计算。地点详情中的导航按钮会打开高德地图搜索。青岛示例封面来自 [Bridget Coila / Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Qingdao_Pier.jpg)，按 [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) 使用，并在页面中标注。

足迹页使用 [DataV GeoAtlas](https://geo.datav.aliyun.com/areas_v3/bound/) 的真实行政区 GeoJSON，包含省级和地级边界，并为安达、漠河保留县级点亮区域。地图数据进入足迹页时按需加载，支持拖动、双指缩放和城市点击。城市印章同样按需加载；素材包中的青岛印章坐标有误，因此当前使用文字档案样式作为回退，等待修正版素材。

## 分支约定

- `source`：React / TypeScript 源码与开发历史。
- `main`：GitHub Pages 构建产物，发布前由 `npm run build` 生成。
