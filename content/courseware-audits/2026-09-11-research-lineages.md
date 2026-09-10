# 李飞飞 / Yann LeCun 具身研究主线插入审计

## 结论

- 不改写 2026-09-01—09-14 已完成课程和任务 ID；从 09-15 起，把两条研究谱系分布到数据、表征、世界模型、仿真、强化学习、评测和毕业项目。
- 课程不是人物履历介绍，而是围绕五个可验证问题：输入/数据、预测对象、动作条件、闭环评测、对 SO-101 与 RAW 经验的迁移价值。
- 李飞飞线分开标注 Stanford Vision and Learning Lab 与 World Labs；LeCun 线分开标注 Meta/FAIR 已发布工作与 AMI Labs 当前研究方向，避免组织归属误写。

## 一手资料与教学边界

### 李飞飞团队谱系

- [Stanford BEHAVIOR-1K](https://behavior.stanford.edu/)：1000 个由真实人类需求调查定义的家庭活动、50 个可交互场景与 OmniGibson 物理/视觉仿真。课程把它作为任务定义、数据契约、长时移动操作和评测来源。
- [2026 BEHAVIOR Challenge](https://behavior.stanford.edu/challenge/index.html)：100 项长时任务、20000 条遥操作演示、1950 小时数据，基线包含 π0.5 与 GR00T N1.7。挑战允许 RGB、depth 与 proprioception，适合连接用户的传感器经验。
- [2026 Challenge Updates](https://behavior.stanford.edu/challenge/updates.html)：v3.9.2 修正 base/arm/gripper/trunk velocity、depth 和相机 observation space，并增加任务语言标注。课程把它作为“版本修订会使旧训练结论失效”的真实数据工程案例。
- [World Labs Atlas](https://www.worldlabs.ai/blog/atlas)：从文本、图像、视频和 3D 形成共享空间上下文，覆盖生成、重建、时空模拟与机器人 Real-to-Sim。官方页面展示的是项目方结果，课程不把生成质量外推为真实控制成功率。
- [World Labs R2S2R](https://www.worldlabs.ai/blog/real-to-sim-to-real)：从一项真实任务扩展外观、物体、物理、机器人状态与相机视角，用于训练和评测。课程要求把其公开主张与可复现实验、SO-101 小规模验证分开。

### Yann LeCun 团队谱系

- [Meta V-JEPA 2](https://ai.meta.com/research/vjepa/)：先从自然视频自监督预训练，再用少于 62 小时 DROID 机器人视频训练动作条件模型，以目标图像做 zero-shot planning。课程明确区分表征预训练、动作条件后训练和在线规划。
- [V-JEPA 2.1 论文](https://arxiv.org/abs/2603.14482)：通过多层自监督和多模态 tokenizer 改善 dense feature，并报告相对 V-JEPA 2-AC 的真机抓取提升。课程保留任务、硬件与评测协议边界，不把单一结果写成通用增益。
- [JEPA-WMs 代码与权重](https://github.com/facebookresearch/jepa-wms)：提供 DROID、MetaWorld、PushT、PointMaze 与 Wall 的 JEPA-WM/DINO-WM/V-JEPA-2-AC 对照，用于代码精读和公平实验设计。
- [AMI Labs](https://amilabs.xyz/)：当前公开方向是从连续、高维、含噪传感器数据学习抽象表征，在表征空间做动作条件预测与安全规划。现阶段课程把它作为研究方向和跟踪对象，不写成已经发布的具体模型性能。

## 课程插入地图

| 日期范围 | 原单元 | 插入内容 | 学习产出 |
| --- | --- | --- | --- |
| 09-15—09-21 | 机器人数据工程 | BEHAVIOR velocity/depth 修订、语言标注、LeRobot/BEHAVIOR manifest | 数据版本影响报告 |
| 09-22—09-28 | 模仿学习策略族 | 用 BEHAVIOR 基线协议公平比较 ACT、Diffusion、π0.5、GR00T | 同数据/同实例对比表 |
| 09-29—10-05 | 视觉语言基础 | 从分类表征到 dense spatial feature；Atlas 多视角空间上下文 | RAW/多视角输入消融 |
| 10-20—10-26 | 基座模型横评 | 直接动作策略与 V-JEPA 表征/规划模型的接口差别 | 预测对象与动作接口表 |
| 10-27—11-02 | World Model | World Labs Atlas/R2S2R 对照 V-JEPA 2/2.1、V-JEPA 2-AC 与 AMI 方向 | 双路线架构图与最小 latent planning |
| 11-03—11-09 | 仿真与 Sim2Real | OmniGibson/BDDL、交互物理、R2S2R、BEHAVIOR 公共/隐藏实例 | 仿真—真机差距清单 |
| 11-17—11-23 | 强化学习基础 | model-free value/Q 对照 action-conditioned world model cost | 两种规划目标对照 |
| 12-15—12-21 | 评测可靠性 | BEHAVIOR Q-score、仿真非确定性、V-JEPA 物理推理与隐藏实例 | 双路线评测协议 |
| 12-22—12-28 | SO-101 项目 | BDDL 式目标谓词、BEHAVIOR schema 映射、JEPA 冻结特征 probe | SO-101 小数据机制验证 |
| 12-29—12-31 | 答辩与 Q1 规划 | World Labs 空间仿真、JEPA/AMI 规划与真机 RL 的资源排序 | 2027 Q1 实验 backlog |

## 每日追踪口径

- 李飞飞线：优先检查 BEHAVIOR Challenge Updates、StanfordVL/BEHAVIOR-1K release/commit、OmniGibson 官方资料，以及 World Labs Research、Atlas、R2S2R 和后续机器人/空间模型发布。
- LeCun 线：优先检查 AMI Labs 官方发布与开放源码；为保持技术谱系连续性，同时检查 Meta AI V-JEPA 官方页面、facebookresearch/vjepa2 与 facebookresearch/jepa-wms，但新 Meta 工作只有在作者/项目明确关联时才标为 LeCun 谱系。
- 只把一手页面的窗口内首发、release、论文版本或有实质技术内容的提交计为新增；同一功能的多提交合并成一个更新簇，媒体报道、个人评论和抓取时间不计。
- 新进展先进入每日情报与相应课程的延伸阅读；是否改动已定日期仍遵守总纲调整门槛，不能因单次热点重排课程。

## 实施与发布状态

- 修改前的基线提交 1de781fd2bb4bd479dcc945c34153e689a5b9995 已先推送到 GitHub 仓库 jonXue92/embodied_lab，满足“先上传当前版本、再改课程”的顺序。
- 双团队课程主线提交 5e2c21371459f0ff381cff2e3c76c0ebe0502729 已通过课程、日历、数据迁移、TypeScript、Lint 和生产构建检查，并推送到同一 GitHub main。
- 现有每日自动化 automation 已原地更新，仍为 ACTIVE、每天 22:45（Asia/Shanghai）运行；没有创建重复任务。
- 现有 owner-only 私有 Sites 项目已发布 v16，部署 appgdep_6aa2edf90628819199147fe57ad781b7 成功。访问仍为 custom、仅 owner、0 外部访客、0 群组，环境修订为 0。
