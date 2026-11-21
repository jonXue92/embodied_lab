import type { AuthoredDay } from './types';

export const day87: AuthoredDay = {
  "reviewedAt": "2026-11-21",
  "revision": "逐课编写 1.0",
  "deliverable": "行为正则闭式解、detach梯度反例与候选动作预算表；35+40+25=100分钟。",
  "question": {
    "title": "同一批次loss都为−.91，梯度却为−1.4与.6；RAW探针改善后能否直接减弱行为约束并上线？",
    "summary": "连接目标实现、模式覆盖与闭环证据。",
    "keywords": [
      "detach",
      "分母",
      "条件均值",
      "动作后果",
      "独立评测"
    ],
    "reference": "分母detach只固定当前尺度，保留Q经动作回传，得到−1.4；不detach时比例梯度抵消，只剩BC的.6。相同loss不能证明实现一致。RAW可能拆开观测歧义，但没有补出日志缺失的动作后果；应固定日志、动作尺度与评测协议比较约束强度，独立报告成功、恢复、介入和延迟，不能凭探针指标直接上线。"
  },
  "lessons": {
    "foundation": {
      "title": "行为正则化：让价值改进付出偏离代价",
      "minutes": 35,
      "prerequisites": "掌握11月25日条件支持与自举高估，会对一元二次函数求导。",
      "connection": "昨天发现错误的高峰；今天限制策略偏离，明天转向CQL直接约束价值。",
      "intro": "从受约束优化到TD3+BC，再用双峰日志反例识别平方距离的盲区。",
      "outcomes": [
        "推导行为距离与价值的折中解",
        "区别软惩罚、硬约束和支持集"
      ],
      "sections": [
        {
          "heading": "先区分约束谁以及约束在哪里",
          "body": "固定日志中，actor只追逐Q的高峰，会主动寻找估计器最乐观的位置。行为正则化把日志动作作为参照，让策略在训练状态上偏离这些动作时付出代价。它约束的是策略更新，不是把历史奖励改低，也不是让critic自动获得新的接触后果。没有记录的状态仍需要泛化，今天的结论不延伸到任意新场景。\n\n设训练目标是在平均行为距离不超过预算的条件下提高价值，可以用拉格朗日乘子把距离移入目标。硬预算要求求解和检验可行性；固定系数的软惩罚则允许价值收益抵偿更大偏离。两者不能仅凭目标形式就说在有限样本和神经网络优化下完全等价，也不能把调小距离系数称为取得安全认证。",
          "sourceIds": [
            "review",
            "course"
          ]
        },
        {
          "heading": "可手算的折中：价值斜率把动作拉向哪里",
          "body": "先用原创一状态模型隔离机制。日志动作b=.2，策略输出u，局部估值Q(u)=k u，取k=2；最大化λQ(u)−(u−b)²。对u求导得λk−2(u−b)，零点为b+λk/2，二阶导为−2，所以是无约束最大值；若动作界限为负1到1，再投影到区间。这里的Q是人为线性代理，并非真实机械臂回报。\n\nλ=.1时u=.3、平方距离.01；λ=.5时u=.7、距离.25。更大的λ提高价值项相对权重，因而行为约束相对更弱。注意有些文章把β放在距离前面，β增大反而约束更强；读公式时先确认系数乘在哪一项，不能把参数名直接跨实现搬运。",
          "sourceIds": [
            "paper"
          ],
          "formulas": [
            {
              "latex": "J(u)=\\lambda k u-(u-b)^2,\\quad u^*=\\operatorname{clip}(b+\\lambda k/2,-1,1)",
              "explanation": "u和b是统一归一化后的无单位动作；k是Q对动作的局部斜率，λ将价值缩放到动作平方尺度；固定λ时求导成立，不代表完整TD3+BC的闭式训练解。"
            }
          ]
        },
        {
          "heading": "平均距离小仍可能落在两个模式之间",
          "body": "同一个观测下，日志可能有从物体左侧绕行和右侧绕行两个成功动作，分别为−1与1。若策略是确定性输出，最小化两行平方误差会得到0；平均动作却可能正对障碍物。行为回归拟合条件均值，不能保证输出落在任何真实动作模式上，尤其当观测丢失任务阶段或遮挡状态时。\n\n把平方距离换成概率分布距离也不是自动解决全部问题。正向与反向KL对低密度区域的偏好不同，行为模型又可能估错密度。今天只要求识别这个失败机制，不实现生成式行为模型。补充历史状态、任务阶段或可辨识的RAW线索可能拆开混合条件，但只有重新标注和独立评测才能检验，不能靠模态名称推断已经解开。",
          "sourceIds": [
            "review"
          ]
        },
        {
          "heading": "Q归一化缓解尺度却不校准可信度",
          "body": "TD3+BC作者源码先算当前actor动作的Q，再用绝对Q的批均值构造λ，并对分母detach。论文通过这种比例降低不同任务奖励尺度对超参数的影响。若把所有Q乘正数c，非零分母情形下归一化的价值项不变；若Q加常数，绝对均值和λ通常改变，actor梯度的相对强度也会变。\n\n这个分母不是不确定度，Q很大并不表示数据支持强。原实现没有零分母保护；教学实现将显式拒绝接近零的批次，并把这一差异标成教学护栏。当天先复算折中解与双峰反例，保留CQL与IQL的细节到后续日期。实做只在CPU内存中运行，不采集新轨迹，不连接SO-101。",
          "sourceIds": [
            "src",
            "paper"
          ]
        }
      ],
      "points": [
        "λ乘Q时越大通常约束越弱",
        "均值回归不能保证模式内动作"
      ],
      "codeTitle": "behavior_tradeoff.py",
      "code": "import math\n\ndef optimum(b,k,lam):\n    if not all(math.isfinite(x) for x in (b,k,lam)) or lam<0:\n        raise ValueError('invalid scalar')\n    return max(-1.,min(1.,b+lam*k/2))\nassert math.isclose(optimum(.2,2.,.1),.3)\nassert math.isclose(optimum(.2,2.,.5),.7)\nassert optimum(.2,2.,2.)==1.\n# Equal modes: least-squares optimum lies between demonstrations.\nloss=lambda u: sum((u-a)**2 for a in [-1.,1.])/2\nassert loss(0.)==1. and loss(-1.)==2.\nassert min(abs(0.-a) for a in [-1.,1.])==1.\ntry: optimum(.2,2.,-1.)\nexcept ValueError: pass\nelse: raise AssertionError('negative lambda accepted')\nprint('u=.3/.7; bimodal mean has no nearby demonstration')",
      "codeNotes": [
        "optimum只解固定λ、线性Q的一状态问题，边界clip不是碰撞检测。",
        "loss的双峰反例只证明平方回归的均值倾向；未声称所有多模态策略都会输出均值。"
      ],
      "exercise": {
        "prompt": "b=.1、k=3、λ=.2时最优u与行为平方距离是多少？若改成β乘距离，增大β怎样影响偏离？",
        "steps": [
          "写出导数和区间投影。",
          "区分系数乘Q或乘距离的作用。"
        ],
        "solution": "u=.1+.2×3/2=.4，未触边界，距离平方(.4−.1)²=.09。若目标为Q−β距离平方，则位移为k/(2β)，增大β会减小偏离；不能混用两种超参数方向。"
      },
      "quiz": {
        "question": "日志在同一观测有−1和1两种动作，平方BC输出0为何仍可能危险？",
        "hint": "从条件均值与真实支持模式分别回答。",
        "keywords": [
          "条件均值",
          "双峰",
          "软惩罚",
          "支持集"
        ],
        "reference": "平方误差对两模式的最优确定性输出是0，但0可能没有训练转移且会撞障碍。软惩罚只改变更新偏好，不执行硬支持集或安全约束；应检验观测是否混淆阶段以及输出分布和闭环结果。"
      },
      "sources": [
        {
          "id": "paper",
          "label": "Fujimoto & Gu · TD3+BC 论文v2",
          "url": "https://arxiv.org/abs/2106.06860v2",
          "reading": "§5公式2–4：行为项、Q尺度与状态归一化；2026-11-21阅读NeurIPS原文。"
        },
        {
          "id": "src",
          "label": "作者 TD3_BC.py",
          "url": "https://github.com/sfujim/TD3_BC/blob/main/TD3_BC.py",
          "reading": "2026-11-21读main（可变）：train第96–144行，Q1第52–58行，actor_loss第129–133行。"
        },
        {
          "id": "course",
          "label": "Berkeley CS185/285 Spring 2026 HW5",
          "url": "https://rail.eecs.berkeley.edu/deeprlcourse/static/homeworks/hw5.pdf",
          "reading": "§2行为正则与SAC+BC；本课不照搬其平均双Q和省略熵的变体。"
        },
        {
          "id": "review",
          "label": "Offline RL Tutorial v3",
          "url": "https://arxiv.org/html/2005.01643v3",
          "reading": "§4.3约束类型和tradeoffs：分布距离与支持集不是同一对象。"
        }
      ]
    },
    "code": {
      "title": "精读TD3+BC的距离、detach与动作轴",
      "minutes": 40,
      "prerequisites": "理解基础课的λ方向、PyTorch自动求导与B×A张量。",
      "connection": "把行为偏离写成可复算梯度；明天再读critic的保守项。",
      "intro": "追踪作者train入口，原创复现actor目标的最小计算图，不启动上游训练。",
      "outcomes": [
        "定位真实函数与Q1调用",
        "复算detach和动作维平均的影响"
      ],
      "sections": [
        {
          "heading": "沿train入口追踪真正的两种动作",
          "body": "作者TD3_BC.train从replay_buffer.sample得到state、action、next_state、reward和not_done。critic以日志action监督当前Q，后继目标却使用actor_target加裁剪噪声得到next_action，再对目标双Q取小。这说明加了BC并没有像IQL那样消除所有显式策略动作查询，不能把算法标签当作实现路径的替代。\n\n每policy_freq次迭代才更新actor。此时pi=actor(state)，critic.Q1(state,pi)给价值项，F.mse_loss(pi,action)把pi拉向日志动作；优化actor后才软更新目标网络。Q1将state与action沿特征轴拼接，输出B×1。select_action只是推理入口，不含行为惩罚，训练时较小的距离也不会在部署时自动变成限幅器。",
          "sourceIds": [
            "src"
          ]
        },
        {
          "heading": "分母detach只切断尺度路径",
          "body": "第131行的abs().mean().detach()让当前批次λ作为常数参与这一次actor反传；分子Q的动作梯度仍必须穿过critic回到actor。如果把整个Q detach，策略就只剩BC梯度；如果不detach分母，优化器还会通过改变尺度影响目标，得到另一套梯度，不能称为原算法。\n\n原创例子令u=.5、Q=2u、日志动作b=.2、α=1。分母为1，λ为1，价值梯度为−2，BC梯度为.6，总梯度−1.4。若不detach且u为正，Q/|Q|为常数，价值项梯度抵消，剩.6；两者当前loss同为−.91，却会朝不同方向更新。检查loss数值相同远不足以证明实现正确。",
          "sourceIds": [
            "src"
          ]
        },
        {
          "heading": "动作维平均改变了正则强度",
          "body": "F.mse_loss默认对所有元素求平均，因此B×A动作的每维平方误差合计后还会除以A。若把实现改成先沿动作轴求和再对batch平均，行为项会放大A倍；相同α因此不再可比。教学代码专门用两个动作维展示mean为1而sum-then-mean为2，避免一维例子掩盖这个错误。\n\n状态标准化在作者utils.ReplayBuffer.normalize_states发生，不能自动解释为动作标准化。SO-101关节角和夹爪维的单位、缩放与max_action语义必须独立核实；若一个维度以度记录而另一个以弧度记录，平方惩罚会被量纲主导。代码严格拒绝形状广播和非有限动作，原作者并没有这些逐项断言，不应把教学护栏写成上游事实。\n\n当日LeRobot新增JointReorderProcessorStep，按末轴indices重排观测和动作并同步feature shape，提供了核对关节身份的明确接口。计算行为距离前必须把策略与日志转到相同顺序，单改shape不能检测语义错位；这个处理器也不转换单位或符号。先在合成张量验证排列，再考虑真实日志，不运行下载的上游脚本。",
          "sourceIds": [
            "src",
            "course",
            "reorder"
          ]
        },
        {
          "heading": "逐段验证最小实现并保留边界",
          "body": "下方actor_term只收同shape的B×A浮点动作，构造线性Q并对分母detach；零或极小分母直接报错。这是为了让学习者看清公式契约而加入的拒绝策略，完整训练中还需分析奖励平移、批次波动和不同任务的尺度，不能把报错本身视作算法改进证据。\n\n正测试检查loss、梯度和正比例Q缩放不变；负测试覆盖零分母、NaN与shape错配。最后用同一计算图故意去掉detach，得到相同loss和不同梯度。这个脚本没有critic训练、目标噪声或replay，因而只能验证actor目标局部行为，不产出D4RL成绩、机器人成功率或模型能力结论。",
          "sourceIds": [
            "src",
            "paper"
          ]
        }
      ],
      "points": [
        "loss相同不保证梯度相同",
        "MSE动作轴平均影响系数"
      ],
      "codeTitle": "td3bc_actor_gradient.py",
      "code": "import torch\n\ndef actor_term(u,b,scale=2.):\n    if u.ndim!=2 or u.shape!=b.shape or u.numel()==0:\n        raise ValueError('B x A contract')\n    if not torch.isfinite(u).all() or not torch.isfinite(b).all():\n        raise ValueError('nonfinite action')\n    q=scale*u.sum(dim=1,keepdim=True)\n    denom=q.abs().mean().detach()\n    if denom.item()<1e-8: raise ValueError('near-zero Q scale')\n    return -(q.mean()/denom)+(u-b).square().mean()\nu=torch.tensor([[.5]],requires_grad=True); b=torch.tensor([[.2]])\nl=actor_term(u,b); l.backward()\nassert torch.allclose(l,torch.tensor(-.91))\nassert torch.allclose(u.grad,torch.tensor([[-1.4]]))\nassert torch.allclose(actor_term(u,b,20.),l)\nv=torch.tensor([[.5]],requires_grad=True); q=2*v\nbad=-(q.mean()/q.abs().mean())+(v-b).square().mean()\nbad.backward()\nassert torch.allclose(bad,l) and torch.allclose(v.grad,torch.tensor([[.6]]))\nx=torch.tensor([[1.,1.]])\nassert x.square().mean()==1. and x.square().sum(1).mean()==2.\nfor a,c in [(torch.zeros(1,1),b),(torch.tensor([[float('nan')]]),b),(u,torch.zeros(2,1))]:\n    try: actor_term(a,c)\n    except ValueError: pass\n    else: raise AssertionError('contract failure accepted')\nprint('loss=-.91; detached gradient=-1.4; live denominator=.6; mean vs sum=1 vs 2')",
      "codeNotes": [
        "actor_term中的q=scale×sum(u)是教学线性critic，不等于作者MLP；detach仅作用于denom。",
        "先检查shape再相减，防止B×1与B意外广播；near-zero拒绝是明确新增的教学差异。"
      ],
      "exercise": {
        "prompt": "把一维b改为.4、u仍.5，α和Q不变，detach后的梯度为多少？若把Q全部detach又是多少？",
        "steps": [
          "分别计算价值与平方项的导数。",
          "说明两种detach位置的机制区别。"
        ],
        "solution": "价值项仍为−2，BC梯度为2×(.5−.4)=.2，总梯度−1.8。若整个Q detach且λ同样固定，价值项不再提供动作梯度，只剩.2，无法实现价值驱动的策略改进。"
      },
      "quiz": {
        "question": "TD3+BC actor_loss都算出−.91，为什么仍要检查分母detach与反向梯度？",
        "hint": "对比−1.4和.6来自哪条路径。",
        "keywords": [
          "detach",
          "分母",
          "动作梯度",
          "MSE"
        ],
        "reference": "分母detach时归一化尺度被视为本次常数，Q分子经动作回传，得到−1.4；不detach时正线性Q的比例梯度抵消，只剩BC的.6。loss相等无法发现更新方向不同，还应核对MSE在动作维的归约。"
      },
      "sources": [
        {
          "id": "paper",
          "label": "Fujimoto & Gu · TD3+BC 论文v2",
          "url": "https://arxiv.org/abs/2106.06860v2",
          "reading": "§5公式2–4：行为项、Q尺度与状态归一化；2026-11-21阅读NeurIPS原文。"
        },
        {
          "id": "src",
          "label": "作者 TD3_BC.py",
          "url": "https://github.com/sfujim/TD3_BC/blob/main/TD3_BC.py",
          "reading": "2026-11-21读main（可变）：train第96–144行，Q1第52–58行，actor_loss第129–133行。"
        },
        {
          "id": "course",
          "label": "Berkeley CS185/285 Spring 2026 HW5",
          "url": "https://rail.eecs.berkeley.edu/deeprlcourse/static/homeworks/hw5.pdf",
          "reading": "§2行为正则与SAC+BC；本课不照搬其平均双Q和省略熵的变体。"
        },
        {
          "id": "review",
          "label": "Offline RL Tutorial v3",
          "url": "https://arxiv.org/html/2005.01643v3",
          "reading": "§4.3约束类型和tradeoffs：分布距离与支持集不是同一对象。"
        },
        {
          "id": "reorder",
          "label": "LeRobot JointReorder固定提交",
          "url": "https://github.com/huggingface/lerobot/commit/b13b952556c597d1e0849cadb6b6e7496bc5a2f3",
          "reading": "JointReorderProcessorStep.__call__/transform_features及三类测试；2026-11-21已读，未运行上游。"
        }
      ]
    },
    "insight": {
      "title": "保守约束的收益与代价：RAW和世界模型应补哪种证据",
      "minutes": 25,
      "prerequisites": "完成距离推导与梯度脚本，能区分观测歧义、动作覆盖和动力学误差。",
      "connection": "承接条件支持图；为11月27日CQL和毕业项目的行为偏离审计建表。",
      "intro": "把行为约束放回传感器、规划和真实执行链，提出可验证的有限预算对比。",
      "outcomes": [
        "区分观测补充与动作后果补充",
        "设计同日志的约束强度消融"
      ],
      "sections": [
        {
          "heading": "多花一点计算和多冒一点风险不是同一预算",
          "body": "对个人项目，TD3+BC省去了单独训练行为生成模型，代码短且容易定位actor目标；代价是平方距离可能平均模式，并把低质量行为一起拉回来。如果日志中的失败来自夹爪延迟，增强BC可能只是更稳定地复制延迟。先给片段保留成功、失败、介入和实际执行动作标签，再解释约束究竟在靠近什么。\n\n另一个选择是保留较弱约束，让价值项选择更远的动作；收益是可能摆脱次优示范，代价是更依赖Q外推。二者应在相同日志、固定训练量和独立评测协议下对比，不能把给弱约束版本额外补轨迹后的收益算成算法差异。当天只实现合成候选表，不把云端训练费用或真机风险换算成未经测量的成功率。",
          "sourceIds": [
            "paper",
            "review"
          ]
        },
        {
          "heading": "RAW首先解决能否辨别条件",
          "body": "传感器经验的价值可以体现在把两个视觉上相似、动作要求却相反的条件拆开。例如RGB饱和让物体边缘消失，日志中左绕和右绕混在同一个条件；RAW若保留高光层次，可能让编码器区分这两类。收益是减少错误的条件平均，代价是标定、同步、存储和encoder训练都增加，必须通过固定切分下的探针与闭环实验验证。\n\n但即使RAW把条件分开，某类条件从来没有执行过右绕，仍然缺乏这个动作的后果。行为距离只会提示偏离，无法回答接触是否安全。建议的同日志实验是RGB与RAW各训练相同容量的表示和同等预算策略，再交叉报告条件可辨识性、动作距离分位数、成功与介入；不从RAW离线分类改善直接跳到部署许可。",
          "sourceIds": [
            "review"
          ]
        },
        {
          "heading": "双团队应放在闭环的不同位置",
          "body": "StanfordVL的BEHAVIOR/OmniGibson提供任务、交互物理和谓词评测。可以在固定任务初始实例中比较不同约束策略是否真正完成目标，而不是只比动作MSE。World Labs的R2S2R把真实场景转为可控变体供训练与评测，Atlas提供空间生成/重建能力；生成场景的外观多样性不自动提供原日志缺失的真实接触标签，两组织不能互相代替证据。\n\nMeta/FAIR的V-JEPA 2-AC让动作进入表征预测并用于规划，规划搜索同样可能挑中模型最乐观的区域，所以候选动作分布也需要审计。AMI Labs当前官网明确表征空间预测和动作条件规划方向，但没有在本轮核实新的公开模型实测。将这些方向联系到行为正则是机制上的推论，不能声称作者已经在SO-101上用今日惩罚验证了安全。",
          "sourceIds": [
            "behavior",
            "world",
            "meta",
            "ami"
          ]
        },
        {
          "heading": "给候选动作一张可复算的选择表",
          "body": "原创离散表有两个候选：near的Q=1、距离平方=.01；far的Q=1.3、距离平方=.25。以Q−β距离平方评分，near优于far的分界为β=1.25；β=.5时far占优，β=2时near占优。这个β与基础课乘在Q前的λ含义相反，表格必须保留公式，防止只写强或弱产生歧义。\n\n如果上层Agent把子任务交给VLA或世界模型规划器，控制器仍执行实际动作，观测和完成谓词回流才能决定重规划或人工接管。应记录每层耗时、动作单位、恢复触发与最终成功，而不能用这张Q表当闭环结果。今天产出为三列候选分数和下一步实验清单，未来经授权才开展仿真或真机；课程脚本不会发送设备命令。",
          "sourceIds": [
            "course",
            "world"
          ],
          "formulas": [
            {
              "latex": "S(a)=Q(a)-\\beta d^2(a),\\quad \\beta_{\\rm tie}=\\frac{1.3-1}{.25-.01}=1.25",
              "explanation": "Q是人为无单位回报代理，d为归一化动作距离，β将距离平方换算为评分单位；该分界只适用于给定两个候选，不是机器人通用安全阈值。"
            }
          ]
        }
      ],
      "points": [
        "RAW可辨识性不补出未执行后果",
        "比较相同日志和相同评测预算"
      ],
      "codeTitle": "regularization_candidate_table.py",
      "code": "import math\ncandidates=[('near',1.,.01),('far',1.3,.25)]\ndef choose(beta):\n    if not math.isfinite(beta) or beta<0: raise ValueError('invalid beta')\n    scores={name:q-beta*d2 for name,q,d2 in candidates}\n    return max(scores,key=scores.get),scores\nassert choose(.5)[0]=='far'\nassert choose(2.)[0]=='near'\ns=choose(1.25)[1]\nassert math.isclose(s['near'],s['far'])\ntry: choose(float('inf'))\nexcept ValueError: pass\nelse: raise AssertionError('invalid budget accepted')\nprint('beta=.5 selects far; beta=2 selects near; tie=1.25; no rollout executed')",
      "codeNotes": [
        "choose对两个已给候选打分，没有学习Q、运行世界模型或执行动作。",
        "显式检查有限β并复核交点；max在相等时的列表顺序不是实际部署决策规则。"
      ],
      "exercise": {
        "prompt": "far的Q改为1.12，其他不变，β交点是多少？若RAW分类更准但far无转移日志，可以声称恢复更安全吗？",
        "steps": [
          "求差值比并核对系数方向。",
          "列出缺少的动作后果与闭环证据。"
        ],
        "solution": "交点为(.12)/(.24)=.5，超过.5时near得分更高。RAW分类更准只改善条件辨识，不能提供far的动力学或接触结果，还需独立的执行后果、恢复成功和安全指标，不能据此声称恢复更安全。"
      },
      "quiz": {
        "question": "World Labs生成更多房间且RAW探针变好，能否证明弱行为约束的SO-101策略安全？",
        "hint": "分别追问环境、观测、动作和评测四个对象。",
        "keywords": [
          "生成场景",
          "可辨识性",
          "动作后果",
          "独立评测"
        ],
        "reference": "不能。生成场景增加环境变化、RAW可能改善观测辨识，但都不直接证明偏离日志的动作后果可信。需固定环境和数据身份，独立测成功、介入、延迟及碰撞等指标；Meta历史模型和AMI方向也不能代替SO-101实测。"
      },
      "sources": [
        {
          "id": "paper",
          "label": "Fujimoto & Gu · TD3+BC 论文v2",
          "url": "https://arxiv.org/abs/2106.06860v2",
          "reading": "§5公式2–4：行为项、Q尺度与状态归一化；2026-11-21阅读NeurIPS原文。"
        },
        {
          "id": "src",
          "label": "作者 TD3_BC.py",
          "url": "https://github.com/sfujim/TD3_BC/blob/main/TD3_BC.py",
          "reading": "2026-11-21读main（可变）：train第96–144行，Q1第52–58行，actor_loss第129–133行。"
        },
        {
          "id": "course",
          "label": "Berkeley CS185/285 Spring 2026 HW5",
          "url": "https://rail.eecs.berkeley.edu/deeprlcourse/static/homeworks/hw5.pdf",
          "reading": "§2行为正则与SAC+BC；本课不照搬其平均双Q和省略熵的变体。"
        },
        {
          "id": "review",
          "label": "Offline RL Tutorial v3",
          "url": "https://arxiv.org/html/2005.01643v3",
          "reading": "§4.3约束类型和tradeoffs：分布距离与支持集不是同一对象。"
        },
        {
          "id": "behavior",
          "label": "StanfordVL BEHAVIOR 官方评测",
          "url": "https://behavior.stanford.edu/challenge/updates.html",
          "reading": "更新中的数据版本与评测协议入口；不从任务谓词推断真机安全。"
        },
        {
          "id": "world",
          "label": "World Labs R2S2R",
          "url": "https://worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "2026-07-28原文：真实场景重建、变体与训练评测；2026-11-21复读。"
        },
        {
          "id": "meta",
          "label": "Meta V-JEPA 2官方",
          "url": "https://ai.meta.com/research/vjepa/",
          "reading": "Planning for robotic control：视频表征、机器人动作条件训练和目标图规划。"
        },
        {
          "id": "ami",
          "label": "AMI Labs 当前方向",
          "url": "https://amilabs.xyz/",
          "reading": "官网representation space和action-conditioned段落，方向声明不当作新模型结果。"
        }
      ]
    }
  }
};
