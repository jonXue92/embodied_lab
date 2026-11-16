import type { AuthoredDay } from './types';

export const day82: AuthoredDay = {
  reviewedAt: '2026-11-16',
  revision: '逐课编写 1.0',
  deliverable: '一张 PPO 正负优势分段图、一套检查比值和梯度的 PyTorch 夹具，以及一份按初态分层的 SO-101 仿真后训练对照表。核心课共 100 分钟。',
  question: {
    title: '旧策略采到“退回重判”的概率为 0.20，新策略重算为 0.28，该行优势为 +0.5，裁剪宽度 0.2。同一小批还有负优势行，平均 KL 低，但遮挡层的失败增多。怎样判断这个更新？',
    summary: '先算正优势行的目标与梯度，再定位平均训练统计遗漏的闭环证据。',
    keywords: ['1.4', '0.60', '平坦区', '旧策略', '遮挡', '配对评测'],
    reference: '在同一观测、同一采样动作上比值为 1.4。未裁剪项是 0.70，裁剪项为 0.60，min 取 0.60，这个 actor 样本对本行 log-prob 的直接梯度为零。批中的负优势行、共享参数、value 和 entropy 仍可改变策略。平均 KL 可以淹没遮挡层变化。用保留的遮挡初态配对比较旧新策略，锁定执行器和时钟，报告各层成功、接管与动作越界的计数和样本量，再决定候选是否合格。',
  },
  lessons: {
    foundation: {
      title: 'PPO clipped objective',
      minutes: 35,
      prerequisites: '能从 11 月 19 日的 GAE 得到带符号的优势，并按 11 月 20 日的方法在一个已采样动作上重算 log-prob。',
      connection: '昨天只讨论采样参数处的一阶方向。今天解释旧轨迹的小批量复用，11 月 22 日换到 SAC 的经验回放和最大熵目标。',
      intro: '把概率比、优势符号和损失曲线画在一张图上，理解为何裁剪只移除有利方向上的额外激励。',
      outcomes: ['从固定旧状态分布下的动作重加权得到采样比', '用正负优势分别推导平坦区，并解释裁剪的边界'],
      sections: [
        {
          heading: '对同一件事重算概率',
          body: '以仿真里夹爪靠近工件的某一拍为例。旧策略根据观测抽到动作 a，并把推理前的观测、采样值和概率一起存入本轮 rollout。之后对同一个动作求新策略概率。若只在这个固定观测上改变动作分布，原来按旧策略对动作求和的每项，乘上新旧概率之比，正好换成新策略的动作权重。连续动作应换成对同一事件定义的密度与积分。旧策略需要覆盖新策略用于重加权的动作支持集。\n\n这个换分布只发生在每条旧观测之内。整段轨迹上新策略会改变后续看到的场景，也会改变成功和碰撞分布。PPO 把旧轨迹和估好的优势作为一轮代理目标的基础，完成若干 epoch 后重新采样。若旧策略在某观测下以 0.40 抽到某动作，新策略是 0.52，则 r=1.30。两边都取 log 再作差是同一个比。如果观测归一化或动作映射被悄悄替换，需要先检查计算的概率是否仍对应采样当时的事件。',
          formulas: [{ latex: String.raw`r_t(\theta)=e^{\log\pi_\theta(a_t\mid s_t)-\log\pi_{\mathrm{old}}(a_t\mid s_t)},\qquad \mathbb E_{a\sim\pi_{\mathrm{old}}}[r(a)f(a)\mid s]=\mathbb E_{a\sim\pi_\theta}[f(a)\mid s]`, explanation: '两侧固定同一状态 s，f 是固定的动作函数。概率比和裁剪宽度无量纲。动作支持条件使右侧每项都能由左侧表示。' }],
          sourceIds: ['paper', 'course'],
        },
        {
          heading: '优势为正时的右侧平台',
          body: '设优势来自旧批，优化本轮时对它停止梯度。原来的代理项 rA 会奖励正优势样本的概率上升，且 r 越大越有利。PPO 同时计算落在区间内的裁剪比，再取两个奖励项中较小的一个。A 为正时乘法保持顺序。r 大于上端就取裁剪项，r 在下端以下仍取原来的较小值；这样把好动作的概率降得过低时，目标仍提供纠正信号。\n\n设 ε=0.2、A=+0.6。r=1.30 时两项为 0.78 与 0.72，选 0.72。增到 1.45 仍是 0.72，对该行的 log-prob 的直接导数为零。若 r=0.75，两项为 0.45 与 0.48，取 0.45，此时增加概率仍能提高目标。计算器测试还会给出此时对 log 比的导数 0.45，因为对指数求导再乘固定优势。',
          formulas: [{ latex: String.raw`L_t=\min\!\left(r_t\hat A_t,\operatorname{clip}(r_t,1-\epsilon,1+\epsilon)\hat A_t\right)=\hat A_t\min(r_t,1+\epsilon)\quad(\hat A_t>0)`, explanation: '这里写的是最大化的一条代理项。下端以下的正优势样本仍处在线性支；代码做最小化时整体加负号。' }],
          sourceIds: ['paper', 'course'],
        },
        {
          heading: '优势为负时的左侧平台',
          body: 'A 为负时乘法反转顺序，取较小的乘积等于先取较大的比值再乘 A。负优势样本的概率下降原本会让目标变大，从 r=1 降到下端仍有这个方向，一旦继续降就不再得到奖励。另一侧若把差动作的概率拉得太高，原来的负项更小，保留完整的惩罚。A 为零则此行 actor 代理项恒为零。\n\n仍取 ε=0.2，改 A=−0.6。r=0.75 时原项 −0.45、高于裁剪项 −0.48，所以选 −0.48。r=1.30 时原项 −0.78、低于裁剪项 −0.72，所以选 −0.78，降低该比值有利。常见错法是直接用裁剪后的比替换原比，后者会同时抹掉这类纠正信号。边界只有分段导数，手算和夹具选离边界有间隔的点。',
          formulas: [{ latex: String.raw`L_t=\hat A_t\max(r_t,1-\epsilon)\quad(\hat A_t<0),\qquad \frac{\partial L_t}{\partial\log r_t}=r_t\hat A_t\ \text{on the active branch}`, explanation: 'active branch 指 min 选中未裁剪项且局部可导的区间。A 与目标为奖励量级，梯度相对于无量纲 log 比。' }],
          sourceIds: ['paper', 'course'],
        },
        {
          heading: '代理项能停，整张策略仍会动',
          body: 'r=1 时，除零优势行外训练起点都处于有梯度的中段。一批样本策略项的梯度来自这些未饱和行以及后续仍有效的行。同一网络可能共享图像编码器、动作方差参数和 critic 特征，当其他状态产生梯度时，即使当前样本处于平台区，其比值也可能继续远离 1。概率归一化还会改变没有在这批采中过的替代动作。\n\n因此 ε 控制的是单样本激励的折点。整体更新还受学习率、epoch、优势归一化、熵系数、批量构成和可选 KL 提前停止影响。PPO 原文的 MuJoCo 和 Atari 结果来自指定实验条件。11 月 23 日读曲线时，要把代理损失、策略距离、当批回报与保留初态的任务指标分开记录；这一做法也给后续连续控制提供对照。',
          sourceIds: ['paper', 'course', 'engstrom'],
        },
      ],
      points: ['比值由同一状态与同一采样动作的新旧分布定义。', '正优势的右侧、负优势的左侧才有直接平台。', '有限动作样本上的目标裁剪无法约束未见状态。'],
      codeTitle: 'ppo_piecewise.py · 核对四种符号和区间组合',
      code: `from math import isclose

def local_objective(ratio, advantage, epsilon):
    if ratio <= 0 or not 0 < epsilon < 1:
        raise ValueError('invalid probability ratio or width')
    clipped = max(1 - epsilon, min(1 + epsilon, ratio))
    return min(ratio * advantage, clipped * advantage)

for ratio, advantage, expected in [
    (1.30, .6, .72), (.75, .6, .45),
    (.75, -.6, -.48), (1.30, -.6, -.78),
]:
    assert isclose(local_objective(ratio, advantage, .2), expected)
assert isclose(local_objective(1.45, .6, .2), local_objective(1.30, .6, .2))
try:
    local_objective(0., 1., .2)
except ValueError:
    pass
else:
    raise AssertionError('nonpositive ratio accepted in finite-log example')
print('four signed PPO terms and the positive plateau verified')`,
      codeNotes: ['标量夹具假设有限 log 比，所以只接受正比值。这里直接给定比值，不做采样也不更新参数。', '四个断言特意跨过两个边界。若误把 min 去掉，低比值的正优势例和高比值的负优势例都会失败。'],
      exercise: { prompt: '把裁剪宽度从 0.2 减为 0.1', steps: ['令 A=−0.5，分别代入 r=0.85 与 r=1.14。', '写出每个比值处对 log 比的直接导数。'], solution: '下端为 0.9。r=0.85 时取 −0.45，处在左侧平台，导数为零。r=1.14 时取 −0.57，仍在未裁剪支，导数为 −0.57。缩小宽度使前一行更早饱和，后一行仍可纠错。' },
      quiz: { question: '某负优势样本 r=1.5。为什么直接 clamp 比值会抹掉一个需要的信号？', hint: '对 A 为负的乘法比较原项和裁剪项的大小。', keywords: ['负优势', '未裁剪项', '减小概率', '梯度'], reference: '比值过高意味着差动作变得更可能。min 选 rA，大小继续随 r 降低而提高。若直接使用上端裁剪，目标在该区间恒定，就无法给这个样本继续减小概率的直接梯度。' },
      sources: [
        { id: 'paper', label: 'Schulman 等 · PPO 原论文 v2', url: 'https://arxiv.org/abs/1707.06347v2', reading: '读 PDF 第 3 节式 (6)–(7)、图 1 和第 5 节多 epoch 算法。' },
        { id: 'course', label: 'OpenAI Spinning Up · PPO', url: 'https://spinningup.openai.com/en/latest/algorithms/ppo.html', reading: '读 Key Equations 的两种优势符号以及按 KL 提前停止的做法。' },
        { id: 'engstrom', label: 'Engstrom 等 · Implementation Matters', url: 'https://arxiv.org/html/2005.12729', reading: '读第 3–4 节，比较实现选项对回报与策略距离的消融。' },
      ],
    },
    code: {
      title: '追踪 ratio、clip 和 entropy',
      minutes: 40,
      prerequisites: '掌握昨天的 Categorical.log_prob 与张量配对，能读 11 月 19 日的 rollout buffer 估值和优势返回。',
      connection: '今天保持同批动作的旧 log-prob 冻结。明天的 SAC 则会从 replay 抽历史状态动作，再为 actor 目标重新采样。两种训练的熵项也有不同用途。',
      intro: '沿 Stable-Baselines3 v2.7.1 的实际收集、重算、损失和提前停止路径走一遍，用梯度夹具定位统计量的误读。',
      outcomes: ['定位 PPO.train 的旧批来源、loss 组合和 optimizer 门', '复现四类样本的梯度，并区分 clip_fraction 与 actor 平台比例'],
      sections: [
        {
          heading: '采样缓存和网络重算各负责一半',
          body: '从 OnPolicyAlgorithm.collect_rollouts 进入。无梯度调用策略后，写入前置观测、抽到的动作、值估计及 log-prob，再用环境回传的奖励与 episode 开始标记构造优势。读 RolloutBuffer.get，沿 samples 的取样实际看 old_log_prob 和 advantages 如何展平到每行一项。同一轮的 epoch 可以重新排列小批，同一行的动作与旧概率必须一起移动。PPO.train 把离散动作转成长整型送给 evaluate_actions，由当前策略重算动作 log 概率、熵和 value。\n\n课堂用四条标量组成 B 维比值。真实对角高斯的 log-prob 要先沿动作维求和，得到同一联合动作的每行量。若观测形状 B×C×H×W，批维和图像各轴由网络处理，概率比出来仍是 B；把旧值留为 B×1 会在减法时广播为 B×B。正式开练前可用采样参数、同一 processor 和同一评估分布重算，检查 ratio 在数值容差内接近 1。',
          sourceIds: ['collect', 'buffer', 'train'],
        },
        {
          heading: '按符号算 actor，再叠加 value 和熵',
          body: '在 PPO.train，advantages 可以按小批分布标准化，单样本分支跳过。因此今天谈某行是正还是负，以实际进入乘积的优势为准。随后分别算未裁剪乘积与裁剪乘积，取较小项的负均值。value 部分将当前估值与 returns 作 MSE；开启 clip_range_vf 时先限制相对旧估值的变化，尺度是奖励单位。最后按系数加负熵，如果分布没有解析熵，源码退而使用当前 log_prob 的批均值项。它依赖缓存动作，策略更新后与按新分布采样计算的解析熵可能有差异。\n\n两类动作概率 [0.5,0.5] 的熵为约 0.693 nat，[0.9,0.1] 为约 0.325 nat。若熵系数取 0.01，前者给最小化损失贡献 −0.00693，后者贡献 −0.00325。例子把 actor 和 critic 其余项固定，实际梯度会叠加。共享特征时，即使一行的 actor 直接梯度为零，value 或 entropy 也能改变该行下次重算的 log-prob。',
          formulas: [{ latex: String.raw`\mathcal L=-\overline{L_t}+c_v\mathcal L_V-c_e\overline{H(\pi_\theta)},\qquad H(p)=-\sum_j p_j\log p_j`, explanation: '上划线为当前有效小批均值，c_v、c_e 是各项权重。H 是自然对数定义的离散熵，单位 nat，第二式用于本课双类别例子。' }],
          sourceIds: ['train', 'paper'],
        },
        {
          heading: '看清哪一个统计量触发停止',
          body: '源码的 clip_fraction 按绝对距离数有多少比值跑出区间，完全不看优势符号。四行取 r=[1.30,0.75,0.75,1.30]、A=[+0.6,+0.6,−0.6,−0.6]，ε=0.2，四行都超区间，clip_fraction=1。第一与第三行进入平台，另两行仍有纠正梯度。平均最小化 actor 损失的 log-prob 梯度是 [0,−0.1125,0,+0.195]。这与参数梯度还有一层链式法则。\n\nPPO.train 在 optimizer.step 前用当前小批 log 比 d 计算 exp(d)−1−d 的均值。固定状态下按旧策略采样，若比满足完整的重加权支持条件，则 E[exp(d)]=1，期望等于旧到新 KL。样本项非负，这个批统计会受稀有动作和状态占比影响。若设置了 target_kl，当前小批超过其 1.5 倍就中止这轮余下优化；已走过的步照常保留。随后源码中的 clip_grad_norm_ 若运行，裁的是合并参数梯度的范数，数学对象和触发位置都与概率比裁剪不同。',
          formulas: [{ latex: String.raw`\widehat D=\frac{1}{B}\sum_i(e^{d_i}-1-d_i),\qquad d_i=\log\pi_\theta(a_i\mid s_i)-\log\pi_{\rm old}(a_i\mid s_i)`, explanation: '旧策略行上的 Monte Carlo 估计，单位 nat。诊断值不沿损失反传，SB3 的停止比较在当前优化步之前。' }],
          sourceIds: ['train', 'course'],
        },
        {
          heading: '沿 log-prob 输入捕捉符号、广播与脱图错误',
          body: '教学函数接收可微的新 log-prob、旧 log-prob 和优势，先卡住轴，再把后两者脱图。把手算比值的对数加到固定旧输入上得到新输入，只为检查公式的局部梯度；这些独立标量并非一个归一化策略的完整输出。固定优势、不做价值拟合或熵反传，便于逐行判断错误来自 ratio、min 还是负号。还给一个离散分布算解析熵，训练系统本身不在夹具内运行。\n\n负测试故意传 B×1 的旧值，要求拒绝广播；已跑过的梯度检查还要求缓存和优势没有梯度。复查时把 new 与 old 全部设成相等，查看比值和近似 KL 是否分别为 1 和 0，再恢复超区间案例。若第一步已经显示漂移，先核采样策略版本、观测处理和动作事件身份，再讨论超参数。',
          sourceIds: ['train', 'buffer'],
        },
      ],
      points: ['在批内保持 action、advantage 和 old_log_prob 一行一配。', 'clip_fraction 统计越界，平坦区还取决于优势符号。', 'KL 提前停止发生在当前小批的参数更新前。'],
      codeTitle: 'ppo_log_ratio_fixture.py · 复查各行的局部梯度',
      code: `import math
import torch
from torch.distributions import Categorical

def clipped_batch(new_log, old_log, advantage, width):
    if new_log.ndim != 1 or new_log.shape != old_log.shape or new_log.shape != advantage.shape:
        raise ValueError('log probabilities and advantages must share a single batch axis')
    delta = new_log - old_log.detach()
    ratio = delta.exp()
    fixed_advantage = advantage.detach()
    terms = torch.minimum(ratio * fixed_advantage, ratio.clamp(1 - width, 1 + width) * fixed_advantage)
    with torch.no_grad():
        fraction = ((ratio - 1).abs() > width).double().mean()
        approximate_kl = (delta.expm1() - delta).mean()
    return -terms.mean(), fraction, approximate_kl

old = torch.full((4,), -1., dtype=torch.float64, requires_grad=True)
ratios = old.new_tensor([1.30, .75, .75, 1.30])
new = (old.detach() + ratios.log()).requires_grad_()
adv = old.new_tensor([.6, .6, -.6, -.6], requires_grad=True)
loss, fraction, divergence = clipped_batch(new, old, adv, .2)
loss.backward()
torch.testing.assert_close(new.grad, old.new_tensor([0., -.1125, 0., .195]))
assert fraction.item() == 1. and divergence.item() > 0
assert old.grad is None and adv.grad is None
_, start_fraction, start_kl = clipped_batch(old.detach(), old, adv, .2)
assert start_fraction.item() == start_kl.item() == 0.
entropy = Categorical(probs=old.new_tensor([.5, .5])).entropy()
torch.testing.assert_close(entropy, old.new_tensor(math.log(2)))
try:
    clipped_batch(new, old[:, None], adv, .2)
except ValueError:
    pass
else:
    raise AssertionError('broadcasting could silently cross-pair rows')
print('PPO gradients, diagnostics and broadcasting guard verified')`,
      codeNotes: ['用 log 比在 PyTorch 中复现双乘积，使用 float64 便于和手算比较。', '对诊断使用 expm1 计算 exp(d)−1，避免 d 接近零时的不必要消减；SB3 2.7.1 源码写成 exp(d)−1。', '无网络参数更新、GAE、epoch 循环或设备接口。熵只验证解析例子的数值。'],
      exercise: { prompt: '把实际进入目标的优势符号反过来', steps: ['保留比值顺序，把四个优势同时取反。', '预测 clip_fraction 与各样本梯度，再改夹具验证。'], solution: '越界比例仍是 1，KL 也一样。平坦行换成第 2、4 行，最小化损失对 log-prob 的梯度依次为 [+0.195,0,−0.1125,0]。可证两类诊断都不包含优势符号。' },
      quiz: { question: '第一轮优化之前就看到 ratio 大幅偏离 1。为什么不宜立即缩窄 clip_range 来修复？', hint: '沿 collect_rollouts、缓存字段和 evaluate_actions 排查分子分母。', keywords: ['同一动作', '归一化', '采样版本', '重算', '缓存'], reference: '在初始参数和同一分布输入下比值本应接近 1。先校验策略/processor/归一化快照、离散动作索引或联合连续动作维、旧 log-prob 与行的配对。缩窄区间无法补回错配的数据。' },
      sources: [
        { id: 'collect', label: 'SB3 v2.7.1 · collect_rollouts', url: 'https://stable-baselines3.readthedocs.io/en/v2.7.1/_modules/stable_baselines3/common/on_policy_algorithm.html#OnPolicyAlgorithm.collect_rollouts', reading: '跟踪 no_grad、动作到环境的映射及 rollout_buffer.add 的字段。' },
        { id: 'buffer', label: 'SB3 v2.7.1 · RolloutBuffer', url: 'https://raw.githubusercontent.com/DLR-RM/stable-baselines3/v2.7.1/stable_baselines3/common/buffers.py', reading: '读 add、get 与 _get_samples 的时间、环境和小批轴。' },
        { id: 'train', label: 'SB3 v2.7.1 · PPO.train', url: 'https://stable-baselines3.readthedocs.io/en/v2.7.1/_modules/stable_baselines3/ppo/ppo.html#PPO.train', reading: '从 evaluate_actions 到 policy_loss、entropy_loss、approx_kl_div 和 optimizer.step。' },
        { id: 'paper', label: 'Schulman 等 · PPO v2', url: 'https://arxiv.org/abs/1707.06347v2', reading: '对照第 5 节式 (9) 的损失组成和第 3 节的独立代理项。' },
        { id: 'course', label: 'OpenAI Spinning Up · PPO', url: 'https://spinningup.openai.com/en/latest/algorithms/ppo.html', reading: '读 Pseudocode 与 KL 停止，比较不同实现的统计粒度。' },
      ],
    },
    insight: {
      title: '为什么 PPO 常用于后训练',
      minutes: 25,
      prerequisites: '能读比例与优势的分段图，了解 11 月 6 日的仿真随机化和 11 月 9 日的固定实例评测。',
      connection: '这里衡量在同一初始化上继续交互的成本。次日改用 SAC 看经验复用，12 月的 RECAP 再把示范、自主回合和纠正组合起来。',
      intro: '分别计算每批交互能买到几次更新、这些更新在哪类场景可信，以及什么时候数据来源已要求换训练方案。',
      outcomes: ['理解并行仿真与多轮小批训练如何分摊采样开销', '设计能揭示少数视角退化的验证方案，区分模拟、预测和执行'],
      sections: [
        {
          heading: '同一批仿真交互可以用于若干次参数更新',
          body: '在已学会粗略对准的策略上继续优化放置，前提是仿真可稳定复位、奖励能区分夹取到位和滑落、并能从当前策略补采。PPO 每次收一批旧策略轨迹，用一阶优化进行若干个小批 epoch，再刷新数据。若教学实验 16 个环境各走 128 步，共 2048 次决策，batch=256、走满 4 epoch 时最多 32 次更新，每条样本平均参与四次。增加 epoch 不会增加新的接触事件，旧批一旦和当前策略偏离，继续优化的价值下降。\n\nNVIDIA 的 Isaac Lab SO-101 放试管教程展示了具体可读的例子。它用数据集恢复阶段状态，用关节动作和仿真物理执行，teacher 训练可使用仿真观测，回放还有从规范初态开始的检查。读 PPO 配置时将每环境步数和重置分布一起记录，不能只复制学习率。11 月 16 日 Isaac Lab 的 GR00T N1.5 插入任务还修复了动作投影 ID 和 rollout 权重同步。作者在 16 GPU 上以 SFT checkpoint 开始 PPO，最后的约 67% 是训练曲线的五步移动平均。将运行时配置误差与算法差异分开，先复核环境和 checkpoint 后再对照保留实例。本文的 16×128 是教学预算，未在 Mac 或租用 GPU 上跑仿真。个人作品可先在本机做张量回归，再在已有仿真环境测每千步耗时、最高显存和每轮新接触案例数。',
          formulas: [{ latex: String.raw`N_{\rm samples}=n_{\rm env}T,\qquad N_{\rm steps}=E\,\frac{N_{\rm samples}}{B}\quad(B\mid N_{\rm samples})`, explanation: 'T 是每个环境的决策步数，E 是走满的 epoch 数，B 是整除批量。N_steps 指优化步，提前停止会减少它。它与真实执行步数的单位不同。' }],
          sourceIds: ['paper', 'teacher', 'trocar'],
        },
        {
          heading: '按初态分层读变化，留出真正的外推检验',
          body: '选择两个候选，只改变同批 epoch 数，沿用同一初始化、观测处理、奖励、低层动作限制与环境步数。训练记录近接触和自由空间的 KL、clip_fraction、新接触动作次数，验证另用预先分配的初态。教学例把测试分为清晰 90 对、遮挡 10 对。清晰层从 70/90 到 80/90，遮挡层从 8/10 到 5/10，则汇总从 78% 到 85%，遮挡层下降 30 个百分点。若架上遮挡是实际目标，这个退化应单列。还要保留逐对结果，边际成功计数无法告诉你多少场景发生了相反的翻转。\n\nStanfordVL 的 BEHAVIOR 提供目标谓词、模拟任务实例和评测协议，可借用索引初态和统一时限的做法。World Labs 的 R2S2R 从真实场景重建、生成可控的仿真变体，再用模拟执行和实机结果检验差距。课程可在仿真给照度和视角做全因子分层，接触参数另作隐藏扰动。相机输入只在策略允许的观测接口进入，训练的特权信息须单列。比较新旧策略时看接管、越界及从判定失败到恢复的经过时间，分别记录仿真和日后自行采集的实机证据。',
          formulas: [{ latex: String.raw`\Delta_g=\frac{n_{01,g}-n_{10,g}}{N_g},\qquad \Delta_{\rm all}=\frac{\sum_g N_g\Delta_g}{\sum_g N_g}`, explanation: '旧、新方案使用同一预设实例 g。n01 是失败转成功数，n10 是成功转失败数，N_g 为该层全部尝试；超时按预注册口径计入。百分比差可报告为百分点。' }],
          sourceIds: ['behavior', 'world', 'teacher'],
        },
        {
          heading: '把候选规划与有限交互预算拆开',
          body: 'Meta/FAIR 的 V-JEPA 2-AC 用视觉表征和候选动作预测未来 latent，拿目标图像的编码评估候选，再由机器人的执行链推进并读回新观测。可把“只用 actor”与“在决策事件上比较少数候选再执行”放在相同仿真上运行。记录从同一采样时刻到执行的 p95 毫秒、接触阶段重规划次数与超时率。若规划器选的是一个动作段而下游控制器每拍都闭环，必须分别记录计划的生成时钟和真正发送的指令身份。预测偏差会在相似外观的滑移或遮挡下影响排序，所以应以实际 rollout 的谓词和接管计数检验。\n\nAMI Labs 当前的公开方向是表征空间预测与动作条件规划。课堂用它提出可测的候选过滤假设，机器人规划实例仍引自 Meta/FAIR 的公开 V-JEPA 2 工作。若使用更上层的通用 Agent 选择补拍或重新规划，Agent 只提交允许的技能调用，执行由技能策略和控制器完成，接触和超时事件回流给 Agent。另一条可核对的历史路线是 MIT 等机构的 PEAR。Qwen3.8-27B-PEAR 每轮输入相机帧、机器人状态和过去回合历史，直接给下一个末端位姿；IK 转成关节目标，低层控制器执行。求解失败时重试仍消耗一轮。作者在 YAM 双臂的两类任务共测 30 次，仿真训练版成功 18 次，基座 0 次，以 25 轮为限。这些数据可用于对照任务成功与重试成本。',
          sourceIds: ['vjepa', 'ami', 'world', 'pear'],
        },
        {
          heading: '交互来源决定后训练方案的账本',
          body: '有可靠的仿真重置和明确回报时，PPO 方便在固定策略架构下持续刷新样本。若目前只有少量真机人控示范、失败代价高、每次复位又慢，使用早先数据的方式直接决定成本。HIL-SERL 的作者项目展示了演示缓冲、奖励分类器和人类纠正，后面的课会看它如何让旧经验继续参与连续控制训练。Physical Intelligence 的 RECAP 将示范、自主经验和纠正通过优势条件化连接到 VLA；要复现这条路线，需要先有轨迹来源与介入动作身份记录。任意混合历史动作若直接灌进当天的 PPO 更新，会丢失标准流程要求的本轮采样分布与对应优势。\n\n在个人 4090/5090 资源未知的情况下，实验表优先固定交互预算而非承诺吞吐。对同一奖励配方跑不同 epoch，另一条独立实验再改采样分布。保留权重、相机分层 ID、初态种子、回报定义、候选筛选耗时及任务结局。若成功提升只发生在训练时常见的阶段恢复起点，先补完整流程评测。代码里的计数是离线夹具，帮助把这些结论与可审计的分母对应起来。',
          sourceIds: ['teacher', 'hil', 'recap', 'engstrom'],
        },
      ],
      points: ['比较额外优化步与新交互步，记录两者的成本。', '按预先定义的起点配对，并保存失败转成功与成功转失败计数。', '仿真、表征预测和实际控制有各自的数据与测量边界。'],
      codeTitle: 'ppo_stratified_replay_report.py · 分层计算配对成功变化',
      code: `from math import isclose

def paired_report(rows):
    groups = {}
    used_ids = set()
    for instance, group, old_success, new_success in rows:
        if instance in used_ids:
            raise ValueError('each paired initial instance must appear only once')
        used_ids.add(instance)
        counts = groups.setdefault(group, [0, 0, 0])
        counts[0] += 1
        counts[1] += not old_success and new_success
        counts[2] += old_success and not new_success
    if not used_ids:
        raise ValueError('cannot estimate a rate without trials')
    deltas = {group: (gains - losses) / total for group, (total, gains, losses) in groups.items()}
    pooled = sum(gains - losses for _, gains, losses in groups.values()) / len(used_ids)
    return deltas, pooled

rows = [(n, 'clear', n < 70, n < 80) for n in range(90)]
rows += [(90 + n, 'occluded', n < 8, n < 5) for n in range(10)]
deltas, pooled = paired_report(rows)
assert isclose(deltas['clear'], 10 / 90) and isclose(deltas['occluded'], -.3)
assert isclose(pooled, .07)
try:
    paired_report(rows + [rows[0]])
except ValueError:
    pass
else:
    raise AssertionError('a duplicated pair incorrectly changed the denominator')
print('pooled gain +7 pp, occluded change -30 pp, unique pairs verified')`,
      codeNotes: ['输入逐对布尔结局来自假想实例。字典每层保存尝试数、净改善的两种翻转计数。', '汇总用所有有效配对的分母。负例重复一整对，夹具会在统计之前拒绝。', '不估计置信区间。实际多次复位时，把配对单位显式定为实例与预注册重复索引，再按实例聚类给出区间。'],
      exercise: { prompt: '部署分布换成一半清晰、一半遮挡', steps: ['假设上述层内变化可迁移，按 50/50 重算整体变化。', '指出为何这个外推还需新的测量。'], solution: '变化是 0.5×(10/90)+0.5×(−3/10)=−0.09444，约 −9.4 个百分点。遮挡层样本量只有 10，且真实相机的动态范围、接触、延迟和失配可能改变层内变化，需预设更多保留实例复验。' },
      quiz: { question: '一个 PPO 老批上的代理目标更高，同时 R2S2R 变体的遮挡层成功率下降。下一轮如何判断是训练更新过大还是观测条件改变？', hint: '让 epoch 和观测变体在不同实验中变化，并冻结执行链。', keywords: ['交互预算', '配对初态', '遮挡层', '冻结执行链', 'KL'], reference: '先固定场景与动作执行，比较不同 epoch 在同一采样预算下的 KL、比值分层和保留实例结局。再冻结候选权重，在同一初态做受控照度、相机或遮挡变体对照。分别记录接触、超时、恢复和接管，便于区分更新与观测条件的作用。' },
      sources: [
        { id: 'paper', label: 'Schulman 等 · PPO v2', url: 'https://arxiv.org/abs/1707.06347v2', reading: '读第 5 节采样和多 epoch 交替，并核对第 6 节评测环境。' },
        { id: 'teacher', label: 'NVIDIA · Isaac Lab SO-101 训练 teacher', url: 'https://docs.nvidia.com/learning/physical-ai/getting-started-with-isaac-lab/latest/train-a-robot-arm/05-teacher-policy.html', reading: '可选读 ResetFromDataset、rsl_rl_ppo_cfg.py、CANONICAL_START；官方在线文档复核于 2026-11-16。' },
        { id: 'behavior', label: 'StanfordVL · BEHAVIOR Evaluation and Rules', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '可选读 Evaluation Protocol and Logistics、Metrics and Results。' },
        { id: 'world', label: 'World Labs · Building Worlds That Train Robots', url: 'https://worldlabs.ai/blog/real-to-sim-to-real', reading: '可选读构造仿真变体、策略训练与真实 ALOHA 验证的证据边界。' },
        { id: 'vjepa', label: 'Meta/FAIR · V-JEPA 2 项目', url: 'https://ai.meta.com/research/vjepa/', reading: '可选读 Action-conditioned world model、Robot Planning 实验及其执行流程。' },
        { id: 'ami', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '可选读 How we approach world models，与 Meta/FAIR 已有实验分别记录。' },
        { id: 'pear', label: 'MIT 等 · PEAR 原论文 v1', url: 'https://arxiv.org/html/2611.18562v1', reading: '选读第 3.1、4.4 节和附录 G，核对动作接口、失败重试、试验预算与逐回合结局。' },
        { id: 'trocar', label: 'Isaac Lab · GR00T N1.5 后训练修复', url: 'https://github.com/isaac-sim/IsaacLab/commit/d44733f0485db619fa142fce7705cb0972402900', reading: '选读 11 月 16 日固定提交，核对 embodiment_tag_id、同步器、腰部限制与物理后端。' },
        { id: 'hil', label: 'UC Berkeley · HIL-SERL', url: 'https://hil-serl.github.io/', reading: '可选读 Method Overview 与 Evaluation，区分演示、奖励分类器与介入。' },
        { id: 'recap', label: 'Physical Intelligence · π*0.6 与 RECAP', url: 'https://www.pi.website/blog/pistar06', reading: '可选读经验采样、纠正与优势条件化，用作 12 月专题的前置对照。' },
        { id: 'engstrom', label: 'Engstrom 等 · Implementation Matters', url: 'https://arxiv.org/html/2005.12729', reading: '可选读第 3 节，理解为何应独立控制算法与实现细节。' },
      ],
    },
  },
};
