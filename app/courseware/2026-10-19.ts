import type { AuthoredDay } from './types';

const sources = [
  { id: 'smolPaper49', label: 'SmolVLA 原论文', url: 'https://arxiv.org/abs/2506.01844', reading: '2026-10-16 实读摘要、架构、异步推理与实验边界：小型VLA面向单GPU训练、消费级GPU乃至CPU部署，并以动作块和异步执行降低控制阻塞；论文比较结果仍受具体任务、数据与硬件协议约束。' },
  { id: 'smolDocs49', label: 'LeRobot · SmolVLA 官方指南（固定提交）', url: 'https://github.com/huggingface/lerobot/blob/297774fca4e3ad0aa34e7425fbf937111637e77b/docs/source/smolvla.mdx', reading: '2026-10-16 实读数据、微调与部署段：官方建议约50条episode起步并覆盖任务变体；450M基座在单A100上20k步约4小时，SO-101示例允许RTC但不承诺任意个人硬件实测。' },
  { id: 'smolConfig49', label: 'LeRobot · SmolVLAConfig（固定提交）', url: 'https://github.com/huggingface/lerobot/blob/297774fca4e3ad0aa34e7425fbf937111637e77b/src/lerobot/policies/smolvla/configuration_smolvla.py', reading: '2026-10-16 逐字段实读：chunk_size/n_action_steps=50、num_steps=10、max state/action dim=32、默认冻结视觉编码器且只训练expert、VLM层数16、expert宽度0.75、compile开关与输入约束。' },
  { id: 'smolModel49', label: 'LeRobot · SmolVLMWithExpertModel（固定提交）', url: 'https://github.com/huggingface/lerobot/blob/297774fca4e3ad0aa34e7425fbf937111637e77b/src/lerobot/policies/smolvla/smolvlm_with_expert.py', reading: '2026-10-16 实读 set_requires_grad、train 与 embed_image：train_expert_only会冻结并保持VLM eval；视觉冻结单独处理；expert的lm_head继续冻结，说明“450M模型”不等于“450M参数全训练”。' },
  { id: 'train49', label: 'LeRobot · lerobot_train.py 参数统计（固定提交）', url: 'https://github.com/huggingface/lerobot/blob/297774fca4e3ad0aa34e7425fbf937111637e77b/src/lerobot/scripts/lerobot_train.py#L785-L806', reading: '2026-10-16 实读训练banner：以requires_grad分别统计num_learnable_params与num_total_params，并同时记录数据帧、episode、数据并行和梯度累积后的effective batch。' },
  { id: 'piBlog49', label: 'Physical Intelligence · π0 官方项目页', url: 'https://www.pi.website/blog/pi0', reading: '2026-10-16 复核约3B VLM起点、连续flow动作输出和最高50Hz控制主张；它说明大模型如何承接网页语义与多机器人经验，不给个人SO-101直接迁移保证。' },
  { id: 'openpi49', label: 'Physical Intelligence · openpi README（固定提交）', url: 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/README.md', reading: '2026-10-16 实读requirements与故障排查：官方单GPU估算为推理>8GB、LoRA微调>22.5GB、全量微调>70GB；支持FSDP但会改变速度，且当前训练脚本不支持多节点。' },
  { id: 'behavior49', label: 'StanfordVL · BEHAVIOR Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '2026-10-16 复核公开/隐藏实例、BDDL谓词与部分成功指标；用于扩大任务证据面，不是模型规模结论。' },
  { id: 'atlas49', label: 'World Labs · Atlas', url: 'https://www.worldlabs.ai/blog/atlas', reading: '2026-10-16 复核多模态空间上下文与可控场景生成；属于World Labs空间生成/仿真线，可提供压力测试环境，不能替代真机闭环。' },
  { id: 'vjepa49', label: 'Meta/FAIR · V-JEPA 2 官方页', url: 'https://ai.meta.com/research/vjepa/', reading: '2026-10-16 复核冻结视频表征与动作条件规划证据；属于Meta/FAIR历史成果，可作为小型probe而非π或SmolVLA尺寸档位。' },
  { id: 'ami49', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '2026-10-16 复核表征空间预测、动作条件世界模型、可靠性与安全方向；当前方向不能写成已发布SO-101模型结果。' },
];

export const day49: AuthoredDay = {
  reviewedAt: '2026-10-16', revision: '逐课编写 1.0',
  deliverable: '一张大/小VLA资源—证据对照表；一个基于真实requires_grad口径的训练预算审计器；一份SO-101“小模型闭环先行、大模型作对照”的两阶段实验卡。三课共100分钟，另留20分钟复盘。',
  question: {
    title: '4090能装下某个大VLA的LoRA微调，是否就应把它作为SO-101毕业项目主线？',
    summary: '把“能运行”拆成显存、p99时延、数据覆盖、调试速度与闭环证据五道门。',
    keywords: ['trainable parameters', 'peak memory', 'p99 latency', 'iteration loop', 'worst group', 'baseline'],
    reference: '不应仅凭“能装下”决定。openpi给出的LoRA显存下限只回答单次配置的资源入口，不回答个人数据是否覆盖任务变体、推理p99是否满足动作新鲜度、失败能否定位、相同预算下能跑几轮对照。主线应优先选择能稳定完成数据—训练—回放—闭环—回归循环的模型；大VLA可在固定协议下作为云端或4090对照，只有最坏组置信下界、时延和安全门都带来可重复收益时再晋级。',
  },
  lessons: {
    foundation: {
      title: '大VLA与小VLA：先比较资源和证据，再谈参数规模', minutes: 35,
      prerequisites: '已完成10-13至10-18的π0/π0.5架构、flow matching、异构动作、数据混合、知识隔离与开放世界评测；理解BF16、梯度和action chunk。',
      connection: '前一日用最坏组下界约束开放世界主张；今天决定用什么规模的模型承担个人闭环。10-20将进入GR00T的输入、动作与数据，继续用同一可审计问题框架比较另一类大模型。',
      intro: '“大模型更强”和“小模型更适合我”都不是无需证明的结论。本课把总参数、可训练参数、静态权重、训练状态、激活、端到端时延和闭环证据分别记账。',
      outcomes: ['区分总参数、可训练参数与真实峰值显存', '用明确假设估算450M与约3B档模型的静态权重差', '解释为什么任务覆盖和迭代次数可能比单次模型规模更重要'],
      sections: [
        { heading: '01 参数规模只决定部分资源，不直接决定机器人能力', body: 'SmolVLA官方指南把基座写为450M，并强调单GPU训练和消费级部署；π0官方页说明以约3B VLM为起点，再加入连续动作专家。两者都接收图像、语言、状态并产生动作，但训练数据、冻结策略、动作时域、代码栈和评测协议不同，因此不能把参数量横轴画出来就宣布谁在SO-101上必胜。\n\n大模型可能携带更丰富的网页语义和跨本体经验，小模型则让个人更容易做多次训练、消融、回归和故障定位。若任务只是固定桌面抓放，主要误差来自相机布局、动作统计和恢复数据，新增几十亿参数未必解决瓶颈；若目标包含复杂语言组合和未见物体语义，大模型的先验才可能更值钱。正确问题是“当前失败由哪类能力限制”。', sourceIds: ['smolPaper49', 'smolDocs49', 'piBlog49'] },
        { heading: '02 静态权重估算必须写精度和单位', body: '若模型有N个参数，每参数按b字节存储，单份静态权重近似N×b字节。450M参数用BF16/FP16的2字节约0.90GB，即0.84GiB；3B参数约6.00GB，即5.59GiB。这里没有计入动作专家差异、量化元数据、缓存、框架工作区和图像token激活，所以只能做数量级筛选，不能冒充实测峰值。\n\n推理显存通常还包含KV cache、视觉中间特征、flow多步采样的临时张量和CUDA allocator保留空间。openpi官方给出推理大于8GB的工程下限，正好说明“参数字节能装下”不是完整预算。对Mac本地推理还需区分统一内存、后端算子支持与官方是否验证；本课不从NVIDIA表格外推Apple实测。', formulas: [{ latex: String.raw`M_{\mathrm{weights}}=\frac{N_{\mathrm{total}}\,b_w}{2^{30}}\ \mathrm{GiB}`, explanation: 'Ntotal是总参数，bw是每参数字节。450M×2字节约0.84GiB，3B×2字节约5.59GiB；它只是单份权重下界。' }], sourceIds: ['smolDocs49', 'piBlog49', 'openpi49'] },
        { heading: '03 训练预算看可训练参数和优化器状态', body: '训练时要把冻结参数与可训练参数分开。以常见混合精度Adam粗略模型为例：可训练参数可能保留2字节权重、2字节梯度、4字节FP32 master weight以及两个4字节动量，共约16字节/参数；冻结参数通常只需推理精度权重。若只训练200M参数，参数与优化器状态已约3.2GB，再加冻结主干、激活和工作区。不同框架、量化、分片和EMA会改变这个数，必须记录配置。\n\nLeRobot源码正因为这个差别，分别打印num_learnable_params和num_total_params。SmolVLA默认freeze_vision_encoder=True、train_expert_only=True，set_requires_grad会把VLM置为eval并冻结其参数；所以“450M模型”不能被误写成“450M全部更新”。相反，大模型LoRA虽然降低可训练状态，前向仍需穿过大主干，激活与时延不会按LoRA比例同步消失。', formulas: [{ latex: String.raw`M_{\mathrm{train}}\approx N_f b_w+N_t(b_w+b_g+b_m+b_v+b_{master})+M_{act}+M_{workspace}`, explanation: 'Nf、Nt分别为冻结和可训练参数；示例取bw=bg=2，bm=bv=bmaster=4字节，则可训练状态约16字节/参数，但激活与工作区必须另测。' }], sourceIds: ['smolConfig49', 'smolModel49', 'train49', 'openpi49'] },
        { heading: '04 个人项目的稀缺资源常是可归因迭代，不只是GPU', body: '假设每轮需要采集50条episode、训练、离线回放和20次安全真机评测。小模型一周能完成两轮并做去语言、去状态或错误恢复消融；大模型虽然单次分数略高，却因训练与部署复杂度只能四周跑一轮。后者未必产生更强作品，因为招聘者无法判断提升来自数据、模型、运气还是环境变化。\n\n规模选择应以证据闭环为单位：同一manifest、同一动作语义、同一评测组、同一安全门下，小模型先建立可复现基线；大模型只改变模型因素作为对照。若大模型在new-env/new-object最坏组下界、语言遵循或恢复率上稳定胜出，且p99时延仍满足动作新鲜度，再付出额外资源。否则保留小模型主线，把大模型结果诚实记录为受限对照。' },
      ],
      points: ['参数量不是能力的充分统计量。', '静态权重、训练状态、激活和工作区必须分账。', '毕业项目优化的是可归因闭环，而非最大模型名。'],
      codeTitle: 'footprint_lower_bound.py · 原创权重与Adam状态下界',
      code: String.raw`GIB=1024**3

def estimate(total_m,trainable_m,weight_bytes=2):
    if not (0 <= trainable_m <= total_m) or total_m <= 0:
        raise ValueError("invalid parameter counts")
    total=total_m*1_000_000
    trainable=trainable_m*1_000_000
    frozen=total-trainable
    weight_gib=total*weight_bytes/GIB
    # teaching assumption: bf16 weight+grad, fp32 master+m+v = 16 B/trainable
    train_state_gib=(frozen*weight_bytes+trainable*16)/GIB
    return round(weight_gib,2),round(train_state_gib,2)

assert estimate(450,200)==(0.84,3.45)
assert estimate(3000,0)==(5.59,5.59)
try:
    estimate(450,500); raise AssertionError("over-trainable count accepted")
except ValueError: pass
print("static and optimizer-state lower bounds: PASS")`,
      codeNotes: ['输入单位是百万参数，输出是GiB；用10^6与2^30的单位差明确换算。', '3.45GiB仍未含激活、CUDA工作区、数据batch或EMA，不能当作可运行承诺。', '负例拒绝可训练参数多于总参数，避免错误冻结清单让预算看似更小。'],
      exercise: { prompt: '一个总参数3B、LoRA可训练30M的模型使用上述16字节训练态假设，冻结权重BF16。仅参数相关下界约多少GiB？为什么仍不能据此承诺24GB卡可训？', steps: ['计算冻结参数×2字节。', '计算30M×16字节并相加换算GiB。'], solution: '冻结2.97B×2=5.94GB，可训练30M×16=0.48GB，合计6.42GB，约5.98GiB。它未计视觉/语言激活、反向保存、batch、编译工作区、allocator碎片、EMA和数据预取；openpi官方LoRA门槛>22.5GB说明实际栈远高于参数下界。' },
      quiz: { question: '为什么“LoRA只训练1%参数”不等于训练显存也只剩全量微调的1%？', hint: '前向、激活和冻结权重仍存在。', keywords: ['frozen weights', 'activations', 'forward pass', 'optimizer state', 'workspace'], reference: 'LoRA显著减少梯度与优化器状态，但冻结主干权重仍需驻留，前向仍经过主干并产生反向所需激活，还要保留视觉输入、缓存和框架工作区。因此只按可训练比例缩放全量显存会严重低估。' },
      sources: sources.slice(0, 7),
    },
    code: {
      title: '真实参数口径与端到端预算：从requires_grad到p99', minutes: 40,
      prerequisites: '能读PyTorch Module、requires_grad、参数dtype和日志；理解训练态与推理态的差别。',
      connection: '基础课建立估算下界；本课对齐LeRobot真实统计和SmolVLA冻结调用链，并把显存估算与动作时效预算放进同一审计报告。',
      intro: '代码精读不猜“可训练大约多少”。先沿SmolVLAConfig→VLAFlowMatching→SmolVLMWithExpertModel.set_requires_grad确认冻结，再用与lerobot_train相同的numel口径统计。',
      outcomes: ['定位SmolVLA冻结与训练模式的真实函数', '实现按dtype和requires_grad分组的参数报告', '把模型时延转换为动作年龄而非只报平均FPS'],
      sections: [
        { heading: '01 配置字段只是意图，set_requires_grad才真正改变参数', body: 'SmolVLAConfig默认freeze_vision_encoder=True、train_expert_only=True、train_state_proj=True。VLAFlowMatching构造SmolVLMWithExpertModel后，再建立state_proj、action_in/out_proj和时间MLP；随后调用自己的set_requires_grad处理state_proj。真正冻结VLM的是SmolVLMWithExpertModel.set_requires_grad：对视觉模型逐参数置False，并在train_expert_only时把整个vlm冻结。\n\n代码还覆盖train(mode)：即使外层policy.train()，冻结视觉编码器和VLM仍保持eval，避免dropout或其他训练态漂移。若未来上游参数命名改变，非expert-only分支会检查冻结模式是否匹配并抛错。审计因此要同时保存配置、requires_grad实际统计和上游SHA，不能只保存命令行。', sourceIds: ['smolConfig49', 'smolModel49'] },
        { heading: '02 lerobot_train用numel统计全局总量与可学习总量', body: '训练脚本在主进程banner中分别求sum(p.numel() for p in policy.parameters() if p.requires_grad)与全部参数sum，并注明DTensor的numel读取全局shape。随后把batch_size、数据并行worker和gradient accumulation相乘得到effective_batch_size，同时打印frames与episodes。\n\n这套口径很朴素却关键：模型规模、可训练规模和每次优化看到的样本量不再混成一个数字。原创夹具沿用同一numel逻辑，再按dtype统计静态权重；它不复制LeRobot训练器，也不推断激活峰值。生产记录还应抄下CUDA peak allocated/reserved和首批编译峰值。', sourceIds: ['train49'] },
        { heading: '03 参数报告要在冻结后、优化器创建前执行', body: '若先建立optimizer再冻结，优化器参数组可能仍携带不需要更新的参数；若先统计再加载PEFT或改变层数，报告又会过时。推荐顺序是加载固定checkpoint与配置、应用冻结/LoRA、验证输入输出schema、统计参数、创建optimizer，随后用一个真实batch做前向/反向峰值测试。\n\n教学TinyPolicy用encoder和expert模拟冻结主干：先冻结encoder，再报告total/trainable和静态字节；正例要求trainable严格小于total，负例把所有层冻结后由require_trainable门拒绝。它验证统计器行为，不声称TinyPolicy复现SmolVLA的450M结构。' },
        { heading: '04 时延预算必须覆盖感知到执行，并看p99动作年龄', body: '大VLA可以通过远端policy server运行，但端到端年龄由图像采集、编码/传输、预处理、模型、返回、队列等待和机器人消费共同组成。平均模型前向50ms不代表动作新鲜：若网络偶发300ms、队列已有8步旧动作，机器人可能继续执行过期计划。\n\n设控制频率f、端到端p99时延T99，则仅时延就跨过ceil(fT99)个控制tick；再加队列残留q得到最坏动作年龄tick。例：30Hz、T99=0.22s、q=4，年龄为ceil(6.6)+4=11 tick，约367ms。应与场景动态和急停门比较，而不是只写“约30FPS”。', formulas: [{ latex: String.raw`A_{99}^{tick}=\lceil f\,T_{99}^{e2e}\rceil+q,\qquad T^{e2e}=T_{capture}+T_{transfer}+T_{prep}+T_{model}+T_{queue}`, explanation: 'f为控制Hz，q为队列残留动作数。30Hz、220ms和4步队列给出11 tick动作年龄；各项必须来自同一时间基准的测量。' }] },
      ],
      points: ['在冻结完成后统计requires_grad事实。', '参数下界与真实峰值要同时保存。', '部署比较使用p99端到端动作年龄。'],
      codeTitle: 'parameter_budget_audit.py · 原创PyTorch冻结与预算夹具',
      code: String.raw`import math
import torch
from torch import nn

class TinyPolicy(nn.Module):
    def __init__(self):
        super().__init__()
        self.encoder=nn.Linear(8,16)
        self.expert=nn.Linear(16,4)
    def forward(self,x): return self.expert(torch.relu(self.encoder(x)))

def report(model,require_trainable=True):
    rows=list(model.parameters())
    total=sum(p.numel() for p in rows)
    trainable=sum(p.numel() for p in rows if p.requires_grad)
    static_bytes=sum(p.numel()*p.element_size() for p in rows)
    if total==0 or (require_trainable and trainable==0):
        raise ValueError("empty parameter budget")
    return total,trainable,static_bytes

m=TinyPolicy().to(dtype=torch.bfloat16)
m.encoder.requires_grad_(False)
total,trainable,static_bytes=report(m)
assert total==212 and trainable==68 and static_bytes==424
age=math.ceil(30*.22)+4
assert age==11 and m(torch.zeros(2,8,dtype=torch.bfloat16)).shape==(2,4)
m.requires_grad_(False)
try:
    report(m); raise AssertionError("fully frozen policy accepted")
except ValueError: pass
print("requires_grad, dtype bytes and action age: PASS")`,
      codeNotes: ['212来自8×16+16偏置+16×4+4偏置；冻结encoder后只有68个expert参数可训练。', 'BF16每元素2字节，所以静态参数424字节；教学模型没有优化器和激活估算。', '负例拒绝零可训练参数，p99算例把220ms与4步残留合并为11 tick。'],
      exercise: { prompt: '若30Hz系统的capture/prep/model/network/queue p99分别为20/35/120/80/65ms，队列另有3步残留，动作年龄是多少tick和毫秒？', steps: ['先把各段p99相加；说明直接相加是保守上界而非联合p99精确值。', '代入ceil(fT)+q。'], solution: '分段和为320ms；保守年龄ceil(30×0.32)+3=10+3=13 tick，即约433ms。严格联合p99应由端到端同一请求时间戳直接测量，因为各段p99相加通常偏保守。' },
      quiz: { question: '为什么只保存训练命令里的train_expert_only=true仍不足以证明VLM被冻结？', hint: '配置意图与运行事实可能分离。', keywords: ['requires_grad', 'set_requires_grad', 'upstream SHA', 'parameter report', 'runtime verification'], reference: '配置字段需经过构造和set_requires_grad才作用，checkpoint/PEFT注入、层命名变化或后续代码都可能改变状态。应在固定SHA、加载权重和应用冻结之后逐参数统计requires_grad，并让训练脚本打印total/trainable；必要时检查冻结模块保持eval。' },
      sources: sources.slice(2, 7),
    },
    insight: {
      title: '个人路线选择：小模型闭环先行，大模型只做受控晋级', minutes: 25,
      prerequisites: '已有10-18四组泛化矩阵，能记录成功、介入、延迟和训练成本；不需要连接真实机械臂完成本课。',
      connection: '把模型规模选择落成两阶段实验：先用SmolVLA建立SO-101可复现闭环，再在完全相同的manifest和评测门下加入π/openpi档对照；10-20起横评GR00T等模型时沿用这张实验卡。',
      intro: '路线决策不是永久站队，而是规定谁先成为baseline、什么证据允许候选晋级、失败后回退到哪里。对个人作品，能解释每个改动通常比展示一次最大模型成功更有价值。',
      outcomes: ['设计小模型主线与大模型对照的两阶段计划', '用收益—成本门拒绝只看最好一次的晋级', '把双团队研究主线用于评测扩展而非错误归因'],
      sections: [
        { heading: '01 第一阶段先买到可重复闭环，而不是最高理论上限', body: '用SmolVLA固定一个低风险SO-101任务：约50条episode作为官方建议起点，但按物体位置、光照和背景显式分层；保留10-18的环境×物体holdout。完成数据schema、训练、离线回放、p99时延、20次真机协议和失败分类。若连这一闭环都不稳定，换更大模型会增加变量而不会自动修复数据。\n\n阶段一必须产出失败证据：语言误解、视觉定位、动作归一化、接触恢复、队列陈旧各占多少。若主要失败是语言与未见物体语义，再引入大VLA有明确假设；若主要失败是相机抖动或动作符号错，大模型升级应暂停。50条只是起点，不是质量保证或统一样本定律。', sourceIds: ['smolDocs49', 'smolPaper49'] },
        { heading: '02 第二阶段只改变模型因素，保持数据和安全门不变', body: '大模型候选使用同一train/validation/test manifest、同一动作变换、同一prompt集合和相同真机次数。4090若仅满足openpi LoRA门槛，就把训练放在Linux GPU端；Mac或机器人端只运行已验证客户端/服务，不把未经支持的本地后端写成正式方案。记录训练小时、显存峰值、失败重试和推理网络。\n\n晋级至少同时满足：最坏组Wilson下界提高、语言或恢复类目标指标改善、p99动作年龄不越门、安全事件不增加。若只能展示更好平均成功率或更漂亮视频，候选留在研究分支；作品主线继续使用小模型。这样“没选最大模型”成为工程判断，而非算力不足的借口。', sourceIds: ['openpi49', 'piBlog49'] },
        { heading: '03 用效用门把证据收益与迭代成本放在同一张表', body: '定义效用J为最坏组成功下界收益，减去动作年龄、人工介入和每轮成本的加权惩罚。示例中小模型最坏组下界0.58、p99动作年龄8 tick、介入率5%、一轮10小时；大模型分别0.62、15 tick、4%、35小时。若权重设为延迟每tick 0.01、介入每百分点0.5、成本每小时0.002，则小模型J约0.455，大模型约0.38，大模型不晋级。\n\n权重不是自然常数，应在实验前按任务风险写入协议；接触敏感任务提高延迟和介入惩罚，离线语义任务则可降低延迟权重。J也不替代硬门：任何越界、碰撞或不可恢复故障都先判失败，再谈加权分数。分数的价值是让取舍可讨论，不是把安全兑换成成功率。', formulas: [{ latex: String.raw`J=\operatorname{LCB}_{worst}-\lambda_A A_{99}^{tick}-\lambda_I r_{int}-\lambda_C C_{iter}`, explanation: 'LCBworst是最坏组成功下界，A99是动作年龄tick，rint是介入比例，Citer是一轮小时数；权重必须预注册，安全违规作为硬否决。' }] },
        { heading: '04 双团队主线提供不同的“更难测试”，不提供尺寸答案', body: 'StanfordVL的BEHAVIOR-1K/OmniGibson用于把任务写成BDDL目标、隐藏实例和部分成功；World Labs的Atlas/R2S2R用于构造空间、视角和Real-to-Sim变体。它们能扩展小/大VLA的压力测试，却没有证明“大参数必胜”，也不能把World Labs产品主张归给Stanford实验室。\n\nMeta/FAIR的V-JEPA 2与JEPA-WM关注表征空间预测和动作条件规划；AMI Labs当前方向延续对表征预测、可靠性和安全的研究问题。个人可以在冻结特征上加一个小probe，判断视频表征是否改善低数据识别，但不能把它写成AMI已发布策略，更不能在一次对照里同时更换VLA、JEPA特征、仿真器和数据。', sourceIds: ['behavior49', 'atlas49', 'vjepa49', 'ami49'] },
      ],
      points: ['先建立小模型可复现基线，再让大模型受控挑战。', '晋级同时看最坏组、p99时延、介入和迭代成本。', '研究主线扩展评测面，不替代模型选择证据。'],
      codeTitle: 'promotion_utility.py · 原创规模候选晋级门',
      code: String.raw`def score(c,weights=(.01,.5,.002)):
    required={"lcb","age_ticks","intervention_rate","hours","safe"}
    if set(c)!=required or not 0 <= c["lcb"] <= 1 or not 0 <= c["intervention_rate"] <= 1:
        raise ValueError("bad candidate record")
    if not c["safe"]: return float("-inf")
    la,li,lc=weights
    return c["lcb"]-la*c["age_ticks"]-li*c["intervention_rate"]-lc*c["hours"]

small={"lcb":.58,"age_ticks":8,"intervention_rate":.05,"hours":10,"safe":True}
large={"lcb":.62,"age_ticks":15,"intervention_rate":.04,"hours":35,"safe":True}
assert round(score(small),3)==.455
assert round(score(large),3)==.380
assert score(small)>score(large)
unsafe={**large,"safe":False}
assert score(unsafe)==float("-inf")
print("evidence-cost promotion gate and safety veto: PASS")`,
      codeNotes: ['权重按实验协议预先确定，不能看完结果后调到偏爱某模型。', '示例大模型LCB高4个百分点，但延迟与成本惩罚更大，未通过晋级。', '安全为硬否决，不能靠更高成功率抵消。'],
      exercise: { prompt: '若优化后大模型age降到9 tick、每轮20小时，其余不变，按代码权重是否超过小模型？', steps: ['计算新的J。', '检查安全硬门仍为True。'], solution: 'J_large=0.62-0.01×9-0.5×0.04-0.002×20=0.47，高于小模型0.455，且safe=True，因此在该预注册效用门上可晋级；仍需确认差异来自重复实验而非单次波动。' },
      quiz: { question: '什么时候“大VLA只做对照”应升级为项目主线？', hint: '需要闭环收益与工程门同时成立。', keywords: ['worst-group LCB', 'latency gate', 'safety veto', 'repeatability', 'controlled comparison'], reference: '在固定数据、动作、prompt和评测协议下，大VLA重复提高预注册的最坏组下界或目标能力，p99动作年龄不越门、介入率和安全不恶化，且训练/部署成本仍允许继续做回归与消融时，才应晋级主线。单次成功、平均分或“显存能装下”均不足。' },
      sources,
    },
  },
};
