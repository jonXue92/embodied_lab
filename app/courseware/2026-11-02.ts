import type { AuthoredDay } from './types';

const jepaCommit = '13cf1d9c7e476f53c17714d2e0f1dc239a883ce0';
const jepaRoot = 'https://github.com/facebookresearch/jepa-wms/blob/' + jepaCommit;

const sources = [
  { id: 'jepaPaper63', label: 'Meta/FAIR · JEPA-WM 论文 v4', url: 'https://arxiv.org/html/2512.24497v4', reading: '2026-10-30 实读规划结果、设计消融、预测/规划相关性和复现审计：区分 representation prediction、action counterfactual、goal planning 与环境 success，不用解码视频替代闭环证据。' },
  { id: 'jepaEval63', label: 'Meta/FAIR · simu_env_planning 评测说明（固定提交）', url: jepaRoot + '/evals/simu_env_planning/README.md', reading: '核对 episode=(s0,sg)、goal-conditioned cost、Success/Failure、end distance、reward、embedding L2、LPIPS 与 DROID offline 指标；不同指标回答不同层次问题。' },
  { id: 'jepaEvaluator63', label: 'Meta/FAIR · plan_evaluator.py（固定提交）', url: jepaRoot + '/evals/simu_env_planning/planning/plan_evaluator.py', reading: '定位 set_episode、agent.act、环境 step、成功/距离记录与 episode 日志；评测器把 planner 输出送入环境，不能把内部 objective 最小值当作环境成功。' },
  { id: 'jepaObjective63', label: 'Meta/FAIR · objectives.py（固定提交）', url: jepaRoot + '/evals/simu_env_planning/planning/planning/objectives.py', reading: '定位 ReprTargetDistMPCObjective 及 L1/cos 变体，核对终点/整段聚合、视觉和 proprio 距离；objective 是搜索代理量，不是有物理单位的成功率。' },
  { id: 'r2s2r63', label: 'World Labs · Real-to-Sim-to-Real', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '2026-10-30 核对 aligned simulation、可控变化、success/failure region 与 policy ranking；将视觉重建、交互有效性和真实决策等价分层。' },
  { id: 'atlas63', label: 'World Labs · Atlas', url: 'https://www.worldlabs.ai/blog/atlas', reading: '核对图像、文本、相机位姿、深度组成共享空间上下文及多模态输出；官方未公开等价机器人训练源码，课程不虚构 Atlas 函数或闭环成绩。' },
  { id: 'behaviorEval63', label: 'StanfordVL · BEHAVIOR 2026 Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '核对 BDDL goal、binary success、Q-score、隐藏实例、时间预算和单次 rollout；公开实例用于开发，隐藏实例用于检验泛化。' },
  { id: 'behaviorSubmit63', label: 'StanfordVL · BEHAVIOR Submission Guidelines', url: 'https://behavior.stanford.edu/challenge/submission.html', reading: '核对 100任务×10实例×1 rollout、缺失记零、禁止 cherry-picking、机器人配置可复现与输出字段；这些规则约束选择偏差，不证明某个 world model 更优。' },
  { id: 'vjepaOfficial63', label: 'Meta AI · V-JEPA 2 官方页', url: 'https://ai.meta.com/research/vjepa/', reading: '核对自然视频自监督表征与少量机器人视频动作后训练的阶段边界；V-JEPA 2/2.1/2-AC 属 Meta/FAIR 历史成果。' },
  { id: 'ami63', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '核对 AMI 当前关于表征预测、动作条件世界模型与安全护栏的公开方向；没有一手页面明确关联时，不把新的 Meta 工作自动记作 AMI 成果。' },
];

export const day63: AuthoredDay = {
  reviewedAt: '2026-10-30',
  revision: '逐课编写 1.0',
  deliverable: '一张“空间资产→动作反事实→候选排序→环境闭环→真实复核”证据阶梯；一个按 task/instance/seed 配对、拒绝缺失和泄漏、输出 paired delta 与 bootstrap 区间的原创 PyTorch 评测夹具；一份 Atlas/R2S2R 与 JEPA 选择或混合的 SO-101 预注册决策表。三课共 100 分钟，另留 20 分钟复盘。',
  question: {
    title: '生成世界更逼真、JEPA latent 距离更低，为什么都不能直接宣布控制更好？',
    summary: '内部代理指标必须经过动作反事实、候选排序和配对闭环逐层校准。',
    keywords: ['proxy metric', 'counterfactual', 'paired evaluation', 'policy ranking', 'hidden instance', 'closed loop'],
    reference: '生成逼真度主要检验观感或重建，可能忽略接触和动作后果；latent 距离低只说明在选定表征与 objective 下接近目标，optimizer 仍可能利用模型漏洞。两者都需在同一 task/instance/seed、同一动作和时间预算下做反事实方向、候选排序、环境成功/Q-score、真实小流量复核，并报告配对差与区间。公开实例调参后还要在隐藏实例上冻结评估，不能挑最好 rollout。',
  },
  lessons: {
    foundation: {
      title: '双路线评测：从像素/空间质量到决策等价', minutes: 35,
      prerequisites: '理解 Atlas/R2S2R 的空间上下文、JEPA 的 latent objective、BEHAVIOR 的任务谓词，以及昨天的快慢计划版本门。',
      connection: '昨天解决慢 planner 如何进入控制时间线；今天完成 World Model 单元，用统一证据阶梯比较 World Labs 空间生成/仿真路线与 Meta/FAIR 表征预测/规划路线。明天进入仿真与 Sim2Real 单元，开始 URDF、关节与坐标系。',
      intro: '公平比较不是把所有指标压成一个总分，而是问每个主张需要哪一层证据。空间生成可在几何与视角上很强，latent predictor 可在目标距离上很强，但机器人最终关心动作是否改变世界、planner 是否选对、闭环是否成功，以及真实风险是否可接受。',
      outcomes: ['建立五层证据阶梯并为每层指定反例', '用配对实例和置信区间隔离路线差异', '识别公开实例调参、best-of-N 和代理指标替代成功的泄漏'],
      sections: [
        { heading: '01 五层证据不能越级：资产、预测、排序、闭环、真实', body: `Level A 检验空间资产：视角一致、尺度、深度、遮挡和几何往返。Level B 检验动作反事实：同一初态下换动作，预测后果方向是否正确。Level C 检验候选排序：world model/objective 是否把真实更好的动作排前。Level D 检验环境闭环成功与Q-score。Level E 才是授权真实设备上的成功、近失和介入。

World Labs 的 Atlas/R2S2R主要为 A 及 aligned simulation 提供证据，JEPA-WM直接覆盖 B/C 并在模拟环境研究 D；二者都不能跳过 E。StanfordVL 的 BEHAVIOR给 D 提供任务与评测协议，但不拥有 Atlas，也不提供 JEPA 模型。把这些层压成“world model score”会掩盖失败发生在哪一接口。`, formulas: [{ latex: String.raw`E_A\not\Rightarrow E_B\not\Rightarrow E_C\not\Rightarrow E_D\not\Rightarrow E_E`, explanation: '每个箭头都可能被反例打断：几何好不保证动作后果，候选排序好也不保证真实安全。' }], sourceIds: ['atlas63', 'r2s2r63', 'jepaPaper63', 'behaviorEval63'] },
        { heading: '02 评测单位必须成对，不能让路线看到不同难度', body: `实验单位应是 task_id、instance_id、seed、initial state、goal、action contract 与 time budget 的联合键。路线 A 与路线 B 在同一键上运行，得到 success、Q-score、end distance、时延和风险。只比较各自平均值会受实例组成影响；配对差能消掉大量任务难度偏置。

数值例：简单实例上生成仿真路线 9/10，JEPA 8/10；困难实例上前者 2/10，后者 4/10。若路线各自只挑有利子集，会得出相反结论。BEHAVIOR 的单次 rollout 和缺失记零正是对选择偏差的约束；研究阶段可重复估计方差，但最终协议必须预先固定次数，不能 best-of-N。`, formulas: [{ latex: String.raw`\hat\Delta=\frac1N\sum_{i=1}^N\big(y_i^{A}-y_i^{B}\big),\qquad i=(task,instance,seed)`, explanation: '逐联合键求路线差再平均，保留同一难度上的直接比较；y 可为 success 或 Q-score。' }], sourceIds: ['behaviorEval63', 'behaviorSubmit63', 'jepaEval63'] },
        { heading: '03 内部指标要先证明能排序真实进展', body: `Atlas 类结果可报告多视角一致、深度/位姿误差和可见性，却必须再测交互状态与 policy ranking。JEPA 可报告 embedding L1/L2、LPIPS 或 planning objective，却要检查这些值与环境 end distance、success 的单调关系。相关性不等于因果，但完全不相关时代理指标显然不适合选模。

反例应主动设计：保持像素相似却改变接触状态；保持末端位置接近却让夹爪朝向错误；给 optimizer 一个训练分布外大动作，使 latent 终点很近但环境碰撞。每个反例都记录哪一层通过、下一层失败。只有这样，改模型、改 objective 或改仿真资产才有明确方向。`, formulas: [{ latex: String.raw`\rho_{proxy}=\operatorname{Spearman}\!\left(-c_i,\,q_i^{env}\right),\qquad e_{rank}=\frac{\#\{(i,j):\operatorname{sgn}(c_i-c_j)=\operatorname{sgn}(q_i-q_j)\}}{\#pairs}`, explanation: '负代理成本应与环境进展正相关；成对排序一致率直接检验用 proxy 选候选是否会选反。' }], sourceIds: ['jepaEval63', 'jepaObjective63', 'r2s2r63'] },
        { heading: '04 区间、失败簇和隐藏实例比一个赢家数字更诚实', body: `二元成功率需要 Wilson 区间，路线差应做配对 bootstrap 或 McNemar 分析；Q-score/距离可对联合键差值 bootstrap。还要按遮挡、接触、相机漂移、长 horizon 与超龄计划分层，因为总体均值可能用简单实例掩盖关键失败。样本少时，结论应写“证据不足”，不能把点估计最大者宣布为胜者。

公开实例用于开发 objective、阈值和适配器；冻结配置后才进入隐藏实例。隐藏成绩下降提示过拟合评测分布，不应追溯重写已完成课程或偷偷换 best checkpoint。LeCun 技术谱系的 Meta/FAIR结果与 AMI 当前方向分开；李飞飞线也将 StanfordVL 的任务评测与 World Labs 的空间生成分开归属。`, formulas: [{ latex: String.raw`CI_{boot}=\operatorname{quantile}_{0.025,0.975}\!\left(\frac1N\sum_i\Delta_i^{*(b)}\right)`, explanation: '按配对联合键重采样差值，保留两路线共享的任务难度；区间跨零时不宣称稳定胜出。' }], sourceIds: ['behaviorSubmit63', 'behaviorEval63', 'vjepaOfficial63', 'ami63'] },
      ],
      points: ['空间质量、动作反事实、候选排序、环境闭环和真实复核是五层证据。', '同 task/instance/seed 配对比两组独立均值更能隔离路线差。', '代理指标必须证明能排序环境进展，区间跨零就保留不确定性。'],
      codeTitle: 'evidence_ladder.py · 逐层证据状态机',
      code: [
        'LEVELS=("asset","counterfactual","ranking","closed_loop","real")',
        '',
        'def highest_level(results):',
        '    if set(results)-set(LEVELS): raise ValueError("unknown evidence level")',
        '    passed=[]',
        '    for level in LEVELS:',
        '        if not results.get(level,False): break',
        '        passed.append(level)',
        '    return passed[-1] if passed else "none"',
        '',
        'assert highest_level({"asset":True,"counterfactual":True,"ranking":False})=="counterfactual"',
        'assert highest_level({"asset":False,"closed_loop":True})=="none"',
        'try:',
        '    highest_level({"pretty_video":True})',
        '    raise AssertionError("unknown level accepted")',
        'except ValueError: pass',
      ].join('\n'),
      codeNotes: ['证据必须连续通过，不能在 asset 失败时因一次 closed-loop 成功就标为高级别。', '未知键直接拒绝，防止把 pretty_video 等自定义宣传指标悄悄塞进正式阶梯。', '这是审计状态机，不执行仿真或机械臂。'],
      exercise: { prompt: '为“视频很逼真但插接失败”和“latent 排序正确但 p99 计划超时”分别标注最高证据层，并写下一项最小实验。', steps: ['逐层判断已通过和首次失败。', '不要用后层偶然成功跳过前层。', '为首次失败设计一个可反驳实验。'], solution: '逼真视频若几何通过但接触反事实失败，最高到 asset，下一实验是固定像素外观、改变接触/摩擦并检查状态后果。latent 排序正确但超时，证据到 ranking；下一实验是在固定 deadline 下测闭环、超龄拒绝率和保守回退，而不是继续降低 latent loss。' },
      quiz: { question: '为什么两条路线各自报告的平均成功率不能直接比较？', hint: '检查 task、instance、seed、预算与缺失项是否一致。', keywords: ['paired unit', 'task_id', 'instance_id', 'seed', 'selection bias'], reference: '若两条路线运行的实例、seed、时间预算或缺失处理不同，平均值混入难度和选择偏差。应按同一 task/instance/seed 联合键配对，缺失按预注册规则处理，再报告逐键差值和区间。' },
      sources,
    },
    code: {
      title: '源码精读：JEPA episode 指标与 BEHAVIOR 单次 rollout 合同', minutes: 40,
      prerequisites: '会读评测循环、episode 日志、二元 success、连续 Q-score、bootstrap 与数据切分。',
      connection: '基础课定义了配对证据阶梯；本课沿 JEPA-WM 评测说明、plan_evaluator 和 BEHAVIOR 提交规则核对真实字段，再实现能发现缺失、重复键与公开/隐藏泄漏的最小夹具。',
      intro: '评测代码最危险的 bug 不一定报错：重复一个成功实例、漏掉困难实例、把 optimizer cost 当 success，都能生成漂亮表格。本课把每行数据的身份与来源当作一等公民，先验证集合，再计算统计量。',
      outcomes: ['区分 JEPA 内部 cost、embedding/LPIPS 与环境 success', '落实 BEHAVIOR 单次 rollout、缺失记零和隐藏实例边界', '运行成对差与 bootstrap 区间并用负测试拦截重复/泄漏'],
      sections: [
        { heading: '01 JEPA 评测器同时记录代理量与环境结果', body: `固定提交的评测 README 把 episode 定义为 (s0,sg)，列出 Success Rate、ep_end_dist、reward、total_emb_l2、total_lpips，并为 DROID offline 记录末端位置、姿态和闭合距离。Planner 的 cost 来自 representation objective；plan_evaluator 把 agent 动作送进环境后才获得环境状态与结果。

因此数据表必须保留 metric_type。embedding L2 降低可以说明预测/目标空间更接近，但不能直接累加进 success；LPIPS 是视觉解码距离，也没有任务谓词语义。正式报告至少分 prediction、planning proxy、environment outcome 和 system/safety 四张表，避免单位不同的数字被无意义平均。`, sourceIds: ['jepaEval63', 'jepaEvaluator63', 'jepaObjective63'] },
        { heading: '02 BEHAVIOR 用集合合同限制 cherry-picking', body: `BEHAVIOR 提交说明固定任务、实例和 rollout 数，缺失输出记零，并禁止从重复仿真的多个结果中挑最好一次。机器人配置、控制器、观测和相机字段也属于复现包。规则的目的不是消灭随机性，而是让随机性不会被参赛者选择性利用。

本地研发可以为方差估计运行多个 seed，但必须在实验前写明 seed 集合，按全部结果统计；最终一次性评测与调参数据分开。若公开实例参与 objective、阈值或 checkpoint 选择，就不能再把同一结果称作无偏泛化证据。隐藏 instance_id 必须在冻结后才解锁到评测 worker。`, sourceIds: ['behaviorEval63', 'behaviorSubmit63'] },
        { heading: '03 成对夹具先验证键集合，再计算差与区间', body: `原创代码用整数 task/instance/seed 组成 key，对路线 A/B 建字典。重复 key 直接失败，避免后写覆盖；键集合不相等直接失败，避免静默丢交集。随后把每个 key 的 success 差组成向量，用固定随机种子的 paired bootstrap 重采样这些差，而不是分别重采样 A/B。

固定 seed 只让教学测试可复现，不让一次 bootstrap 变成真理。真实报告应公开 resample 次数、随机种子、点估计和分位区间，并对任务分层做敏感性分析。若区间跨零，应说无法区分；若均值改善但近失新增，安全门仍可否决。`, formulas: [{ latex: String.raw`\Delta^{*(b)}=\frac1N\sum_{j=1}^N\left(y_{i_j}^{A}-y_{i_j}^{B}\right),\quad i_j\sim\mathrm{Uniform}\{1,\ldots,N\}`, explanation: 'bootstrap 采样的是配对差所在的联合键，不能打散两路线在同一实例上的对应关系。' }], sourceIds: ['behaviorSubmit63', 'jepaEval63'] },
        { heading: '04 正负测试瞄准选择偏差与泄漏', body: `正例含四个完全配对 key；负例一重复 key，负例二缺失困难实例，负例三把 hidden 标记行放进 tuning split。每个错误都应在统计前失败。把缺失补零仅在正式协议明确要求时做；研究对比如果路线因为崩溃缺失，同样要预先决定记零还是单列系统失败，不能看完结果再选择。

教学代码只用合成 0/1 成功标签，不下载真实客户数据、不执行仿真和机械臂。要接入 SO-101 日志时，应先做去标识、权限和数据字典，并保留失败 episode；删除失败只保留成功会同时破坏 world model 校准和闭环评测。`, sourceIds: ['behaviorSubmit63', 'jepaEvaluator63'] },
      ],
      points: ['JEPA 内部 objective 与环境 success 必须分字段记录。', '重复键、缺失键和 hidden→tuning 泄漏应在统计前报错。', 'paired bootstrap 重采样联合键差值，而不是打散两条路线。'],
      codeTitle: 'paired_world_model_eval.py · 配对键与区间夹具',
      code: [
        'import torch',
        '',
        'def index(rows):',
        '    out={}',
        '    for task,inst,seed,split,score in rows:',
        '        if split=="hidden": raise ValueError("hidden data cannot enter tuning evaluator")',
        '        key=(task,inst,seed)',
        '        if key in out: raise ValueError("duplicate key")',
        '        out[key]=float(score)',
        '    return out',
        '',
        'def paired_delta(a,b,draws=400):',
        '    a,b=index(a),index(b)',
        '    if set(a)!=set(b): raise ValueError("unpaired key sets")',
        '    d=torch.tensor([a[k]-b[k] for k in sorted(a)])',
        '    g=torch.Generator().manual_seed(7)',
        '    ids=torch.randint(len(d),(draws,len(d)),generator=g)',
        '    boot=d[ids].mean(1)',
        '    q=torch.quantile(boot,torch.tensor([.025,.975]))',
        '    return float(d.mean()),tuple(float(x) for x in q)',
        '',
        'a=[(0,0,0,"public",1),(0,1,0,"public",1),(1,0,0,"public",0),(1,1,0,"public",1)]',
        'b=[(0,0,0,"public",1),(0,1,0,"public",0),(1,0,0,"public",0),(1,1,0,"public",0)]',
        'delta,ci=paired_delta(a,b)',
        'assert abs(delta-.5)<1e-6 and ci[0]<=delta<=ci[1]',
        'try:',
        '    paired_delta(a,b[:-1])',
        '    raise AssertionError("missing key accepted")',
        'except ValueError: pass',
        'try:',
        '    index(a+[a[0]])',
        '    raise AssertionError("duplicate accepted")',
        'except ValueError: pass',
      ].join('\n'),
      codeNotes: ['index 在计算前拒绝 hidden、重复键；生产版应把 tuning evaluator 与最终 evaluator 物理隔离。', 'set 相等保证路线在同一联合键上配对，避免只取交集美化结果。', '固定 generator 只服务可重复教学测试；真实报告仍需说明 bootstrap 配置和小样本限制。'],
      exercise: { prompt: '扩展代码同时处理连续 Q-score 和 safety_event，并规定“成功增益为正但新增一次安全事件”时如何判定。', steps: ['保留每个 key 的 success、Q-score 和 safety_event。', '分别计算 paired delta，不把单位不同指标相加。', '把安全事件设为硬门而非可被成功均值抵消的软权重。'], solution: '每个 key 存结构化字段，Q-score 用同一 paired bootstrap；safety_event 用事件计数和配对不一致表。若 A 成功率提高但新增安全事件，按预注册硬门拒绝晋级，并单独调查事件，不允许用成功增益加权抵消。' },
      quiz: { question: '为什么 paired bootstrap 要重采样 task/instance/seed 键，而不能分别重采样两条路线的分数？', hint: '两条路线共享同一个实例难度。', keywords: ['paired bootstrap', 'joint key', 'difficulty', 'covariance', 'confidence interval'], reference: '同一实例对两条路线有共同难度，逐键差能消掉这部分变异；分别重采样会破坏对应关系和协方差，使区间回答另一个问题。应先构造每个联合键的差，再重采样差向量。' },
      sources,
    },
    insight: {
      title: '选生成、选 JEPA 还是混合：用反例预算做路线裁决', minutes: 25,
      prerequisites: '完成证据阶梯、配对统计与 JEPA/BEHAVIOR 评测源码阅读。',
      connection: '本课作为 World Model 单元收束，把路线争论改写成可执行实验；下一单元会把选出的变化轴落实到 URDF、坐标系、物理与 Sim2Real。',
      intro: '路线裁决不需要宣布唯一未来。空间生成擅长扩大场景与视角，JEPA 式 predictor 擅长在紧凑表征中问“这个动作会怎样”，混合系统则用生成/仿真造压力条件、用 latent planner 排候选。真正约束选择的是哪个失败最昂贵，以及个人预算能否产生反驳证据。',
      outcomes: ['按失败类型而非品牌选择路线', '设计最小 2×2 配对实验辨别独立贡献与交互', '给出不显著、排序反转与安全事件下的停止规则'],
      sections: [
        { heading: '01 先写失败假设，再选模型能力', body: `若主要失败是相机视角、遮挡、背景和物体布局变化，优先投资 aligned simulation/空间资产；若主要失败是同一观测下动作后果与恢复路径，优先验证 action-conditioned predictor；若两者同时存在，混合系统才有理由。没有失败簇就先收集基线日志，而不是凭趋势选择大模型。

SO-101 可把失败分为 perceptual、geometric、interaction、planning、system 五类。每类至少给一个可观测签名，例如相机重投影误差、接触后状态不一致、候选真实排序反转或计划超龄。分类器不必一开始自动化，但标签定义与复核流程必须稳定。`, formulas: [{ latex: String.raw`R_k=P(F_k)\,C(F_k),\qquad k\in\{perception,geometry,interaction,planning,system\}`, explanation: '路线优先级由失败概率与代价的乘积决定；概率来自基线日志，代价包含安全和返工而非只看算力。' }], sourceIds: ['r2s2r63', 'jepaPaper63', 'behaviorEval63'] },
        { heading: '02 2×2 实验把空间变化与 latent planner 贡献拆开', body: `设计两个因素：S 表示是否使用对齐仿真变化训练/测试，J 表示是否使用 JEPA planner 或其排序信号。四组是基线、S-only、J-only、S+J；所有组共享真实数据、快 policy、实例和预算。这样能分别估计空间覆盖、规划和交互项，而不是把混合系统整体提升归给某个品牌。

如果 S-only 改善遮挡但不改善接触，J-only 改善动作排序但对新视角退化，而 S+J 同时改善，两条路线互补有证据。若 S+J 反而更差，检查仿真资产是否让 predictor 学到错误动作后果、或 planner objective 是否偏爱生成伪影。交互项本身就是重要结果。`, formulas: [{ latex: String.raw`\Delta_{SJ}=J_{11}-J_{10}-J_{01}+J_{00}`, explanation: '四组指标的差中差衡量混合是否超出两条路线独立收益之和；每个 J 都应来自同一配对键集合。' }], sourceIds: ['r2s2r63', 'jepaEval63'] },
        { heading: '03 预算优先给能打破当前结论的反例', body: `个人算力有限时，不必追求大规模预训练。优先选能区分路线的最小反例：相同像素但摩擦不同、相同末端位置但夹爪朝向不同、相同 latent 终点但路径穿障碍、相同平均时延但 p99 超 deadline。一个反例如果能使两路线预测相反，就比再加一百个随机 easy case 更有信息。

每个反例预先写路线 A/B 的预测、观测字段、判定阈值和失败后动作。结果若两者都失败，应回到数据/动作合同；若只有一方失败，再扩展相邻条件确认不是偶然。新热点先进入延伸阅读，不因一次演示自动改纲。`, formulas: [{ latex: String.raw`x^*=\arg\max_x \frac{|\hat J_A(x)-\hat J_B(x)|}{C_{run}(x)+\lambda R_{safety}(x)}`, explanation: '优先选择两路线预测分歧大、运行成本和安全风险可控的实验；这是实验选择启发式，不是自动真机策略。' }], sourceIds: ['atlas63', 'jepaPaper63', 'behaviorSubmit63'] },
        { heading: '04 决策表允许“不选”和“暂不晋级”', body: `若 paired interval 跨零、公开到隐藏退化大、policy 排序反转或出现新安全事件，合理结论是证据不足或停用，而不是从次要指标挑赢家。路线可保留为离线工具：Atlas/R2S2R类资产继续做压力测试，JEPA predictor继续做 shadow ranking，但都不获得动作权限。

最终报告分别写技术归属与证据：World Labs 的 Atlas/R2S2R、StanfordVL 的 BEHAVIOR/OmniGibson、Meta/FAIR 的 V-JEPA/JEPA-WM、AMI 当前方向。人物连续性不改变组织边界。此决策表不控制机械臂、不代替学习者打卡，也不上传任何客户数据。`, formulas: [{ latex: String.raw`D=\begin{cases}\text{advance},&L_{95}(\Delta)>0\land \rho_{rank}\ge\rho_{min}\land n_{risk}=0\\\text{shadow},&\text{evidence insufficient}\\\text{stop},&n_{risk}>0\lor\rho_{rank}<0\end{cases}`, explanation: '三态决策允许保留 shadow 研究；显著增益、排序和安全必须同时满足，不能强迫每轮选一个赢家。' }], sourceIds: ['behaviorEval63', 'vjepaOfficial63', 'ami63'] },
      ],
      points: ['按失败簇选空间生成、latent planner 或混合，而不是按品牌站队。', '2×2 配对实验能分离独立贡献与交互项。', '证据不足时保留 shadow，不强迫路线获得动作权限。'],
      codeTitle: 'factorial_decision.py · 2×2 交互项与硬安全门',
      code: [
        'def interaction(j00,j10,j01,j11):',
        '    return j11-j10-j01+j00',
        '',
        'def decide(delta_low,rank_corr,new_risks,min_rank=.6):',
        '    if new_risks>0 or rank_corr<0: return "stop"',
        '    if delta_low>0 and rank_corr>=min_rank: return "advance"',
        '    return "shadow"',
        '',
        'assert abs(interaction(.40,.52,.50,.68)-.06)<1e-9',
        'assert decide(.02,.8,0)=="advance"',
        'assert decide(-.01,.8,0)=="shadow"',
        'assert decide(.05,.9,1)=="stop"',
        'assert decide(.05,-.2,0)=="stop"',
      ].join('\n'),
      codeNotes: ['interaction 是同一配对指标上的差中差，不可混用 success 与 Q-score。', '安全事件和负排序是硬停止条件，不被正成功差抵消。', 'shadow 是正式状态，表示继续离线收集证据而非悄悄上线。'],
      exercise: { prompt: '给出四组成功率 0.40/0.55/0.48/0.57，计算交互项并解释为何 S+J 最高仍不代表协同。', steps: ['按 J11-J10-J01+J00 计算。', '区分总水平与超加和贡献。', '提出一个检查负交互的反例。'], solution: '交互项为 0.57-0.55-0.48+0.40=-0.06。S+J 的绝对成功率最高，但组合收益低于两条独立收益相加，可能存在仿真伪影误导 planner 或预算竞争。应按失败簇检查生成资产中的动作后果与 planner 排序。' },
      quiz: { question: '为什么 S+J 组合组成功率最高，仍不能直接说两条路线产生协同？', hint: '比较组合提升是否超过两个单因素提升之和。', keywords: ['factorial design', 'interaction', 'difference-in-differences', 'S-only', 'J-only'], reference: '组合组最高可能只是两个独立主效应相加，甚至小于相加值。协同要看交互项 J11-J10-J01+J00，并在同一配对键和区间下检验；负交互提示两模块互相干扰。' },
      sources,
    },
  },
};
