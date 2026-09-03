import { lessons as legacyLessons, type Lesson, type Task } from './content';

export const COURSE_START_DATE = '2026-09-01';
export const COURSE_END_DATE = '2026-12-31';
export const DAILY_TASK_COUNT = 3;

export type DailyTrack = 'foundation' | 'code' | 'insight';
export type DailyTask = Task & { track: DailyTrack; learningDate: string };
export type DailyQuestion = {
  id: string;
  title: string;
  summary: string;
  keywords: string[];
  reference: string;
};
export type DailyLearningPlan = {
  date: string;
  dayNumber: number;
  totalDays: number;
  unitNumber: number;
  unitTitle: string;
  unitOutcome: string;
  theme: string;
  tasks: DailyTask[];
  question: DailyQuestion;
  deliverable: string;
};

type DaySpec = [foundation: string, code: string, insight: string];
type CurriculumUnit = {
  title: string;
  outcome: string;
  deliverable: string;
  keywords: string[];
  sources: { label: string; url: string }[];
  days: DaySpec[];
};

const curriculum: CurriculumUnit[] = [
  {
    title: '具身策略共同语言', outcome: '建立从观测、语言、状态到动作的统一地图，并能区分训练目标、模型架构和系统范式。', deliverable: '概念关系图 + 最小训练循环 + 第一周学习复盘', keywords: ['观测', '动作', '策略', '损失', '闭环', '数据'],
    sources: [{ label: 'LeRobot Policies', url: 'https://huggingface.co/docs/lerobot/en/index' }, { label: 'ACT Official', url: 'https://github.com/tonyzhaozh/act' }],
    days: [
      ['BC、ACT 与 VLA 的分类框架', '追踪 ACT 的张量数据流', 'World Model、VLA 与真机 RL 如何合流'],
      ['PyTorch Dataset、DataLoader 与训练循环', '实现可复现的 batch 与 checkpoint', '训练基础设施为何决定模型迭代速度'],
      ['Transformer 与多模态 Token', '实现 attention mask 与位置编码检查', '语言、视觉和机器人状态如何共享上下文'],
      ['MDP、reward、value 与 Q function', '实现 Bellman target 与终止状态处理', '从模仿学习过渡到经验驱动改进'],
      ['Action Chunk 与时序决策', '实现 chunk 切片、padding 和 temporal ensemble', '推理频率、平滑性与纠错能力的权衡'],
      ['LeRobot 与 SO-101 的系统组成', '读取设备配置、标定和采集入口', '真机实验的安全边界与可复现性'],
      ['第一周知识网络复盘', '用最小脚本串起数据、策略与评测', '把概念地图转化为四个月路线'],
    ],
  },
  {
    title: 'PyTorch 与训练工程', outcome: '能独立定位训练不收敛、显存异常和数据管线瓶颈。', deliverable: '可诊断训练模板 + 性能剖析记录', keywords: ['张量', '梯度', '优化器', '显存', '复现', '评测'],
    sources: [{ label: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials/' }, { label: 'PyTorch Profiler', url: 'https://pytorch.org/tutorials/recipes/recipes/profiler_recipe.html' }],
    days: [
      ['张量 shape、dtype 与 device 契约', '编写 shape assertion 与 batch 检查器', '为什么接口契约比堆模型更重要'],
      ['Autograd 与计算图', '定位 detach、in-place 与梯度中断', '梯度问题如何伪装成数据问题'],
      ['优化器、学习率与 warmup', '实现 scheduler 和梯度裁剪', '稳定训练与快速迭代的取舍'],
      ['归一化、初始化与数值稳定性', '检查 NaN、Inf 和混合精度', '大模型训练为何需要数值护栏'],
      ['损失函数与多任务权重', '记录分项 loss 与动态权重', '离线指标为何不能替代真机成功率'],
      ['Checkpoint、随机种子与实验追踪', '实现断点恢复与配置快照', '什么才算可复现实验'],
      ['Profiler 与数据加载瓶颈', '测量 GPU 利用率和 DataLoader 等待', '先优化哪里才能真正缩短迭代周期'],
    ],
  },
  {
    title: '机器人数据工程', outcome: '建立时间对齐、质量审计和版本化的数据生产线。', deliverable: 'SO-101 数据质检表 + 数据版本说明', keywords: ['时间戳', 'episode', '对齐', '质量', '版本', '采集'],
    sources: [{ label: 'LeRobot Datasets', url: 'https://huggingface.co/docs/lerobot/en/il_robots' }, { label: 'DROID Dataset', url: 'https://droid-dataset.github.io/' }],
    days: [
      ['Episode、frame 与 transition 数据模型', '读取 LeRobotDataset 的样本结构', '数据模式如何限制可训练任务'],
      ['图像、关节状态与动作的时间对齐', '实现 timestamp 差值审计', '延迟为何会被模型误学成策略'],
      ['Action 与 executed action 的区别', '记录控制前后动作及安全裁剪', '为什么真机日志必须保留执行事实'],
      ['视频编码、抽帧与随机读取', '检查帧索引、解码和缓存', '吞吐优化不能破坏时间语义'],
      ['数据质量、异常与失败片段', '实现缺帧、抖动和越界检测', '失败数据什么时候比成功数据更有价值'],
      ['数据增强与机器人等变性', '实现颜色、裁剪与状态噪声实验', '增强何时提升泛化、何时制造偏差'],
      ['数据版本、切分与泄漏防护', '生成 train/eval manifest', '怎样让模型对比结论可审计'],
    ],
  },
  {
    title: '模仿学习策略族', outcome: '比较 BC、DAgger、ACT、Diffusion Policy 与 Flow Matching 的适用边界。', deliverable: '策略族对比表 + 同数据基线实验', keywords: ['模仿学习', '分布偏移', 'chunk', 'diffusion', 'flow', '评测'],
    sources: [{ label: 'Diffusion Policy', url: 'https://diffusion-policy.cs.columbia.edu/' }, { label: 'ACT', url: 'https://tonyzhaozh.github.io/aloha/' }],
    days: [
      ['Behavior Cloning 的目标与假设', '实现连续动作 BC loss', '专家数据覆盖决定了什么'],
      ['Covariate shift 与误差累积', '构造离线好、闭环差的反例', '为什么部署分布才是最终考场'],
      ['DAgger 与人工纠偏', '实现 intervention 标记与聚合', '人工成本如何换取恢复能力'],
      ['ACT 的 CVAE 与 action query', '追踪 posterior、query 和 decoder', '多模态演示为什么需要 latent style'],
      ['Diffusion Policy 的去噪动作生成', '实现 noise schedule 与采样循环', '表达能力与推理时延的权衡'],
      ['Flow Matching 的连续向量场', '实现 flow target 与 Euler 采样', '为什么越来越多 VLA 采用 flow action head'],
      ['策略族公平对比方法', '统一数据、动作空间与评测脚本', '如何避免用配置差异冒充算法提升'],
    ],
  },
  {
    title: '视觉语言基础', outcome: '读懂视觉编码、语言条件和多模态融合如何进入机器人策略。', deliverable: '多模态 token 流程图 + 输入消融实验', keywords: ['视觉', '语言', 'token', '对齐', '编码器', '融合'],
    sources: [{ label: 'Transformers', url: 'https://huggingface.co/docs/transformers/index' }, { label: 'OpenVLA', url: 'https://openvla.github.io/' }],
    days: [
      ['ViT patch 与视觉表征', '检查 patch embedding 和特征尺度', '机器人视觉为何不同于分类视觉'],
      ['Tokenizer 与语言指令', '检查 prompt 模板和 token 截断', '指令措辞如何影响动作泛化'],
      ['Cross-attention 与早晚融合', '追踪视觉 token 进入 decoder 的路径', '融合位置如何影响计算与控制'],
      ['机器人状态的数值编码', '实现 state projection 与归一化', '本体状态为何不能被视觉完全替代'],
      ['多视角相机融合', '实现 camera mask 与视角消融', '增加相机何时反而降低鲁棒性'],
      ['预训练语义到动作空间', '定位 action head 的输入输出契约', '语义能力不等于控制能力'],
      ['多模态输入消融', '设计去语言、去深度、去状态实验', '用证据判断每种模态的真实价值'],
    ],
  },
  {
    title: 'SmolVLA 实战', outcome: '完成小型 VLA 的数据准备、微调、评测与部署路径。', deliverable: 'SmolVLA 小数据微调方案', keywords: ['SmolVLA', '微调', '异步', 'action expert', '数据', '部署'],
    sources: [{ label: 'SmolVLA', url: 'https://huggingface.co/blog/smolvla' }, { label: 'LeRobot', url: 'https://github.com/huggingface/lerobot' }],
    days: [
      ['SmolVLA 架构与设计目标', '定位 vision-language backbone 与 action expert', '小模型为何适合个人真机项目'],
      ['LeRobot 数据到 SmolVLA batch', '检查 feature schema 与 normalization stats', '数据兼容性如何降低实验成本'],
      ['预训练 checkpoint 与参数冻结', '配置冻结层和可训练参数统计', '小数据微调如何避免灾难性遗忘'],
      ['Flow action expert 训练', '追踪噪声动作、时间步与向量场', '动作生成质量与采样步数的权衡'],
      ['异步推理与 action queue', '实现 producer-consumer 控制草图', '大模型推理如何不阻塞控制频率'],
      ['离线评测与回放可视化', '生成预测和专家轨迹对比', '离线误差能回答什么、不能回答什么'],
      ['SO-101 部署检查表', '串联相机、标定、policy 与安全门', '从能运行到可信演示还差哪些证据'],
    ],
  },
  {
    title: 'π0 系列与通用 VLA', outcome: '理解异构数据协同训练、flow action generation 与开放世界泛化。', deliverable: 'π0/π0.5 与小型 VLA 横评', keywords: ['pi0', '异构数据', 'flow matching', '泛化', 'action expert', '后训练'],
    sources: [{ label: 'Physical Intelligence', url: 'https://www.pi.website/blog/pi0' }, { label: 'openpi', url: 'https://github.com/Physical-Intelligence/openpi' }],
    days: [
      ['π0 的视觉语言与动作专家', '阅读 openpi 模型入口和配置', '通用 VLA 的规模来自哪里'],
      ['Flow Matching action generation', '追踪训练 flow target 与推理积分', '连续动作生成为何优于离散 token 的场景'],
      ['异构机器人与动作归一化', '检查本体映射和 action statistics', '多本体训练如何共享又不混淆'],
      ['任务 prompt 与数据混合', '读取数据权重和采样器', '数据配比为什么是后训练核心能力'],
      ['Knowledge Insulation 与泛化', '定位通用知识和动作训练的隔离点', '如何减少动作微调对语义能力的破坏'],
      ['π0.5 开放世界任务', '设计未见场景评测切分', '泛化主张需要哪些证据'],
      ['大 VLA 与小 VLA 选择', '估算显存、时延和数据预算', '个人作品应追求规模还是闭环'],
    ],
  },
  {
    title: 'GR00T、Spirit 与 LingBot', outcome: '用统一问题框架横向阅读国内外具身基础模型。', deliverable: '四模型可审计横评表', keywords: ['GR00T', 'Spirit', 'LingBot', '本体', '数据', '部署'],
    sources: [{ label: 'Isaac GR00T', url: 'https://github.com/NVIDIA/Isaac-GR00T' }, { label: 'LingBot-VLA', url: 'https://github.com/Robbyant/lingbot-vla' }],
    days: [
      ['GR00T 的输入、动作与数据', '阅读 GR00T 配置和 processor', 'NVIDIA 生态如何连接训练与仿真'],
      ['GR00T 微调数据接口', '追踪 dataset adapter 与 embodiment tag', '统一接口怎样支持不同机器人'],
      ['Spirit v1.5 的 VLM + DiT', '定位视觉语言骨干与动作头', '非完美真机数据能否成为资产'],
      ['LingBot-VLA 的连续动作专家', '阅读训练吞吐与深度输入路径', '工程优化如何影响模型可用性'],
      ['深度模态与蒸馏', '设计有深度和无深度 checkpoint 对比', '传感器成本与泛化收益的权衡'],
      ['跨本体表示与动作适配', '实现 embodiment adapter 草图', '共享表示的边界在哪里'],
      ['四模型统一横评', '生成参数、数据、动作、时延表', '如何从岗位需求反推模型选择'],
    ],
  },
  {
    title: 'World Model 与视频生成', outcome: '区分未来预测、规划和动作生成，设计快慢系统协作。', deliverable: '快策略/慢世界模型架构图', keywords: ['world model', '未来', '视频', '规划', '记忆', '异步'],
    sources: [{ label: 'NVIDIA Cosmos', url: 'https://docs.nvidia.com/cosmos/latest/' }, { label: 'DreamerV3', url: 'https://danijar.com/project/dreamerv3/' }],
    days: [
      ['World Model 预测什么', '实现 latent dynamics 最小接口', '未来预测与动作策略的边界'],
      ['像素空间与 latent 空间预测', '比较 video loss 和 latent loss', '视觉逼真是否等于控制有效'],
      ['动作条件未来生成', '检查 action conditioning 与 horizon', '可控生成如何服务机器人规划'],
      ['Dreamer 式 imagination', '实现 imagined rollout 与 value target', '在模型中学习如何减少真机试错'],
      ['Cosmos 世界基础模型', '阅读数据、tokenizer 与推理接口', '大规模视频先验怎样进入机器人系统'],
      ['快 policy 与慢 planning', '实现异步计划缓存和过期检查', '2 秒规划如何服务 50 ms 控制'],
      ['World Model 评测', '设计预测、排序和闭环三层指标', '为什么单看视频质量会误导路线判断'],
    ],
  },
  {
    title: '仿真与 Sim2Real', outcome: '用仿真形成安全、可规模化且可迁移的实验闭环。', deliverable: 'SO-101 仿真—真机差距清单', keywords: ['仿真', 'sim2real', '随机化', '标定', '碰撞', '评测'],
    sources: [{ label: 'Isaac Lab', url: 'https://isaac-sim.github.io/IsaacLab/' }, { label: 'MuJoCo', url: 'https://mujoco.readthedocs.io/' }],
    days: [
      ['URDF、关节与坐标系', '检查 joint limit 与 transform tree', '模型描述错误如何污染所有实验'],
      ['MuJoCo/Isaac Lab 环境结构', '追踪 reset、step 和 observation', '选择仿真器应看什么'],
      ['碰撞、接触与控制频率', '记录 contact force 和 substep', '仿真稳定不等于真实稳定'],
      ['Domain Randomization', '实现视觉和动力学参数采样', '随机化范围过大为何也会失败'],
      ['系统辨识与参数校准', '拟合摩擦、延迟和执行器响应', '何时该校准、何时该随机化'],
      ['仿真数据混入真机训练', '配置数据来源标签和采样权重', '合成数据如何避免压过真实信号'],
      ['Sim2Real 评测协议', '生成仿真—真机指标对照', '迁移成功需要哪些可重复证据'],
    ],
  },
  {
    title: '控制、部署与安全', outcome: '把模型输出安全地变成稳定控制命令，并具备诊断能力。', deliverable: '部署状态机 + 安全检查单', keywords: ['控制', '延迟', '安全', '状态机', '监控', '回退'],
    sources: [{ label: 'ROS 2', url: 'https://docs.ros.org/en/rolling/' }, { label: 'LeRobot Robots', url: 'https://huggingface.co/docs/lerobot/en/robots' }],
    days: [
      ['位置、速度与末端控制', '实现动作空间转换和裁剪', '策略输出必须匹配控制器语义'],
      ['控制频率与端到端延迟', '测量感知—推理—执行时间线', '平均时延为何掩盖长尾风险'],
      ['动作平滑与限幅', '实现 rate limit 和低通滤波', '平滑性不能牺牲纠错能力'],
      ['状态机与任务阶段', '实现 approach、grasp、lift 状态', '何时需要模型，何时规则更可靠'],
      ['异常检测与安全回退', '实现 watchdog、超时和保守姿态', '失败时系统应该怎样退化'],
      ['日志、回放与根因定位', '关联 observation、action 和 event', '可观测性如何缩短真机调试'],
      ['部署验收与回归测试', '编写 smoke test 和安全 checklist', '一次成功演示为什么还不够'],
    ],
  },
  {
    title: '强化学习基础', outcome: '掌握 value-based、policy-based 与 actor-critic 的共同数学结构。', deliverable: 'MDP 状态图 + PPO/SAC 最小实现注释', keywords: ['MDP', 'reward', 'value', 'policy', 'advantage', '探索'],
    sources: [{ label: 'Spinning Up', url: 'https://spinningup.openai.com/' }, { label: 'CleanRL', url: 'https://github.com/vwxyzjn/cleanrl' }],
    days: [
      ['MDP 与部分可观测性', '实现 transition 数据结构', '机器人为何常常是 POMDP'],
      ['Return、discount 与 credit assignment', '计算 n-step return', '稀疏成功信号怎样传回早期动作'],
      ['Value、Q 与 advantage', '实现 GAE 计算', '基线如何降低策略梯度方差'],
      ['Policy Gradient', '实现 log-prob objective', '探索与稳定更新的矛盾'],
      ['PPO clipped objective', '追踪 ratio、clip 和 entropy', '为什么 PPO 常用于后训练'],
      ['SAC 与最大熵控制', '实现 actor、critic 与温度更新', '连续真机控制为何偏爱 off-policy'],
      ['RL 实验诊断', '绘制 return、success 和 Q 统计', '曲线上升不一定代表策略更安全'],
    ],
  },
  {
    title: 'Offline RL 与价值学习', outcome: '从固定数据学习策略，同时识别分布外动作和价值高估。', deliverable: 'Offline RL 数据审计 + 基线方案', keywords: ['offline RL', '分布外', 'Q', '保守', '数据覆盖', 'advantage'],
    sources: [{ label: 'CQL', url: 'https://sites.google.com/view/cql-offline-rl' }, { label: 'IQL', url: 'https://github.com/ikostrikov/implicit_q_learning' }],
    days: [
      ['Offline RL 的问题设定', '加载固定 replay dataset', '为什么不能在线试错'],
      ['分布外动作与 Q 高估', '可视化数据动作支持集', '价值函数为何会相信没见过的动作'],
      ['Behavior regularization', '实现 policy 与 behavior 距离', '保守约束如何换取稳定性'],
      ['CQL 的保守 Q 学习', '拆解 conservative penalty', '悲观估计适合什么数据'],
      ['IQL 的 expectile 与 advantage weighting', '实现 expectile loss', '不显式查询 OOD 动作的价值'],
      ['Offline-to-online 过渡', '设计小步上线与 replay 混合', '如何避免上线初期性能崩塌'],
      ['Offline RL 公平评测', '统一数据覆盖和在线预算', '数据质量和算法贡献怎样分开'],
    ],
  },
  {
    title: 'HIL-SERL 真机闭环', outcome: '设计带人工接管、奖励分类器和异步训练的安全真机 RL 系统。', deliverable: 'HIL-SERL 最小可行实验方案', keywords: ['HIL-SERL', '介入', 'reward classifier', 'replay', 'SAC', '安全'],
    sources: [{ label: 'HIL-SERL', url: 'https://hil-serl.github.io/' }, { label: 'LeRobot HIL-SERL', url: 'https://github.com/huggingface/lerobot/blob/main/docs/source/hilserl.mdx' }],
    days: [
      ['HIL-SERL 的系统组成', '阅读 actor、learner 与 data store', '为什么人机协同能兼顾安全和探索'],
      ['演示初始化与 replay buffer', '构造 demo/online 混合采样', '初始成功经验如何稳定在线学习'],
      ['Reward classifier', '实现成功/失败图像分类输入', '奖励误判会怎样伤害策略'],
      ['人工介入信号', '记录 proposed 与 executed action', '介入既是护栏也是高价值监督'],
      ['异步 actor-learner', '实现参数同步与版本号', '训练更新不能阻塞控制'],
      ['真机 SAC 调参与监控', '检查 Q、entropy 和 intervention rate', '如何识别策略钻奖励漏洞'],
      ['HIL-SERL 安全评审', '完成急停、边界与回退演练', '什么条件满足后才能开始在线训练'],
    ],
  },
  {
    title: 'RECAP、Evo-RL 与迭代学习', outcome: '把自主 rollout、value、advantage 与下一版策略训练连成可复现循环。', deliverable: 'SO-101 rollout—value—policy 迭代脚本设计', keywords: ['RECAP', 'Evo-RL', 'rollout', 'value', 'advantage', '迭代'],
    sources: [{ label: 'RECAP', url: 'https://www.pi.website/blog/pistar06' }, { label: 'Evo-RL', url: 'https://github.com/MINT-SJTU/Evo-RL' }],
    days: [
      ['RECAP 的数据组成', '标注 demo、rollout 与 intervention', '异构经验怎样进入同一 VLA'],
      ['Value 估计任务进展', '实现轨迹级到时间步级标签', '价值能否代表离成功更近'],
      ['Advantage 与 improvement indicator', '生成二值改进条件', '条件化策略如何选择更优动作'],
      ['Evo-RL 的工程流程', '阅读 rollout、value、retrain CLI', '研究 recipe 如何变成可复现项目'],
      ['失败回收与数据再平衡', '按失败类型重采样', '什么失败值得进入下一轮训练'],
      ['版本晋级与安全门', '比较 policy_n 与 policy_n+1', '新策略必须怎样证明更好'],
      ['完整迭代闭环复盘', '串联采集、标注、训练、评测和部署', '持续改进系统最容易断在哪里'],
    ],
  },
  {
    title: '评测、可靠性与安全', outcome: '建立离线、仿真、真机三层评测与回归机制。', deliverable: '真机评测协议 + 风险登记表', keywords: ['评测', '成功率', '可靠性', '安全', '回归', '统计'],
    sources: [{ label: 'LeRobot Evaluation', url: 'https://huggingface.co/docs/lerobot/en/policies' }, { label: 'NIST AI RMF', url: 'https://www.nist.gov/itl/ai-risk-management-framework' }],
    days: [
      ['成功定义与任务容差', '实现可重复 success detector', '模糊成功标准如何夸大结果'],
      ['离线指标与闭环指标', '关联 action error 和 task success', '为什么 L1 更低可能真机更差'],
      ['重复试验与置信区间', '计算成功率区间和样本量', '展示最好一次为何不可信'],
      ['扰动与泛化测试', '构造物体、光照和位置网格', '泛化应覆盖哪些变化维度'],
      ['安全指标与近失事件', '记录越界、急停和人工介入', '没有损坏不等于没有风险'],
      ['回归测试与版本比较', '自动生成旧任务回放清单', '新能力不能悄悄破坏旧能力'],
      ['评测报告与证据链', '输出配置、数据、视频和统计摘要', '怎样让招聘者相信你的结果'],
    ],
  },
  {
    title: 'SO-101 毕业项目', outcome: '完成一个可复现、可评测、可讲解的真机持续改进作品。', deliverable: '演示—rollout—介入—改进完整作品', keywords: ['SO-101', '项目', '基线', '实验', '部署', '复现'],
    sources: [{ label: 'LeRobot SO-101', url: 'https://huggingface.co/docs/lerobot/en/so101' }, { label: 'LeRobot GitHub', url: 'https://github.com/huggingface/lerobot' }],
    days: [
      ['项目任务与成功标准', '建立配置、日志和目录骨架', '选择任务时如何控制风险与工作量'],
      ['硬件装配、标定与安全', '运行电机、相机和限位检查', '硬件可靠性是算法实验前提'],
      ['演示数据采集', '记录多样化成功轨迹', '多少数据才足以建立基线'],
      ['BC/ACT 基线训练', '跑通训练、评测和 checkpoint', '先有稳定基线再谈创新'],
      ['基线真机 rollout', '采集成功、失败和介入日志', '部署数据揭示了哪些分布偏移'],
      ['Value/advantage 改进', '训练价值并生成改进标签', '闭环改进是否来自正确机制'],
      ['第一轮对比实验', '比较成功率、时延和介入率', '结果不显著时如何诚实复盘'],
    ],
  },
  {
    title: '作品发布、答辩与下一阶段', outcome: '把四个月技术工作转化为可信作品，完成答辩并形成下一阶段计划。', deliverable: '公开仓库 + 毕业答辩 + 2027 Q1 实验计划', keywords: ['作品', 'README', '答辩', '计划', '复盘', '证据'],
    sources: [{ label: 'GitHub Docs', url: 'https://docs.github.com/en/repositories' }, { label: 'Papers with Code', url: 'https://paperswithcode.com/' }],
    days: [
      ['最终作品的 README 与证据链', '验证环境、数据、复现命令和演示链接', '如何让招聘者快速判断项目可信度'],
      ['四个月毕业项目技术答辩', '运行最终回归、指标汇总与演示脚本', '如何回答架构选择、失败案例和安全追问'],
      ['2027 Q1 主攻路线规划', '建立 VLA、World Model 与真机 RL 实验 backlog', '如何用现有证据选择下一阶段方向'],
      ['消融实验与结果表', '自动汇总配置和指标', '用最少实验回答最关键问题'],
      ['技术复盘与根因分析', '整理 issue、日志和修复证据', '把踩坑转化为面试亮点'],
      ['项目面试与追问', '生成模型、数据、部署三层问答', '怎样从实现细节上升到系统判断'],
      ['最终发布与路线复盘', '验证仓库、视频和文档链接', '下一阶段应继续深化什么'],
    ],
  },
];

const DAY_MS = 86_400_000;

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

export function addDays(dateKey: string, amount: number) {
  return new Date(parseDateKey(dateKey) + amount * DAY_MS).toISOString().slice(0, 10);
}

export function shanghaiDateKey(value = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(value);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function isCurriculumDate(dateKey: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey) && dateKey >= COURSE_START_DATE && dateKey <= COURSE_END_DATE
    && new Date(parseDateKey(dateKey)).toISOString().slice(0, 10) === dateKey;
}

export function resolveLearningDate(dateKey: string) {
  if (dateKey < COURSE_START_DATE) return COURSE_START_DATE;
  if (dateKey > COURSE_END_DATE) return COURSE_END_DATE;
  return dateKey;
}

export function learningDayNumber(dateKey: string) {
  if (!isCurriculumDate(dateKey)) return null;
  return Math.floor((parseDateKey(dateKey) - parseDateKey(COURSE_START_DATE)) / DAY_MS) + 1;
}

export const TOTAL_LEARNING_DAYS = Math.floor((parseDateKey(COURSE_END_DATE) - parseDateKey(COURSE_START_DATE)) / DAY_MS) + 1;

function lessonId(date: string, track: DailyTrack) {
  return `${date}-${track}`;
}

function planSpec(dateKey: string) {
  const dayNumber = learningDayNumber(dateKey);
  if (!dayNumber) return null;
  const index = dayNumber - 1;
  const unitIndex = Math.floor(index / 7);
  const unit = curriculum[unitIndex];
  const spec = unit.days[index % 7];
  return { dayNumber, unitIndex, unit, spec };
}

export function getDailyLearningPlan(dateKey: string): DailyLearningPlan | null {
  const resolved = planSpec(dateKey);
  if (!resolved) return null;
  const { dayNumber, unitIndex, unit, spec } = resolved;
  const [foundation, code, insight] = spec;
  const tasks: DailyTask[] = [
    { id: lessonId(dateKey, 'foundation'), track: 'foundation', learningDate: dateKey, type: '基础知识', title: foundation, time: '45 分钟', color: 'mint' },
    { id: lessonId(dateKey, 'code'), track: 'code', learningDate: dateKey, type: '代码精读', title: code, time: '50 分钟', color: 'amber' },
    { id: lessonId(dateKey, 'insight'), track: 'insight', learningDate: dateKey, type: '路线洞察', title: insight, time: '45 分钟', color: 'blue' },
  ];
  const questionTitle = dayNumber === 1
    ? '为什么 VLA 通常输出一段 Action Chunk，而不是只预测下一个动作？'
    : `把“${foundation}”用于“${insight}”时，最关键的工程假设、失败信号和验证实验分别是什么？`;
  return {
    date: dateKey,
    dayNumber,
    totalDays: TOTAL_LEARNING_DAYS,
    unitNumber: unitIndex + 1,
    unitTitle: unit.title,
    unitOutcome: unit.outcome,
    theme: foundation,
    tasks,
    deliverable: unit.deliverable,
    question: {
      id: `daily-${dateKey}`,
      title: questionTitle,
      summary: `围绕“${foundation}—${code}—${insight}”按假设、证据和行动三层回答。`,
      keywords: [...unit.keywords, '假设', '失败', '验证'],
      reference: `先明确“${foundation}”成立所依赖的数据、接口和环境假设；再指出“${code}”中最早可观察的失败信号；最后设计一个控制变量清晰、同时记录离线指标与闭环结果的实验，用证据判断它是否真正支撑“${insight}”。`,
    },
  };
}

function generatedLesson(dateKey: string, track: DailyTrack, task: DailyTask, unit: CurriculumUnit, spec: DaySpec): Lesson {
  const [foundation, code, insight] = spec;
  const sharedIntro = `这是 ${dateKey} 的${task.type}课程，处于“${unit.title}”单元。今天把“${foundation}”“${code}”和“${insight}”连接起来，目标不是记住术语，而是形成可解释、可运行、可验证的判断。`;
  const trackContent: Record<DailyTrack, Pick<Lesson, 'outcomes' | 'sections' | 'points' | 'codeTitle' | 'code' | 'quiz'>> = {
    foundation: {
      outcomes: [`用自己的话准确解释“${foundation}”`, `画出它与“${code}”之间的数据或控制关系`, `指出它在“${insight}”中最容易被忽略的假设`],
      sections: [
        { heading: '01 先界定今天的问题', body: `“${foundation}”要解决的不是孤立概念题，而是机器人从观测进入决策、再由真实结果校验的一个环节。先写清输入、输出、监督或反馈信号，以及它运行在训练阶段还是部署阶段。` },
        { heading: '02 建立核心对象', body: `把问题拆成数据、表示、策略、控制和评测五层。${unit.outcome} 每一层都要有明确接口，不能用“模型会自动学到”替代解释。`, example: `input -> representation -> policy/value -> executed_action -> outcome` },
        { heading: '03 顺着机制链推演', body: `从一条具体样本或一次 rollout 出发，逐步追踪信息如何流过“${foundation}”。每一步都问：张量或状态代表什么、时间戳属于哪一刻、下游如何使用、发生异常时谁能最先发现。` },
        { heading: '04 识别常见误区', body: `常见错误包括混淆训练目标和模型结构、把离线拟合好当成闭环控制好、忽略执行动作与模型建议动作的差异，以及在数据覆盖不足时夸大泛化。` },
        { heading: '05 与代码和系统连接', body: `今天的代码课“${code}”是概念落点；路线课“${insight}”则回答它为何值得投入。学习时至少留下一个 shape、一个日志字段和一个可复现实验。` },
        { heading: '06 当天最小产出', body: `完成一张不超过一页的机制图：标出输入、输出、关键假设、失败信号和验证指标，并把它归入单元产出“${unit.deliverable}”。` },
      ],
      points: [`${foundation} 必须用输入、输出和反馈信号来定义。`, `概念是否掌握，要看能否在“${code}”中找到对应接口。`, `最终判断必须回到“${insight}”要求的闭环证据。`],
      codeTitle: 'concept_contract.py',
      code: `topic = "${foundation}"\ncontract = {\n    "inputs": ["observation", "robot_state", "goal"],\n    "outputs": ["prediction_or_action"],\n    "assumptions": ["timestamp_aligned", "normalization_frozen"],\n    "evidence": ["offline_metric", "closed_loop_success"],\n}\nassert all(contract.values()), f"{topic}: contract incomplete"`,
      quiz: { id: `quiz-${task.id}`, question: `请用“输入—机制—输出—失败模式—验证”五层解释“${foundation}”。`, hint: '不要只下定义；至少给出一个张量/日志落点和一个闭环实验。', reference: `先写清输入观测、状态或数据分布，再说明“${foundation}”如何产生中间表示或决策；输出必须对应可执行接口。失败模式至少覆盖数据错位、分布外输入或控制延迟，验证同时使用离线指标与“${insight}”相关的闭环结果。` },
    },
    code: {
      outcomes: [`定位“${code}”的入口、核心状态和输出`, '能为关键张量或记录写出 shape/字段契约', '能设计一个失败用例并从日志定位根因'],
      sections: [
        { heading: '01 从调用入口开始', body: `先不要陷入实现细节。找到“${code}”的调用者、配置来源、数据加载入口和最终消费者，画出最短调用链。` },
        { heading: '02 追踪数据契约', body: `对每个关键对象记录 shape、dtype、device、时间语义和归一化方式。机器人代码中最危险的 bug 往往不是语法错误，而是“数值看起来合理、语义已经错位”。`, example: `batch: [B, T, ...] | timestamp: observation time | action: executed or proposed` },
        { heading: '03 阅读核心转换', body: `围绕“${foundation}”解释每次转换为何存在：它保留什么信息、丢弃什么信息、是否只在训练时启用，以及部署时是否有等价路径。` },
        { heading: '04 加入可诊断日志', body: `至少记录输入范围、关键 shape、loss/score 分项、推理时延和异常计数。日志要能回答“第一处偏离预期的位置在哪里”，而不是只输出最终成功或失败。` },
        { heading: '05 构造失败用例', body: `主动注入一个错位时间戳、错误归一化或过期计划，确认检查器能在靠近源头的位置失败。没有失败测试的代码精读，很容易停留在“看懂了”的错觉。` },
        { heading: '06 连接路线判断', body: `最后回答“${code}”如何支撑“${insight}”：它改善的是数据质量、训练稳定性、推理吞吐、安全性，还是闭环恢复能力。` },
      ],
      points: ['代码精读先追调用链和数据契约，再看算法细节。', '每个关键对象都要写清 shape、时间语义和消费者。', '通过故意制造失败验证日志与断言是否真正有效。'],
      codeTitle: 'daily_code_lens.py',
      code: `def inspect_step(batch, model, clock):\n    assert batch["observation"].ndim >= 2\n    assert batch["timestamp"].is_monotonic_increasing\n    started = clock.now()\n    output = model(batch)  # ${code}\n    latency_ms = (clock.now() - started) * 1000\n    return {\n        "output": output,\n        "latency_ms": latency_ms,\n        "finite": output.isfinite().all().item(),\n        "topic": "${foundation}",\n    }`,
      quiz: { id: `quiz-${task.id}`, question: `如果“${code}”离线结果正常但真机失败，你会按什么顺序检查？`, hint: '至少覆盖数据契约、训练/推理差异、时延和执行动作。', reference: `先核对样本 schema、shape、归一化和时间戳，再比较训练与部署的预处理、模型模式和 checkpoint；随后测量端到端时延并区分 proposed action 与 executed action；最后用最小回放和闭环 A/B 实验判断问题来自数据、模型还是控制。` },
    },
    insight: {
      outcomes: [`解释“${insight}”对应的真实决策`, `比较至少两种可行路线的成本、收益与风险`, `形成一个与“${unit.deliverable}”相连的下一步行动`],
      sections: [
        { heading: '01 把热点改写成决策', body: `路线洞察不是罗列模型名字。把“${insight}”改写为一个决策：在你的数据、算力、机器人、安全和时间预算下，下一步应验证哪条假设。` },
        { heading: '02 明确当前基线', body: `没有基线就无法判断新路线是否有价值。基线至少包括当前成功率、推理时延、数据量、失败类型和人工介入率，并关联今天的基础课“${foundation}”。` },
        { heading: '03 比较两条路线', body: `路线 A 优先复用稳定组件，路线 B 引入“${code}”相关的新机制。比较两者对数据需求、训练复杂度、部署风险和可解释性的影响。` },
        { heading: '04 设置晋级门槛', body: `新路线只有在固定评测集和真机任务上达到预先声明的门槛，且没有显著增加安全事件或长尾延迟，才进入下一阶段。` },
        { heading: '05 对齐岗位与作品证据', body: `把路线转化为可展示证据：代码提交、数据说明、对比实验、失败复盘、演示视频和安全清单。技能只有被证据支撑，才能真正进入求职叙事。` },
        { heading: '06 写下停止条件', body: `如果两轮实验仍没有改善核心指标，或数据与硬件成本超出预算，应回到更简单基线。知道何时停止，是研究和工程判断的一部分。` },
      ],
      points: ['路线洞察最终必须落到一个可验证决策。', '新方法要和固定基线比较，并设置晋级与停止条件。', '项目价值来自完整证据链，而不是追逐最新模型名称。'],
      codeTitle: 'route_decision.yaml',
      code: `decision: "${insight}"\nbaseline:\n  metrics: [success_rate, latency_p95, intervention_rate]\ncandidate:\n  mechanism: "${code}"\n  expected_gain: "measurable closed-loop improvement"\npromotion_gate:\n  - success_rate_improves\n  - no_new_safety_regression\n  - evidence_is_reproducible`,
      quiz: { id: `quiz-${task.id}`, question: `围绕“${insight}”提出一个两周内可完成的路线决策实验。`, hint: '写清基线、唯一变量、指标、晋级门槛和停止条件。', reference: `保持任务、数据切分、硬件和评测脚本不变，只改变“${code}”对应的一项机制；同时记录成功率、p95 时延、人工介入和失败类型。预先给出晋级门槛，若两轮实验没有改善主要指标或引入安全回归，就停止并回到基线。` },
    },
  };
  const content = trackContent[track];
  return {
    title: task.title, type: task.type, duration: task.time, intro: sharedIntro,
    outcomes: content.outcomes, sections: content.sections, points: content.points,
    codeTitle: content.codeTitle, code: content.code, quiz: content.quiz, sources: unit.sources,
  };
}

export function getLessonById(id: string): { lesson: Lesson; task: DailyTask; plan: DailyLearningPlan } | null {
  const match = id.match(/^(\d{4}-\d{2}-\d{2})-(foundation|code|insight)$/);
  if (!match) return null;
  const [, dateKey, rawTrack] = match;
  const track = rawTrack as DailyTrack;
  const plan = getDailyLearningPlan(dateKey);
  const spec = planSpec(dateKey);
  if (!plan || !spec) return null;
  const task = plan.tasks.find((item) => item.track === track);
  if (!task) return null;
  if (dateKey === COURSE_START_DATE) {
    const legacyId = track === 'foundation' ? 'vla-map' : track === 'code' ? 'act-code' : 'world-policy';
    return { lesson: { ...legacyLessons[legacyId], quiz: { ...legacyLessons[legacyId].quiz, id: `quiz-${task.id}` } }, task, plan };
  }
  return { lesson: generatedLesson(dateKey, track, task, spec.unit, spec.spec), task, plan };
}

export function allLessonIds() {
  const ids: string[] = [];
  for (let dateKey = COURSE_START_DATE; dateKey <= COURSE_END_DATE; dateKey = addDays(dateKey, 1)) {
    ids.push(lessonId(dateKey, 'foundation'), lessonId(dateKey, 'code'), lessonId(dateKey, 'insight'));
  }
  return ids;
}

export function getUnitWeek(dateKey: string) {
  const dayNumber = learningDayNumber(dateKey);
  if (!dayNumber) return [];
  const unitStartIndex = Math.floor((dayNumber - 1) / 7) * 7;
  return Array.from({ length: 7 }, (_, offset) => {
    const date = addDays(COURSE_START_DATE, unitStartIndex + offset);
    const plan = getDailyLearningPlan(date);
    return plan ? { date, dayNumber: plan.dayNumber, theme: plan.theme, active: date === dateKey } : null;
  }).filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export function getDynamicRubric(questionId: string) {
  if (questionId.startsWith('daily-')) {
    const plan = getDailyLearningPlan(questionId.slice(6));
    return plan ? { keywords: plan.question.keywords, answer: plan.question.reference } : null;
  }
  if (questionId.startsWith('quiz-')) {
    const entry = getLessonById(questionId.slice(5));
    if (!entry) return null;
    const unit = planSpec(entry.plan.date)?.unit;
    return { keywords: [...(unit?.keywords ?? []), '输入', '输出', '验证', '失败'], answer: entry.lesson.quiz.reference };
  }
  return null;
}
