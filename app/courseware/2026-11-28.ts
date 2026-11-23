import type { AuthoredDay } from './types';

export const day89: AuthoredDay = {
  "reviewedAt": "2026-11-23",
  "revision": "逐课编写 1.0",
  "deliverable": "两点expectile推导、IQL三损失梯度表、RAW权重集中度审计；35+40+25=100分钟。",
  "question": {
    "title": "IQL的V=1.6、Q目标1.64和有效样本量1.714分别说明什么，为什么仍不能认定SO-101可直接上线？",
    "summary": "连接不对称回归、bootstrap、优势加权和闭环证据。",
    "keywords": [
      "expectile",
      "bootstrap",
      "有效样本量",
      "日志支持",
      "闭环"
    ],
    "reference": "Q取0和2等频、τ=.8时V=1.6，是动作价值的上expectile；r=.2、γ=.9、mask=1使目标1.64，真终止则.2。权重1/1/1/9的有效样本量12/7，仅表示集中度，不能充当独立试验数。IQL不向Q查询OOD动作不保证策略输出在支持内，更不能提供成功、时延、恢复和接管证据，需独立回放与交互仿真验收。"
  },
  "lessons": {
    "foundation": {
      "title": "IQL：从两点expectile到日志内策略改进",
      "minutes": 35,
      "prerequisites": "理解11月27日CQL与Bellman备份，能读均值、平方误差和张量[B]。",
      "connection": "承接CQL的候选悲观路线，比较IQL日志内优选；衔接11月29日offline-to-online。",
      "intro": "IQL：从两点expectile到日志内策略改进：本日围绕可手算的目标、真实调用链和可反驳诊断展开。",
      "outcomes": [
        "expectile的机制与限制",
        "不对称平方的数值验算"
      ],
      "sections": [
        {
          "heading": "从CQL候选竞争到日志动作内部选择",
          "body": "昨天CQL需要构造候选动作并修整Q的虚高；今天换一条路径：Q只在日志中的状态动作对上训练。难点是日志混有好坏行为，若只拟合普通均值，就把可改进空间平均掉。IQL增设只看状态的V，用不对称平方误差偏向同一状态下较好的动作价值，再把V向前备份，最后提取加权行为策略。\n\n请先分清随机变量：在状态s固定时，日志动作a的变化给出一组Q(s,a)；V(s)总结这组值。它不是从不同场景中挑最高成功轨迹，也不是把随机转移带来的幸运结果直接当目标。今天产出一个两点expectile算例，明天再讨论离线转在线时哪些分布假设会改变。",
          "sourceIds": [
            "paper",
            "course"
          ]
        },
        {
          "heading": "不对称平方：为什么V被拉向较好动作",
          "body": "令残差u=Q−V，正残差乘τ，负残差乘1−τ。对V求导，每个样本贡献−2w(Q−V)。在残差符号不跨边界的一段区域，令导数和为零即可得到加权均值；符号跨界时权重也改变，所以不能先算一次固定权重再把答案用于任何数据。τ=.5时两边相同，极小点就是均值。\n\n原创例子：同一状态下Q只有0和2，各出现一半；设V在0与2之间。驻点条件是τ(2−V)=(1−τ)V，所以V=2τ。τ=.8时为1.6，两个残差为−1.6与.4，平方损失平均为.32；V=1时损失为.5。因此上expectile会偏向2，却没有直接取最大值。它也不是80%分位数：此离散分布的该分位数是2。",
          "sourceIds": [
            "paper"
          ],
          "formulas": [
            {
              "latex": "L_V=\\mathbb E_D[w_\\tau(u)u^2],\\quad u=\\bar Q(s,a)-V(s),\\quad w_\\tau(u)=\\begin{cases}\\tau&u>0\\\\1-\\tau&u\\leq0\\end{cases}",
              "explanation": "τ在0与1之间且无单位；Q、V以折扣奖励计，损失为奖励平方。上划线Q是固定目标，不向Q反传V损失。"
            }
          ]
        },
        {
          "heading": "动作的优选与环境的幸运必须分离",
          "body": "假设某个动作每次有一半概率得0、一半得2，且没有后续奖励；它的期望价值应为1。若直接对单步回报做τ=.8的不对称拟合，会得到1.6，误把随机好运当作可选择的动作。IQL先用普通Bellman平方误差使Q平均转移随机性，再在状态内的动作Q上用expectile，试图保留两种随机性的区别。\n\n这只是解释算法动机的可控反例，真实神经网络的Q可能仍有误差，有限日志也未必足以估准条件均值。当日志状态几乎从不重复时，V对同状态动作分布的总结依赖函数近似跨样本泛化，不能认为每个状态都有完整动作表。提高τ不能创造未收集动作的后果，过高τ还会更依赖少数偏高Q。",
          "sourceIds": [
            "paper"
          ]
        },
        {
          "heading": "用V备份，再用advantage拟合策略",
          "body": "价值目标是y=r+γmV(s′)，m为可bootstrap标志；真正终止取0，时间上限截断是否取1取决于任务与数据契约。教学例r=.2、γ=.9、V(s′)=1.6，m=1时y=1.64，m=0时y=.2。这个阶段无需调用actor生成下一动作；下一状态的V已经承担日志支持内偏优价值的近似。\n\n策略阶段在日志动作上计算A=Q−V，以exp(βA)提高高优势样本的对数似然权重。β越大越集中，作者实现还封顶100；它不等于增加探索。即便训练从不向Q查询OOD动作，连续策略拟合仍可能输出日志之间或之外的动作，因此闭环成功、恢复、延迟和人工接管仍需独立检验，不能由损失小推断部署可靠。",
          "sourceIds": [
            "src",
            "actor"
          ]
        }
      ],
      "points": [
        "expectile",
        "不对称平方"
      ],
      "codeTitle": "expectile_stationarity.py",
      "code": "import torch\n\ndef expectile(q,v,tau):\n    if q.ndim!=1 or q.numel()==0 or v.ndim!=0 or not 0<tau<1:\n        raise ValueError('need nonempty [B], scalar V, 0<tau<1')\n    if not torch.isfinite(q).all() or not torch.isfinite(v):\n        raise ValueError('nonfinite value')\n    u=q.detach()-v\n    return (torch.where(u>0,tau,1-tau)*u.square()).mean()\nq=torch.tensor([0.,2.],requires_grad=True)\nv=torch.tensor(1.6,requires_grad=True)\nl=expectile(q,v,.8); l.backward()\nassert abs(l.item()-.32)<1e-6 and abs(v.grad.item())<1e-6\nassert q.grad is None\nassert expectile(q,torch.tensor(1.),.8)>l\nassert abs(expectile(q,torch.tensor(1.),.5).item()-.5)<1e-6\nfor tq,tv,t in [(q[:,None],v,.8),(q,v,1.),(q*float('nan'),v,.8)]:\n    try: expectile(tq,tv,t)\n    except ValueError: pass\n    else: raise AssertionError('invalid expectile contract accepted')\nprint('expectile V=1.6, loss=.32, stationary gradient; negative tests passed')\n",
      "codeNotes": [
        "先对目标Q detach，再对V求导；二点分布τ=.8驻点1.6。",
        "测试梯度零、损失和负例；这是固定Q估计而非完整RL训练。"
      ],
      "exercise": {
        "prompt": "对Q=0和2等频分别算τ=.5/.8的V；若这两个值只是同动作随机回报，应怎样估Q？",
        "steps": [
          "先写出形状、单位和手算结果，再运行本课夹具。",
          "改变一个假设并解释偏差；保留负例的异常输出。"
        ],
        "solution": "V分别为1和1.6。后者驻点由.8(2−V)=.2V得出；同动作随机回报的Q应先用普通MSE估均值1，不能直接当成两个可选择动作。"
      },
      "quiz": {
        "question": "80%expectile等于80%分位数吗？为何不能把随机幸运回报直接送进上expectile？",
        "hint": "沿日志支持、梯度与部署证据逐层回答。",
        "reference": "不等于。两点等频例上expectile为1.6而80%分位数为2；expectile依赖残差距离的平方。直接偏好幸运转移会造成乐观，IQL用普通Q备份平均转移随机性，再对同状态日志动作Q做不对称拟合；有限数据和函数近似仍有误差。",
        "keywords": [
          "expectile",
          "不对称平方",
          "转移随机性",
          "日志支持"
        ]
      },
      "sources": [
        {
          "id": "paper",
          "label": "IQL作者论文v1",
          "url": "https://arxiv.org/html/2110.06169v1",
          "reading": "§4.1–4.3：expectile、动作/转移随机性分离与AWR；原始2021-10-12。"
        },
        {
          "id": "course",
          "label": "Berkeley Spring2026 HW5",
          "url": "https://rail.eecs.berkeley.edu/deeprlcourse/static/homeworks/hw5.pdf",
          "reading": "§3 IQL：三损失、OGBench固定数据与参数实验；本课不要求当天跑完完整训练。"
        },
        {
          "id": "src",
          "label": "IQL作者JAX实现",
          "url": "https://github.com/ikostrikov/implicit_q_learning/blob/master/critic.py",
          "reading": "2026-11-23实读master：loss、update_v、update_q；与actor.py:update及learner.py:_update_jit/target_update交叉核对。移动分支非固定版本复现。"
        },
        {
          "id": "actor",
          "label": "作者actor权重",
          "url": "https://github.com/ikostrikov/implicit_q_learning/blob/master/actor.py",
          "reading": "update：temperature乘adv、上限100、日志动作log_prob；learner.py顺序V→actor→Q→target。"
        }
      ]
    },
    "code": {
      "title": "追IQL源码：三次更新与梯度边界",
      "minutes": 40,
      "prerequisites": "理解11月27日CQL与Bellman备份，能读均值、平方误差和张量[B]。",
      "connection": "承接CQL的候选悲观路线，比较IQL日志内优选；衔接11月29日offline-to-online。",
      "intro": "追IQL源码：三次更新与梯度边界：本日围绕可手算的目标、真实调用链和可反驳诊断展开。",
      "outcomes": [
        "梯度边界的机制与限制",
        "bootstrap的数值验算"
      ],
      "sections": [
        {
          "heading": "沿作者入口追更新顺序",
          "body": "真实入口是learner.py的_update_jit：先update_v(target_critic,value)，接着awr_update_actor使用target_critic和new_value，再update_q(critic,new_value)，最后target_update做Polyak平均。论文把策略提取单列，仓库却在每步交错进行；实现解释应写实参，而不是把论文算法框机械贴到源码上。\n\ncritic.py:update_v用batch.actions评价双Q并取minimum，value_net.py把最后的单元素轴squeeze，得到[B]。update_q以同一批next_observations算V，rewards与masks也应为[B]。若把其中一项保留[B,1]，广播后可能变成[B,B]，脚本照样产出loss，却让每条奖励与别人的下一状态相混。",
          "sourceIds": [
            "src",
            "actor"
          ]
        },
        {
          "heading": "梯度边界与两个不同的tau",
          "body": "作者JAX把q放在value_loss_fn闭包外，apply_gradient只更新value_params；update_q也只对critic_params求导。移植到PyTorch时要显式detach目标，否则表面相同的loss可能把V损失传给Q，把Q损失传给V。下面夹具用独立叶子张量核对梯度，不运行作者JAX训练器。\n\nlearner.py的tau默认.005用于target_update，新目标为.005乘新Q参数加.995乘旧目标；expectile默认.8是另一参数。两者同用希腊字母的习惯不能变成一个配置。actor.py的temperature则直接乘(Q−V)，不是除法温度；读公式时本课用β命名这个逆温度，避免误把数值倒置。",
          "sourceIds": [
            "src",
            "actor"
          ]
        },
        {
          "heading": "最小更新夹具的输入、输出和简化",
          "body": "代码输入q1/q2为日志动作双Q的[B]，v为当前状态V，[B]的next_v给Bellman目标，logp为日志动作的联合对数概率。expectile分支固定目标Q；actor分支固定优势；Q分支固定下一状态V。为直观隔离梯度，三项分别backward并检查哪些叶子收到梯度，不模拟共享encoder或优化器步进。\n\n本例不含策略分布、网络、replay、目标软更新、奖励变换与时间截断转换，不能当成完整IQL复现。正确输入测试给定V后的损失、bootstrap和权重；负例对空批、错轴、非有限与错误mask直接拒绝。动作维度上的log概率必须先求联合值，不能把[B,A]直接乘[B]优势后靠广播猜含义。",
          "sourceIds": [
            "src",
            "actor"
          ]
        },
        {
          "heading": "权重饱和与数值实现差异",
          "body": "对A=(-1,0,1)、β=1，权重为(.367879,1,2.718282)；若三个logp均为−1，actor loss约1.362054。把A设1000时，先exp再clip可能先溢出；本教学夹具对βA先上限log100再exp，使最终权重相同且不生成正向无穷，参数必须有限且β非负。\n\n上限100保留作者的绝对权重定义，不在批内归一化。若改成除以权重和，优化步长尺度会改变；若同一状态所有A平移常数，未饱和时权重整体缩放，而饱和后连相对比例也会变。逐段检查的意义是知道自己改了哪条契约，不把“都能收敛”当作实现等价证据。",
          "sourceIds": [
            "actor"
          ]
        }
      ],
      "points": [
        "梯度边界",
        "bootstrap"
      ],
      "codeTitle": "iql_gradient_contract.py",
      "code": "import math\nimport torch\n\ndef losses(q1,q2,v,nv,r,m,lp,tau=.8,beta=1.):\n    ts=(q1,q2,v,nv,r,m,lp)\n    if any(t.ndim!=1 or t.shape!=v.shape or t.numel()==0 for t in ts):\n        raise ValueError('all fields must be the same nonempty [B]')\n    if not all(torch.isfinite(t).all() for t in ts) or not 0<tau<1 or not math.isfinite(beta) or beta<0:\n        raise ValueError('invalid value or parameter')\n    if not ((m==0)|(m==1)).all(): raise ValueError('invalid bootstrap mask')\n    q=torch.minimum(q1,q2).detach()\n    u=q-v\n    lv=(torch.where(u>0,tau,1-tau)*u.square()).mean()\n    y=(r+.9*m*nv).detach()\n    lq=((q1-y).square()+(q2-y).square()).mean()\n    w=torch.exp(torch.clamp(beta*(q-v.detach()),max=math.log(100.)))\n    la=-(w*lp).mean()\n    return lv,lq,la,y,w\nleaf=lambda xs: torch.tensor(xs,requires_grad=True)\na=leaf([0.,2.]); b=leaf([0.,2.]); v=leaf([1.,1.]); nv=leaf([1.6,1.6]); lp=leaf([-1.,-1.])\nr=torch.tensor([.2,.2]); m=torch.tensor([1.,0.])\nlv,lq,la,y,w=losses(a,b,v,nv,r,m,lp)\nassert torch.allclose(y,torch.tensor([1.64,.2]))\nlv.backward(); assert a.grad is None and v.grad is not None\nv.grad=None\nla.backward(); assert lp.grad is not None and v.grad is None and a.grad is None\nlq.backward(); assert a.grad is not None and nv.grad is None\nassert torch.allclose(w,torch.exp(torch.tensor([-1.,1.])))\nassert abs(la.item()-(math.exp(-1)+math.exp(1))/2)<1e-6\nassert losses(a,b,v,nv,r,m,lp,beta=1000)[4].isfinite().all()\nfor badm,badlp in [(m[:,None],lp),(m,lp*float('nan')),(m+.5,lp)]:\n    try: losses(a,b,v,nv,r,badm,badlp)\n    except ValueError: pass\n    else: raise AssertionError('invalid batch accepted')\nprint('IQL detach boundaries, masks, weights and invalid inputs passed')\n",
      "codeNotes": [
        "返回lv/lq/la三项；只用合成[B]标量，省略网络与优化器。",
        "分别backward核梯度，不用loss数值相同代替计算图一致；权重上限前移只为数值稳定。"
      ],
      "exercise": {
        "prompt": "把next_v的detach去掉再执行Q损失反传；说明作者temperature=.1与β=10是否相同。",
        "steps": [
          "先写出形状、单位和手算结果，再运行本课夹具。",
          "改变一个假设并解释偏差；保留负例的异常输出。"
        ],
        "solution": "去掉detach会让next_v收到Q损失梯度，破坏固定target契约。作者temperature乘优势，.1与10不是同一权重；A=1时分别exp(.1)和exp(10)且后者触发100上限。"
      },
      "quiz": {
        "question": "[B,1]的mask为何危险？作者更新顺序与两个tau分别是什么？",
        "hint": "沿日志支持、梯度与部署证据逐层回答。",
        "reference": "[B]奖励与[B,1]mask可广播成[B,B]，混合不同transition。作者_update_jit按V、actor、Q、target执行，actor使用new_value和target_critic；expectile控制非对称权重，target tau控制Polyak更新。Q/V/actor目标分别固定，作者temperature乘优势且权重封顶100。",
        "keywords": [
          "梯度边界",
          "bootstrap",
          "逆温度",
          "更新顺序"
        ]
      },
      "sources": [
        {
          "id": "src",
          "label": "IQL作者JAX实现",
          "url": "https://github.com/ikostrikov/implicit_q_learning/blob/master/critic.py",
          "reading": "2026-11-23实读master：loss、update_v、update_q；与actor.py:update及learner.py:_update_jit/target_update交叉核对。移动分支非固定版本复现。"
        },
        {
          "id": "actor",
          "label": "作者actor权重",
          "url": "https://github.com/ikostrikov/implicit_q_learning/blob/master/actor.py",
          "reading": "update：temperature乘adv、上限100、日志动作log_prob；learner.py顺序V→actor→Q→target。"
        },
        {
          "id": "paper",
          "label": "IQL作者论文v1",
          "url": "https://arxiv.org/html/2110.06169v1",
          "reading": "§4.1–4.3：expectile、动作/转移随机性分离与AWR；原始2021-10-12。"
        }
      ]
    },
    "insight": {
      "title": "IQL数据路线：RAW辨识与优势权重集中",
      "minutes": 25,
      "prerequisites": "理解11月27日CQL与Bellman备份，能读均值、平方误差和张量[B]。",
      "connection": "承接CQL的候选悲观路线，比较IQL日志内优选；衔接11月29日offline-to-online。",
      "intro": "IQL数据路线：RAW辨识与优势权重集中：本日围绕可手算的目标、真实调用链和可反驳诊断展开。",
      "outcomes": [
        "权重集中的机制与限制",
        "有效样本量的数值验算"
      ],
      "sections": [
        {
          "heading": "省掉候选搜索，成本转移到日志覆盖",
          "body": "IQL不为critic显式搜索OOD候选，能省去CQL的候选评价和密度修正；代价是日志支持和V条件泛化变得关键。若日志只有一类平稳成功动作，同一状态几乎没有行为差异，优势排序可利用的信息很少；即使上expectile很高，也不会出现没有记录过的失败恢复技能。\n\n个人预算先用Mac执行损失夹具，再在租用GPU时冻结视觉encoder，固定同一日志比较BC与IQL；统计按轨迹拆分，避免相邻帧泄漏。4090是否够用要根据实际encoder、batch和图像尺寸测峰值显存，今天没有训练吞吐实测，不能用这个CPU例子推断视觉IQL的成本。",
          "sourceIds": [
            "course",
            "src"
          ]
        },
        {
          "heading": "用有效样本量诊断优势权重塌缩",
          "body": "RAW可能减少反光和曝光造成的状态别名，但更清晰的输入也可能让critic更自信地拟合错误奖励。先在曝光层内画A分布和权重上限命中率，再看策略成功。若权重几乎都集中在一条轨迹，名义上十万帧也可能没有多少独立有效经验，重复帧不能当十万次试验。\n\n原创例：四条日志权重(1,1,1,9)，权重和12、平方和84，有效样本量144/84约1.714。四条等权时为4。该量只诊断集中度，不是置信区间的独立样本数，更不能自动决定最优β。比较RAW/RGB时固定轨迹、动作、奖励、τ与β，另报反光层恢复率及固定评测权重总体。",
          "sourceIds": [
            "actor"
          ],
          "formulas": [
            {
              "latex": "N_{\\rm eff}=\\frac{(\\sum_i w_i)^2}{\\sum_i w_i^2}",
              "explanation": "w是无单位非负训练权重，至少一个大于0；N_eff是集中度诊断，相关轨迹仍不满足独立试验假设。"
            }
          ]
        },
        {
          "heading": "双团队给任务、环境和预测，不直接给Q",
          "body": "StanfordVL BEHAVIOR/OmniGibson的输入是任务描述、对象与环境状态，目标谓词可定义仿真成功；动作由仿真控制器执行并产生下一观测。World Labs R2S2R输入真实场景并构建仿真变体，价值在环境扩展，两者都不会直接提供SO-101的可信IQL回报。日志还要记录模拟器、场景、控制频率和奖励版本，分清真机与合成来源。\n\nMeta/FAIR V-JEPA 2-AC在视频表征上引入动作条件，利用目标图代价作规划；这不是Q的长期奖励目标。AMI当前公开方向强调表征预测和安全约束，不应写成已发布IQL基准。对你的传感器背景，可测试冻结表示后曝光扰动是否改变优势排序，再以交互仿真核对；latent误差低只能支持表示层结论。",
          "sourceIds": [
            "behavior",
            "world",
            "meta",
            "ami"
          ]
        },
        {
          "heading": "Agent技能选择的权重不能当执行许可",
          "body": "高层Agent若根据IQL式技能价值选取技能，输入应包括当前观测、任务阶段与技能历史；下游VLA或控制器执行参数化动作，回流观测用于更新阶段、诊断失败和决定接管。技能持续时间不同还要处理折扣时长，不能把每次技能调用都冒充相同长度的一步动作；今天没有这样的闭环运行结果。\n\n最终离线报告应同时列数据覆盖、权重集中度、held-out动作似然，再单列仿真成功、P95延迟、恢复和人工接管，不能用“不查询OOD”取代这些证据。11月29日离线转在线会改变状态分布和replay构成，因此今天先保留数据版本与基线快照；真实SO-101的执行决策不由本自动备课任务触发。",
          "sourceIds": [
            "course",
            "meta"
          ]
        }
      ],
      "points": [
        "权重集中",
        "有效样本量"
      ],
      "codeTitle": "iql_effective_weights.py",
      "code": "import math\n\ndef ess(weights):\n    if not weights or not all(math.isfinite(w) and w>=0 for w in weights) or sum(weights)==0:\n        raise ValueError('need finite nonnegative weights with positive total')\n    return sum(weights)**2/sum(w*w for w in weights)\nassert math.isclose(ess([1.,1.,1.,9.]),12/7)\nassert math.isclose(ess([1.,1.,1.,1.]),4)\nassert math.isclose(ess([2.,2.,2.,18.]),12/7)\nfor bad in ([0.,0.],[-1.,2.],[float('nan'),1.]):\n    try: ess(bad)\n    except ValueError: pass\n    else: raise AssertionError('invalid weights accepted')\nprint('concentrated ESS=12/7; uniform=4; scale invariance passed')\n",
      "codeNotes": [
        "有效样本量只衡量权重集中，不证明数据独立或成功率。",
        "倍乘权重结果不变，负例拒绝全零、负数和NaN。"
      ],
      "exercise": {
        "prompt": "比较四条等权与1/1/1/9，提出固定日志的RAW消融及失败标准。",
        "steps": [
          "先写出形状、单位和手算结果，再运行本课夹具。",
          "改变一个假设并解释偏差；保留负例的异常输出。"
        ],
        "solution": "等权ESS=4，集中权重为144/84=12/7。固定轨迹、奖励、动作和超参，仅换表示；若反光层排序稳定却闭环无改善，只能报告表示诊断收益，不能宣称控制提升。"
      },
      "quiz": {
        "question": "没有显式查询OOD，为什么高权重日志仍可能造成部署失败？ESS能当独立试验数吗？",
        "hint": "沿日志支持、梯度与部署证据逐层回答。",
        "reference": "策略函数近似可产生支持外动作，Q误差与状态别名也可能放大少量错误日志。ESS只度量权重集中，相关帧和同轨迹不独立。RAW需要固定拆分与参数消融，仿真/真机成功、恢复、接管与延迟另测；双团队的环境和表征证据不能替代IQL闭环验收。",
        "keywords": [
          "权重集中",
          "有效样本量",
          "状态别名",
          "独立评测"
        ]
      },
      "sources": [
        {
          "id": "course",
          "label": "Berkeley Spring2026 HW5",
          "url": "https://rail.eecs.berkeley.edu/deeprlcourse/static/homeworks/hw5.pdf",
          "reading": "§3 IQL：三损失、OGBench固定数据与参数实验；本课不要求当天跑完完整训练。"
        },
        {
          "id": "src",
          "label": "IQL作者JAX实现",
          "url": "https://github.com/ikostrikov/implicit_q_learning/blob/master/critic.py",
          "reading": "2026-11-23实读master：loss、update_v、update_q；与actor.py:update及learner.py:_update_jit/target_update交叉核对。移动分支非固定版本复现。"
        },
        {
          "id": "actor",
          "label": "作者actor权重",
          "url": "https://github.com/ikostrikov/implicit_q_learning/blob/master/actor.py",
          "reading": "update：temperature乘adv、上限100、日志动作log_prob；learner.py顺序V→actor→Q→target。"
        },
        {
          "id": "behavior",
          "label": "StanfordVL BEHAVIOR",
          "url": "https://behavior.stanford.edu/challenge/updates.html",
          "reading": "任务、数据和评测版本入口；与World Labs生成环境分开归属。"
        },
        {
          "id": "world",
          "label": "World Labs R2S2R",
          "url": "https://worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "2026-07-28场景重建、可控变体、训练/评测；不是IQL结果。"
        },
        {
          "id": "meta",
          "label": "Meta/FAIR V-JEPA 2",
          "url": "https://ai.meta.com/research/vjepa/",
          "reading": "Planning for robotic control：视频表征、62小时DROID动作条件训练与目标图规划。"
        },
        {
          "id": "ami",
          "label": "AMI Labs",
          "url": "https://amilabs.xyz/",
          "reading": "表征空间预测和动作条件规划方向；无日期的新愿景不算实测模型。"
        }
      ]
    }
  }
};
