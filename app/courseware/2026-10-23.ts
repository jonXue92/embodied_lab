import type { AuthoredDay } from './types';

const commit = '4eb34b7693a0565c67433f8fac9c59a2e67eb60b';
const root = 'https://github.com/Robbyant/lingbot-vla/blob/' + commit;

const sources = [
  { id: 'paper53', label: 'LingBot-VLA技术报告', url: 'https://arxiv.org/abs/2601.18692', reading: '2026-10-20 实读第3节架构与公式(1)—(4)、深度蒸馏和第5.4节吞吐实验：三视角/文本/状态条件下以Flow Matching生成50步动作块；261 samples/s来自8卡、Libero、统一local batch 32协议，摘要与正文的每卡/集群口径存在歧义。' },
  { id: 'readme53', label: 'Robbyant · LingBot-VLA README（固定提交）', url: root + '/README.md', reading: '2026-10-20 实读LeRobot v3迁移、无深度/深度版checkpoint、RoboTwin与真机后训练命令：深度版训练需要MoGe-2与LingBot-Depth教师；公开推理仍以相机、语言和状态为条件。' },
  { id: 'model53', label: 'modeling_lingbot_vla.py（固定提交）', url: root + '/lingbotvla/models/vla/pi0/modeling_lingbot_vla.py', reading: '2026-10-20 逐段实读LingbotVlaPolicy.forward、FlowMatching.embed_prefix/embed_suffix/forward/sample_actions/predict_velocity、depth_emb_forward：核对flow方向、KV cache、Euler积分、joint_mask与未实际使用的action_is_pad。' },
  { id: 'config53', label: 'real_load20000h_depth.yaml（固定提交）', url: root + '/configs/vla/real_load20000h_depth.yaml', reading: '2026-10-20 实读三相机、双臂/夹爪字段、FSDP2、torch.compile、micro batch 32、8卡全局batch 256、40000步与depth_loss_weight=0.004；这是官方推荐配置，不是SO-101单卡最低要求。' },
  { id: 'guide53', label: 'LingBot-VLA训练配置指南（固定提交）', url: root + '/configs/vla/Training_Config.md', reading: '2026-10-20 实读batch/梯度累积、训练时长、checkpoint、深度注入和显存折中；global batch必须等于micro batch×data parallel size×accumulation。' },
  { id: 'behavior53', label: 'StanfordVL · BEHAVIOR Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '2026-10-20 复核BDDL目标、隐藏实例、Q-score与单次rollout；属于StanfordVL任务/仿真/评测线，不是LingBot训练成果。' },
  { id: 'atlas53', label: 'World Labs · Atlas', url: 'https://www.worldlabs.ai/blog/atlas', reading: '2026-10-20 复核共享空间上下文、RGB/depth视图和可控仿真变体；属于World Labs空间生成/仿真线，不归为StanfordVL或LingBot深度蒸馏。' },
  { id: 'vjepa53', label: 'Meta/FAIR · V-JEPA 2', url: 'https://ai.meta.com/vjepa/', reading: '2026-10-20 复核自监督视频表征与动作条件规划；这是Meta/FAIR历史谱系，可作冻结表征对照，不是AMI当前发布或LingBot动作flow。' },
  { id: 'ami53', label: 'AMI Labs官方研究方向', url: 'https://amilabs.xyz/', reading: '2026-10-20 复核表征空间预测、动作条件世界模型、可靠性和安全方向；当前页是研究愿景，不是已发布的LingBot teacher、吞吐结果或SO-101闭环证据。' },
];

export const day53: AuthoredDay = {
  reviewedAt: '2026-10-20',
  revision: '逐课编写 1.0',
  deliverable: '一张LingBot-VLA的VLM—动作专家—深度teacher训练图；一个复刻flow插值、joint/time mask和固定噪声Euler采样的PyTorch夹具；一份SO-101吞吐—显存—几何收益—闭环成功率实验卡。三课共100分钟，另留20分钟复盘。',
  question: {
    title: 'LingBot-VLA-Depth是否等于部署必须接深度相机，论文261 samples/s能否当作个人单卡速度？',
    summary: '区分训练期表征蒸馏、推理输入与集群吞吐协议。',
    keywords: ['depth distillation', 'RGB inference', 'flow matching', 'throughput protocol', 'FSDP2', 'closed-loop'],
    reference: '都不能。固定源码训练时用LingBot-Depth token约束VLM图像表示并把depth loss加到动作loss；sample_actions公开输入仍是images、masks、language和state，没有raw depth。261 samples/s对应8卡、统一local batch 32、特定模型与框架，且论文摘要和正文的每卡/集群口径不完全一致。个人应重新测吞吐、显存、action age和分组闭环成功率。',
  },
  lessons: {
    foundation: {
      title: 'LingBot-VLA连续动作专家：MoT、Flow Matching与深度蒸馏',
      minutes: 35,
      prerequisites: '理解10-13/10-14的Flow Matching符号，以及10-20至10-22的连续动作头、mask和本体字段契约。',
      connection: '10-22用Spirit建立VLM条件与DiT动作流；今天切换到LingBot的Mixture-of-Transformers与query式深度蒸馏。10-24再比较有/无深度checkpoint，不能提前把辅助loss写成传感器收益。',
      intro: 'LingBot-VLA把Qwen2.5-VL路径和连续动作专家放进逐层耦合的MoT：两条路径保留不同前馈网络，却通过共享注意力交换信息。动作专家拟合50步连续action chunk的速度场；深度版用冻结teacher token监督RGB表征。“with depth”首先描述训练目标和checkpoint身份，不自动承诺推理端输入深度图。',
      outcomes: ['画出三视角/文本/状态、动作flow与深度teacher的数据流', '推导论文和源码两种等价但方向相反的时间记号', '准确陈述20,000小时、50步与深度版结果的边界'],
      sections: [
        { heading: '01 MoT是共享注意力、分离前馈，不是稀疏路由', body: `论文把三视角图像I¹、I²、I³、任务文本T和当前状态s组成条件O，未来动作组成长度50的A。Qwen2.5-VL处理图文语义，action expert处理state和noisy action。固定源码逐层计算两条路径的Q/K/V并进入同一注意力接口，再由各自投影与MLP更新，因此这里的Mixture-of-Transformers不是门控稀疏MoE。

动作token能读取图文上下文，又不必把连续关节值离散成词表；代价是相机顺序、lang mask、state字段和动作维必须稳定。九种双臂本体预训练不能替SO-101定义六关节顺序，只有adapter、单位、归一化与动作参考匹配后，shape相同才有物理意义。`, formulas: [{ latex: '\\mathbf O_t=[\\mathbf I_t^1,\\mathbf I_t^2,\\mathbf I_t^3,\\mathbf T_t,\\mathbf s_t],\\qquad \\mathbf A_t=[\\mathbf a_t,\\ldots,\\mathbf a_{t+T-1}],\\quad T=50', explanation: 'O_t是条件上下文，A_t是连续动作块；T=50是论文预训练设置，不要求所有后训练或执行chunk固定为50。' }], sourceIds: ['paper53', 'model53'] },
        { heading: '02 论文与源码时间方向相反，速度目标必须成对变化', body: `论文写A_s=sA+(1-s)ε，s=0在噪声端、s=1在数据端，理想速度A-ε。固定源码构造x_t=tε+(1-t)A，t=0在数据端、t=1在噪声端，因此目标u_t=ε-A。令t=1-s即可互换；只抄速度符号却不抄端点，会让采样远离动作。

源码sample_actions从t=1噪声开始，dt=-1/N，反复x←x+dt·v。若A=0.25、ε=1.05，目标0.80；N=4时每步-0.20，从1.05依次到0.85、0.65、0.45、0.25。真实速度依赖x、t和条件，常速度只用于核对符号。`, formulas: [{ latex: 'x_t=t\\epsilon+(1-t)A,\\qquad u_t=\\epsilon-A,\\qquad x_{t+\\Delta t}=x_t+\\Delta t\\,v_\\theta(x_t,\\mathbf O_t,t),\\quad \\Delta t=-\\frac1N', explanation: '固定源码从t=1积分到0；若采用论文s从0到1，速度与步长方向必须同时翻转。' }], sourceIds: ['paper53', 'model53'] },
        { heading: '03 深度版对齐表征，不把raw depth拼进公开推理签名', body: `论文为三个视角设置learnable query，用LingBot-Depth的depth tokens监督；固定配置采用8个task token、256个teacher token与depth_loss_weight=0.004。训练forward调用depth_emb_forward，让预测token拟合detach后的teacher token，再把该loss与动作flow loss相加。teacher目标需要MoGe-2和LingBot-Depth权重，训练成本确实更高。

公开sample_actions只接收images、img_masks、lang_tokens、lang_masks和state，先缓存RGB/文本prefix，再迭代动作suffix，没有raw depth形参。因此只能说几何先验被蒸馏进RGB表示，不能断言部署必须装深度相机，更不能推断RAW/HDR模态自动获益；新增传感器属于新架构与新实验。`, sourceIds: ['paper53', 'readme53', 'model53', 'config53'] },
        { heading: '04 官方规模、开放范围与双团队主线分开记账', body: `论文报告约20,000小时、9种双臂本体及三平台各100任务；它支持系统研究规模与多样性，却不表示公开仓库含完整预训练数据。个人可以复刻调用链、微调接口和小样本消融，但不能把官方数据规模或成功率写成自己的复现。

StanfordVL的BEHAVIOR/OmniGibson负责任务、物理状态与评测；World Labs Atlas/R2S2R负责空间生成与仿真变体。Meta/FAIR V-JEPA是历史表征/规划对照，AMI当前页是研究方向。它们都没有发布LingBot动作expert或深度teacher，不能互相归属，也不能替LingBot真机效果背书。`, sourceIds: ['paper53', 'readme53', 'behavior53', 'atlas53', 'vjepa53', 'ami53'] },
      ],
      points: ['MoT是共享注意力、分离前馈的双路径。', '时间端点、速度目标和积分方向必须成对解释。', '深度版首先是训练期表征蒸馏，公开推理仍是RGB/文本/state。'],
      codeTitle: 'lingbot_flow_contract.py · 端点、方向与推理输入检查',
      code: [
        'def validate_inputs(batch):',
        '    required=("images","image_masks","language","state")',
        '    missing=[k for k in required if k not in batch]',
        '    if missing: raise ValueError("missing: "+str(missing))',
        '    if len(batch["images"])!=3 or len(batch["image_masks"])!=3:',
        '        raise ValueError("expected three ordered cameras")',
        '    if "depth" in batch: raise ValueError("raw depth is not in public sampling signature")',
        '    return True',
        '',
        'batch={"images":["top","left","right"],"image_masks":[1,1,1],',
        '       "language":"pick cup","state":[0.0]*16}',
        'assert validate_inputs(batch)',
        'action,noise,steps=.25,1.05,4; x=noise; dt=-1.0/steps',
        'for _ in range(steps): x += dt*(noise-action)',
        'assert abs(x-action)<1e-9',
        'try:',
        '    validate_inputs(dict(batch,depth=[[1.0]]))',
        '    raise AssertionError("undeclared depth accepted")',
        'except ValueError: pass',
        'print("LingBot flow contract: PASS")',
      ].join('\n'),
      codeNotes: ['复刻源码时间方向与公开采样输入边界，不加载4B模型、teacher或真机。', '正例核对负时间Euler回到动作端，负例拒绝未声明raw depth。', '若研究者扩展深度输入，必须明确这是新接口与新训练。'],
      exercise: { prompt: 'A=-0.3、ε=0.7，改用源码t=1-s并从t=1做5步Euler，目标速度、每步变化和终点是什么？', steps: ['计算u=ε-A。', '计算dt=-1/5。', '从ε累加5次。'], solution: 'u=1.0，dt=-0.2，每步-0.2；从0.7经过0.5、0.3、0.1、-0.1到-0.3，终点等于真实动作。' },
      quiz: { question: '为什么LingBot-VLA的with depth不能直接翻译为部署时的RGB-D输入模型？', hint: '检查训练loss与sample_actions签名。', keywords: ['teacher tokens', 'depth_emb_forward', 'distillation loss', 'sample_actions', 'RGB', 'inference signature'], reference: '固定代码训练时让VLM图像表示预测LingBot-Depth teacher tokens并加入加权depth loss，teacher target被detach；公开sample_actions只接收RGB/mask、语言和state，未接收raw depth。因此这是训练期几何表征蒸馏，部署RGB-D必须由另一套接口、权重和实验支持。' },
      sources,
    },
    code: {
      title: '源码精读：从policy loss到KV缓存Euler采样',
      minutes: 40,
      prerequisites: '会读PyTorch广播、布尔索引、KV cache、MSE reduction与FSDP/torch.compile配置。',
      connection: '把训练与推理闭合起来，并延续10-22的mask审计：参数出现在签名里，不等于它真实参与loss。',
      intro: '围绕四个真实落点精读：policy.forward如何聚合loss，FlowMatching.forward如何构造noisy action，sample_actions如何复用prefix KV，depth_emb_forward如何只在训练期产生辅助监督。重点是识别“形参存在、实际未用”和“基准吞吐依赖协议”两类陷阱。',
      outcomes: ['按函数名复述训练与采样调用链', '识别action_is_pad未参与公开reduction的风险', '运行joint/time联合mask与固定噪声PyTorch夹具'],
      sections: [
        { heading: '01 逐元素flow误差在policy层才选择监督维', body: `LingbotVlaPolicy.forward调用FlowMatching.forward；后者采样noise与Beta时间，构造x_t和u_t，embed_prefix处理图文，embed_suffix生成state与action-time token，共享注意力返回suffix_out，action_out_proj映射为[B,T,D]速度并产生逐元素MSE或L1。

policy层若有joint_mask就扩展到时间轴并做布尔索引，否则截前action_dim维，然后直接mean。action_is_pad虽在forward形参里，却没有传给self.model，也没有参与reduction。看到参数名不能证明尾部padding已屏蔽；dataset必须保证窗口有效，或显式加入时间mask。`, sourceIds: ['model53'] },
        { heading: '02 prefix算一次，动作suffix在每个solver步更新', body: `sample_actions先编码三视角与文本，构造prefix二维mask，并以fill_kv_cache=True保存图文条件。随后从高斯动作noise开始，predict_velocity只重建state/noisy-action/time suffix，带着prefix cache计算速度，不重复跑完整视觉语言前缀。

一次chunk内图像和文本被冻结，只有动作状态随积分变化。若环境在生成期间变化，cache不会吸收新观测，必须等下一次重规划刷新。缓存节省计算不等于时延合格，仍要测相机、预处理、N步solver、反归一化与队列年龄。`, sourceIds: ['model53'] },
        { heading: '03 深度teacher路径与推理路径明确分叉', body: `align_params非空时初始化depth query/head。训练forward从outputs_embeds提取图像与task token，预测depth token；_emb_loss对detach后的teacher target做Smooth L1，policy层再把loss_vla和加权loss_depth相加，日志分别保留。

sample_actions没有调用depth_emb_forward，也不需要depth_targets。最小审计应断言训练深度版必须有teacher target，推理RGB-only可以通过；若声称真实深度相机改善闭环，则必须展示新增runtime输入、同步、标定与独立消融。`, sourceIds: ['model53', 'config53', 'guide53'] },
        { heading: '04 261 samples/s必须绑定硬件、batch和总/每卡口径', body: `论文在Libero、π-like模型、local batch 32下比较多个框架；其代码用FSDP2并展示8至256卡扩展。摘要写261 samples/s per GPU with 8 GPUs，正文写261 samples/s on an 8-GPU cluster，口径不完全一致；课程保留歧义，不能擅自乘8或除8。

真机配置的micro batch 32、8卡、accumulation 1得到global batch 256。单卡通常要减micro batch、增累积、冻结模块或去掉teacher。报告应含samples/s、分辨率、峰值显存、global batch、精度、compile预热和通信范围，否则“更快”不可复现。`, formulas: [{ latex: 'B_{\\mathrm{global}}=B_{\\mathrm{micro}}N_{\\mathrm{dp}}K_{\\mathrm{acc}},\\qquad \\eta_{\\mathrm{scale}}(N)=\\frac{q_N}{Nq_1}', explanation: 'B_global是一次更新的样本量，q_N是N卡总吞吐；先明确总吞吐还是每卡吞吐，才能解释扩展效率。' }], sourceIds: ['paper53', 'config53', 'guide53'] },
      ],
      points: ['action_is_pad只在签名出现却未参与loss，需要额外审计。', '采样复用视觉语言prefix KV，动作suffix随Euler步迭代。', '吞吐必须绑定硬件、batch、精度、编译与口径。'],
      codeTitle: 'lingbot_mask_cache.py · 联合mask与固定噪声复现',
      code: [
        'import torch',
        '',
        'def masked_loss(pred,target,joint_mask,time_valid):',
        '    if pred.shape!=target.shape: raise ValueError("shape mismatch")',
        '    if joint_mask.shape!=(pred.shape[0],pred.shape[2]): raise ValueError("joint mask")',
        '    if time_valid.shape!=pred.shape[:2]: raise ValueError("time mask")',
        '    valid=time_valid.bool().unsqueeze(-1) & joint_mask.bool().unsqueeze(1)',
        '    if not valid.any(): raise ValueError("no supervision")',
        '    return ((pred-target).square()*valid).sum()/valid.sum()',
        '',
        'action=torch.tensor([[[.2,.4],[.3,.5],[9.,9.]]])',
        'noise=torch.tensor([[[1.,0.],[.7,-.3],[4.,4.]]])',
        'target=noise-action; pred=target.clone()',
        'joints=torch.tensor([[1,1]],dtype=torch.bool)',
        'times=torch.tensor([[1,1,0]],dtype=torch.bool)',
        'assert masked_loss(pred,target,joints,times).item()==0.0',
        'corrupt=pred.clone(); corrupt[:,2,:]=1000',
        'assert masked_loss(corrupt,target,joints,times).item()==0.0',
        'x=noise[:,:2].clone()',
        'for _ in range(4): x += -.25*target[:,:2]',
        'assert torch.allclose(x,action[:,:2],atol=1e-6)',
        'try:',
        '    masked_loss(pred,target,joints,torch.zeros_like(times))',
        '    raise AssertionError("empty supervision accepted")',
        'except ValueError: pass',
        'print("LingBot mask/cache fixture: PASS")',
      ].join('\n'),
      codeNotes: ['joint_mask与time_valid求交并共同进入分子分母；这是教学稳健化，不冒充上游原行。', '尾步污染到1000仍不影响loss，证明时间padding必须排除。', '固定noise适合原模型与导出/编译模型逐值比较，不涉及设备驱动。'],
      exercise: { prompt: 'micro batch降到2、1张GPU、累积16步。global batch是多少？每个micro step 0.40秒时一次更新约多久、吞吐多少？', steps: ['计算global batch。', '计算16个micro step时长。', '用样本数除以时间。'], solution: 'global batch=2×1×16=32；更新时间约6.4秒，吞吐约5 samples/s。硬件、模型和口径未统一，不能与论文261直接比较。' },
      quiz: { question: 'action_is_pad为什么是固定提交中必须审计的“假安全感”参数？', hint: '从签名继续追到loss reduction。', keywords: ['action_is_pad', 'forward signature', 'joint_mask', 'loss reduction', 'padding', 'valid elements'], reference: '它出现在LingbotVlaPolicy.forward形参中，但调用self.model时未传下去，后续只用joint_mask或action_dim并直接mean。复现者应核对窗口有效性，或让time_valid与joint_mask求交后共同控制分子和分母，并用污染尾步的负测试锁定行为。' },
      sources,
    },
    insight: {
      title: '工程优化何时真正可用：从集群吞吐到SO-101闭环',
      minutes: 25,
      prerequisites: '能区分总/每卡吞吐、训练辅助模态/部署输入和离线/闭环指标。',
      connection: '把LingBot高吞吐与深度蒸馏转成个人可执行实验矩阵；10-24再比较两类checkpoint，避免凭总体均值下结论。',
      intro: '工程优化不能只等于更高samples/s。个人SO-101的可用性由四轴决定：训练是否在预算内结束、checkpoint能否恢复、推理action age是否满足控制周期、几何改善是否在未见条件闭环中出现。任一缺失都只是局部成功。',
      outcomes: ['把吞吐换算为训练墙钟并列出假设', '设计无深度/深度蒸馏公平消融', '把双团队主线转为仿真—表征—真机证据阶梯'],
      sections: [
        { heading: '01 吞吐先换成墙钟，再决定优化值不值得', body: `若训练需M个样本、稳定总吞吐q，则理想墙钟H=M/(3600q)。100万sample在5 samples/s下约55.6小时，升到8 samples/s约34.7小时，节约20.9小时；只有global batch、样本定义、分辨率、精度与更新语义相同时，这个差才可归因于工程优化。

减micro batch再累积可维持global batch，却改变数据随机性和通信频率；compile有预热与图断裂；FSDP2减驻留却增加通信。个人应记录预热后中位吞吐、p95 step time、峰值显存、checkpoint恢复耗时和loss一致性，不复制集群数字。`, formulas: [{ latex: 'H=\\frac{M}{3600q},\\qquad \\Delta H=\\frac{M}{3600}\\left(\\frac1{q_{\\mathrm{base}}}-\\frac1{q_{\\mathrm{opt}}}\\right)', explanation: 'M按同一协议计数，q是稳定总吞吐；若样本或batch定义变化，墙钟差不能直接归因于优化。' }], sourceIds: ['paper53', 'guide53'] },
        { heading: '02 深度蒸馏要用关键几何组收益抵消训练成本', body: `A/B保持RGB输入、样本、adapter、随机种子、更新数和评测轨迹一致：A用无深度checkpoint与动作loss，B增加冻结teacher和0.004表征loss。记录teacher预计算/在线开销、峰值显存、吞吐、动作误差，以及透明、反光、低纹理、遮挡和尺度变化组的闭环成功率。

只有关键几何组的置信下界改善、非几何组无明显退化且部署时延不变，才保留B。SO-101若没有三视角或双臂字段，应先做最小adapter与RGB基线；不要为追“深度”同时改相机、动作语义和模型，导致因果不可辨。`, sourceIds: ['paper53', 'config53'] },
        { heading: '03 训练更快不等于动作更新更及时', body: `sample_actions缓存prefix并迭代动作suffix；控制端仍有采集、resize/tokenize、solver、反归一化、传输和队列等待。应记录动作执行时距对应观测的age，而不只报forward均值，并用p95/p99暴露偶发卡顿。

若SO-101周期100 ms而p95 action age为180 ms，即使平均80 ms也会执行过期动作。可减solver步、缩chunk或异步推理，但每项都要重测成功率、抖动和恢复。自动化仅写离线课程，不连接或控制机械臂。`, sourceIds: ['model53', 'guide53'] },
        { heading: '04 双团队主线提供外部测试工具，不替代LingBot证据', body: `StanfordVL BEHAVIOR/OmniGibson可把几何困难写成对象状态、接触和隐藏实例；World Labs Atlas/R2S2R可提供相机位姿、光照、物体和空间变体。两条李飞飞相关组织线分别负责任务评测和空间仿真，不能混作一个发布方。

Meta/FAIR V-JEPA冻结表征可作非深度teacher历史基线；AMI的动作条件表征预测仍是当前方向，官网愿景不是checkpoint。诚实证据阶梯是离线probe→仿真隐藏条件→真实小范围闭环→分组置信区间，只有穿过动作adapter与安全闭环后才算项目收益。`, sourceIds: ['behavior53', 'atlas53', 'vjepa53', 'ami53'] },
      ],
      points: ['吞吐换算为同协议墙钟、显存和恢复能力后才可决策。', '深度蒸馏要以未见几何组闭环收益抵消teacher成本。', '训练优化、action age和成功率是三条不同证据轴。'],
      codeTitle: 'lingbot_promotion_gate.py · 工程收益与闭环晋级门',
      code: [
        'def gate(base,new,groups,max_p95=100):',
        '    required=("throughput","peak_gib","p95_ms","group_success")',
        '    for run in (base,new):',
        '        if any(k not in run for k in required): raise ValueError("incomplete card")',
        '    deltas={g:new["group_success"][g]-base["group_success"][g] for g in groups}',
        '    return new["throughput"]>base["throughput"] and all(v>0 for v in deltas.values()) and new["p95_ms"]<=max_p95,deltas',
        '',
        'base={"throughput":5.,"peak_gib":22.,"p95_ms":92,',
        '      "group_success":{"low_texture":.40,"reflection":.30}}',
        'good={"throughput":6.5,"peak_gib":23.5,"p95_ms":96,',
        '      "group_success":{"low_texture":.55,"reflection":.42}}',
        'ok,deltas=gate(base,good,["low_texture","reflection"])',
        'assert ok and abs(deltas["reflection"]-.12)<1e-9',
        'late=dict(good,p95_ms=180)',
        'assert gate(base,late,["low_texture","reflection"])[0] is False',
        'try:',
        '    gate(base,{"throughput":9},["low_texture"])',
        '    raise AssertionError("incomplete evidence accepted")',
        'except ValueError: pass',
        'print("LingBot promotion gate: PASS")',
      ].join('\n'),
      codeNotes: ['运行卡同时检查吞吐、关键几何组和p95 action age。', '负例证明训练更快但动作过期仍不能晋级；阈值是教学假设，不是硬件实测。', '真实实验还需置信区间、随机种子、失败类型与安全事件。'],
      exercise: { prompt: '100万样本中基线5 samples/s、优化版8 samples/s，分别需多久、节省多少？若p95 action age从90升到160 ms，能否直接用于100 ms周期？', steps: ['分别计算H。', '计算差值。', '比较action age和周期。'], solution: '约55.6小时与34.7小时，节省20.9小时。但160 ms超过100 ms周期，不能因训练更快直接部署；先修复推理/队列时延并重测闭环。' },
      quiz: { question: '怎样证明LingBot工程优化和深度蒸馏对SO-101真正可用？', hint: '覆盖训练、推理、分组闭环和证据边界。', keywords: ['wall-clock', 'peak memory', 'action age', 'depth ablation', 'group success', 'confidence interval'], reference: '在同一数据、adapter、更新数和协议下记录训练墙钟/吞吐/显存/恢复；固定噪声比较原模型与编译模型；测端到端p95/p99 action age；对无深度与蒸馏深度版在低纹理、反光、遮挡等未见组做闭环A/B并报告置信区间。训练可承受、推理不过期且关键组稳定改善，才算可用。' },
      sources,
    },
  },
};

