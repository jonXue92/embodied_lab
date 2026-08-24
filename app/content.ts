export type Task = { id: string; type: string; title: string; time: string; color: string };
export type ModelItem = { id: string; name: string; team: string; family: string; scale: string; action: string; data: string; highlight: string; code: string; url: string };
export type InterviewItem = { id: string; cat: string; q: string; freq: number; source: string; level: string };
export type JobItem = { id: string; company: string; role: string; city: string; fit: number; date: string; skills: string[]; reason: string; url?: string; localSource?: boolean };
export type Lesson = { title: string; intro: string; sections: { heading: string; body: string }[]; points: string[]; code: string; prompt: string; sources: { label: string; url: string }[] };

export const tasks: Task[] = [
  { id: 'vla-map', type: '基础知识', title: 'BC、ACT 与 VLA：三种范式到底差在哪里', time: '35 分钟', color: 'mint' },
  { id: 'act-code', type: '代码精读', title: '读懂 ACT 的 Chunking、CVAE 与 Temporal Ensemble', time: '35 分钟', color: 'amber' },
  { id: 'world-policy', type: '路线洞察', title: '为什么 World Model 正在与 Policy / Action 模型合流', time: '20 分钟', color: 'blue' },
];

export const phases = [
  { month: '09 月', tag: '基础 + 工程', title: '建立模型、数据与机器人共同语言', detail: 'PyTorch 训练循环、Transformer/VLM；BC、ACT、Diffusion Policy、DAgger；LeRobot 数据时序对齐与质检。', output: '输出：ACT 伪代码 + 数据质检脚本 + SO-101 采集样例' },
  { month: '10 月', tag: 'VLA 家族', title: '用五层框架读懂主流开源 VLA', detail: 'SmolVLA、π0.5、Spirit v1.5、LingBot-VLA 2.0、GR00T N1.7、WALL-OSS；输入表示、Action Head、数据、训练与部署对比。', output: '输出：模型横评 + SmolVLA 小数据微调' },
  { month: '11 月', tag: 'World + Action', title: '建立世界模型与决策合流主线', detail: 'LingBot-World / Infinity、LingBot-VA / VA 2.0、Cosmos 3；视频世界建模、逆动力学、World Action Model、记忆以及快/慢双系统。', output: '输出：World Model 技术地图 + 未来帧/动作对比实验' },
  { month: '12 月', tag: '真机 + 求职', title: '打通 SO-101 Demo 与面试证据链', detail: '数据采集、微调、异步推理、真机排障、失败归因、DAgger；GitHub README、视频、消融与模拟面试。', output: '输出：可复现仓库 + 演示视频 + 项目复盘' },
];

export const weekDays = [
  ['周一', 'BC → ACT → VLA 全景', '80m'], ['周二', 'PyTorch Dataset / DataLoader / 训练循环', '70m'],
  ['周三', 'Transformer 与多模态 Token', '80m'], ['周四', '分布偏移、DAgger 与后训练数据', '75m'],
  ['周五', 'ACT 代码：Chunk + CVAE + Ensemble', '90m'], ['周六', 'LeRobot + SO-101 标定与采集', '90m'],
  ['周日', '复盘、答疑归档与面试表达', '50m'],
];

export const models: ModelItem[] = [
  { id: 'smolvla', name: 'SmolVLA', team: 'Hugging Face', family: 'VLA', scale: '450M', action: 'Flow Matching', data: 'LeRobot 社区数据', highlight: '最适合 SO-101 实战起步，关键在小模型与异步推理', code: 'SmolVLM2 编码多视角/语言，Action Expert 以 Flow Matching 预测 action chunk。', url: 'https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx' },
  { id: 'pi05', name: 'π0.5', team: 'Physical Intelligence', family: 'VLA', scale: '基础模型', action: 'Flow Matching', data: '10k+ h + Web / 异构数据', highlight: '用异构协同训练与 Knowledge Insulation 追求开放世界泛化', code: 'openpi 对视觉、语言、状态和噪声动作编码，仅 Flow Matching head 支持 π0.5。', url: 'https://github.com/Physical-Intelligence/openpi' },
  { id: 'spirit15', name: 'Spirit v1.5', team: '千寻智能', family: 'VLA', scale: 'Qwen3-VL + DiT', action: 'DiT Action Head', data: '强调非完美真机数据', highlight: '将「真实数据不完美」作为泛化资产，已开放微调代码', code: 'modeling_spirit_vla.py 串起 Qwen3-VL backbone、DiT head 与 policy API，适合逐层精读。', url: 'https://github.com/Spirit-AI-Team/spirit-v1.5' },
  { id: 'lingbot-vla', name: 'LingBot-VLA', team: '蚂蚁灵波', family: 'VLA', scale: '4B / 6B', action: '连续动作专家', data: '20,000h / 9 种双臂', highlight: '工程实用主义：训练吞吐、深度蒸馏与跨本体', code: '对比 depth-free 与 depth-distilled checkpoint，直接回答深度模态是否带来增益。', url: 'https://github.com/Robbyant/lingbot-vla' },
  { id: 'groot', name: 'GR00T N1.7', team: 'NVIDIA', family: 'VLA', scale: '大型', action: 'VLA / Diffusion', data: '32,000h 人类 + 8,000h 仿真', highlight: '学习数据工厂、仿真、后训练到 TensorRT 部署的全栈链路', code: 'Cosmos-Reason2-2B 作为推理 backbone，长任务分解与动作模型分层协作。', url: 'https://developer.nvidia.com/blog/develop-humanoid-robot-policies-end-to-end-with-nvidia-isaac-gr00t/' },
  { id: 'lingbot-world', name: 'LingBot-World Infinity', team: '蚂蚁灵波', family: 'World Model', scale: '1.3B / 14B', action: '可控世界生成', data: '视频 + 控制信号', highlight: '无界交互、720p60 实时版与 Agentic Harness 展示世界模型的长时域方向', code: '因果预训练 + 实时蒸馏；Pilot Agent 规划行为，Director Agent 生成新环境元素。', url: 'https://github.com/Robbyant/lingbot-world-v2' },
  { id: 'lingbot-va', name: 'LingBot-VA', team: '蚂蚁灵波', family: 'World + Action', scale: '5.3B', action: '未来帧 + 逆动力学', data: '视频 + 机器人动作', highlight: '先预测「应该发生什么」，再反推「要做什么」', code: '自回归扩散世界模型联合未来帧预测与 policy execution，连接 video prior 和 control。', url: 'https://github.com/Robbyant/lingbot-va' },
  { id: 'cosmos3', name: 'Cosmos 3', team: 'NVIDIA', family: 'World + Action', scale: 'Super / Nano', action: '推理 + 生成 + Action', data: '文本/图像/视频/音频/动作', highlight: '以 Mixture-of-Transformers 统一理解、世界生成与动作建模', code: 'Reasoner 负责物理理解，Generator 负责未来世界/策略生成，Nano Policy 面向机器人动作。', url: 'https://docs.nvidia.com/cosmos/latest/cosmos3/index.html' },
];

export const interviewItems: InterviewItem[] = [
  { id: 'q1', cat: 'VLA 架构', q: 'π0 系列为什么使用 Flow Matching 生成连续动作？', freq: 8, source: '2026.07 面经汇总', level: '高频' },
  { id: 'q2', cat: '数据', q: '遥操数据中，图像与关节状态如何对齐？时延如何测量？', freq: 7, source: '杭州具身公司', level: '高频' },
  { id: 'q3', cat: '后训练', q: 'VLA 的 SFT 数据配比应如何设计？如何避免新任务灾难性遗忘？', freq: 6, source: '上海 Post-training', level: '必会' },
  { id: 'q4', cat: '工程', q: '真机成功率突然下降，你会如何分层排查？', freq: 9, source: '2026.06—08 多篇面经', level: '最高频' },
  { id: 'q5', cat: '多模态感知', q: '深度、触觉或 RAW 模态如何接入现有 VLA？', freq: 4, source: '上海多模态算法', level: '高匹配' },
  { id: 'q6', cat: '世界模型', q: '快思考控制与慢思考规划如何共享记忆并避免控制延迟？', freq: 5, source: '7.png JD', level: '新增主线' },
];

export const jobs: JobItem[] = [
  { id: 'job-reference', company: '4 月重点企业', role: '具身基座模型 / 双系统研发', city: '杭州 / 上海参考', fit: 90, date: '来自 7.png', skills: ['快/慢双系统', '记忆系统', 'VLA / World Model', '快速原型'], reason: '与你的模型、数据和落地目标最接近；已将记忆、世界模型与工程交付前移。', localSource: true },
  { id: 'job-arcsoft', company: '虹软科技', role: '27 届具身大脑 / VLA 算法工程师', city: '杭州', fit: 88, date: '08-21 更新', skills: ['VLM / VLA', 'World Model', 'Diffusion Policy', 'PPO / SAC'], reason: '要求覆盖模型、训练与机器人实战，可用 SO-101 项目补齐。', url: 'https://www.nowcoder.com/jobs/detail/454521?urlSource=sitemap' },
  { id: 'job-uniview', company: '宇泛智能', role: '具身智能算法（VLN / VLA）', city: '杭州', fit: 84, date: '06 月发布', skills: ['3D 感知', '强化学习', '扩散模型', '真机部署'], reason: '你的视觉、LiDAR 和数据处理背景是差异化优势。', url: 'https://www.liepin.com/job/1978011737.shtml' },
  { id: 'job-post', company: '杭州具身团队', role: 'Post-training 算法实习生', city: '杭州 · 西湖', fit: 91, date: '08 月更新', skills: ['SFT Pipeline', '多任务数据配比', 'PPO / GRPO / DPO'], reason: '与 9—12 月 POC 中的后训练数据经验高度相关。', url: 'https://www.ncss.cn/student/jobs/NYAuURS6bzCbBUPYP7nhvh/detail.html' },
  { id: 'job-neoteai', company: '新智具身', role: '多模态 / 强化学习算法', city: '上海', fit: 86, date: '08 月在招', skills: ['视触觉', 'LLM / VLM / VLA', 'PPO / TD3', '遥操数据工场'], reason: '视触觉与多模态感知方向最贴合你的传感器经验。', url: 'https://www.neoteai.com/join.html' },
];

export const lessons: Record<string, Lesson> = {
  'vla-map': {
    title: 'BC、ACT 与 VLA：不是三个并列名词',
    intro: '最容易混淆的地方是：BC 是「学习方式」，ACT 是用 BC 训练的「具体策略架构」，VLA 是「多模态基础模型范式」。它们不在同一个分类维度上。',
    sections: [
      { heading: '1. BC（Behavior Cloning）回答「怎么学」', body: '把专家演示当成监督学习样本：给定观测 o，预测动作 a。优点是简单稳定；核心问题是训练时只看过专家状态，自己犯错后会进入未见状态，形成分布偏移和误差累积。' },
      { heading: '2. ACT 回答「策略网络怎么设计」', body: 'ACT 仍然可以用 BC 训练，但它不只预测下一步，而是一次预测 K 步 action chunk。CVAE 表示演示中的多样风格，Temporal Ensemble 融合不同时刻对同一动作的预测，降低抖动。' },
      { heading: '3. VLA 回答「如何把视觉、语言和动作做成基础模型」', body: 'VLA 通常以 VLM 获得语义和视觉表示，再用 Action Head 产生机器人控制。Action Head 可以是离散 token 自回归、ACT 式 chunk，也可以是 Diffusion / Flow Matching。因此，「VLA 可不可以用 BC？」答案是可以：大量 VLA 后训练本质上就是在多任务数据上做 BC/SFT。' },
      { heading: '4. 一个统一对比框架', body: '比较任何方法都问五件事：输入是什么？历史多长？动作如何表示？用什么损失训练？执行时如何闭环？这比背论文名更重要。' },
    ],
    points: ['BC 是学习目标，ACT 是策略架构，VLA 是基础模型范式。', 'ACT 可以看成「用 Action Chunk 和 CVAE 改造的 BC policy」。', 'VLA 的 Action Head 可以借用 ACT、Diffusion 或 Flow Matching。'],
    code: '# BC objective\nloss = distance(policy(observation), expert_action)\n\n# ACT: policy outputs K future steps\naction_chunk = act(image, state, style_latent)  # [B, K, A]\n\n# VLA: pretrained multimodal context + action head\ncontext = vlm(images, language, state)\naction_chunk = action_head(context, noisy_action, t)',
    prompt: '请用「分类维度」解释为什么 BC、ACT、VLA 不能简单并列对比。',
    sources: [{ label: 'ACT', url: 'https://github.com/tonyzhaozh/act' }, { label: 'LeRobot Policies', url: 'https://github.com/huggingface/lerobot' }],
  },
  'act-code': {
    title: 'ACT 代码镜头：Chunk、CVAE 与 Temporal Ensemble',
    intro: '单步动作张量是 [B, A]，Action Chunk 是 [B, K, A]。但 ACT 的价值不止多了 K 这一维：它还用 CVAE 处理演示的多模态性，用 Temporal Ensemble 在执行时抑制抖动。',
    sections: [
      { heading: 'Chunk 为什么有用', body: '一次看到短时域轨迹，模型能学到「接近—接触—抓取—抬起」的联合结构，同时降低每一控制步都调用大模型的延迟。' },
      { heading: 'CVAE 在学什么', body: '同一任务可以有多种合理轨迹。潜变量 z 压缩「这次演示用了哪种风格」，避免简单 L1 把多种动作平均成一条不可执行的轨迹。' },
      { heading: 'Temporal Ensemble 不是普通平均', body: '在 t 时刻与 t-1 时刻的 chunk 都对当前动作有预测。新预测通常权重更高，旧预测保留连续性，这是对延迟和噪声的工程折中。' },
    ],
    points: ['K 太小会增加推理频率，K 太大会降低闭环纠错能力。', 'Padding mask 必须屏蔽 episode 末尾的无效动作。', '真机时需同时记录推理时延、控制频率与动作抖动。'],
    code: '# actions: [batch, chunk_size, action_dim]\npred = policy(observation, qpos)\nvalid_loss = l1(pred, target) * ~padding_mask[..., None]\n\n# overlap at the current control step\nweights = exp(-decay * prediction_age)\naction_now = weighted_mean(overlapping_actions, weights)',
    prompt: '如果 chunk_size 从 10 增加到 100，分别从训练难度、推理频率和闭环纠错说明变化。',
    sources: [{ label: 'ACT Official', url: 'https://github.com/tonyzhaozh/act' }],
  },
  'world-policy': {
    title: 'World Model 与 Policy 为什么正在合流',
    intro: '纯 VLA 倾向学「看到当前状态后做什么」；世界模型更关心「如果做某个动作，未来会发生什么」。合流的目标是让机器人同时具备快速反应和未来预演。',
    sections: [
      { heading: 'LingBot-World：先把环境做成可交互模拟器', body: '从视频生成出发，增加相机位姿或动作控制，并通过因果生成与蒸馏追求长时间一致和实时交互。' },
      { heading: 'LingBot-VA：未来帧是中间推理结果', body: '模型先预测目标未来视觉状态，再用逆动力学或联合 action decoder 输出造成该变化的动作。这使「想象」变得可视化，也为利用无动作标注的视频数据提供了入口。' },
      { heading: 'Cosmos 3：把 Reasoning、Generation 和 Action 放入统一模型', body: 'Mixture-of-Transformers 联合文本、图像、视频、声音和动作。Super 定位高质量理解/生成，Nano Policy 定位快速策略，这与 JD 里的快/慢双系统思路高度呼应。' },
      { heading: '对你的意义', body: '你的 RAW、HDR、EVS、深度与多模态背景，不只能给 VLA 增加感知输入，还能帮助世界模型建立更稳定的物理状态表示和失败预测信号。' },
    ],
    points: ['VLA 学 action conditional distribution，World Model 学 future-state dynamics。', 'World Action Model 试图在同一表示里联合预测世界和动作。', '真正落地时需要快 policy、慢 reasoning、记忆和安全监控四者协作。'],
    code: '# fast loop: reactive control\naction = fast_policy(observation, short_memory)\n\n# slow loop: imagine, evaluate, re-plan\nfutures = world_model.rollout(observation, candidate_actions)\nplan = reasoner.select(futures, goal, long_memory)\nshort_memory.update(plan)',
    prompt: '如果慢思考模型需要 2 秒，你会如何设计快控制回路，避免机器人停住或执行过期计划？',
    sources: [{ label: 'LingBot-World Infinity', url: 'https://github.com/Robbyant/lingbot-world-v2' }, { label: 'LingBot-VA', url: 'https://github.com/Robbyant/lingbot-va' }, { label: 'Cosmos 3', url: 'https://docs.nvidia.com/cosmos/latest/cosmos3/index.html' }],
  },
};

export const dailyEvidence = [
  { title: '7.png 重点 JD', detail: '快/慢双系统、记忆系统、VLA/World Model 微调部署、Demo 闭环与快速原型。', type: '本地材料' },
  { title: '杭州 Post-training 岗位', detail: 'SFT 数据 Pipeline、多任务配比、PPO/GRPO/DPO 开始与真机闭环并列出现。', type: '公开 JD' },
  { title: '近期面经趋势', detail: '真机排障、时序对齐、Flow Matching 和工程可复现性继续高频。', type: '去重汇总' },
];

export function answerQuestion(question: string) {
  const q = question.toLowerCase();
  if (q.includes('bc') || q.includes('act') || q.includes('vla')) return '先分清分类维度：BC 是学习方式，直接用专家演示监督策略；ACT 是一种具体 policy 架构，通过 Action Chunk、CVAE 和 Temporal Ensemble 处理短时域轨迹与抖动；VLA 是以视觉—语言预训练表示为基础、再连接 Action Head 的模型范式。ACT 可以用 BC 训练，VLA 的后训练也经常是 BC/SFT，而 VLA 的 Action Head 又可以采用 ACT、Diffusion 或 Flow Matching。因此最好用「输入、动作表示、损失、执行闭环」四个维度来对比，不要只背名称。';
  if (q.includes('world') || q.includes('世界模型') || q.includes('lingbot') || q.includes('cosmos')) return '世界模型学习环境如何随动作演化，VLA/policy 学习当前该做什么。LingBot-VA 的关键是把未来视觉状态当作中间推理结果，再推导动作；Cosmos 3 则用统一模型联合 Reasoning、Generation 与 Action。工程上不应让慢速世界预演阻塞高频控制，而应设计快速反应 policy、异步慢规划、长/短时记忆和安全中止机制。';
  if (q.includes('数据') || q.includes('对齐') || q.includes('延迟')) return '数据问题建议拆成四层：采集时钟是否同源；图像、关节、动作命令是否有硬件/软件时间戳；训练窗口如何抽样并处理丢帧；真机时观测到动作的端到端延迟是多少。实验上应人为扫描时序偏移量，观察成功率曲线，而不是只相信时间戳。';
  return '这个问题建议先按「定义→机制→代码落点→实验验证」四层展开。目前工作台的本地知识库还没有足够信息可靠回答这一题。你可以点击「在 ChatGPT 中继续」，带着当前学习背景进一步追问；问答仍可回到工作台收藏和导出。';
}
