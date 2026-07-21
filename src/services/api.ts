import { CheckInRecord, CheckInFormData } from '../types/checkin';
import { LeaderboardEntry, TimePeriod, UserStats } from '../types/leaderboard';
import { calculateCO2Reduction, calculateTreesEquivalent } from '../utils/carbon';

const CHECKINS_STORAGE_KEY = 'solerz_solar_checkins_v1';

// Initial default mock check-ins for high aesthetics & interactive demo experience
const INITIAL_CHECKINS: CheckInRecord[] = [
  {
    id: 'chk-1',
    userId: 'usr-1',
    userName: '陽光綠能工坊',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    systemName: '屏東頂樓光電系統 A區',
    capacitykWp: 15.6,
    dailyKWh: 78.4,
    co2SavedKg: calculateCO2Reduction(78.4),
    treesEquivalent: calculateTreesEquivalent(calculateCO2Reduction(78.4)),
    checkInDate: new Date().toISOString().split('T')[0],
    checkInTime: '16:30',
    location: '屏東縣 萬丹鄉',
    photoUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=800',
    note: '今天晴空萬里，太陽能日發電效能創本週新高！逆變器滿載運作中。',
    weather: 'sunny',
    likesCount: 24
  },
  {
    id: 'chk-2',
    userId: 'usr-2',
    userName: '綠能巡航者',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    systemName: '雲林西螺農電共生 1號棚',
    capacitykWp: 45.0,
    dailyKWh: 216.5,
    co2SavedKg: calculateCO2Reduction(216.5),
    treesEquivalent: calculateTreesEquivalent(calculateCO2Reduction(216.5)),
    checkInDate: new Date().toISOString().split('T')[0],
    checkInTime: '15:15',
    location: '雲林縣 西螺鎮',
    photoUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=800',
    note: '太陽能面板剛完成清洗，光電轉換效率大幅提升，為大地注入乾淨綠能能！',
    weather: 'sunny',
    likesCount: 19
  },
  {
    id: 'chk-3',
    userId: 'usr-3',
    userName: '高雄光伏戰士',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    systemName: '路竹廠房屋頂 200kWp 案場',
    capacitykWp: 200.0,
    dailyKWh: 940.0,
    co2SavedKg: calculateCO2Reduction(940.0),
    treesEquivalent: calculateTreesEquivalent(calculateCO2Reduction(940.0)),
    checkInDate: new Date().toISOString().split('T')[0],
    checkInTime: '17:00',
    location: '高雄市 路竹區',
    photoUrl: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&q=80&w=800',
    note: '今日大高雄地區陽光普照，全日發電近 1000 度綠電，順利完成打卡！',
    weather: 'sunny',
    likesCount: 38
  },
  {
    id: 'chk-4',
    userId: 'usr-4',
    userName: '台南日光家園',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    systemName: '永康住宅雙玻雙面發電',
    capacitykWp: 9.8,
    dailyKWh: 46.2,
    co2SavedKg: calculateCO2Reduction(46.2),
    treesEquivalent: calculateTreesEquivalent(calculateCO2Reduction(46.2)),
    checkInDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    checkInTime: '17:45',
    location: '臺南市 永康區',
    photoUrl: 'https://images.unsplash.com/photo-1548611716-300181515277?auto=format&fit=crop&q=80&w=800',
    note: '午後微雲但不影響發電，持續為永續家園累積減碳貢獻。',
    weather: 'partly_cloudy',
    likesCount: 14
  }
];

export function getCheckIns(): CheckInRecord[] {
  try {
    const data = localStorage.getItem(CHECKINS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to read checkins from localStorage', e);
  }
  return INITIAL_CHECKINS;
}

export function saveCheckIn(formData: CheckInFormData): CheckInRecord {
  const currentCheckIns = getCheckIns();
  const co2SavedKg = calculateCO2Reduction(formData.dailyKWh);
  const treesEquivalent = calculateTreesEquivalent(co2SavedKg);
  
  const now = new Date();
  const newRecord: CheckInRecord = {
    id: `chk-${Date.now()}`,
    userId: 'usr-current',
    userName: '我的太陽能站點',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    systemName: formData.systemName || '自主太陽能設備',
    capacitykWp: Number(formData.capacitykWp) || 5.0,
    dailyKWh: Number(formData.dailyKWh) || 0,
    co2SavedKg,
    treesEquivalent,
    checkInDate: now.toISOString().split('T')[0],
    checkInTime: now.toTimeString().slice(0, 5),
    location: formData.location || '臺灣',
    photoUrl: formData.photoUrl || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=800',
    note: formData.note || '每日太陽能綠電打卡完成！',
    weather: formData.weather || 'sunny',
    likesCount: 1
  };

  const updated = [newRecord, ...currentCheckIns];
  try {
    localStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save checkin to localStorage', e);
  }

  return newRecord;
}

export function getLeaderboard(period: TimePeriod = 'weekly'): LeaderboardEntry[] {
  const checkIns = getCheckIns();
  
  // Group by user
  const userMap = new Map<string, {
    userId: string;
    userName: string;
    userAvatar: string;
    solarSystemName: string;
    capacitykWp: number;
    location: string;
    totalKWh: number;
    co2SavedKg: number;
    treesEquivalent: number;
    checkInCount: number;
  }>();

  checkIns.forEach((chk) => {
    const key = chk.userId;
    const existing = userMap.get(key);
    if (existing) {
      existing.totalKWh += chk.dailyKWh;
      existing.co2SavedKg += chk.co2SavedKg;
      existing.treesEquivalent += chk.treesEquivalent;
      existing.checkInCount += 1;
    } else {
      userMap.set(key, {
        userId: chk.userId,
        userName: chk.userName,
        userAvatar: chk.userAvatar,
        solarSystemName: chk.systemName,
        capacitykWp: chk.capacitykWp,
        location: chk.location,
        totalKWh: chk.dailyKWh,
        co2SavedKg: chk.co2SavedKg,
        treesEquivalent: chk.treesEquivalent,
        checkInCount: 1
      });
    }
  });

  // Sort descending by totalKWh
  const sorted = Array.from(userMap.values()).sort((a, b) => b.totalKWh - a.totalKWh);

  return sorted.map((item, index) => {
    return {
      rank: index + 1,
      userId: item.userId,
      userName: item.userName,
      userAvatar: item.userAvatar,
      solarSystemName: item.solarSystemName,
      capacitykWp: item.capacitykWp,
      location: item.location,
      totalKWh: Number(item.totalKWh.toFixed(1)),
      co2SavedKg: Number(item.co2SavedKg.toFixed(1)),
      treesEquivalent: Number(item.treesEquivalent.toFixed(1)),
      checkInStreakDays: item.checkInCount * 3,
      badges: [
        { id: 'b1', name: '太陽能先鋒', icon: '☀️', description: '完成連續7天太陽能打卡' },
        { id: 'b2', name: '百度綠電俱樂部', icon: '⚡', description: '單次打卡發電量超過100度' },
        { id: 'b3', name: '減碳英雄', icon: '🌿', description: '累積減碳量超越 500 kg' }
      ],
      isCurrentUser: item.userId === 'usr-current'
    };
  });
}

export function getUserStats(): UserStats {
  const checkIns = getCheckIns();
  const myCheckIns = checkIns.filter(c => c.userId === 'usr-current');
  const totalKWh = myCheckIns.reduce((acc, c) => acc + c.dailyKWh, 0);
  const co2SavedKg = calculateCO2Reduction(totalKWh);
  const treesEquivalent = calculateTreesEquivalent(co2SavedKg);

  return {
    rank: 4,
    totalKWh: Number(totalKWh.toFixed(1)),
    co2SavedKg: Number(co2SavedKg.toFixed(1)),
    treesEquivalent: Number(treesEquivalent.toFixed(1)),
    totalCheckIns: myCheckIns.length,
    streakDays: myCheckIns.length > 0 ? myCheckIns.length * 3 : 1,
    badgesCount: 5
  };
}
