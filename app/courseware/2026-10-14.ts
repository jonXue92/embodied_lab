import type { AuthoredDay } from './types';

const sources = [
  { id: 'pi0v1Flow44', label: 'Physical Intelligence · π0 原论文 v1', url: 'https://arxiv.org/html/2410.24164v1', reading: '2026-10-10 实读 §IV 的路径、速度与 Euler 公式及附录 A-B/A-D。v1 正向插值与所写速度符号不一致，正文用端点检查说明；不静默照抄。' },
  { id: 'pi0Flow44', label: 'openpi · pi0.py', url: 'https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/models/pi0.py', reading: '2026-10-10 实读 main：compute_loss、sample_actions、embed_suffix；训练 beta/time_expanded/u_t/axis=-1；采样 dt、step、cond。main 可变，未宣称固定提交。' },
  { id: 'pi0Shape44', label: 'openpi · Pi0Config', url: 'https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/models/pi0_config.py', reading: '2026-10-10 实读 main：action_dim、action_horizon、pi05、inputs_spec；模型默认形状和特定训练配置分别核对。' },
  { id: 'pi0Train44', label: 'openpi · training/config.py', url: 'https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/training/config.py', reading: '2026-10-10 实读 main：TrainConfig.model、LeRobotDROIDDataConfig.create 及动作速度注释；数据适配不等于 flow 时间约定。' },
  { id: 'behavior44', label: 'StanfordVL · BEHAVIOR 评测', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '2026-10-10 实读 Challenge Track、Running Evaluations：观测权限、实例、policy server 返回动作。延伸资料，不要求通读。' },
  { id: 'worlds44', label: 'World Labs · Building Worlds That Train Robots', url: 'https://www.worldlabs.ai/blog/real-to-sim-to-real', reading: '2026-10-10 实读 Real-to-Sim 与 Evaluation；重建观测/动力学、制造可控变体、比较仿真与真实策略排序。属于 World Labs 项目报告。' },
  { id: 'vjepa44', label: 'Meta/FAIR · V-JEPA 2 官方仓库', url: 'https://github.com/facebookresearch/vjepa2', reading: '2026-10-10 实读 README 的 V-JEPA 2 Pre-training 与 V-JEPA 2-AC Post-training：视频表征、动作条件模型和图像目标规划；历史 Meta 成果。' },
  { id: 'ami44', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '2026-10-10 实读 representation-space prediction、action-conditioned world models 段落；方向声明不当成已发布模型指标。' },
];

export const day44: AuthoredDay = {
  reviewedAt: '2026-10-10', revision: '逐课编写 1.0',
  deliverable: '一份 π0 v1/openpi 时间换元与端点审计；一个双峰条件速度计算器和一个训练/采样数值夹具；一张量化精度—生成时延—任务容差的选择表。三课共100分钟，另留20分钟复盘。',
  question: {
    title: '一位同事照 π0 v1 写正步长，却沿用 openpi 的 noise-actions；另一位用512桶得到更快结果。怎样分别检验正确性与选择理由？',
    summary: '先用端点识别符号混用，再按任务容差、模式覆盖和真实时延判断连续/离散生成。',
    keywords: ['endpoint audit', 'time reparameterization', 'conditional expectation', 'quantization', 'serial decoding', 'task tolerance'],
    reference: '先取 a=.3、ε=1.1。openpi 的 u=.8 配负总步长-1得到.3；若配正总步长+1则到1.9，直接失败。论文τ=1-t的正向路径要求速度a-ε=-.8，不能只换时间不换速度。再把512桶定义为[-1,1]等宽中心量化，物理范围100毫米时最大误差为100/(2×512)=.09765625毫米：容差.05毫米无法得到最坏情况保证，容差.2毫米则量化项可满足。连续输出没有该固定桶误差，却仍有模型和积分误差；两者都能表达多模态。比较须固定数据、条件、动作跨度和执行协议，测生成完成时延及失败切片，不用单一loss或桶数宣布优胜。',
  },
  lessons: {
    foundation: {
      title: 'Flow Matching action generation：从符号审计到双峰条件速度', minutes: 35,
      prerequisites: '09-27 已学直线 flow 与 Euler，10-09 已学 SmolVLA mask；10-13 已理解 π0 条件和动作专家。会读条件概率、加权平均及一维高斯。',
      connection: '接续10-13的架构，今天解释同一动作专家为什么能通过局部平方损失生成多峰动作；10-15再把归一化坐标映射到不同本体。这里不重做基础 mask 教程。',
      intro: '最容易误解的地方有两个：论文和实现的时间坐标并不相同；速度的条件期望也不等于最终动作的全局平均。本课用端点反证和可计算的双峰分布把这两个问题分开，随后用代码检验。',
      outcomes: ['识别 v1 的符号歧义并完成时间换元', '计算双峰动作在中间时刻的后验权重与速度', '解释局部MSE为何不必把最终动作压成均值'],
      sections: [
        { heading: '01 先用端点判定论文与实现的约定', body: '原论文v1的§IV把带噪动作写成τa+(1-τ)ε，并描述从τ=0的噪声走向τ=1的数据；但同段给出的速度目标是ε-a，紧接着又用正δ相加的Euler更新。按照这条插值求导应为a-ε，因此三者按字面不能同时成立。这是需要指出的符号不一致，不能用“两个时间方向不同”一句话掩盖。\n\n本课采用已核对的openpi约定：x_t=(1-t)a+tε，t=1是噪声，t=0是数据，监督u=ε-a，采样dt为负。若令τ=1-t，链式法则要求v_τ=-v_t；例如a=.3、ε=1.1，负向总步长乘.8回到.3，正向总步长乘-.8也回到.3，正步长配.8却到1.9。端点是验收依据，不把推测的作者意图当成已证实修订。', sourceIds: ['pi0v1Flow44', 'pi0Flow44'], formulas: [{ latex: String.raw`\tau=1-t,\qquad \frac{dx}{d\tau}=-\frac{dx}{dt},\qquad x_1=\varepsilon,\quad x_0=a`, explanation: '本式x的下标使用openpi的t，τ是论文正向坐标；换元同时翻转速度。v1的高斯协方差写法与线性噪声系数也须区分：按所写插值计算应是(1-τ)²I。' }] },
        { heading: '02 已知端点的直线与未知端点的推断不同', body: '训练程序知道演示a和随机ε，因而能构造每对端点的直线及速度标签；部署网络只看当前x、时间t与条件c，无法直接访问a。平方损失在固定可见输入下的最优解是相容速度的条件平均。这里的条件包括x，而普通单点动作回归只按c取平均；遗漏这个区别，就会误认为两者必定输出同一个中间动作。\n\n考虑原创教学分布：同一条件下动作a只有-1与+1两个等概率模式，噪声独立服从标准高斯。在t=.5时，两条模式各自诱导均值-.5和+.5、标准差.5的高斯。看到x=.5，右模式的相对似然为1，左模式为exp(-2)，因此右模式后验约.880797，动作后验均值约.761594；网络在这个位置的平均速度约-.523188。', formulas: [{ latex: String.raw`v^*(x,t,c)=\mathbb E[\varepsilon-a\mid x,t,c]=\frac{x-\mathbb E[a\mid x,t,c]}{t}\quad(t>0)`, explanation: '由ε=(x-(1-t)a)/t代入得第二式；x、a均为归一化坐标，t无物理时间单位。数值例(.5-.761594)/.5=-.523188。' }] },
        { heading: '03 局部平均速度仍然能保留两种动作模式', body: '同一个教学分布在x=-.5处得到相反速度+.523188。负时间积分时，右边样本往更大的动作走，左边样本往更小的动作走，于是不同噪声初值可以进入不同模式。动作回归E[a|c]=0会把两种绕行都压在中间，而flow的条件期望随当前位置改变；“使用MSE”并不能独自决定模型最后是单峰还是多峰。\n\n精确对称的x=0会得到零速度，这不推翻分布运输：连续高斯恰好抽到零的概率为零，而离散有限精度和有限步数仍可能暴露边界问题。两点数据分布还使t接近零时的场变尖，下面程序只在t>0计算后验，不声称平滑可逆ODE在有限时间精确生成两个原子点。真实动作有噪声和连续变化，模式覆盖仍须由样本统计验证。', formulas: [{ latex: String.raw`P(a=1\mid x,t)=\frac{\exp[-(x-(1-t))^2/(2t^2)]}{\exp[-(x-(1-t))^2/(2t^2)]+\exp[-(x+(1-t))^2/(2t^2)]}`, explanation: '两模式先验各1/2且条件方差同为t²，归一化常数抵消。程序减去最大log权重后取指数，避免远离模式时双双下溢。' }] },
        { heading: '04 条件信息与生成能力必须分别诊断', body: '若图像明确显示左侧被挡，条件c应该让右模式先验更高；若遮挡使两种情境不可区分，增加生成步数无法恢复缺失证据。对有RAW与图像处理经验的学习者，一个可验证的问题是曝光或细节恢复是否降低条件歧义，而不是看随机采样更丰富就认定感知更好。相同任务中合理多解与传感错误导致的伪多解需要单独标注。\n\n本课代码把prior作为输入，直接比较等概率和偏向右侧时的后验，这是条件作用的算术替身，不是训练出的视觉模型。真正实验可按背光、正常光和遮挡分层，在固定动作标签与采样种子下检查模式概率是否随可见证据变化；若RAW只增加处理时间却没有改善正确模式覆盖，就不能把它当成flow训练的必需模态。' },
      ],
      points: ['v1正向插值对应a-ε；openpi反向采样对应ε-a和负dt。', '速度条件期望依赖当前x，区别于直接动作的全局均值。', '多峰表达能力不能弥补条件缺失，也不是连续表示独有。'],
      codeTitle: 'bimodal_velocity.py · 原创离线双峰后验与符号反例',
      code: String.raw`import math

def posterior_velocity(x, t, prior=.5):
    if not all(math.isfinite(z) for z in (x, t, prior)):
        raise ValueError("finite inputs required")
    if not 0 < t <= 1 or not 0 < prior < 1:
        raise ValueError("interior time and prior required")
    modes = (-1., 1.)
    logs = [math.log(p) - (x-(1-t)*a)**2/(2*t*t)
            for a, p in zip(modes, (1-prior, prior))]
    shift = max(logs)
    weights = [math.exp(z-shift) for z in logs]
    right = weights[1]/sum(weights)
    mean_action = 2*right-1
    return right, (x-mean_action)/t

p, v = posterior_velocity(.5, .5)
assert abs(p-.8807970779778823) < 1e-12
assert abs(v+.5231883119115293) < 1e-12
assert posterior_velocity(-.5, .5)[1] > 0
assert posterior_velocity(.5, .5, .9)[0] > p
assert .5-.1*v > .5
# Negative control: forgetting x in the conditioning gives the wrong field.
global_mean_field = .5/.5
assert abs(global_mean_field-v) > 1
a, noise = .3, 1.1
assert abs(noise-(noise-a)-a) < 1e-12
assert abs((noise+(noise-a))-1.9) < 1e-12
for args in ((0., 0., .5), (0., .5, 1.), (float("nan"), .5, .5)):
    try:
        posterior_velocity(*args)
        raise AssertionError("invalid input accepted")
    except ValueError:
        pass
print("bimodal posterior, conditional mean, sign controls: PASS")`,
      codeNotes: ['第一段只用math；验证有限输入及t>0，明确不在奇异数据端除以零。', '第二段由两个高斯log似然构造后验，减最大值保持数值稳定，再把后验动作均值换成速度。', '第三段核对手算、小负步长方向和prior变化；global_mean_field故意漏掉x条件，必须与正确速度显著不同。', '末段同时检测论文/实现混用的1.9错误端点与非法输入；没有联网、权重或设备访问。'],
      exercise: { prompt: '保持t=.5但取x=0、右模式先验.75，求后验、动作后验均值和速度；解释与等先验的区别。', steps: ['对称位置的两模式似然相同。', '归一后保留先验比例，再代入速度公式。'], solution: '后验右模式仍为.75，动作后验均值为.5，速度(0-.5)/.5=-1。负dt使x向右移动；等先验时均值与速度都为0。改变的是条件先验，不是更换积分方向。' },
      quiz: { question: '在x=.5、t=.5处把局部速度替换成(x-E[a|c])/t，为何破坏双峰flow？', hint: '本例E[a|c]=0，但看过x后右模式概率已变。', keywords: ['posterior weight', 'local velocity', 'bimodal', 'conditioning on x', 'MSE'], reference: '给定x后两模式权重不再各半；右模式后验约.881，使正确速度为-.523。忽略x对端点后验的影响会得到+1，负步长反而把右侧样本往中间推。问题在条件期望算错，不在MSE本身不能表示多峰。' },
      sources: sources.slice(0, 2),
    },
    code: {
      title: '追踪训练 flow target 与推理积分：归约轴和非恒定场审计', minutes: 40,
      prerequisites: '已完成本日时间换元与后验速度；理解[B,H,D]、广播、函数参数和数值误差。10-13的架构与cache依赖作为已知前提。',
      connection: '本课把数学约定落到openpi的compute_loss/sample_actions；下一课据积分成本比较离散生成，10-15继续追踪动作统计与反归一化。',
      intro: '这里不再写一个永远知道真实动作的常速度oracle来证明所有步数都准确，而是同时核对训练返回值的轴，以及会随状态改变的解析速度场。两类测试分别发现目标构造错误和采样器更新错误。',
      outcomes: ['逐项定位time、x_t、u_t及loss返回轴', '验证sample_actions每步重新查询速度与停止条件', '用非恒定场区分离散化误差、速度缓存错误和模型误差'],
      sections: [
        { heading: '01 compute_loss只抽局部点，不运行采样循环', body: '沿Pi0.compute_loss阅读：随机键分给观测预处理、噪声与时间；noise与actions同形，time按batch形状采Beta(1.5,1)后做.999倍加.001的变换，扩展最后两轴构造x_t。训练的u_t是noise-actions，网络一次前向输出v_t。高t在该坐标是噪声侧，不能把论文低τ的描述直接贴到变量time上。\n\n教学上未缩放Beta的均值为.6，变换后为.6004，这说明抽样权重偏向噪声侧，不说明推理网格也要按Beta抽。训练覆盖的是局部回归问题，推理网格控制积分误差，两者是独立设置。下面固定输入而不抽随机数，目的是让任何人可复算标签和每个位置的误差；它没有复制完整JAX训练器。', sourceIds: ['pi0Flow44'] },
        { heading: '02 返回[B,H]与标量loss之间还隔一层', body: '官方函数最后对平方误差只做axis=-1的mean，即先平均动作维D，保留batch和horizon；它并没有在这行实现SmolVLA课程里的action_is_pad有效元素归约。读取调用方之前不要把两套框架的mask行为混为一谈。Pi0Config.inputs_spec描述[B,H,D]，默认D=32、H=50，但实际配置可覆盖，不能把默认形状当成机器人自由度。\n\n原创夹具取B=1、H=2、D=2，在真实目标上分别加误差[1,3]与[0,2]。逐动作位置均方误差为[5,2]，若再等权平均才得到3.5；只看3.5无法确认中间轴是否正确。代码检查具体二维列表，并故意用错时间长度作为负测试；所有数值都在归一化空间，物理单位和适配留到明天。', sourceIds: ['pi0Flow44', 'pi0Shape44', 'pi0Train44'] },
        { heading: '03 sample_actions缓存条件而非速度', body: '采样入口允许注入noise，默认num_steps为10，dt=-1/num_steps。固定prefix被预填一次，step函数取当前x_t和time重新形成suffix，再投影得到速度并同时更新状态与时间；cond用time>=-dt/2避免浮点残差导致多走一步。本课用整数循环替代该while条件，目标仍是恰好N次评估和累计时间差-1。\n\n要测试“每步重新算”而非只测试符号，可设教学场dx/dt=2tx，从t=1的x=1出发，其精确解为x(t)=exp(t²-1)，终点是exp(-1)。若将初始速度2缓存起来，十步后得到-1，明显错误；正确Euler也有有限误差，但随着网格加密趋近解析终点。这一场不是π0学到的动力学，仅用来检查求解器。', sourceIds: ['pi0Flow44'] },
        { heading: '04 通过解析测试仍不能证明策略训练有效', body: '方向、调用次数、返回轴和有限值检查能排除实现缺陷，却没有证明真实网络学会目标场。即便无限细积分，错误的速度函数仍可把概率质量搬到错误动作。评测应固定条件与噪声，分别比较局部速度残差、生成终点、模式覆盖和任务结果，才能判断应增加采样步数还是补训练数据。\n\n下面代码分三段：training_fixture构造确定的监督，loss_by_step复现动作轴平均，integrate每步检查速度并更新。正例比较解析终点的误差趋势；负例包括缓存速度、正方向、不合法步数与NaN速度。它仅使用标准库，运行不需要模型下载；虽然使用具备PyTorch的解释器验收，也不把解释器中的库当成课程依赖。' },
      ],
      points: ['训练的Beta时间权重不是采样网格。', 'openpi这行loss只平均动作轴，不应套用SmolVLA的mask结论。', '解析非恒定场可抓住错误缓存速度；常速度oracle做不到。'],
      codeTitle: 'pi0_flow_contract.py · 原创纯离线监督与积分夹具',
      code: String.raw`import math

def training_fixture(actions, noise, times):
    b, h, d = len(actions), len(actions[0]), len(actions[0][0])
    if len(noise) != b or len(times) != b:
        raise ValueError("batch mismatch")
    for cube in (actions, noise):
        if any(len(row) != h or any(len(v) != d for v in row) for row in cube):
            raise ValueError("ragged chunk")
    if any(not math.isfinite(t) or not 0 <= t <= 1 for t in times):
        raise ValueError("time domain")
    xt, target = [], []
    for ac, nc, t in zip(actions, noise, times):
        xt.append([[(1-t)*a+t*n for a,n in zip(av,nv)] for av,nv in zip(ac,nc)])
        target.append([[n-a for a,n in zip(av,nv)] for av,nv in zip(ac,nc)])
    return xt, target

def loss_by_step(pred, target):
    return [[sum((p-u)**2 for p,u in zip(pv,uv))/len(uv)
             for pv,uv in zip(pc,uc)] for pc,uc in zip(pred,target)]

ac, nc = [[[.2,-.4],[.6,.8]]], [[[1.,0.],[-.2,.4]]]
x, u = training_fixture(ac, nc, [.25])
assert abs(x[0][0][0]-.4) < 1e-12
assert abs(u[0][1][0]+.8) < 1e-12
pred = [[[u[0][0][0]+1,u[0][0][1]+3], [u[0][1][0],u[0][1][1]+2]]]
assert loss_by_step(pred,u) == [[5.,2.]]
assert sum(loss_by_step(pred,u)[0])/2 == 3.5

def integrate(field, steps, direction=-1):
    if type(steps) is not int or steps <= 0:
        raise ValueError("positive integer steps")
    state, calls = 1., 0
    dt = direction/steps
    for k in range(steps):
        t = 1+k*dt
        velocity = field(state,t)
        if not math.isfinite(velocity):
            raise ValueError("nonfinite velocity")
        state += dt*velocity
        calls += 1
    return state, calls

field = lambda x,t: 2*t*x
exact = math.exp(-1)
errors = [abs(integrate(field,n)[0]-exact) for n in (10,40,160)]
assert errors[2] < errors[1] < errors[0]
assert integrate(field,10)[1] == 10
cached = integrate(lambda x,t: 2.,10)[0]
assert abs(cached+1) < 1e-12 and abs(cached-exact) > 1
assert integrate(field,10,direction=1)[0] > 1
bad_calls = [lambda: training_fixture(ac,nc,[]),
             lambda: integrate(field,0), lambda: integrate(field,2.5),
             lambda: integrate(lambda x,t: float("nan"),10)]
for call in bad_calls:
    try:
        call()
        raise AssertionError("invalid contract accepted")
    except ValueError:
        pass
print("target axes and changing velocity: PASS", errors)`,
      codeNotes: ['training_fixture用嵌套列表保持[B,H,D]，固定time在H、D上共享；检查batch和矩形形状，省略完整生产输入校验。', 'loss_by_step用于已由fixture保证相同shape的预测/标签；按D平均得到[[5,2]]，不声称支持padding或任意错shape输入。', 'integrate用整数k生成每次t，重新调用field后做显式Euler；解析场2tx同时依赖状态和时间，能区分缓存条件与缓存速度。', '最后比较三种网格误差，并故意提供坏方向、缓存常量、零/非整数步数和NaN；这些断言是数学契约测试，未训练或评测真实π0。'],
      exercise: { prompt: '若网络在解析场2tx上叠加固定偏差.1，持续增加Euler步数能否保证回到exp(-1)？怎样修改实验区分两种误差？', steps: ['分别定义正确field和biased_field。', '对两者用相同网格和起点，逐渐加密并比较各自收敛终点。'], solution: '不能。加密降低的是对给定场的离散化误差，偏置场对应另一条ODE。可先用正确场证明求解器收敛，再看偏置场的误差平台；偏置存在时需修正模型，不能把增加调用次数当成目标正确性的保证。' },
      quiz: { question: '为什么十步常速度测试通过，仍可能遗漏把v_t缓存一次的采样bug？', hint: '测试输入是否真的要求每步速度变化？', keywords: ['constant oracle', 'velocity cache', 'state dependent field', 'NFE', 'Euler error'], reference: '常速度oracle的输出本来每步一样，缓存一次与重算无法区分。用2tx场时当前状态和时间都改变，缓存初始速度2会到-1，而正确数值解随步数增加趋近exp(-1)；应同时检查评估次数和终点趋势。' },
      sources: sources.slice(0, 4),
    },
    insight: {
      title: '连续动作生成为何优于离散 token 的某些场景：精度与时延边界', minutes: 25,
      prerequisites: '已理解条件多峰、负向积分和NFE；能够区分动作物理单位、量化桶、生成时延与执行频率。',
      connection: '10-09讨论过采样步数与执行块；今天把比较对象换成离散动作编码，量化到具体容差，再连接环境生成与latent规划。10-15将验证这里假设的物理尺度来自哪些统计量。',
      intro: '连续生成的优势要写成带条件的判断：在细小接触调整、高维长动作块或需要保留多种协调动作时，它可能更合适。但离散策略也能表示多峰，更精细或压缩的tokenizer可能改变精度和时延成本。',
      outcomes: ['手算等宽中心量化的最坏误差与RMS', '比较flow调用和逐标量串行解码的成本，并指出假设', '为RAW/SO-101设计可归因的表示实验和世界模型延伸'],
      sections: [
        { heading: '01 桶边界带来的误差是否超过任务容差', body: '设一维归一化动作覆盖[-1,1]，用K个等宽区间并解码到区间中心，则步距为2/K，最大绝对误差为1/K。如果物理坐标覆盖长度R，最大物理误差就是R/(2K)。取R=100毫米、K=256，最大误差.1953125毫米；假设误差在桶内均匀，RMS约.112764毫米。这是编码器量化下限分析，不是离散策略已经达到的总误差。\n\n若接触阶段允许误差仅.05毫米，这套256桶编码无法给出最坏情况保证；K至少1000才让量化项不超过容差，且尚未给模型、标定与执行误差留余量。连续head没有固定桶宽，却会受到网络偏差、积分、浮点数和反归一化误差影响。这里100毫米是教学坐标范围，不能直接当作SO-101关节或末端精度声明。', formulas: [{ latex: String.raw`e_{\max}=\frac{R}{2K},\qquad e_{\mathrm{rms}}=\frac{R}{\sqrt{12}K},\qquad K\ge\left\lceil\frac{R}{2\eta}\right\rceil`, explanation: 'R和容差η使用同一物理单位，K是等宽中心量化桶数；RMS额外假设桶内误差均匀。η=.05毫米、R=100毫米时K至少1000，未计其他误差。' }] },
        { heading: '02 多峰不是连续表示的专利', body: '离散分类分布也可把概率分别放在左绕与右绕两个桶群；失败常来自选择期望值、独立逐关节采样或不合适的编码，而非“离散”二字。比如两种协调动作(-1,-1)与(1,1)各半，逐轴独立采样会额外生成(-1,1)和(1,-1)，总概率一半落在未示范组合；具有条件依赖的自回归离散模型可以避免这个问题。\n\n连续flow把整块动作作为联合变量，适合学习相关结构，但没有自动保证任务约束。若演示只含单一平滑模式，简单回归就可能足够；若控制器本身只接受粗粒度模式或夹爪开关，分类输出反而直接。教学建议是在同一数据中分别记录合法模式覆盖、非法组合率和连续误差，不能只用与单条演示的MSE惩罚另一条同样成功的路径。' },
        { heading: '03 时延比较必须数清串行依赖', body: '教学预算取H=20、D=6，每个标量一个token且严格自回归，需要120次顺序解码。假设共享预填18毫秒，每token增量2毫秒，完成时延258毫秒；flow若8次动作专家调用、每次7毫秒，同样预填后为74毫秒。这个例子解释长动作块可能偏好并行更新，但每次flow调用处理整块，不能把7毫秒和2毫秒理解为相同工作量。\n\n若某压缩tokenizer把整块压成12个token，同样假设下就是42毫秒，排序立刻反转。更短的生成时延不代表更小量化误差，吞吐也不代表首动作延迟；流式执行还会改变比较口径。应在相同完成口径下测预处理、预填、生成和后处理的联合p99，而不是将分项p99相加当成严格统计量；本例数字全是预算假设。', formulas: [{ latex: String.raw`T_{\mathrm{AR}}=T_p+L T_{\mathrm{token}},\qquad T_{\mathrm{flow}}=T_p+N T_{\mathrm{expert}},\qquad N T_{\mathrm{expert}}<L T_{\mathrm{token}}`, explanation: 'T均为毫秒；L为真实串行token数，只有逐标量编码时L=HD。N为flow评估次数，最后不等式是在共同固定成本假设下的速度优势条件。' }] },
        { heading: '04 两条研究主线如何检验表示选择', body: 'StanfordVL的BEHAVIOR-1K/OmniGibson提供交互环境与任务评测：策略接收获准观测，返回动作，由环境动力学产生结果，因此可固定实例比较两种动作表示的完成与失败。World Labs的R2S2R报告从真实任务重建可交互世界并改变外观、相机、物体和物理条件；它适合提出“桶误差在接触或视角扰动下何时放大”的研究实验，但项目报告不能替代Stanford基准结论。\n\nMeta/FAIR历史V-JEPA 2先从视频学习表征，2-AC再使用机器人动作交互训练latent后果预测，并通过图像目标规划选动作；它预测的是动作之后的表征，flow预测的是动作生成速度。可设想用latent模型评价flow候选，但这是本课提出的组合实验，不是已发布π0模块。AMI官网讲表征空间预测、动作条件与可靠性愿景，不能将Meta模型或本课组合实验写成AMI实测成果。', sourceIds: ['behavior44', 'worlds44', 'vjepa44', 'ami44'] },
        { heading: '05 把个人感知经验变成两项受控比较', body: '第一项固定图像条件、数据切分和执行协议，仅更换中心量化动作编码与连续head，按粗定位和接触微调分段报告误差、模式覆盖和生成完成时延。预期收益是能定位量化是否构成瓶颈；代价是两种模型训练与解码计算不同，要报告参数、训练预算和实际设备，而不能只按步数公平。个人Mac与租用GPU分别测量，不外推另一设备的速度。\n\n第二项固定已选动作表示，比较自有同步RAW处理与RGB条件，判断细节改善是否减少错误模式而非改变动作编码。环境变体可借鉴R2S2R的扰动维度，结果记录可借鉴BEHAVIOR的实例与观测权限；latent评分暂作独立离线对照。两项分开能区分表示收益和感知收益，产出可复核实验表，不要求下载大型世界模型或操作机械臂。' },
      ],
      points: ['精细容差暴露粗桶误差，但连续输出没有总误差为零的保证。', '离散与连续都可多峰，联合依赖比标签名称更关键。', '串行token数量与每步实际计算共同决定速度，压缩编码可反转比较。'],
      codeTitle: 'action_representation_budget.py · 原创量化与串行成本正负测试',
      code: String.raw`import math

def quantize_center(x, bins):
    if type(bins) is not int or bins < 1 or not math.isfinite(x) or not -1 <= x <= 1:
        raise ValueError("invalid quantizer input")
    index = min(bins-1, math.floor((x+1)*bins/2))
    return -1+(index+.5)*2/bins

span, bins = 100., 256
max_mm = span/(2*bins)
grid = [-1+2*j/4096 for j in range(4097)]
observed = max(abs(quantize_center(x,bins)-x)*span/2 for x in grid)
assert abs(observed-max_mm) < 1e-12
assert abs(max_mm-.1953125) < 1e-12
assert max_mm > .05
assert span/(2*1024) < .05
# Two correlated modes: independent axes invent two invalid combinations.
pairs = [(a,b) for a in (-1,1) for b in (-1,1)]
assert sum(a != b for a,b in pairs)/len(pairs) == .5

def budget(tokens, nfe, token_ms=2., expert_ms=7., prefill_ms=18.):
    if any(type(v) is not int or v <= 0 for v in (tokens,nfe)):
        raise ValueError("positive integer counts required")
    if any(not math.isfinite(v) or v < 0 for v in (token_ms,expert_ms,prefill_ms)):
        raise ValueError("invalid milliseconds")
    return prefill_ms+tokens*token_ms, prefill_ms+nfe*expert_ms

ar, flow = budget(20*6,8)
assert (ar,flow) == (258.,74.) and flow < ar
compressed, _ = budget(12,8)
assert compressed == 42. and compressed < flow
for call in (lambda: quantize_center(1.1,256), lambda: quantize_center(0,0),
             lambda: budget(120,0), lambda: budget(120,8,expert_ms=float("nan"))):
    try:
        call()
        raise AssertionError("invalid budget accepted")
    except ValueError:
        pass
print("quantization, correlation and latency reversals: PASS")`,
      codeNotes: ['quantize_center定义K个区间中心，x=1特判到最后桶；网格含两端，因此能实际命中最大误差，不与K个含端点码字的2/(K-1)混淆。', 'span/2将归一化误差转成毫米；1024桶只通过量化项预算，不等于系统精度通过。pairs枚举展示独立采样破坏相关性。', 'budget只算声明的串行工作量；120与12个token的两个正例给出相反排序，用来反驳连续必然更快。', '末段拒绝越界、零桶、零NFE及NaN时延；没有访问计时硬件或执行动作，输出不能当成设备实测。'],
      exercise: { prompt: '范围80毫米、512中心桶，要求量化误差不超过.1毫米；预填15毫秒、30个token每个1.5毫秒、flow6步每步9毫秒，选择结论是什么？', steps: ['计算最大量化误差并与容差比较。', '分别计算完整生成时延，列出尚缺的质量证据。'], solution: '最大量化误差80/(2×512)=.078125毫米，量化项通过；AR时延15+30×1.5=60毫秒，flow为15+6×9=69毫秒。此假设下离散更快，尚需比较模型误差、模式覆盖、接触失败和真实p99，不能仅凭表示类型改选flow。' },
      quiz: { question: '为什么“离散动作只能单峰，所以用flow就能解决背光抓取”同时混淆了两个问题？', hint: '分类分布的模式数与条件可观测性分别由什么决定？', keywords: ['categorical multimodality', 'sensor ambiguity', 'joint distribution', 'quantization tolerance', 'controlled experiment'], reference: '离散分类可以给多个动作模式分配概率，自回归还可建模关节相关性；粗量化影响分辨率，不等于只能单峰。背光可能丢失决定动作的条件信息，flow无法凭更多积分恢复它；需分别做动作编码和感知条件消融，以容差、模式错误和时延判断。' },
      sources,
    },
  },
};
