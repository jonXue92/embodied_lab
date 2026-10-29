import type { AuthoredDay } from './types';

const dreamerAgent = 'https://github.com/danijar/dreamerv3/blob/main/dreamerv3/agent.py';
const jepaCommit = '13cf1d9c7e476f53c17714d2e0f1dc239a883ce0';
const jepaRoot = 'https://github.com/facebookresearch/jepa-wms/blob/' + jepaCommit;

const sources = [
  { id: 'dreamerPaper62', label: 'Hafner 等 · DreamerV3 论文 v2', url: 'https://arxiv.org/html/2301.04104v2', reading: '2026-10-30 实读算法、experience replay 与网络附录：RSSM 从真实序列学习表征/动力学/奖励/continue，actor-critic 在 latent imagination 上学习；论文的跨域固定配置结果不是 SO-101 实测。' },
  { id: 'dreamerAgent62', label: 'Danijar Hafner · DreamerV3 agent.py', url: dreamerAgent, reading: '2026-10-30 精读 Agent.loss、dyn.starts、dyn.imagine、imag_loss 与 lambda_return：真实 replay 的世界模型损失和 imagined trajectory 的 policy/value 损失在同一训练入口汇合；main 会变化，复现需另存提交号。' },
  { id: 'dreamerRssm62', label: 'Danijar Hafner · DreamerV3 rssm.py', url: 'https://github.com/danijar/dreamerv3/blob/main/dreamerv3/rssm.py', reading: '2026-10-30 定位 RSSM.observe、imagine、starts 与 loss，核对 posterior 观测更新和 prior 想象更新的输入差异；公开仓库是作者维护的 JAX 实现，不等于 Google DeepMind 内部训练基础设施。' },
  { id: 'jepaPaper62', label: 'Meta/FAIR · JEPA-WM 论文 v4', url: 'https://arxiv.org/html/2512.24497v4', reading: '2026-10-30 复读 action-conditioned rollout、planning objective、CEM/Nevergrad 与多步预测实验；JEPA-WM 的目标图规划和 Dreamer 的奖励想象 actor 是两种不同控制接口。' },
  { id: 'jepaAgent62', label: 'Meta/FAIR · JEPA-WM goal-conditioned agent（固定提交）', url: jepaRoot + '/evals/simu_env_planning/planning/gc_agent.py', reading: '精读 GC_Agent.set_goal、plan、act 与 unroll：goal 先编码为 target，planner 优化动作序列，agent 只执行计划前缀并在后续观测上重新规划。' },
  { id: 'jepaPlanner62', label: 'Meta/FAIR · JEPA-WM planner（固定提交）', url: jepaRoot + '/evals/simu_env_planning/planning/planning/planner.py', reading: '定位 Planner.cost_function、CEMPlanner.plan 与 NeverGradPlanner.plan：候选动作经 unroll 后由 objective 评分；搜索器、world model 与执行器是三个可替换模块。' },
  { id: 'behaviorEval62', label: 'StanfordVL · BEHAVIOR 2026 Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '核对 BDDL 终态、Q-score、公开/隐藏实例、单实例单次 rollout 与时间预算；用于约束闭环证据，不把 StanfordVL 的评测归给 World Labs。' },
  { id: 'r2s2r62', label: 'World Labs · Real-to-Sim-to-Real', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '核对对齐仿真、可控场景变化、真实成功边界与 policy 排名；World Labs 路线提供空间/仿真上下文，不是 Dreamer 或 JEPA-WM 的 actor 源码。' },
  { id: 'ami62', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '核对 AMI 当前公开方向为表征空间预测、动作条件世界模型、规划和安全；本课的 V-JEPA/JEPA-WM 论文代码仍归 Meta/FAIR 历史成果。' },
];

export const day62: AuthoredDay = {
  reviewedAt: '2026-10-30',
  revision: '逐课编写 1.0',
  deliverable: '一张真实观测快环、Dreamer 想象价值环与 JEPA 目标规划慢环的时序图；一个带 observation/policy/model 版本、deadline 和过期拒绝正负测试的原创 PyTorch 计划缓存；一份 SO-101 只离线设计、不执行电机命令的快慢系统预算表。三课共 100 分钟，另留 20 分钟复盘。',
  question: {
    title: '慢世界模型两秒才给出计划，怎样避免它拖垮 20 Hz 控制？',
    summary: '把计划计算与动作执行解耦，并用版本、年龄和安全门拒绝过期结果。',
    keywords: ['fast loop', 'slow planner', 'deadline', 'plan cache', 'version', 'staleness'],
    reference: '20 Hz 快环每 50 ms 读取最新观测、执行已验收计划的一个动作或保守 policy；慢环在独立 worker 上用带 observation_id、policy_version、model_version 的快照规划。结果返回时先检查版本一致、计划年龄、剩余 horizon、状态偏差和动作限幅，失败就丢弃而不是阻塞。快环可继续沿缓存前缀运行，但缓存必须有最大年龄与最低剩余步数；接触、近失或分布外指标触发时回退到停机/保守动作，不能等待慢模型“追上”。',
  },
  lessons: {
    foundation: {
      title: 'Dreamer、JEPA 与快慢规划：三种闭环时钟', minutes: 35,
      prerequisites: '理解 10 月 30 日的 action-conditioned latent rollout、10 月 31 日的 aligned simulation，并能区分 policy、world model、planner 与执行器。',
      connection: '前两天分别建立了 JEPA 目标规划和 World Labs/OmniGibson 空间仿真合同；今天把它们放进真实控制时间线，并加入 Dreamer 的 imagined actor-critic 作为第三种用法。明天用统一反例与统计协议验收两条世界模型路线。',
      intro: '“世界模型很慢”不是一句性能抱怨，而是接口设计问题。快环必须在硬 deadline 内给出可执行动作；慢环可以更新价值、搜索计划或生成仿真资产，但它的输出只有在版本、年龄和状态仍匹配时才可进入控制。Dreamer 与 JEPA 都在 latent 中预测，却把预测转成动作的方式不同。',
      outcomes: ['区分 Dreamer 想象 actor 与 JEPA 候选动作优化', '推导计划年龄、执行前缀和重规划周期的时间合同', '设计不让慢环阻塞 SO-101 快环的缓存与回退门'],
      sections: [
        { heading: '01 三个时钟对应三种责任', body: `机器人快环以控制周期Δt_c读取观测并提交一个动作，安全 watchdog 的期限通常比任何大模型推理更硬。策略推理可按较低频率产生 action chunk，执行器在两次推理之间消费前缀；世界模型规划再慢一层，可能用数百个候选和多步 rollout 搜索。把三者写在同一个同步函数里，会让最慢组件决定全部时延。

正确接口把动作提交、策略更新、计划搜索拆开。快环只读不可变快照；策略 worker 产出带 policy_version 的 chunk；规划 worker 产出带 observation_id、model_version、created_at 和 horizon 的计划。任何输出都不是“算完就自动生效”，而要经过年龄、版本、状态偏差、动作单位和安全限幅检查。`, formulas: [{ latex: String.raw`f_c=1/\Delta t_c,\qquad T_{plan}=N_{iter}N_{cand}H\,t_{step},\qquad T_{plan}\gg\Delta t_c`, explanation: 'f_c 是控制频率；规划成本由迭代数、候选数、horizon 与单步模型时间近似相乘，说明慢规划不应同步占用快环。' }], sourceIds: ['jepaPlanner62', 'dreamerPaper62'] },
        { heading: '02 Dreamer 在想象轨迹上学 actor，不在每一步做候选搜索', body: `DreamerV3 用真实 replay 训练 encoder、RSSM dynamics、decoder、reward 与 continue；随后从 replay 表征状态出发，让当前 policy 在 RSSM prior 中想象 H 步。imag_loss 用预测 reward、continue、slow value 构造 λ-return，更新 policy 与 value。部署时 actor 可直接由当前 latent 采样动作，因此主要搜索成本被搬到训练期。

这种“摊销决策”速度快，但它优化的是 learned reward/value，错误也会被 actor 固化。JEPA-WM 的 goal-conditioned agent 则在运行时枚举/优化动作序列，以目标表征距离评分，不必先训练一张通用 actor。前者适合重复任务和大量训练迭代，后者适合目标变化但搜索预算允许的情形；不能因二者都调用 world model 就互换结论。`, formulas: [{ latex: String.raw`V_t^{\lambda}=r_t+\gamma c_t\big((1-\lambda)v_{t+1}+\lambda V_{t+1}^{\lambda}\big)`, explanation: 'Dreamer 的 imagined λ-return 混合一步 bootstrap 与更长回报；c_t 是继续概率，不能把终止后的价值继续累加。' }], sourceIds: ['dreamerPaper62', 'dreamerAgent62', 'dreamerRssm62', 'jepaPaper62'] },
        { heading: '03 JEPA 慢环显式搜索目标，MPC 用新观测覆盖旧想象', body: `JEPA-WM 的 GC_Agent 把 goal 编码为 target，Planner.cost_function 调 world model unroll，再由 representation objective 给每条动作候选打分。CEM 或 Nevergrad 更新候选分布；agent 只执行计划的一个前缀，随后重新观察。这种接口能在目标变化时直接重算，却容易被 optimizer 推到训练分布外动作，且每次搜索都消耗预算。

异步化后必须定义计划可接受年龄。若规划从观测 t0 开始、返回于 t1，期间机器人已经执行 k 个快环动作，旧计划的第一步往往已无意义。可以丢弃前 k 步再检查剩余 horizon，也可以直接重规划；无论哪种做法，都必须用当前状态与计划预测状态的偏差做门，而不是仅看墙钟。`, formulas: [{ latex: String.raw`A^*=\arg\min_A d\!\left(\hat z_{t+H}(A),z_g\right),\quad k=\left\lceil\frac{t_1-t_0}{\Delta t_c}\right\rceil,\quad H_{left}=H-k`, explanation: '搜索得到目标距离最小的动作序列；返回时已消耗 k 个控制周期，若剩余 horizon 非正或状态不匹配就必须拒绝。' }], sourceIds: ['jepaAgent62', 'jepaPlanner62', 'jepaPaper62'] },
        { heading: '04 快慢系统的最终门是闭环风险，不是平均吞吐', body: `计划 worker 每秒完成多少次不是最终指标。长尾时延、观测版本错配、接触事件和模型不确定性会让平均值很好看但偶发执行旧动作。最低验收要同时记录 p50/p95/p99 规划时延、丢弃率、计划年龄、状态创新量、动作裁剪率、近失和真实任务成功；只报告吞吐会隐藏最危险的尾部。

双团队主线在此保持边界：World Labs 的 R2S2R提供空间对齐仿真与变化轴，StanfordVL 的 BEHAVIOR 提供任务谓词和可审计闭环，Meta/FAIR 的 JEPA 代码提供 latent planner 历史证据，AMI 只代表当前方向。SO-101 本日只做离线时序夹具与预算设计，不连接端口、不执行电机，也不上传客户数据。`, formulas: [{ latex: String.raw`G=\mathbf1[q_{0.99}(T_{act})<D_c]\,\mathbf1[\operatorname{age}(P)<A_{max}]\,\mathbf1[\lVert s_t-\hat s_t^P\rVert<\epsilon_s]`, explanation: '上线门同时约束动作长尾时延、计划年龄和当前状态偏差；任一项失败都应回退，而不是用平均时延抵消。' }], sourceIds: ['r2s2r62', 'behaviorEval62', 'ami62'] },
      ],
      points: ['Dreamer 将动作选择摊销进 actor，JEPA planner 在运行时显式搜索。', '慢环输出必须携带观测、模型和策略版本以及创建时间。', '计划年龄与状态偏差共同决定可否执行，吞吐不能代替安全门。'],
      codeTitle: 'timeline_budget.py · 计划年龄与剩余 horizon 算例',
      code: [
        'import math',
        '',
        'def remaining_horizon(created_ms, now_ms, control_ms, horizon):',
        '    if control_ms <= 0 or horizon <= 0: raise ValueError("positive budget required")',
        '    elapsed=max(0,now_ms-created_ms)',
        '    consumed=math.ceil(elapsed/control_ms)',
        '    return horizon-consumed',
        '',
        'assert remaining_horizon(0,80,50,4)==2',
        'assert remaining_horizon(100,90,50,4)==4',
        'try:',
        '    remaining_horizon(0,10,0,4)',
        '    raise AssertionError("zero control period accepted")',
        'except ValueError: pass',
      ].join('\n'),
      codeNotes: ['ceil 表示跨过一个控制边界就视为相应前缀已过期，比向下取整更保守。', '函数只计算时间预算；正式系统还必须检查状态偏差、版本和动作合同。', '测试是纯离线数值，不访问真实控制器。'],
      exercise: { prompt: '控制周期 50 ms，planner 用 135 ms 产出 H=5 的计划；返回时还剩几步？若最少需要 3 步才允许消费，是否接收？', steps: ['用向上取整求经过的控制周期。', '从 horizon 扣除已过期前缀。', '与最低剩余步数比较。'], solution: '经过 ceil(135/50)=3 个周期，剩余 5-3=2 步，低于最低 3 步，因此拒绝。不能把 135 ms 除以 50 ms 后向下取 2，否则会把已经跨入第三个控制周期的旧动作误认为仍有效。' },
      quiz: { question: '为什么 Dreamer 与 JEPA-WM 都在 latent 中 rollout，却不应被称为同一种在线 planner？', hint: '比较动作由 actor 给出还是由运行时 optimizer 搜索。', keywords: ['Dreamer', 'actor', 'JEPA-WM', 'optimizer', 'amortized policy'], reference: 'Dreamer 通过 imagined reward/value 在训练期更新 actor，部署时 actor 直接给动作；JEPA-WM goal agent 在运行时对候选动作序列做 CEM/Nevergrad 等优化。二者共享动作条件预测思想，但控制接口、计算发生时刻、目标函数和失效模式不同。' },
      sources,
    },
    code: {
      title: '源码精读：Dreamer imagination 到 JEPA plan cache', minutes: 40,
      prerequisites: '会读 [B,T,D]、stop-gradient、λ-return、候选动作 [K,H,A]，理解线程安全不等于结果仍新鲜。',
      connection: '基础课给出三种时钟和角色边界；本课先沿真实函数定位训练/规划链，再实现一个不依赖机械臂的计划验收层。洞察课将据此选择个人项目应先做 actor 还是慢 planner。',
      intro: '源码精读不把 JAX 逐行改写成 PyTorch。目标是确认真实控制流：Dreamer 从 replay 表征抽 imagination 起点并把 imagined return 交给 policy/value；JEPA 从 goal target 和当前观测启动搜索。原创代码只实现两者都需要的异步交付合同。',
      outcomes: ['定位 Dreamer Agent.loss 中真实学习与想象学习的分叉', '追踪 JEPA GC_Agent 到 Planner.cost_function 的调用链', '实现 observation/model/policy 版本与 deadline 的计划缓存正负测试'],
      sections: [
        { heading: '01 Agent.loss 先学真实序列，再从同一表征抽想象起点', body: `公开 agent.py 的 loss 先调用 enc，再调用 dyn.loss 处理 tokens、prevact 与 reset，随后 decoder、reward head 和 continue head都以 replay 表征计算监督损失。代码断言每个分项 loss 都是 [B,T]，避免某一项在错误轴上广播后仍被相加。这里是“模型从真实经验学什么”的路径。

紧接着，dyn.starts 从 replay dynamics entries 取最近 K 个起点，policyfn 根据 latent feature 采样动作，dyn.imagine 展开 H 步。真实第一帧与 imagined feature 经 stop-gradient 组合后进入 imag_loss。源码顺序说明 imagination 不是额外采集的数据，也不是 decoder 生成视频后再训练 policy，而是 latent prior 上的策略轨迹。`, sourceIds: ['dreamerAgent62', 'dreamerRssm62'] },
        { heading: '02 imag_loss 把 continue、slow value 与 λ-return 接成 actor-critic', body: `imag_loss 用 continue 概率形成累计权重，lambda_return 反向递推 imagined reward 与 target value；policy loss 是 log-prob 乘归一化 advantage 再加 entropy，value loss拟合归一化 return并正则到 slow value。每个 stop-gradient 位置都表达责任边界：policy 不应借由目标 return 篡改 world model，value target 也不是可学习捷径。

复现时最常见的轴错误是 reward、value 与 action 的 H/H+1 对齐。公开代码显式让 imgfeat 和 imgact 长度为 H+1，再对 policy/value 损失裁掉最后一步，并在 lambda_return 中按 terminal/last 区分 bootstrap。原创测试应断言 shape、终止传播和最后一个 bootstrap，而不只比较一个标量 loss。`, formulas: [{ latex: String.raw`w_t=\prod_{i<t}\gamma c_i,\qquad \mathcal L_{\pi}=-\sum_t w_t\log\pi(a_t\mid z_t)\,\operatorname{sg}(A_t)`, explanation: '累计 continue 抑制终止后的虚假回报；policy 只接收停止梯度的 advantage，避免通过目标侧反向修改预测。' }], sourceIds: ['dreamerAgent62', 'dreamerPaper62'] },
        { heading: '03 JEPA 调用链把 goal、unroll、objective 与 optimizer 分开', body: `固定提交的 GC_Agent.set_goal 先 encode goal 并构建 objective；plan 把当前观测交给 planner；Planner.cost_function 用 unroll 预测候选动作后的表征，再调用 objective。CEMPlanner 或 NeverGradPlanner只负责提出和更新候选。这个分层让我们能单测“预测错”“目标距离错”和“搜索没找到”三种失败。

与 Dreamer 的 actor 不同，JEPA planner 返回一整段动作，执行器只消费一个前缀。异步运行时不能把 planner 对象的最后一次结果当全局真相；每个 Plan 必须冻结 origin observation、model revision、policy/action adapter revision 和 created time。锁只能防并发写坏数据，无法证明这份计划仍适用于当前状态。`, sourceIds: ['jepaAgent62', 'jepaPlanner62', 'jepaPaper62'] },
        { heading: '04 原创缓存只负责拒绝旧结果，不冒充完整调度器', body: `教学实现用不可变字典表达计划元数据，accept_plan 同时检查 observation/model/policy 版本、最大年龄、最低剩余步数和当前状态偏差。正例接受同版本且新鲜计划；负例分别制造旧模型、超龄和状态漂移，确保不是一个笼统 false 掩盖全部原因。正式实现还需原子交换、worker 崩溃恢复和 watchdog。

示例动作只是张量，不连接 SO-101。它没有模拟 actuator、相机或网络线程，也不声称复刻 Dreamer/JEPA 上游实现；教学简化仅保留异步交付合同。任何真实机器人部署还需设备侧限位、急停和授权人工监护，本自动化不会执行这些命令。`, sourceIds: ['dreamerAgent62', 'jepaAgent62', 'behaviorEval62'] },
      ],
      points: ['Dreamer 的 replay model loss 与 imagination actor-critic 在 Agent.loss 内明确分叉。', 'JEPA planner 的 optimizer、unroll 和 objective 可以分别验错。', '互斥锁不能保证新鲜度，计划必须通过版本、年龄和状态门。'],
      codeTitle: 'plan_cache_contract.py · 异步计划验收层',
      code: [
        'from dataclasses import dataclass',
        'import torch',
        '',
        '@dataclass(frozen=True)',
        'class Plan:',
        '    obs_id:int; model_v:int; policy_v:int; created_ms:int',
        '    predicted_state:torch.Tensor; actions:torch.Tensor',
        '',
        'def accept(plan,now_ms,current_state,versions,max_age=120,min_steps=2,tol=.15):',
        '    if plan.actions.ndim!=2: raise ValueError("actions must be [H,A]")',
        '    if (plan.obs_id,plan.model_v,plan.policy_v)!=versions: return False,"version"',
        '    if now_ms-plan.created_ms>max_age: return False,"age"',
        '    if plan.actions.shape[0]<min_steps: return False,"horizon"',
        '    if torch.linalg.vector_norm(current_state-plan.predicted_state)>tol: return False,"state"',
        '    return True,"ok"',
        '',
        'p=Plan(7,3,5,100,torch.tensor([0.,0.]),torch.zeros(3,2))',
        'assert accept(p,180,torch.tensor([.05,0.]),(7,3,5))[0]',
        'assert accept(p,180,torch.zeros(2),(7,4,5))[1]=="version"',
        'assert accept(p,250,torch.zeros(2),(7,3,5))[1]=="age"',
        'assert accept(p,180,torch.tensor([.3,0.]),(7,3,5))[1]=="state"',
        'try:',
        '    accept(Plan(7,3,5,100,torch.zeros(2),torch.zeros(2)),110,torch.zeros(2),(7,3,5))',
        '    raise AssertionError("bad action rank accepted")',
        'except ValueError: pass',
      ].join('\n'),
      codeNotes: ['frozen dataclass 防止计划发布后被 worker 原地改写，但正式跨线程交换仍需原子机制。', 'versions 是 obs/model/policy 三元组；任一不一致都拒绝，避免新适配器执行旧动作语义。', '正负测试分别覆盖版本、年龄、状态与 shape，脚本只操作 CPU 张量。'],
      exercise: { prompt: '给 Plan 增加 action_unit 和 frame_id，并让 accept 拒绝单位或坐标系不匹配；为每个拒绝原因写独立测试。', steps: ['在不可变元数据中声明单位和 frame。', '把当前执行器合同作为 accept 输入。', '分别构造单位错和 frame 错，不能只用一个组合负例。'], solution: 'Plan 增加 action_unit 与 frame_id；accept 接收 expected_contract=(unit,frame)，先做字符串精确比较再检查数值。用 rad 对 deg、joint 对 ee 两个独立负例确认错误原因。不要自动换算未声明单位，因为旧计划的限幅和归一化也可能基于原合同。' },
      quiz: { question: '为什么给计划缓存加线程锁，仍不足以防止执行过期动作？', hint: '锁保护内存一致性，不保护语义版本和墙钟年龄。', keywords: ['mutex', 'staleness', 'observation_id', 'model_version', 'state deviation'], reference: '线程锁只能保证读写不会交叉破坏对象；worker 完成时观测、模型、policy adapter 和机器人状态可能都已变化。必须把版本与创建时间写入计划，并在消费时检查剩余 horizon、状态偏差和动作合同。' },
      sources,
    },
    insight: {
      title: 'SO-101 快慢系统取舍：先稳定快环，再让慢模型挣得调用权', minutes: 25,
      prerequisites: '完成前两课的三时钟图、Dreamer/JEPA 调用链和计划缓存测试。',
      connection: '本课将机制翻译成个人设备与云算力的路线选择；明天不再讨论架构偏好，而用统一反例和置信区间决定某条路线是否提供增量证据。',
      intro: '个人项目最容易把“世界模型”做成昂贵旁路：训练费时、生成漂亮，却不改变决策。更可信的顺序是先建立 20 Hz 可回放快环，再用离线日志证明慢模型能在特定触发器下改善候选排序或风险预警，最后才允许它影响动作。',
      outcomes: ['按任务重复性与目标变化选择 actor 或 online planner', '建立 trigger、预算和停用规则', '把 World Labs 仿真、Meta/FAIR planner 与 AMI 方向放进可验证而不混署的路线图'],
      sections: [
        { heading: '01 高频重复任务优先摊销 policy，变化目标才购买在线搜索', body: `若 SO-101 反复做同一桌面抓取、动作空间固定且能积累 rollout，训练一个快 policy 通常更符合个人预算；Dreamer式 imagined actor 只是可能方案，SmolVLA/ACT 基线更应先跑通。在线 JEPA 搜索适合目标图频繁变化、已有动作条件 predictor 且每次计划价值高于延迟的情形。

选择标准不是“模型先进”，而是每次任务能否复用训练成本。设 N 次部署、actor 训练成本 C_train、单次快推理 C_fast、每次在线搜索 C_plan；只有 N 足够大时摊销 actor 才明显便宜。反之，小量异目标试验可先用受约束 planner，但必须把搜索分布外风险计入。`, formulas: [{ latex: String.raw`\bar C_{actor}=C_{train}/N+C_{fast},\qquad \bar C_{plan}=C_{plan},\qquad N^*=\frac{C_{train}}{C_{plan}-C_{fast}}`, explanation: 'N* 是摊销 actor 与在线 planner 成本相等的近似任务次数；只比较算力，不包含安全和数据成本。' }], sourceIds: ['dreamerPaper62', 'jepaPaper62'] },
        { heading: '02 慢模型只在可观测触发器上工作', body: `持续每帧调用 planner 会浪费算力，也让过期率升高。更好的触发器是语义目标改变、快 policy 不确定性越界、状态创新量持续升高、预测失败簇命中或阶段状态机切换。触发器必须由日志字段计算，不能由演示者主观“感觉需要规划”决定。

每次触发都记录输入版本、耗时、候选成本分布、是否被缓存门拒绝以及最终闭环结果。若 100 次触发中 60 次因超龄丢弃，问题首先是系统预算而非模型精度；若计划新鲜却频繁让真实结果变差，则检查 objective 与动作适配，而不是加更多候选掩盖失配。`, formulas: [{ latex: String.raw`u_t=\alpha\,\mathrm{Var}[a_t]+\beta\lVert z_t-\hat z_t\rVert+\eta\,\mathbf1[phase_t\ne phase_{t-1}]`, explanation: '触发分数由动作分歧、预测创新量和阶段切换组成；权重须用离线日志标定，不是通用常数。' }], sourceIds: ['jepaAgent62', 'behaviorEval62'] },
        { heading: '03 World Labs 仿真用于制造可控问题，不替 planner 做决定', body: `R2S2R/Atlas 路线可为相机视角、遮挡、物体配置和物理参数建立变化轴，帮助训练或压力测试快 policy；它不自动给出 latent objective，也不等于 JEPA planner。个人项目可先在 aligned simulation 中寻找会让快 policy 失败的区域，再把这些条件作为慢环触发器或真实小流量复核清单。

反过来，JEPA 预测器若在固定相机下能排序候选，也不证明对生成世界的几何或接触变化稳健。两条路线的交集应通过配对实验建立：同一 policy、同一初态/目标、同一动作合同，在真实、对齐仿真和 latent rollout 中比较成功边界。组织与证据层必须同时保留。`, sourceIds: ['r2s2r62', 'jepaPaper62', 'behaviorEval62'] },
        { heading: '04 四级晋级让慢模型先证明价值再获得动作权限', body: `Level 0 只离线预测并保存代价；Level 1 在 replay 上重排既有动作，不产生新动作；Level 2 在仿真中闭环但不接真机；Level 3 才在授权监护下给出建议动作，由设备侧安全层限幅。任何一级都要求相对快 policy 的预注册指标增益，并统计近失与超龄拒绝。

若 paired success 的 Wilson 下界不改善、计划过期率超过预算或失败集中在新风险簇，就停在当前级别。AMI 的当前愿景可作为未来 action-conditioned safety 研究追踪，但不能当成已有开源结果替代门禁；本课也不改总纲、不代替学习者执行机械臂。`, formulas: [{ latex: String.raw`\mathrm{advance}=\mathbf1[L_{95}(p_{slow}-p_{fast})>0]\,\mathbf1[r_{stale}<r_{max}]\,\mathbf1[n_{new\ risk}=0]`, explanation: '晋级同时要求配对成功增益下界为正、过期率受控且没有新风险类型；任一失败就不赋予更高权限。' }], sourceIds: ['behaviorEval62', 'ami62'] },
      ],
      points: ['先让快 policy 稳定，再让慢模型用离线证据争取调用权。', '触发器、过期率和拒绝原因与模型精度同等重要。', '空间仿真制造可控变化，latent planner排序动作，二者需配对闭环连接。'],
      codeTitle: 'planner_trigger.py · 可审计慢环触发器',
      code: [
        'def trigger(action_var,innovation,phase_changed,limits=(.04,.15)):',
        '    if action_var<0 or innovation<0: raise ValueError("metrics must be nonnegative")',
        '    reasons=[]',
        '    if action_var>limits[0]: reasons.append("action_var")',
        '    if innovation>limits[1]: reasons.append("innovation")',
        '    if phase_changed: reasons.append("phase")',
        '    return bool(reasons),tuple(reasons)',
        '',
        'assert trigger(.05,.02,False)==(True,("action_var",))',
        'assert trigger(.01,.02,False)==(False,())',
        'assert trigger(.01,.20,True)[1]==("innovation","phase")',
        'try:',
        '    trigger(-.1,0,False)',
        '    raise AssertionError("negative variance accepted")',
        'except ValueError: pass',
      ].join('\n'),
      codeNotes: ['返回原因元组而非单一布尔值，便于统计慢环为何被调用。', '阈值只是教学输入；真实值必须在离线日志上校准并随版本保存。', '负例拒绝不可能的负方差，防止上游指标错误悄悄关闭触发。'],
      exercise: { prompt: '为 SO-101 设计 Level 0→2 的三张验收表，每张至少包含输入版本、触发原因、过期状态、收益指标和停止条件。', steps: ['分别列 replay 重排、仿真闭环和真实建议层的权限。', '每层指定一个主要收益和一个风险指标。', '写出失败后回退到数据、模型或系统层的规则。'], solution: 'Level 0 记录 replay 候选排序准确率与版本；Level 1 记录对齐仿真的 paired success、过期率和新失败簇；Level 2 只输出建议不执行，记录人工接受率与设备侧拒绝。排序差回退 objective/数据，过期高回退系统预算，新风险回退安全合同。' },
      quiz: { question: '为什么个人 SO-101 项目不应一开始就让慢世界模型直接控制电机？', hint: '先看基线、时序合同和增量证据是否存在。', keywords: ['SO-101', 'offline shadow', 'promotion gate', 'stale plan', 'safety layer'], reference: '没有稳定快环就无法判断慢模型是否带来增量；没有版本和年龄门，慢结果可能执行在错误状态；没有设备侧限位与配对闭环证据，漂亮预测不能说明安全。应先离线 shadow、再 replay 重排、再仿真闭环，最后才在授权监护下建议动作。' },
      sources,
    },
  },
};
