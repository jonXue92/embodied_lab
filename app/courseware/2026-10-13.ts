import type { AuthoredDay } from './types';

const paper = { id: 'pi0Paper43', label: 'Physical Intelligence · π0 原论文 v1', url: 'https://arxiv.org/html/2410.24164v1', reading: '§IV 架构、§V 数据配方及附录 A-B/A-D；2026-10-10 阅读。论文时间符号与 openpi 实现方向不同，明天用端点测试核对。' };
const model = { id: 'pi0Model43', label: 'openpi · Pi0 模型', url: 'https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/models/pi0.py', reading: '2026-10-10 核对 __init__、embed_prefix、embed_suffix、make_attn_mask、compute_loss、sample_actions；main 是可变入口，未将其宣称为固定 SHA。' };
const gemma = { id: 'pi0Gemma43', label: 'openpi · 双专家 Attention', url: 'https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/models/gemma.py', reading: 'get_config 的 gemma_2b/gemma_300m 与 Attention.__call__：各自 QKV 投影、拼接、共享注意力、各自输出投影。main 核对日期 2026-10-10。' };
const config = { id: 'pi0Config43', label: 'openpi · Pi0Config', url: 'https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/models/pi0_config.py', reading: 'Pi0Config.__post_init__、inputs_spec、get_freeze_filter；区分 pi05=False/True 的状态与时间注入。2026-10-10 核对 main。' };
const train = { id: 'pi0Train43', label: 'openpi · 训练配置入口', url: 'https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/training/config.py', reading: 'TrainConfig、trainable_filter、pi0_aloha/pi0_droid 与 LeRobotDROIDDataConfig.create；模型配置不等于完整数据适配。2026-10-10 核对 main。' };
const behavior = { id: 'behavior43', label: 'StanfordVL · BEHAVIOR 评测协议', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: 'Running Evaluations 与 Optional action-chunk replay protocol：策略输入、动作接口、重规划边界；延伸阅读，2026-10-10。' };
const worlds = { id: 'worlds43', label: 'World Labs · Real-to-Sim-to-Real', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: 'Real-to-Sim 与 Evaluation：重建交互世界、仿真/真实策略排序；是 World Labs 的项目报告，非 Stanford 基准结论。' };
const jepa = { id: 'jepa43', label: 'Meta · V-JEPA 2 官方项目', url: 'https://ai.meta.com/research/vjepa/', reading: 'Model architecture 与 Planning for robotic control；区分无动作视频预训练和机器人数据适配。历史 Meta/FAIR 成果，非 AMI 发布。' };
const ami = { id: 'ami43', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '2026-10-10 阅读 representation-space prediction 与 action-conditioned world models；官网愿景不作为模型评测结果。' };

export const day43: AuthoredDay = {
  reviewedAt: '2026-10-10', revision: '逐课编写 1.0',
  deliverable: '一张 π0 双专家张量流图、一份 prefix/state/action 可见性矩阵及反例测试、一份带冻结范围和评测切片的个人迁移实验卡。',
  question: {
    title: 'π0 的 VLM 宽度 2048、动作专家宽度 1024，为什么仍能交换信息？把整段序列改为下三角 mask 又会改变什么？',
    summary: '从隐藏宽度、注意力投影与分组可见性解释架构，而不是只比较参数量。',
    keywords: ['QKV', 'head dimension', 'prefix', 'bidirectional chunk', 'state token', 'cache'],
    reference: '两组 token 使用不同参数投影到兼容的注意力头空间，再沿序列轴合并 Q/K/V，输出按 token 所属专家映射回各自宽度。隐藏宽度无需相同，但头维度与相关头数必须满足实现契约。π0 prefix 内部双向，state 可见 prefix 和自身，action chunk 内部双向且可见条件；全下三角会阻断较早动作 token 读取较晚动作 token，改变联合去噪结构，也限制 prefix 内部交互。缓存正确性依赖 prefix 不读取不断变化的动作输入，而不只依赖 shape。',
  },
  lessons: {
    foundation: {
      title: 'π0 的视觉语言与动作专家：不同宽度怎样共享注意力', minutes: 34,
      prerequisites: '已理解 SmolVLA 的 prefix/suffix、线性投影、attention mask、action chunk 和部署契约。',
      connection: '10-12 已完成小模型部署链；今天进入 π0 单元，先理解双专家架构。10-14 再推导流目标和反向时间积分，10-15 将处理跨机器人动作映射。',
      intro: '本课把 π0 拆成具名输入、按 token 类型选择的参数与连续动作输出。重点是怎样把语义条件送入动作计算，而不是把两个网络简单串接，或把参数多当作控制可靠性的证据。',
      outcomes: ['区分视觉编码器、语言骨干、动作专家与输出投影', '解释不同隐藏宽度与兼容注意力头之间的关系', '手算 prefix/state/action 可见性并理解缓存成立条件'],
      sections: [
        { heading: '01 先区分条件、待生成变量和标签', body: '在机器人时刻 k，条件包含多视角图像 I_k、指令文本 l_k 和本体状态 q_k；待生成变量是未来 H 步动作组成的矩阵 A_k，而训练标签来自演示中的对应片段。图像 patch 和文字 token 提供条件，带噪动作 token 表示正在求解的变量。它们都占序列位置，却不意味着数值单位、监督目标或参数组相同。\n\n实际阅读从 Pi0.embed_prefix 开始：逐相机编码图像，再拼接文字嵌入与有效性 mask。embed_suffix 在 pi05=False 时添加一个连续状态 token，再构造 H 个动作 token；动作维度是每个时间位置的特征轴，并不是再展开成 H×d 个语言词。这能解释为什么扩大 chunk 长度和扩大动作维度会带来不同的计算变化。', sourceIds: ['pi0Model43', 'pi0Paper43'] },
        { heading: '02 专家由 token 类型指定，不是动态挑选 top-k', body: 'openpi 的 Gemma 配置给语言骨干与动作专家各自的隐藏宽度、前馈层和投影参数。当前默认配置中宽度分别为 2048 与 1024，注意力头维度均为 256、query 头数为 8、KV 头数为 1。这里的 expert 可理解为不同种类 token 所走的参数通路，不能自动套用稀疏 MoE 的路由器、负载均衡或只激活一个专家等结论。\n\n为何两种宽度还能交流？每组先把自己的隐藏向量投影到兼容的 Q/K/V 空间，再沿序列轴拼接；注意力得到的结果最后按原 token 分段，通过对应输出投影回到各自宽度。单头教学例中，视觉 x∈R²、动作 y∈R³ 都可分别投影成 R² 的 query/key；只有投影后的内积维度必须相等，原始隐藏宽度无须一致。', sourceIds: ['pi0Gemma43', 'pi0Config43'], formulas: [{ latex: String.raw`Q_r=X_rW^Q_r,\quad K_s=X_sW^K_s,\quad S_{rs}=\frac{Q_rK_s^\top}{\sqrt{d_h}}+M_{rs}`, explanation: 'r、s 表示 token 所属通路；W 将各自宽度映射到每头 d_h 维，S 为无量纲分数。M 在允许处为0、屏蔽处为负无穷（实现可用很大的负数）。单头 q=(1,0)、k=(2,1)、d_h=2 时未加 mask 的分数为 √2。' }] },
        { heading: '03 三个可见性分组决定信息方向', body: '把 prefix、state、action 的累计组号记成 0、1、2。query 可以看见组号不大于自己的有效 key，于是图像和语言在 prefix 内双向交流，状态读取 prefix 与自己，整段动作读取全部条件和其他动作位置。第一个动作可以读取最后一个带噪动作，这不是偷看未来真值，因为推理时所有动作位置都是待更新的随机变量。\n\n将 mask 改成普通语言模型的逐 token 下三角，会切断动作片段内部的部分耦合，并使图像/文字的条件编码方式改变。反过来，全双向会让 prefix 依赖每一步变化的带噪动作；这时复用旧 prefix KV cache 会产生不一致。可见性矩阵因此既是建模假设，也是缓存正确性的依赖证明，不能只在 shape 对上后忽略。', sourceIds: ['pi0Model43'] },
        { heading: '04 π0、π0.5 和个人适配的边界', body: '当前同一个 Pi0 类包含 pi05 分支：π0 使用连续状态 suffix 和动作/时间拼接 MLP；π0.5 的状态输入转到离散 prompt 路径，时间通过 adaRMS 条件进入动作专家。读到同名文件不等于正在读同一模型，要同时固定配置、权重、数据 transform 与分支。今天例子明确只解释 pi05=False 的可见性结构。\n\n在 SO-101 上，把 state/action 补齐到配置维度只解决存储形状，不会自动建立关节含义、归一化或控制周期对应。用户可先用自有离线样本画张量流、检查相机缺失 mask，再比较同一数据下的冻结范围。RAW 若未经验证直接替代预训练 RGB，会改变感知分布；应先做可逆预处理与冻结表征探针，不能把前向能运行当作语义对齐。', sourceIds: ['pi0Config43', 'pi0Train43'] },
      ],
      points: ['隐藏宽度与注意力头维度是不同的契约。', '按 token 类型使用专家参数，不等同于动态稀疏路由。', 'prefix 的单向依赖关系允许缓存，动作内部仍是双向联合更新。'],
      codeTitle: 'expert_projection.py · 原创单头维度与数值检查',
      code: ['import torch', 'import math', 'def score(x,y,wq,wk):', '    if x.shape[-1]!=wq.shape[0] or y.shape[-1]!=wk.shape[0]: raise ValueError("input width")', '    if wq.shape[1]!=wk.shape[1]: raise ValueError("head width")', '    return (x@wq)@(y@wk).T / math.sqrt(wq.shape[1])', 'x=torch.tensor([[1.,0.]])', 'y=torch.tensor([[2.,1.,9.]])', 'wq=torch.eye(2)', 'wk=torch.tensor([[1.,0.],[0.,1.],[0.,0.]])', 'assert torch.allclose(score(x,y,wq,wk),torch.tensor([[math.sqrt(2.)]]))', 'try:', '    score(x,y,wq,torch.ones(3,3))', '    raise AssertionError("incompatible head accepted")', 'except ValueError: pass', 'print("different expert widths, compatible head: PASS")'].join('\n'),
      codeNotes: ['x、y 隐藏宽度分别为 2、3；两套矩阵将它们映射成相同的每头 2 维。', 'score 只演示 QK 内积，不实现 RoPE、GQA、softmax、残差或真正 π0 权重。', '负例把 key 投影宽度改为 3，必须显式拒绝；程序全程只使用内存张量。'],
      exercise: { prompt: '某教学模型两专家宽度为 6、4，每头维度为 2，单头 WQ、WK 的 shape 各是什么？两种宽度能直接沿序列拼接吗？', steps: ['先按各自输入宽度写投影矩阵。', '再比较投影前后最后一维。'], solution: 'WQ 可为 [6,2]、WK 为 [4,2]；原始 [B,L1,6] 与 [B,L2,4] 无法沿序列轴直接拼接，投影后最后一维均为 2，才可在相应 Q/K 流中拼接并计算注意力。' },
      quiz: { question: 'π0 的较早动作 token 看见较晚带噪动作，为什么不属于未来标签泄漏？', hint: '区分待求解变量与演示真值。', keywords: ['noisy action', 'joint generation', 'mask', 'ground truth', 'inference'], reference: '推理时整个 chunk 从噪声初始化，各位置都是同时更新的待求解变量，而非已经观测到的未来真值。双向读取允许联合建模相关动作；若把真实未来演示直接放入推理条件，才构成不合法信息泄漏。' },
      sources: [paper, model, gemma, config, train],
    },
    code: {
      title: '沿 openpi 配置到 Pi0：用分组 mask 验证调用链', minutes: 40,
      prerequisites: '会读 dataclass、布尔张量广播与 Q/K 轴，已完成今日架构课。',
      connection: '将基础课的三组可见性变成可运行测试；明天沿同一 compute_loss/sample_actions 入口检验 flow 的符号、归约轴与步进方向。',
      intro: '精读不是从文件第一行一路背到最后一行。先确定配置选中哪个分支，再检查各函数承诺的张量、mask 和副作用。今天实现的是独立的依赖矩阵审计器，不加载大模型，也不调用策略服务器或机械臂。',
      outcomes: ['定位模型配置与数据配置的分工', '由 cumulative group 推出 query-key 布尔矩阵', '用 padding、分组边界和转置反例验证可见性'],
      sections: [
        { heading: '01 配置名不是模型的全部身份', body: '从 training/config.py 中选中的 TrainConfig 进入 model 字段，Pi0Config.create 才创建 Pi0。action_dim、action_horizon、max_token_len 控制数值接口，paligemma_variant 与 action_expert_variant 控制网络规格；data、assets、weight_loader 又决定输入适配、统计量与权重。只记录 pi0_droid 字符串，会漏掉实际训练数据和覆盖参数。\n\n例如当前 pi0_droid 配置把 horizon 设为 10，而 Pi0Config 默认 horizon 为 50。两者均使用 π0 架构，却拥有不同输出跨度。LeRobotDROIDDataConfig 的注释还说明该路径假设关节速度动作，不应额外做位置差分。迁移 SO-101 时必须读实际 adapter，不能因为关节数接近就直接继承 DROID 的动作语义。', sourceIds: ['pi0Train43', 'pi0Config43'] },
        { heading: '02 prefix/suffix 分别输出什么', body: 'embed_prefix 返回 tokens、input_mask 和 ar_mask。前者是特征，第二个标识有效位置，第三个标识分组起点；ar_mask 的 True 并非“该 token 无效”。embed_suffix 在 π0 分支先放状态，再放 H 个动作，组起点分别为 True 和 True，动作组后续位置为 False，所以累计求和才能恢复组号。\n\ncompute_loss 合并前后两组有效位，再由 make_attn_mask 生成 [B,L,L] 的 query-key 关系；positions 由有效位累计值构造。实际注意力层还检查带 head 广播维的 mask shape。教学实现保留 [B,L,L]，省略位置编码与专家特征，专门检验可见性语义，不能用它声称已经复现了模型精度。', sourceIds: ['pi0Model43', 'pi0Gemma43'] },
        { heading: '03 广播方向最容易产生静默错误', body: '代码中的 group[:,None,:] 是 key 轴组号，group[:,:,None] 是 query 轴组号；前者小于等于后者才表示“后组读取前组”。若反过来比较，shape 完全不变，却允许 prefix 读取动作而阻止动作读取条件。只测试输出矩阵尺寸无法捕获这种错误，必须测试有方向的信息边。\n\n本例序列为两个 prefix 位置、一个 state、两个 action。正例要求 prefix→action 禁止、action→prefix 允许，且两个 action 互相可见。故意对矩阵转置的反例应失败；这类测试比全零随机输入上的前向 smoke test 更有意义，因为它直接对应架构声称的信息依赖。', sourceIds: ['pi0Model43'] },
        { heading: '04 padding 同时屏蔽 query 和 key', body: '有效位与分组规则是两个独立条件。把第二个 prefix token 标为 padding，应使对应行与列都不参与有效注意力，而不是只清掉一列。本课返回布尔矩阵，不对全屏蔽的 query 行执行 softmax；若扩展到真实 attention，还要明确无效行输出的处理方式，避免全负无穷引起 NaN。\n\n缓存阶段只编码 prefix；后续 suffix 查询拼接 prefix cache 与当前 suffix key/value。只要 prefix 不依赖动作，每个 flow 步就能复用同一份条件编码。但改变相机、prompt、图像有效位或模型权重后都需要重建缓存；“相同 batch shape”不能用作 cache key。今天测试保证结构前提，明天再检验数值更新。', sourceIds: ['pi0Model43'] },
      ],
      points: ['ar_mask 表示新分组，而不是 padding。', '比较两端轴的方向决定动作能否读到条件。', '缓存需要内容与依赖一致，不能只比较张量尺寸。'],
      codeTitle: 'pi0_group_mask.py · 原创可见性与 padding 审计',
      code: ['import torch', 'def group_mask(valid,starts):', '    if valid.ndim!=2 or starts.ndim!=1 or valid.shape[1]!=len(starts): raise ValueError("shape")', '    if valid.dtype!=torch.bool or starts.dtype!=torch.bool: raise ValueError("bool required")', '    g=starts.long().cumsum(0).expand(valid.shape[0],-1)', '    return (g[:,None,:]<=g[:,:,None]) & valid[:,None,:] & valid[:,:,None]', 'def architecture_ok(m):', '    return bool(not m[0,0,3] and m[0,3,0] and m[0,3,4] and m[0,4,3])', 'v=torch.ones(1,5,dtype=torch.bool)', 's=torch.tensor([False,False,True,True,False])', 'm=group_mask(v,s)', 'assert architecture_ok(m)', 'assert not architecture_ok(m.transpose(1,2))', 'v[0,1]=False', 'p=group_mask(v,s)', 'assert not p[0,1,:].any() and not p[0,:,1].any()', 'try:', '    group_mask(v,torch.tensor([False,True]))', '    raise AssertionError("bad length accepted")', 'except ValueError: pass', 'print("pi0 group direction and padding: PASS")'].join('\n'),
      codeNotes: ['第一段先拒绝错 shape/dtype，随后生成累计组号并广播比较。', 'architecture_ok 检查四条具体依赖边；转置反例证明测试能发现方向错误。', '第二个 prefix 被遮罩后整行整列均为 False；此程序没有 softmax，因此不涉及全屏蔽行的数值策略。'],
      exercise: { prompt: '若 H=3，prefix 长度为 2，π0 连续 state 占一位，写出 starts 和组号。将最后一个动作划成新组会怎样？', steps: ['先写六个 token 的分组起点。', '对起点累计求和，再比较 action 之间的方向。'], solution: 'starts=[0,0,1,1,0,0]，组号=[0,0,1,2,2,2]。若末尾改成 1，最后动作属于组3，它仍读前面动作，但组2动作不能读它；这改变了 chunk 联合双向结构。' },
      quiz: { question: '为什么把 ar_mask 的 True 当成 padding，会删掉 π0 状态和动作组的关键位置？', hint: '查看 embed_suffix 在哪两个位置追加 True。', keywords: ['group boundary', 'input mask', 'state', 'first action', 'cumsum'], reference: 'ar_mask 的 True 是累计分组的起点：连续状态和第一个动作各开启新组。input_mask 才表示有效性。混用二者会误删状态及首动作，同时保留错误依赖，既损失条件又改变动作时间轴。' },
      sources: [model, gemma, config, train],
    },
    insight: {
      title: '通用 VLA 的规模来自哪里：参数、经验覆盖与个人实验预算', minutes: 26,
      prerequisites: '理解 π0 的分组注意力、预训练/微调、数据切分和成功率分母。',
      connection: '今天已经能够画出网络；现在把网络规模与可迁移经验分开。明天比较连续生成的精度和计算代价，之后再讨论多本体映射与数据混合。',
      intro: '选用大 VLA 的合理理由应落到具体欠缺：语义迁移、视觉覆盖还是动作分布。一个更大的骨干并不会自动补足相机标定和失败恢复数据。个人项目可以用受控的小实验判断借用预训练是否真正省下标注和训练成本。',
      outcomes: ['将参数容量、预训练来源、机器人覆盖与后训练质量分开记录', '估算冻结骨干与全量训练的存储下限而不伪报显存实测', '为环境生成、表征预测和直接动作策略分配不同评测职责'],
      sections: [
        { heading: '01 规模是一组独立变量', body: 'π0 的通用性设计同时包含视觉语言预训练、机器人动作学习、多本体数据和任务后训练。视觉语言经验可以提供物体与指令关联，但接触、恢复和执行时序需要机器人经验；高质量任务数据又决定特定部署场景中的动作风格。将这几项都缩成“3B 模型更强”会使实验无法解释。\n\n可以建立四格消融：同一小数据集上比较冻结与部分解冻，再在固定冻结策略下比较是否加入自有恢复片段。前一项问表征适配是否必要，后一项问部署状态覆盖是否足够。固定相机、动作统计、训练步数与评测实例后，才有可能把收益归到具体机制；今天的建议是实验设计，并非论文已证明适用于 SO-101 的结论。', sourceIds: ['pi0Paper43', 'pi0Train43'] },
        { heading: '02 先算存储下限，再测真实峰值', body: '教学上设总参数 P=3.3×10⁹，BF16 权重占 2P 字节；若全部训练，另设 BF16 梯度 2P、FP32 Adam 一二阶状态 8P，不保存额外主权重，则仅这些张量合计 12P≈39.6 GB。若冻结其余部分，仅训练 P_t=0.3×10⁹，权重加梯度/动量约为 2P+10P_t≈9.6 GB，均按十进制 GB 计算。\n\n这不是单卡可训练承诺：激活、临时缓冲、KV、优化器实现、参数分片与可能存在的 FP32 主权重都会改变峰值；冻结参数也未必意味着所有中间激活都无需保留。对租用 4090/5090 的选择应以相同 batch、图像数、horizon 的实际 dry-run 峰值与每步时间为证据，课程不虚构硬件吞吐。', formulas: [{ latex: String.raw`M_{\mathrm{lower}}=2P+(2+8)P_t\quad\text{bytes}`, explanation: 'P 为总参数数，P_t 为可训练参数数；2 是 BF16 权重/梯度字节数，8 是两份 FP32 动量。假设无 FP32 主权重，忽略激活，因此只能作存储下限而非峰值显存预测。' }] },
        { heading: '03 双团队提供不同的证据，不是 π0 的同义词', body: 'StanfordVL 的 BEHAVIOR-1K/OmniGibson把可交互环境和任务目标变成评测接口，策略输入受协议限制、动作要匹配机器人控制器。World Labs 的 Marble/Atlas 空间路线与 R2S2R 属于另一组织；其中 R2S2R 从现实任务、传感器和演示重建交互世界，并用仿真/真实结果检验策略排序。它可补“在哪里测试”的覆盖，不能凭图像逼真证明 π0 动作正确。\n\nMeta/FAIR 的 V-JEPA 2 先从视频学习表征，再在机器人动作条件数据上适配预测与规划；预测对象是未来表征，动作是推演条件，而 π0 直接生成动作。AMI Labs 官网提出表征空间预测和动作条件世界模型方向，尚不能在本课写成已验证的 SO-101 规划模块。这些路线若接入同一作品，都需以真实闭环成功、介入和延迟验证，而不是比较各自内部 loss。', sourceIds: ['behavior43', 'worlds43', 'jepa43', 'ami43'] },
        { heading: '04 RAW 经验可以转化为清楚的可证伪问题', body: '先定义相同任务的正常曝光、背光和运动模糊切片，保留相机姿态与轨迹身份；用固定策略或冻结 encoder 比较标准 RGB 处理与由自有 RAW 产生的受控处理版本。若改善只来自改变曝光而非新表征，不应冠以世界模型能力；若更慢的处理让观测陈旧，则必须同时报告控制代价。\n\n两条现实选择分别是复用小模型快速闭环，以及增加 π0 作为同数据迁移对照。前者便于定位数据/部署问题，后者能检验预训练语义收益但增加显存与接口成本。项目产出应是实验卡、失败切片和可复现日志，而不是未经测试的模型排名；所有输入只使用公开或本人授权资料，客户 POC 记录不进入公开训练与演示。' },
      ],
      points: ['参数容量与机器人经验覆盖需要分别做消融。', '9.6 GB 是所列张量的教学下限，不能当作运行峰值。', '环境生成和 latent 规划有不同预测对象，最终仍要检验动作闭环。'],
      codeTitle: 'parameter_budget.py · 原创冻结范围存储估算',
      code: ['import math', 'def lower_gb(total,trainable):', '    if not all(math.isfinite(x) for x in (total,trainable)): raise ValueError("finite counts")', '    if total<=0 or not 0<=trainable<=total: raise ValueError("parameter counts")', '    return (2*total+10*trainable)/1e9', 'assert abs(lower_gb(3.3e9,.3e9)-9.6)<1e-9', 'assert abs(lower_gb(3.3e9,3.3e9)-39.6)<1e-9', 'assert lower_gb(3.3e9,0)==6.6', 'for bad in (-1.,4e9,float("nan")):', '    try:', '        lower_gb(3.3e9,bad)', '        raise AssertionError("bad trainable count accepted")', '    except ValueError: pass', 'print("parameter storage lower bounds: PASS, not peak VRAM")'].join('\n'),
      codeNotes: ['函数返回十进制 GB；total 存全部 BF16 权重，trainable 额外存梯度与两份 FP32 动量。', '全冻结、部分冻结、全训练三个正例核对线性关系；负例拒绝非法参数数与 NaN。', '未计算激活或主权重，也未测速；代码没有下载 checkpoint 或使用设备接口。'],
      exercise: { prompt: '教学模型 P=2×10⁹，训练 P_t=0.1×10⁹；按本课假设下限多少 GB？若还为可训练参数保存 FP32 主权重，应增加多少？', steps: ['代入 2P+10P_t。', '再加 4P_t 字节，并说明仍缺什么。'], solution: '下限为 4+1=5 GB；主权重再增加 0.4 GB，共5.4 GB。仍未包括激活、临时缓冲与框架开销，不能据此断言某张显卡一定可训练，也不能当作实测峰值。' },
      quiz: { question: '若 π0 在背光任务上胜过 SmolVLA，为什么仅这一结果不能证明“参数规模解决 RAW 感知问题”？', hint: '哪些变量可能同时改变？', keywords: ['pretraining', 'controlled comparison', 'exposure', 'latency', 'data coverage'], reference: '两模型同时改变预训练数据、视觉编码器、输入处理、参数量和动作头，因此单次胜出不能归因于规模。需固定任务切分、相机与数据，分别做曝光/处理和冻结范围消融，报告延迟与失败类型；RAW 价值需要自身对照实验支持。' },
      sources: [paper, train, behavior, worlds, jepa, ami],
    },
  },
};
