import type { AuthoredDay } from './types';

const vjepaCommit = '204698b45b3712590f06245fbfba32d3be539812';
const vjepaRoot = 'https://github.com/facebookresearch/vjepa2/blob/' + vjepaCommit;
const jepaWmCommit = '13cf1d9c7e476f53c17714d2e0f1dc239a883ce0';
const jepaWmRoot = 'https://github.com/facebookresearch/jepa-wms/blob/' + jepaWmCommit;

const sources = [
  { id: 'vjepaPaper60', label: 'Meta/FAIR · V-JEPA 2论文', url: 'https://arxiv.org/html/2506.09985v1', reading: '2026-10-28 实读§3—4与附录B：冻结V-JEPA 2 encoder后，以约62小时DROID遥操作轨迹训练300M动作条件predictor；模型按action、end-effector state和历史视觉latent自回归预测下一帧表征，再以图像目标能量做MPC。论文同时明确固定外部相机、坐标轴隐式推断、长时规划与图像目标歧义的限制。' },
  { id: 'vjepaOfficial60', label: 'Meta AI · Introducing V-JEPA 2', url: 'https://ai.meta.com/research/vjepa/', reading: '2026-10-28 核对官方能力与归属：自然视频自监督预训练和机器人动作条件后训练是两个阶段；Franka零样本规划使用目标图与DROID后训练，不等于无动作V-JEPA 2直接输出机器人动作。' },
  { id: 'vjepaPredictor60', label: 'V-JEPA 2-AC predictor（固定提交）', url: vjepaRoot + '/src/models/ac_predictor.py', reading: '2026-10-28 精读VisionTransformerPredictorAC.__init__/forward：predictor_embed映射视觉token，action_encoder/state_encoder及可选extrinsics_encoder生成每时刻条件token；build_action_block_causal_attention_mask限制未来信息，最后删除条件token并投影视觉token，返回future latent而非action。' },
  { id: 'jepaWmPaper60', label: 'Meta/FAIR · JEPA-WM论文v4', url: 'https://arxiv.org/html/2512.24497v4', reading: '2026-10-28 实读训练、规划、消融与附录C：论文比较多步rollout、predictor结构、proprioception、encoder和CEM/Nevergrad/梯度规划；复现审计指出V-JEPA 2-AC官方训练链的2-step rollout loss计算问题，并显示解码视觉相近不保证规划分数相近。' },
  { id: 'jepaPredictor60', label: 'JEPA-WM action predictor（固定提交）', url: jepaWmRoot + '/src/models/ac_predictor.py', reading: '2026-10-28 复读VisionTransformerPredictorAC与concat_obs_act：支持token/feature动作条件、可选proprioception和extrinsics；action-block causal mask保持时间因果，预测对象仍是视觉/状态embedding。' },
  { id: 'jepaAgent60', label: 'JEPA-WM goal-conditioned agent（固定提交）', url: jepaWmRoot + '/evals/simu_env_planning/planning/gc_agent.py', reading: '2026-10-28 精读GC_Agent.set_goal/plan/act：目标先经model.encode并构造L2、L1或cosine objective；当前观测经encode后交给planner，planner调用unroll，返回动作序列；源码注释明确encode与unroll只在agent接口处相接。' },
  { id: 'jepaPlanner60', label: 'JEPA-WM planner（固定提交）', url: jepaWmRoot + '/evals/simu_env_planning/planning/planning/planner.py', reading: '2026-10-28 联读Planner.cost_function及CEM/Nevergrad/Adam/GD实现：候选动作先经world model unroll，objective对预测表示与goal表示评分；MPC只执行前m个动作后重规划，optimizer不是世界模型本身。' },
  { id: 'jepaObjective60', label: 'JEPA-WM planning objectives（固定提交）', url: jepaWmRoot + '/evals/simu_env_planning/planning/planning/objectives.py', reading: '2026-10-28 精读ReprTargetDistMPCObjective及L1/cos变体：视觉与可选proprio距离按配置聚合，可取终点或轨迹；embedding距离无物理单位，必须以闭环成功、校准与安全指标验证。' },
  { id: 'behaviorEval60', label: 'StanfordVL · BEHAVIOR 2026 Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '2026-10-28 复核BDDL目标、Q-score、隐藏实例、单次rollout与时间预算；它可约束闭环评测和任务状态，不提供V-JEPA/JEPA-WM模型，也不归World Labs。' },
  { id: 'ami60', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '2026-10-28 核对当前官方表述：AMI研究抽象表征空间预测、动作条件world model、规划与安全护栏；本课论文、源码和实验仍属于Meta/FAIR历史成果，不能改署为AMI已发布模型。' },
  { id: 'atlas60', label: 'World Labs · Atlas', url: 'https://www.worldlabs.ai/blog/atlas', reading: '2026-10-28 复核World Labs以文本、图像、相机位姿和深度构成共享空间上下文并生成多模态输出；这是下一日空间生成/仿真主题，不是本课latent planner的源码或实验结果。' },
];

export const day60: AuthoredDay = {
  reviewedAt: '2026-10-28',
  revision: '逐课编写 1.0',
  deliverable: '一张V-JEPA 2-AC与JEPA-WM的encoder→action-conditioned predictor→goal objective→optimizer→MPC闭环图；一个验证多步latent rollout、候选排序和扰动后重规划的原创PyTorch夹具；一份SO-101坐标、相机、动作与安全适配门。三课共100分钟，另留20分钟复盘。',
  question: {
    title: '动作条件世界模型预测得像，为什么仍可能规划失败？',
    summary: '预测表象、动作敏感性、目标代价与搜索闭环是四份不同证据。',
    keywords: ['action-conditioned', 'latent rollout', 'goal energy', 'MPC', 'calibration', 'counterfactual'],
    reference: '动作条件模型首先要让同一初态下的不同动作产生方向正确的latent后果；随后goal energy必须与真实任务进展单调，optimizer不能钻训练分布外漏洞，坐标、相机与动作单位还要一致。视觉解码相近只说明预测可视化相似，不保证目标距离能排序候选。可靠链条需要反事实动作测试、多步误差、校准扰动、只执行计划前缀、用新观测重规划，以及真实闭环成功/近失验证。',
  },
  lessons: {
    foundation: {
      title: 'V-JEPA 2-AC与JEPA-WM：从动作条件预测到目标规划', minutes: 35,
      prerequisites: '理解10月29日的dense/context表征、冻结encoder probe，并能区分视觉latent、机器人state和物理action。',
      connection: '昨天回答了哪些局部物理量能从V-JEPA 2/2.1表征读出；今天把动作显式送入future predictor并讨论怎样由目标图选择动作。明天转向World Labs Atlas/R2S2R，比较空间生成、重建和aligned simulation的不同证据。',
      intro: '动作条件world model不是“看视频猜下一帧”的换名，而是对反事实负责：同一观测下改变动作，预测后果也必须按正确方向改变。规划再把这种后果模型当作可查询函数，搜索一段动作并只执行前缀；任何一层类型混淆，都会把漂亮预测误写成可靠控制。',
      outcomes: ['推导动作条件latent rollout与多步训练目标', '区分world model、goal objective、optimizer和MPC执行器', '用数值例解释为什么低一步误差不保证候选动作排序正确'],
      sections: [
        { heading: '01 无动作表征先冻结，动作后果由新的predictor学习', body: `V-JEPA 2先用互联网图像/视频学习视觉表征，不包含DROID动作。V-JEPA 2-AC阶段冻结encoder E，把每个观测o_t编码成z_t，再训练动作条件predictor P接收历史视觉latent、末端状态s_t和动作a_t，预测下一时刻target-encoder表征。这样大规模观察数据负责“什么视觉变化重要”，少量交互数据负责“动作怎样改变它”。

论文的具体实例是固定外部单目相机、Franka Panda和末端笛卡尔命令；不能把7维DROID输入直接解释成SO-101六个舵机读数。encoder冻结也不是永恒原则：它降低小交互数据过拟合，却把所有可规划信息上限锁在预训练表征内。昨天的dense probe正是进入动作后训练前的验收门。`, formulas: [{ latex: String.raw`z_t=E(o_t),\qquad \hat z_{t+1}=P_\phi(z_{\le t},s_{\le t},a_{\le t})`, explanation: 'E是冻结视觉encoder；P以历史latent、proprioception和动作预测下一视觉latent。输出不是动作，动作是条件输入。' }], sourceIds: ['vjepaPaper60', 'vjepaOfficial60', 'vjepaPredictor60'] },
        { heading: '02 一步teacher forcing与多步rollout回答不同问题', body: `一步训练把真实z_t送给predictor，只测局部转移；规划却把自己的ẑ再次送回模型，误差会累积。多步目标从z_t开始，连续吃入真实动作a_t…a_{t+H-1}，比较每一步预测与target latent。若训练实现不慎把真实下一latent或错误的预测步拼回上下文，loss可能下降却没有教会真实rollout。

JEPA-WM论文v4的复现实验特别指出，V-JEPA 2-AC官方结果所用代码中的2-step项计算有问题；修复模型在规划分数上明显不同，但解码图仍可能看起来相近。课程将它作为“软件合同必须用数值夹具验证”的证据，而不是简单宣布原论文全部无效。需要固定提交、明确目标索引，并逐步断言rollout长度和梯度来源。`, formulas: [{ latex: String.raw`\mathcal L_H=\frac{1}{H}\sum_{k=1}^{H}d\!\left(\hat z_{t+k},\operatorname{sg}(E(o_{t+k}))\right),\quad \hat z_{t+k}=P_\phi(\hat z_{t+k-1},s_{t+k-1},a_{t+k-1})`, explanation: 'H步预测把上一步预测继续滚动；sg表示target encoder不从此损失反传。d可为L1、L2等，但训练距离与规划距离仍需分别验证。' }], sourceIds: ['vjepaPaper60', 'jepaWmPaper60'] },
        { heading: '03 目标图通过能量函数排序动作，不是直接监督policy', body: `给定当前观测与目标图，encoder得到z_t与z_g。planner提出K条长度H的动作候选，world model分别unroll，objective以末步或整段latent到z_g的距离评分，CEM、Nevergrad或梯度法再更新候选。模型没有直接输出“最佳动作”；它回答每个候选可能导致什么，optimizer负责选。

数值例：候选A预测终点与目标距离0.12、动作惩罚0.02、校准风险0.10；候选B分别0.16、0.01、0.01。若风险权重λ=0.5，A总成本0.19，B为0.175，应选B。latent距离没有米或成功概率单位；只有在固定任务上证明距离排序与真实进展相关，数值才可用于决策。`, formulas: [{ latex: String.raw`A^*=\arg\min_A\left[d(\hat z_{t+H}(A),z_g)+\beta\sum_{k=0}^{H-1}\lVert a_{t+k}\rVert_2^2+\lambda r_{\mathrm{cal}}(A)\right]`, explanation: '第一项是目标表征距离，第二项限制动作幅度，第三项表示相机/坐标校准风险。beta与lambda是任务参数，不是论文通用常数。' }], sourceIds: ['vjepaPaper60', 'jepaWmPaper60', 'jepaAgent60', 'jepaObjective60'] },
        { heading: '04 MPC用新观测覆盖旧想象，限制仍来自相机和目标', body: `MPC只执行计划前m步，m≤H；随后读取新观测、重新encode和优化。频繁重规划能纠正可见误差，却不能自动修复不可见接触、错误相机外参或目标图歧义。V-JEPA 2-AC论文报告相机位置会改变隐式推断的动作坐标轴，长时规划误差累积，单张goal image也未必说明夹爪姿态和接触方式。

SO-101适配必须先写清a是关节位置差、末端位姿差还是归一化动作，再把相机位姿、控制频率、horizon与安全限幅写进manifest。StanfordVL的BEHAVIOR可提供目标谓词和闭环评分；World Labs Atlas属于另一条空间生成/仿真路线。Meta/FAIR成果与AMI当前方向保持技术连续但组织分开，不能用人物归属替代机制证据。`, sourceIds: ['vjepaPaper60', 'behaviorEval60', 'atlas60', 'ami60'] },
      ],
      points: ['动作是predictor条件，future latent是输出，planner才把后果变成选择。', '多步rollout必须验证反馈的是预测而非错误teacher forcing。', 'MPC、相机坐标和目标语义共同决定闭环，不由视觉解码质量单独保证。'],
      codeTitle: 'latent_rollout_contract.py · 多步预测与目标排序夹具',
      code: [
        'import torch',
        '',
        'def rollout(z0,actions,gain=.8):',
        '    if actions.ndim!=3 or actions.shape[-1]!=1: raise ValueError("actions must be [K,H,1]")',
        '    z=z0.expand(actions.shape[0],1).clone()',
        '    out=[]',
        '    for step in range(actions.shape[1]):',
        '        z=z+gain*actions[:,step]',
        '        out.append(z)',
        '    return torch.stack(out,dim=1)',
        '',
        'def choose(z0,goal,candidates,risk):',
        '    pred=rollout(z0,candidates)',
        '    cost=(pred[:,-1]-goal).square().squeeze(-1)+risk',
        '    return int(cost.argmin()),cost',
        '',
        'candidates=torch.tensor([[[.5],[.5]],[[.35],[.35]],[[-.5],[-.5]]])',
        'idx,cost=choose(torch.tensor([[0.]]),torch.tensor(0.8),candidates,torch.tensor([.20,.01,.01]))',
        'assert idx==1 and rollout(torch.tensor([[0.]]),candidates).shape==(3,2,1)',
        'assert rollout(torch.tensor([[0.]]),candidates)[0,0]!=rollout(torch.tensor([[0.]]),candidates)[2,0]',
        '',
        'try:',
        '    rollout(torch.zeros(1,1),torch.zeros(2,3,2))',
        '    raise AssertionError("wrong action dimension accepted")',
        'except ValueError: pass',
        'print("latent rollout contract: PASS",idx,cost.tolist())',
      ].join('\n'),
      codeNotes: ['一维线性latent只保留动作条件、多步反馈和候选排序合同，不复刻ViT或真实机器人动力学。', '风险项让终点几乎完美但高风险的候选不一定获胜；真实风险需来自校准/不确定性证据。', '负例拒绝错误动作维度；脚本只运行离线张量，不连接机械臂。'],
      exercise: { prompt: 'z0=0，模型增益0.8，候选A为两步[0.5,0.5]、候选B为[0.4,0.4]，目标zg=0.75。只用终点平方误差时选谁？若A另有0.03校准惩罚，结果是否变化？', steps: ['分别滚动两步求终点。', '计算与0.75的平方误差。', '再给A加0.03。'], solution: 'A终点0.8，误差0.0025；B终点0.64，误差0.0121，所以无风险项选A。A加0.03后总成本0.0325，高于B的0.0121，改选B。风险项不是随意惩罚，必须有相机/坐标或模型不确定性依据。' },
      quiz: { question: '为什么多步预测图看起来合理，仍不能证明planner会选对动作？', hint: '检查目标距离、候选排序和搜索分布。', keywords: ['multi-step', 'objective', 'ranking', 'optimizer', 'OOD action'], reference: '可视化只说明某些轨迹的预测外观合理；planner需要goal objective在大量候选上保持正确排序，optimizer还会主动寻找训练分布外的低代价漏洞。应做同初态动作反事实、真实排序相关性、约束和闭环MPC测试。' },
      sources,
    },
    code: {
      title: '源码精读：条件token、因果mask、goal agent与planner调用链', minutes: 40,
      prerequisites: '会读[B,T,N,D]、action/state token拼接、因果attention mask、候选动作[K,H,A]和PyTorch广播。',
      connection: '基础课给出了训练与规划公式；本课沿固定提交把公式落到VisionTransformerPredictorAC、GC_Agent、Planner和Objective四层。下一课的Atlas没有公开同等级源码，因此会用明确的官方接口事实与OmniGibson传感器源码做可审计对照。',
      intro: '“源码里有action”还不够，必须追踪action在什么轴上被编码、哪些视觉token能看见它、返回值是否仍是latent，以及goal objective怎样被planner调用。真实调用链把容易混写的四个角色拆成可单测接口。',
      outcomes: ['定位V-JEPA 2-AC的action/state/extrinsics token和视觉输出', '追踪GC_Agent.set_goal→act→plan→Planner.plan→unroll/objective', '运行可检测未来动作泄漏、轴交换和计划过期的最小夹具'],
      sections: [
        { heading: '01 VisionTransformerPredictorAC把每时刻条件token插在patch前', body: `固定提交的__init__建立predictor_embed、action_encoder、state_encoder和可选extrinsics_encoder；forward先把[B,N,D_enc]视觉token投到predictor宽度，按N/(H×W)恢复T，再把动作与state各unsqueeze成每时刻一个token。使用外参时每步是[a,s,e,patches]，否则是[a,s,patches]。

经过predictor blocks后，源码把[B,T,K+H×W,D]中的前K个条件token删除，只保留视觉token，norm并project回encoder维。返回类型因此是[B,T×H×W,D_enc]的预测视觉表示。若下游把它当[A]动作向量，即使维度碰巧相等也是类型错误。`, sourceIds: ['vjepaPredictor60'] },
        { heading: '02 action-block causal mask阻止未来动作替过去作弊', body: `build_action_block_causal_attention_mask按时间块构造可见性：时刻t的视觉patch可以读取当前及过去的action/state/patch，不能读取t+1条件。forward还按实际序列长度切片self.attn_mask并传给每个ACBlock。没有这层约束，训练时一次放入整段动作会让早期预测偷看未来命令，离线loss虚低。

mask正确性不能只检查三角矩阵形状；要用带时间身份的小张量，改变未来动作时断言过去输出不变，改变当前动作时断言当前/未来输出变化。课程代码用累积和表示最简因果predictor，并提供故意全序列求和的负例。`, sourceIds: ['vjepaPredictor60', 'vjepaPaper60'] },
        { heading: '03 GC_Agent把goal编码、objective和planner装配起来', body: `GC_Agent.set_goal把goal_state加batch维，经model.encode(act=False)得到goal_state_enc，再按配置创建L2、L1或cosine objective并交给planner。act把当前obs移到设备、加batch维，以model.encode(obs,act=True)得到z，然后调用plan；plan只转交给planner并保存loss、elite统计和预测可视化。

这条链说明agent没有通过一个神秘forward同时完成所有工作。model负责encode/unroll，objective负责把预测与goal比较，planner负责搜索，agent负责生命周期。源码注释甚至提醒encode与unroll的合同只在这里相遇；shape、预处理或模态不一致会在规划端放大。`, sourceIds: ['jepaAgent60', 'jepaPlanner60', 'jepaObjective60'] },
        { heading: '04 规划器可替换，但候选预算与执行前缀必须可比', body: `JEPA-WM源码提供CEM、Nevergrad、MPPI、GD和Adam等planner。论文比较时控制并行候选和总预算；不同搜索器若评估次数、初始化或action clip不同，不能把差异归给world model。cost_function统一调用unroll后交给objective，保持模型与搜索器分层。

MPC模式只执行推荐序列前m步，再用新观测重算。工程实现必须给计划绑定observation版本和时间戳；若慢planner返回时相机已更新，旧计划即使cost低也要拒绝。原创夹具把plan_version与obs_version显式比较，展示过期拒绝，不模拟真实控制。`, sourceIds: ['jepaPlanner60', 'jepaWmPaper60'] },
      ],
      points: ['条件token进入predictor，返回值仍是视觉latent。', '因果mask要用未来动作置换测试，而非只看矩阵形状。', 'goal agent、objective、optimizer和执行前缀各自有独立合同。'],
      codeTitle: 'causal_plan_contract.py · 未来泄漏与过期计划负测试',
      code: [
        'import torch',
        '',
        'def causal_predict(actions):',
        '    if actions.ndim!=3: raise ValueError("expected [B,T,A]")',
        '    return actions.cumsum(dim=1)',
        '',
        'def leaking_predict(actions):',
        '    return actions.sum(dim=1,keepdim=True).expand_as(actions)',
        '',
        'base=torch.tensor([[[1.],[2.],[3.]]])',
        'changed=base.clone(); changed[:,2]=30.',
        'good1,good2=causal_predict(base),causal_predict(changed)',
        'assert torch.equal(good1[:,:2],good2[:,:2]) and good1[:,2]!=good2[:,2]',
        'assert not torch.equal(leaking_predict(base)[:,:2],leaking_predict(changed)[:,:2])',
        '',
        'def accept_plan(plan_version,obs_version):',
        '    if plan_version!=obs_version: raise RuntimeError("stale plan")',
        '    return True',
        'assert accept_plan(7,7)',
        'try:',
        '    accept_plan(6,7)',
        '    raise AssertionError("stale plan accepted")',
        'except RuntimeError: pass',
        'print("causal plan contract: PASS")',
      ].join('\n'),
      codeNotes: ['cumsum是因果信息流的教学替身，不实现attention、RoPE或官方权重。', '正例只改变最后动作，前两步预测保持不变；负模型用全序列和，显示未来泄漏。', '版本门只表达旧观测计划必须拒绝；真实系统还需时间预算、安全限幅与急停。'],
      exercise: { prompt: '一个序列含T=4，每步256个patch，加action/state两个条件token，predictor序列长度是多少？若启用extrinsics又是多少？说明为什么输出长度回到4×256。', steps: ['按每时刻patch+条件token相乘。', '分别取2和3个条件token。', '阅读forward末尾删除条件token的逻辑。'], solution: '无外参时长度4×(256+2)=1032；有外参时4×(256+3)=1036。blocks后reshape并切掉每时刻前2或3个条件token，只保留视觉patch，所以输出为4×256=1024个latent token。' },
      quiz: { question: 'GC_Agent.set_goal为什么不能直接把原始goal图交给L2 objective？', hint: '比较当前预测和goal必须在同一表示与预处理合同中。', keywords: ['encode', 'goal embedding', 'preprocess', 'objective', 'same space'], reference: 'planner的预测是world model embedding，原始像素与其维度、尺度和语义不同；set_goal先用同一model/preprocessor编码并detach，objective才能比较同空间表示。即使同空间，距离与任务成功的单调性仍需验证。' },
      sources,
    },
    insight: {
      title: '路线洞察：把JEPA规划接到SO-101前，先过坐标—动作—闭环三道门', minutes: 25,
      prerequisites: '能列出SO-101相机、关节状态、policy action、sent action、时间戳和任务成功谓词；理解离线验证不能替代现场安全评审。',
      connection: '前两课说明latent planner如何训练和运行；路线课把论文中的Franka/单目假设翻译成SO-101适配证据。明天会把相机位姿、深度和真实场景重建扩展为Atlas/R2S2R空间上下文。',
      intro: '个人项目最危险的捷径，是看到“zero-shot robot planning”便把checkpoint接到另一台机械臂。正确路线先证明坐标可辨、动作可逆映射、目标距离可排序，再在安全门内比较闭环；任何一项失败，都应停在离线层。',
      outcomes: ['设计相机方位与坐标旋转反事实测试', '建立Franka末端动作到SO-101动作空间的显式适配合同', '用最弱项和安全约束决定是否进入受控真机'],
      sections: [
        { heading: '01 相机不是无关外观，可能决定动作轴的含义', body: `V-JEPA 2-AC没有显式相机标定时，要从单目画面推断笛卡尔动作轴；论文显示改变相机绕机器人方位会产生动作方向误差。对SO-101至少要采集同一静止场景的已知小位移离线片段，比较相机位姿、图像位移与关节/末端真值，确认“向左”的视觉变化对应哪个控制轴。

测试应包含相机轻微平移、旋转、裁剪和遮挡，并把预期写在执行前。若旋转相机30°后planner仍输出未旋转动作，说明它绑定了训练视角；不能靠更大安全clip掩盖坐标错配。Atlas/深度可在下一日帮助提供显式空间上下文，但仍需标定。`, formulas: [{ latex: String.raw`\begin{bmatrix}\Delta x_c\\\Delta y_c\end{bmatrix}=\begin{bmatrix}\cos\theta&-\sin\theta\\\sin\theta&\cos\theta\end{bmatrix}\begin{bmatrix}\Delta x_b\\\Delta y_b\end{bmatrix}`, explanation: '二维简化表示基座坐标到相机平面的旋转；真实系统还含3D外参、透视、深度和机械臂运动学。' }], sourceIds: ['vjepaPaper60', 'atlas60'] },
        { heading: '02 动作适配器必须同时定义单位、频率和可逆检查', body: `DROID/Franka示例使用末端笛卡尔增量与夹爪；SO-101可用关节目标或经运动学得到的末端动作。适配器需声明输入[A_src]、输出[A_dst]、单位、正方向、控制周期、归一化统计和不可达处理，并离线验证正向映射后通过FK回到期望末端变化。

动作维度相同也不代表语义相同。两个7维向量可能分别是xyz+旋转+gripper与六关节+gripper。映射误差应和机械臂工作空间、安全限位及雅可比分区一起报告；若逆运动学多解或奇异，planner objective还需惩罚不可执行解。课程不运行IK或机械臂，只定义验证数据。`, sourceIds: ['vjepaPaper60', 'jepaWmPaper60'] },
        { heading: '03 目标图距离要经过任务谓词和反事实排序校准', body: `单张目标图可能允许多个姿态，也可能看不见夹爪是否真正夹住。先在授权离线轨迹上建立成对排序：对同一初态的成功/失败后缀，goal energy是否把成功排在失败前；再加入背景、光照和相机扰动，确认无关变化不会翻转排序。只有排序可靠，才谈optimizer。

StanfordVL BEHAVIOR的BDDL谓词和Q-score可作为“任务到底完成什么”的结构化参考，但SO-101任务需另写本地可观测成功标准。不要把图像相似度当成抓取事实；接触、夹爪状态和物体位姿需要独立信号。World Labs与BEHAVIOR分别提供空间仿真和任务评测思路，组织与证据不可混同。`, sourceIds: ['behaviorEval60', 'atlas60', 'jepaWmPaper60'] },
        { heading: '04 用最弱项门阻止平均分掩盖安全缺口', body: `把坐标一致性q_coord、动作映射q_action、goal排序q_rank、受控闭环q_loop归一化到[0,1]，并另设硬安全条件S。候选[0.92,0.88,0.81,0.62]平均很高，最弱项只有0.62；即使阈值0.75，也不能进入更高权限真机。安全违规一项非零时，无论G多高都拒绝。

个人算力先做冻结encoder、小predictor或公开checkpoint的离线回放；如果坐标和goal排序不过门，就停止，不用扩大候选预算。只有离线反事实、延迟预算、过期计划拒绝和现场安全评审都完成，才由用户另行授权受控实验。本自动化不代打卡、不控制机械臂、不上传客户数据。`, formulas: [{ latex: String.raw`G=\min(q_{\mathrm{coord}},q_{\mathrm{action}},q_{\mathrm{rank}},q_{\mathrm{loop}}),\qquad \mathrm{promote}=\mathbb 1[G\ge\tau]\,\mathbb 1[S=\mathrm{pass}]`, explanation: '最弱项门与安全硬门不能用平均分补偿；tau需由任务风险和样本证据设定，0.75仅为教学例。' }], sourceIds: ['vjepaPaper60', 'jepaWmPaper60', 'behaviorEval60'] },
      ],
      points: ['相机方位可能改变隐式动作轴，必须做旋转反事实。', '动作适配器要定义物理语义，不以维度相等替代验证。', 'goal排序、MPC闭环和安全硬门缺一不可。'],
      codeTitle: 'jepa_deployment_gate.py · 坐标与闭环最弱项门',
      code: [
        'def gate(metrics,safety,threshold=.75):',
        '    required=("coordinate","action_map","goal_rank","closed_loop")',
        '    if set(metrics)!=set(required): raise ValueError("incomplete evidence")',
        '    if any(not 0<=metrics[k]<=1 for k in required): raise ValueError("score range")',
        '    weakest=min(required,key=lambda k:metrics[k])',
        '    score=metrics[weakest]',
        '    return score,weakest,(score>=threshold and safety)',
        '',
        'candidate={"coordinate":.92,"action_map":.88,"goal_rank":.81,"closed_loop":.62}',
        'score,weakest,ok=gate(candidate,True)',
        'assert (score,weakest,ok)==(.62,"closed_loop",False)',
        'strong={k:.82 for k in candidate}',
        'assert gate(strong,True)[2] is True and gate(strong,False)[2] is False',
        '',
        'try:',
        '    gate({"coordinate":.9,"action_map":.9,"goal_rank":.9},True)',
        '    raise AssertionError("missing closed-loop evidence accepted")',
        'except ValueError: pass',
        'print("JEPA deployment gate: PASS",score,weakest)',
      ].join('\n'),
      codeNotes: ['分数是教学输入；真实记录需带原始单位、样本数、置信区间和失败清单。', '硬安全门False会拒绝四项均高的候选，避免把风险平均掉。', '脚本只做离线决策审核，不连接相机、串口或机器人。'],
      exercise: { prompt: '候选A四项为[0.80,0.78,0.77,0.76]且安全通过，候选B为[0.90,0.90,0.90,0.90]但出现一次越界。阈值0.75时谁可晋级？', steps: ['分别取最弱项。', '再单独检查安全硬门。', '说明B为何不能用高平均分补偿。'], solution: 'A的G=0.76且安全通过，可进入下一层受控测试；B的G=0.90，但安全硬门失败，所以拒绝。一次越界需要根因、回归和重新评审，高表征/排序分数不能补偿物理风险。' },
      quiz: { question: '把Franka的7维动作直接送给SO-101，只验证shape为什么不够？', hint: '动作轴、单位、控制频率和执行器语义可能完全不同。', keywords: ['action semantics', 'units', 'frame', 'frequency', 'adapter'], reference: '7维可能是末端xyz/旋转/夹爪，也可能是关节/夹爪；坐标系、单位、正方向、归一化和控制周期都可能不同。必须通过显式适配器、FK/IK离线回放、限位与安全门验证，而不是只让张量维度通过。' },
      sources,
    },
  },
};
