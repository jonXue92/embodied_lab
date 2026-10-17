import type { AuthoredDay } from './types';

const grootCommit = 'dac54b313160c201c450f97df0fd74ebd379c892';
const grootRoot = `https://github.com/NVIDIA/Isaac-GR00T/blob/${grootCommit}`;

const sources = [
  { id: 'grootReadme50', label: 'NVIDIA Isaac GR00T N1.7 README（固定提交）', url: `${grootRoot}/README.md`, reading: '2026-10-17 实读N1.7架构、输入、数据格式、硬件边界、推理与评测段：模型以Cosmos-Reason2-2B/Qwen3-VL为视觉语言骨干、flow-matching DiT为连续动作头；状态/动作上限扩至132维、模型动作horizon为40，并区分预测horizon与execution_horizon。' },
  { id: 'grootPaper50', label: 'GR00T N1 技术报告', url: 'https://arxiv.org/abs/2503.14734', reading: '2026-10-17 实读摘要、模型与数据章节：N1以视觉语言模块处理图像/文本，以扩散式动作模块生成连续动作；跨本体预训练来自多类机器人数据、合成数据与人类视频，论文结果受指定本体与评测协议约束。' },
  { id: 'dataConfig50', label: 'GR00T modality config 指南（固定提交）', url: `${grootRoot}/getting_started/data_config.md`, reading: '2026-10-17 逐节实读ModalityConfig：video/state/action/language四类键、delta_indices、sin-cos状态编码、ActionConfig的RELATIVE/ABSOLUTE与EEF/NON_EEF；action_configs必须与modality_keys同序，改变horizon后必须重算stats。' },
  { id: 'dataPrep50', label: 'GR00T 数据准备指南（固定提交）', url: `${grootRoot}/getting_started/data_preparation.md`, reading: '2026-10-17 实读LeRobot v2目录、meta/modality.json、任务文本和校验流程；modality.json描述数组切片和相机原始键，不能只靠列名猜动作语义。' },
  { id: 'so100Config50', label: 'GR00T SO-100 modality config（固定提交）', url: `${grootRoot}/examples/SO100/so100_config.py`, reading: '2026-10-17 实读SO-100示例配置：两路video、single_arm/gripper state与action、语言annotation、当前观测delta=0及未来动作窗口；它是SO-100接入示例，不是SO-101免适配保证。' },
  { id: 'processor50', label: 'Gr00tN1d7Processor 源码（固定提交）', url: `${grootRoot}/gr00t/model/gr00t_n1d7/processing_gr00t_n1d7.py`, reading: '2026-10-17 精读Gr00tN1d7Processor.__init__/__call__、validate_action_horizons、_get_vlm_inputs与Gr00tN1d7DataCollator：先做状态/动作语义转换与归一化，再拼接、补零、生成双轴action_mask，最后处理图像/文本并加入embodiment_id。' },
  { id: 'model50', label: 'Gr00tN1d7ForConditionalGeneration 源码（固定提交）', url: `${grootRoot}/gr00t/model/gr00t_n1d7/gr00t_n1d7.py`, reading: '2026-10-17 实读模型构造与prepare_input：backbone和action head分开构造，processor/collator输出进入backbone与动作头；源码接口证明processor是模型契约的一部分，而非可随意替换的图像预处理。' },
  { id: 'openLoop50', label: 'GR00T open_loop_eval.py（固定提交）', url: `${grootRoot}/gr00t/eval/open_loop_eval.py`, reading: '2026-10-17 实读开环评测入口：按traj读取真实观测、请求动作块、用execution_horizon选择执行/比较长度并输出预测与真值图；MSE只检查数据与动作接口，不替代仿真或真机任务成功。' },
  { id: 'behavior50', label: 'StanfordVL · BEHAVIOR Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '2026-10-17 复核BDDL目标、公开/隐藏实例、Q-score与计时规则；用于给GR00T或其他策略定义统一任务证据，不属于NVIDIA模型训练结论。' },
  { id: 'atlas50', label: 'World Labs · Atlas', url: 'https://www.worldlabs.ai/blog/atlas', reading: '2026-10-17 复核文本/图像/视频/3D共享空间上下文与RGB/depth传感器视图生成；属于World Labs空间生成/仿真线，不归属StanfordVL。' },
  { id: 'vjepa50', label: 'Meta/FAIR · V-JEPA 2 官方页', url: 'https://ai.meta.com/research/vjepa/', reading: '2026-10-17 复核冻结视频表征、动作条件世界模型与规划实验；属于Meta/FAIR历史谱系，不是GR00T动作processor，也不自动归为AMI发布。' },
  { id: 'ami50', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '2026-10-17 复核表征空间预测、动作条件世界模型、可靠性与安全目标；当前方向页不能充当已发布SO-101模型或GR00T对比结果。' },
];

export const day50: AuthoredDay = {
  reviewedAt: '2026-10-17', revision: '逐课编写 1.0',
  deliverable: '一张GR00T视频—状态—语言—动作时序契约图；一个复刻processor补零与双轴mask语义的PyTorch夹具；一份“数据契约→开环→仿真→真机”分层验证卡。三课共100分钟，另留20分钟复盘。',
  question: {
    title: '把SO-101轨迹转换成LeRobot目录并能被GR00T读入，是否已经证明动作语义正确？',
    summary: '从键存在、切片顺序、相对参考、时间窗口、统计版本和闭环方向逐层反证。',
    keywords: ['modality.json', 'ActionConfig', 'relative action', 'delta_indices', 'statistics', 'closed-loop'],
    reference: '没有。能读取只证明文件与部分shape兼容；仍需核对meta/modality.json切片、modality_keys与action_configs同序、RELATIVE动作引用的state_key、单位/坐标系/正方向、delta_indices与statistics.json的horizon一致，以及反归一化后的命令在仿真/离线夹具中方向正确。最后还要用安全的闭环评测验证，因为开环MSE和无报错都不能发现所有控制语义错误。',
  },
  lessons: {
    foundation: {
      title: 'GR00T的输入、动作与数据：先把跨本体问题写成契约', minutes: 35,
      prerequisites: '理解10-15的异构动作语义、10-16的数据混合、10-19的大/小VLA资源边界；会读张量shape、坐标系和action chunk。',
      connection: '前一日决定模型规模时强调同一数据与动作协议；今天拆开GR00T N1.7究竟读取什么、预测什么。10-21将继续追踪微调dataset adapter与embodiment tag，今天的契约图就是其输入。',
      intro: 'GR00T把多类机器人的视频、状态、语言和连续动作放进统一模型，但“统一”不是删除差异。真正可迁移的是显式记录的模态、时间、动作表示和本体身份；任何缺失都可能让训练正常下降、部署却反向运动。',
      outcomes: ['说清四类模态及其时间轴', '区分relative EEF、relative joint与absolute gripper语义', '用horizon、频率和统计版本推导动作块的物理时间范围'],
      sections: [
        { heading: '01 四种模态不是四个文件夹，而是一份同步契约', body: 'N1.7官方仓库把modality config分成video、state、action和language。video列出front、wrist等视角；state是当前本体量；language指向任务annotation；action是未来控制目标。meta/modality.json再把逻辑键映射到parquet数组切片或视频原始键。两层缺一不可：前者决定模型取哪些量，后者决定这些量在文件里在哪里。\n\ndelta_indices把每一类模态放到相对当前帧t的时间轴。官方指南推荐图像和状态使用[0]，动作使用从0开始的未来窗口；负索引虽然加载器支持，但当前N1.7配置并未普遍采用。若相机帧来自t-2、state来自t而仍都标成0，目录完全可读却产生伪同步，模型只能用噪声相关性补偿。', sourceIds: ['grootReadme50', 'dataConfig50', 'dataPrep50'] },
        { heading: '02 动作统一靠显式表示，不靠把向量补到132维', body: 'ActionConfig至少要回答rep、type、format和可选state_key。RELATIVE表示相对参考状态的增量，ABSOLUTE表示目标本身；EEF通常由位置加旋转表示构成，NON_EEF覆盖关节或夹爪等量。action_configs列表必须与modality_keys同序，否则夹爪可能被错误套用机械臂的relative变换，shape仍然合法。\n\nN1.7强调relative EEF把人类与机器人动作置于较一致的局部变化空间，但这不意味着所有维度都应做差。夹爪开合常保留absolute语义，关节与末端也必须写清单位、参考帧和旋转格式。对SO-101，SO-100示例只能帮助理解配置结构；电机映射、关节数、零位与命令接口仍需项目自己的离线manifest核验。', sourceIds: ['grootReadme50', 'dataConfig50', 'so100Config50'] },
        { heading: '03 action horizon是时间范围，execution horizon是闭环承诺', body: '若动作delta_indices为0到H-1，采样频率为f Hz，则预测块覆盖约H/f秒。N1.7模型上限horizon为40；在30Hz下40步约1.33秒。部署时execution_horizon=K表示一次请求后实际取前K步再重规划：K=8只承诺执行约0.27秒，并不把模型输出shape改成8。\n\nK越大，网络和推理开销摊薄，但后半块动作基于更旧观测；K越小，反馈更新更快，却提高调用频率和队列抖动。数据里的H、模型max_action_horizon和部署K必须分别记录。把三者都叫chunk_size，会掩盖“训练40步、执行8步、统计文件却按16步生成”的错误。', formulas: [{ latex: String.raw`T_{\mathrm{pred}}=\frac{H}{f},\qquad T_{\mathrm{open}}=\frac{K}{f},\quad 1\le K\le H`, explanation: 'H是预测horizon，K是每次闭环实际执行步数，f为控制频率。H=40、K=8、f=30Hz时，预测1.33秒、开环执行0.27秒。' }], sourceIds: ['grootReadme50', 'dataConfig50'] },
        { heading: '04 统计文件属于数据版本，不是可复用常数', body: 'GR00T指南明确：改变action delta_indices后必须重算统计量，因为relative_stats.json含逐horizon位置的统计，shape随H变化。相机选择、动作切片或relative参考发生变化，也应更新数据身份；否则旧统计可能广播成功，却把不同物理量压到错误尺度。\n\n最小数据身份证应包含数据commit或哈希、modality.json哈希、config哈希、统计文件哈希、采样频率、动作单位/坐标系和embodiment tag。训练checkpoint再绑定这组身份。这样开环异常时可以判断是模型退化，还是统计与horizon漂移，而不是反复调学习率掩盖输入错误。', sourceIds: ['dataConfig50', 'dataPrep50'] },
      ],
      points: ['可读取不等于语义正确，键、切片、时间与坐标都要审计。', '132维是容量上限；有效维度必须由mask和本体配置定义。', 'H、K与统计版本分别管理。'],
      codeTitle: 'temporal_contract.py · 原创horizon与统计身份检查',
      code: String.raw`def temporal_contract(horizon,execute,fps,stats_horizon):
    if not all(isinstance(x,int) for x in (horizon,execute,stats_horizon)):
        raise TypeError("horizons must be integers")
    if fps <= 0 or not 1 <= execute <= horizon <= 40:
        raise ValueError("invalid temporal contract")
    if stats_horizon != horizon:
        raise ValueError("statistics were built for another horizon")
    return round(horizon/fps,3),round(execute/fps,3)

assert temporal_contract(40,8,30,40)==(1.333,.267)
try:
    temporal_contract(40,8,30,16)
    raise AssertionError("stale statistics accepted")
except ValueError as e:
    assert "statistics" in str(e)
print("GR00T temporal contract: PASS")`,
      codeNotes: ['40来自N1.7模型动作horizon上限；真实本体可使用更短窗口。', '预测时间与实际开环时间分开返回，避免把execution_horizon误当输出长度。', '负例让16步统计不能用于40步动作，代表官方指南要求的重算门。'],
      exercise: { prompt: '25Hz数据用H=32训练，部署每次执行K=5。预测覆盖和开环时间各是多少？若统计来自H=16，应怎么处理？', steps: ['分别计算H/f与K/f。', '判断stats_horizon是否等于H。'], solution: '预测覆盖32/25=1.28秒，开环执行5/25=0.20秒。16步统计与32步动作不一致，不能裁剪或广播冒充兼容；应按32步配置重新运行官方stats流程并绑定新哈希。' },
      quiz: { question: '为什么两个动作张量都是[B,40,132]，仍可能代表完全不同的机器人控制问题？', hint: '有效维、参考状态和坐标语义没有编码在shape里。', keywords: ['action mask', 'ActionConfig', 'state_key', 'coordinate frame', 'embodiment tag'], reference: '补零后的公共shape只提供容器。有效horizon和维度由mask决定，ActionConfig决定RELATIVE/ABSOLUTE、EEF/NON_EEF与旋转格式，state_key给出相对参考，坐标/单位来自数据契约，embodiment tag选择对应投影与统计；这些不同会让同shape动作产生完全不同物理命令。' },
      sources: sources.slice(0, 5),
    },
    code: {
      title: '源码精读：Gr00tN1d7Processor如何把本体差异变成张量与mask', minutes: 40,
      prerequisites: '会使用PyTorch tensor，理解归一化、padding、boolean mask和batch/time/dimension三条轴。',
      connection: '基础课定义了四模态契约；本课沿固定提交追踪StateActionProcessor→Gr00tN1d7Processor.__call__→VLM processor/collator→模型输入。10-21再把这条链延伸到多dataset adapter与训练入口。',
      intro: 'processor不是“把图片resize一下”。它同时承担动作语义转换、统计归一化、公共shape、有效位置mask、图文模板和embodiment identity。理解这段代码，才能判断一条新本体数据究竟在哪里被改变。',
      outcomes: ['按真实函数顺序解释processor调用链', '区分horizon mask与dimension mask', '运行一个标明简化范围的PyTorch双轴mask夹具'],
      sections: [
        { heading: '01 构造期先拒绝horizon越界，再加载本体映射', body: 'Gr00tN1d7Processor.__init__先parse modality configs，并构造StateActionProcessor；validate_action_horizons逐本体读取action.delta_indices，若超过max_action_horizon就立刻报错。这个检查发生在首个forward之前，避免模型和数据都加载后才因50步本体遇到40步模型而失败。\n\nembodiment_id_mapping把物理本体映射到动作投影索引。源码只允许确属同一物理本体的数据源或子任务共享index，并检查重复映射。它不是任务类别：同一机器人不同数据源可共享，新的机械结构却不能因为动作维度相同就借用旧index。', sourceIds: ['processor50'] },
        { heading: '02 __call__先处理物理语义，再处理公共shape', body: '进入__call__后，StateActionProcessor.apply先依据配置对state/action做relative转换与归一化。随后源码按modality_keys固定顺序拼接动作，记录真实action_dim，再补零到max_action_dim；时间轴也补到max_action_horizon。action_mask先全1，再把真实horizon之后和真实维度之后设0，因此它是二维有效域，不只是长度mask。\n\n状态按state_keys拼接并补到max_state_dim；训练时还可做state dropout。动作缺失只允许推理态，训练态会断言失败。这个顺序很重要：若先补零再归一化，填充值可能被变成非零；若先丢掉key边界再做relative转换，就不知道哪段动作引用哪段state。', sourceIds: ['processor50', 'dataConfig50'] },
        { heading: '03 图像、语言和本体ID在同一返回字典会合', body: '源码按配置的image_keys取多视角图像，对同一样本的时序/视角应用变换，再交给Qwen3-VL processor。language可统一小写并去标点，训练collator使用同一processor做chat template、padding和batch。最终输入同时包含state、可选action、图文token、action_mask和embodiment_id。\n\n因此相机数量变化不仅改变像素张量，也改变图文token长度和推理成本；语言清洗策略变化会改变token；本体映射变化会改变动作投影。复现实验应把processor_config.json、statistics.json和embodiment_id.json与checkpoint一起保存，源码from_pretrained正是按这三类文件恢复。', sourceIds: ['processor50', 'model50'] },
        { heading: '04 教学夹具只复刻padding/mask，不冒充上游processor', body: '下面代码接收已经完成物理语义转换和归一化的动作块，只复刻两次补零与二维mask。输入形状[H,D]，输出固定[max_h,max_d]；mask仅在左上H×D为真。用mask计算损失后，补零位置即使预测巨大也不影响结果。\n\n它没有实现EEF旋转、relative reference、百分位统计、图像增强、Qwen tokenizer或embodiment projector，因此不能替代GR00T源码。正例验证有效域损失，负例故意传入超horizon并要求拒绝；这比只打印shape更能检查控制语义是否泄漏到padding。', sourceIds: ['processor50'] },
      ],
      points: ['语义转换与归一化发生在padding之前。', 'action_mask同时覆盖时间轴和动作维轴。', 'processor配置、统计和本体映射必须随checkpoint保存。'],
      codeTitle: 'pack_action.py · PyTorch双轴mask教学夹具',
      code: String.raw`import torch

def pack_action(action,max_h=4,max_d=6):
    if action.ndim != 2:
        raise ValueError("action must be [H,D]")
    h,d=action.shape
    if h < 1 or d < 1 or h > max_h or d > max_d:
        raise ValueError("action exceeds model contract")
    packed=torch.zeros(max_h,max_d,dtype=action.dtype)
    mask=torch.zeros(max_h,max_d,dtype=torch.bool)
    packed[:h,:d]=action
    mask[:h,:d]=True
    return packed,mask

action=torch.tensor([[1.,2.,3.],[4.,5.,6.]])
target,mask=pack_action(action)
pred=target.clone(); pred[~mask]=999.
loss=((pred-target).square()*mask).sum()/mask.sum()
assert target.shape==(4,6) and mask.sum().item()==6
assert loss.item()==0
try:
    pack_action(torch.zeros(5,3))
    raise AssertionError("oversized horizon accepted")
except ValueError: pass
print("two-axis action mask: PASS")`,
      codeNotes: ['输入已假设归一化完成，明确不复刻完整StateActionProcessor。', '2步×3维只有6个有效元素；999填在padding区也被mask排除。', '负例拒绝5步输入进入4步模型，呼应validate_action_horizons的fail-fast语义。'],
      exercise: { prompt: '动作真实shape为[3,4]、公共shape为[5,7]。mask真值数量是多少？若只做[5]时间mask，会漏掉什么错误？', steps: ['计算H×D。', '比较一维时间mask与二维mask。'], solution: '二维mask有3×4=12个真值。一维时间mask只能屏蔽第4、5步，无法屏蔽前三步中第5至7个补零维度；这些无物理意义的维度会进入loss并迫使模型拟合padding。' },
      quiz: { question: '为什么应在relative转换和归一化后再补零，而不是先把所有本体pad到132维？', hint: '统计与参考状态只对真实物理维度有定义。', keywords: ['StateActionProcessor', 'normalization', 'relative reference', 'padding', 'action mask'], reference: 'relative动作需要逐key找到参考state，归一化需要逐物理维的统计；padding维没有单位、参考或统计。先补零会让虚拟维参与变换，可能生成非零值或错误广播。源码先按key处理真实维，再拼接、补零并用二维mask声明有效域。' },
      sources: sources.slice(2, 8),
    },
    insight: {
      title: 'NVIDIA数据—仿真生态：分层连接，不把“可接入”写成“已迁移”', minutes: 25,
      prerequisites: '已完成当天契约图和processor夹具；理解开环误差、仿真成功率与真机成功率回答不同问题。',
      connection: '把GR00T数据/模型接口接到评测路线：文件校验→开环动作→Isaac或其他仿真→受控真机。10-21微调接口课会在前两层继续展开，后续仿真单元再处理动力学与域差距。',
      intro: 'NVIDIA生态的工程价值在于模型、数据、部署和仿真有明确接点，但每个接点都只消除一类不确定性。把数据读通、TensorRT跑快或仿真成功直接写成SO-101真机能力，会把集成证据夸大成迁移证据。',
      outcomes: ['设计四层逐级验收而不连接真实机械臂', '用配对增益差识别仿真收益是否保留到真实域', '说明双团队世界模型/评测线在GR00T路线中的正确位置'],
      sections: [
        { heading: '01 第一层证明数据契约，第二层证明模型接口', body: '层A只做静态审计：meta/modality.json键与切片存在，config顺序、horizon、stats哈希和embodiment tag匹配，并从若干episode反归一化检查单位与方向。层B用open_loop_eval在固定轨迹比较预测和专家动作，同时保存每一维误差与可视化。两层都不需要控制机械臂。\n\n开环MSE低只说明在专家状态分布附近动作接近，无法观察错误动作导致的后续分布偏移。相反，MSE较高也可能来自多模态有效动作。因此层B的核心价值是暴露符号、尺度、时间错位和mask错误，不是作为最终任务排行榜。', sourceIds: ['dataPrep50', 'openLoop50'] },
        { heading: '02 第三层验证闭环任务，第四层才讨论真实部署', body: '层C在Isaac、LIBERO或其他可控环境执行闭环，固定初始实例、随机种子、控制频率、execution_horizon和超时，记录成功、恢复、碰撞与动作年龄。NVIDIA仓库提供server-client和仿真接入点，但不同benchmark前缀与embodiment tag必须显式映射；“用了Isaac”不自动获得真实传感器噪声或执行器延迟。\n\n层D真机只在用户自行完成硬件安全检查后执行，本自动任务不连接机械臂。先用低速、限位、急停和保守任务验证少量回合，再扩大扰动。SO-100示例能帮助写SO-101 adapter，却不能替代电机型号、标定、关节方向和相机时延的重新核验。', sourceIds: ['grootReadme50', 'so100Config50'] },
        { heading: '03 用配对增益差判断“仿真领先”有没有迁移', body: '比较GR00T候选G和既有小VLA基线B时，不看各自最好视频。固定数据与评测实例，分别计算仿真成功差Δsim和真机成功差Δreal，再看配对增益差D=Δsim-Δreal。例：仿真G/B为0.80/0.65，真机为0.55/0.50，则Δsim=0.15、Δreal=0.05、D=0.10；候选仍领先，但三分之二的仿真增益没有保留。\n\nD不是因果证明，也不带置信区间；回合少时必须报告成功计数和区间。它的作用是迫使报告同时出现基线、两个域和相同协议。若只给G的仿真0.80与B的真机0.50，域差和模型差完全混在一起，不能支持路线切换。', formulas: [{ latex: String.raw`D=(S_{G,sim}-S_{B,sim})-(S_{G,real}-S_{B,real})`, explanation: 'D衡量候选相对基线的仿真增益比真机增益多多少；示例D=(0.80-0.65)-(0.55-0.50)=0.10，说明部分相对收益未迁移。' }] },
        { heading: '04 双研究主线用于扩展问题，不替NVIDIA背书', body: 'StanfordVL的BEHAVIOR-1K/OmniGibson可以提供BDDL任务、隐藏实例、部分成功和严格计时，适合作为层C的可审计评测；World Labs Atlas/R2S2R可生成或重建空间与传感器视角变体，适合作压力测试。两者都不能被写成GR00T在SO-101上的官方成功证据，World Labs也不属于Stanford实验室。\n\nMeta/FAIR的V-JEPA 2/2.1、V-JEPA 2-AC与JEPA-WM关注表征预测和动作条件规划，可作为额外冻结probe或慢规划对照；AMI Labs当前只按其表征空间预测、动作条件世界模型与可靠性方向记录。不能把Meta历史成果冒充AMI已发布模型，也不能把JEPA特征与GR00T processor混称为同一种world model接口。', sourceIds: ['behavior50', 'atlas50', 'vjepa50', 'ami50'] },
      ],
      points: ['数据、开环、仿真和真机四层分别回答不同问题。', '同基线同协议的跨域配对差比单个成功率更诚实。', '生态连接能力不是跨域成功证明。'],
      codeTitle: 'transfer_audit.py · 原创配对增益差审计',
      code: String.raw`def transfer_gap(g_sim,b_sim,g_real,b_real):
    values=(g_sim,b_sim,g_real,b_real)
    if any(not 0 <= x <= 1 for x in values):
        raise ValueError("success rates must be in [0,1]")
    sim_gain=g_sim-b_sim
    real_gain=g_real-b_real
    return round(sim_gain,3),round(real_gain,3),round(sim_gain-real_gain,3)

assert transfer_gap(.80,.65,.55,.50)==(.15,.05,.10)
assert transfer_gap(.60,.60,.45,.45)==(0.,0.,0.)
try:
    transfer_gap(1.2,.5,.4,.3)
    raise AssertionError("invalid rate accepted")
except ValueError: pass
print("paired sim-real gain audit: PASS")`,
      codeNotes: ['四个成功率必须来自同数据身份、同任务分层与同回合口径。', 'D=0不等于绝对性能高，只表示相对基线增益在两域相同。', '本函数不计算置信区间，正式报告还需保存成功次数与总回合数。'],
      exercise: { prompt: '若G/B仿真成功率0.72/0.60，真机0.58/0.42，D是多少？这支持什么、不能支持什么？', steps: ['计算两个域的相对增益。', '用D解释增益保留而非绝对能力。'], solution: 'Δsim=0.12，Δreal=0.16，所以D=-0.04；候选相对基线的真机增益反而多4个百分点。它支持“相对收益没有在真机缩水”的描述，但没有回合数、置信区间和安全事件时，不能宣称候选显著更好或可直接部署。' },
      quiz: { question: '为什么GR00T在Isaac仿真中闭环成功，仍不足以证明SO-101真机可用？', hint: '列出仿真没有自动覆盖的真实契约。', keywords: ['calibration', 'latency', 'sensor noise', 'actuator dynamics', 'safety gate'], reference: '仿真可验证policy接口和闭环趋势，但真实相机标定/曝光/延迟、关节零位与方向、摩擦和回程间隙、网络与推理长尾、限位和急停都可能不同。必须先绑定SO-101数据/动作契约，再做低速安全真机回合并与相同基线比较；本自动任务不会代替用户执行。' },
      sources,
    },
  },
};
