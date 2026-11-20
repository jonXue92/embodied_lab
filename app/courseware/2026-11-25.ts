import type { AuthoredDay } from './types';

export const day86: AuthoredDay = {
  "reviewedAt": "2026-11-20",
  "revision": "逐课编写 1.0",
  "deliverable": "两状态Q误差传播图、条件动作SVG与固定阈值报警表。35+40+25=100分钟。",
  "question": {
    "title": "全局动作图中.8出现很多次，但bright组最近距离.75；双Q预测10与9，为什么仍不能用高值证明恢复动作可靠？",
    "summary": "连接条件覆盖、自举高估、源码查询与观测改进边界。",
    "keywords": [
      "条件支持",
      "自举",
      "双Q",
      "new_value",
      "RAW",
      "独立闭环"
    ],
    "reference": "动作在backlit出现并不能证明bright条件有支持；双critic可能共享偏差，取小仍高估。离散教学反例会将后继高值传播到已见动作，训练残差低不证明标签正确。IQL源码update_q使用new_value而非直接actor后继动作查询，但仍有状态泛化限制。RAW改善可辨识性不能补出接触后果；保留尺度、阈值和身份，独立评测并规划经授权补样，不能自动探索。"
  },
  "lessons": {
    "foundation": {
      "title": "分布外动作：高估怎样进入已见转移",
      "minutes": 35,
      "prerequisites": "完成11月24日固定replay，能区分终止与截断，理解SAC critic。",
      "connection": "昨天冻结日志，今天定位错误传播；明天讨论行为约束的收益和代价。",
      "intro": "用可手算的两状态反例拆开动作选择、价值外推与自举。",
      "outcomes": [
        "区分条件动作缺口与状态缺口",
        "手算未见动作误差传播"
      ],
      "sections": [
        {
          "heading": "动作出现过，不代表在这里出现过",
          "body": "把昨天的固定日志细化：机器人在明亮空桌上经常张开夹爪，在背光盒边只执行平移。如果把所有动作混合画直方图，张开和平移都很多；但在盒边张开是否会碰撞，仍没有对应转移。分布外应相对于状态或观测历史的条件分布判断，不能只问这个动作数值是否在整个文件出现过。\n\n连续动作下，任意精确浮点向量通常只出现一次，因此不能用字节是否完全相同定义危险。我们今天人为规定状态分组、动作单位和距离阈值，只得到有限样本的邻近代理。附近无样本提示证据稀疏，附近有样本也不证明动力学平滑；接触边界附近极小位移可以改变碰撞与抓取结果。",
          "sourceIds": [
            "review"
          ]
        },
        {
          "heading": "已见动作的标签也会依赖未见动作",
          "body": "原创两阶段任务有状态s0与s1。日志记录s0执行前进、奖励0到s1，随后s1执行左、奖励1并终止。真实环境中s1执行右会得到负5，但日志没有右的结果。假设当前网络对s1左估值1、右估值10，贪心目标会选右，于是s0前进的训练标签变成9，而其真实最优续值只有0.9。\n\n误差并非只留在那一个未见动作上：训练器用被高估的后继值监督已见动作，让看似有数据支持的前进也被抬高。下面公式刻意使用离散Q-learning、不含SAC熵项，只隔离最大化查询和自举传播。若s0这一步是真终止，则标签直接为奖励0；若仅时间截断且后继有效，不能为了压住数值而伪造终止。",
          "sourceIds": [
            "review",
            "td3"
          ],
          "formulas": [
            {
              "latex": "y=r+\\gamma(1-d)\\max_{a^\\prime}\\widehat Q(s^\\prime,a^\\prime),\\qquad \\Delta y=\\gamma(1-d)\\Delta Q",
              "explanation": "r为奖励，γ为无单位折扣，d为真实终止位，Q与y单位均为折扣回报；后继误差10−1=9、γ=.9时，标签误差为8.1，非额外实测奖励。"
            }
          ]
        },
        {
          "heading": "优化器为何偏爱错误的高峰",
          "body": "对于某个未见动作，网络可能高估也可能低估。问题不在于每个外推值一定偏高，而在于最大化或actor优化会偏向高值误差区域。选择之后再报告那个值，会产生选择偏差；真实最优动作也可能恰好缺失，所以不能反过来说所有未见动作都差。\n\n双Q取小能缓和部分噪声，却无法凭空提供缺失后果。若两个critic共享数据、表示和目标，都把右估成10与9，取小仍是9。教学代码显式保留这个反例；不能把双Q不同初始化当成独立的真实证据，也不能把较低的Q当作已经校准的风险概率。课程材料中的TD3是相关课程参照，其在线探索预算和离线固定数据设定必须分开。",
          "sourceIds": [
            "td3",
            "review"
          ]
        },
        {
          "heading": "从症状回到可以检查的查询链",
          "body": "训练loss下降只表示网络更接近本轮标签；若标签本身依赖无支持的高值，loss小并不证明回报可信。应同时记录日志动作Q、策略动作Q、二者条件距离、终止比例和奖励尺度，固定训练批后追踪标签由哪一个后继动作贡献。增加优化步数甚至重复已有轨迹，不能直接纠正右动作的虚构标签。\n\n今天的产出是标注两状态图和手算8.1的传播误差。明天再引入行为距离，后天再讲CQL目标，11月28日完整解释IQL。本日代码只计算反例，不训练大型网络，不连接仿真或机械臂；读者必须能指出错误发生在后继查询，而不是把所有曲线上升都归为数据太少。",
          "sourceIds": [
            "critic",
            "learner"
          ]
        }
      ],
      "points": [
        "区分条件动作缺口与状态缺口",
        "手算未见动作误差传播"
      ],
      "codeTitle": "unsupported_backup.py",
      "code": "import math\n\ndef backup(next_q, terminal=False):\n    if type(terminal) is not bool or not next_q:\n        raise ValueError('invalid backup contract')\n    if not all(math.isfinite(x) for x in next_q):\n        raise ValueError('nonfinite Q')\n    return .9 * (not terminal) * max(next_q)\nobserved_only=backup([1.])\nunrestricted=backup([1.,10.])\nassert math.isclose(observed_only,.9)\nassert math.isclose(unrestricted,9.)\nassert math.isclose(unrestricted-observed_only,8.1)\nassert backup([1.,10.],True)==0\n# Correlated critics: clipping does not recover missing evidence.\nclipped=[min(x,y) for x,y in zip([1.,10.],[1.,9.])]\nassert math.isclose(backup(clipped),8.1)\nfor bad in ([float('nan')],[]):\n    try: backup(bad)\n    except ValueError: pass\n    else: raise AssertionError('bad query accepted')\nprint('unsupported target 9; supported .9; propagated error 8.1; clipped target 8.1')",
      "codeNotes": [
        "backup只有后继Q和终止位，当前奖励固定0，离散最大化省略熵、网络和优化器。",
        "clipped的8.1是标签本身；前面8.1是9减.9的误差，两者数值相同但含义不同。"
      ],
      "exercise": {
        "prompt": "若后继两个Q为2与20，γ仍为.9，日志只支持2，标签和传播误差各多少？",
        "steps": [
          "先写出本题使用的假设与数值。",
          "解释反例如何改变结论以及还需什么证据。"
        ],
        "solution": "不限制动作时标签18；只查询已有动作时1.8；误差16.2。这里假设已有动作值2可信；限制查询并不能证明该动作对新状态安全或策略已最优。"
      },
      "quiz": {
        "question": "两个critic对没见过的恢复动作都预测很高，取小能否证明恢复可靠？",
        "hint": "分别检查数据约束、查询位置和结论范围。",
        "keywords": [
          "后继查询",
          "条件分布",
          "自举",
          "选择偏差"
        ],
        "reference": "不能。取小只能缓和部分估计噪声，共享固定数据时两者可能同向高估。必须定位该状态条件下的动作支持、后继查询与终止语义；真实恢复可靠性仍需独立闭环证据，不能从双Q一致直接推出。"
      },
      "sources": [
        {
          "id": "review",
          "label": "Levine等 · Offline RL Tutorial v3",
          "url": "https://arxiv.org/html/2005.01643v3",
          "reading": "§4.2动作分布偏移和自举传播；§4.3约束与§4.5悲观价值，仅作机制定位。2026-11-20复读。"
        },
        {
          "id": "td3",
          "label": "Spinning Up · TD3课程",
          "url": "https://spinningup.openai.com/en/latest/algorithms/td3.html",
          "reading": "Background和Key Equations：双Q取小、策略最大化Q及目标动作；不将在线缓解技巧当作离线保证。"
        },
        {
          "id": "critic",
          "label": "IQL作者 · critic.py",
          "url": "https://github.com/ikostrikov/implicit_q_learning/blob/master/critic.py",
          "reading": "2026-11-20读取master，update_v第12–27行、update_q第29–46行；该链接会变，不声称提交锁定。"
        },
        {
          "id": "learner",
          "label": "IQL作者 · learner.py",
          "url": "https://github.com/ikostrikov/implicit_q_learning/blob/master/learner.py",
          "reading": "_update_jit第23–40行：先value，再actor，再critic与target_update；本日只追踪查询的动作来源。"
        }
      ]
    },
    "code": {
      "title": "画出条件动作邻近图并追踪IQL查询",
      "minutes": 40,
      "prerequisites": "能读N×A动作张量和昨日replay的episode身份，完成前课反例。",
      "connection": "用图解释条件缺口；为明日行为距离实现建立尺度约定。",
      "intro": "读取真实IQL函数，原创实现纯内存SVG动作图和PyTorch距离审计。",
      "outcomes": [
        "定位IQL的dataset动作查询",
        "区分全局最近邻与条件最近邻"
      ],
      "sections": [
        {
          "heading": "真实源码先问动作从哪里来",
          "body": "IQL的critic.update_v直接取batch.actions，在日志状态上查询双Q后取小；update_q的后继项来自value网络，并不是在后继状态抽样任意actor动作再查Q。learner._update_jit先更新value，再做加权actor更新，然后更新critic和目标critic。函数参数名target_value不能代替调用链阅读，实际调用传入的是new_value。\n\n这条路径帮助理解一种避免显式OOD动作查询的设计，但本日不展开expectile与权重公式，也不称其为任意数据上的可靠保证。V对新状态依然需要泛化，actor仍可能输出日志附近之外的动作。今天把真实函数当作对照：下方教学代码只画支持代理，完全没有复制作者的JAX训练器。",
          "sourceIds": [
            "critic",
            "learner"
          ]
        },
        {
          "heading": "按状态条件分组才能发现假覆盖",
          "body": "原创日志有两个事先命名的状态组bright和backlit，动作是一维、统一归一化后的位移。bright记录0和.05，backlit记录.8；候选动作.8放到bright时，全局最近邻距离为0，但在bright组内最近距离为.75。全局图会说见过，条件图却清楚提示这个组合没有附近证据。\n\n代码先拒绝未知组、空张量、非有限值和错误动作轴，再用torch.cdist得到M个候选对N个日志动作的欧氏距离，沿日志轴取最小值得到M维结果。必须先保证所有动作维使用相同单位与标度，多维关节角和夹爪开度不能未经缩放直接相加；这个例子固定一维以让每个数都能人工复算。",
          "sourceIds": [
            "review",
            "critic"
          ]
        },
        {
          "heading": "SVG把样本和判断规则放在一起",
          "body": "plot函数把动作范围负1到1映射到横轴，三条日志动作画为蓝点，候选画为橙色竖线；两行分别对应两个状态组，读者可将返回字符串保存为svg后在浏览器打开。测试只在内存解析XML，确认三点一线都存在，不写文件、不启动浏览器、不访问设备。\n\n图上展示的是有限样本位置，没有把平滑填色冒充概率密度，也没有把空白自动涂成不安全区域。阈值.1只用于教学标记，如果换成米或弧度必须连同尺度版本重设。读图时先找到候选在哪个条件组，再量距离，最后写未知结论；不能看到橙线挨着另一行的点就认为该动作有条件支持。",
          "sourceIds": [
            "review"
          ]
        },
        {
          "heading": "正负例验证解释而非只验证shape",
          "body": "正例核对.75与0的差异，XML元素数量和同组.02候选的.02距离；负例分别传入未知组、NaN、空日志与两维动作，均应报错。拒绝错轴很关键：若把N个一维动作写成1×N，程序仍可能得到数值距离，却已把样本轴当动作维，图也会失真。\n\n练习将候选改为.1，并加入bright组.09动作，比较距离从.05降为.01。这只是更接近新增记录，不等于真实碰撞风险被证明降低。最终交付SVG字符串、距离表和真实IQL调用链注释；训练收敛、密度模型和实际控制都在简化范围之外，下一课才在统一尺度上计算行为距离损失。\n\n今日LeRobot固定提交还提供一个具体索引反例：旧写法用被筛选字段的dtype构造索引，uint8会把256截断，低精度浮点也可能舍入257。筛选状态与动作时必须保留整数样本身份。本例mask用于筛选日志组，额外用三种dtype验证Python整数索引列表可保留目标行；这只运行原创夹具，没有执行上游整套测试。",
          "sourceIds": [
            "critic",
            "learner",
            "indexfix"
          ]
        }
      ],
      "points": [
        "定位IQL的dataset动作查询",
        "区分全局最近邻与条件最近邻"
      ],
      "codeTitle": "conditional_action_map.py",
      "code": "import torch\nimport xml.etree.ElementTree as ET\nlabels=['bright','bright','backlit']\nlogged=torch.tensor([[0.],[.05],[.8]])\n\ndef distances(group, actions, candidate):\n    if group not in labels: raise ValueError('unknown condition')\n    if actions.shape!=(len(labels),1) or candidate.ndim!=2 or candidate.shape[1]!=1 or candidate.shape[0]==0:\n        raise ValueError('expected N by 1 actions and M by 1 candidates')\n    if not torch.isfinite(actions).all() or not torch.isfinite(candidate).all():\n        raise ValueError('nonfinite actions')\n    mask=torch.tensor([x==group for x in labels])\n    conditional=torch.cdist(candidate,actions[mask]).min(dim=1).values\n    global_d=torch.cdist(candidate,actions).min(dim=1).values\n    return conditional,global_d\n\ndef plot(actions, candidate):\n    distances('bright',actions,candidate)\n    if candidate.shape!=(1,1): raise ValueError('plot expects one candidate')\n    if (actions.abs()>1).any() or (candidate.abs()>1).any(): raise ValueError('outside plot range')\n    parts=['<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"600\" height=\"180\" viewBox=\"0 0 600 180\">']\n    for j,name in enumerate(('bright','backlit')):\n        y=45+j*70\n        parts.append(f'<text x=\"8\" y=\"{y}\">{name}</text><path d=\"M120 {y} H560\" stroke=\"gray\"/>')\n        for i,label in enumerate(labels):\n            if label==name:\n                x=340+220*float(actions[i,0])\n                parts.append(f'<circle cx=\"{x}\" cy=\"{y}\" r=\"5\" fill=\"blue\"/>')\n    x=340+220*float(candidate[0,0])\n    parts.append(f'<line x1=\"{x}\" x2=\"{x}\" y1=\"30\" y2=\"60\" stroke=\"orange\"/>')\n    parts.append('<text x=\"120\" y=\"160\">action: -1 to 1; orange = bright candidate</text></svg>')\n    return ''.join(parts)\ncandidate=torch.tensor([[.8]])\nd,g=distances('bright',logged,candidate)\nassert torch.allclose(d,torch.tensor([.75])) and g.item()==0\nassert torch.allclose(distances('bright',logged,torch.tensor([[.02]]))[0],torch.tensor([.02]))\nsvg=plot(logged,candidate); tree=ET.fromstring(svg)\nns={'s':'http://www.w3.org/2000/svg'}\nassert len(tree.findall('s:circle',ns))==3 and len(tree.findall('s:line',ns))==1\nfor group,a,q in [('unknown',logged,candidate),('bright',logged,torch.tensor([[float('nan')]])),('bright',torch.empty(0,1),candidate),('bright',logged,torch.zeros(1,2))]:\n    try: distances(group,a,q)\n    except ValueError: pass\n    else: raise AssertionError('invalid map input accepted')\nprint('conditional=.75 global=0; SVG has three samples and one query; four negative cases rejected')\nfor dtype,index in [(torch.bool,2),(torch.uint8,256),(torch.bfloat16,257)]:\n    field=torch.zeros(index+1,1,dtype=dtype); field[index]=1\n    selected=field[[index,0]]\n    assert selected[:,0].tolist()==[1,0]\nprint(\"integer identity survives bool, uint8 and bfloat16 field selection\")",
      "codeNotes": [
        "distances先校验契约再筛选状态组，cdist的第1轴对应日志样本，取min后保留候选轴。",
        "plot返回可导出的SVG字符串，测试用XML核对内容；未实现真实连续状态空间支持估计或绘图外推。",
        "补充回归固定整数索引，不用field.new_tensor(indices)继承字段dtype；低精度字段数值与样本身份分开。"
      ],
      "exercise": {
        "prompt": "在bright新增.09动作，候选.1的组内距离从多少变成多少？是否证明该动作安全？",
        "steps": [
          "先写出本题使用的假设与数值。",
          "解释反例如何改变结论以及还需什么证据。"
        ],
        "solution": "原组0与.05使距离为.05，新增.09后为.01。必须同步扩展labels与样本数契约；邻近仅描述动作证据，未包含碰撞、隐藏状态和误差校准，不能证明安全。"
      },
      "quiz": {
        "question": "IQL update_q收到batch后，后继值是否由当前actor采样OOD动作再查critic得到？",
        "hint": "分别检查数据约束、查询位置和结论范围。",
        "keywords": [
          "update_q",
          "new_value",
          "batch.actions",
          "条件距离"
        ],
        "reference": "作者实现中并非如此。update_q调用传入的value网络处理batch.next_observations，构成reward加discount乘mask乘next_v；learner实际传入new_value。日志动作查询在update_v等路径，避免显式后继actor动作查询仍不消除状态泛化风险。"
      },
      "sources": [
        {
          "id": "critic",
          "label": "IQL作者 · critic.py",
          "url": "https://github.com/ikostrikov/implicit_q_learning/blob/master/critic.py",
          "reading": "2026-11-20读取master，update_v第12–27行、update_q第29–46行；该链接会变，不声称提交锁定。"
        },
        {
          "id": "learner",
          "label": "IQL作者 · learner.py",
          "url": "https://github.com/ikostrikov/implicit_q_learning/blob/master/learner.py",
          "reading": "_update_jit第23–40行：先value，再actor，再critic与target_update；本日只追踪查询的动作来源。"
        },
        {
          "id": "review",
          "label": "Levine等 · Offline RL Tutorial v3",
          "url": "https://arxiv.org/html/2005.01643v3",
          "reading": "§4.2动作分布偏移和自举传播；§4.3约束与§4.5悲观价值，仅作机制定位。2026-11-20复读。"
        },
        {
          "id": "indexfix",
          "label": "LeRobot · 按样本索引筛选修复",
          "url": "https://github.com/huggingface/lerobot/commit/9c23a7db15f9c6332824ac8524c3ad889f3a002a",
          "reading": "RenderTrainingMessages的_select_value：直接value[indices]，避免用bool/uint8/bfloat16字段dtype构造索引。固定提交，2026-11-20实读补丁与回归测试。"
        }
      ]
    },
    "insight": {
      "title": "从动作证据选择价值、模型与补样预算",
      "minutes": 25,
      "prerequisites": "完成.75条件距离图与8.1传播误差，理解生成图像和物理转移的区别。",
      "connection": "今天形成可审核诊断；明天比较行为正则，后续再做CQL与IQL。",
      "intro": "把RAW感知、世界模型和Agent放回数据覆盖约束，选择个人实验的下一步。",
      "outcomes": [
        "区分观测改善与动作覆盖改善",
        "按条件分层比较候选策略查询"
      ],
      "sections": [
        {
          "heading": "RAW能改善状态辨识，不能补出接触结果",
          "body": "在你的RAW项目里，背光可能使RGB中的盒边消失，策略把有障碍误判为空桌。改进动态范围或编码器有机会区分两个状态，降低表征混叠；验证时固定相同轨迹、时间同步、动作单位和场景划分，比较相同决策点的条件邻近与真实任务指标。不能让RAW组额外获得恢复轨迹后再把全部收益归于传感器。\n\n如果盒边状态本来已能区分，但从来没有张开恢复的执行记录，RAW不会自动提供动作后果。路线A先修观测与同步，成本较低且可离线诊断，代价是动作缺口仍在；路线B规划下一批经授权的恢复数据，能补接触证据，代价是人工时间与安全组织。今天只写数据需求，不向SO-101发送任何命令。",
          "sourceIds": [
            "review"
          ]
        },
        {
          "heading": "把距离报警与任务价值分开记账",
          "body": "教学定义报警率：对固定审计状态上的策略动作，计算同条件最近邻距离，大于阈值记1。四次查询距离.02、.04、.75、.80，阈值.1，报警率为.5；若阈值改成.8并采用严格大于，报警变0，但策略根本没变化。这证明阈值是审计约定，不能把调低报警数字包装成能力提升。\n\n比较BC和价值策略时固定查询状态、距离尺度和阈值，并另外报告成功、介入与延迟。保守限制可能牺牲日志之外的好动作，放宽限制可能利用无依据的高Q；两者需要验证而非预先宣判。小显存预算优先跑这份二维表与少量公开仿真对照，价值网络变大或加世界模型之前先排除坐标错位与终止污染。",
          "sourceIds": [
            "review",
            "td3"
          ],
          "formulas": [
            {
              "latex": "U_\\epsilon(\\pi;S)=\\frac{1}{|S|}\\sum_{s\\in S}\\mathbf1\\!\\left[\\min_{a_i\\in D(s)}\\|\\pi(s)-a_i\\|_2>\\epsilon\\right]",
              "explanation": "S是固定审计状态列表，D(s)是人为条件分组后的日志动作集合，ε使用归一化动作单位；U为报警比例而非概率校准或安全指标。四条距离两条大于.1，U=.5。"
            }
          ]
        },
        {
          "heading": "双团队分别提供环境与预测，仍要审计候选动作",
          "body": "StanfordVL的BEHAVIOR/OmniGibson让任务、状态和目标谓词可核对，可用同初态测试策略是否达到条件；其Q-score是目标完成度，不能与本日折扣回报Q函数混为一谈。World Labs的Marble/Atlas与R2S2R则帮助生成和重建空间、构造场景变体，视觉覆盖扩展并不等于某个动作已获得真实接触标签。\n\nMeta/FAIR历史V-JEPA 2-AC用动作条件预测未来表征，规划会搜索候选动作，因此也应问候选是否远离动作条件训练分布。预测表征损失小只约束已有数据，不保证搜索后的动作可靠。AMI Labs当前的表征预测与可靠规划方向单独归属，未核实模型发布时只作研究问题；不能将其愿景写成Meta结果或SO-101已验证能力。",
          "sourceIds": [
            "behavior",
            "world",
            "jepa",
            "ami"
          ]
        },
        {
          "heading": "Agent的重规划也可能反复查询同一个缺口",
          "body": "未来让通用大模型分解任务时，高层输出技能名、目标与恢复计划，VLA或世界模型提供动作候选，控制器执行后把图像和关节状态返回验证器。若恢复计划总要求一个无数据支撑的姿态，反复重规划会反复调用同一个未知接口；对话流畅、计划文本自洽和离线Q升高都不能替代执行证据。\n\n本日交付包含三类行：可复算的观测/动作身份错误、仅缺少数据的未知区域、已通过独立闭环的动作范围。为每行写责任模块与下一次验证，不把未知写成必失败，也不在报警后自动随机探索。明天用行为距离讨论保守收益，11月29日再登记offline-to-online新增交互预算；这种顺序让你先学会识别证据，再学会选择算法。",
          "sourceIds": [
            "review",
            "jepa"
          ]
        }
      ],
      "points": [
        "区分观测改善与动作覆盖改善",
        "按条件分层比较候选策略查询"
      ],
      "codeTitle": "audit_budget.py",
      "code": "import math\n\ndef flagged_rate(ds,eps):\n    if not ds or not math.isfinite(eps) or eps<0:\n        raise ValueError('invalid audit threshold')\n    if any(not math.isfinite(d) or d<0 for d in ds):\n        raise ValueError('invalid distance')\n    return sum(d>eps for d in ds)/len(ds)\nd=[.02,.04,.75,.80]\nassert flagged_rate(d,.1)==.5\nassert flagged_rate(d,.8)==0\nassert flagged_rate(d*100,.1)==.5\nfor ds,eps in [([], .1),([float('nan')],.1),(d,-1)]:\n    try: flagged_rate(ds,eps)\n    except ValueError: pass\n    else: raise AssertionError('invalid audit accepted')\nprint('same policy: alarm .5 or 0 by threshold; duplicated queries retain .5')",
      "codeNotes": [
        "严格大于使距离等于阈值时不报警，报告中必须保存这一约定。",
        "重复查询不改变比例也不创造独立证据；代码没有估计真实密度、成功率或控制安全。"
      ],
      "exercise": {
        "prompt": "若通过改阈值将报警率从.5变成0，招聘作品中应如何陈述？",
        "steps": [
          "先写出本题使用的假设与数值。",
          "解释反例如何改变结论以及还需什么证据。"
        ],
        "solution": "应明确策略与数据未变，仅审计阈值变化，并同时报告旧阈值下.5与新阈值下0，不称为控制提升。保存动作归一化版本、条件分组和逐条距离，另用独立闭环评测支持真实效果。"
      },
      "quiz": {
        "question": "生成更多逼真盒边图像，是否解决了在盒边从未执行张开恢复的Q外推？",
        "hint": "分别检查数据约束、查询位置和结论范围。",
        "keywords": [
          "RAW",
          "动作证据",
          "阈值",
          "世界模型"
        ],
        "reference": "没有自动解决。图像可以扩大观测变化，却没有增加该条件动作的真实转移后果；动作条件世界模型也可能在搜索区域外推。应把视觉证据、仿真动作结果与真机执行分开版本化，再确定是否补样或限制候选。"
      },
      "sources": [
        {
          "id": "review",
          "label": "Levine等 · Offline RL Tutorial v3",
          "url": "https://arxiv.org/html/2005.01643v3",
          "reading": "§4.2动作分布偏移和自举传播；§4.3约束与§4.5悲观价值，仅作机制定位。2026-11-20复读。"
        },
        {
          "id": "td3",
          "label": "Spinning Up · TD3课程",
          "url": "https://spinningup.openai.com/en/latest/algorithms/td3.html",
          "reading": "Background和Key Equations：双Q取小、策略最大化Q及目标动作；不将在线缓解技巧当作离线保证。"
        },
        {
          "id": "behavior",
          "label": "StanfordVL · BEHAVIOR评测",
          "url": "https://behavior.stanford.edu/challenge/evaluation.html",
          "reading": "Metrics and Results：谓词成功与Q-score；注意该Q-score并非RL的Q函数。"
        },
        {
          "id": "world",
          "label": "World Labs · R2S2R",
          "url": "https://worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "One real task, thousands of variations：可控场景变体与策略评测；未复现实验。"
        },
        {
          "id": "jepa",
          "label": "Meta/FAIR · V-JEPA 2",
          "url": "https://ai.meta.com/research/vjepa/",
          "reading": "Planning for robotic control：动作条件预测与规划；历史组织归属，不归为AMI新模型。"
        },
        {
          "id": "ami",
          "label": "AMI Labs · 当前研究方向",
          "url": "https://amilabs.xyz/",
          "reading": "表征空间预测、动作条件世界模型与可靠性方向；愿景不等于模型发布或SO-101结果。"
        }
      ]
    }
  }
};
