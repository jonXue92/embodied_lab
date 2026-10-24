import type { AuthoredDay } from './types';

const smolCommit = '297774fca4e3ad0aa34e7425fbf937111637e77b';
const smolRoot = 'https://github.com/huggingface/lerobot/blob/' + smolCommit;
const grootCommit = 'dac54b313160c201c450f97df0fd74ebd379c892';
const grootRoot = 'https://github.com/NVIDIA/Isaac-GR00T/blob/' + grootCommit;
const spiritCommit = '6d67377f16f67d6575447a1f29fdd83a2e0099d9';
const spiritRoot = 'https://github.com/Spirit-AI-Team/spirit-v1.5/blob/' + spiritCommit;
const lingbotCommit = '4eb34b7693a0565c67433f8fac9c59a2e67eb60b';
const lingbotRoot = 'https://github.com/Robbyant/lingbot-vla/blob/' + lingbotCommit;
const vjepaCommit = '204698b45b3712590f06245fbfba32d3be539812';
const vjepaRoot = 'https://github.com/facebookresearch/vjepa2/blob/' + vjepaCommit;

const sources = [
  { id: 'smolPaper56', label: 'SmolVLA 技术报告', url: 'https://arxiv.org/abs/2506.01844', reading: '2026-10-23 复读§3架构、§4.6异步推理和消融：0.45B模型用多相机/语言/state条件与连续action expert生成动作块；64视觉token、前半层和CA+SA是其协议内的计算—效果选择，不是任意SO-101实时保证。' },
  { id: 'smolModel56', label: 'LeRobot · SmolVLA模型与loss（固定提交）', url: smolRoot + '/src/lerobot/policies/smolvla/modeling_smolvla.py', reading: '2026-10-23 定位SmolVLAPolicy.forward/_get_action_chunk、VLAFlowMatching.embed_prefix/embed_suffix/forward/sample_actions：核对图像、文本、state、noisy action、时间、KV cache和action_is_pad归约路径。' },
  { id: 'grootPaper56', label: 'NVIDIA · GR00T N1技术报告 v2', url: 'https://arxiv.org/abs/2503.14734v2', reading: '2026-10-23 复读架构与数据章节：视觉语言System 2连接扩散式System 1，训练混合真实机器人轨迹、人类视频和合成数据；跨本体结果只在论文列出的机器人、数据与基准内成立。' },
  { id: 'grootProcessor56', label: 'GR00T N1.7 processor（固定提交）', url: grootRoot + '/gr00t/model/gr00t_n1d7/processing_gr00t_n1d7.py', reading: '2026-10-23 定位Gr00tN1d7Processor.__call__、Gr00tN1d7DataCollator、validate_action_horizons与保存逻辑：state/action统计、embodiment_id、时间和动作维mask共同构成模型接口。' },
  { id: 'grootModel56', label: 'GR00T N1.7 action head（固定提交）', url: grootRoot + '/gr00t/model/gr00t_n1d7/gr00t_n1d7.py', reading: '2026-10-23 定位Gr00tN1d7ActionHead.forward/sample_actions与Gr00tN1d7.prepare_input：逐元素flow误差先乘二维action_mask，再用有效元素和归约；这与只按时间mask的实现不能直接比较loss数值。' },
  { id: 'spiritModel56', label: 'Spirit-v1.5模型源码（固定提交）', url: spiritRoot + '/model/modeling_spirit_vla.py', reading: '2026-10-23 定位SpiritVLAPolicy.compute_loss、_sample_actions_unified与select_action：Qwen3-VL上下文连接DiT速度场，训练代码在batch含action_is_pad时应用时间mask；公开dataset是否传出该键需单独审计。' },
  { id: 'spiritDataset56', label: 'Spirit-v1.5数据集源码（固定提交）', url: spiritRoot + '/dataset/dataset.py', reading: '2026-10-23 复核RoboChallengeDataset视频、state/action、尾部padding与collate：固定版本会计算action_is_pad但__getitem__未把它返回；横评必须在adapter处补齐可验证mask，不能把padding误差算进有效动作。' },
  { id: 'lingbotPaper56', label: 'LingBot-VLA技术报告', url: 'https://arxiv.org/abs/2601.18692', reading: '2026-10-23 复读§3、§5.4：Qwen2.5-VL与动作expert逐层交互，以flow matching生成50步动作块，并用训练期深度表征蒸馏；20,000小时和集群吞吐不等于个人同数据、同硬件结果。' },
  { id: 'lingbotModel56', label: 'LingBot-VLA模型源码（固定提交）', url: lingbotRoot + '/lingbotvla/models/vla/pi0/modeling_lingbot_vla.py', reading: '2026-10-23 定位LingbotVlaPolicy.forward、FlowMatching.forward/sample_actions/predict_velocity：固定版本用joint_mask选择动作维，但forward签名中的action_is_pad没有进入loss归约，横评须由共同wrapper显式处理有效时间。' },
  { id: 'vjepaPaper56', label: 'Meta/FAIR · V-JEPA 2论文', url: 'https://arxiv.org/abs/2506.09985', reading: '2026-10-23 实读摘要与机器人规划章节：先在超100万小时互联网视频上做无动作表征预训练，再用少于62小时DROID交互后训练V-JEPA 2-AC，以图像目标在Franka上规划；它预测latent后果而非直接监督action chunk。' },
  { id: 'vjepaAc56', label: 'Meta/FAIR · V-JEPA 2-AC predictor（固定提交）', url: vjepaRoot + '/src/models/ac_predictor.py', reading: '2026-10-23 定位动作条件predictor的state/action token接线与rollout接口，并对照README的DROID post-training和energy landscape notebook；课程只复刻评测契约，不运行上游规划或机器人控制。' },
  { id: 'behavior56', label: 'StanfordVL · BEHAVIOR Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '2026-10-23 复核BDDL目标、公开/隐藏实例、Q-score、计时和单次rollout约束；它提供统一任务与部分成功口径，不给四个VLA或V-JEPA在SO-101上的现成可比成绩。' },
  { id: 'r2s2r56', label: 'World Labs · Real-to-Sim-to-Real', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '2026-10-23 复核从真实任务重建场景、改变机器人/传感器/外观/物理并用真机检验仿真排序的路线；属于World Labs空间仿真线，不归StanfordVL，也不替代共同策略adapter。' },
  { id: 'ami56', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '2026-10-23 复核AMI当前公开方向为表征空间预测、动作条件世界模型、可靠性与安全；本课不把Meta/FAIR V-JEPA代码改写成AMI发布，也不把方向页当作第五个可运行checkpoint。' },
];

export const day56: AuthoredDay = {
  reviewedAt: '2026-10-23',
  revision: '逐课编写 1.0',
  deliverable: '一张SmolVLA、GR00T N1.7、Spirit-v1.5、LingBot-VLA与V-JEPA 2-AC的输入—预测对象—动作接口表；一个共同mask/尺度/闭环报告夹具；一份SO-101固定数据、计算预算和安全门的分阶段横评方案。三课共100分钟，另留20分钟复盘。',
  question: {
    title: '四个VLA都能输出连续action chunk，是否可以直接比较各自论文loss或官方成功率来选SO-101基线？',
    summary: '统一样本、动作语义、有效mask、预算和闭环分母后再比较；内部loss与跨协议成功率不可横除。',
    keywords: ['common protocol', 'action semantics', 'valid mask', 'matched budget', 'closed-loop', 'V-JEPA'],
    reference: '不可以。四个模型的训练数据、动作维度/horizon、归一化、mask分母、相机、机器人、训练预算与任务协议不同，内部flow/DiT loss只是各自优化量。应先把同一SO-101 split映射到每个模型的显式adapter，验证反归一化动作与有效mask；再固定更新数或GPU小时、checkpoint规则和闭环session，报告同单位动作误差、p99 action age、成功率置信下界、介入与近失。V-JEPA 2-AC预测未来latent并规划，内部energy不能与VLA action loss直接相比，只能在接上明确planner和执行adapter后共享闭环结果指标。',
  },
  lessons: {
    foundation: {
      title: '统一横评的第一原则：先统一问题，再比较模型', minutes: 34,
      prerequisites: '完成10-20至10-25的GR00T、Spirit、LingBot、深度与跨本体课程；理解SmolVLA flow、action chunk、padding mask、数据切分和闭环成功率。',
      connection: '昨天把共享表示与本体执行边界分开；今天把这套边界变成四个直接动作模型与一个预测式世界模型的共同横评表。明天进入World Model单元，将沿用“输入、预测对象、动作怎样进入、怎样闭环”的五列表头。',
      intro: '“模型A准确率更高、模型B loss更低”通常不是横评，而是把不同任务的仪表盘拼在一起。真正公平的比较从同一SO-101任务、同一观测时刻、同一物理动作和同一失败分母出发；模型内部可以完全不同，但送入系统和离开系统时必须经过可审计契约。',
      outcomes: ['区分直接action policy与latent world model的预测对象', '建立同数据、同指标、同预算的三层协议', '计算有效元素动作误差和Wilson成功率下界'],
      sections: [
        { heading: '01 四个VLA相似的是系统位置，不是内部张量', body: `SmolVLA、GR00T N1.7、Spirit-v1.5与LingBot-VLA都接收视觉、语言和机器人状态，并直接产生一段连续动作，因此在系统图上都能放进policy槽位。它们却使用不同视觉语言骨干、动作expert、最大动作维、horizon、相机预处理、统计文件与mask。共同写着flow matching或DiT，也不意味着t的方向、噪声路径、loss分母和Euler步数完全相同。

横评表不能只列参数量。至少要列原始observation键、图像角色、state/action单位与参考系、归一化统计、预测horizon、实际执行步数、有效时间/维度mask、可训练参数、峰值显存和端到端action age。对SO-101而言，六维数组shape相同仍可能把夹爪和关节交换；adapter往返测试比“模型成功加载”更早、更硬。`, sourceIds: ['smolModel56', 'grootProcessor56', 'spiritModel56', 'lingbotModel56'] },
        { heading: '02 V-JEPA 2-AC回答的是候选动作之后会怎样', body: `V-JEPA 2先从无动作互联网视频学习表征；2-AC再用DROID机器人轨迹让predictor接收当前latent与候选action，预测未来latent。规划时比较预测latent与目标图像latent的代价，从候选序列中选择动作。它不是给定观测后一次输出action chunk的监督策略，因此其latent energy不能与VLA的动作速度MSE放在同一纵轴。

若要纳入系统横评，应明确planner怎样生成候选、每轮评估多少条、规划horizon、目标图像如何给出、第一条动作如何映射到SO-101，以及旧计划何时失效。最终可以共享成功、介入、近失、完成时间和action age；内部层另外报告latent预测误差、候选排序一致性与规划耗时。Meta/FAIR的这一历史成果也不能因LeCun现任AMI而改署名为AMI发布。`, sourceIds: ['vjepaPaper56', 'vjepaAc56', 'ami56'] },
        { heading: '03 同数据不等于同输入文件，而是同信息与同切分', body: `建立一次episode级train/validation/test切分，冻结任务、对象、背景、相机与失败分组；所有模型只能读取同一授权观测信息。每个项目可使用自己的processor，但processor必须从同一训练切分计算统计，不能偷看测试集，也不能让某模型多一条腕视或深度teacher监督却仍称“同输入”。模型原生需要不同分辨率时，记录resize和裁剪，而不是强迫所有内部tensor完全相同。

同样，预训练checkpoint携带不同外部数据，这正是模型能力的一部分，不能伪装成严格受控的从头训练。报告应分两轨：checkpoint-as-is+同目标数据微调回答“拿来即用价值”；随机或共同初始化通常不现实，只能用匹配可训练参数/更新数的adapter实验回答“目标数据效率”。两轨不可混成一个冠军分数。`, sourceIds: ['smolPaper56', 'grootPaper56', 'spiritDataset56', 'lingbotPaper56'] },
        { heading: '04 共同动作指标必须先恢复物理单位', body: `设预测与专家动作分别为a_hat和a，训练切分第j维稳健尺度为s_j=q99_j-q01_j，有效mask为m_tj。共同NMAE只在相同时间和物理维度上累计；某模型padding到55或132维时，新增零槽不能进入分母。例：两维有效误差分别0.02 rad和0.5 mm，尺度为1 rad与50 mm，归一化误差均为0.02，平均仍为0.02，而不是把毫米数值直接压过弧度。

NMAE仍是开环标签接近度，不会衡量多模态合理动作、误差恢复或接触安全。闭环需在同初态分组报告成功，并给有限样本置信下界。例如20次中16次成功，Wilson 95%下界约0.58，不能只写80%。任何碰撞、越界或急停必须单列，不能通过平均动作误差抵消。`, formulas: [{ latex: String.raw`\operatorname{NMAE}=\frac{\sum_{t,j}m_{tj}\left|\hat a_{tj}-a_{tj}\right|/\max(s_j,\varepsilon)}{\sum_{t,j}m_{tj}},\qquad s_j=q_{0.99,j}-q_{0.01,j}`, explanation: 't是动作时间，j是同一物理动作维；m同时排除时间padding与不存在的动作槽，s只由训练切分估计并保留单位身份。' }, { latex: String.raw`LCB_{Wilson}=\frac{\hat p+z^2/(2n)-z\sqrt{\hat p(1-\hat p)/n+z^2/(4n^2)}}{1+z^2/n}`, explanation: 'p_hat=k/n，95%时z约1.96；下界惩罚小样本，用于闭环晋级而不是宣称总体真实成功率已知。' }], sourceIds: ['grootModel56', 'behavior56'] },
        { heading: '05 同预算至少公开更新、算力和选模三本账', body: `同训练step不一定同预算：四个模型每步图像token、动作horizon、可训练参数和FSDP需求不同；同GPU小时也可能因预处理或显存不足导致有效样本数不同。可执行协议同时设置最大目标样本遍历数、最大GPU小时和最大checkpoint候选数，哪个先到就停止，并完整记录实际值。只有这样，较慢模型不能通过额外训练偷偷占优，较快模型也不会因提前停机被惩罚。

选模必须只看validation，test与真机固定session只在方案冻结后运行。论文官方成绩保留为“来源事实”，不放进SO-101排行榜。StanfordVL BEHAVIOR可提供任务谓词、隐藏实例和Q-score结构；World Labs R2S2R可扩展相机、物理与机器人仿真变体，但两条李飞飞相关线分属不同组织，且仿真排名仍需真实闭环验证。`, sourceIds: ['behavior56', 'r2s2r56'] },
      ],
      points: ['四个VLA共享直接动作policy位置，但输入、mask、统计与动作头不共享。', 'V-JEPA 2-AC预测动作条件未来latent，只有接入planner后才能与VLA共享闭环指标。', '公平横评需要同信息/切分、同物理输出、同预算停止规则和同闭环分母。'],
      codeTitle: 'common_metric.py · 有效动作与单位尺度的共同误差夹具',
      code: [
        'import torch',
        'def masked_nmae(pred,target,valid,scale):',
        '    if pred.shape!=target.shape or valid.shape!=pred.shape:',
        '        raise ValueError("shape or mask mismatch")',
        '    if torch.any(scale<=0) or valid.sum()==0:',
        '        raise ValueError("invalid scale or empty denominator")',
        '    err=(pred-target).abs()/scale.view(1,1,-1)',
        '    return (err*valid).sum()/valid.sum()',
        'target=torch.tensor([[[.10,10.],[.20,20.],[0.,0.]]])',
        'pred=torch.tensor([[[.12,10.5],[.18,19.5],[99.,99.]]])',
        'valid=torch.tensor([[[1.,1.],[1.,1.],[0.,0.]]])',
        'score=masked_nmae(pred,target,valid,torch.tensor([1.,50.]))',
        'assert torch.allclose(score,torch.tensor(.015),atol=1e-6)',
        'pred[:,:,1]*=1000; target[:,:,1]*=1000',
        'assert torch.allclose(masked_nmae(pred,target,valid,torch.tensor([1.,50000.])),score)',
        'try:',
        '    masked_nmae(pred,target,torch.zeros_like(valid),torch.tensor([1.,50000.]))',
        '    raise AssertionError("empty mask accepted")',
        'except ValueError: pass',
        'print("common physical metric: PASS",float(score))',
      ].join('\n'),
      codeNotes: ['示例把弧度与毫米各自除以训练分位数跨度；第二个正测试把毫米改成微米并同步scale，分数应保持不变。', '第三个padding时间步故意填99但mask为零，验证无效槽不污染结果；空分母负测试必须显式失败。', '正式报告还需保存每维单位、q01/q99版本、episode分组与反归一化后的越界率。'],
      exercise: { prompt: '模型A报告0.04 flow loss，模型B报告0.06；A含30% padding且按全张量平均，B只按有效元素平均。能否判A更好？请给修正流程。', steps: ['先识别两个loss的目标、mask和分母。', '把输出反归一化到同物理动作维。', '用共同valid mask和训练尺度重算开环指标，再进入固定闭环。'], solution: '不能。两个数字连分母都不同。应从各自checkpoint输出恢复同一SO-101动作、裁掉专属padding槽，按共同时间×动作mask计算NMAE/越界/连续性，并固定validation选模；最后用相同初态、执行频率、安全器和session比较成功置信下界、介入、近失与action age。' },
      quiz: { question: '“同一数据集”为什么仍不足以保证四模型公平横评？', hint: '检查信息量、processor统计、预算和选模。', keywords: ['same split', 'same information', 'training statistics', 'matched budget', 'checkpoint selection'], reference: '同一个目录可被不同processor裁出不同相机、时间窗口、动作参考和统计，预训练先验、可训练参数、更新/GPU小时及checkpoint挑选也可能不同。公平协议应冻结episode split与可用信息，逐模型记录adapter和训练统计，预注册预算停止与validation选模，再共享物理动作和闭环指标。' },
      sources,
    },
    code: {
      title: '真实源码对齐：五条路径必须通过同一个外部契约', minutes: 40,
      prerequisites: '会读Python类、[B,T,A]、二维mask、processor/checkpoint配套关系；已完成四个项目各自的源码精读课。',
      connection: '基础课定义共同问题；本课回到固定提交，逐一定位“观测在哪里变成模型输入、预测对象在哪里产生、padding在哪里被排除”。路线课再把这些事实转成SO-101可执行的训练与部署选择。',
      intro: '统一wrapper最危险的写法是把不同模型都塞进一个predict_action名字，然后假设返回值天然可比。正确做法是在边界处显式声明kind、时间、动作槽、统计与planner；模型内部保留原生机制，外部validator只接受已经恢复成共同物理语义的结果。',
      outcomes: ['定位四个VLA的真实loss/sample入口', '指出固定版本的mask差异与需要修正的位置', '用类型化adapter拒绝latent被冒充为物理动作'],
      sections: [
        { heading: '01 SmolVLA把prefix缓存与action suffix分开', body: `固定LeRobot提交中，SmolVLAPolicy.forward准备images、language与state，VLAFlowMatching.embed_prefix构造可缓存条件；embed_suffix把noisy action和time映射到expert token。训练forward回归速度场，策略层再用action_is_pad聚合有效时间；采样先prefill prefix KV，再多步更新动作suffix。横评wrapper应记录num_steps、chunk_size与实际n_action_steps。

如果只计模型forward毫秒而遗漏图像解码、processor、prefix prefill、队列和反归一化，SmolVLA会获得虚假时延优势。反过来，若把完整预处理算给SmolVLA，却只抄其他论文的纯模型吞吐，也同样不公平。共同计时起点应是带时间戳原始observation就绪，终点是经过安全器的第一条动作可发送。`, sourceIds: ['smolModel56'] },
        { heading: '02 GR00T把二维mask与本体身份写入processor', body: `Gr00tN1d7Processor先根据modality config和statistics处理state/action，再生成embodiment_id以及[time,action_dim]二维action_mask；Gr00tN1d7ActionHead.forward以mask乘逐元素MSE，并除以有效元素和。processor还保存statistics.json与embodiment_id.json，因此checkpoint权重不是完整实验身份，横评必须把这三者共同hash。

GR00T最大维度的零padding方便多本体批处理，却不能成为分数上的免费正确项。共同wrapper只取SO-101真实动作槽，检查未知embodiment、空mask、horizon与统计版本；反归一化后再做往返夹具。模型内部二维mask保留，外部共同mask则用于四模型一致的报告，两层职责不能互相替代。`, sourceIds: ['grootProcessor56', 'grootModel56'] },
        { heading: '03 Spirit与LingBot固定版本暴露了不同mask风险', body: `SpiritVLAPolicy.compute_loss在batch包含action_is_pad时会构造in_episode时间mask，但固定RoboChallengeDataset虽然计算该字段，__getitem__没有返回；因此“模型支持mask”不等于实际训练批次使用mask。横评adapter需要在切chunk时重新生成并断言传入，且分母只计有效时间×动作维，不能默默依赖公开示例。

LingbotVlaPolicy.forward接收joint_mask并据此选择有效动作维，但固定版本签名中的action_is_pad没有参与loss归约。它的50步chunk末尾若补零，外部训练wrapper需先屏蔽无效时间，或对逐元素loss做联合mask后归约。课程指出的是固定提交行为；不能把本课修正描述成上游已实现，也不能据此否定论文其他协议。`, sourceIds: ['spiritModel56', 'spiritDataset56', 'lingbotModel56'] },
        { heading: '04 V-JEPA adapter返回latent rollout，不返回action真值', body: `V-JEPA 2-AC的predictor接收视觉latent与候选动作序列，输出未来表征；energy landscape notebook展示的是候选action导致的latent代价地形。adapter的返回类型应是latent_rollout或candidate_cost，随后交给显式planner选择候选，再由机器人adapter把第一步变成物理命令。若直接把最低energy张量当action，shape偶然相容也会造成语义灾难。

这条分层使速度账本可解释：encoder、每候选每步predictor、候选生成、重规划频率与执行延迟分别记录。VLA则记录processor、prefix、每个flow步与队列。两者最终比较同一闭环目标，却不能要求内部调用次数或loss完全同构；公平的是预算边界和外部结果，不是强迫算法长成一样。`, sourceIds: ['vjepaPaper56', 'vjepaAc56'] },
        { heading: '05 类型化外部结果让错误尽早失败', body: `validator至少要求kind、values、valid、unit、frame、t0、dt、source_revision和stats_hash。direct_action结果必须是[B,T,A]并覆盖全部真实动作维；latent_rollout必须携带planner_id，且在planner完成前不能进入安全器。所有模型都要做零动作、单维正脉冲、关节顺序交换、空mask、过期观测与NaN负测试。

教学代码只验证边界元数据，不导入任何上游模型，也不连接机械臂。真实接入时，每个adapter仍需独立的模型加载、预处理与数值回归测试；统一抽象不能成为跳过项目官方约束的借口。若一个模型需要额外相机或teacher，只能登记为另一个实验臂，不能在原表中悄悄覆盖。`, sourceIds: ['smolModel56', 'grootProcessor56', 'spiritModel56', 'lingbotModel56', 'vjepaAc56'] },
      ],
      points: ['统一的是外部物理契约；各模型原生processor、mask和采样机制仍需保留。', 'Spirit与LingBot固定提交的时间mask路径需要wrapper显式审计。', 'V-JEPA必须先经过planner，latent或energy绝不能冒充动作。'],
      codeTitle: 'typed_adapter.py · direct action与latent rollout边界',
      code: [
        'from dataclasses import dataclass',
        '@dataclass',
        'class Output:',
        '    kind:str; shape:tuple; unit:str; planner:str|None=None',
        'def validate(o,action_dim=6):',
        '    if o.kind=="direct_action":',
        '        if len(o.shape)!=3 or o.shape[-1]!=action_dim or o.unit!="rad":',
        '            raise ValueError("invalid physical action contract")',
        '        if o.planner is not None: raise ValueError("direct action cannot hide planner")',
        '    elif o.kind=="latent_rollout":',
        '        if len(o.shape)!=4 or not o.planner or o.unit!="embedding":',
        '            raise ValueError("latent rollout needs explicit planner")',
        '    else: raise ValueError("unknown prediction object")',
        '    return True',
        'for name in ["smolvla","groot","spirit","lingbot"]:',
        '    assert validate(Output("direct_action",(2,50,6),"rad"))',
        'assert validate(Output("latent_rollout",(2,64,8,1024),"embedding","cem-image-goal"))',
        'for bad in [Output("direct_action",(2,50,55),"rad"),Output("latent_rollout",(2,64,8,1024),"embedding")]:',
        '    try: validate(bad); raise AssertionError("semantic mismatch accepted")',
        '    except ValueError: pass',
        'print("typed adapter contracts: PASS")',
      ].join('\n'),
      codeNotes: ['四个名字只代表同一direct_action出口；教学夹具不声称加载、复刻或评测任何真实checkpoint。', 'V-JEPA示例强制planner字段，防止embedding张量因shape可用而越过规划与物理映射。', '55维GR00T/LingBot规范空间必须先逆映射为SO-101六维，负测试会拒绝直接提交规范槽位。'],
      exercise: { prompt: '某wrapper让LingBot输出[1,50,55]，直接裁前6维并标rad；另一个让V-JEPA返回[1,64] energy并取最小下标当舵机角。分别指出缺失契约。', steps: ['检查55维到真实关节的slot mapping、统计与顺序。', '检查energy对应候选动作集和planner。', '补充往返、单位、frame与负测试。'], solution: 'LingBot需要checkpoint配套的raw↔canonical slot mapping和q01/q99统计，不能假设前6维就是SO-101；应先做单维脉冲往返。V-JEPA的energy只给候选排序，最小下标不是角度；必须保存候选序列、planner与action adapter，再选择第一步。两者都要验证时间戳、坐标、限位和空/错位输入。' },
      quiz: { question: '为什么“统一predict_action接口”反而可能掩盖最危险的比较错误？', hint: '同名返回值的预测对象、单位与后处理是否相同？', keywords: ['prediction object', 'physical units', 'slot mapping', 'planner', 'validator'], reference: '同一个方法名可以返回规范空间动作、已反归一化物理动作、latent rollout或候选energy。若接口不携带kind、单位、slot mapping、stats、frame和planner，调用方会把shape相容误当语义相容。类型化validator应在安全器前拒绝这些混用，并为每个adapter保留正负往返测试。' },
      sources,
    },
    insight: {
      title: 'SO-101选型：用证据阶梯找前沿，而不是办一次模型选美', minutes: 26,
      prerequisites: '理解前两课的共同指标、adapter与预算；能够区分论文来源事实、本地测量和尚未验证的工程假设。',
      connection: '本课为GR00T、Spirit、LingBot单元收口：先选能高频迭代的直接动作基线，再把大VLA与V-JEPA规划作为受控增量。下一单元将深入空间生成与JEPA world model，不会把慢规划器提前塞进未稳定的控制环。',
      intro: '个人项目最强的答案不是“我跑过最大的模型”，而是能解释为什么某条路线在固定数据、预算和风险下晋级或停止。SO-101与4090/Mac条件更适合分阶段证伪：先把数据、动作和闭环做稳，再一次只引入一个模型或规划变量。',
      outcomes: ['为五条路径分配不同验证角色', '用Pareto与安全硬门选择可复现基线', '把双团队主线转为后续测试而不改变组织归属'],
      sections: [
        { heading: '01 第一阶段把SmolVLA当工程基线，不把“小”当结论', body: `SmolVLA的优势是LeRobot集成、较小参数量、SO-101生态与较低单次迭代成本，适合作为数据—训练—回放—部署链的基线。先用授权的个人数据完成三种子或至少可解释的重复实验，保存processor统计、checkpoint、开环回放、p50/p99时延与失败视频；这一步验证的是工程闭环，不是宣称它在所有任务上优于大模型。

若小物体、复杂语言或跨场景语义成为已定位瓶颈，再引入更大VLA才有因果意义。若当前失败来自错位相机、动作归一化或夹爪标签，换GR00T、Spirit或LingBot只会以更高成本学习同一错误。用户的RAW/图像经验应先用于失败切片和曝光/模糊对照，不在同一轮同时换模型与模态。`, sourceIds: ['smolPaper56', 'smolModel56'] },
        { heading: '02 第二阶段让大模型回答各自最强假设', body: `GR00T实验优先回答embodiment-aware投影和异构预训练是否减少SO-101目标数据；Spirit实验回答多样真实经验覆盖是否改善新初态与恢复；LingBot实验回答MoT动作expert和深度蒸馏checkpoint是否改善几何困难切片。每个实验只替换模型路径，保持数据、任务、执行器、安全器与评测session不变。

资源不够同时微调三者时，不应把低预算欠拟合结果写成架构排名。先做processor可达性、显存、单batch过拟合、固定小子集与端到端时延的淘汰赛；只有通过接口和资源门的候选进入完整微调。官方8卡配置、20,000小时或跨本体成绩只作背景，不充当SO-101本地证据。`, sourceIds: ['grootPaper56', 'spiritModel56', 'lingbotPaper56'] },
        { heading: '03 第三阶段把V-JEPA放在慢规划或冻结probe位置', body: `V-JEPA可先作为冻结视频特征probe：在固定SO-101片段上预测任务阶段、接触前兆或目标相似度，并与当前VLA视觉特征比较。只有probe在独立场景稳定改善，且没有标签泄漏，才投入动作条件world model；再先做离线候选排序和反事实测试，最后才考虑异步慢规划器。

慢规划器不能阻塞20 Hz左右的直接policy。计划必须携带生成观测时间、目标、模型版本与最大年龄；快策略在计划过期或不确定时回退，而不是等待。论文的Franka图像目标结果没有自动迁移到SO-101关节空间；动作数据、相机、planner候选和安全闭环均需重新验证。`, sourceIds: ['vjepaPaper56', 'vjepaAc56'] },
        { heading: '04 晋级采用Pareto集合和硬安全门', body: `把每个候选写成向量：成功率下界越高越好，p99 action age、GPU小时、介入率和近失越低越好。若A在所有维度不差且至少一项更好，则A支配B；未被支配者组成Pareto集合。例：小模型下界0.62、p99 85 ms、6 GPU小时；大模型0.66、240 ms、28 GPU小时，两者互不支配，不能凭四个百分点直接宣布大模型胜。

Pareto只处理权衡，安全仍是硬门：任何新增碰撞/越界、观测年龄超过任务上限或动作adapter负测试失败都拒绝晋级。个人项目可预注册“LCB至少提高0.05且p99不超150 ms”的业务门；数值是项目假设而非硬件事实，必须由任务速度和现场安全协议确定。`, formulas: [{ latex: String.raw`A\succ B\iff \bigwedge_k f_k(A)\le f_k(B)\ \land\ \bigvee_k f_k(A)<f_k(B),\qquad \mathcal P=\{x:\nexists y,\ y\succ x\}`, explanation: '把所有指标先转成越小越好，例如用1-LCB表示失败风险；P是未被其他方案同时在全部指标上压过的候选集合。' }], sourceIds: ['behavior56'] },
        { heading: '05 双团队主线分别扩展环境与预测证据', body: `李飞飞相关线中，StanfordVL BEHAVIOR-1K/OmniGibson定义人类任务、BDDL初始/目标状态、仿真与Q-score，可把四个policy放到同一任务协议；World Labs R2S2R/Atlas负责从现实重建和生成空间、传感器、机器人与物理变体，并强调sim排序需真机校验。两者可共同扩展测试，但组织、产品和结论不能互相归属。

LeCun谱系中，Meta/FAIR V-JEPA 2/2.1、V-JEPA 2-AC与JEPA-WM提供已发表的表征预测和动作条件规划机制；AMI Labs是当前面向表征空间预测、动作条件world model、可靠性和安全的组织方向。后续课程会比较预测对象、动作入口和闭环规划，不会用人物履历替代机制，也不会把AMI愿景写成已开源SO-101模型。`, sourceIds: ['behavior56', 'r2s2r56', 'vjepaPaper56', 'ami56'] },
      ],
      points: ['先用SmolVLA建立可迭代闭环，再让大模型逐个回答明确假设。', 'V-JEPA先做冻结probe和离线规划，不直接替换高频policy。', 'Pareto处理资源—效果权衡，碰撞、过期与adapter错误仍是不可加权的硬门。'],
      codeTitle: 'promotion_gate.py · Pareto与安全硬门',
      code: [
        'def promote(base,cand,max_age=150):',
        '    required={"lcb","p99_ms","gpu_h","incidents"}',
        '    if set(base)!=required or set(cand)!=required: raise ValueError("report schema drift")',
        '    safe=cand["incidents"]==0 and cand["p99_ms"]<=max_age',
        '    evidence=cand["lcb"]-base["lcb"]>=.05',
        '    return safe and evidence',
        'base={"lcb":.58,"p99_ms":82.,"gpu_h":6.,"incidents":0}',
        'good={"lcb":.65,"p99_ms":130.,"gpu_h":24.,"incidents":0}',
        'unsafe={"lcb":.72,"p99_ms":120.,"gpu_h":24.,"incidents":1}',
        'stale={"lcb":.68,"p99_ms":220.,"gpu_h":18.,"incidents":0}',
        'assert promote(base,good) is True',
        'assert promote(base,unsafe) is False and promote(base,stale) is False',
        'try:',
        '    promote(base,{"lcb":.8})',
        '    raise AssertionError("partial report accepted")',
        'except ValueError: pass',
        'print("promotion gate: PASS")',
      ].join('\n'),
      codeNotes: ['0.05和150 ms是教学门槛，不是SO-101安全建议；真实值必须由任务频率、停止距离和现场协议预注册。', 'unsafe展示成功率更高也不能抵消一次安全事件，stale展示action age超限会被硬拒绝。', 'GPU小时被保存但不参与此单一晋级门；完整选型应在所有安全候选上再做Pareto分析。'],
      exercise: { prompt: '基线LCB=0.60、p99=90 ms、0事故；候选A为0.67/145 ms/0事故，B为0.75/110 ms/1事故，C为0.64/80 ms/0事故。按本课教学门决定晋级。', steps: ['先应用事故与150 ms硬门。', '再检查LCB至少提高0.05。', '说明C为何不能仅凭更快晋级。'], solution: 'A安全且LCB提高0.07，通过；B虽成功下界高但有事故，硬拒绝；C安全且更快，但LCB只提高0.04，未达到预注册证据门，保留为Pareto候选或继续收集数据，不能宣布性能晋级。' },
      quiz: { question: '个人SO-101项目为什么应把V-JEPA先放在冻结probe/慢规划，而不是直接替换动作policy？', hint: '比较预测对象、数据需求、频率和安全回退。', keywords: ['frozen probe', 'latent prediction', 'planner latency', 'fast policy', 'fallback'], reference: 'V-JEPA 2-AC预测候选动作后的future latent并通过planner选动作，不是可直接替换的SO-101 action head；还需目标、候选生成、DROID到SO-101动作适配与规划时延验证。先用冻结probe验证表征价值，再离线评估候选排序，最后以带年龄和回退的异步慢规划接入稳定快policy，能一次只验证一个假设并限制风险。' },
      sources,
    },
  },
};
