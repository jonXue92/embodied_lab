import type { AuthoredDay } from './types';

export const day69: AuthoredDay = {
  "reviewedAt": "2026-11-05",
  "revision": "逐课编写 1.0",
  "deliverable": "仿真/真机来源 manifest、目标分布与有效梯度权重核算、带正负测试的来源采样夹具和同预算消融设计。三课共 100 分钟，复盘另留 20 分钟。",
  "question": {
    "title": "10 万仿真帧与 1 万真实帧混合，标注 real 权重为 0.5 就一定有一半真实监督吗？",
    "summary": "区分来源概率、样本权重、loss 系数和梯度尺度，并排除源轨迹泄漏。",
    "keywords": [
      "source probability",
      "per-sample weight",
      "loss coefficient",
      "gradient norm",
      "lineage split"
    ],
    "reference": "不一定。若给每帧 real=0.5、sim=0.5，来源概率仍是 1:10；要使来源各半，单帧权重应为 0.5/N_real 与 0.5/N_sim。若抽样已各半又给真实 loss 额外乘系数，会改变目标；真实与仿真的梯度尺度、有效 mask 和动作维度也影响实际更新。应记录来源、源演示父 ID、版本与动作合同，按父轨迹隔离验证，报告各域 loss 和梯度范数并用独立真实留出集选配比。"
  },
  "lessons": {
    "foundation": {
      "title": "混合数据的数学：来源比例怎样变成模型的训练目标",
      "minutes": 35,
      "prerequisites": "理解 11 月 6 日随机化分布、11 月 7 日系统辨识，以及 batch、均值损失与梯度。",
      "connection": "校准使仿真更可信，却不使它等同真机。今天决定二者如何进入训练；明天用公开/隐藏实例检验收益是否迁移。",
      "intro": "混入仿真数据的第一步是明确想最小化哪个分布上的风险。文件数量、帧数量、采样概率和 loss 系数是四件事，混写会让一个看似合理的配置优化完全不同的目标。",
      "outcomes": [
        "推导来源概率到单帧权重的映射",
        "计算重复加权带来的目标漂移",
        "识别源演示关联与虚假样本量"
      ],
      "sections": [
        {
          "heading": "01 先定义两个域上的风险",
          "body": "设真实域 R 与仿真域 S 都保存观测 o、语言 c、状态 q 与动作 a，策略输出动作预测。真实域含通信、曝光、摩擦等真实误差，模拟域可能提供更广的姿态覆盖，但也带有渲染和控制器偏差。两域共同字段必须先统一单位、坐标、时间和 action horizon，否则平均损失在混合两种不同含义的监督。\n\n令 alpha 是训练目标中的真实风险占比，而不是磁盘中真实文件的占比。目标写为 alpha 乘真实期望损失加其余仿真期望。这个 alpha 是实验选择，不能从论文成绩抄一个值便宣称最优；验证集需要真实、独立并覆盖目标任务条件，训练混合的收益最终由该集合回答。",
          "sourceIds": [
            "r2s",
            "eval"
          ],
          "formulas": [
            {
              "latex": "J(\\theta)=\\alpha\\,\\mathbb E_R[\\ell_\\theta]+(1-\\alpha)\\,\\mathbb E_S[\\ell_\\theta]",
              "explanation": "theta 是策略参数，ell 是统一动作单位下的单样本损失，alpha 属于零到一；这是人为指定的训练风险，不是对真实部署分布已知的断言。"
            }
          ]
        },
        {
          "heading": "02 从来源概率推导每帧的采样质量",
          "body": "假设真实有一万帧、仿真有十万帧，希望 alpha=0.5。先等概率选择来源、再在该来源均匀选帧，则每个真实帧被选中的概率为 0.5/10000，仿真为 0.5/100000。真实单帧权重是仿真的十倍；每域总质量才相等。反过来给所有帧同一个 0.5，归一化后仍只是均匀抽所有十一万帧。\n\n若 batch 大小为 32，独立来源抽样时真实数量均值为 16，标准差为 sqrt(32×0.5×0.5)=2.83。某批只有 12 个真实样本不意味着配置失效；需要看多批频率。若必须每批严格 16:16，应使用分层 batch sampler，并记录它降低了来源数量波动，而不是把随机采样波动误报为错误。",
          "sourceIds": [
            "sampler"
          ],
          "formulas": [
            {
              "latex": "p_i=\\begin{cases}\\alpha/N_R&i\\in R\\\\(1-\\alpha)/N_S&i\\in S\\end{cases}",
              "explanation": "N_R、N_S 为训练切分内有效样本数；来源内均匀抽样时每个样本的概率如式，跨来源求和为一，不能把来源权重直接赋给每一帧。"
            }
          ]
        },
        {
          "heading": "03 抽样和 loss 加权只能按目标组合",
          "body": "若真实/仿真已各半抽样，直接对样本损失求均值就是上述 alpha=0.5 目标。再把真实 loss 乘三，未重新归一化时目标变成 1.5 L_R+0.5 L_S，其相对占比是 3:1，整体梯度尺度也翻倍。为了比较配比，必须明确保持学习率还是保持梯度标度；不能让优化强度变化冒充数据效果。\n\n若希望沿原始全数据分布抽样但优化新目标，可使用重要性比 p_target/p_sample；前提是目标支持集在采样分布内，且比值方差受控。真实只有极少困难样本时，巨大权重会反复放大噪声；有效 mask、动作维度和序列长度应在域内先按一致规则归约，再谈域间权重。",
          "sourceIds": [
            "sampler"
          ],
          "formulas": [
            {
              "latex": "\\mathbb E_{q}[\\tfrac{p(x)}{q(x)}\\ell(x)]=\\mathbb E_p[\\ell(x)],\\quad q(x)>0\\ \\text{if}\\ p(x)>0",
              "explanation": "q 是实际抽样概率，p 是目标概率；等式来自离散求和中的 q 抵消，只在支持覆盖且期望存在时成立，权重裁剪会引入偏差。"
            }
          ]
        },
        {
          "heading": "04 合成数量不等于独立经验数量",
          "body": "MimicGen 从少量人类轨迹适配到新上下文，说明生成可以扩大场景覆盖，但派生轨迹仍共享源动作结构。若同一源演示的不同变体分到训练与验证，模型可能记住该结构，得到看似泛化的成绩。manifest 应含 parent_demo_id、scene_family 和生成种子；切分先按父身份，再展开帧。\n\n对于 RAW 项目，标准 RGB 渲染并没有传感器电子噪声、饱和、黑电平与 ISP 的完整生成机制；不可把三通道图像重命名为 RAW。建议先让仿真覆盖几何和动作，真实校准曝光/模态关系。World Labs 提供对齐仿真的技术主张，StanfordVL 提供任务与评测协议；AMI 的方向声明没有给出可直接照抄的混合权重。",
          "sourceIds": [
            "mimic",
            "r2s",
            "ami"
          ]
        },
        {
          "heading": "05 成功筛选也会改变合成数据的支持集",
          "body": "MimicGen 先把演示分成对象中心子任务，按新对象位姿变换参考片段，再执行生成轨迹并只保留成功结果。这不是给已有图像做离线增强：动作和状态来自新执行。原论文附录 R 专门检查某些初始配置是否更容易生成成功数据，说明目标 reset 分布与最终保留分布可能不同。\n\n因此记录生成尝试总数、失败原因与初态覆盖格，比只记录成功轨迹数更有诊断力。插值连接片段还可能制造冗长或不自然运动；成功过滤也不必然排除无关碰撞。父轨迹切分、覆盖审计和安全质量审计解决不同问题，应分别保留证据，不能给每条合成成功数据相同高质量标签。",
          "sourceIds": [
            "mimic"
          ]
        }
      ],
      "points": [
        "来源概率要除以来源样本数。",
        "抽样与 loss 同时加权会改变目标。",
        "派生轨迹按父身份切分。"
      ],
      "codeTitle": "mixture_mass.py · 确定性概率核算",
      "code": "from math import isclose\n\ndef mass(nr, ns, alpha):\n    if nr <= 0 or ns <= 0 or not 0 <= alpha <= 1:\n        raise ValueError(\"invalid mixture\")\n    return [alpha/nr]*nr + [(1-alpha)/ns]*ns\np = mass(2, 8, .5)\nassert isclose(sum(p[:2]), .5) and isclose(sum(p[2:]), .5)\nassert isclose(p[0]/p[-1], 4)\nassert isclose((.5*3)/(.5*3+.5), .75)\ntry:\n    mass(0, 8, .5)\n    raise AssertionError(\"empty source accepted\")\nexcept ValueError:\n    pass\n",
      "codeNotes": [
        "mass 只计算目标样本概率，不加载数据、不训练策略；2:8 是便于手算的缩小数据集。",
        "正例验证每域总质量和单帧倍率；负例拒绝空来源，防止除零或无意义配置。"
      ],
      "exercise": {
        "prompt": "真实 2000 帧、仿真 18000 帧，目标真实占比 0.4，算单帧概率及倍率。",
        "steps": [
          "分别计算来源概率除以帧数。",
          "解释再乘真实 loss 系数 2 后相对比例。"
        ],
        "solution": "真实每帧 0.0002，仿真每帧约 0.00003333，倍率 6；若抽样已为 0.4:0.6，再把真实 loss 乘 2，相对质量成为 0.8:0.6，即真实 4/7，同时未归一化目标整体尺度变成 1.4。"
      },
      "quiz": {
        "question": "为什么所有 real/sim 帧都给 0.5 权重并不能实现来源各半？",
        "hint": "比较来源总质量。",
        "keywords": [
          "sample count",
          "source mass",
          "normalization",
          "mixture probability"
        ],
        "reference": "权重由采样器按全部样本归一化，同一来源总质量等于单帧权重乘该来源帧数，因此数量更多的来源仍占优势。应按期望来源概率除以来源内样本数构造权重，并核对归一化总质量。"
      },
      "sources": [
        {
          "id": "sampler",
          "label": "PyTorch 2.7.1 WeightedRandomSampler 固定版本源码",
          "url": "https://github.com/pytorch/pytorch/blob/v2.7.1/torch/utils/data/sampler.py",
          "reading": "2026-11-05 实读 WeightedRandomSampler.__init__/__iter__ 与 BatchSampler；定位 weights 的一维样本轴、double 转换、torch.multinomial、replacement 和 generator，课堂运行环境为 2.7.1。"
        },
        {
          "id": "mimic",
          "label": "MimicGen 原论文 CoRL 2023",
          "url": "https://arxiv.org/html/2310.17596v1",
          "reading": "2026-11-05 实读 v1 第3/4节的对象中心分段、参考片段变换与成功筛选，附录R的支撑覆盖偏差、插值伪影和仅保留成功轨迹的限制。PDF下载中断后用HTML完成相关章节阅读，不引用未读全文。"
        },
        {
          "id": "r2s",
          "label": "World Labs R2S2R 官方技术页",
          "url": "https://www.worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "实读 Real-to-Sim/Sim-to-Real、appearance/physics/camera 变体与开闭环对齐；与 StanfordVL 学术基准分开归属。"
        },
        {
          "id": "eval",
          "label": "StanfordVL BEHAVIOR Evaluation",
          "url": "https://behavior.stanford.edu/challenge/evaluation.html",
          "reading": "实读 Allowed policy inputs 与 Metrics：训练可有 privileged information，评测只用 RGB/depth/proprioception；用于混合数据字段审计。"
        },
        {
          "id": "ami",
          "label": "AMI Labs 当前官方研究方向",
          "url": "https://amilabs.xyz/",
          "reading": "实读表征空间预测与动作条件模型的方向声明；不把方向写为已发布的混合数据训练配方。"
        },
        {
          "id": "mimicAuthor",
          "label": "MimicGen 作者项目与机制示例",
          "url": "https://mimicgen.github.io/",
          "reading": "实读作者项目 Data Generation Example 与跨 reset/对象/机器人扩展示例，配合原论文 v1 第3/4节与附录R核对机制。"
        }
      ]
    },
    "code": {
      "title": "精读 WeightedRandomSampler：把来源 manifest 接到全局样本索引",
      "minutes": 40,
      "prerequisites": "会使用 Dataset.__getitem__、一维概率和布尔 mask，已完成本日混合风险推导。",
      "connection": "基础课给出目标分布；本课追到实际被 DataLoader 请求的整数索引。下一课用同预算训练比较这些配置，避免只检查 YAML 数值。",
      "intro": "采样器既不理解真实/仿真，也不检查动作坐标。它只接受一维权重，返回索引。工程正确性取决于 manifest 顺序、权重顺序、Dataset 索引与 batch 来源标签能否保持同一身份。",
      "outcomes": [
        "定位 __init__ 到 torch.multinomial 调用链",
        "验证来源标签、权重与索引的一致性",
        "区分概率比例和每批固定配额"
      ],
      "sections": [
        {
          "heading": "01 源码入口与边界",
          "body": "在 PyTorch v2.7.1 的 torch/utils/data/sampler.py，WeightedRandomSampler.__init__ 检查 num_samples 为正整数、replacement 为布尔值，并把 weights 转为 double 的一维张量。__iter__ 只调用 torch.multinomial，再把结果转换为 Python 索引迭代器。它没有读取每条数据的 source 字段，也不会替你计算来源帧数。\n\n这意味着 weights 的第 i 项必须与 dataset[i] 是同一条记录。若先按 source 排序计算权重，之后 Dataset 又按时间重排却没有同步权重，就会把真实配额送给仿真帧。最小可审计接口应同时返回 sample_uid、source、parent_demo_id、schema_version；索引只是当前 manifest 的位置，不能替代稳定身份。",
          "sourceIds": [
            "sampler"
          ]
        },
        {
          "heading": "02 replacement 决定一个 epoch 的含义",
          "body": "有放回抽样允许稀少的真实帧反复出现，因此总抽样数可以独立于数据集长度。num_samples 定义本轮抽多少次，不能解读为访问了多少独立帧。若每域总质量各半，真实域只有两条数据，抽一百次可能多次重用它们，这对过拟合与有效样本量都有影响。\n\n无放回抽样限制同一索引只能被选择一次；即使开始的权重偏真实，随着真实样本耗尽，后续来源比例也会偏离初始概率。想要长轮次保持目标比例，通常需要有放回或明确设计来源循环。示例采用有放回，并把抽样次数、随机种子与 observed counts 一起输出，而不把一次结果当精确配额。",
          "sourceIds": [
            "sampler"
          ]
        },
        {
          "heading": "03 从 manifest 构造权重并验证实际样本",
          "body": "教学代码用六条记录代替视频和 parquet，真实两条、仿真四条。先验证来源集合完整，再以目标质量除以各来源数量得到 double 权重。调用与上游相同的 WeightedRandomSampler，得到的 idx 是全局样本索引；再按索引从原 manifest 回读来源，统计频率。\n\n这里的统计检验只抓数量级错误：固定种子抽四千次后，真实频率应接近一半，但不能要求完全相等。精确概率总质量测试负责验证配置，频率测试负责验证实际索引路径；二者不能相互替代。对未知来源故意抛错，防止新数据被静默归入仿真并绕过来源审计。",
          "sourceIds": [
            "sampler"
          ]
        },
        {
          "heading": "04 batch 归约与训练循环仍需另审",
          "body": "真实训练时动作通常是 B×H×D，padding mask 为 B×H。应先计算每个样本有效时刻的平均动作损失，再做来源目标归约；若直接对所有有效标量求平均，较长轨迹或较大动作维度的来源会额外占权。不同机器人 D 不同则先定义本体 adapter 与维度 mask，不能只靠 sampler 修复。\n\n本夹具不实现多进程视频读取、分布式 rank 分片、归一化统计或训练器恢复。单卡 4090 可先保存一轮索引计划和 manifest 哈希；恢复时重建 generator 状态并验证数据身份。拓展到多卡时也不能同时独立启用互不协调的 WeightedRandomSampler 与 DistributedSampler，需设计可复现的全局抽样后再分片。",
          "sourceIds": [
            "sampler",
            "eval"
          ]
        }
      ],
      "points": [
        "权重轴必须与 Dataset 全局索引一致。",
        "有放回的抽样次数不是独立样本量。",
        "来源频率和 loss 归约分别验收。"
      ],
      "codeTitle": "source_sampler.py · 实际 PyTorch 抽样夹具",
      "code": "import torch\nfrom torch.utils.data import WeightedRandomSampler\n\nrows = [\"real\", \"sim\", \"sim\", \"real\", \"sim\", \"sim\"]\ndef weights_for(labels, alpha):\n    if set(labels) != {\"real\", \"sim\"} or not 0 <= alpha <= 1:\n        raise ValueError(\"unknown or missing source\")\n    nr, ns = labels.count(\"real\"), labels.count(\"sim\")\n    return torch.tensor([alpha/nr if s == \"real\" else (1-alpha)/ns\n                         for s in labels], dtype=torch.double)\nw = weights_for(rows, .5)\nassert torch.isclose(w[torch.tensor([s == \"real\" for s in rows])].sum(), torch.tensor(.5, dtype=torch.double))\ng = torch.Generator().manual_seed(69)\nidx = list(WeightedRandomSampler(w, 4000, replacement=True, generator=g))\nfreq = sum(rows[i] == \"real\" for i in idx)/len(idx)\nassert .46 < freq < .54, freq\nassert all(0 <= i < len(rows) for i in idx)\ntry:\n    weights_for([\"real\", \"synthetic_unknown\"], .5)\n    raise AssertionError(\"unknown source silently accepted\")\nexcept ValueError:\n    pass\nprint(\"real_frequency\", freq)\n",
      "codeNotes": [
        "weights_for 验证来源和 alpha 后返回六项 double 权重，对齐原始交错顺序，未排序 Dataset。",
        "generator 固定随机序列；4000 次频率检验验证的是索引回读来源，精确总质量由前一条断言检查。",
        "代码只有内存记录和抽样，无上游训练下载、硬件调用或客户数据读取。"
      ],
      "exercise": {
        "prompt": "将标签改为 real/sim/real/sim/sim/sim 并保持目标各半，说明哪些量改变。",
        "steps": [
          "重算每个位置权重并验证来源总质量。",
          "指出不能沿用原顺序的索引缓存。"
        ],
        "solution": "真实数量仍为二，真实位置单帧权重仍为 0.25、仿真仍为 0.125，但权重排列随 manifest 变化。总质量不变不代表身份不变，旧索引缓存必须通过稳定 UID/manifest 哈希校验后才能使用。"
      },
      "quiz": {
        "question": "无放回采样覆盖全部六条记录后，为什么真实比例无法保持一半？",
        "hint": "真实来源只有两条。",
        "keywords": [
          "replacement",
          "source exhaustion",
          "epoch length",
          "global index"
        ],
        "reference": "无放回时每条最多一次，覆盖六条必有两条真实四条仿真，最终比例只能三分之一；权重影响抽取先后和子集，不能创造额外真实样本。要维持长期来源各半需有放回或明确的来源循环机制。"
      },
      "sources": [
        {
          "id": "sampler",
          "label": "PyTorch 2.7.1 WeightedRandomSampler 固定版本源码",
          "url": "https://github.com/pytorch/pytorch/blob/v2.7.1/torch/utils/data/sampler.py",
          "reading": "2026-11-05 实读 WeightedRandomSampler.__init__/__iter__ 与 BatchSampler；定位 weights 的一维样本轴、double 转换、torch.multinomial、replacement 和 generator，课堂运行环境为 2.7.1。"
        },
        {
          "id": "mimic",
          "label": "MimicGen 原论文 CoRL 2023",
          "url": "https://arxiv.org/html/2310.17596v1",
          "reading": "2026-11-05 实读 v1 第3/4节的对象中心分段、参考片段变换与成功筛选，附录R的支撑覆盖偏差、插值伪影和仅保留成功轨迹的限制。PDF下载中断后用HTML完成相关章节阅读，不引用未读全文。"
        },
        {
          "id": "r2s",
          "label": "World Labs R2S2R 官方技术页",
          "url": "https://www.worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "实读 Real-to-Sim/Sim-to-Real、appearance/physics/camera 变体与开闭环对齐；与 StanfordVL 学术基准分开归属。"
        },
        {
          "id": "eval",
          "label": "StanfordVL BEHAVIOR Evaluation",
          "url": "https://behavior.stanford.edu/challenge/evaluation.html",
          "reading": "实读 Allowed policy inputs 与 Metrics：训练可有 privileged information，评测只用 RGB/depth/proprioception；用于混合数据字段审计。"
        },
        {
          "id": "ami",
          "label": "AMI Labs 当前官方研究方向",
          "url": "https://amilabs.xyz/",
          "reading": "实读表征空间预测与动作条件模型的方向声明；不把方向写为已发布的混合数据训练配方。"
        },
        {
          "id": "mimicAuthor",
          "label": "MimicGen 作者项目与机制示例",
          "url": "https://mimicgen.github.io/",
          "reading": "实读作者项目 Data Generation Example 与跨 reset/对象/机器人扩展示例，配合原论文 v1 第3/4节与附录R核对机制。"
        }
      ]
    },
    "insight": {
      "title": "合成经验的准入：用有限真实数据判断覆盖收益与域偏差",
      "minutes": 25,
      "prerequisites": "能核算目标混合分布，理解系统辨识残差与训练/验证隔离。",
      "connection": "今天产出可比较的数据配方；明天固定实例、谓词和时间预算，用闭环证据选配方，再进入控制部署单元。",
      "intro": "仿真能廉价扩展姿态与失败场景，也可能让策略习惯只存在于渲染器和模拟控制器中的规律。个人项目应把真实数据当作分布锚点，把合成数据当作有明确适用边界的覆盖工具。",
      "outcomes": [
        "设计同更新预算的混合消融",
        "用分层真实验证定位负迁移",
        "区分空间仿真与潜空间预测的数据角色"
      ],
      "sections": [
        {
          "heading": "01 增加覆盖与增加偏差同时发生",
          "body": "只有二十条真实抓取演示时，仿真可改变物体位置、相机位姿和起始关节，提高训练对空间组合的覆盖；但模拟摩擦、碰撞或图像噪声若失真，更多样本会增强错误规律。增加数据量并不能自动消除系统偏差，尤其当网络可用简单背景线索预测动作时。\n\n可用教学风险模型 R≈B(alpha)^2+V/N_eff 表达这项权衡：真实占比下降可能减小估计方差，却增加域偏差。这里不是可直接估计的泛化定理，B 和 V 需要实验代理。若合成数据全由同一父演示派生，N_eff 增长远低于帧数增长，切勿把百万相邻帧当百万次独立互动。",
          "sourceIds": [
            "mimic",
            "r2s"
          ],
          "formulas": [
            {
              "latex": "N_{\\mathrm{eff}}=\\frac{(\\sum_i w_i)^2}{\\sum_i w_i^2}",
              "explanation": "这是独立加权观测下常用的权重集中度诊断；相关轨迹还会进一步降低有效信息，不能直接把此值作为成功率置信区间的样本数。"
            }
          ]
        },
        {
          "heading": "02 用四组实验分开数量与来源",
          "body": "建议在同一小模型上先比较 real-only、混合 75% real、混合 50% real 和 sim-only；固定初始化、总 optimizer steps、batch 和动作归约。混合组会减少真实重复访问次数，这本身也是处理因素，应同时报告真实/仿真 exposure；若再增加训练步数，需另列计算预算实验。\n\n数值例：每组 1000 步、batch=32，50% 组期望真实 exposure 为 16000，75% 组为 24000。只说“都训练一轮”会因数据长度不同而改变更新次数，无法解释提升来自数据还是算力。SO-101 初期可先离线执行小规模训练，真实闭环留待安全准备完毕并由学习者执行。",
          "sourceIds": [
            "sampler"
          ]
        },
        {
          "heading": "03 真实锚点按失败机制分层",
          "body": "验证集合应按物体、session、曝光和相机变化隔离；每一层同时看动作误差、成功率和介入率。若亮场改善、暗场下降，不能仅报总体均值。用户的 RAW 经验特别适合分析高光饱和、黑电平漂移和运动模糊：先证明模型利用的是额外信息，而不是数据预处理或曝光分布差异。\n\n例如两个等大光照组的真实成功率从 0.8/0.6 变为 0.9/0.4，总体从 0.7 降到 0.65，说明几何覆盖收益被暗场负迁移抵消。此时优先补传感器域模型或真实暗场数据，而非继续扩展仿真几何。必须保留逐层分母，缺测场景不能填零后伪装成失败率。",
          "sourceIds": [
            "eval",
            "r2s"
          ]
        },
        {
          "heading": "04 双路线在训练中扮演不同角色",
          "body": "StanfordVL BEHAVIOR/OmniGibson 提供任务、交互与可审计终止状态；World Labs R2S2R 主张以真实任务重建和可控变体生成训练/评测经验。前者的谓词可用于监督标签，后者的空间对齐需用真实轨迹复验，两者都不意味着训练时的特权状态可作为部署输入。\n\nMeta/FAIR 的 V-JEPA 历史路线预测表征，动作条件模型需要带动作的交互数据；其 latent loss 低不直接保证混合训练动作更好。AMI 当前公开方向延续表征空间预测与安全规划，但没有发布配方时，只能提出可检验问题：冻结表征是否减小视觉域差，动作条件是否仍受动力学偏差影响。先做同任务探针，不凭人物归属合并成绩。",
          "sourceIds": [
            "ami",
            "eval",
            "r2s"
          ]
        }
      ],
      "points": [
        "同更新预算与同数据遍历次数不同。",
        "分层真实留出比总体离线 loss 更有诊断力。",
        "空间对齐与 latent 预测分别验证。"
      ],
      "codeTitle": "exposure_plan.py · 预算与分层收益核算",
      "code": "def exposure(steps, batch, real_fraction):\n    if steps <= 0 or batch <= 0 or not 0 <= real_fraction <= 1:\n        raise ValueError(\"invalid budget\")\n    total = steps*batch\n    return total*real_fraction, total*(1-real_fraction)\nassert exposure(1000, 32, .5) == (16000, 16000)\nbefore, after = [.8, .6], [.9, .4]\nassert abs(sum(before)/2-.7) < 1e-12\nassert abs(sum(after)/2-.65) < 1e-12\nassert after[0] > before[0] and sum(after) < sum(before)\ntry:\n    exposure(1000, 32, 1.2)\n    raise AssertionError(\"invalid fraction\")\nexcept ValueError:\n    pass\n",
      "codeNotes": [
        "exposure 输出期望访问次数，随机采样下不是每次运行的精确计数。",
        "分层例子假设两组等大；不等大时要用明确的部署组权重，不得直接平均。"
      ],
      "exercise": {
        "prompt": "50% 混合组亮场提升但暗场下降，应增加仿真量还是先定位传感器域偏差？",
        "steps": [
          "列出保持不变的训练条件。",
          "给出一个 RAW/RGB 同信息预算的对照。"
        ],
        "solution": "先固定训练步数、模型和采样机制，按曝光与饱和分层回看真实失败；比较同 session 同视角、相同时间窗的 RAW encoder 与 RGB encoder，校验预处理和带宽。若仅暗场退化，优先补真实暗场锚点或校准噪声模型，再用独立 session 复验，不能用扩大几何样本掩盖。"
      },
      "quiz": {
        "question": "为什么 real-only 和混合组都跑一个 epoch 不能公平比较合成数据收益？",
        "hint": "epoch 对应多少 optimizer steps？",
        "keywords": [
          "optimizer steps",
          "exposure",
          "compute budget",
          "negative transfer"
        ],
        "reference": "混合数据集通常更大，一个 epoch 会包含更多 batch 和参数更新，收益可能来自额外计算；同时真实帧重复次数也改变。应固定步数、batch、模型与归约，报告两域 exposure，并另做增加预算的对照。"
      },
      "sources": [
        {
          "id": "sampler",
          "label": "PyTorch 2.7.1 WeightedRandomSampler 固定版本源码",
          "url": "https://github.com/pytorch/pytorch/blob/v2.7.1/torch/utils/data/sampler.py",
          "reading": "2026-11-05 实读 WeightedRandomSampler.__init__/__iter__ 与 BatchSampler；定位 weights 的一维样本轴、double 转换、torch.multinomial、replacement 和 generator，课堂运行环境为 2.7.1。"
        },
        {
          "id": "mimic",
          "label": "MimicGen 原论文 CoRL 2023",
          "url": "https://arxiv.org/html/2310.17596v1",
          "reading": "2026-11-05 实读 v1 第3/4节的对象中心分段、参考片段变换与成功筛选，附录R的支撑覆盖偏差、插值伪影和仅保留成功轨迹的限制。PDF下载中断后用HTML完成相关章节阅读，不引用未读全文。"
        },
        {
          "id": "r2s",
          "label": "World Labs R2S2R 官方技术页",
          "url": "https://www.worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "实读 Real-to-Sim/Sim-to-Real、appearance/physics/camera 变体与开闭环对齐；与 StanfordVL 学术基准分开归属。"
        },
        {
          "id": "eval",
          "label": "StanfordVL BEHAVIOR Evaluation",
          "url": "https://behavior.stanford.edu/challenge/evaluation.html",
          "reading": "实读 Allowed policy inputs 与 Metrics：训练可有 privileged information，评测只用 RGB/depth/proprioception；用于混合数据字段审计。"
        },
        {
          "id": "ami",
          "label": "AMI Labs 当前官方研究方向",
          "url": "https://amilabs.xyz/",
          "reading": "实读表征空间预测与动作条件模型的方向声明；不把方向写为已发布的混合数据训练配方。"
        },
        {
          "id": "mimicAuthor",
          "label": "MimicGen 作者项目与机制示例",
          "url": "https://mimicgen.github.io/",
          "reading": "实读作者项目 Data Generation Example 与跨 reset/对象/机器人扩展示例，配合原论文 v1 第3/4节与附录R核对机制。"
        }
      ]
    }
  }
};
