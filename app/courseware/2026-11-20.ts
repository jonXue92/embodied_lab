import type { AuthoredDay } from './types';

export const day81: AuthoredDay = {
  reviewedAt: '2026-11-15',
  revision: '逐课编写 1.0',
  deliverable: '一页策略梯度的条件期望推导，一份动作 log-prob 的 PyTorch 梯度夹具，以及按遮挡分层的探索验收表。核心课共 100 分钟。',
  question: {
    title: '旧策略在遮挡时以 0.25 概率选择补拍，某次补拍优势为 +0.8。新策略把该概率改为 0.50。更新方向、动作概率比和验收证据各是什么？',
    summary: '把一个梯度样本、分布变化与实际闭环效果联系起来。',
    keywords: ['logit', '优势', '概率比', '旧策略', '分层', '接管'],
    reference: '在旧策略处，补拍相对另一动作的 logit 的上升梯度贡献是 0.8×(1−0.25)=0.60。该动作的新旧概率比为 2，说明这次分布变化很大；单条样本与代理目标都不能判断部署收益。固定下游执行与时钟，用未见初态配对统计遮挡分层的成功、接管、近失和重观测延迟，再判断是否可接受。日志需要绑定旧策略概率、实际采样的高层动作和结局。',
  },
  lessons: {
    foundation: {
      title: 'Policy Gradient',
      minutes: 35,
      prerequisites: '能按 11 月 18 日的约定算折扣回报，并用 11 月 19 日的同状态基线解释优势的正负。复习 9 月 9 日对计算图的检查。',
      connection: '今天在旧策略分布下推导单次更新的方向。11 月 21 日再处理复用同一批旧轨迹时的概率比与 PPO 裁剪。',
      intro: '从一段由机器人策略和环境共同产生的轨迹出发，解释为什么不需要对相机、接触动力学和成功判定器求导。',
      outcomes: ['从轨迹因子拆出梯度可见的部分', '手算两类动作的 score 梯度并说明状态基线为何消失'],
      sections: [
        {
          heading: '先写清楚哪部分分布随策略变化',
          body: '把易检查的教学任务定为有限决策窗，动作有“补拍后重判”和“立即放置”两类。策略在每个观测历史上输出一个概率分布。环境从执行者收到动作后推进接触过程，回传图像、本体状态及奖励；环境初值和转移核对策略参数 θ 没有显式依赖。为简化符号，先用足够的状态 s；部分可观测时，条件输入可以改成决策时可见的历史。我们优化整段折扣回报的期望，允许轨迹分布随策略变化。\n\n把轨迹密度写成初态概率乘每步的策略概率和环境转移核。对密度直接求导，再用 ∇p=p∇log p，把求和重写为原分布下的期望。取轨迹 log 时乘积变为加法，初始分布和环境转移项的直接 θ 导数为零，留下各步动作 log-prob 的梯度。动作改变后可能触发完全不同的接触和奖励，这种影响已体现在由策略抽到不同轨迹的频率。假设支持集稳定且导数可与期望交换，离散有限例子满足后者。',
          formulas: [{ latex: String.raw`p_\theta(\tau)=\rho(s_0)\prod_{t=0}^{T-1}\pi_\theta(a_t\mid s_t)P(s_{t+1}\mid s_t,a_t),\quad \nabla_\theta\log p_\theta(\tau)=\sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(a_t\mid s_t)`, explanation: 'τ 是有 T 次决策的轨迹；ρ 为初态分布，P 是环境核。式中假设奖励由转移给定，若奖励本身随机，可把其分布并入环境核。' }],
          sourceIds: ['spinning', 'sutton'],
        },
        {
          heading: '为什么已经发生的奖励可以拿掉',
          body: '对第 t 拍，条件给定采样动作之前的历史，归一化带来 score 的条件均值为零：把每个动作的 log 概率导数乘回其概率并求和，等于对概率和 1 求导。早于 t 的奖励已经由这段历史决定，乘上当拍 score 后的期望也是零。例如上一拍因等待扣了 0.1 分，这笔成本在当前补拍与直接放置的选择之前就已发生，不应用来系统性鼓励其中一项。\n\n同样的论证允许减只由决策前信息决定的基线 b。用昨天的价值估计可使样本权重变成相对表现，估值不准仍可能带来高方差。若把“本次实际选择的动作是否成功”塞进基线，它已依赖动作，均值为零的推导便不成立。实现时，先把优势当作固定权重。若 critic 共享编码器，它可以通过自己的值损失反传，actor 目标不应额外沿着优势标签求导。',
          formulas: [{ latex: String.raw`\mathbb E_{a\sim\pi_\theta(\cdot\mid s)}[b(s)\nabla_\theta\log\pi_\theta(a\mid s)]=b(s)\nabla_\theta\sum_a\pi_\theta(a\mid s)=0`, explanation: 'b 的单位是奖励，score 是对参数的对数概率导数。等式允许 b 来自当前策略的值估计，但在此梯度项内把它当权重。' }],
          sourceIds: ['spinning', 'sutton'],
        },
        {
          heading: '区分从起点折扣与从当前拍折扣',
          body: '设目标从起点累计 γ 的幂次。去掉历史奖励后，第 t 拍的未来奖励仍各带从起点开始的折扣。把共同的 γ 的 t 次幂拿出来，括号中才得到从 t 开始的折扣回报 G_t。取自然回合、从同一初态分布产生的轨迹时，目标若采用这套定义就保留外层权重。另一种表达把折扣放进状态访问分布。阅读代码时应核对所优化的目标与实际行采样权重。\n\n例子里 γ=0.9，只有第 2 拍（从 0 开始）拿到 1 分并结束。第 1 拍的 G 为 0.9，外层再乘 0.9，总权重 0.81；第 2 拍的 G 为 1，外层为 0.81。Spinning Up 理论示例先用有限时域无折扣目标，实际 VPG 示例讨论中也指出实践常用折扣优势。复现时要注明这个区别，尤其不要把通用的批均值代码当作任意时域目标的精确估计。',
          formulas: [{ latex: String.raw`G_t=\sum_{k=t}^{T-1}\gamma^{k-t}r_k,\qquad \nabla_\theta J=\mathbb E_{\tau\sim p_\theta}\!\left[\sum_{t=0}^{T-1}\gamma^t(G_t-b(s_t))\nabla_\theta\log\pi_\theta(a_t\mid s_t)\right]`, explanation: 'r_t 记为执行 a_t 后所得奖励；γ 无量纲，J 定义为起点 E[G_0]。γ=1 时外层权重消失。' }],
          sourceIds: ['spinning', 'sutton'],
        },
        {
          heading: '用两类动作的精确期望校准符号',
          body: '以补拍为 Bernoulli 正类，概率 p 由相对 logit z 的 sigmoid 产生，直接放置概率为 1−p。采样到补拍时 score 是 1−p，采样到直接放置时是 −p。在同一个决策点，若补拍与放置的 Q 分别为 0.9 与 0.3，p=0.25，则价值为 0.45，优势分别为 0.45 和 −0.15。按概率加权，期望梯度为 0.25×0.45×0.75+0.75×(−0.15)×(−0.25)=0.1125。\n\n这里固定后续策略，把问题缩成只有一次决策。直接求 0.3+0.6p 对 z 的导数也得到 0.1125，提供第二条校验路径。换到真实小批次，单条正优势推动被采样动作的相对概率上升，多状态共享参数以后，另一个状态的概率也可能跟着变化。下一节会检查损失的符号与权重 shape，随后在保留的遮挡状态上测更新幅度。',
          formulas: [{ latex: String.raw`p=\sigma(z),\quad \partial_z\log\pi(a)=a-p,\quad \partial_z J=p(1-p)(Q_1-Q_0)`, explanation: 'a=1 表示补拍，a=0 表示放置。Q_1 与 Q_0 以奖励单位表示。第三式只用于此单步固定后续条件。' }],
          sourceIds: ['spinning'],
        },
      ],
      points: ['score 对动作求条件期望为零。', '起点折扣和局部回报的折扣起点不同。', '精确梯度可用于验证一次 Monte Carlo 更新的符号。'],
      codeTitle: 'binary_score_identity.py · 枚举两种动作核对梯度',
      code: `from math import isclose

def expected_gradient(p, q0, q1, baseline):
    if not 0 < p < 1:
        raise ValueError('probability must have full binary support')
    return (1 - p) * (q0 - baseline) * (-p) + p * (q1 - baseline) * (1 - p)

assert isclose(expected_gradient(.25, .3, .9, .45), .1125)
assert isclose(expected_gradient(.25, .3, .9, 4.0), .1125)
assert isclose(expected_gradient(.25, .9, .3, .45), -.1125)
try:
    expected_gradient(1.0, .3, .9, .45)
except ValueError:
    pass
else:
    raise AssertionError('boundary probability accepted in the log-score example')
print('binary score and baseline identity verified')`,
      codeNotes: ['枚举两类动作，乘各自的采样概率；所有 Q 都视为已给定，未估计任何真实机器人回报。', '平移同状态基线不改期望，交换 Q 则反转符号；边界测试对应 log-score 推导的支持集假设。'],
      exercise: { prompt: '口算一个稀有动作的更新强度', steps: ['把补拍概率改为 0.1，保留 Q0=0.3 与 Q1=0.9。', '算新基线和期望梯度，再说明罕见采样对估计的影响。'], solution: 'V=0.36，A1=0.54，A0=−0.06，期望梯度为 0.6×0.1×0.9=0.054。少量 rollout 中可能根本没有补拍样本，不能依据一次经验梯度判断补拍价值已经学稳。' },
      quiz: { question: '为什么将采样动作之后的夹爪反馈作为状态基线输入会破坏消项证明？', hint: '在 score 的条件期望中尝试把这一项移到求和外。', keywords: ['基线', '动作依赖', '条件期望', '归一化'], reference: '本拍夹爪反馈依赖实际动作，因此基线在逐动作求和时可能变化，不能提出求和号。只有给定决策前状态后各动作共享的基线才用到归一化求导为零。' },
      sources: [
        { id: 'spinning', label: 'OpenAI Spinning Up · Intro to Policy Optimization', url: 'https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html', reading: '读轨迹密度推导、Expected Grad-Log-Prob Lemma、Reward-to-Go 和 Baselines。' },
        { id: 'sutton', label: 'Sutton 等 · Policy Gradient Methods (NeurIPS 1999)', url: 'https://proceedings.neurips.cc/paper_files/paper/1999/file/464d828b85b0bed98e80ade0a5c43b0f-Paper.pdf', reading: '读第 1 节式 (1)–(2)，比较从指定初态出发的折扣访问权重与平均奖励。' },
      ],
    },
    code: {
      title: '实现 log-prob objective',
      minutes: 40,
      prerequisites: '会用 PyTorch 检查 batch 维、读取梯度，了解 11 月 19 日优势与 value targets 的生成时机。',
      connection: '把昨天的 advantage 张量接进可求导的动作概率；明天仍需旧策略 log-prob，并进一步计算比值。',
      intro: '追踪 SB3 v2.7.1 的 A2C 训练函数，再用两拍的离散动作夹具锁定常见的广播和梯度边界错误。',
      outcomes: ['将采样缓存、重算分布和 actor 损失定位到函数', '验证动作索引、batch 轴和 detached 优势的梯度'],
      sections: [
        {
          heading: '旧动作保留索引，训练时重算概率',
          body: 'SB3 v2.7.1 的 OnPolicyAlgorithm.collect_rollouts 在无梯度上下文调用当前策略，记录采样动作、估值和 log-prob，执行环境交互后将它们写入 rollout buffer。上课时把每条记录视为一份合同：observation 是决策前帧，action 是这一次分布实际抽出的量，advantage 来自同一拍的回报和估值。连续 Box 动作可以在传到 env.step 前被缩放或裁剪，而缓冲仍写采样动作，因此执行侧日志应另存传入的值。把裁剪后的值当作原高斯采样去重算 log 概率会改变含义。\n\nA2C.train 调用 RolloutBuffer.get(batch_size=None) 取整批；离散动作转成长整数并展平，再交给 ActorCriticPolicy.evaluate_actions。该方法做特征提取和 actor/critic 分支计算，通过 _get_action_dist_from_latent 构造当前动作分布，然后在已有动作上评估 log_prob 和 entropy，返回 critic 估值。保存的旧 log-prob 本身无梯度，直接代入就不会更新 actor。教学日志会同时保存采样 ID 与实际执行事件，保证审计能找到两端。',
          sourceIds: ['collect', 'a2c', 'policy'],
        },
        {
          heading: '每个样本只配一项优势和联合动作概率',
          body: 'B 个离散决定对应 logits 形状 B×K、动作索引 B、优势 B，Categorical.log_prob 返回 B。若把优势留成 B×1，与 log_prob 的 B 相乘会广播为 B×B。比如优势向量 [0.8, −0.4] 本应分别给两拍权重，广播后每拍都同时乘这两个数，行差异在求均值时就会消失。先检查 shape，再看每一拍的独立梯度行；只看 loss 数值很难定位这类错误。\n\n多轴动作需先定义事件。若是对角高斯，每个维度条件独立，联合密度是各维之积，因此联合 log 密度沿最后的动作维求和。SB3 的 DiagGaussianDistribution.log_prob 调用 sum_independent_dims 做此事。相关动作、相依关节或跨时间的条件采样需按已定义的联合分布计算；不能随便把形状 B×H×D 上的全部元素当成独立。动作段若执行到一半因新观测而中断，还需记录实际决策间隔和终止原因。',
          sourceIds: ['policy', 'dist'],
        },
        {
          heading: '最小化负号损失并隔离优势来源',
          body: '源码将 policy_loss 写成优势与 log_prob 乘积的负均值。另算 returns 与当前 values 的均方误差，并把负熵按 ent_coef 加入总损失，再反传、裁剪总梯度和走一步优化器。normalize_advantage 是可选分支；本例直接喂固定优势。actor 目标使用 detach 后的权重，即使调用者意外传入了由 critic 计算、仍附着图的张量，也不会沿着标签走到 critic。\n\n夹具的第一行抽动作 1，第二行抽动作 0；初始两个 logits 都为 0。权重分别为 0.8 和 −0.4，按两拍均值，梯度各为 [0.2, −0.2] 与 [0.1, −0.1]。沿负梯度迈一步后，第一行的已选动作变得更可能，第二行的已选动作变得更少。原 SB3 还处理环境、网络、价值、熵、训练状态和配置，代码只复现离散 actor 项。传入从另一轮采样来的动作只为了测试时，应清楚标注，它不构成合法同策略更新。',
          formulas: [{ latex: String.raw`\mathcal L_{\pi}(\theta)=-\frac{1}{B}\sum_{i=1}^{B}\operatorname{stopgrad}(\hat A_i)\log\pi_\theta(a_i\mid s_i)`, explanation: 'B 为一批有效决策数；log-prob 无量纲。此式是固定批次上的代理损失，θ 取采样参数时用于估计本轮上升方向。' }],
          sourceIds: ['a2c', 'spinning'],
        },
        {
          heading: '把采样策略版本写进更新入口',
          body: '测试首先固定两个 row 的动作索引和优势，反传后逐行对照理论梯度，并检查优势张量的 grad 为 None。随后用一个很小的梯度下降步，只观察对应动作概率的变化。再故意把优势升一维，并把另一份动作索引写出取值域，要求两者都抛异常。这两个错误分别发生在广播阶段和分布索引阶段，单独的快照能够说明出错位置。\n\n复现的下一步是在每个 rollout 冻结策略身份，用第一批训练前的参数复算同一动作的 log-prob，观察与缓存值是否一致。比较时也需固定归一化统计、动作缩放、观测缓存和网络的模式；若改了其中任一项，即使权重文件相同，重算的分布也可以变。明天读 PPO 如何对新旧 log-prob 的差值取指数，今天先确保分子分母在同一事件上定义。',
          sourceIds: ['collect', 'a2c', 'policy'],
        },
      ],
      points: ['重算的是同一个已采样动作的概率。', '逐样本配对防止广播生成 B×B。', 'critic 标签和 actor 概率有不同的反传责任。'],
      codeTitle: 'categorical_actor_check.py · 用已知梯度验证概率更新',
      code: `import torch
from torch.distributions import Categorical

def actor_loss(logits, actions, advantages):
    batch, choices = logits.shape
    if actions.shape != (batch,) or advantages.shape != (batch,):
        raise ValueError('actions and advantages must have one value per row')
    if actions.dtype != torch.long or torch.any((actions < 0) | (actions >= choices)):
        raise ValueError('invalid categorical action')
    log_prob = Categorical(logits=logits).log_prob(actions)
    return -(log_prob * advantages.detach()).mean()

logits = torch.zeros((2, 2), dtype=torch.float64, requires_grad=True)
actions = torch.tensor([1, 0])
weights = torch.tensor([.8, -.4], dtype=torch.float64, requires_grad=True)
actor_loss(logits, actions, weights).backward()
expected = logits.new_tensor([[.2, -.2], [.1, -.1]])
torch.testing.assert_close(logits.grad, expected)
assert weights.grad is None

updated = (logits.detach() - .1 * logits.grad).softmax(dim=1)
assert updated[0, 1] > .5 and updated[1, 0] < .5

for wrong_actions, wrong_weights in [(actions, weights[:, None]), (torch.tensor([2, 0]), weights)]:
    try:
        actor_loss(logits, wrong_actions, wrong_weights)
    except ValueError:
        continue
    raise AssertionError('an invalid categorical batch was accepted')
print('log-prob gradient, detach and action indexing verified')`,
      codeNotes: ['第 0 轴索引决策样本，第 1 轴枚举互斥类别。', '反传对比每行的闭式梯度，并验证优势权重被冻结。', '只减一次合成梯度以检查优化方向。两个负例分别触发形状检查和类别检查。'],
      exercise: { prompt: '去掉无关的参数变化', steps: ['对第一行两个 logits 同时加 3。', '推导概率和梯度并修改夹具验证。'], solution: 'softmax 对整行常数平移不变，第一行仍是 (0.5,0.5)，梯度仍为 [0.2,−0.2]；第二行也不变。用稳定的 Categorical(logits=...) 无需自己先指数化再取对数。' },
      quiz: { question: '连续控制时三轴动作先从对角高斯抽样，随后客户端限幅。为何不能直接对三轴限幅后的数值求三项 Gaussian log_prob 当作缓存值？', hint: '考虑超过上界的无穷多个采样值对应同一个执行值。', keywords: ['采样', '限幅', '联合密度', '执行值'], reference: '缓存的值对应原始三轴采样的联合密度，三轴条件独立时求和得到 log 密度。限幅发生在分布到环境的映射上，边界会积累概率质量，不能用原高斯在边界的密度代替。记录原始样本和实际执行值两个字段。' },
      sources: [
        { id: 'collect', label: 'SB3 2.7.1 · OnPolicyAlgorithm', url: 'https://stable-baselines3.readthedocs.io/en/v2.7.1/_modules/stable_baselines3/common/on_policy_algorithm.html#OnPolicyAlgorithm.collect_rollouts', reading: '定位 collect_rollouts，读 no_grad、连续动作转换与 rollout_buffer.add。' },
        { id: 'a2c', label: 'SB3 2.7.1 · A2C.train', url: 'https://stable-baselines3.readthedocs.io/en/v2.7.1/_modules/stable_baselines3/a2c/a2c.html#A2C.train', reading: '沿 train 内的整批取样、离散动作转换、actor/critic/熵损失与 optimizer.step 阅读。' },
        { id: 'policy', label: 'SB3 2.7.1 · ActorCriticPolicy', url: 'https://stable-baselines3.readthedocs.io/en/v2.7.1/_modules/stable_baselines3/common/policies.html#ActorCriticPolicy.evaluate_actions', reading: '定位 evaluate_actions 和 _get_action_dist_from_latent，核对分布、值输出及 log_prob。' },
        { id: 'dist', label: 'SB3 2.7.1 · distributions', url: 'https://stable-baselines3.readthedocs.io/en/v2.7.1/_modules/stable_baselines3/common/distributions.html#DiagGaussianDistribution.log_prob', reading: '读 DiagGaussianDistribution.log_prob 与 sum_independent_dims 的联合动作约定。' },
        { id: 'spinning', label: 'OpenAI Spinning Up · Vanilla Policy Gradient', url: 'https://spinningup.openai.com/en/latest/algorithms/vpg.html', reading: '对照伪代码中用旧数据估计梯度并做一次 actor 更新的顺序。' },
      ],
    },
    insight: {
      title: '探索与稳定更新的矛盾',
      minutes: 25,
      prerequisites: '会从概率与优势读出局部更新方向，能在 11 月 14 日安全回退课的基础上识别动作是谁批准与执行的。',
      connection: '今天量化策略移动的幅度与探索行为；明天把概率比定义落实到 PPO，并检查裁剪遗漏的风险。',
      intro: '设计一个低算力的遮挡恢复实验，同时测动作分布漂移、真实任务结果和安全事件。',
      outcomes: ['计算分层的 KL 与选中动作比值', '给 SO-101 的离线或交互仿真评测指定下游动作权限和观测回流'],
      sections: [
        {
          heading: '探索发生在哪个接口',
          body: '在 SO-101 放置场景中，把探索限制为高层在“请求复拍”和“提交现有放置技能”之间采样。高层读取当拍 RGB、本体状态和历史帧年龄，只输出技能类别；复拍路径走经验证的观测技能，放置由固定版本的 VLA 或固定脚本生成候选轨迹，低层控制器按现有边界执行合规命令。成功或失败由仿真里的容器与物体状态判定，回传新图像、关节状态以及接管原因给上层。本例只在日志表和可交互仿真设计中处理该接口。\n\n也可以直接增大连续关节动作的采样标准差。那样能发现高层技能库之外的控制策略，代价是要重新承担关节限位、接触动力学和动作时钟的验证，同时需要更多交互重置。对于先验证 RAW 编码器是否帮助遮挡恢复的目标，冻结下游动作技能可将变化指向选技能的概率；动作空间太窄时，遇到需要新夹持姿态的失败，就单列为不支持实例并保留总分母。',
          sourceIds: ['r2s2r', 'behavior'],
        },
        {
          heading: '平均漂移会掩盖遮挡子集',
          body: '取自然对数。遮挡状态中补拍概率由 0.25 增到 0.50，采到补拍时概率比是 2，采到直接放置时比值为 2/3。旧分布到新分布的 KL 为 0.25ln(0.5)+0.75ln(1.5)≈0.1308 nat。设日志中普通样本占 95%，它们的新旧概率完全一致，整批平均值只有约 0.00654 nat。检查遮挡分层、最大或高分位差值能直接发现该测试集中的变化幅度。阈值由仿真试验预先设定，此处数值用于手算。\n\nKL 衡量分布变化，不含机器人是否夹稳、控制是否超时的信息；它甚至可能在任务成功率上升时变大。对高风险分层同时记录复拍率、复拍后有效观测比例、接管与近失，给每项独立的分母。将回看请求到新鲜帧到达的时延与整个回合完成时延分开测，才能区分策略过度回看和系统复拍通道变慢。',
          formulas: [{ latex: String.raw`D_{\mathrm{KL}}(\operatorname{Ber}(p)\Vert\operatorname{Ber}(q))=p\ln(p/q)+(1-p)\ln((1-p)/(1-q))`, explanation: 'p 与 q 分别为旧、新策略在同一历史的补拍概率。KL 用自然对数，单位 nat，要求示例的两种动作在两策略下都有正概率。' }],
          sourceIds: ['ppo'],
        },
        {
          heading: '把世界模型放进评测链上的具体位置',
          body: 'StanfordVL BEHAVIOR Challenge 的评测给任务初始实例和评测协议，适合借鉴固定实例、动作预算与目标谓词的观念。World Labs 的 R2S2R 则从重建并对齐的任务场景产生可交互变化，再用模拟和 ALOHA 真机配对评测检查 checkpoint 的排序。这两个工作分别回答任务如何定义、仿真是否能筛选真实策略。移到自己的遮挡实验，可以固定初态、物体、视角与任务谓词，设置未见遮挡组合，并让同一版本的闭环执行者在仿真中收到每次实际决策的动作。\n\nMeta/FAIR 历史 V-JEPA 2 的机器人实验用图像目标与带动作条件的预测打分，实际机器人闭环还需要被选的动作、执行器及观察回流。它可作为“复拍之前是否值得评估候选后果”的规划对照。候选表征距离用来排序，不能当成本轮采样轨迹的实收奖励。AMI Labs 当前公开方向也提出动作条件预测、约束内规划与可靠性；官网这段方向描述只能支持提出对照假设。比较两种高层路径时记录规划调用数与墙钟延迟，高层仍通过同一技能接口和执行检查。',
          sourceIds: ['behavior', 'r2s2r', 'vjepa', 'ami'],
        },
        {
          heading: '在小预算里设计可解释的比较',
          body: '在 Mac 先从合成日志验证两个概率，再用算得动的简化交互仿真固定种子和初态，按遮挡程度做配对。用离线日志时可以检查分布变化、估值误差和框选质量，实际更改动作后能否成功需要重置仿真再试。举例在同样的 20 个遮挡初态加预设种子上，旧策略成功 10 次、新策略 13 次，分母各含全部试验。若其中新独胜 5 个、旧独胜 2 个，成功差为 3/20=15 个百分点，同时报告未完成、近失和接管的计数。20 对数据不足以把这个差值泛化到真机。\n\n用现有 RAW/ISP 经验做正交对照。先锁定同一策略更新步长，分别用 RGB 和固定 RAW 编码器构造观测；再固定其中一种表征比较两档探索幅度。所有路径共享初态池、动作权限和时间预算，保留训练和隐藏初态的界限。若 RAW 与新策略一起切换，就无法辨别改进源于更清晰的遮挡观测还是更高的复拍概率。给采样日志保存分层、策略版本、动作比、决策至观测时延，明天讨论 PPO 比值时直接用这四列。\n\n选读 Isaac Lab Warp 的 PhysX 肌腱掩码提交。作者计时的是半数并行环境被选中时的缓冲写入，写入物理后端仍走索引，且该操作未进入任务每步调用。若后端也在迭代，就在同一个提交上比较高层探索配置，另表记录重置阶段的参数写入和执行循环的观测延迟。',
          sourceIds: ['r2s2r', 'ppo', 'behavior', 'warp'],
        },
      ],
      points: ['定义探索动作的层级、权限与观测回路。', '在风险分层逐项核对概率变化和环境结局。', '用相同初态及动作接口隔离表征与探索幅度。'],
      codeTitle: 'occlusion_drift.py · 聚合均值掩盖的概率变化',
      code: `from math import isclose, log

def bernoulli_kl(old, new):
    if not (0 < old < 1 and 0 < new < 1):
        raise ValueError('this example assumes common full support')
    return old * log(old / new) + (1 - old) * log((1 - old) / (1 - new))

ordinary = bernoulli_kl(.4, .4)
occluded = bernoulli_kl(.25, .5)
pooled = .95 * ordinary + .05 * occluded
assert isclose(ordinary, 0.0, abs_tol=1e-12)
assert isclose(occluded, .13081203594113697)
assert pooled < .01 < occluded
assert not isclose(occluded, bernoulli_kl(.5, .25))
try:
    bernoulli_kl(.25, 0)
except ValueError:
    pass
else:
    raise AssertionError('zero support on a sampled action was accepted')
print('occlusion drift persists below the pooled threshold')`,
      codeNotes: ['KL 方向固定为旧到新；加权值假定普通状态和遮挡状态在日志中的占比。', '0.01 nat 只用于展示分层会改变判读，代码没有上线门槛、机器人接口或任务成功模型。'],
      exercise: { prompt: '验收出现相反信号时先读配对结果', steps: ['设新独胜 5、旧独胜 2，同胜 8、同败 5。', '计算成功差，假设新策略出现 3 次近失、旧策略 0 次，写出下一次仿真检查。'], solution: '总计 20 对，旧成功 10/20，新成功 13/20，差 15 个百分点。复放 3 次近失，定位复拍请求时机、实际观测年龄与低层技能输入，再按遮挡等级核对近失是否集中；最终验收同时记录成功和近失两条结果。' },
      quiz: { question: '训练批次的平均 KL 低于 0.01 nat，但遮挡层中补拍概率翻倍，什么证据能决定是否保留这次更新？', hint: '想想复拍既可能恢复观测，也可能消耗时间。', keywords: ['分层', '配对', '近失', '接管', '延迟'], reference: '记录遮挡层样本数和新旧概率，再在相同初态、时间预算、仿真设置及下游动作约束下运行配对回合，核对成功、近失、接管和复拍延迟。概率变化本身只说明策略移动，实测结果才支持决定。' },
      sources: [
        { id: 'ppo', label: 'Schulman 等 · PPO v2', url: 'https://arxiv.org/pdf/1707.06347v2', reading: '选读第 2.1–2.2 节对重复更新与平均 KL 的讨论。第 3 节留给 11 月 21 日。' },
        { id: 'behavior', label: 'StanfordVL · BEHAVIOR Evaluation and Rules', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '读评测实例、任务规则及成功指标，借鉴实例固定与分母管理。' },
        { id: 'r2s2r', label: 'World Labs · Building Worlds That Train Robots', url: 'https://worldlabs.ai/blog/real-to-sim-to-real', reading: '选读 Evaluation 的虚实配对、ID/OOD 与排序，注意 ALOHA 任务和条件。' },
        { id: 'vjepa', label: 'Meta AI · Introducing V-JEPA 2', url: 'https://ai.meta.com/research/vjepa/', reading: '读 Planning for robotic control 与训练阶段，核对目标图像和机器人闭环实验。' },
        { id: 'warp', label: 'Isaac Lab · PhysX tendon mask setters', url: 'https://github.com/isaac-sim/IsaacLab/commit/eceac1ac19e6ddaf63bb6bd79c0d71fe904b8ed5', reading: '选读 set_fixed_tendon_stiffness_mask 与提交的性能说明，比较缓冲写入和向仿真提交动作的测量范围。' },
        { id: 'ami', label: 'AMI Labs · 研究方向', url: 'https://amilabs.xyz/', reading: '选读表征空间、动作条件及安全约束的组织研究方向。' },
      ],
    },
  },
};
