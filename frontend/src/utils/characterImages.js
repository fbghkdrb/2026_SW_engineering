/**
 * 캐릭터 이미지 경로 상수 관리
 * 이미지 파일이 없는 경우 null로 유지 → CharacterDisplay에서 CSS 캐릭터 fallback 사용
 */

import happyImg from '../assets/character/happy.png';
import normalImg from '../assets/character/normal.png';
import sadImg from '../assets/character/sad.png';
import dangerImg from '../assets/character/danger.png';
import faintImg from '../assets/character/faint.png';
import eat1Img from '../assets/character/eat_1.png';
import eat2Img from '../assets/character/eat_2.png';
import eat3Img from '../assets/character/eat_3.png';
import eat4Img from '../assets/character/eat_4.png';
import revive1Img from '../assets/character/revive_1.png';
import revive2Img from '../assets/character/revive_2.png';
import attendanceImg from '../assets/character/attendance.png';
import attendanceBonusImg from '../assets/character/attendance_bonus.png';
import resultPerfectImg from '../assets/character/result_perfect.png';
import resultGoodImg from '../assets/character/result_good.png';
import resultBadImg from '../assets/character/result_bad.png';
import endingImg from '../assets/character/ending.png';

// 상태별 캐릭터 이미지 (happy / normal / sad / danger / faint)
export const CHARACTER_IMAGES = {
  HAPPY: happyImg,
  NORMAL: normalImg,
  SAD: sadImg,
  DANGER: dangerImg,
  FAINT: faintImg,
};

// 먹이 애니메이션 프레임 (eat_1 ~ eat_4)
export const EAT_FRAMES = [
  eat1Img,
  eat2Img,
  eat3Img,
  eat4Img,
];

// 부활 애니메이션 프레임 (revive_1 ~ revive_2)
export const REVIVE_FRAMES = [
  revive1Img,
  revive2Img,
];

// 출석 이미지
export const ATTENDANCE_IMAGES = {
  NORMAL: attendanceImg,
  BONUS: attendanceBonusImg,
};

// 퀴즈 결과 이미지
export const RESULT_IMAGES = {
  PERFECT: resultPerfectImg,
  GOOD: resultGoodImg,
  BAD: resultBadImg,
};

// 취업 엔딩 이미지
export const ENDING_IMAGE = endingImg;
