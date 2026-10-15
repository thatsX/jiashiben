// multiplier：客流倍率（1.10 = ×1.10）
// unlockAffinity：心玖好感达到多少自动解锁（0 = 初始可用）
// 也可以被好感度剧情里的 unlockMusic 效果解锁
const MUSIC = [
  { id: 'none',      name: '安静',                    file: null,                          multiplier: 1.00, unlockAffinity: 0 },
  { id: 'jiabenshi', name: '家是本',                  file: 'assets/music/jiabenshi.mp3',  multiplier: 1.10, unlockAffinity: 0 },
  { id: 'peaceful',  name: 'PEACE!',  file: 'assets/music/peaceful.mp3',   multiplier: 1.15, unlockAffinity: 0 },

  // 心玖好感度剧情解锁
  { id: 'kokono_lullaby', name: '情歌对唱',              file: 'assets/music/music2.mp3',    multiplier: 1.12, unlockAffinity: 20 },
  { id: 'kokono_housaki', name: '神秘光碟',              file: 'assets/music/disk.mp3',    multiplier: 1.18, unlockAffinity: 60 },
  { id: 'kokono_home',    name: '绑家里',                file: 'assets/music/home.mp3',       multiplier: 1.25, unlockAffinity: 100 },
];