import type { AuthoredDay } from './types';

export const day80: AuthoredDay = {
  reviewedAt: '2026-11-14',
  revision: '逐课编写 1.0',
  deliverable: '一张价值、优势与规划代价的对照表，一份双掩码 GAE 参考实现，以及一个配对仿真评测方案。共 100 分钟。',
  question: {
    title: '遮挡后补拍一步，奖励为 0，当前价值为 0.40，采集截断时真后继价值为 0.65，重置图像价值为 0.95。取 γ=0.9，怎样计算末步优势，并验证规划器偏好的动作是否值得执行？',
    summary: '分辨价值尾项、回合边界、预测代价和独立闭环证据。',
    keywords: ['优势', '截断', '真后继', '价值', '表征距离', '闭环'],
    reference: '末步用真后继补价值，优势为 0.9×0.65−0.40=0.185，截断处停止向下一回合传播优势。0.95 是重置后的状态。规划器按动作条件预测的目标表征距离排序，不能用该距离代替奖励量纲的优势。固定任务、动作接口和截止时间，配对统计实际完成、错误提交、恢复和规划延迟，再决定可用范围。',
  },
  lessons: {
    foundation: {
      title: 'Value、Q 与 advantage',
      minutes: 35,
      prerequisites: '理解 11 月 17 日的观测历史与结束标志，以及 11 月 18 日按决策步计算的折扣回报。',
      connection: '今天从回报估计动作相对同状态基线的优劣；11 月 20 日把优势乘到策略的 log-prob 梯度上。',
      intro: '用遮挡下的补拍与直接放置区分状态价值、动作价值和优势，推导从 n-step 残差到 GAE 的关系。',
      outcomes: ['手算同状态下多个动作的价值与优势', '从多步残差推导 GAE 以及两个端点'],
      sections: [
        {
          heading: '固定后续策略再问当前动作的价值',
          body: '用昨天的折扣回报作为随机变量，先固定任务奖励和后续策略 π。Q 对当前状态与首个动作都取条件，问先做这个动作、随后继续照 π 行动时的平均回报。V 只对当前状态取条件，首个动作也由 π 在这里抽取。因此离散动作下的 V 是同一个状态各项 Q 按动作概率加权的均值。相机遭遮挡时，可用对接触状态的信念或观测历史作为条件，单张图像如果无法区分夹稳和夹空，估值会混合两类样本。\n\n设想夹持后可以“补拍”或“直接放置”，两个 Q 分别为 0.7 和 0.3 个奖励单位，π 以四分之一概率补拍。V 为 0.4，两个优势分别为 0.3 和 −0.1。直接放置的回报期望仍为正，但在当前策略基准下把它选为首个动作会拉低期望。把两个优势用同样的 1:3 权重平均，得到 0；更换后续策略会改变这两个 Q，也会改变基准。',
          formulas: [{ latex: String.raw`V^\pi(s)=\sum_a\pi(a\mid s)Q^\pi(s,a),\qquad A^\pi(s,a)=Q^\pi(s,a)-V^\pi(s)`, explanation: 's 为状态或足够的历史信息，a 为首个动作。概率无量纲，V、Q、A 与折扣回报使用同一奖励量纲。连续动作把加权求和换成对策略分布取期望。' }],
          sourceIds: ['spinning'],
        },
        {
          heading: '相邻估值作差，留下 n 步目标的尾项',
          body: '对一个没有跨回合的窗口，每步残差是实收奖励加折扣后的后继价值，再减当前估值。如果估值恰好等于 Vπ，从给定状态与首动作出发，残差的条件均值就是该动作优势。有近似误差时，这一拍的误差会直接进入训练信号。把相邻残差以 γ 的幂次相加，中间状态的估值一正一负抵消，剩下昨天算过的多步目标减窗口首状态估值。\n\n令 γ=0.9，第一拍奖励 0、V 为 0.40，第二拍 V 为 0.50；第二拍后任务以奖励 1 终止。两拍残差为 0.05 和 0.50，首步两步优势为 0.05+0.9×0.50=0.50，也等于 0.9×1−0.40。把第二拍标为任务终止时，环境 reset 后的新画面属于另一条轨迹，不能放进第二拍的价值尾项。',
          formulas: [{ latex: String.raw`\sum_{l=0}^{k-1}\gamma^l\delta_{t+l}=\sum_{l=0}^{k-1}\gamma^l r_{t+l}+\gamma^k\hat V(s_{t+k})-\hat V(s_t)`, explanation: 'δ 是一步 TD 残差。k 是窗口内决策数，γ 是折扣。式子在连续窗口内成立；真终止以零作尾值，外部截断使用重置前的后继。' }],
          sourceIds: ['gae'],
        },
        {
          heading: '从几何权重得到反向递推',
          body: '对每个 k 步残差和给几何权重，某一拍残差只出现在长度足够的项里。把这些权重相加，第 l 拍得到 λ 的 l 次幂，再乘该拍的折扣 γ 的 l 次幂，就成了 GAE。有限窗口可直接用加权残差和，也等价于让最后一个可用的 k 步估计吸收剩下的几何权重。反向扫描时，已经算好的后续和乘一个 γλ 后加入当前残差即可。\n\n沿用两拍例子，λ=0 时首步只留 0.05；λ=0.8 时加 0.72×0.50，得 0.41；λ=1 得 0.50。有限采集窗口的 λ=1 仍需处理尾值，只有遇真终止时尾值为零。小 λ 更信任短程价值估计，大 λ 暴露更多后续随机奖励；偏差和方差不能仅由 λ 决定，估值质量与采样轨迹也影响结果。',
          formulas: [{ latex: String.raw`\hat A_t^{\mathrm{GAE}}=\sum_{l=0}^{k-1}(\gamma\lambda)^l\delta_{t+l}`, explanation: 'l 从当前位置向后计数，k 限于同回合且可用的 rollout。λ∈[0,1] 控制残差的传播长度，为无量纲参数。' }],
          sourceIds: ['gae'],
        },
        {
          heading: '训练前查清每个估值来自哪个策略',
          body: '对同策略采样，状态基线只依赖动作执行前的信息，不能偷看实际动作之后的接触反馈。一个实用反例是把夹爪最终闭合读数拼进首个动作的 V 输入，离线估值会显得更准，部署时却没有这个字段。用 11 月 15 日的日志身份检查估值帧和动作 tick，估值网络和采样策略也分别记录版本。\n\n把介入交还和同策略片段分开。若操作员接管后补救成功，未带修正的 GAE 会把那段成功归到前面的自动动作；它回答的是混合执行过程的回报。今天在合成的固定策略两步窗口手算，下一课再推导用哪些样本估计策略梯度。独立实验可以将补拍前后的接触阶段、观测年龄和真后继身份列在同一张表中。',
          sourceIds: ['spinning', 'gae'],
        },
      ],
      points: ['优势的参照是同状态的策略平均价值。', '多步 TD 残差内的中间估值相消。', '估值输入只使用当时可取得的信息。'],
      codeTitle: 'two_action_value.py · 手算策略基线',
      code: `from math import isclose

def compare(q_values, probabilities):
    if not q_values or len(q_values) != len(probabilities):
        raise ValueError('actions must align')
    if any(p < 0 for p in probabilities) or not isclose(sum(probabilities), 1):
        raise ValueError('invalid action probabilities')
    baseline = sum(p * q for p, q in zip(probabilities, q_values))
    return baseline, [q - baseline for q in q_values]

weights = [.25, .75]
value, advantages = compare([.7, .3], weights)
assert isclose(value, .4)
assert all(isclose(got, expected) for got, expected in zip(advantages, [.3, -.1]))
assert isclose(sum(p * a for p, a in zip(weights, advantages)), 0, abs_tol=1e-12)
try:
    compare([.7, .3], [.25, .5])
except ValueError:
    pass
else:
    raise AssertionError('unnormalized policy was accepted')
print('state value and action advantages verified')`,
      codeNotes: ['两列索引必须指同一个动作，输入为已经给定的 Q，示例不拟合 critic。', '正例核对基线、两个优势及加权均值，负例检查缺失概率质量。'],
      exercise: { prompt: '在相同 Q 下重算动作基线', steps: ['令两个动作概率都为 0.5，其 Q 保持 0.7 和 0.3。', '计算 V 和两个优势，说明现实中改变策略为何还可能影响 Q。'], solution: '冻结 Q 的思想实验中 V=0.5，优势为 0.2 和 −0.2。若策略在后继状态也改变，继续执行的动作分布变了，两个 Q 都要重新估计。' },
      quiz: { question: '某观察动作的 Q 为正，而它在本轮记录的优势为负。怎样解释并核对这个样本？', hint: '看看同状态基线与数据使用的策略版本。', keywords: ['同状态基线', '策略', '回报', '估计'], reference: 'Q 为正只表示该动作之后的预期回报大于零；负优势表示它低于同状态的 V 或估计误差改变了符号。核对同一策略版本、奖励和观测字段，再比较误差与差值大小。' },
      sources: [
        { id: 'spinning', label: 'OpenAI Spinning Up · Key Concepts', url: 'https://spinningup.openai.com/en/latest/spinningup/rl_intro.html', reading: '读 Value Functions、Bellman Equations、Advantage Functions 的定义和条件分布。' },
        { id: 'gae', label: 'Schulman 等 · GAE 论文 v6', url: 'https://arxiv.org/pdf/1506.02438v6', reading: '读 §2 与 §3 的一步残差、k 步相消及式 (16)，核对论文对 γ 的算法解释和本课折扣任务设定。' },
      ],
    },
    code: {
      title: '实现 GAE 并与 action-conditioned world model cost 对照',
      minutes: 40,
      prerequisites: '会检查 Tensor 的 shape 并使用布尔 mask 与 masked_fill，并能复算两拍残差。',
      connection: '昨天的 n-step 从经验缓冲中找连续窗口。今天在同策略 rollout 反扫整条时间轴，明天用输出训练策略。',
      intro: '沿 SB3 v2.7.1 的 rollout 采集、超时补值和回填顺序阅读实码，再用 PyTorch 分别表示两个掩码。',
      outcomes: ['追踪 rollout 末值和自动 reset 前的观测', '分开价值尾项与残差传播，验证向量环境不串列'],
      sections: [
        {
          heading: '从采集函数读到旧策略的值与概率',
          body: '阅读 Stable-Baselines3 v2.7.1 的 OnPolicyAlgorithm.collect_rollouts。环境交互前用当前策略从旧观测生成动作、状态估值和 log_prob；环境步进后拿到新观测、奖励和 done，再把交互前的观测和 episode_start 连同本拍奖励写入 RolloutBuffer。源数组的头两轴为时间步 T 和并行环境 E。训练时缓冲区才交换并展平这两轴，反向计算之前保持它们分离。\n\n遇 VecEnv 自动 reset，new_obs 在结束列可能已指向下一回合。采集函数检测 timeout、done 和 infos 中的 terminal_observation，先计算旧回合最后观测的值并以 γ 倍加进当拍奖励。这个加法为学习准备目标。复现时把它与独立记录的原始环境回报区分开，避免报告把补值算成现场得分。',
          sourceIds: ['collect', 'vec'],
        },
        {
          heading: '反扫时识别相邻记录是否同回合',
          body: 'RolloutBuffer.compute_returns_and_advantage 在普通位置看下一行 episode_starts；最后一行看采集器传入的 dones 和 last_values。每一列递推当前 TD 残差与后续残差和，结束掩码同时挡住普通后继项与跨回合传播。上一步采集代码已经把外部截断的真实后继折扣价值加进奖励，所以这里的单个掩码仍能保住合法尾项。returns 等于旧 values 加 advantages，供 critic 更新。\n\n本课保留原奖励，以两个掩码表达相同边界。真终止时清零后继价值；外部截断使用真后继但不传播下一行优势；窗口正常用完时可以用窗口尾价值，行外没有已知残差。输入 next_values 由调用者用重置前的真后继估计，教学函数验证 shape 和标志类型，假设已通过日志校验，无法仅凭数值判断观测的回合身份。',
          sourceIds: ['buffer', 'collect'],
          formulas: [{ latex: String.raw`\delta_t=r_t+\gamma(1-d_t)\hat V(s_{t+1})-\hat V(s_t),\quad \hat A_t=\delta_t+\gamma\lambda(1-b_t)\hat A_{t+1}`, explanation: 'd_t 是真实任务终止位，b_t 是终止或外部截断。rollout 最后一行之外的残差和初始化为零。r_t 为原始奖励。' }],
        },
        {
          heading: '用两个并行环境锁定边界错误',
          body: '合成 T=3、E=2 的表。第一列在第二拍外部截断，真后继 V=0.6，下一行是奖励很高的新回合；第一列首两拍应给出 0.0972、0.16，不应随新回合的奖励改变。第二列在第一拍真终止，故其首拍优势为 0.3，哪怕我们故意填一个很大的后继估值也不能影响它。分别改这两个被隔开的输入，就能定位哪条边界泄漏。\n\n代码的输入为 CPU double，小表用于逐值比对。实际训练可在设备上保留相同轴约定，值目标由旧策略轨迹产生，通常不跨此次计算反传。负例将结束标志转成 0/1 浮点张量并要求拒绝；否则位运算、广播或隐式乘法都可能让单环境示例恰好通过，却在向量环境训练时出错。延伸复查 Isaac Lab #8639，学习率和 PPO 裁剪范围由配置字符串分别构造调度函数。旧代码闭包会共用最后解析的值。复现实验先打印进度为 1 和 0.5 时的两条调度值，避免把配置偏差误判为 GAE 的 λ 效应。',
          sourceIds: ['buffer', 'gae', 'schedule'],
        },
        {
          heading: '把两类时间轴分开输出',
          body: 'GAE 的第 t 行有已经执行的动作和实收奖励。V-JEPA 2-AC 的候选表也有时间轴，但每一列可以代表尚未执行的动作序列。用观测与关节或末端状态编码，向前滚动候选的表征并计算末端距离。把 B×H 的候选预测接到 GAE 的 T×E 表，会把想象结果混成经验。教学实验只比较两个分数的排序，分别标出数值的量纲及来源。\n\n想检查目标表征是否漏掉夹稳信息，可以固定目标图片与初态，用两个候选动作产生各自的预测距离，再从初态各自重置独立仿真并登记真实成功。执行器只接收被选择的合法动作，回传图像和本体状态供下次规划。用此闭环逐项核对距离排序有无预测价值，GAE 仍以实际执行轨迹及相应的 critic 为输入。',
          sourceIds: ['vjepa'],
        },
      ],
      points: ['采集器先用 terminal_observation 补截断价值。', '反扫只沿时间轴，每列独立。', '记录实际优势与候选预测代价的来源。'],
      codeTitle: 'masked_gae.py · 向量化计算优势与回报目标',
      code: `import torch

def masked_gae(reward, value, next_value, terminated, truncated, gamma, lam):
    if reward.ndim != 2 or reward.numel() == 0:
        raise ValueError('expected nonempty [time, env] tensors')
    columns = (value, next_value, terminated, truncated)
    if any(x.shape != reward.shape for x in columns):
        raise ValueError('history axes must match')
    if terminated.dtype != torch.bool or truncated.dtype != torch.bool:
        raise ValueError('episode flags must be boolean')

    successor = next_value.masked_fill(terminated, 0)
    residual = reward + gamma * successor - value
    boundary = terminated | truncated
    advantage = torch.empty_like(residual)
    carry = torch.zeros_like(residual[0])
    for t in range(reward.shape[0] - 1, -1, -1):
        carry = residual[t] + gamma * lam * carry.masked_fill(boundary[t], 0)
        advantage[t] = carry
    return advantage, advantage + value

reward = torch.tensor([[0, .5], [0, 0], [8, 0]], dtype=torch.float64)
value = torch.tensor([[.36, .2], [.38, .4], [.1, .4]], dtype=torch.float64)
later = torch.tensor([[.38, 99], [.6, .4], [.2, .8]], dtype=torch.float64)
terminal = torch.tensor([[False, True], [False, False], [False, False]])
timeout = torch.tensor([[False, False], [True, False], [False, False]])

expected = torch.tensor([.0972, .16], dtype=reward.dtype)
a, target = masked_gae(reward, value, later, terminal, timeout, .9, .8)
torch.testing.assert_close(a[:2, 0], expected)
torch.testing.assert_close(a[0, 1], reward.new_tensor(.3))
torch.testing.assert_close(a[-1, 1], reward.new_tensor(.32))
torch.testing.assert_close(target, a + value)
reward[2, 0] = 80
changed, _ = masked_gae(reward, value, later, terminal, timeout, .9, .8)
torch.testing.assert_close(a[:2, 0], changed[:2, 0])
for invalid_flag in (terminal.to(reward.dtype), terminal[:, :1]):
    try:
        masked_gae(reward, value, later, invalid_flag, timeout, .9, .8)
    except ValueError:
        continue
    raise AssertionError('invalid episode flag accepted')
print('timeout bootstrap, reset isolation and shape checks verified')`,
      codeNotes: ['masked_fill 分别清除任务终止后的 bootstrap 和任何回合结束后的传播。按 T 逆序、对 E 同时计算。', '示例只接受对齐的学习张量，调用者负责用冻结版 critic 取值。正例检查截断和真终止，负例拒绝错误类型或形状。'],
      exercise: { prompt: '用 SB3 的写法重算代码中的第一列', steps: ['在外部截断拍的奖励加 0.9×0.6。', '在该拍将普通后继值和后续优势同时清零，向前回填首拍。'], solution: '截断拍残差为 0.54−0.38=0.16。首拍残差为 0.9×0.38−0.36=−0.018，向前加 0.72×0.16 得 0.0972，等于显式双掩码结果。' },
      quiz: { question: '为什么在 SB3 反扫时同时关闭截断拍的两个后继项，没有丢失合法的价值补项？', hint: '补项发生在 rollout 写入以前。', keywords: ['terminal_observation', '截断', '补值', '反扫'], reference: 'collect_rollouts 对满足条件的超时先把 γV(terminal_observation) 加到学习奖励。buffer 用结束掩码挡住自动 reset 的观测和后续回合残差，之前加入的真后继估值仍在当拍残差里。' },
      sources: [
        { id: 'collect', label: 'Stable-Baselines3 v2.7.1 · 采集器', url: 'https://github.com/DLR-RM/stable-baselines3/blob/v2.7.1/stable_baselines3/common/on_policy_algorithm.py#L201-L241', reading: '逐行追踪 collect_rollouts 的奖励补值、episode_starts、last_values。' },
        { id: 'buffer', label: 'Stable-Baselines3 v2.7.1 · RolloutBuffer', url: 'https://github.com/DLR-RM/stable-baselines3/blob/v2.7.1/stable_baselines3/common/buffers.py#L366-L397', reading: '读 compute_returns_and_advantage 的最后一行分支、普通分支和 returns。' },
        { id: 'schedule', label: 'Isaac Lab · SB3 线性调度修复', url: 'https://github.com/isaac-sim/IsaacLab/pull/8639', reading: '选读 Description，核对 process_sb3_cfg 的变量捕获与多个 lin_ 配置的回归条件。' },
        { id: 'vec', label: 'Stable-Baselines3 v2.7.1 · VecEnv', url: 'https://stable-baselines3.readthedocs.io/en/v2.7.1/guide/vec_envs.html', reading: '读 VecEnv API vs Gym API 的自动重置和 TimeLimit.truncated。' },
        { id: 'gae', label: 'Schulman 等 · GAE 论文', url: 'https://arxiv.org/pdf/1506.02438v6', reading: '读 §3 式 (16)，逐项对应反扫得到的折扣残差和。' },
        { id: 'vjepa', label: 'Meta/FAIR · V-JEPA 2', url: 'https://arxiv.org/html/2506.09985v1', reading: '读 §3.2 和式 (5)，确定目标表征距离与候选动作的关系。' },
      ],
    },
    insight: {
      title: 'model-free 价值与 LeCun 路线的预测代价有何区别',
      minutes: 25,
      prerequisites: '能解释同策略 Q 的条件和 GAE 的输出，回看 10 月 30 日的表征预测和目标匹配。',
      connection: '今天比较经验价值和动作条件预测。下一课把优势用于更新动作分布，规划效果仍由独立闭环检验。',
      intro: '在遮挡使夹持状态不明的场景里，让经验 critic 与目标表征规划分别给出选择，再用配对闭环裁决。',
      outcomes: ['说明两类分数的输入、量纲与低层执行者', '制定可测视觉近似、成功和恢复的对照'],
      sections: [
        {
          heading: '一次决策，两种评分依据',
          body: '给补拍、微调和直接放置分别记录动作身份。Model-free critic 从真实或仿真执行数据的奖励和转移拟合。Q 按当前首动作和后继策略给出期望回报，actor 可据此调整采样倾向。部署时 actor 输出动作，控制器执行，环境回传状态与奖励。稳定任务可用一次前向减少逐候选推理，遇到训练未覆盖的遮挡或接触时，critic 对稀见动作可能过于自信。\n\nMeta/FAIR 的 V-JEPA 2-AC 使用视觉历史、末端状态和候选动作预测后继表征。论文以候选终点表征到目标图像表征的 L1 距离排序，经 CEM 搜索后送首个动作给低层控制器，等待执行后取得观测与本体状态再规划。更换目标时可以复用预测器，成本是每次重规划要滚动多条候选，接触条件或目标域改变也可能令预测距离失真。',
          sourceIds: ['spinning', 'vjepa'],
        },
        {
          heading: '构造一个可以证伪距离排序的反例',
          body: '把终点表示为两个无量纲教学特征，第一维近似轮廓，第二维近似局部接触，目标取 (0,0)。直接放置的预测偏差为 (0.02,0.03)，补拍再放为 (0.08,0.06)，两者的 L1 距离是 0.05 和 0.14。构造十个配对仿真实例，成功给 1，失败给 0。若不折扣且终点之外没有奖励，直接放置的 4/10 与补拍再放的 7/10 对应经验回报 0.4 和 0.7。这是故意构造的冲突，用于设计诊断。\n\n在仿真观测中留一个轮廓匹配却夹空的样本。将历史中的夹爪状态或短程接触反馈置空，保持同一目标与重置实例离线重评分。查看候选预测误差集中在哪一维，再核对阶段成功标签。可借 RAW 感知经验按饱和与拖影分层，先用独立证据标注夹稳，再看新增输入能否减少假近邻。若表征距离同时充当成功标签，失配会被定义本身掩盖。',
          formulas: [{ latex: String.raw`C(a_{1:H})=\sum_{j=1}^m|\hat z_{H,j}(a_{1:H})-z_{g,j}|`, explanation: 'H 是候选决策步数，m 是表征维度，ẑ 是模型预测的终点表征，z_g 是目标编码。距离尺度由编码及归约方式决定。' }],
          sourceIds: ['vjepa'],
        },
        {
          heading: '在相同实例上验证成功和恢复',
          body: '设计固定 actor、潜在代价规划、规划加确定性可行性检查三组。对齐初态、末端命令规范、控制器和截止时间。若规划超时，按事先固定的策略等待、回退或交还，并记录调用方、执行者、观测年龄和被拒动作。每对实例先做二元成功比较，再单列首次错误后恢复比例、接管次数和规划时延分位。十对中规划独胜四次且 actor 独胜一次，配对差为 (4−1)/10，即 30 个百分点。\n\nMac 可先执行两维评分和回放，在同一批过曝与遮挡样本分别统计。StanfordVL 的 BEHAVIOR 以交互环境中的任务完成状态评估，可借用其独立谓词构造夹稳和放置判据。World Labs 的 R2S2R 用重建和可控场景变体组织仿真到真机验证，可借鉴它的场景变化设计。两个组织的工作分别提供评测合同和测试环境思路。',
          formulas: [{ latex: String.raw`\Delta\hat p=\frac{1}{N}\sum_{i=1}^{N}(y_{i,\mathrm{plan}}-y_{i,\mathrm{actor}})`, explanation: 'N 是复用相同初态的配对数，y 是相应闭环的成功指示。单次演示不能提供配对差的抽样误差估计。' }],
          sourceIds: ['behavior', 'r2s2r'],
        },
        {
          heading: '把模型职责和硬件证据分别记录',
          body: 'V-JEPA 2 论文 §3.1 使用 DROID 视频与末端状态，相邻帧导出动作增量，不需要任务奖励或成功标签来拟合预测器。§4 报告两个实验室的 Franka 闭环，由低层操作空间控制完成动作。SO-101 的接口和相机布置不同，应先在校准仿真或回放确认坐标、观测年龄和控制边界，再讨论迁移，原论文的成功数据不能直接外推。\n\nAMI Labs 将表征空间预测和动作条件建模列为当前研究方向。引用 Meta/FAIR 实验时保留历史归属。若引入通用模型在遮挡时选择是否补拍、调用 VLA 或交还控制，记录它看到的输入、被调用的版本、动作实际执行者和观测如何触发下一次选择。对比相同下游时单独画出超时、误触发和恢复分母。今天的两维脚本仅核对分数排序。',
          sourceIds: ['vjepa', 'ami'],
        },
      ],
      points: ['Q 的单位来自奖励，预测代价由目标与编码确定。', '用独立成功信号评估规划排序。', '记录回流、可行性和规划耗时。'],
      codeTitle: 'ranking_gap.py · 比较低代价候选和经验成功',
      code: `from statistics import mean

def ranking_gap(costs, outcomes):
    if len(costs) != len(outcomes) or len(outcomes) < 2:
        raise ValueError('at least two aligned candidates required')
    rates = [mean(attempts) for attempts in outcomes]
    predicted = min(range(len(costs)), key=costs.__getitem__)
    measured = max(range(len(rates)), key=rates.__getitem__)
    return predicted, measured, rates[measured] - rates[predicted]

paired = ([True] * 4 + [False] * 6, [True] * 7 + [False] * 3)
p, m, gap = ranking_gap([.05, .14], paired)
assert (p, m) == (0, 1) and abs(gap - .3) < 1e-12
assert ranking_gap([.14, .05], paired) == (1, 1, 0)
try:
    ranking_gap([.05], paired)
except ValueError:
    pass
else:
    raise AssertionError('unaligned candidates accepted')
print('constructed ranking gap verified')`,
      codeNotes: ['输入为按候选对齐的合成成功标签，假设每行来自相同初态集。并列时选择首个候选。', '检查两种排序一致与不一致，并故意制造行数错误。脚本不启动仿真或控制器，也不拟合 Q。'],
      exercise: { prompt: '为目标近邻但夹空的例子制定评测', steps: ['列出动作执行接口、观测回流和截止条件。', '给出独立成功谓词、恢复指标和一项仅改变相机条件的对照。'], solution: '固定低层位移接口、控制周期和重置实例，每步回传图像、末端与夹爪状态。以盒内物体稳定且夹爪已释放为成功；在发生空夹或滑落的回合中统计限时恢复率。保持几何和动作不变，修改相机响应重新评分，与独立判据对照。' },
      quiz: { question: '预测目标距离更小的候选更常夹空。如何验证是表征缺信息，还是规划延迟导致执行时状态已变？', hint: '同一次评分记录预测偏差和实际执行时刻。', keywords: ['表征距离', '夹稳谓词', '配对', '观测年龄', '时延'], reference: '固定控制器和配对初态。用独立谓词确认夹稳，保存预测偏差与观测、执行时钟。离线改动接触输入检查排序；在相同观测年龄约束下比较实测失败，区分代价错误和执行过期。' },
      sources: [
        { id: 'spinning', label: 'OpenAI Spinning Up · Key Concepts', url: 'https://spinningup.openai.com/en/latest/spinningup/rl_intro.html', reading: '核对 Value Functions 及 Model-Free vs Model-Based 算法术语；后者在该课程 Part 2 展开。' },
        { id: 'vjepa', label: 'Meta/FAIR · V-JEPA 2', url: 'https://arxiv.org/html/2506.09985v1', reading: '读 §3.1–3.2、式 (5) 及 §4.1，核对 CEM、首步执行及 Franka 条件。' },
        { id: 'behavior', label: 'StanfordVL · Evaluation and Rules', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '读 Metrics and Results 与 Evaluation Protocol，比较任务完成条件和预测评分。' },
        { id: 'r2s2r', label: 'World Labs · R2S2R', url: 'https://worldlabs.ai/blog/real-to-sim-to-real', reading: '读实际任务重建、仿真场景变体和回到物理环境的流程。' },
        { id: 'ami', label: 'AMI Labs · 研究方向', url: 'https://amilabs.xyz/', reading: '读 action-conditioned world models 和可靠性目标。' },
      ],
    },
  },
};
