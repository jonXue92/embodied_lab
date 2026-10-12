import type { AuthoredDay } from './types';

const sources = [
  { id: 'pi05Paper46', label: 'Physical Intelligence · π0.5 原论文', url: 'https://arxiv.org/abs/2504.16054', reading: '2026-10-12 实读摘要、方法与消融：预训练混合移动操作、跨环境/跨本体机器人数据、高层子任务、语言指令和网页多模态任务；随后用移动操作的低层动作与高层语义动作共同微调。' },
  { id: 'pi05Page46', label: 'Physical Intelligence · π0.5 项目页', url: 'https://www.pi.website/blog/pi05', reading: '2026-10-12 实读 co-training 与数据消融：no WD、no ME、no CE 分别移除网页、多环境、跨本体来源；约400小时同型移动操作不是完整训练混合的全部。' },
  { id: 'openpiConfig46', label: 'openpi · training/config.py', url: 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/src/openpi/training/config.py', reading: '2026-10-12 实读固定提交：DataConfig 的 prompt_from_task/default_prompt、LeRobot 配置与 TrainConfig；开源微调例子一次绑定一个 repo_id，不能据此声称复现了论文全量混合。' },
  { id: 'openpiLoader46', label: 'openpi · training/data_loader.py', url: 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/src/openpi/training/data_loader.py', reading: '2026-10-12 实读固定提交：create_data_loader 选择 RLDS 或 torch 路径，LeRobotDataset 读取 task_index/task；transform_dataset 再执行 repack、数据变换、归一化与模型变换。' },
  { id: 'openpiTransforms46', label: 'openpi · transforms.py', url: 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/src/openpi/transforms.py', reading: '2026-10-12 实读固定提交：InjectDefaultPrompt 仅在 prompt 键不存在时注入默认值；TokenizePrompt 对文本规范化和分词，默认值不会覆盖样本已有任务。' },
  { id: 'openpiPolicy46', label: 'openpi · policies/policy_config.py', url: 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/src/openpi/policies/policy_config.py', reading: '2026-10-12 实读固定提交 create_trained_policy：推理输入先 InjectDefaultPrompt，再走数据、归一化和模型变换；checkpoint 的统计与训练配置共同决定输入契约。' },
  { id: 'behavior46', label: 'StanfordVL · BEHAVIOR Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '2026-10-12 复核自然语言任务、隐藏实例和统一评测；属于 StanfordVL 的任务/评测线，不是 World Labs 的生成模型。' },
  { id: 'worlds46', label: 'World Labs · Atlas', url: 'https://www.worldlabs.ai/blog/atlas', reading: '2026-10-12 复核多模态空间上下文、相机几何、RGB/depth 与机器人仿真用途；属于 World Labs，不能替代真实策略混合权重消融。' },
  { id: 'vjepa46', label: 'Meta/FAIR · V-JEPA 2', url: 'https://ai.meta.com/research/vjepa/', reading: '2026-10-12 复核视频表征和动作条件规划历史成果；表征样本权重与策略动作样本权重是不同目标。' },
  { id: 'ami46', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '2026-10-12 复核表征空间预测、动作条件世界模型、可靠性与安全方向；当前官网愿景不等于已经公开的数据混合 recipe。' },
];

export const day46: AuthoredDay = {
  reviewedAt: '2026-10-12', revision: '逐课编写 1.0',
  deliverable: '一份 prompt—task—episode 联合契约；一个确定性加权采样与 prompt 注入离线夹具；一张 SO-101 数据混合晋级表。三课共100分钟，另留20分钟复盘。',
  question: {
    title: 'SO-101 有900段同一任务，另有100段高价值失败恢复；按原始条数混合合理吗？',
    summary: '先定义每个来源想教会什么，再用显式采样概率、有效曝光与分来源闭环指标验收。',
    keywords: ['mixture weight', 'prompt contract', 'failure recovery', 'effective exposure', 'per-source metric', 'ablation'],
    reference: '不应默认合理。按条数采样会给主任务90%概率，使恢复数据在1000步中期望只见100次；但也不能因为稀有就盲目过采样。先核对任务标签、动作schema和质量，再设可记录的目标概率，例如主任务0.7、恢复0.3，并报告每源有效曝光、重复率、损失与独立闭环指标。必须与自然比例和去恢复消融比较；只有恢复成功率提升且主任务、安全指标不退化才晋级。',
  },
  lessons: {
    foundation: {
      title: '任务 prompt 与数据混合：模型到底在学哪种条件分布', minutes: 35,
      prerequisites: '10-13 已理解 π0 双专家，10-14 已理解 flow 动作生成，10-15 已建立跨本体动作契约；会读条件概率与期望。',
      connection: '今天把已合法的样本组织成训练分布；10-17再讨论 Knowledge Insulation。若 prompt 或混合来源含义不清，隔离梯度也只会保护错误目标。',
      intro: '“放进同一个目录”不等于 co-training。VLA 学的是给定图像、状态和语言时的动作条件分布；改变 prompt、来源概率或任务粒度都会改变实际训练问题。',
      outcomes: ['区分任务标签、自然语言 prompt 与高层语义动作', '计算加权混合的有效曝光', '识别空 prompt、来源泄漏与同名异义任务'],
      sections: [
        { heading: '01 三种文字监督不能混成一个字符串字段', body: 'task id 是数据治理键，例如 pick_cup_v2；prompt 是给模型的自然语言条件，例如“拿起蓝杯并放到托盘”；高层语义动作则是轨迹中随阶段变化的目标，例如“接近杯子”“闭合夹爪”。π0.5 将语言指令、高层子任务预测与低层连续动作纳入训练，但它们承担的监督角色不同。\n\n同一 task id 可以有多种等价表述来降低措辞依赖，却必须保持目标谓词一致。反过来，两条轨迹即使都写“整理桌面”，初始状态、目标物和终止条件也可能不同。SO-101 manifest 应同时保存 task_id、prompt_id、语言、目标谓词版本和 episode_id，不能靠自由文本反推身份。', sourceIds: ['pi05Paper46', 'pi05Page46'] },
        { heading: '02 混合权重决定训练时间花在哪里', body: '设来源k含N_k个合格样本，采样概率为p_k。按条数自然采样时p_k=N_k/总数；显式重权时p_k可脱离条数，但每步仍须总和为1。在T步、batch为B时，来源k期望曝光是TBp_k，平均每个样本被抽到TBp_k/N_k次。\n\n数值例：主任务900段、恢复100段，T=1000且B=1。自然比例给恢复100次期望曝光；设p_recovery=.3后变为300次，平均每段见3次。它提高恢复信号，也把主任务曝光从900降到700并增加重复过拟合风险，必须分来源验证而非只看总loss。', formulas: [{ latex: String.raw`p_k\ge 0,\quad \sum_{k=1}^{K}p_k=1,\qquad E_k=T B p_k,\qquad R_k=\frac{T B p_k}{N_k}`, explanation: 'p_k是来源采样概率，E_k是T步中期望样本次数，R_k是该来源单样本平均重复曝光；单位分别为无量纲、样本次和次/样本。' }] },
        { heading: '03 π0.5 的异构混合是机制证据，不是个人配方', body: 'π0.5 项目材料把完整混合拆为同型移动操作、多环境非移动机器人、跨本体机器人、语言指令、高层子任务与网页多模态数据，并用 no WD、no ME、no CE 等消融判断来源贡献。论文报告约400小时同型移动操作，但模型并非只用这400小时训练。\n\n这些结果支持不同来源可补充语义、技能与本体迁移的机制判断，却没有给SO-101自动可用的万能百分比。网页问答没有连续动作标签，不能伪装成action batch；高层子任务与低层动作也要有各自loss mask。个人微调应从单机器人可审计基线出发，一次只改变一个来源概率。', sourceIds: ['pi05Paper46', 'pi05Page46'] },
        { heading: '04 prompt 缺失、冲突与泄漏都要显式判定', body: 'openpi 的 prompt_from_task 会从 LeRobot 数据的 task 字段取指令；InjectDefaultPrompt 只在prompt键不存在时补默认值，不会替换已经存在但错误、空白或与轨迹冲突的文本。若所有样本都被同一默认句覆盖，模型可能主要依赖视觉与状态，离线动作误差仍看似正常。\n\n评测切分要按场景、物体或episode划分后再检查 prompt，而不是把同一轨迹的同义改写分到训练和验证两侧。负例包括空字符串、未知task、同一episode对应互斥prompt、prompt直接包含未来阶段标签。它们应在tokenize前失败，不能等模型自己忽略。', sourceIds: ['openpiConfig46', 'openpiTransforms46'] },
      ],
      points: ['prompt 是模型条件，不是仅供人阅读的备注。', '混合概率而非目录条数决定有效曝光。', '论文混合结论不能直接变成SO-101配方。'],
      codeTitle: 'mixture_math.py · 原创曝光计算与边界测试',
      code: String.raw`def exposure(counts, probs, steps, batch):
    if set(counts) != set(probs) or steps <= 0 or batch <= 0:
        raise ValueError("bad mixture contract")
    if any(type(n) is not int or n <= 0 for n in counts.values()):
        raise ValueError("bad source size")
    if any(type(p) not in (int,float) or p < 0 for p in probs.values()):
        raise ValueError("bad probability")
    if abs(sum(probs.values())-1.0) > 1e-9:
        raise ValueError("probabilities must sum to one")
    return {k: {"samples": steps*batch*probs[k],
                "repeats": steps*batch*probs[k]/counts[k]}
            for k in counts}

counts={"main":900,"recovery":100}
natural=exposure(counts,{"main":.9,"recovery":.1},1000,1)
weighted=exposure(counts,{"main":.7,"recovery":.3},1000,1)
assert natural["recovery"] == {"samples":100.,"repeats":1.}
assert weighted["recovery"] == {"samples":300.,"repeats":3.}
assert weighted["main"]["samples"] == 700.
for bad in ({"main":.8,"recovery":.3},{"main":1.1,"recovery":-.1}):
    try:
        exposure(counts,bad,1000,1); raise AssertionError("bad mix accepted")
    except ValueError: pass
print("mixture exposure and invalid weights: PASS")`,
      codeNotes: ['代码只计算期望曝光，不声称生成独立同分布样本。', '正例对比自然比例与显式重权；负例拒绝和不为1及负概率。', '生产方案还要统计实际抽样、重复episode和分来源指标。'],
      exercise: { prompt: '三个来源样本数为800、150、50，计划2000步、batch=4，概率为.6/.25/.15。求第三源E与R。', steps: ['总抽样次数是8000。', '乘第三源概率，再除以50。'], solution: '第三源期望曝光E=2000×4×.15=1200样本次，平均R=1200/50=24次/样本。高重复不是自动错误，但必须防记忆化并用独立场景验收。' },
      quiz: { question: '为什么把网页图文、机器人动作和高层子任务都设成相同batch格式会出错？', hint: '哪些字段和loss真正存在？', keywords: ['heterogeneous data', 'loss mask', 'high-level subtask', 'continuous action', 'web data'], reference: '三类样本的预测对象不同：网页图文没有可执行连续动作，高层子任务监督语义阶段，机器人轨迹才有动作chunk。必须保留task type与loss mask，通过共享表征协同训练；伪造缺失action或统一套动作loss会让模型学习错误目标。' },
      sources: sources.slice(0, 6),
    },
    code: {
      title: '追踪 openpi 的 prompt 路径，并实现可审计的加权调度器', minutes: 40,
      prerequisites: '完成本日条件分布与曝光公式；会读字典、随机种子和异常测试。',
      connection: '把论文层面的混合概念落到开源可见字段与调用链；路线课再决定SO-101只做哪些小规模消融。',
      intro: '源码精读要分清“仓库确实实现”与“论文训练基础设施未开源”。本课定位 prompt_from_task 和 InjectDefaultPrompt，再写一个不冒充上游 sampler 的教学调度器。',
      outcomes: ['定位task到prompt的训练路径', '说明推理默认prompt的优先级', '用确定性抽样核对实际频次与身份'],
      sections: [
        { heading: '01 训练入口先决定数据后决定prompt来源', body: '固定提交的 TrainConfig.data 只绑定一个 DataConfigFactory。LeRobot 配置用 repo_id 指定仓库，并可设 prompt_from_task=True；加载器由create_data_loader选择RLDS或torch路径。torch数据集中task_index映射到任务文本，随后才进入transforms。\n\n这条开源路径足以证明单数据集微调时任务文本如何进入batch，却没有公开π0.5论文预训练阶段所有数据源的精确权重与多任务调度代码。因此课程只复现接口契约，不把自写WeightedMixer命名成openpi实现。', sourceIds: ['openpiConfig46', 'openpiLoader46'] },
        { heading: '02 默认prompt是缺省值，不是清洗器', body: '训练配置可让样本携带prompt，也可为单任务数据设default_prompt。推理create_trained_policy把InjectDefaultPrompt放在data transforms之前；其条件是键不存在。若客户端发送空字符串，默认值不会自动救场，后续tokenizer仍会处理错误输入。\n\n教学resolver采用更严格规则：样本prompt存在时必须非空且task_id与允许表一致；不存在时才允许使用非空默认值。它还把prompt_id写入输出，便于训练日志和回放定位。此严格行为是课程建议，不冒充上游当前实现。', sourceIds: ['openpiTransforms46', 'openpiPolicy46'] },
        { heading: '03 调度器必须输出来源身份而非只输出样本', body: 'WeightedMixer先验证来源集合、权重和每个来源非空，再用固定seed抽来源；选中来源内部用轮转索引，避免一个短测试因随机重复而无法核对。每条记录保留source、episode与prompt_id，后续才能按来源统计loss和闭环结果。\n\n正例在2000次抽样上允许统计波动，并验证同一seed产生同一序列。负例覆盖空prompt、未知task、缺来源、负权重和空数据。这里的随机调度用于教学与单机实验；分布式训练还需rank间种子、断点恢复和不重复shard。' },
        { heading: '04 token、动作与来源mask要一起进batch契约', body: 'prompt token有padding mask，动作chunk有时间/有效维mask，网页或高层任务还需要loss-type mask。若collate只看张量shape，补零动作会被误当监督；若把来源id输入模型，模型又可能学到数据集捷径而非任务机制。来源id首先用于审计，不一定作为特征。\n\n生产日志至少输出每来源实际计数、唯一episode数、prompt覆盖率、截断率、动作有效元素、loss分项和checkpoint步数。仅记录配置中的p_k不够，因为过滤、worker退出或断点恢复都可能令实际分布偏离目标。', sourceIds: ['openpiLoader46', 'openpiTransforms46'] },
      ],
      points: ['固定提交能证明prompt调用链，不能证明论文全量采样器。', '默认prompt只补缺键。', '实际来源计数必须随checkpoint审计。'],
      codeTitle: 'prompt_mixer.py · 原创离线接口夹具',
      code: String.raw`import random

ALLOW={"pick":"pick up the cup","recover":"recover after a miss"}
def resolve(row, default=None):
    task=row.get("task_id")
    if task not in ALLOW: raise ValueError("unknown task")
    text=row.get("prompt", default)
    if not isinstance(text,str) or not text.strip():
        raise ValueError("missing prompt")
    return {**row,"prompt":text.strip(),"prompt_id":task+":"+text.strip()}

def schedule(data, probs, n, seed):
    if set(data)!=set(probs) or any(not data[k] for k in data):
        raise ValueError("source mismatch or empty source")
    if any(p<0 for p in probs.values()) or abs(sum(probs.values())-1)>1e-9:
        raise ValueError("bad weights")
    rng=random.Random(seed); keys=list(data); out=[]; pos={k:0 for k in keys}
    for _ in range(n):
        k=rng.choices(keys,weights=[probs[x] for x in keys],k=1)[0]
        row=data[k][pos[k]%len(data[k])]; pos[k]+=1
        out.append((k,resolve(row,ALLOW[row["task_id"]])["prompt_id"]))
    return out

data={"main":[{"episode":"m1","task_id":"pick"}],
      "recovery":[{"episode":"r1","task_id":"recover","prompt":"recover after a miss"}]}
a=schedule(data,{"main":.7,"recovery":.3},2000,7)
b=schedule(data,{"main":.7,"recovery":.3},2000,7)
assert a==b and 520 < sum(k=="recovery" for k,_ in a) < 680
for bad in ({"task_id":"pick","prompt":" "},{"task_id":"unknown"}):
    try: resolve(bad); raise AssertionError("bad prompt accepted")
    except ValueError: pass
try:
    schedule({"main":[]},{"main":1.0},1,0); raise AssertionError("empty source")
except ValueError: pass
print("prompt priority, identity and weighted schedule: PASS")`,
      codeNotes: ['resolve将“缺键才用默认值”扩展为更严格的非空与允许表检查。', 'schedule保留来源和prompt_id，固定seed验证可复现，并以宽区间检查随机频率。', '这是原创教学调度器，不是openpi或π0.5未公开训练基础设施的复制。'],
      exercise: { prompt: '若客户端显式发送空prompt，上游InjectDefaultPrompt为何不一定补默认值？教学resolver如何处理？', steps: ['检查条件是键不存在还是值为空。', '查看resolver的类型与strip检查。'], solution: '上游变换只判断prompt键是否存在，空字符串仍算存在；教学resolver会把空白判为missing prompt并报错，要求调用方修复，而不是静默改变任务。' },
      quiz: { question: '从openpi单repo_id微调示例能否推出π0.5预训练混合的精确权重？', hint: '区分公开接口与论文基础设施。', keywords: ['single repo', 'open-source boundary', 'mixture weight', 'training infrastructure', 'evidence'], reference: '不能。固定源码说明单个DataConfig、task/prompt与变换链，论文说明使用异构混合及消融；若未公开多源sampler与权重，就只能标为未知。个人实验可自建调度器，但必须明确是教学/项目实现。' },
      sources: sources.slice(0, 6),
    },
    insight: {
      title: '数据配比是可证伪假设：SO-101 从单源基线到小步混合', minutes: 25,
      prerequisites: '能运行本日调度器；已完成10-15 schema/stats门，并理解独立验证切分。',
      connection: '为10-17 Knowledge Insulation提供干净混合输入；后续开放世界评测保持prompt与来源版本冻结。',
      intro: '个人项目最容易把“更丰富”误当作“更好”。混合价值必须回答新增来源补哪种失败、挤占多少主任务预算、是否通过独立闭环证据。',
      outcomes: ['设计最小数据混合消融', '用有效来源数识别权重集中', '把双团队资料放到正确机制层'],
      sections: [
        { heading: '01 先有单源基线，再一次增加一种能力', body: 'M0只用SO-101目标任务成功演示，建立可复现下界；M1加入同任务失败恢复，检验恢复能力；M2加入同本体多物体或多光照，检验视觉泛化。跨本体或网页数据需要更强adapter与loss分流，不应与前三项同时变化。\n\n每个版本冻结训练步数、batch、初始化、prompt模板、动作schema、stats和评测实例。报告每来源实际曝光与唯一episode，而不是“加入了某数据”。若M1提升恢复却损害正常抓取，要调p而不是只报平均成功。' },
        { heading: '02 权重集中会让名义样本数虚高', body: '可用来源概率的有效数K_eff=1/Σp_k²观察集中度：两源.5/.5时K_eff=2；.9/.1时约1.22，说明训练几乎仍是单源。该量只描述概率集中，不包含来源内部重复、质量或相关性。\n\n对900/100例，自然比例K_eff约1.22；.7/.3时约1.72。更均衡提高稀有源曝光，但若100段来自同一场景，真实多样性仍低。还需唯一场景、物体、操作者、失败类型与时间相邻性统计。', formulas: [{ latex: String.raw`K_{\mathrm{eff}}=\frac{1}{\sum_k p_k^2},\qquad K_{\mathrm{eff}}(.9,.1)=\frac{1}{.9^2+.1^2}\approx1.22`, explanation: 'K_eff是来源概率的集中度指标，范围1到K；它不是轨迹独立性的估计，也不能替代闭环评测。' }] },
        { heading: '03 双团队主线提供问题，不提供虚构配方', body: 'StanfordVL/BEHAVIOR的自然语言任务与隐藏实例适合检验prompt是否对应可审计目标谓词；World Labs Atlas的多视角、RGB/depth与空间仿真可启发场景变体，但生成样本进入策略前仍要验证动作、物理与sim-real差距。两者分别属于基准和空间世界模型。\n\nMeta/FAIR V-JEPA 2说明视频表征与动作条件规划可成为预训练或探针来源，却不能把无动作视频按机器人轨迹权重套入action loss。AMI Labs当前公开的是表征空间预测与动作条件世界模型方向，没有SO-101混合权重结果。技术谱系只用于提出可测假设。', sourceIds: ['behavior46', 'worlds46', 'vjepa46', 'ami46'] },
        { heading: '04 SO-101 的离线门与闭环门分开', body: '离线先拒绝schema/stats/prompt版本不一致、prompt覆盖率不足、验证episode泄漏和实际权重偏差；再比较分来源动作误差、截断率与恢复阶段混淆。通过后才计划低速人工监督闭环，本自动化不控制机械臂。\n\n晋级要求主任务成功率下界不降、恢复成功率提高、碰撞/限幅/人工介入不恶化，并报告置信区间。若新增源loss下降但闭环无益，可能是重复记忆或条件被忽略；若恢复变好但主任务退化，降低p_recovery或分阶段训练。结论必须可被去来源消融推翻。' },
      ],
      points: ['一次只改变一个来源或权重。', 'K_eff衡量集中度，不等于数据质量。', '来源价值最终由分任务闭环证据决定。'],
      codeTitle: 'mixture_gate.py · 原创混合晋级判据',
      code: String.raw`def effective_sources(probs):
    if not probs or any(p<0 for p in probs) or abs(sum(probs)-1)>1e-9:
        raise ValueError("bad probabilities")
    return 1/sum(p*p for p in probs)

def promote(actual,target,main_low,recovery_low,unsafe_rate):
    if set(actual)!=set(target):
        raise ValueError("source mismatch")
    drift=max(abs(actual[k]-target[k]) for k in target)
    offline=drift<=.03
    closed=(offline and main_low>=.70 and recovery_low>=.55
            and unsafe_rate<=.01)
    return {"drift":drift,"offline":offline,"closed":closed}

assert abs(effective_sources([.9,.1])-1.2195121951)<1e-9
assert effective_sources([.7,.3])>effective_sources([.9,.1])
ok=promote({"main":.69,"recovery":.31},{"main":.7,"recovery":.3},.74,.58,.005)
bad=promote({"main":.6,"recovery":.4},{"main":.7,"recovery":.3},.80,.70,0.)
assert ok["offline"] and ok["closed"]
assert not bad["offline"] and not bad["closed"]
try:
    effective_sources([.8,.3]); raise AssertionError("invalid probabilities")
except ValueError: pass
print("concentration, drift and closed-loop gate: PASS")`,
      codeNotes: ['3%权重漂移和性能阈值均为教学假设，不是论文或硬件标准。', 'bad即使闭环数值漂亮，也因实际采样偏离目标而不能归因于计划混合。', '生产评测需样本量和置信区间，代码只展示门的层级。'],
      exercise: { prompt: '三源概率.8/.1/.1的K_eff是多少？它能否证明两个稀有来源有用？', steps: ['计算平方和.66。', '取倒数并解释指标边界。'], solution: 'K_eff=1/.66≈1.52，只说明曝光集中程度介于单源与三源均匀之间；它不证明稀有来源质量、独立性或闭环贡献，仍需逐源消融。' },
      quiz: { question: '加入恢复数据后总成功率上升，为什么仍不能直接宣布混合有效？', hint: '总体均值可能掩盖哪些变化？', keywords: ['per-source evaluation', 'mixture ablation', 'main task regression', 'safety metric', 'confidence interval'], reference: '总体均值可能来自评测构成变化或恢复子集变多，并掩盖主任务退化与安全事件。应固定评测实例，分别报告主任务、恢复、OOD和安全指标及区间，与自然比例、目标权重和去恢复版本消融后再归因。' },
      sources,
    },
  },
};
