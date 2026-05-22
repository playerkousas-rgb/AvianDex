// ============================================================
// 英文/學名/俗名 → 圖鑑 ID 對照表
// 用於把 BirdNET / Nyckel 回傳的英文鳥名對應到你資料庫的中文鳥種
//
// key 一律小寫；可同時放：英文俗名、學名、繁體中文、簡體中文
// value = birds.json 裡的 id（4 位字串）
// ============================================================

export const NAME_TO_ID: Record<string, string> = {
  // 0001 珠頸斑鳩
  'spotted dove': '0001',
  'spilopelia chinensis': '0001',
  'streptopelia chinensis': '0001',
  '珠颈斑鸠': '0001',
  '珠頸斑鳩': '0001',

  // 0002 黑鳶
  'black kite': '0002',
  'milvus migrans': '0002',
  '黑鸢': '0002',
  '黑鳶': '0002',

  // 0003 原鴿
  'rock dove': '0003',
  'rock pigeon': '0003',
  'feral pigeon': '0003',
  'columba livia': '0003',
  '原鸽': '0003',
  '原鴿': '0003',

  // 0004 小葵花鳳頭鸚鵡
  'yellow-crested cockatoo': '0004',
  'cacatua sulphurea': '0004',
  '小葵花凤头鹦鹉': '0004',
  '小葵花鳳頭鸚鵡': '0004',

  // 0005 噪鵑
  'asian koel': '0005',
  'eudynamys scolopaceus': '0005',
  '噪鹃': '0005',
  '噪鵑': '0005',

  // 0006 紅耳鵯
  'red-whiskered bulbul': '0006',
  'pycnonotus jocosus': '0006',
  '红耳鹎': '0006',
  '紅耳鵯': '0006',

  // 0007 白頭鵯
  'light-vented bulbul': '0007',
  'chinese bulbul': '0007',
  'pycnonotus sinensis': '0007',
  '白头鹎': '0007',
  '白頭鵯': '0007',

  // 0008 鵲鴝
  'oriental magpie-robin': '0008',
  'copsychus saularis': '0008',
  '鹊鸲': '0008',
  '鵲鴝': '0008',

  // 0009 黑臉噪眉
  'masked laughingthrush': '0009',
  'garrulax perspicillatus': '0009',
  '黑脸噪鹛': '0009',
  '黑臉噪眉': '0009',

  // 0010 白腰文鳥
  'white-rumped munia': '0010',
  'lonchura striata': '0010',
  '白腰文鸟': '0010',
  '白腰文鳥': '0010',

  // 0011 麻雀
  'eurasian tree sparrow': '0011',
  'tree sparrow': '0011',
  'passer montanus': '0011',
  '麻雀': '0011',
  '树麻雀': '0011',

  // 0012 黑領椋鳥
  'black-collared starling': '0012',
  'gracupica nigricollis': '0012',
  '黑领椋鸟': '0012',
  '黑領椋鳥': '0012',

  // 0013 八哥
  'crested myna': '0013',
  'acridotheres cristatellus': '0013',
  '八哥': '0013',

  // 0014 喜鵲
  'oriental magpie': '0014',
  'eurasian magpie': '0014',
  'pica pica': '0014',
  'pica serica': '0014',
  '喜鹊': '0014',
  '喜鵲': '0014',

  // 0015 紅嘴藍鵲
  'red-billed blue magpie': '0015',
  'urocissa erythroryncha': '0015',
  'urocissa erythrorhyncha': '0015',
  '红嘴蓝鹊': '0015',
  '紅嘴藍鵲': '0015',

  // 0016 大山雀
  'great tit': '0016',
  'cinereous tit': '0016',
  'parus major': '0016',
  'parus cinereus': '0016',
  '大山雀': '0016',

  // 0017 暗綠繡眼鳥
  'japanese white-eye': '0017',
  'swinhoe\'s white-eye': '0017',
  'zosterops japonicus': '0017',
  'zosterops simplex': '0017',
  '暗绿绣眼鸟': '0017',
  '暗綠繡眼鳥': '0017',

  // 0018 畫眉
  'chinese hwamei': '0018',
  'hwamei': '0018',
  'garrulax canorus': '0018',
  '画眉': '0018',
  '畫眉': '0018',

  // 0019 叉尾太陽鳥
  'fork-tailed sunbird': '0019',
  'aethopyga christinae': '0019',
  '叉尾太阳鸟': '0019',
  '叉尾太陽鳥': '0019',

  // 0020 長尾縫葉鶯
  'common tailorbird': '0020',
  'orthotomus sutorius': '0020',
  '长尾缝叶莺': '0020',
  '長尾縫葉鶯': '0020',

  // 0021 亞歷山大鸚鵡
  'alexandrine parakeet': '0021',
  'psittacula eupatria': '0021',
  '亚历山大鹦鹉': '0021',
  '亞歷山大鸚鵡': '0021',
};

/**
 * 把 BirdNET / Nyckel 回傳的鳥名轉成你圖鑑中的 id。
 * 比對策略：
 *   1) 完全比對（小寫化）
 *   2) 學名比對（去掉品種/亞種尾巴）
 *   3) 模糊包含
 */
export function resolveBirdId(label: string): string | null {
  if (!label) return null;
  const key = label.trim().toLowerCase();

  // 1) 直接命中
  if (NAME_TO_ID[key]) return NAME_TO_ID[key];

  // 2) BirdNET 常見格式：「Common Name_Scientific name」
  if (key.includes('_')) {
    const [common, sci] = key.split('_').map((s) => s.trim());
    if (NAME_TO_ID[common]) return NAME_TO_ID[common];
    if (NAME_TO_ID[sci]) return NAME_TO_ID[sci];
  }

  // 3) 模糊包含
  for (const [aliasKey, id] of Object.entries(NAME_TO_ID)) {
    if (key.includes(aliasKey) || aliasKey.includes(key)) return id;
  }

  return null;
}
