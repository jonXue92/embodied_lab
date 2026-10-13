import type { AuthoredDay } from './types';

const sources = [
  { id: 'kiPaper47', label: 'Physical Intelligence · Knowledge Insulating VLA 原论文', url: 'https://arxiv.org/abs/2505.23705', reading: '2026-10-14 实读摘要、§4、§5 与实验：区分 joint-training、VLM data co-training、stop-gradient、frozen backbone；式(4)同时包含 token 交叉熵与连续 flow loss。' },
  { id: 'kiPage47', label: 'Physical Intelligence · Knowledge Insulation 项目页', url: 'https://www.pi.website/research/knowledge_insulation', reading: '2026-10-14 实读架构与消融说明：骨干用 FAST 离散动作学习机器人表征，action expert 生成连续动作，专家梯度不回传骨干；离散动作仅作训练目标。' },
  { id: 'openpiPi047', label: 'openpi · models/pi0.py 固定提交', url: 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/src/openpi/models/pi0.py', reading: '2026-10-14 实读 embed_prefix、embed_suffix、compute_loss 与 sample_actions：公开常规路径连接 PaliGemma 和 action expert，compute_loss 返回 flow MSE；该文件没有论文完整的离散 FAST 辅助目标与 KI stop-gradient 训练配方。' },
  { id: 'openpiConfig47', label: 'openpi · models/pi0_config.py 固定提交', url: 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/src/openpi/models/pi0_config.py', reading: '2026-10-14 实读 Pi0Config 与 get_freeze_filter：过滤器按 LoRA variant 冻结非 LoRA 参数，属于参数高效微调配置，不能自动解释为论文的损失路径隔离。' },
  { id: 'openpiTrain47', label: 'openpi · scripts/train.py 固定提交', url: 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/scripts/train.py', reading: '2026-10-14 实读 train_step：依据 TrainConfig.trainable_filter 分割参数、对 model.compute_loss 求值与梯度并更新；实际梯度边界由模型损失图和冻结过滤共同决定。' },
  { id: 'openpiTrainingConfig47', label: 'openpi · training/config.py 固定提交', url: 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/src/openpi/training/config.py', reading: '2026-10-14 实读 TrainConfig.trainable_filter、pi0 LoRA 与 pi05_libero 示例：公开微调配置可全量或 LoRA 训练，但没有足够证据声称复现论文 KI 的联合离散/连续目标。' },
  { id: 'behavior47', label: 'StanfordVL · BEHAVIOR Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '2026-10-14 复核自然语言任务、隐藏实例、BDDL 部分成功与禁止特权观测；用于设计语义保持和闭环任务指标，属于 StanfordVL。' },
  { id: 'atlas47', label: 'World Labs · Atlas', url: 'https://www.worldlabs.ai/blog/atlas', reading: '2026-10-14 复核多模态共享空间上下文、RGB/depth 机器人视角和可控场景变体；属于 World Labs 空间模型，不是 Knowledge Insulation 实验。' },
  { id: 'vjepa47', label: 'Meta/FAIR · V-JEPA 2 官方页', url: 'https://ai.meta.com/research/vjepa/', reading: '2026-10-14 复核视频自监督表征与少量 DROID 动作条件规划；属于 Meta/FAIR 历史谱系，是另一类表征迁移问题，不等同于 VLA 梯度隔离。' },
  { id: 'ami47', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '2026-10-14 复核表征空间预测、动作条件世界模型与可靠性方向；当前官网愿景不构成已发布 KI 模型或 SO-101 实验结果。' },
];

export const day47: AuthoredDay = {
  reviewedAt: '2026-10-14', revision: '逐课编写 1.0',
  deliverable: '一张 KI 双目标与梯度边界图；一个 PyTorch stop-gradient 正负夹具；一份适合个人算力的语义保持—动作能力双门实验表。三课共100分钟，另留20分钟复盘。',
  question: {
    title: '把 VLM 全部冻结、只训练 action expert，是否就实现了 Knowledge Insulation？',
    summary: '区分参数冻结、损失路径隔离与仍让骨干学习机器人表征的辅助目标。',
    keywords: ['stop gradient', 'FAST tokens', 'flow matching', 'frozen backbone', 'semantic retention', 'action expert'],
    reference: '不是。全冻结会阻止 action expert 损坏骨干，却也阻止骨干从机器人数据获得控制相关表示；论文消融显示这种方案可能失败。KI 让骨干继续通过语言与 FAST 离散动作交叉熵更新，同时 action expert 用连续 flow loss 学动作，但该 loss 经 stop-gradient 不更新骨干。验收必须同时看语义/语言保持、训练速度和连续动作闭环，而不能只检查 requires_grad。',
  },
  lessons: {
    foundation: {
      title: 'Knowledge Insulation：隔离有害梯度，而不是冻结知识', minutes: 35,
      prerequisites: '已完成10-13的 VLM/action expert 双专家结构、10-14的 flow matching、10-16的数据混合；会用链式法则读多任务损失。',
      connection: '今天处理动作专家如何影响预训练语义；10-18 将进入 π0.5 开放世界任务与未见场景切分，用语义保持和闭环指标检验隔离是否真的换来泛化。',
      intro: 'VLA 同时想保留网页规模语义、适应机器人观测并实时输出连续动作。KI 的核心不是一句“stop gradient”，而是为骨干和动作专家安排不同但协同的学习信号。',
      outcomes: ['写出 joint-training 与 KI 的骨干梯度差异', '解释为何全冻结和只做 flow 都不充分', '用数值例比较冲突梯度对更新方向的影响'],
      sections: [
        { heading: '01 问题来自新专家的学习信号，不是连续动作本身有罪', body: '预训练 VLM 参数记为φ，连续动作专家参数记为ψ。常规联合训练把 flow loss 沿专家读取的骨干表示一路反传到φ；专家从随机或弱初始化开始时，这条梯度可能优先推动“容易拟合机器人动作”的表示，却损伤颜色、物体、关系与语言约束等已有能力。论文把这种现象作为要检验的学习动力学问题，而不是声称所有连续 head 都必然遗忘。\n\n只看机器人训练 loss 会漏掉伤害：模型可能更快拟合常见抓取动作，却更少听从“红色而非蓝色”或未见物体名称。需要在同一训练步同时记录动作目标、语言跟随与非机器人语义探针；否则“动作更准”与“条件被忽略”可能被混成进步。', sourceIds: ['kiPaper47', 'kiPage47'] },
        { heading: '02 KI 给骨干一条可学习但更合适的机器人信号', body: '论文方案让骨干预测语言和 FAST 离散动作 token，以交叉熵学习机器人相关表征；动作专家读取骨干表示，用 flow matching 产生高带宽连续 action chunk。关键边界是对专家所读骨干表示施加 stop-gradient，所以连续 loss 更新ψ以及专家侧投影，却不沿这条路径改φ；离散 token 在训练时服务表示学习，部署时可丢弃并由连续专家快速生成动作。\n\n可写成 L=L_AR(φ)+αL_flow(ψ,sg[h_φ])。因此骨干梯度是∇φL_AR，专家梯度是α∇ψL_flow。sg 的前向值等于h_φ，反向导数为零；它不删除条件信息，也不等于把骨干参数全设为不可训练。VLM 数据 co-training 还可继续给语义目标供血。', formulas: [{ latex: String.raw`\mathcal L=\mathcal L_{\mathrm{AR}}(\phi)+\alpha\,\mathcal L_{\mathrm{flow}}\!\left(\psi,\operatorname{sg}[h_{\phi}(o,q)]\right),\quad \nabla_{\phi}\mathcal L=\nabla_{\phi}\mathcal L_{\mathrm{AR}}`, explanation: 'φ是VLM骨干，ψ是连续动作专家，hφ是观测o与指令q的表示，sg前向恒等但反向梯度为零；α仅缩放专家的连续动作目标。' }], sourceIds: ['kiPaper47', 'kiPage47'] },
        { heading: '03 一个二维数值例说明“隔离哪条梯度”', body: '假设某步骨干的 token 梯度 g_AR=(2,0)，flow 经专家回传的梯度 g_flow=(-3,1)，学习率η=.1。联合训练更新为 Δφ=-.1(g_AR+g_flow)=(.1,-.1)：第一维朝 token 目标的反方向移动。KI 更新为 Δφ=-.1g_AR=(-.2,0)，而专家仍接收自己的 flow 梯度。这个例子只说明局部方向，不保证 KI 在每个任务都更优。\n\n若两梯度余弦为负，可称当前 batch 在所测共享参数上冲突；但单次余弦不能证明灾难性遗忘。应跨 step、任务和层统计，并与语言探针及闭环变化对齐。反过来，即使余弦为正，长期大幅参数漂移仍可能破坏罕见概念，因此最终证据是功能保持而非梯度图好看。' },
        { heading: '04 全冻结、LoRA、joint-training 与 KI 是四种不同干预', body: '全冻结令φ不更新，保护已有语义但也失去机器人表征适应；LoRA只限制可训练子空间和参数量，flow 梯度仍可通过 LoRA 改变骨干行为；joint-training允许两种目标共同更新骨干；KI则按损失来源切断一条梯度，同时保留 token/VLM 数据对骨干的更新。四者不能用“训练参数少”互相替代。\n\n论文在真实长时操作、未见环境和语言跟随上比较这些设计，并报告冻结骨干在部分任务不可行。课程不把论文的平均结果外推为 SO-101 必胜配方：个人数据量、骨干、动作维和任务复杂度都不同，应该把四种干预写成可证伪的消融。', sourceIds: ['kiPaper47', 'kiPage47'] },
      ],
      points: ['stop-gradient隔离的是loss路径，不删除前向条件。', 'FAST离散动作给骨干机器人表征学习信号。', '冻结和LoRA都不自动等于KI。'],
      codeTitle: 'ki_math.py · 原创梯度路径算例',
      code: String.raw`def update(g_ar, g_flow, lr, insulated):
    if len(g_ar) != len(g_flow) or lr <= 0:
        raise ValueError("bad gradient contract")
    total=[a if insulated else a+f for a,f in zip(g_ar,g_flow)]
    return [-lr*g for g in total]

g_ar=[2.0,0.0]; g_flow=[-3.0,1.0]
joint=update(g_ar,g_flow,.1,False)
ki=update(g_ar,g_flow,.1,True)
assert joint == [0.1,-0.1]
assert ki == [-0.2,-0.0]
assert update([0.,0.],[4.,-2.],.1,True) == [-0.0,-0.0]
try:
    update([1.],[1.,2.],.1,True); raise AssertionError("shape mismatch accepted")
except ValueError: pass
print("joint and insulated backbone updates: PASS")`,
      codeNotes: ['列表模拟同一骨干参数坐标上的两条梯度，不是完整优化器。', '正例展示joint与KI更新不同；零token梯度时KI骨干不被flow推动。', '负例拒绝不在同一参数空间的梯度。'],
      exercise: { prompt: '令g_AR=(1,2)、g_flow=(-1,-4)、α=.5、η=.01，分别求joint与KI的骨干更新。', steps: ['joint先算g_AR+αg_flow。', 'KI删除flow到φ的路径，再乘-η。'], solution: 'joint总梯度=(.5,0)，Δφ=(-.005,0)；KI总梯度=(1,2)，Δφ=(-.01,-.02)。这只比较当前步骨干更新，专家仍按αL_flow训练。' },
      quiz: { question: '为什么KI部署时可以丢弃离散动作解码，却不能在训练时简单删除FAST token目标？', hint: '区分表示学习信号和执行输出。', keywords: ['training-only objective', 'FAST token', 'representation learning', 'continuous expert', 'stop gradient'], reference: 'FAST token交叉熵在训练时给骨干机器人相关表示学习信号，使专家可读取适合控制的条件；部署动作由连续专家快速生成，所以无需自回归解码这些token。若训练也删除它们，stop-gradient后骨干可能只剩普通VLM信号，无法针对控制适应。' },
      sources: sources.slice(0, 2),
    },
    code: {
      title: '源码边界与最小实现：detach 不是 freeze_filter', minutes: 40,
      prerequisites: '理解本日双目标公式；熟悉PyTorch autograd、parameter.grad和模块参数分组。',
      connection: '把论文机制映射到可检查的计算图，并与openpi公开微调路径分开；路线课据此选择个人算力下能诚实完成的实验。',
      intro: '最危险的源码误读是看到两个专家或freeze_filter就宣布“实现了KI”。本课先定位公开代码确实做了什么，再用最小PyTorch夹具验证loss路径。',
      outcomes: ['定位openpi flow loss与参数过滤入口', '用detach验证前向相同而骨干梯度不同', '拒绝把LoRA冻结规则写成论文KI复现'],
      sections: [
        { heading: '01 固定提交的 Pi0.compute_loss 只返回连续 flow MSE', body: 'openpi固定提交中，embed_prefix把图像与prompt嵌入组成prefix；embed_suffix把噪声动作和时间组成action expert tokens。compute_loss采样noise与time，构造x_t和目标u_t，经联合LLM前向得到suffix_out，再由action_out_proj预测v_t并返回平方误差。attention mask保证prefix不读取后置动作token，而suffix可读取prefix。\n\n这条调用链足以解释公开checkpoint的连续动作训练接口，却没有同时计算FAST离散动作交叉熵，也没有显示论文KI中flow到骨干表示的stop-gradient。因此课程只能说“公开常规flow路径”，不能从模型名pi05或双专家结构推出完整KI训练已开源。', sourceIds: ['openpiPi047'] },
        { heading: '02 train_step与freeze_filter控制的是可训练参数集合', body: 'scripts/train.py依据config.trainable_filter把模型状态分成trainable与non_trainable，对compute_loss求value_and_grad，再用优化器更新可训练部分。Pi0Config.get_freeze_filter在使用LoRA variant时冻结匹配的原参数并保留LoRA参数；它回答“哪些参数被优化器更新”。\n\nKI的detach回答另一问题：“某个loss能否沿某条计算路径影响参数”。若只训练action expert，效果更接近frozen-backbone消融；若VLM LoRA同时接收flow梯度，参数虽少却仍不是KI。要声称复现，至少要显示AR/FAST loss、flow loss、loss mask、detach位置和逐组梯度测试。', sourceIds: ['openpiConfig47', 'openpiTrain47', 'openpiTrainingConfig47'] },
        { heading: '03 最小夹具在同一前向值上检查两种反向图', body: '教学网络把backbone输出h送进token_head和expert。KI分支使用expert(h.detach())：detach后的张量数值与h相同，所以动作前向输出不变；反向时flow loss不会给backbone梯度。token loss仍从token_head(h)更新backbone。对照分支不detach，flow会叠加到backbone。\n\n测试不能只打印grad is not None，因为token loss本来就会产生梯度。应分别计算token-only、flow-only、joint与KI，并比较骨干梯度向量：KI应等于token-only，joint通常不同；expert在KI与joint中都应有非零梯度。故意失败的no-token+detach还应得到骨干零梯度。' },
        { heading: '04 生产实现还需处理跨层KV与分布式边界', body: '真正双专家Transformer可能逐层交换K/V或hidden state；只在输入端detach一次是否覆盖所有连接，取决于图结构。共享embedding、视觉encoder、投影层和归一化参数也要明确归属。梯度checkpoint、FSDP或编译后，仍应以命名参数组的实际梯度和更新差异验收，而非相信配置文字。\n\n本课代码刻意不用openpi权重、JAX或机器人数据，只验证autograd语义。它没有复现FAST tokenizer、双专家attention、flow采样或分布式训练；把这个简化范围写在实验报告里，反而比复制一段无法执行的伪源码更可信。' },
      ],
      points: ['compute_loss的公开事实与论文训练recipe要分开。', 'freeze选择参数，detach选择loss路径。', '验收要比较分项梯度，而非只看总loss。'],
      codeTitle: 'ki_autograd.py · PyTorch分项梯度正负测试',
      code: String.raw`import torch
torch.manual_seed(4)
backbone=torch.nn.Linear(2,2,bias=False)
token_head=torch.nn.Linear(2,1,bias=False)
expert=torch.nn.Linear(2,1,bias=False)
x=torch.tensor([[1.,-2.]])

def grads(use_token,use_flow,detach):
    for m in (backbone,token_head,expert): m.zero_grad(set_to_none=True)
    h=backbone(x); loss=0.
    if use_token: loss=loss+(token_head(h)-torch.tensor([[.3]])).square().mean()
    if use_flow:
        z=h.detach() if detach else h
        loss=loss+(expert(z)-torch.tensor([[-.2]])).square().mean()
    loss.backward()
    bg=torch.zeros_like(backbone.weight) if backbone.weight.grad is None else backbone.weight.grad.clone()
    eg=torch.zeros_like(expert.weight) if expert.weight.grad is None else expert.weight.grad.clone()
    return bg,eg

g_token,_=grads(True,False,False)
g_joint,e_joint=grads(True,True,False)
g_ki,e_ki=grads(True,True,True)
g_frozen,e_frozen=grads(False,True,True)
assert torch.allclose(g_ki,g_token)
assert not torch.allclose(g_joint,g_token)
assert e_joint.norm()>0 and e_ki.norm()>0
assert g_frozen.norm()==0 and e_frozen.norm()>0
print("detach path, expert learning and negative control: PASS")`,
      codeNotes: ['PyTorch detach模拟loss路径隔离，前向条件仍保留；没有冒充openpi/JAX实现。', '分项测试证明KI骨干梯度等于token-only，而joint会叠加flow。', 'no-token+detach是冻结骨干式负对照：专家能学，骨干没有机器人适应信号。'],
      exercise: { prompt: '若把h.detach()改成with torch.no_grad(): h=backbone(x)，会丢掉哪条必要路径？', steps: ['判断token_head收到的h是否仍有计算图。', '比较只在expert输入detach。'], solution: 'no_grad包住backbone会让h整体不带图，token loss也无法更新backbone；KI只应在flow专家读取h的分支detach，token/FAST分支仍需保留对backbone的梯度。' },
      quiz: { question: '为什么openpi的get_freeze_filter存在，仍不足以证明训练采用Knowledge Insulation？', hint: '参数集合与损失路径是两个维度。', keywords: ['freeze filter', 'loss path', 'FAST objective', 'stop gradient', 'evidence boundary'], reference: 'freeze_filter决定哪些参数进入优化器，主要服务LoRA等微调；KI要求连续专家loss在读取骨干表示后stop-gradient，同时骨干仍由FAST离散动作/语言目标更新。若源码没有这两个分项loss与detach证据，不能仅凭冻结规则宣称复现。' },
      sources: sources.slice(2, 6),
    },
    insight: {
      title: '个人项目如何验证“保知识且会动作”：双门而非单分数', minutes: 25,
      prerequisites: '能运行本日autograd夹具；已有10-16固定的数据混合、prompt与动作schema，并理解独立场景切分。',
      connection: '把梯度机制转成SO-101可承担的实验；10-18将用未见物体、语言改写和未见环境切分检查开放世界主张。',
      intro: '个人算力很难复现论文大规模KI预训练，但可以严格验证较小问题：一种更新策略是否保住语义条件，同时没有牺牲动作闭环。',
      outcomes: ['设计语义门与动作门的配对消融', '用最坏组回退而非只看均值', '正确使用双团队资料构造测试而不混淆归属'],
      sections: [
        { heading: '01 四组最小消融先回答机制，再追求最好成绩', body: '固定checkpoint、SO-101数据、训练步数、seed、prompt和评测实例，比较A仅训练expert、B全量joint flow、C骨干LoRA+flow、D教学KI式token辅助+flow detach。D若没有真正FAST tokenizer，可用清楚标名的离散动作辅助目标做机制探针，但不得命名为论文复现。\n\n每组先离线记录动作误差、token准确率、骨干参数或表示漂移、训练时间和显存，再进入同一仿真/回放协议。个人预算可先做小模型和少量seed；宁可缩小结论为“在此任务的梯度探针有效”，也不要用单次训练冒充通用泛化。' },
        { heading: '02 语义门与动作门必须同时通过', body: '语义门包含同义改写、颜色/左右最小对立、未见物体名称、空或冲突prompt拒绝，并报告最差组语言跟随；动作门包含已见任务成功、恢复、p95时延、限幅/碰撞和介入率。冻结骨干可能语义好但动作差，joint可能动作均值好却忽略词语，二者都不能晋级。\n\n设各关键组相对基线变化为Δ_i，并约定正值代表更好，可用R_min=min_iΔ_i作为最坏组回退。例：动作+8、同义+3、颜色对立-12个百分点，则R_min=-12，不能用平均-.33近似“基本不变”。阈值应在实验前按样本量和风险登记，不能看完结果再移动。', formulas: [{ latex: String.raw`R_{\min}=\min_{i\in\{\mathrm{action,para,contrast,safety}\}}\Delta_i,\qquad \text{promote}=\mathbf 1[R_{\min}\ge -\varepsilon\ \land\ \Delta_{\mathrm{target}}>\delta]`, explanation: 'Δi是各动作、释义、最小对立和安全组相对预注册基线的变化；ε是允许回退，δ是目标能力最小改善，单位可统一为百分点。' }] },
        { heading: '03 双团队研究线可扩展测试面，但不能替代KI证据', body: 'StanfordVL/BEHAVIOR的自然语言任务、BDDL目标和隐藏实例适合构造“说对且做对”的评测；World Labs Atlas的可控空间、相机与RGB/depth变体可启发环境扰动。前者是任务/评测线，后者是空间生成与仿真线，都没有直接证明某个SO-101梯度隔离实现正确。\n\nMeta/FAIR V-JEPA 2的自监督视频表征与动作条件规划提示另一种“先学表征再接动作”的路线；AMI Labs当前公开表述聚焦表征空间预测和动作条件世界模型。这些属于LeCun历史谱系与当前组织方向，不能改写成PI的KI方法，也不能把AMI愿景当作已发布消融结果。', sourceIds: ['behavior47', 'atlas47', 'vjepa47', 'ami47'] },
        { heading: '04 个人算力的合理结论是边界清楚的证据链', body: '若只有单卡，优先做分项梯度审计、冻结/LoRA/joint三组，再决定是否值得实现离散动作辅助头。晋级顺序为：计算图测试通过；固定回放与语义探针不退化；仿真或已授权低风险闭环通过；最后才计划真机。本自动化不连接或控制机械臂。\n\n报告需保存源码提交、参数组、loss权重、实际梯度范数、数据版本、prompt集合和每组原始结果。若D优于B，只能归因于本实验的隔离与辅助目标组合；若要区分二者贡献，还需stop-gradient-only和token-only消融。若公开仓库未提供论文recipe，应明确自实现范围。' },
      ],
      points: ['冻结、LoRA、joint和KI要同预算比较。', '最差语义组回退不能被动作均值掩盖。', '论文未开源部分必须标注自实现边界。'],
      codeTitle: 'dual_gate.py · 原创语义—动作双门',
      code: String.raw`def gate(base,candidate,eps=3.0,target_gain=4.0):
    keys={"action","paraphrase","contrast","safety"}
    if set(base)!=keys or set(candidate)!=keys:
        raise ValueError("metric contract mismatch")
    delta={k:candidate[k]-base[k] for k in keys}
    worst=min(delta.values())
    return {"delta":delta,"worst":worst,
            "promote":worst>=-eps and delta["action"]>=target_gain}

base={"action":60.,"paraphrase":72.,"contrast":68.,"safety":99.}
good=gate(base,{"action":66.,"paraphrase":73.,"contrast":67.,"safety":99.})
bad=gate(base,{"action":68.,"paraphrase":75.,"contrast":56.,"safety":99.})
assert good["promote"] and good["worst"]==-1.
assert not bad["promote"] and bad["delta"]["action"]==8.
try:
    gate(base,{"action":70.}); raise AssertionError("missing groups accepted")
except ValueError: pass
print("semantic retention and action gate: PASS")`,
      codeNotes: ['所有指标示例统一为百分点，safety用“无不安全事件率”使越高越好。', 'good允许1点最坏回退且动作提升6点；bad虽动作提升8点，颜色/关系对立组退12点而被拒绝。', '真实实验需置信区间与预注册阈值，本函数只是门的结构。'],
      exercise: { prompt: '候选动作+7、释义+1、最小对立-5、安全0个百分点，ε=3、δ=4，是否晋级？', steps: ['取四组变化的最小值。', '同时检查动作提升是否超过δ。'], solution: '不晋级。动作+7满足目标改善，但R_min=-5<-3，说明关键语义组明显回退；应先定位梯度/数据冲突或缩小更新范围，不能用动作平均掩盖。' },
      quiz: { question: '为什么KI实验只报告动作L1下降，不能支持“保留了预训练知识”？', hint: '被保护的能力需要怎样直接测量？', keywords: ['semantic probe', 'language following', 'worst group', 'closed loop', 'catastrophic interference'], reference: '动作L1只衡量固定数据上的连续预测，模型可能同时忽略语言或罕见概念。应在同场景做同义与最小对立语言探针、未见物体/环境测试，并与动作闭环和安全指标配对；只有知识相关组不退化且动作目标改善，才支持保留。' },
      sources: sources.slice(6),
    },
  },
};
