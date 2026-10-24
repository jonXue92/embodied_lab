import type { AuthoredDay } from './types';

const vjepaCommit = '204698b45b3712590f06245fbfba32d3be539812';
const vjepaRoot = 'https://github.com/facebookresearch/vjepa2/blob/' + vjepaCommit;
const jepaWmCommit = '13cf1d9c7e476f53c17714d2e0f1dc239a883ce0';
const jepaWmRoot = 'https://github.com/facebookresearch/jepa-wms/blob/' + jepaWmCommit;

const sources = [
  { id: 'worldTax57', label: 'World Labs · A Functional Taxonomy of World Models', url: 'https://www.worldlabs.ai/blog/taxonomy-of-world-models', reading: '2026-10-24 实读“Loop Beneath the Taxonomy”、Renderers、Simulators、Planners 与边界融合：renderer 输出给人看的 observation，simulator 输出可计算和交互的 state，planner 从 observation/goal 输出 action；文章把统一闭环写成方向，不等于三种能力已在同一公开模型上完成。' },
  { id: 'atlas57', label: 'World Labs · Atlas', url: 'https://www.worldlabs.ai/blog/atlas', reading: '2026-10-24 实读架构、空间重建、space-time simulation 与机器人示例：Atlas 是多模态自回归 diffusion transformer，把文本、图像、相机位姿与深度放进共享空间上下文；公开量化主要覆盖相机条件生成和3D重建，不能外推成任意机器人闭环规划成绩。' },
  { id: 'r2s2r57', label: 'World Labs · Real-to-Sim-to-Real', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '2026-10-24 实读真实任务重建、开环sim-real对齐、仿真训练和策略排序：其价值标准不是像素相似本身，而是交互结果、失败区域和策略相对排序能否被真机复核；属于World Labs空间仿真线。' },
  { id: 'vjepaPaper57', label: 'Meta/FAIR · V-JEPA 2论文', url: 'https://arxiv.org/abs/2506.09985', reading: '2026-10-24 复读无动作视频预训练与动作条件后训练：V-JEPA 2先从超100万小时视频学表示，V-JEPA 2-AC再用少于62小时DROID视频学习动作条件latent预测，并以目标图做Franka规划；证据边界限于论文机器人、相机和任务。' },
  { id: 'vjepaCode57', label: 'V-JEPA 2-AC action predictor（固定提交）', url: vjepaRoot + '/src/models/ac_predictor.py', reading: '2026-10-24 精读VisionTransformerPredictorAC.forward：视觉token先投到predictor宽度，state/action各线性编码成条件token，与每个时间步patch token拼接，经因果attention后只投影视觉token；函数返回预测latent，不直接返回电机动作。' },
  { id: 'jepaPaper57', label: 'Meta/FAIR · JEPA-WM论文', url: 'https://arxiv.org/abs/2512.24497', reading: '2026-10-24 实读训练、规划和消融：动作条件predictor在表征空间滚动，planner最小化预测latent到goal latent的距离；论文明确好rollout不自动带来高规划成功，并报告相机/动作校准偏移、抓取幻觉和局部极小值等失败。' },
  { id: 'jepaPredictor57', label: 'JEPA-WM action predictor（固定提交）', url: jepaWmRoot + '/src/models/ac_predictor.py', reading: '2026-10-24 精读VisionTransformerPredictorAC.forward与concat_obs_act：代码支持token/feature两种动作条件、可选proprio与extrinsics，并用action-block causal mask限制未来信息；输出仍是future visual embedding及可选条件特征。' },
  { id: 'jepaPlanner57', label: 'JEPA-WM planner与goal agent（固定提交）', url: jepaWmRoot + '/evals/simu_env_planning/planning/gc_agent.py', reading: '2026-10-24 联读GC_Agent.set_goal/act、planning/planning/planner.py的Planner.cost_function和objectives.py的ReprTargetDistMPCObjective：goal与当前观测先encode，候选动作经unroll，L1/L2/cos表征距离评分，再执行计划动作并重规划。' },
  { id: 'behaviorEval57', label: 'StanfordVL · BEHAVIOR 2026 Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '2026-10-24 复核BDDL目标、Q-score、公开/隐藏实例、单次rollout和时间预算；它提供任务与闭环评测契约，不提供World Labs模型、JEPA planner或SO-101动作适配器。' },
  { id: 'ami57', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '2026-10-24 核对当前一手页面仍只公开组织与研究方向入口；课程把表征空间预测、动作条件世界模型、可靠性和安全作为AMI当前方向，不把Meta/FAIR源码或既有结果改写成AMI已发布系统。' },
];

export const day57: AuthoredDay = {
  reviewedAt: '2026-10-24',
  revision: '逐课编写 1.0',
  deliverable: '一张renderer—simulator—planner—闭环模型的输入、预测对象、输出和验收指标表；一个对照JEPA真实调用链的离线observe→encode→unroll→score→replan PyTorch夹具；一份面向SO-101与RAW模态项目的世界模型证据阶梯。三课共100分钟，另留20分钟复盘。',
  question: {
    title: '一个模型能生成逼真的机器人视频，是否已经证明它能当作安全的动作规划器？',
    summary: '视觉合理、状态转移准确、动作可控和闭环成功是四份不同证据。',
    keywords: ['renderer', 'simulator', 'planner', 'action conditioning', 'closed loop', 'counterfactual'],
    reference: '不能。逼真视频主要证明renderer对观测分布的拟合；规划还要求同一初态下不同候选动作产生可辨认、方向正确的反事实后果，预测状态或latent与目标代价可比较，并且动作优化不会钻模型误差。最低证据链应包括动作敏感性、跨步rollout、目标排序、约束与校准、反复闭环重规划和真实任务成功/近失指标。Atlas/R2S2R的空间仿真与Meta/FAIR的JEPA latent planning解决的是不同接口，不能只凭“都叫world model”互相代替。',
  },
  lessons: {
    foundation: {
      title: 'World Model四种职责：渲染、仿真、规划与闭环校正', minutes: 34,
      prerequisites: '理解POMDP中的state、observation和action，完成10-26统一横评并能区分直接action policy与latent predictor。',
      connection: '昨天建立了“输入—预测对象—动作接口—闭环指标”的统一横评表；今天用它拆开world model这个过载名词。明天将进一步比较像素/3D生成与latent表征预测的训练目标。',
      intro: '看到一个未来画面不等于拥有可交互世界，能滚动预测latent也不等于已经找到动作。今天先把“世界模型”按系统职责拆成可验收合同：renderer负责看见什么，simulator负责世界怎样变，planner负责该做什么，闭环模型还要用新观测纠错。',
      outcomes: ['用输入、输出和消费者区分四种职责', '从POMDP推导renderer与simulator预测对象的差别', '用带风险的数值例说明planner为何不能只挑平均代价最低'],
      sections: [
        { heading: '01 同一个POMDP回路里，四种职责输出不同变量', body: `设不可完全观测的真实状态为s_t，传感器观测为o_t，机器人动作是a_t。renderer学习“给定条件，人或相机会看到什么”，输出像素、深度或新视角；simulator学习动作施加后世界状态怎样变化，输出几何、接触、物体状态或可供程序继续交互的内部状态；planner读取观测与目标，输出候选动作或动作序列。

闭环模型不是第四种孤立网络，而是把三者放回时间循环：执行一小段动作，读取o_{t+1}，比较预测与事实，再更新状态估计和下一段计划。World Labs的分类把renderer、simulator、planner称为三种功能；本课额外强调“闭环合同”，因为机器人不能把一次长预测当作真实环境，也不能在模型失配后继续盲走。`, formulas: [{ latex: String.raw`o_t\sim p_o(o\mid s_t),\quad s_{t+1}\sim p_s(s\mid s_t,a_t),\quad a_{t:t+H-1}^{*}=\arg\min_{a_{t:t+H-1}}J(\hat s_{t+1:t+H},g)`, explanation: 'po是观测/渲染合同，ps是动作条件状态转移合同，planner用预测轨迹与目标g的代价J选择动作；三个式子的输出不可混称。' }], sourceIds: ['worldTax57'] },
        { heading: '02 Renderer追求“像”，simulator必须支持反事实交互', body: `renderer可以在文本、图像、相机轨迹条件下生成极其逼真的帧，但它的主要消费者是人眼或视觉下游。若把杯子向左推和向右推都生成同一段漂亮视频，它仍可能是好看的renderer，却不是合格的机器人simulator。simulator必须回答反事实：初态相同，只改变动作时，物体位姿、接触、遮挡和传感器读数是否按动作方向改变。

Atlas把文本、图像、相机位姿和深度放入共享空间上下文，公开展示生成、重建和space-time simulation；这支持World Labs向统一空间模型推进。课程仍按官方证据切边界：公开量化重点是相机控制生成和3D重建，不把展示视频自动记成SO-101接触动力学或规划成功率。R2S2R更接近simulator合同，因为它用配对交互、失败区域和策略排序检验sim-real对齐。`, sourceIds: ['atlas57', 'r2s2r57', 'worldTax57'] },
        { heading: '03 Planner把预测变成选择，但会主动寻找模型漏洞', body: `动作条件世界模型给定z_t和候选动作序列A，滚动得到ẑ_{t+1:t+H}；planner以目标latent z_g、碰撞、动作幅度和不确定性组成代价，再用CEM、Nevergrad或梯度法搜索。它不是“让world model直接吐动作”，而是反复查询模型。查询越积极，越可能找到训练分布外、在模型里低代价却在现实中失败的动作。

数值例中，方案A的预测目标误差均值0.10但标准差0.18，方案B均值0.14、标准差0.03。若风险权重λ=0.5，A的风险代价0.19，B为0.155，应该选B；只看均值会选更脆弱的A。误差单位可以是归一化latent距离，但阈值必须由闭环成功标定，不能把0.19解释成19厘米。`, formulas: [{ latex: String.raw`J(A)=\sum_{k=1}^{H}\gamma^{k-1}d(\hat z_{t+k}(A),z_g)+\lambda\sigma(A)+\beta C(A)`, explanation: 'd是目标表征距离，sigma是模型或集成不确定性，C是动作/碰撞约束；λ、β及latent尺度必须在具体任务上校准。' }], sourceIds: ['jepaPaper57', 'jepaPlanner57', 'vjepaPaper57'] },
        { heading: '04 两条研究线关注的合同不同，不能按人物互相归属', body: `李飞飞相关线要分开：Stanford Vision and Learning Lab的BEHAVIOR-1K/OmniGibson提供人类活动、BDDL目标、仿真环境与评测合同；World Labs的Atlas、Marble和R2S2R研究空间生成、重建和aligned simulation。共同点是空间与交互，组织、产物和证据却不同，不能说Atlas是BEHAVIOR模型，也不能用Q-score替Atlas补规划成绩。

LeCun相关线同样要分开：V-JEPA 2/2.1、V-JEPA 2-AC与JEPA-WM代码和实验属于Meta/FAIR历史成果；AMI Labs是当前组织，其公开方向聚焦表征空间预测、动作条件世界模型、可靠性与安全。本课用Meta/FAIR源码解释机制，但不写成AMI已经发布同一checkpoint。对个人项目，最先交付的是可审计接口和反例，而不是“复现某位研究者的路线”口号。`, sourceIds: ['behaviorEval57', 'atlas57', 'vjepaPaper57', 'jepaPaper57', 'ami57'] },
      ],
      points: ['先问模型输出observation、state、latent还是action。', '规划器会优化并放大世界模型误差，必须加入约束、不确定性与重规划。', '组织归属和技术合同都要分开记录。'],
      codeTitle: 'world_contracts.py · 用反事实动作检验simulator合同',
      code: [
        'def rollout(state, actions):',
        '    states=[]',
        '    for action in actions:',
        '        state=state+action',
        '        states.append(state)',
        '    return states',
        '',
        'def plan(state, goal, candidates, risk):',
        '    scored=[]',
        '    for actions, uncertainty in candidates:',
        '        pred=rollout(state, actions)',
        '        cost=(pred[-1]-goal)**2 + risk*uncertainty',
        '        scored.append((cost,actions))',
        '    return min(scored,key=lambda x:x[0])',
        '',
        'candidates=[([0.4,0.4],0.01),([0.6,0.6],0.40),([-0.4,-0.4],0.01)]',
        'cost,actions=plan(0.0,0.8,candidates,risk=0.5)',
        'assert actions==[0.4,0.4] and abs(cost-0.005)<1e-12',
        'left=rollout(0.0,[-0.2])[-1]',
        'right=rollout(0.0,[0.2])[-1]',
        'assert left<0<right',
        'bad=lambda state,actions:[state for _ in actions]',
        'try:',
        '    assert bad(0.0,[-0.2])[-1] != bad(0.0,[0.2])[-1]',
        '    raise AssertionError("action-insensitive model accepted")',
        'except AssertionError: pass',
        'print("world contracts: PASS")',
      ].join('\n'),
      codeNotes: ['rollout只是一维确定性教学simulator，用于突出“动作改变后果”的反事实合同，不代表真实接触动力学。', 'planner显式把终点误差与不确定性相加；真实系统还需关节限位、碰撞、时间和多步代价。', '负例刻意构造忽略动作的伪simulator并拒绝它；代码不连接机械臂或外部数据。'],
      exercise: { prompt: '方案A误差均值0.10、标准差0.18，方案B均值0.14、标准差0.03。若J=均值+λ×标准差，求两方案代价相等时的λ，并判断λ=0.5选择谁。', steps: ['令0.10+0.18λ=0.14+0.03λ。', '解出λ后分别代入0.5。'], solution: '0.15λ=0.04，所以λ≈0.267。λ=0.5时A为0.19，B为0.155，风险厌恶的planner选择B；这不是说B真实一定更好，仍需闭环标定不确定性。' },
      quiz: { question: '为什么“能从相机轨迹生成连续视频”仍不足以称为机器人simulator？', hint: '检查状态、动作反事实和程序可交互性。', keywords: ['observation', 'state', 'counterfactual', 'action conditioning', 'interaction'], reference: '相机轨迹主要控制观察位置，连续像素可以视觉一致却不保证物体状态、接触和动力学正确。机器人simulator至少要让不同动作产生方向正确的反事实状态变化，并暴露可继续计算与交互的状态/观测接口，再以配对交互和闭环结果验证。' },
      sources,
    },
    code: {
      title: '源码精读：从V-JEPA动作条件预测到JEPA-WM目标规划', minutes: 40,
      prerequisites: '会读PyTorch张量shape、Transformer token拼接、因果attention mask、候选轨迹与MPC重规划。',
      connection: '基础课把职责写成数学合同；本课沿固定提交定位真实action predictor、goal encoder、unroll、objective与planner调用链。明天比较像素生成和latent预测时会复用同一接口。',
      intro: 'Meta/FAIR源码把“世界模型会规划”拆成多个可测试部件：encoder把观测变成latent，action-conditioned predictor滚动未来latent，objective计算目标距离，planner优化候选动作，agent只执行计划的一部分再重算。任何一环缺失，都不能用world model这个名字补齐。',
      outcomes: ['定位动作与state如何进入VisionTransformerPredictorAC', '追踪GC_Agent.act到Planner.cost_function的调用链', '运行带shape、动作敏感性和重规划负测试的最小PyTorch夹具'],
      sections: [
        { heading: '01 V-JEPA 2-AC预测的是视觉latent，不是action chunk', body: `固定提交的VisionTransformerPredictorAC.forward接收context视觉token x、actions、states与可选extrinsics。x先经predictor_embed映射宽度；动作与state各自线性编码成每个时间步的条件token，再与H×W个patch token拼接。action-block causal attention mask阻止未来token泄漏，最后删除条件token并把视觉部分投回encoder维度。

因此函数语义是ẑ_{t+1}=P(z_{≤t},a_{≤t},s_{≤t})。输入中的action来自数据或planner候选，输出是动作后果的表示；它既不是BC loss，也不直接给SO-101关节命令。课程最小实现保留这条类型边界，省略图像encoder和Transformer，只用已知线性转移验证接口。`, sourceIds: ['vjepaCode57', 'vjepaPaper57'] },
        { heading: '02 JEPA-WM把预测器包进encode与unroll接口', body: `JEPA-WM固定源码扩展同类predictor，支持token conditioning或把动作特征拼到每个视觉patch，并可加入proprio和相机外参。真正给planner的model还要提供encode(obs, act=True)与unroll(z_init, actions)：前者把当前观测变成规划初态，后者对K条长度H的动作候选滚动未来表示。

接口最重要的不是类名，而是轴语义。源码的planner约定候选动作通常是[T,B,A]，预测是[T,B,…,D]；目标编码带一个目标时间步。若把B和T交换，程序仍可能广播运行，却会把不同候选串成一条时间轨迹。教学夹具选择[K,H,A]并在入口立即断言，再显式转换，避免靠注释猜轴。`, sourceIds: ['jepaPredictor57', 'jepaPlanner57', 'jepaPaper57'] },
        { heading: '03 goal-conditioned agent负责把unroll变成动作选择', body: `GC_Agent.set_goal先对目标图编码，并据配置建立L2、L1或cos目标表征距离；act把当前obs编码后调用plan。Planner.cost_function先执行unroll(z_init, actions)，再把预测表示与候选动作交给objective。Nevergrad、CEM、MPPI、GD和Adam只是搜索器替换，共享“候选—预测—评分”合同。

ReprTargetDistMPCObjective对视觉latent及可选proprio求距离，可只取末步或累积各步。这个距离不是物理单位，也不保证与任务成功单调。论文中特别展示相机/动作校准偏移、模型想象已经抓住物体而真实未抓住，以及梯度规划钻局部极小值；所以源码可运行只证明软件链通，不证明代价语义可靠。`, sourceIds: ['jepaPlanner57', 'jepaPaper57'] },
        { heading: '04 闭环的关键是只执行前缀并用事实覆盖想象', body: `MPC从H步计划中只执行前m步，通常m远小于H；新观测到达后重新encode并规划。若预测误差每步累积，长开环会让ẑ逐渐离开真实z；频繁重规划能纠正观测到的偏差，却增加推理时延，也无法纠正传感器看不到的接触状态。SO-101实验必须同时记录planner耗时、action age与失败类型。

教学代码用一个可解释的latent转移z_{t+1}=z_t+0.8a_t，从三组常量动作候选中选到目标0.8的序列；随后注入外部扰动并重新规划。正测试验证不同动作产生不同latent，负测试拒绝错误horizon和action维。它没有下载checkpoint、运行上游脚本或执行机械臂。`, sourceIds: ['jepaPlanner57', 'jepaPaper57', 'behaviorEval57'] },
      ],
      points: ['predictor的输入含候选action，输出是其latent后果。', 'encode、unroll、objective和optimizer是四个独立可测接口。', 'MPC只执行计划前缀，并以新观测覆盖旧预测。'],
      codeTitle: 'latent_mpc.py · observe→encode→unroll→score→replan',
      code: [
        'import torch',
        '',
        'class LinearLatentWorld:',
        '    def encode(self,obs):',
        '        if obs.ndim!=2 or obs.shape[-1]!=1: raise ValueError("obs must be [B,1]")',
        '        return obs.float()',
        '    def unroll(self,z0,actions):',
        '        if actions.ndim!=3 or actions.shape[-1]!=1: raise ValueError("actions must be [K,H,1]")',
        '        k,h,_=actions.shape',
        '        z=z0.expand(k,1)',
        '        preds=[]',
        '        for step in range(h):',
        '            z=z+0.8*actions[:,step]',
        '            preds.append(z)',
        '        return torch.stack(preds)',
        '',
        'def plan(model,obs,goal,candidates):',
        '    z=model.encode(obs)',
        '    pred=model.unroll(z,candidates)',
        '    cost=(pred[-1]-goal).square().mean(dim=1)',
        '    idx=int(cost.argmin())',
        '    return candidates[idx,0].clone(),cost,pred',
        '',
        'model=LinearLatentWorld()',
        'cand=torch.tensor([[[-.5],[-.5]],[[.2],[.2]],[[.5],[.5]]])',
        'action,cost,pred=plan(model,torch.tensor([[0.0]]),torch.tensor([[0.8]]),cand)',
        'assert torch.allclose(action,torch.tensor([.5]))',
        'assert pred.shape==(2,3,1) and pred[-1,0,0] != pred[-1,2,0]',
        '# 外部扰动后重新观测；不复用旧计划。',
        'action2,_,_=plan(model,torch.tensor([[0.3]]),torch.tensor([[0.8]]),cand)',
        'assert torch.allclose(action2,torch.tensor([.2]))',
        'try:',
        '    model.unroll(torch.tensor([[0.0]]),torch.zeros(3,2))',
        '    raise AssertionError("bad action shape accepted")',
        'except ValueError: pass',
        'print("latent MPC: PASS",float(cost.min()))',
      ].join('\n'),
      codeNotes: ['[K,H,A]轴在入口强校验，内部返回[H,K,D]；这对应源码中候选、时间、动作与latent的分工。', '目标代价只取最后一步平方距离，省略真实JEPA的patch token、proprio、约束、优化迭代和不确定性。', '第二次plan用扰动后的0.3重新encode，验证闭环重规划；全程只做离线张量计算。'],
      exercise: { prompt: '教学模型从z0=0.1出发，候选常量动作0.2、0.4，各执行2步，目标zg=0.75。计算两个终点与平方代价，说明选择结果。', steps: ['用z2=z0+0.8(a0+a1)。', '分别计算(z2-0.75)^2。'], solution: '动作0.2得到z2=0.1+0.8×0.4=0.42，代价0.1089；动作0.4得到z2=0.1+0.8×0.8=0.74，代价0.0001，因此选择0.4。若真实转移系数不是0.8，执行后仍需重规划。' },
      quiz: { question: '在JEPA-WM源码链中，哪一步把“会预测”变成“选动作”，为什么还必须重规划？', hint: '从Planner.cost_function和GC_Agent.act回答。', keywords: ['unroll', 'objective', 'optimizer', 'goal embedding', 'MPC', 'replan'], reference: 'Planner对候选动作调用model.unroll，再用goal embedding objective评分，CEM/Nevergrad/梯度等optimizer搜索最低代价序列，这一步才把预测变成动作选择。模型误差、扰动和部分可观测会让长计划过时，所以只执行前缀，用新观测重新encode和规划。' },
      sources,
    },
    insight: {
      title: '个人项目路线：先证明决策有效，再追求世界生成的华丽度', minutes: 26,
      prerequisites: '掌握基础课的四类合同和代码课的latent MPC调用链；能记录SO-101观测、动作、时间戳、成功与近失。',
      connection: '今天把世界模型拆成可验收部件；明天会比较像素/3D生成与latent预测，后续再进入V-JEPA细节、Atlas/R2S2R和快慢规划。',
      intro: '个人算力下最危险的路线，是先追求生成长视频，再寻找它是否对机器人有用。更高杠杆的顺序是：先定义一个会改变决策的误差或反事实，做离线动作敏感性与排序实验，再决定需要像素decoder、3D simulator还是latent predictor。',
      outcomes: ['为SO-101选择与证据问题匹配的world-model职责', '把RAW/高动态传感经验映射到观测模型与决策收益', '制定离线—仿真—受控真机的晋级门并识别停止条件'],
      sections: [
        { heading: '01 从决策问题倒推模型，不从热门名词倒推任务', body: `若目标是制作新视角演示，renderer即可；若要低成本扩大光照、相机、物体和接触变化，核心是simulator；若要从目标图选择动作，需要action-conditioned predictor加planner；若部署环境会扰动，必须加观测回流、状态估计和重规划。四类交付的训练数据、算力和失败标准完全不同。

对SO-101，第一版不应自训Atlas级模型。可以用已采集episode做小型latent transition probe：固定当前帧，替换动作，检查预测位移方向、夹爪开合和目标距离排序。只有当这个probe优于“复制当前latent”基线，并能在保留集预测哪组动作更接近目标，才值得接CEM或更复杂world model。`, sourceIds: ['worldTax57', 'jepaPaper57', 'jepaPlanner57'] },
        { heading: '02 RAW与多模态价值要落在状态可辨识和决策收益上', body: `用户的RAW、HDR、事件相机或深度经验，不应只服务于更漂亮的重建。它们最可能的价值是降低观测混叠：逆光下RGB把夹爪边缘和黑色物体混在一起，事件流保留高速变化，深度约束几何。应先问这些信号是否让接触前状态、物体位姿或失败前兆更可预测，再问是否改善action ranking。

实验可用同一episode构造RGB与RGB+辅助模态的成对encoder，冻结同一transition head与planner预算。报告一步latent误差、多步漂移、反事实动作可分性，以及最终候选动作排序。若只改善像素重建却不改善排序或闭环，就把它定位为renderer收益，而不是夸成规划能力。传感器不同步造成的伪增益要用时间移位负例排除。`, sourceIds: ['atlas57', 'r2s2r57', 'jepaPaper57'] },
        { heading: '03 用排序一致性决定仿真是否值得，而非要求成功率绝对相同', body: `World Labs R2S2R强调仿真评测要支持与现实相同的工程决策：哪个checkpoint更好、哪些区域会失败、训练改动是否带来真实改进。假设三版策略在仿真成功率为[0.72,0.64,0.55]，真机为[0.60,0.52,0.48]；数值有sim-real gap，但排序完全一致，仿真仍可用于筛选。若排序颠倒，即使平均差只有2个百分点，也可能让团队晋级错误模型。

可把晋级风险写成1减Spearman排序相关，再加失败区域不一致率和未校准安全事件。示例ρ=1、失败区域不一致0.10、安全漏报0时，取权重0.5/0.3/0.2得到R=0.03；若ρ=-0.5，其余不变，R升到0.78，应停止把仿真当筛选器。小样本相关性不稳定，必须同时给具体任务和置信区间。`, formulas: [{ latex: String.raw`R=0.5(1-\rho_{\mathrm{rank}})+0.3e_{\mathrm{region}}+0.2e_{\mathrm{safety}}`, explanation: 'rho_rank衡量仿真与真机的策略排序一致性，e_region是失败区域不一致比例，e_safety是仿真漏掉的安全事件比例；权重是教学假设而非官方阈值。' }], sourceIds: ['r2s2r57', 'behaviorEval57'] },
        { heading: '04 三阶段证据门把两条研究线接回个人工程', body: `阶段一完全离线：固定数据split，做动作置乱、时间移位、零动作和相反动作负例，要求预测对真实动作敏感且对错配动作变差。阶段二在仿真或回放中：相同候选集、相同预算比较planner，记录目标距离、约束违反、p99耗时和失败区域；StanfordVL的BEHAVIOR/OmniGibson可提供任务与评测语言，World Labs材料提供空间仿真与sim-real排序问题，但两者不混属。

阶段三才是经人工安全评审的低速受控真机试验，本自动化不执行。Meta/FAIR的JEPA机制可作为latent predictor与planner参考；AMI方向用于持续关注可靠性和安全，不冒充现成SO-101模型。停止条件包括：动作置乱不降分、长rollout优于一步却不改善排序、planner频繁选择边界动作、仿真排序与真机不一致，或收益不足以覆盖额外时延和维护成本。`, sourceIds: ['behaviorEval57', 'r2s2r57', 'vjepaPaper57', 'jepaPaper57', 'ami57'] },
      ],
      points: ['先选要改善的决策，再选择renderer、simulator或planner。', '多模态收益必须穿过状态可辨识、动作排序和闭环三道门。', '仿真最重要的不是绝对数字相同，而是支持正确晋级决策。'],
      codeTitle: 'ranking_gate.py · 用仿真—真机排序决定能否筛选策略',
      code: [
        'def ranks(values):',
        '    order=sorted(range(len(values)),key=lambda i:values[i])',
        '    out=[0]*len(values)',
        '    for rank,i in enumerate(order): out[i]=rank+1',
        '    return out',
        '',
        'def spearman(a,b):',
        '    if len(a)!=len(b) or len(a)<2: raise ValueError("need paired policies")',
        '    ra,rb=ranks(a),ranks(b)',
        '    d2=sum((x-y)**2 for x,y in zip(ra,rb))',
        '    n=len(a)',
        '    return 1-6*d2/(n*(n*n-1))',
        '',
        'def risk(sim,real,region_error,safety_miss):',
        '    rho=spearman(sim,real)',
        '    return .5*(1-rho)+.3*region_error+.2*safety_miss,rho',
        '',
        'good,rho=risk([.72,.64,.55],[.60,.52,.48],.10,0.0)',
        'assert rho==1.0 and abs(good-.03)<1e-12',
        'bad,rho_bad=risk([.72,.64,.55],[.48,.52,.60],.10,0.0)',
        'assert rho_bad==-1.0 and bad>good',
        'try:',
        '    spearman([.5],[.4])',
        '    raise AssertionError("single-policy ranking accepted")',
        'except ValueError: pass',
        'print("simulation ranking gate: PASS")',
      ].join('\n'),
      codeNotes: ['示例把较大成功率视为更好，ranks只处理无并列的小样本；正式统计要处理ties并给bootstrap区间。', '风险函数权重用于展示多指标硬门，不是World Labs、BEHAVIOR或Meta的官方公式。', '负例把真机排序完全反转并拒绝单策略相关；代码不运行仿真器或真机。'],
      exercise: { prompt: '三版策略的仿真分数排序为A>B>C，真机为B>A>C。指出只看仿真绝对成功率的风险，并给出下一步最小复核。', steps: ['列出发生交换的策略对A/B。', '固定任务实例、动作与评测预算复跑A/B。', '检查失败区域、置信区间和sim-real观测/动作契约。'], solution: '仿真会把A错误晋级在B之前，说明它尚不能支持该二选一决策。下一步不必重做所有模型：在相同实例与随机种子上增加A/B真机和仿真重复，核对相机、动作反归一化与失败区域；若交换超出不确定区间，应暂停用仿真筛选。' },
      quiz: { question: '对RAW或深度模态，什么证据才能把“重建更清楚”升级为“规划更有效”？', hint: '至少跨过动作反事实、排序与闭环。', keywords: ['observability', 'counterfactual', 'action ranking', 'time shift', 'closed loop'], reference: '需要在同数据和同planner预算下证明辅助模态降低任务相关状态歧义，使不同动作的预测后果更可分、候选动作排序更接近真实结果，并最终改善闭环成功或降低近失；还要用时间移位、缺失模态和置乱负例排除泄漏。像素重建更清晰本身只支持renderer收益。' },
      sources,
    },
  },
};
