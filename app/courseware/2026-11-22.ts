import type { AuthoredDay } from './types';

export const day83: AuthoredDay = {
  reviewedAt: '2026-11-17',
  revision: '逐课编写 1.0',
  deliverable: '一页 SAC 软目标推导、一份含梯度断言的 PyTorch 小批，以及按执行动作与接管标记审核的仿真回放对照。核心课 100 分钟。',
  question: {
    title: 'SAC 小批中一行因采集时限截断，r=0.2、折扣 0.9、目标 Q 为 0.6/0.9，下一动作 log π=−1.5、α=0.2。若这一拍由人接管，三路更新各读什么？',
    summary: '计算软目标，区分真终止、截断、实际执行动作和现策略重采样。',
    keywords: ['1.01', '截断', '执行动作', '目标 critic', '重采样', '温度'],
    reference: '截断保留最后观测并继续 bootstrap。软价值为 0.6−0.2×(−1.5)=0.9，目标 0.2+0.9×0.9=1.01；真终止则是 0.2。critic 回归使用接管后实际送入环境的动作，另存原提议用于审计。目标端从当前 actor 在下一状态重采样，用目标 critic；actor 在旧状态重采样，以在线 critic 评估。温度读当前动作的 log π，停止梯度后更新 log α。若接管模式影响后续而观测未记录，要检查状态缺项。',
  },
  lessons: {
    foundation: {
      title: 'SAC 与最大熵控制',
      minutes: 35,
      prerequisites: '回看 11 月 18 日的折扣与真终止，理解 11 月 19 日 V/Q 的区别，并能读懂昨天在固定采样动作上求 log-prob 的过程。',
      connection: '11 月 21 日用短寿命 rollout 反复做 PPO 更新。今天把历史转移送入离策略 Bellman 更新，11 月 23 日再用温度、Q 和实际成功排查训练异常。',
      intro: '从夹爪对位时多条可行微调路径出发，推导软 Bellman 目标与温度的反馈方向。',
      outcomes: ['区分当前动作熵和下一状态续值中的熵项', '给定回放转移与两路目标 Q，手算目标和温度更新方向'],
      sections: [
        {
          heading: '在任务收益中给随机性定价',
          body: '仿真的夹爪来到插槽前，左侧小幅调整和右侧小幅调整都可能绕开遮挡。若策略过早把动作分布压在一条窄路上，之后的探索很难再看到另一路的观测与接触信号。最大熵控制在环境奖励之外给每一步的策略分布加一项熵，调节继续探索的价值。用自然对数时，温度把 nat 换成奖励量级；奖励整体放大后，保持同一温度会改变两部分的相对权重。\n\n以两种教学动作的离散分布作直觉对照，0.5/0.5 的熵是 0.693 nat，0.9/0.1 是 0.325 nat。若两者期望环境收益只差 0.04，且温度是 0.2，前者的单步熵奖励多约 0.0736，足以翻转这一拍的排序。SAC 连续动作使用密度的微分熵，数值可为负，并随坐标量纲改变。因此以固定的归一化动作空间比较运行，记录动作缩放，不能按离散概率给密度做 0 至 1 的校验。',
          formulas: [{ latex: String.raw`J(\pi)=\mathbb E_{\tau\sim\pi}\sum_{t=0}^{\infty}\gamma^t\bigl(r_t+\alpha H(\pi(\cdot\mid s_t))\bigr),\qquad H(\pi(\cdot\mid s))=\mathbb E_{a\sim\pi}[-\log\pi(a\mid s)]`, explanation: '状态 s 来自环境演化，动作 a 来自策略；γ 为折扣，α 是每 nat 的奖励量。连续积分在指定动作坐标下定义。' }],
          sourceIds: ['paper', 'course'],
        },
        {
          heading: '从当前已知动作展开软续值',
          body: '在 Q(s,a) 中，当前拍已经固定执行 a。按 Spinning Up 采用的约定，此处从环境转移取得 r，把熵放进下一状态的价值 V；从 V(s) 出发时，当前动作尚未抽样，所以 V 才把当前 log 密度一起平均。把 V(s′) 代回 Q 的递推，得到用 s′ 抽一个新动作就能估计的目标。这使得回放只需保存旧拍的实际转移，下一拍无须沿旧行为策略走。\n\n数值例子取 r=0.25、折扣 0.9，两个慢更新目标头对同一新动作估值 0.70、0.95，log 密度 −1.2，温度 0.20。先取 0.70，再加 0.24，乘折扣后加奖励得 1.096。真正结束的成功或失败行只有 0.25。若是训练采集时限导致的截断且任务仍应继续，需保留末观测，再按同一式 bootstrap。缺末观测时应修采集契约，用 reset 后的第一帧会把另一个回合接进目标。',
          formulas: [{ latex: String.raw`V^\pi(s)=\mathbb E_{a\sim\pi}[Q^\pi(s,a)-\alpha\log\pi(a\mid s)],\quad y=r+\gamma(1-d)\bigl[\min_{i=1,2}\bar Q_i(s',a')-\alpha\log\pi(a'\mid s')\bigr]`, explanation: 'a′ 是当前策略在下一状态的一次采样；横线表示目标参数，d=1 表示 MDP 真终止。取两头较小值旨在抑制高估，不能保证去除所有偏差。' }],
          sourceIds: ['course', 'paper', 'train'],
        },
        {
          heading: '回放固定了哪一边的分布',
          body: '想象缓冲里既有初始化阶段的随机动作、也有示教员把夹具推回中心的动作。两条记录都可监督同一动作坐标下的 Q，只要状态、执行动作、奖励和下一状态确实来自同一拍，且环境、观测和奖励定义相容。critic 的当前输入使用缓冲动作，actor 则在缓冲提供的状态上重采样，用更新后的 critic 排序。后一过程让缓冲状态分布和策略动作分布分别进入目标。\n\n这比只训练刚采集的 PPO 轨迹多了一条复用路径，代价是估值要支撑策略的新动作。如果缓冲在接触阶段只出现过小幅左移，而某个没见过的大幅右移动作被两个 Q 头同时高估，actor 仍可能走向它。重复读取相同数据只会增加优化步数，并不会扩展数据支持。11 月 24 日以后冻结回放时，尤其需要将这个问题与在线补充新转移的能力区分开。',
          sourceIds: ['paper', 'course', 'hil'],
        },
        {
          heading: '温度是一条带符号的反馈',
          body: '自动温度把目标熵当作参考水平。当当前策略比参考更集中，熵低于目标，升高温度可让下一次 actor 更新增加探索压力。若策略过于分散，就降低温度。论文用约束表述推导，SB3 v2.7.1 实际以 β=log α 优化，指数确保温度始终为正。连续动作常用负目标熵，默认按动作维数取负值；负数源自密度定义，读梯度时仍应从期望的 −log π 解释。\n\n例如目标熵 −1，当前小批平均 log π=1.4，估计熵为 −1.4。β 损失对 β 的斜率 −(1.4−1)=−0.4，梯度下降使 β 升高。若估计熵变成 −0.6，方向反过来。温度训练只推进 β，actor 的采样结果在此留作常量。环境奖励尺度、标准差下限与限幅前后动作差异都会影响观测到的反馈，温度收敛前先核对这些口径。',
          formulas: [{ latex: String.raw`\beta=\log\alpha,\qquad \frac{\partial L_\beta}{\partial\beta}=-\mathbb E[\log\pi(a\mid s)+H_*]=H(\pi)-H_*`, explanation: '这是 SB3 使用 log 温度的梯度方向，采样 log 密度在该损失中停止梯度。期望按当前回放状态与当前策略动作取。' }],
          sourceIds: ['paper', 'train'],
        },
      ],
      points: ['软目标只在可续值行加入下一拍熵。', '用缓冲动作监督当前 Q，用现策略采样估计未来价值。', '自动温度的符号要在真实动作坐标下解释。'],
      codeTitle: 'soft_backup_scalar.py · 对照真终止与时间截断',
      code: `from math import isclose

def soft_backup(reward, discount, terminated, q_pair, log_density, alpha):
    if not 0 <= discount <= 1 or alpha <= 0 or len(q_pair) != 2:
        raise ValueError('invalid SAC scalar backup')
    if terminated:
        return reward
    return reward + discount * (min(q_pair) - alpha * log_density)

assert isclose(soft_backup(.25, .9, False, (.70, .95), -1.2, .2), 1.096)
assert isclose(soft_backup(.25, .9, True, (.70, .95), -1.2, .2), .25)
assert soft_backup(.25, .9, False, (.70, .95), 1.2, .2) < 1
try:
    soft_backup(.25, .9, False, (.70,), -1.2, .2)
except ValueError:
    pass
else:
    raise AssertionError('missing target critic accepted')
print('soft continuation, termination and density sign verified')`,
      codeNotes: ['本例手工给出目标值与 log 密度，估计单次抽样的目标，无分布、回放存储或优化器。', '末行的拒绝测试检查双头契约。把截断误传为 True 会在首行给出 0.25 而触发断言。'],
      exercise: { prompt: '把下一动作的密度换为 exp(0.3)', steps: ['其他量沿用软续值小节。', '比较该动作与原样本对 critic 目标的影响。'], solution: 'log 密度为 0.3，软续值变为 0.70−0.06=0.64，y=0.25+0.9×0.64=0.826。两次为同一个条件期望的不同样本，不能由其差值推断环境奖励下降。' },
      quiz: { question: '目标熵为 −2，估计熵为 −1.5。log 温度的梯度是什么方向，参数怎么动？', hint: '算估计熵减目标熵。', keywords: ['0.5', '梯度下降', '温度', '减少探索'], reference: '梯度为 +0.5，梯度下降降低 log α，α 随之减小。策略上对熵的权重减弱，需结合后续策略与闭环指标判断影响。' },
      sources: [
        { id: 'paper', label: 'Haarnoja 等 · Soft Actor-Critic Algorithms and Applications v2', url: 'https://arxiv.org/abs/1812.05905v2', reading: '读 PDF §4–5 和算法 1，关注自动温度约束与双 Q。' },
        { id: 'course', label: 'OpenAI Spinning Up · SAC', url: 'https://spinningup.openai.com/en/latest/algorithms/sac.html', reading: '读 Entropy-Regularized Reinforcement Learning、Key Equations 与 Pseudocode。示例用固定温度。' },
        { id: 'train', label: 'Stable-Baselines3 v2.7.1 · SAC.train', url: 'https://stable-baselines3.readthedocs.io/en/v2.7.1/_modules/stable_baselines3/sac/sac.html', reading: '找 self.target_entropy、ent_coef_loss、target_q_values 和 actor_loss。' },
        { id: 'hil', label: 'Luo 等 · HIL-SERL v1', url: 'https://arxiv.org/html/2410.21845v1', reading: '读 §3 关于人类干预、演示缓冲和在线经验缓冲。' },
      ],
    },
    code: {
      title: '实现 actor、critic 与温度更新',
      minutes: 40,
      prerequisites: '能用广播规则读 B×1 奖励，理解 detach、no_grad 与 reparameterization 的区别。',
      connection: '承接软目标手算，沿 SB3 v2.7.1 把所有使用动作的地方标在同一小批上。11 月 23 日用这份夹具区分 Q 跳变来自训练还是数据。',
      intro: '从一次训练梯度步读 SAC.train，亲手验证 actor、critic、温度三条梯度路径。',
      outcomes: ['追踪 SAC.train、Actor.action_log_prob 和 tanh 密度修正', '运行三路更新，定位把目标端的 no_grad 误套到 actor 评值上的错误'],
      sections: [
        {
          heading: '回放动作与策略动作有三个落点',
          body: '在 SAC.train 中搜索 replay_buffer.sample。返回 observations、actions、next_observations、dones、rewards 以及可能的 discounts。源码先以当前 observations 得到 actions_pi 和 log_prob，稍后送给 actor 损失。目标段则调用 actor.action_log_prob(next_observations)，把下一动作与下一状态送进两个目标 Q。在线 critic 回归使用 replay_data.actions，对应已发生转移的执行动作。若用同一批动作代替三处，将同时改变监督语义和策略更新。\n\n在普通单步场景，奖励、终止位、联合动作 log 密度以及最小 Q 都要求 B×1。两个 critic 返回各自 B×1，先沿 dim=1 拼成 B×2，再对这一维 min 并保留轴。若 log 密度还是 B，减 B×1 时会变成 B×B，动作 0 的熵混进其他样本。SB3 对可用的多步 discounts 有单独分支，本课用固定单步折扣。',
          sourceIds: ['train'],
        },
        {
          heading: '在 tanh 之后使用正确的动作密度',
          body: '打开 sac/policies.py 的 Actor.action_log_prob，检查 get_action_dist_params 产生的均值和 log 标准差如何交给分布对象。在默认非 gSDE 路径，SquashedDiagGaussianDistribution.log_prob_from_params 先产生高斯预激活 u 和 tanh 动作，再用 log_prob 扣掉压缩变换的 Jacobian。Actor 目标要能够沿 a 对 critic 求导，重参数化用 u=μ+σε，固定随机噪声 ε 时仍可求网络参数的导数。\n\n一维 u=0.5 时，tanh(u) 约 0.4621，雅可比 1−a² 约 0.7864。标准正态在 0.5 的 log 密度约 −1.04394，扣掉 log(0.7864) 后约 −0.80371。多维对角分布要对所有动作维合计一次。公式定义在 a∈(−1,1)，硬限幅后的端点对应不同事件，不能送回高斯密度当作原抽样。夹具避开饱和区，生产实现要防止 log 零以及逆变换边界问题。',
          formulas: [{ latex: String.raw`\log\pi(a\mid s)=\sum_{j=1}^{A}\left[\log\mathcal N(u_j;\mu_j,\sigma_j^2)-\log(1-\tanh^2 u_j)\right],\qquad a_j=\tanh u_j`, explanation: 'A 是动作维数，u 是高斯样本，逐维导数乘积在 log 域化为求和。例子只使用归一化动作，无额外仿射缩放。' }],
          sourceIds: ['policy', 'dist'],
        },
        {
          heading: '选择停止梯度的位置',
          body: '按 v2.7.1 的顺序，先从 log 温度取 detach 后的指数给本次两条损失共用，再反传温度损失。critic 软目标整段放到 no_grad，先更新在线 Q，避免回归时沿右边追动目标。此后把之前采到的 actions_pi 送进已更新的在线 Q，最小化 α log π 减估值。actor 本身不更新目标 critic；目标头由在线权重的 Polyak 混合推进。\n\n教学夹具显式冻结在线 critic 的权重做 actor 步，仍保留从输出到动作的导数。SB3 源码该段直接计算在线 critic，actor 优化器只推进 actor 的参数，下一步 critic 优化前清自己的梯度。对于独立权重的教学模型，两种写法给 actor 同向信号。若把 actor 的 Q 前向整个放进 no_grad，则 Q 项不再把任务方向传给动作，只剩熵在动；固定噪声和非零动作斜率能精确查到这一错误。',
          sourceIds: ['train', 'course'],
        },
        {
          heading: '用一个两行批隔离三个故障',
          body: '第一行模拟可续值，第二行模拟真终止。把每行的奖励和下一个动作分开，并用目标双头不同偏置检查 min 的轴。若误把 next_log_prob 压为 B，算出的右侧尺寸为 B×B，可能被 MSE 广播吞过去。用形状断言卡在减法附近，同时比较终止行和原奖励完全相等，才能区别索引错误与终止掩码错误。\n\n夹具只含一维动作、二维观测、共享标量标准差与两个线性 critic，没有环境、经验池类或生产归一化。人为指定高斯噪声，使同一批的数值可重复；随后各跑一次温度、critic 和 actor 的优化。刻意断开动作梯度的分支被 reject 测试捕获。真实图像策略进 batch 前增加时钟和 episode 验证，后续诊断才有可能区分梯度故障与回放污染。',
          sourceIds: ['train', 'dist'],
        },
      ],
      points: ['B×1 的联合 log 密度应与 B×1 的 Q 相减。', 'target 整段断梯度，actor 需要 Q 对动作的导数。', '在线 critic 权重与目标权重分别记录。'],
      codeTitle: 'sac_two_rows.py · 三路更新与断梯度反例',
      code: `import copy
import torch
from torch import nn
from torch.distributions import Normal

torch.manual_seed(22)
obs = torch.tensor([[1., .2], [1., -.2]])
next_obs = obs.flip(0)
executed = torch.tensor([[.2], [-.3]])
reward = torch.tensor([[.25], [-.15]])
terminated = torch.tensor([[0.], [1.]])
noise = torch.tensor([[.4], [-.7]])
actor = nn.Linear(2, 1)
critics = nn.ModuleList([nn.Linear(3, 1) for _ in range(2)])
with torch.no_grad():
    for head, offset in zip(critics, (.0, .5)):
        head.weight.copy_(torch.tensor([[.06, .03, .4]]))
        head.bias.fill_(offset)
targets = copy.deepcopy(critics).requires_grad_(False)
log_alpha = nn.Parameter(torch.tensor(-1.6))
actor_opt = torch.optim.SGD(actor.parameters(), lr=.02)
critic_opt = torch.optim.SGD(critics.parameters(), lr=.02)
alpha_opt = torch.optim.SGD([log_alpha], lr=.02)

def sample(state, eps):
    mean = actor(state)
    scale = torch.full_like(mean, .6)
    u = mean + scale * eps
    action = u.tanh()
    density = Normal(mean, scale).log_prob(u) - torch.log1p(-action.square())
    return action, density.sum(dim=1, keepdim=True)

def values(heads, state, action):
    features = torch.cat((state, action), dim=1)
    return torch.cat([head(features) for head in heads], dim=1)

action, logp = sample(obs, noise)
alpha = log_alpha.detach().exp()
old_alpha = log_alpha.detach().clone()
alpha_opt.zero_grad()
(-(log_alpha * (logp - 1.).detach()).mean()).backward()
assert actor.weight.grad is None and log_alpha.grad.abs() > 0
alpha_opt.step()
assert not torch.equal(log_alpha, old_alpha)

with torch.no_grad():
    next_action, next_logp = sample(next_obs, -noise)
    min_next = values(targets, next_obs, next_action).amin(dim=1, keepdim=True)
    assert min_next.shape == next_logp.shape == reward.shape
    assert (min_next - alpha * next_logp.squeeze(1)).shape == (2, 2)
    target = reward + .9 * (1 - terminated) * (min_next - alpha * next_logp)
assert not target.requires_grad and torch.equal(target[1], reward[1])
assert not torch.equal(target[0], reward[0])

critic_opt.zero_grad()
prediction = values(critics, obs, executed)
(.5 * (prediction - target).square().mean(dim=0).sum()).backward()
assert all(head.weight.grad.abs().max() > 0 for head in critics)
critic_opt.step()

def require_action_gradient(value, sampled_action):
    if not value.requires_grad:
        raise ValueError('Q is detached from action')
    gradient, = torch.autograd.grad(value.sum(), sampled_action, retain_graph=True)
    if not torch.any(gradient.abs() > 1e-6):
        raise ValueError('Q provides no action gradient in this example')

critics.requires_grad_(False)
try:
    with torch.no_grad():
        wrong_q = values(critics, obs, action).amin(dim=1, keepdim=True)
    require_action_gradient(wrong_q, action)
except ValueError:
    pass
else:
    raise AssertionError('detached actor Q accepted')
actor_opt.zero_grad()
q_pi = values(critics, obs, action).amin(dim=1, keepdim=True)
require_action_gradient(q_pi, action)
(alpha * logp - q_pi).mean().backward()
assert actor.weight.grad.abs().max() > 0
actor_opt.step()
critics.requires_grad_(True)
with torch.no_grad():
    for slow, online in zip(targets.parameters(), critics.parameters()):
        old = slow.clone()
        slow.lerp_(online, .05)
        torch.testing.assert_close(slow, .95 * old + .05 * online)
print('temperature, critic, actor and Polyak step verified')`,
      codeNotes: ['sample 固定噪声但保留均值对动作的导数，标准差常量省去了额外参数。', '先缓存冻结 α，再更新 log α；critic 真终止行目标应精确等于 reward。', '正反样本对比同一个在线 critic 与同批动作，定位梯度是否能沿 Q 到 actor。末尾检查慢参数更新。'],
      exercise: { prompt: '验证两个目标头按样本而非按头平均', steps: ['将第二目标头偏置设为 −0.4。', '在 target 中同时打印 min 和均值两种软目标，并只比较首行。'], solution: '同一个下一状态及动作进入两头，第二头现在低 0.4。均值比 min 高 0.2，首行软目标高 0.9×0.2=0.18。第二行乘零后两者仍相同。' },
      quiz: { question: '为什么冻结在线 critic 参数仍能由 Q 更新 actor，而把前向放进 no_grad 就不能？', hint: '区分固定的权重和仍依赖策略的输入。', keywords: ['权重', '输入动作', '链式梯度', 'no_grad'], reference: '冻结权重保留 Q 对输入动作的偏导，动作由可微策略产生。no_grad 切断该前向的图，温度加权的 log 密度可能还给 actor 梯度，但 Q 不再提供任务方向。' },
      sources: [
        { id: 'train', label: 'SB3 v2.7.1 · SAC.train', url: 'https://stable-baselines3.readthedocs.io/en/v2.7.1/_modules/stable_baselines3/sac/sac.html#SAC.train', reading: '按 sample、ent_coef_loss、critic_target、actor_loss、polyak_update 顺序对照。' },
        { id: 'policy', label: 'SB3 v2.7.1 · SAC Actor', url: 'https://stable-baselines3.readthedocs.io/en/v2.7.1/_modules/stable_baselines3/sac/policies.html', reading: '定位 Actor.get_action_dist_params 和 Actor.action_log_prob。' },
        { id: 'dist', label: 'SB3 v2.7.1 · SquashedDiagGaussianDistribution', url: 'https://stable-baselines3.readthedocs.io/en/v2.7.1/_modules/stable_baselines3/common/distributions.html', reading: '读 SquashedDiagGaussianDistribution.log_prob、log_prob_from_params 与 DiagGaussianDistribution.sample。' },
        { id: 'course', label: 'Spinning Up · SAC Pseudocode', url: 'https://spinningup.openai.com/en/latest/algorithms/sac.html#pseudocode', reading: '对照 actor 用当前 Q、目标头慢更新的伪代码。' },
      ],
    },
    insight: {
      title: '连续真机控制为何偏爱 off-policy',
      minutes: 25,
      prerequisites: '能解释提出动作与执行动作的差别，按照 11 月 15 日的日志方法配对同一控制步。',
      connection: '用今天的回放契约设计执行层对照。11 月 23 日继续追 Q 与成功率分歧，12 月 HIL-SERL 单元再拆人工纠偏缓冲。',
      intro: '限制真实交互时，离策略训练允许用相同执行数据做更多更新。把节省了多少动作、还缺哪些状态和谁负责执行逐项量化。',
      outcomes: ['设计按实际执行动作对齐的经验预算对照', '区分离策略 value、仿真技能认证和动作条件世界模型承担的判断'],
      sections: [
        {
          heading: '把相同的交互成本拆给数据和计算',
          body: '同样 600 个新转移，一次 PPO 采样收尾才做批内迭代；SAC 可以按训练调度在采集间隙混用新旧转移。这里定义 UTD 为 critic 更新次数除以新增环境转移数。若做 1,200 次梯度更新，UTD=2；batch=64 表示 76,800 次抽样位置，其中会反复看到同一行。训练曲线变好时同时画三个横轴，环境步、优化步、实际耗时，这样能判断收益来自更少交互还是更多计算。\n\n输出延迟与 UTD 要各测。SAC 训练时需要两个 Q、目标头和多次前向，部署的低层路径一般只执行 actor 的动作建议和控制器转换。对个人 Mac 加租卡的场景，先保证回放能在单机读完；对照 UTD=1/2 时固定已有缓冲、每组新增步数、相机预处理、每步控制预算和初态。结果表同时记自主成功、接管、超时和越界，用成对初态把照明变化导致的失败单列。',
          formulas: [{ latex: String.raw`\mathrm{UTD}=\frac{N_{\mathrm{critic\ updates}}}{N_{\mathrm{new\ transitions}}},\qquad N_{\mathrm{draws}}=B\,N_{\mathrm{critic\ updates}}`, explanation: '分子按一个双 Q 联合优化步算一次，B 是小批行数。抽样位置含重复；分母只计真正进入环境的新转移。' }],
          sourceIds: ['sac', 'hil'],
        },
        {
          heading: '接管记录必须回答动作是谁做的',
          body: 'HIL-SERL 的干预段由人接管，实际推送到环境的是人的动作，干预样本同时写进演示与 RL 缓冲，策略自主转移只进 RL 缓冲。以仿真夹具为例，策略提出 +0.4，操作者执行 −0.2，随后奖励上升。若存成 +0.4，critic 会把纠偏产生的回报送给错误动作。若同时有裁剪或驱动映射，要明确 replay 的坐标选在动作发送点还是定义好的环境入口，维持动作、观测、奖励能够由同一环境转移解释。\n\n为 SO-101 的离线设计保留 proposal、applied、来源标记、回合步和下一帧身份。标签可以把疑似动作别名问题先定位，并在样本统计中暴露接管集中在哪个阶段。真机评测应把有接管后完成、全程自主完成分别记数。对于 RAW 与 RGB，教学对照先固定日志路径、保持曝光分层和输入时钟，再对同一初态比较；额外传感信息若导致迟到或改变接管策略，也要独立记录。Isaac Lab 的两个动作项曾按关节名解释任务空间裁剪，修复后按动作分量名解析。可用同一归一化输出检查裁剪配置仍指向预期分量，再审核哪一个动作字段进入回放。',
          sourceIds: ['hil', 'behavior', 'clip'],
        },
        {
          heading: '用仿真约束暴露回放的覆盖缺口',
          body: 'StanfordVL 的 BEHAVIOR/OmniGibson 评测提供任务实例、目标谓词和执行协议，适合借用初态与目标身份的记法。World Labs 的 R2S2R 把真实任务重建为交互仿真，再改变视角、物体排列与物理条件；其 Atlas 是空间生成和重建模型，场景资产接入机器人闭环还需要物理与控制层。可在仿真分层比较探索：外观变动主要考观测，接触摩擦变动则会直接改变同一动作的转移，两个层的回放违规不能用同一条损失解释。\n\n可执行一组配对方案：固定两个 checkpoint 和同一控制器，按可见度与摩擦各划两层，用同一初态重放两种策略。若遮挡层 20 个配对中，多 4 次自主成功、少 1 次自主成功，净差为 15 个百分点，另按层统计全部失败、接管和动作限幅。这个人造样本演示分母如何算。若新增成功伴随更多限幅，先用回放定位是否来自恢复动作还是动作变换，避免把仿真差异直接归给温度。',
          formulas: [{ latex: String.raw`\Delta_{\mathrm{paired}}=\frac{n_{\mathrm{only\ candidate}}-n_{\mathrm{only\ baseline}}}{N_{\mathrm{paired}}}`, explanation: '结局采用同层同一任务是否自主成功。两种策略都成功或都失败的回合仍计入分母；限幅和接管另统计。' }],
          sourceIds: ['behavior', 'r2s2r'],
        },
        {
          heading: '价值、预测与认证分别处理哪一步',
          body: 'Meta/FAIR 的 V-JEPA 2-AC 以视频表征、机器人状态和候选动作预测未来表征，规划器用目标图嵌入距离给序列排序，再由 Franka 控制层执行第一步后重观测。SAC 的 Q 从真实或模拟转移估计累计收益，actor 直接给当前动作，Q 推理本身不生成未来观测。AMI Labs 官网描述表征空间的动作条件规划方向。可在课程实验里拿冻结表征当观测编码器，仍用独立任务成功谓词检验回报估计。\n\n延伸阅读 Lazy-MOSAIC。它输入技能与其连续参数，先用便宜模型预测可行性与结果状态，仿真只认证候选路径，发现错误边再修图搜索。论文报告仿真货架八种设置中的计划性能，真机为演示。本课把它用作技能级计划和低层 SAC 执行的接口对照：高层在技能末端回读状态检查完成，低层执行连续动作；是否需要重规划应由修复延时、预算内完成率和失败日志判断。另读 ScaleVLA 的特征与动作头职责，比较离线示教适配和 SAC 在线回放的证据条件。',
          sourceIds: ['jepa', 'ami', 'mosaic', 'scale'],
        },
      ],
      points: ['把在线转移与 replay 抽样数分开。', '经验奖励绑定实际执行动作。', '技能计划通过后仍要记录执行与观测回流。'],
      codeTitle: 'executed_replay_audit.py · 回放接管与转移契约',
      code: `from dataclasses import dataclass
from math import isfinite

@dataclass(frozen=True)
class Step:
    proposed: float
    applied: float
    stored: float
    handoff: bool
    truncated: bool
    step: int
    next_step: int

def audit(rows, updates, batch):
    if not rows or updates < 0 or batch <= 0:
        raise ValueError('invalid update budget')
    for row in rows:
        if not all(isfinite(value) for value in (row.proposed, row.applied, row.stored)):
            raise ValueError('nonfinite action')
        if row.stored != row.applied:
            raise ValueError('action did not produce this observation')
        if row.next_step != row.step + 1:
            raise ValueError('next observation is out of sequence')
    return updates / len(rows), updates * batch, sum(row.handoff for row in rows)

rows = [Step(.4, -.2, -.2, True, False, 0, 1),
        Step(.1, .1, .1, False, True, 1, 2)]
assert audit(rows, 4, 64) == (2., 256, 1)
for invalid in (Step(.4, -.2, .4, True, False, 0, 1),
                Step(.1, .1, .1, False, True, 1, 0)):
    try:
        audit([invalid], 2, 64)
    except ValueError:
        pass
    else:
        raise AssertionError('bad replay record accepted')
print('execution identity, timeout boundary and replay budget verified')`,
      codeNotes: ['仿真日志中的标量使用同一个动作字段的精确副本，因此按相等比较。实务中跨编码需要明确坐标与容差。', '末观测应与动作在同一回合，夹具用局部步号演示；生产应同时校验 episode ID、无 reset 穿插和相机时间戳。'],
      exercise: { prompt: '解释一组接管混入后的胜率', steps: ['20 对中候选独胜 5 次，其中 2 次由人接管；基线独胜 2 次，均为自主。', '假定其余 13 对的自主判定相同，分别算表面差和自主差。'], solution: '只按最终完成是 (5−2)/20=15 个百分点。自主比较是 (3−2)/20=5 个百分点，并单列候选两次接管完成。相同分母便于审计，不能丢弃接管回合。' },
      quiz: { question: '接管时策略建议向右、执行向左。如果把向右写入 replay，同时用 V-JEPA 特征做观测，能修正哪个错误？', hint: '分别看动作标签、奖励来源、观测表示的职责。', keywords: ['执行动作', '转移', '表征', '动作标签'], reference: '换表征可改变观测信息，但这条转移由向左产生。须先将 replay 动作修正为向左，另存向右供审计，再单独对比表征对自主成功、恢复与时延的影响。' },
      sources: [
        { id: 'sac', label: 'Haarnoja 等 · SAC Algorithms and Applications', url: 'https://arxiv.org/abs/1812.05905v2', reading: '读机器人实验和采样效率比较的实验条件。' },
        { id: 'hil', label: 'HIL-SERL v1 · 训练干预与回放', url: 'https://arxiv.org/html/2410.21845v1', reading: '读 §3 的 Fig. 2 与 §4 真实任务和数据效率实验布局。' },
        { id: 'behavior', label: 'StanfordVL · BEHAVIOR 评测', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '定位任务与实例、评测脚本和反馈指标相关段落。' },
        { id: 'r2s2r', label: 'World Labs · R2S2R', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '读 one real task, thousands of variations 图及仿真训练与真实评测。' },
        { id: 'jepa', label: 'Meta/FAIR · V-JEPA 2-AC', url: 'https://arxiv.org/html/2506.09985', reading: '读 §3.1–3.2 与 §4.1，定位候选动作、MPC 重规划与真实机器人执行。' },
        { id: 'ami', label: 'AMI Labs · 研究方向', url: 'https://amilabs.xyz/', reading: '读 representation space 与 action-conditioned 规划的表述。' },
        { id: 'clip', label: '选读 · Isaac Lab 任务空间裁剪', url: 'https://github.com/isaac-sim/IsaacLab/pull/9040', reading: '看 RMPFlowAction 和 NonHolonomicAction 如何从动作名解析裁剪维度。' },
        { id: 'mosaic', label: '选读 · Lazy-MOSAIC v1', url: 'https://arxiv.org/html/2611.21517v1', reading: '读 §III–V，区分技能效果假设、物理认证与成功计划计时。' },
        { id: 'scale', label: '选读 · ScaleVLA v1', url: 'https://arxiv.org/html/2611.21607v1', reading: '读 §3、§4.3–4.5，分别记录骨干、动作头、仿真和充电插入实验。' },
      ],
    },
  },
};
