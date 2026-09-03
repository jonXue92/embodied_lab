export type Task = { id: string; type: string; title: string; time: string; color: string };
export type ModelItem = { id: string; name: string; team: string; family: string; scale: string; action: string; data: string; highlight: string; code: string; url: string };
export type InterviewItem = { id: string; cat: string; q: string; freq: number; source: string; level: string };
export type JobItem = { id: string; company: string; role: string; city: string; fit: number; date: string; skills: string[]; reason: string; url?: string; localSource?: boolean };
export type LessonSection = {
  heading: string; body: string; example?: string;
  formulas?: { latex: string; explanation: string }[];
  sourceIds?: string[];
};
export type LessonQuiz = { id: string; question: string; hint: string; reference: string; keywords?: string[] };
export type Lesson = {
  title: string;
  type: string;
  duration: string;
  intro: string;
  outcomes: string[];
  sections: LessonSection[];
  points: string[];
  codeTitle: string;
  code: string;
  quiz: LessonQuiz;
  sources: { id?: string; label: string; url: string; reading?: string }[];
  prerequisites?: string;
  connection?: string;
  exercise?: { prompt: string; steps: string[]; solution: string };
  codeNotes?: string[];
  reviewedAt?: string;
  revision?: string;
};

export const tasks: Task[] = [
  { id: 'vla-map', type: '基础知识', title: 'BC、ACT 与 VLA：三个概念到底如何嵌套', time: '45 分钟', color: 'mint' },
  { id: 'act-code', type: '代码精读', title: '从张量到控制：读懂 ACT 的完整数据流', time: '50 分钟', color: 'amber' },
  { id: 'world-policy', type: '路线洞察', title: 'World Model、VLA 与真机强化学习如何合流', time: '45 分钟', color: 'blue' },
];

export const phases = [
  { month: '09 月', tag: '基础 + 闭环', title: '建立模型、数据、控制与 RL 共同语言', detail: 'PyTorch 训练循环、Transformer/VLM；BC、ACT、Diffusion Policy；MDP、reward、value、Q function、offline/online RL；LeRobot 时序对齐与安全边界。', output: '输出：ACT 张量图 + RL 状态机 + SO-101 数据质检表' },
  { month: '10 月', tag: 'VLA + World', title: '用统一框架读懂基座策略', detail: 'SmolVLA、π0.5、Spirit v1.5、LingBot-VLA、GR00T；LingBot-World / VA、Cosmos 3；输入表示、Action Head、未来预测、训练与部署。', output: '输出：VLA / World / Action 模型横评 + 小数据微调' },
  { month: '11 月', tag: '真机 RL', title: '从「会做」到「越做越好」', detail: 'HIL-SERL 的人工接管与奖励分类器；RECAP 的 value / advantage conditioning；Evo-RL 的迭代 rollout—value—policy 闭环；安全、样本效率与分布漂移。', output: '输出：SO-101 HIL-SERL 最小方案 + 一轮失败数据回收' },
  { month: '12 月', tag: '作品 + 求职', title: '打通「演示—试跑—介入—改进」证据链', detail: '自主 rollout、成功/失败标注、人工介入、价值训练、闭环评测；README、视频、消融、安全说明与模拟面试。', output: '输出：可复现仓库 + 对比实验 + 项目复盘' },
];

export const weekDays = [
  ['周一', 'BC → ACT → VLA 分类框架', '80m'], ['周二', 'PyTorch Dataset / DataLoader / 训练循环', '70m'],
  ['周三', 'Transformer 与多模态 Token', '80m'], ['周四', '从 BC 的分布偏移到 reward / value / RL', '80m'],
  ['周五', 'ACT 代码：Chunk + CVAE + Ensemble', '90m'], ['周六', 'LeRobot + SO-101 标定、安全边界与采集', '100m'],
  ['周日', 'HIL-SERL / RECAP / Evo-RL 路线图', '60m'],
];

export const models: ModelItem[] = [
  { id: 'smolvla', name: 'SmolVLA', team: 'Hugging Face', family: 'VLA', scale: '450M', action: 'Flow Matching', data: 'LeRobot 社区数据', highlight: '最适合 SO-101 实战起步，关键在小模型与异步推理', code: 'SmolVLM2 编码多视角/语言，Action Expert 以 Flow Matching 预测 action chunk。', url: 'https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx' },
  { id: 'pi05', name: 'π0.5', team: 'Physical Intelligence', family: 'VLA', scale: '基础模型', action: 'Flow Matching', data: '10k+ h + Web / 异构数据', highlight: '用异构协同训练与 Knowledge Insulation 追求开放世界泛化', code: 'openpi 对视觉、语言、状态和噪声动作编码，由 Flow Matching head 生成动作。', url: 'https://github.com/Physical-Intelligence/openpi' },
  { id: 'spirit15', name: 'Spirit v1.5', team: '千寻智能', family: 'VLA', scale: 'Qwen3-VL + DiT', action: 'DiT Action Head', data: '非完美真机数据', highlight: '将「真实数据不完美」作为泛化资产，已开放微调代码', code: 'Qwen3-VL backbone、DiT head 与 policy API 构成清晰的精读路径。', url: 'https://github.com/Spirit-AI-Team/spirit-v1.5' },
  { id: 'lingbot-vla', name: 'LingBot-VLA', team: '蚂蚁灵波', family: 'VLA', scale: '4B / 6B', action: '连续动作专家', data: '20,000h / 9 种双臂', highlight: '工程实用主义：训练吞吐、深度蒸馏与跨本体', code: '对比 depth-free 与 depth-distilled checkpoint，直接验证深度模态的价值。', url: 'https://github.com/Robbyant/lingbot-vla' },
  { id: 'lingbot-world', name: 'LingBot-World Infinity', team: '蚂蚁灵波', family: 'World Model', scale: '1.3B / 14B', action: '可控世界生成', data: '视频 + 控制信号', highlight: '无界交互、720p60 与 Agentic Harness 展示长时域世界建模', code: '因果预训练 + 实时蒸馏，让慢规划能在内部预演。', url: 'https://github.com/Robbyant/lingbot-world-v2' },
  { id: 'lingbot-va', name: 'LingBot-VA', team: '蚂蚁灵波', family: 'World + Action', scale: '5.3B', action: '未来帧 + 逆动力学', data: '视频 + 机器人动作', highlight: '先预测「应该发生什么」，再反推「要做什么」', code: '自回归扩散世界模型联合未来帧预测与 policy execution。', url: 'https://github.com/Robbyant/lingbot-va' },
  { id: 'cosmos3', name: 'Cosmos 3', team: 'NVIDIA', family: 'World + Action', scale: 'Super / Nano', action: '推理 + 生成 + Action', data: '文本/图像/视频/音频/动作', highlight: '以 Mixture-of-Transformers 统一理解、世界生成与动作建模', code: 'Reasoner 负责物理理解，Generator 生成未来，Nano Policy 面向快速动作。', url: 'https://docs.nvidia.com/cosmos/latest/cosmos3/index.html' },
  { id: 'hil-serl', name: 'HIL-SERL', team: 'UC Berkeley', family: 'Real-world RL', scale: '系统方案', action: 'SAC + 人工接管', data: '演示 + 自主 rollout + 介入', highlight: '用少量演示、奖励分类器和人工接管实现样本高效真机 RL', code: 'Actor 高频执行，learner 离线更新；接管数据同时提供安全保护和恢复经验。', url: 'https://hil-serl.github.io/' },
  { id: 'recap', name: 'π*0.6 / RECAP', team: 'Physical Intelligence', family: 'RL + VLA', scale: '通用 VLA', action: 'Advantage-conditioned Policy', data: '演示 + 介入 + 自主经验', highlight: '让基座 VLA 从部署经验中持续提高成功率与吞吐', code: '训练 value function，估计 action advantage，再用二值 improvement indicator 条件化 policy。', url: 'https://www.pi.website/blog/pistar06' },
  { id: 'evo-rl', name: 'Evo-RL', team: 'MINT-SJTU', family: 'Real-world RL', scale: 'LeRobot 工程栈', action: 'Value + Advantage Conditioning', data: 'RW-RL / SO-101 rollout', highlight: '面向 SO-101 的可复现迭代闭环，把失败 rollout 变成下一轮训练数据', code: '部署 policy、合并 rollout、训练 value、标注 advantage、再训 policy，循环迭代。', url: 'https://github.com/MINT-SJTU/Evo-RL' },
];

export const interviewItems: InterviewItem[] = [
  { id: 'q1', cat: 'VLA 架构', q: 'π0 系列为什么使用 Flow Matching 生成连续动作？', freq: 8, source: '2026.07 面经汇总', level: '高频' },
  { id: 'q2', cat: '数据', q: '遥操数据中，图像与关节状态如何对齐？时延如何测量？', freq: 7, source: '杭州具身公司', level: '高频' },
  { id: 'q3', cat: '后训练', q: 'VLA 的 SFT 数据配比应如何设计？如何避免新任务灾难性遗忘？', freq: 6, source: '上海 Post-training', level: '必会' },
  { id: 'q4', cat: '工程', q: '真机成功率突然下降，你会如何分层排查？', freq: 9, source: '2026.06—08 多篇面经', level: '最高频' },
  { id: 'q5', cat: '多模态感知', q: '深度、触觉或 RAW 模态如何接入现有 VLA？', freq: 4, source: '上海多模态算法', level: '高匹配' },
  { id: 'q6', cat: '世界模型', q: '快思考控制与慢思考规划如何共享记忆并避免控制延迟？', freq: 5, source: '7.png JD', level: '主线' },
  { id: 'q7', cat: '强化学习', q: '真机 RL 中如何设计 reward、人工介入和安全边界？', freq: 5, source: '岗位 + 本轮学习优先级', level: '新增主线' },
];

export const jobs: JobItem[] = [
  { id: 'job-reference', company: '4 月重点企业', role: '具身基座模型 / 双系统研发', city: '杭州 / 上海参考', fit: 90, date: '来自 7.png', skills: ['快/慢双系统', '记忆系统', 'VLA / World Model', '快速原型'], reason: '与你的模型、数据和落地目标最接近；强化学习负责让已部署 policy 在真实经验中继续改进。', localSource: true },
  { id: 'job-arcsoft', company: '虹软科技', role: '27 届具身大脑 / VLA 算法工程师', city: '杭州', fit: 88, date: '08-21 更新', skills: ['VLM / VLA', 'World Model', 'Diffusion Policy', 'PPO / SAC'], reason: '要求覆盖模型、训练与机器人实战，可用 SO-101 项目补齐。', url: 'https://www.nowcoder.com/jobs/detail/454521?urlSource=sitemap' },
  { id: 'job-uniview', company: '宇泛智能', role: '具身智能算法（VLN / VLA）', city: '杭州', fit: 84, date: '06 月发布', skills: ['3D 感知', '强化学习', '扩散模型', '真机部署'], reason: '你的视觉、LiDAR 和数据处理背景是差异化优势。', url: 'https://www.liepin.com/job/1978011737.shtml' },
  { id: 'job-post', company: '杭州具身团队', role: 'Post-training 算法实习生', city: '杭州 · 西湖', fit: 91, date: '08 月更新', skills: ['SFT Pipeline', '多任务数据配比', 'PPO / GRPO / DPO'], reason: '与 9—12 月 POC 中的后训练和真机经验闭环高度相关。', url: 'https://www.ncss.cn/student/jobs/NYAuURS6bzCbBUPYP7nhvh/detail.html' },
  { id: 'job-neoteai', company: '新智具身', role: '多模态 / 强化学习算法', city: '上海', fit: 86, date: '08 月在招', skills: ['视触觉', 'LLM / VLM / VLA', 'PPO / TD3', '遥操数据工场'], reason: '视触觉与真机 RL 都能利用你的传感器与数据经验。', url: 'https://www.neoteai.com/join.html' },
];

export const lessons: Record<string, Lesson> = {
  'vla-map': {
    title: 'BC、ACT 与 VLA：三个概念到底如何嵌套', type: '基础知识', duration: '45 分钟',
    intro: '这节课不要你背模型名字，而是建立一个稳定的分类框架：BC 说的是学习目标，ACT 说的是 policy 结构，VLA 说的是多模态基础模型范式。它们可以同时出现在同一个系统中。',
    outcomes: ['能用「学习目标—策略架构—基础模型」三层说清三者关系', '能画出从观测到 action chunk 的张量数据流', '能说清 BC 的分布偏移为什么需要 DAgger 或 RL'],
    sections: [
      { heading: '01 先用一个机器人任务统一语境', body: '假设机器人要根据「把红色积木放进篮子」完成抓取。输入可以包含相机图像、语言指令、关节位置和历史动作；输出是未来 K 步的关节或末端控制量。下面三个概念都在处理这个映射，但它们回答的问题不同。', example: 'observation = {images, language, robot_state, history}; target = action[0:K]' },
      { heading: '02 BC 回答「怎么学」', body: 'Behavior Cloning 把专家演示当作监督学习数据，最小化 policy 动作与专家动作的距离。它的优点是稳定、并行、易扩展；但训练数据主要来自专家到达的好状态，policy 一旦犯错进入新状态，就可能连续出错。这是 covariate shift，也是真机后训练的起点。' },
      { heading: '03 ACT 回答「policy 怎么组织」', body: 'ACT 仍可用 BC 训练，但一次预测 K 步 action chunk，用 CVAE 表示同一任务的多种合理动作风格，并用 Temporal Ensemble 融合不同时刻对当前动作的预测。因此 ACT 不是 BC 的反面，而是一种更适合长时域精细操作的 BC policy。' },
      { heading: '04 VLA 回答「如何利用大规模多模态预训练」', body: 'VLA 从视觉—语言模型获得语义和视觉表示，再连接 Action Head。Action Head 可以是离散 action token、ACT 式 chunk、Diffusion 或 Flow Matching。大量 VLA 后训练仍然是广义 BC / SFT：用多任务专家数据学会动作。' },
      { heading: '05 为什么还需要 DAgger 与 RL', body: '只看专家数据，policy 不知道自己常在哪里失败。DAgger 让 policy 自己跑、专家在遇到的新状态上补标；RL 则用 reward / value 区分哪些动作更好。HIL-SERL 和 RECAP 把专家介入、自主经验与奖励结合，用于跨过「会做」到「稳定地做」的差距。' },
      { heading: '06 用五个问题读任何 policy', body: '不论论文叫什么，都问：输入包含什么？历史多长？动作如何表示？损失或 reward 是什么？执行时如何闭环纠错？这五问可以同时比较 ACT、SmolVLA、RECAP 或新模型。' },
    ],
    points: ['BC 是学习目标，ACT 是策略架构，VLA 是基础模型范式。', 'ACT 可以用 BC 训练；VLA 的 Action Head 又可以借用 ACT、Diffusion 或 Flow Matching。', 'RL 不是替代 VLA，而是使用真实 rollout 的 reward / value 继续改进 policy。'],
    codeTitle: 'policy_taxonomy.py',
    code: '# BC objective: learn from expert actions\nloss = distance(policy(observation), expert_action)\n\n# ACT architecture: output a short trajectory\naction_chunk = act(images, state, style_latent)  # [B, K, A]\n\n# VLA paradigm: pretrained multimodal context + action head\ncontext = vlm(images, language, state)\naction_chunk = action_head(context, noisy_action, t)\n\n# RL improvement: learn which collected actions are better\nadvantage = reward + gamma * value(next_state) - value(state)\npolicy = improve(policy, rollout_data, advantage)',
    quiz: { id: 'lesson-vla-map', question: '请用「分类维度」解释为什么 BC、ACT、VLA 不能简单并列，并说明 RL 在其中的作用。', hint: '按「学习目标—策略架构—基础模型—真机改进」组织。', reference: 'BC 是用专家演示监督策略的学习目标；ACT 是一种一次预测 action chunk、可用 BC 训练的 policy 架构；VLA 是把视觉、语言和动作统一的基础模型范式，其 Action Head 可以采用 ACT 或 Flow Matching。RL 使用 rollout 的 reward / value 反馈，弥补 BC 的分布偏移，让已部署 policy 继续改进。' },
    sources: [{ label: 'ACT Official', url: 'https://github.com/tonyzhaozh/act' }, { label: 'LeRobot Policies', url: 'https://github.com/huggingface/lerobot' }, { label: 'HIL-SERL', url: 'https://hil-serl.github.io/' }],
  },
  'act-code': {
    title: '从张量到控制：读懂 ACT 的完整数据流', type: '代码精读', duration: '50 分钟',
    intro: '这节课把 ACT 从「三个名词」还原成一条可跟踪的张量数据流：数据集如何切 chunk，CVAE 如何表示演示风格，Transformer 如何预测 K 步动作，Temporal Ensemble 又如何把重叠预测变成当前控制量。',
    outcomes: ['能为 [B,K,A] 张量每一维写出准确含义', '能在代码中找到 padding mask、latent z 和 query embedding', '能设计 chunk size / control frequency / latency 的对比实验'],
    sections: [
      { heading: '01 先看数据集切片', body: '对每个时刻 t，数据集返回当前图像、关节状态 qpos，以及从 t 开始的 K 步动作。如果 episode 即将结束，不足 K 步的位置需要 padding，并由 is_pad mask 从 loss 中排除。', example: 'images [B,C,H,W], qpos [B,Q], actions [B,K,A], is_pad [B,K]' },
      { heading: '02 为什么不只预测下一步', body: '操作任务存在接近、接触、闭合夹爪、抬起等短时域结构。单步 policy 每步都要重新决策，容易抖动；chunk 让模型看见一段轨迹，也减少大模型调用频率。但 K 越大，越难根据新观测及时纠错。' },
      { heading: '03 CVAE 的 posterior 只在训练时看见真实动作', body: '训练时，encoder 使用当前状态与真实 action chunk 推断 latent z，将演示中的速度、路径等风格压缩进 z。同时通过 KL 让 posterior 接近标准正态。推理时没有真实动作，通常使用 z=0 或从 prior 采样。' },
      { heading: '04 Transformer decoder 中的 query 就是 K 个未来位置', body: '视觉特征和 qpos 构成 context，K 个可学习 query 分别对应第 1到 K 个未来动作。Decoder 让每个 query 从 context 中取信息，并输出 A 维控制量。代码阅读时先追 shape，再追具体 attention 实现。' },
      { heading: '05 Temporal Ensemble 处理重叠 chunk', body: '在当前时刻，t-2、t-1 和 t 时刻输出的 chunk 都可能对当前动作有一个预测。对这些预测按年龄做指数加权，新预测更贴近新观测，旧预测提供连续性。它不是一个训练损失，而是执行时策略。' },
      { heading: '06 真机调参不能只看 loss', body: '同时记录成功率、平均完成时间、推理时延、有效控制频率、动作抖动和恢复能力。一个 chunk 配置可能在离线 L1 更好，却因为闭环纠错太慢而在真机上失败。' },
    ],
    points: ['[B,K,A] 是阅读 ACT 代码的主线；padding mask 决定哪些时间步计入 loss。', 'CVAE 处理演示的多模态性，Temporal Ensemble 处理执行时的重叠预测。', 'chunk size 是推理效率、平滑性和闭环纠错的折中。'],
    codeTitle: 'act_dataflow.py',
    code: '# dataset\nactions, is_pad = slice_future_actions(episode, t, chunk_size=K)\n\n# training-only posterior\nmu, logvar = style_encoder(qpos, actions, is_pad)\nz = reparameterize(mu, logvar)\n\n# K learned queries decode K future actions\npred = decoder(query_embed, image_features, qpos, z)  # [B,K,A]\nrecon = (l1(pred, actions) * (~is_pad)[..., None]).mean()\nloss = recon + beta * kl_divergence(mu, logvar)\n\n# execution: merge overlapping predictions for the current step\nweights = exp(-decay * prediction_age)\naction_now = weighted_mean(overlapping_actions, weights)',
    quiz: { id: 'lesson-act-code', question: '如果把 chunk_size 从 10 增加到 100，训练张量、推理频率、轨迹平滑性和闭环纠错会如何变化？', hint: '分别写「可能改善」和「可能恶化」，不要只给单一结论。', reference: 'K 增大后 actions 张量的时间维更长，模型要联合拟合更长轨迹，训练更难、内存与计算成本更高。完整执行 chunk 时可减少推理调用并提高短时轨迹连贯性，但观测变化后的纠错变慢，后段动作更容易过期。滚动重规划与 Temporal Ensemble 可折中，但必须用真机成功率、时延和抖动实验选 K。' },
    sources: [{ label: 'ACT Official', url: 'https://github.com/tonyzhaozh/act' }, { label: 'LeRobot ACT', url: 'https://github.com/huggingface/lerobot' }],
  },
  'world-policy': {
    title: 'World Model、VLA 与真机强化学习如何合流', type: '路线洞察', duration: '45 分钟',
    intro: '纯 policy 倾向学「现在应该做什么」，World Model 学「做了以后会发生什么」，真机 RL 则用真实部署的结果回答「哪种做法更好」。未来的落地系统很可能同时包含快 policy、慢预演、记忆、reward/value 和人工介入。',
    outcomes: ['能画出 fast policy / slow world model / memory / RL learner 的信息流', '能说清 HIL-SERL、RECAP 和 Evo-RL 分别如何使用真机经验', '能为 SO-101 设计一个安全的最小 RL 实验'],
    sections: [
      { heading: '01 先分清三种预测对象', body: 'Policy / VLA 估计 p(action | observation, goal)；World Model 估计 p(next_state or future_video | state, action)；value / reward model 估计当前状态或动作对任务成功有多好。这三者可以共享表示，但监督信号不同。' },
      { heading: '02 World Model 让慢思考能预演', body: 'LingBot-World 从可控视频生成走向交互世界；LingBot-VA 把未来帧当作中间推理结果，再用逆动力学或 action decoder 输出动作；Cosmos 3 将 reasoning、generation 与 action 纳入统一模型。落地时慢模型应异步运行，不阻塞高频控制。' },
      { heading: '03 HIL-SERL：人工介入同时解决安全与探索', body: '先遥操采集成功/失败样本训练二元 reward classifier，再用少量演示初始化 replay buffer。在线训练时 policy 自主执行，人在危险或已明显走向失败时接管。介入动作不只阻止损坏，还提供「从失败边缘如何恢复」的高价值数据。' },
      { heading: '04 RECAP：让 VLA 学会根据 advantage 选更好动作', body: 'RECAP 联合演示、自主执行与专家介入。它训练 value function 估计距离成功的进展，为数据中的动作估计 advantage，再将 advantage 二值化成 improvement indicator 条件化 policy。这使大 VLA 可以使用异构离线数据，避免直接在真机上做不稳定的端到端在线更新。' },
      { heading: '05 Evo-RL：把迭代闭环变成 SO-101 可执行工程', body: '基于 LeRobot 采集多任务演示，做 offline RL 预训练和任务微调；部署当前 policy 采集 rollout，将新数据合并进数据池；训练 value，推断 advantage 标签，再训下一版 policy。它的价值在于把研究 recipe 变成可复现 CLI 和数据格式。' },
      { heading: '06 真机 RL 的第一原则是安全和可诊断', body: '在训练前限定末端工作空间、速度、加速度、夹爪力和 episode 时长；设置人工接管与硬件急停；分开 actor 执行和 learner 更新；完整保留观测、policy action、executed action、介入信号、reward 和成功/失败。没有这些，改进不可审计。' },
      { heading: '07 你的最小可行路线', body: '先用 BC / ACT 完成可重复基线；再记录 100 次 rollout 的成功、失败与人工介入；先训练可解释的 reward / value 基线，再做一轮 advantage-conditioned 微调；比较成功率、吞吐、介入率和新物体泛化。这条路径同时能讲模型、数据、安全和工程。' },
    ],
    points: ['VLA 学动作分布，World Model 学未来状态，value / reward 评估行为好坏。', 'HIL-SERL 重在实时人工介入；RECAP 重在大 VLA 的 value / advantage conditioning；Evo-RL 重在 SO-101 可复现迭代工程。', '快 policy、慢 world model、长/短时记忆、RL learner 和安全监控需要异步协作。'],
    codeTitle: 'real_world_rl_loop.py',
    code: '# fast actor: never block control on slow learning\naction_proposed = fast_policy(observation, short_memory)\naction_executed, intervened = safety_and_human_gate(action_proposed)\ntransition = env.step(action_executed)\nreplay.add(transition, action_proposed, intervened)\n\n# slow reasoning: periodically refresh plan / memory\nfutures = world_model.rollout(observation, candidate_actions)\nshort_memory.update(reasoner.select(futures, goal, long_memory))\n\n# learner: improve from deployment experience\nvalue = train_value(replay)\nadvantage = estimate_advantage(replay, value)\npolicy_next = train_advantage_conditioned_policy(replay, advantage)\ndeploy_after_safety_eval(policy_next)',
    quiz: { id: 'lesson-world-policy', question: '设慢思考 World Model 需要 2 秒，而机器人控制周期是 50 ms。请设计一个包含快 policy、慢规划、记忆、人工介入和 RL learner 的安全闭环。', hint: '说清哪些在高频回路，哪些异步运行，以及过期计划如何废弃。', reference: '高频回路由 fast policy 在 50 ms 内根据新观测和短时记忆输出动作，每步经过安全约束和人工接管。World Model 在异步慢回路预演并产生带版本/时间戳的计划；快回路只接受与当前观测一致的新计划，过期则废弃或进入保守策略。所有 proposed/executed action、介入、reward 和结果进入 replay，learner 在非控制线程训练 value 和新 policy，通过离线安全评测后再部署。' },
    sources: [{ label: 'HIL-SERL', url: 'https://hil-serl.github.io/' }, { label: 'LeRobot HIL-SERL', url: 'https://github.com/huggingface/lerobot/blob/main/docs/source/hilserl.mdx' }, { label: 'π*0.6 / RECAP', url: 'https://www.pi.website/blog/pistar06' }, { label: 'Evo-RL', url: 'https://github.com/MINT-SJTU/Evo-RL' }, { label: 'Cosmos 3', url: 'https://docs.nvidia.com/cosmos/latest/cosmos3/index.html' }],
  },
};

export const dailyQuestion = {
  id: 'action_chunk',
  title: '为什么 VLA 通常输出一段 Action Chunk，而不是只预测下一个动作？',
  summary: '用「时序相关—推理频率—误差累积—闭环纠错」四层回答。',
};

export const dailyEvidence = [
  { title: '7.png 重点 JD', detail: '快/慢双系统、记忆系统、VLA/World Model 微调部署、Demo 闭环与快速原型。', type: '本地材料' },
  { title: '杭州 / 上海岗位信号', detail: 'SFT 数据 Pipeline、PPO/SAC、真机排障和部署经验开始出现在同一能力链中。', type: '公开 JD' },
  { title: '真机 RL 官方路线', detail: 'HIL-SERL、RECAP 和 Evo-RL 都把演示、自主 rollout、人工介入与 value/reward 闭环连接起来。', type: '本轮课程强化' },
];

export function answerQuestion(question: string) {
  const q = question.toLowerCase();
  if (q.includes('hil') || q.includes('recap') || q.includes('evo') || q.includes('强化学习') || q.includes('reward')) return '真机强化学习的核心不是让机器人无限随机探索，而是把演示、安全约束、人工介入、自主 rollout 和 reward/value 结合。HIL-SERL 重点是在线接管与奖励分类器；RECAP 用 value 估计 advantage，再以 improvement indicator 条件化大 VLA；Evo-RL 把 rollout—value—advantage—policy 迭代做成 LeRobot/SO-101 可复现工程闭环。';
  if (q.includes('bc') || q.includes('act') || q.includes('vla')) return '先分清分类维度：BC 是学习方式，ACT 是 policy 架构，VLA 是视觉—语言—动作基础模型范式。ACT 可用 BC 训练，VLA 的 Action Head 又可以采用 ACT、Diffusion 或 Flow Matching。RL 则利用部署后的 reward / value 反馈继续改进 policy。';
  if (q.includes('world') || q.includes('世界模型') || q.includes('lingbot') || q.includes('cosmos')) return '世界模型学习环境如何随动作演化，VLA/policy 学习当前该做什么。工程上不应让慢速世界预演阻塞高频控制，而应设计快速反应 policy、异步慢规划、长/短时记忆、安全中止和 RL learner。';
  if (q.includes('数据') || q.includes('对齐') || q.includes('延迟')) return '数据问题建议拆成四层：采集时钟是否同源；图像、关节、policy action 和 executed action 是否有时间戳；训练窗口如何处理丢帧；真机观测到动作的端到端延迟是多少。对 RL 还要额外记录介入和 reward 的对齐。';
  return '这个问题建议按「定义→机制→代码落点→实验验证」四层展开。当前本地知识库信息不足时，可点击「在 ChatGPT 中继续」带着学习背景深挖。';
}
