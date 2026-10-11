import type { AuthoredDay } from './types';

const sources = [
  { id: 'normDoc45', label: 'openpi · Normalization statistics', url: 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/docs/norm_stats.md', reading: '2026-10-11 实读固定提交：state/action 统计随 checkpoint 保存；新数据可复用匹配本体的预训练统计或重算，官方建议两者都试，但动作空间定义必须一致。' },
  { id: 'transforms45', label: 'openpi · transforms.py', url: 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/src/openpi/transforms.py', reading: '2026-10-11 实读固定提交：Normalize/Unnormalize 的 z-score 与 q01/q99 公式、DeltaActions/AbsoluteActions、Group.push 输出顺序和 PadStatesAndActions。' },
  { id: 'loader45', label: 'openpi · training/data_loader.py', url: 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/src/openpi/training/data_loader.py', reading: '2026-10-11 实读固定提交 transform_dataset：repack → data transforms → Normalize → model transforms；非 fake 数据缺统计时直接报错。' },
  { id: 'stats45', label: 'openpi · shared/normalize.py', url: 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/src/openpi/shared/normalize.py', reading: '2026-10-11 实读固定提交 RunningStats：沿最后一维累计 mean、mean-of-squares 与近似 q01/q99；少于两个向量拒绝输出统计。' },
  { id: 'config45', label: 'openpi · training/config.py', url: 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/src/openpi/training/config.py', reading: '2026-10-11 实读固定提交 Libero/RLDS DROID 配置：按 mask 将部分关节维转 delta，gripper 保持 absolute，输出链逆变换；action_dim 是模型宽度而非机器人自由度。' },
  { id: 'octo45', label: 'Octo · dataset.py', url: 'https://github.com/octo-models/octo/blob/241fb3514b7c40957a86d869fecb7c7fc353f540/octo/data/dataset.py', reading: '2026-10-11 实读固定提交 make_dataset_from_rlds：统计与 standardize_fn 绑定；action_normalization_mask 长度必须匹配动作维，可让二值 gripper 不归一化。' },
  { id: 'oxe45', label: 'Open X-Embodiment / RT-X 原论文', url: 'https://arxiv.org/abs/2310.08864', reading: '2026-10-11 实读摘要与 X-robot 设定：不同观测/动作空间先经数据集专属标准化；论文正迁移结果不等于任意坐标拼接都能共享。' },
  { id: 'octoPaper45', label: 'Octo 原论文', url: 'https://arxiv.org/abs/2405.12213', reading: '2026-10-11 实读方法与跨本体实验：在 Open X-Embodiment 约80万轨迹上预训练，通过可替换输入/动作头适配新空间；结论限于论文平台与协议。' },
  { id: 'behavior45', label: 'StanfordVL · BEHAVIOR Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '2026-10-11 复核 challenge policy server、动作查询与任务实例评测；属于 StanfordVL/BEHAVIOR，不归入 World Labs。' },
  { id: 'worlds45', label: 'World Labs · R2S2R', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '2026-10-11 复核机器人状态、相机视角、外观/物理变体与仿真—真机排序；属于 World Labs 项目报告。' },
  { id: 'vjepa45', label: 'Meta/FAIR · V-JEPA 2', url: 'https://ai.meta.com/research/vjepa/', reading: '2026-10-11 复核视频表征与动作条件规划历史成果；动作进入 predictor 仍需明确语义，不写成 AMI 当前模型。' },
  { id: 'ami45', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '2026-10-11 复核表征空间预测、动作条件世界模型与可靠性方向；这是当前组织愿景，不冒充已发布跨本体实验。' },
];

export const day45: AuthoredDay = {
  reviewedAt: '2026-10-11', revision: '逐课编写 1.0',
  deliverable: '一份 SO-101 动作契约；一个“absolute→delta→分位数归一化→pad→反变换”离线夹具；一张复用统计、重算统计与 adapter 的晋级表。三课共100分钟，另留20分钟复盘。',
  question: {
    title: 'A 用米制末端 delta，B 用度制关节 absolute；都归一到 [-1,1] 后能否直接混训？',
    summary: '先对齐动作语义与逆变换，再按物理误差、越界率和闭环结果验收统计共享。',
    keywords: ['action semantics', 'delta and absolute', 'units', 'quantile normalization', 'round trip', 'embodiment adapter'],
    reference: '不能。相同范围未消除末端/关节、delta/absolute、米/度、参考系、频率和 gripper 语义差异。每个本体先固定 schema/adapter，再用与 checkpoint 绑定的 stats 归一化并 pad；推理严格逆变换。验收包括 stats_id/schema_hash、往返误差、物理单位误差、越界率、限幅/安全事件与同协议闭环成功率。只有接口和闭环证据都通过才能混入共享训练。',
  },
  lessons: {
    foundation: {
      title: '异构机器人与动作归一化：同一数值范围不是同一动作', minutes: 35,
      prerequisites: '10-13 已理解 π0 双专家，10-14 已理解归一化动作上的 flow；09-16 已学执行动作，10-02 已学状态统计。会读分位数与线性变换。',
      connection: '今天把10-14生成的无单位向量还原为本体动作；10-16再学习任务 prompt 与数据混合。若契约错，数据配比越精细只会越稳定地混合错误标签。',
      intro: '跨本体最危险的捷径是“都缩放到 [-1,1] 就统一”。归一化只改变尺度，不会把关节角变成末端位姿，也不会把 absolute 变成 velocity。顺序必须是定义语义、计算统计、验证可逆性。',
      outcomes: ['区分语义标准化、统计归一化与 padding', '手算 z-score 和 q01/q99 及物理误差', '建立 checkpoint—stats—schema 联合身份'],
      sections: [
        { heading: '01 四层契约不能折成一个 action_dim', body: '第一层是物理语义：每维代表关节角、末端位置、旋转还是夹爪，单位是 rad、degree、m 还是编码量，参考系是谁。第二层是控制语义：absolute、delta、velocity 或 torque，频率与 horizon 多长。Open X-Embodiment 的标准格式仍依赖数据集专属 standardize transform，并未删除本体差异。\n\n第三层才是统计变换；第四层是模型宽度。openpi 的 PadStatesAndActions 把 state/action 补到 action_dim，零填充只解决 shape，不赋予额外轴物理意义。SO-101 的真实维、模型 D 与发给执行器的命令长度必须分别记录。', sourceIds: ['oxe45', 'transforms45', 'config45'] },
        { heading: '02 z-score 与分位数缩放回答不同问题', body: 'z-score 把变化换成标准差单位，适合近似对称且尾部受控的连续量；q01/q99 把训练分布中间98%线性映射到约[-1,1]，对少量极端值更稳健。openpi 的分位数式不自动 clip，超出训练区间的动作会得到 |z|>1；这是分布外报警，不能在不说明时静默截断。\n\n数值例：末端 x-delta 的 q01=-0.04 m、q99=0.06 m，x=0.01 m 映射为0，x=0.08 m 映射为1.4。若均值0.01 m、标准差0.02 m，则0.03 m的 z-score 为1。两种“1”含义不同，checkpoint 必须声明 use_quantiles 与 stats_id。', formulas: [{ latex: String.raw`z_q=2\frac{x-q_{.01}}{q_{.99}-q_{.01}+\epsilon}-1,\qquad x=(z_q+1)\frac{q_{.99}-q_{.01}+\epsilon}{2}+q_{.01}`, explanation: 'x和q单位相同，z无量纲。按示例代入.08 m得约1.4；逆变换回到.08 m。' }] },
        { heading: '03 delta mask、norm mask 与 valid_dim 是三件事', body: 'openpi 配置用布尔 mask 选择哪些维从 absolute 改成相对当前 state 的 delta，输出再加回 state；机械臂维可做 delta 而 gripper 保持 absolute。Octo 的 action_normalization_mask 则选择哪些维做统计缩放，例如二值 gripper 可保持0/1。两个 mask 分别描述控制语义与数值处理。\n\npadding valid_dim 又回答哪些轴属于该机器人。gripper 可以“有效、absolute、不归一化”，padding 轴则根本不能送执行器。若把三个 mask 合并，程序很可能把有效 gripper 丢掉，或把无意义的补零轴当连续动作学习。', sourceIds: ['transforms45', 'config45', 'octo45'] },
        { heading: '04 stats 是 checkpoint 资产，不是随手缓存', body: 'openpi 把 state/action 统计随 checkpoint 保存。微调新数据时可复用匹配机器人的预训练统计，使动作落在模型熟悉坐标；也可重算目标统计，降低越界。官方建议都试，而非给出固定答案。动作定义不匹配时，复用统计没有意义。\n\nSO-101 离线清单至少记录 dataset revision、robot id、joint order、单位、delta mask、gripper 编码、fps、horizon、stats_id/hash、model action_dim 与 valid_dim。今天不连接串口或电机，只审计 manifest 和样例；真机还要过10-12安全门。', sourceIds: ['normDoc45', 'stats45'] },
      ],
      points: ['语义标准化先于数值归一化。', 'q01/q99 不等于 clip；越界是信号。', '三种 mask 不可混同。'],
      codeTitle: 'normalization_math.py · 原创分位数手算',
      code: String.raw`def qnorm(x, lo, hi, eps=1e-6):
    if not hi > lo:
        raise ValueError("degenerate statistics")
    return 2*(x-lo)/(hi-lo+eps)-1

def qunnorm(z, lo, hi, eps=1e-6):
    if not hi > lo:
        raise ValueError("degenerate statistics")
    return (z+1)*(hi-lo+eps)/2+lo

lo, hi = -.04, .06
assert abs(qnorm(.01,lo,hi)) < 1.1e-5
assert abs(qnorm(.08,lo,hi)-1.4) < 3e-5
for x in (-.04,.01,.06,.08):
    assert abs(qunnorm(qnorm(x,lo,hi),lo,hi)-x) < 1e-12
assert qnorm(.08,lo,hi) > 1
try:
    qnorm(0.,1.,1.)
    raise AssertionError("constant range accepted")
except ValueError:
    pass
print("quantile mapping and OOD flag: PASS")`,
      codeNotes: ['公式与 openpi 相同；教学版额外拒绝退化区间。', '端点、区间内与越界均有测试，1.4证明没有暗中clip。', '这只验证数学，不负责坐标系或控制语义。'],
      exercise: { prompt: 'q01=-0.2 rad、q99=0.3 rad。求x=0.05的z；z=0.6对应多少rad？', steps: ['区间宽0.5。', '分别代入正反变换。'], solution: '0.05位于正中，z=0；z=.6对应(.6+1)/2×.5-.2=.2 rad。若它是delta，控制器要absolute时还须加当前关节位置。' },
      quiz: { question: '为什么把 SO-101 的7维动作补到D=32，不代表与另一台32维机器人共享动作空间？', hint: '区分shape与物理语义。', keywords: ['padding', 'valid dimension', 'action semantics', 'units', 'embodiment'], reference: 'padding只匹配张量shape。前7维的顺序、单位、absolute/delta和gripper仍是SO-101专属，后25维无执行语义；另一台32维机器人可能完全不同。共享训练仍需本体adapter/schema与逆变换验收。' },
      sources: sources.slice(0, 8),
    },
    code: {
      title: '追踪 openpi 变换链：repack、delta、normalize、pad 与逆变换', minutes: 40,
      prerequisites: '完成本日四层契约；会读Python列表、dict和异常测试，理解[H,D]。',
      connection: '把公式落到 openpi 固定提交的调用顺序；路线课再比较旧stats与新stats。10-16只混合已通过该门禁的本体。',
      intro: '目标不是背类名，而是回答 raw action 在训练与推理各经过哪些可逆步骤。下面把上游分散的契约缩成标准库夹具，并明确它不是完整 JAX 实现。',
      outcomes: ['定位训练输入与推理逆链', '区分三种mask', '用正负测试锁定stats/schema身份'],
      sections: [
        { heading: '01 统计描述的是语义变换后的随机变量', body: 'openpi 的 transform_dataset 依次走 repack、data transforms、Normalize、model transforms。DROID/Libero式配置可先把absolute目标减当前state变成delta，所以 norm_stats 描述delta而非原始绝对位置。若先算stats再改delta，文件可加载但含义已错。\n\ncompute_norm_stats.py 只走repack与data transforms后累计统计，不会拿归一化数据重复计算自己；加载器对非fake数据缺stats会报错。这能防静默默认，却防不了选错asset_id，因此仍需manifest。', sourceIds: ['loader45', 'stats45', 'config45'] },
        { heading: '02 输出链严格反向', body: '模型输出从统一D取有效维，Unnormalize回到delta物理单位，再由data output transforms做AbsoluteActions等逆变换。Group.push把新输出插到已有输出前面，因为逆链次序与输入相反。只追输入不追输出，容易把归一化delta直接发给absolute控制器。\n\n教学fixture采用三维本体：前两维是absolute关节目标，训练前转delta；第三维是0/1 gripper，保持absolute且不归一化，随后补到D=5。推理先去padding、反归一化、再加当前state。', sourceIds: ['transforms45', 'octo45'] },
        { heading: '03 身份与负例比一个成功样本更重要', body: 'Contract 分别保存 delta_mask、norm_mask、真实维和模型宽度，并要求 stats_id 与 schema_id 同时匹配。正例给 state=[.4,-.2,0]、target=[.42,-.18,1]，前两维delta=.02；用[-.04,.06]映射约.2，gripper仍为1，再补零。\n\n负例拒绝退化统计、维数错配、未知stats、错误输出宽度；毫米数据冒充米会产生巨大|z|。这说明越界率能发现单位错误，但不会自动修好语义。', sourceIds: ['normDoc45', 'octo45'] },
        { heading: '04 往返通过不等于策略正确', body: 'round-trip 能抓顺序、单位、mask、stats和padding错误；但若正逆两边同时写错定义，它仍可能自洽。因此还需人工语义fixture：给定state与期望delta，核对最终命令，并在训练切分计算越界率。闭环成功、碰撞与安全裁剪是更高层证据。\n\n代码只处理内存浮点，不读文件、网络或设备。生产版还需批次/时间轴、dtype、角度环绕、限位、控制频率与checkpoint hash；这些未实现范围不能由教学PASS替代。' },
      ],
      points: ['stats在语义变换后、归一化前计算。', '输出逆序：去padding→unnormalize→恢复absolute。', '往返与语义fixture缺一不可。'],
      codeTitle: 'action_contract_roundtrip.py · 原创离线夹具',
      code: String.raw`from dataclasses import dataclass
import math

@dataclass(frozen=True)
class Contract:
    schema: str; stats: str; width: int
    delta: tuple; norm: tuple; lo: tuple; hi: tuple

def check(c):
    n=len(c.delta)
    if (c.schema,c.stats)!=("so101-v1","demo-r3"):
        raise ValueError("identity mismatch")
    if not (n==len(c.norm)==len(c.lo)==len(c.hi)<=c.width):
        raise ValueError("dimension mismatch")
    if any(m and not b>a for m,a,b in zip(c.norm,c.lo,c.hi)):
        raise ValueError("degenerate stats")
    return n

def encode(state,target,c):
    n=check(c)
    if len(state)!=n or len(target)!=n or not all(map(math.isfinite,state+target)):
        raise ValueError("bad action")
    x=[a-s if d else a for s,a,d in zip(state,target,c.delta)]
    z=[2*(v-a)/(b-a+1e-6)-1 if m else v
       for v,m,a,b in zip(x,c.norm,c.lo,c.hi)]
    return z+[0.]*(c.width-n)

def decode(state,padded,c):
    n=check(c)
    if len(padded)!=c.width:
        raise ValueError("width mismatch")
    x=[(v+1)*(b-a+1e-6)/2+a if m else v
       for v,m,a,b in zip(padded[:n],c.norm,c.lo,c.hi)]
    return [v+s if d else v for s,v,d in zip(state,x,c.delta)]

c=Contract("so101-v1","demo-r3",5,(True,True,False),
           (True,True,False),(-.04,-.04,0.),(.06,.06,1.))
state,target=[.4,-.2,0.],[.42,-.18,1.]
z=encode(state,target,c)
assert all(abs(a-b)<2e-5 for a,b in zip(z,[.2,.2,1.,0.,0.]))
assert max(abs(a-b) for a,b in zip(decode(state,z,c),target))<1e-12
bad=[
 Contract("so101-v1","wrong",5,c.delta,c.norm,c.lo,c.hi),
 Contract("so101-v1","demo-r3",2,c.delta,c.norm,c.lo,c.hi),
 Contract("so101-v1","demo-r3",5,c.delta,c.norm,(0.,-.04,0.),(0.,.06,1.))]
for item in bad:
    try:
        encode(state,target,item); raise AssertionError("bad contract")
    except ValueError: pass
try:
    decode(state,z+[0.],c); raise AssertionError("bad width")
except ValueError: pass
assert max(abs(v) for v in encode(state,[20.4,19.8,1.],c)[:2])>300
print("identity, masks, padding, round trip: PASS")`,
      codeNotes: ['Contract把schema/stats绑定，并分开delta与norm。', 'encode顺序为absolute→delta→normalize→pad，decode严格逆序。', '正例核对gripper“有效、absolute、不归一化”；负例覆盖身份、宽度、退化区间与单位错。'],
      exercise: { prompt: 'gripper误设norm=True且q01=q99=0会怎样？为何不能增大epsilon掩盖？', steps: ['看check。', '区分常量训练维与二值执行语义。'], solution: '必须报degenerate stats。增大epsilon只会制造人为尺度并破坏0/1语义；应声明不归一化，或用真正包含两种状态的数据重算，同时保留离散语义测试。' },
      quiz: { question: '为什么stats在DeltaActions后算，而推理要Unnormalize后再AbsoluteActions？', hint: '统计描述哪种随机变量？', keywords: ['transform order', 'delta action', 'unnormalize', 'absolute action', 'round trip'], reference: '模型学习delta坐标的归一化动作，统计必须描述delta。推理先恢复物理delta，再加当前state得到absolute；反序会混合不同中心和含义，破坏训练—执行契约。' },
      sources: sources.slice(0, 8),
    },
    insight: {
      title: '跨本体共享又不混淆：统计复用、adapter 与晋级门', minutes: 25,
      prerequisites: '能运行本日夹具；理解训练/验证切分与成功率。已知10-12安全门和10-14连续生成。',
      connection: '决定哪些本体数据可进入10-16混合；后续开放世界评测沿用同一stats/schema，不能结果不好时偷偷换坐标。',
      intro: '真正值得共享的是视觉、语言、任务进度和动作结构，不是强迫所有电机拥有同一数值。先把每台机器人变成可审计接口，再用消融决定复用统计还是重算。',
      outcomes: ['比较三条跨本体路线', '把normalized误差还原成物理单位', '说明世界模型也不能绕过动作契约'],
      sections: [
        { heading: '01 三条路线各有假设', body: '路线A为每个本体保留schema/stats，用embodiment id条件化共享backbone；解释清楚但要求模型分流。路线B经adapter映射到统一末端/关节delta再共享统计；更直接，却引入逆解、奇异位形与控制器误差。路线C只在动作定义匹配时复用预训练stats，再和新stats对照。\n\nOcto 用标准化transform和可替换动作头组织跨本体；openpi建议复用与重算都试。这不是SO-101必然受益的保证。个人项目先做A基线，只有末端坐标可验证才尝试B。', sourceIds: ['normDoc45', 'octoPaper45', 'oxe45'] },
        { heading: '02 normalized MSE 要换回物理容差', body: '分位数逆变换对z的尺度为range/2。同样误差0.1，在0.1 m范围约5 mm，在1.2 rad范围约0.06 rad；平均loss会掩盖哪个轴越过任务容差。必须逐维报告物理MAE、最大误差和容差。\n\n还要记录有效元素的越界率。复用stats若8%、新stats若1%，只能说明新统计覆盖目标数据更好；旧统计可能因预训练坐标熟悉而闭环更强。晋级同时看越界、往返、物理误差、限幅、jerk、成功率和失败切片。', formulas: [{ latex: String.raw`|\Delta x_i|\approx\frac{q_{.99,i}-q_{.01,i}}{2}|\Delta z_i|,\qquad r_{out}=\frac{\sum_{n,i}m_i\mathbf 1(|z_{n,i}|>1)}{N\sum_i m_i}`, explanation: '第一式还原物理单位；第二式只统计有效归一化维。低越界不证明语义正确。' }] },
        { heading: '03 双团队路线也依赖本体接口', body: 'StanfordVL/BEHAVIOR 提供任务、环境、policy server与评测；自定义机器人仍需action/observation adapter。World Labs R2S2R可改变机器人状态、视角、物理和外观并比较sim-real排序，但重建世界不能决定SO-101第三维是哪一关节。二者分属基准与空间仿真。\n\nMeta/FAIR V-JEPA 2-AC用动作条件模型在表征空间规划，动作进入predictor前仍需稳定定义；latent距离不会校正度/弧度。AMI当前公开的是研究方向，没有可引用的SO-101跨本体统计结果。', sourceIds: ['behavior45', 'worlds45', 'vjepa45', 'ami45'] },
        { heading: '04 SO-101 最小可证伪消融', body: '固定episode、初始化、训练步数、相机与控制协议，仅改变stats：S0复用匹配预训练统计，S1用SO-101训练切分重算，S2再加adapter。先离线生成manifest、越界、往返与物理误差；schema/hash不符直接拒绝，且不能用验证集重算。\n\n离线门通过后才计划人工监督的低速dry run；本自动化不控制机械臂。若S1降越界却不升成功，检查预训练尺度或数据量；若S2只降loss却增加时延/奇异失败，退回S1。选择依据是带区间的成功与安全事件。' },
      ],
      points: ['优先共享表征与接口，不强行共享电机数值。', '物理误差解释normalized loss。', '世界模型仍依赖可逆动作契约。'],
      codeTitle: 'stats_gate.py · 原创离线晋级门',
      code: String.raw`def gate(name,out_rate,roundtrip,mae,tol,clipped,success_low=None):
    vals=(out_rate,roundtrip,mae,tol,clipped)
    if any(type(v) not in (int,float) or v<0 for v in vals) or tol==0:
        raise ValueError("invalid metric")
    offline=(out_rate<=.05 and roundtrip<=tol/100
             and mae<=tol/2 and clipped<=.01)
    deploy=(offline and success_low is not None
            and 0<=success_low<=1 and success_low>=.70)
    return {"name":name,"offline":offline,"deploy":deploy}

reuse=gate("reuse",.08,1e-6,.003,.01,.004,.78)
fresh=gate("fresh",.01,1e-6,.004,.01,.006,None)
assert not reuse["offline"] and not reuse["deploy"]
assert fresh["offline"] and not fresh["deploy"]
try:
    gate("bad",-.1,0,0,.01,0,.9)
    raise AssertionError("negative rate accepted")
except ValueError: pass
print("offline gate separate from deployment evidence: PASS")`,
      codeNotes: ['阈值是教学假设，不是上游或硬件标准。', 'reuse即使成功率下界高，也不能绕过8%越界；fresh无闭环下界仍不可部署。', '代码不操作设备，生产需逐维/分任务指标。'],
      exercise: { prompt: '夹爪轴范围80 mm，归一化MAE=.06，任务容差2 mm。能过误差≤容差/2门吗？', steps: ['range/2乘误差。', '与1 mm比较。'], solution: '物理MAE=80/2×.06=2.4 mm，大于1 mm，失败。总体normalized loss小也不能掩盖执行轴超容差。' },
      quiz: { question: '复用stats越界率更高，但暂时成功率也更高，应立刻选哪个？', hint: '接口门与性能证据不能互相替代。', keywords: ['pretrained statistics', 'out-of-range rate', 'offline gate', 'closed-loop', 'ablation'], reference: '都不能立刻晋级。先排除单位/schema错误；接口门失败时成功可能偶然或被裁剪掩盖。修复后固定协议重复S0/S1，报告物理误差、安全事件与成功率区间，只选接口合法且闭环稳定者。' },
      sources,
    },
  },
};
