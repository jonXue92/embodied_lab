import type { AuthoredDay } from './types';

export const day88: AuthoredDay = {
  "reviewedAt": "2026-11-22",
  "revision": "逐课编写 1.0",
  "deliverable": "CQL梯度表、密度修正夹具和RAW分层反转报告；35+40+25=100分钟。",
  "question": {
    "title": "CQL惩罚下降且反光层改善，为什么总体成功仍可能落后？候选数翻倍又会影响哪项诊断？",
    "summary": "把保守梯度、积分归一化和分层评测连起来。",
    "keywords": [
      "日志动作",
      "logsumexp",
      "候选数",
      "分层",
      "独立评测"
    ],
    "reference": "惩罚只约束估值相对地形，不能证明真实回报更高。给定普通/反光两层，CQL相对BC差为−.1+.4w，反光10%时落后6个百分点，等权领先10个百分点。样本复制时归一化积分不变，未减logN的实现损失增加log2，固定系数下Q梯度不变但Lagrange gap数值会变。应固定协议、候选提议与采样预算，再以独立闭环成功、延迟、介入和恢复评测。"
  },
  "lessons": {
    "foundation": {
      "title": "CQL：用相对悲观修整Q的虚假高峰",
      "minutes": 35,
      "prerequisites": "已学11月25日OOD高估与11月26日行为正则，能读softmax、期望和PyTorch张量轴。",
      "connection": "本课承接行为约束；11月28日学习IQL，比较不显式评价OOD候选的路线。",
      "intro": "CQL：用相对悲观修整Q的虚假高峰：按推导、源码与可反驳实验建立证据。",
      "outcomes": [
        "日志频率机制解释",
        "softmax检验与反例"
      ],
      "sections": [
        {
          "heading": "从限制策略转向修整价值地形",
          "body": "11月26日用行为距离约束actor，但critic在未见动作处仍可能制造虚假高峰。今天沿用同一份固定日志，不增加交互；CQL把约束放进价值学习目标，使高估的候选动作付出代价。先把状态固定在一个抓取前画面，比较三个离散候选：左绕、右绕、直接穿过。候选集是教学枚举，不是机械臂真实的连续控制空间。\n\n设日志只记录动作0，Q向量为(1,1,3)。Bellman拟合只看日志行时，动作2的3可能完全没有受到监督。保守项把所有候选放入一个平滑最大值，再减去日志动作的估值；这样同时形成竞争与锚定，而不是给所有动作统一减去一个常数。它不能凭空知道穿过动作的真实后果，只是在缺证据时减少乐观利用。",
          "sourceIds": [
            "paper"
          ]
        },
        {
          "heading": "从熵对偶到可手算的梯度",
          "body": "在有限动作空间，令μ为动作概率分布，最大化μ加权的Q与温度τ乘熵之和。在概率和为1的约束下，对μ求导，可得到μ正比于exp(Q/τ)；代回目标便是τ logsumexp(Q/τ)。因此平滑最大值会把更多梯度放在当前高Q动作，不是只惩罚均匀采样的平均值。\n\n减去日志分布加权Q后，惩罚对每个Q分量的导数为softmax减日志频率。取τ=1、日志全为动作0，Q=(1,1,3)，softmax约为(.106507,.106507,.786986)，梯度是(−.893493,.106507,.786986)。梯度下降会抬高动作0、压低动作1和2；高估峰受到最强下压，但Bellman项会同时约束日志动作不要无限上升。",
          "sourceIds": [
            "paper"
          ],
          "formulas": [
            {
              "latex": "R_\\tau(Q)=\\tau\\log\\sum_a e^{Q_a/\\tau}-\\sum_a b_aQ_a,\\quad \\frac{\\partial R_\\tau}{\\partial Q_a}=\\operatorname{softmax}(Q/\\tau)_a-b_a",
              "explanation": "Q以折扣奖励单位计，b是当前状态日志动作频率且和为1；τ为同尺度正温度。总critic目标另加αR，α不是SAC熵温度。"
            }
          ]
        },
        {
          "heading": "平移不变性与下界的适用对象",
          "body": "上述Q向量的保守项约为2.239545，若所有Q加上常数100，logsumexp和日志均值都增加100，差保持不变。这是检查实现的重要性质：如果漏了减日志Q，统一抬高全部估值就会改变惩罚。日志动作频率总和错误也会破坏这一性质，因此频率归一化是数学契约而非画图细节。\n\n原论文区分只压Q的目标与压候选、抬日志的较紧目标。后者相关定理是策略平均价值的下界，依赖采样误差、系数、支持与函数近似条件，不能说每个动作都被正确低估。有限神经网络训练中，保守损失下降更不能直接证明真实成功率上升；还需要独立固定评测来检验，尤其不能把悲观估值当作碰撞概率。",
          "sourceIds": [
            "paper"
          ]
        },
        {
          "heading": "连续动作的积分与保守过头",
          "body": "连续动作不能把无限候选直接求和。若用提议分布p采样，指数积分可以用exp(Q)/p的样本均值估计；在温度1时进入logsumexp的是Q−log p。漏掉密度修正会让采样器最常访问的位置显得更重要。有限样本的对数估计有偏，遗漏窄高峰也是现实风险，不能把增加几次采样称为穷尽整个动作空间。\n\nα过大可能压低未被记录但确实有用的动作，造成策略过分留在旧行为附近；α过小则可能留下高估。对大量次优但有覆盖的混合日志，价值排序有改进空间；对极窄单一路径日志，保守学习仍缺少恢复行为的后果。明天IQL会绕开显式OOD动作查询，今天只交付惩罚和梯度的解释，不提前扩展成完整算法实现。",
          "sourceIds": [
            "paper"
          ]
        }
      ],
      "points": [
        "日志频率",
        "softmax"
      ],
      "codeTitle": "cql_gradient.py",
      "code": "import math\nq=[1.,1.,3.]; b=[1.,0.,0.]\nm=max(q); z=sum(math.exp(x-m) for x in q)\nr=m+math.log(z)-sum(x*y for x,y in zip(b,q))\np=[math.exp(x-m)/z for x in q]\ng=[x-y for x,y in zip(p,b)]\nassert math.isclose(r,2.2395447662218846)\nassert g[0]<0 and g[1]>0 and g[2]>0\nassert math.isclose(sum(g),0.,abs_tol=1e-12)\ndef penalty(v,b):\n    if len(v)!=len(b) or not math.isclose(sum(b),1.) or min(b)<0:\n        raise ValueError('invalid behavior weights')\n    m=max(v)\n    return m+math.log(sum(math.exp(x-m) for x in v))-sum(x*y for x,y in zip(v,b))\nassert math.isclose(penalty([x+100 for x in q],b),r)\ntry: penalty(q,[1.,1.,0.])\nexcept ValueError: pass\nelse: raise AssertionError('unnormalized weights accepted')\nprint(r,g)\n",
      "codeNotes": [
        "稳定logsumexp先减最大值，避免指数溢出。",
        "负例拒绝频率不归一化；本例是有限候选局部梯度，不是训练策略。"
      ],
      "exercise": {
        "prompt": "计算(1,1,3)与单一日志动作的三个梯度，并解释漏减日志Q的后果。",
        "steps": [
          "先手算本课给定条件，再执行夹具核对数值。",
          "写明假设如何改变结论，并保留一个故意失败的输入。"
        ],
        "solution": "惩罚2.239545，梯度约−.893493、.106507、.786986；漏减日志Q后梯度和为1，整体平移不再抵消，不能保持相对锚定。"
      },
      "quiz": {
        "question": "日志动作也在候选集中，CQL为何还能抬高它？Q整体加100会发生什么？",
        "hint": "说明所用分布、张量轴和结论边界。",
        "reference": "softmax项对每个候选给正梯度，减日志均值对日志动作给负梯度，二者相加可使日志动作净梯度为负，梯度下降便抬高它。频率归一化后整体加常数在两项中抵消。总训练还有Bellman误差，平均价值下界依赖条件，不能断言所有动作估值都低于真实值。",
        "keywords": [
          "日志频率",
          "softmax",
          "平移不变",
          "平均下界"
        ]
      },
      "sources": [
        {
          "id": "paper",
          "label": "CQL原论文v3",
          "url": "https://arxiv.org/html/2006.04779v3",
          "reading": "§3.1 Eq2与Theorem3.2的平均下界条件；§3.2 Eq4熵正则；§4连续动作采样。"
        },
        {
          "id": "course",
          "label": "Berkeley Spring2026 HW5",
          "url": "https://rail.eecs.berkeley.edu/deeprlcourse/static/homeworks/hw5.pdf",
          "reading": "§1–2以OGBench固定数据和SAC+BC作对照；课程并不要求实现CQL，本日推导和夹具为另行原创。"
        }
      ]
    },
    "code": {
      "title": "读CQLTrainer：候选轴、密度与gap基准",
      "minutes": 40,
      "prerequisites": "已学11月25日OOD高估与11月26日行为正则，能读softmax、期望和PyTorch张量轴。",
      "connection": "本课承接行为约束；11月28日学习IQL，比较不显式评价OOD候选的路线。",
      "intro": "读CQLTrainer：候选轴、密度与gap基准：按推导、源码与可反驳实验建立证据。",
      "outcomes": [
        "当前状态机制解释",
        "候选轴检验与反例"
      ],
      "sections": [
        {
          "heading": "真实入口：先找到Bellman项再找新增项",
          "body": "作者实现位于d4rl/rlkit/torch/sac/cql.py的CQLTrainer.train_from_torch。batch含observations、actions、rewards、terminals和next_observations；q1_pred在日志动作上求值，q_target由奖励和下一状态target Q构成并detach，再计算均方误差。先理解这条数据链，才能辨认后来追加的min_qf_loss究竟改了哪个网络。\n\n_get_policy_actions把每个观测复制N次后展平成[B×N,S]，策略返回动作和log概率；_get_tensor_values再把critic输出还原[B,N,1]。B是日志状态批次，N是候选数，最后的1是标量Q。若把N轴误当batch平均，就会失去同一状态内部的候选竞争，即使输出仍是标量也已经改变目标。",
          "sourceIds": [
            "src"
          ]
        },
        {
          "heading": "最容易看错的下一状态采样动作",
          "body": "实现分别从当前状态策略和下一状态策略采样候选；但q1_next_actions调用_get_tensor_values时传入的是obs，而不是next_obs。它的含义是把来自π(·|s′)的动作作为另一种提议，在当前状态s上评价Q；它不是Bellman下一状态价值。这个命名陷阱值得沿实参读一遍，不要从变量名推断时间语义。\n\nmin_q_version=3分支拼接随机动作、下一状态策略动作和当前策略动作三组经过log密度修正的Q。随机动作均匀取自归一化区间[−1,1]^d，log密度是−d log2；两组策略log概率detach。随机动作的维度与动作归一化若变化，密度也须同步；关节顺序正确仍不意味着单位、界限和概率密度已经一致。",
          "sourceIds": [
            "src"
          ]
        },
        {
          "heading": "教学夹具只验证一个候选积分",
          "body": "下面的原创PyTorch程序把输入明确拆为[B,N]的候选Q和log密度，以及[B]的日志动作Q，固定温度1。它用logsumexp再减logN形成样本均值的对数，最后减去日志均值。作者分支没有减logN；固定N且固定系数时这是常数，不影响Q梯度，但会改变显示的损失以及自适应gap约束的数值基准。\n\n程序没有actor、目标网络、终止处理、双Q、环境或自适应乘子，不是作者CQL训练器的替代品。正常测试使用均匀区间内的两个候选，积分为2e，日志Q为1时惩罚为log2；负例故意传错log密度形状，另测NaN和没有候选。所有值在CPU内存中产生，既不下载数据也不发送机器人动作。",
          "sourceIds": [
            "src"
          ]
        },
        {
          "heading": "密度detach与候选复制的回归",
          "body": "梯度测试令两个候选Q都为1，验证每个候选获得.5的梯度、日志Q获得−1；log密度虽设requires_grad，也必须没有梯度。这样检验的是固定提议分布下的critic更新契约。真实训练还须控制候选动作是否携带actor梯度，本夹具直接输入Q，不能据此证明上游完整优化图正确。\n\n再把每个候选原样复制一次，归一化积分估计应保持不变；作者未归一化logsumexp则会增加log2。这个差异对固定惩罚权重的Q更新不产生影响，却会影响with_lagrange中的target_action_gap对齐。读源码时还要区分alpha熵系数与alpha_prime保守乘子，不能用一次loss相同来代替梯度和配置核对。\n\n当日固定提交81c3302的Newton更新提醒我们：求解器内部历史非有限时，公开body状态仍可能有限。故障行清reward/final_obs必须配合solver_fault终止和原始故障标签；清零不是可信接触样本，应从离线训练准入中单独审计。该GPU回归是上游作者报告，本课只执行张量夹具。",
          "sourceIds": [
            "src",
            "newton"
          ]
        }
      ],
      "points": [
        "当前状态",
        "候选轴"
      ],
      "codeTitle": "cql_integral.py",
      "code": "import math\nimport torch\n\ndef sampled_penalty(q,logp,dataq):\n    if q.ndim!=2 or q.shape!=logp.shape or dataq.shape!=(q.shape[0],) or q.shape[1]==0:\n        raise ValueError('expected [B,N], [B,N], [B] with N>0')\n    if not all(torch.isfinite(t).all() for t in (q,logp,dataq)):\n        raise ValueError('nonfinite input')\n    return (torch.logsumexp(q-logp.detach(),dim=1)-math.log(q.shape[1])-dataq).mean()\nq=torch.tensor([[1.,1.]],requires_grad=True)\nlp=torch.full_like(q,-math.log(2),requires_grad=True)\nd=torch.tensor([1.],requires_grad=True)\nr=sampled_penalty(q,lp,d)\nassert math.isclose(r.item(),math.log(2),abs_tol=1e-6)\nr.backward()\nassert torch.allclose(q.grad,torch.full_like(q,.5))\nassert torch.allclose(d.grad,torch.tensor([-1.])) and lp.grad is None\nassert torch.allclose(sampled_penalty(q.repeat_interleave(2,1),lp.repeat_interleave(2,1),d),r)\nfor badq,badp,badd in [(q,lp[:,:1],d),(q*float('nan'),lp,d),(q[:,:0],lp[:,:0],d)]:\n    try: sampled_penalty(badq,badp,badd)\n    except ValueError: pass\n    else: raise AssertionError('bad candidate contract accepted')\nprint('density correction, gradients, duplication and negative cases passed')\n",
      "codeNotes": [
        "q与logp为[B,N]；dataq为[B]，拒绝广播掩盖输入错误。",
        "重复候选测试锁定归一化定义；负例覆盖shape、空候选和NaN。"
      ],
      "exercise": {
        "prompt": "删去密度修正并重复梯度测试，说明loss与梯度分别如何变化。",
        "steps": [
          "先手算本课给定条件，再执行夹具核对数值。",
          "写明假设如何改变结论，并保留一个故意失败的输入。"
        ],
        "solution": "均匀密度例删去−logp后惩罚由log2变为0，候选梯度仍各.5；这仅因本例密度相同，非均匀提议会改变候选权重，不能泛化为密度修正无用。"
      },
      "quiz": {
        "question": "q1_next_actions为什么仍以obs求Q？复制候选后哪种loss会增加log2？",
        "hint": "说明所用分布、张量轴和结论边界。",
        "reference": "动作从下一状态策略采样，但作为提议在当前状态评价Q，因此不是Bellman target。未归一化logsumexp复制候选增加log2；减logN的样本均值版本不变。固定系数的Q梯度相同，自适应gap却必须同步基准。log密度detach固定提议，不把critic惩罚误传入密度参数。",
        "keywords": [
          "当前状态",
          "候选轴",
          "密度修正",
          "detach",
          "gap"
        ]
      },
      "sources": [
        {
          "id": "src",
          "label": "作者CQL实现",
          "url": "https://github.com/aviralkumar2907/CQL/blob/master/d4rl/rlkit/torch/sac/cql.py",
          "reading": "2026-11-22实读master：CQLTrainer.train_from_torch、_get_policy_actions、_get_tensor_values；min_q_version=3、min_q_weight、temp与with_lagrange分支。移动分支未宣称固定版本复现。"
        },
        {
          "id": "paper",
          "label": "CQL原论文v3",
          "url": "https://arxiv.org/html/2006.04779v3",
          "reading": "§3.1 Eq2与Theorem3.2的平均下界条件；§3.2 Eq4熵正则；§4连续动作采样。"
        },
        {
          "id": "newton",
          "label": "Isaac Lab Newton故障补丁",
          "url": "https://github.com/isaac-sim/IsaacLab/commit/81c33022e9d2b7bd73576f40fabcfc657f589616",
          "reading": "固定81c33022：envs/mdp/terminations.py、rewards.py、events.py，故障检测与reset顺序。"
        }
      ]
    },
    "insight": {
      "title": "悲观估计选数据：覆盖、RAW与评测权重",
      "minutes": 25,
      "prerequisites": "已学11月25日OOD高估与11月26日行为正则，能读softmax、期望和PyTorch张量轴。",
      "connection": "本课承接行为约束；11月28日学习IQL，比较不显式评价OOD候选的路线。",
      "intro": "悲观估计选数据：覆盖、RAW与评测权重：按推导、源码与可反驳实验建立证据。",
      "outcomes": [
        "分层权重机制解释",
        "动作后果检验与反例"
      ],
      "sections": [
        {
          "heading": "哪些数据适合用悲观价值排序",
          "body": "收益来自日志里已经包含可比较的动作后果：同类状态下既有成功也有失败，多种动作有不同回报，CQL可以在不过分追逐虚构峰值的前提下学习排序。代价是候选采样、双critic与尺度调参的额外成本；相较昨天actor行为惩罚，今天把更多复杂性移到价值估计器。个人Mac可跑本课张量夹具，4090预算先用于小表示和固定日志，不能据此估算完整视觉CQL吞吐。\n\n极窄成功演示没有失败后果，过强悲观会抑制未见的恢复动作；随机混入失败也不一定有益，若奖励标签或终止观测错误，critic会学习错误因果。本课建议先冻结encoder并用同一日志对比BC、行为正则与CQL的小规模离线结果，预先固定评测协议；这只是个人实验设计，未宣称任何方法已在你的SO-101上胜出。",
          "sourceIds": [
            "paper",
            "course"
          ]
        },
        {
          "heading": "RAW能改善条件辨识，不能补出反事实",
          "body": "你的传感器经验能用于构造曝光、反光和运动模糊分层。如果RGB把不同接触前状态混在一起，critic会看到相互冲突的回报；RAW或更准确时间对齐可能减少观测别名。但同一状态下没有执行过的动作仍然缺少后果，保守项不会因为图像动态范围提高就自动获得反事实监督。\n\n原创教学诊断采用两个状态层：普通光照与反光。若BC成功率分别为.8和.2，CQL为.7和.5，等权总体是.5与.6；若测试只含10%反光，则BC=.74，CQL=.68。总体胜负随混合比例改变，所以要同时报告各层成功、恢复和介入，而不是挑有利总体。数据按轨迹和场景拆分，RAW/RGB比较保持动作日志、奖励及评测权重一致。",
          "sourceIds": [
            "paper"
          ],
          "formulas": [
            {
              "latex": "S(w)=(1-w)S_{\\rm normal}+wS_{\\rm glare},\\quad S_{\\rm CQL}-S_{\\rm BC}=-0.1+0.4w",
              "explanation": "S为成功比例，w是反光层权重且在0到1之间；交点w=.25。数值完全为教学假设，不是机器人实测或统计显著性结论。"
            }
          ]
        },
        {
          "heading": "双团队分别补什么证据",
          "body": "StanfordVL的BEHAVIOR/OmniGibson提供任务、物体状态和交互仿真，可用于定义可审计成功条件；World Labs的R2S2R从真实场景构建仿真及变体，提供环境扩增路线。若将其轨迹用于离线RL，要保存场景和动力学版本、动作接口、终止与奖励身份。视觉上像真实世界，并不能证明接触回报可信，生成数据也不应不加标记混入真机数据。\n\nMeta/FAIR的V-JEPA 2-AC用动作条件预测与目标图代价规划，输出是规划依据，不等同长期回报Q；AMI Labs当前强调表征空间预测和安全可控的动作条件世界模型，官网方向不当作已交付CQL系统。对SO-101可验证的问题是冻结表征后，Q在曝光层内是否更稳定、闭环成功是否改善；不能只对比latent误差与Q数值就宣称两条路线谁更优。",
          "sourceIds": [
            "behavior",
            "world",
            "meta",
            "ami"
          ]
        },
        {
          "heading": "Agent选择技能也需要独立的执行证据",
          "body": "高层Agent可以选择已有技能，CQL可以评价技能选择的长期回报，但需要把技能ID、参数、持续时间、终止原因和下一观测作为日志契约。下游VLA或控制器执行动作，观测返回后Agent更新状态并决定继续、重规划或请求人工；每一环的延迟、失败与接管都要独立记录。高层价值低不等于底层碰撞风险低，不能让Q代替执行边界。\n\n本日没有实测这样的Agent闭环。AMP1作者项目页展示代码调用感知与运动harness、执行后读回观测，但论文版本早于今日情报窗，仅作后续12月状态机/恢复主题候选，不把通用模型能力宣传算成CQL证据。今天收尾先检查分层权重反转，再准备11月28日expectile，毕业项目保留离线回放和仿真验证优先的顺序。",
          "sourceIds": [
            "meta",
            "ami"
          ]
        }
      ],
      "points": [
        "分层权重",
        "动作后果"
      ],
      "codeTitle": "cql_strata.py",
      "code": "import math\n\ndef score(rates,w):\n    if len(rates)!=2 or not 0<=w<=1 or not all(math.isfinite(x) and 0<=x<=1 for x in rates):\n        raise ValueError('invalid success mixture')\n    return (1-w)*rates[0]+w*rates[1]\nbc=(.8,.2); cql=(.7,.5)\nassert math.isclose(score(cql,.5)-score(bc,.5),.1)\nassert math.isclose(score(cql,.1)-score(bc,.1),-.06)\nassert math.isclose(score(cql,.25),score(bc,.25))\ntry: score(cql,1.2)\nexcept ValueError: pass\nelse: raise AssertionError('invalid mixture accepted')\nprint('equal-weight +10pp; glare10% -6pp; crossing25%')\n",
      "codeNotes": [
        "纯标量成功率混合，不推断统计显著性。",
        "权重越界负例必须拒绝；所有数字为人为示例，未调用设备。"
      ],
      "exercise": {
        "prompt": "求两方法成功率交点，设计一个固定日志的RAW消融。",
        "steps": [
          "先手算本课给定条件，再执行夹具核对数值。",
          "写明假设如何改变结论，并保留一个故意失败的输入。"
        ],
        "solution": "交点w=.25。冻结数据拆分、奖励与动作单位，仅变RGB/RAW表示；报告普通和反光各层结果及固定权重总体，另记介入、恢复和时延。没有真机数据时只报告离线/仿真结论。"
      },
      "quiz": {
        "question": "反光层CQL优于BC，能否据此宣布总体胜出并降低SO-101介入预算？",
        "hint": "说明所用分布、张量轴和结论边界。",
        "reference": "不能。两层差值依赖w，普通层损失可能抵消反光层收益；例中w=.1时总体落后6个百分点。RAW缓解观测别名仍不能补出未见动作后果。需要预先固定分层、数据身份和独立评测，介入及延迟单独报告，不能把Q悲观或局部成功当作真机安全证据。",
        "keywords": [
          "分层权重",
          "动作后果",
          "观测别名",
          "独立评测"
        ]
      },
      "sources": [
        {
          "id": "paper",
          "label": "CQL原论文v3",
          "url": "https://arxiv.org/html/2006.04779v3",
          "reading": "§3.1 Eq2与Theorem3.2的平均下界条件；§3.2 Eq4熵正则；§4连续动作采样。"
        },
        {
          "id": "course",
          "label": "Berkeley Spring2026 HW5",
          "url": "https://rail.eecs.berkeley.edu/deeprlcourse/static/homeworks/hw5.pdf",
          "reading": "§1–2以OGBench固定数据和SAC+BC作对照；课程并不要求实现CQL，本日推导和夹具为另行原创。"
        },
        {
          "id": "behavior",
          "label": "StanfordVL BEHAVIOR评测",
          "url": "https://behavior.stanford.edu/challenge/updates.html",
          "reading": "任务/数据版本与评测入口；StanfordVL的仿真任务定义不等于World Labs生成场景。"
        },
        {
          "id": "world",
          "label": "World Labs R2S2R",
          "url": "https://worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "2026-07-28文章：真实场景→仿真变体→训练和评测；本日只提出固定数据分层实验。"
        },
        {
          "id": "meta",
          "label": "Meta/FAIR V-JEPA 2",
          "url": "https://ai.meta.com/research/vjepa/",
          "reading": "Planning for robotic control：视频编码、DROID动作条件学习、目标图规划；预测代价不是CQL回报。"
        },
        {
          "id": "ami",
          "label": "AMI Labs研究方向",
          "url": "https://amilabs.xyz/",
          "reading": "representation space与action-conditioned段落；当前愿景不作已经验证的离线RL产品。"
        }
      ]
    }
  }
};
